"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloudIcon, CameraIcon } from "lucide-react";
import { loadFaceDetectionModels, detectFacesInImage } from "@/lib/face-detection";
import { motion } from "framer-motion";

export default function PhotoUploader({ tripId, onUploadComplete }: { tripId: string, onUploadComplete: (photo: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Pre-load models when component mounts
    loadFaceDetectionModels().catch(console.error);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus("Reading file...");

    try {
      // 1. Read file to base64
      const reader = new FileReader();
      const base64Url = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 2. Load into an Image object for face-api
      setStatus("Analyzing faces...");
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = base64Url;
      });

      // 3. Detect faces
      const faces = await detectFacesInImage(img);
      setStatus(`Found ${faces.length} faces. Saving...`);

      // 4. Send to server
      const res = await fetch(`/api/trips/${tripId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: base64Url, faces }),
      });

      if (res.ok) {
        const photo = await res.json();
        onUploadComplete(photo);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setStatus("Idle");
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={loading}
      />
      
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="w-full h-32 border-2 border-dashed border-slate-700 bg-slate-900/50 hover:bg-slate-800 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors group"
      >
        {loading ? (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <CameraIcon className="w-8 h-8 text-purple-500" />
          </motion.div>
        ) : (
          <UploadCloudIcon className="w-8 h-8 group-hover:text-purple-400 transition-colors" />
        )}
        <span className="font-medium">{loading ? status : "Upload a Photo"}</span>
      </Button>
    </div>
  );
}
