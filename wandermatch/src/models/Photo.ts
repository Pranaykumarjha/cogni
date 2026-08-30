import mongoose, { Schema, Document } from "mongoose";

export interface IPhoto extends Document {
  trip: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  url: string;
  faces: {
    bbox: { x: number; y: number; w: number; h: number };
    descriptor: number[];
    assignedTo?: mongoose.Types.ObjectId;
  }[];
}

const PhotoSchema = new Schema<IPhoto>(
  {
    trip: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    url: { type: String, required: true },
    faces: [
      {
        bbox: {
          x: { type: Number },
          y: { type: Number },
          w: { type: Number },
          h: { type: Number },
        },
        descriptor: [{ type: Number }], // Array of numbers for float32 array
        assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Photo || mongoose.model<IPhoto>("Photo", PhotoSchema);
