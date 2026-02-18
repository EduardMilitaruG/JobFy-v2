import { BaseScraper, type JobData } from "./base.scraper.js";
import { SITES_CONFIG } from "../config/sites.js";
import { logger } from "../lib/logger.js";

export class InfoJobsScraper extends BaseScraper {
  private static LOGIN_URL =
    "https://www.infojobs.net/candidate/access/login.xhtml";
  private static SEARCH_URL =
    "https://www.infojobs.net/jobsearch/search-results/list.xhtml";

  constructor() {
    super(SITES_CONFIG.infojobs);
  }

  protected async performLogin(): Promise<boolean> {
    const creds = this.config.credentials;
    if (!creds) return false;

    try {
      await this.fetchPage(InfoJobsScraper.LOGIN_URL);

      const { data, request } = await this.http.post(
        InfoJobsScraper.LOGIN_URL,
        new URLSearchParams({
          j_username: creds.username,
          j_password: creds.password,
        }).toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          maxRedirects: 5,
        },
      );

      const responseUrl: string = request?.res?.responseUrl ?? "";
      if (
        (typeof data === "string" && data.toLowerCase().includes("logout")) ||
        responseUrl.includes("mi-cv")
      ) {
        this.authenticated = true;
        return true;
      }

      logger.warn("InfoJobs login may have failed — possible captcha");
      return true; // Continue anyway, some searches work without login
    } catch (err) {
      logger.error({ err }, "InfoJobs login error");
      return false;
    }
  }

  getSearchUrl(keyword: string, location: string): string {
    const params: string[] = [];
    if (keyword) params.push(`q=${encodeURIComponent(keyword)}`);
    if (location) params.push(`provinceIds=${encodeURIComponent(location)}`);
    const query = params.join("&");
    return query
      ? `${InfoJobsScraper.SEARCH_URL}?${query}`
      : InfoJobsScraper.SEARCH_URL;
  }

  parseJobListings(html: string): JobData[] {
    const $ = this.parseHtml(html);
    const jobs: JobData[] = [];

    let cards = $("div.ij-OfferCardContent");
    if (!cards.length) cards = $("li.ij-OfferCard");
    if (!cards.length) cards = $("[data-testid='offer-card']");

    cards.each((_i, el) => {
      const card = $(el);

      const titleEl =
        card.find("a.ij-OfferCardContent-description-title-link").first() ||
        card.find("h2.ij-OfferCardContent-description-title").first() ||
        card.find("[data-testid='offer-title']").first() ||
        card.find("a[data-test='offer-title']").first();

      const jobTitle = titleEl.text().trim();
      if (!jobTitle) return;

      let applyLink = "N/A";
      const href = titleEl.attr("href");
      if (href) {
        applyLink = new URL(href, this.config.baseUrl).href;
      }

      const companyEl =
        card
          .find("a.ij-OfferCardContent-description-subtitle-link")
          .first() ||
        card.find("[data-testid='offer-company']").first() ||
        card.find("span.ij-OfferCardContent-description-subtitle").first();
      const company = companyEl.text().trim() || "N/A";

      const locationEl =
        card
          .find(
            "span.ij-OfferCardContent-description-list-item-truncate",
          )
          .first() ||
        card.find("[data-testid='offer-location']").first();
      const location = locationEl.text().trim() || "N/A";

      const salaryEl = card
        .find("span.ij-OfferCardContent-description-salary")
        .first();
      const salary = salaryEl.text().trim() || "N/A";

      const tagEls = card.find(
        "span.ij-OfferCardContent-description-tag",
      );
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
