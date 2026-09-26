import { CropProfile, CropGrowthStage } from "../../../shared/types/agriculture";
import { TelemetryRecord } from "../../../shared/types/telemetry";

export interface ParameterDelta {
  parameter: string;
  name: string;
  currentValue: number | null;
  unit: string;
  minTarget: number;
  maxTarget: number;
  optimalTarget: number;
  percentSync: number | null;
  status: "OPTIMAL" | "LOW" | "HIGH" | "CRITICAL" | "UNAVAILABLE";
  statusText: string;
}

export interface DynamicAnomaly {
  id: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  category: "SOIL" | "WATER" | "NUTRIENT" | "CLIMATE" | "HARDWARE";
}

export interface DynamicAnalysis {
  shiScore: number | null;
  shiStatus: "OPTIMAL" | "ATTENTION" | "CRITICAL" | "UNAVAILABLE";
  shiDescription: string;
  deltas: Record<string, ParameterDelta>;
  anomalies: DynamicAnomaly[];
  activeStage: CropGrowthStage | null;
  recommendations: string[];
}

/**
 * Dynamically computes real biophysical alignment metrics without fallback mock data.
 * When real telemetry is missing or systemMode === "REAL_IOT" with no physical data,
 * measurement values remain null and status displays "UNAVAILABLE".
 */
