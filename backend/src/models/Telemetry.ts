import mongoose, { Schema, Document } from "mongoose";
import { TelemetryRecord } from "../../../shared/types/telemetry";

export interface ITelemetryDocument extends Omit<TelemetryRecord, "id">, Document {}

const MeasurementValueSchema = new Schema(
  {
    value: { type: Number, default: null },
    unit: { type: String, required: true },
    state: { type: String, enum: ["MEASURED", "CALCULATED", "ESTIMATED", "UNAVAILABLE"], required: true },
    quality: { type: String, required: true },
    lastUpdated: { type: String },
    source: { type: String },
  },
  { _id: false }
);

const TelemetrySchema = new Schema<ITelemetryDocument>(
  {
    deviceId: { type: String, required: true, index: true },
    fieldId: { type: String, required: true, index: true },
    timestamp: { type: String, required: true, index: true },
    measurements: {
      type: Map,
      of: MeasurementValueSchema,
      required: true,
    },
    qualitySummary: { type: String, required: true, default: "VALID" },
    freshnessState: { type: String, required: true, default: "LIVE" },
    dataMode: { type: String, enum: ["REAL", "MOCK"], default: "REAL" },
    syncStatus: { type: String, enum: ["PENDING", "SYNCHRONIZED"], default: "SYNCHRONIZED" },
  },
  { timestamps: true }
);

TelemetrySchema.index({ fieldId: 1, timestamp: -1 });
TelemetrySchema.index({ deviceId: 1, timestamp: -1 });

export const TelemetryModel = mongoose.model<ITelemetryDocument>("Telemetry", TelemetrySchema);
