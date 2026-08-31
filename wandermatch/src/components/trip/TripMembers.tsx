"use client";

import { useState } from "react";
import { CheckIcon, XIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TripMembers({
  tripId,
  isCreator,
  members,
  joinRequests,
}: {
  tripId: string;
  isCreator: boolean;
  members: any[];
  joinRequests: any[];
}) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleRequest = async (userId: string, action: "accept" | "reject") => {
    setProcessingId(userId);
    try {
      const res = await fetch(`/api/trips/${tripId}/members/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to process request", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Join Requests Section */}
      {isCreator && joinRequests.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold font-outfit text-white mb-4">Join Requests</h2>
          <div className="space-y-4">
            {joinRequests.map((req) => (
              <div key={req._id} className="flex items-center justify-between bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  {req.image ? (
                    <img src={req.image} alt={req.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white">{req.name}</p>
                    <p className="text-sm text-slate-400">{req.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequest(req._id, "reject")}
                    disabled={processingId === req._id}
                    className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleRequest(req._id, "accept")}
                    disabled={processingId === req._id}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckIcon className="w-4 h-4" /> Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Members Section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold font-outfit text-white mb-4">Members ({members.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => (
            <div key={member._id} className="flex items-center gap-3 bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
              {member.image ? (
                <img src={member.image} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-slate-400" />
                </div>
              )}
              <div>
                <p className="font-medium text-white">{member.name}</p>
                <p className="text-sm text-slate-400">{member.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
