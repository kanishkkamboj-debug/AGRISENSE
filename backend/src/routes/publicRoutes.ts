import { Router } from "express";
import { TelemetryController } from "../controllers/telemetryController";
import { GISController } from "../controllers/gisController";
import { CropController } from "../controllers/cropController";
import { AdvisoryController } from "../controllers/advisoryController";
import { AnalyticsController } from "../controllers/analyticsController";
import { ReportController } from "../controllers/reportController";
import { SettingsController } from "../controllers/settingsController";
import { publicApiLimiter } from "../middleware/rateLimiter";

const router = Router();

// SSE Live Stream (No Rate Limiter applied to event stream)
router.get("/telemetry/stream", TelemetryController.sseStream);

router.use(publicApiLimiter);

// Public Unauthenticated Telemetry
router.get("/telemetry/latest", TelemetryController.getLatestTelemetry);
router.get("/telemetry/history", TelemetryController.getTelemetryHistory);

// Public GIS
router.get("/gis/fields", GISController.getFields);
router.post("/gis/fields", GISController.saveField);

// Public Crops
router.get("/crops", CropController.getCrops);
router.get("/crops/:cropId", CropController.getCropById);

// Public Advisories
router.get("/advisories", AdvisoryController.getAdvisory);

// Public Analytics
router.get("/analytics", AnalyticsController.getAnalytics);

// Public Reports
router.get("/reports/export-csv", ReportController.exportCsv);

// Public Settings
router.get("/settings", SettingsController.getSettings);
router.post("/settings", SettingsController.updateSettings);

export default router;
