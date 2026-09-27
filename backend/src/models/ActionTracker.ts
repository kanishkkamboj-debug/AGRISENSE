import mongoose, { Schema, Document } from "mongoose";

export interface IActionTrackerDocument extends Document {
  actionId: string;
  recommendationId: string;
  fieldId: string;
  cropId: string;
  conditionCode: string;
  actionTitle: string;
  status: "PRESENTED" | "ACTION_TAKEN" | "VERIFIED" | "INEFFECTIVE" | "EXPIRED";
  executedAt?: string;
  baselineMeasurement: {
    parameter: string;
    value: number | null;
    unit: string;
    timestamp: string;
  };
  followupMeasurement?: {
    parameter: string;
    value: number | null;
    unit: string;
    timestamp: string;
  };
  outcomeStatus: "TARGET_RANGE_RESTORED" | "NO_IMPROVEMENT" | "PENDING_VERIFICATION";
  notes?: string;
  createdAt: string;
}

const ActionTrackerSchema = new Schema<IActionTrackerDocument>(
  {
    actionId: { type: String, required: true, unique: true, index: true },
    recommendationId: { type: String, required: true, index: true },
    fieldId: { type: String, required: true, index: true },
    cropId: { type: String, required: true },
    conditionCode: { type: String, required: true },
    actionTitle: { type: String, required: true },
    status: {
      type: String,
      enum: ["PRESENTED", "ACTION_TAKEN", "VERIFIED", "INEFFECTIVE", "EXPIRED"],
      default: "PRESENTED",
    },
    executedAt: { type: String },
    baselineMeasurement: {
      parameter: { type: String, required: true },
      value: { type: Number, default: null },
      unit: { type: String, default: "" },
      timestamp: { type: String, required: true },
    },
    followupMeasurement: {
      parameter: { type: String },
      value: { type: Number, default: null },
      unit: { type: String },
      timestamp: { type: String },
    },
    outcomeStatus: {
      type: String,
      enum: ["TARGET_RANGE_RESTORED", "NO_IMPROVEMENT", "PENDING_VERIFICATION"],
      default: "PENDING_VERIFICATION",
    },
    notes: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const ActionTrackerModel = mongoose.model<IActionTrackerDocument>("ActionTracker", ActionTrackerSchema);
