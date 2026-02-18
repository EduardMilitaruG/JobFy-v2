import { BaseScraper, type JobData } from "./base.scraper.js";
import { SITES_CONFIG } from "../config/sites.js";

export class TecnoempleoScraper extends BaseScraper {
  private static SEARCH_URL =
    "https://www.tecnoempleo.com/busqueda-empleo.php";

  constructor() {
    super(SITES_CONFIG.tecnoempleo);
  }

  protected async performLogin(): Promise<boolean> {
    return true;
  }

  getSearchUrl(keyword: string, location: string): string {
    const params: string[] = [];
    if (keyword) params.push(`te=${encodeURIComponent(keyword)}`);
    if (location) params.push(`pr=${encodeURIComponent(location)}`);
    const query = params.join("&");
    return query
      ? `${TecnoempleoScraper.SEARCH_URL}?${query}`
      : TecnoempleoScraper.SEARCH_URL;
  }

  parseJobListings(html: string): JobData[] {
    const $ = this.parseHtml(html);
    const jobs: JobData[] = [];
    const seenUrls = new Set<string>();

    const excludePatterns = [
      "assets", "graficos", "acceso", "registro", "newcand",
      "newemp", "accemp", "trabajo/", "empleo-publico",
      "tecnocalculadora", "servicios", ".php", ".css", ".js",
      "pagina=", "second-window", "aws-trabajo", "ofertas-trabajo/",
    ];

    const locationPatterns = [
      "madrid", "barcelona", "valencia", "sevilla", "bilbao",
      "malaga", "zaragoza", "remote", "remoto", "teletrabajo",
    ];

    $("a[href]").each((_i, el) => {
      const href = $(el).attr("href") ?? "";
      const text = $(el).text().trim();

      if (!text || text.length < 15 || text.length > 80) return;
      if (seenUrls.has(href)) return;
      if (excludePatterns.some((p) => href.toLowerCase().includes(p))) return;
      if (href.replace(/\/$/, "").endsWith("-trabajo")) return;

      let hrefPath: string;
      if (href.startsWith("https://www.tecnoempleo.com/")) {
        hrefPath = href.replace("https://www.tecnoempleo.com", "");
      } else if (href.startsWith("/")) {
        hrefPath = href;
      } else {
        return;
      }

      if (!hrefPath.includes("-") || hrefPath.length <= 15) return;

      const applyLink = new URL(href, this.config.baseUrl).href;

      // Attempt company extraction from parent context
      let company = "N/A";
      const parent = $(el).parent();
      const companyLink = parent.find('a[href*="-trabajo"]').first();
      if (companyLink.length) {
        company = companyLink.text().trim() || "N/A";
      }

      let jobLocation = "Espana";
      const titleLower = text.toLowerCase();
      for (const loc of locationPatterns) {
        if (titleLower.includes(loc)) {
          jobLocation = loc.charAt(0).toUpperCase() + loc.slice(1);
          break;
        }
      }

      seenUrls.add(href);
      jobs.push({
        jobTitle: text,
        company,
        tags: "IT/Tech",
        applyLink,
        location: jobLocation,
        salary: "N/A",
        source: "",
      });
    });

    return jobs.slice(0, 30);
  }
}
