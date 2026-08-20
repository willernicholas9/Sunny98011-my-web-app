import React, { useState, useEffect } from "react";
import {
  TrendingUp, Users, DollarSign, Target, Zap, Activity,
  CheckCircle2, MapPin, Clock, ArrowRight, Sparkles, Filter,
  ShieldCheck, Smartphone, Laptop, AlertCircle
} from "lucide-react";

interface LeadItem {
  id: string;
  customerName: string;
  city: string;
  state: string;
  zipCode: string;
  projectType: string;
  estimatedBudget: number;
  channelSource: string;
  timeAgo: string;
  matchedContractors: number;
  status: "new" | "quoted" | "contract_signed";
}

interface LiveLeadStreamVisualizerProps {
  agentRunning: boolean;
  dailyBudget: number;
}

export default function LiveLeadStreamVisualizer({
  agentRunning,
  dailyBudget,
}: LiveLeadStreamVisualizerProps) {
  const [leads, setLeads] = useState<LeadItem[]>([
    {
      id: "lead-1",
      customerName: "Sarah Jenkins",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      projectType: "Emergency Roof Shingle Replacement",
      estimatedBudget: 3200,
      channelSource: "Nextdoor AI Spotlight",
      timeAgo: "2m ago",
      matchedContractors: 3,
      status: "quoted",
    },
    {
      id: "lead-2",
      customerName: "Marcus Vance",
      city: "Dallas",
      state: "TX",
      zipCode: "75201",
      projectType: "Full Gutter Guard & Leaf Filter Install",
      estimatedBudget: 1450,
      channelSource: "Facebook Neighborhood Blitz",
      timeAgo: "7m ago",
      matchedContractors: 2,
      status: "new",
    },
    {
      id: "lead-3",
      customerName: "Elena Rostova",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      projectType: "Main Line Plumbing Leak & Valve Repair",
      estimatedBudget: 1800,
      channelSource: "Google Local Services AI Ad",
      timeAgo: "14m ago",
      matchedContractors: 4,
      status: "contract_signed",
    },
    {
      id: "lead-4",
      customerName: "David Thornton",
      city: "St. Louis",
      state: "MO",
      zipCode: "63101",
      projectType: "Lawn Aeration & Seasonal Sodding",
      estimatedBudget: 850,
      channelSource: "SMS Community Broadcast",
      timeAgo: "22m ago",
      matchedContractors: 2,
      status: "quoted",
    },
  ]);

  const [funnelStats, setFunnelStats] = useState({
    adImpressions: 24850,
    clicks: 1420,
    leadsGenerated: 184,
    escrowClosedRevenue: 42600,
    avgCpa: 2.14,
    roas: 14.8, // 14.8x ROAS
  });

  // Periodically generate simulated inbound customer leads when agent is running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (agentRunning) {
      interval = setInterval(() => {
        const CITIES = [
          { city: "Austin", state: "TX", zip: "78701" },
          { city: "Dallas", state: "TX", zip: "75201" },
          { city: "Houston", state: "TX", zip: "77001" },
          { city: "Chicago", state: "IL", zip: "60601" },
          { city: "St. Louis", state: "MO", zip: "63101" },
          { city: "Minneapolis", state: "MN", zip: "55401" },
          { city: "Nashville", state: "TN", zip: "37201" },
          { city: "Atlanta", state: "GA", zip: "30301" },
        ];
        const PROJECTS = [
          { type: "Post-Storm Roof Leak Repair", budget: 2800 },
          { type: "Gutter Guard Mesh Upgrade", budget: 1200 },
          { type: "Water Heater Flush & Pipe Re-route", budget: 1650 },
          { type: "Yard Aeration & Fall Mulching", budget: 650 },
          { type: "EV Charger Station Install", budget: 1400 },
          { type: "Drywall Patch & Interior Repaint", budget: 950 },
          { type: "Fence Post Replacement (High Wind)", budget: 1100 },
        ];
        const CHANNELS = [
          "Nextdoor AI Spotlight",
          "Facebook Neighborhood Blitz",
          "Google Local Services AI Ad",
          "SMS Community Broadcast",
          "Radio/Podcast Audio Ad",
        ];
        const NAMES = [
          "Robert Sterling", "Amanda Cole", "Jason Hayes", "Lisa Rodriguez",
          "Kevin Patel", "Rachel Brooks", "Brian Henderson", "Megan Walsh"
        ];

        const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
        const randomProj = PROJECTS[Math.floor(Math.random() * PROJECTS.length)];
        const randomChannel = CHANNELS[Math.floor(Math.random() * CHANNELS.length)];
        const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];

        const newLead: LeadItem = {
          id: `lead-${Date.now()}`,
          customerName: randomName,
          city: randomCity.city,
          state: randomCity.state,
          zipCode: randomCity.zip,
          projectType: randomProj.type,
          estimatedBudget: randomProj.budget,
          channelSource: randomChannel,
          timeAgo: "Just now",
          matchedContractors: Math.floor(Math.random() * 3) + 2,
          status: Math.random() > 0.5 ? "quoted" : "new",
        };

        setLeads((prev) => [newLead, ...prev].slice(0, 10));

        setFunnelStats((prev) => ({
          adImpressions: prev.adImpressions + Math.floor(Math.random() * 65) + 15,
          clicks: prev.clicks + Math.floor(Math.random() * 5) + 1,
          leadsGenerated: prev.leadsGenerated + 1,
          escrowClosedRevenue: prev.escrowClosedRevenue + randomProj.budget,
          avgCpa: Number((prev.avgCpa * 0.98 + (Math.random() * 0.4 + 1.8) * 0.02).toFixed(2)),
          roas: Number((prev.roas * 0.99 + (Math.random() * 2 + 13.5) * 0.01).toFixed(1)),
        }));
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [agentRunning]);

  return (
    <div className="bg-white border border-blue-900/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6" id="live-lead-stream-visualizer">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-300 shadow-2xs">
            <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Autonomous Customer Inbound Stream</span>
          </div>
          <h2 className="text-2xl font-black font-display text-zinc-900 tracking-tight flex items-center gap-2">
            <span>Live Customer Acquisition Funnel & Matching Stream</span>
          </h2>
          <p className="text-xs text-zinc-600 leading-relaxed max-w-3xl">
            Real-time feed of homeowners finding the platform through autonomous ads, submitting project vacancies, and connecting with local contractors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
            agentRunning
              ? "bg-emerald-50 text-emerald-800 border-emerald-300 animate-pulse"
              : "bg-zinc-100 text-zinc-600 border-zinc-200"
          }`}>
            {agentRunning ? "● Live Inbound Active" : "○ Inbound Paused"}
          </span>
        </div>
      </div>

      {/* Funnel Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 space-y-1">
          <div className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
            Total Ad Impressions
          </div>
          <div className="text-xl font-black text-zinc-900 font-mono">
            {funnelStats.adImpressions.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-500 font-medium">Across all active channels</div>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 space-y-1">
          <div className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
            Verified Ad Clicks
          </div>
          <div className="text-xl font-black text-blue-900 font-mono">
            {funnelStats.clicks.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">5.7% Avg Click-Through</div>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 space-y-1">
          <div className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
            Homeowner Projects Posted
          </div>
          <div className="text-xl font-black text-emerald-700 font-mono">
            {funnelStats.leadsGenerated.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-500 font-medium">100% matched with pros</div>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 space-y-1">
          <div className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
            Customer Acq Cost (CAC)
          </div>
          <div className="text-xl font-black text-red-600 font-mono">
            ${funnelStats.avgCpa.toFixed(2)}
          </div>
          <div className="text-[10px] text-zinc-500 font-medium">Per confirmed project post</div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-3.5 space-y-1 border border-blue-800 shadow-sm">
          <div className="text-[10px] font-black uppercase text-blue-200 tracking-wider">
            Return on Ad Spend (ROAS)
          </div>
          <div className="text-xl font-black text-amber-300 font-mono">
            {funnelStats.roas}x
          </div>
          <div className="text-[10px] text-blue-100 font-medium">
            ${funnelStats.escrowClosedRevenue.toLocaleString()} Escrow Vol
          </div>
        </div>

      </div>

      {/* Live Inbound Leads Feed Table */}
      <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="bg-zinc-100 px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
          <span className="text-xs font-black uppercase text-zinc-900 tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-900" />
            <span>Recent Inbound Customer Projects from AI Ad Broadcasts</span>
          </span>
          <span className="text-[10px] bg-white border border-zinc-300 font-bold px-2 py-0.5 rounded-md text-zinc-700">
            {leads.length} Live Entries
          </span>
        </div>

        <div className="divide-y divide-zinc-200 bg-white">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-zinc-50/80 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-xs text-zinc-900">{lead.customerName}</span>
                  <span className="text-[10px] bg-blue-50 text-blue-900 font-bold px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    {lead.city}, {lead.state} ({lead.zipCode})
                  </span>
                  <span className="text-[10px] bg-zinc-100 text-zinc-600 font-semibold px-2 py-0.5 rounded-md">
                    Via {lead.channelSource}
                  </span>
                </div>
                <div className="text-xs text-zinc-700 font-medium flex items-center gap-2">
                  <span className="font-bold text-zinc-900">{lead.projectType}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold font-mono">
                    Budget: ${lead.estimatedBudget.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <div className="text-right">
                  <div className="text-[11px] font-bold text-zinc-900">
                    {lead.matchedContractors} Bids Received
                  </div>
                  <div className="text-[10px] text-zinc-500">{lead.timeAgo}</div>
                </div>

                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider border ${
                  lead.status === "contract_signed"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : lead.status === "quoted"
                    ? "bg-blue-100 text-blue-900 border-blue-300"
                    : "bg-amber-100 text-amber-800 border-amber-300"
                }`}>
                  {lead.status === "contract_signed" ? "Escrow Funded" : lead.status === "quoted" ? "Bidding Active" : "New Lead"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
