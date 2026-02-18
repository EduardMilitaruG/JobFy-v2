import type { SiteInfo, ScrapeLog } from "@jobfy/shared";
import { apiFetch } from "./api.js";

export function fetchSites(): Promise<{ sites: SiteInfo[] }> {
  return apiFetch("/api/sites");
}

export function startScrape(body: {
  sites: string[];
  keyword?: string;
  location?: string;
}): Promise<{ message: string; logId: number }> {
  return apiFetch("/api/scrape", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function fetchScrapeLogs(): Promise<{ logs: ScrapeLog[] }> {
  return apiFetch("/api/scrape/logs");
}
