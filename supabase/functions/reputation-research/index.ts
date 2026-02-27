import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── GENERIC ERRORS — no internal details exposed ───────────────────────────────
const Errors = {
  unauthorized: () => respond({ error: "Unauthorized" }, 401),
  forbidden:    () => respond({ error: "Access denied" }, 403),
  badRequest:   (m: string) => respond({ error: m }, 400),
  rateLimited:  () => respond({ error: "Daily audit limit reached. Try again tomorrow." }, 429),
  internal:     () => respond({ error: "Analysis failed. Please try again." }, 500),
};

function respond(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── INPUT VALIDATION ───────────────────────────────────────────────────────────
function validateInput(body: any): string | null {
  if (!body || typeof body !== "object")                          return "Invalid request body";
  if (!body.companyName || typeof body.companyName !== "string") return "companyName is required";
  if (body.companyName.trim().length < 2)                        return "companyName is too short";
  if (body.companyName.length > 200)                             return "companyName is too long";
  if (body.website  && body.website.length  > 500)               return "website is too long";
  if (body.country  && body.country.length  > 100)               return "country is too long";
  if (body.industry && body.industry.length > 100)               return "industry is too long";
  if (body.timeRange && !["3","6","12","24"].includes(String(body.timeRange)))    return "invalid timeRange";
  if (body.language  && !["ru","en","es","all"].includes(body.language))          return "invalid language";
  if (body.depth     && !["basic","standard","deep"].includes(body.depth))        return "invalid depth";
  if (body.ltv && (isNaN(body.ltv) || body.ltv < 0 || body.ltv > 1_000_000))    return "invalid ltv";
  if (body.cac && (isNaN(body.cac) || body.cac < 0 || body.cac > 100_000))      return "invalid cac";
  if (body.retentionRate && (body.retentionRate < 0 || body.retentionRate > 100)) return "invalid retentionRate";
  if (body.additionalContext && body.additionalContext.length > 2000)             return "additionalContext too long";
  return null;
}

function sanitize(str: string | undefined): string {
  if (!str) return "";
  return str.replace(/[<>{}]/g, "").trim().slice(0, 500);
}

// ── AUTH: verify JWT, return user_id or null ───────────────────────────────────
async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");
  const supabaseUrl  = Deno.env.get("SUPABASE_URL");
  const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnon) return null;

  try {
    const client = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) return null;
    return user.id;
  } catch {
    return null;
  }
}

// ── RATE LIMIT: max 5 audits/day per user ─────────────────────────────────────
const DAILY_LIMIT = 5;

async function checkAndIncrementUsage(userId: string): Promise<boolean> {
  const supabaseUrl     = Deno.env.get("SUPABASE_URL");
  const supabaseService = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseService) return true; // fail open if misconfigured

  try {
    const admin = createClient(supabaseUrl, supabaseService);

    // Get current usage
    const { data, error } = await admin
      .from("usage_limits")
      .select("audits_today, last_reset")
      .eq("user_id", userId)
      .single();

    if (error) {
      // Row doesn't exist yet — create it
      await admin.from("usage_limits").insert({ user_id: userId, audits_today: 1, audits_total: 1 });
      return true;
    }

    // Reset counter if new day
    const today = new Date().toISOString().split("T")[0];
    const lastReset = data.last_reset;
    const currentCount = lastReset < today ? 0 : (data.audits_today ?? 0);

    if (currentCount >= DAILY_LIMIT) return false; // limit reached

    // Increment
    await admin
      .from("usage_limits")
      .update({
        audits_today: currentCount + 1,
        audits_total: (data.audits_today ?? 0) + 1,
        last_reset: today,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    return true;
  } catch {
    return true; // fail open — don't block user on DB error
  }
}

// ── SAVE AUDIT RESULT TO DB ────────────────────────────────────────────────────
async function saveAudit(userId: string, companyName: string, country: string, industry: string, result: object) {
  const supabaseUrl     = Deno.env.get("SUPABASE_URL");
  const supabaseService = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseService) return;

  try {
    const admin = createClient(supabaseUrl, supabaseService);
    await admin.from("audits").insert({
      user_id: userId,
      company_name: companyName,
      country: country || null,
      industry: industry || null,
      result,
    });
  } catch {
    // Non-critical — don't fail the response if save fails
  }
}

// ── TAVILY SEARCH ──────────────────────────────────────────────────────────────
async function tavilySearch(query: string, apiKey: string, maxResults = 6): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        max_results: maxResults,
        include_answer: true,
        include_raw_content: false,
      }),
    });
    clearTimeout(timeout);

    if (!response.ok) return "";
    const data = await response.json();
    const lines: string[] = [];
    if (data.answer) lines.push(`SUMMARY: ${data.answer}`, "");
    (data.results ?? []).forEach((r: any, i: number) => {
      lines.push(`[${i+1}] ${r.title}`, `URL: ${r.url}`, `Content: ${r.content?.slice(0, 300) ?? ""}`, "");
    });
    return lines.join("\n");
  } catch { return ""; }
}

