import mongoose, { Schema, Document } from "mongoose";

export interface ISettingDocument extends Document {
  projectName: string;
  farmDisplayName: string;
  defaultCropId: string;
  defaultLocationName: string;
  units: "METRIC" | "IMPERIAL";
  timezone: string;
  thresholds: Record<string, { min: number; max: number }>;
  deviceTimeouts: {
    onlineSeconds: number;
    staleSeconds: number;
    offlineSeconds: number;
  };
  displayPreferences: {
    refreshIntervalSeconds: number;
    defaultMapLayer: "STREETS" | "SATELLITE" | "TERRAIN";
  };
  dataManagement: {
    retentionDays: number;
    autoExportCsv: boolean;
  };
}

const SettingSchema = new Schema<ISettingDocument>(
  {
    projectName: { type: String, default: "AgriSense IoT Platform" },
    farmDisplayName: { type: String, default: "Punjab Experimental Farm" },
    defaultCropId: { type: String, default: "wheat" },
    defaultLocationName: { type: String, default: "Ludhiyana, Punjab" },
    units: { type: String, enum: ["METRIC", "IMPERIAL"], default: "METRIC" },
    timezone: { type: String, default: "Asia/Kolkata" },
    thresholds: { type: Schema.Types.Mixed, default: {} },
    deviceTimeouts: {
      onlineSeconds: { type: Number, default: 30 },
      staleSeconds: { type: Number, default: 120 },
      offlineSeconds: { type: Number, default: 120 },
    },
    displayPreferences: {
      refreshIntervalSeconds: { type: Number, default: 2 },
      defaultMapLayer: { type: String, enum: ["STREETS", "SATELLITE", "TERRAIN"], default: "STREETS" },
    },
    dataManagement: {
      retentionDays: { type: Number, default: 90 },
      autoExportCsv: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const SettingModel = mongoose.model<ISettingDocument>("Setting", SettingSchema);
