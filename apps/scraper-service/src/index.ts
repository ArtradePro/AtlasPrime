import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { scrapeRouter } from "./api/scrape.js";
import { jobsRouter } from "./api/jobs.js";
import { healthRouter } from "./api/health.js";
import { initializeQueues } from "./jobs/queue.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
  credentials: true,
}));
app.use(morgan("combined"));
app.use(express.json());

// Auth middleware
app.use((req, res, next) => {
  const apiKey = req.headers.authorization?.replace("Bearer ", "");
  
  if (req.path === "/health") {
    return next();
  }

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  next();
});

// Routes
app.use("/health", healthRouter);
app.use("/api/scrape", scrapeRouter);
app.use("/api/jobs", jobsRouter);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
async function start() {
  try {
    await initializeQueues();
    
    app.listen(PORT, () => {
      logger.info(`Scraper service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
