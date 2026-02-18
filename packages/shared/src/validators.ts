import { z } from "zod";
import { SITE_IDS } from "./constants.js";

export const scrapeRequestSchema = z.object({
  sites: z
    .array(z.enum(SITE_IDS as unknown as [string, ...string[]]))
    .min(1, "Select at least one site"),
  keyword: z.string().max(100).optional().default(""),
  location: z.string().max(100).optional().default(""),
});

export const jobQuerySchema = z.object({
  search: z.string().max(200).optional(),
  source: z.string().max(50).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type ScrapeRequestInput = z.infer<typeof scrapeRequestSchema>;
export type JobQueryInput = z.infer<typeof jobQuerySchema>;
