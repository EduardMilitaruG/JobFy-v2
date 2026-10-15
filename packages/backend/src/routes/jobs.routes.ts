import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { jobQuerySchema } from "@jobfy/shared";
import { validateParams, validateQuery } from "../middleware/validateRequest.js";
import * as jobsService from "../services/jobs.service.js";

const router = Router();

const jobIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

router.get("/", validateQuery(jobQuerySchema), async (req, res, next) => {
  try {
    const result = await jobsService.getJobs(req.query as never);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", validateParams(jobIdParamsSchema), async (req, res, next) => {
  try {
    const job = await jobsService.getJobById(Number(req.params.id));
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    res.json(job);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", validateParams(jobIdParamsSchema), async (req, res, next) => {
  try {
    await jobsService.deleteJob(Number(req.params.id));
    res.json({ message: "Job deleted", id: Number(req.params.id) });
  } catch (err) {
    // P2025: the record to delete does not exist
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    next(err);
  }
});

router.delete("/", async (_req, res, next) => {
  try {
    const count = await jobsService.clearAllJobs();
    res.json({ message: `Deleted ${count} jobs` });
  } catch (err) {
    next(err);
  }
});

export default router;
