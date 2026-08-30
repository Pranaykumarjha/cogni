import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Trip from "@/models/Trip";
import ItineraryItem from "@/models/ItineraryItem";
import PackingItem from "@/models/PackingItem";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// GET: Fetch packing list for the current user
export async function GET(req: Request, props: { params: Promise<{ tripId: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const userId = (session.user as any).id;

    const items = await PackingItem.find({ trip: params.tripId, user: userId }).lean();
    return NextResponse.json({ items }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Generate AI Packing List
export async function POST(req: Request, props: { params: Promise<{ tripId: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const userId = (session.user as any).id;
    const tripId = params.tripId;

    const trip = await Trip.findById(tripId).lean();
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    const itinerary = await ItineraryItem.find({ trip: tripId }).sort({ day: 1, order: 1 }).lean();

    const prompt = `
      You are an expert travel planner AI.
      Create a personalized packing list for a trip to ${trip.destination}.
      Trip Dates: ${new Date(trip.startDate).toLocaleDateString()} to ${new Date(trip.endDate).toLocaleDateString()}.
      
      Here are the planned activities:
      ${itinerary.map((i: any) => `- ${i.title} (${i.category})`).join("\n")}
      
      Based on the destination, time of year, and these specific activities, generate a smart packing list.
      Categorize items strictly into: "Clothes", "Electronics", "Toiletries", "Documents", or "Misc".
      
      Return a JSON array of objects. Do NOT return markdown, only the raw JSON array.
      
      Expected format:
      [
        { "item": "Passport", "category": "Documents" },
        { "item": "Hiking Boots", "category": "Clothes" },
        { "item": "Universal Adapter", "category": "Electronics" }
      ]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    
    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("AI did not return valid JSON array");
    
    const generatedItems = JSON.parse(jsonMatch[0]);

    // Clear existing packing list for this user on this trip to avoid duplicates
    await PackingItem.deleteMany({ trip: tripId, user: userId });

    // Save the new packing list
    const itemsToCreate = generatedItems.map((item: any) => ({
      trip: tripId,
      user: userId,
      item: item.item,
      category: ["Clothes", "Electronics", "Toiletries", "Documents", "Misc"].includes(item.category) 
        ? item.category 
        : "Misc",
    }));

    const createdItems = await PackingItem.create(itemsToCreate);

    return NextResponse.json({ success: true, items: createdItems }, { status: 200 });
  } catch (error: any) {
    console.error("AI Packing List Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
