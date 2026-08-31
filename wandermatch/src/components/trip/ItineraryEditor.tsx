"use client";

import { useState } from "react";
import { useItinerary, ItineraryItem } from "@/hooks/useItinerary";
import { Button } from "@/components/ui/button";
import {
  PlusIcon, TrashIcon, SparklesIcon, MapIcon, LayoutGridIcon,
  MapPinIcon, ClockIcon, PencilIcon, XIcon, CheckIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

const CATEGORIES = ["activity", "food", "transport", "accommodation", "other"] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_COLORS: Record<Category, string> = {
  activity: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  food: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  transport: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  accommodation: "text-teal-400 bg-teal-500/10 border-teal-500/30",
  other: "text-slate-400 bg-slate-500/10 border-slate-500/30",
};

// ── Edit Modal ──────────────────────────────────────────────────────────────
function EditModal({
  item,
  onSave,
  onClose,
}: {
  item: ItineraryItem;
  onSave: (updates: Partial<ItineraryItem>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: item.title ?? "",
    description: item.description ?? "",
    category: item.category ?? "activity",
    location: item.location ?? "",
    startTime: item.startTime ?? "",
    endTime: item.endTime ?? "",
    day: item.day ?? 1,
  });

  const set = (k: keyof typeof form, v: string | number) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({ ...form, day: Number(form.day) });
    onClose();
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg mx-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20">
          <div className="flex items-center gap-2">
            <PencilIcon className="w-4 h-4 text-purple-400" />
            <h2 className="text-base font-bold text-white">Edit Activity</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Title *</label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Activity title..."
            />
          </div>

          {/* Category + Day */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 capitalize"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Day</label>
              <input
                type="number"
                min={1}
                value={form.day}
                onChange={(e) => set("day", e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                <ClockIcon className="w-3 h-3 inline mr-1" />Start Time
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                <ClockIcon className="w-3 h-3 inline mr-1" />End Time
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => set("endTime", e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              <MapPinIcon className="w-3 h-3 inline mr-1" />Location
            </label>
            <input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              placeholder="e.g. Taj Mahal, Agra"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
              placeholder="What will you do here?"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-2 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg"
          >
            <CheckIcon className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main ItineraryEditor ────────────────────────────────────────────────────
export default function ItineraryEditor({
  tripId, initialItems, startDate, endDate,
}: {
  tripId: string;
  initialItems: ItineraryItem[];
  startDate: string;
  endDate: string;
}) {
  const { items, addItem, updateItem, deleteItem, setItinerary } = useItinerary(tripId, initialItems);
  const [newItemText, setNewItemText] = useState("");
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [viewMode, setViewMode] = useState<"board" | "map">("board");
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);

  const getTripDayCount = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  };

  const days = Array.from({ length: getTripDayCount() }, (_, i) => i + 1);

  const handleAdd = (day: number) => {
    if (!newItemText) return;
    addItem({ trip: tripId, day, title: newItemText, category: "activity", order: 0 });
    setNewItemText("");
    setActiveDay(null);
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/consensus`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.items) setItinerary(data.items);
      }
    } catch (err) {
      console.error("AI Generation failed", err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <>
      {/* Edit Modal */}
      <AnimatePresence>
        {editingItem && (
          <EditModal
            item={editingItem}
            onSave={(updates) => updateItem(editingItem._id, updates)}
            onClose={() => setEditingItem(null)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col" style={{ height: "calc(100vh - 160px)" }}>
        {/* Toolbar */}
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

        {/* Content */}
        {viewMode === "map" ? (
          <div className="flex-1 min-h-0">
            <MapView items={items} />
          </div>
        ) : (
          <div
            className="flex gap-6 p-6 overflow-x-auto overflow-y-hidden"
            style={{ height: "calc(100vh - 220px)" }}
          >
            {days.map((day) => (
              <div
                key={day}
                className="w-80 flex-shrink-0 flex flex-col bg-slate-900/40 rounded-xl border border-slate-800"
                style={{ height: "calc(100vh - 250px)" }}
              >
                <div className="p-4 border-b border-slate-800 bg-slate-900/60 rounded-t-xl">
                  <h3 className="font-bold text-white">Day {day}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{items.filter((i) => i.day === day).length} activities</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <AnimatePresence>
                    {items
                      .filter((i) => i.day === day)
                      .sort((a, b) => a.order - b.order)
                      .map((item) => {
                        const catClass = CATEGORY_COLORS[item.category as Category] ?? CATEGORY_COLORS.other;
                        return (
                          <motion.div
                            key={item._id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-800 border border-slate-700 p-3 rounded-lg group hover:border-slate-600 transition-colors"
                          >
                            {/* Title row */}
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-sm font-medium text-white leading-snug flex-1">{item.title}</h4>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button
                                  onClick={() => setEditingItem(item)}
                                  className="text-slate-400 hover:text-purple-400 p-1 rounded hover:bg-slate-700 transition-colors"
                                  title="Edit"
                                >
                                  <PencilIcon className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteItem(item._id)}
                                  className="text-slate-400 hover:text-red-400 p-1 rounded hover:bg-slate-700 transition-colors"
                                  title="Delete"
                                >
                                  <TrashIcon className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Description */}
                            {item.description && (
                              <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}

                            {/* Category + Time */}
                            <div className="flex flex-wrap gap-2 mt-3 items-center">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-md border capitalize ${catClass}`}>
                                {item.category}
                              </span>
                              {item.startTime && (
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <ClockIcon className="w-3 h-3" />
                                  {item.startTime}{item.endTime ? ` – ${item.endTime}` : ""}
                                </span>
                              )}
                            </div>

                            {/* Location */}
                            {item.location && (
                              <div className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                                <MapPinIcon className="w-3 h-3 shrink-0" />
                                <span className="truncate">{item.location}</span>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                  </AnimatePresence>

                  {/* Add item inline */}
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
    </>
  );
}
