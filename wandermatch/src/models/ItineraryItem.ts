import mongoose, { Schema, Document } from "mongoose";

export interface IItineraryItem extends Document {
  trip: mongoose.Types.ObjectId;
  day: number;
  title: string;
  description?: string;
  location?: string;
  lat?: number;
  lng?: number;
  startTime?: string;
  endTime?: string;
  category: "activity" | "food" | "transport" | "accommodation" | "other";
  addedBy: mongoose.Types.ObjectId;
  order: number;
  status: "confirmed" | "proposed" | "rejected";
}

const ItineraryItemSchema = new Schema<IItineraryItem>(
  {
    trip: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
    day: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    startTime: { type: String },
    endTime: { type: String },
    category: {
      type: String,
      enum: ["activity", "food", "transport", "accommodation", "other"],
      required: true,
    },
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: Number, required: true },
    status: {
      type: String,
      enum: ["confirmed", "proposed", "rejected"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

export default mongoose.models.ItineraryItem ||
  mongoose.model<IItineraryItem>("ItineraryItem", ItineraryItemSchema);
