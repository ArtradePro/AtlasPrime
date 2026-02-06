import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      query,
      location,
      radius,
      filters,
      maxResults,
      findEmails,
      organizationId,
    } = body;

    // Validate request
    if (!type) {
      return NextResponse.json(
        { error: "Missing required field: type" },
        { status: 400 },
      );
    }

    const scraperServiceUrl = process.env.SCRAPER_SERVICE_URL;

    if (!scraperServiceUrl) {
      return NextResponse.json(
        { error: "Scraper service URL not configured" },
        { status: 500 },
      );
    }

    // Build params for scraper service based on type
    let params: Record<string, unknown> = {};

    if (type === "google_maps") {
      params = {
        query: query || "",
        location: location,
        maxResults: maxResults || 100,
      };
    } else if (type === "linkedin") {
      params = {
        keywords: query || "",
        location: location,
        maxResults: maxResults || 50,
      };
    } else if (type === "email_finder") {
      params = {
        companyName: query || "",
      };
    } else if (type === "ad_intelligence") {
      params = {
        domain: query || "",
        platform: "all",
      };
    }

    // Build webhook URL for the scraper to call back
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3005";
    const webhookUrl = `${baseUrl}/api/webhook`;

    // Forward request to scraper service
    const response = await fetch(`${scraperServiceUrl}/api/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SCRAPER_API_KEY}`,
      },
      body: JSON.stringify({
        type,
        params,
        organizationId: organizationId || "demo_org_atlas_prime",
        webhookUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Scraper service error: ${error}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Scrape API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { error: "Missing jobId parameter" },
        { status: 400 },
      );
    }

    const scraperServiceUrl = process.env.SCRAPER_SERVICE_URL;

    if (!scraperServiceUrl) {
      return NextResponse.json(
        { error: "Scraper service URL not configured" },
        { status: 500 },
      );
    }

    // Get job status from scraper service
    const response = await fetch(`${scraperServiceUrl}/api/jobs/${jobId}`, {
      headers: {
        Authorization: `Bearer ${process.env.SCRAPER_API_KEY}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch job status" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Scrape status API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
