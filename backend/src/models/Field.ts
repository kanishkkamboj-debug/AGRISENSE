import mongoose, { Schema, Document } from "mongoose";
import { FieldContext } from "../../../shared/types/agriculture";

export interface IFieldDocument extends Omit<FieldContext, "id">, Document {}

const FieldSchema = new Schema<IFieldDocument>(
  {
    fieldId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    locationName: { type: String, default: "Punjab Field 01" },
    areaHectares: { type: Number, required: true },
    perimeterMeters: { type: Number, required: true },
    centroid: { type: [Number], required: true }, // [lat, lng]
    geometry: {
      type: { type: String, enum: ["Polygon", "Feature", "FeatureCollection"], default: "Polygon" },
      coordinates: { type: Schema.Types.Mixed, required: true },
    },
    currentCropId: { type: String, default: "wheat" },
    currentCropStage: { type: String, default: "tillering" },
    deviceIds: [{ type: String }],
  },
  { timestamps: true }
);

export const FieldModel = mongoose.model<IFieldDocument>("Field", FieldSchema);
