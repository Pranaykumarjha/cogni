"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UsersIcon, MapPinIcon, CalendarIcon, XIcon, HeartIcon } from "lucide-react";

export default function SwipeDeck({ trips }: { trips: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = async (dir: "left" | "right", tripId: string) => {
    if (dir === "right") {
      // Send join request
      try {
        await fetch(`/api/trips/${tripId}/requests`, { method: "POST" });
      } catch (err) {
        console.error("Failed to request join", err);
      }
    }
    
    // Move to next card
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 200);
  };

  if (currentIndex >= trips.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 max-w-sm mx-auto h-[500px]">
        <h3 className="text-xl font-medium text-white mb-2">You've seen them all!</h3>
        <p className="text-slate-400">
          Check back later for new public groups to join.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm mx-auto h-[600px] flex items-center justify-center perspective-1000">
      <AnimatePresence>
        {trips.map((trip, index) => {
          if (index < currentIndex) return null;
          
          const isFront = index === currentIndex;
          const isSecond = index === currentIndex + 1;
          
          if (!isFront && !isSecond) return null; // Only render top 2 cards for performance

          // Calculate match score circle
          const radius = 20;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (trip.score / 100) * circumference;

          return (
            <motion.div
              key={trip._id}
              className="absolute w-full h-[550px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
              style={{
                zIndex: isFront ? 10 : 0,
              }}
              initial={{ scale: isFront ? 1 : 0.95, y: isFront ? 0 : 20, opacity: isFront ? 1 : 0.8 }}
              animate={{ scale: isFront ? 1 : 0.95, y: isFront ? 0 : 20, opacity: isFront ? 1 : 0.8 }}
              drag={isFront ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(e, { offset, velocity }) => {
                const swipeThreshold = 100;
                if (offset.x > swipeThreshold) {
                  handleSwipe("right", trip._id);
                } else if (offset.x < -swipeThreshold) {
                  handleSwipe("left", trip._id);
                }
              }}
              exit={{ 
                x: 0, // This will be overridden by the onDragEnd state, but framer motion handles the unmount well enough
                opacity: 0, 
                scale: 0.8 
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="h-64 bg-slate-800 relative overflow-hidden shrink-0">
                {trip.coverImage ? (
                  <img src={trip.coverImage} alt={trip.destination} className="w-full h-full object-cover pointer-events-none" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-slate-900 flex items-center justify-center">
                    <MapPinIcon className="w-16 h-16 text-slate-700 pointer-events-none" />
                  </div>
                )}
                
                {/* Match Score */}
                <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur rounded-full p-1.5 flex items-center gap-2 border border-slate-700 pointer-events-none">
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <svg className="transform -rotate-90 w-8 h-8">
                      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-slate-700" />
                      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2.5" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="text-green-400" />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-white">{trip.score}%</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col relative bg-slate-900">
                <h3 className="text-2xl font-bold font-outfit text-white mb-4 pointer-events-none">{trip.name}</h3>
                <div className="space-y-3 mb-6 flex-1 pointer-events-none">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                      <MapPinIcon className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-base">{trip.destination}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
                      <CalendarIcon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="text-base">
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                      <UsersIcon className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-base">{trip.members?.length || 1} members</span>
                  </div>
                </div>

                {isFront && (
                  <div className="flex justify-center gap-6 mt-auto pb-2">
                    <button 
                      onClick={() => handleSwipe("left", trip._id)}
                      className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-rose-500 hover:bg-slate-700 hover:scale-110 transition-all shadow-lg"
                    >
                      <XIcon className="w-8 h-8" />
                    </button>
                    <button 
                      onClick={() => handleSwipe("right", trip._id)}
                      className="w-16 h-16 rounded-full bg-purple-600 border border-purple-500 flex items-center justify-center text-white hover:bg-purple-500 hover:scale-110 transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)]"
                    >
                      <HeartIcon className="w-7 h-7 fill-white" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        }).reverse()}
      </AnimatePresence>
    </div>
  );
}
