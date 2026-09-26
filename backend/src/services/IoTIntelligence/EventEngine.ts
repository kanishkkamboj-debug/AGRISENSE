import { TelemetryRecord } from "../../../../shared/types/telemetry";
import { AgriculturalContext } from "../../../../shared/types/agriculture";
import { AgriculturalEvent } from "../../../../shared/types/intelligence";
import { AgriculturalEventModel } from "../../models/AgriculturalEvent";

export class EventEngine {
  static async evaluateEvents(ctx: AgriculturalContext, history: TelemetryRecord[]): Promise<AgriculturalEvent[]> {
    const events: AgriculturalEvent[] = [];
    const nowIso = ctx.telemetry.timestamp;
    const deviceId = ctx.telemetry.deviceId;
    const fieldId = ctx.field.fieldId;

    const sm = ctx.telemetry.measurements.soil_moisture?.value;
    const temp = ctx.telemetry.measurements.ambient_temperature?.value || ctx.telemetry.measurements.soil_temperature?.value;
    const rain = ctx.telemetry.measurements.rainfall?.value || 0;
    const isOffline = ctx.telemetry.freshnessState === "OFFLINE";

    // 1. DEVICE_OFFLINE / DEVICE_RECONNECTED
    if (isOffline) {
      events.push({
        id: `EVT-OFFLINE-${deviceId}`,
        eventType: "DEVICE_OFFLINE",
        startedAt: nowIso,
        severity: "CRITICAL",
        description: `Device ${deviceId} is OFFLINE. Last telemetry received at ${nowIso}.`,
        evidence: [{ parameter: "freshnessState", value: "OFFLINE" }],
        confidence: 1.0,
        status: "ACTIVE",
      });
    }

    // 2. RAIN_STARTED / RAIN_STOPPED
    if (rain > 0) {
      events.push({
        id: `EVT-RAIN-${fieldId}`,
        eventType: "RAIN_STARTED",
        startedAt: nowIso,
        severity: rain > 15 ? "HIGH" : "LOW",
        description: `Precipitation detected (${rain} mm).`,
        evidence: [{ parameter: "rainfall", value: rain, unit: "mm" }],
        confidence: 0.95,
        status: "ACTIVE",
      });
    }

    // 3. RAPID_DRYING / SOIL_DRYING
    if (sm !== null && sm !== undefined && sm < 30) {
      events.push({
        id: `EVT-DRYING-${fieldId}`,
        eventType: sm < 20 ? "RAPID_DRYING" : "SOIL_DRYING",
        startedAt: nowIso,
        severity: sm < 20 ? "HIGH" : "MEDIUM",
        description: `Soil moisture depleted (${sm}%). Crop threshold: ${ctx.crop.soil.moisture.min}%.`,
        evidence: [{ parameter: "soil_moisture", value: sm, unit: "%" }],
        confidence: 0.9,
        status: "ACTIVE",
      });
    }

    // 4. WATERLOGGING_RISK
    if (sm !== null && sm !== undefined && sm > 85) {
      events.push({
        id: `EVT-WATERLOG-${fieldId}`,
        eventType: "WATERLOGGING_RISK",
        startedAt: nowIso,
        severity: "HIGH",
        description: `Excessive soil moisture (${sm}%). Root-zone saturation risk.`,
        evidence: [{ parameter: "soil_moisture", value: sm, unit: "%" }],
        confidence: 0.95,
        status: "ACTIVE",
      });
    }

    // 5. HEAT_EVENT
    if (temp !== null && temp !== undefined && temp > 35) {
      events.push({
        id: `EVT-HEAT-${fieldId}`,
        eventType: "HEAT_EVENT",
        startedAt: nowIso,
        severity: "HIGH",
        description: `Elevated ambient temperature (${temp}°C) exceeds heat stress threshold.`,
        evidence: [{ parameter: "ambient_temperature", value: temp, unit: "°C" }],
        confidence: 0.92,
        status: "ACTIVE",
      });
    }

    // Persist events asynchronously to DB (in non-test environments)
    if (process.env.NODE_ENV !== "test") {
      for (const evt of events) {
        AgriculturalEventModel.findOneAndUpdate(
          { fieldId, eventType: evt.eventType, status: "ACTIVE" },
          {
            $setOnInsert: {
              fieldId,
              deviceId,
              eventType: evt.eventType,
              startedAt: evt.startedAt,
              severity: evt.severity,
              description: evt.description,
              evidence: evt.evidence,
              confidence: evt.confidence,
              status: evt.status,
            },
          },
          { upsert: true }
        ).catch(() => {});
      }
    }

    return events;
  }
}
