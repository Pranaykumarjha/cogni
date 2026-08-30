import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User";
import Trip from "../src/models/Trip";
import ItineraryItem from "../src/models/ItineraryItem";
import Proposal from "../src/models/Proposal";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wandermatch";

async function seed() {
  try {
    console.log("Connecting to MongoDB at:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");

    // Clear existing data (optional, but good for a fresh start)
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Trip.deleteMany({});
    await ItineraryItem.deleteMany({});
    await Proposal.deleteMany({});

    // 1. Create Users
    console.log("Creating dummy users...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const user1 = await User.create({
      name: "Alex Explorer",
      email: "alex@example.com",
      password: hashedPassword,
      image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Alex",
      travelProfile: {
        interests: ["hiking", "culture", "food"],
      travelStyle: "comfort",
        pace: "moderate"
      }
    });

    const user2 = await User.create({
      name: "Sam Adventurer",
      email: "sam@example.com",
      password: hashedPassword,
      image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Sam",
      travelProfile: {
        interests: ["beach", "party", "food"],
      travelStyle: "budget",
        pace: "relaxed"
      }
    });

    // 2. Create a Trip
    console.log("Creating a dummy trip...");
    const trip = await Trip.create({
      name: "Summer in Kyoto",
      destination: "Kyoto, Japan",
      startDate: new Date("2026-07-15"),
      endDate: new Date("2026-07-22"),
      coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop",
      creator: user1._id,
      members: [user1._id, user2._id],
      inviteCode: "KYOTO26",
      isPublic: true,
      tags: ["culture", "food"],
      status: "planning"
    });

    // 3. Create Itinerary Items
    console.log("Creating dummy itinerary items...");
    await ItineraryItem.create([
      {
        trip: trip._id,
        day: 1,
        title: "Arrive at KIX Airport",
        category: "transport",
        description: "Take the Haruka Express to Kyoto Station.",
        addedBy: user1._id,
        order: 0
      },
      {
        trip: trip._id,
        day: 1,
        title: "Check into Hotel",
        category: "accommodation",
        addedBy: user1._id,
        order: 1
      },
      {
        trip: trip._id,
        day: 2,
        title: "Fushimi Inari Shrine",
        category: "activity",
        description: "Go early to avoid crowds!",
        addedBy: user2._id,
        order: 0
      }
    ]);

    // 4. Create Proposals
    console.log("Creating dummy proposals...");
    await Proposal.create({
      trip: trip._id,
      title: "Nara Day Trip",
      description: "Should we spend half a day feeding the deer in Nara?",
      category: "activity",
      proposedBy: user2._id,
      status: "open",
      votes: [
        { user: user1._id, vote: "up", timestamp: new Date() },
        { user: user2._id, vote: "up", timestamp: new Date() }
      ]
    });

    console.log("✨ Seeding completed successfully! ✨");
    console.log("-----------------------------------------");
    console.log("Test Accounts:");
    console.log("Email: alex@example.com | Password: password123");
    console.log("Email: sam@example.com  | Password: password123");
    console.log("-----------------------------------------");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
