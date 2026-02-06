import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// POST /api/ai/score - Score a single lead
export async function POST(request: NextRequest) {
  try {
    const { companyId, action } = await request.json();

    if (action === "batch") {
      // Batch score all leads
      const organizations = await convex.query(api.analytics.getOrganizations);
      if (!organizations || organizations.length === 0) {
        return NextResponse.json(
          { error: "No organization found" },
          { status: 404 },
        );
      }

      const result = await convex.mutation(api.leadScoring.batchScoreLeads, {
        organizationId: organizations[0]._id,
        limit: 100,
      });

      return NextResponse.json({
        success: true,
        message: `Scored ${result.scored} leads`,
        results: result.results,
      });
    }

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 },
      );
    }

    const result = await convex.mutation(api.leadScoring.calculateLeadScore, {
      companyId: companyId as Id<"companies">,
    });

    return NextResponse.json({
      success: true,
      score: result.score,
      factors: result.factors,
      insights: result.insights,
    });
  } catch (error) {
    console.error("AI scoring error:", error);
    return NextResponse.json(
      { error: "Failed to score lead" },
      { status: 500 },
    );
  }
}

// GET /api/ai/score - Get leads by score
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const minScore = searchParams.get("minScore");
    const limit = searchParams.get("limit");

    const organizations = await convex.query(api.analytics.getOrganizations);
    if (!organizations || organizations.length === 0) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 404 },
      );
    }

    const leads = await convex.query(api.leadScoring.getLeadsByScore, {
      organizationId: organizations[0]._id,
      minScore: minScore ? parseInt(minScore) : undefined,
      limit: limit ? parseInt(limit) : 50,
    });

    return NextResponse.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error("Error fetching scored leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch scored leads" },
      { status: 500 },
    );
  }
}
