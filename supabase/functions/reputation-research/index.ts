import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      companyName, website, country, industry, timeRange, language, depth,
      targetAudience, companyStage, knownCompetitors, ltv, cac, retentionRate, additionalContext,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langInstruction =
      language === "ru" ? "Respond entirely in Russian." :
      language === "en" ? "Respond entirely in English." :
      language === "es" ? "Respond entirely in Spanish." :
      "Respond in the primary language of the company's market.";

    const depthInstruction =
      depth === "deep" ? "Perform extremely thorough research across ALL categories. Maximum detail, minimum 3 items per list field." :
      depth === "basic" ? "Provide a concise overview of each category. At least 1 item per list field." :
      "Provide balanced analysis with key details. At least 2 items per list field.";

    const periodMonths = timeRange || "12";

    const extendedContext = [
      targetAudience ? `Target Audience / Segment: ${targetAudience}` : "",
      companyStage ? `Company Stage: ${companyStage}` : "",
      knownCompetitors ? `Known Competitors (prioritise these in competitive analysis): ${knownCompetitors}` : "",
      ltv ? `Customer LTV provided by client: $${ltv}` : "",
      cac ? `CAC provided by client: $${cac}` : "",
      retentionRate ? `Retention Rate provided by client: ${retentionRate}%` : "",
      additionalContext ? `Additional context from client: ${additionalContext}` : "",
    ].filter(Boolean).join("\n");

    const systemPrompt = `You are an elite reputation intelligence analyst and strategic advisor conducting a comprehensive, investor-grade reputation audit.

${langInstruction}
${depthInstruction}

Analyze the company over the last ${periodMonths} months across ALL channels: news media, review platforms, social media, YouTube/video, employer reputation, forums, legal records, management reputation, and trust infrastructure.

Base your analysis on real, verifiable information where possible. When estimating, clearly indicate confidence level.

You MUST respond using the deliver_audit tool with a complete structured JSON covering all 18 fields.

Core guidelines:
- overall_score: 0–100 (0=catastrophic, 100=perfect)
- Each source category score: 0–10
- Sentiment: "positive" | "neutral" | "negative" | "mixed"
- Legal risk: "low" | "medium" | "high"
- ESG overall: "clean" | "concerns" | "serious_risks"
- All recommendations must be specific, actionable, and company-specific — never generic
- data_date = today's date
- sentiment_timeline = monthly data points for the analysis period
- red_flags and green_flags must be specific to this company

ADDITIONAL ANALYSIS MODULES (all required):

1. NEGATIVE EXPOSURE MAPPING — Deep scan of: Reddit threads (note upvote context), App Store 1–2★ reviews (extract key complaint phrases), blog/forum complaints, YouTube/podcast mentions, media criticism, Glassdoor if it affects brand perception. Per item: source, type, severity, visibility, action, summary. severity ∈ critical/warning/low. action ∈ Respond/Monitor/Escalate/Ignore.

2. TRUST SIGNAL AUDIT — Check: SSL/security badges, certifications (B-Corp, ISO, medical/niche accreditation), clinical/advisory board public visibility, media logo wall on site, case studies with numbers, real founder/team page. Per item: name, status (present/missing/partial), impact (high/medium/low), note. Score 0–10.

3. INTAKE FUNNEL FRICTION — Map the full user journey (Landing → Signup → Install → Account → Trial → Paid). Per step: step name, risk/friction, drop_off_pct (realistic estimate), note. Sum up total_estimated_loss_pct.

4. SENTIMENT HEATMAP — Break sentiment by themes (UX, Pricing, Clinical/Niche Credibility, Support, Value Proposition, Brand Trust, etc.). Per theme: positive_pct, neutral_pct, negative_pct (must sum to 100), risk (low/medium/high).

5. LTV-BASED ROI MODEL — Use client-provided LTV/CAC/retention if available, otherwise use industry benchmarks. Calculate: churn_from_reviews_pct (estimate), estimated_annual_loss_min, estimated_annual_loss_max (in USD), and a plain-English loss_explanation for founders/investors.

6. COMPETITIVE TRUST GAP — For each known or discovered competitor: review_volume_ratio (vs analyzed company, 1.0=equal), authority_score 0–10, media_mentions_score 0–10, clinical_authority_score 0–10, overall_tier string. Assign company_tier: "Tier 1 (Leader)" | "Tier 2 (Established)" | "Tier 3 (Emerging)".

7. PRIORITY MATRIX — Minimum 6 actionable items. Per item: action (specific), impact (High/Medium/Low), effort (High/Medium/Low), priority (Critical/High/Medium/Low), category. Items must be specific to this company, not generic.

8. REPUTATION TRAJECTORY FORECAST — Project rating/score trajectory: current_rating, unmanaged_6mo, unmanaged_12mo, optimised_6mo, optimised_12mo. Include 3–5 key_assumptions driving the forecast.

All new modules must be specific to this company — never generic placeholder content.`;

    const userMessage = `Conduct a full reputation audit for:
Company: ${companyName}
${website ? `Website: ${website}` : ""}
${country ? `Country/Region: ${country}` : ""}
${industry ? `Industry: ${industry}` : ""}
Analysis period: last ${periodMonths} months
Depth: ${depth || "standard"}
${extendedContext ? `\nClient-provided context:\n${extendedContext}` : ""}

Provide comprehensive findings across ALL 18 audit categories. Be specific, data-driven, and actionable.`;

    const sourceCategorySchema = {
      type: "object",
      properties: {
        score: { type: "number" },
        sentiment: { type: "string", enum: ["positive", "neutral", "negative", "mixed"] },
        summary: { type: "string" },
        mention_count: { type: "number" },
        avg_rating: { type: "number" },
        top_topics: { type: "array", items: { type: "string" } },
      },
      required: ["score", "sentiment", "summary"],
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "deliver_audit",
              description: "Deliver the complete reputation audit results",
              parameters: {
                type: "object",
                $defs: { source_category: sourceCategorySchema },
                properties: {
                  // ── ORIGINAL FIELDS ──────────────────────────────────────
                  company: { type: "string" },
                  overall_score: { type: "number", minimum: 0, maximum: 100 },
                  verdict: { type: "string" },
                  data_date: { type: "string" },
                  summary: {
                    type: "object",
                    properties: {
                      main_activity: { type: "string" },
                      key_narratives: { type: "array", items: { type: "string" } },
                      key_event: { type: "string" },
                    },
                    required: ["main_activity", "key_narratives", "key_event"],
                  },
                  sentiment_timeline: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        month: { type: "string" },
                        positive: { type: "number" },
                        neutral: { type: "number" },
                        negative: { type: "number" },
                        event: { type: "string" },
                      },
                      required: ["month", "positive", "neutral", "negative"],
                    },
                  },
                  sources: {
                    type: "object",
                    properties: {
                      media: { "$ref": "#/$defs/source_category" },
                      reviews: { "$ref": "#/$defs/source_category" },
                      social: { "$ref": "#/$defs/source_category" },
                      video: { "$ref": "#/$defs/source_category" },
                      employer: { "$ref": "#/$defs/source_category" },
                      forums: { "$ref": "#/$defs/source_category" },
                    },
                    required: ["media", "reviews", "social", "video", "employer", "forums"],
                  },
                  legal: {
                    type: "object",
                    properties: {
                      lawsuits: { type: "array", items: { type: "string" } },
                      fines: { type: "array", items: { type: "string" } },
                      complaints: { type: "array", items: { type: "string" } },
                      risk_level: { type: "string", enum: ["low", "medium", "high"] },
                      summary: { type: "string" },
                    },
                    required: ["lawsuits", "fines", "complaints", "risk_level", "summary"],
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
                            sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
                            summary: { type: "string" },
                          },
                          required: ["name", "role", "sentiment", "summary"],
                        },
                      },
                      summary: { type: "string" },
                    },
                    required: ["persons", "summary"],
                  },
                  competitors: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            mentions: { type: "number" },
                            sentiment_score: { type: "number" },
                          },
                          required: ["name", "mentions", "sentiment_score"],
                        },
                      },
                      summary: { type: "string" },
                    },
                    required: ["data", "summary"],
                  },
                  red_flags: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        text: { type: "string" },
                        severity: { type: "string", enum: ["critical", "warning", "info"] },
                      },
                      required: ["text"],
                    },
                  },
                  green_flags: {
                    type: "array",
                    items: { type: "object", properties: { text: { type: "string" } }, required: ["text"] },
                  },
                  esg: {
                    type: "object",
                    properties: {
                      ecology: { type: "string" }, labor: { type: "string" },
                      data_privacy: { type: "string" },
                      overall: { type: "string", enum: ["clean", "concerns", "serious_risks"] },
                      summary: { type: "string" },
                    },
                    required: ["ecology", "labor", "data_privacy", "overall", "summary"],
                  },
                  recommendations: {
                    type: "object",
                    properties: {
                      urgent: { type: "array", items: { type: "string" } },
                      mid_term: { type: "array", items: { type: "string" } },
                      long_term: { type: "array", items: { type: "string" } },
                    },
                    required: ["urgent", "mid_term", "long_term"],
                  },
                  confidence: { type: "string", enum: ["high", "medium", "low"] },

                  // ── NEW FIELDS ────────────────────────────────────────────
                  negative_exposure: {
                    type: "object",
                    properties: {
                      items: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            source: { type: "string" }, type: { type: "string" },
                            severity: { type: "string", enum: ["critical", "warning", "low"] },
                            visibility: { type: "string", enum: ["High", "Medium", "Low"] },
                            action: { type: "string", enum: ["Respond", "Monitor", "Escalate", "Ignore"] },
                            summary: { type: "string" }, url: { type: "string" },
                          },
                          required: ["source", "type", "severity", "visibility", "action", "summary"],
                        },
                      },
                      summary: { type: "string" },
                      total_critical: { type: "number" },
                    },
                    required: ["items", "summary", "total_critical"],
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
                            status: { type: "string", enum: ["present", "missing", "partial"] },
                            impact: { type: "string", enum: ["high", "medium", "low"] },
                            note: { type: "string" },
                          },
                          required: ["name", "status", "impact"],
                        },
                      },
                      score: { type: "number" },
                      summary: { type: "string" },
                    },
                    required: ["items", "score", "summary"],
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
                          required: ["step", "risk", "drop_off_pct"],
                        },
                      },
                      total_estimated_loss_pct: { type: "number" },
                      summary: { type: "string" },
                    },
                    required: ["steps", "total_estimated_loss_pct", "summary"],
                  },
                  sentiment_heatmap: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        theme: { type: "string" },
                        positive_pct: { type: "number" }, neutral_pct: { type: "number" },
                        negative_pct: { type: "number" },
                        risk: { type: "string", enum: ["low", "medium", "high"] },
                      },
                      required: ["theme", "positive_pct", "neutral_pct", "negative_pct", "risk"],
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
                    required: ["ltv", "cac", "retention_rate", "churn_from_reviews_pct",
                      "estimated_annual_loss_min", "estimated_annual_loss_max", "loss_explanation"],
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
                          required: ["competitor", "review_volume_ratio", "authority_score", "overall_tier"],
                        },
                      },
                      company_tier: { type: "string" },
                      summary: { type: "string" },
                    },
                    required: ["scores", "company_tier", "summary"],
                  },
                  priority_matrix: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        action: { type: "string" },
                        impact: { type: "string", enum: ["High", "Medium", "Low"] },
                        effort: { type: "string", enum: ["High", "Medium", "Low"] },
                        priority: { type: "string", enum: ["Critical", "High", "Medium", "Low"] },
                        category: { type: "string" },
                      },
                      required: ["action", "impact", "effort", "priority"],
                    },
                  },
                  trajectory: {
                    type: "object",
                    properties: {
                      current_rating: { type: "number" },
                      unmanaged_6mo: { type: "number" }, unmanaged_12mo: { type: "number" },
                      optimised_6mo: { type: "number" }, optimised_12mo: { type: "number" },
                      key_assumptions: { type: "array", items: { type: "string" } },
                    },
                    required: ["current_rating", "unmanaged_6mo", "unmanaged_12mo",
                      "optimised_6mo", "optimised_12mo", "key_assumptions"],
                  },
                },
                required: [
                  "company", "overall_score", "verdict", "data_date", "summary",
                  "sentiment_timeline", "sources", "legal", "management", "competitors",
                  "red_flags", "green_flags", "esg", "recommendations", "confidence",
                  "negative_exposure", "trust_signals", "funnel_analysis", "sentiment_heatmap",
                  "ltv_roi_model", "competitive_trust", "priority_matrix", "trajectory",
                ],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "deliver_audit" } },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Analysis error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No analysis results returned" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("research error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
