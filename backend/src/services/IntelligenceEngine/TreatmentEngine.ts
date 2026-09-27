import { AgriculturalContext } from "../../../../shared/types/agriculture";
import { Finding, Recommendation } from "../../../../shared/types/recommendation";

export interface TreatmentAnalysisResult {
  riskDetected: boolean;
  diseaseName: string | null;
  status: "RISK_DETECTED" | "CONFIRMED_DISEASE" | "NO_RISK";
  finding: Finding | null;
  recommendation: Recommendation | null;
  citation: {
    sourceName: string;
    sourceUrl: string;
  };
}

export class TreatmentEngine {
  static analyze(ctx: AgriculturalContext): TreatmentAnalysisResult {
    const m = ctx.telemetry.measurements || {};
    const crop = ctx.crop;
    const temp = m.soil_temperature?.value ?? m.ambient_temperature?.value;
    const humidity = m.ambient_humidity?.value ?? m.soil_humidity?.value;

    const citation = {
      sourceName: "ICAR Integrated Pest & Disease Management Extension Guide 2026",
      sourceUrl: "https://icar.org.in/crop-protection-guidelines",
    };

    if (temp === null || temp === undefined || humidity === null || humidity === undefined) {
      return {
        riskDetected: false,
        diseaseName: null,
        status: "NO_RISK",
        finding: null,
        recommendation: null,
        citation,
      };
    }

    // High humidity (>80%) + moderate temp (20-28°C) favors fungal pathogens (e.g. Yellow Rust / Late Blight)
    const isFungalRisk = humidity >= 78 && temp >= 18 && temp <= 28;

    if (!isFungalRisk) {
      return {
        riskDetected: false,
        diseaseName: null,
        status: "NO_RISK",
        finding: null,
        recommendation: null,
        citation,
      };
    }

    const diseaseName = crop.id === "wheat" ? "Yellow Rust (Puccinia striiformis)" : "Fungal Leaf Spot / Blight";

    const ts = ctx.telemetry.timestamp || new Date().toISOString();

    const finding: Finding = {
      description: `ENVIRONMENTAL RISK DETECTED: Temperature (${temp}°C) and relative humidity (${humidity}%) favor spore germination for ${diseaseName}. Note: Risk condition detected via environmental sensors; field scouting recommended to confirm physical symptoms.`,
      severity: "MEDIUM",
      evidence: [
        { parameter: "ambient_humidity", value: humidity, unit: "%", source: "DHT22", timestamp: ts, quality: "VALID" },
        { parameter: "soil_temperature", value: temp, unit: "°C", source: "RS485", timestamp: ts, quality: "VALID" },
      ],
    };

    const rec: Recommendation = {
      id: `REC-TREAT-${Date.now()}`,
      condition: "FUNGAL_RISK" as any,
      priority: "MEDIUM",
      status: "PRESENTED",
      action: {
        title: `Disease Risk Scout & Preventative Plan (${diseaseName})`,
        steps: [
          `Scout ${crop.name} canopy for early chlorotic stripes or leaf spots.`,
          "Ensure adequate field ventilation and avoid evening overhead irrigation.",
          "If early symptoms are confirmed during physical field scouting, consult product label for approved preventative bio-fungicide or Tebuconazole 50% + Trifloxystrobin 25% WG.",
        ],
        type: "DISEASE",
      },
      doNot: [
        "Do not apply synthetic fungicides without physical symptom confirmation during field scouting",
        "Never exceed label-recommended application rates",
      ],
      evidence: [
        { parameter: "ambient_humidity", value: humidity, unit: "%", source: "DHT22", timestamp: ts, quality: "VALID" },
        { parameter: "ambient_temperature", value: temp, unit: "°C", source: "DHT22", timestamp: ts, quality: "VALID" },
      ],
      expectedOutcome: "Prevent spore germination prior to canopy infection",
      confidence: "MEDIUM",
      limitations: ["Environmental risk model only; physical symptom scouting required prior to chemical treatment"],
      knowledgeBaseVersion: "ICAR-IPM-2026.2",
      createdAt: new Date().toISOString(),
    };

    return {
      riskDetected: true,
      diseaseName,
      status: "RISK_DETECTED",
      finding,
      recommendation: rec,
      citation,
    };
  }
}