async function gatherRealData(company: string, website: string, country: string, industry: string, apiKey: string): Promise<string> {
  const ctx = [country, industry].filter(Boolean).join(", ");
  const [news, reviews, legal, social] = await Promise.all([
    tavilySearch(`"${company}" ${ctx} news reputation 2024 2025`, apiKey, 6),
    tavilySearch(`"${company}" reviews rating customers complaints`, apiKey, 5),
    tavilySearch(`"${company}" lawsuit fine regulatory complaint`, apiKey, 4),
    tavilySearch(`"${company}" reddit twitter social media`, apiKey, 4),
  ]);
  const sections = [
    news    ? `=== NEWS & REPUTATION ===\n${news}`   : "",
    reviews ? `=== REVIEWS ===\n${reviews}`          : "",
    legal   ? `=== LEGAL ===\n${legal}`              : "",
    social  ? `=== SOCIAL MEDIA ===\n${social}`      : "",
  ].filter(Boolean);
  return sections.length === 0
    ? "No web search results. Base on model knowledge."
    : `REAL WEB DATA FOR "${company}":\n\n${sections.join("\n\n")}`;
}

// ── TOOL SCHEMA ────────────────────────────────────────────────────────────────
const srcSchema = {
  type: "object",
  properties: {
    score:         { type: "number" },
    sentiment:     { type: "string", enum: ["positive","neutral","negative","mixed"] },
    summary:       { type: "string" },
    mention_count: { type: "number" },
    avg_rating:    { type: "number" },
    top_topics:    { type: "array", items: { type: "string" } },
  },
  required: ["score","sentiment","summary"],
};

