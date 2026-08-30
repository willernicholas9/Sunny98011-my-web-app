import React, { useState } from "react";
import { Calculator, Sparkles, ArrowRight, DollarSign, Clock, ShieldCheck, CheckCircle2, Flame, Wrench, Hammer, Zap, Droplet, Paintbrush, Trees, ChevronDown } from "lucide-react";

interface InstantRepairPricingWidgetProps {
  onAutoCreateJob: (presetData: {
    title: string;
    tradeCategory: string;
    budget: number;
    description: string;
  }) => void;
  onOpenAppStoreModal?: () => void;
}

interface TradeEstimate {
  id: string;
  name: string;
  icon: React.ReactNode;
  popularServices: {
    name: string;
    low: number;
    avg: number;
    high: number;
    turnaround: string;
    description: string;
  }[];
}

const TRADE_ESTIMATES: TradeEstimate[] = [
  {
    id: "plumbing",
    name: "Plumbing & Drains",
    icon: <Droplet className="w-4 h-4 text-sky-500" />,
    popularServices: [
      {
        name: "Water Heater Replacement (50 Gal)",
        low: 850,
        avg: 1450,
        high: 2300,
        turnaround: "4–6 hours",
        description: "Removal of old tank, installation of high-efficiency gas/electric unit, new valves and expansion tank.",
      },
      {
        name: "Main Line Drain Clearing & Hydrojetting",
        low: 350,
        avg: 550,
        high: 950,
        turnaround: "2–3 hours",
        description: "High-pressure jetting to clear heavy tree root intrusion and grease buildup.",
      },
      {
        name: "Whole House Leak Detection & Pipe Repair",
        low: 450,
        avg: 850,
        high: 1600,
        turnaround: "1 day",
        description: "Acoustic line testing and pinhole copper/PEX pipe repair with pressure check.",
      },
    ],
  },
  {
    id: "electrical",
    name: "Electrical & Lighting",
    icon: <Zap className="w-4 h-4 text-amber-500" />,
    popularServices: [
      {
        name: "200-Amp Main Service Panel Upgrade",
        low: 1600,
        avg: 2400,
        high: 3800,
        turnaround: "1 day",
        description: "Complete upgrade to 200A service, new breakers, surge protection, and ground rod installation.",
      },
      {
        name: "EV Charger Circuit Installation (Level 2)",
        low: 500,
        avg: 850,
        high: 1400,
        turnaround: "3–4 hours",
        description: "Dedicated 50-Amp 240V NEMA 14-50 or hardwired circuit directly to garage or exterior.",
      },
      {
        name: "Recessed Can Lights (6-Pack with Dimmer)",
        low: 650,
        avg: 950,
        high: 1500,
        turnaround: "4–5 hours",
        description: "Ultra-slim LED wafers, junction boxes, drywall-safe wiring, and Lutron Smart Dimmer.",
      },
    ],
  },
  {
    id: "roofing",
    name: "Roofing & Gutters",
    icon: <Hammer className="w-4 h-4 text-rose-500" />,
    popularServices: [
      {
        name: "Architectural Shingle Roof Repair",
        low: 450,
        avg: 850,
        high: 1750,
        turnaround: "1 day",
        description: "Repair flashing, damaged decking, missing shingles, and gutter tie-ins.",
      },
      {
        name: "Complete Seamless Aluminum Gutters (150 ft)",
        low: 1100,
        avg: 1750,
        high: 2800,
        turnaround: "1 day",
        description: "Custom on-site roll-formed 6-inch K-style gutters with downspout extensions and leaf guards.",
      },
    ],
  },
  {
    id: "hvac",
    name: "HVAC & Air Conditioning",
    icon: <Flame className="w-4 h-4 text-orange-500" />,
    popularServices: [
      {
        name: "Central A/C & Furnace Tune-Up & Refrigerant",
        low: 150,
        avg: 280,
        high: 450,
        turnaround: "2 hours",
        description: "21-point inspection, condenser coil wash, capacitor testing, and refrigerant recharge.",
      },
      {
        name: "Ductless Multi-Zone Mini-Split Install",
        low: 2800,
        avg: 4500,
        high: 7200,
        turnaround: "1–2 days",
        description: "High-efficiency heat pump condenser and dual wall-mounted air handlers.",
      },
    ],
  },
  {
    id: "painting",
    name: "Painting & Drywall",
    icon: <Paintbrush className="w-4 h-4 text-purple-500" />,
    popularServices: [
      {
        name: "Interior 3-Room Painting (Walls & Trim)",
        low: 1200,
        avg: 1950,
        high: 3200,
        turnaround: "2–3 days",
        description: "Full surface prep, patching, 2 coats premium Sherwin-Williams / Benjamin Moore paint.",
      },
      {
        name: "Drywall Water Damage Repair & Texture Matching",
        low: 350,
        avg: 650,
        high: 1200,
        turnaround: "1 day",
        description: "Sheetrock cutout, new backing, mold treatment, tape & float, orange-peel texture blend.",
      },
    ],
  },
  {
    id: "landscaping",
    name: "Landscaping & Tree Trimming",
    icon: <Trees className="w-4 h-4 text-emerald-500" />,
    popularServices: [
      {
        name: "Full Yard Cleanup, Pruning & Fresh Mulch",
        low: 450,
        avg: 850,
        high: 1600,
        turnaround: "1 day",
        description: "Bed edging, weed barrier, shrub shaping, and 4 yards double-shredded hardwood mulch.",
      },
      {
        name: "Large Oak Tree Pruning & Canopy Elevation",
        low: 650,
        avg: 1250,
        high: 2200,
        turnaround: "1 day",
        description: "Deadwood removal, roof clearance trimming, and complete wood chipping removal.",
      },
    ],
  },
];

