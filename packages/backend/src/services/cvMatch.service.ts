import Groq from "groq-sdk";
import { createRequire } from "module";
import { z } from "zod";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse") as (
  buffer: Buffer,
) => Promise<{ text: string; numpages: number }>;
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import type { CVMatchResponse, JobMatchResult } from "@jobfy/shared";

const client = new Groq({ apiKey: env.GROQ_API_KEY });

const MATCH_JOB_CAP = 80;
const MIN_RESUME_CHARS = 100;

const matchResultSchema = z.array(
  z.object({
    jobId: z.number(),
    score: z.number().min(0).max(100),
    reason: z.string().max(200),
    missingSkills: z.array(z.string().max(40)).max(5),
  }),
);

type JobRow = {
  id: number;
  jobTitle: string;
  company: string;
  location: string;
  tags: string;
};

/** Validates the first 4 bytes are the PDF magic number (%PDF). */
export function isPdf(buffer: Buffer): boolean {
  return buffer.slice(0, 4).toString("ascii") === "%PDF";
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text
    .replace(/\n{3,}/g, "\n\n")
    .slice(0, 3000)
    .trim();
}

export async function matchCVToJobs(
  pdfBuffer: Buffer,
  jobIds: number[],
): Promise<CVMatchResponse & { resumeText: string }> {
  const resumeText = await extractPdfText(pdfBuffer);

  if (resumeText.length < MIN_RESUME_CHARS) {
    throw new Error(
      `Resume text too short (${resumeText.length} chars). Make sure the PDF contains selectable text and is not a scanned image.`,
    );
  }

  return scoreResumeText(resumeText, jobIds);
}

export async function matchCVFromText(
  resumeText: string,
  jobIds: number[],
): Promise<CVMatchResponse & { resumeText: string }> {
  if (!resumeText || resumeText.trim().length < MIN_RESUME_CHARS) {
    throw new Error(
      `Resume text too short (${resumeText.trim().length} chars). Please re-upload your CV.`,
    );
  }

  return scoreResumeText(resumeText, jobIds);
}

async function scoreResumeText(
  resumeText: string,
  jobIds: number[],
): Promise<CVMatchResponse & { resumeText: string }> {
  const idsToQuery = jobIds.slice(0, MATCH_JOB_CAP);
  const truncated = jobIds.length > MATCH_JOB_CAP;

  const jobs = await prisma.job.findMany({
    where: idsToQuery.length > 0 ? { id: { in: idsToQuery } } : undefined,
    orderBy: { createdAt: "desc" },
    take: idsToQuery.length > 0 ? undefined : MATCH_JOB_CAP,
    select: { id: true, jobTitle: true, company: true, tags: true, location: true },
  });

  if (jobs.length === 0) {
    return { results: [], analyzedCount: 0, truncated: false, resumeText };
  }

  const jobList = (jobs as JobRow[])
    .map(
      (j) =>
        `[${j.id}] ${j.jobTitle} at ${j.company} (${j.location}) | skills: ${j.tags || "N/A"}`,
    )
    .join("\n");

  let rawContent: string;
  try {
    const message = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 4096,
      // temperature: 0 → deterministic output — same CV + same jobs always produces same scores
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `You are a resume-to-job matcher. Score each job 0-100 based on how well the resume matches.
Respond ONLY with a valid JSON array. No markdown, no explanation, just the array.
Each element must have: {"jobId": number, "score": number, "reason": string, "missingSkills": string[]}
- score: 0=no match, 100=perfect match
- reason: max 120 characters, specific to this job
- missingSkills: max 5 short skill names the resume lacks for this job`,
        },
        {
          role: "user",
          content: `RESUME:\n${resumeText}\n\nJOBS:\n${jobList}\n\nScore each job and return the JSON array.`,
        },
      ],
    });
    rawContent = message.choices[0]?.message?.content ?? "";
  } catch (err) {
    logger.error(err, "Groq API call failed during CV matching");
    throw new Error(
      "AI scoring service is temporarily unavailable. Please try again in a moment.",
    );
  }

  const jsonText = rawContent
    .trim()
    .replace(/^```json?\n?/, "")
    .replace(/\n?```$/, "");

  let parsed: z.infer<typeof matchResultSchema>;
  try {
    parsed = matchResultSchema.parse(JSON.parse(jsonText));
  } catch (err) {
    logger.error({ rawContent, err }, "Failed to parse LLM matching response");
    throw new Error("AI returned an unexpected response format. Please try again.");
  }

  const validIds = new Set((jobs as JobRow[]).map((j) => j.id));
  const results: JobMatchResult[] = parsed
    .filter((r) => validIds.has(r.jobId))
    .sort((a, b) => b.score - a.score);

  return {
    results,
    analyzedCount: jobs.length,
    truncated,
    resumeText,
  };
}

export async function generateCoverLetter(
  resumeText: string,
  jobId: number,
): Promise<string> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { jobTitle: true, company: true, location: true, tags: true },
  });

  if (!job) throw new Error("Job not found");

  let content: string;
  try {
    const message = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are an expert cover letter writer. Write professional, personalized cover letters that stand out.`,
        },
        {
          role: "user",
          content: `Write a cover letter for this job application. Keep it under 300 words, 3 paragraphs.

RESUME:
${resumeText}

JOB:
Title: ${job.jobTitle}
Company: ${job.company}
Location: ${job.location}
Skills required: ${job.tags || "Not specified"}

Guidelines:
- Be specific to this company and role
- Reference 2-3 skills from the resume that match this job
- First paragraph: genuine excitement for the role and company
- Second paragraph: your most relevant experience and skills
- Third paragraph: brief closing with call to action
- No clichés like "I am writing to express my interest"
- Professional but genuine tone`,
        },
      ],
    });
    content = message.choices[0]?.message?.content ?? "";
  } catch (err) {
    logger.error(err, "Groq API call failed during cover letter generation");
    throw new Error(
      "AI writing service is temporarily unavailable. Please try again.",
    );
  }

  return content.trim();
}
