import type { BaseScraper } from "./base.scraper.js";
import { RemoteOKScraper } from "./remoteok.scraper.js";
import { TecnoempleoScraper } from "./tecnoempleo.scraper.js";
import { InfoJobsScraper } from "./infojobs.scraper.js";
import { LinkedInScraper } from "./linkedin.scraper.js";
import { IndeedScraper } from "./indeed.scraper.js";

const SCRAPERS: Record<string, new () => BaseScraper> = {
  remoteok: RemoteOKScraper,
  tecnoempleo: TecnoempleoScraper,
  infojobs: InfoJobsScraper,
  linkedin: LinkedInScraper,
  indeed: IndeedScraper,
};

export function getScraperForSite(siteId: string): BaseScraper | null {
  const Scraper = SCRAPERS[siteId];
  if (!Scraper) return null;
  return new Scraper();
}

export {
  RemoteOKScraper,
  TecnoempleoScraper,
  InfoJobsScraper,
  LinkedInScraper,
  IndeedScraper,
};
