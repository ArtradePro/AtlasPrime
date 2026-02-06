import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import Anthropic from "@anthropic-ai/sdk";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Initialize Anthropic client if API key is available
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export async function POST(request: NextRequest) {
  try {
    const { companyId, companyData } = await request.json();

    if (!companyData && !companyId) {
      return NextResponse.json(
        { error: "Either companyId or companyData is required" },
        { status: 400 },
      );
    }

    // Get company data if only ID provided
    let company = companyData;
    if (companyId && !companyData) {
      company = await convex.query(api.companies.getCompanyById, {
        id: companyId,
      });
    }

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // If Anthropic API is available, use AI for analysis
    if (anthropic) {
      const prompt = `Analyze this business lead and provide an outreach strategy:

Business Name: ${company.name}
Industry: ${company.industry}
Location: ${company.primaryAddress?.city || company.city}, ${company.primaryAddress?.state || company.state}
Years in Business: ${company.yearsInBusiness || "Unknown"}
Website: ${company.website || "None"}
Google Rating: ${company.googleRating || "N/A"} (${company.googleReviewCount || 0} reviews)
Is Chain: ${company.isChain ? "Yes" : "No"}
Total Locations: ${company.totalLocations || 1}

Please provide:
1. Overall quality score (0-100)
2. Best approach angle (the gap or opportunity to address)
3. A compelling opening line for outreach
4. Key personalization hooks
5. Recommended contact method (email, phone, linkedin, or in_person)
6. Urgency level (high, medium, low)

Format your response as JSON with these fields:
{
  "score": number,
  "urgencyLevel": "high" | "medium" | "low",
  "primaryAngle": {
    "gap": "string",
    "impact": "string",
    "openingLine": "string",
    "category": "string"
  },
  "personalizationHooks": ["string"],
  "bestContactMethod": "email" | "phone" | "linkedin" | "in_person",
  "insights": "string"
}`;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const textContent = response.content.find((c) => c.type === "text");
      if (textContent && textContent.type === "text") {
        try {
          const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            return NextResponse.json({
              success: true,
              analysis,
              source: "ai",
            });
          }
        } catch (parseError) {
          console.error("Failed to parse AI response:", parseError);
        }
      }
    }

    // Fallback to rule-based analysis
    const analysis = generateRuleBasedAnalysis(company);
    return NextResponse.json({
      success: true,
      analysis,
      source: "rules",
    });
  } catch (error) {
    console.error("Outreach strategy error:", error);
    return NextResponse.json(
      { error: "Failed to generate outreach strategy" },
      { status: 500 },
    );
  }
}

function generateRuleBasedAnalysis(company: any) {
  let score = 50;
  const personalizationHooks: string[] = [];
  let urgencyLevel: "high" | "medium" | "low" = "medium";
  let bestContactMethod: "email" | "phone" | "linkedin" | "in_person" = "email";

  // Years in business scoring
  if (company.yearsInBusiness) {
    if (company.yearsInBusiness >= 20) score += 15;
    else if (company.yearsInBusiness >= 10) score += 10;
    else if (company.yearsInBusiness >= 5) score += 5;

    if (company.yearsInBusiness >= 10) {
      personalizationHooks.push(
        `Established for ${company.yearsInBusiness} years`,
      );
    }
  }

  // Rating scoring
  if (company.googleRating) {
    if (company.googleRating >= 4.5) score += 15;
    else if (company.googleRating >= 4.0) score += 10;
    else if (company.googleRating >= 3.5) score += 5;

    if (company.googleRating >= 4.0) {
      personalizationHooks.push(
        `Strong ${company.googleRating}-star reputation`,
      );
    }
  }

  // Reviews
  if (company.googleReviewCount && company.googleReviewCount >= 50) {
    score += 10;
    personalizationHooks.push(
      `Active customer engagement with ${company.googleReviewCount} reviews`,
    );
  }

  // Website
  if (company.website) {
    score += 5;
  } else {
    personalizationHooks.push("Missing web presence - growth opportunity");
  }

  // Chain
  if (company.isChain && company.totalLocations > 1) {
    score += 10;
    personalizationHooks.push(
      `Multi-location business with ${company.totalLocations} sites`,
    );
    urgencyLevel = "high";
    bestContactMethod = "phone";
  }

  // Determine urgency
  if (score >= 80) urgencyLevel = "high";
  else if (score >= 60) urgencyLevel = "medium";
  else urgencyLevel = "low";

  // Generate primary angle
  let gap = "Digital marketing optimization";
  let impact = "Increase customer acquisition and retention";
  let openingLine = `I noticed ${company.name} has been serving ${company.primaryAddress?.city || "your community"} for years`;
  let category = "growth";

  if (!company.website) {
    gap = "Missing online presence";
    impact = "Capture 65% of customers who search online before visiting";
    openingLine = `I noticed ${company.name} doesn't have a strong web presence yet`;
    category = "digital-presence";
  } else if (company.googleRating && company.googleRating < 4.0) {
    gap = "Reputation management opportunity";
    impact = "Improve rating to attract more customers";
    openingLine = `I see ${company.name} has room to improve its online reputation`;
    category = "reputation";
  } else if (company.googleReviewCount && company.googleReviewCount < 20) {
    gap = "Review generation opportunity";
    impact = "More reviews = more trust and higher rankings";
    openingLine = `${company.name} has a great rating - let's get more customers to share their experience`;
    category = "reviews";
  }

  return {
    score: Math.min(100, score),
    urgencyLevel,
    primaryAngle: {
      gap,
      impact,
      openingLine,
      category,
    },
    personalizationHooks,
    bestContactMethod,
    insights: `${company.name} is a ${score >= 70 ? "high-value" : score >= 50 ? "moderate" : "developing"} lead. Focus on ${gap.toLowerCase()} to drive engagement.`,
  };
}
