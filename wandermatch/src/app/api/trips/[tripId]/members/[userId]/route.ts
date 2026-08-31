import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Trip from "@/models/Trip";

export async function POST(req: Request, props: { params: Promise<{ tripId: string, userId: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUserId = (session.user as any).id;
    const { action } = await req.json(); // "accept" or "reject"
    
    await dbConnect();
    
    const trip = await Trip.findById(params.tripId);
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    // Only creator can manage requests
    if (trip.creator.toString() !== currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Remove from requests regardless of action
    trip.joinRequests = trip.joinRequests.filter((id: any) => id.toString() !== params.userId);

    if (action === "accept") {
      if (!trip.members.includes(params.userId)) {
        trip.members.push(params.userId);
      }
    }

    await trip.save();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
