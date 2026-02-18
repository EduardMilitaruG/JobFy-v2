import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { logger } from "../lib/logger.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation error",
      details: err.errors,
    });
    return;
  }

  logger.error(err, "Unhandled error");

  res.status(500).json({
    error: "Internal server error",
  });
};
