import { NextRequest, NextResponse } from "next/server";

// Dynamic import for Anthropic to handle TypeScript issues
let anthropic: any = null;

async function getAnthropicClient() {
  if (!anthropic && process.env.ANTHROPIC_API_KEY) {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropic;
}

interface LeadData {
  name: string;
  industry: string;
  yearsInBusiness: number;
  city: string;
  state: string;
  website?: string;
  googleRating?: number;
  googleReviewCount?: number;
  isChain?: boolean;
  totalLocations?: number;
}

export async function POST(request: NextRequest) {
  try {
    const lead: LeadData = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      // Return mock analysis if no API key
      return NextResponse.json({
        score: Math.floor(Math.random() * 30) + 70,
        summary: `${lead.name} is a ${lead.yearsInBusiness}-year-old ${lead.industry} business based in ${lead.city}, ${lead.state}. With ${lead.googleReviewCount || 0} reviews and a ${lead.googleRating || 0} rating, this business shows strong local presence.`,
        strengths: [
          `${lead.yearsInBusiness}+ years of business stability`,
          "Strong local market presence",
          lead.googleRating && lead.googleRating >= 4
            ? "Excellent customer satisfaction"
            : "Room for reputation improvement",
        ],
        weaknesses: [
          "Limited digital marketing presence",
          "No visible paid advertising strategy",
          "Website needs modernization",
        ],
        opportunities: [
          "Local SEO optimization",
          "Social media advertising",
          "Email marketing automation",
          lead.isChain
            ? "Multi-location marketing synergy"
            : "Single-location focused campaigns",
        ],
        recommendedActions: [
          {
            action: "Schedule discovery call",
            priority: "high",
            timeline: "This week",
          },
          {
            action: "Prepare competitor analysis",
            priority: "medium",
            timeline: "Before call",
          },
          {
            action: "Draft custom proposal",
            priority: "medium",
            timeline: "After call",
          },
        ],
        outreachAngle: {
          openingLine: `I noticed ${lead.name} has been serving ${lead.city} for ${lead.yearsInBusiness} years with an impressive ${lead.googleRating} rating - that's exactly the kind of established business we help dominate local search.`,
          painPoint:
            "Your competitors are likely outspending you on digital ads while you rely on word-of-mouth.",
          valueProposition:
            "We help established businesses like yours capture the 70% of customers who search online before visiting.",
        },
      });
    }

    const prompt = `Analyze this business lead for a B2B sales team. Provide a detailed analysis in JSON format.

Business Information:
- Name: ${lead.name}
- Industry: ${lead.industry}
- Years in Business: ${lead.yearsInBusiness}
- Location: ${lead.city}, ${lead.state}
- Website: ${lead.website || "Not provided"}
- Google Rating: ${lead.googleRating || "Unknown"}/5
- Google Reviews: ${lead.googleReviewCount || "Unknown"}
- Is Chain: ${lead.isChain ? `Yes (${lead.totalLocations} locations)` : "No"}

Please provide your analysis in this exact JSON structure:
{
  "score": <number 1-100 representing lead quality>,
  "summary": "<2-3 sentence summary of the business and opportunity>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "opportunities": ["<opportunity 1>", "<opportunity 2>", "<opportunity 3>", "<opportunity 4>"],
  "recommendedActions": [
    {"action": "<action>", "priority": "high|medium|low", "timeline": "<timeline>"},
    {"action": "<action>", "priority": "high|medium|low", "timeline": "<timeline>"},
    {"action": "<action>", "priority": "high|medium|low", "timeline": "<timeline>"}
  ],
  "outreachAngle": {
    "openingLine": "<personalized opening line for cold outreach>",
    "painPoint": "<the main pain point to address>",
    "valueProposition": "<your value proposition for this lead>"
  }
}

Focus on actionable insights for a marketing/advertising agency selling digital marketing services.`;

    const client = await getAnthropicClient();
    if (!client) {
      throw new Error("Anthropic client not initialized");
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    // Extract text content
    const textContent = message.content.find(
      (c: { type: string }) => c.type === "text",
    );
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    // Parse the JSON response
    const jsonMatch = (
      textContent as { type: "text"; text: string }
    ).text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response as JSON");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze lead" },
      { status: 500 },
    );
  }
}
