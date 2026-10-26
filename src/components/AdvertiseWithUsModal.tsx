import React, { useState } from "react";
import {
  X,
  Megaphone,
  Sparkles,
  CreditCard,
  CheckCircle2,
  Lock,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Tag,
  Building2,
  Flame,
  ArrowRight,
} from "lucide-react";
import { HomepageAd } from "../types";

interface AdvertiseWithUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdPurchased: (newAd: HomepageAd) => void;
}

export const PRESET_SPONSOR_TEMPLATES = [
  {
    companyName: "HomeDepot Pro",
    tagline: "Contractor Bulk Pricing & Fast Jobsite Delivery",
    description: "Exclusive volume discounts on lumber, copper piping, drywall, and commercial paint for registered trade specialists.",
    badge: "SUPPLY PARTNER",
    accentColor: "amber",
    ctaText: "Unlock 15% Pro Tier",
    targetUrl: "https://www.homedepot.com/pro",
    category: "Building Materials",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&auto=format&fit=crop&q=80",
  },
  {
    companyName: "Milwaukee Tool Direct",
    tagline: "Heavy-Duty M18 Fuel Tools & Battery Swap Exchange",
    description: "Upgrade your tool trailer with 5-year warranty brushless motors and instant trade-in credits for old power tools.",
    badge: "TOOL SPONSOR",
    accentColor: "rose",
    ctaText: "Claim Battery Rebate",
    targetUrl: "https://www.milwaukeetool.com",
    category: "Tools & Equipment",
    imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&auto=format&fit=crop&q=80",
  },
  {
    companyName: "NextShield Contractor Insurance",
    tagline: "Instant $1M General Liability Certificates in 3 Minutes",
    description: "Win high-ticket homeowner contracts by showing instant verified liability certificates on every job site bid.",
    badge: "VERIFIED INSURER",
    accentColor: "emerald",
    ctaText: "Get $29/mo Rate",
    targetUrl: "https://www.nextinsurance.com",
    category: "Insurance & Bonding",
    imageUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&auto=format&fit=crop&q=80",
  },
  {
    companyName: "Sunbelt Equipment Rentals",
    tagline: "Excavators, Boom Lifts & Skid Steers Delivered Same Day",
    description: "Zero maintenance headaches. Rent commercial trenchers, dump trailers, and scaffolding with flexible daily rates.",
    badge: "FLEET SPONSOR",
    accentColor: "blue",
    ctaText: "Check Local Fleet",
    targetUrl: "https://www.sunbeltrentals.com",
    category: "Heavy Machinery",
    imageUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7eed?w=400&auto=format&fit=crop&q=80",
  },
];

const PACKAGES = [
  {
    id: "7_days",
    name: "Starter Sponsor",
    durationDays: 7,
    price: 29,
    badge: "Popular for Local Shops",
    desc: "7 Days rotation at top of available job boards + category tags",
  },
  {
    id: "30_days",
    name: "Growth Pro Sponsor",
    durationDays: 30,
    price: 79,
    badge: "Best ROI Value (Save 40%)",
    desc: "30 Days featured banner + prominent job card sponsor badge + direct links",
    recommended: true,
  },
  {
    id: "annual",
    name: "Annual Partner Blitz",
    durationDays: 365,
    price: 499,
    badge: "VIP Exclusive Spotlight",
    desc: "365 Days priority sponsor banner + dedicated supplier directory listing",
  },
];

