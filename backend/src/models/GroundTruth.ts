import mongoose, { Schema, Document } from "mongoose";

export interface IGroundTruthDocument extends Document {
  eventId: string;
  fieldId: string;
  timestamp: string;
  actualCondition: "NORMAL" | "MOISTURE_STRESS" | "WATERLOGGING_RISK" | "FLOOD_RISK" | "NUTRIENT_DEFICIENCY" | "FUNGAL_RISK" | "PEST_RISK";
  confirmedBy: string;
  observations: string[];
  photos: string[];
  notes?: string;
  createdAt: string;
}

const GroundTruthSchema = new Schema<IGroundTruthDocument>(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    fieldId: { type: String, required: true, index: true },
    timestamp: { type: String, required: true, index: true },
    actualCondition: {
      type: String,
      enum: ["NORMAL", "MOISTURE_STRESS", "WATERLOGGING_RISK", "FLOOD_RISK", "NUTRIENT_DEFICIENCY", "FUNGAL_RISK", "PEST_RISK"],
      required: true,
    },
    confirmedBy: { type: String, default: "FIELD_AGRONOMIST" },
    observations: [{ type: String }],
    photos: [{ type: String }],
    notes: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const GroundTruthModel = mongoose.model<IGroundTruthDocument>("GroundTruth", GroundTruthSchema);
