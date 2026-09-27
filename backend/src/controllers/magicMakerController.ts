import { Request, Response } from "express";
import { MagicMakerService } from "../services/MagicMakerService";

export class MagicMakerController {
  static async evaluateMagicMaker(req: Request, res: Response): Promise<void> {
    try {
      const fieldId = (req.query.fieldId as string) || (req.body.fieldId as string) || "FIELD-PUNJAB-01";
      const cropId = (req.query.cropId as string) || (req.body.cropId as string) || "wheat";
      const growthStage = (req.query.growthStage as string) || (req.body.growthStage as string) || undefined;

      const output = await MagicMakerService.generate(fieldId, cropId, growthStage);

      res.status(200).json({
        success: true,
        data: output,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: "SERVER_ERROR", message: err.message },
        timestamp: new Date().toISOString(),
      });
    }
  }
}
