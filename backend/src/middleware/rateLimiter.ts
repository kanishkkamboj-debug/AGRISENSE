import rateLimit from "express-rate-limit";

export const publicApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Public API rate limit exceeded. Please try again later.",
    },
    timestamp: new Date().toISOString(),
  },
});

export const deviceIngestionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 telemetry ingestion posts per minute per device IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "INGESTION_RATE_LIMIT_EXCEEDED",
      message: "Device ingestion rate limit exceeded.",
    },
    timestamp: new Date().toISOString(),
  },
});
