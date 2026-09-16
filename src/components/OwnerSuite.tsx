import React, { useState, useEffect } from "react";
import { Project, Bid } from "../types";
import OutreachCampaignsHub from "./OutreachCampaignsHub";
import AutonomousAdInstallerAgent from "./AutonomousAdInstallerAgent";
import ProjectAnalytics from "./owner/ProjectAnalytics";
import LeadPriorityEngine from "./owner/LeadPriorityEngine";
import { monetizationService } from "../services/monetizationService";
import {
  ShieldCheck,
  DollarSign,
  Users,
  Award,
  AlertTriangle,
  Send,
  RefreshCw,
  CheckCircle2,
  Lock,
  Unlock,
  Radio,
  FileSpreadsheet,
  Check,
  Zap,
  Activity,
  Sliders,
  Settings,
  Mail,
  Building,
  UserCheck,
  Eye,
  EyeOff,
  KeyRound,
  Crown,
  X,
  Bot,
  Megaphone,
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
  Flame,
  Target
} from "lucide-react";

interface OwnerSuiteProps {
  currentUser: any;
  projects: Project[];
  bids: Bid[];
  contractorsList: any[];
  customersList: any[];
  onTriggerEmailLog: (log: { recipient: string; subject: string; body: string }) => void;
  onUpdateProjectStatus?: (projectId: string, newStatus: Project["status"]) => void;
  seniorMode?: boolean;
  setSeniorMode?: (mode: boolean) => void;
}