const auditSchema = {
  type: "object",
  $defs: { source_category: srcSchema },
  properties: {
    company:           { type: "string" },
    overall_score:     { type: "number", minimum: 0, maximum: 100 },
    verdict:           { type: "string" },
    data_date:         { type: "string" },
    data_sources_used: { type: "array", items: { type: "string" } },
    summary: {
      type: "object",
      properties: {
        main_activity:  { type: "string" },
        key_narratives: { type: "array", items: { type: "string" } },
        key_event:      { type: "string" },
      },
      required: ["main_activity","key_narratives","key_event"],
    },
    sentiment_timeline: {
      type: "array",
      items: {
        type: "object",
        properties: {
          month: { type: "string" }, positive: { type: "number" },
          neutral: { type: "number" }, negative: { type: "number" },
          event: { type: "string" },
        },
        required: ["month","positive","neutral","negative"],
      },
    },
    sources: {
      type: "object",
      properties: {
        media:    { "$ref": "#/$defs/source_category" },
        reviews:  { "$ref": "#/$defs/source_category" },
        social:   { "$ref": "#/$defs/source_category" },
        video:    { "$ref": "#/$defs/source_category" },
        employer: { "$ref": "#/$defs/source_category" },
        forums:   { "$ref": "#/$defs/source_category" },
      },
      required: ["media","reviews","social","video","employer","forums"],
    },
    legal: {
      type: "object",
      properties: {
        lawsuits:   { type: "array", items: { type: "string" } },
        fines:      { type: "array", items: { type: "string" } },
        complaints: { type: "array", items: { type: "string" } },
        risk_level: { type: "string", enum: ["low","medium","high"] },
        summary:    { type: "string" },
      },
      required: ["lawsuits","fines","complaints","risk_level","summary"],
    },
    management: {
      type: "object",
      properties: {
        persons: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" }, role: { type: "string" },
              sentiment: { type: "string", enum: ["positive","neutral","negative"] },
              summary: { type: "string" },
            },
            required: ["name","role","sentiment","summary"],
          },
        },
        summary: { type: "string" },
      },
      required: ["persons","summary"],
    },
    competitors: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" }, mentions: { type: "number" },
              sentiment_score: { type: "number" },
            },
            required: ["name","mentions","sentiment_score"],
          },
        },
        summary: { type: "string" },
      },
      required: ["data","summary"],
    },
    red_flags: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          severity: { type: "string", enum: ["critical","warning","info"] },
          source_url: { type: "string" },
        },
        required: ["text"],
      },
    },
    green_flags: {
      type: "array",
      items: {
        type: "object",
        properties: { text: { type: "string" }, source_url: { type: "string" } },
        required: ["text"],
      },
    },
    esg: {
      type: "object",
      properties: {
        ecology: { type: "string" }, labor: { type: "string" },
        data_privacy: { type: "string" },
        overall: { type: "string", enum: ["clean","concerns","serious_risks"] },
        summary: { type: "string" },
      },
      required: ["ecology","labor","data_privacy","overall","summary"],
    },
    recommendations: {
      type: "object",
      properties: {
        urgent:    { type: "array", items: { type: "string" } },
        mid_term:  { type: "array", items: { type: "string" } },
        long_term: { type: "array", items: { type: "string" } },
      },
      required: ["urgent","mid_term","long_term"],
    },
    confidence: { type: "string", enum: ["high","medium","low"] },
    negative_exposure: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              source: { type: "string" }, type: { type: "string" },
              severity:   { type: "string", enum: ["critical","warning","low"] },
              visibility: { type: "string", enum: ["High","Medium","Low"] },
              action:     { type: "string", enum: ["Respond","Monitor","Escalate","Ignore"] },
              summary: { type: "string" }, url: { type: "string" },
            },
            required: ["source","type","severity","visibility","action","summary"],
          },
        },
        summary: { type: "string" }, total_critical: { type: "number" },
      },
      required: ["items","summary","total_critical"],
    },
    trust_signals: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              status: { type: "string", enum: ["present","missing","partial"] },
              impact: { type: "string", enum: ["high","medium","low"] },
              note: { type: "string" },
            },
            required: ["name","status","impact"],
          },
        },
        score: { type: "number" }, summary: { type: "string" },
      },
      required: ["items","score","summary"],
    },
    funnel_analysis: {
      type: "object",
      properties: {
        steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              step: { type: "string" }, risk: { type: "string" },
              drop_off_pct: { type: "number" }, note: { type: "string" },
            },
            required: ["step","risk","drop_off_pct"],
          },
        },
        total_estimated_loss_pct: { type: "number" }, summary: { type: "string" },
      },
      required: ["steps","total_estimated_loss_pct","summary"],
    },
    sentiment_heatmap: {
      type: "array",
      items: {
        type: "object",
        properties: {
          theme: { type: "string" }, positive_pct: { type: "number" },
          neutral_pct: { type: "number" }, negative_pct: { type: "number" },
          risk: { type: "string", enum: ["low","medium","high"] },
        },
        required: ["theme","positive_pct","neutral_pct","negative_pct","risk"],
      },
    },
    ltv_roi_model: {
      type: "object",
      properties: {
        ltv: { type: "number" }, cac: { type: "number" },
        retention_rate: { type: "number" }, churn_from_reviews_pct: { type: "number" },
        estimated_annual_loss_min: { type: "number" },
        estimated_annual_loss_max: { type: "number" },
        loss_explanation: { type: "string" },
      },
      required: ["ltv","cac","retention_rate","churn_from_reviews_pct",
        "estimated_annual_loss_min","estimated_annual_loss_max","loss_explanation"],
    },
    competitive_trust: {
      type: "object",
      properties: {
        scores: {
          type: "array",
          items: {
            type: "object",
            properties: {
              competitor: { type: "string" },
              review_volume_ratio: { type: "number" },
              authority_score: { type: "number" },
              media_mentions_score: { type: "number" },
              clinical_authority_score: { type: "number" },
              overall_tier: { type: "string" },
            },
            required: ["competitor","review_volume_ratio","authority_score","overall_tier"],
          },
        },
        company_tier: { type: "string" }, summary: { type: "string" },
      },
      required: ["scores","company_tier","summary"],
    },
    priority_matrix: {
      type: "array",
      items: {
        type: "object",
        properties: {
          action: { type: "string" },
          impact: { type: "string", enum: ["High","Medium","Low"] },
          effort: { type: "string", enum: ["High","Medium","Low"] },
          priority: { type: "string", enum: ["Critical","High","Medium","Low"] },
          category: { type: "string" },
        },
        required: ["action","impact","effort","priority"],
      },
    },
    trajectory: {
      type: "object",
      properties: {
        current_rating:  { type: "number" },
        unmanaged_6mo:   { type: "number" }, unmanaged_12mo: { type: "number" },
        optimised_6mo:   { type: "number" }, optimised_12mo: { type: "number" },
        key_assumptions: { type: "array", items: { type: "string" } },
      },
      required: ["current_rating","unmanaged_6mo","unmanaged_12mo",
        "optimised_6mo","optimised_12mo","key_assumptions"],
    },
  },
  required: [
    "company","overall_score","verdict","data_date","summary",
    "sentiment_timeline","sources","legal","management","competitors",
    "red_flags","green_flags","esg","recommendations","confidence",
    "negative_exposure","trust_signals","funnel_analysis","sentiment_heatmap",
    "ltv_roi_model","competitive_trust","priority_matrix","trajectory",
  ],
};

