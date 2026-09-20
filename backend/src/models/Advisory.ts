import mongoose, { Schema, Document } from "mongoose";
import { AnalysisResult } from "../../../shared/types/recommendation";

export interface IAdvisoryDocument extends Document {
  fieldId: string;
  analysisResult: AnalysisResult;
  naturalLanguageExplanation: string;
  isAiAvailable: boolean;
  generatedAt: string;
}

const AdvisorySchema = new Schema<IAdvisoryDocument>(
  {
    fieldId: { type: String, required: true, index: true },
    analysisResult: { type: Schema.Types.Mixed, required: true },
    naturalLanguageExplanation: { type: String, required: true },
    isAiAvailable: { type: Boolean, default: true },
    generatedAt: { type: String, required: true },
  },
  { timestamps: true }
);

export const AdvisoryModel = mongoose.model<IAdvisoryDocument>("Advisory", AdvisorySchema);
