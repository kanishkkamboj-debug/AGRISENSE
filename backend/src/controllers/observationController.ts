import { Request, Response } from "express";
import { ObservationModel } from "../models/Observation";

export class ObservationController {
  static async getObservations(req: Request, res: Response): Promise<void> {
    try {
      const fieldId = (req.query.fieldId as string) || "FIELD-PUNJAB-01";
      const obs = await ObservationModel.find({ fieldId }).sort({ createdAt: -1 }).limit(50).lean();

      res.status(200).json({
        success: true,
        data: obs,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
    }
  }

  static async saveObservation(req: Request, res: Response): Promise<void> {
    try {
      const { fieldId, category, notes, photoUrl, observerName, location } = req.body;
      const obs = await ObservationModel.create({
        fieldId: fieldId || "FIELD-PUNJAB-01",
        category: category || "GENERAL",
        notes: notes || "Manual observation recorded",
        photoUrl: photoUrl || null,
        observerName: observerName || "Farmer / Inspector",
        location: location || [30.901, 75.857],
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({ success: true, data: obs, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
    }
  }
}
