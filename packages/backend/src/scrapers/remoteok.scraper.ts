import axios from "axios";
import { BaseScraper, type JobData } from "./base.scraper.js";
import { SITES_CONFIG, REQUEST_TIMEOUT } from "../config/sites.js";
import { logger } from "../lib/logger.js";

interface RemoteOKItem {
  legal?: string;
  position?: string;
  company?: string;
  tags?: string[];
  slug?: string;
  url?: string;
  salary_min?: number;
  salary_max?: number;
  location?: string;
}

export class RemoteOKScraper extends BaseScraper {
  private static API_URL = "https://remoteok.com/api";

  constructor() {
    super(SITES_CONFIG.remoteok);
    this.http = axios.create({
      timeout: REQUEST_TIMEOUT,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
  }

  protected async performLogin(): Promise<boolean> {
    return true;
  }

  getSearchUrl(_keyword: string, _location: string): string {
    return RemoteOKScraper.API_URL;
  }

  parseJobListings(_html: string): JobData[] {
    return [];
  }

  async scrape(keyword = "", _location = ""): Promise<JobData[]> {
    logger.info({ site: this.name, keyword }, "Starting RemoteOK scrape");

    try {
      const { data } = await this.http.get<RemoteOKItem[]>(
        RemoteOKScraper.API_URL,
      );
      const jobs = this.parseApiResponse(data, keyword);
      for (const job of jobs) job.source = this.name;
      logger.info({ site: this.name, count: jobs.length }, "Scrape complete");
      return jobs;
    } catch (err) {
      logger.error({ err }, "RemoteOK API error");
      return [];
    }
  }

  private parseApiResponse(data: RemoteOKItem[], keyword: string): JobData[] {
    const jobs: JobData[] = [];
    const kw = keyword.toLowerCase();

    for (const item of data) {
      if (item.legal !== undefined) continue; // metadata entry

      const jobTitle = item.position ?? "";
      if (!jobTitle) continue;

      const company = item.company ?? "N/A";
      const tags = item.tags?.join(", ") ?? "N/A";
      const slug = item.slug ?? "";
      const applyLink = slug
        ? `${this.config.baseUrl}/${slug}`
        : item.url ?? "N/A";

      let salary = "N/A";
      if (item.salary_min && item.salary_max) {
        salary = `$${item.salary_min.toLocaleString()} - $${item.salary_max.toLocaleString()}`;
      } else if (item.salary_min) {
        salary = `$${item.salary_min.toLocaleString()}+`;
      }

      const location = item.location || "Remote";

      if (kw) {
        const searchable = `${jobTitle} ${company} ${tags}`.toLowerCase();
        if (!searchable.includes(kw)) continue;
      }

      jobs.push({
        jobTitle,
        company,
        tags,
        applyLink,
        location,
        salary,
        source: "",
      });
    }

    return jobs.slice(0, 50);
  }
}
