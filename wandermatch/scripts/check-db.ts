import mongoose from "mongoose";
import ItineraryItem from "../src/models/ItineraryItem";

const MONGODB_URI = "mongodb+srv://pranayjha952_db_user:4KvrLQ1PlVi4AZBI@cluster1.seejehd.mongodb.net/?appName=Cluster1";

async function run() {
  await mongoose.connect(MONGODB_URI);
  const items = await ItineraryItem.find({ trip: "6a9496709af958869983979f" }).lean();
  console.log("DB ITEMS COUNT:", items.length);
  console.log("ITEMS:", JSON.stringify(items, null, 2));
  process.exit(0);
}
run();
