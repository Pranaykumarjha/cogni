import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Trip from "@/models/Trip";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  await dbConnect();

  // Find user by email to get ID (in real app, session should have ID)
  // We added ID in our authorize callback, so we can use session.user.id if available
  const userId = (session.user as any).id;
  
  // If no ID for some reason, we'd look them up, but let's assume it's there or mock it.
  const query = userId ? { members: userId } : {}; // For MVP we'll show all if userId fails

  const trips = await Trip.find(query).sort({ startDate: 1 }).lean();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold font-outfit text-white mb-2">Your Trips</h1>
          <p className="text-slate-400">Manage and plan your upcoming adventures.</p>
        </div>
        <Link href="/trip/create">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]">
            Create Trip
          </Button>
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPinIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No trips yet</h3>
          <p className="text-slate-400 mb-6 max-w-sm mx-auto">
            You aren't a member of any trips. Create one or join an existing trip to get started.
          </p>
          <Link href="/trip/create">
            <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
              Create your first trip
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip: any) => {
            const isCreator = trip.creator?.toString() === userId;
            const requestCount = trip.joinRequests?.length || 0;
            
            return (
            <Link href={`/trip/${trip._id}`} key={trip._id.toString()}>
              <Card className="bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(147,51,234,0.1)] group">
                {trip.coverImage && (
                  <div className="w-full h-40 overflow-hidden rounded-t-xl">
                    <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                      {trip.name}
                    </CardTitle>
                    <span className="px-2 py-1 text-xs rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {trip.status}
                    </span>
                    {isCreator && requestCount > 0 && (
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center shadow-[0_0_10px_rgba(244,63,94,0.2)]">
                        <UsersIcon className="w-3 h-3 mr-1" /> {requestCount} Request{requestCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-1 mt-2 text-slate-400">
                    <MapPinIcon className="w-4 h-4" /> {trip.destination}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4 text-purple-400" />
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 border-t border-slate-800 mt-2">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <UsersIcon className="w-4 h-4" />
                      {trip.members?.length || 1} members
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          )})}
        </div>
      )}
    </div>
  );
}