export default function AdvertiseWithUsModal({
  isOpen,
  onClose,
  onAdPurchased,
}: AdvertiseWithUsModalProps) {
  const [selectedPackageId, setSelectedPackageId] = useState<string>("30_days");
  const [companyName, setCompanyName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("SPONSOR");
  const [category, setCategory] = useState("Building Materials");
  const [ctaText, setCtaText] = useState("Claim Pro Discount");
  const [targetUrl, setTargetUrl] = useState("https://example.com");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&auto=format&fit=crop&q=80");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentPkg = PACKAGES.find((p) => p.id === selectedPackageId) || PACKAGES[1];

  const handleApplyTemplate = (tmpl: typeof PRESET_SPONSOR_TEMPLATES[0]) => {
    setCompanyName(tmpl.companyName);
    setTagline(tmpl.tagline);
    setDescription(tmpl.description);
    setBadge(tmpl.badge);
    setCtaText(tmpl.ctaText);
    setTargetUrl(tmpl.targetUrl);
    setCategory(tmpl.category);
    setImageUrl(tmpl.imageUrl);
  };

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      alert("Please enter your Company Name.");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const expires = new Date();
      expires.setDate(expires.getDate() + currentPkg.durationDays);

      const newAd: HomepageAd = {
        id: `ad-${Date.now()}`,
        companyName: companyName.trim(),
        tagline: tagline.trim() || "Quality Trade Services & Supplies",
        description: description.trim() || "Connecting verified contractors with dependable materials and tools.",
        badge: badge.trim().toUpperCase() || "SPONSOR",
        category,
        ctaText: ctaText.trim() || "Learn More",
        targetUrl: targetUrl.trim() || "https://example.com",
        imageUrl,
        placement: "top_banner",
        pricePaid: currentPkg.price,
        durationDays: currentPkg.durationDays,
        createdAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        isActive: true,
        clicksCount: 0,
      };

      onAdPurchased(newAd);
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-amber-200 flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-5 sm:p-6 flex items-center justify-between rounded-t-3xl shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30 shadow-inner">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/25 px-2 py-0.5 rounded-full text-white inline-block">
                Sponsor Advertising Suite
              </span>
              <h3 className="font-display font-extrabold text-lg sm:text-xl text-white">
                Advertise on Hot Spot Workshop
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-display font-black text-2xl text-zinc-900">
              🎉 Advertisement Activated!
            </h4>
            <p className="text-zinc-600 text-sm max-w-md mx-auto">
              Your advertisement for <strong>{companyName}</strong> has been confirmed and placed live on the Hot Spot Workshop homepage!
            </p>
            <div className="inline-block bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold px-4 py-2 rounded-xl">
              ✓ Active for {currentPkg.durationDays} Days • Billed ${currentPkg.price}.00
            </div>
          </div>
        ) : (
          <form onSubmit={handlePurchase} className="p-5 sm:p-6 space-y-6 flex-1">
            {/* Quick Template Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Quick Autofill Templates (Click to test)</span>
                </label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_SPONSOR_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="p-2.5 rounded-xl border border-zinc-200 hover:border-amber-400 bg-zinc-50 hover:bg-amber-50/60 text-left transition cursor-pointer text-xs group"
                  >
                    <div className="font-black text-zinc-900 group-hover:text-amber-900 truncate">
                      {tmpl.companyName}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">{tmpl.category}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Placement Package */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block">
                Choose Advertising Campaign Package
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PACKAGES.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`relative p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-amber-500 bg-amber-50/70 shadow-sm"
                          : "border-zinc-200 hover:border-zinc-300 bg-white"
                      }`}
                    >
                      {pkg.recommended && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-600 text-white font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                          {pkg.badge}
                        </span>
                      )}
                      <div>
                        <div className="font-display font-black text-sm text-zinc-900">{pkg.name}</div>
                        <div className="text-2xl font-black text-amber-600 mt-1">
                          ${pkg.price}
                          <span className="text-xs font-medium text-zinc-500"> / {pkg.durationDays}d</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-1 leading-snug">{pkg.desc}</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs font-bold">
                        <span className={isSelected ? "text-amber-900" : "text-zinc-400"}>
                          {isSelected ? "✓ Selected" : "Select"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ad Content Fields */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block">
                Advertisement Content & Branding
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">Company / Brand Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Austin Lumber Co."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    <option value="Building Materials">Building Materials & Lumber</option>
                    <option value="Tools & Equipment">Tools & Safety Equipment</option>
                    <option value="Heavy Machinery">Heavy Machinery & Rentals</option>
                    <option value="Insurance & Bonding">Contractor Insurance & Bonding</option>
                    <option value="Trade Software">Trade Apps & Estimating Software</option>
                    <option value="Local Showroom">Local Showroom & Design</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 mb-1">Headline Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. 15% Off Bulk Framing Lumber & Next-Day Delivery"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe your offer or why contractors and homeowners should choose your company..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">Button Call To Action</label>
                  <input
                    type="text"
                    placeholder="e.g. Claim 15% Pro Deal"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">Target Website URL</label>
                  <input
                    type="url"
                    placeholder="https://yourwebsite.com/deal"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Live Card Preview */}
            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                <span>Live Homepage Ad Preview</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-mono">Real-Time</span>
              </label>

              <div className="p-3.5 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-amber-100 shrink-0 border border-amber-200">
                    <img
                      src={imageUrl}
                      alt={companyName || "Sponsor"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-md">
                        SPONSORED
                      </span>
                      <span className="font-display font-extrabold text-sm text-zinc-900 truncate">
                        {companyName || "Your Company Name"}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-amber-950 truncate mt-0.5">
                      {tagline || "Your compelling offer or headline goes here"}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      {description || "Short description of your services for local contractors."}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  <div className="px-3.5 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer">
                    <span>{ctaText || "Claim Deal"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <div className="pt-3 border-t border-zinc-150 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Instant 256-bit secure checkout • Live immediately</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-display font-black text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? (
                  <span>Activating Campaign...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Purchase & Launch Ad (${currentPkg.price}.00)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
