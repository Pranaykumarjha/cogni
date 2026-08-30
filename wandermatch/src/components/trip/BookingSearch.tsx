"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlaneIcon, BuildingIcon, SearchIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BookingSearch({ tripId, destination }: { tripId: string, destination: string }) {
  const [activeTab, setActiveTab] = useState<"flights" | "hotels">("flights");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<"mock" | "skyscanner" | null>(null);
  const router = useRouter();

  // Search form state
  const [origin, setOrigin] = useState("");
  const [date, setDate] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResults([]);
    setDataSource(null);

    try {
      if (activeTab === "flights") {
        const res = await fetch(`/api/mock/flights?origin=${origin}&destination=${destination}&date=${date}`);
        const data = await res.json();
        setResults(data.flights || []);
        setDataSource(data.source);
      } else {
        const res = await fetch(`/api/mock/hotels?destination=${destination}&checkIn=${checkIn}&checkOut=${checkOut}`);
        const data = await res.json();
        setResults(data.hotels || []);
        setDataSource(data.source);
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropose = async (item: any, type: "flight" | "hotel") => {
    const title = type === "flight" ? `Flight: ${item.airline} to ${item.destination}` : `Hotel: ${item.name}`;
    const description = type === "flight" 
      ? `${item.flightNumber} | ${item.departureTime} - ${item.arrivalTime} | $${item.price}`
      : `${item.rating} Stars | ${item.reviews} reviews | $${item.pricePerNight}/night`;

    try {
      const res = await fetch(`/api/trips/${tripId}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category: type === "flight" ? "transport" : "accommodation",
        }),
      });

      if (res.ok) {
        alert("Added to Proposals successfully!");
        router.push(`/trip/${tripId}?tab=proposals`);
      }
    } catch (err) {
      console.error("Failed to propose", err);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setActiveTab("flights"); setResults([]); setDataSource(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "flights" ? "bg-purple-600 text-white" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <PlaneIcon className="w-5 h-5" /> Flights
          </button>
          <button
            onClick={() => { setActiveTab("hotels"); setResults([]); setDataSource(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "hotels" ? "bg-cyan-600 text-white" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <BuildingIcon className="w-5 h-5" /> Hotels
          </button>
        </div>
        {dataSource && (
          <div className={`text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5 ${
            dataSource === "skyscanner" 
              ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" 
              : "bg-slate-800 text-slate-400 border border-slate-700"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${dataSource === "skyscanner" ? "bg-sky-400" : "bg-slate-500"}`} />
            {dataSource === "skyscanner" ? "Live Skyscanner Data" : "Mock Data"}
          </div>
        )}
      </div>

      <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          {activeTab === "flights" && (
            <div className="space-y-1 flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-slate-400">Origin (Airport Code)</label>
              <input
                type="text"
                placeholder="e.g. JFK"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500 uppercase"
                required
              />
            </div>
          )}
          <div className="space-y-1 flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-slate-400">Destination</label>
            <input
              type="text"
              value={destination}
              disabled
              className="w-full bg-slate-800/50 border border-slate-700/50 text-slate-500 rounded-md px-3 py-2 text-sm cursor-not-allowed"
            />
          </div>
          {activeTab === "hotels" && (
            <>
              <div className="space-y-1 flex-1 min-w-[180px]">
                <label className="text-xs font-medium text-slate-400">Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div className="space-y-1 flex-1 min-w-[180px]">
                <label className="text-xs font-medium text-slate-400">Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </>
          )}
          
          <Button type="submit" disabled={isLoading} className="bg-white text-slate-900 hover:bg-slate-200">
            <SearchIcon className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        {results.map((item) => (
          <div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between hover:border-slate-600 transition-colors">
            
            {activeTab === "flights" ? (
              <>
                <div className="flex items-center gap-6 flex-1 w-full">
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                    <PlaneIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{item.airline}</h4>
                    <p className="text-sm text-slate-400">{item.flightNumber} • {item.isDirect ? "Direct" : "1 Stop"}</p>
                  </div>
                  <div className="flex-1 flex justify-center items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-white">{item.departureTime}</p>
                      <p className="text-xs text-slate-400">{item.origin.toUpperCase()}</p>
                    </div>
                    <div className="w-16 h-px bg-slate-600 relative">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] text-slate-500 bg-slate-800 px-1 rounded">
                        {item.duration}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-white">{item.arrivalTime}</p>
                      <p className="text-xs text-slate-400">{item.destination.toUpperCase()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t border-slate-700 md:border-0 pt-4 md:pt-0">
                  <div className="text-2xl font-bold text-white">${item.price}</div>
                  <Button onClick={() => handlePropose(item, "flight")} className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg">
                    <PlusIcon className="w-4 h-4 mr-2" /> Propose
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-lg leading-tight mb-1">{item.name}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded font-medium border border-amber-500/20">
                        ★ {item.rating}
                      </span>
                      <span className="text-xs text-slate-400">({item.reviews} reviews)</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {item.amenities.map((a: string, idx: number) => (
                        <span key={idx} className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t border-slate-700 md:border-0 pt-4 md:pt-0">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">${item.pricePerNight}</div>
                    <div className="text-xs text-slate-400">per night</div>
                  </div>
                  <Button onClick={() => handlePropose(item, "hotel")} className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg">
                    <PlusIcon className="w-4 h-4 mr-2" /> Propose
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}

        {!isLoading && results.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            Search for {activeTab} to add proposals to your trip!
          </div>
        )}
      </div>
    </div>
  );
}
