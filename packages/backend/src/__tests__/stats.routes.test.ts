import supertest from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";

const app = createApp();
const request = supertest(app);

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.job.deleteMany();
});

describe("GET /api/stats", () => {
  it("should return zero stats when empty", async () => {
    const res = await request.get("/api/stats");
    expect(res.status).toBe(200);
    expect(res.body.totalJobs).toBe(0);
  });

  it("should return aggregated stats", async () => {
    await prisma.job.createMany({
      data: [
        {
          jobTitle: "React Dev",
          company: "A",
          location: "Remote",
          tags: "React, TypeScript",
          applyLink: "https://example.com/s1",
          source: "RemoteOK",
        },
        {
          jobTitle: "Python Dev",
          company: "B",
          location: "Madrid",
          tags: "Python, Django",
          applyLink: "https://example.com/s2",
          source: "Indeed",
        },
      ],
    });

    const res = await request.get("/api/stats");
    expect(res.status).toBe(200);
    expect(res.body.totalJobs).toBe(2);
    expect(res.body.bySource).toHaveLength(2);
    expect(res.body.byCompany).toHaveLength(2);
    expect(res.body.topTags.length).toBeGreaterThan(0);
  });
});
