import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Proposal from "@/models/Proposal";

export async function POST(req: Request, props: { params: Promise<{ tripId: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const { proposalId, vote } = await req.json();

    if (!proposalId || !vote) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    await dbConnect();

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Remove existing vote by user if any
    proposal.votes = proposal.votes.filter((v: any) => v.user.toString() !== userId);
    
    // Add new vote
    proposal.votes.push({ user: userId, vote, timestamp: new Date() });
    await proposal.save();

    return NextResponse.json(proposal.votes, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
