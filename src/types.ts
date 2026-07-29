export type UserRole = "customer" | "contractor" | "guest";

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
  createdAt: string;
  pushNotificationsEnabled?: boolean;
}

export interface CustomerUser extends BaseUser {
  role: "customer";
}

export interface ContractorUser extends BaseUser {
  role: "contractor";
  company?: string;
  avatarUrl: string;
  trades: string[];
  insuranceUrl?: string; // If insurance was uploaded
  insuranceName?: string;
  reviews: Review[];
  subscriptionActive: boolean;
  emailNotificationsEnabled: boolean; // "send email to contractors who signup for this option"
  availableNow?: boolean; // Currently available for instant assignment or rapid response
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
