"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ItineraryItem } from "@/hooks/useItinerary";
import { Maximize2Icon, Minimize2Icon, ClockIcon, MapPinIcon } from "lucide-react";

// Fix Leaflet's default marker icons
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DAY_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16",
  "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6",
  "#d946ef", "#f43f5e",
];
const getDayColor = (day: number) => DAY_COLORS[(day - 1) % DAY_COLORS.length];

const categoryEmoji: Record<string, string> = {
  food: "🍽️",
  activity: "📍",
  transport: "🚌",
  accommodation: "🏨",
  other: "📌",
};

// Create a colored numbered icon for each marker
function createNumberedIcon(day: number, order: number) {
  const color = getDayColor(day);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 28 16 28s16-18 16-28C32 7.163 24.837 0 16 0z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <text x="16" y="20" text-anchor="middle" font-family="sans-serif" font-size="11"
        font-weight="bold" fill="white" dominant-baseline="middle">${order}</text>
    </svg>`;
  return L.divIcon({
    html: svg,
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -44],
    className: "",
  });
}

export default function MapView({ items }: { items: ItineraryItem[] }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | "all">("all");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  if (!isMounted) return null;

  // Only use items with real (non-zero) coordinates
  const itemsWithCoords = items.filter(
    (i) => i.lat != null && i.lng != null && (i.lat !== 0 || i.lng !== 0)
  );

  if (itemsWithCoords.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center text-slate-400 bg-slate-900/40 m-6 rounded-xl border border-slate-800"
        style={{ height: "calc(100vh - 230px)" }}
      >
        <div className="text-5xl mb-4">🗺️</div>
        <p className="text-lg font-medium mb-2 text-slate-300">No map data yet</p>
        <p className="text-sm text-center max-w-xs">
          Create a new trip and the AI will generate GPS coordinates for every activity automatically.
        </p>
      </div>
    );
  }

  const allDays = Array.from(new Set(itemsWithCoords.map((i) => i.day))).sort((a, b) => a - b);

  // Visible items based on day filter
  const visibleItems =
    selectedDay === "all"
      ? itemsWithCoords
      : itemsWithCoords.filter((i) => i.day === selectedDay);

  const centerLat = visibleItems.reduce((s, i) => s + (i.lat || 0), 0) / visibleItems.length;
  const centerLng = visibleItems.reduce((s, i) => s + (i.lng || 0), 0) / visibleItems.length;

  // For numbering within each day
  const orderMap = new Map<string, number>();
  allDays.forEach((day) => {
    itemsWithCoords
      .filter((i) => i.day === day)
      .sort((a, b) => a.order - b.order)
      .forEach((item, idx) => orderMap.set(item._id, idx + 1));
  });

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        height: isFullscreen ? "100vh" : "calc(100vh - 220px)",
        padding: isFullscreen ? "0" : "0 24px 24px",
      }}
    >
      {/* ── Day filter pills ──────────────────────────────── */}
      <div className="absolute top-3 left-10 z-[1001] flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setSelectedDay("all")}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all shadow-md ${
            selectedDay === "all"
              ? "bg-slate-100 text-slate-800 border-slate-300"
              : "bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800"
          }`}
        >
          All Days
        </button>
        {allDays.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day === selectedDay ? "all" : day)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all shadow-md ${
              selectedDay === day
                ? "text-white border-transparent"
                : "bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800"
            }`}
            style={selectedDay === day ? { backgroundColor: getDayColor(day), borderColor: getDayColor(day) } : {}}
          >
            Day {day}
          </button>
        ))}
      </div>

      {/* ── Fullscreen button ─────────────────────────────── */}
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        className="absolute top-3 right-10 z-[1001] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-lg text-xs font-medium"
      >
        {isFullscreen ? (
          <><Minimize2Icon className="w-3.5 h-3.5" /> Exit Fullscreen</>
        ) : (
          <><Maximize2Icon className="w-3.5 h-3.5" /> Fullscreen</>
        )}
      </button>

      {/* ── Map ──────────────────────────────────────────── */}
      <div className="h-full w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative z-0">
        <MapContainer
          key={`${selectedDay}-${centerLat}-${centerLng}`}
          center={[centerLat, centerLng]}
          zoom={selectedDay === "all" ? 12 : 13}
          style={{ height: "100%", width: "100%" }}
        >
          {/* Free OpenStreetMap tiles – no API key needed */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {visibleItems.map((item) => (
            <Marker
              key={item._id}
              position={[item.lat as number, item.lng as number]}
              icon={createNumberedIcon(item.day, orderMap.get(item._id) ?? 1)}
            >
              <Popup maxWidth={260}>
                <div className="font-sans p-1">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-lg mt-0.5">{categoryEmoji[item.category] || "📌"}</span>
                    <h3 className="font-bold text-slate-800 text-sm leading-snug">{item.title}</h3>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: getDayColor(item.day) }}
                    >
                      Day {item.day} · Stop #{orderMap.get(item._id)}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium capitalize">
                      {item.category}
                    </span>
                  </div>

                  {item.startTime && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <ClockIcon className="w-3 h-3 shrink-0" />
                      {item.startTime}{item.endTime ? ` – ${item.endTime}` : ""}
                    </div>
                  )}
                  {item.location && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                      <MapPinIcon className="w-3 h-3 shrink-0" />
                      {item.location}
                    </div>
                  )}
                  {item.description && (
                    <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-2 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Polylines per day (only for visible days) */}
          {(selectedDay === "all" ? allDays : [selectedDay as number]).map((day) => {
            const dayItems = visibleItems
              .filter((i) => i.day === day)
              .sort((a, b) => a.order - b.order);

            if (dayItems.length < 2) return null;
            const positions: [number, number][] = dayItems.map((i) => [i.lat as number, i.lng as number]);

            return (
              <Polyline
                key={`line-day-${day}`}
                positions={positions}
                pathOptions={{ color: getDayColor(day), weight: 4, opacity: 0.8, dashArray: "6, 10" }}
              />
            );
          })}
        </MapContainer>

        {/* ── Legend ───────────────────────────────────────── */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg z-[1000] border border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 uppercase mb-2 tracking-wide">Routes by Day</h4>
          <div className="space-y-1.5">
            {allDays.map((day) => (
              <button
                key={`legend-${day}`}
                onClick={() => setSelectedDay(day === selectedDay ? "all" : day)}
                className={`flex items-center gap-2 w-full rounded px-1 transition-colors ${
                  selectedDay === day ? "bg-slate-100" : "hover:bg-slate-50"
                }`}
              >
                <div className="w-5 h-2 rounded-full shrink-0" style={{ backgroundColor: getDayColor(day) }} />
                <span className="text-xs font-medium text-slate-600">Day {day}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
