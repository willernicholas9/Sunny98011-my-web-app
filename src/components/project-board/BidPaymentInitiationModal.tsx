import React, { useState } from "react";
import { Project, Bid, BaseUser } from "../../types";
import {
  X,
  ShieldCheck,
  Lock,
  CreditCard,
  CheckCircle2,
  DollarSign,
  Sparkles,
  ArrowRight,
  HardHat,
  Clock,
  HelpCircle,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { acquisitionSprintService } from "../../services/acquisitionSprintService";
import { monetizationService } from "../../services/monetizationService";

interface BidPaymentInitiationModalProps {
  project: Project;
  bid: Bid;
  currentUser: BaseUser | null;
  onClose: () => void;
  onConfirmPayment: (
    finalAmount: number,
    paymentMethod: string,
    signature: string
  ) => Promise<void> | void;
}

export default function BidPaymentInitiationModal({
  project,
  bid,
  currentUser,
  onClose,
  onConfirmPayment,
}: BidPaymentInitiationModalProps) {
  const agreedPrice = bid.amount;
  const isFirst1000Eligible = Boolean(
    currentUser?.first1000Promo?.isEligible ||
    (currentUser as any)?.firstJobFeeWaived ||
    acquisitionSprintService.isFirst1000PromoActive()
  );

  const standardFee = agreedPrice <= 25000 ? 7.99 : 20.00;
  const platformFee = isFirst1000Eligible ? 0.00 : standardFee;

  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple_pay" | "google_pay" | "wallet">("card");
  const [cardNumber, setCardNumber] = useState<string>("•••• •••• •••• 4242");
  const [expiry, setExpiry] = useState<string>("12/28");
  const [cvc, setCvc] = useState<string>("888");
  const [signature, setSignature] = useState<string>(currentUser?.fullName || "Sarah Jenkins");
  const [agreedTerms, setAgreedTerms] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  // Staged milestone calculations
  const milestone1 = Math.round(agreedPrice * 0.3);
  const milestone2 = Math.round(agreedPrice * 0.4);
  const milestone3 = agreedPrice - milestone1 - milestone2;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      alert("Please check the authorization box to proceed with escrow deposit.");
      return;
    }
    if (!signature.trim()) {
      alert("Please provide your digital signature name.");
      return;
    }

    setIsProcessing(true);

    try {
      // Direct call to Stripe mock funds endpoint to register pending escrow deposit
      try {
        await fetch("/api/stripe/mock-add-funds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: agreedPrice, isPending: true }),
        });
      } catch (err) {
        console.warn("Stripe mock funds sync notice:", err);
      }

      // Record transaction in monetization service
      monetizationService.recordTransaction({
        userId: currentUser?.id || "cust-1",
        userName: currentUser?.fullName || "Project Customer",
        userRole: "customer",
        productType: "escrow_protection_warranty",
        title: `Escrow Initiation for "${project.title.slice(0, 24)}..." ($${agreedPrice.toLocaleString()})`,
        amount: platformFee,
        currency: "USD",
        status: "succeeded",
        projectId: project.id,
        paymentMethod: paymentMethod === "card" ? "stripe_card" : paymentMethod === "apple_pay" ? "apple_pay" : "google_pay",
        referenceId: `esc_init_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      });

      setPaymentSuccess(true);

      setTimeout(async () => {
        await onConfirmPayment(agreedPrice, paymentMethod, signature.trim());
        setIsProcessing(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Payment initiation error:", err);
      setIsProcessing(false);
      alert("Payment processing encountered an error. Please retry.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-xl rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-zinc-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  100% Escrow Protected
                </span>
                <span className="text-xs text-zinc-400">Final Step</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white truncate max-w-sm mt-0.5">
                Initiate Project Escrow & Authorize Payment
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
            title="Cancel payment"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handlePay} className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4">
          {/* Agreed Summary Banner */}
          <div className="bg-gradient-to-r from-zinc-50 to-emerald-50/40 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                Final Agreed Contract Amount
              </span>
              <div className="text-2xl font-black text-emerald-700 font-mono mt-0.5">
                ${agreedPrice.toLocaleString()}
              </div>
              <span className="text-xs text-zinc-500 font-medium">
                Contractor: <strong className="text-zinc-900">{bid.contractorName}</strong>
              </span>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full border border-emerald-300">
                <Lock className="w-3 h-3 text-emerald-600" /> Neutral Escrow Vault
              </span>
              <span className="text-[10px] text-zinc-400 block mt-1">
                Funds released on your inspection only
              </span>
            </div>
          </div>

          {/* Staged Milestone Escrow Schedule */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700">
                Automated Milestone Payout Schedule
              </span>
              <span className="text-[11px] text-zinc-400 font-medium">
                3 Secure Stages
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Stage 1 (30%)
                </span>
                <div className="text-base font-extrabold text-zinc-900 font-mono">
                  ${milestone1.toLocaleString()}
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight">
                  Materials drop & site prep kickoff
                </p>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Stage 2 (40%)
                </span>
                <div className="text-base font-extrabold text-zinc-900 font-mono">
                  ${milestone2.toLocaleString()}
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight">
                  Core trade installation & midpoint inspection
                </p>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Stage 3 (30%)
                </span>
                <div className="text-base font-extrabold text-zinc-900 font-mono">
                  ${milestone3.toLocaleString()}
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight">
                  Final cosmetic cleanup & owner sign-off
                </p>
              </div>
            </div>
          </div>

          {/* Fee & Promo Calculation */}
          <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 space-y-2 text-xs">
            <div className="flex justify-between items-center text-zinc-600">
              <span>Agreed Contractor Payout:</span>
              <span className="font-mono font-bold text-zinc-900">${agreedPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-600">
              <span className="flex items-center gap-1">
                <span>Platform Escrow Protection Guarantee:</span>
                <HelpCircle className="w-3 h-3 text-zinc-400" />
              </span>
              <span className="font-mono font-bold text-emerald-700">INCLUDED (FREE)</span>
            </div>
            <div className="flex justify-between items-center text-zinc-600 pt-1 border-t border-zinc-200">
              <span className="flex items-center gap-1">
                <span>Customer Acceptance Processing Fee:</span>
                {isFirst1000Eligible && (
                  <span className="bg-amber-100 text-amber-900 text-[9px] font-black px-1.5 py-0.25 rounded uppercase">
                    Early Adopter Promo
                  </span>
                )}
              </span>
              <span className="font-mono font-bold text-zinc-900">
                {isFirst1000Eligible ? (
                  <span className="text-emerald-700">
                    <span className="line-through text-zinc-400 mr-1.5">${standardFee.toFixed(2)}</span>
                    $0.00 (100% Waived)
                  </span>
                ) : (
                  `$${standardFee.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm font-extrabold text-zinc-950 pt-1.5 border-t border-zinc-200">
              <span>Total Deposit Required Today:</span>
              <span className="font-mono text-emerald-700 text-base">
                ${(agreedPrice + platformFee).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-700">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                  paymentMethod === "card"
                    ? "border-amber-500 bg-amber-50/80 text-zinc-900 ring-2 ring-amber-500/20 font-bold"
                    : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                }`}
              >
                <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("apple_pay")}
                className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                  paymentMethod === "apple_pay"
                    ? "border-amber-500 bg-amber-50/80 text-zinc-900 ring-2 ring-amber-500/20 font-bold"
                    : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                }`}
              >
                <span>🍎 Apple Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("google_pay")}
                className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                  paymentMethod === "google_pay"
                    ? "border-amber-500 bg-amber-50/80 text-zinc-900 ring-2 ring-amber-500/20 font-bold"
                    : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                }`}
              >
                <span>💳 G Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("wallet")}
                className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                  paymentMethod === "wallet"
                    ? "border-amber-500 bg-amber-50/80 text-zinc-900 ring-2 ring-amber-500/20 font-bold"
                    : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                }`}
              >
                <span>🪙 Wallet Balance</span>
              </button>
            </div>
          </div>

          {/* Card Input Mock fields */}
          {paymentMethod === "card" && (
            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2.5 animate-in fade-in">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-mono font-bold text-zinc-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Expiration
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-mono text-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Security Code (CVC)
                  </label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-mono text-zinc-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Digital Signature & Authorization */}
          <div className="space-y-2 pt-2 border-t border-zinc-150">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Authorized Digital Signature (Full Name)
              </label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                required
                placeholder="Type your legal full name"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <label className="flex items-start gap-2.5 p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="leading-relaxed text-[11px]">
                I agree to the Hot Spot Workshop Escrow Agreement. Funds will be securely held in neutral escrow and only released upon my satisfactory inspection of completed project milestones.
              </span>
            </label>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-150">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !agreedTerms || !signature.trim()}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isProcessing
                  ? "Securing Escrow Deposit..."
                  : `Authorize Escrow Deposit ($${(agreedPrice + platformFee).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
