import React from "react";
import { Project, Bid } from "../../types";
import {
  Target,
  Sparkles,
  Flame,
  DollarSign,
  Zap,
  Shield,
  Search,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  Table as TableIcon,
  MapPin,
  TrendingUp,
  Award,
  Layers,
  ArrowUpDown,
} from "lucide-react";

interface BidOpportunityRadarProps {
  projects: Project[];
  bids: Bid[];
  filteredCount: number;
  quickFilterMode: string;
  onChangeQuickFilter: (mode: string) => void;
  selectedTradeFilter: string;
  onChangeTradeFilter: (trade: string) => void;
  sortBy: string;
  onChangeSortBy: (sort: string) => void;
  searchTerm: string;
  onChangeSearchTerm: (term: string) => void;
  layoutMode: "grid" | "list" | "table" | "calendar";
  onChangeLayoutMode: (mode: "grid" | "list" | "table" | "calendar") => void;
  availableTrades: string[];
}

function BidOpportunityRadarComponent({
  projects,
  bids,
  filteredCount,
  quickFilterMode,
  onChangeQuickFilter,
  selectedTradeFilter,
  onChangeTradeFilter,
  sortBy,
  onChangeSortBy,
  searchTerm,
  onChangeSearchTerm,
  layoutMode,
  onChangeLayoutMode,
  availableTrades,
}: BidOpportunityRadarProps) {
  // Compute Bid Opportunity Metrics
  const openProjects = projects.filter((p) => p.status === "open" || p.status === "bid_placed");
  
  // 0-Bid Projects (First Mover Advantage!)
  const zeroBidProjects = openProjects.filter((p) => {
    const projBids = bids.filter((b) => b.projectId === p.id);
    return projBids.length === 0;
  });

  // High Value Projects ($1,000+)
  const highValueProjects = openProjects.filter((p) => (p.budget || 0) >= 1000);

  // Urgent Projects
  const urgentProjects = openProjects.filter((p) => p.isEmergency || p.isBoosted);

  // Total Pipeline Value
  const totalPipelineValue = openProjects.reduce((acc, p) => acc + (p.budget || 0), 0);

  return (
    <div className="space-y-4" id="bid-opportunity-radar-root">
      {/* 1. Top Opportunity Metric Ticker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Open Opportunities */}
        <button
          type="button"
          onClick={() => onChangeQuickFilter("all")}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            quickFilterMode === "all"
              ? "bg-slate-900 text-white border-slate-800 shadow-md ring-2 ring-amber-500/30"
              : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-900 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-wider ${quickFilterMode === "all" ? "text-amber-400" : "text-zinc-400"}`}>
              Active Opportunities
            </span>
            <Target className={`w-4 h-4 ${quickFilterMode === "all" ? "text-amber-400" : "text-zinc-400"}`} />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black">{openProjects.length}</div>
            <div className={`text-[11px] font-medium truncate ${quickFilterMode === "all" ? "text-zinc-300" : "text-zinc-500"}`}>
              ${totalPipelineValue.toLocaleString()} total pipeline
            </div>
          </div>
        </button>

        {/* Metric 2: 0 Bids - First Mover */}
        <button
          type="button"
          onClick={() => onChangeQuickFilter("zero_bids")}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            quickFilterMode === "zero_bids"
              ? "bg-emerald-900 text-white border-emerald-800 shadow-md ring-2 ring-emerald-400/40"
              : "bg-white hover:bg-emerald-50/50 border-zinc-200 text-zinc-900 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-wider ${quickFilterMode === "zero_bids" ? "text-emerald-300" : "text-emerald-700"}`}>
              ⭐ 0-Bid Leads (1st Mover)
            </span>
            <Sparkles className={`w-4 h-4 ${quickFilterMode === "zero_bids" ? "text-emerald-300" : "text-emerald-600"}`} />
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-black ${quickFilterMode === "zero_bids" ? "text-white" : "text-emerald-700"}`}>
              {zeroBidProjects.length}
            </div>
            <div className={`text-[11px] font-medium truncate ${quickFilterMode === "zero_bids" ? "text-emerald-200" : "text-emerald-600"}`}>
              Highest win probability (85%+)
            </div>
          </div>
        </button>

        {/* Metric 3: $1,000+ High Value */}
        <button
          type="button"
          onClick={() => onChangeQuickFilter("high_budget")}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            quickFilterMode === "high_budget"
              ? "bg-blue-900 text-white border-blue-800 shadow-md ring-2 ring-blue-400/40"
              : "bg-white hover:bg-blue-50/50 border-zinc-200 text-zinc-900 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-wider ${quickFilterMode === "high_budget" ? "text-blue-300" : "text-blue-700"}`}>
              💰 $1k+ High Value
            </span>
            <DollarSign className={`w-4 h-4 ${quickFilterMode === "high_budget" ? "text-blue-300" : "text-blue-600"}`} />
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-black ${quickFilterMode === "high_budget" ? "text-white" : "text-blue-800"}`}>
              {highValueProjects.length}
            </div>
            <div className={`text-[11px] font-medium truncate ${quickFilterMode === "high_budget" ? "text-blue-200" : "text-blue-600"}`}>
              Prime margin projects
            </div>
          </div>
        </button>

        {/* Metric 4: Urgent / Rush */}
        <button
          type="button"
          onClick={() => onChangeQuickFilter("urgent")}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            quickFilterMode === "urgent"
              ? "bg-rose-900 text-white border-rose-800 shadow-md ring-2 ring-rose-400/40"
              : "bg-white hover:bg-rose-50/50 border-zinc-200 text-zinc-900 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-wider ${quickFilterMode === "urgent" ? "text-rose-300" : "text-rose-700"}`}>
              🚨 Urgent Dispatch
            </span>
            <Flame className={`w-4 h-4 ${quickFilterMode === "urgent" ? "text-rose-300" : "text-rose-600"}`} />
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-black ${quickFilterMode === "urgent" ? "text-white" : "text-rose-700"}`}>
              {urgentProjects.length}
            </div>
            <div className={`text-[11px] font-medium truncate ${quickFilterMode === "urgent" ? "text-rose-200" : "text-rose-600"}`}>
              Immediate hiring intent
            </div>
          </div>
        </button>
      </div>

      {/* 2. Uncluttered Opportunity Controls & Filters Strip */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-3.5 shadow-xs space-y-3">
        {/* Top Row: Quick Filter Buttons & View Mode Switcher */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Quick Opportunity Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => onChangeQuickFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                quickFilterMode === "all"
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              All Opportunities ({projects.length})
            </button>

            <button
              type="button"
              onClick={() => onChangeQuickFilter("zero_bids")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                quickFilterMode === "zero_bids"
                  ? "bg-emerald-600 text-white shadow-xs font-black"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>⭐ 0 Bids (Be 1st!)</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeQuickFilter("bidding")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                quickFilterMode === "bidding"
                  ? "bg-amber-600 text-white shadow-xs font-black"
                  : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>⚡ Active Bidding</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeQuickFilter("high_budget")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                quickFilterMode === "high_budget"
                  ? "bg-blue-600 text-white shadow-xs font-black"
                  : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
              <span>💰 $1k+ High Value</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeQuickFilter("urgent")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                quickFilterMode === "urgent"
                  ? "bg-rose-600 text-white shadow-xs font-black"
                  : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>🔥 Urgent / Rush</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeQuickFilter("escrow_ready")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                quickFilterMode === "escrow_ready"
                  ? "bg-sky-600 text-white shadow-xs font-black"
                  : "bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200/60"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-sky-600" />
              <span>🛡️ Escrow Locked</span>
            </button>
          </div>

          {/* View Switcher: Grid vs Table vs Calendar */}
          <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider hidden sm:inline">View:</span>
            <div className="inline-flex p-1 bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-bold shadow-3xs">
              <button
                type="button"
                onClick={() => onChangeLayoutMode("grid")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  layoutMode === "grid"
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
                title="Clean 2-Column Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeLayoutMode("list")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  layoutMode === "list"
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
                title="Opportunity Card Stack"
              >
                <List className="w-3.5 h-3.5" />
                <span>Stack</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeLayoutMode("table")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  layoutMode === "table"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
                title="Rapid Opportunity Table View for fast scanning"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeLayoutMode("calendar")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  layoutMode === "calendar"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
                title="Interactive Calendar Schedule"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Calendar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row: Trade Category Filter, Sort By, Search, & Matching Results Count */}
        <div className="pt-2.5 border-t border-zinc-100 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Trade Category Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Trade:</span>
              <select
                value={selectedTradeFilter}
                onChange={(e) => onChangeTradeFilter(e.target.value)}
                className="bg-zinc-50 border border-zinc-250 hover:border-zinc-350 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden text-zinc-800 cursor-pointer"
              >
                <option value="">All Trades / Categories</option>
                {availableTrades.map((trade) => (
                  <option key={trade} value={trade}>
                    {trade}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => onChangeSortBy(e.target.value)}
                className="bg-zinc-50 border border-zinc-250 hover:border-zinc-350 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden text-zinc-800 cursor-pointer"
              >
                <option value="least_bids">⭐ Least Bids (Best Win Chance)</option>
                <option value="highest_budget">💰 Highest Budget First</option>
                <option value="closest">📍 Closest Distance</option>
                <option value="newest">🕒 Newest Posts First</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end text-xs text-zinc-500">
            <span className="font-bold text-zinc-700">
              Showing <span className="text-amber-700 font-extrabold">{filteredCount}</span> of {projects.length} opportunities
            </span>
            {(selectedTradeFilter || quickFilterMode !== "all" || searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  onChangeQuickFilter("all");
                  onChangeTradeFilter("");
                  onChangeSearchTerm("");
                }}
                className="text-[11px] text-amber-700 hover:text-amber-800 font-bold underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(BidOpportunityRadarComponent);

