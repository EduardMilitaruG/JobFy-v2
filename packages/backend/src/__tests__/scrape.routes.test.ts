import { jest } from "@jest/globals";

// Must be called before dynamic imports so the mock is applied when the module loads
jest.unstable_mockModule("../scrapers/index.js", () => ({
  getScraperForSite: () => ({
    scrape: jest.fn().mockResolvedValue([]),
  }),
}));

// Dynamic imports required for unstable_mockModule to take effect in ESM
const { createApp } = await import("../app.js");
const { prisma } = await import("../lib/prisma.js");
const supertest = (await import("supertest")).default;

const app = createApp();
const request = supertest(app);

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

describe("POST /api/scrape", () => {
  it("should start a scrape and return log id", async () => {
    const res = await request.post("/api/scrape").send({
      sites: ["remoteok"],
      keyword: "react",
      location: "",
    });

    expect(res.status).toBe(200);
    expect(res.body.logId).toBeDefined();
    expect(res.body.message).toContain("started");
  });

  it("should reject invalid sites", async () => {
    const res = await request.post("/api/scrape").send({
      sites: ["fakeSite"],
      keyword: "",
    });

    expect(res.status).toBe(400);
  });

  it("should reject empty sites array", async () => {
    const res = await request.post("/api/scrape").send({
      sites: [],
    });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/scrape/logs", () => {
  it("should return scrape logs", async () => {
    await prisma.scrapeLog.create({
      data: {
        keyword: "test",
        sites: "remoteok",
        status: "completed",
        jobsFound: 5,
      },
    });

    const res = await request.get("/api/scrape/logs");
    expect(res.status).toBe(200);
    expect(res.body.logs).toHaveLength(1);
    expect(res.body.logs[0].keyword).toBe("test");
  });
});

describe("GET /api/scrape/logs/:id", () => {
  it("should return a specific log", async () => {
    const log = await prisma.scrapeLog.create({
      data: { keyword: "specific", sites: "indeed", status: "pending" },
    });

    const res = await request.get(`/api/scrape/logs/${log.id}`);
    expect(res.status).toBe(200);
    expect(res.body.keyword).toBe("specific");
  });

  it("should return 404 for missing log", async () => {
    const res = await request.get("/api/scrape/logs/99999");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/sites", () => {
  it("should return available sites", async () => {
    const res = await request.get("/api/sites");
    expect(res.status).toBe(200);
    expect(res.body.sites).toBeInstanceOf(Array);
    expect(res.body.sites.length).toBeGreaterThanOrEqual(5);

    const remoteok = res.body.sites.find(
      (s: { id: string }) => s.id === "remoteok",
    );
    expect(remoteok).toBeDefined();
    expect(remoteok.requiresAuth).toBe(false);
  });
});

describe("GET /api/health", () => {
  it("should return ok", async () => {
    const res = await request.get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
