"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
  SparklesIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UtensilsIcon,
  CameraIcon,
  PlaneIcon,
  ShoppingBagIcon,
  BedIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
} from "lucide-react";

interface ItineraryItem {
  day: number;
  title: string;
  category: string;
  description: string;
  location: string;
  startTime?: string;
  endTime?: string;
}

const categoryConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  activity: { icon: <CameraIcon className="w-3.5 h-3.5" />, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  food: { icon: <UtensilsIcon className="w-3.5 h-3.5" />, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  transport: { icon: <PlaneIcon className="w-3.5 h-3.5" />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  shopping: { icon: <ShoppingBagIcon className="w-3.5 h-3.5" />, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
  accommodation: { icon: <BedIcon className="w-3.5 h-3.5" />, color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20" },
};
function getCfg(cat: string) { return categoryConfig[cat?.toLowerCase()] || categoryConfig["activity"]; }

const DAY_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-teal-500 to-cyan-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-green-600",
  "from-sky-500 to-blue-600",
];

const LOADING_MESSAGES = [
  "Scanning world destinations...",
  "Crafting your perfect day-by-day plan...",
  "Finding hidden gems and local spots...",
  "Balancing culture, food & adventure...",
  "Finalising your AI itinerary...",
];

function CyclingMessage() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(p => (p + 1) % LOADING_MESSAGES.length), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="h-7 flex items-center">
      <AnimatePresence mode="wait">
        <motion.p key={idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }} className="text-purple-300 text-sm font-medium">
          ✦ {LOADING_MESSAGES[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default function CreateTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tripId, setTripId] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryItem[] | null>(null);
  const [formData, setFormData] = useState({ name: "", destination: "", startDate: "", endDate: "", isPublic: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        setTripId(data.tripId);
        const raw: any[] = data.itinerary || [];
        setItinerary(raw.map(item => ({
          day: item.day,
          title: item.title,
          category: item.category || "activity",
          description: item.description || "",
          location: item.location || formData.destination,
          startTime: item.startTime,
          endTime: item.endTime,
        })));
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────
  if (loading && !itinerary) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-8">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 opacity-25 animate-pulse scale-110" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 animate-spin" style={{ animationDuration: "3s" }} />
            <div className="absolute inset-4 rounded-full bg-slate-950 flex items-center justify-center">
              <SparklesIcon className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold font-outfit text-white">AI is crafting your itinerary</h2>
            <p className="text-slate-400 text-sm">This takes just a moment…</p>
          </div>
          <CyclingMessage />
        </div>
      </div>
    );
  }

  // ── Itinerary preview ──────────────────────────────────────────
  if (itinerary && tripId) {
    const days = Array.from(new Set(itinerary.map(i => i.day))).sort((a, b) => a - b);
    return (
      <div className="min-h-screen bg-slate-950 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-4">
              <CheckCircle2Icon className="w-4 h-4" /> Trip Created Successfully
            </div>
            <h1 className="text-4xl font-bold font-outfit text-white mb-2">
              AI Itinerary for{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">{formData.destination}</span>
            </h1>
            <p className="text-slate-400">
              {formData.name} &nbsp;·&nbsp;
              {new Date(formData.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} → {new Date(formData.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </motion.div>

          {/* Day cards */}
          <div className="space-y-6 mb-16">
            {days.map((day, di) => {
              const dayItems = itinerary.filter(i => i.day === day);
              return (
                <motion.div key={day} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.07 }} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className={`bg-gradient-to-r ${DAY_GRADIENTS[di % DAY_GRADIENTS.length]} px-6 py-4 flex items-center gap-3`}>
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-sm">{day}</div>
                    <div>
                      <h2 className="font-bold text-white text-lg font-outfit">Day {day}</h2>
                      <p className="text-white/70 text-xs">{dayItems.length} activities planned</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {dayItems.map((item, ii) => {
                      const cfg = getCfg(item.category);
                      return (
                        <motion.div key={ii} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: di * 0.07 + ii * 0.04 }} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.color}`}>{cfg.icon}</div>
                            {ii < dayItems.length - 1 && <div className="w-px flex-1 bg-slate-700/50 mt-1 min-h-[16px]" />}
                          </div>
                          <div className="flex-1 pb-3">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.bg} ${cfg.color}`}>{item.category}</span>
                            </div>
                            {item.description && <p className="text-slate-400 text-sm leading-relaxed mb-2">{item.description}</p>}
                            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                              {item.location && <span className="flex items-center gap-1"><MapPinIcon className="w-3 h-3" />{item.location}</span>}
                              {item.startTime && <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" />{item.startTime}{item.endTime ? ` – ${item.endTime}` : ""}</span>}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Sticky CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none">
            <Button onClick={() => router.push(`/trip/${tripId}`)} className="pointer-events-auto gap-2 px-8 py-6 text-base font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:via-indigo-700 hover:to-pink-700 text-white shadow-[0_0_30px_rgba(168,85,247,0.5)] rounded-2xl border-0">
              Open Trip Dashboard <ArrowRightIcon className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-outfit text-white">Create a New Trip</h1>
        </div>
        <p className="text-slate-400 mb-8 ml-[52px]">Enter your destination and dates — AI will build your itinerary instantly.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Trip Name</Label>
            <Input id="name" placeholder="e.g. Summer Eurotrip 2026" className="bg-slate-950 border-slate-800 text-white focus:border-purple-500" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination" className="text-slate-300 flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-purple-400" /> Destination
            </Label>
            <Input id="destination" placeholder="e.g. Kyoto, Japan" className="bg-slate-950 border-slate-800 text-white focus:border-purple-500" required value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-slate-300 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-purple-400" /> Start Date
              </Label>
              <Input id="startDate" type="date" className="bg-slate-950 border-slate-800 text-white [color-scheme:dark]" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-slate-300 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-pink-400" /> End Date
              </Label>
              <Input id="endDate" type="date" className="bg-slate-950 border-slate-800 text-white [color-scheme:dark]" required value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input type="checkbox" id="isPublic" className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-600 focus:ring-offset-slate-900" checked={formData.isPublic} onChange={e => setFormData({ ...formData, isPublic: e.target.checked })} />
            <Label htmlFor="isPublic" className="text-slate-300 cursor-pointer">Make trip public (allow solo travellers to request to join)</Label>
          </div>

          <Button type="submit" disabled={loading} className="w-full py-6 text-base font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:from-purple-700 hover:via-indigo-700 hover:to-pink-600 text-white mt-4 gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] border-0">
            <SparklesIcon className="w-5 h-5" /> Create Trip &amp; Generate Itinerary
          </Button>

          <p className="text-center text-xs text-slate-500">✦ Powered by Gemini AI · Personalised day-by-day plans generated instantly</p>
        </form>
      </div>
    </div>
  );
}
