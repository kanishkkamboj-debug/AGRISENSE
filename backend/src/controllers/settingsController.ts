import { Request, Response } from "express";
import { SettingModel } from "../models/Setting";

export class SettingsController {
  static async getSettings(_req: Request, res: Response): Promise<void> {
    try {
      let settings = await SettingModel.findOne().lean();
      if (!settings) {
        settings = (await SettingModel.create({})) as any;
      }
      res.status(200).json({ success: true, data: settings, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
    }
  }

  static async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const updated = await SettingModel.findOneAndUpdate({}, { $set: req.body }, { upsert: true, new: true });
      res.status(200).json({ success: true, data: updated, message: "Settings updated successfully", timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
    }
  }
}
