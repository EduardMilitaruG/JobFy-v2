import { useState, useEffect, useCallback, useRef } from "react";
import type { Job } from "@jobfy/shared";
import * as jobsApi from "../services/jobs.api.js";
import { useDebounce } from "./useDebounce.js";

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 200;
  const abortRef = useRef<AbortController | null>(null);

  const debouncedSearch = useDebounce(search);

  // Reset to first page whenever search or filter changes
  useEffect(() => {
    setOffset(0);
  }, [debouncedSearch, sourceFilter]);

  const refresh = useCallback(async () => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    try {
      const result = await jobsApi.fetchJobs({
        search: debouncedSearch || undefined,
        source: sourceFilter || undefined,
        limit,
        offset,
      });
      setJobs(result.data);
      setTotal(result.total);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError("Failed to load jobs. Check your connection and try again.");
        console.error("Error fetching jobs:", err);
      }
    }
    setLoading(false);
  }, [debouncedSearch, sourceFilter, offset]);

  useEffect(() => {
    refresh();
    return () => abortRef.current?.abort();
  }, [refresh]);

  const handleDelete = async (id: number) => {
    try {
      await jobsApi.deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      setError("Failed to delete job. Please try again.");
      console.error("Error deleting job:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await jobsApi.clearAllJobs();
      setJobs([]);
      setTotal(0);
    } catch (err) {
      setError("Failed to clear jobs. Please try again.");
      console.error("Error clearing jobs:", err);
    }
  };

  return {
    jobs,
    total,
    loading,
    error,
    search,
    setSearch,
    sourceFilter,
    setSourceFilter,
    offset,
    setOffset,
    limit,
    refresh,
    deleteJob: handleDelete,
    clearAll: handleClearAll,
  };
}
