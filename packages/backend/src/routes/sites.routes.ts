import { Router } from "express";
import { SITES_CONFIG } from "../config/sites.js";

const router = Router();

router.get("/", (_req, res) => {
  const sites = Object.entries(SITES_CONFIG).map(([id, config]) => ({
    id,
    name: config.name,
    requiresAuth: config.requiresAuth,
  }));
  res.json({ sites });
});

export default router;
