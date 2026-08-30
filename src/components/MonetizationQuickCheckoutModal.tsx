import React, { useState } from "react";
import { X, Crown, Zap, Flame, ShieldCheck, Phone, CheckCircle2, Lock, ArrowRight, DollarSign, Sparkles, CreditCard } from "lucide-react";
import { monetizationService } from "../services/monetizationService";
import { Project } from "../types";

export type MonetizationProductKind = "contractor_pro" | "lead_unlock" | "rush_dispatch" | "project_boost" | "escrow_fee";

interface MonetizationQuickCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  productKind: MonetizationProductKind;
  targetProject?: Project | null;
  currentUser: any;
  onSuccessPurchase: (message: string) => void;
}

export default function MonetizationQuickCheckoutModal({
  isOpen,
  onClose,
  productKind,
  targetProject,
  currentUser,
  onSuccessPurchase,
}: MonetizationQuickCheckoutModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"card" | "apple_pay" | "google_pay">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successState, setSuccessState] = useState(false);

  if (!isOpen) return null;

  const productDetails = {
    contractor_pro: {
      title: "Contractor Pro Membership",
      price: 29.00,
      period: "/month",
      badge: "PRO CONTRACTOR",
      badgeColor: "bg-amber-500 text-slate-950",
      icon: <Crown className="w-7 h-7 text-amber-500" />,
      description: "Supercharge your trade business with #1 directory placement, 15-minute early lead notifications, and 0% contact fees.",
      benefits: [
        "15-Minute Early Job Notification Window before public feed",
        "#1 Verified Pro Badge in local city contractor search",
        "Unlimited direct homeowner contact unlocks (Save $15 per lead)",
        "Verified Insurance & License Trust Badge",
        "Export professional itemized PDF invoices & estimates",
      ],
    },
    lead_unlock: {
      title: "Direct Homeowner Lead Unlock Pass",
      price: 15.00,
      period: "one-time",
      badge: "DIRECT ACCESS",
      badgeColor: "bg-blue-600 text-white",
      icon: <Phone className="w-7 h-7 text-blue-500" />,
      description: `Instantly unlock direct unmasked phone number and email for ${targetProject ? `${targetProject.customerFirstName} ${targetProject.customerLastName || ""}`.trim() : "this client"} to close the deal right away.`,
      benefits: [
        "Direct unmasked phone number & SMS callout",
        "Direct homeowner email address",
        "Instant exclusive 2-hour negotiation window",
        "100% money-back guarantee if homeowner is unresponsive",
      ],
    },
    rush_dispatch: {
      title: "15-Minute Rush Emergency Dispatch",
      price: 25.00,
      period: "per dispatch",
      badge: "PRIORITY DISPATCH",
      badgeColor: "bg-rose-600 text-white",
      icon: <Flame className="w-7 h-7 text-rose-500" />,
      description: "Instantly broadcast your urgent repair to all on-call licensed contractors within a 25-mile radius with SMS sirens.",
      benefits: [
        "Instant SMS blast to 20+ on-call licensed pros nearby",
        "Guaranteed contractor response in under 15 minutes",
        "Top priority placement at the very peak of the job feed",
        "Includes dedicated dispatch manager monitoring",
      ],
    },
    project_boost: {
      title: "Featured 3x Project Boost",
      price: 9.99,
      period: "7 days",
      badge: "FEATURED LISTING",
      badgeColor: "bg-amber-500 text-slate-950",
      icon: <Zap className="w-7 h-7 text-amber-500" />,
      description: `Pin "${targetProject?.title || "your project"}" to the top of the local job feed with glowing featured styling.`,
      benefits: [
        "Fixed at #1 top position on the local city board",
        "Glowing gold border badge for maximum contractor visibility",
        "Average 4.2x more bids received in the first 24 hours",
        "Auto-notifies all matching trade specialists within 50 miles",
      ],
    },
    escrow_fee: {
      title: "Milestone Escrow Payment Protection",
      price: 18.50,
      period: "calculated",
      badge: "100% GUARANTEED",
      badgeColor: "bg-emerald-600 text-white",
      icon: <ShieldCheck className="w-7 h-7 text-emerald-500" />,
      description: "Secure milestone funds held safely in neutral escrow until work is inspected and signed off by the homeowner.",
      benefits: [
        "Funds held safely until milestones pass customer inspection",
        "Automated milestone release with digital signature",
        "Zero chargeback or contractor non-payment risk",
        "Includes dispute mediation support",
      ],
    },
  }[productKind];

  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessState(true);

      // Record transaction into monetization service
      const productTypeMap: Record<MonetizationProductKind, import("../types").MonetizationProductType> = {
        contractor_pro: "contractor_pro_subscription",
        project_boost: "project_priority_boost",
        rush_dispatch: "project_emergency_rush",
        lead_unlock: "lead_credits_pack_small",
        escrow_fee: "escrow_protection_warranty",
      };

      monetizationService.recordTransaction({
        userId: currentUser?.id || "guest-user",
        userName: currentUser?.fullName || "Verified User",
        userRole: currentUser?.role || "contractor",
        productType: productTypeMap[productKind] || "contractor_pro_subscription",
        title: productDetails.title,
        amount: productDetails.price,
        currency: "USD",
        status: "succeeded",
        projectId: targetProject?.id,
        paymentMethod: selectedPaymentMethod === "card" ? "stripe_card" : selectedPaymentMethod === "apple_pay" ? "apple_pay" : "google_pay",
        referenceId: `ch_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      });

      setTimeout(() => {
        onSuccessPurchase(`Successfully activated ${productDetails.title}!`);
        onClose();
        setSuccessState(false);
      }, 1400);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white border border-zinc-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition cursor-pointer"
          id="close-monetization-modal-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-zinc-100 rounded-2xl shrink-0">
            {productDetails.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${productDetails.badgeColor}`}>
                {productDetails.badge}
              </span>
            </div>
            <h3 className="text-xl font-display font-black text-zinc-900 mt-1">
              {productDetails.title}
            </h3>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black font-mono text-zinc-900">
                ${productDetails.price.toFixed(2)}
              </span>
              <span className="text-xs text-zinc-500 font-bold">
                {productDetails.period}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed font-medium">
          {productDetails.description}
        </p>

        {/* Benefits Checklist */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800">
            Included Instant Capabilities:
          </h4>
          <ul className="space-y-1.5">
            {productDetails.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-zinc-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
            Select Instant Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedPaymentMethod("card")}
              className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                selectedPaymentMethod === "card"
                  ? "border-amber-500 bg-amber-50/60 font-black text-zinc-900 ring-1 ring-amber-400"
                  : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs"
              }`}
            >
              <CreditCard className="w-4 h-4 text-zinc-800" />
              <span className="text-[11px]">Card / Stripe</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPaymentMethod("apple_pay")}
              className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                selectedPaymentMethod === "apple_pay"
                  ? "border-amber-500 bg-amber-50/60 font-black text-zinc-900 ring-1 ring-amber-400"
                  : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs"
              }`}
            >
              <span className="font-bold text-xs"> Pay</span>
              <span className="text-[11px]">Apple Pay</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPaymentMethod("google_pay")}
              className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                selectedPaymentMethod === "google_pay"
                  ? "border-amber-500 bg-amber-50/60 font-black text-zinc-900 ring-1 ring-amber-400"
                  : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs"
              }`}
            >
              <span className="font-bold text-xs">G Pay</span>
              <span className="text-[11px]">Google Pay</span>
            </button>
          </div>
        </div>

        {/* Action Button */}
        {successState ? (
          <div className="p-3.5 bg-emerald-500 text-white rounded-2xl font-black text-center flex items-center justify-center gap-2 text-sm shadow-md animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            <span>Payment Verified! Activating feature...</span>
          </div>
        ) : (
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleCheckout}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-display font-black text-sm py-3.5 rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            id="monetization-confirm-purchase-btn"
          >
            {isProcessing ? (
              <span>Authorizing Transaction...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Authorize & Pay ${productDetails.price.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}

        <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL Encrypted • Instant Activation • 100% Guaranteed</span>
        </div>
      </div>
    </div>
  );
}
