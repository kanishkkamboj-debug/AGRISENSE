import { Request, Response } from "express";
import { WeatherService } from "../services/WeatherService";
import { FieldModel } from "../models/Field";

export class WeatherController {
  static async getWeather(req: Request, res: Response): Promise<void> {
    try {
      const fieldId = (req.query.fieldId as string) || "FIELD-PUNJAB-01";
      const latParam = req.query.lat ? parseFloat(req.query.lat as string) : null;
      const lngParam = req.query.lng ? parseFloat(req.query.lng as string) : null;

      let lat = latParam;
      let lng = lngParam;

      if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
        const fieldDoc = await FieldModel.findOne({ fieldId }).lean();
        if (fieldDoc && Array.isArray(fieldDoc.centroid) && fieldDoc.centroid.length >= 2) {
          lat = fieldDoc.centroid[0];
          lng = fieldDoc.centroid[1];
        } else {
          lat = 30.901;
          lng = 75.857;
        }
      }

      const weatherResult = await WeatherService.getWeatherForLocation(lat, lng);

      res.status(200).json({
        success: true,
        fieldId,
        coordinates: { lat, lng },
        data: weatherResult,
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
