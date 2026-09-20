import mongoose, { Schema, Document } from "mongoose";

export interface IAlertDocument extends Document {
  fieldId: string;
  condition: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  evidence: unknown[];
  status: "ACTIVE" | "RESOLVED" | "DISMISSED";
  timestamp: string;
}

const AlertSchema = new Schema<IAlertDocument>(
  {
    fieldId: { type: String, required: true, index: true },
    condition: { type: String, required: true },
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    evidence: [{ type: Schema.Types.Mixed }],
    status: { type: String, enum: ["ACTIVE", "RESOLVED", "DISMISSED"], default: "ACTIVE" },
    timestamp: { type: String, required: true },
  },
  { timestamps: true }
);

export const AlertModel = mongoose.model<IAlertDocument>("Alert", AlertSchema);
