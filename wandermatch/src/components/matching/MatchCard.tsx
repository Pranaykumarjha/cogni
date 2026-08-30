"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UsersIcon, MapPinIcon, CalendarIcon } from "lucide-react";

export default function MatchCard({ trip }: { trip: any }) {
  // SVG Circular progress
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (trip.score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden group hover:border-purple-500/50 transition-colors"
    >
      <div className="h-48 bg-slate-800 relative overflow-hidden">
        {trip.coverImage ? (
          <img src={trip.coverImage} alt={trip.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-slate-900 flex items-center justify-center">
            <MapPinIcon className="w-12 h-12 text-slate-700" />
          </div>
        )}
        
        {/* Compatibility Score Badge */}
        <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur rounded-full p-1.5 flex items-center gap-2 border border-slate-700">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg className="transform -rotate-90 w-8 h-8">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-slate-700" />
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)] transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-white">{trip.score}%</span>
          </div>
          <span className="text-xs font-medium text-slate-300 pr-2">Match</span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold font-outfit text-white mb-2">{trip.name}</h3>
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <MapPinIcon className="w-4 h-4 text-purple-400" />
            <span>{trip.destination}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <CalendarIcon className="w-4 h-4 text-cyan-400" />
            <span>
              {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <UsersIcon className="w-4 h-4 text-amber-400" />
            <span>{trip.members?.length || 1} members</span>
          </div>
        </div>
        
        <Button className="w-full bg-slate-800 hover:bg-purple-600 text-white transition-colors group-hover:shadow-[0_0_20px_rgba(147,51,234,0.3)]">
          Request to Join
        </Button>
      </div>
    </motion.div>
  );
}
