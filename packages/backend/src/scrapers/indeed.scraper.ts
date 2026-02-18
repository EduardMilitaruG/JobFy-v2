import { BaseScraper, type JobData } from "./base.scraper.js";
import { SITES_CONFIG } from "../config/sites.js";

export class IndeedScraper extends BaseScraper {
  private country: string;
  private baseUrl: string;

  constructor(country = "es") {
    super(SITES_CONFIG.indeed);
    this.country = country;
    this.baseUrl = this.getBaseUrl();
  }

  private getBaseUrl(): string {
    switch (this.country) {
      case "es":
        return "https://es.indeed.com";
      case "mx":
        return "https://mx.indeed.com";
      case "ar":
        return "https://ar.indeed.com";
      default:
        return "https://www.indeed.com";
    }
  }

  protected async performLogin(): Promise<boolean> {
    return true;
  }

  getSearchUrl(keyword: string, location: string): string {
    const params: string[] = [];
    if (keyword) params.push(`q=${encodeURIComponent(keyword)}`);
    if (location) params.push(`l=${encodeURIComponent(location)}`);
    params.push("sort=date");
    return `${this.baseUrl}/jobs?${params.join("&")}`;
  }

  parseJobListings(html: string): JobData[] {
    const $ = this.parseHtml(html);
    const jobs: JobData[] = [];

    let cards = $("div.job_seen_beacon");
    if (!cards.length) cards = $("div.jobsearch-SerpJobCard");
    if (!cards.length) cards = $("[data-jk]");
    if (!cards.length) cards = $("td.resultContent");

    cards.each((_i, el) => {
      const card = $(el);

      // Title
      const titleEl =
        card.find("h2.jobTitle").first() ||
        card.find("a.jobtitle").first() ||
        card.find("[data-testid='jobTitle']").first() ||
        card.find("span[title]").first();

      let jobTitle: string | undefined;
      if (titleEl.length) {
        const span = titleEl.find("span").first();
        jobTitle = span.length ? span.text().trim() : titleEl.text().trim();
      }
      if (!jobTitle) return;

      // Link
      let applyLink = "N/A";
      const linkEl =
        card.find("a.jcs-JobTitle").first() || card.find("a[href]").first();
      const href = linkEl.attr("href") ?? "";
      if (href.startsWith("/")) {
        applyLink = new URL(href, this.baseUrl).href;
      } else if (href.startsWith("http")) {
        applyLink = href;
      }

      // Company
      const companyEl =
        card.find("span.companyName").first() ||
        card.find("span[data-testid='company-name']").first() ||
        card.find("a.companyName").first();
      const company = companyEl.text().trim() || "N/A";

      // Location
      const locationEl =
        card.find("div.companyLocation").first() ||
        card.find("span.location").first() ||
        card.find("div[data-testid='text-location']").first();
      const location = locationEl.text().trim() || "N/A";

      // Salary
      const salaryEl =
        card.find("div.salary-snippet-container").first() ||
        card.find("span.salaryText").first() ||
        card.find("div[data-testid='attribute_snippet_testid']").first();
      const salary = salaryEl.text().trim() || "N/A";

      // Tags
      const tagEls = card.find("div.attribute_snippet");
      const tags =
        tagEls
          .map((_j, t) => $(t).text().trim())
          .get()
          .join(", ") || "N/A";

      jobs.push({
        jobTitle,
        company,
        tags,
        applyLink,
        location,
        salary,
        source: "",
      });
    });

    return jobs;
  }
}
