import express from "express";
import path from "path";
import dotenv from "dotenv";
import Stripe from "stripe";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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
