import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Trip from "@/models/Trip";
import Proposal from "@/models/Proposal";
import VotingPageClient from "@/components/voting/VotingPageClient";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export default async function VotePage(props: { params: Promise<{ tripId: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  await dbConnect();

  const trip = await Trip.findById(params.tripId).lean();
  if (!trip) {
    return <div>Trip not found</div>;
  }

  const proposals = await Proposal.find({ trip: params.tripId, status: "open" }).lean();
  const userId = (session.user as any).id;

  const serializedProposals = proposals.map((p: any) => ({
    _id: p._id.toString(),
    title: p.title,
    description: p.description,
    category: p.category,
    status: p.status,
    votes: p.votes.map((v: any) => ({
      user: v.user.toString(),
      vote: v.vote,
    })),
  }));

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-16 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/trip/${params.tripId}`}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-outfit text-white">Proposals &amp; Voting</h1>
            <p className="text-sm text-slate-400">Vote on activities for {(trip as any).name}</p>
          </div>
        </div>
      </header>

      <VotingPageClient
        tripId={params.tripId}
        currentUserId={userId}
        initialProposals={serializedProposals}
      />
    </div>
  );
}
