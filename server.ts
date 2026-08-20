import express from "express";
import path from "path";
import dotenv from "dotenv";
import Stripe from "stripe";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client safely
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: key });
  }
  return geminiClient;
}

// Lazy-initialize stripe helper safely
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2023-10-16" as any, // Standard stable api version
    });
  }
  return stripeClient;
}

// Global In-Memory Store for Simulation if real Stripe credentials are omitted
let mockStripeDb = {
  connectedBankName: "",
  connectedRoutingLast4: "",
  connectedAccountLast4: "",
  connectedStatus: "unlinked", // 'unlinked' | 'pending' | 'linked'
  availableBalance: 380.00, // Initial default balance to feel high-fidelity immediately!
  pendingBalance: 120.00,
  payoutSchedule: "manual", // 'manual' | 'daily' | 'weekly'
  payoutHistory: [
    {
      id: "po-1",
      amount: 140.00,
      arrivalDate: new Date(Date.now() - 86400000 * 7).toISOString(),
      status: "succeeded" as const,
      bankName: "Chase Bank N.A.",
      accountLast4: "9401",
    },
    {
      id: "po-2",
      amount: 45.00,
      arrivalDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: "succeeded" as const,
      bankName: "Chase Bank N.A.",
      accountLast4: "9401",
    }
  ] as Array<{
    id: string;
    amount: number;
    arrivalDate: string;
    status: "processing" | "succeeded" | "failed";
    bankName: string;
    accountLast4: string;
  }>,
};