export default function OwnerSuite({
  currentUser,
  projects,
  bids,
  contractorsList,
  customersList,
  onTriggerEmailLog,
  onUpdateProjectStatus,
  seniorMode = false,
  setSeniorMode,
}: OwnerSuiteProps) {
  // Owner Sub-Section State ("overview" | "analytics" | "lead_priority" | "ai_agent" | "outreach")
  const [activeOwnerSection, setActiveOwnerSection] = useState<"overview" | "analytics" | "lead_priority" | "ai_agent" | "outreach">("overview");
  // Password Protection state
  const [ownerPassword, setOwnerPassword] = useState<string>(() => {
    try {
      return localStorage.getItem("hsws_owner_password") || "ownerpass123";
    } catch {
      return "ownerpass123";
    }
  });
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("hsws_owner_unlocked") === "true";
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Change Password state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassForChange, setCurrentPassForChange] = useState("");
  const [newPassForChange, setNewPassForChange] = useState("");
  const [confirmPassForChange, setConfirmPassForChange] = useState("");
  const [changePassStatus, setChangePassStatus] = useState("");

  // Configurable Fee Rates state
  const [smallServiceFee, setSmallServiceFee] = useState(5);
  const [largeServiceFee, setLargeServiceFee] = useState(20);
  const [contractorSubFee, setContractorSubFee] = useState(20);
  const [feesSaved, setFeesSaved] = useState(false);

  // User Management state
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "contractors" | "customers">("all");
  const [verifiedBadges, setVerifiedBadges] = useState<{ [id: string]: boolean }>({
    "owner-1": true,
    "contractor-1": true,
    "contractor-2": true,
  });
  const [waivedUsers, setWaivedUsers] = useState<{ [id: string]: boolean }>({
    "owner-1": true,
    "cust-1": true,
  });

  // Broadcast state
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState<"all" | "customers" | "contractors">("all");
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Escrow Override state
  const [selectedEscrowProject, setSelectedEscrowProject] = useState<Project | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  // Live Monetization Engine State
  const [monetizationStats, setMonetizationStats] = useState(() => monetizationService.getPlatformStats());
  const [transactionsList, setTransactionsList] = useState(() => monetizationService.getTransactions());
  const [isStripeLive, setIsStripeLive] = useState(false);

  useEffect(() => {
    // Check Stripe server status
    fetch("/api/stripe/status")
      .then((res) => res.json())
      .then((data) => {
        setIsStripeLive(data.mode === "live");
      })
      .catch(() => setIsStripeLive(false));

    const unsubscribe = monetizationService.subscribe(() => {
      setMonetizationStats(monetizationService.getPlatformStats());
      setTransactionsList(monetizationService.getTransactions());
    });
    return unsubscribe;
  }, []);

  const handleUnlockSuite = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ownerPassword) {
      setIsUnlocked(true);
      sessionStorage.setItem("hsws_owner_unlocked", "true");
      setPasswordError("");
      setPasswordInput("");
    } else {
      setPasswordError("Incorrect owner passcode. Access denied.");
    }
  };

  const handleLockSuite = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem("hsws_owner_unlocked");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPassForChange !== ownerPassword) {
      setChangePassStatus("Current password does not match.");
      return;
    }
    if (newPassForChange.length < 4) {
      setChangePassStatus("New password must be at least 4 characters long.");
      return;
    }
    if (newPassForChange !== confirmPassForChange) {
      setChangePassStatus("New passwords do not match.");
      return;
    }
    setOwnerPassword(newPassForChange);
    localStorage.setItem("hsws_owner_password", newPassForChange);
    setChangePassStatus("SUCCESS");
    setTimeout(() => {
      setShowChangePasswordModal(false);
      setChangePassStatus("");
      setCurrentPassForChange("");
      setNewPassForChange("");
      setConfirmPassForChange("");
    }, 1800);
  };

  const handleSaveFeeConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setFeesSaved(true);
    setTimeout(() => setFeesSaved(false), 3000);
  };

  const toggleVerification = (userId: string) => {
    setVerifiedBadges((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const toggleWaivePromo = (userId: string) => {
    setWaivedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject || !broadcastMessage) return;

    onTriggerEmailLog({
      recipient: broadcastTarget === "all" ? "ALL PLATFORM USERS (Push & Email Broadcast)" : broadcastTarget === "customers" ? "All Homeowners" : "All Contractors",
      subject: `[SYSTEM BROADCAST] ${broadcastSubject}`,
      body: `Dear Hot Spot Work Shop Users,\n\n${broadcastMessage}\n\nBest regards,\nNicholas Willer\nPlatform Founder & Executive Owner\nwillernicholas9@gmail.com`,
    });

    setBroadcastSuccess(true);
    setBroadcastSubject("");
    setBroadcastMessage("");
    setTimeout(() => setBroadcastSuccess(false), 4000);
  };

  // Combine lists for user management (deduplicated by id and displayType)
  const allUsersMap = new Map<string, any>();
  contractorsList.forEach((c) => allUsersMap.set(`contractor-${c.id}`, { ...c, displayType: "Contractor" }));
  customersList.forEach((c) => allUsersMap.set(`customer-${c.id}`, { ...c, displayType: "Homeowner Customer" }));
  const allUsers = Array.from(allUsersMap.values());

  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.city.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole =
      userRoleFilter === "all" ||
      (userRoleFilter === "contractors" && (u.role === "contractor" || u.displayType === "Contractor")) ||
      (userRoleFilter === "customers" && (u.role === "customer" || u.displayType === "Homeowner Customer"));
    return matchesSearch && matchesRole;
  });

  // Calculate platform financial stats
  const totalAgreedProjects = projects.filter((p) => p.status === "accepted" || p.status === "completed" || (p.agreedByCustomer && p.agreedByContractor));
  const totalEscrowVolume = totalAgreedProjects.reduce((sum, p) => sum + p.budget, 0);
  const totalServiceCommissions = totalAgreedProjects.reduce((sum, p) => sum + (p.serviceFeeCharge || (p.budget > 25000 ? largeServiceFee : smallServiceFee)), 0);
  const activeContractorsCount = contractorsList.length;
  const monthlySubscriptionRev = activeContractorsCount * contractorSubFee;

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-zinc-200 rounded-3xl p-8 shadow-xl space-y-6 animate-fade-in text-center relative overflow-hidden" id="owner-lock-screen">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700" />
        
        <div className="w-16 h-16 bg-amber-100 border border-amber-300 rounded-2xl mx-auto flex items-center justify-center text-amber-700 text-2xl shadow-inner">
          <Lock className="w-8 h-8 text-amber-600" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
            <Crown className="w-3.5 h-3.5 text-amber-700" /> Owner Security Gate
          </div>
          <h2 className="text-xl font-black text-zinc-900 font-display">Executive Console Protected</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Enter your secret owner passcode to view system revenue, manage users, and issue escrow releases.
          </p>
        </div>

        <form onSubmit={handleUnlockSuite} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wider mb-1.5">Owner Passcode</label>
            <div className="relative">
              <input
                type={showPasswordInput ? "text" : "password"}
                placeholder="Enter owner passcode..."
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                required
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 text-sm font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-hidden transition pr-10"
                id="owner-passcode-input"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPasswordInput(!showPasswordInput)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
                title={showPasswordInput ? "Hide passcode" : "Show passcode"}
              >
                {showPasswordInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-red-600 font-bold mt-1.5 flex items-center gap-1 animate-in fade-in">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {passwordError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            id="unlock-owner-suite-btn"
          >
            <Unlock className="w-4 h-4" /> Unlock Executive Console
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-150 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>🔒 AES-256 Protected</span>
          <button
            type="button"
            onClick={() => {
              setPasswordInput(ownerPassword);
              setPasswordError("");
            }}
            className="text-amber-700 hover:underline font-bold text-[10px] cursor-pointer"
          >
            Auto-fill passcode ({ownerPassword})
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in" id="owner-suite-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-zinc-900 to-zinc-950 text-white p-6 sm:p-8 rounded-3xl border border-amber-500/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_70%_50%,rgba(245,158,11,0.15)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-2xl font-black shadow-lg border border-amber-300/30 shrink-0">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                  Platform Creator & Owner Console
                </h1>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Executive Root Mode
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                Logged in as Founder <strong className="text-amber-400">Nicholas Willer</strong> ({currentUser?.email || "willernicholas9@gmail.com"})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="px-3 py-2 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Change Owner Passcode"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Change Passcode</span>
            </button>

            <button
              onClick={handleLockSuite}
              className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Lock Console Session"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Console</span>
            </button>

            <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-3 py-2 rounded-xl text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div>
                <span className="block font-bold text-zinc-200">Status: Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <h3 className="font-display font-bold text-base text-zinc-900">Change Owner Passcode</h3>
              </div>
              <button
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setChangePassStatus("");
                }}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">Current Owner Passcode</label>
                <input
                  type="password"
                  value={currentPassForChange}
                  onChange={(e) => setCurrentPassForChange(e.target.value)}
                  required
                  placeholder="Enter current passcode..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">New Owner Passcode</label>
                <input
                  type="password"
                  value={newPassForChange}
                  onChange={(e) => setNewPassForChange(e.target.value)}
                  required
                  placeholder="Enter new passcode..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">Confirm New Passcode</label>
                <input
                  type="password"
                  value={confirmPassForChange}
                  onChange={(e) => setConfirmPassForChange(e.target.value)}
                  required
                  placeholder="Re-enter new passcode..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {changePassStatus && changePassStatus !== "SUCCESS" && (
                <p className="text-xs text-red-600 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {changePassStatus}
                </p>
              )}

              {changePassStatus === "SUCCESS" && (
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Passcode updated successfully!
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="w-1/2 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition shadow-xs"
                >
                  Save Passcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Executive Sub-Section Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white border border-zinc-200 p-2 rounded-2xl shadow-xs">
        <button
          type="button"
          onClick={() => setActiveOwnerSection("overview")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeOwnerSection === "overview"
              ? "bg-amber-600 text-white shadow-md font-black"
              : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
          }`}
          id="owner-subtab-overview"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>📊 Overview & Revenue Controls</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveOwnerSection("analytics")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeOwnerSection === "analytics"
              ? "bg-blue-600 text-white shadow-md font-black"
              : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
          }`}
          id="owner-subtab-analytics"
        >
          <TrendingUp className="w-4 h-4" />
          <span>📈 Project Analytics & Match Trends</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveOwnerSection("lead_priority")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeOwnerSection === "lead_priority"
              ? "bg-amber-600 text-white shadow-md font-black"
              : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200"
          }`}
          id="owner-subtab-lead-priority"
        >
          <Flame className="w-4 h-4 text-amber-500" />
          <span>🎯 Lead Priority & Ad Spend Engine</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveOwnerSection("ai_agent")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeOwnerSection === "ai_agent"
              ? "bg-red-600 text-white shadow-md font-black animate-pulse"
              : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
          }`}
          id="owner-subtab-ai-agent"
        >
          <Bot className="w-4 h-4" />
          <span>🤖 AI Advertisement Agent (Exclusive Owner Control)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveOwnerSection("outreach")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeOwnerSection === "outreach"
              ? "bg-amber-500 text-zinc-950 shadow-md font-black"
              : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200"
          }`}
          id="owner-subtab-outreach"
        >
          <Megaphone className="w-4 h-4" />
          <span>📣 Outreach Programs & Email Campaigns</span>
        </button>
      </div>

      {/* Render selected owner sub-section */}
      {activeOwnerSection === "analytics" && (
        <ProjectAnalytics
          projects={projects}
          bids={bids}
          contractorsCount={contractorsList.length}
        />
      )}

      {activeOwnerSection === "lead_priority" && (
        <LeadPriorityEngine
          projects={projects}
          bids={bids}
          contractorsList={contractorsList}
          onDeployAdCampaign={(campaign) => {
            onTriggerEmailLog({
              recipient: "ad-ops@home-service-relay.internal",
              subject: `[Ad Blitz Live] Target: ${campaign.projectTitle} ($${campaign.suggestedBudget})`,
              body: `Automated ad campaign dispatched to ${campaign.channel} targeting ${campaign.targetTrade} in Zip ${campaign.targetZip}. Suggested allocation: $${campaign.suggestedBudget}.`
            });
          }}
        />
      )}

      {activeOwnerSection === "ai_agent" && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-xs text-red-900 font-medium flex items-center gap-2">
            <Bot className="w-5 h-5 text-red-600 shrink-0" />
            <span>
              <strong>Owner Private Portal:</strong> The Autonomous AI Advertising & System Installer Agent is strictly visible to you as Executive Owner. Non-owner users cannot see or access this tool.
            </span>
          </div>
          <AutonomousAdInstallerAgent appUrl={window.location.origin} />
        </div>
      )}

      {activeOwnerSection === "outreach" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 font-medium flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>Owner Private Portal:</strong> Outreach programs and marketing campaigns are housed exclusively within your Executive Owner Dashboard.
            </span>
          </div>
          <OutreachCampaignsHub
            currentUser={currentUser}
            onAlert={(msg) => alert(msg)}
            seniorMode={seniorMode}
            setSeniorMode={setSeniorMode}
          />
        </div>
      )}

      {activeOwnerSection === "overview" && (
        <>
          {/* Action Notification Alert */}
      {actionSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Financial Revenue & Escrow Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Contractor Subs</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black font-mono text-zinc-900">${monthlySubscriptionRev.toFixed(2)} <span className="text-xs font-normal text-zinc-500">/mo</span></p>
          <p className="text-[11px] text-zinc-500 mt-1">{activeContractorsCount} Active Pro accounts (${contractorSubFee}/mo each)</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Match Commissions</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black font-mono text-emerald-700">${totalServiceCommissions.toFixed(2)}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Accrued from {totalAgreedProjects.length} completed/agreed contracts</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Escrow Volume</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black font-mono text-zinc-900">${totalEscrowVolume.toLocaleString()}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Total contract value protected in escrow</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Platform Reserve</span>
            <Building className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black font-mono text-amber-600">${(monthlySubscriptionRev + totalServiceCommissions + (monetizationStats.platformGrossRevenue || 0)).toFixed(2)}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Routing to Chase Bank N.A. (****-9185)</p>
        </div>
      </div>

      {/* LIVE MONETIZATION & STRIPE CASH INFLOW ENGINE */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950 border border-amber-500/40 rounded-3xl p-6 text-white shadow-xl space-y-5 relative overflow-hidden" id="owner-live-monetization-console">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-lg text-white">
                Live Monetization & Cash Inflow Engine
              </h3>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                isStripeLive 
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" 
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              }`}>
                <span className={`w-2 h-2 rounded-full ${isStripeLive ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
                {isStripeLive ? "Stripe LIVE Production" : "Stripe Sandbox (Active Simulation)"}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              All 5 revenue levers are active with enforced paywalls. Contractors are gated at 3 bids and phone numbers require Lead Passes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                monetizationService.recordTransaction({
                  userId: "test-contractor",
                  userName: "Apex Premier Roofing",
                  userRole: "contractor",
                  productType: "contractor_pro_subscription",
                  title: "Contractor Pro Monthly Membership",
                  amount: 29.00,
                  currency: "USD",
                  status: "succeeded",
                  paymentMethod: "stripe_card",
                  referenceId: "sub_test_pro_29",
                });
                setActionSuccessMsg("Recorded simulated $29.00 Contractor Pro subscription transaction!");
                setTimeout(() => setActionSuccessMsg(""), 3500);
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="Test $29 Subscription Cash Flow"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Simulate $29 Pro Charge</span>
            </button>
            <button
              type="button"
              onClick={() => {
                monetizationService.recordTransaction({
                  userId: "test-contractor",
                  userName: "Summit HVAC & Plumbing",
                  userRole: "contractor",
                  productType: "lead_unlock_single",
                  title: "Direct Customer Lead Phone & Email Unlock",
                  amount: 15.00,
                  currency: "USD",
                  status: "succeeded",
                  paymentMethod: "stripe_card",
                  referenceId: "ch_test_lead_15",
                });
                setActionSuccessMsg("Recorded simulated $15.00 Direct Lead Unlock transaction!");
                setTimeout(() => setActionSuccessMsg(""), 3500);
              }}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="Test $15 Lead Unlock Cash Flow"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Simulate $15 Lead Charge</span>
            </button>
          </div>
        </div>

        {/* 4 Monetization Levers Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-[11px] font-bold">
              <span>Contractor Pro</span>
              <span className="text-amber-400 font-mono font-bold">$29/mo</span>
            </div>
            <p className="text-xl font-black font-mono text-white">{monetizationStats.activeProContractorsCount || 0} Active</p>
            <p className="text-[10px] text-zinc-500">Paywall at 3rd bid</p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-[11px] font-bold">
              <span>Lead Unlocks</span>
              <span className="text-emerald-400 font-mono font-bold">$15/lead</span>
            </div>
            <p className="text-xl font-black font-mono text-white">{monetizationStats.leadCreditsPurchasedCount || 0} Sold</p>
            <p className="text-[10px] text-zinc-500">Instant phone & email</p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-[11px] font-bold">
              <span>Project Boosts</span>
              <span className="text-purple-400 font-mono font-bold">$9.99+</span>
            </div>
            <p className="text-xl font-black font-mono text-white">{monetizationStats.boostedProjectsCount || 0} Placed</p>
            <p className="text-[10px] text-zinc-500">Featured homeowner placement</p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-[11px] font-bold">
              <span>Escrow Commission</span>
              <span className="text-rose-400 font-mono font-bold">3% Take</span>
            </div>
            <p className="text-xl font-black font-mono text-white">${(monetizationStats.escrowCommissionsTotal || 0).toFixed(2)}</p>
            <p className="text-[10px] text-zinc-500">Direct on project finish</p>
          </div>
        </div>

        {/* Live Transaction Ledger */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Real-Time Payment Inflow Ledger</span>
            </span>
            <span className="text-xs font-mono font-black text-amber-400">
              Total Inflow: ${(monetizationStats.platformGrossRevenue || 0).toFixed(2)} USD
            </span>
          </div>

          {transactionsList.length === 0 ? (
            <p className="text-xs text-zinc-500 py-3 text-center">
              No transactions recorded yet in current session. Use the test buttons above or click "Unlock Lead" / "Go Pro" on any project card.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-bold text-[10px] uppercase">
                    <th className="py-2 px-3">Transaction ID</th>
                    <th className="py-2 px-3">Payer</th>
                    <th className="py-2 px-3">Product</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                    <th className="py-2 px-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                  {transactionsList.slice(0, 5).map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-800/40 transition">
                      <td className="py-2.5 px-3 text-amber-400 font-bold">{t.id}</td>
                      <td className="py-2.5 px-3 font-sans text-zinc-300">{t.userName} ({t.userRole})</td>
                      <td className="py-2.5 px-3 font-sans text-zinc-400">{t.title}</td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-400">+${t.amount.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right text-zinc-500 font-sans text-[10px]">
                        {new Date(t.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Executive Intelligence Grid: Analytics & Lead Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Project Analytics Teaser Card */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-zinc-900 text-white rounded-3xl p-6 border border-blue-700/50 shadow-md flex flex-col justify-between gap-6 relative overflow-hidden">
          <div className="space-y-1.5 z-10">
            <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              <TrendingUp className="w-3 h-3 text-blue-400" />
              <span>Marketplace Intelligence & Match Trends</span>
            </div>
            <h3 className="text-lg font-black font-display tracking-tight text-white">
              Project Analytics: Match Rates & Seasonal Inflow
            </h3>
            <p className="text-xs text-blue-200/80 leading-relaxed">
              Visualize contractor bid competition per trade, 82%+ escrow match velocities, and monthly demand curves across seasons.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveOwnerSection("analytics")}
            className="bg-blue-500 hover:bg-blue-400 text-zinc-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0 z-10 w-fit"
            id="open-project-analytics-from-overview-btn"
          >
            <BarChart3 className="w-4 h-4 text-zinc-950" />
            <span>Launch Project Analytics</span>
          </button>
        </div>

        {/* Lead Priority & Ad Spend Engine Teaser Card */}
        <div className="bg-gradient-to-r from-amber-950 via-zinc-900 to-amber-900 text-white rounded-3xl p-6 border border-amber-600/50 shadow-md flex flex-col justify-between gap-6 relative overflow-hidden">
          <div className="space-y-1.5 z-10">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/25 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>Automated High-Yield Lead Scoring</span>
            </div>
            <h3 className="text-lg font-black font-display tracking-tight text-white">
              Lead Priority & Targeted Ad Spend Allocation
            </h3>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Identify high-budget, high-probability projects and deploy recommended ad spend ($15–$150) across Google LSA and Meta for 5.4x+ ROAS.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveOwnerSection("lead_priority")}
            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-zinc-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0 z-10 w-fit"
            id="open-lead-priority-from-overview-btn"
          >
            <Target className="w-4 h-4 text-zinc-950" />
            <span>Launch Lead Priority Engine</span>
          </button>
        </div>

      </div>

      {/* Main Grid: Fee Configurator & Broadcast Relays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Platform Fee Rate Configurator */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-600" />
              <div>
                <h2 className="font-display font-bold text-base text-zinc-900">Platform Commission Rates</h2>
                <p className="text-xs text-zinc-500">Adjust standard service match fees and subscription prices</p>
              </div>
            </div>
            {feesSaved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <Check className="w-4 h-4" /> Rates Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveFeeConfig} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">Under $25k Match Fee</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-bold">$</span>
                  <input
                    type="number"
                    value={smallServiceFee}
                    onChange={(e) => setSmallServiceFee(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">Over $25k Match Fee</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-bold">$</span>
                  <input
                    type="number"
                    value={largeServiceFee}
                    onChange={(e) => setLargeServiceFee(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1">Pro Sub Rate (/mo)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-bold">$</span>
                  <input
                    type="number"
                    value={contractorSubFee}
                    onChange={(e) => setContractorSubFee(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Contractor Contact Info Fee Status */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold flex items-center gap-1 text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Accepted Job Customer Contact Info Fee:
                </span>
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  $0.00 (100% FREE ON ACCEPTANCE)
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-800">
                <strong>Active Policy:</strong> Contractors are never charged a fee to access customer phone numbers, email addresses, or physical job sites once a proposal/bid is accepted by the homeowner.
              </p>
            </div>

            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <span>💡</span> Active Revenue Services Summary:
              </p>
              <p className="text-[11px] leading-relaxed text-amber-800">
                All platform revenue streams are active: Contractor Pro Memberships ($29/mo), Homeowner Job Priority Boosts ($9.99+), and Escrow Protection Commissions (3%).
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-3xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Settings className="w-4 h-4" /> Save Updated Platform Commission Policy
            </button>
          </form>
        </div>

        {/* System-Wide Broadcast Notification Center */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-600" />
              <div>
                <h2 className="font-display font-bold text-base text-zinc-900">Broadcast Push & Email Announcement</h2>
                <p className="text-xs text-zinc-500">Dispatch instant notifications to registered homeowners and pros</p>
              </div>
            </div>
            {broadcastSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <Check className="w-4 h-4" /> Broadcast Sent!
              </span>
            )}
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-1">Target Audience</label>
              <select
                value={broadcastTarget}
                onChange={(e: any) => setBroadcastTarget(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-red-500"
              >
                <option value="all">📢 All Users (Homeowners & Professional Contractors)</option>
                <option value="customers">🏡 Homeowner Customers Only</option>
                <option value="contractors">👨‍🔧 Professional Contractors Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-1">Broadcast Subject Title</label>
              <input
                type="text"
                placeholder="e.g. Special Founder Announcement: 0% Service Fees This Weekend!"
                value={broadcastSubject}
                onChange={(e) => setBroadcastSubject(e.target.value)}
                required
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-1">Notification Body</label>
              <textarea
                rows={3}
                placeholder="Write your announcement message..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                required
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-3xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" /> Dispatch Global System Broadcast
            </button>
          </form>
        </div>

      </div>

      {/* User Management & License Verification Hub */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-150 pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="font-display font-bold text-base text-zinc-900">User Management & Verification Hub</h2>
              <p className="text-xs text-zinc-500">Verify contractor insurance credentials, grant promo waivers, and manage accounts</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search user name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-amber-500 w-full sm:w-48"
            />
            <div className="flex bg-zinc-100 p-1 rounded-xl">
              <button
                onClick={() => setUserRoleFilter("all")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
                  userRoleFilter === "all" ? "bg-white text-zinc-900 shadow-3xs" : "text-zinc-600"
                }`}
              >
                All Users ({allUsers.length})
              </button>
              <button
                onClick={() => setUserRoleFilter("contractors")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
                  userRoleFilter === "contractors" ? "bg-white text-zinc-900 shadow-3xs" : "text-zinc-600"
                }`}
              >
                Pros ({contractorsList.length})
              </button>
              <button
                onClick={() => setUserRoleFilter("customers")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
                  userRoleFilter === "customers" ? "bg-white text-zinc-900 shadow-3xs" : "text-zinc-600"
                }`}
              >
                Homeowners ({customersList.length})
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-[10px] font-extrabold">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Role & Location</th>
                <th className="py-3 px-4">Insurance & Verification</th>
                <th className="py-3 px-4">Promo Status</th>
                <th className="py-3 px-4 text-right">Owner Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {filteredUsers.map((user, idx) => {
                const isVerified = verifiedBadges[user.id] || user.isPlatformOwner;
                const isWaived = waivedUsers[user.id] || user.isPlatformOwner;

                return (
                  <tr key={`${user.id}-${user.displayType}-${idx}`} className="hover:bg-amber-50/30 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                            {user.fullName}
                            {user.isPlatformOwner && (
                              <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">OWNER</span>
                            )}
                          </p>
                          <p className="text-[10px] text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.displayType === "Contractor" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {user.displayType}
                      </span>
                      <p className="text-[10px] text-zinc-500 mt-0.5">📍 {user.city}, {user.state} ({user.zipCode})</p>
                    </td>

                    <td className="py-3 px-4">
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Badge
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400 italic">Pending Verification</span>
                      )}
                      {user.insuranceName && (
                        <p className="text-[9px] text-zinc-500 truncate max-w-[150px]" title={user.insuranceName}>
                          📄 {user.insuranceName}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {isWaived ? (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                          🌟 0% Service Fee / Free Sub
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500">Standard Tier</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            toggleVerification(user.id);
                            setActionSuccessMsg(`Updated verification status for ${user.fullName}`);
                            setTimeout(() => setActionSuccessMsg(""), 3000);
                          }}
                          className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-[10px] font-bold transition"
                          title="Toggle verified insurance badge"
                        >
                          {isVerified ? "Unverify" : "Verify Badge"}
                        </button>
                        <button
                          onClick={() => {
                            toggleWaivePromo(user.id);
                            setActionSuccessMsg(`Toggled promo fee waiver for ${user.fullName}`);
                            setTimeout(() => setActionSuccessMsg(""), 3000);
                          }}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold transition shadow-3xs"
                          title="Toggle 0% promo fee waiver"
                        >
                          {isWaived ? "Revoke Promo" : "Grant Promo"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* System-Wide Escrow & Project Oversight */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="font-display font-bold text-base text-zinc-900">System Escrow & Dispute Resolution</h2>
              <p className="text-xs text-zinc-500">Platform owner overrides for held project deposits and contract statuses</p>
            </div>
          </div>
          <span className="bg-zinc-100 text-zinc-700 text-xs font-bold px-3 py-1 rounded-full">
            {projects.length} Total Platform Projects
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50 space-y-3 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    project.status === "accepted" || project.status === "completed"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    Status: {project.status}
                  </span>
                  <span className="font-mono font-bold text-sm text-zinc-900">${project.budget.toLocaleString()}</span>
                </div>
                <h3 className="font-bold text-xs text-zinc-900 line-clamp-1">{project.title}</h3>
                <p className="text-[11px] text-zinc-500">📍 {project.city}, {project.state} ({project.zipCode})</p>
                <p className="text-[10px] text-zinc-400 mt-1">Customer: <strong className="text-zinc-700">{project.customerFirstName} {project.customerLastName || ""}</strong></p>
              </div>

              <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    if (onUpdateProjectStatus) {
                      onUpdateProjectStatus(project.id, "completed");
                      setActionSuccessMsg(`Platform Owner force-released escrow funds for "${project.title}"!`);
                      setTimeout(() => setActionSuccessMsg(""), 3000);
                    }
                  }}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Force release held escrow funds to contractor"
                >
                  <Unlock className="w-3 h-3" /> Force Release Escrow
                </button>
                <button
                  onClick={() => {
                    if (onUpdateProjectStatus) {
                      onUpdateProjectStatus(project.id, "open");
                      setActionSuccessMsg(`Platform Owner reset project "${project.title}" to open status & issued customer refund.`);
                      setTimeout(() => setActionSuccessMsg(""), 3000);
                    }
                  }}
                  className="px-2.5 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Reset project and issue refund"
                >
                  <RefreshCw className="w-3 h-3" /> Reset / Refund
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}
    </div>
  );
}
