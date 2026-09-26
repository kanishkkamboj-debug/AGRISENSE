import { Request, Response } from "express";
import { AlertModel } from "../models/Alert";
import { ActionModel } from "../models/Action";

export class AlertController {
  static async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const fieldId = (req.query.fieldId as string) || "FIELD-PUNJAB-01";
      const status = req.query.status as string;
      const severity = req.query.severity as string;

      const filter: any = { fieldId };
      if (status && status !== "ALL") filter.status = status;
      if (severity && severity !== "ALL") filter.severity = severity;

      const alerts = await AlertModel.find(filter).sort({ createdAt: -1 }).limit(100).lean();

      res.status(200).json({
        success: true,
        data: alerts,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
    }
  }

  static async resolveAlert(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const alert = await AlertModel.findByIdAndUpdate(id, { $set: { status: "RESOLVED" } }, { new: true });
      res.status(200).json({ success: true, data: alert, message: "Alert marked as resolved", timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
    }
  }

  static async createActionFromAlert(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const alert = await AlertModel.findById(id);
      if (!alert) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Alert not found" }, timestamp: new Date().toISOString() });
        return;
      }

      const action = await ActionModel.create({
        fieldId: alert.fieldId,
        title: `Action: ${alert.title}`,
        type: alert.condition.includes("IRR") ? "IRRIGATION" : alert.condition.includes("FERT") ? "FERTILIZER" : "GENERAL",
        priority: alert.severity === "CRITICAL" ? "URGENT" : alert.severity === "HIGH" ? "HIGH" : "MEDIUM",
        status: "PENDING",
        why: alert.description,
        what: `Inspect and address ${alert.condition} condition`,
        when: "Immediately",
        where: alert.fieldId,
        expectedResult: "Condition normalized and verified by telemetry",
        verificationMethod: "Sensor telemetry check within 2 hours",
        createdAt: new Date().toISOString(),
      });

      res.status(200).json({ success: true, data: action, message: "Action created from alert", timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
    }
  }
}
