import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Photo from "@/models/Photo";

export async function POST(req: Request, props: { params: Promise<{ tripId: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    await dbConnect();

    // The client sends the base64 url and the detected faces
    const photo = await Photo.create({
      trip: params.tripId,
      uploadedBy: (session.user as any).id,
      url: data.url,
      faces: data.faces,
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request, props: { params: Promise<{ tripId: string }> }) {
  const params = await props.params;
  try {
    await dbConnect();
    const photos = await Photo.find({ trip: params.tripId }).lean();
    return NextResponse.json(photos, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
