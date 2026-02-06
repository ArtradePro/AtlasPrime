import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { addJob } from "../jobs/queue.js";
import { logger } from "../utils/logger.js";
import { z } from "zod";

export const scrapeRouter = Router();

const GoogleMapsSchema = z.object({
  query: z.string(),
  location: z.string().optional(),
  maxResults: z.number().min(1).max(500).default(100),
});

const LinkedInSchema = z.object({
  keywords: z.string(),
  location: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  maxResults: z.number().min(1).max(100).default(50),
});

const EmailFinderSchema = z.object({
  companyName: z.string(),
  domain: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const AdIntelligenceSchema = z.object({
  domain: z.string(),
  platform: z.enum(["google", "facebook", "all"]).default("all"),
});

const ScrapeRequestSchema = z.object({
  type: z.enum(["google_maps", "linkedin", "email_finder", "ad_intelligence"]),
  params: z.record(z.any()),
  webhookUrl: z.string().url().optional(),
  organizationId: z.string(),
});

scrapeRouter.post("/", async (req, res) => {
  try {
    const { type, params, webhookUrl, organizationId } = ScrapeRequestSchema.parse(req.body);

    // Validate params based on type
    let validatedParams;
    switch (type) {
      case "google_maps":
        validatedParams = GoogleMapsSchema.parse(params);
        break;
      case "linkedin":
        validatedParams = LinkedInSchema.parse(params);
        break;
      case "email_finder":
        validatedParams = EmailFinderSchema.parse(params);
        break;
      case "ad_intelligence":
        validatedParams = AdIntelligenceSchema.parse(params);
        break;
    }

    const jobId = uuidv4();

    await addJob(type, {
      jobId,
      params: validatedParams,
      webhookUrl,
      organizationId,
    });

    logger.info(`Created scrape job: ${jobId}`, { type, params: validatedParams });

    res.json({
      jobId,
      status: "queued",
      type,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }

    logger.error("Failed to create scrape job:", error);
    res.status(500).json({ error: "Failed to create scrape job" });
  }
});
