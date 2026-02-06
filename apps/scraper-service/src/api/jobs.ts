import { Router } from "express";
import { getJobStatus, getJobResults } from "../jobs/queue.js";

export const jobsRouter = Router();

jobsRouter.get("/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = await getJobStatus(jobId);

    if (!status) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(status);
  } catch (error) {
    console.error("Failed to get job status:", error);
    res.status(500).json({ error: "Failed to get job status" });
  }
});

jobsRouter.get("/:jobId/results", async (req, res) => {
  try {
    const { jobId } = req.params;
    const results = await getJobResults(jobId);

    if (!results) {
      return res.status(404).json({ error: "Results not found" });
    }

    res.json(results);
  } catch (error) {
    console.error("Failed to get job results:", error);
    res.status(500).json({ error: "Failed to get job results" });
  }
});
