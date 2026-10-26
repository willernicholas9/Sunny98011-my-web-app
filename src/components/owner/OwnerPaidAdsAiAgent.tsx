import React, { useState, useEffect, useMemo } from "react";
import {
  Bot,
  Sparkles,
  DollarSign,
  TrendingUp,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  Zap,
  Sliders,
  Search,
  Building,
  Phone,
  MapPin,
  CreditCard,
  ArrowUpRight,
  BarChart3,
  Download,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Eye,
  Award,
  Clock,
  Send,
  FileSpreadsheet,
  Check,
  Users,
  Target
} from "lucide-react";
import { VoiceInputButton } from "../VoiceInputButton";
import { monetizationService } from "../../services/monetizationService";
import { ContractorUser, AiManagedAdCampaign, MonetizationTransaction } from "../../types";

interface OwnerPaidAdsAiAgentProps {
  contractorsList: ContractorUser[];
  onTriggerEmailLog?: (log: { recipient: string; subject: string; body: string }) => void;
}

export default function OwnerPaidAdsAiAgent({
  contractorsList,
  onTriggerEmailLog,
}: OwnerPaidAdsAiAgentProps) {
  // Navigation sub-views inside AI Agent
  const [activeSubTab, setActiveSubTab] = useState<"concierge" | "revenue" | "campaigns" | "channels">("concierge");

  // Live Revenue & Transactions State
  const [platformStats, setPlatformStats] = useState(() => monetizationService.getPlatformStats());
  const [transactions, setTransactions] = useState<MonetizationTransaction[]>(() => monetizationService.getTransactions());
  const [activeCampaigns, setActiveCampaigns] = useState<AiManagedAdCampaign[]>(() => {
    try {
      const stored = localStorage.getItem("hsws_active_ai_campaigns");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    // Initial seeded campaigns for immediate high-fidelity experience
    return [
      {
        id: "camp-init-101",
        contractorId: "contractor-1",
        contractorName: "Michael Smith (Apex Landscaping)",
        trade: "Landscaping",
        targetZips: ["78701", "78704", "78745"],
        packageTier: "pro",
        status: "active",
        budgetSpent: 149.00,
        revenueGenerated: 1072.80,
        impressions: 16800,
        clicks: 1140,
        leadsGenerated: 32,
        roasMultiplier: 7.2,
        channels: ["Google Local Services", "Meta Ads", "Nextdoor Sponsored", "SMS Drips"],
        startDate: new Date(Date.now() - 86400000 * 6).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 24).toISOString(),
        headline: "Austin's Premier Drought-Tolerant Landscaping & Lawn Care — Free On-Site Estimates",
      },
      {
        id: "camp-init-102",
        contractorId: "owner-1",
        contractorName: "Nicholas Willer (Willer Construction)",
        trade: "General Handyman & Remodeling",
        targetZips: ["78701", "75201", "77001"],
        packageTier: "enterprise",
        status: "active",
        budgetSpent: 299.00,
        revenueGenerated: 2810.60,
        impressions: 48500,
        clicks: 3450,
        leadsGenerated: 85,
        roasMultiplier: 9.4,
        channels: ["Google LSA #1 Rank", "Meta High-Intent Video", "TikTok Local", "Nextdoor Gold", "Automated SMS Funnel"],
        startDate: new Date(Date.now() - 86400000 * 12).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 18).toISOString(),
        headline: "5-Star Licensed Remodeling & Repairs — Same-Day Consultation in Greater Austin & DFW",
      },
      {
        id: "camp-init-103",
        contractorId: "contractor-2",
        contractorName: "Marco Ramirez (CleanFlow Gutters)",
        trade: "Gutter Cleaning",
        targetZips: ["78701", "78759"],
        packageTier: "starter",
        status: "active",
        budgetSpent: 49.00,
        revenueGenerated: 235.20,
        impressions: 4200,
        clicks: 280,
        leadsGenerated: 8,
        roasMultiplier: 4.8,
        channels: ["Nextdoor", "Facebook Local Groups", "SMS Blast"],
        startDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        headline: "Storm Ready Gutter Cleaning & Guard Installation — $30 Off First Service",
      }
    ];
  });

  // Listen to monetization changes in real-time
  useEffect(() => {
    const unsub = monetizationService.subscribe(() => {
      setPlatformStats(monetizationService.getPlatformStats());
      setTransactions(monetizationService.getTransactions());
    });
    return unsub;
  }, []);

  // Save active campaigns back to localStorage
  const saveCampaigns = (camps: AiManagedAdCampaign[]) => {
    setActiveCampaigns(camps);
    try {
      localStorage.setItem("hsws_active_ai_campaigns", JSON.stringify(camps));
    } catch {}
  };

  // ==========================================
  // CONCIERGE (HELP BUSINESS PURCHASE ADS) STATE
  // ==========================================
  const [selectedContractorId, setSelectedContractorId] = useState<string>(
    contractorsList[0]?.id || "contractor-1"
  );
  const [isCustomBusiness, setIsCustomBusiness] = useState(false);
  const [customBusinessName, setCustomBusinessName] = useState("");
  const [customBusinessPhone, setCustomBusinessPhone] = useState("");
  const [customBusinessEmail, setCustomBusinessEmail] = useState("");

  const [selectedTrade, setSelectedTrade] = useState("Landscaping");
  const [targetZips, setTargetZips] = useState("78701, 78704, 78745, 78759");
  const [adGoalsPrompt, setAdGoalsPrompt] = useState(
    "Target homeowners looking for seasonal spring cleanups, irrigation audits, and free estimate bookings."
  );
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);

  // Generated Ad Copy & Variants
  const [headline, setHeadline] = useState("Austin's #1 Rated Landscaping & Lawn Care — Get Your Free Estimate in 60 Seconds");
  const [bodyCopy, setBodyCopy] = useState("Spring scheduling is now open! Licensed, insured, and background-checked local specialists ready to transform your property. Instant quote & 100% satisfaction guaranteed.");
  const [callToAction, setCallToAction] = useState("Claim Instant Free Quote");
  const [selectedTier, setSelectedTier] = useState<"starter" | "pro" | "enterprise" | "banner">("pro");

  // Purchasing & Execution State
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);
  const [purchaseStepMsg, setPurchaseStepMsg] = useState("");
  const [purchasedReceipt, setPurchasedReceipt] = useState<{
    campaignId: string;
    transactionId: string;
    amount: number;
    businessName: string;
    headline: string;
    tier: string;
    channels: string[];
    timestamp: string;
  } | null>(null);

  // Revenue Filter & Search
  const [revenueFilter, setRevenueFilter] = useState<"all" | "ads" | "subscriptions" | "escrow" | "other">("all");
  const [searchLedgerQuery, setSearchLedgerQuery] = useState("");

  // Automated Channels Engine Toggles
  const [channelToggles, setChannelToggles] = useState({
    googleLsa: true,
    nextdoor: true,
    metaLocal: true,
    instagramReels: true,
    smsBroadcast: true,
    weatherSurgeTrigger: true,
  });

  // Calculate Ad-Specific Revenue Breakdown
  const adRevenueMetrics = useMemo(() => {
    let totalAdRevenue = 0;
    let subscriptionRevenue = 0;
    let escrowRevenue = 0;
    let otherRevenue = 0;

    transactions.forEach((tx) => {
      if (tx.status === "succeeded") {
        if (
          tx.productType.startsWith("ai_ad_campaign") ||
          tx.productType === "sponsored_category_banner" ||
          tx.productType === "homeowner_urgent_ad_dispatch" ||
          tx.title.toLowerCase().includes("ad") ||
          tx.title.toLowerCase().includes("banner") ||
          tx.title.toLowerCase().includes("blitz")
        ) {
          totalAdRevenue += tx.amount;
        } else if (tx.productType.includes("subscription")) {
          subscriptionRevenue += tx.amount;
        } else if (tx.productType === "escrow_platform_take_rate") {
          escrowRevenue += tx.amount;
        } else {
          otherRevenue += tx.amount;
        }
      }
    });

    const totalActiveAdBudgets = activeCampaigns
      .filter((c) => c.status === "active")
      .reduce((sum, c) => sum + c.budgetSpent, 0);

    const totalClientRevenueDelivered = activeCampaigns.reduce(
      (sum, c) => sum + c.revenueGenerated,
      0
    );

    const averageRoas =
      activeCampaigns.length > 0
        ? (
            activeCampaigns.reduce((sum, c) => sum + c.roasMultiplier, 0) /
            activeCampaigns.length
          ).toFixed(1)
        : "6.8";

    return {
      totalAdRevenue,
      subscriptionRevenue,
      escrowRevenue,
      otherRevenue,
      totalActiveAdBudgets,
      totalClientRevenueDelivered,
      averageRoas,
    };
  }, [transactions, activeCampaigns]);

  // Selected Business Details
  const activeBusinessUser = useMemo(() => {
    if (isCustomBusiness) {
      return {
        id: `custom-biz-${Date.now()}`,
        fullName: customBusinessName || "Local Premier Services",
        company: customBusinessName || "Local Premier Services",
        phone: customBusinessPhone || "512-555-0199",
        email: customBusinessEmail || "contact@localbusiness.com",
        city: "Austin",
        zipCode: "78701",
        trades: [selectedTrade],
        role: "contractor" as const,
      } as any as ContractorUser;
    }
    const found = contractorsList.find((c) => c.id === selectedContractorId);
    return found || contractorsList[0];
  }, [
    isCustomBusiness,
    customBusinessName,
    customBusinessPhone,
    customBusinessEmail,
    selectedContractorId,
    selectedTrade,
    contractorsList,
  ]);

  // AI Ad Creative Generator (generates realistic high-converting copy based on trade and voice prompt)
  const handleGenerateAiCreative = () => {
    setIsGeneratingCopy(true);
    setTimeout(() => {
      const bizName = isCustomBusiness
        ? customBusinessName || "Top Rated Local Pros"
        : activeBusinessUser?.company || activeBusinessUser?.fullName || "Verified Local Specialists";

      const templates: Record<string, { headlines: string[]; bodies: string[]; cta: string }> = {
        Landscaping: {
          headlines: [
            `${bizName} — Professional Lawn Care & Landscape Design with 100% Satisfaction`,
            `Transform Your Curb Appeal: Verified Landscaping & Tree Specialists in Your Zip`,
            `Spring Booking Alert: Get $45 Off Any Full Yard Renovation with ${bizName}`,
          ],
          bodies: [
            `Top-rated by local homeowners! We provide comprehensive landscape architecture, drought-tolerant turf, smart irrigation, and weekly maintenance. Book directly with zero hidden fees.`,
            `Don't settle for unverified crews. ${bizName} brings 5-star equipment, licensed crews, and verified escrow payment protection. Schedule your priority inspection now.`,
          ],
          cta: "Claim Free Estimate & Schedule",
        },
        Roofing: {
          headlines: [
            `${bizName} — 24/7 Storm Damage & Hail Inspection Specialists`,
            `Protect Your Home with Austin's Premier Certified Roofing Team`,
            `Zero-Deductible Assistance & Free Thermal Drone Roof Scan`,
          ],
          bodies: [
            `Severe storms in your area? Ensure your roof warranty is intact. Comprehensive leak detection, insurance paperwork support, and premium shingle warranties.`,
            `Certified Class-4 impact shingles, seamless gutter integration, and master craftsman installation. Call today for a 15-minute express diagnostic.`,
          ],
          cta: "Schedule Instant Roof Inspection",
        },
        HVAC: {
          headlines: [
            `${bizName} — Emergency AC & Heating Diagnostic & Repair`,
            `Beat The Heat: 24-Point AC Precision Tune-Up for Just $79`,
            `Fast Same-Day HVAC Dispatch — High Efficiency System Upgrades`,
          ],
          bodies: [
            `Stay comfortable year-round with certified EPA technicians. We diagnose compressor issues, freon leaks, and airflow imbalances with zero markup surprises.`,
            `Financing available as low as 0% APR. Trusted by over 1,200 local homeowners with certified 10-year parts & labor warranties.`,
          ],
          cta: "Book Emergency AC Service",
        },
        Plumbing: {
          headlines: [
            `${bizName} — Rapid Response Plumbing, Water Heaters & Leak Repair`,
            `Emergency Drain Clearing & Tankless Water Heater Installation`,
            `Austin's Most Trusted Master Plumbers — No Overtime Charges`,
          ],
          bodies: [
            `Burst pipes, clogged mainlines, or failing water heaters? Our licensed master plumbers arrive equipped to solve your issue on the very first visit.`,
            `Transparent flat-rate pricing and complete video camera inspection. Trusted for over a decade with thousands of 5-star neighborhood recommendations.`,
          ],
          cta: "Dispatch Master Plumber Now",
        },
      };

      const matched = templates[selectedTrade] || {
        headlines: [
          `${bizName} — 5-Star Certified ${selectedTrade} Experts in Your Neighborhood`,
          `Fast, Guaranteed ${selectedTrade} Services — Free Quotes in Minutes`,
          `Top-Rated Local Pros: Reliable ${selectedTrade} with Escrow Protection`,
        ],
        bodies: [
          `Get your job completed right the first time by verified local craftsmen. Fully insured, transparent pricing, and trusted by homeowners across your metro area.`,
          `Prompt arrival, professional estimates, and direct communication. Schedule online in 60 seconds with no commitment required.`,
        ],
        cta: "Request Instant Free Quote",
      };

      const randHeadline = matched.headlines[Math.floor(Math.random() * matched.headlines.length)];
      const randBody = matched.bodies[Math.floor(Math.random() * matched.bodies.length)];

      setHeadline(randHeadline);
      setBodyCopy(randBody);
      setCallToAction(matched.cta);
      setIsGeneratingCopy(false);
    }, 600);
  };

  // Voice transcript handler for prompt
  const handleVoiceTranscript = (spokenText: string) => {
    setAdGoalsPrompt((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
  };

  // Purchase & Launch Ad Campaign Execution Flow
  const handlePurchaseCampaign = async () => {
    if (!activeBusinessUser) return;
    setIsProcessingPurchase(true);

    try {
      if (selectedTier === "banner") {
        setPurchaseStepMsg("Reserving top directory sponsorship slot...");
        await new Promise((r) => setTimeout(r, 600));
        setPurchaseStepMsg("Processing $39.00 payment via Stripe...");
        const res = await monetizationService.purchaseCategoryBanner(
          activeBusinessUser,
          selectedTrade,
          1
        );
        setPurchasedReceipt({
          campaignId: res.transaction.referenceId || `ban-${Date.now()}`,
          transactionId: res.transaction.id,
          amount: 39.0,
          businessName: activeBusinessUser.company || activeBusinessUser.fullName,
          headline: `Top Category Sponsor: ${selectedTrade}`,
          tier: "Sponsored Banner ($39/wk)",
          channels: ["Category Top Banner", "City Directory Spotlight"],
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        setPurchaseStepMsg("Configuring AI ad channels & geo-targeting...");
        await new Promise((r) => setTimeout(r, 600));
        setPurchaseStepMsg("Provisioning Google LSA, Nextdoor, and Meta tags...");
        await new Promise((r) => setTimeout(r, 600));
        setPurchaseStepMsg("Securing Stripe card authorization...");

        const res = await monetizationService.launchAiAdCampaign(
          activeBusinessUser,
          selectedTier,
          selectedTrade,
          targetZips,
          headline
        );

        // Prepend to active campaigns list
        const updated = [res.campaign, ...activeCampaigns];
        saveCampaigns(updated);

        setPurchasedReceipt({
          campaignId: res.campaign.id,
          transactionId: res.transaction.id,
          amount: res.transaction.amount,
          businessName: activeBusinessUser.company || activeBusinessUser.fullName,
          headline: res.campaign.headline,
          tier: selectedTier.toUpperCase(),
          channels: res.campaign.channels,
          timestamp: new Date().toLocaleTimeString(),
        });

        if (onTriggerEmailLog) {
          onTriggerEmailLog({
            recipient: activeBusinessUser.email || "client@hsws.com",
            subject: `[Ad Blitz Live] Campaign Activated for ${activeBusinessUser.company || activeBusinessUser.fullName}`,
            body: `Your AI-managed ad campaign is officially live on ${res.campaign.channels.join(", ")} targeting ZIPs: ${targetZips}. Receipt: $${res.transaction.amount}. Projected ROAS: ${res.campaign.roasMultiplier}x.`,
          });
        }
      }
    } catch (e) {
      console.error("Ad campaign launch failed:", e);
    } finally {
      setIsProcessingPurchase(false);
      setPurchaseStepMsg("");
    }
  };

  // Export Transactions Ledger to CSV
  const handleExportCsv = () => {
    const headers = ["Transaction ID", "Date", "User / Business", "Role", "Product Type", "Amount ($)", "Status", "Payment Method", "Reference"];
    const rows = filteredTransactions.map((t) => [
      t.id,
      new Date(t.timestamp).toLocaleDateString(),
      `"${t.userName.replace(/"/g, '""')}"`,
      t.userRole,
      `"${t.title.replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      t.status,
      t.paymentMethod,
      t.referenceId || "N/A",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HSWS_Revenue_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Category filter
      if (revenueFilter === "ads") {
        const isAd =
          t.productType.startsWith("ai_ad_campaign") ||
          t.productType === "sponsored_category_banner" ||
          t.productType === "homeowner_urgent_ad_dispatch" ||
          t.title.toLowerCase().includes("ad") ||
          t.title.toLowerCase().includes("banner") ||
          t.title.toLowerCase().includes("blitz");
        if (!isAd) return false;
      } else if (revenueFilter === "subscriptions") {
        if (!t.productType.includes("subscription")) return false;
      } else if (revenueFilter === "escrow") {
        if (t.productType !== "escrow_platform_take_rate") return false;
      } else if (revenueFilter === "other") {
        if (
          t.productType.startsWith("ai_ad_campaign") ||
          t.productType === "sponsored_category_banner" ||
          t.productType.includes("subscription") ||
          t.productType === "escrow_platform_take_rate"
        )
          return false;
      }

      // Query filter
      if (searchLedgerQuery.trim()) {
        const q = searchLedgerQuery.toLowerCase();
        return (
          t.id.toLowerCase().includes(q) ||
          t.userName.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.amount.toString().includes(q)
        );
      }

      return true;
    });
  }, [transactions, revenueFilter, searchLedgerQuery]);

  // Pause / Resume Campaign
  const handleToggleCampaignStatus = (campaignId: string) => {
    const updated = activeCampaigns.map((c) => {
      if (c.id === campaignId) {
        return {
          ...c,
          status: (c.status === "active" ? "paused" : "active") as any,
        };
      }
      return c;
    });
    saveCampaigns(updated);
  };

  // Boost Campaign Allocation by +$25
  const handleBoostCampaignBudget = async (campaign: AiManagedAdCampaign) => {
    const boostAmount = 25.0;
    try {
      const tx = monetizationService.recordTransaction({
        userId: campaign.contractorId,
        userName: campaign.contractorName,
        userRole: "contractor",
        productType: "ai_ad_campaign_starter",
        title: `AI Ad Budget Surge Boost (+$25 for ${campaign.trade})`,
        amount: boostAmount,
        currency: "USD",
        status: "succeeded",
        paymentMethod: "stripe_card",
      });

      const updated = activeCampaigns.map((c) => {
        if (c.id === campaign.id) {
          const newBudget = c.budgetSpent + boostAmount;
          return {
            ...c,
            budgetSpent: newBudget,
            impressions: c.impressions + 2100,
            clicks: c.clicks + 140,
            leadsGenerated: c.leadsGenerated + 4,
            revenueGenerated: c.revenueGenerated + Math.round(boostAmount * c.roasMultiplier),
          };
        }
        return c;
      });
      saveCampaigns(updated);

      if (onTriggerEmailLog) {
        onTriggerEmailLog({
          recipient: "ad-ops@hsws.com",
          subject: `[Budget Surge Active] +$25 Boost Allocated to ${campaign.contractorName}`,
          body: `Owner added $25 budget surge for campaign ${campaign.id}. New budget: $${(campaign.budgetSpent + boostAmount).toFixed(2)}.`,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6" id="owner-paid-ads-ai-agent-container">
      {/* =========================================================================
          TOP EXECUTIVE REVENUE & AD HUD BANNER
         ========================================================================= */}
      <div className="bg-gradient-to-br from-zinc-900 via-neutral-900 to-black text-white p-6 rounded-3xl border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-red-900/40">
                <Bot className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black font-display tracking-tight text-white">
                    Owner AI Paid Advertisements & Revenue Agent
                  </h2>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live 24/7 Engine
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Autonomous Multi-Channel Ad Concierge & Real-Time Financial Ledger
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center">
              <button
                type="button"
                onClick={() => setActiveSubTab("concierge")}
                className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-red-950/50 transition cursor-pointer"
                id="btn-quick-purchase-ad"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>+ Help Business Purchase Ad</span>
              </button>
            </div>
          </div>

          {/* 4 Core Financial Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Gross Platform Revenue */}
            <div className="bg-zinc-850/80 border border-zinc-750 p-4 rounded-2xl relative overflow-hidden group hover:border-amber-500/50 transition">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-1">
                <span>Total Gross Revenue</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight" id="live-total-gross-revenue">
                ${platformStats.platformGrossRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold mt-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+100% Real-Time Platform Cash</span>
              </div>
            </div>

            {/* Paid Ad Revenue */}
            <div className="bg-zinc-850/80 border border-zinc-750 p-4 rounded-2xl relative overflow-hidden group hover:border-red-500/50 transition">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-1">
                <span>Paid Ad Revenue</span>
                <Megaphone className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight" id="live-paid-ad-revenue">
                ${adRevenueMetrics.totalAdRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-zinc-400 font-medium mt-2 flex items-center justify-between">
                <span>{activeCampaigns.length} Active Campaigns</span>
                <span className="text-amber-300 font-bold">{adRevenueMetrics.averageRoas}x Avg ROAS</span>
              </div>
            </div>

            {/* Monthly Recurring Subscriptions (MRR) */}
            <div className="bg-zinc-850/80 border border-zinc-750 p-4 rounded-2xl relative overflow-hidden group hover:border-blue-500/50 transition">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-1">
                <span>Monthly Recurring (MRR)</span>
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight" id="live-mrr-revenue">
                ${platformStats.monthlyRecurringRevenue.toFixed(2)}
              </div>
              <div className="text-[11px] text-zinc-400 font-medium mt-2 flex items-center justify-between">
                <span>Contractor Pro ($29.99/mo)</span>
                <span className="text-blue-300 font-bold">Uncapped</span>
              </div>
            </div>

            {/* Escrow Commissions */}
            <div className="bg-zinc-850/80 border border-zinc-750 p-4 rounded-2xl relative overflow-hidden group hover:border-emerald-500/50 transition">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-1">
                <span>Escrow Commissions (3%)</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight" id="live-escrow-revenue">
                ${adRevenueMetrics.escrowRevenue.toFixed(2)}
              </div>
              <div className="text-[11px] text-zinc-400 font-medium mt-2 flex items-center justify-between">
                <span>Job Escrow Take</span>
                <span className="text-emerald-300 font-bold">3.0% Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SUB-TAB NAVIGATION
         ========================================================================= */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab("concierge")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "concierge"
              ? "bg-red-600 text-white shadow-md font-black"
              : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
          }`}
          id="tab-btn-ad-concierge"
        >
          <Sparkles className="w-4 h-4" />
          <span>⚡ Help Business Purchase Ads (AI Concierge)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("revenue")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "revenue"
              ? "bg-amber-600 text-white shadow-md font-black"
              : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
          }`}
          id="tab-btn-revenue-ledger"
        >
          <DollarSign className="w-4 h-4" />
          <span>💰 Live Revenue & Transactions Ledger</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("campaigns")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "campaigns"
              ? "bg-blue-600 text-white shadow-md font-black"
              : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
          }`}
          id="tab-btn-active-campaigns"
        >
          <BarChart3 className="w-4 h-4" />
          <span>📊 Active Campaigns & ROAS ({activeCampaigns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("channels")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "channels"
              ? "bg-zinc-900 text-white shadow-md font-black"
              : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
          }`}
          id="tab-btn-channels-engine"
        >
          <Sliders className="w-4 h-4" />
          <span>⚙️ Channels & Weather Surge Engine</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: AI BUSINESS AD PURCHASE CONCIERGE
         ========================================================================= */}
      {activeSubTab === "concierge" && (
        <div className="space-y-6 animate-fade-in" id="ad-purchase-concierge-view">
          {/* Purchase Receipt Confirmation Modal / Banner if just purchased */}
          {purchasedReceipt && (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 shadow-xl animate-in zoom-in-95 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-xl shadow-md">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="bg-emerald-200 text-emerald-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Campaign Activated & Paid Succeeded
                    </span>
                    <h3 className="text-lg font-black text-zinc-900 font-display mt-0.5">
                      Ad Package Purchased for {purchasedReceipt.businessName}
                    </h3>
                    <p className="text-xs text-zinc-600">
                      Receipt ID: <code className="font-mono font-bold text-zinc-800">{purchasedReceipt.transactionId}</code> • Time: {purchasedReceipt.timestamp}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPurchasedReceipt(null)}
                  className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-emerald-200 text-xs">
                <div>
                  <span className="text-zinc-500 block font-semibold">Tier & Fee</span>
                  <span className="font-black text-emerald-700 text-sm">
                    {purchasedReceipt.tier} • ${purchasedReceipt.amount.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block font-semibold">Channels Deployed</span>
                  <span className="font-bold text-zinc-800">
                    {purchasedReceipt.channels.join(", ")}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block font-semibold">Campaign Headline</span>
                  <span className="font-medium text-zinc-800 truncate block">
                    "{purchasedReceipt.headline}"
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-xs text-emerald-800 font-medium">
                  🎉 Platform gross revenue has increased by <strong>${purchasedReceipt.amount.toFixed(2)}</strong>. Client notified via automated email confirmation.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab("campaigns")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View in Active Monitor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPurchasedReceipt(null)}
                    className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form & Targeting (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-900 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
                  <Bot className="w-3.5 h-3.5 text-red-600" />
                  AI Business Onboarding Concierge
                </div>
                <h3 className="text-xl font-black text-zinc-900 font-display">
                  Set Up & Purchase Business Ad Campaign
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Select an onboarded contractor or enter a new local business client. The AI will generate copy, target high-intent zip codes, and dispatch paid ads across Google, Nextdoor, and Meta.
                </p>
              </div>

              {/* Step 1: Business Picker */}
              <div className="space-y-3 border-t border-zinc-150 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-amber-600" />
                    1. Select Target Business
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomBusiness(!isCustomBusiness)}
                    className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                  >
                    {isCustomBusiness ? "← Pick Registered Contractor" : "+ Custom Client / External Business"}
                  </button>
                </div>

                {!isCustomBusiness ? (
                  <select
                    value={selectedContractorId}
                    onChange={(e) => {
                      setSelectedContractorId(e.target.value);
                      const found = contractorsList.find((c) => c.id === e.target.value);
                      if (found && found.trades && found.trades[0]) {
                        setSelectedTrade(found.trades[0]);
                      }
                    }}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 text-xs font-bold text-zinc-800 focus:ring-2 focus:ring-red-500 focus:bg-white"
                    id="select-business-contractor"
                  >
                    {contractorsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company || c.fullName} — {c.trades?.join(", ") || "General Contractor"} ({c.city || "Austin"}, {c.zipCode || "78701"})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-zinc-50 p-3 rounded-2xl border border-zinc-200">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Business Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Austin Master Electric"
                        value={customBusinessName}
                        onChange={(e) => setCustomBusinessName(e.target.value)}
                        className="w-full bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Phone Number</label>
                      <input
                        type="text"
                        placeholder="512-555-0199"
                        value={customBusinessPhone}
                        onChange={(e) => setCustomBusinessPhone(e.target.value)}
                        className="w-full bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Email / Receipt</label>
                      <input
                        type="email"
                        placeholder="contact@business.com"
                        value={customBusinessEmail}
                        onChange={(e) => setCustomBusinessEmail(e.target.value)}
                        className="w-full bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Trade & ZIP Targeting */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-150 pt-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    2. Primary Trade / Category
                  </label>
                  <select
                    value={selectedTrade}
                    onChange={(e) => setSelectedTrade(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-800 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Landscaping">Landscaping & Yard Care</option>
                    <option value="Roofing">Roofing & Storm Repairs</option>
                    <option value="Plumbing">Plumbing & Drain Services</option>
                    <option value="HVAC">HVAC & AC Precision Tune-Ups</option>
                    <option value="Electrical">Electrical & Panel Upgrades</option>
                    <option value="Remodeling">Kitchen & Bathroom Remodeling</option>
                    <option value="Gutter Cleaning">Gutter Cleaning & Guards</option>
                    <option value="Painting">Interior & Exterior Painting</option>
                    <option value="General Handyman">General Handyman & Repairs</option>
                    <option value="Solar">Solar & Battery Storage</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                      Target ZIP Codes
                    </label>
                    <button
                      type="button"
                      onClick={() => setTargetZips("78701, 78704, 78745, 78759, 75201, 77001")}
                      className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      Preset Central
                    </button>
                  </div>
                  <input
                    type="text"
                    value={targetZips}
                    onChange={(e) => setTargetZips(e.target.value)}
                    placeholder="78701, 78704, 78745..."
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-zinc-800 focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Step 3: Voice-to-Text Input & Ad Objective */}
              <div className="border-t border-zinc-150 pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 text-red-600" />
                    3. Ad Objective & Special Offer
                  </label>
                  <span className="text-[11px] text-zinc-500">Speak or type requirements</span>
                </div>

                <div className="relative">
                  <textarea
                    rows={3}
                    value={adGoalsPrompt}
                    onChange={(e) => setAdGoalsPrompt(e.target.value)}
                    placeholder="Describe the offer, special discount, or focus for the ad campaign..."
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 pr-12 text-xs text-zinc-800 focus:ring-2 focus:ring-red-500 focus:bg-white resize-none"
                    id="ad-prompt-textarea"
                  />
                  {/* Microphone Voice-to-Text Button */}
                  <div className="absolute right-2.5 bottom-2.5">
                    <VoiceInputButton
                      onTranscript={handleVoiceTranscript}
                      size="sm"
                      variant="ghost"
                      title="Speak ad objective (Web Speech API)"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                    🎙️ Click the microphone icon to speak your ad instructions.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateAiCreative}
                    disabled={isGeneratingCopy}
                    className="bg-zinc-900 hover:bg-black text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isGeneratingCopy ? "animate-spin" : ""}`} />
                    <span>{isGeneratingCopy ? "Generating Copy..." : "AI Generate Creative"}</span>
                  </button>
                </div>
              </div>

              {/* Step 4: Tier Selection */}
              <div className="border-t border-zinc-150 pt-4 space-y-3">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  4. Select Paid Ad Package Tier
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Starter Tier */}
                  <div
                    onClick={() => setSelectedTier("starter")}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer relative ${
                      selectedTier === "starter"
                        ? "border-red-600 bg-red-50/50"
                        : "border-zinc-200 hover:border-zinc-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">Starter 7-Day</span>
                        <h4 className="text-sm font-black text-zinc-900">Hyper-Local Blitz</h4>
                      </div>
                      <span className="text-base font-black text-zinc-900 font-mono">$49</span>
                    </div>
                    <ul className="text-[11px] text-zinc-600 mt-2 space-y-1">
                      <li>• ~4,200 Targeted Impressions</li>
                      <li>• ~8 Qualified Lead Inquiries</li>
                      <li>• Nextdoor & Facebook Groups</li>
                      <li className="font-bold text-emerald-700">• 4.8x Projected ROAS</li>
                    </ul>
                  </div>

                  {/* Pro Tier (Popular) */}
                  <div
                    onClick={() => setSelectedTier("pro")}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer relative ${
                      selectedTier === "pro"
                        ? "border-amber-600 bg-amber-50/50 shadow-md"
                        : "border-zinc-200 hover:border-zinc-300 bg-white"
                    }`}
                  >
                    <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Most Popular
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">Pro 30-Day</span>
                        <h4 className="text-sm font-black text-zinc-900">Multi-Channel Growth</h4>
                      </div>
                      <span className="text-base font-black text-zinc-900 font-mono">$149</span>
                    </div>
                    <ul className="text-[11px] text-zinc-600 mt-2 space-y-1">
                      <li>• ~16,800 Targeted Impressions</li>
                      <li>• ~32 Qualified Lead Inquiries</li>
                      <li>• Google LSA + Meta + Nextdoor</li>
                      <li className="font-bold text-emerald-700">• 7.2x Projected ROAS</li>
                    </ul>
                  </div>

                  {/* Enterprise Tier */}
                  <div
                    onClick={() => setSelectedTier("enterprise")}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer relative ${
                      selectedTier === "enterprise"
                        ? "border-purple-600 bg-purple-50/50"
                        : "border-zinc-200 hover:border-zinc-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">Enterprise 30-Day</span>
                        <h4 className="text-sm font-black text-zinc-900">Metro Market Dominance</h4>
                      </div>
                      <span className="text-base font-black text-zinc-900 font-mono">$299</span>
                    </div>
                    <ul className="text-[11px] text-zinc-600 mt-2 space-y-1">
                      <li>• ~48,500 Targeted Impressions</li>
                      <li>• ~85 Guaranteed Local Leads</li>
                      <li>• Google #1 Rank + TikTok + SMS</li>
                      <li className="font-bold text-emerald-700">• 9.4x Projected ROAS</li>
                    </ul>
                  </div>

                  {/* Sponsored Category Banner */}
                  <div
                    onClick={() => setSelectedTier("banner")}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer relative ${
                      selectedTier === "banner"
                        ? "border-blue-600 bg-blue-50/50"
                        : "border-zinc-200 hover:border-zinc-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">Directory Sponsor</span>
                        <h4 className="text-sm font-black text-zinc-900">Top Category Banner</h4>
                      </div>
                      <span className="text-base font-black text-zinc-900 font-mono">$39/wk</span>
                    </div>
                    <ul className="text-[11px] text-zinc-600 mt-2 space-y-1">
                      <li>• Pinned Header in {selectedTrade}</li>
                      <li>• Direct Click-Through to Phone</li>
                      <li>• Verified Gold Badge Placement</li>
                      <li className="font-bold text-emerald-700">• High Local Visibility</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 5: Checkout & Launch Button */}
              <div className="border-t border-zinc-150 pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-600">
                  <span>Target Business:</span>
                  <strong className="text-zinc-900">
                    {isCustomBusiness
                      ? customBusinessName || "External Client"
                      : activeBusinessUser?.company || activeBusinessUser?.fullName}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-600">
                  <span>Selected Package:</span>
                  <strong className="text-zinc-900 uppercase">
                    {selectedTier === "starter" && "Starter Blitz ($49.00)"}
                    {selectedTier === "pro" && "Pro Growth ($149.00)"}
                    {selectedTier === "enterprise" && "Enterprise Dominance ($299.00)"}
                    {selectedTier === "banner" && "Top Banner Sponsor ($39.00)"}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={handlePurchaseCampaign}
                  disabled={isProcessingPurchase}
                  className="w-full bg-gradient-to-r from-red-600 via-amber-600 to-amber-700 hover:from-red-700 hover:to-amber-800 text-white font-black py-4 rounded-2xl text-sm transition shadow-xl shadow-red-950/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  id="btn-authorize-and-launch-ad"
                >
                  {isProcessingPurchase ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>{purchaseStepMsg || "Processing & Provisioning..."}</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>
                        Authorize & Launch Paid Campaign (
                        {selectedTier === "starter" && "$49.00"}
                        {selectedTier === "pro" && "$149.00"}
                        {selectedTier === "enterprise" && "$299.00"}
                        {selectedTier === "banner" && "$39.00"}
                        )
                      </span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-zinc-400">
                  💳 Billed via Stripe • Immediate revenue sync to platform ledger • No existing platform fee raised
                </p>
              </div>
            </div>

            {/* Right Column: Live Ad Creative Mockup Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-zinc-900 text-white p-5 rounded-3xl border border-zinc-750 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                      Live Multi-Channel Creative Preview
                    </h4>
                  </div>
                  <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full font-bold">
                    Target: {targetZips.split(",")[0] || "78701"}
                  </span>
                </div>

                {/* Google LSA Card Mockup */}
                <div className="bg-white text-zinc-900 p-4 rounded-2xl shadow-md border border-zinc-200 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm">
                        Google Guaranteed
                      </span>
                      <span className="text-[10px] text-zinc-500 font-bold">Sponsored</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-black flex items-center gap-0.5">
                      ★ 4.9 (120+ reviews)
                    </span>
                  </div>

                  <h5 className="text-xs font-extrabold text-blue-700 hover:underline cursor-pointer leading-tight">
                    {headline}
                  </h5>
                  <p className="text-[11px] text-zinc-600 line-clamp-3">
                    {bodyCopy}
                  </p>

                  <div className="pt-2 border-t border-zinc-150 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1 text-emerald-800 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Licensed & Verified Pro</span>
                    </div>
                    <span className="bg-amber-100 text-amber-900 font-black px-2.5 py-1 rounded-lg text-[10px]">
                      {callToAction}
                    </span>
                  </div>
                </div>

                {/* Nextdoor Sponsored Post Mockup */}
                <div className="bg-white text-zinc-900 p-4 rounded-2xl shadow-md border border-zinc-200 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        N
                      </div>
                      <div>
                        <div className="text-[11px] font-black text-zinc-900">
                          {isCustomBusiness
                            ? customBusinessName || "Local Verified Pro"
                            : activeBusinessUser?.company || activeBusinessUser?.fullName}
                        </div>
                        <div className="text-[9px] text-zinc-400">Sponsored • In Your Neighborhood</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-bold">
                      {selectedTrade}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-700">
                    "{bodyCopy}"
                  </p>

                  <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-zinc-500">Official Hot Spot Partner</div>
                      <div className="text-xs font-black text-zinc-900">{callToAction}</div>
                    </div>
                    <button className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg text-[10px]">
                      Contact Pro
                    </button>
                  </div>
                </div>

                {/* Projected ROI & Conversion Estimator */}
                <div className="bg-zinc-800/80 p-4 rounded-2xl border border-zinc-700 text-left space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                    AI Performance Projections
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-750">
                      <span className="text-zinc-400 block text-[10px]">Est. Reach</span>
                      <strong className="text-white text-sm">
                        {selectedTier === "starter" && "4,200+"}
                        {selectedTier === "pro" && "16,800+"}
                        {selectedTier === "enterprise" && "48,500+"}
                        {selectedTier === "banner" && "8,500+"}
                      </strong>
                    </div>
                    <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-750">
                      <span className="text-zinc-400 block text-[10px]">Target Leads</span>
                      <strong className="text-emerald-400 text-sm">
                        {selectedTier === "starter" && "~8 Leads"}
                        {selectedTier === "pro" && "~32 Leads"}
                        {selectedTier === "enterprise" && "~85 Leads"}
                        {selectedTier === "banner" && "~18 Leads"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: LIVE REVENUE & FINANCIAL TRANSACTIONS LEDGER
         ========================================================================= */}
      {activeSubTab === "revenue" && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in" id="revenue-ledger-view">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
                <DollarSign className="w-3.5 h-3.5 text-amber-700" />
                Real-Time Financial Console
              </div>
              <h3 className="text-xl font-black text-zinc-900 font-display">
                Platform Revenue & Transaction Ledger
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Live stream of every ad purchase, subscription fee, and escrow payout commission.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCsv}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                id="btn-export-csv-ledger"
              >
                <Download className="w-3.5 h-3.5 text-zinc-600" />
                <span>Export CSV Ledger</span>
              </button>
            </div>
          </div>

          {/* Revenue Breakdown Distribution Bars */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
              <span>Gross Revenue Streams Breakdown</span>
              <span className="font-mono text-zinc-900 font-black">
                ${platformStats.platformGrossRevenue.toFixed(2)} Total
              </span>
            </div>

            {/* Multi-segment progress bar */}
            <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden flex">
              <div
                style={{
                  width: `${Math.min(100, (adRevenueMetrics.totalAdRevenue / (platformStats.platformGrossRevenue || 1)) * 100)}%`,
                }}
                className="bg-red-500 h-full"
                title={`Paid Ads: $${adRevenueMetrics.totalAdRevenue.toFixed(2)}`}
              />
              <div
                style={{
                  width: `${Math.min(100, (adRevenueMetrics.subscriptionRevenue / (platformStats.platformGrossRevenue || 1)) * 100)}%`,
                }}
                className="bg-blue-500 h-full"
                title={`Subscriptions: $${adRevenueMetrics.subscriptionRevenue.toFixed(2)}`}
              />
              <div
                style={{
                  width: `${Math.min(100, (adRevenueMetrics.escrowRevenue / (platformStats.platformGrossRevenue || 1)) * 100)}%`,
                }}
                className="bg-emerald-500 h-full"
                title={`Escrow 3%: $${adRevenueMetrics.escrowRevenue.toFixed(2)}`}
              />
              <div
                style={{
                  width: `${Math.min(100, (adRevenueMetrics.otherRevenue / (platformStats.platformGrossRevenue || 1)) * 100)}%`,
                }}
                className="bg-amber-500 h-full"
                title={`Badges & Tools: $${adRevenueMetrics.otherRevenue.toFixed(2)}`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-600 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Paid Ads & Blitzen: <strong>${adRevenueMetrics.totalAdRevenue.toFixed(2)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Pro Subscriptions: <strong>${adRevenueMetrics.subscriptionRevenue.toFixed(2)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Escrow 3% Take: <strong>${adRevenueMetrics.escrowRevenue.toFixed(2)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Badges & Packets: <strong>${adRevenueMetrics.otherRevenue.toFixed(2)}</strong></span>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {(["all", "ads", "subscriptions", "escrow", "other"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRevenueFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer capitalize ${
                    revenueFilter === tab
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {tab === "ads" ? "Paid Ads" : tab}
                </button>
              ))}
            </div>

            <div className="relative sm:w-64">
              <input
                type="text"
                placeholder="Search business, tx id, product..."
                value={searchLedgerQuery}
                onChange={(e) => setSearchLedgerQuery(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 pl-8 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto border border-zinc-200 rounded-2xl shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-100/80 border-b border-zinc-200 text-zinc-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Transaction / Time</th>
                  <th className="py-3 px-4">Business / User</th>
                  <th className="py-3 px-4">Product Category</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-medium text-zinc-700">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-400 text-xs">
                      No transactions found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-zinc-50 transition">
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="font-bold text-zinc-900 block">{tx.id}</span>
                        <span className="text-zinc-400 text-[10px]">
                          {new Date(tx.timestamp).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-zinc-900 block">{tx.userName}</span>
                        <span className="text-zinc-500 text-[10px] uppercase font-semibold">
                          Role: {tx.userRole}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-zinc-800 block">{tx.title}</span>
                        <span className="text-zinc-400 text-[10px] font-mono">
                          {tx.productType}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-black text-zinc-900">
                        +${tx.amount.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3 text-emerald-600" />
                          {tx.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right text-zinc-500 font-mono text-[11px]">
                        {tx.paymentMethod === "stripe_card" && "💳 Card"}
                        {tx.paymentMethod === "wallet_balance" && "💼 Escrow"}
                        {tx.paymentMethod === "apple_pay" && " Apple Pay"}
                        {tx.paymentMethod === "google_pay" && "G Pay"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: ACTIVE PAID CAMPAIGNS & ROAS MONITOR
         ========================================================================= */}
      {activeSubTab === "campaigns" && (
        <div className="space-y-4 animate-fade-in" id="active-campaigns-monitor-view">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-700" />
                  Live Campaign Performance
                </div>
                <h3 className="text-xl font-black text-zinc-900 font-display">
                  Active Contractor Ad Campaigns ({activeCampaigns.length})
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Track delivered impressions, phone leads, budget pacing, and ROAS multiplier per business.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs">
                  <span className="text-zinc-500 block text-[10px] font-semibold">Total Revenue Generated</span>
                  <strong className="text-emerald-700 font-black font-mono text-sm">
                    ${adRevenueMetrics.totalClientRevenueDelivered.toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>

            {/* Campaign Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {activeCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 shadow-xs space-y-3 relative hover:border-blue-400 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {camp.packageTier.toUpperCase()} TIER
                      </span>
                      <h4 className="text-sm font-black text-zinc-900 mt-1">
                        {camp.contractorName}
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-medium">
                        {camp.trade} • ZIPs: {camp.targetZips.slice(0, 3).join(", ")}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        camp.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-700 italic bg-white p-2.5 rounded-xl border border-zinc-200 line-clamp-2">
                    "{camp.headline}"
                  </p>

                  {/* 4 Mini Performance Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white p-2 rounded-xl border border-zinc-200">
                      <span className="text-zinc-400 block text-[10px]">Budget Spent</span>
                      <strong className="text-zinc-900 font-mono font-bold">
                        ${camp.budgetSpent.toFixed(2)}
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-zinc-200">
                      <span className="text-zinc-400 block text-[10px]">Client Revenue</span>
                      <strong className="text-emerald-700 font-mono font-bold">
                        ${camp.revenueGenerated.toLocaleString()}
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-zinc-200">
                      <span className="text-zinc-400 block text-[10px]">Impressions</span>
                      <strong className="text-zinc-900 font-mono font-bold">
                        {camp.impressions.toLocaleString()}
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-zinc-200">
                      <span className="text-zinc-400 block text-[10px]">Leads Generated</span>
                      <strong className="text-blue-700 font-mono font-bold">
                        {camp.leadsGenerated} Inquiries
                      </strong>
                    </div>
                  </div>

                  {/* ROAS & Channel Chips */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-emerald-700 font-black">
                      ⚡ {camp.roasMultiplier}x Realized ROAS
                    </span>
                    <span className="text-zinc-400 text-[10px]">
                      {camp.channels.length} Channels
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-200">
                    <button
                      type="button"
                      onClick={() => handleToggleCampaignStatus(camp.id)}
                      className="w-1/2 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      {camp.status === "active" ? (
                        <>
                          <Pause className="w-3 h-3" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" /> Resume
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBoostCampaignBudget(camp)}
                      className="w-1/2 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                      title="Add $25 surge budget to accelerate lead generation"
                    >
                      <Zap className="w-3 h-3" /> +$25 Boost
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: CHANNELS & WEATHER SURGE AUTOMATION ENGINE
         ========================================================================= */}
      {activeSubTab === "channels" && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in" id="channels-engine-view">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-900 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
              <Sliders className="w-3.5 h-3.5 text-purple-700" />
              Automated Ad Distribution Engine
            </div>
            <h3 className="text-xl font-black text-zinc-900 font-display">
              Channel Broadcast & Surge Automation Controls
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Toggle automatic syndication channels and configure real-time weather demand triggers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google Local Services Ads */}
            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl flex items-start justify-between">
              <div>
                <h4 className="text-sm font-black text-zinc-900">Google Local Services (LSA)</h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Top-of-search placement with Google Guaranteed badge and direct call dispatch.
                </p>
              </div>
              <input
                type="checkbox"
                checked={channelToggles.googleLsa}
                onChange={(e) => setChannelToggles({ ...channelToggles, googleLsa: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {/* Nextdoor Sponsored */}
            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl flex items-start justify-between">
              <div>
                <h4 className="text-sm font-black text-zinc-900">Nextdoor Sponsored Feeds</h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Pin verified contractor offers inside local neighborhood conversations and recommendations.
                </p>
              </div>
              <input
                type="checkbox"
                checked={channelToggles.nextdoor}
                onChange={(e) => setChannelToggles({ ...channelToggles, nextdoor: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {/* Meta Local Groups & Instagram */}
            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl flex items-start justify-between">
              <div>
                <h4 className="text-sm font-black text-zinc-900">Meta Local (Facebook & Instagram)</h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  High-converting photo & video carousels delivered to local homeowners aged 30-70.
                </p>
              </div>
              <input
                type="checkbox"
                checked={channelToggles.metaLocal}
                onChange={(e) => setChannelToggles({ ...channelToggles, metaLocal: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {/* Automated SMS Drips */}
            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl flex items-start justify-between">
              <div>
                <h4 className="text-sm font-black text-zinc-900">SMS Direct Broadcast & Drip Funnel</h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Instant text notification sent to active customers posting new projects in target ZIPs.
                </p>
              </div>
              <input
                type="checkbox"
                checked={channelToggles.smsBroadcast}
                onChange={(e) => setChannelToggles({ ...channelToggles, smsBroadcast: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Weather Trigger Surge Engine */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-5 rounded-2xl border border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-black font-display">
                  Weather Surge Automated Bid Accelerator
                </h4>
              </div>
              <input
                type="checkbox"
                checked={channelToggles.weatherSurgeTrigger}
                onChange={(e) => setChannelToggles({ ...channelToggles, weatherSurgeTrigger: e.target.checked })}
                className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
              />
            </div>
            <p className="text-xs text-blue-200">
              When freezing temperatures, high winds (&gt;35mph), or hail storms strike target ZIPs (78701, 75201, 60601), the AI automatically accelerates ad spend for Roofing, Plumbing, and HVAC businesses by 35% to capture emergency repair demand.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
