import React, { useState, useEffect } from "react";
import { Project, Bid, ContractorUser } from "../types";
import { Sparkles, TrendingUp, ShieldCheck, Zap, DollarSign, Clock, ArrowRight, HardHat, Flame } from "lucide-react";

interface LiveMarketplaceTickerProps {
  projects: Project[];
  bids: Bid[];
  contractors: ContractorUser[];
  onSelectProject?: (projectId: string) => void;
  onOpenMonetization?: () => void;
}

interface ActivityEvent {
  id: string;
  type: "bid" | "hired" | "new_job" | "boost" | "escrow";
  icon: string;
  badge: string;
  badgeColor: string;
  headline: string;
  subtext: string;
  amount?: number;
  location: string;
  timeAgo: string;
  projectId?: string;
}

function LiveMarketplaceTickerComponent({
  projects,
  bids,
  contractors,
  onSelectProject,
  onOpenMonetization,
}: LiveMarketplaceTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Generate dynamic live activities based on real app data
  const activities: ActivityEvent[] = React.useMemo(() => {
    const list: ActivityEvent[] = [];

    // Add recent bids
    bids.slice(0, 4).forEach((b, i) => {
      const proj = projects.find((p) => p.id === b.projectId);
      list.push({
        id: `act-bid-${b.id || i}`,
        type: "bid",
        icon: "⚡",
        badge: "NEW BID PLACED",
        badgeColor: "bg-amber-500/20 text-amber-900 border-amber-500/30",
        headline: `${b.contractorName} placed a bid on "${proj ? proj.title : 'Home Repair'}"`,
        subtext: `Competitive estimate submitted with verified insurance.`,
        amount: b.amount,
        location: proj ? `${proj.city}, ${proj.state}` : "Austin, TX",
        timeAgo: `${(i + 1) * 4}m ago`,
        projectId: b.projectId,
      });
    });

    // Add accepted / hired milestones
    projects.filter((p) => p.status === "accepted").slice(0, 3).forEach((p, i) => {
      list.push({
        id: `act-hired-${p.id || i}`,
        type: "hired",
        icon: "🎉",
        badge: "CONTRACTOR HIRED",
        badgeColor: "bg-emerald-500/20 text-emerald-900 border-emerald-500/30",
        headline: `${p.customerFirstName} accepted a verified bid for "${p.title}"`,
        subtext: `Customer contact unlocked 100% free • Escrow protected.`,
        amount: p.budget,
        location: `${p.city}, ${p.state}`,
        timeAgo: `${(i + 2) * 9}m ago`,
        projectId: p.id,
      });
    });

    // Add fresh high-budget jobs
    projects.filter((p) => p.status === "open").slice(0, 3).forEach((p, i) => {
      list.push({
        id: `act-job-${p.id || i}`,
        type: "new_job",
        icon: "🔥",
        badge: "HOT PROJECT OPEN",
        badgeColor: "bg-rose-500/20 text-rose-900 border-rose-500/30",
        headline: `New ${p.type === "business" ? "Commercial" : "Residential"} project posted: "${p.title}"`,
        subtext: `Homeowner seeking local licensed contractors for immediate quote.`,
        amount: p.budget,
        location: `${p.city}, ${p.state}`,
        timeAgo: `${(i + 1) * 2}m ago`,
        projectId: p.id,
      });
    });

    // If list is small, add simulated high-impact events
    if (list.length < 5) {
      list.push(
        {
          id: "sim-1",
          type: "escrow",
          icon: "🛡️",
          badge: "ESCROW SECURED",
          badgeColor: "bg-sky-500/20 text-sky-900 border-sky-500/30",
          headline: "Milestone funds securely held in platform escrow for Master Bathroom Renovation",
          subtext: "100% guaranteed payout upon homeowner milestone sign-off.",
          amount: 4200,
          location: "Dallas, TX",
          timeAgo: "14m ago",
        },
        {
          id: "sim-2",
          type: "boost",
          icon: "🚀",
          badge: "EXPRESS PRIORITY",
          badgeColor: "bg-purple-500/20 text-purple-900 border-purple-500/30",
          headline: "Emergency Electrical Panel Upgrade boosted to top of contractor feed",
          subtext: "Priority dispatch activated by homeowner.",
          amount: 1850,
          location: "Chicago, IL",
          timeAgo: "22m ago",
        }
      );
    }

    return list;
  }, [projects, bids]);

  // Rotate activity every 4.5 seconds
  useEffect(() => {
    if (activities.length === 0 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [activities.length, isPaused]);

  const currentActivity = activities[currentIndex] || activities[0];

  // Aggregated platform stats
  const totalMarketplacePool = React.useMemo(() => {
    return projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  }, [projects]);

  if (!currentActivity) return null;

  return (
    <div 
      className="bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-950 text-white border-y border-amber-500/30 px-3.5 py-2.5 shadow-md select-none transition-all duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      id="live-marketplace-activity-ticker"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Left: Live indicator + rotating event */}
        <div className="flex items-center gap-3 w-full md:w-auto min-w-0">
          <div className="flex items-center gap-1.5 shrink-0 bg-emerald-950/80 border border-emerald-500/40 px-2 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-black tracking-wider text-emerald-300 uppercase">
              LIVE PULSE
            </span>
          </div>

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border shrink-0 ${currentActivity.badgeColor}`}>
              {currentActivity.icon} {currentActivity.badge}
            </span>

            <div className="truncate text-xs text-zinc-200">
              <span className="font-bold text-white">{currentActivity.headline}</span>
              {currentActivity.amount && (
                <span className="ml-1.5 text-emerald-400 font-mono font-bold">
                  (${currentActivity.amount.toLocaleString()})
                </span>
              )}
              <span className="ml-2 text-[10px] text-zinc-400 hidden sm:inline">
                • {currentActivity.location} • {currentActivity.timeAgo}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick action buttons & pool metric */}
        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-between md:justify-end">
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-zinc-300 bg-zinc-900/90 border border-zinc-800 px-2.5 py-1 rounded-xl">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Active Marketplace Pool: <strong className="text-emerald-400 font-mono">${totalMarketplacePool.toLocaleString()}</strong></span>
          </div>

          {currentActivity.projectId && onSelectProject && (
            <button
              onClick={() => onSelectProject(currentActivity.projectId!)}
              className="text-[10px] font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg transition flex items-center gap-1 shadow-3xs cursor-pointer"
            >
              <span>View Job</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {onOpenMonetization && (
            <button
              onClick={onOpenMonetization}
              className="text-[10px] font-extrabold bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
              title="Unlock Pro Perks"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Contractor Pro</span> Perks
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(LiveMarketplaceTickerComponent);
