import { prisma } from "../lib/prisma.js";
import type { JobQueryInput } from "@jobfy/shared";

// `contains` becomes ILIKE '%term%' and Prisma doesn't escape the pattern
// characters, so a search for "%" would match every job.
function escapeLike(term: string) {
  return term.replace(/[\\%_]/g, "\\$&");
}

export async function getJobs(filters: JobQueryInput) {
  const where: Record<string, unknown> = {};

  if (filters.source) {
    where.source = filters.source;
  }

  if (filters.search) {
    const search = escapeLike(filters.search);
    where.OR = [
      { jobTitle: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
      { tags: { contains: search, mode: "insensitive" } },
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
