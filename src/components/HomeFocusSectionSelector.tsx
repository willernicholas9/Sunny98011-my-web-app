import React from "react";
import { Briefcase, TrendingUp, Wrench, Compass, Crown, Sparkles, Layers, Zap, Flame, ShieldCheck, DollarSign } from "lucide-react";

export type HomeFocusMode = "feed" | "trends" | "tools" | "map" | "pro_earnings" | "all";

interface HomeFocusSectionSelectorProps {
  currentMode: HomeFocusMode;
  onChangeMode: (mode: HomeFocusMode) => void;
  filteredJobsCount: number;
  activeCityName: string;
  onOpenQuickQuote: () => void;
  onOpenEmergencyModal: () => void;
  onOpenContractorProModal: () => void;
}

export default function HomeFocusSectionSelector({
  currentMode,
  onChangeMode,
  filteredJobsCount,
  activeCityName,
  onOpenQuickQuote,
  onOpenEmergencyModal,
  onOpenContractorProModal,
}: HomeFocusSectionSelectorProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-3 sm:p-4 shadow-xs space-y-3" id="home-focus-section-bar">
      {/* Top Header with Quick Shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-black shrink-0">
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="font-display font-black text-xs sm:text-sm text-zinc-900 leading-tight">
              Marketplace Focus Mode
            </h3>
            <p className="text-[10px] text-zinc-500 font-medium">
              Browsing {filteredJobsCount} live vacancies in <span className="font-bold text-zinc-700">{activeCityName}</span>
            </p>
          </div>
        </div>

        {/* Quick Instant Action Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenEmergencyModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 border border-red-700 text-white text-[11px] font-black transition cursor-pointer active:scale-95 shadow-xs"
            id="quick-shortcut-emergency-btn"
            title="24/7 Emergency Dispatch for urgent repairs"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
            <span className="text-white font-black">🚨 24/7 Emergency</span>
          </button>

          <button
            type="button"
            onClick={onOpenQuickQuote}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-black transition cursor-pointer active:scale-95"
            id="quick-shortcut-instant-quote-btn"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Instant Quote</span>
          </button>

          <button
            type="button"
            onClick={onOpenContractorProModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-400 text-[11px] font-black transition cursor-pointer active:scale-95"
            id="quick-shortcut-pro-btn"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Go Pro ($29)</span>
          </button>
        </div>
      </div>

      {/* Segmented Mode Selector Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {/* 1. Job Feed */}
        <button
          type="button"
          onClick={() => onChangeMode("feed")}
          className={`flex items-center gap-2 p-2.5 rounded-2xl transition text-left cursor-pointer border ${
            currentMode === "feed"
              ? "bg-amber-500 text-slate-950 border-amber-600 shadow-sm font-black ring-2 ring-amber-300/60"
              : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
          }`}
          id="focus-mode-feed-btn"
        >
          <Briefcase className={`w-4 h-4 shrink-0 ${currentMode === "feed" ? "text-slate-950" : "text-amber-600"}`} />
          <div className="min-w-0">
            <span className="text-xs font-bold block truncate leading-tight">Job Feed</span>
            <span className={`text-[10px] block truncate font-medium ${currentMode === "feed" ? "text-slate-900" : "text-zinc-400"}`}>
              {filteredJobsCount} Available
            </span>
          </div>
        </button>

        {/* 2. Trade Demand & Rates (D3 Insights) */}
        <button
          type="button"
          onClick={() => onChangeMode("trends")}
          className={`flex items-center gap-2 p-2.5 rounded-2xl transition text-left cursor-pointer border ${
            currentMode === "trends"
              ? "bg-amber-500 text-slate-950 border-amber-600 shadow-sm font-black ring-2 ring-amber-300/60"
              : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
          }`}
          id="focus-mode-trends-btn"
        >
          <TrendingUp className={`w-4 h-4 shrink-0 ${currentMode === "trends" ? "text-slate-950" : "text-blue-600"}`} />
          <div className="min-w-0">
            <span className="text-xs font-bold block truncate leading-tight">Demand & Rates</span>
            <span className={`text-[10px] block truncate font-medium ${currentMode === "trends" ? "text-slate-900" : "text-zinc-400"}`}>
              D3 Analytics
            </span>
          </div>
        </button>

        {/* 3. Tradesmen Toolbox */}
        <button
          type="button"
          onClick={() => onChangeMode("tools")}
          className={`flex items-center gap-2 p-2.5 rounded-2xl transition text-left cursor-pointer border ${
            currentMode === "tools"
              ? "bg-amber-500 text-slate-950 border-amber-600 shadow-sm font-black ring-2 ring-amber-300/60"
              : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
          }`}
          id="focus-mode-tools-btn"
        >
          <Wrench className={`w-4 h-4 shrink-0 ${currentMode === "tools" ? "text-slate-950" : "text-emerald-600"}`} />
          <div className="min-w-0">
            <span className="text-xs font-bold block truncate leading-tight">Pro Toolbox</span>
            <span className={`text-[10px] block truncate font-medium ${currentMode === "tools" ? "text-slate-900" : "text-zinc-400"}`}>
              Invoices & Calcs
            </span>
          </div>
        </button>

        {/* 4. Live Map & Radar */}
        <button
          type="button"
          onClick={() => onChangeMode("map")}
          className={`flex items-center gap-2 p-2.5 rounded-2xl transition text-left cursor-pointer border ${
            currentMode === "map"
              ? "bg-amber-500 text-slate-950 border-amber-600 shadow-sm font-black ring-2 ring-amber-300/60"
              : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
          }`}
          id="focus-mode-map-btn"
        >
          <Compass className={`w-4 h-4 shrink-0 ${currentMode === "map" ? "text-slate-950" : "text-purple-600"}`} />
          <div className="min-w-0">
            <span className="text-xs font-bold block truncate leading-tight">Map Directory</span>
            <span className={`text-[10px] block truncate font-medium ${currentMode === "map" ? "text-slate-900" : "text-zinc-400"}`}>
              Geo Radar
            </span>
          </div>
        </button>

        {/* 5. Go Pro & Monetization */}
        <button
          type="button"
          onClick={() => onChangeMode("pro_earnings")}
          className={`flex items-center gap-2 p-2.5 rounded-2xl transition text-left cursor-pointer border ${
            currentMode === "pro_earnings"
              ? "bg-amber-500 text-slate-950 border-amber-600 shadow-sm font-black ring-2 ring-amber-300/60"
              : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
          }`}
          id="focus-mode-pro-btn"
        >
          <DollarSign className={`w-4 h-4 shrink-0 ${currentMode === "pro_earnings" ? "text-slate-950" : "text-amber-600"}`} />
          <div className="min-w-0">
            <span className="text-xs font-bold block truncate leading-tight">Earn & Boost</span>
            <span className={`text-[10px] block truncate font-medium ${currentMode === "pro_earnings" ? "text-slate-900" : "text-zinc-400"}`}>
              Leads & Escrow
            </span>
          </div>
        </button>

        {/* 6. All in One Stack */}
        <button
          type="button"
          onClick={() => onChangeMode("all")}
          className={`col-span-2 sm:col-span-1 flex items-center gap-2 p-2.5 rounded-2xl transition text-left cursor-pointer border ${
            currentMode === "all"
              ? "bg-zinc-900 text-white border-zinc-950 shadow-sm font-black"
              : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border-zinc-200"
          }`}
          id="focus-mode-all-btn"
          title="Stack all tools and feeds together"
        >
          <Layers className={`w-4 h-4 shrink-0 ${currentMode === "all" ? "text-amber-400" : "text-zinc-500"}`} />
          <div className="min-w-0">
            <span className="text-xs font-bold block truncate leading-tight">All Sections</span>
            <span className={`text-[10px] block truncate font-medium ${currentMode === "all" ? "text-zinc-300" : "text-zinc-400"}`}>
              Full Stack View
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
