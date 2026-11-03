import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { HttpError } from "../lib/httpError.js";
import { logger } from "../lib/logger.js";

// body-parser errors carry a `type` and a 4xx `status`.
const BODY_PARSER_MESSAGES: Record<string, string> = {
  "entity.parse.failed": "Malformed JSON body",
  "entity.too.large": "Request body too large",
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation error",
      details: err.errors,
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ error: "File too large" });
    } else {
      res.status(400).json({ error: err.message });
    }
    return;
  }

  if (typeof err.type === "string" && err.type in BODY_PARSER_MESSAGES) {
    res.status(err.status).json({ error: BODY_PARSER_MESSAGES[err.type] });
    return;
  }

  logger.error(err, "Unhandled error");

  res.status(500).json({
    error: "Internal server error",
  });
};
