import { useState, useEffect, useCallback } from "react";
import type { Job } from "@jobfy/shared";
import * as jobsApi from "../services/jobs.api.js";
import { useDebounce } from "./useDebounce.js";

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 200;

  const debouncedSearch = useDebounce(search);

  const refresh = useCallback(async () => {
    setLoading(true);
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
      console.error("Error fetching jobs:", err);
    }
    setLoading(false);
  }, [debouncedSearch, sourceFilter, offset]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = async (id: number) => {
    try {
      await jobsApi.deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await jobsApi.clearAllJobs();
      setJobs([]);
      setTotal(0);
    } catch (err) {
      console.error("Error clearing jobs:", err);
    }
  };

  return {
    jobs,
    total,
    loading,
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
