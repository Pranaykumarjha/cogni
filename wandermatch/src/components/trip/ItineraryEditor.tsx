"use client";

import { useState } from "react";
import { useItinerary, ItineraryItem } from "@/hooks/useItinerary";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon, SparklesIcon, MapIcon, LayoutGridIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function ItineraryEditor({ tripId, initialItems }: { tripId: string, initialItems: ItineraryItem[] }) {
  const { items, addItem, deleteItem, setItinerary } = useItinerary(tripId, initialItems);
  const [newItemText, setNewItemText] = useState("");
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [viewMode, setViewMode] = useState<"board" | "map">("board");

  // Group items by day
  const days = [1, 2, 3, 4, 5]; // For MVP, hardcode 5 days

  const handleAdd = (day: number) => {
    if (!newItemText) return;
    addItem({
      trip: tripId,
      day,
      title: newItemText,
      category: "activity",
      order: 0,
    });
    setNewItemText("");
    setActiveDay(null);
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/consensus`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        if (data.items) {
          setItinerary(data.items);
        }
      }
    } catch (err) {
      console.error("AI Generation failed", err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 flex justify-between items-center border-b border-slate-800">
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
          <button
            onClick={() => setViewMode("board")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center transition-colors ${viewMode === "board" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
          >
            <LayoutGridIcon className="w-4 h-4 mr-2" /> Board
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center transition-colors ${viewMode === "map" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
          >
            <MapIcon className="w-4 h-4 mr-2" /> Map
          </button>
        </div>
        <Button 
          onClick={handleGenerateAI} 
          disabled={isGeneratingAI}
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
        >
          <SparklesIcon className={`w-4 h-4 mr-2 ${isGeneratingAI ? "animate-spin" : ""}`} />
          {isGeneratingAI ? "AI is Planning..." : "Generate AI Consensus Plan"}
        </Button>
      </div>
      
      {viewMode === "map" ? (
        <MapView items={items} />
      ) : (
      <div className="flex gap-6 p-6 min-w-max items-start flex-1 overflow-y-auto">
      {days.map((day) => (
        <div key={day} className="w-80 flex-shrink-0 flex flex-col bg-slate-900/40 rounded-xl border border-slate-800 h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 rounded-t-xl">
            <h3 className="font-bold text-white">Day {day}</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence>
              {items.filter(i => i.day === day).map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-800 border border-slate-700 p-3 rounded-lg group"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium text-white">{item.title}</h4>
                    <button onClick={() => deleteItem(item._id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 text-xs font-medium text-slate-400 bg-slate-900 w-fit px-2 py-0.5 rounded">
                    {item.category}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {activeDay === day ? (
              <div className="bg-slate-800 p-3 rounded-lg border border-purple-500/50">
                <input
                  autoFocus
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd(day);
                    if (e.key === "Escape") setActiveDay(null);
                  }}
                  placeholder="Activity title..."
                  className="w-full bg-transparent text-sm text-white focus:outline-none"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="ghost" size="sm" onClick={() => setActiveDay(null)} className="h-6 text-xs">Cancel</Button>
                  <Button size="sm" onClick={() => handleAdd(day)} className="h-6 text-xs bg-purple-600">Add</Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="w-full text-slate-400 border border-dashed border-slate-700 hover:bg-slate-800 hover:border-slate-600 justify-start"
                onClick={() => setActiveDay(day)}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            )}
          </div>
        </div>
      ))}
      </div>
      )}
    </div>
  );
}
