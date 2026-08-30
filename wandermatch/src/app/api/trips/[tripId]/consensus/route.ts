import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Trip from "@/models/Trip";
import Proposal from "@/models/Proposal";
import ItineraryItem from "@/models/ItineraryItem";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request, props: { params: Promise<{ tripId: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const tripId = params.tripId;

    const trip = await Trip.findById(tripId).lean();
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    // Gather all existing itinerary items
    const currentItinerary = await ItineraryItem.find({ trip: tripId }).sort({ day: 1, order: 1 }).lean();
    
    // Gather all open and accepted proposals
    const proposals = await Proposal.find({ trip: tripId }).lean();
    const acceptedProposals = proposals.filter((p: any) => p.status === "accepted" || p.votes.filter((v:any) => v.vote === "up").length > p.votes.filter((v:any) => v.vote === "down").length);

    // Prompt construction
    const prompt = `
      You are an expert travel planner AI (Consensus Planner).
      Your job is to reconcile group preferences and highly-voted proposals into a workable day-by-day itinerary.
      
      Trip Destination: ${trip.destination}
      Duration: ${new Date(trip.startDate).toLocaleDateString()} to ${new Date(trip.endDate).toLocaleDateString()}
      
      Current Itinerary Items:
      ${currentItinerary.map((i: any) => `Day ${i.day}: ${i.title} (${i.category})`).join("\n")}
      
      Highly Voted / Accepted Proposals from the group:
      ${acceptedProposals.map((p: any) => `- ${p.title} (${p.category}): ${p.description}`).join("\n")}
      
      Based on this, generate an optimized, realistic day-by-day itinerary.
      IMPORTANT: Re-order the itinerary to MINIMIZE travel time between consecutive locations on the same day.
      For each location, provide approximate real-world 'lat' and 'lng' coordinates so they can be plotted on a map.
      Only return a JSON array of objects representing the new itinerary items. Do NOT return markdown, only the raw JSON array.
      
      Expected JSON Format:
      [
        {
          "day": 1,
          "title": "Visit Colosseum",
          "category": "activity",
          "description": "Morning tour of the Colosseum",
          "lat": 41.8902,
          "lng": 12.4922
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    const text = response.text;
    if (!text) throw new Error("No response from AI");

    // Extract JSON from response (handling potential markdown wrapping)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("AI did not return valid JSON array");
    
    const suggestedItems = JSON.parse(jsonMatch[0]);

    // Clear existing itinerary items to avoid duplicate stacking
    await ItineraryItem.deleteMany({ trip: tripId });

    // Save the new suggested consensus itinerary
    const userId = (session.user as any).id;
    const itemsToCreate = suggestedItems.map((item: any, idx: number) => ({
      trip: tripId,
      day: Number(item.day) || 1,
      title: item.title,
      category: item.category || "activity",
      description: item.description || "",
      lat: item.lat,
      lng: item.lng,
      addedBy: userId,
      order: idx,
    }));

    const createdItems = await ItineraryItem.create(itemsToCreate);

    return NextResponse.json({ success: true, items: createdItems }, { status: 200 });
  } catch (error: any) {
    console.error("AI Consensus Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
