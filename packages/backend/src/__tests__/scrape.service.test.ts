import { prisma } from "../lib/prisma.js";
import * as scrapeService from "../services/scrape.service.js";

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.scrapeLog.deleteMany();
  await prisma.job.deleteMany();
});

describe("scrape.service", () => {
  it("should create a scrape log entry", async () => {
    const log = await scrapeService.startScrape({
      sites: ["remoteok"],
      keyword: "react",
      location: "remote",
    });

    expect(log.id).toBeDefined();
    expect(log.keyword).toBe("react");
    expect(log.sites).toBe("remoteok");
    expect(log.status).toBe("pending");
  });

  it("should retrieve scrape logs", async () => {
    await scrapeService.startScrape({
      sites: ["remoteok"],
      keyword: "test1",
      location: "",
    });
    await scrapeService.startScrape({
      sites: ["indeed"],
      keyword: "test2",
      location: "",
    });

    const logs = await scrapeService.getScrapeLogs(10);
    expect(logs.length).toBeGreaterThanOrEqual(2);
  });

  it("should get a scrape log by id", async () => {
    const created = await scrapeService.startScrape({
      sites: ["remoteok"],
      keyword: "test",
      location: "",
    });

    // Wait a tick for the async update
    await new Promise((r) => setTimeout(r, 100));

    const log = await scrapeService.getScrapeLogById(created.id);
    expect(log).not.toBeNull();
    expect(log!.keyword).toBe("test");
  });
});
