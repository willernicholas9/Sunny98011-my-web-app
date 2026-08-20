import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Crown,
  Zap,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  RefreshCw,
  Award,
  Layers,
  ChevronRight,
  Flame,
  AlertTriangle,
  Receipt,
  Download,
  Users,
  Building,
  Check,
  Smartphone,
  Send,
  Sliders,
  HelpCircle
} from "lucide-react";
import { ContractorUser, CustomerUser, Project, UserRole, MonetizationTransaction, PlatformMonetizationStats } from "../types";
import { monetizationService } from "../services/monetizationService";

interface MonetizationHubProps {
  currentUser: any;
  projects: Project[];
  contractors: ContractorUser[];
  onAlert: (msg: string) => void;
  onUpdateProject?: (updatedProject: Project) => void;
  onUpdateContractor?: (updatedContractor: ContractorUser) => void;
  onTriggerEmailLog?: (recipientEmail: string, recipientName: string, subject: string, body: string) => void;
}

export default function MonetizationHub({
  currentUser,
  projects,
  contractors,
  onAlert,
  onUpdateProject,
  onUpdateContractor,
  onTriggerEmailLog
}: MonetizationHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<"contractor_plans" | "job_boosts" | "lead_credits" | "owner_revenue">("contractor_plans");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [transactions, setTransactions] = useState<MonetizationTransaction[]>(monetizationService.getTransactions());
  const [stats, setStats] = useState<PlatformMonetizationStats>(monetizationService.getPlatformStats(projects, contractors));
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProjectToBoost, setSelectedProjectToBoost] = useState<string>(projects[0]?.id || "");
  const [selectedBoostTier, setSelectedBoostTier] = useState<"standard_boost" | "urgent_rush" | "vip_spotlight">("standard_boost");
  
  // Custom Card Input State for checkout
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");
  const [paymentSuccessNotice, setPaymentSuccessNotice] = useState<string | null>(null);

  // Subscribe to updates from monetizationService
  useEffect(() => {
    const unsub = monetizationService.subscribe(() => {
      setTransactions(monetizationService.getTransactions());
      setStats(monetizationService.getPlatformStats(projects, contractors));
    });
    return () => unsub();
  }, [projects, contractors]);

  // Handle Contractor Subscription checkout
  const handleSubscribeContractor = async (tier: "pro" | "enterprise") => {
    if (!currentUser) {
      onAlert("Please sign in or select a contractor profile to activate your Pro subscription.");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await monetizationService.subscribeContractor(
        currentUser,
        tier,
        billingCycle,
        cardNumber.slice(-4)
      );

      if (res.success) {
        setPaymentSuccessNotice(res.message);
        onAlert(res.message);

        // Update local user state
        if (onUpdateContractor) {
          const updated: ContractorUser = {
            ...currentUser,
            subscriptionActive: true,
            subscriptionTier: tier,
            subscriptionExpiresAt: new Date(Date.now() + 86400000 * (billingCycle === "annual" ? 365 : 30)).toISOString(),
            verifiedProBadge: true,
          };
          onUpdateContractor(updated);
        }

        if (onTriggerEmailLog) {
          onTriggerEmailLog(
            currentUser.email || "pro-contractor@example.com",
            currentUser.fullName || "Verified Contractor",
            `⭐ Welcome to Hot Spot ${tier.toUpperCase()} Membership!`,
            `Your ${tier.toUpperCase()} subscription is now active. Your profile now ranks at the top of local homeowner searches, receives instant priority dispatch alerts, and has 0% escrow surcharge.`
          );
        }
      }
    } catch (e: any) {
      onAlert(`Subscription error: ${e.message || "Failed to process payment"}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setPaymentSuccessNotice(null), 6000);
    }
  };

  // Handle Project Boosting checkout
  const handleBoostProject = async () => {
    const targetProject = projects.find(p => p.id === selectedProjectToBoost);
    if (!targetProject) {
      onAlert("Please select an active project to boost.");
      return;
    }

    setIsProcessing(true);
    try {
      const customerObj = currentUser || {
        id: targetProject.customerId || "cust-demo",
        fullName: `${targetProject.customerFirstName} ${targetProject.customerLastName}`.trim() || "Project Owner",
        role: "customer" as UserRole
      };

      const res = await monetizationService.boostProject(targetProject, customerObj, selectedBoostTier);

      if (res.success) {
        const msg = `🚀 Boom! "${targetProject.title}" has been boosted with priority spotlight ranking!`;
        setPaymentSuccessNotice(msg);
        onAlert(msg);

        if (onUpdateProject) {
          onUpdateProject(res.updatedProject);
        }

        if (onTriggerEmailLog) {
          onTriggerEmailLog(
            targetProject.customerEmail || "homeowner@example.com",
            targetProject.customerFirstName || "Valued Homeowner",
            `🚀 Your Project "${targetProject.title}" is Now Boosted!`,
            `We have upgraded your job with high-priority broadcast alerts. Contractors in your area are receiving priority push notifications.`
          );
        }
      }
    } catch (e: any) {
      onAlert(`Boost error: ${e.message || "Failed to process project boost"}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setPaymentSuccessNotice(null), 6000);
    }
  };

  // Handle Purchasing Lead Credits
  const handlePurchaseLeadCredits = async (packType: "small" | "medium" | "large") => {
    if (!currentUser) {
      onAlert("Please log in as a contractor to purchase lead credits.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await monetizationService.purchaseLeadCredits(currentUser, packType);
      if (res.success) {
        const msg = `⚡ Added +${res.creditsAdded} Direct Lead Contact Credits to your wallet!`;
        setPaymentSuccessNotice(msg);
        onAlert(msg);

        if (onUpdateContractor) {
          const updated: ContractorUser = {
            ...currentUser,
            leadCredits: (currentUser.leadCredits || 0) + res.creditsAdded
          };
          onUpdateContractor(updated);
        }
      }
    } catch (e: any) {
      onAlert(`Credit purchase error: ${e.message || "Failed to buy credits"}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setPaymentSuccessNotice(null), 6000);
    }
  };

  // Export transactions to CSV
  const handleExportCSV = () => {
    const headers = "TransactionID,Date,User,Role,ProductType,Title,Amount,Currency,Status\n";
    const rows = transactions.map(t => 
      `"${t.id}","${t.timestamp}","${t.userName}","${t.userRole}","${t.productType}","${t.title}",${t.amount},"${t.currency}","${t.status}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hotspot-monetization-ledger-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="monetization-hub-container">
      
      {/* Top Banner: Marketplace Revenue & Monetization Engine */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950 p-6 sm:p-8 text-white shadow-xl border border-amber-500/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wide uppercase">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Revenue Engine & Monetization Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Monetize Hot Spot Workshop
            </h1>
            <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Active live monetization: **Contractor Pro Subscriptions ($29/mo)**, **Homeowner Job Boosts ($9.99–$29.99)**, and **3% Escrow Platform Take-Rate**. Customer contact info on accepted projects is **100% FREE ($0 fee)**.
            </p>
          </div>

          {/* Quick Metrics Glance */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto shrink-0 font-mono">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] text-zinc-400 font-sans block uppercase font-bold">Platform Gross</span>
              <span className="text-lg sm:text-xl font-extrabold text-emerald-400">
                ${stats.platformGrossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] text-zinc-400 font-sans block uppercase font-bold">Monthly MRR</span>
              <span className="text-lg sm:text-xl font-extrabold text-amber-400">
                ${stats.monthlyRecurringRevenue.toLocaleString()}/mo
              </span>
            </div>
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-zinc-400 font-sans block uppercase font-bold">Pro Pros Active</span>
              <span className="text-lg sm:text-xl font-extrabold text-sky-400">
                {stats.activeProContractorsCount} Active
              </span>
            </div>
          </div>
        </div>

        {/* Live Service Status Indicator Bar */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-zinc-900/80 border border-emerald-500/40 rounded-xl p-2.5 flex items-center justify-between">
            <span className="text-zinc-300 font-medium">Contractor Pro Subscriptions:</span>
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> IN SERVICE ($29/mo)
            </span>
          </div>
          <div className="bg-zinc-900/80 border border-emerald-500/40 rounded-xl p-2.5 flex items-center justify-between">
            <span className="text-zinc-300 font-medium">Homeowner Job Boosts:</span>
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> IN SERVICE ($9.99+)
            </span>
          </div>
          <div className="bg-zinc-900/80 border border-emerald-500/40 rounded-xl p-2.5 flex items-center justify-between">
            <span className="text-zinc-300 font-medium">Escrow Platform Take-Rate:</span>
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> IN SERVICE (3%)
            </span>
          </div>
          <div className="bg-zinc-900/80 border border-amber-500/40 rounded-xl p-2.5 flex items-center justify-between">
            <span className="text-amber-200 font-medium">Accepted Job Contact Info:</span>
            <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-extrabold text-[10px]">
              ✨ 100% FREE ($0 FEE)
            </span>
          </div>
        </div>

        {/* Success Banner */}
        {paymentSuccessNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{paymentSuccessNotice}</span>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 overflow-x-auto" id="monetization-nav-tabs">
        <button
          type="button"
          onClick={() => setActiveSubTab("contractor_plans")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
            activeSubTab === "contractor_plans"
              ? "bg-amber-500 text-zinc-950 shadow-sm"
              : "text-zinc-600 hover:bg-zinc-100"
          }`}
          id="tab-contractor-plans"
        >
          <Crown className="w-4 h-4" />
          <span>💎 Contractor Pro & VIP Plans</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("job_boosts")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
            activeSubTab === "job_boosts"
              ? "bg-amber-500 text-zinc-950 shadow-sm"
              : "text-zinc-600 hover:bg-zinc-100"
          }`}
          id="tab-job-boosts"
        >
          <Flame className="w-4 h-4 text-amber-700" />
          <span>🚀 Homeowner Job Boosts ($9.99+)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("lead_credits")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
            activeSubTab === "lead_credits"
              ? "bg-amber-500 text-zinc-950 shadow-sm"
              : "text-zinc-600 hover:bg-zinc-100"
          }`}
          id="tab-lead-credits"
        >
          <Zap className="w-4 h-4" />
          <span>⚡ Lead Credits Wallet</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("owner_revenue")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
            activeSubTab === "owner_revenue"
              ? "bg-zinc-900 text-amber-300 shadow-sm border border-amber-400/40"
              : "text-zinc-600 hover:bg-zinc-100"
          }`}
          id="tab-owner-revenue"
        >
          <TrendingUp className="w-4 h-4" />
          <span>📊 Platform Owner Financial Ledger</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. CONTRACTOR PRO & ENTERPRISE SUBSCRIPTIONS */}
      {/* ========================================================================= */}
      {activeSubTab === "contractor_plans" && (
        <div className="space-y-6 animate-in fade-in" id="contractor-plans-view">
          {/* Billing Cycle Toggle */}
          <div className="flex justify-center items-center gap-3 py-2">
            <span className={`text-xs font-bold ${billingCycle === "monthly" ? "text-zinc-900" : "text-zinc-400"}`}>Monthly Billing</span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
              className="w-14 h-7 bg-zinc-200 rounded-full p-1 transition duration-200 ease-in-out relative cursor-pointer"
            >
              <div className={`w-5 h-5 bg-amber-500 rounded-full shadow-md transform transition duration-200 ease-in-out ${billingCycle === "annual" ? "translate-x-7" : "translate-x-0"}`} />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${billingCycle === "annual" ? "text-zinc-900" : "text-zinc-400"}`}>Annual Billing</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                SAVE 17% (2 MOS FREE)
              </span>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Free Tier */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-block bg-zinc-100 text-zinc-700 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                  Standard Tradesman
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-zinc-900">$0</span>
                    <span className="text-xs text-zinc-500 font-medium">/ month</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Basic public project bidding and directory profile.</p>
                </div>

                <div className="border-t border-zinc-100 pt-4 space-y-2.5 text-xs text-zinc-650">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Up to 3 active project bids at a time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Public contractor profile in directory</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Standard email notifications</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>No verified badge or search rank boost</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Standard 5% platform escrow fee</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 rounded-xl border border-zinc-300 text-zinc-400 font-bold text-xs bg-zinc-50 cursor-not-allowed"
                >
                  Current Default Tier
                </button>
              </div>
            </div>

            {/* Pro Tier (FEATURED) */}
            <div className="bg-gradient-to-b from-amber-500/10 via-white to-white border-2 border-amber-500 rounded-3xl p-6 shadow-lg relative flex flex-col justify-between">
              <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-200" />
                <span>MOST POPULAR & HIGHEST ROI</span>
              </div>

              <div className="space-y-4">
                <div className="inline-block bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                  Verified Contractor Pro
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-zinc-950">
                      ${billingCycle === "annual" ? "24.16" : "29"}
                    </span>
                    <span className="text-xs text-zinc-600 font-bold">
                      {billingCycle === "annual" ? "/ mo (billed $290/yr)" : "/ month"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">Get 5x more homeowner jobs with top priority rankings.</p>
                </div>

                <div className="border-t border-amber-200 pt-4 space-y-2.5 text-xs text-zinc-800 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold">⭐ Verified Pro Gold Badge on profile & bids</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>⚡ Instant 50-Mile Emergency SMS Dispatch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>🔥 Top 3 placement in local city searches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Unlimited simultaneous bids on open projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-emerald-700 font-bold">0% Escrow Surcharge (Keep 100% of bid earnings)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => handleSubscribeContractor("pro")}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  id="subscribe-pro-btn"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                  <span>Activate Contractor Pro (${billingCycle === "annual" ? "290/yr" : "29/mo"})</span>
                </button>
              </div>
            </div>

            {/* Enterprise Master Tradesman */}
            <div className="bg-zinc-950 text-white border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-block bg-zinc-800 text-amber-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-zinc-700">
                  👑 Enterprise Master Tradesman
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-white">
                      ${billingCycle === "annual" ? "82.50" : "99"}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">
                      {billingCycle === "annual" ? "/ mo (billed $990/yr)" : "/ month"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">For multi-crew contractors, general builders & trade firms.</p>
                </div>

                <div className="border-t border-zinc-800 pt-4 space-y-2.5 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-white font-bold">#1 Guaranteed Spotlight in your Metro Area</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>🤖 AI Automated Instant Quote Generator</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>50 Free Direct Lead Phone & Address Unlocks / mo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Same-day Instant Payout Direct Deposit to Bank</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Dedicated Platform Account Manager</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => handleSubscribeContractor("enterprise")}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  id="subscribe-enterprise-btn"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Upgrade to Enterprise (${billingCycle === "annual" ? "990/yr" : "99/mo"})</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. HOMEOWNER JOB BOOSTS ($9.99+) */}
      {/* ========================================================================= */}
      {activeSubTab === "job_boosts" && (
        <div className="space-y-6 animate-in fade-in" id="job-boosts-view">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-zinc-900">🚀 Boost Your Home Improvement Project</h2>
                <p className="text-xs text-zinc-500">Get bids within minutes by highlighting your job to verified contractors across your region.</p>
              </div>
              <span className="text-[11px] bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-bold self-start md:self-auto">
                ⚡ 94% of boosted projects get 3+ bids in under 2 hours
              </span>
            </div>

            {/* Select Project to Boost */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-700">Select Project to Upgrade:</label>
              <select
                value={selectedProjectToBoost}
                onChange={(e) => setSelectedProjectToBoost(e.target.value)}
                className="w-full sm:w-2/3 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs font-bold bg-white text-zinc-900 focus:ring-2 focus:ring-amber-500"
                id="select-project-boost"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} &bull; ${p.budget.toLocaleString()} &bull; {p.city}, {p.state} {p.isBoosted ? "⭐ [ALREADY BOOSTED]" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Boost Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Option 1: Standard Boost */}
              <div
                onClick={() => setSelectedBoostTier("standard_boost")}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                  selectedBoostTier === "standard_boost"
                    ? "border-amber-500 bg-amber-50/50 shadow-sm"
                    : "border-zinc-200 hover:border-zinc-300 bg-white"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">Standard</span>
                    <span className="text-lg font-black text-zinc-900">$9.99</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">Priority Project Spotlight</h3>
                  <p className="text-xs text-zinc-600">Pins project to the top of the feed with an attention-grabbing badge for 7 days.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-200/60 text-[11px] text-zinc-700 font-medium">
                  &bull; 3x contractor views guarantee
                </div>
              </div>

              {/* Option 2: Emergency Rush */}
              <div
                onClick={() => setSelectedBoostTier("urgent_rush")}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                  selectedBoostTier === "urgent_rush"
                    ? "border-red-500 bg-red-50/50 shadow-sm"
                    : "border-zinc-200 hover:border-zinc-300 bg-white"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-red-800 bg-red-100 px-2 py-0.5 rounded-full">⚡ 24/7 RUSH</span>
                    <span className="text-lg font-black text-red-600">$19.99</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">Emergency Contractor Dispatch</h3>
                  <p className="text-xs text-zinc-600">Immediate SMS & push notification dispatch to all 24/7 available pros within 50 miles.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-200/60 text-[11px] text-red-700 font-bold">
                  &bull; Under 30-min contractor response target
                </div>
              </div>

              {/* Option 3: VIP Spotlight */}
              <div
                onClick={() => setSelectedBoostTier("vip_spotlight")}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                  selectedBoostTier === "vip_spotlight"
                    ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                    : "border-zinc-200 hover:border-zinc-300 bg-white"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded-full">👑 VIP METRO</span>
                    <span className="text-lg font-black text-indigo-700">$29.99</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">VIP City-Wide Broadcast</h3>
                  <p className="text-xs text-zinc-600">Featured banner on homepage, email newsletter feature, and 100% Escrow Dispute Protection Warranty included.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-200/60 text-[11px] text-indigo-800 font-medium">
                  &bull; Full escrow warranty + maximum visibility
                </div>
              </div>

            </div>

            {/* Instant Boost Action */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-900 block">Fast 1-Click Payment</span>
                  <span className="text-[11px] text-zinc-500">Stripe Encrypted &bull; Instant Activation</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBoostProject}
                disabled={isProcessing}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                id="confirm-boost-project-btn"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4 text-amber-900" />}
                <span>
                  Boost Project Now (
                  {selectedBoostTier === "urgent_rush" ? "$19.99" : selectedBoostTier === "vip_spotlight" ? "$29.99" : "$9.99"}
                  )
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CONTRACTOR LEAD CREDITS WALLET */}
      {/* ========================================================================= */}
      {activeSubTab === "lead_credits" && (
        <div className="space-y-6 animate-in fade-in" id="lead-credits-view">
          
          {/* Pro-Contractor Friendly Policy Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-500/60 rounded-3xl p-5 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-2xl shrink-0 font-black shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    ACTIVE PLATFORM POLICY
                  </span>
                  <h3 className="font-display font-black text-sm text-emerald-300">
                    $0 Contractor Contact Fee on Accepted Projects
                  </h3>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  When a homeowner accepts your project bid or mutually agrees to work with you, <strong>all customer contact info (Phone, Email, and Address) unlocks 100% FREE with ZERO fee or credit deductions</strong>.
                </p>
              </div>
            </div>
            <div className="bg-emerald-900/80 border border-emerald-500/50 px-4 py-2 rounded-2xl text-center shrink-0 self-stretch md:self-auto flex md:flex-col justify-between items-center">
              <span className="text-[10px] font-bold text-emerald-300 uppercase">Accepted Job Fee</span>
              <span className="text-lg font-black text-white font-mono">$0.00 (FREE)</span>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-zinc-900">⚡ Optional Pre-Bid Direct Outreach Credits</h2>
                <p className="text-xs text-zinc-500">Optional credits for contractors who wish to bypass bidding and call homeowners before an agreement is signed.</p>
              </div>

              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 px-4 text-center sm:text-right shrink-0">
                <span className="text-[10px] text-amber-800 font-bold block uppercase tracking-wider">Your Credit Balance</span>
                <span className="text-xl font-black text-amber-900 font-mono">
                  {currentUser?.leadCredits || 0} Credits Available
                </span>
              </div>
            </div>

            {/* Credit Packs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Small Pack */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase">Starter Pack</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-zinc-900">$15</span>
                    <span className="text-xs text-zinc-500">($3.00 / lead)</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">5 Direct Contact Credits</h3>
                  <p className="text-xs text-zinc-500">Perfect for occasional weekend handymen looking for quick side jobs.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePurchaseLeadCredits("small")}
                  disabled={isProcessing}
                  className="mt-6 w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                  id="buy-small-credits-btn"
                >
                  Buy 5 Credits ($15)
                </button>
              </div>

              {/* Medium Pack (BEST VALUE) */}
              <div className="bg-amber-50/60 border-2 border-amber-500 rounded-2xl p-5 relative flex flex-col justify-between shadow-md">
                <div className="absolute -top-3 right-4 bg-amber-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  MOST POPULAR
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-amber-800 uppercase">Tradesman Pro Pack</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-zinc-900">$49</span>
                    <span className="text-xs text-zinc-600 font-bold">($2.45 / lead &bull; 18% OFF)</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">20 Direct Contact Credits</h3>
                  <p className="text-xs text-zinc-600">Great for active solo contractors looking to book jobs 2-3 weeks in advance.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePurchaseLeadCredits("medium")}
                  disabled={isProcessing}
                  className="mt-6 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs shadow-md transition cursor-pointer"
                  id="buy-medium-credits-btn"
                >
                  Buy 20 Credits ($49)
                </button>
              </div>

              {/* Large Pack */}
              <div className="bg-zinc-900 text-white border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase">Volume Contractor Pack</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">$99</span>
                    <span className="text-xs text-zinc-400">($1.98 / lead &bull; 34% OFF)</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">50 Direct Contact Credits</h3>
                  <p className="text-xs text-zinc-400">Ideal for growing trade companies running multiple vans and crews.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePurchaseLeadCredits("large")}
                  disabled={isProcessing}
                  className="mt-6 w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs shadow-sm transition cursor-pointer"
                  id="buy-large-credits-btn"
                >
                  Buy 50 Credits ($99)
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PLATFORM OWNER REVENUE & FINANCIAL LEDGER */}
      {/* ========================================================================= */}
      {activeSubTab === "owner_revenue" && (
        <div className="space-y-6 animate-in fade-in" id="owner-revenue-view">
          
          {/* Executive Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-bold">
                <span>Total Collected Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-2xl sm:text-3xl font-black text-zinc-950 block font-mono">
                ${stats.platformGrossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold inline-block">
                +100% Platform Retained
              </span>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-bold">
                <span>Contractor Subscriptions (MRR)</span>
                <Crown className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-2xl sm:text-3xl font-black text-amber-600 block font-mono">
                ${stats.monthlyRecurringRevenue.toLocaleString()}/mo
              </span>
              <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md font-bold inline-block">
                {stats.activeProContractorsCount} Paying Contractors
              </span>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-bold">
                <span>Escrow Platform Commissions</span>
                <ShieldCheck className="w-4 h-4 text-sky-600" />
              </div>
              <span className="text-2xl sm:text-3xl font-black text-sky-700 block font-mono">
                ${stats.escrowCommissionsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md font-bold inline-block">
                3% Automated Take Rate
              </span>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-bold">
                <span>Gross Marketplace Volume (GMV)</span>
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-2xl sm:text-3xl font-black text-indigo-900 block font-mono">
                ${stats.grossMerchandiseValue.toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md font-bold inline-block">
                Total Jobs Processed
              </span>
            </div>

          </div>

          {/* Transactions Table */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-zinc-900">Live Financial Ledger & Audit Trail</h3>
                <p className="text-xs text-zinc-500">Every subscription, boost fee, lead pack, and escrow commission processed.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition cursor-pointer"
                  id="export-csv-btn"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase text-[10px]">
                    <th className="pb-3 px-2">Transaction ID</th>
                    <th className="pb-3 px-2">Timestamp</th>
                    <th className="pb-3 px-2">User / Company</th>
                    <th className="pb-3 px-2">Product Stream</th>
                    <th className="pb-3 px-2 text-right">Amount</th>
                    <th className="pb-3 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-zinc-50/80 transition">
                      <td className="py-3 px-2 font-mono text-[11px] text-zinc-500">{tx.id}</td>
                      <td className="py-3 px-2 text-zinc-500">{new Date(tx.timestamp).toLocaleString()}</td>
                      <td className="py-3 px-2 font-bold text-zinc-900">{tx.userName}</td>
                      <td className="py-3 px-2">
                        <span className="inline-block bg-zinc-100 text-zinc-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {tx.title}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-black font-mono text-emerald-600 text-sm">
                        +${tx.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Paid</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
