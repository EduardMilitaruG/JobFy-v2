import { useState, useEffect, useCallback } from "react";
import type { StatsResponse } from "@jobfy/shared";
import { fetchStats } from "../services/stats.api.js";

export function useStats() {
  const [stats, setStats] = useState<StatsResponse | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchStats();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, refresh };
}
