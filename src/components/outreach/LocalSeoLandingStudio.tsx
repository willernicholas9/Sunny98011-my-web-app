import React, { useState } from "react";
import {
  Globe, Sparkles, Copy, Check, ExternalLink, MapPin,
  DollarSign, ShieldCheck, HelpCircle, FileText, CheckCircle2,
  TrendingUp, RefreshCw, Send, Search, Share2
} from "lucide-react";

interface LocalSeoLandingStudioProps {
  appUrl?: string;
  onAlert: (msg: string) => void;
}

export default function LocalSeoLandingStudio({
  appUrl = window.location.origin,
  onAlert
}: LocalSeoLandingStudioProps) {
  const [city, setCity] = useState("Austin");
  const [state, setState] = useState("TX");
  const [zipCode, setZipCode] = useState("78701");
  const [trade, setTrade] = useState("Roofing & Storm Repair");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const [landingData, setLandingData] = useState({
    seoTitle: `Best Roofing & Storm Repair in Austin, TX (78701) | Free Escrow Quotes`,
    metaDescription: `Compare top-rated roofing contractors in Austin, TX. 100% Escrow safe, zero broker fees, free 60-second bids. Post your repair now!`,
    heroHeading: `Trusted Roofing & Storm Repair Specialists in Austin, TX`,
    heroSubtitle: `Direct quotes from verified local Austin contractors in 78701 with zero middleman markup and 100% escrow payment protection.`,
    averagePricing: {
      minor: "$175 - $380",
      standard: "$650 - $1,900",
      major: "$2,800 - $8,200"
    },
    localTrustBadges: [
      "Verified Austin Licensed Pros",
      "100% Escrow Safe Payment",
      "0% Upfront Downpayment Risk",
      "Fast 15-Minute Direct Bids"
    ],
    faq: [
      {
        q: "How do I hire a verified roofing pro in Austin?",
        a: "Post your project with photos and budget in 60 seconds. Top background-checked Austin contractors review your details and submit direct competitive bids."
      },
      {
        q: "How does escrow protection protect homeowners in 78701?",
        a: "Your project funds remain locked securely in platform escrow and are only released when you verify the work is completed to 100% satisfaction."
      },
      {
        q: "Are contractor repair estimates free in Texas?",
        a: "Yes! Requesting quotes on Hotspot Tradesmen Network is 100% free with zero obligation."
      }
    ],
    schemaJsonLd: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Hotspot Tradesmen Network - Austin",
      "description": "Verified local Roofing & Storm Repair contractors with escrow guarantee in Austin, TX"
    }
  });

  const handleGenerateLanding = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/seo-landing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, state, zipCode, trade })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setLandingData(json.data);
          onAlert(`✨ Generated Local SEO Landing Page for ${city}, ${state} (${zipCode})!`);
        }
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    onAlert("Copied to clipboard!");
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8" id="local-seo-landing-studio">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-900 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <span>Autonomous Local SEO & Neighborhood Page Generator</span>
          </div>
          <h2 className="text-2xl font-black font-display text-zinc-900 tracking-tight flex items-center gap-2">
            <span>Rank #1 on Google for Every City & Zip Code</span>
          </h2>
          <p className="text-xs text-zinc-600 leading-relaxed max-w-3xl">
            Automatically generate high-converting SEO landing pages with localized pricing matrices, trust badges, FAQs, and JSON-LD structured schema markup to capture organic search traffic from homeowners searching for local repairs.
          </p>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
        <div>
          <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs font-bold text-zinc-900"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">State</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs font-bold text-zinc-900"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Zip Code</label>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs font-mono font-bold text-zinc-900"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Trade Category</label>
          <select
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            className="w-full bg-white border border-zinc-300 rounded-xl p-2.5 text-xs font-bold text-zinc-900"
          >
            <option value="Roofing & Storm Repair">Roofing & Storm Repair</option>
            <option value="Lawn Care & Landscaping">Lawn Care & Landscaping</option>
            <option value="Plumbing & Leak Repairs">Plumbing & Water Heaters</option>
            <option value="HVAC & AC Service">HVAC Heating & AC</option>
            <option value="Electrical & Lighting">Electrical Maintenance</option>
            <option value="Painting & Drywall">Painting & Drywall</option>
            <option value="General Handyman Projects">General Handyman</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handleGenerateLanding}
          disabled={isGenerating}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
              <span>Building SEO Assets...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate Local Landing Page & Schema</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleCopy(JSON.stringify(landingData.schemaJsonLd, null, 2), "schema")}
          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer border border-zinc-300"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>{copiedSection === "schema" ? "Copied Schema!" : "Copy JSON-LD Schema"}</span>
        </button>
      </div>

      {/* Live Landing Page Preview Container */}
      <div className="border border-zinc-300 rounded-3xl overflow-hidden shadow-md">
        
        {/* Browser Top Bar */}
        <div className="bg-zinc-100 border-b border-zinc-300 px-4 py-2.5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <div className="bg-white border border-zinc-200 rounded-lg px-3 py-1 text-[11px] font-mono text-zinc-600 flex-1 flex items-center gap-1.5">
            <Search className="w-3 h-3 text-zinc-400" />
            <span>{appUrl}/local/{state.toLowerCase()}/{city.toLowerCase().replace(/\s+/g, "-")}/{trade.toLowerCase().replace(/[^a-z0-9]/g, "-")}</span>
          </div>
        </div>

        {/* Landing Content Preview */}
        <div className="p-6 sm:p-10 space-y-8 bg-gradient-to-b from-blue-50/40 via-white to-zinc-50">
          
          {/* Hero Section */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-xs font-bold">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span>Serving {city}, {state} ({zipCode}) & Surrounding Metros</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 font-display tracking-tight leading-tight">
              {landingData.heroHeading}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              {landingData.heroSubtitle}
            </p>
          </div>

          {/* Local Trust Badges Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {landingData.localTrustBadges.map((badge, i) => (
              <div key={i} className="bg-white p-3 rounded-xl border border-zinc-200 text-center space-y-1 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                <span className="text-xs font-bold text-zinc-800 block">{badge}</span>
              </div>
            ))}
          </div>

          {/* Local Price Guide Table */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Average Local {trade} Pricing Guide in {city}, {state}</span>
              </h3>
              <span className="text-[10px] text-zinc-400 font-bold uppercase">Updated Real-Time</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Minor Repair / Tune-Up</span>
                <span className="text-base font-black font-mono text-zinc-900 mt-1 block">{landingData.averagePricing.minor}</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Standard Replacement</span>
                <span className="text-base font-black font-mono text-zinc-900 mt-1 block">{landingData.averagePricing.standard}</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Major Project / Overhaul</span>
                <span className="text-base font-black font-mono text-zinc-900 mt-1 block">{landingData.averagePricing.major}</span>
              </div>
            </div>
          </div>

          {/* Local FAQ Accordion */}
          <div className="max-w-3xl mx-auto space-y-3">
            <h3 className="font-bold text-sm text-zinc-900">
              Frequently Asked Questions for {city} Homeowners
            </h3>
            <div className="space-y-2">
              {landingData.faq.map((item, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-zinc-200 space-y-1">
                  <div className="font-bold text-xs text-zinc-900 flex items-start gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                    <span>{item.q}</span>
                  </div>
                  <p className="text-xs text-zinc-600 pl-5 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
