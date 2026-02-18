-- CreateEnum
CREATE TYPE "ScrapeStatus" AS ENUM ('pending', 'running', 'completed', 'failed');

-- CreateTable
CREATE TABLE "jobs" (
    "id" SERIAL NOT NULL,
    "job_title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT 'N/A',
    "salary" TEXT NOT NULL DEFAULT 'N/A',
    "tags" TEXT NOT NULL DEFAULT '',
    "apply_link" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scrape_logs" (
    "id" SERIAL NOT NULL,
    "keyword" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "sites" TEXT NOT NULL DEFAULT '',
    "jobs_found" INTEGER NOT NULL DEFAULT 0,
    "status" "ScrapeStatus" NOT NULL DEFAULT 'pending',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "error_message" TEXT,

    CONSTRAINT "scrape_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jobs_apply_link_key" ON "jobs"("apply_link");

-- CreateIndex
CREATE INDEX "jobs_source_idx" ON "jobs"("source");

-- CreateIndex
CREATE INDEX "jobs_job_title_idx" ON "jobs"("job_title");

-- CreateIndex
CREATE INDEX "jobs_company_idx" ON "jobs"("company");
