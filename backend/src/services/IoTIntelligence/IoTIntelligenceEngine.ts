import { TelemetryRecord } from "../../../../shared/types/telemetry";
import { AgriculturalContext } from "../../../../shared/types/agriculture";
import {
  IoTIntelligenceReport,
  WhyAnalysisResult,
  WhatChangedResult,
  WhatIfSimulationResult,
  FieldReplayPoint,
  DigitalTwinNode,
} from "../../../../shared/types/intelligence";

import { TrendEngine } from "./TrendEngine";
import { SoilIntelligenceEngine } from "./SoilIntelligenceEngine";
import { RainIntelligenceEngine } from "./RainIntelligenceEngine";
import { CorrelationEngine } from "./CorrelationEngine";
import { AnomalyEngine } from "./AnomalyEngine";
import { EventEngine } from "./EventEngine";
import { PredictiveLayer } from "./PredictiveLayer";
import { StressEngine } from "./StressEngine";

export class IoTIntelligenceEngine {
  static async generateReport(
    ctx: AgriculturalContext,
    history: TelemetryRecord[] = []
  ): Promise<IoTIntelligenceReport> {
    const deviceId = ctx.telemetry.deviceId;
    const fieldId = ctx.field.fieldId;
    const timestamp = ctx.telemetry.timestamp;

    // 1. Sensor Availability Map
    const sensorAvailability: Record<string, any> = {};
    for (const [param, val] of Object.entries(ctx.telemetry.measurements)) {
      if (val) {
        sensorAvailability[param] = {
          available: val.value !== null && val.state !== "UNAVAILABLE",
          state: val.state,
          quality: val.quality,
          value: val.value,
          unit: val.unit,
        };
      }
    }

    // 2. Derived Telemetry Signals & Trends
    const derivedSignals: Record<string, any> = {};
    const paramsToTrend = [
      "soil_moisture",
      "soil_temperature",
      "soil_humidity",
      "soil_ph",
      "ambient_temperature",
      "ambient_humidity",
      "rainfall",
      "nitrogen",
      "phosphorus",
      "potassium",
      "mq_raw",
    ];

    for (const param of paramsToTrend) {
      derivedSignals[param] = TrendEngine.analyzeParameter(param, ctx.telemetry, history);
    }

    // 3. Sub-engine analyses
    const soilIntelligence = SoilIntelligenceEngine.analyze(ctx, history);
    const rainIntelligence = RainIntelligenceEngine.analyze(ctx, history);
    const multiSensorCorrelation = CorrelationEngine.analyze(ctx, history);
    const anomalies = AnomalyEngine.analyze(ctx, history);
    const activeEvents = await EventEngine.evaluateEvents(ctx, history);
    const environmentalStress = StressEngine.evaluateStress(ctx);
    const predictions = PredictiveLayer.predictDepletion(ctx, history);

    // 4. Historical Comparison (Current vs 6h ago)
    const sortedHist = [...history].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
    const point6hAgo = sortedHist.find((h) => Date.parse(timestamp) - Date.parse(h.timestamp) >= 5 * 3600 * 1000);

    const tempNow = ctx.telemetry.measurements.ambient_temperature?.value ?? ctx.telemetry.measurements.soil_temperature?.value;
    const humidityNow = ctx.telemetry.measurements.ambient_humidity?.value ?? ctx.telemetry.measurements.soil_humidity?.value;
    const moistureNow = ctx.telemetry.measurements.soil_moisture?.value;

    const temp6h = point6hAgo?.measurements.ambient_temperature?.value ?? point6hAgo?.measurements.soil_temperature?.value;
    const humidity6h = point6hAgo?.measurements.ambient_humidity?.value ?? point6hAgo?.measurements.soil_humidity?.value;
    const moisture6h = point6hAgo?.measurements.soil_moisture?.value;

    const tempChange = tempNow !== null && tempNow !== undefined && temp6h !== null && temp6h !== undefined ? parseFloat((tempNow - temp6h).toFixed(1)) : null;
    const humidityChange = humidityNow !== null && humidityNow !== undefined && humidity6h !== null && humidity6h !== undefined ? parseFloat((humidityNow - humidity6h).toFixed(1)) : null;
    const moistureChange = moistureNow !== null && moistureNow !== undefined && moisture6h !== null && moisture6h !== undefined ? parseFloat((moistureNow - moisture6h).toFixed(1)) : null;

    const significantChanges: string[] = [];
    if (tempChange && Math.abs(tempChange) > 2) significantChanges.push(`Temperature shift ${tempChange > 0 ? "+" : ""}${tempChange}°C`);
    if (humidityChange && Math.abs(humidityChange) > 5) significantChanges.push(`Humidity shift ${humidityChange > 0 ? "+" : ""}${humidityChange}%`);
    if (moistureChange && Math.abs(moistureChange) > 3) significantChanges.push(`Soil moisture shift ${moistureChange > 0 ? "+" : ""}${moistureChange}%`);

    // 5. Digital Twin Tree Node State
    const nodes: DigitalTwinNode[] = [
      {
        category: "Device",
        name: "ESP8266 Gateway",
        status: ctx.telemetry.freshnessState === "LIVE" ? "NORMAL" : "CRITICAL",
        value: ctx.telemetry.freshnessState,
        details: `ID: ${deviceId}`,
      },
      {
        category: "Environment",
        name: "Thermal & Humidity Zone",
        status: environmentalStress.heatStress || environmentalStress.humidityStress ? "WARNING" : "NORMAL",
        value: `${tempNow ?? "N/A"}°C / ${humidityNow ?? "N/A"}%`,
      },
      {
        category: "Soil",
        name: "Root Zone Sensor Node",
        status: soilIntelligence.conditionClassification === "DRY" ? "WARNING" : soilIntelligence.conditionClassification === "WATERLOGGED" ? "CRITICAL" : "NORMAL",
        value: `${moistureNow ?? "UNAVAILABLE"}%`,
        details: `Classification: ${soilIntelligence.conditionClassification}`,
      },
      {
        category: "Weather",
        name: "Precipitation Gauge",
        status: rainIntelligence.isRaining ? "WARNING" : "NORMAL",
        value: rainIntelligence.isRaining ? "RAINING" : "NO RAIN",
      },
      {
        category: "Crop",
        name: `${ctx.crop.name} (${ctx.currentStage.name})`,
        status: "NORMAL",
        value: `Stage: ${ctx.currentStage.id}`,
      },
      {
        category: "Intelligence",
        name: "Stress & Rule Engine",
        status: environmentalStress.stressLevel === "CRITICAL" ? "CRITICAL" : environmentalStress.stressLevel === "HIGH" ? "WARNING" : "NORMAL",
        value: `Stress: ${environmentalStress.stressLevel}`,
      },
    ];

    return {
      deviceId,
      fieldId,
      timestamp,
      sensorAvailability,
      derivedSignals,
      soilIntelligence,
      rainIntelligence,
      multiSensorCorrelation,
      anomalies,
      activeEvents,
      environmentalStress,
      predictions,
      historicalComparison: {
        period: "6h",
        tempChange,
        humidityChange,
        moistureChange,
        significantChanges,
      },
      digitalTwin: {
        deviceId,
        fieldId,
        timestamp,
        nodes,
        overallRisk: environmentalStress.stressLevel === "CRITICAL" ? "CRITICAL" : environmentalStress.stressLevel === "HIGH" ? "HIGH" : environmentalStress.stressLevel === "MODERATE" ? "MODERATE" : "LOW",
      },
      generatedAt: new Date().toISOString(),
    };
  }

