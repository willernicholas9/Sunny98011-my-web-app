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
  first1000Promo?: {
    isEligible: boolean;
    spotNumber: number;
    promoName: string; // "First 1,000 Signups - 1 Month Free Platform Use"
    freeMonthExpiresAt: string; // "2026-10-28T23:59:59.000Z"
    claimedAt: string;
    membershipWaived: boolean;
    homeownerFeesWaived: boolean;
  };
}

export interface CustomerUser extends BaseUser {
  role: "customer" | "owner";
}

export interface BeforeAfterPair {
  id: string;
  title: string;
  trade: string;
  beforePhoto: string;
  afterPhoto: string;
  description?: string;
  completionTime?: string;
  costEstimate?: string;
}

export interface ContractorUser extends BaseUser {
  role: "contractor" | "owner";
  company?: string;
  avatarUrl: string;
  trades: string[];
  insuranceUrl?: string; // If insurance was uploaded
  insuranceName?: string;
  licensePhotoUrl?: string;
  vehiclePhotoUrl?: string;
  portfolioPhotos?: string[];
  beforeAfterPairs?: BeforeAfterPair[];
  completedProjectsCount?: number;
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

export interface SuggestedMaterialItem {
  name: string;
  quantity?: string;
  estimatedPrice?: string;
  affiliateUrl?: string;
  store?: string;
}

export interface DamageAnalysisResult {
  damageSeverity: "Minor Cosmetic" | "Moderate Repair" | "Severe Structural" | "Emergency Hazard";
  estimatedLaborHours: string;
  recommendedTrade: string;
  summary: string;
  detectedIssues: string[];
  suggestedMaterials: Array<string | SuggestedMaterialItem>;
  estCostRange: string;
  estimatedLaborCost?: number | string;
  estimatedMaterialCost?: number | string;
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
  completionImages?: string[];
  photoTags?: Record<string, string>; // mapping image url -> tag e.g. "Main Damage", "Close Up"
  damageScanAnalysis?: DamageAnalysisResult;
  materialQuoteEstimate?: {
    partnerName: string;
    totalEstMaterials: number;
    items: Array<{ name: string; estPrice: number; category: string; buyUrl?: string }>;
  };
  status: "open" | "bid_placed" | "accepted" | "completed";
  acceptedContractorId?: string;
  agreedByCustomer: boolean;
  agreedByContractor: boolean;
  createdAt: string;
  serviceFeeCharge: number; // calculated service fee ($7.99 or $20)
  targetCompletionDate?: string; // e.g. "2026-08-10" or calculated
  estimatedDaysToComplete?: number; // e.g. 3
  complexityLevel?: "Low" | "Medium" | "High" | "Major Renovation";
  isEmergency?: boolean; // ⚡ 24/7 Emergency Dispatch
  emergencyCategory?: "Plumbing Leak" | "Power Outage" | "Roof/Storm Damage" | "HVAC/Heating" | "Locksmith" | "Other";
  isBoosted?: boolean; // 🚀 Paid Priority Spotlight
  boostTier?: "standard_boost" | "urgent_rush" | "vip_spotlight";
  boostExpiresAt?: string;
  warrantyProtected?: boolean; // 🛡️ $4.99 100% Escrow Dispute Protection
  milestones?: ProjectMilestone[];
  beforeAfterPair?: BeforeAfterPair;
  emergencyPhoneContact?: string;
  emergencyEtaMinutes?: number;
  coordinates?: { lat: number; lng: number };
}

export interface HomepageAd {
  id: string;
  companyName: string;
  tagline: string;
  description: string;
  badge: string;
  imageUrl?: string;
  accentColor?: string;
  ctaText: string;
  targetUrl: string;
  category?: string;
  placement: "top_banner" | "mid_board" | "card_inline";
  pricePaid: number;
  durationDays: number;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  clicksCount: number;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  percentage: number; // e.g. 30 (for 30%)
  amount: number;
  status: "pending" | "in_progress" | "submitted" | "approved_released" | "disputed";
  proofPhotoUrl?: string;
  contractorNotes?: string;
  submittedAt?: string;
  releasedAt?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  category: "labor" | "materials" | "permits" | "equipment" | "discount" | "other";
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface JobInvoiceEstimate {
  id: string;
  projectId?: string;
  type: "estimate" | "invoice";
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  contractorName: string;
  contractorCompany: string;
  contractorEmail: string;
  contractorPhone: string;
  contractorLicense?: string;
  contractorInsurance?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  projectTitle: string;
  projectAddress: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRatePercent: number;
  taxAmount: number;
  escrowDepositCredit: number;
  totalDue: number;
  notesAndTerms: string;
  status: "draft" | "sent" | "paid" | "accepted";
  customerSignature?: string;
  signedAt?: string;
}

export interface SubcontractorCrewPost {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorCompany: string;
  creatorRole: "gc_seeking_crew" | "sub_available";
  trade: string;
  title: string;
  description: string;
  city: string;
  state: string;
  zipCode: string;
  crewSize: number;
  dayRateOrBudget: number;
  durationDays: number;
  startDate: string;
  insuranceRequired: boolean;
  toolsProvided: boolean;
  status: "open" | "filled" | "closed";
  applicantsCount: number;
  createdAt: string;
}

export interface NegotiationStep {
  id: string;
  senderRole: "customer" | "contractor";
  senderName?: string;
  amount: number;
  message: string;
  completionDays?: number;
  materialsIncluded?: boolean;
  createdAt: string;
}

export interface Bid {
  id: string;
  projectId: string;
  contractorId: string;
  contractorName: string;
  contractorCompany?: string;
  contractorAvatar?: string;
  amount: number;
  message: string;
  completionDays?: number;
  materialsIncluded?: boolean;
  status: "pending" | "counter_by_customer" | "counter_by_contractor" | "accepted" | "declined";
  createdAt: string;
  history?: NegotiationStep[];
  paymentInitiated?: boolean;
  paymentMethod?: string;
  paymentReference?: string;
  agreedAt?: string;
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
  recipientEmail?: string;
  recipientName?: string;
  recipient?: string;
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
  | "lead_unlock_single" // $15.00 single lead unlock
  | "lead_credits_pack_small" // $15.00 (5 leads)
  | "lead_credits_pack_medium" // $49.00 (20 leads)
  | "lead_credits_pack_large" // $99.00 (50 leads)
  | "escrow_platform_take_rate" // 3% escrow processing fee
  | "ai_ad_campaign_starter" // $49.00 (AI Ad Blitz in 3 target zips for 7 days)
  | "ai_ad_campaign_pro" // $149.00 (Multi-channel Google + Meta + Nextdoor AI Ads for 30 days)
  | "ai_ad_campaign_enterprise" // $299.00 (Complete Metro dominance tier)
  | "sponsored_category_banner" // $39.00 / week (Featured top category placement)
  | "homeowner_urgent_ad_dispatch" // $9.99 (Instant AI Ad & SMS broadcast to 50+ local trade pros)
  | "homeowner_referral_credit" // $25.00 homeowner/neighbor referral credit
  | "contractor_verified_badge" // $19.00 (Official Background Check & Verified Pro License Badge)
  | "workmanship_warranty_bond" // $14.99 ($10,000 Homeowner Peace-of-Mind Protection Bond)
  | "permit_compliance_packet" // $9.99 (Official City Permit Submittal & Code Compliance Packet)
  | "equipment_dumpster_dispatch" // $25.00 (Commercial Dumpster & Heavy Equipment Booking Dispatch)
  | "contractor_spotlight_pin" // $14.99 (48-Hour City Hub Top Contractor Spotlight Pin)
  | "instant_escrow_payout_express" // $9.99 (Same-Day Instant Debit Card / RTP Escrow Payout for contractors)
  | "lien_waiver_warranty_package" // $14.99 (Official Subcontractor Lien Waiver & 1-Year Workmanship Warranty Vault)
  | "ai_3d_design_material_visualizer" // $19.99 (AI 3D Renovation Design Render & Spec Sheet Packet)
  | "subcontractor_crew_vip_blast"; // $19.00 (Urgent 45-Mile Subcontractor Crew SMS & Push Broadcast)

export interface AiManagedAdCampaign {
  id: string;
  contractorId: string;
  contractorName: string;
  trade: string;
  targetZips: string[];
  packageTier: "starter" | "pro" | "enterprise";
  status: "active" | "optimizing" | "paused" | "completed";
  budgetSpent: number;
  revenueGenerated: number;
  impressions: number;
  clicks: number;
  leadsGenerated: number;
  roasMultiplier: number;
  channels: string[];
  startDate: string;
  endDate: string;
  headline: string;
}

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

