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

// Health Check Endpoint
app.get("/health", (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "UP" : "DEGRADED";
  res.status(200).json({
    status: "UP",
    service: "agrisense-backend",
    version: "1.0.0",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// API Routes Boundary
app.use("/api/v1/device", deviceRoutes);
app.use("/api/v1/public", publicRoutes);

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

const server = app.listen(PORT, () => {
  logger.info(`AgriSense IoT Backend running on http://localhost:${PORT}`);
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
