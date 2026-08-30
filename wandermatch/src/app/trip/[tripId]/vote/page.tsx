import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Trip from "@/models/Trip";
import Proposal from "@/models/Proposal";
import ProposalCard from "@/components/voting/ProposalCard";

// In a real app, you'd wrap this page in a client component that manages the modal for new proposals
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
        <div>
          <h1 className="text-2xl font-bold font-outfit text-white">Proposals & Voting</h1>
          <p className="text-sm text-slate-400">Vote on activities for {trip.name}</p>
        </div>
      </header>
      
      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serializedProposals.map((proposal) => (
            <ProposalCard
              key={proposal._id}
              proposal={proposal}
              tripId={params.tripId}
              currentUserId={userId}
            />
          ))}
          
          {serializedProposals.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <h3 className="text-xl text-white mb-2">No active proposals</h3>
              <p className="text-slate-400">Propose an activity to get the group voting!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
