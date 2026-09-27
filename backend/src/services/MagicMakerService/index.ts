import { CROP_PROFILES } from "../../../../knowledge-base/crops";
import { FieldModel } from "../../models/Field";
import { TelemetryModel } from "../../models/Telemetry";
import { WeatherService } from "../WeatherService";
import { ContextBuilder } from "../ContextService/ContextBuilder";
import { IntelligenceEngine } from "../IntelligenceEngine/IntelligenceEngine";
import { DataFreshnessService } from "../DataFreshnessService";
import { CropGrowthStage } from "../../../../shared/types/agriculture";

export interface MagicMakerPipelineOutput {
  selectedCrop: {
    id: string;
    name: string;
    scientificName: string;
    category: string;
    preferredMoisture: { min: number; max: number };
    preferredPH: { min: number; max: number };
    preferredTemp: { min: number; max: number; optimal: number };
  };
  fieldContext: {
    fieldId: string;
    name: string;
    locationName: string;
    centroid: [number, number];
    areaHectares: number;
  };
  currentTelemetry: {
    timestamp: string | null;
    isAvailable: boolean;
    isLive: boolean;
    dataAgeSeconds: number | null;
    moisture: number | null;
    soilTemp: number | null;
    airTemp: number | null;
    humidity: number | null;
    nitrogen: number | null;
    phosphorus: number | null;
    potassium: number | null;
    rainfall: number | null;
    statusText: string;
  };
  historicalTrends: {
    avgMoisture24h: number | null;
    minMoisture24h: number | null;
    maxMoisture24h: number | null;
    moistureTrajectory: string;
    dataPoints: number;
  };
  weather: {
    isAvailable: boolean;
    status: string;
    currentTempCelsius: number | null;
    feelsLikeCelsius: number | null;
    currentHumidityPercent: number | null;
    recentRainfallMm24h: number | null;
    windSpeedKmh: number | null;
    weatherConditionText: string;
    provider: string;
    summaryText: string;
  };
  cropSpecificRules: {
    growthStageId: string;
    growthStageName: string;
    waterRequirementMmDay: number;
    nutrientRequirement: Record<string, { min: number; max: number }>;
    stressSensitivities: Record<string, string>;
    specificConsiderations: string[];
    rulesTriggered: string[];
  };
  riskDetection: {
    primaryCondition: string;
    severity: string;
    detectedRisks: string[];
    diseaseRisks: string[];
    pestRisks: string[];
  };
  recommendation: {
    title: string;
    steps: string[];
    doNotActions: string[];
    expectedOutcome: string;
  };
  explanationAction: {
    headline: string;
    narrative: string;
    cropSpecificAdvice: string;
  };
  pipelineTrace: string[];
}

