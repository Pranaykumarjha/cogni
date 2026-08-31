"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function JoinTripForm() {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/trips/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/trip/${data.tripId}`);
      } else {
        setError(data.error || "Failed to join trip");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleJoin} className="flex gap-2 w-full max-w-sm mt-4">
      <input
        type="text"
        placeholder="Enter Invite Code"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
      />
      <Button type="submit" disabled={loading || !inviteCode.trim()} className="bg-purple-600 hover:bg-purple-700 text-white">
        Join
      </Button>
      {error && <p className="text-red-400 text-xs absolute -bottom-5">{error}</p>}
    </form>
  );
}
