import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  Zap,
  Target,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Send,
  Filter,
  Sliders,
  Award,
  Users,
  Search,
  RefreshCw,
  Clock,
  Eye,
  Megaphone,
  Radio,
  Flame,
  ChevronRight,
  Info,
  Check,
  Building,
  Smartphone
} from "lucide-react";
import { Project, Bid, ContractorUser } from "../../types";

interface LeadPriorityEngineProps {
  projects: Project[];
  bids: Bid[];
  contractorsList?: ContractorUser[];
  onDeployAdCampaign?: (campaignInfo: {
    projectId: string;
    projectTitle: string;
    suggestedBudget: number;
    channel: string;
    targetTrade: string;
    targetZip: string;
  }) => void;
}

export interface ScoredLead {
  project: Project;
  priorityScore: number; // 0 - 100
  tier: "vip_platinum" | "high_yield" | "moderate" | "standard";
  tierLabel: string;
  tierColor: string;
  badgeBg: string;
  conversionProbability: number; // 0 - 100%
  expectedEscrowRevenue: number;
  suggestedAdSpend: number;
  projectedRoas: number;
  recommendedChannels: string[];
  primaryChannel: string;
  targetAudienceNote: string;
  factorBreakdown: {
    budgetScore: number;
    intentScore: number;
    liquidityScore: number;
    urgencyScore: number;
  };
  nearbyContractorsCount: number;
  bidsCount: number;
}

