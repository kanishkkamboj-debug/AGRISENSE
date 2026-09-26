import mongoose, { Schema, Document } from "mongoose";

export interface IContextSnapshotDocument extends Document {
  fieldId: string;
  analysisId: string;
  telemetrySnapshot: any;
  weatherSnapshot: any;
  fieldSnapshot: any;
  cropSnapshot: any;
  sensorHealthSnapshot: any;
  ruleSnapshot: any;
  createdAt: string;
}

const ContextSnapshotSchema = new Schema<IContextSnapshotDocument>(
  {
    fieldId: { type: String, required: true, index: true },
    analysisId: { type: String, required: true, unique: true, index: true },
    telemetrySnapshot: { type: Schema.Types.Mixed, required: true },
    weatherSnapshot: { type: Schema.Types.Mixed, required: true },
    fieldSnapshot: { type: Schema.Types.Mixed, required: true },
    cropSnapshot: { type: Schema.Types.Mixed, required: true },
    sensorHealthSnapshot: { type: Schema.Types.Mixed, required: true },
    ruleSnapshot: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: String, required: true },
  },
  { timestamps: true }
);

export const ContextSnapshotModel = mongoose.model<IContextSnapshotDocument>(
  "ContextSnapshot",
  ContextSnapshotSchema
);