// API ROOTS
// 0. System & Persistence Health Probe
app.all("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// 0.1 AI Agent Outreach & Advertisement Campaign Generator (Gemini 3.7 Flash)
app.post("/api/ai/outreach-generator", async (req, res) => {
  const {
    campaignType = "homeowner_ad",
    targetRegion = "Dallas / Central Zone (75201)",
    tradeCategory = "Roofing & Storm Repair",
    tone = "high_converting",
    promoOffer = "$50 Off First Project",
    appUrl = "https://hotspot-tradesmen.app",
    customContext = "",
  } = req.body;

  const gemini = getGemini();

  if (gemini) {
    try {
      const prompt = `You are an expert AI Autonomous Marketing & Advertising Specialist for "Hotspot Tradesmen Network" (a peer-to-peer marketplace connecting homeowners with verified local contractors for lawn, gutters, roofing, plumbing, electrical, carpentry, HVAC, and general home repairs with escrow payment protection and 0% excessive broker fees).

Task: Generate a high-performing advertising and customer outreach campaign with variant options.

Parameters:
- Campaign Type: ${campaignType} (options include: homeowner_ad, contractor_recruitment, emergency_storm, senior_outreach, radio_audio_script, local_seo_keywords, seasonal_promo)
- Target Region / Zips: ${targetRegion}
- Trade / Focus Category: ${tradeCategory}
- Tone: ${tone}
- Promotional Hook / Incentive: ${promoOffer}
- App URL: ${appUrl}
- Custom Instructions / Context: ${customContext || "None"}

Please return a valid JSON object matching this schema:
{
  "headline": "Punchy, attention-grabbing title (under 12 words)",
  "subheading": "Compelling value proposition hook",
  "primaryCopy": "Main persuasive body copy formatted with line breaks, bullets and emojis where appropriate",
  "callToAction": "Clear CTA text (e.g. 'Post Free Job in 60 Seconds -> URL')",
  "smsSnippet": "Short 160-char SMS broadcast version with link",
  "nextdoorPost": "Community-friendly Nextdoor neighborhood recommendation version",
  "radioScript30s": "Energetic 30-second audio commercial script with sound effect cues",
  "targetAudienceNotes": "Demographic guidance, ideal posting hours, and highest ROI channels",
  "suggestedKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6"],
  "estimatedCtr": "e.g. 4.8% - 7.2%",
  "estimatedCpa": "e.g. $1.80 - $3.40 per install / post"
}`;

      const response = await gemini.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text;
      if (responseText) {
        try {
          const parsed = JSON.parse(responseText);
          return res.json({
            success: true,
            source: "gemini-3.7-flash",
            data: parsed,
          });
        } catch (parseErr) {
          console.warn("Failed to parse Gemini JSON response, returning formatted text", parseErr);
        }
      }
    } catch (aiErr: any) {
      console.warn("Gemini API error in outreach generator, falling back to algorithmic builder:", aiErr?.message || aiErr);
    }
  }

  // High-fidelity Algorithmic Fallback Generator
  const isContractor = campaignType === "contractor_recruitment";
  const isEmergency = campaignType === "emergency_storm";
  const isSenior = campaignType === "senior_outreach";
  const isRadio = campaignType === "radio_audio_script";

  let headline = `🏡 Need Trusted ${tradeCategory} in ${targetRegion}? Compare Free Local Bids!`;
  let subheading = `Skip middleman markups. Get direct quotes from licensed & verified local pros in minutes.`;
  let primaryCopy = `Are you looking for reliable, high-quality ${tradeCategory.toLowerCase()} services in the ${targetRegion} area? 

With Hotspot Tradesmen Network:
✅ Post your job vacancy in 60 seconds with photos & budget
✅ Receive competitive bids from top-rated local contractors
✅ 100% Secure Escrow Protection — your funds are held safely until the work is completed to your satisfaction
✅ Special Offer: Get ${promoOffer} when you post this week!

👉 Post your project now: ${appUrl}`;
  let callToAction = `Post Free Project & Get Quotes: ${appUrl}`;
  let smsSnippet = `Local Alert: Verified ${tradeCategory} contractors available in ${targetRegion}. Claim ${promoOffer} on your next project: ${appUrl}`;
  let nextdoorPost = `Hi neighbors! 👋 If anyone is looking for reliable ${tradeCategory.toLowerCase()} assistance in ${targetRegion}, check out Hotspot Tradesmen Network. Verified local pros, zero hidden fees, and secure escrow: ${appUrl}`;
  let radioScript30s = `[SFX: Sound of hammer and power drill]
ANNOUNCER: "Tired of calling contractors who never call back or charge outrageous fees? 
Meet Hotspot Tradesmen Network! Whether it's ${tradeCategory.toLowerCase()}, electrical, plumbing, or yard maintenance in ${targetRegion}, get direct bids from top-rated local pros in minutes. 
Claim ${promoOffer} today at ${appUrl.replace(/^https?:\/\//, "")}. Safe. Local. Done right!"`;

  if (isContractor) {
    headline = `🔨 Contractors in ${targetRegion}: Claim New ${tradeCategory} Jobs with ZERO Lead Fees!`;
    subheading = `Stop paying $40+ for shared leads. Connect directly with paying homeowners in your neighborhood.`;
    primaryCopy = `Attention licensed tradesmen, handymen & specialists in ${targetRegion}:

Homeowners are posting paid jobs for ${tradeCategory.toLowerCase()} right in your local zip code. 
• 0% upfront lead fees
• Instant Stripe payouts directly to your bank account
• In-app private chat & direct contract agreements
• Build your local 5-star reputation

👉 Claim your contractor profile today: ${appUrl}`;
    callToAction = `Join Contractor Network & View Jobs: ${appUrl}`;
    smsSnippet = `New Job Alert: Homeowners in ${targetRegion} posted ${tradeCategory.toLowerCase()} jobs. Claim with 0 lead fees: ${appUrl}`;
  } else if (isEmergency) {
    headline = `🚨 URGENT: Emergency ${tradeCategory} Fast-Response in ${targetRegion}`;
    subheading = `Storm damage, burst pipes, or sudden electrical faults? Verified on-call pros available 24/7.`;
    primaryCopy = `EMERGENCY ALERT FOR ${targetRegion.toUpperCase()}:
When emergency home damage strikes, you can't wait days for quotes.
• Fast-dispatch local pros ready for immediate mobilization
• Certified for insurance documentation & emergency tarping / leak stops
• Funds protected in platform escrow until work passes inspection

👉 Request Emergency Help Now: ${appUrl}`;
    callToAction = `Request Urgent Contractor Dispatch: ${appUrl}`;
  } else if (isSenior) {
    headline = `👵 Trusted, Respectful Home Care & Repair in ${targetRegion}`;
    subheading = `Fair, transparent pricing for seniors. No confusing jargon or hidden fees.`;
    primaryCopy = `Quality home repairs with complete peace of mind.
• Background-checked, verified local contractors
• Clear upfront pricing with zero high-pressure sales tactics
• Simple to use on any tablet or smartphone
• ${promoOffer} exclusively for local homeowners

👉 Get friendly local help today: ${appUrl}`;
    callToAction = `View Friendly Neighborhood Helpers: ${appUrl}`;
  }

  res.json({
    success: true,
    source: "algorithmic-optimizer",
    data: {
      headline,
      subheading,
      primaryCopy,
      callToAction,
      smsSnippet,
      nextdoorPost,
      radioScript30s,
      targetAudienceNotes: `Best targeting: Homeowners aged 32-68, single-family homeowners in ${targetRegion}. Peak engagement windows: 7:00 AM - 9:00 AM (commute/coffee) and 6:30 PM - 8:30 PM (after work).`,
      suggestedKeywords: [
        `${tradeCategory.toLowerCase()} ${targetRegion.split(" ")[0]}`,
        `best contractor near me`,
        `emergency home repair`,
        `licensed handyman`,
        `free contractor quotes`,
        `zero fee home services`,
      ],
      estimatedCtr: "5.2% - 8.4%",
      estimatedCpa: "$1.95 - $2.75 per active project post",
    },
  });
});

// 1. Stripe Status Check
app.get("/api/stripe/status", (req, res) => {
  const realKeyConfigured = !!process.env.STRIPE_SECRET_KEY;
  res.json({
    configured: realKeyConfigured,
    publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
    connectedStatus: mockStripeDb.connectedStatus,
    bankName: mockStripeDb.connectedBankName,
    last4: mockStripeDb.connectedAccountLast4,
  });
});

// 2. Stripe Connect Account Onboarding
app.post("/api/stripe/connect", async (req, res) => {
  const { routingNumber, accountNumber, bankName } = req.body;
  const stripe = getStripe();

  if (stripe && process.env.STRIPE_SECRET_KEY) {
    try {
      // Create connected express account
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.APP_URL || `http://localhost:${PORT}`}/?tab=my_dashboard&stripe_status=refresh`,
        return_url: `${process.env.APP_URL || `http://localhost:${PORT}`}/?tab=my_dashboard&stripe_status=success`,
        type: "account_onboarding",
      });

      mockStripeDb.connectedStatus = "linked";
      mockStripeDb.connectedBankName = bankName || "Stripe Express Card";
      mockStripeDb.connectedAccountLast4 = accountNumber ? accountNumber.slice(-4) : "8842";
      mockStripeDb.connectedRoutingLast4 = routingNumber ? routingNumber.slice(-4) : "6543";

      return res.json({
        success: true,
        realMode: true,
        url: accountLink.url,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    // Fallback simulation
    mockStripeDb.connectedStatus = "linked";
    mockStripeDb.connectedBankName = bankName || "Chase Bank N.A.";
    mockStripeDb.connectedAccountLast4 = accountNumber ? accountNumber.slice(-4) : "9401";
    mockStripeDb.connectedRoutingLast4 = routingNumber ? routingNumber.slice(-4) : "0210";
    
    return res.json({
      success: true,
      realMode: false,
      message: "Connected to routing destination in secure simulated sandbox mode!",
      status: mockStripeDb,
    });
  }
});

// 3. Retrieve balance
app.get("/api/stripe/balance", async (req, res) => {
  const stripe = getStripe();
  if (stripe && process.env.STRIPE_SECRET_KEY) {
    try {
      const balance = await stripe.balance.retrieve();
      
      const availableUSD = balance.available.find(b => b.currency === "usd")?.amount || 0;
      const pendingUSD = balance.pending.find(b => b.currency === "usd")?.amount || 0;

      return res.json({
        realMode: true,
        availableBalance: availableUSD / 100,
        pendingBalance: pendingUSD / 100,
        connectedStatus: mockStripeDb.connectedStatus,
        bankName: mockStripeDb.connectedBankName || "Stripe Express Account",
        last4: mockStripeDb.connectedAccountLast4 || "7711",
        routingLast4: mockStripeDb.connectedRoutingLast4 || "2345",
        payoutSchedule: mockStripeDb.payoutSchedule,
        payoutHistory: mockStripeDb.payoutHistory,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    // Return mock database state
    return res.json({
      realMode: false,
      availableBalance: mockStripeDb.availableBalance,
      pendingBalance: mockStripeDb.pendingBalance,
      connectedStatus: mockStripeDb.connectedStatus,
      bankName: mockStripeDb.connectedBankName,
      last4: mockStripeDb.connectedAccountLast4,
      routingLast4: mockStripeDb.connectedRoutingLast4,
      payoutSchedule: mockStripeDb.payoutSchedule,
      payoutHistory: mockStripeDb.payoutHistory,
    });
  }
});

// 4. Update payout schedule
app.post("/api/stripe/payout-schedule", (req, res) => {
  const { schedule } = req.body;
  if (!["manual", "daily", "weekly"].includes(schedule)) {
    return res.status(400).json({ error: "Invalid schedule option" });
  }
  mockStripeDb.payoutSchedule = schedule;
  res.json({ success: true, schedule: mockStripeDb.payoutSchedule });
});

// 5. Trigger Payout
app.post("/api/stripe/payout", async (req, res) => {
  const stripe = getStripe();
  const amtToWithdraw = mockStripeDb.availableBalance;
  
  if (amtToWithdraw <= 0) {
    return res.status(400).json({ error: "Insufficient available balance to payout." });
  }

  if (stripe && process.env.STRIPE_SECRET_KEY) {
    try {
      // Create actual payout transfer
      const payout = await stripe.payouts.create({
        amount: Math.round(amtToWithdraw * 100),
        currency: "usd",
      });
      
      const newPayout = {
        id: payout.id,
        amount: amtToWithdraw,
        arrivalDate: new Date().toISOString(),
        status: "processing" as const,
        bankName: mockStripeDb.connectedBankName || "Stripe Express Card",
        accountLast4: mockStripeDb.connectedAccountLast4 || "4242",
      };

      mockStripeDb.payoutHistory.unshift(newPayout);
      mockStripeDb.availableBalance = 0;

      return res.json({ success: true, realMode: true, payout: newPayout });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    // Simulation success payout
    const newPayout = {
      id: `po-sim-${Date.now()}`,
      amount: amtToWithdraw,
      arrivalDate: new Date().toISOString(),
      status: "succeeded" as const,
      bankName: mockStripeDb.connectedBankName || "Chase Bank N.A.",
      accountLast4: mockStripeDb.connectedAccountLast4 || "9401",
    };
    mockStripeDb.payoutHistory.unshift(newPayout);
    mockStripeDb.availableBalance = 0;
    
    return res.json({ success: true, realMode: false, payout: newPayout });
  }
});

// 6. Receive platform charge updates (Mock funding when bids accepted, etc. to link platform actions to Stripe)
app.post("/api/stripe/mock-add-funds", (req, res) => {
  const { amount, isPending } = req.body;
  if (isPending) {
    mockStripeDb.pendingBalance += amount;
  } else {
    mockStripeDb.availableBalance += amount;
  }
  res.json({ success: true, status: mockStripeDb });
});

// 7. Reset connection
app.post("/api/stripe/disconnect", (req, res) => {
  mockStripeDb.connectedStatus = "unlinked";
  mockStripeDb.connectedBankName = "";
  mockStripeDb.connectedAccountLast4 = "";
  mockStripeDb.connectedRoutingLast4 = "";
  mockStripeDb.availableBalance = 0;
  mockStripeDb.pendingBalance = 0;
  mockStripeDb.payoutHistory = [];
  res.json({ success: true });
});

// =========================================================================
// REAL-TIME BI-DIRECTIONAL WEBSITE & APP SYNCHRONIZATION ENGINE
// =========================================================================
interface RealtimeState {
  projects: any[];
  bids: any[];
  contractors: any[];
  chatMessages: any[];
  emailLogs: any[];
  activityFeed: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    source: "website" | "app" | "server";
    city?: string;
  }>;
  lastUpdated: string;
}

// In-memory unified server state
let platformState: RealtimeState = {
  projects: [],
  bids: [],
  contractors: [],
  chatMessages: [],
  emailLogs: [],
  activityFeed: [
    {
      id: "act-init-1",
      type: "SYSTEM_SYNC",
      title: "Real-Time Bridge Active",
      description: "Website and Mobile App connected to synchronized live stream.",
      timestamp: new Date().toISOString(),
      source: "server",
      city: "Austin, TX",
    },
  ],
  lastUpdated: new Date().toISOString(),
};

// Connected SSE clients map
interface SSEClient {
  id: string;
  res: express.Response;
  clientType: "website" | "app" | "admin";
  connectedAt: string;
}
const sseClients = new Map<string, SSEClient>();

// Broadcast to all active clients
function broadcastToClients(message: {
  type: string;
  entity?: string;
  action?: string;
  payload?: any;
  senderId?: string;
  timestamp: string;
  event?: any;
}) {
  const dataString = `data: ${JSON.stringify(message)}\n\n`;
  for (const [clientId, client] of sseClients.entries()) {
    try {
      client.res.write(dataString);
    } catch (err) {
      console.warn(`Failed to push to SSE client ${clientId}:`, err);
      sseClients.delete(clientId);
    }
  }
}

// Heartbeat keep-alive to keep all browser & mobile connections healthy
setInterval(() => {
  const pingData = `data: ${JSON.stringify({ type: "PING", timestamp: new Date().toISOString(), activeClients: sseClients.size })}\n\n`;
  for (const [clientId, client] of sseClients.entries()) {
    try {
      client.res.write(pingData);
    } catch (err) {
      sseClients.delete(clientId);
    }
  }
}, 15000);

// SSE Stream Endpoint
app.get("/api/sync/stream", (req, res) => {
  const clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const clientType = (req.query.clientType as any) || "website";

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders?.();

  sseClients.set(clientId, {
    id: clientId,
    res,
    clientType,
    connectedAt: new Date().toISOString(),
  });

  console.log(`[REALTIME SYNC] Client connected: ${clientId} (${clientType}). Total active: ${sseClients.size}`);

  // Send immediate INIT snapshot
  const initMessage = {
    type: "INIT",
    clientId,
    activeClients: sseClients.size,
    data: platformState,
    timestamp: new Date().toISOString(),
  };
  res.write(`data: ${JSON.stringify(initMessage)}\n\n`);

  req.on("close", () => {
    sseClients.delete(clientId);
    console.log(`[REALTIME SYNC] Client disconnected: ${clientId}. Remaining: ${sseClients.size}`);
  });
});

// Full state getter
app.get("/api/sync/state", (req, res) => {
  res.json({
    success: true,
    data: platformState,
    activeClients: sseClients.size,
    lastUpdated: platformState.lastUpdated,
  });
});

// Bi-directional state updater (called whenever website or app triggers an action)
app.post("/api/sync/update", (req, res) => {
  const { entity, action = "upsert", payload, senderId, source = "website", description } = req.body;

  if (!entity || payload === undefined) {
    return res.status(400).json({ error: "Missing entity or payload" });
  }

  platformState.lastUpdated = new Date().toISOString();

  // Update specific entity in server state
  if (entity === "projects") {
    if (Array.isArray(payload)) {
      platformState.projects = payload;
    } else if (action === "upsert") {
      const idx = platformState.projects.findIndex((p) => p.id === payload.id);
      if (idx >= 0) {
        platformState.projects[idx] = { ...platformState.projects[idx], ...payload };
      } else {
        platformState.projects.unshift(payload);
      }
    } else if (action === "delete") {
      platformState.projects = platformState.projects.filter((p) => p.id !== payload.id);
    }
  } else if (entity === "bids") {
    if (Array.isArray(payload)) {
      platformState.bids = payload;
    } else if (action === "upsert") {
      const idx = platformState.bids.findIndex((b) => b.id === payload.id);
      if (idx >= 0) {
        platformState.bids[idx] = { ...platformState.bids[idx], ...payload };
      } else {
        platformState.bids.unshift(payload);
      }
    } else if (action === "delete") {
      platformState.bids = platformState.bids.filter((b) => b.id !== payload.id);
    }
  } else if (entity === "contractors") {
    if (Array.isArray(payload)) {
      platformState.contractors = payload;
    } else if (action === "upsert") {
      const idx = platformState.contractors.findIndex((c) => c.id === payload.id);
      if (idx >= 0) {
        platformState.contractors[idx] = { ...platformState.contractors[idx], ...payload };
      } else {
        platformState.contractors.unshift(payload);
      }
    }
  } else if (entity === "chatMessages") {
    if (Array.isArray(payload)) {
      platformState.chatMessages = payload;
    } else if (action === "upsert") {
      platformState.chatMessages.push(payload);
    }
  } else if (entity === "emailLogs") {
    if (Array.isArray(payload)) {
      platformState.emailLogs = payload;
    } else if (action === "upsert") {
      platformState.emailLogs.unshift(payload);
    }
  }

  // Create an activity feed event
  const newEvent = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: `SYNC_${entity.toUpperCase()}_${action.toUpperCase()}`,
    title: description || `${entity} updated from ${source}`,
    description: typeof payload === "object" && payload.title ? payload.title : `Real-time synchronization event`,
    timestamp: new Date().toISOString(),
    source: source as any,
    city: payload?.city || "Texas",
  };
  platformState.activityFeed.unshift(newEvent);
  if (platformState.activityFeed.length > 50) {
    platformState.activityFeed = platformState.activityFeed.slice(0, 50);
  }

  // Broadcast to all other connected clients immediately
  broadcastToClients({
    type: "UPDATE",
    entity,
    action,
    payload,
    senderId,
    timestamp: new Date().toISOString(),
    event: newEvent,
  });

  res.json({
    success: true,
    activeClients: sseClients.size,
    lastUpdated: platformState.lastUpdated,
    event: newEvent,
  });
});

// Broadcast Custom Event / Message across Web & App
app.post("/api/sync/broadcast", (req, res) => {
  const { eventType = "NOTIFICATION", title, message, source = "website", data } = req.body;

  const eventPayload = {
    id: `act-${Date.now()}`,
    type: eventType,
    title: title || "Live Broadcast",
    description: message || "Synchronized across all active devices",
    timestamp: new Date().toISOString(),
    source: source as any,
  };

  platformState.activityFeed.unshift(eventPayload);

  broadcastToClients({
    type: "BROADCAST",
    payload: {
      eventType,
      title,
      message,
      data,
    },
    timestamp: new Date().toISOString(),
    event: eventPayload,
  });

  res.json({ success: true, activeClients: sseClients.size, event: eventPayload });
});

// Ping Test Endpoint to verify live communication between Website and App
app.post("/api/sync/test-ping", (req, res) => {
  const { sender = "Website User", city = "Austin, TX", message = "Cross-platform sync verification" } = req.body;

  const testEvent = {
    id: `ping-${Date.now()}`,
    type: "CROSS_DEVICE_PING",
    title: `⚡ Live Ping from ${sender}`,
    description: message,
    timestamp: new Date().toISOString(),
    source: "website" as const,
    city,
  };

  platformState.activityFeed.unshift(testEvent);

  broadcastToClients({
    type: "PING_TEST",
    payload: testEvent,
    timestamp: new Date().toISOString(),
    event: testEvent,
  });

  res.json({
    success: true,
    message: "Live synchronization test event broadcasted to all active website and app sessions!",
    activeClients: sseClients.size,
    event: testEvent,
  });
});

async function startServer() {
  // Vite dev middleware setup or static production assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server executing live under port ${PORT}`);
  });
}

startServer();
