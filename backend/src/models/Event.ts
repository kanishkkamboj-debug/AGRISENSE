import mongoose, { Schema, Document } from "mongoose";
import { EnvironmentalEvent } from "../../../shared/types/agriculture";

export interface IEventDocument extends Omit<EnvironmentalEvent, "id">, Document {
  fieldId: string;
}

const EventSchema = new Schema<IEventDocument>(
  {
    fieldId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["HEAVY_RAINFALL", "FLOOD", "DROUGHT", "HEATWAVE", "FROST", "DRAINAGE_FAILURE", "PEST_OUTBREAK", "DISEASE_OUTBREAK"],
      required: true,
    },
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], required: true },
    timestamp: { type: String, required: true },
    description: { type: String, required: true },
    evidence: [{ type: String }],
  },
  { timestamps: true }
);

export const EventModel = mongoose.model<IEventDocument>("Event", EventSchema);
