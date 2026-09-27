import mongoose, { Schema, Document } from "mongoose";

export interface ICropCycleDocument extends Document {
  cycleId: string;
  fieldId: string;
  cropId: string;
  variety: string;
  plantingDate: string;
  targetHarvestDate: string;
  actualHarvestDate?: string;
  growthStage: string;
  soilType: string;
  irrigationMethod: string;
  totalWaterAppliedM3: number;
  totalFertilizerAppliedKg: number;
  predictedYieldTonsPerHa: number;
  actualYieldTonsPerHa?: number;
  status: "ACTIVE" | "HARVESTED" | "ARCHIVED";
  interventionsCount: number;
  createdAt: string;
}

const CropCycleSchema = new Schema<ICropCycleDocument>(
  {
    cycleId: { type: String, required: true, unique: true, index: true },
    fieldId: { type: String, required: true, index: true },
    cropId: { type: String, required: true },
    variety: { type: String, default: "PBW-725 (PAU High Yield)" },
    plantingDate: { type: String, required: true },
    targetHarvestDate: { type: String, required: true },
    actualHarvestDate: { type: String },
    growthStage: { type: String, default: "tillering" },
    soilType: { type: String, default: "Sandy Loam" },
    irrigationMethod: { type: String, default: "Precision Drip" },
    totalWaterAppliedM3: { type: Number, default: 0 },
    totalFertilizerAppliedKg: { type: Number, default: 0 },
    predictedYieldTonsPerHa: { type: Number, default: 4.8 },
    actualYieldTonsPerHa: { type: Number },
    status: { type: String, enum: ["ACTIVE", "HARVESTED", "ARCHIVED"], default: "ACTIVE" },
    interventionsCount: { type: Number, default: 0 },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const CropCycleModel = mongoose.model<ICropCycleDocument>("CropCycle", CropCycleSchema);
