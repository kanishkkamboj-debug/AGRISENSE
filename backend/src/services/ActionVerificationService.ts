import { ActionTrackerModel, IActionTrackerDocument } from "../models/ActionTracker";
import { TelemetryModel } from "../models/Telemetry";
import { logger } from "../utils/logger";

export class ActionVerificationService {
  // Record execution of recommendation by farmer
  static async recordActionExecution(params: {
    recommendationId: string;
    fieldId: string;
    cropId: string;
    conditionCode: string;
    actionTitle: string;
    parameterName: string;
    baselineValue: number | null;
    unit: string;
    notes?: string;
  }): Promise<IActionTrackerDocument> {
    const actionId = `ACT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const doc = new ActionTrackerModel({
      actionId,
      recommendationId: params.recommendationId,
      fieldId: params.fieldId,
      cropId: params.cropId,
      conditionCode: params.conditionCode,
      actionTitle: params.actionTitle,
      status: "ACTION_TAKEN",
      executedAt: nowIso,
      baselineMeasurement: {
        parameter: params.parameterName,
        value: params.baselineValue,
        unit: params.unit,
        timestamp: nowIso,
      },
      outcomeStatus: "PENDING_VERIFICATION",
      notes: params.notes,
      createdAt: nowIso,
    });

    await doc.save();
    logger.info(`CLOSED_LOOP_ACTION_RECORDED actionId=${actionId} recId=${params.recommendationId} fieldId=${params.fieldId}`);
    return doc;
  }

  // Check and verify pending closed-loop actions against latest telemetry
  static async verifyPendingActions(fieldId = "FIELD-PUNJAB-01"): Promise<IActionTrackerDocument[]> {
    const pendingActions = await ActionTrackerModel.find({
      fieldId,
      status: { $in: ["ACTION_TAKEN", "PRESENTED"] },
    });

    const latestTelemetry = await TelemetryModel.findOne({ fieldId }).sort({ timestamp: -1 }).lean();
    if (!latestTelemetry || !latestTelemetry.measurements) return pendingActions;

    const m = latestTelemetry.measurements as Record<string, any>;

    for (const action of pendingActions) {
      const param = action.baselineMeasurement.parameter;
      const currentObj = m[param];

      if (currentObj && typeof currentObj.value === "number") {
        const currentVal = currentObj.value;
        const baseVal = action.baselineMeasurement.value ?? 0;
        const nowIso = new Date().toISOString();

        // Check verification conditions: e.g. irrigation increased moisture, or drainage decreased moisture
        let isRestored = false;
        if (action.conditionCode === "MOISTURE_STRESS" && currentVal >= 45) {
          isRestored = true;
        } else if (action.conditionCode === "WATERLOGGING_RISK" && currentVal <= 75) {
          isRestored = true;
        } else if (action.conditionCode === "NUTRIENT_DEFICIENCY" && currentVal > baseVal) {
          isRestored = true;
        }

        if (isRestored) {
          action.status = "VERIFIED";
          action.outcomeStatus = "TARGET_RANGE_RESTORED";
          action.followupMeasurement = {
            parameter: param,
            value: currentVal,
            unit: currentObj.unit || "",
            timestamp: nowIso,
          };
          await action.save();
          logger.info(`CLOSED_LOOP_VERIFIED actionId=${action.actionId} baseVal=${baseVal} -> currentVal=${currentVal}`);
        } else {
          // If execution occurred over 2 hours ago without recovery, flag INEFFECTIVE
          const executedTime = action.executedAt ? new Date(action.executedAt).getTime() : Date.now();
          if (Date.now() - executedTime > 7200000) {
            action.status = "INEFFECTIVE";
            action.outcomeStatus = "NO_IMPROVEMENT";
            action.followupMeasurement = {
              parameter: param,
              value: currentVal,
              unit: currentObj.unit || "",
              timestamp: nowIso,
            };
            await action.save();
          }
        }
      }
    }

    return ActionTrackerModel.find({ fieldId }).sort({ createdAt: -1 }).limit(20);
  }
}
