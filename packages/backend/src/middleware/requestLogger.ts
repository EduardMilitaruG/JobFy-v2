import type { RequestHandler } from "express";
import { logger } from "../lib/logger.js";

export const requestLogger: RequestHandler = (req, _res, next) => {
  logger.info({ method: req.method, url: req.url }, "request");
  next();
};
