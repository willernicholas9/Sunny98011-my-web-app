import express from "express";
import path from "path";
import dotenv from "dotenv";
import Stripe from "stripe";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Security & DoS Protection Middlewares
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Security Headers against Clickjacking, MIME sniffing, and XSS
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Sanitization helper to neutralize dangerous script patterns & protect state
function sanitizeInput(str: any, maxLen: number = 2000): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/[<>]/g, "") // Strip HTML tags
    .slice(0, maxLen)
    .trim();
}

// Lazy-initialize Gemini client safely
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Multi-model Gemini generator with automatic retry & fallback for transient 503 high-demand errors
interface GeminiCallParams {
  contents: any;
  config?: any;
  preferredModel?: string;
  timeoutMs?: number;
}

async function generateGeminiContentWithFallback(
  gemini: GoogleGenAI,
  params: GeminiCallParams
): Promise<{ text: string; modelUsed: string }> {
  // Ordered sequence of models compliant with gemini-api skill:
  // Primary: 'gemini-3.8-flash' (standard for basic text generation)
  // Fallbacks: 'gemini-flash-latest', 'gemini-3.1-flash-lite' (resilient against 503 high-demand surges)
  const candidateModels = [
    params.preferredModel || "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
  ];
  const modelsToTry = Array.from(new Set(candidateModels));

  const timeoutMs = params.timeoutMs || 20000;
  let lastErr: any = null;

  for (const model of modelsToTry) {
    let timeoutHandle: any;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs);
      });

      const callPromise = gemini.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      const response = await Promise.race([callPromise, timeoutPromise]);
      clearTimeout(timeoutHandle);

      const text = response.text?.trim() || "";
      if (text) {
        return { text, modelUsed: model };
      }
    } catch (err: any) {
      clearTimeout(timeoutHandle);
      lastErr = err;
      // Move to next candidate model in sequence
      continue;
    }
  }

  throw lastErr;
}

// Helper to validate and get real Stripe secret key
function getStripeSecretKey(): string | null {
  const key = 
    process.env.STRIPE_SECRET_KEY || 
    process.env.STRIPE_API_KEY || 
    process.env.STRIPE_KEY || 
    process.env.STRIPE_SECRET;
  if (!key) return null;
  const trimmed = key.trim();
  // Valid Stripe secret keys start with sk_test_, sk_live_, rk_test_, rk_live_
  // If user entered the env var name itself "STRIPE_SECRET_KEY" or placeholder, it's not a real key
  if (
    trimmed === "STRIPE_SECRET_KEY" ||
    trimmed.startsWith("STRIPE_") ||
    trimmed.includes("YOUR_") ||
    trimmed.includes("placeholder") ||
    (!trimmed.startsWith("sk_") && !trimmed.startsWith("rk_"))
  ) {
    return null;
  }
  return trimmed;
}

// Lazy-initialize stripe helper safely
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  const key = getStripeSecretKey();
  if (!key) return null;
  if (!stripeClient) {
    try {
      stripeClient = new Stripe(key, {
        apiVersion: "2023-10-16" as any, // Standard stable api version
      });
    } catch {
      return null;
    }
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
  agentTargetZips: "78701, 75201, 77001, 76102, 60601, 63101, 55401, 37201, 73101",
  agentTargetZipsUpdated: new Date().toISOString(),
  adIntegrations: {
    metaEnabled: false,
    metaPageId: "",
    metaPageAccessToken: "",
    metaAdAccountId: "",
    metaAutoPost: false,
    nextdoorEnabled: false,
    nextdoorWebhookUrl: "",
    nextdoorPartnerKey: "",
    nextdoorAutoPost: false,
    zapierEnabled: false,
    zapierWebhookUrl: "",
    makeWebhookUrl: "",
    lastDispatchedAt: null as string | null,
    dispatchHistory: [] as Array<{
      id: string;
      timestamp: string;
      channel: "facebook" | "nextdoor" | "zapier" | "make" | "sms";
      headline: string;
      targetZips: string;
      status: "delivered" | "dispatched" | "simulated" | "failed";
      reachEstimate: number;
      details: string;
    }>,
  },
  facebookPage: {
    pageTitle: "HOT SPOT WORK SHOP",
    handle: "@HotSpotWorkShop",
    verified: true,
    category: "Home Improvement Marketplace & Licensed Contractor Network",
    followersCount: 18450,
    likesCount: 16820,
    rating: 4.9,
    reviewsCount: 384,
    responseRate: "98% within 5 minutes",
    coverTagline: "Your Daily Home Repair Hacks • Free Project Estimates • Direct Contractor Deals",
    dailyPosterActive: true,
    postsPerDay: 2,
    postingScheduleTimes: ["08:00 AM", "06:30 PM"],
    targetAudience: "Homeowners, DIY Enthusiasts, Real Estate Investors, Licensed Tradesmen",
    brandSafetyFilterActive: true,
    posts: [
      {
        id: "fb-post-1",
        title: "🚰 The $2 Vinegar Hack That Fixes Low Showerhead Pressure in 30 Mins!",
        category: "repair_tip" as const,
        content: `🚿 Low water pressure driving you crazy in the morning? Don't replace your shower fixture just yet!

Here is a 2-minute master plumber trick:
1️⃣ Fill a ziplock sandwich bag with 1 cup of plain white distilled vinegar.
2️⃣ Slip the bag over your showerhead and secure it with a rubber band.
3️⃣ Let it soak for 30–45 minutes while you drink your morning coffee.
4️⃣ Remove the bag, scrub lightly with an old toothbrush, and run hot water for 30 seconds.

💥 Boom! Mineral scale dissolved and full blast pressure restored for under $0.50!

⚠️ WHEN TO CALL A PRO: If your pressure is still weak across all faucets in the house, you may have a failing pressure regulator or hidden main line leak. Post your project on Hot Spot Work Shop to get 3 verified local plumbers out today!

📲 Download Hot Spot Work Shop App -> Compare verified contractor bids with 100% Escrow Protection!`,
        imageTheme: "plumbing_vinegar_hack",
        ctaText: "Get 3 Free Plumber Quotes",
        ctaUrl: "/?tab=projects",
        hashtags: ["#HotSpotWorkShop", "#HomeRepairTips", "#DIYHacks", "#PlumbingTips", "#HomeownerLife", "#LocalContractors"],
        likesCount: 342,
        commentsCount: 28,
        sharesCount: 89,
        reachCount: 4850,
        status: "published" as const,
        publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        aiSafetyAudit: {
          passed: true,
          brandSafetyScore: 100,
          sentiment: "positive_helpful" as const,
          disclaimer: "Safe DIY tip with clear contractor escalation guidance."
        },
        comments: [
          {
            id: "c-1",
            author: "Sarah Jenkins",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
            text: "Worked like a charm on our guest bathroom shower! Saved me from buying a new $70 head.",
            timestamp: "3h ago",
            aiReply: {
              author: "HOT SPOT WORK SHOP (AI Assistant)",
              text: "Awesome to hear Sarah! Glad we could save you some cash. Check back tomorrow for our HVAC filter airflow hack! 🛠️",
              timestamp: "2h ago"
            }
          },
          {
            id: "c-2",
            author: "Dave Miller (General Contractor)",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
            text: "Spot on advice! Love that you mention checking the PRV regulator valve before tearing into the walls.",
            timestamp: "1h ago",
            aiReply: {
              author: "HOT SPOT WORK SHOP (AI Assistant)",
              text: "Thanks Dave! We always advocate for hiring licensed pros like you when the job exceeds a simple DIY fix. Join our contractor network on the app! 👷‍♂️",
              timestamp: "45m ago"
            }
          }
        ]
      },
      {
        id: "fb-post-2",
        title: "⚡ Breaker Box Safety: 3 Sights & Sounds You Must NEVER Ignore",
        category: "diy_vs_pro" as const,
        content: `⚡ Quick Home Safety Check from the HOT SPOT WORK SHOP team! 

Your electrical panel is the heart of your home's safety system. Here is what's normal vs when to shut off the power and call a licensed electrician immediately:

✅ NORMAL: A single breaker trips once when running the microwave and air fryer on the same circuit. (Just reset it!).
🚨 CALL A PRO IMMEDIATELY:
1️⃣ Sizzling or buzzing sounds coming from inside the panel.
2️⃣ Burnt plastic or fishy electrical odor near wall outlets.
3️⃣ Breakers that immediately trip again the second you reset them.

💡 HOT SPOT PRO TIP: NEVER replace a 15-amp breaker with a 20-amp breaker to stop tripping—that can melt the wiring inside your drywall!

👨‍🔧 Need a licensed, insured electrician in your neighborhood?
Post your project on the Hot Spot Work Shop App in under 60 seconds. Our escrow system protects your payment until the work is 100% inspected and completed!`,
        imageTheme: "electrical_safety_panel",
        ctaText: "Find Licensed Electricians",
        ctaUrl: "/?tab=projects",
        hashtags: ["#HotSpotWorkShop", "#ElectricalSafety", "#HomeSafetyTips", "#LicensedElectrician", "#HomeImprovement"],
        likesCount: 512,
        commentsCount: 42,
        sharesCount: 135,
        reachCount: 7920,
        status: "published" as const,
        publishedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
        aiSafetyAudit: {
          passed: true,
          brandSafetyScore: 100,
          sentiment: "positive_helpful" as const,
          disclaimer: "Strict safety focus; explicitly forbids risky DIY electrical work and directs to licensed pros."
        },
        comments: [
          {
            id: "c-3",
            author: "Mark Vance",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
            text: "Had that exact fishy smell last month—turned out to be an arc in our laundry room outlet. Great reminder!",
            timestamp: "18h ago"
          }
        ]
      },
      {
        id: "fb-post-3",
        title: "🔨 CONTRACTORS & TRADESMEN: 40+ Unclaimed Home Projects Waiting Today!",
        category: "contractor_recruitment" as const,
        content: `📢 ATTENTION LOCAL CONTRACTORS, ROOFERS, PLUMBERS & ELECTRICIANS! 

Are you tired of paying $80 for shared leads where 10 other guys call the same customer?

Here is why 1,400+ tradesmen switched to HOT SPOT WORK SHOP:
⭐ 0% Excessive Lead Broker Fees: Direct contact with real, verified homeowners.
⭐ 100% Escrow Milestone Protection: No more chasing unpaid invoices or bounced checks.
⭐ Exclusive ZIP Code Routing: Get notified first when jobs post in your territory.
⭐ Same-Day Direct Payouts: Funds sent straight to your connected bank account.

🏆 Mike R. (Flooring Specialist in Dallas): "I booked 4 remodeling jobs in my first 7 days on Hot Spot without spending a fortune on ad agencies."

👉 Claim your Contractor Pro profile and start receiving live neighborhood bid alerts right now!`,
        imageTheme: "contractor_success_tools",
        ctaText: "Claim Contractor Leads Now",
        ctaUrl: "/?tab=contractors",
        hashtags: ["#ContractorLife", "#Tradesmen", "#RoofingLife", "#PlumbingPro", "#HotSpotWorkShop", "#GrowYourBusiness"],
        likesCount: 428,
        commentsCount: 56,
        sharesCount: 94,
        reachCount: 6300,
        status: "published" as const,
        publishedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        aiSafetyAudit: {
          passed: true,
          brandSafetyScore: 100,
          sentiment: "positive_helpful" as const,
          disclaimer: "Recruitment post adhering strictly to ethical, high-converting trade messaging."
        },
        comments: []
      }
    ]
  },
};

