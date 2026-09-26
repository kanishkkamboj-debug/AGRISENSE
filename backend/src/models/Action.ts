import mongoose, { Schema, Document } from "mongoose";

export interface IActionDocument extends Document {
  fieldId: string;
  title: string;
  type: "IRRIGATION" | "FERTILIZER" | "CROP_PROTECTION" | "MAINTENANCE" | "GENERAL";
  priority: "URGENT" | "HIGH" | "MEDIUM" | "ROUTINE";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  why: string;
  what: string;
  when: string;
  where: string;
  expectedResult: string;
  verificationMethod: string;
  createdAt: string;
  completedAt?: string;
}

const ActionSchema = new Schema<IActionDocument>(
  {
    fieldId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["IRRIGATION", "FERTILIZER", "CROP_PROTECTION", "MAINTENANCE", "GENERAL"], required: true },
    priority: { type: String, enum: ["URGENT", "HIGH", "MEDIUM", "ROUTINE"], required: true },
    status: { type: String, enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"], default: "PENDING" },
    why: { type: String, required: true },
    what: { type: String, required: true },
    when: { type: String, required: true },
    where: { type: String, required: true },
    expectedResult: { type: String, required: true },
    verificationMethod: { type: String, required: true },
    createdAt: { type: String, required: true },
    completedAt: { type: String },
  },
  { timestamps: true }
);

export const ActionModel = mongoose.model<IActionDocument>("Action", ActionSchema);