export default function InstantRepairPricingWidget({
  onAutoCreateJob,
  onOpenAppStoreModal,
}: InstantRepairPricingWidgetProps) {
  const [selectedTradeId, setSelectedTradeId] = useState("plumbing");
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);
  const [qualityTier, setQualityTier] = useState<"standard" | "premium" | "master">("standard");

  const currentTrade = TRADE_ESTIMATES.find((t) => t.id === selectedTradeId) || TRADE_ESTIMATES[0];
  const currentService = currentTrade.popularServices[selectedServiceIndex] || currentTrade.popularServices[0];

  const calculatedCost = Math.round(
    qualityTier === "standard"
      ? currentService.avg
      : qualityTier === "premium"
      ? currentService.avg * 1.25
      : currentService.high
  );

  const handleCreateJob = () => {
    onAutoCreateJob({
      title: currentService.name,
      tradeCategory: currentTrade.name.split(" ")[0],
      budget: calculatedCost,
      description: `${currentService.description}\n\nSelected tier: ${qualityTier.toUpperCase()} quality standards. Homeowner looking for verified, insured contractor quotes.`,
    });
  };

  return (
    <div className="bg-gradient-to-br from-white via-zinc-50 to-amber-50/40 rounded-3xl border-2 border-amber-500/30 p-5 sm:p-6 shadow-md relative overflow-hidden">
      
      {/* Decorative background aura */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl shadow-sm">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-base text-zinc-900 leading-none">
                Instant Home Repair Cost Estimator
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border border-emerald-300">
                100% Free
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Check live contractor price ranges and post your project with 1 tap.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-500">Tier:</span>
          <div className="bg-white border border-zinc-300 p-0.5 rounded-xl flex gap-1 text-[10px] font-extrabold shadow-3xs">
            <button
              onClick={() => setQualityTier("standard")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                qualityTier === "standard" ? "bg-amber-500 text-slate-950 shadow-3xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setQualityTier("premium")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                qualityTier === "premium" ? "bg-amber-500 text-slate-950 shadow-3xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Premium
            </button>
            <button
              onClick={() => setQualityTier("master")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                qualityTier === "master" ? "bg-amber-500 text-slate-950 shadow-3xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Master Pro
            </button>
          </div>
        </div>
      </div>

      {/* Trade Selector Pills */}
      <div className="py-3.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {TRADE_ESTIMATES.map((trade) => {
          const isSelected = trade.id === selectedTradeId;
          return (
            <button
              key={trade.id}
              onClick={() => {
                setSelectedTradeId(trade.id);
                setSelectedServiceIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? "bg-zinc-950 text-white shadow-md scale-102 ring-2 ring-amber-400/40"
                  : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {trade.icon}
              <span>{trade.name}</span>
            </button>
          );
        })}
      </div>

      {/* Service Selection & Breakdown Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-2">
        
        {/* Left: Popular Service list */}
        <div className="lg:col-span-7 space-y-2">
          <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">
            Select Common {currentTrade.name} Scope
          </label>
          <div className="space-y-2">
            {currentTrade.popularServices.map((service, idx) => {
              const isSelected = idx === selectedServiceIndex;
              return (
                <div
                  key={service.name}
                  onClick={() => setSelectedServiceIndex(idx)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500 shadow-3xs ring-1 ring-amber-500/30"
                      : "bg-white border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-zinc-900 line-clamp-1">{service.name}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{service.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-emerald-800 font-mono block">
                      ${service.avg.toLocaleString()} avg
                    </span>
                    <span className="text-[9px] text-zinc-400 font-medium">{service.turnaround}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Price Card & 1-Click Launch Button */}
        <div className="lg:col-span-5 bg-white border border-amber-300 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-500 border-b border-zinc-100 pb-2">
              <span className="font-semibold">Estimated Price Range:</span>
              <span className="font-mono text-zinc-700 font-bold">
                ${currentService.low.toLocaleString()} – ${currentService.high.toLocaleString()}
              </span>
            </div>

            <div className="py-3 text-center">
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">
                Recommended Budget Target
              </span>
              <div className="text-3xl font-black text-zinc-950 font-mono tracking-tight my-0.5">
                ${calculatedCost.toLocaleString()}
              </div>
              <p className="text-[10px] text-zinc-400">
                Turnaround: <strong className="text-zinc-700">{currentService.turnaround}</strong> • Escrow Protected
              </p>
            </div>

            <div className="space-y-1.5 text-[11px] text-zinc-600 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero platform fees for homeowner postings</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-800 font-medium text-[10px]">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Average 3 local contractor bids within 2 hours</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCreateJob}
            className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
            id="estimator-create-job-btn"
          >
            <Sparkles className="w-4 h-4" />
            <span>Post This Project for $0 Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
