import { Request, Response } from "express";
import { ContextBuilder } from "../services/ContextService/ContextBuilder";
import { IoTIntelligenceEngine } from "../services/IoTIntelligence/IoTIntelligenceEngine";
import { AgriculturalEventModel } from "../models/AgriculturalEvent";
import { TelemetryModel } from "../models/Telemetry";
import { logger } from "../utils/logger";

export const getLiveIoTIntelligence = async (req: Request, res: Response): Promise<void> => {
  try {
    const fieldId = (req.query.fieldId as string) || "FIELD-PUNJAB-01";
    const ctx = await ContextBuilder.buildContext(fieldId);
    const history = await TelemetryModel.find({ fieldId: ctx.field.fieldId }).sort({ timestamp: -1 }).limit(30).lean();

    const report = await IoTIntelligenceEngine.generateReport(ctx, history as any[]);
    res.json(report);
  } catch (err: any) {
    logger.error(`Error in getLiveIoTIntelligence: ${err.message}`);
    res.status(500).json({ error: "Failed to generate IoT Intelligence Report", details: err.message });
  }
};

export const getWhyAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const fieldId = (req.query.fieldId as string) || "FIELD-PUNJAB-01";
    const ctx = await ContextBuilder.buildContext(fieldId);
    const history = await TelemetryModel.find({ fieldId: ctx.field.fieldId }).sort({ timestamp: -1 }).limit(30).lean();

    const report = await IoTIntelligenceEngine.generateReport(ctx, history as any[]);
    const whyResult = IoTIntelligenceEngine.getWhyIsMyFieldLikeThis(ctx, report);
    res.json(whyResult);
  } catch (err: any) {
    logger.error(`Error in getWhyAnalysis: ${err.message}`);
    res.status(500).json({ error: "Failed to generate Why analysis", details: err.message });
  }
};

export const getWhatChanged = async (req: Request, res: Response): Promise<void> => {
  try {
    const fieldId = (req.query.fieldId as string) || "FIELD-PUNJAB-01";
    const period = (req.query.period as "6h" | "24h") || "6h";
    const ctx = await ContextBuilder.buildContext(fieldId);
    const history = await TelemetryModel.find({ fieldId: ctx.field.fieldId }).sort({ timestamp: -1 }).limit(50).lean();

    const result = IoTIntelligenceEngine.getWhatChanged(ctx, history as any[], period);
    res.json(result);
  } catch (err: any) {
    logger.error(`Error in getWhatChanged: ${err.message}`);
    res.status(500).json({ error: "Failed to generate What Changed analysis", details: err.message });
  }
};

export const getWhatIfSimulation = async (req: Request, res: Response): Promise<void> => {
  try {
    const fieldId = (req.body.fieldId as string) || "FIELD-PUNJAB-01";
    const scenario = (req.body.scenario as "IRRIGATE_20MM" | "RAINFALL_30MM" | "HEATWAVE_5C") || "IRRIGATE_20MM";
    const ctx = await ContextBuilder.buildContext(fieldId);

    const result = IoTIntelligenceEngine.getWhatIfSimulation(ctx, scenario);
    res.json(result);
  } catch (err: any) {
    logger.error(`Error in getWhatIfSimulation: ${err.message}`);
    res.status(500).json({ error: "Failed to generate What-If simulation", details: err.message });
  }
};

export const getFieldReplay = async (req: Request, res: Response): Promise<void> => {
  try {
    const fieldId = (req.query.fieldId as string) || "FIELD-PUNJAB-01";
    const timeframe = (req.query.timeframe as "1h" | "6h" | "24h" | "7d") || "24h";
    const ctx = await ContextBuilder.buildContext(fieldId);
    const history = await TelemetryModel.find({ fieldId: ctx.field.fieldId }).sort({ timestamp: -1 }).limit(100).lean();

    const points = IoTIntelligenceEngine.getFieldReplay(ctx, history as any[], timeframe);
    res.json(points);
  } catch (err: any) {
    logger.error(`Error in getFieldReplay: ${err.message}`);
    res.status(500).json({ error: "Failed to generate Field Replay", details: err.message });
  }
};

export const getIoTEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await AgriculturalEventModel.find().sort({ startedAt: -1 }).limit(50).lean();
    res.json(events);
  } catch (err: any) {
    logger.error(`Error in getIoTEvents: ${err.message}`);
    res.status(500).json({ error: "Failed to fetch IoT events", details: err.message });
  }
};
