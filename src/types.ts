export type UserRole = "customer" | "contractor" | "owner" | "guest";

export interface BaseUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  creditCard: {
    number: string;
    expiry: string;
    cvv: string;
  };
  role: UserRole;
  isPlatformOwner?: boolean;
  createdAt: string;
  pushNotificationsEnabled?: boolean;
}

export interface CustomerUser extends BaseUser {
  role: "customer" | "owner";
}

export interface ContractorUser extends BaseUser {
  role: "contractor" | "owner";
  company?: string;
  avatarUrl: string;
  trades: string[];
  insuranceUrl?: string; // If insurance was uploaded
  insuranceName?: string;
  reviews: Review[];
  subscriptionActive: boolean;
  subscriptionTier?: "free" | "pro" | "enterprise";
  subscriptionExpiresAt?: string;
  leadCredits?: number; // Pay-per-lead credits for direct homeowner contact unlocks
  verifiedProBadge?: boolean;
  emailNotificationsEnabled: boolean; // "send email to contractors who signup for this option"
  availableNow?: boolean; // Currently available for instant assignment or rapid response
}

export interface OwnerUser extends BaseUser {
  role: "owner";
  isPlatformOwner: true;
  company?: string;
  avatarUrl?: string;
  trades?: string[];
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface Project {
  id: string;
  customerId: string;
  customerFirstName: string;
  customerLastName: string; // visible only after accept/agreement
  customerPhone: string; // visible only after agreement
  customerAddress: string; // visible only after agreement
  customerEmail: string; // visible only after agreement
  address: string; // Job site street address
  title: string;
  description: string;
  type: "home" | "business";
  budget: number;
  city: string;
  state: string;
  zipCode: string;
  images: string[];
  status: "open" | "bid_placed" | "accepted" | "completed";
  acceptedContractorId?: string;
  agreedByCustomer: boolean;
  agreedByContractor: boolean;
  createdAt: string;
  serviceFeeCharge: number; // calculated service fee ($5 or $20)
  targetCompletionDate?: string; // e.g. "2026-08-10" or calculated
  estimatedDaysToComplete?: number; // e.g. 3
  complexityLevel?: "Low" | "Medium" | "High" | "Major Renovation";
  isEmergency?: boolean; // ⚡ 24/7 Emergency Dispatch
  emergencyCategory?: "Plumbing Leak" | "Power Outage" | "Roof/Storm Damage" | "HVAC/Heating" | "Locksmith" | "Other";
  isBoosted?: boolean; // 🚀 Paid Priority Spotlight
  boostTier?: "standard_boost" | "urgent_rush" | "vip_spotlight";
  boostExpiresAt?: string;
  warrantyProtected?: boolean; // 🛡️ $4.99 100% Escrow Dispute Protection
}

export interface NegotiationStep {
  id: string;
  senderRole: "customer" | "contractor";
  amount: number;
  message: string;
  createdAt: string;
}

export interface Bid {
  id: string;
  projectId: string;
  contractorId: string;
  contractorName: string;
  contractorCompany?: string;
  amount: number;
  message: string;
  status: "pending" | "counter_by_customer" | "counter_by_contractor" | "accepted" | "declined";
  createdAt: string;
  history?: NegotiationStep[];
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface CityData {
  name: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
}

export interface EmailLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  timestamp: string;
  category?: "radius_alert" | "bid_negotiation" | "outreach" | "system" | "welcome";
  senderName?: string;
  senderEmail?: string;
  status?: "dispatched" | "delivered" | "failed";
  radiusMiles?: number;
}

export interface PrivateChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "customer" | "contractor";
  recipientId: string;
  recipientName: string;
  recipientRole: "customer" | "contractor";
  text: string;
  createdAt: string;
}

export const TRADE_OPTIONS = [
  "Landscaping",
  "Gutter Cleaning",
  "Garden Work",
  "Window Replacement",
  "TV Hanging",
  "Painting",
  "General Handyman Projects",
  "Plumbing Repair",
  "Electrical Maintenance",
];

export type MonetizationProductType = 
  | "contractor_pro_subscription" // $29.00 / month
  | "contractor_enterprise_subscription" // $99.00 / month
  | "project_priority_boost" // $9.99
  | "project_emergency_rush" // $19.99
  | "escrow_protection_warranty" // $4.99
  | "lead_credits_pack_small" // $15.00 (5 leads)
  | "lead_credits_pack_medium" // $49.00 (20 leads)
  | "lead_credits_pack_large" // $99.00 (50 leads)
  | "escrow_platform_take_rate"; // 3% escrow processing fee

export interface MonetizationTransaction {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  productType: MonetizationProductType;
  title: string;
  amount: number;
  currency: string;
  status: "succeeded" | "pending" | "refunded";
  timestamp: string;
  projectId?: string;
  contractorId?: string;
  paymentMethod: "stripe_card" | "apple_pay" | "google_pay" | "wallet_balance";
  referenceId?: string;
}

export interface PlatformMonetizationStats {
  grossMerchandiseValue: number; // Total volume of jobs executed through platform
  platformGrossRevenue: number; // Total fees, subscriptions, and boosts collected
  monthlyRecurringRevenue: number; // Active recurring contractor subscriptions
  activeProContractorsCount: number;
  boostedProjectsCount: number;
  escrowCommissionsTotal: number;
  availablePayoutBalance: number;
  leadCreditsPurchasedCount: number;
}

