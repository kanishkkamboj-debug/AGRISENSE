import mongoose, { Schema, Document } from "mongoose";

export interface IDeviceDocument extends Document {
  deviceId: string;
  fieldId?: string;
  deviceModel: string;
  agentVersion: string;
  status: "ONLINE" | "STALE" | "OFFLINE" | "RECONNECTING" | "MAINTENANCE";
  lastHeartbeat: string;
  lastTelemetry?: string;
  lastSeen?: string;
  offlineStartedAt?: string;
  lastReconnectedAt?: string;
  lastOutageDurationSeconds?: number;
  totalDisconnectsCount: number;
  dailyUptimePercent: number;
  weeklyUptimePercent: number;
  monthlyUptimePercent: number;
  firmwareVersion?: string;
  health: {
    cpuUsagePercent: number;
    ramUsagePercent: number;
    cpuTemperatureCelsius: number;
    uptimeSeconds: number;
    networkStatus: "ONLINE" | "DEGRADED" | "OFFLINE";
    ipAddress?: string;
    wifiSignalDbm?: number;
    lastHeartbeat: string;
    bufferedTelemetryCount: number;
    packetsReceived?: number;
    sensorErrors: string[];
  };
  capabilities: any[];
  sensors: any[];
}

const SensorConfigSchema = new Schema({
  id: { type: String, required: true },
  parameter: { type: String, required: true },
  driver: { type: String, required: true },
  protocol: { type: String, required: true },
  interfaceDetails: { type: Schema.Types.Mixed },
  installationDate: { type: String },
  calibrationDate: { type: String },
  calibrationCoefficient: { type: Number, default: 1.0 },
  status: { type: String, enum: ["ACTIVE", "INACTIVE", "ERROR", "CALIBRATION_REQUIRED"], default: "ACTIVE" },
});

const SensorCapabilitySchema = new Schema({
  parameter: { type: String, required: true },
  available: { type: Boolean, default: true },
  measurementType: { type: String, enum: ["MEASURED", "CALCULATED", "ESTIMATED", "UNAVAILABLE"], default: "MEASURED" },
  unit: { type: String, required: true },
  quality: { type: String, default: "VALID" },
  lastUpdated: { type: String },
});

const DeviceSchema = new Schema<IDeviceDocument>(
  {
    deviceId: { type: String, required: true, unique: true, index: true },
    fieldId: { type: String, index: true },
    deviceModel: { type: String, default: "ESP8266" },
    agentVersion: { type: String, default: "1.0.0" },
    status: { type: String, enum: ["ONLINE", "STALE", "OFFLINE", "RECONNECTING", "MAINTENANCE"], default: "ONLINE" },
    lastHeartbeat: { type: String, default: () => new Date().toISOString() },
    lastTelemetry: { type: String },
    lastSeen: { type: String },
    offlineStartedAt: { type: String },
    lastReconnectedAt: { type: String },
    lastOutageDurationSeconds: { type: Number, default: 0 },
    totalDisconnectsCount: { type: Number, default: 0 },
    dailyUptimePercent: { type: Number, default: 100.0 },
    weeklyUptimePercent: { type: Number, default: 100.0 },
    monthlyUptimePercent: { type: Number, default: 100.0 },
    firmwareVersion: { type: String, default: "v2.1.0-esp8266" },
    health: {
      cpuUsagePercent: { type: Number, default: 0 },
      ramUsagePercent: { type: Number, default: 0 },
      cpuTemperatureCelsius: { type: Number, default: 0 },
      uptimeSeconds: { type: Number, default: 0 },
      networkStatus: { type: String, enum: ["ONLINE", "DEGRADED", "OFFLINE"], default: "ONLINE" },
      ipAddress: { type: String },
      wifiSignalDbm: { type: Number },
      lastHeartbeat: { type: String },
      bufferedTelemetryCount: { type: Number, default: 0 },
      packetsReceived: { type: Number, default: 0 },
      sensorErrors: [{ type: String }],
    },
    capabilities: [SensorCapabilitySchema],
    sensors: [SensorConfigSchema],
  },
  { timestamps: true }
);

export const DeviceModel = mongoose.model<IDeviceDocument>("Device", DeviceSchema);
