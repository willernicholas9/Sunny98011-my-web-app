import React, { useState } from "react";
import { ContractorUser } from "../types";
import { Crown, CheckCircle2, Zap, Shield, Sparkles, X, CreditCard, Lock, ArrowRight, Star } from "lucide-react";
import { monetizationService } from "../services/monetizationService";

interface ContractorProModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractor: ContractorUser | null;
  onUpgradeSuccess: (updatedContractor: ContractorUser) => void;
  onOpenStripeHub?: () => void;
}

export default function ContractorProModal({
  isOpen,
  onClose,
  contractor,
  onUpgradeSuccess,
  onOpenStripeHub,
}: ContractorProModalProps) {
  const [selectedTier, setSelectedTier] = useState<"pro" | "enterprise">("pro");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    if (!contractor) return;
    setIsProcessing(true);

    try {
      const res = await monetizationService.subscribeContractor(
        contractor,
        selectedTier,
        billingCycle,
        "4242"
      );

      if (res.success) {
        setSuccessMessage(res.message);
        const updated: ContractorUser = {
          ...contractor,
          subscriptionActive: true,
          subscriptionTier: selectedTier,
          verifiedProBadge: true,
        };

        onUpgradeSuccess(updated);
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 2200);
      }
    } catch (e) {
      console.error(e);
      alert("Subscription processing failed. Please check payment method.");
    } finally {
      setIsProcessing(false);
    }
  };

  const proPrice = billingCycle === "monthly" ? "$29" : "$290/yr ($24/mo)";
  const enterprisePrice = billingCycle === "monthly" ? "$99" : "$990/yr ($82/mo)";

  return (
    <div className="fixed inset-0 bg-zinc-950/80 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in" id="contractor-pro-modal">
      <div className="bg-slate-950 border border-amber-500/40 max-w-xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-950 text-amber-400 rounded-2xl shadow-md">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full">
                  OFFICIAL PARTNER PERK
                </span>
                <h3 className="font-display font-black text-lg text-slate-950 leading-none">
                  Upgrade to Contractor Pro
                </h3>
              </div>
              <p className="text-xs text-slate-900 font-semibold mt-1">
                Win 3.8x more bids with early job access & #1 search placement.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-950/20 text-slate-950 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {successMessage ? (
            <div className="p-6 bg-emerald-500/20 border border-emerald-400 rounded-2xl text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-display font-black text-lg text-emerald-300">
                PRO MEMBERSHIP ACTIVATED!
              </h4>
              <p className="text-xs text-emerald-100 max-w-md mx-auto">
                {successMessage}
              </p>
            </div>
          ) : (
            <>
              {/* Billing toggle */}
              <div className="flex items-center justify-center">
                <div className="bg-slate-900 border border-zinc-800 p-1 rounded-xl flex gap-1 text-xs font-bold">
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      billingCycle === "monthly" ? "bg-amber-500 text-slate-950 font-black shadow-3xs" : "text-zinc-400"
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    onClick={() => setBillingCycle("annual")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                      billingCycle === "annual" ? "bg-amber-500 text-slate-950 font-black shadow-3xs" : "text-zinc-400"
                    }`}
                  >
                    <span>Annual Billing</span>
                    <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">Save 20%</span>
                  </button>
                </div>
              </div>

              {/* Tier Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Pro Tier */}
                <div
                  onClick={() => setSelectedTier("pro")}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    selectedTier === "pro"
                      ? "bg-slate-900 border-amber-400 ring-2 ring-amber-400/30 shadow-lg"
                      : "bg-slate-900/60 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-display font-black text-sm text-amber-400 uppercase">
                        Contractor Pro
                      </span>
                      <span className="text-xs font-black text-white font-mono bg-zinc-800 px-2 py-0.5 rounded-lg">
                        {proPrice}
                      </span>
                    </div>
                    <ul className="mt-3 space-y-1.5 text-xs text-zinc-300">
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>15-Minute Early Access</strong> to newly posted jobs</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>#1 Verified Top Badge</strong> on directory searches</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>$0 Fee</strong> on accepted customer contact unlocks</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Enterprise Master Tier */}
                <div
                  onClick={() => setSelectedTier("enterprise")}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    selectedTier === "enterprise"
                      ? "bg-slate-900 border-amber-400 ring-2 ring-amber-400/30 shadow-lg"
                      : "bg-slate-900/60 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-display font-black text-sm text-purple-400 uppercase">
                        Enterprise Master
                      </span>
                      <span className="text-xs font-black text-white font-mono bg-zinc-800 px-2 py-0.5 rounded-lg">
                        {enterprisePrice}
                      </span>
                    </div>
                    <ul className="mt-3 space-y-1.5 text-xs text-zinc-300">
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span><strong>Instant SMS Dispatch</strong> on high-budget jobs</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span><strong>Multi-Crew Roster</strong> management console</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span><strong>Dedicated Account Rep</strong> & priority escrow release</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Guarantee banner */}
              <div className="p-3 bg-slate-900/90 border border-zinc-800 rounded-2xl text-[11px] text-zinc-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Shield className="w-3.5 h-3.5" /> 30-Day Money-Back Guarantee
                </span>
                <span className="text-zinc-500 font-mono">Cancel anytime with 1 click</span>
              </div>

              {/* Action button */}
              <button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black py-3.5 px-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                id="confirm-pro-subscription-btn"
              >
                {isProcessing ? (
                  <span>Activating Pro Membership...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Activate {selectedTier === "enterprise" ? "Enterprise" : "Pro"} ({billingCycle === "monthly" ? (selectedTier === "enterprise" ? "$99/mo" : "$29/mo") : (selectedTier === "enterprise" ? "$990/yr" : "$290/yr")})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
