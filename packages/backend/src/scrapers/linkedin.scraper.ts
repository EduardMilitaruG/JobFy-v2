import { BaseScraper, type JobData } from "./base.scraper.js";
import { SITES_CONFIG } from "../config/sites.js";
import { logger } from "../lib/logger.js";

export class LinkedInScraper extends BaseScraper {
  private static LOGIN_URL = "https://www.linkedin.com/login";
  private static SESSION_URL = "https://www.linkedin.com/uas/login-submit";
  private static JOBS_URL = "https://www.linkedin.com/jobs/search";

  constructor() {
    super(SITES_CONFIG.linkedin);
    this.http.defaults.headers.common["Accept"] =
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8";
    this.http.defaults.headers.common["Referer"] = "https://www.linkedin.com/";
  }

  protected async performLogin(): Promise<boolean> {
    const creds = this.config.credentials;
    if (!creds) return false;

    try {
      const loginPage = await this.fetchPage(LinkedInScraper.LOGIN_URL);
      if (!loginPage) return false;

      const $ = this.parseHtml(loginPage);
      const csrfToken =
        $('input[name="loginCsrfParam"]').val()?.toString() ?? "";

      const { request } = await this.http.post(
        LinkedInScraper.SESSION_URL,
        new URLSearchParams({
          session_key: creds.username,
          session_password: creds.password,
          loginCsrfParam: csrfToken,
        }).toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          maxRedirects: 5,
        },
      );

      const responseUrl: string = request?.res?.responseUrl ?? "";

      if (responseUrl.includes("feed") || responseUrl.includes("mynetwork")) {
        this.authenticated = true;
        return true;
      }

      if (
        responseUrl.includes("challenge") ||
        responseUrl.includes("checkpoint")
      ) {
        logger.error("LinkedIn requires additional verification");
        return false;
      }

      logger.warn("LinkedIn login could not be confirmed");
      return false;
    } catch (err) {
      logger.error({ err }, "LinkedIn login error");
      return false;
    }
  }

  getSearchUrl(keyword: string, location: string): string {
    const params: string[] = [];
    if (keyword) params.push(`keywords=${encodeURIComponent(keyword)}`);
    if (location) params.push(`location=${encodeURIComponent(location)}`);
    params.push("f_TPR=r604800"); // Last 7 days
    params.push("sortBy=R"); // By relevance
    return `${LinkedInScraper.JOBS_URL}?${params.join("&")}`;
  }

  parseJobListings(html: string): JobData[] {
    const $ = this.parseHtml(html);
    const jobs: JobData[] = [];

    let cards = $("div.base-card");
    if (!cards.length) cards = $("li.jobs-search-results__list-item");
    if (!cards.length) cards = $("[data-job-id]");

    cards.each((_i, el) => {
      const card = $(el);

      const titleEl =
        card.find("h3.base-search-card__title").first() ||
        card.find("a.job-card-list__title").first() ||
        card.find("[class*='job-title']").first();
      const jobTitle = titleEl.text().trim();
      if (!jobTitle) return;

      const companyEl =
        card.find("h4.base-search-card__subtitle").first() ||
        card.find("a.job-card-container__company-name").first() ||
        card.find("[class*='company-name']").first();
      const company = companyEl.text().trim() || "N/A";

      const locationEl =
        card.find("span.job-search-card__location").first() ||
        card.find("li.job-card-container__metadata-item").first() ||
        card.find("[class*='location']").first();
      const location = locationEl.text().trim() || "N/A";

      let applyLink = "N/A";
      const linkEl =
        card.find("a.base-card__full-link").first() ||
        card.find("a[href]").first();
      const href = linkEl.attr("href") ?? "";
      if (href.startsWith("http")) {
        applyLink = href.split("?")[0];
      } else if (href) {
        applyLink = new URL(href, this.config.baseUrl).href;
      }

      jobs.push({
        jobTitle,
        company,
        tags: "N/A",
        applyLink,
        location,
        salary: "N/A",
        source: "",
      });
    });

    if (!jobs.length) {
      logger.warn("No LinkedIn jobs found — may be blocked");
    }

    return jobs;
  }
}
