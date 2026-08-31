import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import ItineraryItem from "@/models/ItineraryItem";

export async function POST(req: Request, props: { params: Promise<{ tripId: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    await dbConnect();

    const newItem = await ItineraryItem.create({
      ...data,
      trip: params.tripId,
      addedBy: (session.user as any).id,
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ tripId: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    if (!itemId) return NextResponse.json({ error: "Item ID required" }, { status: 400 });

    const data = await req.json();
    await dbConnect();

    const updated = await ItineraryItem.findByIdAndUpdate(
      itemId,
      {
        $set: {
          title: data.title,
          description: data.description,
          category: data.category,
          location: data.location,
          startTime: data.startTime,
          endTime: data.endTime,
          day: data.day,
        },
      },
      { new: true }
    );

    if (!updated) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ tripId: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    if (!itemId) return NextResponse.json({ error: "Item ID required" }, { status: 400 });

    await dbConnect();
    await ItineraryItem.findByIdAndDelete(itemId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
