import type { StatsResponse } from "@jobfy/shared";
import { apiFetch } from "./api.js";

export function fetchStats(): Promise<StatsResponse> {
  return apiFetch("/api/stats");
}
