import { TelemetryRecord } from "../../../../shared/types/telemetry";
import { AgriculturalContext } from "../../../../shared/types/agriculture";
import { SensorAnomaly } from "../../../../shared/types/intelligence";

export class AnomalyEngine {
  static analyze(ctx: AgriculturalContext, history: TelemetryRecord[]): SensorAnomaly[] {
    const anomalies: SensorAnomaly[] = [];
    const nowIso = ctx.telemetry.timestamp;

    const parametersToCheck = ["soil_moisture", "soil_temperature", "ambient_temperature", "ambient_humidity", "soil_ph"];

    for (const param of parametersToCheck) {
      const currentMeas = ctx.telemetry.measurements[param as keyof typeof ctx.telemetry.measurements];
      if (!currentMeas || currentMeas.value === null || currentMeas.state === "UNAVAILABLE") {
        if (param === "soil_moisture" || param === "nitrogen") {
          anomalies.push({
            id: `ANOM-MISSING-${param}-${Date.now()}`,
            parameter: param,
            anomalyType: "MISSING_PARAMETER",
            description: `Critical sensor parameter '${param}' is UNAVAILABLE or disconnected.`,
            severity: "MEDIUM",
            detectedAt: nowIso,
          });
        }
        continue;
      }

      const currVal = currentMeas.value;

      // 1. Check for Frozen/Stuck Sensor (identical values across 5+ history points)
      if (history.length >= 5) {
        const recentVals = history.slice(-5).map((h) => h.measurements[param as keyof typeof h.measurements]?.value);
        const allIdentical = recentVals.length === 5 && recentVals.every((v) => v !== null && v === currVal);
        if (allIdentical) {
          anomalies.push({
            id: `ANOM-FROZEN-${param}-${Date.now()}`,
            parameter: param,
            anomalyType: "FROZEN_SENSOR",
            description: `Sensor '${param}' is reporting constant value ${currVal} across 5 consecutive packets. Possible stuck hardware or driver error.`,
            severity: "HIGH",
            detectedAt: nowIso,
          });
        }
      }

      // 2. Check for Impossible Jump
      if (history.length >= 1) {
        const prevRecord = history[history.length - 1];
        const lastVal = prevRecord?.measurements[param as keyof typeof prevRecord.measurements]?.value;
        if (lastVal !== null && lastVal !== undefined) {
          const delta = Math.abs(currVal - lastVal);
          if (delta > 25) {
            anomalies.push({
              id: `ANOM-JUMP-${param}-${Date.now()}`,
              parameter: param,
              anomalyType: "IMPOSSIBLE_JUMP",
              description: `Unrealistic reading spike detected on '${param}': jumped from ${lastVal} to ${currVal} (${delta} unit change).`,
              severity: "HIGH",
              detectedAt: nowIso,
            });
          }
        }
      }
    }

    // 3. Sensor Disagreement Check
    const rain = ctx.telemetry.measurements.rainfall?.value;
    const humidity = ctx.telemetry.measurements.ambient_humidity?.value;
    if (rain !== null && rain !== undefined && rain > 5 && humidity !== null && humidity !== undefined && humidity < 25) {
      anomalies.push({
        id: `ANOM-DISAGREE-RAIN-HUM-${Date.now()}`,
        parameter: "rainfall",
        anomalyType: "SENSOR_DISAGREEMENT",
        description: `Active rain event (${rain} mm) disagrees with extremely dry ambient humidity (${humidity}%). Inspect sensor calibration.`,
        severity: "MEDIUM",
        detectedAt: nowIso,
      });
    }

    return anomalies;
  }
}
