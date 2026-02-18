import { prisma } from "../lib/prisma.js";
import * as statsService from "../services/stats.service.js";

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.job.deleteMany();
});

describe("stats.service", () => {
  it("should return empty stats when no jobs exist", async () => {
    const stats = await statsService.getStats();
    expect(stats.totalJobs).toBe(0);
    expect(stats.bySource).toEqual([]);
    expect(stats.byCompany).toEqual([]);
    expect(stats.byLocation).toEqual([]);
    expect(stats.topTags).toEqual([]);
  });

  it("should aggregate stats correctly", async () => {
    await prisma.job.createMany({
      data: [
        {
          jobTitle: "React Dev",
          company: "Corp A",
          location: "Remote",
          tags: "React, TypeScript",
          applyLink: "https://example.com/1",
          source: "RemoteOK",
        },
        {
          jobTitle: "Python Dev",
          company: "Corp A",
          location: "Madrid",
          tags: "Python, Django",
          applyLink: "https://example.com/2",
          source: "Indeed",
        },
        {
          jobTitle: "Java Dev",
          company: "Corp B",
          location: "Remote",
          tags: "Java, Spring",
          applyLink: "https://example.com/3",
          source: "RemoteOK",
        },
      ],
    });

    const stats = await statsService.getStats();

    expect(stats.totalJobs).toBe(3);
    expect(stats.bySource).toHaveLength(2);
    expect(stats.byCompany).toHaveLength(2);
    expect(stats.byLocation).toHaveLength(2);
    expect(stats.topTags.length).toBeGreaterThan(0);

    const remoteOK = stats.bySource.find((s) => s.source === "RemoteOK");
    expect(remoteOK?.count).toBe(2);
  });
});
