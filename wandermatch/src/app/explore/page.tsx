import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Trip from "@/models/Trip";
import User from "@/models/User";
import SwipeDeck from "@/components/matching/SwipeDeck";

export default async function ExplorePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  await dbConnect();
  const userId = (session.user as any).id;
  const user = await User.findById(userId).lean();

  if (!user) return <div>User not found</div>;

  // 1. Fetch public trips where the user is NOT a member
  const publicTrips = await Trip.find({
    isPublic: true,
    members: { $ne: userId },
    status: "planning"
  }).populate("members", "name image").lean();

  // 2. Simple matching algorithm for MVP
  // If user has a travelProfile, we can score trips.
  // We'll calculate a mock score based on tag overlap or just random for demonstration.
  
  const userInterests = user.travelProfile?.interests || [];
  
  const scoredTrips = publicTrips.map((trip: any) => {
    let score = 50; // Base score
    
    // Add score for matching tags/interests (mock logic)
    const overlap = trip.tags?.filter((t: string) => userInterests.includes(t))?.length || 0;
    score += overlap * 10;
    
    // Max score 98%
    score = Math.min(98, score + Math.floor(Math.random() * 20)); 

    return {
      _id: trip._id.toString(),
      name: trip.name,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      coverImage: trip.coverImage,
      members: trip.members.map((m: any) => ({ name: m.name, image: m.image })),
      score
    };
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold font-outfit text-white mb-4">Find Your Next Crew</h1>
        <p className="text-slate-400">
          We've matched you with open groups heading to exciting destinations based on your travel style and interests.
        </p>
      </div>

      <div className="mt-8">
        {scoredTrips.length > 0 ? (
          <SwipeDeck trips={scoredTrips} />
        ) : (
          <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 max-w-2xl mx-auto">
            <h3 className="text-xl font-medium text-white mb-2">No open groups right now</h3>
            <p className="text-slate-400">
              Check back later or create your own public trip to let others join you!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
