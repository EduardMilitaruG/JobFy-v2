import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import * as cvMatchService from "../services/cvMatch.service.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are accepted"));
    }
  },
});

const coverLetterSchema = z.object({
  resumeText: z.string().min(1),
  jobId: z.coerce.number().int().positive(),
});

const matchFromTextSchema = z.object({
  resumeText: z.string().min(1),
  jobIds: z.array(z.number().int().positive()).optional().default([]),
});

const router = Router();

router.post("/", upload.single("resume"), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "PDF file required" });
      return;
    }

    // Validate PDF magic bytes — MIME type alone can be spoofed
    if (!cvMatchService.isPdf(req.file.buffer)) {
      res.status(400).json({ error: "Uploaded file does not appear to be a valid PDF" });
      return;
    }

    let jobIds: number[] = [];
    if (req.body.jobIds) {
      try {
        jobIds = z.array(z.number()).parse(JSON.parse(req.body.jobIds));
      } catch {
        jobIds = [];
      }
    }

    const result = await cvMatchService.matchCVToJobs(req.file.buffer, jobIds);
    res.json(result);
  } catch (err) {
    // Propagate operational errors with their message so the frontend can show them
    if (err instanceof Error) {
      const operationalPrefixes = [
        "Resume text too short",
        "AI scoring service",
        "AI returned an unexpected",
      ];
      if (operationalPrefixes.some((p) => err.message.startsWith(p))) {
        res.status(422).json({ error: err.message });
        return;
      }
    }
    next(err);
  }
});

router.post("/from-text", async (req, res, next) => {
  try {
    const { resumeText, jobIds } = matchFromTextSchema.parse(req.body);
    const result = await cvMatchService.matchCVFromText(resumeText, jobIds);
    res.json(result);
  } catch (err) {
    if (err instanceof Error) {
      const operationalPrefixes = ["Resume text too short", "AI scoring service", "AI returned an unexpected"];
      if (operationalPrefixes.some((p) => err.message.startsWith(p))) {
        res.status(422).json({ error: err.message });
        return;
      }
    }
    next(err);
  }
});

router.post("/cover-letter", async (req, res, next) => {
  try {
    const { resumeText, jobId } = coverLetterSchema.parse(req.body);
    const coverLetter = await cvMatchService.generateCoverLetter(resumeText, jobId);
    res.json({ coverLetter });
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("AI writing service")) {
      res.status(422).json({ error: err.message });
      return;
    }
    next(err);
  }
});

export default router;
