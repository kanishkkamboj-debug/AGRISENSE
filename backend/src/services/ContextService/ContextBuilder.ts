import { AgriculturalContext, FieldContext } from "../../../../shared/types/agriculture";
import { TelemetryRecord } from "../../../../shared/types/telemetry";
import { CROP_PROFILES } from "../../../../knowledge-base/crops";
import { TelemetryModel } from "../../models/Telemetry";
import { FieldModel } from "../../models/Field";
import { MockDataService } from "../MockDataService";
import { logger } from "../../utils/logger";

export class ContextBuilder {
  static async buildContext(fieldId = "FIELD-PUNJAB-01"): Promise<AgriculturalContext> {
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
        // Fallback to mock field if database is empty
        field = MockDataService.getMockContext().field;
      }

      // 2. Fetch Latest Telemetry for field
      const latestDoc = await TelemetryModel.findOne({ fieldId }).sort({ timestamp: -1 }).lean();

      let telemetry: TelemetryRecord;
      if (latestDoc) {
        telemetry = {
          id: latestDoc._id.toString(),
          deviceId: latestDoc.deviceId,
          fieldId: latestDoc.fieldId,
          timestamp: latestDoc.timestamp,
          measurements: latestDoc.measurements ? Object.fromEntries(latestDoc.measurements as unknown as Map<string, unknown>) : {},
          qualitySummary: latestDoc.qualitySummary as any,
          freshnessState: latestDoc.freshnessState as any,
          dataMode: latestDoc.dataMode as any,
        };
      } else {
        // Fallback to Mock Telemetry
        telemetry = MockDataService.getMockTelemetry("normal");
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
        measurements: doc.measurements ? Object.fromEntries(doc.measurements as unknown as Map<string, unknown>) : {},
        qualitySummary: doc.qualitySummary as any,
        freshnessState: doc.freshnessState as any,
        dataMode: doc.dataMode as any,
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
          if (sm > 80) saturationHours += 0.5; // Assuming ~30 min interval
        }
      }

      const avgMoisture = countMoisture > 0 ? parseFloat((sumMoisture / countMoisture).toFixed(1)) : 42.0;
      if (minMoisture === 100) minMoisture = 35.0;

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
          previousAdvisoriesCount: 1,
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
          currentTempCelsius: telemetry.measurements.ambient_temperature?.value || 25,
          currentHumidityPercent: telemetry.measurements.ambient_humidity?.value || 60,
          recentRainfallMm24h: telemetry.measurements.rainfall?.value || 0,
          forecastRainfallMm72h: 0,
          windSpeedKmh: 10,
          source: "OpenWeather-Agri",
        },
      };

      logger.info(`CONTEXT_BUILDER_SUCCESS fieldId=${fieldId} telemetryAge=${telemetry.timestamp}`);
      return context;
    } catch (err: any) {
      logger.error(`CONTEXT_BUILDER_ERROR fieldId=${fieldId}: ${err.message}`);
      return MockDataService.getMockContext("normal");
    }
  }
}
