import { Request, Response } from "express";
import { ActionModel } from "../models/Action";

export class ActionController {
  static async getActions(req: Request, res: Response): Promise<void> {
    try {
      const fieldId = (req.query.fieldId as string) || "FIELD-PUNJAB-01";
      const actions = await ActionModel.find({ fieldId }).sort({ createdAt: -1 }).limit(50).lean();

      res.status(200).json({
        success: true,
        data: actions,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
    }
  }

  static async createAction(req: Request, res: Response): Promise<void> {
    try {
      const { fieldId, title, type, priority, why, what, when, where, expectedResult, verificationMethod } = req.body;
      const action = await ActionModel.create({
        fieldId: fieldId || "FIELD-PUNJAB-01",
        title: title || "Field Action Item",
        type: type || "GENERAL",
        priority: priority || "MEDIUM",
        status: "PENDING",
        why: why || "Routine maintenance",
        what: what || "Inspect crop block",
        when: when || "Today",
        where: where || fieldId || "FIELD-PUNJAB-01",
        expectedResult: expectedResult || "Optimal growth parameters maintain",
        verificationMethod: verificationMethod || "Field inspection",
        createdAt: new Date().toISOString(),
      });

      res.status(200).json({ success: true, data: action, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
    }
  }

  static async updateActionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updateData: any = { status };
      if (status === "COMPLETED") {
        updateData.completedAt = new Date().toISOString();
      }

      const updated = await ActionModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
      res.status(200).json({ success: true, data: updated, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
    }
  }
}
