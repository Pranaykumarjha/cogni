"use client";

import { useState, useEffect } from "react";
import { useSocket } from "../useSocket";

export interface Vote {
  user: string;
  vote: "up" | "down";
}

export interface Proposal {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: "open" | "accepted" | "rejected";
  votes: Vote[];
}

export function useVoting(tripId: string, initialProposals: Proposal[] = []) {
  const { socket } = useSocket();
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);

  useEffect(() => {
    if (!socket || !tripId) return;

    socket.emit("join-trip", tripId);

    const handleNewProposal = (proposal: Proposal) => {
      setProposals((prev) => [...prev, proposal]);
    };

    const handleVoteCast = (data: { proposalId: string; votes: Vote[] }) => {
      setProposals((prev) =>
        prev.map((p) =>
          p._id === data.proposalId ? { ...p, votes: data.votes } : p
        )
      );
    };

    socket.on("proposal-added", handleNewProposal);
    socket.on("vote-cast", handleVoteCast);

    return () => {
      socket.off("proposal-added", handleNewProposal);
      socket.off("vote-cast", handleVoteCast);
    };
  }, [socket, tripId]);

  const castVote = async (proposalId: string, vote: "up" | "down") => {
    // Optimistic UI for vote could be complex (knowing user ID), so we'll just wait for the network or do basic optimistic
    const res = await fetch(`/api/trips/${tripId}/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposalId, vote }),
    });

    if (res.ok) {
      const updatedVotes = await res.json();
      setProposals((prev) =>
        prev.map((p) => (p._id === proposalId ? { ...p, votes: updatedVotes } : p))
      );
      socket?.emit("cast-vote", { tripId, proposalId, votes: updatedVotes });
    }
  };

  const addProposal = async (proposal: any) => {
    const res = await fetch(`/api/trips/${tripId}/proposals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proposal),
    });

    if (res.ok) {
      const newProposal = await res.json();
      setProposals((prev) => [...prev, newProposal]);
      socket?.emit("new-proposal", { tripId, ...newProposal });
    }
  };

  return { proposals, castVote, addProposal };
}
