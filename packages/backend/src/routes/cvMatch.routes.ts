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

const router = Router();

router.post("/", upload.single("resume"), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "PDF file required" });
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
    next(err);
  }
});

router.post("/cover-letter", async (req, res, next) => {
  try {
    const { resumeText, jobId } = coverLetterSchema.parse(req.body);
    const coverLetter = await cvMatchService.generateCoverLetter(resumeText, jobId);
    res.json({ coverLetter });
  } catch (err) {
    next(err);
  }
});

export default router;
