import { prisma } from "../lib/prisma.js";

export async function getStats() {
  const totalJobs = await prisma.job.count();

  const bySource = await prisma.job.groupBy({
    by: ["source"],
    _count: { id: true },
  });

  const byCompany = await prisma.job.groupBy({
    by: ["company"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  const byLocation = await prisma.job.groupBy({
    by: ["location"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  // Tag counting — tags are comma-separated strings
  const allJobs = await prisma.job.findMany({ select: { tags: true } });
  const tagCounts: Record<string, number> = {};
  for (const { tags } of allJobs) {
    if (!tags) continue;
    for (const raw of tags.split(",")) {
      const tag = raw.trim();
      if (tag) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([tag, count]) => ({ tag, count }));

  return {
    totalJobs,
    bySource: bySource.map((r) => ({ source: r.source, count: r._count.id })),
    byCompany: byCompany.map((r) => ({
      company: r.company,
      count: r._count.id,
    })),
    byLocation: byLocation.map((r) => ({
      location: r.location,
      count: r._count.id,
    })),
    topTags,
  };
}
