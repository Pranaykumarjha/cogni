"use client";

import { useState, useEffect } from "react";
import PhotoUploader from "@/components/collage/PhotoUploader";
import { motion, AnimatePresence } from "framer-motion";

export default function CollagePage({ tripId }: { tripId: string }) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/trips/${tripId}/photos`)
      .then(res => res.json())
      .then(data => {
        setPhotos(data);
        setLoading(false);
      });
  }, [tripId]);

  const handleUploadComplete = (photo: any) => {
    setPhotos((prev) => [photo, ...prev]);
  };

  return (
    <div className="p-6">
      <div className="max-w-xl mb-8">
        <h2 className="text-2xl font-bold font-outfit text-white mb-2">Trip Memories</h2>
        <p className="text-slate-400 mb-6">Upload photos. We'll automatically detect faces and let you filter by person!</p>
        <PhotoUploader tripId={tripId} onUploadComplete={handleUploadComplete} />
      </div>

      {loading ? (
        <div className="text-slate-400">Loading photos...</div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          <AnimatePresence>
            {photos.map((photo) => (
              <motion.div
                key={photo._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group rounded-xl overflow-hidden break-inside-avoid"
              >
                <img src={photo.url} alt="Trip Memory" className="w-full h-auto" />
                
                {/* Face Bounding Boxes (visible on hover) */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
                  {photo.faces.map((face: any, i: number) => (
                    <div
                      key={i}
                      className="absolute border-2 border-green-400 rounded-sm shadow-[0_0_10px_rgba(74,222,128,0.8)]"
                      style={{
                        left: face.bbox.x,
                        top: face.bbox.y,
                        width: face.bbox.w,
                        height: face.bbox.h,
                      }}
                    />
                  ))}
                </div>
                
                {photo.faces.length > 0 && (
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur px-2 py-1 rounded text-xs text-slate-300 pointer-events-none border border-slate-700">
                    {photo.faces.length} face{photo.faces.length > 1 ? "s" : ""}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {photos.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No photos uploaded yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
