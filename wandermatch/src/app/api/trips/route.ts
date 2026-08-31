import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Trip from "@/models/Trip";
import ItineraryItem from "@/models/ItineraryItem";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

function getDayCount(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

function buildFallbackPlan(destination: string, totalDays: number) {
  const city = destination.trim() || "your destination";
  const baseActivities = [
    "Morning walking tour and local highlights",
    "Lunch at a popular local spot",
    "Afternoon sightseeing and photo stops",
    "Sunset viewpoint or scenic walk",
    "Dinner and a relaxed evening stroll",
  ];

  return Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1;
    const activity = baseActivities[index % baseActivities.length];
    return {
      day,
      title: `${activity} in ${city}`,
      category: "activity",
      description: `Day ${day} in ${city}: a relaxed, well-paced plan with must-see highlights, local food, and time to explore at your own pace.`,
      lat: 0,
      lng: 0,
      location: city,
      startTime: "09:00",
      endTime: "18:00",
    };
  });
}

async function createFallbackItinerary(destination: string, startDate: string, endDate: string, tripId: string, userId: string) {
  const totalDays = getDayCount(startDate, endDate);
  const fallbackItems = buildFallbackPlan(destination, totalDays);

  const createdItems = await ItineraryItem.create(
    fallbackItems.map((item, idx) => ({
      trip: tripId,
      day: item.day,
      title: item.title,
      category: item.category,
      description: item.description,
      location: item.location,
      lat: item.lat,
      lng: item.lng,
      startTime: item.startTime,
      endTime: item.endTime,
      addedBy: userId,
      order: idx,
      status: "confirmed",
    }))
  );

  return createdItems;
}

async function generateInitialItinerary(destination: string, startDate: string, endDate: string, tripId: string, userId: string) {
  const totalDays = getDayCount(startDate, endDate);

  if (!ai) {
    const fallbackItems = buildFallbackPlan(destination, totalDays);
    const createdItems = await ItineraryItem.create(
      fallbackItems.map((item, idx) => ({
        trip: tripId,
        day: item.day,
        title: item.title,
        category: item.category,
        description: item.description,
        location: item.location,
        lat: item.lat,
        lng: item.lng,
        startTime: item.startTime,
        endTime: item.endTime,
        addedBy: userId,
        order: idx,
        status: "confirmed",
      }))
    );
    return createdItems;
  }

  const prompt = `
    You are an expert travel planner AI.
    Create a comprehensive, realistic day-by-day itinerary for a trip to ${destination}.
    The trip lasts ${totalDays} days, from ${startDate} to ${endDate}.
    
    Requirements:
    1. Suggest specific, real places (restaurants, cafes, attractions, hotels).
    2. Fill each day completely: include breakfast spots, morning activity, lunch, afternoon activity, dinner recommendations, and transport between locations.
    3. Provide accurate, real-world GPS coordinates (lat, lng) for EVERY location so they can be accurately mapped.
    4. Re-order the activities on each day to logically cluster them geographically, minimizing travel time between stops.
    5. Write detailed, engaging descriptions for each activity, explaining what to do, see, or eat there.
    
    Return ONLY a raw JSON array, with no markdown formatting.
    Each item in the array must strictly include:
    day (number), title (string), category (MUST BE EXACTLY ONE OF: "activity", "food", "transport", "accommodation", "other"), description (detailed string), lat (number), lng (number), location (specific place name string), startTime (string HH:MM), endTime (string HH:MM).
    
    Example format:
    [{"day":1,"title":"Breakfast at Roscioli Caffè","category":"food","description":"Start the day with authentic Roman pastries and espresso at this famous local spot. Try the maritozzo.","lat":41.8938,"lng":12.4744,"location":"Roscioli Caffè, Rome","startTime":"08:30","endTime":"09:30"}]
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("AI did not return an itinerary");
  }

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

  const validCategories = ["activity", "food", "transport", "accommodation", "other"];
  const itemsToCreate = parsed.map((item: any, idx: number) => ({
    trip: tripId,
    day: Number(item.day) || idx + 1,
    title: item.title || `Day ${idx + 1}`,
    category: validCategories.includes(item.category?.toLowerCase()) ? item.category.toLowerCase() : "activity",
    description: item.description || "",
    location: item.location || destination,
    lat: Number(item.lat) || 0,
    lng: Number(item.lng) || 0,
    startTime: item.startTime || "09:00",
    endTime: item.endTime || "18:00",
    addedBy: userId,
    order: idx,
    status: "confirmed",
  }));

  return ItineraryItem.create(itemsToCreate);
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const userId = (session.user as any).id;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 401 });
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Valid start and end dates are required" }, { status: 400 });
    }

    if (endDate < startDate) {
      return NextResponse.json({ error: "End date must be after the start date" }, { status: 400 });
    }

    await dbConnect();

    const inviteCode = crypto.randomBytes(3).toString("hex").toUpperCase();

    const trip = await Trip.create({
      name: data.name,
      destination: data.destination,
      startDate,
      endDate,
      isPublic: data.isPublic || false,
      creator: userId,
      members: [userId],
      inviteCode,
      status: "planning",
    });

    try {
      const initialPlan = await generateInitialItinerary(data.destination, data.startDate, data.endDate, trip._id.toString(), userId);
      return NextResponse.json({ success: true, tripId: trip._id, itinerary: initialPlan }, { status: 201 });
    } catch (itineraryError: any) {
      console.error("Initial trip itinerary generation failed:", itineraryError);
      const fallbackPlan = await createFallbackItinerary(data.destination, data.startDate, data.endDate, trip._id.toString(), userId);
      return NextResponse.json({ success: true, tripId: trip._id, itinerary: fallbackPlan }, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
