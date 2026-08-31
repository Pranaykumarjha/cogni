import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CollageClient from "@/components/collage/CollageClient";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import dbConnect from "@/lib/db";
import Trip from "@/models/Trip";

export default async function CollagePage(props: { params: Promise<{ tripId: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  await dbConnect();
  const trip = await Trip.findById(params.tripId).lean();
  if (!trip) return <div>Trip not found</div>;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-16 z-40 px-6 py-4 flex items-center gap-4">
        <Link
          href={`/trip/${params.tripId}`}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-outfit text-white">Trip Memories</h1>
          <p className="text-sm text-slate-400">{(trip as any).name} · Photo Collage with Face Detection</p>
        </div>
      </header>
      <CollageClient tripId={params.tripId} />
    </div>
  );
}
