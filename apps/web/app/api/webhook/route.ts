import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import crypto from "crypto";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

function verifySignature(signature: string, payload: string): boolean {
  const secret = process.env.WEBHOOK_SECRET;

  if (!secret) {
    console.warn(
      "WEBHOOK_SECRET not configured - skipping verification in development",
    );
    return true; // Skip verification in development
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}

export async function POST(request: NextRequest) {
  try {
    // Read body once as text for signature verification
    const rawBody = await request.text();

    // Verify webhook signature
    const signature = request.headers.get("x-webhook-signature");
    if (signature && !verifySignature(signature, rawBody)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 },
      );
    }

    // Parse the body as JSON
    const body = JSON.parse(rawBody);
    const { event, data } = body;

    switch (event) {
      case "job.completed":
        // Store scraped companies
        if (data.companies && data.companies.length > 0) {
          let savedCount = 0;
          for (const company of data.companies) {
            try {
              await convex.mutation(api.companies.createFromWebhook, {
                name: company.name,
                industry: company.category || company.industry,
                website: company.website,
                phone: company.phone,
                email: company.email,
                address: company.address,
                city: company.city,
                state: company.state,
                country: company.country,
                source: data.source,
                sourceUrl: company.sourceUrl,
                rating: company.rating,
                reviewCount: company.reviewCount,
              });
              savedCount++;
            } catch (err) {
              console.error("Failed to save company:", company.name, err);
            }
          }
          console.log(
            `Saved ${savedCount}/${data.companies.length} companies to Convex`,
          );
        }
        break;

      case "job.failed":
        await convex.mutation(api.scraperJobs.updateJob, {
          id: data.jobId,
          status: "failed",
          error: data.error,
        });
        break;

      case "job.progress":
        await convex.mutation(api.scraperJobs.updateJob, {
          id: data.jobId,
          progress: data.progress,
        });
        break;

      default:
        console.warn("Unknown webhook event:", event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
