import React, { useState } from "react";
import { Project, Bid, BaseUser } from "../../types";
import { DollarSign, Zap, Sparkles, Send, X, Shield, Clock, Check, ArrowRight } from "lucide-react";

interface QuickBidModalProps {
  project: Project;
  currentUser: BaseUser | null;
  existingBids: Bid[];
  onClose: () => void;
  onSubmitBid: (amount: number, message: string) => void;
}

export default function QuickBidModal({
  project,
  currentUser,
  existingBids,
  onClose,
  onSubmitBid,
}: QuickBidModalProps) {
  const [amount, setAmount] = useState<number>(() => Math.round(project.budget * 0.95));
  const [customAmountText, setCustomAmountText] = useState<string>(() => Math.round(project.budget * 0.95).toString());
  const [message, setMessage] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const presets = [
    { label: "Competitive (90%)", value: Math.round(project.budget * 0.90), desc: "High win probability" },
    { label: "Target (95%)", value: Math.round(project.budget * 0.95), desc: "Balanced margin" },
    { label: "Full Budget (100%)", value: project.budget, desc: "Exact customer ask" },
    { label: "Premium (110%)", value: Math.round(project.budget * 1.10), desc: "Full-service turnkey" },
  ];

  const messageTemplates = [
    "Licensed professional with 10+ years experience. Can start immediately and guarantee top-quality craft.",
    "Available this week! All labor, safety equipment, and cleanup fully included in this quote.",
    "Specialized in this exact trade with 5-star ratings. Free upfront walkthrough & materials guarantee.",
    "Ready to execute with fast turnaround. Insured, certified, and 100% satisfaction guaranteed.",
  ];

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmountText(val.toString());
  };

  const handleSelectTemplate = (tpl: string) => {
    setMessage(tpl);
    setSelectedTemplate(tpl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmt = parseFloat(customAmountText);
    if (isNaN(finalAmt) || finalAmt <= 0) {
      alert("Please enter a valid bid amount.");
      return;
    }
    if (!message.trim()) {
      alert("Please include a brief note or pitch to the customer.");
      return;
    }
    onSubmitBid(finalAmt, message);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-900 text-white p-5 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  Quick Bid Opportunity
                </span>
                <span className="text-xs text-zinc-400">
                  {existingBids.length} current {existingBids.length === 1 ? "bid" : "bids"}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white truncate max-w-xs mt-0.5">
                {project.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Project Summary Banner */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Customer Target Budget</span>
              <div className="text-xl font-extrabold text-emerald-700">
                ${project.budget.toLocaleString()}
              </div>
              <span className="text-xs text-zinc-500">
                📍 {project.city}, {project.state} &bull; {project.type === "business" ? "Commercial" : "Residential"}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Opportunity Score</span>
              <div className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md mt-1">
                {existingBids.length === 0 ? "⭐ 1st Mover (Highest Odds)" : `${existingBids.length} Competing Bids`}
              </div>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
              1-Click Bid Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p.value)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    amount === p.value
                      ? "border-amber-500 bg-amber-50 text-zinc-900 ring-2 ring-amber-500/20"
                      : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                  }`}
                >
                  <div className="text-xs font-black">${p.value.toLocaleString()}</div>
                  <div className="text-[10px] text-zinc-500 font-medium truncate">{p.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Exact Amount Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-700">
              Your Offer Amount ($)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-zinc-400 font-bold text-sm">$</span>
              <input
                type="number"
                value={customAmountText}
                onChange={(e) => {
                  setCustomAmountText(e.target.value);
                  const parsed = parseFloat(e.target.value);
                  if (!isNaN(parsed)) setAmount(parsed);
                }}
                required
                className="w-full pl-8 pr-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                placeholder="Enter bid amount"
              />
            </div>
          </div>

          {/* Instant Pitch Templates */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
              Instant Pitch Templates
            </label>
            <div className="space-y-1.5">
              {messageTemplates.map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition cursor-pointer border ${
                    selectedTemplate === tpl
                      ? "border-amber-500 bg-amber-50/70 text-zinc-900 font-medium"
                      : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
                  }`}
                >
                  "{tpl}"
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-700">
              Message to Customer
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              required
              placeholder="Introduce your team, describe your timeline, or customize your pitch..."
              className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Free Contact Unlock Guarantee */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>$0 Lead Fee:</strong> Full customer phone & email contact unlocks automatically once your bid is accepted!
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-150">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Bid (${parseFloat(customAmountText || "0").toLocaleString()})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
