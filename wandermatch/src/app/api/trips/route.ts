import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Trip from "@/models/Trip";
import crypto from "crypto";

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

    await dbConnect();

    // Generate a 6-character random invite code
    const inviteCode = crypto.randomBytes(3).toString("hex").toUpperCase();

    const trip = await Trip.create({
      name: data.name,
      destination: data.destination,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isPublic: data.isPublic || false,
      creator: userId,
      members: [userId],
      inviteCode,
      status: "planning",
    });

    return NextResponse.json({ success: true, tripId: trip._id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
