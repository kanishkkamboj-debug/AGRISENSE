import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler";
import deviceRoutes from "./routes/deviceRoutes";
import publicRoutes from "./routes/publicRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/agrisense";

// Security & Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "5mb" }));

// Health Check Endpoints
const getHealthStatus = () => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const isWeatherConfigured = Boolean(process.env.OPENWEATHER_API_KEY);
  const isAiConfigured = Boolean(process.env.GEMINI_API_KEY);

  const overallStatus = isDbConnected ? "UP" : "DEGRADED";

  return {
    status: overallStatus,
    service: "agrisense-backend",
    version: "1.0.0",
    components: {
      backend: "UP",
      database: isDbConnected ? "UP" : "DOWN",
      weather: isWeatherConfigured ? "CONFIGURED" : "UNAVAILABLE",
      ai: isAiConfigured ? "CONFIGURED" : "UNAVAILABLE",
    },
    timestamp: new Date().toISOString(),
  };
};

app.get("/health", (_req, res) => {
  res.status(200).json(getHealthStatus());
});

app.get("/api/health", (_req, res) => {
  res.status(200).json(getHealthStatus());
});

// API Routes Boundary & Hardware Aliases
app.use("/api/v1/device", deviceRoutes);
app.use("/api/iot", deviceRoutes); // Direct alias for ESP8266 microcontrollers (/api/iot/telemetry)
app.use("/api/v1/public", publicRoutes);
app.use("/api", publicRoutes); // Direct alias for Requirement 12 endpoints (/api/crops, /api/weather, etc.)

// Global Error Handler
app.use(errorHandler);

// Database Connection & Server Initialization
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info(`Connected to MongoDB at ${MONGODB_URI}`);
  })
  .catch((err) => {
    logger.warn(`MongoDB connection failed (${err.message}). Running with in-memory / mock fallback.`);
  });

import { DeviceConnectivityService } from "./services/DeviceConnectivityService";

// Start background device connectivity monitoring loop
DeviceConnectivityService.startMonitoring(5000);

const server = app.listen(Number(PORT), "0.0.0.0", () => {
  logger.info(`AgriSense IoT Backend running on http://0.0.0.0:${PORT} (Accessible on network at http://10.15.11.228:${PORT})`);
});

// Graceful Shutdown Handler
function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down AgriSense server gracefully...`);
  server.close(() => {
    mongoose.connection.close(false).then(() => {
      logger.info("Closed HTTP server and MongoDB connections.");
      process.exit(0);
    });
  });
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default app;
