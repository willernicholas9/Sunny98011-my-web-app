import { MonetizationTransaction, MonetizationProductType, PlatformMonetizationStats, Project, ContractorUser, UserRole } from "../types";

export interface PlatformFeeSettings {
  contractorProSubscriptionEnabled: boolean; // IN SERVICE ($29/mo)
  homeownerProjectBoostsEnabled: boolean; // IN SERVICE ($9.99 - $29.99)
  escrowPlatformCommissionEnabled: boolean; // IN SERVICE (3% - 5%)
  escrowCommissionRatePercent: number; // 3%
  contractorAcceptedLeadUnlockFee: number; // $0.00 (100% Free once project is accepted)
  contractorPreBidDirectOutreachAllowed: boolean; // Optional pre-bid tool
}

const DEFAULT_SETTINGS: PlatformFeeSettings = {
  contractorProSubscriptionEnabled: true,
  homeownerProjectBoostsEnabled: true,
  escrowPlatformCommissionEnabled: true,
  escrowCommissionRatePercent: 3,
  contractorAcceptedLeadUnlockFee: 0.00, // 100% FREE on acceptance
  contractorPreBidDirectOutreachAllowed: true
};

const TRANSACTIONS_KEY = "hsws_monetization_transactions";
const MONETIZATION_SETTINGS_KEY = "hsws_monetization_settings";

const INITIAL_TRANSACTIONS: MonetizationTransaction[] = [
  {
    id: "tx-sub-101",
    userId: "contractor-1",
    userName: "Dave Miller (Apex Landscaping)",
    userRole: "contractor",
    productType: "contractor_pro_subscription",
    title: "Contractor Pro Membership (Monthly)",
    amount: 29.00,
    currency: "USD",
    status: "succeeded",
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    paymentMethod: "stripe_card",
    referenceId: "sub_1N8x2yLkdI"
  },
  {
    id: "tx-boost-102",
    userId: "cust-1",
    userName: "Sarah Jenkins",
    userRole: "customer",
    productType: "project_priority_boost",
    title: "Priority 50-Mile Contractor Project Boost",
    amount: 9.99,
    currency: "USD",
    status: "succeeded",
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    projectId: "proj-1",
    paymentMethod: "stripe_card",
    referenceId: "ch_3M9q4xLkdI"
  },
  {
    id: "tx-lead-103",
    userId: "contractor-2",
    userName: "Marco Ramirez (CleanFlow Gutters)",
    userRole: "contractor",
    productType: "lead_credits_pack_small",
    title: "5 Lead Unlock Credits Pack",
    amount: 15.00,
    currency: "USD",
    status: "succeeded",
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    paymentMethod: "stripe_card",
    referenceId: "ch_5P2q8wLkdZ"
  },
  {
    id: "tx-escrow-104",
    userId: "contractor-1",
    userName: "Apex Landscaping",
    userRole: "contractor",
    productType: "escrow_platform_take_rate",
    title: "Platform Escrow Commission (3% on $850)",
    amount: 25.50,
    currency: "USD",
    status: "succeeded",
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    projectId: "proj-completed-1",
    paymentMethod: "wallet_balance",
    referenceId: "esc_take_7719"
  }
];

