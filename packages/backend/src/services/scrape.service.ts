import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";
import { getScraperForSite } from "../scrapers/index.js";
import type { ScrapeRequestInput } from "@jobfy/shared";

export async function startScrape(input: ScrapeRequestInput) {
  const log = await prisma.scrapeLog.create({
    data: {
      keyword: input.keyword ?? "",
      location: input.location ?? "",
      sites: input.sites.join(","),
      status: "pending",
    },
  });

  // Fire-and-forget — run scraping in background
  runScrape(log.id, input.sites, input.keyword ?? "", input.location ?? "")
    .catch((err) => logger.error(err, "Background scrape failed"));

  return log;
}

async function runScrape(
  logId: number,
  sites: string[],
  keyword: string,
  location: string,
) {
  await prisma.scrapeLog.update({
    where: { id: logId },
    data: { status: "running" },
  });

  let totalJobs = 0;
  const errors: string[] = [];

  try {
    for (const siteId of sites) {
      const scraper = getScraperForSite(siteId);
      if (!scraper) {
        errors.push(`Unknown site: ${siteId}`);
        continue;
      }

      try {
        const jobs = await scraper.scrape(keyword, location);

        for (const job of jobs) {
          try {
            await prisma.job.create({
              data: {
                jobTitle: job.jobTitle,
                company: job.company,
                location: job.location,
                salary: job.salary,
                tags: job.tags,
                applyLink: job.applyLink,
                source: job.source,
              },
            });
            totalJobs++;
          } catch {
            // Unique constraint violation — duplicate, skip
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${siteId}: ${msg}`);
        logger.warn({ siteId, err }, "Scraper failed");
      }
    }

    await prisma.scrapeLog.update({
      where: { id: logId },
      data: {
        status: "completed",
        jobsFound: totalJobs,
        completedAt: new Date(),
        errorMessage: errors.length > 0 ? errors.join("; ") : null,
      },
    });
  } catch (err) {
    await prisma.scrapeLog.update({
      where: { id: logId },
      data: {
        status: "failed",
        completedAt: new Date(),
        errorMessage: err instanceof Error ? err.message : String(err),
      },
    });
  }
}

export async function getScrapeLogs(limit = 10) {
  return prisma.scrapeLog.findMany({
    orderBy: { startedAt: "desc" },
    take: limit,
  });
}

export async function getScrapeLogById(id: number) {
  return prisma.scrapeLog.findUnique({ where: { id } });
}