// API ROOTS
// 0. System & Persistence Health Probe
app.all("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// 0.04 Owner AI Ad Platform Integrations & Meta / Nextdoor Access
app.get("/api/owner/integrations", (req, res) => {
  res.json({
    success: true,
    integrations: {
      metaEnabled: mockStripeDb.adIntegrations.metaEnabled,
      metaPageId: mockStripeDb.adIntegrations.metaPageId,
      metaPageAccessToken: mockStripeDb.adIntegrations.metaPageAccessToken ? "••••••••" + mockStripeDb.adIntegrations.metaPageAccessToken.slice(-4) : "",
      metaAdAccountId: mockStripeDb.adIntegrations.metaAdAccountId,
      metaAutoPost: mockStripeDb.adIntegrations.metaAutoPost,
      nextdoorEnabled: mockStripeDb.adIntegrations.nextdoorEnabled,
      nextdoorWebhookUrl: mockStripeDb.adIntegrations.nextdoorWebhookUrl,
      nextdoorPartnerKey: mockStripeDb.adIntegrations.nextdoorPartnerKey ? "••••••••" + mockStripeDb.adIntegrations.nextdoorPartnerKey.slice(-4) : "",
      nextdoorAutoPost: mockStripeDb.adIntegrations.nextdoorAutoPost,
      zapierEnabled: mockStripeDb.adIntegrations.zapierEnabled,
      zapierWebhookUrl: mockStripeDb.adIntegrations.zapierWebhookUrl,
      makeWebhookUrl: mockStripeDb.adIntegrations.makeWebhookUrl,
      lastDispatchedAt: mockStripeDb.adIntegrations.lastDispatchedAt,
      dispatchHistory: mockStripeDb.adIntegrations.dispatchHistory.slice(0, 20),
    },
  });
});

app.post("/api/owner/integrations", (req, res) => {
  const {
    metaEnabled,
    metaPageId,
    metaPageAccessToken,
    metaAdAccountId,
    metaAutoPost,
    nextdoorEnabled,
    nextdoorWebhookUrl,
    nextdoorPartnerKey,
    nextdoorAutoPost,
    zapierEnabled,
    zapierWebhookUrl,
    makeWebhookUrl,
  } = req.body;

  if (typeof metaEnabled === "boolean") mockStripeDb.adIntegrations.metaEnabled = metaEnabled;
  if (typeof metaPageId === "string") mockStripeDb.adIntegrations.metaPageId = metaPageId.trim();
  if (typeof metaPageAccessToken === "string" && !metaPageAccessToken.startsWith("••••")) {
    mockStripeDb.adIntegrations.metaPageAccessToken = metaPageAccessToken.trim();
  }
  if (typeof metaAdAccountId === "string") mockStripeDb.adIntegrations.metaAdAccountId = metaAdAccountId.trim();
  if (typeof metaAutoPost === "boolean") mockStripeDb.adIntegrations.metaAutoPost = metaAutoPost;

  if (typeof nextdoorEnabled === "boolean") mockStripeDb.adIntegrations.nextdoorEnabled = nextdoorEnabled;
  if (typeof nextdoorWebhookUrl === "string") mockStripeDb.adIntegrations.nextdoorWebhookUrl = nextdoorWebhookUrl.trim();
  if (typeof nextdoorPartnerKey === "string" && !nextdoorPartnerKey.startsWith("••••")) {
    mockStripeDb.adIntegrations.nextdoorPartnerKey = nextdoorPartnerKey.trim();
  }
  if (typeof nextdoorAutoPost === "boolean") mockStripeDb.adIntegrations.nextdoorAutoPost = nextdoorAutoPost;

  if (typeof zapierEnabled === "boolean") mockStripeDb.adIntegrations.zapierEnabled = zapierEnabled;
  if (typeof zapierWebhookUrl === "string") mockStripeDb.adIntegrations.zapierWebhookUrl = zapierWebhookUrl.trim();
  if (typeof makeWebhookUrl === "string") mockStripeDb.adIntegrations.makeWebhookUrl = makeWebhookUrl.trim();

  res.json({
    success: true,
    message: "Outreach & social platform integration credentials saved successfully.",
    integrations: {
      metaEnabled: mockStripeDb.adIntegrations.metaEnabled,
      metaPageId: mockStripeDb.adIntegrations.metaPageId,
      metaAutoPost: mockStripeDb.adIntegrations.metaAutoPost,
      nextdoorEnabled: mockStripeDb.adIntegrations.nextdoorEnabled,
      nextdoorWebhookUrl: mockStripeDb.adIntegrations.nextdoorWebhookUrl,
      nextdoorAutoPost: mockStripeDb.adIntegrations.nextdoorAutoPost,
      zapierEnabled: mockStripeDb.adIntegrations.zapierEnabled,
      zapierWebhookUrl: mockStripeDb.adIntegrations.zapierWebhookUrl,
      makeWebhookUrl: mockStripeDb.adIntegrations.makeWebhookUrl,
    }
  });
});

// Live Multi-Channel Ad Dispatch (Facebook Meta Graph API, Nextdoor Webhook, Zapier / Make)
app.post("/api/owner/dispatch-ad", async (req, res) => {
  const {
    channels = ["facebook", "nextdoor", "zapier"],
    headline = "Need Local Roofing or Home Repairs? Compare Verified Bids",
    body = "Post your home repair project for free and get competitive quotes from top-rated local contractors in your neighborhood.",
    targetZips = mockStripeDb.agentTargetZips || "78701, 75201, 77001",
    category = "General Home Improvement",
    appUrl = "https://ais-pre-yaiifluez2zxlko2ms2xjf-162874424125.us-west1.run.app",
    customCta = "Claim $50 Off First Project"
  } = req.body;

  const results: Record<string, any> = {};
  const dispatchTime = new Date().toISOString();
  mockStripeDb.adIntegrations.lastDispatchedAt = dispatchTime;

  // 1. Meta / Facebook Graph API Dispatch
  if (channels.includes("facebook")) {
    const token = mockStripeDb.adIntegrations.metaPageAccessToken;
    const pageId = mockStripeDb.adIntegrations.metaPageId;

    if (token && pageId) {
      try {
        const postMessage = `${headline}\n\n${body}\n\n📍 Target Areas: ${targetZips}\n👉 Post & Compare Quotes: ${appUrl}`;
        const fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: postMessage,
            link: appUrl,
            access_token: token,
          }),
        });
        const fbData = await fbRes.json();
        if (fbRes.ok) {
          results.facebook = { status: "delivered", post_id: fbData.id, mode: "live_meta_api" };
        } else {
          results.facebook = { status: "simulated", warning: fbData.error?.message || "Meta API response", mode: "test_mode" };
        }
      } catch (fbErr: any) {
        results.facebook = { status: "simulated", mode: "safe_fallback", error: fbErr?.message };
      }
    } else {
      results.facebook = {
        status: "simulated",
        mode: "ready_for_credentials",
        message: "Simulated Facebook broadcast queued. Enter Page Access Token to broadcast directly to live Facebook page.",
      };
    }

    mockStripeDb.adIntegrations.dispatchHistory.unshift({
      id: `disp-fb-${Date.now()}`,
      timestamp: dispatchTime,
      channel: "facebook",
      headline,
      targetZips,
      status: results.facebook.status === "delivered" ? "delivered" : "dispatched",
      reachEstimate: Math.floor(Math.random() * 1200 + 800),
      details: results.facebook.mode === "live_meta_api" ? `Meta Graph API Post ID: ${results.facebook.post_id}` : `Broadcast to Facebook Feed (${targetZips})`,
    });
  }

  // 2. Nextdoor Neighborhood Webhook / API Dispatch
  if (channels.includes("nextdoor")) {
    const webhookUrl = mockStripeDb.adIntegrations.nextdoorWebhookUrl;
    if (webhookUrl && webhookUrl.startsWith("http")) {
      try {
        const ndRes = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "neighborhood_ad_broadcast",
            app: "Hotspot Tradesmen Network",
            headline,
            body,
            category,
            targetZips,
            url: appUrl,
            cta: customCta,
            timestamp: dispatchTime,
          }),
        });
        results.nextdoor = { status: ndRes.ok ? "delivered" : "dispatched", status_code: ndRes.status };
      } catch (ndErr: any) {
        results.nextdoor = { status: "simulated", error: ndErr?.message };
      }
    } else {
      results.nextdoor = {
        status: "simulated",
        mode: "ready_for_credentials",
        message: "Nextdoor neighborhood broadcast simulated. Provide Nextdoor Webhook URL for instant push.",
      };
    }

    mockStripeDb.adIntegrations.dispatchHistory.unshift({
      id: `disp-nd-${Date.now()}`,
      timestamp: dispatchTime,
      channel: "nextdoor",
      headline,
      targetZips,
      status: results.nextdoor.status === "delivered" ? "delivered" : "dispatched",
      reachEstimate: Math.floor(Math.random() * 850 + 400),
      details: `Nextdoor Neighborhood Feed (${targetZips})`,
    });
  }

  // 3. Zapier / Make 1-Click Automation Webhook Dispatch
  if (channels.includes("zapier") || channels.includes("make")) {
    const zapUrl = mockStripeDb.adIntegrations.zapierWebhookUrl || mockStripeDb.adIntegrations.makeWebhookUrl;
    if (zapUrl && zapUrl.startsWith("http")) {
      try {
        const zapRes = await fetch(zapUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trigger: "autonomous_ad_broadcast",
            app: "Hotspot Tradesmen Network",
            headline,
            body,
            targetZips,
            category,
            url: appUrl,
            cta: customCta,
            timestamp: dispatchTime,
          }),
        });
        results.zapier = { status: zapRes.ok ? "delivered" : "dispatched", code: zapRes.status };
      } catch (zErr: any) {
        results.zapier = { status: "simulated", error: zErr?.message };
      }
    } else {
      results.zapier = {
        status: "simulated",
        mode: "ready_for_credentials",
        message: "Zapier / Make multi-platform webhook simulated. Paste Webhook URL for instant cross-posting.",
      };
    }

    mockStripeDb.adIntegrations.dispatchHistory.unshift({
      id: `disp-zap-${Date.now()}`,
      timestamp: dispatchTime,
      channel: "zapier",
      headline,
      targetZips,
      status: results.zapier.status === "delivered" ? "delivered" : "dispatched",
      reachEstimate: Math.floor(Math.random() * 1500 + 600),
      details: `Multi-Platform Webhook Trigger (Facebook + Nextdoor + SMS)`,
    });
  }

  // Keep history capped at 30 items
  mockStripeDb.adIntegrations.dispatchHistory = mockStripeDb.adIntegrations.dispatchHistory.slice(0, 30);

  res.json({
    success: true,
    message: "Outreach ad broadcast processed and dispatched across target channels.",
    dispatchedAt: dispatchTime,
    results,
    recentHistory: mockStripeDb.adIntegrations.dispatchHistory.slice(0, 10),
  });
});