export function analyzeTelemetryAgainstCrop(
  telemetry: TelemetryRecord | null,
  crop: CropProfile | null,
  selectedStageId?: string,
  systemMode: "REAL_IOT" | "SIMULATION" = "REAL_IOT"
): DynamicAnalysis {
  if (!crop) {
    return {
      shiScore: null,
      shiStatus: "UNAVAILABLE",
      shiDescription: "No crop profile selected.",
      deltas: {},
      anomalies: [],
      activeStage: null,
      recommendations: [],
    };
  }

  const activeStage = crop.growthStages?.find((s) => s.id === selectedStageId) || crop.growthStages?.[0] || null;
  const isLiveTelemetry = systemMode === "SIMULATION" || (telemetry && (telemetry.freshnessState === "LIVE" || telemetry.freshnessState === "RECENT"));
  const m = isLiveTelemetry ? telemetry?.measurements || {} : {};

  // Helper to extract measurement numeric value if AVAILABLE and LIVE
  const getVal = (paramKey: string): number | null => {
    if (!isLiveTelemetry) return null;
    const meas = (m as any)[paramKey];
    if (meas && (meas.state === "MEASURED" || meas.state === "CALCULATED") && typeof meas.value === "number") {
      return meas.value;
    }
    return null;
  };

  const moisture = getVal("soil_moisture");
  const temp = getVal("soil_temperature") ?? getVal("ambient_temperature");
  const ph = getVal("soil_ph");
  const n = getVal("nitrogen");
  const p = getVal("phosphorus");
  const k = getVal("potassium");
  const ec = getVal("soil_ph"); // or soil_temperature

  // Determine parameter deltas vs crop targets
  const buildDelta = (
    key: string,
    name: string,
    val: number | null,
    unit: string,
    targetMin: number,
    targetMax: number,
    targetOptimal?: number
  ): ParameterDelta => {
    const opt = targetOptimal ?? (targetMin + targetMax) / 2;
    if (val === null) {
      return {
        parameter: key,
        name,
        currentValue: null,
        unit,
        minTarget: targetMin,
        maxTarget: targetMax,
        optimalTarget: opt,
        percentSync: null,
        status: "UNAVAILABLE",
        statusText: "No sensor telemetry",
      };
    }

    // Compute percent sync (100% when at optimal, dropping as it moves away)
    let sync = 100;
    if (opt > 0) {
      const diff = Math.abs(val - opt);
      const span = (targetMax - targetMin) / 2 || opt;
      sync = Math.max(0, Math.round(100 - (diff / span) * 50));
    }

    let status: ParameterDelta["status"] = "OPTIMAL";
    let statusText = "Optimal Range";

    if (val < targetMin) {
      const deficitPct = Math.round(((targetMin - val) / targetMin) * 100);
      status = val < targetMin * 0.7 ? "CRITICAL" : "LOW";
      statusText = `${deficitPct}% Below Target`;
    } else if (val > targetMax) {
      const excessPct = Math.round(((val - targetMax) / targetMax) * 100);
      status = val > targetMax * 1.3 ? "CRITICAL" : "HIGH";
      statusText = `${excessPct}% Over Capacity`;
    }

    return {
      parameter: key,
      name,
      currentValue: val,
      unit,
      minTarget: targetMin,
      maxTarget: targetMax,
      optimalTarget: opt,
      percentSync: sync,
      status,
      statusText,
    };
  };

  const deltas: Record<string, ParameterDelta> = {
    soil_moisture: buildDelta("soil_moisture", "Soil Moisture", moisture, "%", crop.soil.moisture.min, crop.soil.moisture.max),
    soil_temperature: buildDelta("soil_temperature", "Temperature", temp, "°C", crop.temperature.min, crop.temperature.max, crop.temperature.optimal),
    soil_ph: buildDelta("soil_ph", "Soil pH", ph, "pH", crop.soil.preferredPH.min, crop.soil.preferredPH.max),
    nitrogen: buildDelta("nitrogen", "Nitrogen (N)", n, "ppm", crop.nutrients.n.min, crop.nutrients.n.max, crop.nutrients.n.optimal),
    phosphorus: buildDelta("phosphorus", "Phosphorus (P)", p, "ppm", crop.nutrients.p.min, crop.nutrients.p.max, crop.nutrients.p.optimal),
    potassium: buildDelta("potassium", "Potassium (K)", k, "ppm", crop.nutrients.k.min, crop.nutrients.k.max, crop.nutrients.k.optimal),
  };

  // Calculate overall SHI score if measurements are present
  const activeDeltas = Object.values(deltas).filter((d) => d.percentSync !== null);
  let shiScore: number | null = null;
  let shiStatus: DynamicAnalysis["shiStatus"] = "UNAVAILABLE";
  let shiDescription = !isLiveTelemetry
    ? "Live telemetry unavailable — ESP8266 IoT device is offline or disconnected."
    : "Hardware sensor telemetry pending for selected field block.";

  if (activeDeltas.length > 0) {
    const totalSync = activeDeltas.reduce((acc, curr) => acc + (curr.percentSync || 0), 0);
    shiScore = Math.round(totalSync / activeDeltas.length);

    if (shiScore >= 80) {
      shiStatus = "OPTIMAL";
      shiDescription = `Current soil & ambient metrics show strong alignment (${shiScore}%) with ${crop.name} demands.`;
    } else if (shiScore >= 60) {
      shiStatus = "ATTENTION";
      shiDescription = `Moderate metabolic stress detected for ${crop.name}. Check parameter deltas.`;
    } else {
      shiStatus = "CRITICAL";
      shiDescription = `Severe environmental stress detected for ${crop.name}. Immediate corrective action recommended.`;
    }
  }

  // Generate dynamic anomalies from telemetry vs crop stress thresholds
  const anomalies: DynamicAnomaly[] = [];

  if (moisture !== null) {
    if (moisture < crop.soil.moisture.min) {
      anomalies.push({
        id: "moisture-deficit",
        severity: moisture < crop.soil.moisture.min * 0.7 ? "CRITICAL" : "HIGH",
        title: "Soil Moisture Deficit",
        description: `Soil moisture (${moisture}%) is below minimum target (${crop.soil.moisture.min}%) for ${crop.name}.`,
        category: "WATER",
      });
    } else if (moisture > crop.soil.moisture.max) {
      anomalies.push({
        id: "moisture-excess",
        severity: moisture > crop.soil.moisture.max * 1.2 ? "HIGH" : "MEDIUM",
        title: "Waterlogging / Saturated Root Zone",
        description: `Soil moisture (${moisture}%) exceeds upper threshold (${crop.soil.moisture.max}%). Drainage required.`,
        category: "WATER",
      });
    }
  }

  if (n !== null) {
    if (n < crop.nutrients.n.min) {
      anomalies.push({
        id: "nitrogen-deficit",
        severity: "MEDIUM",
        title: "Nitrogen Deficiency",
        description: `Soil nitrogen (${n} ppm) is below recommended stage min (${crop.nutrients.n.min} ppm).`,
        category: "NUTRIENT",
      });
    } else if (n > crop.nutrients.n.max * 1.25) {
      anomalies.push({
        id: "nitrogen-leaching",
        severity: "HIGH",
        title: "Nitrogen Toxicity / Leaching Risk",
        description: `Excess nitrogen levels (${n} ppm vs max ${crop.nutrients.n.max} ppm). High leaching vulnerability.`,
        category: "NUTRIENT",
      });
    }
  }

  if (temp !== null) {
    if (temp > crop.temperature.max) {
      anomalies.push({
        id: "heat-stress",
        severity: "HIGH",
        title: "High Canopy Heat Stress",
        description: `Ambient temperature (${temp}°C) exceeds max crop tolerance (${crop.temperature.max}°C).`,
        category: "CLIMATE",
      });
    }
  }

  if (systemMode === "REAL_IOT" && !telemetry) {
    anomalies.push({
      id: "hardware-offline",
      severity: "MEDIUM",
      title: "Real Hardware Telemetry Awaiting Ingestion",
      description: "Raspberry Pi 5 IoT Hub stream listening on field node. Standby for sensor burst.",
      category: "HARDWARE",
    });
  }

  // Dynamic recommendations
  const recommendations: string[] = [...(crop.recommendations || [])];

  if (moisture !== null && moisture < crop.soil.moisture.min) {
    recommendations.unshift(`Irrigate field block to bring moisture up to optimal range (${crop.soil.moisture.min}–${crop.soil.moisture.max}%).`);
  }
  if (n !== null && n < crop.nutrients.n.min) {
    recommendations.unshift(`Apply top-dress nitrogen fertilizer to satisfy ${activeStage?.name || "growth"} stage demand.`);
  }

  return {
    shiScore,
    shiStatus,
    shiDescription,
    deltas,
    anomalies,
    activeStage,
    recommendations,
  };
}
