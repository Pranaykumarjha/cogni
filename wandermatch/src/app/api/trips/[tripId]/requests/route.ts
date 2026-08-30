import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Trip from "@/models/Trip";

export async function POST(req: Request, props: { params: Promise<{ tripId: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const userId = (session.user as any).id;

    const trip = await Trip.findById(params.tripId);
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    // Ensure the user isn't already a member
    if (trip.members.includes(userId) || trip.creator.toString() === userId) {
      return NextResponse.json({ error: "Already a member" }, { status: 400 });
    }

    // Add to join requests if not already there
    if (!trip.joinRequests.includes(userId)) {
      trip.joinRequests.push(userId);
      await trip.save();
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
