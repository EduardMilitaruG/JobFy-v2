import express from "express";
import cors from "cors";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import jobsRoutes from "./routes/jobs.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import scrapeRoutes from "./routes/scrape.routes.js";
import sitesRoutes from "./routes/sites.routes.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/jobs", jobsRoutes);
  app.use("/api/stats", statsRoutes);
  app.use("/api/scrape", scrapeRoutes);
  app.use("/api/sites", sitesRoutes);

  app.use(errorHandler);

  return app;
}