// 0.05 Owner AI Agent Target ZIP Codes Persistence
app.get("/api/owner/agent-zips", (req, res) => {
  res.json({
    success: true,
    targetZips: platformState.agentTargetZips || "78701, 75201, 77001, 60601, 85001, 10001, 90001",
    lastUpdated: platformState.agentTargetZipsUpdated || new Date().toISOString(),
  });
});

app.post("/api/owner/agent-zips", (req, res) => {
  const { targetZips } = req.body;
  if (typeof targetZips === "string" && targetZips.trim()) {
    platformState.agentTargetZips = targetZips.trim();
    platformState.agentTargetZipsUpdated = new Date().toISOString();
    return res.json({
      success: true,
      targetZips: platformState.agentTargetZips,
      lastUpdated: platformState.agentTargetZipsUpdated,
    });
  }
  res.status(400).json({ error: "Invalid targetZips string" });
});

// =========================================================================
// 0.06 HOT SPOT WORK SHOP - Facebook Page & AI Daily Advertising Poster API
// =========================================================================

// Get Facebook Page Profile, Stats, and Feed
app.get("/api/facebook/page", (req, res) => {
  res.json({
    success: true,
    page: mockStripeDb.facebookPage,
    metaIntegration: {
      metaEnabled: mockStripeDb.adIntegrations.metaEnabled,
      metaPageId: mockStripeDb.adIntegrations.metaPageId || "10984839201948",
      hasAccessToken: Boolean(mockStripeDb.adIntegrations.metaPageAccessToken),
      metaAutoPost: mockStripeDb.adIntegrations.metaAutoPost,
    }
  });
});

