import { Request, Response } from "express";
import { FieldModel } from "../models/Field";
import { MockDataService } from "../services/MockDataService";
import { locationCache } from "../utils/cache";

export class GISController {
  static async getFields(req: Request, res: Response): Promise<void> {
    try {
      const cached = locationCache.get("ALL_FIELDS");
      if (cached) {
        res.status(200).json({ success: true, data: cached, timestamp: new Date().toISOString() });
        return;
      }

      const docs = await FieldModel.find().lean();
      let fields = docs;
      if (fields.length === 0) {
        fields = [MockDataService.getMockContext().field as any];
      }

      locationCache.set("ALL_FIELDS", fields);
      res.status(200).json({ success: true, data: fields, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
    }
  }

  static async saveField(req: Request, res: Response): Promise<void> {
    try {
      const { fieldId, name, locationName, areaHectares, perimeterMeters, centroid, geometry, currentCropId } = req.body;

      if (!fieldId || !name || !geometry) {
        res.status(400).json({ success: false, error: { code: "INVALID_FIELD_DATA", message: "fieldId, name, and geometry are required" }, timestamp: new Date().toISOString() });
        return;
      }

      const fieldDoc = await FieldModel.findOneAndUpdate(
        { fieldId },
        {
          $set: {
            name,
            locationName: locationName || "Custom Farm Field",
            areaHectares: areaHectares || 1.0,
            perimeterMeters: perimeterMeters || 400,
            centroid: centroid || [30.901, 75.857],
            geometry,
            currentCropId: currentCropId || "wheat",
          },
        },
        { upsert: true, new: true }
      );

      locationCache.clear();
      res.status(200).json({ success: true, data: fieldDoc, message: "Field boundary saved successfully", timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
    }
  }
}
