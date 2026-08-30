import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  trip: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
}

const MessageSchema = new Schema<IMessage>(
  {
    trip: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);
