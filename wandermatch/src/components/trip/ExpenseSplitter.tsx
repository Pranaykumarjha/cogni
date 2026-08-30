"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, DollarSignIcon, ArrowRightIcon } from "lucide-react";

export default function ExpenseSplitter({ tripId }: { tripId: string }) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<Record<string, { name: string; balance: number }>>({});
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, [tripId]);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}/expenses`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses);
        setBalances(data.balances);
      }
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, amount: Number(amount) }),
      });
      
      if (res.ok) {
        setDescription("");
        setAmount("");
        fetchExpenses(); // Refresh list and balances
      }
    } catch (err) {
      console.error("Failed to add expense", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400 flex-1">Loading expenses...</div>;
  }

  // Calculate total trip cost
  const totalCost = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="flex-1 p-6 h-full flex flex-col md:flex-row gap-6 overflow-y-auto">
      
      {/* Left Column: Expense List & Form */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <DollarSignIcon className="w-5 h-5 mr-2 text-emerald-400" />
            Add Expense
          </h2>
          <form onSubmit={handleAddExpense} className="flex gap-4 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-slate-400">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Dinner at Eiffel Tower"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div className="w-32 space-y-1">
              <label className="text-xs font-medium text-slate-400">Amount ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-[38px]"
            >
              <PlusIcon className="w-4 h-4 mr-2" /> Add
            </Button>
          </form>
        </div>

        <div className="flex-1 bg-slate-900/40 p-6 rounded-xl border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-4">Trip Expenses</h2>
          {expenses.length === 0 ? (
            <p className="text-slate-400 text-sm">No expenses logged yet.</p>
          ) : (
            <div className="space-y-3">
              {expenses.map((exp) => (
                <div key={exp._id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div>
                    <p className="font-medium text-white">{exp.description}</p>
                    <p className="text-xs text-slate-400">
                      Paid by {exp.paidBy?.name || "Unknown"} on {new Date(exp.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="font-bold text-emerald-400">
                    ${exp.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Balances */}
      <div className="w-full md:w-80 flex flex-col gap-6">
        <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-1">Total Spent</h2>
          <p className="text-3xl font-bold text-emerald-400">${totalCost.toFixed(2)}</p>
        </div>

        <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 flex-1">
          <h2 className="text-lg font-bold text-white mb-4">Group Balances</h2>
          <p className="text-xs text-slate-400 mb-4 pb-4 border-b border-slate-800">
            Positive balance means the group owes this person. Negative means they owe the group. Split equally.
          </p>
          
          {Object.keys(balances).length === 0 ? (
            <p className="text-slate-400 text-sm">Balances will appear here once expenses are added.</p>
          ) : (
            <div className="space-y-4">
              {Object.values(balances)
                .sort((a, b) => b.balance - a.balance)
                .map((b, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-300">{b.name}</span>
                  <span className={`text-sm font-bold ${b.balance > 0 ? "text-emerald-400" : b.balance < 0 ? "text-rose-400" : "text-slate-500"}`}>
                    {b.balance > 0 ? "+" : ""}{b.balance.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