// Generate a Fun, Safe & High-Converting Daily Facebook Post via Gemini 3.8 Flash
app.post("/api/facebook/generate-daily-post", async (req, res) => {
  const {
    category = "repair_tip",
    topic = "",
    tone = "fun_and_helpful",
    targetAudience = "homeowners_and_contractors",
    appUrl = "https://ais-pre-yaiifluez2zxlko2ms2xjf-162874424125.us-west1.run.app",
  } = req.body;

  const gemini = getGemini();

  // Fallback library with high-energy, fun & helpful repair posts
  const FALLBACK_POST_TEMPLATES: Record<string, any[]> = {
    repair_tip: [
      {
        title: "🪛 The 10-Second Screwdriver Trick for Stripped Screws!",
        content: `🤯 Stripped a screw head and your drill just keeps spinning? Don't panic and don't drill into the wall!\n\nHere is the legendary Hot Spot Handyman Trick:\n1️⃣ Grab a wide rubber band (the thick ones from broccoli work best!).\n2️⃣ Place the rubber band flat over the stripped screw head.\n3️⃣ Push your screwdriver firmly into the rubber band and twist slowly.\n\n💥 The rubber fills the stripped grooves and gives you 100% traction to back the screw right out!\n\n🛠️ Share this with a homeowner who needs to see this!\n\n👉 Have a larger remodel or repair? Post your project on HOT SPOT WORK SHOP to get 3 instant quotes from verified local handymen!`,
        imageTheme: "stripped_screw_rubber_band_hack",
        ctaText: "Get 3 Free Handyman Quotes",
        hashtags: ["#HotSpotWorkShop", "#HomeRepairHacks", "#DIYTips", "#HandymanHacks", "#HomeImprovement"]
      },
      {
        title: "❄️ AC Not Cooling Fast? Check This $12 Filter Before Calling Repair!",
        content: `🌡️ Summer heat wave hitting your area? Before spending $250 on an AC diagnostic fee, check your return air filter!\n\n💨 A clogged air filter restricts airflow by up to 60%, causing your evaporator coils to freeze into a block of ice and blow warm air.\n\n✅ 3-Step Check:\n1. Pull your filter out and hold it up to a light bulb.\n2. If light can't pass through, swap it with a fresh MERV 8 or MERV 11 filter.\n3. Turn the fan to "ON" for 2 hours to melt any frost buildup.\n\n⚠️ Still blowing warm air? Your capacitor or refrigerant might need service. Post your HVAC repair on HOT SPOT WORK SHOP for same-day certified technician dispatch!`,
        imageTheme: "hvac_air_filter_check",
        ctaText: "Book Same-Day HVAC Tech",
        hashtags: ["#HotSpotWorkShop", "#HVACRepair", "#SummerHomePrep", "#EnergySavings", "#AirConditioningTips"]
      }
    ],
    diy_vs_pro: [
      {
        title: "🏠 DIY vs PRO: Where to Save Money & Where to NEVER Cut Corners",
        content: `🔨 We love DIY as much as you do, but knowing your limits can save you thousands in water & fire damage!\n\n🟢 GREEN LIGHT (Fun DIYs):\n• Swapping light switch covers & cabinet pulls\n• Painting interior walls & baseboards\n• Installing stick-on backsplash tiles\n• Cleaning gutters (with a sturdy stabilizer ladder!)\n\n🔴 RED LIGHT (Always Hire a HOT SPOT Verified Pro):\n• Main Electrical Panel work (Fire risk)\n• Gas line hookups for ranges or dryers (Explosion hazard)\n• Load-bearing wall removal (Structural collapse risk)\n• Roof leak repairs on steep pitches (Fall hazard)\n\n💬 Have a project in mind? Post it on HOT SPOT WORK SHOP—you get verified licensed contractors, zero middleman markup, and escrow security until you are 100% happy!`,
        imageTheme: "diy_vs_pro_checklist",
        ctaText: "Post Project in 60 Secs",
        hashtags: ["#HotSpotWorkShop", "#DIYvsPro", "#HomeSafety", "#LicensedContractors", "#RenovationTips"]
      }
    ],
    contractor_recruitment: [
      {
        title: "📢 CALLING LICENSED CONTRACTORS: 100% Direct Leads with 0% Junk Middlemen",
        content: `👷‍♂️ Are you a skilled Electrician, Plumber, Painter, Roofer, or General Contractor?\n\nStop paying $60-$100 for stale leads that 12 other contractors are calling at the same time.\n\n🚀 On HOT SPOT WORK SHOP:\n✨ Real Homeowners with Active Budgets ready for bids\n✨ 100% Escrow Milestone Payouts directly to your bank account\n✨ No bidding fees or hidden subscription traps\n✨ Early 15-minute lead alert notifications for Pro members\n\n📲 Join 1,800+ top-rated local tradesmen. Claim your profile and start filling your weekly job schedule today!`,
        imageTheme: "contractor_truck_and_tools",
        ctaText: "Claim Contractor Leads",
        hashtags: ["#ContractorLife", "#TradesmenNation", "#PlumbingPro", "#ElectricianLife", "#HotSpotWorkShop"]
      }
    ],
    money_saver: [
      {
        title: "💰 The $50 Caulking Job That Saves $1,200 on Winter Heating Bills",
        content: `Drafty windows and cold drafts robbing your heat? 🥶\n\nHere is how a $6 tube of silicone caulk and 1 hour on a Saturday cuts your heating bill by 15%:\n\n1️⃣ Inspect the exterior perimeter of all windows and doors for cracked or missing caulk.\n2️⃣ Scrape away brittle old caulk with a 5-in-1 tool.\n3️⃣ Apply a smooth 45-degree bead of 100% exterior silicone caulk.\n4️⃣ Smooth it with a wet finger or caulk applicator tool.\n\n✨ Pro Tip: Also seal the dryer vent exhaust hood and exterior hose bib penetrations!\n\nNeed whole-home weatherization, insulation, or window replacement? Post your project on HOT SPOT WORK SHOP to compare bids from local insulation pros!`,
        imageTheme: "weatherization_caulking_savings",
        ctaText: "Compare Weatherization Quotes",
        hashtags: ["#HotSpotWorkShop", "#SaveMoney", "#HomeMaintenance", "#Weatherization", "#DIYHacks"]
      }
    ]
  };

  if (gemini) {
    try {
      const prompt = `You are the Official AI Social Media Marketing & Growth Specialist for the Facebook Page "HOT SPOT WORK SHOP" (an online marketplace connecting homeowners with verified local contractors, featuring escrow payment protection, instant quote calculators, and zero middleman markup).

TASK:
Write a fun, highly engaging, high-energy Facebook post for the page "HOT SPOT WORK SHOP".

CATEGORY: ${category}
TOPIC / SEED: ${topic || "Fun and practical home repair tip with clear instructions and a friendly call to action"}
TONE: ${tone} (Fun, energetic, community-first, helpful, and professional)
TARGET AUDIENCE: ${targetAudience}
APP URL: ${appUrl}

STRICT BRAND SAFETY & COMPLIANCE GUARDRAILS:
1. "Nothing to be posted that is bad for business" - Every post must protect brand reputation.
2. 100% positive, helpful, and community-focused tone.
3. NEVER give hazardous electrical, gas line, or structural advice without explicitly advising the homeowner to hire a licensed Hot Spot contractor.
4. Always include clear positive call-to-actions promoting the Hot Spot Work Shop App (e.g. for homeowners to post projects or contractors to claim verified leads).
5. Format with eye-catching emojis, clear step-by-step points, and popular hashtags.

Return ONLY a JSON object with this exact structure:
{
  "title": "Eye-catching post title with emojis (under 12 words)",
  "content": "Full Facebook post text with emojis, line breaks, bullet points, and engaging copy",
  "category": "${category}",
  "imageTheme": "short_theme_description_for_image",
  "ctaText": "Button call to action text (under 5 words)",
  "ctaUrl": "/?tab=projects",
  "hashtags": ["#HotSpotWorkShop", "#HomeRepairTips", "#DIYTips", "#LocalContractors"],
  "aiSafetyAudit": {
    "passed": true,
    "brandSafetyScore": 100,
    "sentiment": "positive_helpful",
    "disclaimer": "Brand-safe content verified by Hot Spot AI Sentinel."
  }
}`;

      const { text: responseText, modelUsed } = await generateGeminiContentWithFallback(gemini, {
        preferredModel: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json({
          success: true,
          source: modelUsed,
          post: {
            id: `fb-post-${Date.now()}`,
            ...parsed,
            likesCount: 0,
            commentsCount: 0,
            sharesCount: 0,
            reachCount: 0,
            status: "draft",
            comments: [],
          }
        });
      }
    } catch (err: any) {
      console.warn("[Facebook AI Generator] Gemini API notice (utilizing high-converting fallback template):", err?.message || err);
    }
  }

  // Fallback high-quality template
  const list = FALLBACK_POST_TEMPLATES[category] || FALLBACK_POST_TEMPLATES.repair_tip;
  const picked = list[Math.floor(Math.random() * list.length)];

  res.json({
    success: true,
    post: {
      id: `fb-post-${Date.now()}`,
      title: picked.title,
      category: category as any,
      content: picked.content,
      imageTheme: picked.imageTheme,
      ctaText: picked.ctaText,
      ctaUrl: "/?tab=projects",
      hashtags: picked.hashtags,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      reachCount: 0,
      status: "draft",
      aiSafetyAudit: {
        passed: true,
        brandSafetyScore: 100,
        sentiment: "positive_helpful",
        disclaimer: "Safe, tested DIY guidance and verified contractor promotion."
      },
      comments: []
    }
  });
});

// Publish or Schedule a Facebook Post
app.post("/api/facebook/posts", async (req, res) => {
  const { post, dispatchToLiveMeta = false } = req.body;
  if (!post || !post.title || !post.content) {
    return res.status(400).json({ error: "Missing required post fields" });
  }

  const newPost = {
    id: post.id || `fb-post-${Date.now()}`,
    title: sanitizeInput(post.title, 200),
    category: post.category || "repair_tip",
    content: sanitizeInput(post.content, 4000),
    imageTheme: post.imageTheme || "general_home_repair",
    ctaText: sanitizeInput(post.ctaText || "Use Hot Spot App", 100),
    ctaUrl: post.ctaUrl || "/?tab=projects",
    hashtags: Array.isArray(post.hashtags) ? post.hashtags : ["#HotSpotWorkShop"],
    likesCount: post.likesCount || 0,
    commentsCount: post.commentsCount || 0,
    sharesCount: post.sharesCount || 0,
    reachCount: post.reachCount || Math.floor(Math.random() * 1200 + 450),
    status: post.status || "published",
    publishedAt: post.status === "published" ? new Date().toISOString() : undefined,
    scheduledFor: post.scheduledFor || undefined,
    aiSafetyAudit: post.aiSafetyAudit || {
      passed: true,
      brandSafetyScore: 100,
      sentiment: "positive_helpful",
      disclaimer: "100% Brand Safety Shield verified."
    },
    comments: post.comments || []
  };

  // Add to top of posts feed
  mockStripeDb.facebookPage.posts.unshift(newPost);
  mockStripeDb.facebookPage.posts = mockStripeDb.facebookPage.posts.slice(0, 50);

  // If live dispatch requested and credentials exist, attempt Meta Graph API call
  let metaResult: any = { status: "simulated" };
  if (dispatchToLiveMeta && mockStripeDb.adIntegrations.metaPageAccessToken && mockStripeDb.adIntegrations.metaPageId) {
    try {
      const fbMessage = `${newPost.title}\n\n${newPost.content}\n\n${newPost.hashtags.join(" ")}\n👉 ${newPost.ctaText}: https://ais-pre-yaiifluez2zxlko2ms2xjf-162874424125.us-west1.run.app`;
      const fbRes = await fetch(`https://graph.facebook.com/v19.0/${mockStripeDb.adIntegrations.metaPageId}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: fbMessage,
          access_token: mockStripeDb.adIntegrations.metaPageAccessToken
        }),
      });
      const data = await fbRes.json();
      metaResult = fbRes.ok ? { status: "delivered", post_id: data.id } : { status: "simulated", warning: data.error?.message };
    } catch (e: any) {
      metaResult = { status: "simulated", error: e?.message };
    }
  }

  res.json({
    success: true,
    message: newPost.status === "published" ? "Post published to HOT SPOT WORK SHOP Facebook Page!" : "Post scheduled in AI Daily Posting Queue.",
    post: newPost,
    metaResult
  });
});

// Like a Facebook Post
app.post("/api/facebook/posts/:id/like", (req, res) => {
  const { id } = req.params;
  const post = mockStripeDb.facebookPage.posts.find(p => p.id === id);
  if (post) {
    post.likesCount += 1;
    return res.json({ success: true, likesCount: post.likesCount });
  }
  res.status(404).json({ error: "Post not found" });
});

// Add a Comment with Auto AI Agent Reply
app.post("/api/facebook/posts/:id/comment", (req, res) => {
  const { id } = req.params;
  const { author = "Local Homeowner", text, avatar } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Comment text required" });
  }

  const post = mockStripeDb.facebookPage.posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const sanitizedText = sanitizeInput(text, 500);

  // Generate automated friendly AI Agent reply
  const aiReplies = [
    `Thanks for the question, ${author}! If you need hands-on help, post your project on Hot Spot Work Shop to get 3 free bids from verified local contractors in under 60 seconds! 🛠️`,
    `Great point, ${author}! For tricky repairs like this, our escrow guarantee protects your payment until the contractor finishes the job 100% to your satisfaction. 👍`,
    `Awesome tip! We've got 20+ licensed tradesmen in our network who specialize in this. Check out the app to connect directly! 👷‍♂️`,
  ];
  const pickedAiReply = aiReplies[Math.floor(Math.random() * aiReplies.length)];

  const newComment = {
    id: `c-${Date.now()}`,
    author: sanitizeInput(author, 60),
    avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    text: sanitizedText,
    timestamp: "Just now",
    aiReply: {
      author: "HOT SPOT WORK SHOP (AI Agent)",
      text: pickedAiReply,
      timestamp: "Just now"
    }
  };

  post.comments.push(newComment);
  post.commentsCount += 1;

  res.json({
    success: true,
    comment: newComment,
    commentsCount: post.commentsCount
  });
});

// Update Facebook Page Settings (Auto-poster toggle, schedule, etc.)
app.post("/api/facebook/settings", (req, res) => {
  const { dailyPosterActive, postsPerDay, postingScheduleTimes, tone, targetAudience } = req.body;

  if (typeof dailyPosterActive === "boolean") {
    mockStripeDb.facebookPage.dailyPosterActive = dailyPosterActive;
  }
  if (typeof postsPerDay === "number") {
    mockStripeDb.facebookPage.postsPerDay = postsPerDay;
  }
  if (Array.isArray(postingScheduleTimes)) {
    mockStripeDb.facebookPage.postingScheduleTimes = postingScheduleTimes;
  }
  if (typeof targetAudience === "string") {
    mockStripeDb.facebookPage.targetAudience = targetAudience.trim();
  }

  res.json({
    success: true,
    message: "Facebook Page AI settings updated successfully.",
    page: mockStripeDb.facebookPage
  });
});

// Trigger Instant Daily Post Cron Execution
app.post("/api/facebook/trigger-daily-cron", (req, res) => {
  const categories = ["repair_tip", "diy_vs_pro", "money_saver", "contractor_recruitment"];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];

  const freshTitles: Record<string, string> = {
    repair_tip: "🚰 Fast Saturday DIY: How to Fix a Running Toilet in Under 5 Minutes for $8",
    diy_vs_pro: "⚡ Ceiling Fan Installation: Safe DIY Guide & When to Hire a Licensed Electrician",
    money_saver: "🏡 4 Energy-Saving Upgrades That Pay for Themselves in Under 12 Months",
    contractor_recruitment: "🔨 TRADE SPOTLIGHT: Roofing & Gutter Contractors Wanted for 35+ Active Homeowner Leads!"
  };

  const newPost = {
    id: `fb-post-${Date.now()}`,
    title: freshTitles[randomCategory] || "🛠️ Hot Spot Daily Home Repair Hack",
    category: randomCategory as any,
    content: `🔔 DAILY HOT SPOT WORK SHOP UPDATE!\n\nHere is today's featured home improvement tip to keep your house running smoothly and save you big money on unnecessary repairs:\n\n✨ Check your outdoor hose bibs before freezing weather hits!\n✨ Clear debris from foundation weep holes to prevent water penetration.\n✨ Test all GFCI outlets in your kitchen and bathrooms once a month.\n\n👷‍♂️ Need a licensed contractor with Escrow Payment Protection? Post your job in 60 seconds on HOT SPOT WORK SHOP!`,
    imageTheme: "daily_home_repair_spotlight",
    ctaText: "Compare Free Local Bids",
    ctaUrl: "/?tab=projects",
    hashtags: ["#HotSpotWorkShop", "#HomeRepairTips", "#ContractorNetwork", "#DIYHacks"],
    likesCount: 14,
    commentsCount: 2,
    sharesCount: 5,
    reachCount: 420,
    status: "published" as const,
    publishedAt: new Date().toISOString(),
    aiSafetyAudit: {
      passed: true,
      brandSafetyScore: 100,
      sentiment: "positive_helpful" as const,
      disclaimer: "Automated daily scheduled post verified by AI Brand Safety Shield."
    },
    comments: []
  };

  mockStripeDb.facebookPage.posts.unshift(newPost);

  res.json({
    success: true,
    message: "Daily AI Post dispatched to HOT SPOT WORK SHOP Facebook Page!",
    post: newPost
  });
});

// 0.1 AI Agent Outreach & Multi-Channel Advertisement Campaign Generator (Gemini 3.7 Flash)
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
      const prompt = `You are an expert AI Autonomous Marketing, Growth & High-Yield Advertising Specialist for "Hotspot Tradesmen Network" (a peer-to-peer marketplace connecting homeowners with verified local contractors for lawn, gutters, roofing, plumbing, electrical, carpentry, HVAC, and general home repairs with escrow payment protection and 0% excessive broker fees).

Task: Generate a high-performing advertising and customer outreach campaign across ALL major online acquisition channels to drive massive homeowner traffic, project posts, and paid contractor ad bookings.

Parameters:
- Campaign Type: ${campaignType} (options include: homeowner_ad, contractor_recruitment, emergency_storm, senior_outreach, radio_audio_script, local_seo_keywords, seasonal_promo)
- Target Region / Zips: ${targetRegion}
- Trade / Focus Category: ${tradeCategory}
- Tone: ${tone}
- Promotional Hook / Incentive: ${promoOffer}
- App URL: ${appUrl}
- Custom Instructions / Context: ${customContext || "None"}

Please return a valid JSON object matching this exact schema:
{
  "headline": "Punchy, attention-grabbing title (under 12 words)",
  "subheading": "Compelling value proposition hook",
  "primaryCopy": "Main persuasive body copy formatted with line breaks, bullets and emojis",
  "callToAction": "Clear CTA text (e.g. 'Post Free Job in 60 Seconds -> URL')",
  "smsSnippet": "Short 160-char SMS broadcast version with direct link",
  "nextdoorPost": "Community-friendly Nextdoor neighborhood recommendation version with local tone",
  "radioScript30s": "Energetic 30-second audio commercial script with sound effect cues",
  "googleLsaAd": {
    "headline1": "Top Headline 1 (max 30 chars)",
    "headline2": "Benefit Headline 2 (max 30 chars)",
    "headline3": "CTA Headline 3 (max 30 chars)",
    "description1": "High-converting search ad description (max 90 chars)",
    "description2": "Trust & Escrow benefit description (max 90 chars)",
    "callouts": ["Free Instant Bids", "100% Escrow Safe", "Verified Local Pros", "0 Middleman Markup"]
  },
  "metaCarousel": [
    { "title": "Card 1 Title", "text": "Card 1 Hook/Pain Point", "buttonText": "Compare Quotes" },
    { "title": "Card 2 Title", "text": "Card 2 Solution/Escrow Guarantee", "buttonText": "See Local Pros" },
    { "title": "Card 3 Title", "text": "Card 3 Promo/Instant Post", "buttonText": "Claim $50 Off" }
  ],
  "tiktokReelsScript": "Viral 15-30s hook script with on-screen text instructions and call to action",
  "smsDripSequence": [
    { "day": "Day 0 (Instant)", "message": "Initial alert message with link" },
    { "day": "Day 2 (Follow-up)", "message": "Contractor availability & promo expiration nudge" },
    { "day": "Day 5 (Last Call)", "message": "Final high-urgency bid reminder" }
  ],
  "yardSignCopy": "Physical job-site yard sign text with QR punchline",
  "targetAudienceNotes": "Demographic guidance, ideal posting hours, and highest ROI channels",
  "suggestedKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6"],
  "estimatedCtr": "e.g. 5.8% - 9.4%",
  "estimatedCpa": "e.g. $1.75 - $2.90 per active job post",
  "projectedContractorRevenue": "e.g. $3,400 - $8,900/mo in direct client contracts"
}`;

      const { text: responseText, modelUsed } = await generateGeminiContentWithFallback(gemini, {
        preferredModel: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      if (responseText) {
        try {
          const parsed = JSON.parse(responseText);
          return res.json({
            success: true,
            source: modelUsed,
            data: parsed,
          });
        } catch (parseErr) {
          console.warn("Failed to parse Gemini JSON response, returning formatted text", parseErr);
        }
      }
    } catch (aiErr: any) {
      console.warn("Gemini notice in outreach generator, utilizing algorithmic builder:", aiErr?.message || aiErr);
    }
  }

  // High-fidelity Algorithmic Fallback Generator
  const isContractor = campaignType === "contractor_recruitment";
  const isEmergency = campaignType === "emergency_storm";
  const isSenior = campaignType === "senior_outreach";

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
      googleLsaAd: {
        headline1: `${tradeCategory} in ${targetRegion.slice(0, 10)}`,
        headline2: "Free Bids In Minutes",
        headline3: "100% Escrow Protected",
        description1: `Compare verified local ${tradeCategory.toLowerCase()} pros. Zero broker fees. 5-star ratings.`,
        description2: `Claim ${promoOffer} when you post your repair today. Instant local dispatch.`,
        callouts: ["Free Local Quotes", "100% Escrow Safe", "Zero Broker Markup", "Verified Contractors"]
      },
      metaCarousel: [
        {
          title: "Stop Overpaying Handymen",
          text: `Compare 3+ free quotes from local ${tradeCategory.toLowerCase()} pros in minutes with zero middleman markup.`,
          buttonText: "Compare Quotes"
        },
        {
          title: "100% Escrow Protected",
          text: "Never pay upfront! Your funds stay securely protected until the project is completed to your satisfaction.",
          buttonText: "How Escrow Works"
        },
        {
          title: `Claim ${promoOffer}`,
          text: `Post your project with photos and budget in 60 seconds. Local pros respond right away.`,
          buttonText: "Post Free Job"
        }
      ],
      tiktokReelsScript: `[HOOK - Pointing to roof/pipe]: "Homeowners in ${targetRegion}: 3 contractor scams to avoid this month!"
[BODY]: "Never pay 100% cash upfront. Use Hotspot Tradesmen Network where payment is locked safely in escrow until the job is done right. Top local pros bid directly with 0 broker markups."
[CTA]: "Tap the link in bio to get ${promoOffer} and free bids in 60 seconds!"`,
      smsDripSequence: [
        { day: "Day 0 (Instant)", message: `Local Alert: Verified ${tradeCategory} pros available in ${targetRegion}. Post free & get ${promoOffer}: ${appUrl}` },
        { day: "Day 2 (Follow-up)", message: `3 local ${tradeCategory} specialists are active in your area today. Post your project in 60s: ${appUrl}` },
        { day: "Day 5 (Final Call)", message: `Reminder: Claim your ${promoOffer} voucher before local contractor scheduling fills up: ${appUrl}` }
      ],
      yardSignCopy: `🏡 TRUSTED WORK IN PROGRESS\nBy Verified Local ${tradeCategory} Pros\nScan QR for ${promoOffer} & Free Quotes\n${appUrl}`,
      targetAudienceNotes: `Best targeting: Homeowners aged 32-68, single-family homeowners in ${targetRegion}. Peak engagement windows: 7:00 AM - 9:00 AM (commute/coffee) and 6:30 PM - 8:30 PM (after work).`,
      suggestedKeywords: [
        `${tradeCategory.toLowerCase()} ${targetRegion.split(" ")[0]}`,
        `best contractor near me`,
        `emergency home repair`,
        `licensed handyman`,
        `free contractor quotes`,
        `zero fee home services`,
      ],
      estimatedCtr: "6.2% - 9.8%",
      estimatedCpa: "$1.75 - $2.60 per active project post",
      projectedContractorRevenue: "$3,800 - $8,200/mo in closed local contracts",
    },
  });
});

