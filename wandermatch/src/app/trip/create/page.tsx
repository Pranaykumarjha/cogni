"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
    isPublic: false,
  });

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
        const { tripId } = await res.json();
        router.push(`/trip/${tripId}`);
      } else {
        console.error("Failed to create trip");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
        <h1 className="text-3xl font-bold font-outfit text-white mb-2">Create a New Trip</h1>
        <p className="text-slate-400 mb-8">Set up your adventure and invite your friends to start planning.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Trip Name</Label>
            <Input
              id="name"
              placeholder="e.g. Summer Eurotrip 2026"
              className="bg-slate-950 border-slate-800 text-white focus:border-purple-500"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination" className="text-slate-300">Destination</Label>
            <Input
              id="destination"
              placeholder="e.g. Italy & Greece"
              className="bg-slate-950 border-slate-800 text-white focus:border-purple-500"
              required
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-slate-300">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                className="bg-slate-950 border-slate-800 text-white [color-scheme:dark]"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-slate-300">End Date</Label>
              <Input
                id="endDate"
                type="date"
                className="bg-slate-950 border-slate-800 text-white [color-scheme:dark]"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isPublic"
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-600 focus:ring-offset-slate-900"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            />
            <Label htmlFor="isPublic" className="text-slate-300 cursor-pointer">
              Make trip public (allow solo travellers to request to join)
            </Label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white mt-4"
          >
            {loading ? "Creating..." : "Create Trip"}
          </Button>
        </form>
      </div>
    </div>
  );
}
