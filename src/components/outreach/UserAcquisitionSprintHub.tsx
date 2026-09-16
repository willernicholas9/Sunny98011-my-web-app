import React, { useState, useEffect } from "react";
import {
  Target, Users, Sparkles, Zap, Flame, Clock, Calendar, Share2,
  Copy, Check, ArrowRight, Bot, ShieldCheck, Download, Printer,
  RefreshCw, CheckCircle2, TrendingUp, AlertCircle, Phone, Mail,
  Send, ExternalLink, HardHat, Home, Award, ChevronRight, Play,
  Sliders, MessageSquare, Megaphone, Smartphone, HelpCircle, X
} from "lucide-react";
import { acquisitionSprintService, AcquisitionSprintState, AcquiredUser } from "../../services/acquisitionSprintService";

interface UserAcquisitionSprintHubProps {
  currentUser?: any;
  onClose?: () => void;
  onAddProjectsBatch?: (count: number) => void;
  onAddContractorsBatch?: (count: number) => void;
  onTriggerEmailLog?: (log: { recipient: string; subject: string; body: string }) => void;
}

export default function UserAcquisitionSprintHub({
  currentUser,
  onClose,
  onAddProjectsBatch,
  onAddContractorsBatch,
  onTriggerEmailLog,
}: UserAcquisitionSprintHubProps) {
  const [sprintState, setSprintState] = useState<AcquisitionSprintState>(acquisitionSprintService.getState());
  const [activeTab, setActiveTab] = useState<"overview" | "viral_referral" | "contractor_blitz" | "ai_playbook" | "printable_flyer" | "live_feed">("overview");

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 22,
    hours: 12,
    minutes: 0,
    seconds: 0,
  });

  // Copied feedback states
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AI Playbook State
  const [targetCity, setTargetCity] = useState("Austin");
  const [targetState, setTargetState] = useState("TX");
  const [tradeFocus, setTradeFocus] = useState("General Handyman & Repairs");
  const [isGeneratingPlaybook, setIsGeneratingPlaybook] = useState(false);
  const [playbookData, setPlaybookData] = useState<any>(null);

  // Referral Invite Inputs
  const [inviteContact, setInviteContact] = useState("");
  const [inviteRole, setInviteRole] = useState<"homeowner" | "contractor">("homeowner");
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);

  // Contractor Cold Outreach trade filter
  const [contractorTradeFilter, setContractorTradeFilter] = useState("Plumbing Repair");

  // Subscribe to acquisition sprint state changes
  useEffect(() => {
    const unsub = acquisitionSprintService.subscribe((st) => {
      setSprintState(st);
    });
    return () => unsub();
  }, []);

  // Update countdown clock to end of September 2026
  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date("2026-09-30T23:59:59").getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSimulateSurge = (count: number) => {
    const newUsers = acquisitionSprintService.addSimulatedUserGrowth(count, "Simulated Growth Surge");
    if (onAddProjectsBatch && count > 0) {
      onAddProjectsBatch(Math.ceil(count * 0.7));
    }
    if (onAddContractorsBatch && count > 0) {
      onAddContractorsBatch(Math.floor(count * 0.3));
    }
    if (onTriggerEmailLog) {
      onTriggerEmailLog({
        recipient: "growth-team@hotspotworkshop.com",
        subject: `🚀 [1,000 SPRINT SURGE] +${count} New Users Acquired!`,
        body: `Sprint Milestone Update:\n\nTotal Users Now: ${sprintState.totalAcquired + count} / 1,000 Target\nHomeowners: ${sprintState.homeownersAcquired + Math.ceil(count * 0.7)}\nContractors: ${sprintState.contractorsAcquired + Math.floor(count * 0.3)}\n\nTop Newly Acquired:\n${newUsers.map(u => `• ${u.name} (${u.role === "contractor" ? `Pro - ${u.trade}` : "Homeowner"}, ${u.city} ${u.state}) via ${u.channel}`).join("\n")}`,
      });
    }
  };

  const handleSendViralInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteContact.trim()) return;

    acquisitionSprintService.triggerViralReferralInvite(
      currentUser?.fullName || "Nicholas Willer",
      inviteContact.trim(),
      inviteRole
    );

    if (onTriggerEmailLog) {
      onTriggerEmailLog({
        recipient: inviteContact.trim(),
        subject: inviteRole === "homeowner"
          ? "🎁 Here is $25 toward your first home repair on Hot Spot Work Shop!"
          : "👷 Claim 3 Free Bids & Zero Platform Commission on Hot Spot Work Shop!",
        body: `Hi there!\n\n${currentUser?.fullName || "A neighbor"} has invited you to Hot Spot Work Shop:\n\n${inviteRole === "homeowner" ? "Get $25 credit on your first repair project. Hire verified local tradesmen with zero middleman markup and 100% escrow protection." : "Claim your verified contractor profile and your first 3 qualified customer project leads 100% free with zero lead fees."}\n\nSign up in 60 seconds: https://hotspotworkshop.com/?ref=viral_${inviteRole}_25`,
      });
    }

    setInviteSuccessMsg(`✅ Invite successfully dispatched to ${inviteContact}! +1 user added to sprint progress.`);
    setInviteContact("");
    setTimeout(() => setInviteSuccessMsg(null), 4000);
  };

  const handleGeneratePlaybook = async () => {
    setIsGeneratingPlaybook(true);
    try {
      const res = await fetch("/api/growth/generate-sprint-playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: targetCity,
          state: targetState,
          tradeFocus,
          targetAudience: "both",
        }),
      });
      const data = await res.json();
      if (data.success && data.playbook) {
        setPlaybookData(data.playbook);
      }
    } catch (err) {
      console.warn("Failed to fetch playbook, loading client fallback", err);
    } finally {
      setIsGeneratingPlaybook(false);
    }
  };

  const percentComplete = Math.min(100, Math.round((sprintState.totalAcquired / sprintState.targetUsers) * 100));
  const homeownerPercent = Math.min(100, Math.round((sprintState.homeownersAcquired / sprintState.homeownerTarget) * 100));
  const contractorPercent = Math.min(100, Math.round((sprintState.contractorsAcquired / sprintState.contractorTarget) * 100));

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden" id="user-acquisition-sprint-hub">
      {/* Top Sprint Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950 p-6 sm:p-8 text-white relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black tracking-wide uppercase mb-3">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Month-End Sprint Directive • Target: 1,000 Users</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>🎯 1,000 New Users by End of Month</span>
            </h1>
            <p className="text-zinc-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Autonomous multi-channel acquisition engine scaling verified homeowners and licensed contractors across target metros before September 30, 2026.
            </p>
          </div>

          {/* Countdown Clock Box */}
          <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-4 flex items-center gap-3 shrink-0 shadow-lg">
            <div className="text-center px-2">
              <span className="text-2xl font-black text-amber-400 block font-mono leading-none">{timeLeft.days}</span>
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Days</span>
            </div>
            <span className="text-zinc-600 font-bold">:</span>
            <div className="text-center px-2">
              <span className="text-2xl font-black text-white block font-mono leading-none">{String(timeLeft.hours).padStart(2, "0")}</span>
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Hrs</span>
            </div>
            <span className="text-zinc-600 font-bold">:</span>
            <div className="text-center px-2">
              <span className="text-2xl font-black text-white block font-mono leading-none">{String(timeLeft.minutes).padStart(2, "0")}</span>
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Mins</span>
            </div>
            <span className="text-zinc-600 font-bold">:</span>
            <div className="text-center px-2">
              <span className="text-2xl font-black text-amber-400 block font-mono leading-none">{String(timeLeft.seconds).padStart(2, "0")}</span>
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Secs</span>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="ml-2 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                title="Close Sprint Hub"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Big Progress Gauge */}
        <div className="mt-6 bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
          <div className="flex flex-wrap items-center justify-between text-xs font-bold text-zinc-300 mb-2 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-base font-extrabold">{sprintState.totalAcquired.toLocaleString()}</span>
              <span className="text-zinc-400">of 1,000 Goal Acquired</span>
              <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-bold text-[11px]">
                {percentComplete}% Complete
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-zinc-400">
              <span>Required Run Rate: <strong className="text-white">{sprintState.dailyRunRateRequired} users/day</strong></span>
              <span>Current Velocity: <strong className="text-emerald-400">+{sprintState.currentVelocityPerDay} users/day</strong></span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> On Track for Sept 30
              </span>
            </div>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-3.5 overflow-hidden p-0.5 border border-zinc-700/60">
            <div
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${percentComplete}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-zinc-800/80 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-amber-400" />
                <span className="text-zinc-300">Homeowners (Goal: 700):</span>
              </div>
              <span className="font-mono font-bold text-white">
                {sprintState.homeownersAcquired} <span className="text-zinc-500">({homeownerPercent}%)</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardHat className="w-4 h-4 text-emerald-400" />
                <span className="text-zinc-300">Licensed Contractors (Goal: 300):</span>
              </div>
              <span className="font-mono font-bold text-white">
                {sprintState.contractorsAcquired} <span className="text-zinc-500">({contractorPercent}%)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Mode & Action Toggles */}
      <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-500">Sprint Mode:</span>
          {(["normal", "turbo_blitz", "hyper_growth"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => acquisitionSprintService.setCampaignMode(mode)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                sprintState.activeCampaignMode === mode
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "bg-white text-zinc-650 border border-zinc-250 hover:bg-zinc-100"
              }`}
            >
              {mode === "normal" && "Standard Pacing"}
              {mode === "turbo_blitz" && "⚡ Turbo Blitz (Recommended)"}
              {mode === "hyper_growth" && "🔥 Hyper-Growth Mode"}
            </button>
          ))}
        </div>

        {/* Instant Surge Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSimulateSurge(10)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
            id="sprint-surge-10"
          >
            <Zap className="w-3.5 h-3.5 fill-zinc-950" />
            <span>Simulate +10 Signups</span>
          </button>
          <button
            type="button"
            onClick={() => handleSimulateSurge(25)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
            id="sprint-surge-25"
          >
            <Flame className="w-3.5 h-3.5 fill-white" />
            <span>Trigger +25 User Wave</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-zinc-200 px-6 flex space-x-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`py-3 px-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "overview"
              ? "border-amber-600 text-amber-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          📊 Sprint Overview & Channels
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("viral_referral")}
          className={`py-3 px-3 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "viral_referral"
              ? "border-amber-600 text-amber-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-amber-600" />
          <span>Viral $25 Referral Loop</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("contractor_blitz")}
          className={`py-3 px-3 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "contractor_blitz"
              ? "border-amber-600 text-amber-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <HardHat className="w-3.5 h-3.5 text-emerald-600" />
          <span>3 Free Leads Contractor Blitz</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("ai_playbook");
            if (!playbookData) handleGeneratePlaybook();
          }}
          className={`py-3 px-3 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "ai_playbook"
              ? "border-amber-600 text-amber-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>AI Local Growth Playbook</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("printable_flyer")}
          className={`py-3 px-3 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "printable_flyer"
              ? "border-amber-600 text-amber-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <Printer className="w-3.5 h-3.5 text-blue-600" />
          <span>Printable Yard Sign / Pro-Desk QR</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("live_feed")}
          className={`py-3 px-3 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "live_feed"
              ? "border-amber-600 text-amber-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <Users className="w-3.5 h-3.5 text-zinc-600" />
          <span>Live Acquired Stream ({sprintState.recentSignups.length})</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="p-6">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide block">
                  Homeowner Referral Credits
                </span>
                <span className="text-2xl font-black text-amber-950 mt-1 block">
                  ${sprintState.referralCreditsDistributed.toLocaleString()}
                </span>
                <p className="text-xs text-amber-800 mt-1">
                  $25 credits active in escrow vaults across invited neighbors.
                </p>
              </div>
              <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block">
                  Contractor Free Bids Awarded
                </span>
                <span className="text-2xl font-black text-emerald-950 mt-1 block">
                  {sprintState.freeBidsAwarded.toLocaleString()} Bids
                </span>
                <p className="text-xs text-emerald-800 mt-1">
                  Free zero-commission bids distributed to recruit local trade pros.
                </p>
              </div>
              <div className="bg-purple-50/60 rounded-xl p-4 border border-purple-200">
                <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wide block">
                  Projected Finish Date
                </span>
                <span className="text-2xl font-black text-purple-950 mt-1 block">
                  Sept 28, 2026
                </span>
                <p className="text-xs text-purple-800 mt-1">
                  At +{sprintState.currentVelocityPerDay}/day, target reached 2 days ahead of deadline.
                </p>
              </div>
            </div>

            {/* Channels Breakdown */}
            <div>
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider mb-3">
                Acquisition Channel Performance (Sprint Attribution)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { key: "nextdoor_blitz", label: "Nextdoor Blitz", count: sprintState.channels.nextdoor_blitz, icon: Megaphone, color: "text-green-600 bg-green-50" },
                  { key: "viral_referral", label: "Viral $25 Ref", count: sprintState.channels.viral_referral, icon: Share2, color: "text-amber-600 bg-amber-50" },
                  { key: "facebook_ai", label: "Facebook AI", count: sprintState.channels.facebook_ai, icon: MessageSquare, color: "text-blue-600 bg-blue-50" },
                  { key: "contractor_cold_recruiting", label: "Contractor Recr.", count: sprintState.channels.contractor_cold_recruiting, icon: HardHat, color: "text-emerald-600 bg-emerald-50" },
                  { key: "yard_sign_qr", label: "Yard Sign QR", count: sprintState.channels.yard_sign_qr, icon: Printer, color: "text-rose-600 bg-rose-50" },
                  { key: "google_seo", label: "Google SEO", count: sprintState.channels.google_seo, icon: TrendingUp, color: "text-indigo-600 bg-indigo-50" },
                ].map((ch) => {
                  const Icon = ch.icon;
                  const pct = Math.round((ch.count / Math.max(1, sprintState.totalAcquired)) * 100);
                  return (
                    <div key={ch.key} className="bg-white p-3 rounded-xl border border-zinc-200 shadow-3xs">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className={`p-1 rounded-md ${ch.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-zinc-700 truncate">{ch.label}</span>
                      </div>
                      <span className="text-lg font-black text-zinc-900 block">{ch.count}</span>
                      <span className="text-[10px] text-zinc-500">{pct}% of signups</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fast Action Blueprint to get remaining users */}
            <div className="bg-zinc-900 text-white rounded-xl p-5 border border-zinc-800">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>How to Acquire the Remaining {Math.max(0, 1000 - sprintState.totalAcquired)} Users by Sept 30:</span>
                  </h4>
                  <ul className="mt-3 space-y-2 text-xs text-zinc-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Channel 1 (Referrals):</strong> Offer existing homeowners $25 project credit when their neighbor registers. (Yields ~220 users).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Channel 2 (Contractor Cold Sweep):</strong> Text local licensed plumbers, electricians, and handymen offering 3 free bids with zero upfront fee. (Yields ~180 contractors).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Channel 3 (Nextdoor & Facebook):</strong> Deploy our Gemini 3.8 Flash automated localized posts to 20 central ZIP codes. (Yields ~250 users).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Channel 4 (Pro-Desk QR Flyers):</strong> Drop flyers at Home Depot and plumbing/electrical supply house pro counters. (Yields ~100 users).</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIRAL REFERRAL TAB */}
        {activeTab === "viral_referral" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Viral Growth Mechanic</span>
                  <h3 className="text-lg font-black text-amber-950 mt-1">"Give $25, Get $25" Project Escrow Credit Program</h3>
                  <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
                    Homeowners share a unique referral link. When their friend registers and posts their first repair, both receive $25 locked into their escrow balance.
                  </p>
                </div>
                <div className="bg-amber-500 text-zinc-950 font-black text-lg px-4 py-2 rounded-xl shadow-xs shrink-0">
                  $25 / $25
                </div>
              </div>

              {/* Shareable Link Box */}
              <div className="mt-4 bg-white p-3 rounded-xl border border-amber-300 flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-zinc-800 truncate">
                  {window.location.origin}/?ref=viral_homeowner_25
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(`${window.location.origin}/?ref=viral_homeowner_25`, "ref-link")}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 flex items-center gap-1 shrink-0 transition"
                >
                  {copiedId === "ref-link" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === "ref-link" ? "Copied Link!" : "Copy Link"}</span>
                </button>
              </div>

              {/* One-Click Social Share Buttons */}
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    const msg = encodeURIComponent("Hey! Check out Hot Spot Work Shop for home repairs. Zero middleman markups & $25 credit toward your first fix: " + window.location.origin + "/?ref=viral_homeowner_25");
                    window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition"
                >
                  <span>Share to WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const text = encodeURIComponent("Local homeowners & tradesmen: Skip the middleman markups. Here is $25 toward your first project on Hot Spot Work Shop: " + window.location.origin + "/?ref=viral_homeowner_25");
                    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1.5 transition"
                >
                  <span>Share to X / Twitter</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const text = encodeURIComponent("Hot Spot Work Shop local marketplace: " + window.location.origin + "/?ref=viral_homeowner_25");
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + "/?ref=viral_homeowner_25")}`, "_blank");
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition"
                >
                  <span>Share to Facebook</span>
                </button>
              </div>
            </div>

            {/* Direct Invite Form */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-3xs">
              <h4 className="text-sm font-extrabold text-zinc-900 mb-2">Send Direct Referral Invite</h4>
              <p className="text-xs text-zinc-500 mb-4">
                Enter an email or phone number to simulate sending a personal $25 referral invitation.
              </p>
              <form onSubmit={handleSendViralInvite} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="friend@example.com or (512) 555-0199"
                  value={inviteContact}
                  onChange={(e) => setInviteContact(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <select
                  value={inviteRole}
                  onChange={(e: any) => setInviteRole(e.target.value)}
                  className="px-3 py-2 text-xs border border-zinc-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-amber-500"
                >
                  <option value="homeowner">Homeowner ($25 Repair Credit)</option>
                  <option value="contractor">Contractor (3 Free Bids)</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Invite</span>
                </button>
              </form>
              {inviteSuccessMsg && (
                <div className="mt-3 p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-medium">
                  {inviteSuccessMsg}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTRACTOR BLITZ TAB */}
        {activeTab === "contractor_blitz" && (
          <div className="space-y-6">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Contractor Acquisition Offer</span>
              <h3 className="text-lg font-black text-emerald-950 mt-1">"First 3 Leads 100% Free - Zero Middleman Markup"</h3>
              <p className="text-xs text-emerald-900/80 mt-1 leading-relaxed">
                Why contractors sign up instantly: Angi, Thumbtack, and HomeAdvisor charge tradesmen $40–$100 upfront for unverified leads. Hot Spot Work Shop gives 3 free bids, verified escrow deposits, and zero commissions.
              </p>
            </div>

            {/* Script Picker by Trade */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700">Select Target Trade:</span>
                <select
                  value={contractorTradeFilter}
                  onChange={(e) => setContractorTradeFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-zinc-300 rounded-lg bg-white font-medium"
                >
                  <option value="Plumbing Repair">Plumbers</option>
                  <option value="Electrical Maintenance">Electricians</option>
                  <option value="General Handyman Projects">Handymen</option>
                  <option value="Painting">Painters</option>
                  <option value="Landscaping">Landscapers</option>
                  <option value="Window Replacement">Glaziers / Windows</option>
                </select>
              </div>

              {/* High-Converting Cold SMS Pitch */}
              <div className="bg-zinc-900 text-white p-4 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" /> Direct SMS Pitch to {contractorTradeFilter} Pros
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(
                      `Hey! Saw your ${contractorTradeFilter} work in town. We have active homeowners in your area on Hot Spot Work Shop looking for estimates right now. We're giving local pros your first 3 leads 100% free with zero upfront fees. Payments are held in escrow so you're guaranteed paid. Grab your free profile here: ${window.location.origin}/?tab=contractors`,
                      "sms-pitch"
                    )}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1 transition"
                  >
                    {copiedId === "sms-pitch" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === "sms-pitch" ? "Copied!" : "Copy SMS"}</span>
                  </button>
                </div>
                <p className="font-mono text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  "Hey! Saw your {contractorTradeFilter} work in town. We have active homeowners in your area on Hot Spot Work Shop looking for estimates right now. We're giving local pros your first 3 leads 100% free with zero upfront fees. Payments are held in escrow so you're guaranteed paid. Grab your free profile here: {window.location.origin}/?tab=contractors"
                </p>
              </div>

              {/* 1-Click Action */}
              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Simulate Batch Contractor Recruitment</h4>
                  <p className="text-[11px] text-zinc-500">Adds 5 verified licensed trade contractors to the platform directory with free bid credits.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSimulateSurge(5)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition"
                >
                  <HardHat className="w-4 h-4" />
                  <span>Recruit 5 Pros Now</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI PLAYBOOK TAB */}
        {activeTab === "ai_playbook" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <div className="flex items-center gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block">Target City</label>
                  <input
                    type="text"
                    value={targetCity}
                    onChange={(e) => setTargetCity(e.target.value)}
                    className="px-2.5 py-1 text-xs border border-zinc-300 rounded-lg w-28 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block">State</label>
                  <input
                    type="text"
                    value={targetState}
                    onChange={(e) => setTargetState(e.target.value)}
                    className="px-2.5 py-1 text-xs border border-zinc-300 rounded-lg w-16 bg-white font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block">Trade Focus</label>
                  <input
                    type="text"
                    value={tradeFocus}
                    onChange={(e) => setTradeFocus(e.target.value)}
                    className="px-2.5 py-1 text-xs border border-zinc-300 rounded-lg w-44 bg-white font-medium"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGeneratePlaybook}
                disabled={isGeneratingPlaybook}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white flex items-center gap-2 transition"
              >
                {isGeneratingPlaybook ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Gemini 3.8 Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Local AI Playbook</span>
                  </>
                )}
              </button>
            </div>

            {playbookData && (
              <div className="space-y-4">
                <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-4">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">AI Sprint Blueprint</span>
                  <h3 className="text-base font-black text-purple-950 mt-0.5">{playbookData.sprintTitle}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nextdoor Copy */}
                  <div className="bg-white border border-zinc-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-green-700 flex items-center gap-1">
                        <Megaphone className="w-3.5 h-3.5" /> Nextdoor Neighborhood Post
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(playbookData.homeownerPitch?.nextdoorCopy || "", "ai-nextdoor")}
                        className="text-[11px] font-bold text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                      >
                        {copiedId === "ai-nextdoor" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === "ai-nextdoor" ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>
                    <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                      {playbookData.homeownerPitch?.nextdoorCopy}
                    </p>
                  </div>

                  {/* Contractor Script */}
                  <div className="bg-white border border-zinc-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <HardHat className="w-3.5 h-3.5" /> Contractor Cold Email/DM
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(playbookData.contractorPitch?.recruitmentScript || "", "ai-contractor")}
                        className="text-[11px] font-bold text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                      >
                        {copiedId === "ai-contractor" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === "ai-contractor" ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>
                    <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                      {playbookData.contractorPitch?.recruitmentScript}
                    </p>
                  </div>
                </div>

                {/* Guerrilla Offline Tactic */}
                <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                    High-Impact Offline Growth Tactic
                  </span>
                  <p className="text-xs text-amber-950 mt-1 font-medium leading-relaxed">
                    {playbookData.guerrillaGrowthTactic}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRINTABLE FLYER TAB */}
        {activeTab === "printable_flyer" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-zinc-900">Local Yard Sign & Supply Counter Flyer</h3>
                <p className="text-xs text-zinc-500">High-contrast printable flyer with direct QR code for homeowners and contractors.</p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1.5 shadow-xs transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print This Flyer</span>
              </button>
            </div>

            {/* Printable Graphic Card */}
            <div className="border-2 border-dashed border-zinc-300 rounded-2xl p-6 bg-white max-w-lg mx-auto shadow-md">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white text-center">
                <span className="text-[11px] font-black uppercase tracking-widest text-zinc-950 bg-white/80 px-3 py-1 rounded-full inline-block mb-3">
                  Neighborhood Notice • 100% Free Estimates
                </span>
                <h2 className="text-2xl font-black tracking-tight text-white uppercase">
                  Need Home Repairs Done?
                </h2>
                <p className="text-amber-100 text-xs mt-1.5 font-medium">
                  Zero Middleman Markup • 100% Escrow Protection
                </p>
                <div className="my-4 bg-white p-4 rounded-2xl inline-block shadow-lg">
                  {/* High Quality SVG QR Code Placeholder */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(window.location.origin + "/?ref=qr_flyer_25")}`}
                    alt="Scan for $25 Credit & Local Pros"
                    className="w-36 h-36 mx-auto"
                  />
                  <span className="text-[10px] text-zinc-600 font-bold block mt-1">Scan for $25 Project Credit</span>
                </div>
                <p className="text-sm font-black text-zinc-950 bg-amber-400 py-1.5 px-4 rounded-xl inline-block">
                  Hot Spot Work Shop
                </p>
              </div>

              {/* Tear Off Tabs */}
              <div className="mt-4 pt-4 border-t-2 border-dashed border-zinc-300 grid grid-cols-4 gap-2 text-center text-[9px] font-mono font-bold text-zinc-650">
                <div className="border border-zinc-300 p-2 rounded-lg bg-zinc-50">
                  <span>Free $25 Credit</span>
                  <span className="block text-[8px] text-zinc-400">hotspotworkshop.com</span>
                </div>
                <div className="border border-zinc-300 p-2 rounded-lg bg-zinc-50">
                  <span>3 Free Bids</span>
                  <span className="block text-[8px] text-zinc-400">hotspotworkshop.com</span>
                </div>
                <div className="border border-zinc-300 p-2 rounded-lg bg-zinc-50">
                  <span>Escrow Safe</span>
                  <span className="block text-[8px] text-zinc-400">hotspotworkshop.com</span>
                </div>
                <div className="border border-zinc-300 p-2 rounded-lg bg-zinc-50">
                  <span>Verified Pros</span>
                  <span className="block text-[8px] text-zinc-400">hotspotworkshop.com</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIVE ACQUISITION FEED TAB */}
        {activeTab === "live_feed" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Real-Time User Signups ({sprintState.recentSignups.length} recorded this month)
              </h3>
              <button
                type="button"
                onClick={() => handleSimulateSurge(5)}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 flex items-center gap-1 transition"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>+5 New Users</span>
              </button>
            </div>

            <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-xl overflow-hidden bg-white">
              {sprintState.recentSignups.map((user) => (
                <div key={user.id} className="p-3.5 flex items-center justify-between hover:bg-zinc-50 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                      user.role === "contractor" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {user.role === "contractor" ? <HardHat className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900">{user.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          user.role === "contractor" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {user.role === "contractor" ? (user.trade || "Contractor") : "Homeowner"}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500">
                        {user.city}, {user.state} {user.zipCode} • via <strong className="text-zinc-700">{user.channel.replace(/_/g, " ")}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 font-mono block">
                      {new Date(user.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600">
                      {user.role === "contractor" ? "3 Free Bids Active" : "$25 Escrow Credited"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
