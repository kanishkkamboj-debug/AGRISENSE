import { Request, Response } from "express";
import { TelemetryModel } from "../models/Telemetry";

export class ReportController {
  static async exportCsv(req: Request, res: Response): Promise<void> {
    try {
      const fieldId = (req.query.fieldId as string) || "FIELD-PUNJAB-01";

      const records = await TelemetryModel.find({ fieldId }).sort({ timestamp: -1 }).limit(200).lean();

      let csv = "Timestamp,Device_ID,Field_ID,Soil_Moisture_%,Soil_Temp_C,Soil_Humidity_%,Soil_pH,Nitrogen_mgkg,Phosphorus_mgkg,Potassium_mgkg,Data_Quality,Freshness_State\n";

      for (const doc of records) {
        const m = doc.measurements instanceof Map ? Object.fromEntries(doc.measurements) : doc.measurements || {};
        const sm = m.soil_moisture?.value ?? "N/A";
        const st = m.soil_temperature?.value ?? "N/A";
        const sh = m.soil_humidity?.value ?? "N/A";
        const sph = m.soil_ph?.value ?? "N/A";
        const n = m.nitrogen?.value ?? "No sensor data";
        const p = m.phosphorus?.value ?? "No sensor data";
        const k = m.potassium?.value ?? "No sensor data";

        csv += `"${doc.timestamp}","${doc.deviceId}","${doc.fieldId}","${sm}","${st}","${sh}","${sph}","${n}","${p}","${k}","${doc.qualitySummary}","${doc.freshnessState}"\n`;
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="AgriSense_Telemetry_Report_${fieldId}.csv"`);
      res.status(200).send(csv);
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message }, timestamp: new Date().toISOString() });
    }
  }
}
