import axios, { type AxiosInstance } from "axios";
import * as cheerio from "cheerio";
import type { FullSiteConfig } from "../config/sites.js";
import { DEFAULT_HEADERS, REQUEST_TIMEOUT } from "../config/sites.js";
import { logger } from "../lib/logger.js";

export interface JobData {
  jobTitle: string;
  company: string;
  tags: string;
  applyLink: string;
  location: string;
  salary: string;
  source: string;
}

export abstract class BaseScraper {
  protected config: FullSiteConfig;
  protected http: AxiosInstance;
  protected authenticated = false;

  constructor(config: FullSiteConfig) {
    this.config = config;
    this.http = axios.create({
      timeout: REQUEST_TIMEOUT,
      headers: DEFAULT_HEADERS,
    });
  }

  get name(): string {
    return this.config.name;
  }

  get requiresAuth(): boolean {
    return this.config.requiresAuth;
  }

  protected async fetchPage(url: string): Promise<string | null> {
    try {
      const { data } = await this.http.get<string>(url);
      return data;
    } catch (err) {
      logger.warn({ url, err }, "Failed to fetch page");
      return null;
    }
  }

  protected parseHtml(html: string) {
    return cheerio.load(html);
  }

  protected async login(): Promise<boolean> {
    if (!this.requiresAuth) return true;
    if (!this.config.credentials) {
      logger.warn(`${this.name} requires credentials`);
      return false;
    }
    return this.performLogin();
  }

  protected abstract performLogin(): Promise<boolean>;

  abstract getSearchUrl(keyword: string, location: string): string;

  abstract parseJobListings(html: string): JobData[];

  async scrape(keyword = "", location = ""): Promise<JobData[]> {
    logger.info({ site: this.name, keyword, location }, "Starting scrape");

    if (this.requiresAuth) {
      const ok = await this.login();
      if (!ok) {
        logger.error(`Failed to authenticate on ${this.name}`);
        return [];
      }
    }

    const searchUrl = this.getSearchUrl(keyword, location);
    const html = await this.fetchPage(searchUrl);
    if (!html) return [];

    const jobs = this.parseJobListings(html);

    for (const job of jobs) {
      job.source = this.name;
    }

    logger.info({ site: this.name, count: jobs.length }, "Scrape complete");
    return jobs;
  }
}