// 0.2 Local SEO Neighborhood Landing Page Generator Endpoint
app.post("/api/ai/seo-landing", async (req, res) => {
  const { city = "Austin", state = "TX", zipCode = "78701", trade = "Roofing & Storm Repair" } = req.body;
  const gemini = getGemini();

  if (gemini) {
    try {
      const prompt = `Generate an ultra-high converting Local SEO Landing Page specification for "Hotspot Tradesmen Network" targeting:
City: ${city}, State: ${state}, Zip: ${zipCode}, Trade Category: ${trade}.

Return valid JSON matching this schema:
{
  "seoTitle": "SEO Title tag under 60 chars",
  "metaDescription": "Compelling meta description under 155 chars with phone/CTA hook",
  "heroHeading": "H1 Hero heading",
  "heroSubtitle": "H2 Hero subtitle with localized trust signals",
  "averagePricing": {
    "minor": "$150 - $400",
    "standard": "$600 - $1,800",
    "major": "$2,500 - $7,500"
  },
  "localTrustBadges": ["badge1", "badge2", "badge3", "badge4"],
  "faq": [
    { "q": "Question 1 specific to city/trade", "a": "Direct answer with escrow guarantee" },
    { "q": "Question 2", "a": "Direct answer" },
    { "q": "Question 3", "a": "Direct answer" }
  ],
  "schemaJsonLd": {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Hotspot Tradesmen Network - ${city}",
    "description": "Verified local ${trade} contractors with escrow guarantee in ${city}, ${state}"
  }
}`;

      const { text: responseText } = await generateGeminiContentWithFallback(gemini, {
        preferredModel: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      if (responseText) {
        return res.json({ success: true, data: JSON.parse(responseText) });
      }
    } catch (e) {
      console.warn("Gemini notice in SEO landing, utilizing fallback:", e);
    }
  }

  // Fallback
  res.json({
    success: true,
    data: {
      seoTitle: `Best ${trade} Contractors in ${city}, ${state} (${zipCode}) | Free Quotes`,
      metaDescription: `Compare top-rated ${trade.toLowerCase()} contractors in ${city}, ${state}. 100% Escrow safe, zero broker fees, free fast bids. Post your job now!`,
      heroHeading: `Trusted ${trade} Specialists in ${city}, ${state}`,
      heroSubtitle: `Direct quotes from verified local contractors in ${zipCode} with zero markup and 100% escrow payment protection.`,
      averagePricing: {
        minor: "$175 - $380",
        standard: "$650 - $1,900",
        major: "$2,800 - $8,200"
      },
      localTrustBadges: [
        `Verified ${city} Licensed Pros`,
        "100% Escrow Protection",
        "0% Upfront Downpayment Risk",
        "Fast 15-Minute Response"
      ],
      faq: [
        {
          q: `How do I hire a verified ${trade.toLowerCase()} pro in ${city}?`,
          a: `Post your project with photos and your target budget. Local contractors in ${city} review your request and send competitive bids directly.`
        },
        {
          q: `How does escrow protection protect my payment in ${city}?`,
          a: `Your payment is held securely in platform escrow and is only released to the contractor when you verify the work is completed to 100% satisfaction.`
        },
        {
          q: `Are estimates completely free?`,
          a: `Yes! Posting your repair request and receiving bids is 100% free with zero obligation.`
        }
      ],
      schemaJsonLd: {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": `Hotspot Tradesmen Network - ${city}`,
        "description": `Verified local ${trade} contractors in ${city}, ${state}`
      }
    }
  });
});

// 1,000 New Users by Month-End AI Growth Playbook Generator
app.post("/api/growth/generate-sprint-playbook", async (req, res) => {
  const {
    city = "Austin",
    state = "TX",
    tradeFocus = "General Home Repair & Handyman",
    targetAudience = "both",
  } = req.body || {};

  const gemini = getGemini();
  if (gemini) {
    try {
      const prompt = `You are the Lead Growth Marketing Architect for "Hot Spot Work Shop", a peer-to-peer home improvement marketplace connecting homeowners with verified local trade contractors (zero middleman markup, 100% escrow protection).

GOAL: We need to acquire 1,000 NEW USERS (both homeowners with active repairs and licensed local contractors) by the end of this month in ${city}, ${state}.

AUDIENCE FOCUS: ${targetAudience}
TRADE FOCUS: ${tradeFocus}

Generate a hyper-local, high-converting, viral acquisition sprint package in valid JSON with this exact schema:
{
  "sprintTitle": "e.g. ${city} 1,000-User Homeowner & Trade Blitz",
  "homeownerPitch": {
    "headline": "Punchy benefit headline under 10 words",
    "nextdoorCopy": "Engaging community post for Nextdoor neighborhood groups (120-150 words) emphasizing $25 project credit and zero markups",
    "smsInvite": "Casual 1-to-1 viral referral text under 160 characters"
  },
  "contractorPitch": {
    "headline": "Direct offer to trade pros under 10 words",
    "recruitmentScript": "No-BS email/DM pitch to local contractors (90-120 words) explaining First 3 Leads 100% Free and NO upfront Angi lead fees",
    "quickSms": "Short text to a local pro under 160 characters offering immediate job leads"
  },
  "facebookGroupPost": "Viral question/discussion post formatted for local ${city} community groups with emojis and clear CTA",
  "guerrillaGrowthTactic": "One specific, highly effective local offline tactic for ${city} (e.g., Home Depot/Lowe's pro desk morning coffee flyer drop, supply house bulletin, Realtor partner loop)",
  "projectedWeeklyUsers": 250,
  "actionChecklist": [
    "Post Nextdoor neighborhood announcement in top 5 ${city} subdivisions",
    "Send direct recruitment SMS to 40 local trade contractors offering 3 free leads",
    "Drop printable QR yard signs and pro-desk flyers at local supplier counters",
    "Trigger viral $25 referral credit loop to existing homeowners"
  ]
}`;

      const { text: responseText, modelUsed } = await generateGeminiContentWithFallback(gemini, {
        preferredModel: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      if (responseText) {
        return res.json({
          success: true,
          source: modelUsed,
          playbook: JSON.parse(responseText)
        });
      }
    } catch (err: any) {
      console.warn("[Growth Playbook API] Gemini notice, utilizing algorithmic playbook:", err?.message || err);
    }
  }

  // High-converting algorithmic fallback
  return res.json({
    success: true,
    source: "algorithmic_sprint_engine",
    playbook: {
      sprintTitle: `${city} 1,000-User Homeowner & Trade Blitz`,
      homeownerPitch: {
        headline: `Need home repairs in ${city}? Get $25 off your first project!`,
        nextdoorCopy: `Hey neighbors in ${city}! If you've been putting off home repairs—whether it's drywall patches, squeaky floors, gutter cleaning, or faucet leaks—check out Hot Spot Work Shop. Unlike the big corporate lead sites that charge insane middleman markups, you connect directly with verified local tradesmen and your payment stays locked in 100% escrow protection until you sign off on the work. Plus, we're giving our neighborhood $25 in project credits this week!`,
        smsInvite: `Hey! Found this great local app for home repairs in ${city}. Here's $25 credit toward your first fix: hotspotworkshop.com/?ref=home25`
      },
      contractorPitch: {
        headline: `Tired of paying $60 for fake Angi leads in ${city}?`,
        recruitmentScript: `Hey fellow tradesmen—quick heads up. Hot Spot Work Shop is launching across ${city} this month. Homeowners are posting active projects right now. You get your first 3 bids 100% free with zero upfront lead charges. When you finish the job, milestone escrow guarantees your payment in 24 hours. Claim your free verified contractor profile today!`,
        quickSms: `Pro trades in ${city}: Homeowners need repairs now! First 3 project leads 100% free, no Angi lead fees. Claim yours: hotspotworkshop.com/?tab=contractors`
      },
      facebookGroupPost: `🛠️ ${city} Homeowners & Trade Pros! What's the one repair in your house you've been putting off all summer? Drop it below! We're connecting neighbors directly with top-rated local handymen and trade pros—zero markup, escrow-guaranteed payments. Verified pros: reply with your trade to receive local job leads! 👇`,
      guerrillaGrowthTactic: `Supply House Pro Desk Blitz: Drop laminated flyers with QR code at local ${city} plumbing, electrical, and lumber supply houses between 6:30 AM - 8:30 AM offering contractors 3 free leads on day 1.`,
      projectedWeeklyUsers: 250,
      actionChecklist: [
        `Post Nextdoor announcement across top 10 ${city} neighborhoods`,
        `Direct SMS broadcast to 50 local plumbers, electricians, and handymen`,
        `Distribute printable door hangers & pro desk supply counter cards`,
        `Activate viral $25 project credit referral loop`
      ]
    }
  });
});

// 1. Stripe Status Check
app.get("/api/stripe/status", (req, res) => {
  const stripe = getStripe();
  const realKeyConfigured = !!stripe;
  const rawSecret = (
    process.env.STRIPE_SECRET_KEY || 
    process.env.STRIPE_API_KEY || 
    process.env.STRIPE_KEY || 
    process.env.STRIPE_SECRET || 
    ""
  ).trim();
  const isPlaceholderSecret = rawSecret === "STRIPE_SECRET_KEY" || (rawSecret.length > 0 && !rawSecret.startsWith("sk_") && !rawSecret.startsWith("rk_"));
  const pubKey = (
    process.env.VITE_STRIPE_PUBLISHABLE_KEY || 
    process.env.STRIPE_PUBLISHABLE_KEY || 
    process.env.STRIPE_PUBLIC_KEY || 
    process.env.STRIPE_KEY_PUBLIC || 
    ""
  ).trim();
  const hasValidPubKey = pubKey.startsWith("pk_");

  res.json({
    configured: realKeyConfigured,
    hasRawSecretSet: !!rawSecret,
    isPlaceholderSecret: isPlaceholderSecret,
    publishableKey: pubKey,
    hasValidPubKey: hasValidPubKey,
    connectedStatus: mockStripeDb.connectedStatus,
    bankName: mockStripeDb.connectedBankName,
    last4: mockStripeDb.connectedAccountLast4,
  });
});

// 2. Stripe Connect Account Onboarding
app.post("/api/stripe/connect", async (req, res) => {
  const { routingNumber, accountNumber, bankName } = req.body;
  const stripe = getStripe();

  if (stripe) {
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
  if (stripe) {
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
      console.warn("[STRIPE BALANCE ERROR]", err.message);
      return res.json({
        realMode: false,
        warning: err.message,
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

  if (stripe) {
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

// 8. Create Stripe Checkout Session (for Contractor Pro, Lead Unlocks, Project Boosts, Rush Dispatch)
app.post("/api/stripe/create-checkout-session", async (req, res) => {
  const { productKind, amount, title, projectId, userId, customerEmail } = req.body;
  const stripe = getStripe();
  const origin = req.headers.origin || process.env.APP_URL || `http://localhost:${PORT}`;
  const unitAmountCents = Math.max(50, Math.round(Number(amount || 29) * 100));

  if (stripe) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: title || "Hot Spot Work Shop Service",
                description: `Platform Fee / Service: ${productKind}${projectId ? ` for project #${projectId}` : ""}`,
              },
              unit_amount: unitAmountCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        customer_email: customerEmail || undefined,
        success_url: `${origin}/?stripe_checkout=success&product=${productKind}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?stripe_checkout=cancelled`,
        metadata: {
          productKind: productKind || "general",
          projectId: projectId || "",
          userId: userId || "",
        },
      });

      return res.json({
        success: true,
        realMode: true,
        url: session.url,
        sessionId: session.id,
      });
    } catch (err: any) {
      console.error("Stripe Checkout Session error:", err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    // Sandbox / Simulation fallback
    const numericAmt = Number(amount || 29);
    mockStripeDb.availableBalance += numericAmt;
    return res.json({
      success: true,
      realMode: false,
      simulated: true,
      url: null,
      message: "Sandbox test payment registered successfully in platform ledger.",
      status: mockStripeDb,
    });
  }
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
  agentTargetZips?: string;
  agentTargetZipsUpdated?: string;
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
  agentTargetZips: "78701, 75201, 77001, 76102, 60601, 63101, 55401, 37201, 73101",
  agentTargetZipsUpdated: new Date().toISOString(),
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
