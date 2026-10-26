import React, { useState } from "react";
import { Project, Bid, NegotiationStep, BaseUser } from "../../types";
import {
  X,
  DollarSign,
  Send,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Package,
  Calendar,
  Check,
  User,
  HardHat,
  RotateCcw,
} from "lucide-react";
import VoiceInputButton from "../VoiceInputButton";

interface JobNegotiationModalProps {
  project: Project;
  bid: Bid;
  currentUser: BaseUser | null;
  onClose: () => void;
  onAcceptBid: (bidId: string) => void;
  onCounterBid: (bidId: string, amount: number, message: string) => void;
  onContractorAcceptCounter?: (bidId: string) => void;
  onContractorDeclineCounter?: (bidId: string) => void;
  onContractorCounter?: (bidId: string, amount: number, message: string) => void;
  onStartChat?: (recipientId: string, recipientName: string, recipientRole: "customer" | "contractor") => void;
  onProceedToPayment?: (bid: Bid, project: Project) => void;
}

export default function JobNegotiationModal({
  project,
  bid,
  currentUser,
  onClose,
  onAcceptBid,
  onCounterBid,
  onContractorAcceptCounter,
  onContractorDeclineCounter,
  onContractorCounter,
  onStartChat,
  onProceedToPayment,
}: JobNegotiationModalProps) {
  const isOwner = currentUser && currentUser.id === project.customerId;
  const isBidder = currentUser && currentUser.id === bid.contractorId;

  const [counterAmount, setCounterAmount] = useState<number>(() => {
    // Default counter suggestion: 10% lower if customer, or current bid amount if contractor
    if (isOwner) {
      return Math.round(bid.amount * 0.9);
    }
    return bid.amount;
  });
  const [customAmountText, setCustomAmountText] = useState<string>(() => counterAmount.toString());
  const [counterMessage, setCounterMessage] = useState<string>("");
  const [includeMaterials, setIncludeMaterials] = useState<boolean>(true);
  const [estimatedDays, setEstimatedDays] = useState<number>(bid.completionDays || 3);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Quick counter presets
  const counterPresets = isOwner
    ? [
        { label: "5% Discount", val: Math.round(bid.amount * 0.95), desc: "Gentle adjustment" },
        { label: "10% Discount", val: Math.round(bid.amount * 0.9), desc: "Target budget" },
        { label: "15% Discount", val: Math.round(bid.amount * 0.85), desc: "Volume savings" },
        { label: "Match Budget", val: project.budget, desc: "Original target" },
      ]
    : [
        { label: "Meet Halfway", val: Math.round((bid.amount + project.budget) / 2), desc: "Balanced compromise" },
        { label: "Current Offer", val: bid.amount, desc: "Firm quality rate" },
        { label: "+10% Rush", val: Math.round(bid.amount * 1.1), desc: "Priority weekend schedule" },
        { label: "Labor Only (-15%)", val: Math.round(bid.amount * 0.85), desc: "Owner buys materials" },
      ];

  const quickTemplates = isOwner
    ? [
        "Can we agree on this price if I purchase all lumber and hardware upfront?",
        "I have a flexible timeline and can accommodate your crew's open schedule.",
        "Could you meet in the middle? I am ready to award the job immediately if agreed.",
        "Does this revised quote include full debris cleanup and haul-away?",
      ]
    : [
        "I can accept this price if we begin this Thursday and split payments across 3 milestones.",
        "This rate covers all professional labor, premium primers, and a 2-year craft guarantee.",
        "I can meet your proposed budget! Ready to lock the contract and deliver materials.",
        "To hit this target price, homeowner supplies the paint/tiles and I provide all tools & labor.",
      ];

  const handleSelectPreset = (val: number) => {
    setCounterAmount(val);
    setCustomAmountText(val.toString());
  };

  const handleSelectTemplate = (tpl: string) => {
    setCounterMessage(tpl);
  };

  const handleSubmitCounter = (e: React.FormEvent) => {
    e.preventDefault();
    const finalVal = parseFloat(customAmountText);
    if (isNaN(finalVal) || finalVal <= 0) {
      alert("Please enter a valid counter-offer amount.");
      return;
    }
    if (!counterMessage.trim()) {
      alert("Please include a brief note explaining your proposal.");
      return;
    }

    setIsSubmitting(true);

    if (isOwner) {
      onCounterBid(bid.id, finalVal, counterMessage.trim());
    } else if (isBidder) {
      if (onContractorCounter) {
        onContractorCounter(bid.id, finalVal, counterMessage.trim());
      } else {
        onCounterBid(bid.id, finalVal, counterMessage.trim());
      }
    } else {
      // Guest or admin test
      onCounterBid(bid.id, finalVal, counterMessage.trim());
    }

    setIsSubmitting(false);
    onClose();
  };

  const handleAcceptAndPay = () => {
    if (onProceedToPayment) {
      onProceedToPayment(bid, project);
    } else {
      onAcceptBid(bid.id);
    }
    onClose();
  };

  // Compile negotiation history including original bid
  const initialStep: NegotiationStep = {
    id: `step-original-${bid.id}`,
    senderRole: "contractor",
    senderName: bid.contractorName,
    amount: bid.amount,
    message: bid.message,
    createdAt: bid.createdAt,
    completionDays: bid.completionDays,
    materialsIncluded: bid.materialsIncluded,
  };

  const fullHistory: NegotiationStep[] = [
    initialStep,
    ...(bid.history || []).filter((h) => h.id !== initialStep.id),
  ];

  const lastStep = fullHistory[fullHistory.length - 1];
  const isAwaitingContractor = bid.status === "counter_by_customer";
  const isAwaitingCustomer = bid.status === "counter_by_contractor";
  const isPendingInitial = bid.status === "pending";
  const isAccepted = bid.status === "accepted";
  const isDeclined = bid.status === "declined";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  Job Bidding & Negotiation Center
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {fullHistory.length} proposal {fullHistory.length === 1 ? "round" : "rounds"}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white truncate max-w-md mt-0.5">
                {project.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
            title="Close negotiation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Callout Banner */}
        <div className="bg-zinc-100 border-b border-zinc-200 px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-600">Current Status:</span>
            {isAccepted ? (
              <span className="inline-flex items-center gap-1 font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Bid Accepted & Active in Escrow
              </span>
            ) : isDeclined ? (
              <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3.5 h-3.5" /> Negotiation Closed
              </span>
            ) : isAwaitingContractor ? (
              <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" /> Awaiting Contractor Response to Customer Offer
              </span>
            ) : isAwaitingCustomer ? (
              <span className="inline-flex items-center gap-1 font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-full">
                <Clock className="w-3.5 h-3.5 text-blue-700" /> Awaiting Customer Decision on Revised Quote
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-zinc-700 bg-zinc-200 px-2 py-0.5 rounded-full">
                Pending Initial Review
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-zinc-600 font-mono">
            <span>Customer Budget: <strong className="text-zinc-900">${project.budget.toLocaleString()}</strong></span>
            <span>&bull;</span>
            <span>Current Offer: <strong className="text-emerald-700 text-sm">${bid.amount.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-5">
          {/* Contractor Profile Summary Box */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-amber-900 text-sm shrink-0">
                <HardHat className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-zinc-900 leading-tight">
                    {bid.contractorName}
                  </h4>
                  {bid.contractorCompany && (
                    <span className="text-[11px] text-zinc-500 font-medium">
                      ({bid.contractorCompany})
                    </span>
                  )}
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Pro
                  </span>
                </div>
                <span className="text-xs text-zinc-500 block mt-0.5">
                  📍 {project.city}, {project.state} &bull; {project.type === "business" ? "Commercial Job" : "Residential Job"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onStartChat && onStartChat(bid.contractorId, bid.contractorName, "contractor")}
                className="bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Open 1-on-1 private messaging channel"
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Chat Details</span>
              </button>
            </div>
          </div>

          {/* Chronological Negotiation Timeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
                Negotiation Exchange History
              </span>
              <span className="text-[11px] text-zinc-400 font-medium">
                Mutual binding proposal ledger
              </span>
            </div>

            <div className="space-y-2.5 bg-zinc-50/70 p-3.5 rounded-2xl border border-zinc-200">
              {fullHistory.map((step, idx) => {
                const isContractorStep = step.senderRole === "contractor";
                const isLatest = idx === fullHistory.length - 1;

                return (
                  <div
                    key={step.id || idx}
                    className={`p-3 rounded-xl border transition ${
                      isLatest
                        ? "bg-white border-amber-400/80 shadow-xs ring-1 ring-amber-400/30"
                        : "bg-white/80 border-zinc-200/80"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isContractorStep
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-cyan-100 text-cyan-900 border border-cyan-300"
                          }`}
                        >
                          {isContractorStep ? "Contractor Offer" : "Homeowner Counter"}
                        </span>
                        <span className="text-xs font-extrabold text-zinc-800">
                          {step.senderName || (isContractorStep ? bid.contractorName : project.customerFirstName)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-emerald-700 font-mono">
                          ${step.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {new Date(step.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-2.5 rounded-lg border border-zinc-150 font-normal">
                      "{step.message}"
                    </p>

                    {(step.completionDays || step.materialsIncluded !== undefined) && (
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-500 font-medium">
                        {step.completionDays && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-400" /> {step.completionDays} Days Estimated
                          </span>
                        )}
                        {step.materialsIncluded !== undefined && (
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3 text-zinc-400" />
                            {step.materialsIncluded ? "Materials Included" : "Labor Only (Owner Supplies)"}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Counter-Offer Proposal Form (Only when job is open / pending negotiation) */}
          {!isAccepted && !isDeclined && project.status === "open" && (
            <form onSubmit={handleSubmitCounter} className="space-y-3.5 pt-2 border-t border-zinc-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Propose Counter-Offer</span>
                </span>
                <span className="text-[11px] text-zinc-400 font-medium">
                  {isOwner ? "Homeowner Proposal" : "Contractor Revised Pitch"}
                </span>
              </div>

              {/* 1-Click Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {counterPresets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(p.val)}
                    className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                      counterAmount === p.val
                        ? "border-amber-500 bg-amber-50 text-zinc-900 ring-2 ring-amber-500/20"
                        : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    <div className="text-xs font-black font-mono">${p.val.toLocaleString()}</div>
                    <div className="text-[10px] text-zinc-500 font-medium truncate">{p.label}</div>
                  </button>
                ))}
              </div>

              {/* Custom Offer Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Proposed Amount ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-zinc-400 font-bold text-sm">$</span>
                    <input
                      type="number"
                      value={customAmountText}
                      onChange={(e) => {
                        setCustomAmountText(e.target.value);
                        const parsed = parseFloat(e.target.value);
                        if (!isNaN(parsed)) setCounterAmount(parsed);
                      }}
                      required
                      min={1}
                      className="w-full pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      placeholder="e.g. 750"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Completion Timeline
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={estimatedDays}
                      onChange={(e) => setEstimatedDays(parseInt(e.target.value) || 1)}
                      min={1}
                      max={90}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                    <span className="absolute right-3 top-2.5 text-zinc-400 text-xs font-medium">Days</span>
                  </div>
                </div>
              </div>

              {/* Materials Included Checkbox */}
              <label className="flex items-center gap-2 p-2.5 bg-zinc-50 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMaterials}
                  onChange={(e) => setIncludeMaterials(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Includes all standard supplies, disposal, and materials in this quote</span>
              </label>

              {/* Quick Negotiation Templates */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Quick Negotiation Message Templates
                </span>
                <div className="space-y-1">
                  {quickTemplates.map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`w-full text-left p-2 rounded-xl text-xs transition cursor-pointer border ${
                        counterMessage === tpl
                          ? "border-amber-500 bg-amber-50 text-zinc-900 font-medium"
                          : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      "{tpl}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Counter Message Input with Voice-to-Text */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-700">
                    Negotiation Terms / Message
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-400 font-medium">Dictate terms:</span>
                    <VoiceInputButton
                      onTranscript={(spoken) => {
                        if (!spoken.trim()) return;
                        setCounterMessage((prev) => (prev ? `${prev} ${spoken}` : spoken));
                      }}
                      size="xs"
                      continuous={true}
                      title="Speak negotiation terms"
                    />
                  </div>
                </div>
                <textarea
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  rows={2}
                  required
                  placeholder="Detail your proposed adjustments, milestone preferences, or trade terms..."
                  className="w-full p-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* Counter Submit Button */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !counterMessage.trim()}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Counter-Offer (${parseFloat(customAmountText || "0").toLocaleString()})</span>
                </button>
              </div>
            </form>
          )}

          {/* Action Decision Buttons */}
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-800">
                Finalize Agreement & Payment
              </span>
              <span className="text-[11px] text-zinc-400">
                Escrow Protected &bull; 0% Hidden Surcharges
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
              {/* If Contractor viewing counter from customer */}
              {isBidder && isAwaitingContractor && (
                <>
                  <button
                    type="button"
                    onClick={() => onContractorDeclineCounter?.(bid.id)}
                    className="px-4 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer"
                  >
                    Decline Counter
                  </button>
                  <button
                    type="button"
                    onClick={() => onContractorAcceptCounter?.(bid.id)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept Customer Price (${bid.amount.toLocaleString()})</span>
                  </button>
                </>
              )}

              {/* If Homeowner viewing Contractor bid/counter */}
              {isOwner && project.status === "open" && (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 rounded-xl transition cursor-pointer text-center"
                  >
                    Keep Negotiating
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptAndPay}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Offer & Proceed to Payment (${bid.amount.toLocaleString()})</span>
                  </button>
                </>
              )}

              {/* If already accepted */}
              {isAccepted && (
                <div className="w-full flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Agreed at ${bid.amount.toLocaleString()} &bull; Funds allocated to milestone escrow</span>
                  </span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
