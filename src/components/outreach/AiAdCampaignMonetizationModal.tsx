import React, { useState } from "react";
import {
  Sparkles, DollarSign, Target, Zap, ShieldCheck, Check,
  TrendingUp, Megaphone, Layers, Bot, ArrowRight, X, Clock,
  Award, Globe, CheckCircle2, Lock, Radio
} from "lucide-react";
import { monetizationService } from "../../services/monetizationService";
import { ContractorUser, AiManagedAdCampaign } from "../../types";

interface AiAdCampaignMonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractor: ContractorUser | null;
  onCampaignLaunched: (campaign: AiManagedAdCampaign) => void;
  onAlert: (msg: string) => void;
  defaultTrade?: string;
  defaultZips?: string;
}

export default function AiAdCampaignMonetizationModal({
  isOpen,
  onClose,
  contractor,
  onCampaignLaunched,
  onAlert,
  defaultTrade = "Roofing & Storm Repair",
  defaultZips = "78701, 75201, 60601"
}: AiAdCampaignMonetizationModalProps) {
  const [selectedTier, setSelectedTier] = useState<"starter" | "pro" | "enterprise">("pro");
  const [targetTrade, setTargetTrade] = useState(defaultTrade);
  const [targetZips, setTargetZips] = useState(defaultZips);
  const [customHeadline, setCustomHeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"packages" | "calculator" | "banner">("packages");
  const [bannerWeeks, setBannerWeeks] = useState(2);

  if (!isOpen) return null;

  const currentContractor: ContractorUser = contractor || {
    id: "contractor-guest-1",
    username: "apexpro",
    email: "pro@apexconstruction.com",
    address: "100 Construction Way",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    creditCard: { number: "•••• 4242", expiry: "12/28", cvv: "•••" },
    role: "contractor",
    createdAt: new Date().toISOString(),
    fullName: "Apex Home Services Pro",
    company: "Apex Roofing & General Construction",
    phone: "(512) 555-0199",
    avatarUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=150&auto=format&fit=crop&q=80",
    trades: [defaultTrade, "General Handyman Projects"],
    reviews: [
      { id: "r1", reviewerName: "Sarah M.", rating: 5, comment: "Fantastic work!", date: "2026-07-15" },
      { id: "r2", reviewerName: "David L.", rating: 5, comment: "On time and under budget.", date: "2026-08-01" }
    ],
    subscriptionActive: true,
    subscriptionTier: "pro",
    verifiedProBadge: true,
    emailNotificationsEnabled: true,
    availableNow: true,
    leadCredits: 15
  };

  const TIER_DETAILS = {
    starter: {
      name: "AI Local Blitz",
      price: 49,
      duration: "7 Days",
      badge: "Fast Launch",
      impressions: "4,200+",
      clicks: "280+",
      leads: "8 - 12 Exclusive Inquiries",
      roas: "4.8x Expected Return",
      channels: ["Nextdoor Sponsor", "Facebook Local Groups", "Automated SMS Blast"],
      features: [
        "Geo-fenced to up to 3 zip codes",
        "Autonomous Gemini copy generation",
        "Homeowner quote request routing",
        "100% Escrow safe job agreements"
      ]
    },
    pro: {
      name: "Multi-Channel Growth Blitz",
      price: 149,
      duration: "30 Days",
      badge: "Most Popular",
      impressions: "16,800+",
      clicks: "1,140+",
      leads: "32 - 45 Exclusive Inquiries",
      roas: "7.2x Expected Return",
      channels: ["Google Local Services", "Meta (FB & IG) Ads", "Nextdoor Verified Sponsor", "3-Part SMS Drip"],
      features: [
        "Geo-fenced to up to 8 zip codes",
        "Top #1 priority placement in local directory",
        "Autonomous weather sensor triggers (rain/storm/freeze)",
        "3-step automated SMS prospect follow-up",
        "Dedicated lead dashboard & phone routing"
      ]
    },
    enterprise: {
      name: "Metro Dominance Tier",
      price: 299,
      duration: "30 Days",
      badge: "High Volume",
      impressions: "48,500+",
      clicks: "3,450+",
      leads: "85 - 120 Exclusive Inquiries",
      roas: "9.4x Expected Return",
      channels: ["Google LSA Top #1", "Meta Video Carousels", "TikTok Local", "Nextdoor Gold", "Automated SMS Funnel"],
      features: [
        "Unlimited target zip codes across metro area",
        "Guaranteed top 3 search spotlight with Gold Crown",
        "Multi-creative AI video & carousel ad testing",
        "Dedicated AI lead concierge (instant quote estimator)",
        "Direct Stripe billing integration & live ROAS reporting"
      ]
    }
  };

  const handlePurchaseCampaign = async () => {
    setIsSubmitting(true);
    try {
      const res = await monetizationService.launchAiAdCampaign(
        currentContractor,
        selectedTier,
        targetTrade,
        targetZips,
        customHeadline
      );

      if (res.success) {
        onCampaignLaunched(res.campaign);
        onAlert(`🚀 AI Ad Campaign (${res.campaign.packageTier.toUpperCase()}) successfully launched! Paid $${res.transaction.amount}. Real-time leads are now routing to your profile.`);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      onAlert("Could not process campaign payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePurchaseBanner = async () => {
    setIsSubmitting(true);
    try {
      const res = await monetizationService.purchaseCategoryBanner(
        currentContractor,
        targetTrade,
        bannerWeeks
      );
      if (res.success) {
        onAlert(`🎉 Sponsored Top Banner active for ${bannerWeeks} weeks in "${targetTrade}"! Fee: $${res.transaction.amount}.`);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto" id="ai-ad-monetization-modal">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-zinc-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-950 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-black uppercase tracking-wider border border-red-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>AI Ad Agent Managed Marketing Services</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              Hire AI Ad Agent to Fill Your Work Schedule
            </h2>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
              Let our autonomous Gemini AI agent run multi-channel advertising blitzes (Google, Meta, Nextdoor, SMS) specifically for your business in your exact target zip codes.
            </p>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex gap-2 mt-6 pt-4 border-t border-white/10">
            <button
              onClick={() => setActiveTab("packages")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "packages" ? "bg-white text-zinc-950 font-black shadow-md" : "text-zinc-300 hover:bg-white/10"
              }`}
            >
              <Megaphone className="w-3.5 h-3.5 text-red-600" />
              <span>AI Ad Packages ($49 - $299)</span>
            </button>
            <button
              onClick={() => setActiveTab("banner")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "banner" ? "bg-white text-zinc-950 font-black shadow-md" : "text-zinc-300 hover:bg-white/10"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Category Top Banner ($39/wk)</span>
            </button>
            <button
              onClick={() => setActiveTab("calculator")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "calculator" ? "bg-white text-zinc-950 font-black shadow-md" : "text-zinc-300 hover:bg-white/10"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>ROI & Revenue Predictor</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* TAB 1: Ad Packages */}
          {activeTab === "packages" && (
            <div className="space-y-6">
              
              {/* Campaign Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Your Primary Trade Focus
                  </label>
                  <select
                    value={targetTrade}
                    onChange={(e) => setTargetTrade(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs font-bold text-zinc-900"
                  >
                    <option value="Roofing & Storm Repair">Roofing & Storm Repair</option>
                    <option value="Lawn Care & Landscaping">Lawn Care & Landscaping</option>
                    <option value="Plumbing & Leak Repairs">Plumbing & Water Heaters</option>
                    <option value="HVAC & AC Installation">HVAC Heating & Cooling</option>
                    <option value="Electrical & Lighting">Electrical & Lighting</option>
                    <option value="Painting & Drywall">Painting & Drywall</option>
                    <option value="General Handyman Projects">General Handyman & Carpentry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Target Zip Codes (Geo-Fence)
                  </label>
                  <input
                    type="text"
                    value={targetZips}
                    onChange={(e) => setTargetZips(e.target.value)}
                    placeholder="e.g. 78701, 75201, 60601"
                    className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs font-mono font-bold text-zinc-900"
                  />
                </div>
              </div>

              {/* Tier Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["starter", "pro", "enterprise"] as const).map((tierKey) => {
                  const tier = TIER_DETAILS[tierKey];
                  const isSelected = selectedTier === tierKey;
                  return (
                    <div
                      key={tierKey}
                      onClick={() => setSelectedTier(tierKey)}
                      className={`rounded-2xl p-5 border-2 transition cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? "border-red-600 bg-red-50/20 shadow-lg ring-2 ring-red-500/20"
                          : "border-zinc-200 hover:border-zinc-300 bg-white"
                      }`}
                    >
                      {tier.badge && (
                        <span className={`absolute -top-2.5 right-4 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          isSelected ? "bg-red-600 text-white shadow-xs" : "bg-zinc-800 text-zinc-200"
                        }`}>
                          {tier.badge}
                        </span>
                      )}

                      <div className="space-y-3">
                        <div>
                          <h3 className="font-display font-black text-base text-zinc-900">{tier.name}</h3>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-3xl font-black font-mono text-zinc-900">${tier.price}</span>
                            <span className="text-xs text-zinc-500 font-bold">/ {tier.duration}</span>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-zinc-200 space-y-1 text-xs">
                          <div className="flex justify-between font-bold">
                            <span className="text-zinc-500">Impressions:</span>
                            <span className="text-zinc-900 font-mono">{tier.impressions}</span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span className="text-zinc-500">Leads:</span>
                            <span className="text-emerald-700 font-bold">{tier.leads}</span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span className="text-zinc-500">Expected ROAS:</span>
                            <span className="text-red-600 font-black">{tier.roas}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                            Included Channels:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {tier.channels.map((ch, i) => (
                              <span key={i} className="text-[10px] bg-zinc-100 text-zinc-700 font-bold px-2 py-0.5 rounded-md">
                                {ch}
                              </span>
                            ))}
                          </div>
                        </div>

                        <ul className="space-y-1.5 pt-2 text-[11px] text-zinc-600 border-t border-zinc-100">
                          {tier.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        className={`w-full mt-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-red-600 hover:bg-red-700 text-white shadow-xs"
                            : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-4 h-4" /> Selected Tier
                          </>
                        ) : (
                          "Select Package"
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Checkout Bar */}
              <div className="bg-zinc-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Instant Stripe Checkout & Live Launch</span>
                  </div>
                  <div className="text-base font-bold text-white">
                    Total: <span className="font-mono text-emerald-400 font-black text-xl">${TIER_DETAILS[selectedTier].price}.00</span>
                    <span className="text-xs text-zinc-400 font-normal ml-2">({TIER_DETAILS[selectedTier].name})</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePurchaseCampaign}
                  disabled={isSubmitting}
                  className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  id="confirm-ai-campaign-purchase-btn"
                >
                  {isSubmitting ? (
                    <span>Launching Campaign...</span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Launch AI Ad Campaign ($ {TIER_DETAILS[selectedTier].price})</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: Top Category Banner */}
          {activeTab === "banner" && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-amber-950 text-sm">
                    Sponsored #1 Top Category Spotlight Placement
                  </h3>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Lock in the very top promotional position whenever homeowners search for <strong>{targetTrade}</strong> in their area. Includes your phone number, 5-star rating, and "Featured Local Master" badge.
                </p>
              </div>

              {/* Visual Banner Preview */}
              <div className="border-2 border-dashed border-amber-300 rounded-2xl p-4 bg-amber-50/40 space-y-2">
                <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">Live Banner Mockup:</span>
                <div className="bg-gradient-to-r from-zinc-900 to-blue-950 text-white rounded-xl p-4 flex items-center justify-between shadow-md">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1 bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded">
                      ★ SPONSORED PRO OF THE WEEK
                    </div>
                    <h4 className="font-bold text-sm">{currentContractor.company || currentContractor.fullName}</h4>
                    <p className="text-xs text-zinc-300">
                      {(currentContractor.trades || [defaultTrade]).join(" • ")} | 4.9 ★★★★★ ({currentContractor.reviews?.length || 24} verified jobs)
                    </p>
                  </div>
                  <button className="bg-amber-400 text-black font-black text-xs px-4 py-2 rounded-xl">
                    Request Quote
                  </button>
                </div>
              </div>

              {/* Duration Selector */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-900 uppercase">Banner Duration</span>
                  <span className="font-mono font-black text-base text-zinc-900 bg-white px-3 py-1 rounded-xl border border-zinc-200">
                    {bannerWeeks} Week{bannerWeeks > 1 ? "s" : ""} ($39/wk)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={bannerWeeks}
                  onChange={(e) => setBannerWeeks(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handlePurchaseBanner}
                  disabled={isSubmitting}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Reserve Top Category Banner (${39 * bannerWeeks}.00)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ROI & Revenue Predictor */}
          {activeTab === "calculator" && (
            <div className="space-y-6">
              <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200 space-y-4">
                <h3 className="font-display font-black text-base text-zinc-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>Projected Contractor Revenue Multiplier</span>
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Based on historical escrow payout data across 50 US metropolitan regions.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-white p-4 rounded-xl border border-zinc-200 space-y-1">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase">Starter ($49)</div>
                    <div className="text-2xl font-black font-mono text-emerald-600">$1,800 - $3,200</div>
                    <div className="text-[11px] text-zinc-500">Approx. 2-3 completed jobs</div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-zinc-200 space-y-1">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase">Growth ($149)</div>
                    <div className="text-2xl font-black font-mono text-emerald-600">$5,400 - $9,800</div>
                    <div className="text-[11px] text-zinc-500">Approx. 6-10 completed jobs</div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-zinc-200 space-y-1">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase">Enterprise ($299)</div>
                    <div className="text-2xl font-black font-mono text-emerald-600">$14,500 - $28,000</div>
                    <div className="text-[11px] text-zinc-500">Full monthly project pipeline</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