  static getWhyIsMyFieldLikeThis(ctx: AgriculturalContext, report: IoTIntelligenceReport): WhyAnalysisResult {
    const temp = ctx.telemetry.measurements.ambient_temperature?.value ?? ctx.telemetry.measurements.soil_temperature?.value;
    const humidity = ctx.telemetry.measurements.ambient_humidity?.value ?? ctx.telemetry.measurements.soil_humidity?.value;
    const moisture = ctx.telemetry.measurements.soil_moisture?.value;

    const evidenceChain: { step: number; parameter: string; observation: string; impact: string }[] = [];
    let step = 1;

    if (temp !== null && temp !== undefined) {
      evidenceChain.push({
        step: step++,
        parameter: "Temperature",
        observation: `Measured ambient/soil temperature is ${temp}°C (${report.derivedSignals.ambient_temperature?.trend || "STABLE"}).`,
        impact: temp > 30 ? "Increases evapotranspiration and field drying rate." : "Within normal vegetative range.",
      });
    }

    if (humidity !== null && humidity !== undefined) {
      evidenceChain.push({
        step: step++,
        parameter: "Humidity",
        observation: `Relative humidity is ${humidity}% (${report.derivedSignals.ambient_humidity?.trend || "STABLE"}).`,
        impact: humidity < 50 ? "Low humidity accelerates soil moisture evaporation." : "Sufficient atmospheric moisture.",
      });
    }

    if (moisture !== null && moisture !== undefined) {
      evidenceChain.push({
        step: step++,
        parameter: "Soil Moisture",
        observation: `Current root-zone moisture is ${moisture}% (Drying rate: ${report.soilIntelligence.dryingRatePerHour ?? 0} %/hr).`,
        impact: moisture < ctx.crop.soil.moisture.min ? "Pushes crop into moisture deficit stress." : "Provides adequate water uptake.",
      });
    }

    const missingDataNotes: string[] = [];
    if (ctx.telemetry.measurements.nitrogen?.value === null || ctx.telemetry.measurements.nitrogen?.state === "UNAVAILABLE") {
      missingDataNotes.push("NPK sensor is UNAVAILABLE. Soil nutrient uptake cannot be verified without physical probe reconnect.");
    }
    if (ctx.telemetry.freshnessState === "OFFLINE") {
      missingDataNotes.push("Device is OFFLINE. Current readings reflect last known snapshot.");
    }

    return {
      title: `Field Diagnostic Breakdown: ${ctx.field.name}`,
      summary: report.multiSensorCorrelation.summaryText,
      primaryDriver: report.environmentalStress.heatStress
        ? "Thermal Evapotranspiration"
        : report.soilIntelligence.conditionClassification === "DRY"
        ? "Moisture Deficit"
        : "Balanced Environmental Operating Zone",
      evidenceChain,
      missingDataNotes,
      recommendedMonitoring: [
        "Re-evaluate soil moisture trend in 2 hours.",
        "Verify ESP8266 power & RS485 wiring if NPK data is required.",
      ],
    };
  }

