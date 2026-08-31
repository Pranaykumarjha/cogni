import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Trip from "@/models/Trip";
import ItineraryItem from "@/models/ItineraryItem";
import ItineraryEditor from "@/components/trip/ItineraryEditor";
import ExpenseSplitter from "@/components/trip/ExpenseSplitter";
import PackingList from "@/components/trip/PackingList";
import BookingSearch from "@/components/trip/BookingSearch";
import ChatDrawer from "@/components/trip/ChatDrawer";
import ExportButtons from "@/components/trip/ExportButtons";
import TripMembers from "@/components/trip/TripMembers";
import Link from "next/link";

export default async function TripPage(props: { params: Promise<{ tripId: string }>, searchParams: Promise<{ tab?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const activeTab = searchParams.tab || "itinerary";
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  await dbConnect();

  const trip = await Trip.findById(params.tripId)
    .populate("members", "_id name email image")
    .populate("joinRequests", "_id name email image")
    .lean();
  if (!trip) {
    return <div>Trip not found</div>;
  }

  const items = await ItineraryItem.find({ trip: params.tripId }).sort({ day: 1, order: 1 }).lean();

  // Convert ObjectIds to strings for passing to client components
  const initialItems = items.map((i: any) => ({
    _id: i._id.toString(),
    day: i.day,
    title: i.title,
    description: i.description,
    category: i.category,
    order: i.order,
    lat: i.lat,
    lng: i.lng,
    location: i.location,
    startTime: i.startTime,
    endTime: i.endTime,
  }));

  const serializedMembers = (trip.members as any[]).map(m => ({
    _id: m._id.toString(),
    name: m.name,
    email: m.email,
    image: m.image
  }));

  const serializedRequests = (trip.joinRequests as any[]).map(req => ({
    _id: req._id.toString(),
    name: req.name,
    email: req.email,
    image: req.image
  }));

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-16 z-40 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-white">{trip.name}</h1>
          <p className="text-sm text-slate-400">
            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            <Link 
              href={`/trip/${params.tripId}?tab=itinerary`}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "itinerary" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
            >
              Itinerary
            </Link>
            <Link 
              href={`/trip/${params.tripId}?tab=expenses`}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "expenses" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
            >
              Expenses
            </Link>
            <Link 
              href={`/trip/${params.tripId}?tab=packing`}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "packing" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
            >
              Packing
            </Link>
            <Link 
              href={`/trip/${params.tripId}?tab=search`}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "search" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
            >
              Search
            </Link>
            <Link 
              href={`/trip/${params.tripId}/vote`}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors text-slate-400 hover:text-white`}
            >
              Vote
            </Link>
            <Link 
              href={`/trip/${params.tripId}/collage`}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors text-slate-400 hover:text-white`}
            >
              Collage
            </Link>
            <Link 
              href={`/trip/${params.tripId}?tab=members`}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "members" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
            >
              Members
            </Link>
          </div>
          <div className="text-sm text-slate-300 ml-4">Invite Code: <span className="font-mono bg-slate-800 px-2 py-1 rounded">{trip.inviteCode}</span></div>
          {activeTab === "itinerary" && (
            <ExportButtons
              tripId={params.tripId}
              tripName={trip.name}
              destination={trip.destination}
              startDate={trip.startDate.toString()}
              endDate={trip.endDate.toString()}
              items={initialItems}
            />
          )}
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "itinerary" ? (
          <ItineraryEditor
            tripId={params.tripId}
            initialItems={initialItems}
            startDate={trip.startDate.toString()}
            endDate={trip.endDate.toString()}
          />
        ) : activeTab === "expenses" ? (
          <ExpenseSplitter tripId={params.tripId} />
        ) : activeTab === "packing" ? (
          <PackingList tripId={params.tripId} />
        ) : activeTab === "search" ? (
          <BookingSearch tripId={params.tripId} destination={trip.destination} />
        ) : activeTab === "members" ? (
          <TripMembers 
            tripId={params.tripId} 
            isCreator={trip.creator.toString() === (session.user as any).id} 
            members={serializedMembers} 
            joinRequests={serializedRequests} 
          />
        ) : null}
      </main>

      <ChatDrawer tripId={params.tripId} currentUserId={(session.user as any).id} />
    </div>
  );
}
