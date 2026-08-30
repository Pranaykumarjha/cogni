import mongoose, { Schema, Document } from "mongoose";

export interface ITrip extends Document {
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  coverImage?: string;
  creator: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  joinRequests: mongoose.Types.ObjectId[];
  inviteCode: string;
  status: "planning" | "confirmed" | "completed";
  isPublic: boolean;
  tags: string[];
}

const TripSchema = new Schema<ITrip>(
  {
    name: { type: String, required: true },
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    coverImage: { type: String },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    joinRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
    inviteCode: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["planning", "confirmed", "completed"],
      default: "planning",
    },
    isPublic: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Trip || mongoose.model<ITrip>("Trip", TripSchema);
