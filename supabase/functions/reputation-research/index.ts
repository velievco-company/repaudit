import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { companyName, location, industry } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a reputation research analyst. You perform deep analysis of companies' online reputation.

Given a company name, location, and industry, research and estimate the following metrics as accurately as possible:

1. avgRating - Average Google review rating (0-5 scale, one decimal)
2. totalReviews - Approximate total Google review count
3. negativePercent - Estimated percentage of 1-2 star reviews (0-100)
4. googleRanking - Estimated Google ranking position for branded search (1-10)
5. negativePress - Whether there is negative press/media coverage (true/false)
6. glassdoor - Employer sentiment on Glassdoor ("none", "mild", "strong")
7. monthlyTraffic - Estimated monthly website traffic
8. conversionRate - Estimated conversion rate percentage
9. avgDealValue - Estimated average deal/transaction value in USD

For each metric, also provide a confidence level: "high", "medium", or "low".
Add a brief comment explaining your reasoning for each estimate.

IMPORTANT: 
- Be realistic and conservative in your estimates
- If you cannot find reliable information, say so and provide your best estimate with "low" confidence
- Base estimates on industry benchmarks for the ${industry} sector in ${location}
- Consider the company size, market position, and competitive landscape

Respond using the suggest_metrics tool.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Research the online reputation of: ${companyName}, located in ${location}, industry: ${industry}. Provide estimated reputation metrics with confidence levels.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_metrics",
              description: "Return estimated reputation metrics for the company",
              parameters: {
                type: "object",
                properties: {
                  metrics: {
                    type: "object",
                    properties: {
                      avgRating: {
                        type: "object",
                        properties: {
                          value: { type: "number" },
                          confidence: { type: "string", enum: ["high", "medium", "low"] },
                          comment: { type: "string" },
                        },
                        required: ["value", "confidence", "comment"],
                      },
                      totalReviews: {
                        type: "object",
                        properties: {
                          value: { type: "number" },
                          confidence: { type: "string", enum: ["high", "medium", "low"] },
                          comment: { type: "string" },
                        },
                        required: ["value", "confidence", "comment"],
                      },
                      negativePercent: {
                        type: "object",
                        properties: {
                          value: { type: "number" },
                          confidence: { type: "string", enum: ["high", "medium", "low"] },
                          comment: { type: "string" },
                        },
                        required: ["value", "confidence", "comment"],
                      },
                      googleRanking: {
                        type: "object",
                        properties: {
                          value: { type: "number" },
                          confidence: { type: "string", enum: ["high", "medium", "low"] },
                          comment: { type: "string" },
                        },
                        required: ["value", "confidence", "comment"],
                      },
                      negativePress: {
                        type: "object",
                        properties: {
                          value: { type: "boolean" },
                          confidence: { type: "string", enum: ["high", "medium", "low"] },
                          comment: { type: "string" },
                        },
                        required: ["value", "confidence", "comment"],
                      },
                      glassdoor: {
                        type: "object",
                        properties: {
                          value: { type: "string", enum: ["none", "mild", "strong"] },
                          confidence: { type: "string", enum: ["high", "medium", "low"] },
                          comment: { type: "string" },
                        },
                        required: ["value", "confidence", "comment"],
                      },
                      monthlyTraffic: {
                        type: "object",
                        properties: {
                          value: { type: "number" },
                          confidence: { type: "string", enum: ["high", "medium", "low"] },
                          comment: { type: "string" },
                        },
                        required: ["value", "confidence", "comment"],
                      },
                      conversionRate: {
                        type: "object",
                        properties: {
                          value: { type: "number" },
                          confidence: { type: "string", enum: ["high", "medium", "low"] },
                          comment: { type: "string" },
                        },
                        required: ["value", "confidence", "comment"],
                      },
                      avgDealValue: {
                        type: "object",
                        properties: {
                          value: { type: "number" },
                          confidence: { type: "string", enum: ["high", "medium", "low"] },
                          comment: { type: "string" },
                        },
                        required: ["value", "confidence", "comment"],
                      },
                    },
                    required: [
                      "avgRating", "totalReviews", "negativePercent", "googleRanking",
                      "negativePress", "glassdoor", "monthlyTraffic", "conversionRate", "avgDealValue",
                    ],
                  },
                  summary: { type: "string", description: "Brief overall assessment of the company's reputation" },
                },
                required: ["metrics", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_metrics" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI research failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No research data returned" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
