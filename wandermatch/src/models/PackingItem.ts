import mongoose, { Schema, Document } from "mongoose";

export interface IPackingItem extends Document {
  trip: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  item: string;
  category: "Clothes" | "Electronics" | "Toiletries" | "Documents" | "Misc";
  isChecked: boolean;
}

const PackingItemSchema = new Schema<IPackingItem>(
  {
    trip: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    item: { type: String, required: true },
    category: {
      type: String,
      enum: ["Clothes", "Electronics", "Toiletries", "Documents", "Misc"],
      default: "Misc",
    },
    isChecked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.PackingItem ||
  mongoose.model<IPackingItem>("PackingItem", PackingItemSchema);
