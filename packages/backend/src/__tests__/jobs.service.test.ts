import { prisma } from "../lib/prisma.js";
import * as jobsService from "../services/jobs.service.js";

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.job.deleteMany();
});

describe("jobs.service", () => {
  const sampleJob = {
    jobTitle: "Senior React Dev",
    company: "TestCorp",
    location: "Remote",
    salary: "$100k",
    tags: "React, TypeScript",
    applyLink: "https://example.com/job/unique-1",
    source: "RemoteOK",
  };

  it("should create and retrieve jobs", async () => {
    await prisma.job.create({ data: sampleJob });

    const result = await jobsService.getJobs({ limit: 100, offset: 0 });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].jobTitle).toBe("Senior React Dev");
    expect(result.total).toBe(1);
  });

  it("should filter by source", async () => {
    await prisma.job.createMany({
      data: [
        sampleJob,
        {
          ...sampleJob,
          applyLink: "https://example.com/job/unique-2",
          source: "Indeed",
        },
      ],
    });

    const result = await jobsService.getJobs({
      source: "RemoteOK",
      limit: 100,
      offset: 0,
    });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].source).toBe("RemoteOK");
  });

  it("should search jobs by title", async () => {
    await prisma.job.createMany({
      data: [
        sampleJob,
        {
          ...sampleJob,
          jobTitle: "Python Backend Engineer",
          applyLink: "https://example.com/job/unique-3",
        },
      ],
    });

    const result = await jobsService.getJobs({
      search: "Python",
      limit: 100,
      offset: 0,
    });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].jobTitle).toContain("Python");
  });

  it("should get a job by id", async () => {
    const created = await prisma.job.create({ data: sampleJob });
    const job = await jobsService.getJobById(created.id);
    expect(job).not.toBeNull();
    expect(job!.jobTitle).toBe("Senior React Dev");
  });

  it("should delete a job", async () => {
    const created = await prisma.job.create({ data: sampleJob });
    await jobsService.deleteJob(created.id);
    const job = await jobsService.getJobById(created.id);
    expect(job).toBeNull();
  });

  it("should clear all jobs", async () => {
    await prisma.job.createMany({
      data: [
        sampleJob,
        {
          ...sampleJob,
          applyLink: "https://example.com/job/unique-4",
        },
      ],
    });

    const count = await jobsService.clearAllJobs();
    expect(count).toBe(2);

    const result = await jobsService.getJobs({ limit: 100, offset: 0 });
    expect(result.data).toHaveLength(0);
  });
});