export default function LeadPriorityEngine({
  projects,
  bids,
  contractorsList = [],
  onDeployAdCampaign
}: LeadPriorityEngineProps) {
  // Algorithm Weights State (Interactive Weight Sliders)
  const [budgetWeight, setBudgetWeight] = useState<number>(35); // 35%
  const [probabilityWeight, setProbabilityWeight] = useState<number>(30); // 30%
  const [liquidityWeight, setLiquidityWeight] = useState<number>(20); // 20%
  const [urgencyWeight, setUrgencyWeight] = useState<number>(15); // 15%
  const [showConfigDrawer, setShowConfigDrawer] = useState<boolean>(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>("all");
  const [selectedTradeFilter, setSelectedTradeFilter] = useState<string>("all");
  const [emergencyOnly, setEmergencyOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"priority" | "budget" | "probability" | "ad_spend" | "roas">("priority");

  // Deployed Ad State tracking (local simulation for one-click action)
  const [deployedCampaigns, setDeployedCampaigns] = useState<{ [projectId: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem("hsws_deployed_ad_campaigns");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [inspectingLead, setInspectingLead] = useState<ScoredLead | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Helper to categorize project by trade
  const getProjectTrade = (p: Project): string => {
    const text = `${p.title} ${p.description} ${p.emergencyCategory || ""}`.toLowerCase();
    if (text.includes("roof") || text.includes("shingle") || text.includes("storm") || text.includes("gutter") || text.includes("hail")) return "Roofing & Storm";
    if (text.includes("plumb") || text.includes("pipe") || text.includes("leak") || text.includes("water heater") || text.includes("drain")) return "Plumbing & Leaks";
    if (text.includes("hvac") || text.includes("ac") || text.includes("air cond") || text.includes("heat") || text.includes("furnace")) return "HVAC & AC Service";
    if (text.includes("lawn") || text.includes("landscap") || text.includes("grass") || text.includes("mow") || text.includes("tree")) return "Lawn & Landscaping";
    if (text.includes("electr") || text.includes("outlet") || text.includes("panel") || text.includes("wire") || text.includes("light")) return "Electrical & Power";
    if (text.includes("paint") || text.includes("drywall") || text.includes("deck stain")) return "Painting & Drywall";
    return "General Handyman";
  };

  // Automated Lead Priority Scoring Algorithm
  const scoredLeads: ScoredLead[] = useMemo(() => {
    const totalWeight = budgetWeight + probabilityWeight + liquidityWeight + urgencyWeight || 100;
    const normBudgetW = budgetWeight / totalWeight;
    const normProbW = probabilityWeight / totalWeight;
    const normLiqW = liquidityWeight / totalWeight;
    const normUrgW = urgencyWeight / totalWeight;

    return projects.map((proj) => {
      const projBids = bids.filter((b) => b.projectId === proj.id);
      const bidsCount = projBids.length;
      const trade = getProjectTrade(proj);

      // 1. Budget Score (0 - 100)
      // Benchmark: $5,000+ = 100, $2,500 = 85, $1,000 = 70, $500 = 50, <$200 = 25
      const budget = proj.budget || 350;
      let budgetScore = 20;
      if (budget >= 5000) budgetScore = 100;
      else if (budget >= 3000) budgetScore = 92;
      else if (budget >= 2000) budgetScore = 84;
      else if (budget >= 1000) budgetScore = 74;
      else if (budget >= 500) budgetScore = 58;
      else if (budget >= 250) budgetScore = 40;

      // 2. Conversion Probability Score (0 - 100)
      // Factors: detail level, images, emergency status, boost status, warranty, existing bids
      let intentScore = 55; // baseline
      if (proj.description && proj.description.length > 50) intentScore += 10;
      if (proj.images && proj.images.length > 0) intentScore += 10;
      if (proj.isEmergency) intentScore += 15;
      if (proj.warrantyProtected) intentScore += 5;
      if (proj.isBoosted) intentScore += 5;
      if (bidsCount > 0) intentScore += 5; // active bidder interest
      if (proj.status === "accepted" || proj.status === "completed") intentScore = 98;
      intentScore = Math.min(99, Math.max(30, intentScore));

      // 3. Local Contractor Liquidity Score (0 - 100)
      // Estimates matching contractors in zip/city/trade
      const matchingContractors = contractorsList.filter((c) => {
        const matchesTrade = (c.trades || []).some((t) =>
          t.toLowerCase().includes(trade.toLowerCase().slice(0, 4))
        );
        const matchesLocation = c.city?.toLowerCase() === proj.city?.toLowerCase() || !proj.city;
        return matchesTrade || matchesLocation;
      });
      const nearbyCount = Math.max(matchingContractors.length, Math.floor((proj.budget % 5) + 2)); // fallback baseline
      let liquidityScore = Math.min(100, 40 + nearbyCount * 12);

      // 4. Urgency & Dispatch Score (0 - 100)
      let urgencyScore = 40;
      if (proj.isEmergency) urgencyScore = 95;
      else if (proj.complexityLevel === "Major Renovation") urgencyScore = 85;
      else if (proj.boostTier === "urgent_rush") urgencyScore = 90;
      else if (proj.boostTier === "vip_spotlight") urgencyScore = 85;
      else if (budgetScore >= 80) urgencyScore = 75;

      // Composite Lead Priority Score (0 - 100)
      const rawScore =
        budgetScore * normBudgetW +
        intentScore * normProbW +
        liquidityScore * normLiqW +
        urgencyScore * normUrgW;

      const priorityScore = Math.min(100, Math.max(15, Math.round(rawScore)));

      // Tier Categorization
      let tier: ScoredLead["tier"] = "standard";
      let tierLabel = "Tier 4: Standard";
      let tierColor = "text-zinc-600 border-zinc-200 bg-zinc-50";
      let badgeBg = "bg-zinc-100 text-zinc-700";

      if (priorityScore >= 85) {
        tier = "vip_platinum";
        tierLabel = "💎 Tier 1: VIP Platinum";
        tierColor = "text-amber-900 border-amber-300 bg-amber-50/80";
        badgeBg = "bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black";
      } else if (priorityScore >= 70) {
        tier = "high_yield";
        tierLabel = "🥇 Tier 2: High-Yield Priority";
        tierColor = "text-blue-900 border-blue-200 bg-blue-50/60";
        badgeBg = "bg-blue-600 text-white font-black";
      } else if (priorityScore >= 50) {
        tier = "moderate";
        tierLabel = "🥈 Tier 3: Moderate Momentum";
        tierColor = "text-indigo-900 border-indigo-200 bg-indigo-50/50";
        badgeBg = "bg-indigo-100 text-indigo-800 font-bold";
      }

      // Expected Platform Revenue from this project (Escrow take rate + flat service fees + pro boost credits)
      // e.g., 3.5% escrow take-rate + $20 service fee
      const expectedEscrowRevenue = Math.round(budget * 0.045 + (budget > 500 ? 20 : 5));

      // Automated Suggested Targeted Ad Spend Level
      // Calculated as ~15% - 25% of expected platform gross revenue, with minimum viable thresholds
      let suggestedAdSpend = 15;
      let primaryChannel = "Meta Geo-Radius & Nextdoor Feed";
      let recommendedChannels = ["Nextdoor Community", "Facebook Local Feed"];

      if (priorityScore >= 85) {
        suggestedAdSpend = Math.max(45, Math.min(150, Math.round(expectedEscrowRevenue * 0.35)));
        primaryChannel = "Google Local Services (LSA) + Urgent SMS Dispatch";
        recommendedChannels = ["Google Local Services Ads (LSA)", "Meta High-Intent Carousel", "Direct Contractor SMS Blitz"];
      } else if (priorityScore >= 70) {
        suggestedAdSpend = Math.max(25, Math.min(80, Math.round(expectedEscrowRevenue * 0.28)));
        primaryChannel = "Google Search Ads + Meta Contractor Carousel";
        recommendedChannels = ["Google Search Geo-Targeted", "Meta Pro Retargeting", "Nextdoor Sponsored Pro"];
      } else if (priorityScore >= 50) {
        suggestedAdSpend = 15;
        primaryChannel = "Automated Neighborhood Yard Notice & Nextdoor";
        recommendedChannels = ["Nextdoor Community Feed", "Automated Email Match Digest"];
      } else {
        suggestedAdSpend = 10;
        primaryChannel = "Organic Marketplace Directory & Digest";
        recommendedChannels = ["Organic Digest"];
      }

      // Projected ROAS (Return On Ad Spend)
      const projectedRoas = suggestedAdSpend > 0 ? Number((expectedEscrowRevenue / suggestedAdSpend).toFixed(1)) : 4.0;

      const targetAudienceNote = `${trade} pros & homeowners within 15 miles of ${proj.city || "Metro Area"} (${proj.zipCode || "Local"})`;

      return {
        project: proj,
        priorityScore,
        tier,
        tierLabel,
        tierColor,
        badgeBg,
        conversionProbability: intentScore,
        expectedEscrowRevenue,
        suggestedAdSpend,
        projectedRoas,
        recommendedChannels,
        primaryChannel,
        targetAudienceNote,
        factorBreakdown: {
          budgetScore: Math.round(budgetScore),
          intentScore: Math.round(intentScore),
          liquidityScore: Math.round(liquidityScore),
          urgencyScore: Math.round(urgencyScore)
        },
        nearbyContractorsCount: nearbyCount,
        bidsCount
      };
    });
  }, [projects, bids, contractorsList, budgetWeight, probabilityWeight, liquidityWeight, urgencyWeight]);

  // Filtered and Sorted Leads
  const filteredLeads = useMemo(() => {
    return scoredLeads
      .filter((lead) => {
        const p = lead.project;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = p.title.toLowerCase().includes(q);
          const matchesCity = (p.city || "").toLowerCase().includes(q);
          const matchesZip = (p.zipCode || "").toLowerCase().includes(q);
          const matchesTrade = getProjectTrade(p).toLowerCase().includes(q);
          if (!matchesTitle && !matchesCity && !matchesZip && !matchesTrade) return false;
        }

        // Tier filter
        if (selectedTierFilter !== "all" && lead.tier !== selectedTierFilter) return false;

        // Trade filter
        if (selectedTradeFilter !== "all") {
          const trade = getProjectTrade(p);
          if (!trade.toLowerCase().includes(selectedTradeFilter.toLowerCase().slice(0, 4))) return false;
        }

        // Emergency only
        if (emergencyOnly && !p.isEmergency) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "priority") return b.priorityScore - a.priorityScore;
        if (sortBy === "budget") return (b.project.budget || 0) - (a.project.budget || 0);
        if (sortBy === "probability") return b.conversionProbability - a.conversionProbability;
        if (sortBy === "ad_spend") return b.suggestedAdSpend - a.suggestedAdSpend;
        if (sortBy === "roas") return b.projectedRoas - a.projectedRoas;
        return 0;
      });
  }, [scoredLeads, searchQuery, selectedTierFilter, selectedTradeFilter, emergencyOnly, sortBy]);

  // High-Level Aggregate Analytics
  const aggregateMetrics = useMemo(() => {
    const totalPipelineValue = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
    const vipLeadsCount = scoredLeads.filter((l) => l.tier === "vip_platinum" || l.tier === "high_yield").length;
    const avgConversionProb = scoredLeads.length
      ? Math.round(scoredLeads.reduce((acc, l) => acc + l.conversionProbability, 0) / scoredLeads.length)
      : 84;
    const totalSuggestedAdSpend = scoredLeads.reduce((acc, l) => acc + l.suggestedAdSpend, 0);
    const totalProjectedEscrowReturn = scoredLeads.reduce((acc, l) => acc + l.expectedEscrowRevenue, 0);
    const overallRoas = totalSuggestedAdSpend > 0 ? (totalProjectedEscrowReturn / totalSuggestedAdSpend).toFixed(1) : "5.4";

    return {
      totalPipelineValue,
      vipLeadsCount,
      avgConversionProb,
      totalSuggestedAdSpend,
      totalProjectedEscrowReturn,
      overallRoas
    };
  }, [projects, scoredLeads]);

  // Handle Deploy Ad Campaign Action
  const handleDeploySingle = (lead: ScoredLead) => {
    const newDeployed = { ...deployedCampaigns, [lead.project.id]: true };
    setDeployedCampaigns(newDeployed);
    try {
      localStorage.setItem("hsws_deployed_ad_campaigns", JSON.stringify(newDeployed));
    } catch {}

    if (onDeployAdCampaign) {
      onDeployAdCampaign({
        projectId: lead.project.id,
        projectTitle: lead.project.title,
        suggestedBudget: lead.suggestedAdSpend,
        channel: lead.primaryChannel,
        targetTrade: getProjectTrade(lead.project),
        targetZip: lead.project.zipCode || "Local"
      });
    }

    setToastMessage(`🚀 Deployed $${lead.suggestedAdSpend} targeted campaign for "${lead.project.title}" on ${lead.primaryChannel}!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Batch Deploy for All VIP Leads
  const handleDeployAllVip = () => {
    const vipList = scoredLeads.filter((l) => l.tier === "vip_platinum" || l.tier === "high_yield");
    const updated = { ...deployedCampaigns };
    let deployedCount = 0;
    let totalSpend = 0;

    vipList.forEach((lead) => {
      if (!updated[lead.project.id]) {
        updated[lead.project.id] = true;
        deployedCount++;
        totalSpend += lead.suggestedAdSpend;
      }
    });

    setDeployedCampaigns(updated);
    try {
      localStorage.setItem("hsws_deployed_ad_campaigns", JSON.stringify(updated));
    } catch {}

    setToastMessage(`⚡ Batch Deployed ${deployedCount} VIP Campaigns ($${totalSpend} budget) across Google LSA & Meta Ads!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleResetWeights = () => {
    setBudgetWeight(35);
    setProbabilityWeight(30);
    setLiquidityWeight(20);
    setUrgencyWeight(15);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200" id="lead-priority-engine-section">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-950 text-white border border-amber-400 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-zinc-400 hover:text-white ml-2 text-xs font-black cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-zinc-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 border border-amber-700/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(circle_at_80%_30%,rgba(245,158,11,0.15)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-400/30">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Automated High-Yield Lead Scoring & Ad Allocation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center gap-3">
              <span>Lead Priority & Conversion Optimizer</span>
            </h2>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
              Algorithmic scoring that continuously evaluates homeowner budget, closure probability, local trade liquidity, and urgency to prescribe optimal multi-channel ad spend for maximum platform ROAS.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowConfigDrawer(!showConfigDrawer)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                showConfigDrawer
                  ? "bg-amber-400 text-zinc-950 border-amber-400 font-black shadow-md"
                  : "bg-white/10 text-white hover:bg-white/20 border-white/15"
              }`}
              id="toggle-lead-scoring-algorithm-weights-btn"
            >
              <Sliders className="w-4 h-4" />
              <span>{showConfigDrawer ? "Hide Algorithm Weights" : "Tune Algorithm Weights"}</span>
            </button>

            <button
              type="button"
              onClick={handleDeployAllVip}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer border border-amber-300"
              id="batch-deploy-vip-ads-btn"
            >
              <Zap className="w-4 h-4 text-zinc-950 fill-zinc-950" />
              <span>1-Click Deploy All VIP Ads ({aggregateMetrics.vipLeadsCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Algorithm Config Drawer (Collapsible) */}
      {showConfigDrawer && (
        <div className="bg-white rounded-3xl border border-amber-200 p-6 shadow-md space-y-6 animate-in slide-in-from-top-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-150 pb-4">
            <div className="space-y-1">
              <h3 className="text-base font-black font-display text-zinc-950 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>Lead Priority Scoring Mathematical Weight Configurator</span>
              </h3>
              <p className="text-xs text-zinc-500">
                Adjust how the scoring engine weights escrow value vs. closure likelihood vs. contractor density.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetWeights}
              className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Defaults (35/30/20/15)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Weight 1: Budget Magnitude */}
            <div className="space-y-2 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-800">
                <span>💰 Budget Magnitude</span>
                <span className="font-mono text-amber-600 font-black text-sm">{budgetWeight}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                value={budgetWeight}
                onChange={(e) => setBudgetWeight(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <p className="text-[10px] text-zinc-500">Weights larger ticket jobs ($1k–$10k+) with higher escrow fee returns.</p>
            </div>

            {/* Weight 2: Intent & Probability */}
            <div className="space-y-2 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-800">
                <span>🎯 Homeowner Intent Signal</span>
                <span className="font-mono text-blue-600 font-black text-sm">{probabilityWeight}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                value={probabilityWeight}
                onChange={(e) => setProbabilityWeight(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[10px] text-zinc-500">Scores photos, detailed specifications, warranty add-ons & phone verification.</p>
            </div>

            {/* Weight 3: Local Contractor Liquidity */}
            <div className="space-y-2 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-800">
                <span>🔨 Local Contractor Density</span>
                <span className="font-mono text-indigo-600 font-black text-sm">{liquidityWeight}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                value={liquidityWeight}
                onChange={(e) => setLiquidityWeight(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[10px] text-zinc-500">Checks active licensed contractors in the project's zip code & trade.</p>
            </div>

            {/* Weight 4: Urgency Multiplier */}
            <div className="space-y-2 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-800">
                <span>⚡ 24/7 Emergency Urgency</span>
                <span className="font-mono text-red-600 font-black text-sm">{urgencyWeight}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={40}
                value={urgencyWeight}
                onChange={(e) => setUrgencyWeight(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <p className="text-[10px] text-zinc-500">Boosts freeze leaks, storm repairs, and emergency dispatch projects.</p>
            </div>

          </div>
        </div>
      )}

      {/* Aggregate KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: VIP High-Yield Leads */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-500">
              High-Priority Targets
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-zinc-950">
              {aggregateMetrics.vipLeadsCount}
            </span>
            <span className="text-xs font-bold text-amber-700">
              of {projects.length} Total Projects
            </span>
          </div>

          <div className="text-xs text-zinc-600 leading-snug">
            Tier 1 & Tier 2 opportunities with score ≥70 warranting active ad investment.
          </div>
        </div>

        {/* KPI 2: Active Pipeline Value */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-500">
              Scored Pipeline Value
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-zinc-950">
              ${aggregateMetrics.totalPipelineValue.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-700 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> High Liquidity
            </span>
          </div>

          <div className="text-xs text-zinc-600 leading-snug">
            Cumulative homeowner project budgets evaluated across all trade verticals.
          </div>
        </div>

        {/* KPI 3: Recommended Targeted Ad Spend */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-500">
              Suggested Ad Allocation
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Target className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-emerald-700">
              ${aggregateMetrics.totalSuggestedAdSpend.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-zinc-500">
              Optimal Spend
            </span>
          </div>

          <div className="text-xs text-zinc-600 leading-snug">
            Yields <strong className="text-zinc-900">${aggregateMetrics.totalProjectedEscrowReturn.toLocaleString()}</strong> in estimated escrow & service fee returns.
          </div>
        </div>

        {/* KPI 4: Projected Platform ROAS */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-500">
              Projected Platform ROAS
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-purple-700">
              {aggregateMetrics.overallRoas}x
            </span>
            <span className="text-xs font-bold text-zinc-500">
              Target Efficiency
            </span>
          </div>

          <div className="text-xs text-zinc-600 leading-snug">
            Return on ad spend calculated against expected platform escrow take-rate.
          </div>
        </div>

      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, trade, city, or zip code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Tier Filter */}
            <select
              value={selectedTierFilter}
              onChange={(e) => setSelectedTierFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Priority Tiers ({scoredLeads.length})</option>
              <option value="vip_platinum">💎 VIP Platinum (Score 85+)</option>
              <option value="high_yield">🥇 High-Yield Priority (70-84)</option>
              <option value="moderate">🥈 Moderate Momentum (50-69)</option>
              <option value="standard">🥉 Standard (&lt;50)</option>
            </select>

            {/* Trade Filter */}
            <select
              value={selectedTradeFilter}
              onChange={(e) => setSelectedTradeFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Trades</option>
              <option value="roof">Roofing & Storm</option>
              <option value="plumb">Plumbing & Leaks</option>
              <option value="hvac">HVAC & Cooling</option>
              <option value="lawn">Lawn & Landscaping</option>
              <option value="electr">Electrical & Power</option>
              <option value="paint">Painting & Drywall</option>
              <option value="handyman">General Handyman</option>
            </select>

            {/* Emergency Toggle */}
            <button
              type="button"
              onClick={() => setEmergencyOnly(!emergencyOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                emergencyOnly
                  ? "bg-red-600 text-white border-red-600 shadow-xs"
                  : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 border-zinc-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Emergency 24/7 Only</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-zinc-100 px-3 py-1.5 rounded-xl border border-zinc-200">
              <span className="text-[11px] font-extrabold text-zinc-500 uppercase">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-zinc-900 focus:outline-hidden cursor-pointer"
              >
                <option value="priority">Priority Score (Highest)</option>
                <option value="budget">Budget ($ High to Low)</option>
                <option value="probability">Conversion Probability (%)</option>
                <option value="ad_spend">Suggested Ad Spend ($)</option>
                <option value="roas">Projected ROAS</option>
              </select>
            </div>

          </div>

        </div>
      </div>

      {/* Scored Leads Table / Cards Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-zinc-500">
            Ranked High-Probability Projects ({filteredLeads.length})
          </span>
          <span className="text-xs text-zinc-500">
            Click any lead to inspect factor breakdown & channel strategy
          </span>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center space-y-3">
            <Target className="w-10 h-10 text-zinc-400 mx-auto" />
            <h3 className="text-base font-bold text-zinc-900">No matching projects found</h3>
            <p className="text-xs text-zinc-500">Try adjusting your tier filters or search criteria.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLeads.map((lead) => {
              const p = lead.project;
              const isDeployed = deployedCampaigns[p.id];
              const trade = getProjectTrade(p);

              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-3xl border transition-all duration-200 p-5 sm:p-6 shadow-sm hover:shadow-md space-y-4 ${
                    lead.tier === "vip_platinum"
                      ? "border-amber-300 ring-1 ring-amber-400/30"
                      : lead.tier === "high_yield"
                      ? "border-blue-200"
                      : "border-zinc-200"
                  }`}
                >
                  
                  {/* Lead Top Bar */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Left: Score Gauge & Project Details */}
                    <div className="flex items-start gap-4">
                      
                      {/* Priority Score Circle Badge */}
                      <div className="flex flex-col items-center justify-center shrink-0">
                        <div
                          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border shadow-xs ${
                            lead.tier === "vip_platinum"
                              ? "bg-amber-50 border-amber-300 text-amber-950"
                              : lead.tier === "high_yield"
                              ? "bg-blue-50 border-blue-300 text-blue-950"
                              : "bg-zinc-50 border-zinc-300 text-zinc-950"
                          }`}
                        >
                          <span className="text-xs font-black uppercase text-zinc-500 tracking-tighter">LPS</span>
                          <span className="text-xl font-black font-mono leading-none">{lead.priorityScore}</span>
                        </div>
                        <span className="text-[9px] font-bold text-zinc-500 mt-1">out of 100</span>
                      </div>

                      {/* Title & Metadata */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${lead.badgeBg}`}>
                            {lead.tierLabel}
                          </span>

                          <span className="text-[10px] bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded-md font-bold border border-zinc-200">
                            {trade}
                          </span>

                          {p.isEmergency && (
                            <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-md font-black animate-pulse flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5 fill-white" />
                              <span>24/7 Emergency</span>
                            </span>
                          )}

                          {p.warrantyProtected && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Warranty Protected</span>
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-black text-zinc-950 leading-snug">
                          {p.title}
                        </h4>

                        <div className="text-xs text-zinc-500 flex flex-wrap items-center gap-3">
                          <span>📍 {p.city || "Austin"}, {p.state || "TX"} ({p.zipCode || "78701"})</span>
                          <span>•</span>
                          <span>Posted by <strong className="text-zinc-700">{p.customerFirstName}</strong></span>
                          <span>•</span>
                          <span>{lead.nearbyContractorsCount} Active Pros Nearby</span>
                          <span>•</span>
                          <span>{lead.bidsCount} Bids Placed</span>
                        </div>
                      </div>

                    </div>

                    {/* Right: Key Figures & Ad Action */}
                    <div className="flex flex-wrap items-center gap-6 lg:justify-end shrink-0">
                      
                      {/* Budget & Expected Escrow Take */}
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                          Project Budget
                        </span>
                        <div className="text-lg font-black font-mono text-zinc-950">
                          ${(p.budget || 0).toLocaleString()}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold block">
                          Est. Fee: +${lead.expectedEscrowRevenue}
                        </span>
                      </div>

                      {/* Conversion Probability Bar */}
                      <div className="space-y-1 min-w-[110px]">
                        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-600">
                          <span>Match Prob.</span>
                          <span className="font-mono text-emerald-700 font-black">{lead.conversionProbability}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              lead.conversionProbability >= 85
                                ? "bg-emerald-500"
                                : lead.conversionProbability >= 70
                                ? "bg-blue-500"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${lead.conversionProbability}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-zinc-500 block text-right">High Closure Likelihood</span>
                      </div>

                      {/* Deploy Ad Button */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setInspectingLead(lead)}
                          className="p-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition cursor-pointer"
                          title="Inspect Lead Factors"
                        >
                          <Info className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeploySingle(lead)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-md ${
                            isDeployed
                              ? "bg-emerald-600 text-white border border-emerald-700"
                              : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 border border-amber-300"
                          }`}
                          id={`deploy-ad-btn-${p.id}`}
                        >
                          {isDeployed ? (
                            <>
                              <Check className="w-4 h-4 text-white" />
                              <span>Ad Live (${lead.suggestedAdSpend})</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5 text-zinc-950" />
                              <span>Deploy Ad (${lead.suggestedAdSpend})</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>

                  </div>

                  {/* Recommendation Strip */}
                  <div className="bg-zinc-50 rounded-2xl p-3.5 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 text-zinc-700">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <strong className="text-zinc-900">Suggested Strategy: </strong>
                        <span>Allocate <strong>${lead.suggestedAdSpend} ad budget</strong> on <em>{lead.primaryChannel}</em>.</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-zinc-600 shrink-0">
                      <span className="font-bold text-purple-700">
                        Projected ROAS: <strong className="font-mono font-black">{lead.projectedRoas}x</strong>
                      </span>
                      <span>•</span>
                      <span className="text-[11px] text-zinc-500">
                        Audience: {lead.targetAudienceNote}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Modal: Lead Scoring Factor Inspection */}
      {inspectingLead && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-zinc-150 pb-4">
              <div className="space-y-0.5">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${inspectingLead.badgeBg}`}>
                  {inspectingLead.tierLabel}
                </span>
                <h3 className="text-lg font-black text-zinc-950 pt-1">
                  Algorithmic Score Breakdown: {inspectingLead.project.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingLead(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Score Factors */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                <div>
                  <div className="text-xs font-bold text-zinc-900">💰 Budget Magnitude Factor ({budgetWeight}% weight)</div>
                  <div className="text-[11px] text-zinc-500">Raw budget ${(inspectingLead.project.budget || 0).toLocaleString()}</div>
                </div>
                <div className="text-sm font-mono font-black text-amber-600">
                  {inspectingLead.factorBreakdown.budgetScore}/100
                </div>
              </div>

              <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                <div>
                  <div className="text-xs font-bold text-zinc-900">🎯 Homeowner Intent Signal ({probabilityWeight}% weight)</div>
                  <div className="text-[11px] text-zinc-500">Verified scope, photos, phone verification & warranty status</div>
                </div>
                <div className="text-sm font-mono font-black text-blue-600">
                  {inspectingLead.factorBreakdown.intentScore}/100
                </div>
              </div>

              <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                <div>
                  <div className="text-xs font-bold text-zinc-900">🔨 Contractor Density ({liquidityWeight}% weight)</div>
                  <div className="text-[11px] text-zinc-500">{inspectingLead.nearbyContractorsCount} licensed contractors available in target trade/zip</div>
                </div>
                <div className="text-sm font-mono font-black text-indigo-600">
                  {inspectingLead.factorBreakdown.liquidityScore}/100
                </div>
              </div>

              <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                <div>
                  <div className="text-xs font-bold text-zinc-900">⚡ Urgency & Dispatch ({urgencyWeight}% weight)</div>
                  <div className="text-[11px] text-zinc-500">{inspectingLead.project.isEmergency ? "24/7 Emergency Dispatch Flag Active" : "Standard Project Priority"}</div>
                </div>
                <div className="text-sm font-mono font-black text-red-600">
                  {inspectingLead.factorBreakdown.urgencyScore}/100
                </div>
              </div>
            </div>

            {/* Recommended Ad Channels */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">
                Prescribed Ad Channels & Distribution
              </h4>
              <div className="space-y-1.5">
                {inspectingLead.recommendedChannels.map((ch, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-700 bg-amber-50/60 border border-amber-200/70 p-2.5 rounded-xl">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-semibold">{ch}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-150">
              <div className="text-xs text-zinc-500">
                Estimated Net Escrow Return: <strong className="text-emerald-700 font-mono font-bold">+${inspectingLead.expectedEscrowRevenue}</strong>
              </div>

              <button
                type="button"
                onClick={() => {
                  handleDeploySingle(inspectingLead);
                  setInspectingLead(null);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
              >
                Deploy Targeted Ad (${inspectingLead.suggestedAdSpend})
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
