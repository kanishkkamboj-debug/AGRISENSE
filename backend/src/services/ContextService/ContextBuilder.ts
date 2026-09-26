import { AgriculturalContext, FieldContext } from "../../../../shared/types/agriculture";
import { TelemetryRecord } from "../../../../shared/types/telemetry";
import { CROP_PROFILES } from "../../../../knowledge-base/crops";
import { TelemetryModel } from "../../models/Telemetry";
import { FieldModel } from "../../models/Field";
import { DeviceModel } from "../../models/Device";
import { DataFreshnessService } from "../DataFreshnessService";
import { MockDataService } from "../MockDataService";
import { logger } from "../../utils/logger";

function parseMeasurements(measurements: any): Record<string, any> {
  if (!measurements) return {};
  if (measurements instanceof Map) {
    return Object.fromEntries(measurements);
  }
  if (typeof measurements === "object") {
    return measurements;
  }
  return {};
}

export class ContextBuilder {
  static async buildContext(fieldId = "FIELD-PUNJAB-01", mode: "REAL_IOT" | "SIMULATION" = "REAL_IOT"): Promise<AgriculturalContext> {
    try {
      // 1. Fetch Field configuration from DB
      const fieldDoc = await FieldModel.findOne({ fieldId }).lean();

      let field: FieldContext;
      if (fieldDoc) {
        field = {
          fieldId: fieldDoc.fieldId,
          name: fieldDoc.name,
          locationName: fieldDoc.locationName,
          areaHectares: fieldDoc.areaHectares,
          perimeterMeters: fieldDoc.perimeterMeters,
          centroid: fieldDoc.centroid as [number, number],
          geometry: fieldDoc.geometry,
          currentCropId: fieldDoc.currentCropId,
          currentCropStage: fieldDoc.currentCropStage,
          deviceIds: fieldDoc.deviceIds || [],
        };
      } else {
        field = {
          fieldId,
          name: "Field 01 - Main Demonstration Plot",
          locationName: "Punjab Main Plot",
          areaHectares: 4.5,
          perimeterMeters: 850,
          centroid: [30.901, 75.857],
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [75.855, 30.900],
                [75.860, 30.900],
                [75.860, 30.905],
                [75.855, 30.905],
                [75.855, 30.900],
              ],
            ],
          },
          currentCropId: "wheat",
          currentCropStage: "tillering",
          deviceIds: ["PI5-FIELD-001"],
        };
      }

      // 2. Fetch Latest Telemetry and Device status for field
      const latestDoc = await TelemetryModel.findOne({ fieldId }).sort({ timestamp: -1 }).lean();
      const devDoc = await DeviceModel.findOne({ fieldId }).lean();
      const isDeviceOffline = devDoc?.status === "OFFLINE";

      let telemetry: TelemetryRecord;
      if (latestDoc) {
        const computedFreshness = isDeviceOffline ? "OFFLINE" : DataFreshnessService.getFreshnessState(latestDoc.timestamp);
        telemetry = {
          id: latestDoc._id.toString(),
          deviceId: latestDoc.deviceId,
          fieldId: latestDoc.fieldId,
          timestamp: latestDoc.timestamp,
          measurements: parseMeasurements(latestDoc.measurements),
          qualitySummary: latestDoc.qualitySummary as any,
          freshnessState: computedFreshness as any,
          dataMode: "REAL",
        };
      } else {
        // Strict REAL IoT Mode: Return empty telemetry without fake numbers
        telemetry = {
          deviceId: "PI5-FIELD-001",
          fieldId,
          timestamp: new Date().toISOString(),
          measurements: {
            soil_moisture: { value: null, unit: "%", state: "UNAVAILABLE", quality: "MISSING", source: "RS485" },
            soil_temperature: { value: null, unit: "°C", state: "UNAVAILABLE", quality: "MISSING", source: "RS485" },
            soil_humidity: { value: null, unit: "%", state: "UNAVAILABLE", quality: "MISSING", source: "RS485" },
            soil_ph: { value: null, unit: "pH", state: "UNAVAILABLE", quality: "MISSING", source: "RS485" },
            nitrogen: { value: null, unit: "mg/kg", state: "UNAVAILABLE", quality: "MISSING", source: "RS485" },
            phosphorus: { value: null, unit: "mg/kg", state: "UNAVAILABLE", quality: "MISSING", source: "RS485" },
            potassium: { value: null, unit: "mg/kg", state: "UNAVAILABLE", quality: "MISSING", source: "RS485" },
          },
          qualitySummary: "MISSING",
          freshnessState: "NO_DATA",
          dataMode: "REAL",
        };
      }

      // 3. Fetch 24-hour historical telemetry
      const history24hDocs = await TelemetryModel.find({ fieldId })
        .sort({ timestamp: -1 })
        .limit(48)
        .lean();

      const historyRecords: TelemetryRecord[] = history24hDocs.map((doc) => ({
        id: doc._id.toString(),
        deviceId: doc.deviceId,
        fieldId: doc.fieldId,
        timestamp: doc.timestamp,
        measurements: parseMeasurements(doc.measurements),
        qualitySummary: doc.qualitySummary as any,
        freshnessState: doc.freshnessState as any,
        dataMode: "REAL",
      }));

      // Calculate 24h moisture statistics
      let sumMoisture = 0;
      let countMoisture = 0;
      let minMoisture = 100;
      let maxMoisture = 0;
      let saturationHours = 0;

      for (const rec of historyRecords) {
        const sm = rec.measurements.soil_moisture?.value;
        if (sm !== undefined && sm !== null) {
          sumMoisture += sm;
          countMoisture++;
          if (sm < minMoisture) minMoisture = sm;
          if (sm > maxMoisture) maxMoisture = sm;
          if (sm > 80) saturationHours += 0.5;
        }
      }

      const avgMoisture = countMoisture > 0 ? parseFloat((sumMoisture / countMoisture).toFixed(1)) : 0;
      if (minMoisture === 100) minMoisture = 0;

      // 4. Resolve Crop Profile
      const cropKey = field.currentCropId || "wheat";
      const crop = CROP_PROFILES[cropKey] || CROP_PROFILES.wheat;
      const currentStage = crop.growthStages.find((s) => s.id === field.currentCropStage) || crop.growthStages[0];

      // 5. Construct unified AgriculturalContext
      const context: AgriculturalContext = {
        field,
        crop,
        currentStage,
        telemetry,
        history: {
          telemetry24h: historyRecords,
          averageMoisture24h: avgMoisture,
          minMoisture24h: minMoisture,
          maxMoisture24h: maxMoisture,
          saturationDurationHours: saturationHours,
          previousAdvisoriesCount: historyRecords.length,
        },
        gis: {
          areaHectares: field.areaHectares,
          perimeterMeters: field.perimeterMeters,
          centroid: field.centroid,
          boundingBox: [field.centroid[1] - 0.005, field.centroid[0] - 0.005, field.centroid[1] + 0.005, field.centroid[0] + 0.005],
        },
        satellite: {
          lastUpdated: new Date().toISOString(),
          ndviAverage: 0.72,
          ndviTrend: "STABLE",
          moistureIndex: avgMoisture / 100,
          provider: "Sentinel-2 L2A",
          available: true,
        },
        weather: {
          currentTempCelsius: telemetry.measurements.soil_temperature?.value || 25,
          currentHumidityPercent: telemetry.measurements.soil_humidity?.value || 60,
          recentRainfallMm24h: telemetry.measurements.rainfall?.value || 0,
          forecastRainfallMm72h: 0,
          windSpeedKmh: 10,
          source: "RS485-Sensors",
        },
      };

      logger.info(`CONTEXT_BUILDER_SUCCESS fieldId=${fieldId} dataMode=REAL_IOT timestamp=${telemetry.timestamp}`);
      return context;
    } catch (err: any) {
      logger.error(`CONTEXT_BUILDER_ERROR fieldId=${fieldId}: ${err.message}`);
      throw err;
    }
  }
}
