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

import { WeatherController } from "../controllers/weatherController";
import { MagicMakerController } from "../controllers/magicMakerController";
import { AgronomyController } from "../controllers/agronomyController";

const router = Router();

// SSE Live Stream (No Rate Limiter applied to event stream)
router.get("/telemetry/stream", TelemetryController.sseStream);

router.use(publicApiLimiter);

// Public Unauthenticated Telemetry
router.get("/telemetry/latest", TelemetryController.getLatestTelemetry);
router.get("/telemetry/history", TelemetryController.getTelemetryHistory);
router.get("/telemetry/device-status", TelemetryController.getDeviceStatus);
router.get("/telemetry/connection-history", TelemetryController.getConnectionHistory);

// Weather Service Endpoint
router.get("/weather", WeatherController.getWeather);

// Magic Maker Pipeline Endpoints
router.get("/magic-maker", MagicMakerController.evaluateMagicMaker);
router.post("/magic-maker", MagicMakerController.evaluateMagicMaker);

// Agronomic Engine Endpoints
router.post("/agronomy/evaluate", AgronomyController.evaluate);
router.get("/agronomy/evaluate", AgronomyController.evaluate);
router.get("/agronomy/rules/:cropId", AgronomyController.getCropRules);

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

// Public Actions & Closed-Loop Outcomes
router.get("/actions", ActionController.getActions);
router.post("/actions", ActionController.createAction);
router.post("/actions/execute", ActionController.executeAction);
router.get("/actions/closed-loop", ActionController.getClosedLoopActions);
router.patch("/actions/:id/status", ActionController.updateActionStatus);

// Crop Cycles & Yield Validation
router.get("/crop-cycles", async (req, res) => {
  try {
    const fieldId = (req.query.fieldId as string) || "FIELD-PUNJAB-01";
    const { CropCycleModel } = await import("../models/CropCycle");
    const cycles = await CropCycleModel.find({ fieldId }).sort({ plantingDate: -1 }).lean();
    res.status(200).json({ success: true, data: cycles, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
  }
});

router.post("/crop-cycles", async (req, res) => {
  try {
    const { fieldId, cropId, variety, plantingDate, targetHarvestDate, soilType, irrigationMethod, predictedYieldTonsPerHa } = req.body;
    const { CropCycleModel } = await import("../models/CropCycle");
    const cycleId = `CYCLE-${Date.now()}`;
    const cycle = await CropCycleModel.create({
      cycleId,
      fieldId: fieldId || "FIELD-PUNJAB-01",
      cropId: cropId || "wheat",
      variety: variety || "PBW-725 (PAU High Yield)",
      plantingDate: plantingDate || new Date().toISOString().split("T")[0],
      targetHarvestDate: targetHarvestDate || "2026-11-15",
      soilType: soilType || "Sandy Loam",
      irrigationMethod: irrigationMethod || "Precision Drip",
      predictedYieldTonsPerHa: predictedYieldTonsPerHa || 4.8,
      status: "ACTIVE",
    });
    res.status(200).json({ success: true, data: cycle, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
  }
});

// Public Observations
router.get("/observations", ObservationController.getObservations);
router.post("/observations", ObservationController.saveObservation);

// System Status & Health
router.get("/system-status", SystemStatusController.getSystemStatus);

// Public Analytics
router.get("/analytics", AnalyticsController.getAnalytics);

// Public Reports
router.get("/reports/export-csv", ReportController.exportCsv);

// Scientific Validation & Research Benchmarking
router.get("/validation/metrics", async (_req, res) => {
  try {
    const { ScientificValidationService } = await import("../services/ScientificValidationService");
    const accuracy = ScientificValidationService.getSensorAccuracyMetrics();
    const confusion = await ScientificValidationService.getAgronomicDetectionPerformance();
    const efficiency = await ScientificValidationService.getEfficiencyMetrics();

    res.status(200).json({
      success: true,
      data: {
        accuracy,
        confusion,
        efficiency,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
  }
});

// Ground-Truth Event Observation Log
router.get("/ground-truth", async (req, res) => {
  try {
    const fieldId = (req.query.fieldId as string) || "FIELD-PUNJAB-01";
    const { GroundTruthModel } = await import("../models/GroundTruth");
    const events = await GroundTruthModel.find({ fieldId }).sort({ timestamp: -1 }).lean();
    res.status(200).json({ success: true, data: events, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
  }
});

router.post("/ground-truth", async (req, res) => {
  try {
    const { fieldId, actualCondition, confirmedBy, observations, photos, notes } = req.body;
    const { GroundTruthModel } = await import("../models/GroundTruth");
    const eventId = `GT-${Date.now()}`;
    const gt = await GroundTruthModel.create({
      eventId,
      fieldId: fieldId || "FIELD-PUNJAB-01",
      timestamp: new Date().toISOString(),
      actualCondition: actualCondition || "NORMAL",
      confirmedBy: confirmedBy || "FIELD_AGRONOMIST",
      observations: observations || ["Manual field Scouting confirmation"],
      photos: photos || [],
      notes,
    });
    res.status(200).json({ success: true, data: gt, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
  }
});

// Human Review & Decision Tracking
router.get("/actions/reviews", async (req, res) => {
  try {
    const fieldId = (req.query.fieldId as string) || "FIELD-PUNJAB-01";
    const { HumanReviewModel } = await import("../models/HumanReview");
    const reviews = await HumanReviewModel.find({ fieldId }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: reviews, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
  }
});

router.post("/actions/review", async (req, res) => {
  try {
    const { recommendationId, fieldId, cropId, conditionCode, recommendedActionTitle, humanDecision, actualActionTaken, overrideReason } = req.body;
    const { HumanReviewModel } = await import("../models/HumanReview");
    const reviewId = `REV-${Date.now()}`;
    const review = await HumanReviewModel.create({
      reviewId,
      recommendationId: recommendationId || `REC-${Date.now()}`,
      fieldId: fieldId || "FIELD-PUNJAB-01",
      cropId: cropId || "wheat",
      conditionCode: conditionCode || "MOISTURE_STRESS",
      recommendedActionTitle: recommendedActionTitle || "Precision Irrigation Plan",
      humanDecision: humanDecision || "ACCEPTED",
      decisionTimestamp: new Date().toISOString(),
      reviewerId: "FARM_MANAGER",
      actualActionTaken,
      overrideReason,
    });
    res.status(200).json({ success: true, data: review, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
  }
});

// Public Settings
router.get("/settings", SettingsController.getSettings);
router.post("/settings", SettingsController.updateSettings);

export default router;
