import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function respond(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function validateInput(body: any): string | null {
  if (!body || typeof body !== "object") return "Invalid request body";
  if (!body.companyName || typeof body.companyName !== "string") return "companyName is required";
  if (body.companyName.trim().length < 2) return "companyName is too short";
  if (body.companyName.length > 200) return "companyName is too long";
  return null;
}

function sanitize(str: string | undefined): string {
  if (!str) return "";
  return str.replace(/[<>{}]/g, "").trim().slice(0, 500);
}

// ── TAVILY SEARCH ──────────────────────────────────────────────────
async function tavilySearch(query: string, apiKey: string, maxResults = 8): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "advanced",
        max_results: maxResults,
        include_answer: true,
        include_raw_content: false,
      }),
    });
    clearTimeout(timeout);
    if (!response.ok) {
      const t = await response.text();
      console.error("Tavily error:", response.status, t);
      return "";
    }
    const data = await response.json();
    const lines: string[] = [];
    if (data.answer) lines.push(`SUMMARY: ${data.answer}`, "");
    (data.results ?? []).forEach((r: any, i: number) => {
      lines.push(`[${i + 1}] ${r.title}`, `URL: ${r.url}`, `Content: ${r.content?.slice(0, 400) ?? ""}`, "");
    });
    return lines.join("\n");
  } catch (e) {
    console.error("Tavily search failed:", e);
    return "";
  }
}

async function gatherRealData(company: string, website: string, country: string, industry: string, apiKey: string): Promise<string> {
  const ctx = [country, industry].filter(Boolean).join(", ");
  const [news, reviews, legal, social, leadership] = await Promise.all([
    tavilySearch(`"${company}" ${ctx} news reputation 2024 2025`, apiKey, 8),
    tavilySearch(`"${company}" reviews rating customers complaints`, apiKey, 8),
    tavilySearch(`"${company}" lawsuit fine regulatory complaint`, apiKey, 5),
    tavilySearch(`"${company}" reddit twitter social media`, apiKey, 5),
    tavilySearch(`"${company}" CEO founder leadership reputation`, apiKey, 5),
  ]);
  const sections = [
    news ? `=== NEWS & REPUTATION ===\n${news}` : "",
    reviews ? `=== REVIEWS ===\n${reviews}` : "",
    legal ? `=== LEGAL ===\n${legal}` : "",
    social ? `=== SOCIAL MEDIA ===\n${social}` : "",
    leadership ? `=== LEADERSHIP ===\n${leadership}` : "",
  ].filter(Boolean);
  return sections.length === 0
    ? "No web search results available. Use your general knowledge."
    : `REAL WEB DATA FOR "${company}":\n\n${sections.join("\n\n")}`;
}

// ── SAVE AUDIT TO DB ──────────────────────────────────────────────────
async function saveAudit(userId: string, companyName: string, country: string, industry: string, result: object): Promise<string | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseService = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseService) return null;
  try {
    const admin = createClient(supabaseUrl, supabaseService);
    const { data, error } = await admin.from("audits").insert({
      user_id: userId,
      company_name: companyName,
      country: country || null,
      industry: industry || null,
      result,
      score: (result as any).overall_score ?? null,
    }).select('share_id').single();
    if (error) {
      console.error("Save audit error:", error);
      return null;
    }
    return data?.share_id ?? null;
  } catch (e) {
    console.error("Save audit failed:", e);
    return null;
  }
}

