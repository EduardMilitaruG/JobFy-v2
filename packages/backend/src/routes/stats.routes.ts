import { Router } from "express";
import * as statsService from "../services/stats.service.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const stats = await statsService.getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

export default router;
