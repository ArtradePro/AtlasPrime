import { logger } from "../utils/logger.js";
import { GoogleMapsScraper } from "../scrapers/google-maps.js";
import { LinkedInScraper } from "../scrapers/linkedin.js";
import { EmailFinderScraper } from "../scrapers/email-finder.js";
import { AdIntelligenceScraper } from "../scrapers/ad-intelligence.js";
import axios from "axios";

// In-memory job storage for development (use Redis/BullMQ in production)
const jobStorage = new Map<string, any>();
const pendingJobs: Array<{ jobId: string; type: string; data: any }> = [];
let isProcessing = false;

export async function initializeQueues() {
  logger.info("Job queue initialized (in-memory mode for development)");
  // Start processing loop
  processJobs();
}

async function processJobs() {
  if (isProcessing) return;
  isProcessing = true;

  while (true) {
    const job = pendingJobs.shift();
    if (!job) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }

    const { jobId, type, data } = job;
    const { params, webhookUrl, organizationId } = data;

    logger.info(`Processing job ${jobId}`, { type, params });

    try {
      let results;

      switch (type) {
        case "google_maps":
          const gmapsScraper = new GoogleMapsScraper();
          results = await gmapsScraper.scrape(params);
          break;

        case "linkedin":
          const linkedinScraper = new LinkedInScraper();
          results = await linkedinScraper.scrape(params);
          break;

        case "email_finder":
          const emailFinder = new EmailFinderScraper();
          results = await emailFinder.scrape(params);
          break;

        case "ad_intelligence":
          const adIntel = new AdIntelligenceScraper();
          results = await adIntel.scrape(params);
          break;

        default:
          throw new Error(`Unknown scraper type: ${type}`);
      }

      // Store results
      jobStorage.set(jobId, {
        status: "completed",
        results,
        completedAt: new Date().toISOString(),
      });

      // Send webhook if configured
      if (webhookUrl) {
        await sendWebhook(webhookUrl, {
          event: "job.completed",
          data: {
            jobId,
            source: type,
            organizationId,
            resultsCount: results.length,
            companies: results,
          },
        });
      }

      logger.info(`Job ${jobId} completed`, { resultsCount: results.length });
    } catch (error) {
      logger.error(`Job ${jobId} failed:`, error);

      jobStorage.set(jobId, {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        failedAt: new Date().toISOString(),
      });

      if (webhookUrl) {
        await sendWebhook(webhookUrl, {
          event: "job.failed",
          data: {
            jobId,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
    }
  }
}

export async function addJob(type: string, data: any) {
  jobStorage.set(data.jobId, {
    status: "queued",
    type,
    createdAt: new Date().toISOString(),
  });

  pendingJobs.push({ jobId: data.jobId, type, data });
  logger.info(`Job ${data.jobId} queued`, { type });

  return { id: data.jobId };
}

export async function getJobStatus(jobId: string) {
  const stored = jobStorage.get(jobId);
  if (!stored) return null;

  return stored;
}

export async function getJobResults(jobId: string) {
  const stored = jobStorage.get(jobId);
  return stored?.results || null;
}

async function sendWebhook(url: string, data: any) {
  try {
    const crypto = await import("crypto");
    const payload = JSON.stringify(data);
    const signature = crypto
      .createHmac("sha256", process.env.WEBHOOK_SECRET || "")
      .update(payload)
      .digest("hex");

    await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
      },
      timeout: 10000,
    });
  } catch (error) {
    logger.error("Failed to send webhook:", error);
  }
}