export class MagicMakerService {
  static async generate(
    fieldId = "FIELD-PUNJAB-01",
    cropId = "wheat",
    stageId?: string
  ): Promise<MagicMakerPipelineOutput> {
    const pipelineTrace: string[] = [];
    pipelineTrace.push(`[1. Crop Context] Resolving profile for cropId='${cropId}'`);

    const crop = CROP_PROFILES[cropId] || CROP_PROFILES.wheat;
    const activeStage =
      (stageId && crop.growthStages.find((s: CropGrowthStage) => s.id === stageId)) ||
      crop.growthStages[0];

    pipelineTrace.push(`[2. Field Context] Fetching spatial data for fieldId='${fieldId}'`);
    const fieldDoc = await FieldModel.findOne({ fieldId }).lean();
    const centroid: [number, number] =
      fieldDoc && Array.isArray(fieldDoc.centroid) && fieldDoc.centroid.length >= 2
        ? (fieldDoc.centroid as [number, number])
        : [30.901, 75.857];
    const fieldName = fieldDoc?.name || "Field 01 - Main Demonstration Plot";
    const locationName = fieldDoc?.locationName || "Punjab Main Plot";
    const areaHectares = fieldDoc?.areaHectares || 4.5;

    pipelineTrace.push(`[3. Telemetry Ingestion] Fetching latest sensor packet from MongoDB`);
    const latestDoc = await TelemetryModel.findOne({ fieldId }).sort({ timestamp: -1 }).lean();

    let telemetryAvailable = false;
    let isLive = false;
    let dataAgeSeconds: number | null = null;
    let moisture: number | null = null;
    let soilTemp: number | null = null;
    let airTemp: number | null = null;
    let humidity: number | null = null;
    let nitrogen: number | null = null;
    let phosphorus: number | null = null;
    let potassium: number | null = null;
    let rainfall: number | null = null;
    let telemetryStatusText = "Insufficient live data";

    if (latestDoc && latestDoc.measurements) {
      const m = latestDoc.measurements as Record<string, any>;
      const getVal = (key: string) => {
        const item = m instanceof Map ? m.get(key) : m[key];
        return item && typeof item.value === "number" ? item.value : null;
      };

      moisture = getVal("soil_moisture");
      soilTemp = getVal("soil_temperature");
      airTemp = getVal("ambient_temperature");
      humidity = getVal("ambient_humidity");
      nitrogen = getVal("nitrogen");
      phosphorus = getVal("phosphorus");
      potassium = getVal("potassium");
      rainfall = getVal("rainfall");

      if (latestDoc.timestamp) {
        dataAgeSeconds = DataFreshnessService.getDataAgeSeconds(latestDoc.timestamp);
        isLive = dataAgeSeconds !== null && dataAgeSeconds <= 30;
      }

      if (moisture !== null || soilTemp !== null || airTemp !== null) {
        telemetryAvailable = true;
        telemetryStatusText = isLive
          ? `Live hardware packet received (${dataAgeSeconds}s ago)`
          : dataAgeSeconds !== null && dataAgeSeconds <= 120
          ? `Recent hardware packet (${dataAgeSeconds}s ago)`
          : `Stale telemetry baseline (${dataAgeSeconds ?? ">120"}s ago)`;
      }
    }

    pipelineTrace.push(`[4. Historical Trends] Querying 24h telemetry time-series records`);
    const historyDocs = await TelemetryModel.find({ fieldId })
      .sort({ timestamp: -1 })
      .limit(48)
      .lean();

    let sumM = 0;
    let countM = 0;
    let minM = 999;
    let maxM = -999;
    const historyValues: number[] = [];

    for (const doc of historyDocs) {
      const m = doc.measurements as Record<string, any>;
      const val = m instanceof Map ? m.get("soil_moisture")?.value : m?.["soil_moisture"]?.value;
      if (val !== undefined && val !== null && typeof val === "number") {
        sumM += val;
        countM++;
        historyValues.push(val);
        if (val < minM) minM = val;
        if (val > maxM) maxM = val;
      }
    }

    let trajectory = "Insufficient historical data";
    if (historyValues.length >= 2) {
      const newest = historyValues[0];
      const oldest = historyValues[historyValues.length - 1];
      const diff = newest - oldest;
      if (diff > 2.0) trajectory = "Rising (+ " + diff.toFixed(1) + "%/24h)";
      else if (diff < -2.0) trajectory = "Falling (" + diff.toFixed(1) + "%/24h)";
      else trajectory = "Stable (± " + Math.abs(diff).toFixed(1) + "%)";
    }

    pipelineTrace.push(`[5. Weather Service] Fetching OpenWeather data for centroid [${centroid[0]}, ${centroid[1]}]`);
    const weatherResult = await WeatherService.getWeatherForLocation(centroid[0], centroid[1]);

    pipelineTrace.push(`[6. Crop-Specific Rules] Evaluating deterministic rules for ${crop.name} at stage '${activeStage.name}'`);
    const context = await ContextBuilder.buildContext(fieldId);
    context.crop = crop;
    context.currentStage = activeStage;
    context.field.currentCropId = crop.id;
    context.field.currentCropStage = activeStage.id;

    const analysisResult = IntelligenceEngine.evaluate(context);

    // Build crop-specific narrative & interpretation
    let moistureInterpretation = "";
    if (moisture === null) {
      moistureInterpretation = `Insufficient live data for ${crop.name} soil moisture evaluation.`;
    } else if (moisture < crop.soil.moisture.min) {
      moistureInterpretation = `Current soil moisture (${moisture}%) is BELOW ${crop.name} minimum requirement (${crop.soil.moisture.min}%). Water deficit detected.`;
    } else if (moisture > crop.soil.moisture.max) {
      moistureInterpretation = `Current soil moisture (${moisture}%) EXCEEDS ${crop.name} upper limit (${crop.soil.moisture.max}%). Risk of root hypoxia / waterlogging.`;
    } else {
      moistureInterpretation = `Current soil moisture (${moisture}%) is STRICTLY OPTIMAL for ${crop.name} (target zone: ${crop.soil.moisture.min}% - ${crop.soil.moisture.max}%).`;
    }

    let weatherSummaryText = weatherResult.isAvailable
      ? `${weatherResult.weatherConditionText}, ${weatherResult.currentTempCelsius}°C, Humidity: ${weatherResult.currentHumidityPercent}% (Source: ${weatherResult.provider})`
      : "Weather data unavailable";

    pipelineTrace.push(`[7. Risk Detection] Identified primary condition: ${analysisResult.condition.code}`);
    const detectedRisks: string[] = [];
    if (moisture !== null && moisture < crop.soil.moisture.min) {
      detectedRisks.push(`Soil Moisture Deficit (< ${crop.soil.moisture.min}%)`);
    }
    if (moisture !== null && moisture > crop.soil.moisture.max) {
      detectedRisks.push(`Soil Moisture Excess (> ${crop.soil.moisture.max}%)`);
    }

    pipelineTrace.push(`[8. Recommendation] Compiling targeted actions`);
    const topRec = analysisResult.recommendation[0];
    const recSteps = topRec?.action.steps || crop.recommendations;
    const doNotActions = topRec?.doNot || ["Do not over-irrigate during peak sun hours."];

    pipelineTrace.push(`[9. Magic Maker Synthesis] Generating structured crop-specific magic maker output`);

    const headline = `${crop.name} (${activeStage.name}) Precision Strategy`;
    const narrative = `${crop.name} currently at stage '${activeStage.name}' requires ${activeStage.waterRequirementMmDay} mm/day water. ${moistureInterpretation} Weather state: ${weatherSummaryText}.`;

    return {
      selectedCrop: {
        id: crop.id,
        name: crop.name,
        scientificName: crop.scientificName,
        category: crop.category,
        preferredMoisture: crop.soil.moisture,
        preferredPH: crop.soil.preferredPH,
        preferredTemp: crop.temperature,
      },
      fieldContext: {
        fieldId,
        name: fieldName,
        locationName,
        centroid,
        areaHectares,
      },
      currentTelemetry: {
        timestamp: latestDoc?.timestamp || null,
        isAvailable: telemetryAvailable,
        isLive,
        dataAgeSeconds,
        moisture,
        soilTemp,
        airTemp,
        humidity,
        nitrogen,
        phosphorus,
        potassium,
        rainfall,
        statusText: telemetryStatusText,
      },
      historicalTrends: {
        avgMoisture24h: countM > 0 ? parseFloat((sumM / countM).toFixed(1)) : null,
        minMoisture24h: minM !== 999 ? minM : null,
        maxMoisture24h: maxM !== -999 ? maxM : null,
        moistureTrajectory: trajectory,
        dataPoints: historyDocs.length,
      },
      weather: {
        isAvailable: weatherResult.isAvailable,
        status: weatherResult.status,
        currentTempCelsius: weatherResult.currentTempCelsius,
        feelsLikeCelsius: weatherResult.feelsLikeCelsius,
        currentHumidityPercent: weatherResult.currentHumidityPercent,
        recentRainfallMm24h: weatherResult.recentRainfallMm24h,
        windSpeedKmh: weatherResult.windSpeedKmh,
        weatherConditionText: weatherResult.weatherConditionText,
        provider: weatherResult.provider,
        summaryText: weatherSummaryText,
      },
      cropSpecificRules: {
        growthStageId: activeStage.id,
        growthStageName: activeStage.name,
        waterRequirementMmDay: activeStage.waterRequirementMmDay,
        nutrientRequirement: (activeStage.nutrientRequirement as any) || {},
        stressSensitivities: (activeStage.stressSensitivities as any) || {},
        specificConsiderations: crop.recommendations,
        rulesTriggered: analysisResult.diagnosis.findings.map((f) => f.description),
      },
      riskDetection: {
        primaryCondition: analysisResult.condition.code,
        severity: analysisResult.condition.severity,
        detectedRisks,
        diseaseRisks: crop.diseaseRisks,
        pestRisks: crop.pestRisks,
      },
      recommendation: {
        title: topRec?.action.title || `Optimized ${crop.name} Management Plan`,
        steps: recSteps,
        doNotActions,
        expectedOutcome: topRec?.expectedOutcome || `Maximize ${crop.name} yield potential while maintaining biophysical balance`,
      },
      explanationAction: {
        headline,
        narrative,
        cropSpecificAdvice: crop.recommendations[0] || `Follow ICAR/PAU agronomic practice package for ${crop.name}.`,
      },
      pipelineTrace,
    };
  }
}
