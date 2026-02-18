import type { Job, PaginatedResponse } from "@jobfy/shared";
import { apiFetch } from "./api.js";

interface JobsResponse extends PaginatedResponse<Job> {}

export function fetchJobs(params: {
  search?: string;
  source?: string;
  limit?: number;
  offset?: number;
}): Promise<JobsResponse> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.source) qs.set("source", params.source);
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.offset) qs.set("offset", String(params.offset));
  return apiFetch(`/api/jobs?${qs}`);
}

export function fetchJob(id: number): Promise<Job> {
  return apiFetch(`/api/jobs/${id}`);
}

export function deleteJob(id: number): Promise<{ message: string }> {
  return apiFetch(`/api/jobs/${id}`, { method: "DELETE" });
}

export function clearAllJobs(): Promise<{ message: string }> {
  return apiFetch("/api/jobs", { method: "DELETE" });
}
