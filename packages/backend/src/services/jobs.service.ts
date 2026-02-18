import { prisma } from "../lib/prisma.js";
import type { JobQueryInput } from "@jobfy/shared";

export async function getJobs(filters: JobQueryInput) {
  const where: Record<string, unknown> = {};

  if (filters.source) {
    where.source = filters.source;
  }

  if (filters.search) {
    where.OR = [
      { jobTitle: { contains: filters.search, mode: "insensitive" } },
      { company: { contains: filters.search, mode: "insensitive" } },
      { tags: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: filters.limit,
      skip: filters.offset,
    }),
    prisma.job.count({ where }),
  ]);

  return { data: jobs, total, limit: filters.limit!, offset: filters.offset! };
}

export async function getJobById(id: number) {
  return prisma.job.findUnique({ where: { id } });
}

export async function deleteJob(id: number) {
  return prisma.job.delete({ where: { id } });
}

export async function clearAllJobs() {
  const result = await prisma.job.deleteMany();
  return result.count;
}
