import mongoose, { Schema, Document } from "mongoose";

export interface IObservationDocument extends Document {
  fieldId: string;
  deviceId?: string;
  observerName?: string;
  category: "SOIL" | "PEST" | "DISEASE" | "IRRIGATION" | "FERTILIZER" | "GENERAL";
  notes: string;
  photoUrl?: string;
  location?: [number, number];
  timestamp: string;
}

const ObservationSchema = new Schema<IObservationDocument>(
  {
    fieldId: { type: String, required: true, index: true },
    deviceId: { type: String },
    observerName: { type: String, default: "Farmer / Inspector" },
    category: { type: String, enum: ["SOIL", "PEST", "DISEASE", "IRRIGATION", "FERTILIZER", "GENERAL"], required: true },
    notes: { type: String, required: true },
    photoUrl: { type: String },
    location: [{ type: Number }],
    timestamp: { type: String, required: true },
  },
  { timestamps: true }
);

export const ObservationModel = mongoose.model<IObservationDocument>("Observation", ObservationSchema);
