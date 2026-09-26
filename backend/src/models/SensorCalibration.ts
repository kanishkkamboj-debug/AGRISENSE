import mongoose, { Schema, Document } from "mongoose";

export interface ISensorCalibrationDocument extends Document {
  deviceId: string;
  sensorId: string;
  parameter: string;
  calibrationDate: string;
  nextCalibrationDate: string;
  method: string;
  coefficient: number;
  status: "VALID" | "DUE" | "OVERDUE" | "FAILED";
  notes?: string;
}

const SensorCalibrationSchema = new Schema<ISensorCalibrationDocument>(
  {
    deviceId: { type: String, required: true, index: true },
    sensorId: { type: String, required: true },
    parameter: { type: String, required: true },
    calibrationDate: { type: String, required: true },
    nextCalibrationDate: { type: String, required: true },
    method: { type: String, default: "Standard 2-Point Buffer / Lab Calibration" },
    coefficient: { type: Number, default: 1.0 },
    status: { type: String, enum: ["VALID", "DUE", "OVERDUE", "FAILED"], default: "VALID" },
    notes: { type: String },
  },
  { timestamps: true }
);

export const SensorCalibrationModel = mongoose.model<ISensorCalibrationDocument>(
  "SensorCalibration",
  SensorCalibrationSchema
);