// ── MAIN ──────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Auth
  let userId = "anonymous";
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY");
      if (supabaseUrl && supabaseAnon) {
        const client = createClient(supabaseUrl, supabaseAnon, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        });
        const { data: { user } } = await client.auth.getUser();
        if (user?.id) userId = user.id;
      }
    }
  } catch { /* keep anonymous */ }

  // Parse body
  let body: any;
  try { body = await req.json(); } catch { return respond({ error: "Invalid JSON" }, 400); }

  const validationError = validateInput(body);
  if (validationError) return respond({ error: validationError }, 400);

  const companyName = sanitize(body.companyName);
  const website = sanitize(body.website);
  const country = sanitize(body.country);
  const industry = sanitize(body.industry);
  const timeRange = body.timeRange ?? "12";
  const language = body.language ?? "all";
  const depth = body.depth ?? "standard";
  const targetAudience = sanitize(body.targetAudience);
  const companyStage = sanitize(body.companyStage);
  const knownCompetitors = sanitize(body.knownCompetitors);
  const ltv = body.ltv ?? null;
  const cac = body.cac ?? null;
  const retentionRate = body.retentionRate ?? null;
  const additionalContext = sanitize(body.additionalContext);

  // Check for Groq API key
  const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
  if (!GROQ_API_KEY) {
    console.error("GROQ_API_KEY is not configured");
    return respond({ error: "AI service not configured" }, 500);
  }

  try {
    // Optional: gather real web data via Tavily
    const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY");
    let realWorldData = "No web search data available. Base analysis on your general knowledge about this company.";
    if (TAVILY_API_KEY) {
      console.log("Tavily API key found, gathering real web data...");
      realWorldData = await gatherRealData(companyName, website, country, industry, TAVILY_API_KEY);
      console.log("Web data gathered, length:", realWorldData.length);
    } else {
      console.log("No Tavily API key, using model knowledge only");
    }

    const langInstruction =
      language === "ru" ? "Respond entirely in Russian." :
      language === "en" ? "Respond entirely in English." :
      language === "es" ? "Respond entirely in Spanish." :
      "Respond in the primary language of the company's market.";

    const depthInstruction =
      depth === "deep" ? "Extremely thorough. Maximum detail in every section." :
      depth === "basic" ? "Concise overview, key points only." :
      "Balanced analysis with key details.";

    const extendedContext = [
      targetAudience ? `Target Audience: ${targetAudience}` : "",
      companyStage ? `Company Stage: ${companyStage}` : "",
      knownCompetitors ? `Competitors: ${knownCompetitors}` : "",
      ltv ? `LTV: $${ltv}` : "",
      cac ? `CAC: $${cac}` : "",
      retentionRate ? `Retention: ${retentionRate}%` : "",
      additionalContext ? `Context: ${additionalContext}` : "",
    ].filter(Boolean).join("\n");

    const systemPrompt = `You are an elite reputation intelligence analyst. You produce structured reputation audit reports.
${langInstruction}
${depthInstruction}

CRITICAL RULES:
- Base your analysis on the web data provided. If no web data is available, use your general knowledge but be honest about confidence level.
- You MUST respond with a valid JSON object matching the exact schema described.
- Do NOT wrap in markdown code blocks. Just output raw JSON.
- All arrays must have at least 1 item.
- sentiment_timeline must have 6-12 monthly data points.
- Each source category score is 1-10.
- overall_score is 0-100.
- competitors.data MUST contain 3-5 real named competitor companies. Use your knowledge of the industry. Never use generic names like "Competitor A" or leave the array empty.`;

    const userMessage = `Perform a full reputation audit for: ${companyName}
${website ? `Website: ${website}` : ""}${country ? ` | Country: ${country}` : ""}${industry ? ` | Industry: ${industry}` : ""}
Analysis period: last ${timeRange} months
${extendedContext ? `\nAdditional context:\n${extendedContext}\n` : ""}

${realWorldData}

Return a JSON object with EXACTLY these fields:
{
  "company": "string",
  "overall_score": number (0-100),
  "verdict": "string (one-line summary)",
  "data_date": "YYYY-MM-DD",
  "summary": {
    "main_activity": "string",
    "key_narratives": ["string"],
    "key_event": "string"
  },
  "sentiment_timeline": [{"month": "YYYY-MM", "positive": number, "neutral": number, "negative": number, "event": "string or empty"}],
  "sources": {
    "media": {"score": number 1-10, "sentiment": "positive|neutral|negative|mixed", "summary": "string", "mention_count": number, "top_topics": ["string"]},
    "reviews": {"score": number, "sentiment": "string", "summary": "string", "avg_rating": number, "mention_count": number, "top_topics": ["string"]},
    "social": {"score": number, "sentiment": "string", "summary": "string", "mention_count": number, "top_topics": ["string"]},
    "video": {"score": number, "sentiment": "string", "summary": "string", "mention_count": number, "top_topics": ["string"]},
    "employer": {"score": number, "sentiment": "string", "summary": "string", "avg_rating": number, "mention_count": number, "top_topics": ["string"]},
    "forums": {"score": number, "sentiment": "string", "summary": "string", "mention_count": number, "top_topics": ["string"]}
  },
  "legal": {
    "lawsuits": ["string"],
    "fines": ["string"],
    "complaints": ["string"],
    "risk_level": "low|medium|high",
    "summary": "string"
  },
  "management": {
    "persons": [{"name": "string", "role": "string", "sentiment": "positive|neutral|negative", "summary": "string"}],
    "summary": "string"
  },
  "competitors": {
    "data": [{"name": "REAL competitor company name (not generic)", "mentions": number, "sentiment_score": number 0-100}],
    "summary": "string"
  },
  "red_flags": [{"text": "string", "severity": "critical|warning|info"}],
  "green_flags": [{"text": "string"}],
  "esg": {
    "ecology": "string",
    "labor": "string",
    "data_privacy": "string",
    "overall": "clean|concerns|serious_risks",
    "summary": "string"
  },
  "recommendations": {
    "urgent": ["string"],
    "mid_term": ["string"],
    "long_term": ["string"]
  },
  "confidence": "high|medium|low",
  "negative_exposure": {
    "total_critical": number,
    "summary": "string",
    "items": [{"source": "string", "type": "string", "severity": "critical|warning|low", "visibility": "High|Medium|Low", "action": "Respond|Monitor|Escalate|Ignore", "summary": "string"}]
  },
  "trust_signals": {
    "score": number,
    "summary": "string",
    "items": [{"name": "string", "status": "present|missing|partial", "impact": "high|medium|low", "note": "string"}]
  },
  "funnel_analysis": {
    "total_estimated_loss_pct": number,
    "summary": "string",
    "steps": [{"step": "string", "risk": "string", "drop_off_pct": number}]
  },
  "sentiment_heatmap": [{"theme": "string", "positive_pct": number, "neutral_pct": number, "negative_pct": number, "risk": "low|medium|high"}],
  "ltv_roi_model": {
    "ltv": number, "cac": number, "retention_rate": number, "churn_from_reviews_pct": number,
    "estimated_annual_loss_min": number, "estimated_annual_loss_max": number, "loss_explanation": "string"
  },
  "competitive_trust": {
    "company_tier": "string",
    "summary": "string",
    "scores": [{"competitor": "string", "review_volume_ratio": number, "authority_score": number, "media_mentions_score": number, "clinical_authority_score": number, "overall_tier": "string"}]
  },
  "priority_matrix": [{"action": "string", "impact": "High|Medium|Low", "effort": "High|Medium|Low", "priority": "Critical|High|Medium|Low", "category": "string"}],
  "trajectory": {
    "current_rating": number, "unmanaged_6mo": number, "optimised_6mo": number,
    "unmanaged_12mo": number, "optimised_12mo": number, "key_assumptions": ["string"]
  }
}

Respond ONLY with a valid JSON object. No markdown, no explanation, just raw JSON.`;

    console.log("Calling Groq API...");
    const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 8192,
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("Groq API error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return respond({ error: "Rate limit exceeded. Please try again in a moment." }, 429);
      }
      return respond({ error: "Analysis failed. Please try again." }, 500);
    }

    const data = await aiResponse.json();
    const rawText = data.choices?.[0]?.message?.content;
    if (!rawText) {
      console.error("Groq empty response:", JSON.stringify(data).slice(0, 500));
      return respond({ error: "No results returned" }, 500);
    }

    let result: any;
    try {
      const clean = rawText.replace(/```json|```/g, "").trim();
      result = JSON.parse(clean);
      console.log("Parsed result keys:", Object.keys(result).join(", "));
    } catch (e) {
      console.error("JSON parse error:", e, "Raw:", rawText?.slice(0, 300));
      return respond({ error: "Failed to parse AI response" }, 500);
    }

    // Validate minimal structure
    if (!result.company || typeof result.overall_score !== "number") {
      console.error("Invalid result structure, missing company or overall_score");
      return respond({ error: "Incomplete analysis result" }, 500);
    }

    // Save to DB and get share_id
    let shareId: string | null = null;
    if (userId !== "anonymous") {
      shareId = await saveAudit(userId, companyName, country, industry, result);
    }

    // Attach share_id to response
    if (shareId) {
      result.share_id = shareId;
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Function error:", err instanceof Error ? err.message : "unknown");
    return respond({ error: "Analysis failed. Please try again." }, 500);
  }
});
