import { useState, useEffect } from "react";
import type { Job, JobMatchResult } from "@jobfy/shared";
import * as cvMatchApi from "../services/cvMatch.api.js";

export interface ScoredJob extends Job {
  score: number;
  reason: string;
  missingSkills: string[];
}

// ── sessionStorage keys ──────────────────────────────────────────────────────
const KEY_TEXT = "jobfy:resumeText";
const KEY_NAME = "jobfy:resumeFileName";
const KEY_CACHE = "jobfy:matchResultsCache";

// ── Cache key helpers ────────────────────────────────────────────────────────

/** djb2-style hash (fast, good enough for a cache key). */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h;
}

/** Stable key: hash of first 500 chars of resume + sorted job IDs. */
function buildCacheKey(resumeText: string, jobIds: number[]): string {
  const textHash = hashString(resumeText.slice(0, 500));
  const idsKey = [...jobIds].sort((a, b) => a - b).join(",");
  return `${textHash}:${idsKey}`;
}

interface CacheEntry {
  key: string;
  scoredJobs: ScoredJob[];
  analyzedCount: number;
  truncated: boolean;
}

function readCache(): CacheEntry | null {
  try {
    const raw = sessionStorage.getItem(KEY_CACHE);
    return raw ? (JSON.parse(raw) as CacheEntry) : null;
  } catch {
    return null;
  }
}

function writeCache(entry: CacheEntry): void {
  try {
    sessionStorage.setItem(KEY_CACHE, JSON.stringify(entry));
  } catch {
    // storage quota — silently skip
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useCVMatch(jobs: Job[]) {
  const [file, setFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoredJobs, setScoredJobs] = useState<ScoredJob[] | null>(null);
  const [analyzedCount, setAnalyzedCount] = useState(0);
  const [truncated, setTruncated] = useState(false);
  const [resumeText, setResumeText] = useState<string>("");
  const [coverLetters, setCoverLetters] = useState<Map<number, string>>(new Map());
  const [coverLetterLoading, setCoverLetterLoading] = useState<Set<number>>(new Set());

  // ── Restore from sessionStorage on mount ──────────────────────────────────
  useEffect(() => {
    const storedText = sessionStorage.getItem(KEY_TEXT) ?? "";
    const storedName = sessionStorage.getItem(KEY_NAME) ?? "";
    if (!storedText) return;

    setResumeText(storedText);
    setResumeFileName(storedName);

    // Restore cached scored results if the key still matches current jobs
    const cache = readCache();
    if (cache) {
      const currentKey = buildCacheKey(storedText, jobs.map((j) => j.id));
      if (cache.key === currentKey) {
        setScoredJobs(cache.scoredJobs);
        setAnalyzedCount(cache.analyzedCount);
        setTruncated(cache.truncated);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally runs once — jobs list is not stable on first render

  // ── Helpers ───────────────────────────────────────────────────────────────

  function applyResults(
    text: string,
    response: { results: JobMatchResult[]; analyzedCount: number; truncated: boolean },
  ) {
    const jobMap = new Map(jobs.map((j) => [j.id, j]));
    const merged: ScoredJob[] = response.results
      .filter((r) => jobMap.has(r.jobId))
      .map((r) => ({
        ...jobMap.get(r.jobId)!,
        score: r.score,
        reason: r.reason,
        missingSkills: r.missingSkills,
      }));

    setScoredJobs(merged);
    setAnalyzedCount(response.analyzedCount);
    setTruncated(response.truncated);
    setCoverLetters(new Map());

    // Persist results cache
    const cacheKey = buildCacheKey(text, jobs.map((j) => j.id));
    writeCache({ key: cacheKey, scoredJobs: merged, analyzedCount: response.analyzedCount, truncated: response.truncated });
  }

  // ── analyze ───────────────────────────────────────────────────────────────

  const analyze = async () => {
    const jobIds = jobs.map((j) => j.id);

    // Check cache first — skip the LLM call if nothing changed
    if (resumeText && !file) {
      const cache = readCache();
      if (cache && cache.key === buildCacheKey(resumeText, jobIds)) {
        setScoredJobs(cache.scoredJobs);
        setAnalyzedCount(cache.analyzedCount);
        setTruncated(cache.truncated);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setScoredJobs(null);

    try {
      let response: { results: JobMatchResult[]; analyzedCount: number; truncated: boolean; resumeText: string };

      if (file) {
        // New PDF uploaded — extract text server-side
        response = await cvMatchApi.matchCV(file, jobIds);
        const newText = response.resumeText;
        const newName = file.name;

        setResumeText(newText);
        setResumeFileName(newName);
        sessionStorage.setItem(KEY_TEXT, newText);
        sessionStorage.setItem(KEY_NAME, newName);
      } else if (resumeText) {
        // Re-analyze using already-extracted text (no re-upload needed)
        response = await cvMatchApi.matchCVFromText(resumeText, jobIds);
      } else {
        setError("Please upload a CV PDF first.");
        setLoading(false);
        return;
      }

      applyResults(response.resumeText ?? resumeText, response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    }

    setLoading(false);
  };

  // ── clearResume ───────────────────────────────────────────────────────────

  const clearResume = () => {
    setFile(null);
    setResumeText("");
    setResumeFileName("");
    setScoredJobs(null);
    setAnalyzedCount(0);
    setTruncated(false);
    setError(null);
    setCoverLetters(new Map());
    sessionStorage.removeItem(KEY_TEXT);
    sessionStorage.removeItem(KEY_NAME);
    sessionStorage.removeItem(KEY_CACHE);
  };

  // ── getCoverLetter / regenerateCoverLetter ────────────────────────────────

  const getCoverLetter = async (jobId: number) => {
    // Skip if already generated
    if (coverLetters.has(jobId) || coverLetterLoading.has(jobId)) return;
    await _fetchCoverLetter(jobId);
  };

  const regenerateCoverLetter = async (jobId: number) => {
    if (coverLetterLoading.has(jobId)) return;
    // Clear existing so UI shows loading state
    setCoverLetters((prev) => {
      const next = new Map(prev);
      next.delete(jobId);
      return next;
    });
    await _fetchCoverLetter(jobId);
  };

  async function _fetchCoverLetter(jobId: number) {
    const text = resumeText || sessionStorage.getItem(KEY_TEXT) || "";
    if (!text) return;

    setCoverLetterLoading((prev) => new Set(prev).add(jobId));
    try {
      const { coverLetter } = await cvMatchApi.generateCoverLetter(text, jobId);
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
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  /** True when the user can press Analyze (has a new file OR a stored resume). */
  const canAnalyze = !loading && (file !== null || resumeText.length > 0);

  return {
    file,
    setFile,
    resumeFileName,
    loading,
    error,
    scoredJobs,
    analyzedCount,
    truncated,
    analyze,
    canAnalyze,
    clearResume,
    coverLetters,
    coverLetterLoading,
    getCoverLetter,
    regenerateCoverLetter,
  };
}
