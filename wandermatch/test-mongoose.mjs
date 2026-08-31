import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://pranayjha952_db_user:4KvrLQ1PlVi4AZBI@cluster1.seejehd.mongodb.net/?appName=Cluster1";

const ItineraryItemSchema = new mongoose.Schema(
  {
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
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
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: Number, required: true },
    status: {
      type: String,
      enum: ["confirmed", "proposed", "rejected"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

const ItineraryItem = mongoose.model("ItineraryItem", ItineraryItemSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  try {
    const item = {
      trip: new mongoose.Types.ObjectId().toString(),
      day: 1,
      title: "Test",
      category: "activity",
      description: "Test",
      location: "Rome",
      lat: 0,
      lng: 0,
      startTime: "09:00",
      endTime: "18:00",
      addedBy: new mongoose.Types.ObjectId().toString(),
      order: 0,
      status: "confirmed",
    };
    await ItineraryItem.create([item]);
    console.log("Success");
  } catch (error) {
    console.error("ValidationError:", error);
  }
  process.exit(0);
}
run();
