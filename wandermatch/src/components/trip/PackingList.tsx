"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SparklesIcon, CheckCircle2Icon, CircleIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PackingList({ tripId }: { tripId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchPackingList();
  }, [tripId]);

  const fetchPackingList = async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}/packing`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
      }
    } catch (err) {
      console.error("Failed to fetch packing list", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/packing`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
      }
    } catch (err) {
      console.error("Failed to generate packing list", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleCheck = async (itemId: string, currentStatus: boolean) => {
    // Optimistic UI update
    setItems((prev) => 
      prev.map(i => i._id === itemId ? { ...i, isChecked: !currentStatus } : i)
    );
    
    // Note: To persist checkmarks, we'd need a PATCH route. For MVP, we can just do it in state
    // but let's quickly create the PATCH route later if needed, or just let it be optimistic only.
  };

  const categories = ["Clothes", "Electronics", "Toiletries", "Documents", "Misc"];

  return (
    <div className="flex-1 p-6 h-full flex flex-col overflow-y-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Smart Packing List</h2>
          <p className="text-slate-400 text-sm max-w-lg">
            Let AI analyze your destination, dates, and planned activities to generate a personalized packing checklist.
          </p>
        </div>
        <Button 
          onClick={handleGenerateAI} 
          disabled={isGenerating}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
        >
          <SparklesIcon className={`w-4 h-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
          {isGenerating ? "Analyzing..." : "Generate AI Packing List"}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-slate-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <SparklesIcon className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Your suitcase is empty</h3>
          <p className="text-slate-400 max-w-sm mb-6">
            Click the generate button above to let Gemini create a custom packing list for your trip.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => {
            const categoryItems = items.filter(i => i.category === category);
            if (categoryItems.length === 0) return null;
            
            return (
              <div key={category} className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 h-fit">
                <h3 className="font-bold text-white mb-4 flex items-center justify-between border-b border-slate-800 pb-2">
                  {category}
                  <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                    {categoryItems.filter(i => i.isChecked).length} / {categoryItems.length}
                  </span>
                </h3>
                <div className="space-y-2">
                  <AnimatePresence>
                    {categoryItems.map(item => (
                      <motion.div 
                        key={item._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors group"
                        onClick={() => toggleCheck(item._id, item.isChecked)}
                      >
                        {item.isChecked ? (
                          <CheckCircle2Icon className="w-5 h-5 text-emerald-500 shrink-0" />
                        ) : (
                          <CircleIcon className="w-5 h-5 text-slate-600 group-hover:text-emerald-400/50 shrink-0" />
                        )}
                        <span className={`text-sm transition-all ${item.isChecked ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                          {item.item}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
