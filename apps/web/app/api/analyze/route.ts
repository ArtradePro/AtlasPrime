import { NextRequest, NextResponse } from "next/server";

// Anthropic API client using fetch for more reliable compatibility
async function callAnthropic(systemPrompt: string, userPrompt: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Anthropic API key not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: "Missing required fields: type, data" },
        { status: 400 },
      );
    }

    let prompt = "";
    let systemPrompt = "";

    switch (type) {
      case "lead_scoring":
        systemPrompt = `You are an expert lead scoring analyst. Analyze the provided company data and return a JSON object with:
- score (0-100): Overall lead quality score
- factors: Array of factors that influenced the score
- recommendations: Array of recommended next steps
- priority: "high" | "medium" | "low"`;
        prompt = `Analyze this lead for quality scoring:\n${JSON.stringify(data, null, 2)}`;
        break;

      case "market_analysis":
        systemPrompt = `You are a market research analyst. Analyze the provided market data and return insights about:
- Market trends
- Competitive landscape
- Opportunities
- Risks`;
        prompt = `Perform market analysis on:\n${JSON.stringify(data, null, 2)}`;
        break;

      case "campaign_optimization":
        systemPrompt = `You are a marketing optimization specialist. Analyze campaign performance and provide:
- Performance summary
- Areas for improvement
- A/B testing suggestions
- Budget allocation recommendations`;
        prompt = `Optimize this campaign:\n${JSON.stringify(data, null, 2)}`;
        break;

      case "competitor_analysis":
        systemPrompt = `You are a competitive intelligence analyst. Analyze competitor data and provide:
- Strengths and weaknesses
- Market positioning
- Differentiation opportunities
- Threat assessment`;
        prompt = `Analyze these competitors:\n${JSON.stringify(data, null, 2)}`;
        break;

      case "outreach_strategy":
        systemPrompt = `You are an elite B2B sales strategist who specializes in identifying specific, actionable reasons to contact businesses. Your job is NOT to simply score leads - it's to give sales reps a compelling "door opener" that demonstrates immediate value.

You analyze a company's digital presence, market position, and competitive gaps to identify:
1. What they're MISSING (opportunities)
2. What competitors are doing that they're not
3. Specific, time-sensitive reasons to reach out NOW

Your insights must be:
- SPECIFIC (not generic like "improve your marketing")
- ACTIONABLE (something they can do this week)
- VALUE-DRIVEN (quantify the opportunity when possible)
- PERSONALIZED (reference their actual data)

Return a JSON object with:
- urgencyLevel: "high" | "medium" | "low"
- primaryAngle: { gap: string, impact: string, openingLine: string, estimatedValue: string, category: string }
- alternativeAngles: array of backup approaches
- personalizationHooks: specific details to reference
- bestContactMethod: "email" | "phone" | "linkedin" | "in_person"
- doNotContact: boolean (true if no compelling reason exists)
- doNotContactReason: string (if applicable)

Categories: digital_transformation, competitive_threat, missed_revenue, reputation_risk, efficiency_gain, market_expansion`;
        prompt = `Generate a specific outreach strategy for this business:

${JSON.stringify(data, null, 2)}

Focus on gaps that create urgency. Give me opening lines that a sales rep can use TODAY.`;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid analysis type" },
          { status: 400 },
        );
    }

    const response = await callAnthropic(systemPrompt, prompt);

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { error: "Unexpected response format" },
        { status: 500 },
      );
    }

    // Try to parse as JSON, otherwise return as text
    let result;
    try {
      result = JSON.parse(content.text);
    } catch {
      result = { analysis: content.text };
    }

    return NextResponse.json({
      type,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Analysis API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
