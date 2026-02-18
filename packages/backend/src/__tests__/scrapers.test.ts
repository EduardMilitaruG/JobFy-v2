import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { TecnoempleoScraper } from "../scrapers/tecnoempleo.scraper.js";
import { InfoJobsScraper } from "../scrapers/infojobs.scraper.js";
import { LinkedInScraper } from "../scrapers/linkedin.scraper.js";
import { IndeedScraper } from "../scrapers/indeed.scraper.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = (name: string) =>
  readFileSync(join(__dirname, "fixtures", name), "utf-8");

describe("TecnoempleoScraper.parseJobListings", () => {
  const scraper = new TecnoempleoScraper();

  it("should parse job listings from HTML", () => {
    const html = fixture("tecnoempleo.html");
    const jobs = scraper.parseJobListings(html);

    expect(jobs.length).toBeGreaterThanOrEqual(2);

    const java = jobs.find((j) => j.jobTitle.includes("Java"));
    expect(java).toBeDefined();
    expect(java!.location).toBe("Madrid");

    const devops = jobs.find((j) => j.jobTitle.includes("DevOps"));
    expect(devops).toBeDefined();
    expect(devops!.location).toBe("Remoto");
  });

  it("should filter out navigation links", () => {
    const html = fixture("tecnoempleo.html");
    const jobs = scraper.parseJobListings(html);
    const links = jobs.map((j) => j.applyLink);
    expect(links.every((l) => !l.includes("assets"))).toBe(true);
    expect(links.every((l) => !l.includes("acceso"))).toBe(true);
  });

  it("should build correct search URL", () => {
    const url = scraper.getSearchUrl("python", "madrid");
    expect(url).toContain("te=python");
    expect(url).toContain("pr=madrid");
  });
});

describe("InfoJobsScraper.parseJobListings", () => {
  const scraper = new InfoJobsScraper();

  it("should parse job cards", () => {
    const html = fixture("infojobs.html");
    const jobs = scraper.parseJobListings(html);

    expect(jobs).toHaveLength(2);
    expect(jobs[0].jobTitle).toBe("React Developer");
    expect(jobs[0].company).toBe("TechCompany S.L.");
    expect(jobs[0].location).toBe("Madrid");
    expect(jobs[0].salary).toBe("30.000 - 40.000 EUR");
    expect(jobs[0].tags).toContain("React");
  });

  it("should build correct search URL", () => {
    const url = scraper.getSearchUrl("react", "Madrid");
    expect(url).toContain("q=react");
    expect(url).toContain("provinceIds=Madrid");
  });
});

describe("LinkedInScraper.parseJobListings", () => {
  const scraper = new LinkedInScraper();

  it("should parse base-card elements", () => {
    const html = fixture("linkedin.html");
    const jobs = scraper.parseJobListings(html);

    expect(jobs).toHaveLength(2);
    expect(jobs[0].jobTitle).toBe("Full Stack Engineer");
    expect(jobs[0].company).toBe("Google");
    expect(jobs[0].location).toBe("Mountain View, CA");
    expect(jobs[0].applyLink).toContain("linkedin.com/jobs/view/123456");
  });

  it("should build search URL with parameters", () => {
    const url = scraper.getSearchUrl("react", "Madrid");
    expect(url).toContain("keywords=react");
    expect(url).toContain("location=Madrid");
    expect(url).toContain("f_TPR=r604800");
  });
});

describe("IndeedScraper.parseJobListings", () => {
  const scraper = new IndeedScraper();

  it("should parse job_seen_beacon elements", () => {
    const html = fixture("indeed.html");
    const jobs = scraper.parseJobListings(html);

    expect(jobs).toHaveLength(2);
    expect(jobs[0].jobTitle).toBe("Frontend Developer");
    expect(jobs[0].company).toBe("StartupXYZ");
    expect(jobs[0].location).toBe("Madrid, Spain");
    expect(jobs[0].salary).toBe("25.000 - 35.000 EUR");
    expect(jobs[0].tags).toContain("JavaScript");
  });

  it("should build correct search URL", () => {
    const url = scraper.getSearchUrl("python", "Barcelona");
    expect(url).toContain("q=python");
    expect(url).toContain("l=Barcelona");
    expect(url).toContain("sort=date");
  });
});
