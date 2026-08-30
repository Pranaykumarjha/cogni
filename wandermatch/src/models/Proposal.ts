import mongoose, { Schema, Document } from "mongoose";

export interface IProposal extends Document {
  trip: mongoose.Types.ObjectId;
  title: string;
  description: string;
  proposedBy: mongoose.Types.ObjectId;
  day?: number;
  category: string;
  status: "open" | "accepted" | "rejected";
  votes: {
    user: mongoose.Types.ObjectId;
    vote: "up" | "down";
    timestamp: Date;
  }[];
  deadline?: Date;
}

const ProposalSchema = new Schema<IProposal>(
  {
    trip: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    proposedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    day: { type: Number },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "accepted", "rejected"],
      default: "open",
    },
    votes: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        vote: { type: String, enum: ["up", "down"] },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    deadline: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Proposal ||
  mongoose.model<IProposal>("Proposal", ProposalSchema);
