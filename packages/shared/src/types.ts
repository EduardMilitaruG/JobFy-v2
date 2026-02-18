export interface Job {
  id: number;
  jobTitle: string;
  company: string;
  location: string;
  salary: string;
  tags: string;
  applyLink: string;
  source: string;
  createdAt: string;
}

export interface JobFilters {
  search?: string;
  source?: string;
  limit?: number;
  offset?: number;
}

export type ScrapeStatus = "pending" | "running" | "completed" | "failed";

export interface ScrapeLog {
  id: number;
  keyword: string;
  location: string;
  sites: string;
  jobsFound: number;
  status: ScrapeStatus;
  startedAt: string;
  completedAt: string | null;
  errorMessage: string | null;
}

export interface ScrapeRequest {
  sites: string[];
  keyword?: string;
  location?: string;
}

export interface StatsResponse {
  totalJobs: number;
  bySource: { source: string; count: number }[];
  byCompany: { company: string; count: number }[];
  byLocation: { location: string; count: number }[];
  topTags: { tag: string; count: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface SiteConfig {
  name: string;
  baseUrl: string;
  requiresAuth: boolean;
}

export interface SiteInfo {
  id: string;
  name: string;
  requiresAuth: boolean;
}
