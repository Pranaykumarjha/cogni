import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Trip from "@/models/Trip";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { inviteCode } = await req.json();
    if (!inviteCode) return NextResponse.json({ error: "Invite code is required" }, { status: 400 });

    await dbConnect();
    const userId = (session.user as any).id;

    const trip = await Trip.findOne({ inviteCode });
    if (!trip) return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });

    // If user is already a member
    if (trip.members.includes(userId) || trip.creator.toString() === userId) {
      return NextResponse.json({ message: "Already a member", tripId: trip._id }, { status: 200 });
    }

    // Add directly since they have the invite code
    trip.members.push(userId);
    await trip.save();

    return NextResponse.json({ success: true, tripId: trip._id }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
