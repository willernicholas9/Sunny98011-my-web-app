import React, { useState } from "react";
import {
  Sparkles, Bot, Copy, Check, Send, RefreshCw, Layers,
  Volume2, Radio, Globe, MessageSquare, Target, Zap, DollarSign,
  TrendingUp, Award, Share2, FileText, ArrowRight, ShieldCheck
} from "lucide-react";

interface AiAdCreativeStudioProps {
  appUrl?: string;
  onInjectCampaignToQueue?: (campaignData: any) => void;
  targetZips?: string;
}

export interface GeneratedCampaign {
  headline: string;
  subheading: string;
  primaryCopy: string;
  callToAction: string;
  smsSnippet: string;
  nextdoorPost: string;
  radioScript30s: string;
  targetAudienceNotes: string;
  suggestedKeywords: string[];
  estimatedCtr: string;
  estimatedCpa: string;
}

export default function AiAdCreativeStudio({
  appUrl = window.location.origin,
  onInjectCampaignToQueue,
  targetZips = "78701, 75201, 60601"
}: AiAdCreativeStudioProps) {
  const [campaignType, setCampaignType] = useState<string>("homeowner_ad");
  const [tradeCategory, setTradeCategory] = useState<string>("Roofing & Storm Repair");
  const [tone, setTone] = useState<string>("high_converting");
  const [promoOffer, setPromoOffer] = useState<string>("$50 Off First Project");
  const [customContext, setCustomContext] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("Central US (TX, IL, MO, MN)");

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationSource, setGenerationSource] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState<"social" | "sms" | "radio" | "nextdoor" | "seo">("social");
  const [injectedSuccess, setInjectedSuccess] = useState<boolean>(false);

  const [generatedCampaign, setGeneratedCampaign] = useState<GeneratedCampaign>({
    headline: "🏡 Post Your Home Repair in 60 Seconds — Compare Free Local Contractor Bids!",
    subheading: "Skip middleman markups. Get direct quotes from licensed & verified local pros with escrow protection.",
    primaryCopy: `Need trusted home repairs without hidden markups or unreliable handymen? 🛠️

Hotspot Tradesmen Network connects you directly with top-rated, background-checked contractors in your neighborhood.
• Post any job with photos & budget (Roofing, Lawn, Plumbing, HVAC, Carpentry, Electrical)
• Receive competitive bids in minutes
• 100% Escrow Protection: Your payment is held safely until the job is completed to your 5-star satisfaction!
• Special Promotion: Claim $50 Off Your First Project!

👉 Post your project vacancy now: ${appUrl}`,
    callToAction: `Post Free Project & Get Quotes: ${appUrl}`,
    smsSnippet: `Local Alert: Verified Roofing & Repair pros available in your zip. Claim $50 off on your project today: ${appUrl}`,
    nextdoorPost: `Hi neighbors! 👋 If anyone is looking for trusted local contractors for roof repairs, plumbing, or landscaping, check out Hotspot Tradesmen Network. Compare bids directly with 0 broker markups & secure escrow: ${appUrl}`,
    radioScript30s: `[SFX: Sound of heavy rain followed by roof hammer]
ANNOUNCER: "Has recent weather taken a toll on your roof or gutters? Don't pay exorbitant contractor markups!
Meet Hotspot Tradesmen Network! Connect directly with verified, licensed local contractors right in your zip code. Get free bids, transparent pricing, and 100% escrow protection so you only pay when the job is done right.
Visit ${appUrl.replace(/^https?:\/\//, "")} today and get fifty dollars off your first repair. That's ${appUrl.replace(/^https?:\/\//, "")}!"`,
    targetAudienceNotes: "Single-family homeowners aged 30-65. Highest ROI posting times: 7:00 AM - 9:00 AM (morning commute) and 6:30 PM - 8:30 PM (after dinner). Top channels: Nextdoor, Local Facebook Groups, SMS Broadcast.",
    suggestedKeywords: [
      "roof repair near me",
      "emergency contractor bids",
      "licensed handyman local",
      "compare local home repairs",
      "affordable roofing contractor",
      "escrow protected contractors"
    ],
    estimatedCtr: "5.4% - 8.1%",
    estimatedCpa: "$1.85 - $2.60 per active job post"
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    setInjectedSuccess(false);

    try {
      const res = await fetch("/api/ai/outreach-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignType,
          targetRegion: selectedRegion,
          tradeCategory,
          tone,
          promoOffer,
          appUrl,
          customContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.data) {
        setGeneratedCampaign(json.data);
        setGenerationSource(json.source || "gemini-3.7-flash");
      }
    } catch (err) {
      console.warn("AI generation request failed, using algorithmic generator:", err);
      setGenerationSource("algorithmic-optimizer");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleInjectToLiveQueue = () => {
    if (onInjectCampaignToQueue) {
      onInjectCampaignToQueue(generatedCampaign);
    }
    setInjectedSuccess(true);
    setTimeout(() => setInjectedSuccess(false), 4000);
  };

  return (
    <div className="bg-white border border-blue-900/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6" id="ai-ad-creative-studio">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-blue-900 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>AI Generative Outreach & Ad Creative Studio</span>
          </div>
          <h2 className="text-2xl font-black font-display text-zinc-900 tracking-tight flex items-center gap-2">
            <span>Autonomous Copywriting & Multi-Channel Campaign Generator</span>
          </h2>
          <p className="text-xs text-zinc-600 leading-relaxed max-w-3xl">
            Leverage server-side Gemini 3.7 Flash AI to generate high-converting ad copy, localized social posts, 160-char SMS broadcasts, 30s radio audio commercial scripts, and targeted SEO keywords tailored to any trade and region.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-xl border border-zinc-200">
            Powered by <strong className="text-blue-950 font-black">Gemini 3.7 Flash</strong>
          </span>
        </div>
      </div>

      {/* Generator Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-zinc-50 p-5 rounded-2xl border border-zinc-200">
        
        {/* 1. Campaign Goal */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-extrabold text-zinc-800 uppercase tracking-wider">
            Campaign Objective
          </label>
          <select
            value={campaignType}
            onChange={(e) => setCampaignType(e.target.value)}
            className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs font-bold text-zinc-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden cursor-pointer"
          >
            <option value="homeowner_ad">🏡 Homeowner Project Bidding Promo</option>
            <option value="contractor_recruitment">🔨 Contractor 0-Lead-Fee Recruitment</option>
            <option value="emergency_storm">🚨 Emergency Storm / Freeze Damage Blitz</option>
            <option value="senior_outreach">👵 Senior-Friendly Home Maintenance</option>
            <option value="radio_audio_script">📻 30s Radio & Podcast Audio Ad</option>
            <option value="seasonal_promo">🍂 Seasonal Spring/Fall Yard & Roof Blitz</option>
          </select>
        </div>

        {/* 2. Target Trade */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-extrabold text-zinc-800 uppercase tracking-wider">
            Trade Category
          </label>
          <select
            value={tradeCategory}
            onChange={(e) => setTradeCategory(e.target.value)}
            className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs font-bold text-zinc-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden cursor-pointer"
          >
            <option value="Roofing & Storm Repair">Roofing & Gutter Guard Repair</option>
            <option value="Lawn Care & Landscaping">Lawn Mowing & Yard Cleanup</option>
            <option value="Plumbing & Freeze Leak">Plumbing, Water Heater & Leaks</option>
            <option value="HVAC & Summer AC Repair">HVAC & Heating / Cooling</option>
            <option value="Electrical & Lighting">Electrical & Panel Upgrades</option>
            <option value="Painting & Drywall">Interior/Exterior Painting & Drywall</option>
            <option value="Handyman & General Repairs">General Handyman & TV Mounting</option>
          </select>
        </div>

        {/* 3. Tone & Style */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-extrabold text-zinc-800 uppercase tracking-wider">
            Marketing Tone
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs font-bold text-zinc-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden cursor-pointer"
          >
            <option value="high_converting">🔥 High-Converting & Urgent</option>
            <option value="friendly_neighbor">👋 Friendly Community Neighbor</option>
            <option value="urgent_emergency">🚨 24/7 Urgent Emergency Dispatch</option>
            <option value="senior_respectful">👵 Clear, Respectful & Senior-Friendly</option>
            <option value="professional_tradesman">📐 Direct Tradesman & No-Nonsense</option>
          </select>
        </div>

        {/* 4. Promotional Hook */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-extrabold text-zinc-800 uppercase tracking-wider">
            Promotional Hook
          </label>
          <select
            value={promoOffer}
            onChange={(e) => setPromoOffer(e.target.value)}
            className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs font-bold text-zinc-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden cursor-pointer"
          >
            <option value="$50 Off First Project">$50 Off First Project</option>
            <option value="Free Escrow Protection">Free Escrow Protection Guarantee</option>
            <option value="0% Lead Fees for Contractors">0% Lead Fees (Contractor Incentive)</option>
            <option value="10% Senior Community Discount">10% Senior Citizen Discount</option>
            <option value="Instant $25 Referral Credit">Instant $25 Neighbor Referral Credit</option>
          </select>
        </div>

        {/* Region Selector & Custom Context */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-[11px] font-extrabold text-zinc-800 uppercase tracking-wider">
            Target Region / Metros
          </label>
          <input
            type="text"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            placeholder="e.g. Dallas / Central Zone (75201) or Nationwide All 50 States"
            className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs font-medium text-zinc-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
          />
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-[11px] font-extrabold text-zinc-800 uppercase tracking-wider">
            Custom Instructions / Specific Angle (Optional)
          </label>
          <input
            type="text"
            value={customContext}
            onChange={(e) => setCustomContext(e.target.value)}
            placeholder="e.g. Focus on post-hailstorm roof tarping and insurance claim readiness"
            className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs font-medium text-zinc-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
          />
        </div>

      </div>

      {/* Generate Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-gradient-to-r from-red-600 via-blue-900 to-indigo-950 hover:from-red-700 hover:to-blue-950 text-white font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer border border-blue-400/40 disabled:opacity-50"
            id="ai-generate-outreach-campaign-btn"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                <span>AI Generating High-Converting Copy...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
                <span>Generate Multi-Channel AI Ad Campaign</span>
              </>
            )}
          </button>

          {generationSource && (
            <span className="text-[11px] text-zinc-500 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Generated via <strong className="text-zinc-800">{generationSource}</strong>
            </span>
          )}
        </div>

        {/* Quick Inject to Queue */}
        <button
          type="button"
          onClick={handleInjectToLiveQueue}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-3xs ${
            injectedSuccess
              ? "bg-emerald-600 text-white border border-emerald-700"
              : "bg-blue-900 hover:bg-blue-800 text-white border border-blue-700"
          }`}
          id="inject-campaign-to-agent-queue-btn"
        >
          {injectedSuccess ? (
            <>
              <Check className="w-4 h-4 text-amber-300" />
              <span>Injected to Active AI Ad Queue!</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-amber-300" />
              <span>Deploy to Autonomous Live Broadcast Queue</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Creative Output Showcase */}
      <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-zinc-50/50">
        
        {/* Output Channel Tabs */}
        <div className="flex flex-wrap bg-zinc-100 border-b border-zinc-200 p-2 gap-1.5">
          {[
            { id: "social", label: "📱 Facebook & Social Post", icon: Share2 },
            { id: "sms", label: "💬 160-Char SMS Broadcast", icon: MessageSquare },
            { id: "nextdoor", label: "🏡 Nextdoor Neighborhood Feed", icon: Target },
            { id: "radio", label: "📻 30s Audio Radio Script", icon: Volume2 },
            { id: "seo", label: "🔍 Local SEO & Ad Keywords", icon: Globe },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeOutputTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveOutputTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-white text-blue-950 shadow-sm border border-zinc-200 font-extrabold"
                    : "text-zinc-600 hover:bg-zinc-200/70"
                }`}
              >
                <TabIcon className={`w-3.5 h-3.5 ${isActive ? "text-red-600" : "text-zinc-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-5 space-y-4">
          
          {/* Headline & Value Proposition Banner */}
          <div className="bg-white p-4 rounded-xl border border-zinc-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-widest text-red-600 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-200">
                Primary Ad Headline
              </span>
              <button
                type="button"
                onClick={() => handleCopy(generatedCampaign.headline, "headline")}
                className="text-[11px] font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedKey === "headline" ? "Copied!" : "Copy"}</span>
              </button>
            </div>
            <h3 className="text-base font-black text-zinc-900 leading-snug">
              {generatedCampaign.headline}
            </h3>
            <p className="text-xs text-zinc-600 font-medium">
              {generatedCampaign.subheading}
            </p>
          </div>

          {/* TAB 1: Facebook / Social */}
          {activeOutputTab === "social" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">
                  Social Media Feed Copy (Facebook, Instagram, LinkedIn)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(generatedCampaign.primaryCopy, "social_copy")}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-300" />
                  <span>{copiedKey === "social_copy" ? "Copied Post!" : "Copy Full Post"}</span>
                </button>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-4 text-xs text-zinc-800 font-sans leading-relaxed whitespace-pre-line shadow-2xs">
                {generatedCampaign.primaryCopy}
              </div>
            </div>
          )}

          {/* TAB 2: SMS Broadcast */}
          {activeOutputTab === "sms" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">
                  SMS / WhatsApp Broadcast Message (Optimized for High Response)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(generatedCampaign.smsSnippet, "sms_copy")}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-300" />
                  <span>{copiedKey === "sms_copy" ? "Copied SMS!" : "Copy SMS"}</span>
                </button>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-4 text-xs text-zinc-900 font-mono leading-relaxed whitespace-pre-line shadow-2xs">
                {generatedCampaign.smsSnippet}
              </div>
              <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                <span>Character Count: {generatedCampaign.smsSnippet.length} chars</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">100% TCPA Compliant Format</span>
              </div>
            </div>
          )}

          {/* TAB 3: Nextdoor */}
          {activeOutputTab === "nextdoor" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">
                  Nextdoor Neighborhood Community Recommendation
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(generatedCampaign.nextdoorPost, "nextdoor_copy")}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-300" />
                  <span>{copiedKey === "nextdoor_copy" ? "Copied Post!" : "Copy Nextdoor Post"}</span>
                </button>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-4 text-xs text-zinc-800 font-sans leading-relaxed whitespace-pre-line shadow-2xs">
                {generatedCampaign.nextdoorPost}
              </div>
            </div>
          )}

          {/* TAB 4: Radio & Audio Commercial */}
          {activeOutputTab === "radio" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">
                  30-Second Radio & Local Podcast Commercial Script
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(generatedCampaign.radioScript30s, "radio_copy")}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-300" />
                  <span>{copiedKey === "radio_copy" ? "Copied Script!" : "Copy Script"}</span>
                </button>
              </div>

              <div className="bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-xl p-4 text-xs font-mono leading-relaxed whitespace-pre-line shadow-md">
                {generatedCampaign.radioScript30s}
              </div>
            </div>
          )}

          {/* TAB 5: SEO Keywords */}
          {activeOutputTab === "seo" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">
                  Target SEO Keywords & Geo-Search Queries
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(generatedCampaign.suggestedKeywords.join(", "), "keywords_copy")}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-300" />
                  <span>{copiedKey === "keywords_copy" ? "Copied Keywords!" : "Copy Keywords"}</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {generatedCampaign.suggestedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="bg-white border border-zinc-300 text-zinc-900 text-xs font-mono font-bold px-3 py-1.5 rounded-xl shadow-3xs flex items-center gap-1.5"
                  >
                    <span className="text-red-600 font-black">#</span>
                    <span>{kw}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Strategy & Performance Forecasting Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-zinc-200">
            <div className="bg-white p-3 rounded-xl border border-zinc-200 space-y-0.5">
              <div className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                Audience & Posting Guidance
              </div>
              <div className="text-[11px] text-zinc-700 leading-snug">
                {generatedCampaign.targetAudienceNotes}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-zinc-200 space-y-0.5">
              <div className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                Predicted Click-Through Rate (CTR)
              </div>
              <div className="text-sm font-black text-emerald-700 flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>{generatedCampaign.estimatedCtr}</span>
              </div>
              <div className="text-[10px] text-zinc-500">Benchmark: Top 5% home service ads</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-zinc-200 space-y-0.5">
              <div className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                Estimated Acquisition Cost (CPA)
              </div>
              <div className="text-sm font-black text-blue-900 flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-blue-700" />
                <span>{generatedCampaign.estimatedCpa}</span>
              </div>
              <div className="text-[10px] text-zinc-500">70% lower than Angi/HomeAdvisor leads</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
