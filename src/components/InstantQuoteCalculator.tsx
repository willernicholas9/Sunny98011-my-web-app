import React, { useState } from "react";
import { Calculator, Sparkles, Zap, DollarSign, Check, ArrowRight, ShieldCheck, Clock, MapPin, X } from "lucide-react";
import { TRADE_OPTIONS } from "../types";

interface InstantQuoteCalculatorProps {
  onApplyEstimateToForm?: (trade: string, estimatedBudget: number, title: string, desc: string) => void;
  onClose?: () => void;
}

const TRADE_ESTIMATE_RATES: {
  [key: string]: {
    unit: string;
    lowRate: number;
    avgRate: number;
    highRate: number;
    defaultUnits: number;
    popularScopeText: string;
  };
} = {
  Landscaping: { unit: "sq ft", lowRate: 1.5, avgRate: 3.2, highRate: 5.5, defaultUnits: 500, popularScopeText: "Mulch spreading, lawn edging, and hedge trimming" },
  "Gutter Cleaning": { unit: "linear ft", lowRate: 1.0, avgRate: 1.8, highRate: 2.5, defaultUnits: 150, popularScopeText: "Clear debris, flush downspouts, and inspect sealants" },
  "Garden Work": { unit: "beds / hours", lowRate: 35, avgRate: 50, highRate: 75, defaultUnits: 4, popularScopeText: "Weeding, planting seasonal flowers, and soil conditioning" },
  "Window Replacement": { unit: "windows", lowRate: 180, avgRate: 350, highRate: 600, defaultUnits: 3, popularScopeText: "Double-hung vinyl window replacement and weather glazing" },
  "TV Hanging": { unit: "screens / mounts", lowRate: 85, avgRate: 140, highRate: 220, defaultUnits: 1, popularScopeText: "Wall-mount bracket installation, drywall anchors, cable concealment" },
  Painting: { unit: "rooms", lowRate: 200, avgRate: 380, highRate: 650, defaultUnits: 2, popularScopeText: "Interior wall prep, primer coat, and two coats premium latex paint" },
  "General Handyman Projects": { unit: "estimated hours", lowRate: 45, avgRate: 70, highRate: 100, defaultUnits: 3, popularScopeText: "Fixture repair, door alignment, drywall patch, shelf assembly" },
  "Plumbing Repair": { unit: "fixtures / leaks", lowRate: 110, avgRate: 210, highRate: 380, defaultUnits: 1, popularScopeText: "Faucet leak patch, drain unclog, toilet valve replace" },
  "Electrical Maintenance": { unit: "outlets / circuits", lowRate: 95, avgRate: 175, highRate: 320, defaultUnits: 2, popularScopeText: "GFCI outlet upgrade, light fixture install, breaker check" },
};

export default function InstantQuoteCalculator({ onApplyEstimateToForm, onClose }: InstantQuoteCalculatorProps) {
  const [selectedTrade, setSelectedTrade] = useState<string>("Landscaping");
  const [quantity, setQuantity] = useState<number>(500);
  const [urgency, setUrgency] = useState<"standard" | "priority">("standard");

  const tradeData = TRADE_ESTIMATE_RATES[selectedTrade] || TRADE_ESTIMATE_RATES["Landscaping"];

  const lowEst = Math.round(tradeData.lowRate * quantity);
  const avgEst = Math.round(tradeData.avgRate * quantity);
  const highEst = Math.round(tradeData.highRate * quantity);

  const finalRecommendedBudget = urgency === "priority" ? Math.round(avgEst * 1.15 + 15) : avgEst;

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 rounded-3xl p-6 text-white shadow-2xl space-y-6 relative overflow-hidden" id="instant-quote-calculator">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-4 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Project Price & Budget Estimator</span>
          </div>
          <h3 className="text-xl font-black font-display text-white tracking-tight flex items-center gap-2">
            <span>Instant Project Cost Calculator</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-medium max-w-xl">
            Select your trade and project size below to calculate transparent market-rate estimates based on real USA contractor bids.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Calculator Body Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Left Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-300 mb-1.5">
              1. Select Project Category / Trade
            </label>
            <select
              value={selectedTrade}
              onChange={(e) => {
                const trade = e.target.value;
                setSelectedTrade(trade);
                setQuantity(TRADE_ESTIMATE_RATES[trade]?.defaultUnits || 1);
              }}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-3 text-xs text-white font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {TRADE_OPTIONS.map((trade) => (
                <option key={trade} value={trade} className="bg-slate-900 text-white">
                  {trade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-extrabold uppercase text-slate-300">
                2. Project Quantity / Size ({tradeData.unit})
              </label>
              <span className="text-xs font-mono font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {quantity} {tradeData.unit}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={selectedTrade === "Landscaping" ? 2500 : selectedTrade === "Gutter Cleaning" ? 500 : 20}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>Small (1)</span>
              <span>Medium</span>
              <span>Large Project</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-300 mb-1.5">
              3. Dispatch Speed & Urgency
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUrgency("standard")}
                className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-start gap-1 cursor-pointer ${
                  urgency === "standard"
                    ? "bg-amber-500/20 border-amber-500 text-amber-200"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-white">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Standard Dispatch</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Normal 24-48hr quotes</span>
              </button>

              <button
                type="button"
                onClick={() => setUrgency("priority")}
                className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-start gap-1 cursor-pointer ${
                  urgency === "priority"
                    ? "bg-red-600/30 border-red-500 text-red-200 ring-2 ring-red-500/50"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-red-400">
                  <Zap className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  <span>Express Dispatch (+$15)</span>
                </div>
                <span className="text-[10px] text-red-200/80 font-normal">Instant 2hr SMS contractor blast</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Output Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
              Estimated Market Rate Range
            </span>

            <div className="flex items-baseline justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-3xl font-black font-mono text-amber-400">${finalRecommendedBudget}</span>
                <span className="text-xs text-slate-400 ml-1.5 font-sans font-medium">Recommended Budget</span>
              </div>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border border-amber-500/30">
                Fair Local Market Quote
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-950/80 rounded-xl p-2 border border-slate-800/80 font-mono">
              <div>
                <span className="text-[9px] text-slate-400 block">Low End</span>
                <span className="text-xs font-bold text-slate-300">${lowEst}</span>
              </div>
              <div className="border-x border-slate-800">
                <span className="text-[9px] text-slate-400 block">Average</span>
                <span className="text-xs font-bold text-amber-400">${avgEst}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">High End</span>
                <span className="text-xs font-bold text-slate-300">${highEst}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 space-y-1 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/50">
              <span className="font-extrabold text-amber-300 block">Included Job Scope Template:</span>
              <p className="text-slate-300 text-[10px] leading-relaxed">
                "{tradeData.popularScopeText} ({quantity} {tradeData.unit}). Includes local escrow payment protection."
              </p>
            </div>
          </div>

          {/* Action to Apply to Form or Print/Save Estimate */}
          <div className="space-y-2">
            {onApplyEstimateToForm && (
              <button
                type="button"
                onClick={() => {
                  onApplyEstimateToForm(
                    selectedTrade,
                    finalRecommendedBudget,
                    `${selectedTrade} Project (${quantity} ${tradeData.unit})`,
                    `${tradeData.popularScopeText}. Seeking licensed contractor for completion.`
                  );
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black p-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
              >
                <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>Apply Quote & Auto-Fill Project Form</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                window.print();
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold p-2.5 rounded-xl text-xs transition border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Print / Download Estimate PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
