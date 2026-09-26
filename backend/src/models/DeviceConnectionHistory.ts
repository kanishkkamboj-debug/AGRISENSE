import mongoose, { Schema, Document } from "mongoose";

export interface IDeviceConnectionHistoryDocument extends Document {
  deviceId: string;
  fieldId?: string;
  eventType: "ONLINE" | "STALE" | "OFFLINE" | "RECONNECTING";
  timestamp: string;
  outageDurationSeconds?: number;
  lastSeen?: string;
  reason?: string;
}

const DeviceConnectionHistorySchema = new Schema<IDeviceConnectionHistoryDocument>(
  {
    deviceId: { type: String, required: true, index: true },
    fieldId: { type: String, index: true },
    eventType: { type: String, enum: ["ONLINE", "STALE", "OFFLINE", "RECONNECTING"], required: true },
    timestamp: { type: String, required: true, index: true },
    outageDurationSeconds: { type: Number, default: 0 },
    lastSeen: { type: String },
    reason: { type: String, default: "Heartbeat/Telemetry inactivity timeout" },
  },
  { timestamps: true }
);

export const DeviceConnectionHistoryModel = mongoose.model<IDeviceConnectionHistoryDocument>(
  "DeviceConnectionHistory",
  DeviceConnectionHistorySchema
);
