import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  travelProfile?: {
    interests: string[];
    travelStyle: "budget" | "comfort" | "luxury";
    pace: "relaxed" | "moderate" | "packed";
  };
  trips: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // optional for OAuth users
    image: { type: String },
    travelProfile: {
      interests: [{ type: String }],
      travelStyle: { type: String, enum: ["budget", "comfort", "luxury"] },
      pace: { type: String, enum: ["relaxed", "moderate", "packed"] },
    },
    trips: [{ type: Schema.Types.ObjectId, ref: "Trip" }],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
