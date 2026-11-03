import supertest from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";

// Regression tests for bugs #4-#12 found by the jobfy-playwright-tests
// robustness suite: bad input must get a 4xx JSON error, never a 500.

const app = createApp();
const request = supertest(app);

const INT4_OVERFLOW = 2_147_483_648;
const MISSING_ID = 999_999;

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.job.deleteMany();
});

function expectJsonError(res: supertest.Response, status: number) {
  expect(res.status).toBe(status);
  expect(res.headers["content-type"]).toMatch(/application\/json/);
  expect(res.body.error).toEqual(expect.any(String));
}

describe("request bodies", () => {
  it("should reject malformed JSON with 400", async () => {
    const res = await request
      .post("/api/scrape")
      .set("Content-Type", "application/json")
      .send('{"sites": [');
    expectJsonError(res, 400);
    expect(res.body.error).toBe("Malformed JSON body");
  });

  it("should reject a body over 100 kB with 413", async () => {
    const res = await request
      .post("/api/cv-match/from-text")
      .send({ resumeText: "a".repeat(120_000) });
    expectJsonError(res, 413);
  });
});

describe("CV uploads", () => {
  it("should reject a file that is not a PDF with 400", async () => {
    const res = await request
      .post("/api/cv-match")
      .attach("resume", Buffer.from("plain text"), { filename: "cv.txt", contentType: "text/plain" });
    expectJsonError(res, 400);
    expect(res.body.error).toBe("Only PDF files are accepted");
  });

  it("should reject a PDF over 5 MB with 413", async () => {
    const big = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(6 * 1024 * 1024)]);
    const res = await request
      .post("/api/cv-match")
      .attach("resume", big, { filename: "cv.pdf", contentType: "application/pdf" });
    expectJsonError(res, 413);
  });
});

describe("ids", () => {
  it("should reject a non-numeric scrape log id with 400", async () => {
    expectJsonError(await request.get("/api/scrape/logs/abc"), 400);
  });

  it.each(["/api/jobs", "/api/scrape/logs"])(
    "should reject an id above the int4 range on %s/:id with 400",
    async (path) => {
      expectJsonError(await request.get(`${path}/${INT4_OVERFLOW}`), 400);
    },
  );

  it("should still accept the largest int4 id", async () => {
    expectJsonError(await request.get(`/api/jobs/${INT4_OVERFLOW - 1}`), 404);
  });

  it("should reject an out-of-range job id in a CV match with 400", async () => {
    const res = await request
      .post("/api/cv-match/from-text")
      .send({ resumeText: "QA engineer", jobIds: [INT4_OVERFLOW] });
    expectJsonError(res, 400);
  });

  it("should return 404 for a cover letter about a missing job", async () => {
    // The job lookup comes before the AI call, so Groq is never reached.
    const res = await request
      .post("/api/cv-match/cover-letter")
      .send({ resumeText: "QA engineer", jobId: MISSING_ID });
    expectJsonError(res, 404);
    expect(res.body.error).toBe("Job not found");
  });
});

describe("search pattern characters", () => {
  beforeEach(async () => {
    await prisma.job.createMany({
      data: [
        { jobTitle: "100% Remote QA", company: "Co", applyLink: "https://example.com/pct", source: "RemoteOK" },
        { jobTitle: "QA_Automation", company: "Co", applyLink: "https://example.com/us", source: "RemoteOK" },
        { jobTitle: "Backend Developer", company: "Co", applyLink: "https://example.com/be", source: "RemoteOK" },
      ],
    });
  });

  const titles = (res: supertest.Response) =>
    res.body.data.map((j: { jobTitle: string }) => j.jobTitle);

  it("should match % literally", async () => {
    const res = await request.get("/api/jobs").query({ search: "%" });
    expect(titles(res)).toEqual(["100% Remote QA"]);
  });

  it("should match _ literally", async () => {
    const res = await request.get("/api/jobs").query({ search: "_" });
    expect(titles(res)).toEqual(["QA_Automation"]);
  });

  it("should treat a backslash as plain text", async () => {
    const res = await request.get("/api/jobs").query({ search: "\\" });
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
  });

  it("should still find ordinary substrings", async () => {
    const res = await request.get("/api/jobs").query({ search: "qa" });
    expect(titles(res).sort()).toEqual(["100% Remote QA", "QA_Automation"]);
  });
});

describe("unknown routes", () => {
  it("should return a JSON 404 for an unknown path", async () => {
    expectJsonError(await request.get("/api/does-not-exist"), 404);
  });

  it("should return a JSON 404 for an unsupported method", async () => {
    expectJsonError(await request.put("/api/jobs/1"), 404);
  });
});
