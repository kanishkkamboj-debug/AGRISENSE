import { AgriculturalContext } from "../../../../shared/types/agriculture";
import { Finding, Evidence, Recommendation } from "../../../../shared/types/recommendation";

export class IrrigationAnalyzer {
  static analyze(ctx: AgriculturalContext): { findings: Finding[]; recommendation?: Recommendation } {
    const findings: Finding[] = [];
    const sm = ctx.telemetry.measurements.soil_moisture;
    const isOffline = ctx.telemetry.freshnessState === "OFFLINE";

    // Requirement 68, 69, 140: If IoT device is offline or soil moisture is unavailable, DO NOT invent values
    if (isOffline || !sm || sm.value === null || sm.state === "UNAVAILABLE") {
      const offlineEv: Evidence = {
        parameter: "soil_moisture",
        value: sm?.value ?? null,
        unit: "%",
        source: ctx.telemetry.deviceId,
        timestamp: ctx.telemetry.timestamp,
        quality: "MISSING",
      };

      findings.push({
        description: isOffline
          ? "IoT device is offline. Live soil moisture cannot be verified."
          : "Soil moisture sensor data unavailable.",
        severity: "HIGH",
        evidence: [offlineEv],
      });

      const rec: Recommendation = {
        id: `REC-IRR-OFFLINE-${Date.now()}`,
        condition: "INSUFFICIENT_DATA" as any,
        priority: "HIGH",
        status: "PRESENTED",
        action: {
          title: "Verify Device Connectivity Before Irrigation",
          steps: [
            "Current soil moisture cannot be verified because the IoT device is offline or disconnected.",
            "Reconnect the device and obtain a current moisture measurement before making an irrigation decision.",
            "Inspect physical field moisture manually if immediate decision is required.",
          ],
          type: "IRRIGATION",
        },
        doNot: ["Apply automated irrigation based on stale or missing sensor readings"],
        evidence: [offlineEv],
        expectedOutcome: "Obtain verified live soil moisture measurement",
        confidence: "LOW",
        limitations: ["Device connectivity required for automated irrigation decision."],
        knowledgeBaseVersion: "FAO-Irrigation-Paper-56",
        createdAt: new Date().toISOString(),
      };

      return { findings, recommendation: rec };
    }

    const currentMoisture = sm.value;
    const minMoisture = ctx.crop.soil.moisture.min;
    const targetMoisture = (ctx.crop.soil.moisture.min + ctx.crop.soil.moisture.max) / 2;

    const forecastRain = ctx.weather?.forecastRainfallMm72h || 0;

    const ev: Evidence = {
      parameter: "soil_moisture",
      value: currentMoisture,
      unit: "%",
      source: ctx.telemetry.deviceId,
      timestamp: ctx.telemetry.timestamp,
      quality: sm.quality || "VALID",
    };

    if (currentMoisture > 80) {
      findings.push({
        description: "Soil moisture is excessive; irrigation must be suspended.",
        severity: "HIGH",
        evidence: [ev],
      });

      const rec: Recommendation = {
        id: `REC-IRR-STOP-${Date.now()}`,
        condition: "EXCESSIVE_MOISTURE",
        priority: "URGENT",
        status: "PRESENTED",
        action: {
          title: "Stop Irrigation Immediately",
          steps: ["Turn off irrigation pump / close canal gates.", "Do not apply additional water until moisture drops below 70%."],
          type: "IRRIGATION",
        },
        doNot: ["Irrigate", "Broadcast fertilizer into saturated soil"],
        evidence: [ev],
        expectedOutcome: "Soil moisture decrease below 75%",
        confidence: "HIGH",
        limitations: [],
        knowledgeBaseVersion: "FAO-Irrigation-Paper-56",
        createdAt: new Date().toISOString(),
      };

      return { findings, recommendation: rec };
    }

    if (currentMoisture < minMoisture) {
      if (forecastRain > 15) {
        // Wait because rain is coming
        const rec: Recommendation = {
          id: `REC-IRR-WAIT-${Date.now()}`,
          condition: "MOISTURE_STRESS",
          priority: "MEDIUM",
          status: "PRESENTED",
          action: {
            title: "Wait for Forecasted Rainfall",
            steps: [
              `Heavy rainfall (${forecastRain} mm) is forecasted in next 72 hours.`,
              "Delay irrigation to prevent root-zone waterlogging.",
              "Re-evaluate soil moisture 6 hours post-rainfall.",
            ],
            type: "IRRIGATION",
          },
          doNot: ["Over-irrigate prior to rain event"],
          evidence: [ev],
          expectedOutcome: "Natural soil moisture replenishment via rainfall",
          confidence: "HIGH",
          limitations: ["Rainfall forecasts are subject to meteorological shifts."],
          knowledgeBaseVersion: "FAO-Irrigation-Paper-56",
          createdAt: new Date().toISOString(),
        };
        return { findings, recommendation: rec };
      }

      // Recommend Irrigation
      const deficitPercent = targetMoisture - currentMoisture;
      const requiredMm = parseFloat((deficitPercent * 0.8 * (ctx.currentStage.waterRequirementMmDay || 4)).toFixed(1));
      const fieldArea = ctx.field.areaHectares;
      const volumeLiters = Math.round(requiredMm * fieldArea * 10000);

      const rec: Recommendation = {
        id: `REC-IRR-START-${Date.now()}`,
        condition: "MOISTURE_STRESS",
        priority: "HIGH",
        status: "PRESENTED",
        action: {
          title: `Schedule ${ctx.crop.category === "CEREAL" ? "Drip / Furrow" : "Micro-Sprinkler"} Irrigation`,
          steps: [
            `Current moisture (${currentMoisture}%) is below crop minimum (${minMoisture}%).`,
            `Apply ${requiredMm} mm of water (~${volumeLiters.toLocaleString()} Liters for ${fieldArea} ha plot).`,
            "Irrigate during early morning (5:00 AM - 8:00 AM) or evening to minimize evaporative loss.",
            "Re-measure soil moisture 6 hours post-irrigation.",
          ],
          type: "IRRIGATION",
        },
        timing: { start: new Date().toISOString(), deadline: "Within 12 hours", reassessAfterMinutes: 360 },
        doNot: ["Flood irrigate during peak midday heat"],
        evidence: [ev],
        expectedOutcome: `Increase soil moisture from ${currentMoisture}% to ${targetMoisture}%`,
        verification: {
          parameters: ["soil_moisture"],
          targetDirection: "INCREASE",
          windowMinutes: 360,
        },
        confidence: "HIGH",
        limitations: ["Soil texture variations across plot may affect uniform infiltration."],
        knowledgeBaseVersion: "FAO-Irrigation-Paper-56",
        createdAt: new Date().toISOString(),
      };

      return { findings, recommendation: rec };
    }

    return { findings };
  }
}
