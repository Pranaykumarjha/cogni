"use client";

import { useState } from "react";
import { Proposal, useVoting } from "@/hooks/useVoting";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { motion } from "framer-motion";

export default function ProposalCard({
  proposal,
  tripId,
  currentUserId,
}: {
  proposal: Proposal;
  tripId: string;
  currentUserId: string;
}) {
  const { castVote } = useVoting(tripId);
  const [voting, setVoting] = useState(false);

  const upvotes = proposal.votes.filter((v) => v.vote === "up").length;
  const downvotes = proposal.votes.filter((v) => v.vote === "down").length;
  const myVote = proposal.votes.find((v) => v.user === currentUserId)?.vote;

  const handleVote = async (type: "up" | "down") => {
    if (voting) return;
    setVoting(true);
    await castVote(proposal._id, type);
    setVoting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-white">{proposal.title}</h3>
          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
            {proposal.category}
          </span>
        </div>
        <p className="text-sm text-slate-400 mb-4">{proposal.description}</p>
      </div>

      <div className="flex items-center gap-4 mt-auto pt-4 border-t border-slate-800/50">
        <button
          onClick={() => handleVote("up")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            myVote === "up" ? "bg-green-500/20 text-green-400" : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span className="font-medium">{upvotes}</span>
        </button>
        <button
          onClick={() => handleVote("down")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            myVote === "down" ? "bg-red-500/20 text-red-400" : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
          }`}
        >
          <ThumbsDown className="w-4 h-4" />
          <span className="font-medium">{downvotes}</span>
        </button>
      </div>
    </motion.div>
  );
}
