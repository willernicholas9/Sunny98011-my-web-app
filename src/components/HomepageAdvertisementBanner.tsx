import React, { useState, useEffect } from "react";
import { Megaphone, ExternalLink, Sparkles, Building2, ChevronRight, PlusCircle, CheckCircle2 } from "lucide-react";
import { HomepageAd } from "../types";
import SafeStorage from "../utils/browserCompat";

interface HomepageAdvertisementBannerProps {
  onOpenAdvertiseModal: () => void;
  customAds?: HomepageAd[];
  variant?: "top_strip" | "inline_card";
}

const DEFAULT_HOMEPAGE_ADS: HomepageAd[] = [
  {
    id: "ad-default-1",
    companyName: "HomeDepot Pro Supply",
    tagline: "Contractor Bulk Pricing & Next-Day Jobsite Drops",
    description: "Volume tier discounts on 2x4 framing studs, PVC conduit, commercial paint & drywall.",
    badge: "SUPPLY PARTNER",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&auto=format&fit=crop&q=80",
    ctaText: "Shop Pro Deals",
    targetUrl: "https://www.homedepot.com/pro",
    category: "Materials",
    placement: "top_banner",
    pricePaid: 79,
    durationDays: 30,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    isActive: true,
    clicksCount: 42,
  },
  {
    id: "ad-default-2",
    companyName: "Milwaukee Tool Direct",
    tagline: "M18 Fuel Heavy Duty Trade Tools & Instant Battery Swap",
    description: "Upgrade your work trailer with 5-year commercial warranty tools and battery trade-in credits.",
    badge: "TOOL SPONSOR",
    imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=200&auto=format&fit=crop&q=80",
    ctaText: "Claim Battery Rebate",
    targetUrl: "https://www.milwaukeetool.com",
    category: "Tools",
    placement: "top_banner",
    pricePaid: 79,
    durationDays: 30,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    isActive: true,
    clicksCount: 38,
  },
  {
    id: "ad-default-3",
    companyName: "NextShield Contractor Insurance",
    tagline: "Instant $1M General Liability Certificates in 3 Minutes",
    description: "Win big contracts by showing verified certificate of insurance on every client proposal.",
    badge: "VERIFIED INSURER",
    imageUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=200&auto=format&fit=crop&q=80",
    ctaText: "Get $29/mo Rate",
    targetUrl: "https://www.nextinsurance.com",
    category: "Insurance",
    placement: "top_banner",
    pricePaid: 79,
    durationDays: 30,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    isActive: true,
    clicksCount: 29,
  },
];

function HomepageAdvertisementBanner({
  onOpenAdvertiseModal,
  customAds = [],
  variant = "top_strip",
}: HomepageAdvertisementBannerProps) {
  const [activeAdIndex, setActiveAdIndex] = useState(0);

  // Combine default ads with any custom purchased ads
  const allAds = [...customAds, ...DEFAULT_HOMEPAGE_ADS];

  useEffect(() => {
    if (allAds.length <= 1) return;
    const interval = setInterval(() => {
      setActiveAdIndex((prev) => (prev + 1) % allAds.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [allAds.length]);

  const currentAd = allAds[activeAdIndex] || DEFAULT_HOMEPAGE_ADS[0];

  const handleAdClick = (url: string) => {
    // Record ad click
    try {
      const clickKey = `hsws_ad_clicks_${currentAd.id}`;
      const count = parseInt(SafeStorage.getItem(clickKey) || "0", 10) + 1;
      SafeStorage.setItem(clickKey, count.toString());
    } catch {}
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (variant === "inline_card") {
    return (
      <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/90 border border-amber-300 rounded-2xl p-3.5 sm:p-4 shadow-xs relative overflow-hidden group">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {currentAd.imageUrl && (
              <img
                src={currentAd.imageUrl}
                alt={currentAd.companyName}
                className="w-12 h-12 rounded-xl object-cover border border-amber-200 shrink-0"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white px-1.5 py-0.2 rounded-md">
                  SPONSORED
                </span>
                <span className="font-display font-extrabold text-xs text-zinc-900 truncate">
                  {currentAd.companyName}
                </span>
                <span className="text-[10px] text-zinc-500 font-medium">
                  • {currentAd.category}
                </span>
              </div>
              <div className="text-xs font-semibold text-amber-950 mt-0.5 truncate">
                {currentAd.tagline}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleAdClick(currentAd.targetUrl)}
              className="flex-1 sm:flex-none px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>{currentAd.ctaText}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={onOpenAdvertiseModal}
              className="text-[10px] text-amber-900 hover:text-amber-950 underline px-1 py-1 cursor-pointer whitespace-nowrap"
            >
              + Place Your Ad ($29)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-100/90 via-orange-100/70 to-amber-100/90 border border-amber-300/90 rounded-2xl p-2.5 sm:p-3 shadow-xs">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
        {/* Left: Sponsor Ad Content */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Megaphone className="w-4 h-4 text-white" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white px-1.5 py-0.2 rounded-md">
                SPONSOR SPOTLIGHT
              </span>
              <span className="font-extrabold text-xs text-zinc-900 truncate">
                {currentAd.companyName}
              </span>
              <span className="hidden sm:inline text-zinc-400 text-[10px]">•</span>
              <span className="text-xs text-amber-950 font-medium truncate">
                {currentAd.tagline}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Ad Action & Advertise With Us trigger */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-between md:justify-end">
          <button
            type="button"
            onClick={() => handleAdClick(currentAd.targetUrl)}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <span>{currentAd.ctaText}</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={onOpenAdvertiseModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-950 font-extrabold text-[11px] rounded-xl border border-amber-300 shadow-2xs transition cursor-pointer"
            title="Purchase an advertisement spot on Hot Spot Workshop"
            id="purchase-ad-spot-btn"
          >
            <PlusCircle className="w-3 h-3 text-amber-600" />
            <span>Advertise Here</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(HomepageAdvertisementBanner);