// ── MAIN ───────────────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // AUTH DISABLED TEMPORARILY — re-enable when login is working
  const userId = "anonymous";

  // 2. PARSE
  let body: any;
  try { body = await req.json(); } catch { return Errors.badRequest("Invalid JSON"); }

  // 3. VALIDATE
  const validationError = validateInput(body);
  if (validationError) return Errors.badRequest(validationError);

  // 5. SANITIZE
  const companyName       = sanitize(body.companyName);
  const website           = sanitize(body.website);
  const country           = sanitize(body.country);
  const industry          = sanitize(body.industry);
  const timeRange         = body.timeRange  ?? "12";
  const language          = body.language   ?? "all";
  const depth             = body.depth      ?? "standard";
  const targetAudience    = sanitize(body.targetAudience);
  const companyStage      = sanitize(body.companyStage);
  const knownCompetitors  = sanitize(body.knownCompetitors);
  const ltv               = body.ltv           ?? null;
  const cac               = body.cac           ?? null;
  const retentionRate     = body.retentionRate ?? null;
  const additionalContext = sanitize(body.additionalContext);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const TAVILY_API_KEY  = Deno.env.get("TAVILY_API_KEY");
  if (!LOVABLE_API_KEY) return Errors.internal();

  // 6. STREAMING RESPONSE
  const { readable, writable } = new TransformStream();
  const writer  = writable.getWriter();
  const encoder = new TextEncoder();

  const write = async (data: string) => {
    try { await writer.write(encoder.encode(data)); } catch { /* closed */ }
  };

  (async () => {
    try {
      // Web search
      let realWorldData = "No web search API. Using model knowledge.";
      if (TAVILY_API_KEY) {
        realWorldData = await gatherRealData(companyName, website, country, industry, TAVILY_API_KEY);
      }

      // Prompt
      const langInstruction =
        language === "ru" ? "Respond entirely in Russian." :
        language === "en" ? "Respond entirely in English." :
        language === "es" ? "Respond entirely in Spanish." :
        "Respond in the primary language of the company's market.";

      const depthInstruction =
        depth === "deep"  ? "Extremely thorough. Maximum detail." :
        depth === "basic" ? "Concise overview." :
        "Balanced analysis with key details.";

      const extendedContext = [
        targetAudience   ? `Target Audience: ${targetAudience}`   : "",
        companyStage     ? `Company Stage: ${companyStage}`       : "",
        knownCompetitors ? `Competitors: ${knownCompetitors}`     : "",
        ltv              ? `LTV: $${ltv}`                         : "",
        cac              ? `CAC: $${cac}`                         : "",
        retentionRate    ? `Retention: ${retentionRate}%`         : "",
        additionalContext ? `Context: ${additionalContext}`       : "",
      ].filter(Boolean).join("\n");

      const systemPrompt = `You are an elite reputation intelligence analyst.
${langInstruction} ${depthInstruction}
CRITICAL: Base analysis ONLY on real web data provided. Do NOT invent facts.
If something is not in the data, state "not found in available sources".
You MUST use the deliver_audit tool with complete JSON.`;

      const userMessage = `Audit: ${companyName}
${website ? `Website: ${website}` : ""}${country ? ` | Country: ${country}` : ""}${industry ? ` | Industry: ${industry}` : ""}
Period: last ${timeRange} months
${extendedContext ? `Context:\n${extendedContext}\n` : ""}
=== REAL WEB DATA ===
${realWorldData}
=== END ===`;

      // AI call
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-5",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user",   content: userMessage  },
          ],
          tools: [{ type: "function", function: { name: "deliver_audit", description: "Deliver complete reputation audit", parameters: auditSchema } }],
          tool_choice: { type: "function", function: { name: "deliver_audit" } },
        }),
      });

      if (!aiResponse.ok) {
        await write(JSON.stringify({ error: aiResponse.status === 429 ? "Rate limit exceeded" : "Analysis failed" }));
        await writer.close();
        return;
      }

      const data    = await aiResponse.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) {
        await write(JSON.stringify({ error: "No results returned" }));
        await writer.close();
        return;
      }

      const result = JSON.parse(toolCall.function.arguments);

      // Save to DB (non-blocking)
      saveAudit(userId, companyName, country, industry, result);

      await write(JSON.stringify(result));
      await writer.close();

    } catch {
      // Never expose internal error details
      try {
        await write(JSON.stringify({ error: "Analysis failed. Please try again." }));
        await writer.close();
      } catch { /* connection already closed */ }
    }
  })();

  return new Response(readable, {
    headers: { ...corsHeaders, "Content-Type": "application/json", "X-Content-Type-Options": "nosniff" },
  });
});
