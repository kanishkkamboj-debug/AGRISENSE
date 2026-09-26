import mongoose, { Schema, Document } from "mongoose";
import { AgriculturalEvent } from "../../../shared/types/intelligence";

export interface IAgriculturalEventDocument extends Omit<AgriculturalEvent, "id">, Document {
  fieldId: string;
  deviceId: string;
}

const AgriculturalEventSchema = new Schema<IAgriculturalEventDocument>(
  {
    fieldId: { type: String, required: true, index: true },
    deviceId: { type: String, required: true, index: true },
    eventType: {
      type: String,
      enum: [
        "RAIN_STARTED",
        "RAIN_STOPPED",
        "SOIL_DRYING",
        "SOIL_WETTING",
        "RAPID_DRYING",
        "RAPID_WETTING",
        "HEAT_EVENT",
        "HUMIDITY_EVENT",
        "WATERLOGGING_RISK",
        "DROUGHT_STRESS",
        "GAS_ANOMALY",
        "SENSOR_FAILURE",
        "DEVICE_OFFLINE",
        "DEVICE_RECONNECTED",
        "IRRIGATION_RESPONSE",
        "UNEXPECTED_SENSOR_RESPONSE",
      ],
      required: true,
    },
    startedAt: { type: String, required: true },
    endedAt: { type: String },
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], required: true },
    description: { type: String, required: true },
    evidence: [{ parameter: String, value: Schema.Types.Mixed, unit: String }],
    confidence: { type: Number, default: 0.9 },
    status: { type: String, enum: ["ACTIVE", "RESOLVED"], default: "ACTIVE" },
  },
  { timestamps: true }
);

export const AgriculturalEventModel = mongoose.model<IAgriculturalEventDocument>(
  "AgriculturalEvent",
  AgriculturalEventSchema
);
