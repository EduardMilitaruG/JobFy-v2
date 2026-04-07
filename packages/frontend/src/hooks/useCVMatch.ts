import { useState } from "react";
import type { Job, JobMatchResult } from "@jobfy/shared";
import * as cvMatchApi from "../services/cvMatch.api.js";

export interface ScoredJob extends Job {
  score: number;
  reason: string;
  missingSkills: string[];
}

export function useCVMatch(jobs: Job[]) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoredJobs, setScoredJobs] = useState<ScoredJob[] | null>(null);
  const [analyzedCount, setAnalyzedCount] = useState(0);
  const [truncated, setTruncated] = useState(false);
  const [resumeText, setResumeText] = useState<string>("");
  const [coverLetters, setCoverLetters] = useState<Map<number, string>>(new Map());
  const [coverLetterLoading, setCoverLetterLoading] = useState<Set<number>>(new Set());

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setScoredJobs(null);
    setCoverLetters(new Map());
    try {
      const jobIds = jobs.map((j) => j.id);
      const response = await cvMatchApi.matchCV(file, jobIds);

      setResumeText(response.resumeText);
      setAnalyzedCount(response.analyzedCount);
      setTruncated(response.truncated);

      const jobMap = new Map(jobs.map((j) => [j.id, j]));
      const merged: ScoredJob[] = (response.results as JobMatchResult[])
        .filter((r) => jobMap.has(r.jobId))
        .map((r) => ({
          ...jobMap.get(r.jobId)!,
          score: r.score,
          reason: r.reason,
          missingSkills: r.missingSkills,
        }));

      setScoredJobs(merged);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    }
    setLoading(false);
  };

  const getCoverLetter = async (jobId: number) => {
    if (!resumeText || coverLetterLoading.has(jobId)) return;

    setCoverLetterLoading((prev) => new Set(prev).add(jobId));
    try {
      const { coverLetter } = await cvMatchApi.generateCoverLetter(resumeText, jobId);
      setCoverLetters((prev) => new Map(prev).set(jobId, coverLetter));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate cover letter.");
    } finally {
      setCoverLetterLoading((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  return {
    file,
    setFile,
    loading,
    error,
    scoredJobs,
    analyzedCount,
    truncated,
    analyze,
    coverLetters,
    coverLetterLoading,
    getCoverLetter,
  };
}
