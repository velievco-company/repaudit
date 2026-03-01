import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { companyName, website, country, industry, timeRange, language, depth } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langInstruction = language === 'ru' ? 'Отвечай на русском языке.' : language === 'en' ? 'Answer in English.' : 'Answer in the primary language of the company\'s market.';
    const depthInstruction = depth === 'deep' ? 'Perform extremely thorough research across all categories. Provide maximum detail.' : depth === 'basic' ? 'Provide a concise overview of each category.' : 'Provide a balanced analysis with key details.';
    const periodMonths = timeRange || '12';

    const systemPrompt = `You are an elite reputation intelligence analyst conducting a comprehensive reputation audit.

${langInstruction}
${depthInstruction}

Analyze the company over the last ${periodMonths} months. Research across: news media, review platforms, social media, YouTube/video, employer reputation (Glassdoor/HH.ru), forums (Reddit, VC.ru), legal records, and management reputation.

For each data point, base your analysis on real, verifiable information where possible. When estimating, clearly indicate confidence level.

You MUST respond using the deliver_audit tool with a complete structured JSON.

Key guidelines:
- overall_score: 0-100 where 0=catastrophic reputation, 100=perfect
- Each source category gets a score /10
- Sentiment must be: positive, neutral, negative, or mixed
- Legal risk: low, medium, or high
- ESG overall: clean, concerns, or serious_risks
- All recommendations must be specific and actionable
- Include real source names/URLs when possible
- data_date should be today's date
- sentiment_timeline should have monthly data points for the analysis period
- red_flags and green_flags must be specific, not generic`;

    const userMessage = `Conduct a full reputation audit for:
Company: ${companyName}
${website ? `Website: ${website}` : ''}
${country ? `Country/Region: ${country}` : ''}
${industry ? `Industry: ${industry}` : ''}

Analysis period: last ${periodMonths} months
Depth: ${depth || 'standard'}

Provide comprehensive findings across all 10 audit categories.`;

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
                properties: {
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
                      },
                      required: ["text"],
                    },
                  },
                  esg: {
                    type: "object",
                    properties: {
                      ecology: { type: "string" },
                      labor: { type: "string" },
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
                },
                required: [
                  "company", "overall_score", "verdict", "data_date", "summary",
                  "sentiment_timeline", "sources", "legal", "management", "competitors",
                  "red_flags", "green_flags", "esg", "recommendations", "confidence",
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
        return new Response(JSON.stringify({ error: "Превышен лимит запросов. Попробуйте позже." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Ошибка анализа" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "Не удалось получить результаты анализа" }), {
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