class MonetizationService {
  private transactions: MonetizationTransaction[] = [];
  private settings: PlatformFeeSettings = DEFAULT_SETTINGS;
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadTransactions();
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem(MONETIZATION_SETTINGS_KEY);
      if (saved) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } else {
        this.settings = DEFAULT_SETTINGS;
        this.saveSettings();
      }
    } catch {
      this.settings = DEFAULT_SETTINGS;
    }
  }

  public getSettings(): PlatformFeeSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<PlatformFeeSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  private saveSettings() {
    try {
      localStorage.setItem(MONETIZATION_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.error("Failed to save monetization settings", e);
    }
    this.notifyListeners();
  }

  private loadTransactions() {
    try {
      const saved = localStorage.getItem(TRANSACTIONS_KEY);
      if (saved) {
        this.transactions = JSON.parse(saved);
      } else {
        this.transactions = INITIAL_TRANSACTIONS;
        this.saveTransactions();
      }
    } catch {
      this.transactions = INITIAL_TRANSACTIONS;
    }
  }

  private saveTransactions() {
    try {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(this.transactions));
    } catch (e) {
      console.error("Failed to save monetization transactions", e);
    }
    this.notifyListeners();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (e) {
        console.error(e);
      }
    });
  }

  public getTransactions(): MonetizationTransaction[] {
    return [...this.transactions];
  }

  // Calculate high-level financial metrics for Platform Owner
  public getPlatformStats(projects: Project[] = [], contractors: ContractorUser[] = []): PlatformMonetizationStats {
    let grossMerchandiseValue = 0;
    projects.forEach(p => {
      if (p.status === "completed" || p.status === "accepted") {
        grossMerchandiseValue += (p.budget || 0);
      }
    });

    let platformGrossRevenue = 0;
    let escrowCommissionsTotal = 0;
    let leadCreditsPurchasedCount = 0;

    this.transactions.forEach(t => {
      if (t.status === "succeeded") {
        platformGrossRevenue += t.amount;
        if (t.productType === "escrow_platform_take_rate") {
          escrowCommissionsTotal += t.amount;
        }
        if (t.productType.startsWith("lead_credits")) {
          leadCreditsPurchasedCount += 1;
        }
      }
    });

    // Monthly Recurring Revenue calculation
    const proContractors = contractors.filter(c => c.subscriptionActive || c.subscriptionTier === "pro" || c.subscriptionTier === "enterprise");
    const activeProContractorsCount = proContractors.length;
    
    let monthlyRecurringRevenue = 0;
    contractors.forEach(c => {
      if (c.subscriptionTier === "enterprise") {
        monthlyRecurringRevenue += 99;
      } else if (c.subscriptionTier === "pro" || c.subscriptionActive) {
        monthlyRecurringRevenue += 29;
      }
    });

    const boostedProjectsCount = projects.filter(p => p.isBoosted).length;

    // Available payout balance (Platform gross revenue minus processed payouts)
    const availablePayoutBalance = platformGrossRevenue;

    return {
      grossMerchandiseValue,
      platformGrossRevenue,
      monthlyRecurringRevenue,
      activeProContractorsCount,
      boostedProjectsCount,
      escrowCommissionsTotal,
      availablePayoutBalance,
      leadCreditsPurchasedCount,
    };
  }

  // Process a Contractor Pro or Enterprise Subscription
  public async subscribeContractor(
    contractor: ContractorUser,
    tier: "pro" | "enterprise",
    billingCycle: "monthly" | "annual" = "monthly",
    cardLast4: string = "4242"
  ): Promise<{ success: boolean; transaction: MonetizationTransaction; message: string }> {
    const amount = tier === "enterprise" 
      ? (billingCycle === "annual" ? 990 : 99) 
      : (billingCycle === "annual" ? 290 : 29);

    const transaction: MonetizationTransaction = {
      id: `tx-sub-${Date.now()}`,
      userId: contractor.id,
      userName: contractor.company || contractor.fullName,
      userRole: "contractor",
      productType: tier === "enterprise" ? "contractor_enterprise_subscription" : "contractor_pro_subscription",
      title: `${tier === "enterprise" ? "Enterprise Master" : "Contractor Pro"} Subscription (${billingCycle})`,
      amount,
      currency: "USD",
      status: "succeeded",
      timestamp: new Date().toISOString(),
      contractorId: contractor.id,
      paymentMethod: "stripe_card",
      referenceId: `sub_${Math.random().toString(36).substring(2, 9)}`
    };

    this.transactions.unshift(transaction);
    this.saveTransactions();

    // Call server to add funds to platform owner Stripe balance
    try {
      await fetch("/api/stripe/mock-add-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, isPending: false })
      });
    } catch (e) {
      console.warn("Could not sync with stripe server balance:", e);
    }

    return {
      success: true,
      transaction,
      message: `🎉 Success! You are now an active ${tier.toUpperCase()} Contractor with prioritized lead rankings and 0% surcharge!`
    };
  }

  // Process a Homeowner Project Priority Boost or 24/7 Emergency Rush
  public async boostProject(
    project: Project,
    customer: { id: string; fullName: string; role: UserRole },
    boostTier: "standard_boost" | "urgent_rush" | "vip_spotlight"
  ): Promise<{ success: boolean; transaction: MonetizationTransaction; updatedProject: Project }> {
    const pricingMap = {
      standard_boost: { amount: 9.99, name: "Priority Project Boost (3x Views)" },
      urgent_rush: { amount: 19.99, name: "24/7 Emergency Rush Contractor Dispatch" },
      vip_spotlight: { amount: 29.99, name: "VIP City-Wide Spotlight & Featured Pin" }
    };

    const config = pricingMap[boostTier] || pricingMap.standard_boost;

    const transaction: MonetizationTransaction = {
      id: `tx-boost-${Date.now()}`,
      userId: customer.id,
      userName: customer.fullName,
      userRole: customer.role,
      productType: boostTier === "urgent_rush" ? "project_emergency_rush" : "project_priority_boost",
      title: config.name,
      amount: config.amount,
      currency: "USD",
      status: "succeeded",
      timestamp: new Date().toISOString(),
      projectId: project.id,
      paymentMethod: "stripe_card",
      referenceId: `bst_${Math.random().toString(36).substring(2, 9)}`
    };

    this.transactions.unshift(transaction);
    this.saveTransactions();

    const updatedProject: Project = {
      ...project,
      isBoosted: true,
      boostTier,
      boostExpiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      isEmergency: boostTier === "urgent_rush" ? true : project.isEmergency
    };

    // Update server balance
    try {
      await fetch("/api/stripe/mock-add-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: config.amount, isPending: false })
      });
    } catch (e) {
      console.warn("Could not sync boost to server balance:", e);
    }

    return {
      success: true,
      transaction,
      updatedProject
    };
  }

  // Process Lead Credits Purchase for Contractors
  public async purchaseLeadCredits(
    contractor: ContractorUser,
    packType: "small" | "medium" | "large"
  ): Promise<{ success: boolean; creditsAdded: number; transaction: MonetizationTransaction }> {
    const packs = {
      small: { credits: 5, amount: 15.00, type: "lead_credits_pack_small" as const, title: "5 Direct Contact Lead Credits Pack" },
      medium: { credits: 20, amount: 49.00, type: "lead_credits_pack_medium" as const, title: "20 Direct Contact Lead Credits Pack" },
      large: { credits: 50, amount: 99.00, type: "lead_credits_pack_large" as const, title: "50 Direct Contact Lead Credits Pack (Best Value)" }
    };

    const selected = packs[packType];

    const transaction: MonetizationTransaction = {
      id: `tx-leadpack-${Date.now()}`,
      userId: contractor.id,
      userName: contractor.company || contractor.fullName,
      userRole: "contractor",
      productType: selected.type,
      title: selected.title,
      amount: selected.amount,
      currency: "USD",
      status: "succeeded",
      timestamp: new Date().toISOString(),
      contractorId: contractor.id,
      paymentMethod: "stripe_card",
      referenceId: `crd_${Math.random().toString(36).substring(2, 9)}`
    };

    this.transactions.unshift(transaction);
    this.saveTransactions();

    try {
      await fetch("/api/stripe/mock-add-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selected.amount, isPending: false })
      });
    } catch (e) {
      console.warn("Could not sync credits to stripe server balance:", e);
    }

    return {
      success: true,
      creditsAdded: selected.credits,
      transaction
    };
  }

  // Record 3% Platform Commission on Completed Escrow Payouts
  public recordEscrowCommission(
    project: Project,
    contractorName: string,
    takeRatePercent: number = 3
  ): MonetizationTransaction {
    const feeAmount = Number(((project.budget * takeRatePercent) / 100).toFixed(2));

    const transaction: MonetizationTransaction = {
      id: `tx-take-${Date.now()}`,
      userId: project.acceptedContractorId || "contractor-platform",
      userName: contractorName,
      userRole: "contractor",
      productType: "escrow_platform_take_rate",
      title: `Escrow Platform Fee (${takeRatePercent}% on $${project.budget.toLocaleString()})`,
      amount: feeAmount,
      currency: "USD",
      status: "succeeded",
      timestamp: new Date().toISOString(),
      projectId: project.id,
      paymentMethod: "wallet_balance",
      referenceId: `fee_${project.id.slice(0, 8)}`
    };

    this.transactions.unshift(transaction);
    this.saveTransactions();

    return transaction;
  }
}

export const monetizationService = new MonetizationService();
