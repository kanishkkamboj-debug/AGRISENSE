import mongoose, { Schema, Document } from "mongoose";

export interface IHumanReviewDocument extends Document {
  reviewId: string;
  recommendationId: string;
  fieldId: string;
  cropId: string;
  conditionCode: string;
  recommendedActionTitle: string;
  humanDecision: "ACCEPTED" | "MODIFIED" | "REJECTED" | "DEFERRED";
  decisionTimestamp: string;
  reviewerId: string;
  actualActionTaken?: string;
  overrideReason?: string;
  createdAt: string;
}

const HumanReviewSchema = new Schema<IHumanReviewDocument>(
  {
    reviewId: { type: String, required: true, unique: true, index: true },
    recommendationId: { type: String, required: true, index: true },
    fieldId: { type: String, required: true, index: true },
    cropId: { type: String, required: true },
    conditionCode: { type: String, required: true },
    recommendedActionTitle: { type: String, required: true },
    humanDecision: {
      type: String,
      enum: ["ACCEPTED", "MODIFIED", "REJECTED", "DEFERRED"],
      required: true,
    },
    decisionTimestamp: { type: String, default: () => new Date().toISOString() },
    reviewerId: { type: String, default: "FARM_MANAGER" },
    actualActionTaken: { type: String },
    overrideReason: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const HumanReviewModel = mongoose.model<IHumanReviewDocument>("HumanReview", HumanReviewSchema);
