import { Router } from "express";
import { TelemetryController } from "../controllers/telemetryController";
import { GISController } from "../controllers/gisController";
import { CropController } from "../controllers/cropController";
import { AdvisoryController } from "../controllers/advisoryController";
import { AnalyticsController } from "../controllers/analyticsController";
import { ReportController } from "../controllers/reportController";
import { SettingsController } from "../controllers/settingsController";
import { publicApiLimiter } from "../middleware/rateLimiter";

import { AlertController } from "../controllers/alertController";
import { ActionController } from "../controllers/actionController";
import { ObservationController } from "../controllers/observationController";
import { SystemStatusController } from "../controllers/systemStatusController";
import {
  getLiveIoTIntelligence,
  getWhyAnalysis,
  getWhatChanged,
  getWhatIfSimulation,
  getFieldReplay,
  getIoTEvents,
} from "../controllers/intelligenceController";

const router = Router();

// SSE Live Stream (No Rate Limiter applied to event stream)
router.get("/telemetry/stream", TelemetryController.sseStream);

router.use(publicApiLimiter);

// Public Unauthenticated Telemetry
router.get("/telemetry/latest", TelemetryController.getLatestTelemetry);
router.get("/telemetry/history", TelemetryController.getTelemetryHistory);
router.get("/telemetry/device-status", TelemetryController.getDeviceStatus);
router.get("/telemetry/connection-history", TelemetryController.getConnectionHistory);

// AgriSense Intelligence v3 Engine Endpoints
router.get("/intelligence/live", getLiveIoTIntelligence);
router.get("/intelligence/why", getWhyAnalysis);
router.get("/intelligence/what-changed", getWhatChanged);
router.post("/intelligence/what-if", getWhatIfSimulation);
router.get("/intelligence/replay", getFieldReplay);
router.get("/intelligence/events", getIoTEvents);

// Public GIS
router.get("/gis/fields", GISController.getFields);
router.post("/gis/fields", GISController.saveField);

// Public Crops
router.get("/crops", CropController.getCrops);
router.get("/crops/:cropId", CropController.getCropById);

// Public Advisories
router.get("/advisories", AdvisoryController.getAdvisory);
router.post("/advisories/ask", async (req, res) => {
  try {
    const { query, fieldId } = req.body;
    const { ContextBuilder } = await import("../services/ContextService/ContextBuilder");
    const { AIService } = await import("../services/AIService");
    const ctx = await ContextBuilder.buildContext(fieldId || "FIELD-PUNJAB-01");
    const result = await AIService.askAgriSense(query || "Should I irrigate?", ctx);
    res.status(200).json({ success: true, data: result, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
  }
});

// Public Alerts
router.get("/alerts", AlertController.getAlerts);
router.post("/alerts/:id/resolve", AlertController.resolveAlert);
router.post("/alerts/:id/create-action", AlertController.createActionFromAlert);

// Public Actions
router.get("/actions", ActionController.getActions);
router.post("/actions", ActionController.createAction);
router.patch("/actions/:id/status", ActionController.updateActionStatus);

// Public Observations
router.get("/observations", ObservationController.getObservations);
router.post("/observations", ObservationController.saveObservation);

// System Status & Health
router.get("/system-status", SystemStatusController.getSystemStatus);

// Public Analytics
router.get("/analytics", AnalyticsController.getAnalytics);

// Public Reports
router.get("/reports/export-csv", ReportController.exportCsv);

// Public Settings
router.get("/settings", SettingsController.getSettings);
router.post("/settings", SettingsController.updateSettings);

export default router;
