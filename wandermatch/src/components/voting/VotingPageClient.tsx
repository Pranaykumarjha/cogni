"use client";

import { useState } from "react";
import ProposalCard from "@/components/voting/ProposalCard";
import { useVoting, Proposal } from "@/hooks/useVoting";
import { PlusIcon, XIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["activity", "food", "transport", "accommodation", "other"];

export default function VotingPageClient({
  tripId,
  currentUserId,
  initialProposals,
}: {
  tripId: string;
  currentUserId: string;
  initialProposals: Proposal[];
}) {
  const { proposals, castVote, addProposal } = useVoting(tripId, initialProposals);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "activity" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    setSubmitting(true);
    await addProposal(form);
    setForm({ title: "", description: "", category: "activity" });
    setShowModal(false);
    setSubmitting(false);
  };

  return (
    <div className="flex-1 p-6 relative">
      {/* Header row */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-400 text-sm">{proposals.length} active proposal{proposals.length !== 1 ? "s" : ""}</p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]"
        >
          <PlusIcon className="w-4 h-4" />
          Propose Activity
        </button>
      </div>

      {/* Proposals grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {proposals.map((proposal) => (
            <ProposalCard
              key={proposal._id}
              proposal={proposal}
              tripId={tripId}
              currentUserId={currentUserId}
            />
          ))}
        </AnimatePresence>

        {proposals.length === 0 && (
          <div className="col-span-full py-20 text-center border border-dashed border-slate-800 rounded-2xl">
            <div className="text-4xl mb-3">🗳️</div>
            <h3 className="text-xl text-white mb-2">No active proposals</h3>
            <p className="text-slate-400 mb-4">Be the first to propose an activity for the group!</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Create First Proposal
            </button>
          </div>
        )}
      </div>

      {/* Create Proposal Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white font-outfit">Propose an Activity</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Visit Eiffel Tower at sunset"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Why should the group do this? Any details..."
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} className="bg-slate-900">
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      {submitting ? "Submitting..." : "Submit Proposal"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