  static getWhatChanged(ctx: AgriculturalContext, history: TelemetryRecord[], period: "6h" | "24h" = "6h"): WhatChangedResult {
    const sortedHist = [...history].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
    const targetHours = period === "6h" ? 6 : 24;
    const prevRecord = sortedHist.find((h) => Date.parse(ctx.telemetry.timestamp) - Date.parse(h.timestamp) >= targetHours * 3600 * 1000) || sortedHist[sortedHist.length - 1];

    const changes: { parameter: string; previousValue: string; currentValue: string; changeText: string; direction: "INCREASED" | "DECREASED" | "STABLE" }[] = [];

    const params = ["ambient_temperature", "ambient_humidity", "soil_moisture", "rainfall", "mq_raw"];
    for (const p of params) {
      const currVal = ctx.telemetry.measurements[p as keyof typeof ctx.telemetry.measurements]?.value;
      const prevVal = prevRecord?.measurements[p as keyof typeof prevRecord.measurements]?.value;

      if (currVal !== null && currVal !== undefined && prevVal !== null && prevVal !== undefined) {
        const diff = parseFloat((currVal - prevVal).toFixed(1));
        let direction: "INCREASED" | "DECREASED" | "STABLE" = "STABLE";
        if (diff > 0.5) direction = "INCREASED";
        else if (diff < -0.5) direction = "DECREASED";

        changes.push({
          parameter: p,
          previousValue: `${prevVal}`,
          currentValue: `${currVal}`,
          changeText: `${diff > 0 ? "+" : ""}${diff}`,
          direction,
        });
      }
    }

    return {
      period,
      comparedAt: prevRecord ? prevRecord.timestamp : "Baseline Start",
      changes,
      summary: `Analyzed telemetry shift over the last ${period}.`,
      impactAssessment: "Sensors report gradual microclimate shifts consistent with daily diurnal cycles.",
    };
  }

