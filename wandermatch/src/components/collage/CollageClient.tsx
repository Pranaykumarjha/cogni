"use client";

import { useState, useEffect } from "react";
import PhotoUploader from "./PhotoUploader";
import { motion, AnimatePresence } from "framer-motion";
import { UsersIcon, FilterIcon } from "lucide-react";

export default function CollageClient({ tripId }: { tripId: string }) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [faceFilter, setFaceFilter] = useState<"all" | "with-faces" | "without-faces">("all");

  useEffect(() => {
    fetch(`/api/trips/${tripId}/photos`)
      .then((res) => res.json())
      .then((data) => {
        setPhotos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tripId]);

  const handleUploadComplete = (photo: any) => {
    setPhotos((prev) => [photo, ...prev]);
  };

  const filtered = photos.filter((p) => {
    if (faceFilter === "with-faces") return p.faces?.length > 0;
    if (faceFilter === "without-faces") return !p.faces?.length;
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex flex-wrap gap-4 items-start justify-between mb-8">
        <div className="max-w-xl">
          <p className="text-slate-400">
            Upload photos — we'll automatically detect faces and let you filter by person!
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Face filter pills */}
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 text-sm">
            {[
              { key: "all", label: "All" },
              { key: "with-faces", label: "With Faces" },
              { key: "without-faces", label: "No Faces" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setFaceFilter(opt.key as any)}
                className={`px-3 py-1 rounded-md transition-colors font-medium ${
                  faceFilter === opt.key
                    ? "bg-purple-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Uploader */}
      <div className="mb-8">
        <PhotoUploader tripId={tripId} onUploadComplete={handleUploadComplete} />
      </div>

      {/* Stats bar */}
      {photos.length > 0 && (
        <div className="flex gap-6 mb-6 text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            {photos.length} photos
          </span>
          <span className="flex items-center gap-1.5">
            <UsersIcon className="w-3.5 h-3.5 text-green-400" />
            {photos.filter((p) => p.faces?.length > 0).length} with faces detected
          </span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          <AnimatePresence>
            {filtered.map((photo) => (
              <motion.div
                key={photo._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group rounded-xl overflow-hidden break-inside-avoid cursor-pointer"
              >
                <img
                  src={photo.url}
                  alt="Trip Memory"
                  className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
                />

                {/* Face bounding boxes (visible on hover) */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {photo.faces?.map((face: any, i: number) => (
                    <div
                      key={i}
                      className="absolute border-2 border-green-400 rounded-sm shadow-[0_0_10px_rgba(74,222,128,0.8)]"
                      style={{
                        left: face.bbox?.x,
                        top: face.bbox?.y,
                        width: face.bbox?.w,
                        height: face.bbox?.h,
                      }}
                    />
                  ))}
                </div>

                {/* Face count badge */}
                {photo.faces?.length > 0 && (
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur px-2 py-1 rounded text-xs text-green-400 pointer-events-none border border-green-500/30 flex items-center gap-1">
                    <UsersIcon className="w-3 h-3" />
                    {photo.faces.length} face{photo.faces.length > 1 ? "s" : ""}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && !loading && (
            <div className="col-span-full py-16 text-center border border-dashed border-slate-800 rounded-xl">
              <div className="text-4xl mb-3">📸</div>
              <p className="text-slate-400">
                {photos.length === 0 ? "No photos uploaded yet." : "No photos match the current filter."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
