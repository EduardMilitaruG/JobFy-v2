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

describe("GET /api/jobs", () => {
  it("should return empty list initially", async () => {
    const res = await request.get("/api/jobs");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.total).toBe(0);
  });

  it("should return jobs with pagination", async () => {
    await prisma.job.create({
      data: {
        jobTitle: "Test Job",
        company: "TestCo",
        applyLink: "https://example.com/test-1",
        source: "RemoteOK",
      },
    });

    const res = await request.get("/api/jobs?limit=10&offset=0");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].jobTitle).toBe("Test Job");
  });

  it("should filter by source", async () => {
    await prisma.job.createMany({
      data: [
        {
          jobTitle: "Job A",
          company: "Co",
          applyLink: "https://example.com/a",
          source: "RemoteOK",
        },
        {
          jobTitle: "Job B",
          company: "Co",
          applyLink: "https://example.com/b",
          source: "Indeed",
        },
      ],
    });

    const res = await request.get("/api/jobs?source=RemoteOK");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].source).toBe("RemoteOK");
  });
});

describe("GET /api/jobs/:id", () => {
  it("should return a single job", async () => {
    const job = await prisma.job.create({
      data: {
        jobTitle: "Test",
        company: "Co",
        applyLink: "https://example.com/single",
        source: "Indeed",
      },
    });

    const res = await request.get(`/api/jobs/${job.id}`);
    expect(res.status).toBe(200);
    expect(res.body.jobTitle).toBe("Test");
  });

  it("should return 404 for missing job", async () => {
    const res = await request.get("/api/jobs/99999");
    expect(res.status).toBe(404);
  });

  it.each(["abc", "1.5", "0", "-3"])("should return 400 for invalid id %s", async (id) => {
    const res = await request.get(`/api/jobs/${id}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation error");
    expect(res.body.details).toBeDefined();
  });
});

describe("DELETE /api/jobs/:id", () => {
  it("should delete a job", async () => {
    const job = await prisma.job.create({
      data: {
        jobTitle: "To Delete",
        company: "Co",
        applyLink: "https://example.com/delete",
        source: "Indeed",
      },
    });

    const res = await request.delete(`/api/jobs/${job.id}`);
    expect(res.status).toBe(200);

    const check = await prisma.job.findUnique({ where: { id: job.id } });
    expect(check).toBeNull();
  });

  it("should return 404 for missing job", async () => {
    const res = await request.delete("/api/jobs/99999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Job not found" });
  });

  it("should return 400 for a non-numeric id", async () => {
    const res = await request.delete("/api/jobs/abc");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation error");
  });
});

describe("DELETE /api/jobs", () => {
  it("should clear all jobs", async () => {
    await prisma.job.createMany({
      data: [
        {
          jobTitle: "A",
          company: "Co",
          applyLink: "https://example.com/c1",
          source: "RemoteOK",
        },
        {
          jobTitle: "B",
          company: "Co",
          applyLink: "https://example.com/c2",
          source: "RemoteOK",
        },
      ],
    });

    const res = await request.delete("/api/jobs");
    expect(res.status).toBe(200);
    expect(res.body.message).toContain("2");
  });
});
