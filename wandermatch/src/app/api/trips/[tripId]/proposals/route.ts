import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Proposal from "@/models/Proposal";

export async function POST(req: Request, props: { params: Promise<{ tripId: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    await dbConnect();

    const proposal = await Proposal.create({
      ...data,
      trip: params.tripId,
      proposedBy: (session.user as any).id,
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
