import { Request, Response } from "express";
import { CROP_PROFILES } from "../../../knowledge-base/crops";

export class CropController {
  static getCrops(_req: Request, res: Response): void {
    const list = Object.values(CROP_PROFILES);
    res.status(200).json({
      success: true,
      data: list,
      total: list.length,
      timestamp: new Date().toISOString(),
    });
  }

  static getCropById(req: Request, res: Response): void {
    const cropId = req.params.cropId;
    const crop = CROP_PROFILES[cropId];
    if (!crop) {
      res.status(404).json({
        success: false,
        error: { code: "CROP_NOT_FOUND", message: `Crop profile '${cropId}' not found.` },
        timestamp: new Date().toISOString(),
      });
      return;
    }
    res.status(200).json({ success: true, data: crop, timestamp: new Date().toISOString() });
  }
}
