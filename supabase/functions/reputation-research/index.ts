import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function tavilySearch(query: string, apiKey: string): Promise<{ answer: string; results: { title: string; url: string; content: string }[] }> {
  try {
    const resp = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "advanced",
        max_results: 10,
        include_answer: true,
      }),
    });
    if (!resp.ok) {
      console.error(`Tavily search failed for "${query}":`, resp.status);
      return { answer: "", results: [] };
    }
    const data = await resp.json();
    return {
      answer: data.answer || "",
      results: (data.results || []).map((r: any) => ({ title: r.title, url: r.url, content: r.content })),
    };
  } catch (e) {
    console.error(`Tavily search error for "${query}":`, e);
    return { answer: "", results: [] };
  }
}

function formatSearchResults(label: string, data: { answer: string; results: { title: string; url: string; content: string }[] }): string {
  const sources = data.results.map((r, i) => `  ${i + 1}. [${r.title}](${r.url})\n     ${r.content.slice(0, 300)}`).join("\n");
  return `=== ${label} ===\nSummary: ${data.answer}\n\nSources:\n${sources}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { companyName, website, country, industry, timeRange, language, depth, targetAudience, companyStage, knownCompetitors, ltv, cac, retentionRate, additionalContext } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY");
    if (!TAVILY_API_KEY) throw new Error("TAVILY_API_KEY is not configured");

    const periodMonths = timeRange || "12";
    const regionHint = country ? ` ${country}` : "";
    const industryHint = industry ? ` ${industry}` : "";

    // ── 6 PARALLEL TAVILY SEARCHES ──────────────────────────────────────────
    console.log(`Starting 6 parallel Tavily searches for "${companyName}"...`);

    const [newsData, reviewsData, complaintsData, legalData, socialData, competitorData] = await Promise.all([
      tavilySearch(`"${companyName}"${regionHint}${industryHint} news reputation media coverage recent ${periodMonths} months`, TAVILY_API_KEY),
      tavilySearch(`"${companyName}" reviews ratings customer feedback Trustpilot Google reviews Yelp`, TAVILY_API_KEY),
      tavilySearch(`"${companyName}" complaints problems negative experiences scam fraud`, TAVILY_API_KEY),
      tavilySearch(`"${companyName}" lawsuits legal fines regulatory violations sanctions`, TAVILY_API_KEY),
      tavilySearch(`"${companyName}" social media Reddit Twitter LinkedIn discussions opinions`, TAVILY_API_KEY),
      tavilySearch(`"${companyName}"${industryHint} competitors market comparison vs alternative`, TAVILY_API_KEY),
    ]);

    console.log("All 6 Tavily searches completed.");

    // ── BUILD WEB CONTEXT ───────────────────────────────────────────────────
    const webContext = [
      formatSearchResults("NEWS & REPUTATION", newsData),
      formatSearchResults("REVIEWS & RATINGS", reviewsData),
      formatSearchResults("COMPLAINTS & NEGATIVE", complaintsData),
      formatSearchResults("LEGAL & REGULATORY", legalData),
      formatSearchResults("SOCIAL MEDIA & FORUMS", socialData),
      formatSearchResults("COMPETITORS & MARKET", competitorData),
    ].join("\n\n");

    // Collect all real URLs for data_sources_used
    const allUrls = [newsData, reviewsData, complaintsData, legalData, socialData, competitorData]
      .flatMap(d => d.results.map(r => r.url))
      .filter(Boolean)
      .slice(0, 30);

    const langInstruction = language === "ru" ? "Отвечай на русском языке." : language === "en" ? "Answer in English." : language === "es" ? "Responde en español." : "Answer in the primary language of the company's market.";
    const depthInstruction = depth === "deep" ? "Perform extremely thorough analysis. Maximum detail for every section." : depth === "basic" ? "Provide concise overview of each category." : "Provide balanced analysis with key details.";

    // ── SYSTEM PROMPT WITH SCORING FORMULAS ──────────────────────────────────
    const systemPrompt = `You are an AI-powered Reputation Intelligence System performing an automated reputation audit.

${langInstruction}
${depthInstruction}

CRITICAL: You must base your analysis EXCLUSIVELY on the real web data provided below. Do NOT fabricate data. If information is unavailable, indicate low confidence.

=== REAL WEB DATA FROM LIVE SEARCH ===

${webContext}

=== END OF WEB DATA ===

SCORING METHODOLOGY (all scores must follow these formulas):

1. SENTIMENT NORMALIZATION: NormalizedSentiment = (RawSentiment + 1) × 50 → Scale 0–100
2. TEMPORAL DECAY: Weight = e^(-0.1 × months_old) — older mentions influence score less
3. CORE REPUTATION SCORE:
   Score = (ReviewSentiment × 0.35) + (ReviewVolume × 0.15) + (SERPControl × 0.15) + (MediaSentiment × 0.15) + (ShareOfVoice × 0.10) + (LowVolatility × 0.10)
4. RISK INDEX:
   Risk = (NegativeSentimentWeight × 0.4) + (SERPNegativePresence × 0.3) + (VolatilitySpike × 0.3)
   0–30 = Low, 31–60 = Moderate, 61–100 = High
5. SERP CONTROL:
   SERPControl = (Owned × 1 + Neutral × 0.5 - Negative × 1) / 10 × 100
6. FINANCIAL IMPACT:
   LostRevenue = Traffic × ConversionRate × AvgDealSize × SentimentImpact%

RULES:
- Every score must be explainable and derived from the formulas above
- No empty placeholder sections — if data unavailable, omit the section
- All metrics must reference real sources from the web data
- Include real URLs from the search results as data_sources_used
- red_flags and green_flags must include source_url when available
- Output must feel like an automated intelligence system, not a consultant report

${targetAudience ? `Target audience: ${targetAudience}` : ""}
${companyStage ? `Company stage: ${companyStage}` : ""}
${knownCompetitors ? `Known competitors: ${knownCompetitors}` : ""}
${ltv ? `Customer LTV: $${ltv}` : ""}
${cac ? `CAC: $${cac}` : ""}
${retentionRate ? `Retention rate: ${retentionRate}%` : ""}
${additionalContext ? `Additional context: ${additionalContext}` : ""}`;

    const userMessage = `Conduct a full reputation audit for:
Company: ${companyName}
${website ? `Website: ${website}` : ""}
${country ? `Country/Region: ${country}` : ""}
${industry ? `Industry: ${industry}` : ""}
Analysis period: last ${periodMonths} months
Depth: ${depth || "standard"}

Analyze the REAL WEB DATA provided and fill all 18 modules of the structured audit.`;

    // ── CALL GPT ────────────────────────────────────────────────────────────
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
              description: "Deliver the complete reputation audit results based on real web data",
              parameters: {
                type: "object",
                properties: {
                  company: { type: "string" },
                  overall_score: { type: "number", minimum: 0, maximum: 100, description: "Calculated using: (RS×0.35)+(RV×0.15)+(SC×0.15)+(MS×0.15)+(SOV×0.10)+((100-VOL)×0.10)" },
                  verdict: { type: "string" },
                  data_date: { type: "string" },
                  data_sources_used: { type: "array", items: { type: "string" }, description: "Real URLs from Tavily search results used in the analysis" },
                  score_breakdown: {
                    type: "object",
                    properties: {
                      review_sentiment: { type: "number" },
                      review_volume: { type: "number" },
                      serp_control: { type: "number" },
                      media_sentiment: { type: "number" },
                      share_of_voice: { type: "number" },
                      low_volatility: { type: "number" },
                    },
                    required: ["review_sentiment", "review_volume", "serp_control", "media_sentiment", "share_of_voice", "low_volatility"],
                  },
                  risk_index: {
                    type: "object",
                    properties: {
                      score: { type: "number", minimum: 0, maximum: 100 },
                      level: { type: "string", enum: ["low", "moderate", "high"] },
                      crisis_probability: { type: "number", minimum: 0, maximum: 100 },
                      components: {
                        type: "object",
                        properties: {
                          negative_sentiment_weight: { type: "number" },
                          serp_negative_presence: { type: "number" },
                          volatility_spike: { type: "number" },
                        },
                        required: ["negative_sentiment_weight", "serp_negative_presence", "volatility_spike"],
                      },
                    },
                    required: ["score", "level", "crisis_probability", "components"],
                  },
                  serp_control: {
                    type: "object",
                    properties: {
                      score: { type: "number", minimum: 0, maximum: 100 },
                      owned: { type: "number" },
                      neutral: { type: "number" },
                      negative: { type: "number" },
                      competitor: { type: "number" },
                      results: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            title: { type: "string" },
                            url: { type: "string" },
                            type: { type: "string", enum: ["owned", "neutral", "negative", "competitor"] },
                          },
                          required: ["title", "url", "type"],
                        },
                      },
                    },
                    required: ["score", "owned", "neutral", "negative", "competitor", "results"],
                  },
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
                      media: { $ref: "#/$defs/source_category" },
                      reviews: { $ref: "#/$defs/source_category" },
                      social: { $ref: "#/$defs/source_category" },
                      video: { $ref: "#/$defs/source_category" },
                      employer: { $ref: "#/$defs/source_category" },
                      forums: { $ref: "#/$defs/source_category" },
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
                            name: { type: "string" },
                            role: { type: "string" },
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
                        source_url: { type: "string" },
                      },
                      required: ["text"],
                    },
                  },
                  green_flags: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        text: { type: "string" },
                        source_url: { type: "string" },
                      },
                      required: ["text"],
                    },
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
                  financial_impact: {
                    type: "object",
                    properties: {
                      lost_revenue_estimate: { type: "number" },
                      sentiment_gap_pct: { type: "number" },
                      explanation: { type: "string" },
                      formula_inputs: {
                        type: "object",
                        properties: {
                          estimated_traffic: { type: "number" },
                          conversion_rate: { type: "number" },
                          avg_deal_size: { type: "number" },
                          sentiment_impact_pct: { type: "number" },
                        },
                        required: ["estimated_traffic", "conversion_rate", "avg_deal_size", "sentiment_impact_pct"],
                      },
                    },
                    required: ["lost_revenue_estimate", "sentiment_gap_pct", "explanation", "formula_inputs"],
                  },
                  anomaly_alerts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        description: { type: "string" },
                        severity: { type: "string", enum: ["critical", "warning", "info"] },
                        detected_at: { type: "string" },
                      },
                      required: ["type", "description", "severity"],
                    },
                  },
                  negative_exposure: {
                    type: "object",
                    properties: {
                      total_critical: { type: "number" },
                      summary: { type: "string" },
                      items: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            source: { type: "string" },
                            type: { type: "string" },
                            severity: { type: "string" },
                            visibility: { type: "string" },
                            action: { type: "string" },
                            summary: { type: "string" },
                            url: { type: "string" },
                          },
                          required: ["source", "type", "severity", "visibility", "action", "summary"],
                        },
                      },
                    },
                    required: ["total_critical", "summary", "items"],
                  },
                  trust_signals: {
                    type: "object",
                    properties: {
                      score: { type: "number" },
                      summary: { type: "string" },
                      items: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            status: { type: "string" },
                            impact: { type: "string" },
                            note: { type: "string" },
                          },
                          required: ["name", "status", "impact"],
                        },
                      },
                    },
                    required: ["score", "summary", "items"],
                  },
                  funnel_analysis: {
                    type: "object",
                    properties: {
                      total_estimated_loss_pct: { type: "number" },
                      summary: { type: "string" },
                      steps: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            step: { type: "string" },
                            risk: { type: "string" },
                            drop_off_pct: { type: "number" },
                            note: { type: "string" },
                          },
                          required: ["step", "risk", "drop_off_pct"],
                        },
                      },
                    },
                    required: ["total_estimated_loss_pct", "summary", "steps"],
                  },
                  sentiment_heatmap: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        theme: { type: "string" },
                        positive_pct: { type: "number" },
                        neutral_pct: { type: "number" },
                        negative_pct: { type: "number" },
                        risk: { type: "string" },
                      },
                      required: ["theme", "positive_pct", "neutral_pct", "negative_pct", "risk"],
                    },
                  },
                  ltv_roi_model: {
                    type: "object",
                    properties: {
                      ltv: { type: "number" },
                      cac: { type: "number" },
                      retention_rate: { type: "number" },
                      churn_from_reviews_pct: { type: "number" },
                      estimated_annual_loss_min: { type: "number" },
                      estimated_annual_loss_max: { type: "number" },
                      loss_explanation: { type: "string" },
                    },
                    required: ["ltv", "cac", "retention_rate", "churn_from_reviews_pct", "estimated_annual_loss_min", "estimated_annual_loss_max", "loss_explanation"],
                  },
                  competitive_trust: {
                    type: "object",
                    properties: {
                      company_tier: { type: "string" },
                      summary: { type: "string" },
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
                          required: ["competitor", "review_volume_ratio", "authority_score", "media_mentions_score", "clinical_authority_score", "overall_tier"],
                        },
                      },
                    },
                    required: ["company_tier", "summary", "scores"],
                  },
                  priority_matrix: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        action: { type: "string" },
                        impact: { type: "string" },
                        effort: { type: "string" },
                        priority: { type: "string" },
                        category: { type: "string" },
                      },
                      required: ["action", "impact", "effort", "priority"],
                    },
                  },
                  trajectory: {
                    type: "object",
                    properties: {
                      current_rating: { type: "number" },
                      unmanaged_6mo: { type: "number" },
                      optimised_6mo: { type: "number" },
                      unmanaged_12mo: { type: "number" },
                      optimised_12mo: { type: "number" },
                      key_assumptions: { type: "array", items: { type: "string" } },
                    },
                    required: ["current_rating", "unmanaged_6mo", "optimised_6mo", "unmanaged_12mo", "optimised_12mo", "key_assumptions"],
                  },
                  confidence: { type: "string", enum: ["high", "medium", "low"] },
                },
                required: [
                  "company", "overall_score", "verdict", "data_date", "data_sources_used",
                  "score_breakdown", "risk_index", "serp_control",
                  "summary", "sentiment_timeline", "sources", "legal", "management", "competitors",
                  "red_flags", "green_flags", "recommendations", "confidence",
                ],
                $defs: {
                  source_category: {
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
                  },
                },
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "deliver_audit" } },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Analysis error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "Failed to get analysis results" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);

    // Inject real URLs if GPT didn't include them
    if (!result.data_sources_used || result.data_sources_used.length === 0) {
      result.data_sources_used = allUrls;
    }

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
