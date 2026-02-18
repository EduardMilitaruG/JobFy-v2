import { Router } from "express";
import { scrapeRequestSchema } from "@jobfy/shared";
import { validateBody } from "../middleware/validateRequest.js";
import * as scrapeService from "../services/scrape.service.js";

const router = Router();

router.post("/", validateBody(scrapeRequestSchema), async (req, res, next) => {
  try {
    const log = await scrapeService.startScrape(req.body);
    res.json({
      message: "Scraping started",
      logId: log.id,
      sites: req.body.sites,
      keyword: req.body.keyword,
      location: req.body.location,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/logs", async (_req, res, next) => {
  try {
    const logs = await scrapeService.getScrapeLogs();
    res.json({ logs });
  } catch (err) {
    next(err);
  }
});

router.get("/logs/:id", async (req, res, next) => {
  try {
    const log = await scrapeService.getScrapeLogById(Number(req.params.id));
    if (!log) {
      res.status(404).json({ error: "Log not found" });
      return;
    }
    res.json(log);
  } catch (err) {
    next(err);
  }
});

export default router;