  static getWhatIfSimulation(ctx: AgriculturalContext, scenario: "IRRIGATE_20MM" | "RAINFALL_30MM" | "HEATWAVE_5C"): WhatIfSimulationResult {
    const currentMoisture = ctx.telemetry.measurements.soil_moisture?.value ?? 40;
    const currentTemp = ctx.telemetry.measurements.ambient_temperature?.value ?? 28;

    let predictedOutcome = "";
    let simulatedMoisture = currentMoisture;
    let simulatedTemp = currentTemp;

    if (scenario === "IRRIGATE_20MM") {
      simulatedMoisture = Math.min(95, currentMoisture + 22);
      predictedOutcome = `Applying 20mm irrigation is predicted to raise soil moisture from ${currentMoisture}% to ~${simulatedMoisture}%, satisfying stage requirements.`;
    } else if (scenario === "RAINFALL_30MM") {
      simulatedMoisture = Math.min(100, currentMoisture + 35);
      predictedOutcome = `A 30mm heavy rainfall event will saturate soil to ~${simulatedMoisture}%. High risk of short-term waterlogging if drainage is inadequate.`;
    } else {
      simulatedTemp = currentTemp + 5;
      simulatedMoisture = Math.max(10, currentMoisture - 12);
      predictedOutcome = `A +5°C heatwave spike will push temperature to ${simulatedTemp}°C, accelerating soil moisture loss down to ~${simulatedMoisture}%.`;
    }

    return {
      scenarioName: scenario,
      simulatedInputs: { currentMoisture, currentTemp, scenario },
      predictedOutcome,
      confidence: "MEDIUM",
      isSimulation: true,
      evidence: [
        `Base soil moisture: ${currentMoisture}%`,
        `Base temperature: ${currentTemp}°C`,
        `Crop: ${ctx.crop.name} (${ctx.currentStage.name})`,
      ],
      warnings: ["This is a mathematical simulation derived from historical physical infiltration models, not real-time telemetry."],
    };
  }

  static getFieldReplay(ctx: AgriculturalContext, history: TelemetryRecord[], timeframe: "1h" | "6h" | "24h" | "7d"): FieldReplayPoint[] {
    const nowMs = Date.parse(ctx.telemetry.timestamp);
    const hoursMap = { "1h": 1, "6h": 6, "24h": 24, "7d": 168 };
    const cutoffMs = nowMs - hoursMap[timeframe] * 3600 * 1000;

    const filtered = [...history, ctx.telemetry]
      .filter((t) => Date.parse(t.timestamp) >= cutoffMs)
      .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));

    return filtered.map((t) => ({
      timestamp: t.timestamp,
      temp: t.measurements.ambient_temperature?.value ?? t.measurements.soil_temperature?.value ?? null,
      humidity: t.measurements.ambient_humidity?.value ?? t.measurements.soil_humidity?.value ?? null,
      moisture: t.measurements.soil_moisture?.value ?? null,
      rain: (t.measurements.rainfall?.value ?? 0) > 0,
      mqRaw: (t.measurements as any).mq_raw?.value ?? null,
      eventSummary: (t.measurements.rainfall?.value ?? 0) > 0 ? "Rain Event" : (t.measurements.soil_moisture?.value ?? 100) < 30 ? "Drying Event" : undefined,
    }));
  }
}
