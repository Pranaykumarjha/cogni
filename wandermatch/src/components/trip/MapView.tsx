"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ItineraryItem } from "@/hooks/useItinerary";

// Fix Leaflet's default marker icons which break with bundlers
// because they use dynamic require() internally
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Helper to generate distinct colors for different days
const getDayColor = (day: number) => {
  const colors = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef", "#f43f5e"];
  return colors[(day - 1) % colors.length];
};

export default function MapView({ items }: { items: ItineraryItem[] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Filter items that have coordinates
  const itemsWithCoords = items.filter((i) => i.lat != null && i.lng != null);

  if (itemsWithCoords.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-900/40 m-6 rounded-xl border border-slate-800">
        <p className="mb-4">No locations have been plotted yet.</p>
        <p className="text-sm">Click "Generate AI Consensus Plan" to let the AI assign map coordinates to your itinerary!</p>
      </div>
    );
  }

  // Calculate map center (average of all points)
  const centerLat = itemsWithCoords.reduce((sum, item) => sum + (item.lat || 0), 0) / itemsWithCoords.length;
  const centerLng = itemsWithCoords.reduce((sum, item) => sum + (item.lng || 0), 0) / itemsWithCoords.length;

  // Group by day for polylines
  const days = Array.from(new Set(itemsWithCoords.map((i) => i.day))).sort((a, b) => a - b);
  
  return (
    <div className="flex-1 p-6 h-full">
      <div className="h-full w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative z-0">
        <MapContainer center={[centerLat, centerLng]} zoom={12} className="h-full w-full bg-slate-900">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          {itemsWithCoords.map((item) => (
            <Marker key={item._id} position={[item.lat as number, item.lng as number]} icon={markerIcon}>
              <Popup className="rounded-lg shadow-lg">
                <div className="font-sans">
                  <h3 className="font-bold text-slate-800 text-sm mb-1">{item.title}</h3>
                  <div className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md w-max mb-1">
                    Day {item.day} • {item.category}
                  </div>
                  {item.description && <p className="text-xs text-slate-500 mt-1">{item.description}</p>}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Draw polylines connecting activities on the same day */}
          {days.map((day) => {
            const dayItems = itemsWithCoords
              .filter((i) => i.day === day)
              .sort((a, b) => a.order - b.order);
            
            if (dayItems.length < 2) return null;
            
            const positions: [number, number][] = dayItems.map(i => [i.lat as number, i.lng as number]);
            
            return (
              <Polyline 
                key={`line-day-${day}`} 
                positions={positions} 
                pathOptions={{ color: getDayColor(day), weight: 3, opacity: 0.7, dashArray: "5, 10" }} 
              />
            );
          })}
        </MapContainer>
        
        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg z-[1000] border border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Routes by Day</h4>
          <div className="space-y-1">
            {days.map(day => (
              <div key={`legend-${day}`} className="flex items-center gap-2">
                <div className="w-4 h-1 rounded" style={{ backgroundColor: getDayColor(day) }} />
                <span className="text-xs font-medium text-slate-600">Day {day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
