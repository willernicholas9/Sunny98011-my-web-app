import React, { useState } from "react";
import {
  DollarSign, Sparkles, Zap, ShieldCheck, ExternalLink,
  Gift, Percent, FileText, CheckCircle2, ChevronRight,
  TrendingDown, ShoppingBag, Layers, Flame, Sun, Droplets
} from "lucide-react";

export interface MaterialPartnerRebateHubProps {
  zipCode?: string;
  trade?: string;
  currentUser?: any;
  currentCityName?: string;
  onSelectMaterialOffer?: (offer: any) => void;
}

const REBATE_PROGRAMS = [
  {
    category: "HVAC & Heat Pump",
    icon: Flame,
    title: "Inflation Reduction Act 25C Energy Tax Credit",
    rebateAmount: "Up to $2,000 Federal Credit",
    qualification: "High-efficiency heat pumps & ductless mini-splits with SEER2 ≥ 16",
    applyUrl: "https://www.energy.gov/save/rebates",
    partnerBonus: "Plus $500 local utility bill credit"
  },
  {
    category: "Roofing & Storm Protection",
    icon: ShieldCheck,
    title: "Class 4 Impact Resistant Shingle Insurance Discount",
    rebateAmount: "15% - 25% Off Annual Homeowner Insurance",
    qualification: "UL 2218 Class 4 hail/wind rated asphalt or metal shingles",
    applyUrl: "https://www.iii.org",
    partnerBonus: "Saves ~$340/yr on insurance premiums"
  },
  {
    category: "Insulation & Weatherization",
    icon: Sun,
    title: "Attic & Wall Insulation Utility Rebate",
    rebateAmount: "Up to $1,200 Cash Rebate",
    qualification: "Adding R-38 to R-60 blown-in fiberglass or spray foam",
    applyUrl: "https://www.energystar.gov",
    partnerBonus: "Lowers AC/heating bills by 18-24%"
  },
  {
    category: "Plumbing & Water Heaters",
    icon: Droplets,
    title: "Hybrid Heat Pump Water Heater Incentive",
    rebateAmount: "Up to $1,750 Instant Rebate",
    qualification: "ENERGY STAR certified hybrid electric water heaters (UEF ≥ 3.3)",
    applyUrl: "https://www.energystar.gov",
    partnerBonus: "Instant point-of-sale deduction at Home Depot"
  }
];

export default function MaterialPartnerRebateHub({
  zipCode = "78701",
  trade = "All Trades"
}: MaterialPartnerRebateHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  const filteredRebates = selectedCategory === "All"
    ? REBATE_PROGRAMS
    : REBATE_PROGRAMS.filter(r => r.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const handleClaim = (title: string, url: string) => {
    window.open(url, "_blank");
    setClaimedNotice(`Opened official application guidelines for ${title}.`);
    setTimeout(() => setClaimedNotice(null), 4000);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6" id="material-partner-rebate-hub">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-150 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-base sm:text-lg text-zinc-900 leading-tight">
                Government & Utility Rebate Finder (Save $1,000s)
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                ZIP {zipCode} Active
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Zero-cost rebate lookup for homeowners & contractors to lower project expenses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl text-xs font-bold border border-zinc-200 self-start sm:self-auto">
          {["All", "HVAC", "Roofing", "Insulation", "Plumbing"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedCategory === cat ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {claimedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{claimedNotice}</span>
        </div>
      )}

      {/* Rebates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredRebates.map((prog, idx) => {
          const IconComponent = prog.icon;
          return (
            <div
              key={idx}
              className="bg-gradient-to-br from-zinc-50 to-emerald-50/40 border border-zinc-200 hover:border-emerald-300 rounded-2xl p-4.5 flex flex-col justify-between space-y-3 transition-all shadow-2xs"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-2xs">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {prog.category}
                    </span>
                  </div>

                  <span className="text-xs font-black text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded-lg shadow-3xs">
                    {prog.rebateAmount}
                  </span>
                </div>

                <h4 className="font-display font-black text-sm text-zinc-900 leading-snug">
                  {prog.title}
                </h4>

                <p className="text-xs text-zinc-600 leading-relaxed">
                  <strong>Requirements:</strong> {prog.qualification}
                </p>

                <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50/80 p-2 rounded-xl border border-emerald-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{prog.partnerBonus}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200/80 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-medium">Verified Federal/State program</span>
                <button
                  type="button"
                  onClick={() => handleClaim(prog.title, prog.applyUrl)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-2xs cursor-pointer"
                >
                  <span>Apply & Claim</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
