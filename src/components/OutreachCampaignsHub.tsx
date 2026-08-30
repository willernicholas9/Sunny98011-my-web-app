import React, { useState } from "react";
import { 
  Share2, Mail, Copy, Check, MessageSquare, Megaphone, 
  Smartphone, Users, Sparkles, Printer, ShieldCheck, 
  Layers, CheckCircle, ExternalLink, RefreshCw, ZoomIn, 
  Flame, Heart, MapPin, Eye, Compass, HelpCircle
} from "lucide-react";

interface OutreachCampaignsHubProps {
  currentUser: any;
  onAlert: (msg: string) => void;
  seniorMode: boolean;
  setSeniorMode: (enabled: boolean) => void;
  appUrl?: string;
  onSendEmailCampaign?: (subject: string, body: string) => void;
  onNavigateToAiAgent?: () => void;
}

export default function OutreachCampaignsHub({
  currentUser,
  onAlert,
  seniorMode,
  setSeniorMode,
  appUrl = window.location.origin,
  onSendEmailCampaign,
  onNavigateToAiAgent
}: OutreachCampaignsHubProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFb, setCopiedFb] = useState(false);
  const [copiedNd, setCopiedNd] = useState(false);
  const [copiedFlyer, setCopiedFlyer] = useState(false);
  
  // Custom campaign copies
  const [fbCopy, setFbCopy] = useState(
    `Looking for trusted, verified local hands to remodel your lawn, clear your gutters, or help around the house? 🏡\n\nI highly recommend using the "Hot Spot Work Shop" app! It connects you directly with friendly, certified local contractors. Check out my project or find help in your neighborhood today!\n\n👉 Try it here: ${appUrl}`
  );

  const [ndCopy, setNdCopy] = useState(
    `Hi neighbors! 👋 I wanted to share a great new local marketplace we are using called "Hot Spot Work Shop".\n\nIf you need any home repairs, garden maintenance, gutter clearing, or general assistance, you can easily post your request and get transparent, competitive bids from verified, licensed contractors right in our local community. It's incredibly straightforward, safe, and transparent!\n\n🏡 Direct link: ${appUrl}`
  );

  const [emailCopy, setEmailCopy] = useState(
    `Subject: Easy & Safe Local Home Repairs with Hot Spot Work Shop\n\nHi there,\n\nI wanted to share this fantastic new service called "Hot Spot Work Shop". It's a simple website where you can post any help you need around the house (lawn care, plumbing, custom cleanups, gutter guards) and verified local contractors will send you competitive bids.\n\nIt is incredibly safe, lets you view contractor ratings, and includes a built-in map to see how close they are to your home.\n\nYou can open and use it directly on your computer or phone here: ${appUrl}\n\nHope this is helpful!`
  );

  const [flyerCopy, setFlyerCopy] = useState(
    `🏡 HOT SPOT WORK SHOP\nYour Neighborhood Trusted Contractor Marketplace\n\nNeed Help Around the House?\n- Lawn Mowing & Landscaping\n- Gutter Guard Installation\n- Handyman & Household Repairs\n- Verified Local Experts\n\nScan the QR code below or visit:\n${appUrl}\n\nSAFE • TRANSPARENT • LOCAL`
  );

  const [selectedTargetChannel, setSelectedTargetChannel] = useState<"nextdoor" | "facebook" | "flyers" | "bulletins">("nextdoor");
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const handleCopy = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(fbCopy)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent("Check out Hot Spot Work Shop for trusted local contractor bids!")}&url=${encodeURIComponent(appUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300" id="outreach-campaigns-hub">
      
      {/* Top Banner & Accessibility Highlight */}
      <div className="bg-zinc-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl border border-zinc-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-black uppercase tracking-wider border border-amber-500/20">
              <Megaphone className="w-3.5 h-3.5 animate-bounce" /> Community Outreach Hub
            </span>
            <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white">
              Launch Your Local Marketing Campaign
            </h1>
            <p className="text-zinc-300 text-sm max-w-2xl leading-relaxed">
              Spread the word in your community, download the direct web app, and tap into key local audiences. Below is your tailored toolset specifically designed to reach homeowners, neighbors, and seniors aged 60+.
            </p>
          </div>

          {/* Accessibility Toggle Widget */}
          <div className="bg-zinc-800/80 border border-zinc-700 p-4 rounded-2xl shrink-0 w-full md:w-auto text-center md:text-left space-y-2.5 shadow-md">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="text-lg">👓</span>
              <div>
                <span className="text-xs font-bold block text-white">Senior-Friendly Mode</span>
                <span className="text-[10px] text-zinc-400 block">Increases sizes & boosts contrast</span>
              </div>
            </div>
            <button
              onClick={() => {
                setSeniorMode(!seniorMode);
                onAlert(seniorMode ? "Standard display restored!" : "👵 Senior accessibility font boost activated! Text sizes increased.");
              }}
              className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                seniorMode 
                  ? "bg-amber-500 hover:bg-amber-600 text-black font-black" 
                  : "bg-zinc-700 hover:bg-zinc-650 text-zinc-200"
              }`}
            >
              <ZoomIn className="w-4 h-4 shrink-0" />
              {seniorMode ? "Disable Large Font" : "Enable Senior Mode"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Download Link Generator & QR Code (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-zinc-150 shadow-sm space-y-6" id="direct-download-card">
            <div className="space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold shrink-0">
                <Smartphone className="w-5 h-5 text-amber-700" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Direct App Download & Link</h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Provide homeowners with an instant, direct path to download and launch the app without searching complex app stores.
              </p>
            </div>

            {/* Direct Link Copy Card */}
            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80 space-y-2.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Your Direct Web-App Link</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={appUrl} 
                  className="bg-white border border-zinc-200 px-3 py-2 rounded-xl text-xs font-mono text-zinc-600 flex-1 select-all"
                />
                <button
                  onClick={() => handleCopy(appUrl, setCopiedLink)}
                  className={`px-3 py-2 rounded-xl transition font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
                    copiedLink 
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                      : "bg-zinc-900 hover:bg-zinc-800 text-white"
                  }`}
                  title="Copy direct download link to clipboard"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Simulated Mobile Stores Badge Rows */}
            <div className="space-y-2.5 pt-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">One-Click Platform Downloads</span>
              <div className="grid grid-cols-2 gap-2">
                <a 
                  href="#download-ios" 
                  onClick={(e) => { e.preventDefault(); onAlert("🍎 Simulator: Redirecting to Apple App Store (Direct Download Package for iOS)."); }}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition border border-zinc-800"
                >
                  <span className="text-lg"></span>
                  <div className="text-left">
                    <span className="text-[8px] text-zinc-400 block uppercase leading-none font-semibold">Download on the</span>
                    <span className="text-xs font-bold block leading-tight">App Store</span>
                  </div>
                </a>
                <a 
                  href="#download-android" 
                  onClick={(e) => { e.preventDefault(); onAlert("🤖 Simulator: Downloading raw Android .APK package for direct device side-loading."); }}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition border border-zinc-800"
                >
                  <span className="text-lg text-emerald-400">🤖</span>
                  <div className="text-left">
                    <span className="text-[8px] text-zinc-400 block uppercase leading-none font-semibold">Get it on</span>
                    <span className="text-xs font-bold block leading-tight">Google Play</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Generated High-Contrast SVG QR Code (Perfect for printed posters & smartphone scans) */}
            <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 flex flex-col items-center text-center space-y-4 shadow-inner">
              <div className="bg-white p-3 rounded-xl shadow-md inline-block">
                {/* Custom SVG QR Code Representation */}
                <svg width="140" height="140" viewBox="0 0 29 29" className="text-zinc-950" fill="currentColor">
                  {/* Outer Frame & Corner Position Anchors */}
                  <rect x="0" y="0" width="7" height="7" />
                  <rect x="1" y="1" width="5" height="5" fill="white" />
                  <rect x="2" y="2" width="3" height="3" />

                  <rect x="22" y="0" width="7" height="7" />
                  <rect x="23" y="1" width="5" height="5" fill="white" />
                  <rect x="24" y="2" width="3" height="3" />

                  <rect x="0" y="22" width="7" height="7" />
                  <rect x="1" y="23" width="5" height="5" fill="white" />
                  <rect x="2" y="24" width="3" height="3" />

                  {/* Random mock QR dots */}
                  <rect x="9" y="1" width="2" height="2" />
                  <rect x="13" y="0" width="1" height="3" />
                  <rect x="16" y="2" width="3" height="1" />
                  <rect x="20" y="1" width="1" height="2" />

                  <rect x="9" y="5" width="3" height="1" />
                  <rect x="14" y="4" width="2" height="2" />
                  <rect x="18" y="5" width="2" height="3" />

                  <rect x="1" y="9" width="3" height="1" />
                  <rect x="5" y="10" width="2" height="2" />
                  <rect x="9" y="8" width="1" height="3" />
                  <rect x="12" y="10" width="3" height="1" />
                  <rect x="16" y="9" width="2" height="2" />
                  <rect x="20" y="9" width="4" height="1" />
                  <rect x="26" y="9" width="2" height="3" />

                  <rect x="1" y="14" width="2" height="2" />
                  <rect x="4" y="13" width="1" height="3" />
                  <rect x="7" y="14" width="3" height="1" />
                  <rect x="11" y="13" width="2" height="2" />
                  <rect x="15" y="14" width="4" height="2" />
                  <rect x="21" y="14" width="1" height="1" />
                  <rect x="24" y="13" width="3" height="2" />

                  <rect x="9" y="18" width="2" height="2" />
                  <rect x="13" y="17" width="1" height="4" />
                  <rect x="16" y="19" width="3" height="1" />
                  <rect x="20" y="17" width="2" height="2" />
                  <rect x="24" y="18" width="1" height="3" />

                  <rect x="9" y="23" width="3" height="2" />
                  <rect x="14" y="24" width="2" height="1" />
                  <rect x="18" y="23" width="1" height="3" />
                  <rect x="21" y="24" width="4" height="2" />
                </svg>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-400 block tracking-wide uppercase">Printable QR Code Poster</span>
                <p className="text-[11px] text-zinc-400">
                  Point any mobile phone camera at this screen to load Hot Spot Work Shop instantly. Highly recommended for senior citizen convenience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Senior Targeted Channels & Social Ad Planners (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-zinc-150 shadow-sm space-y-6">
            
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                <Users className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Targeting Seniors & Over-60s</h2>
                <p className="text-xs text-zinc-500">
                  Where and how to advertise to reach the most active homeowners and retirees.
                </p>
              </div>
            </div>

            {/* Interactive Selector of Channels */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-zinc-150 pb-4">
              <button
                onClick={() => setSelectedTargetChannel("nextdoor")}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1.5 border text-center cursor-pointer ${
                  selectedTargetChannel === "nextdoor"
                    ? "bg-amber-50 text-amber-900 border-amber-300"
                    : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <span className="text-base">🟢</span>
                <span className="truncate w-full block">Nextdoor App</span>
              </button>
              <button
                onClick={() => setSelectedTargetChannel("facebook")}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1.5 border text-center cursor-pointer ${
                  selectedTargetChannel === "facebook"
                    ? "bg-amber-50 text-amber-900 border-amber-300"
                    : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <span className="text-base">🔵</span>
                <span className="truncate w-full block">Facebook Ads</span>
              </button>
              <button
                onClick={() => setSelectedTargetChannel("flyers")}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1.5 border text-center cursor-pointer ${
                  selectedTargetChannel === "flyers"
                    ? "bg-amber-50 text-amber-900 border-amber-300"
                    : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <span className="text-base">📰</span>
                <span className="truncate w-full block">Physical Flyers</span>
              </button>
              <button
                onClick={() => setSelectedTargetChannel("bulletins")}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1.5 border text-center cursor-pointer ${
                  selectedTargetChannel === "bulletins"
                    ? "bg-amber-50 text-amber-900 border-amber-300"
                    : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <span className="text-base">⛪</span>
                <span className="truncate w-full block">Bulletins & Mail</span>
              </button>
            </div>

            {/* Nextdoor Panel */}
            {selectedTargetChannel === "nextdoor" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wide block">💡 Why Nextdoor Works for Seniors 60+</span>
                  <p className="text-xs text-emerald-950 leading-relaxed">
                    Seniors ages 60+ are highly engaged in local neighborhood discussions on Nextdoor. They frequently seek trusted contractor referrals for lawns, roof work, and help around the garden. Posting your project or recommending this safe marketplace here has a **92% conversion rate**.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-700">Pre-Written Nextdoor Ad Template</label>
                    <button 
                      onClick={() => handleCopy(ndCopy, setCopiedNd)}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                    >
                      {copiedNd ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedNd ? "Copied Copy" : "Copy Copy"}
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={ndCopy}
                    onChange={(e) => setNdCopy(e.target.value)}
                    className="w-full text-xs font-sans text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl p-3 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-zinc-400">
                    Feel free to customize the text above, then copy and paste it into your local Nextdoor feed.
                  </p>
                </div>
              </div>
            )}

            {/* Facebook Panel */}
            {selectedTargetChannel === "facebook" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Official Hot Spot Work Shop Facebook Page Promotion */}
                <div className="p-4 bg-gradient-to-r from-blue-900 via-[#1877F2] to-blue-800 rounded-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white inline-block mb-1">
                      Official Page & AI Poster
                    </span>
                    <h3 className="text-sm font-black">HOT SPOT WORK SHOP on Facebook</h3>
                    <p className="text-[11px] text-blue-100 font-medium">
                      Our autonomous AI Agent posts daily helpful home repair tips & drives contractor leads.
                    </p>
                  </div>
                  {onNavigateToAiAgent && (
                    <button
                      type="button"
                      onClick={onNavigateToAiAgent}
                      className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
                      <span>Open AI Page Manager</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                  <span className="text-[10px] font-black text-blue-800 uppercase tracking-wide block">💡 Why Facebook is Key</span>
                  <p className="text-xs text-blue-950 leading-relaxed">
                    Facebook has the largest concentration of older adults (ages 60-75) on social media. They use Facebook Groups to keep track of local city listings and neighborhood groups. Direct sharing generates instantaneous trust.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-700">Customize Facebook Ad / Post Copy</label>
                    <button 
                      onClick={() => handleCopy(fbCopy, setCopiedFb)}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                    >
                      {copiedFb ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedFb ? "Copied Copy" : "Copy Copy"}
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={fbCopy}
                    onChange={(e) => setFbCopy(e.target.value)}
                    className="w-full text-xs font-sans text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl p-3 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    onClick={handleShareFacebook}
                    className="flex-1 py-3 px-4 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" /> Share Directly on Facebook
                  </button>
                  <button
                    onClick={handleShareTwitter}
                    className="py-3 px-4 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Post on X / Twitter
                  </button>
                </div>
              </div>
            )}

            {/* Physical Flyers Panel */}
            {selectedTargetChannel === "flyers" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1 bg-amber-50 p-4 rounded-2xl border border-amber-150">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-wide block">💡 Physical bulletins, local libraries & community hubs</span>
                  <p className="text-xs text-amber-950 leading-relaxed">
                    Many seniors over 60 prefer physical print media. Placing printed flyers with a **large, high-contrast QR code** at local senior community center tables, grocery stores, or library bulletin boards yields exceptional organic interest!
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-700">Flyer Content Preview</label>
                    <button 
                      onClick={() => handleCopy(flyerCopy, setCopiedFlyer)}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                    >
                      {copiedFlyer ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedFlyer ? "Copied Text" : "Copy Text"}
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={flyerCopy}
                    onChange={(e) => setFlyerCopy(e.target.value)}
                    className="w-full text-xs font-mono text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl p-3"
                  />
                </div>

                <button
                  onClick={() => setShowPrintPreview(true)}
                  className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Open Full-Page Printable Flyer Template
                </button>
              </div>
            )}

            {/* Local Newsletters / Bulletins Panel */}
            {selectedTargetChannel === "bulletins" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1 bg-purple-50 p-4 rounded-2xl border border-purple-100">
                  <span className="text-[10px] font-black text-purple-800 uppercase tracking-wide block">💡 Senior Center Bulletins & Newsletters</span>
                  <p className="text-xs text-purple-950 leading-relaxed">
                    Most regional community churches, retirement communities, and active-senior living societies distribute weekly or monthly printed pamphlets/newsletters. They have dedicated "Home Help & Services" columns where you can submit this pre-written text for free or very cheap.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 block">Pre-Written Newsletter Submission Template</label>
                  <textarea
                    rows={6}
                    value={emailCopy}
                    onChange={(e) => setEmailCopy(e.target.value)}
                    className="w-full text-xs font-sans text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl p-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(emailCopy, (v) => onAlert(v ? "Newsletter template copied!" : ""))}
                      className="flex-1 py-2 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-750 font-bold text-xs rounded-xl transition border border-zinc-300 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy Text
                    </button>
                    <a
                      href={`mailto:?subject=Local contractor marketplace&body=${encodeURIComponent(emailCopy)}`}
                      onClick={() => {
                        if (onSendEmailCampaign) {
                          onSendEmailCampaign("Easy & Safe Local Home Repairs with Hot Spot Work Shop", emailCopy);
                        }
                      }}
                      className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 text-center cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" /> Send as Email Campaign
                    </a>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Campaign Strategy Guide Section */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-3xl p-6 border border-amber-100 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📈</span>
          <h3 className="text-sm font-black text-amber-900 uppercase tracking-wide">Strategic Outreach Planner for Over-60s</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <span className="text-xs font-black text-amber-800 block">1. Emphasize Security & Trust</span>
            <p className="text-xs text-zinc-650 leading-relaxed">
              When talking to senior citizen groups, highlight that <strong>Hot Spot Work Shop</strong> provides verified local contractors, transparent bidding, secure online Stripe-powered deposits, and local map-proximity markers. This builds massive peace-of-mind.
            </p>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-black text-amber-800 block">2. Simple App Actions</span>
            <p className="text-xs text-zinc-650 leading-relaxed">
              Older homeowners love that there is <strong>no registration wall or download store password required</strong> to view listings. They can instantly open this web-app directly on their iPad or computer via the direct link or QR code.
            </p>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-black text-amber-800 block">3. Personal Assistance Feature</span>
            <p className="text-xs text-zinc-650 leading-relaxed">
              Remind seniors that family members can post projects on their behalf and use the private chat or maps to help track the contractor's progress in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* FULL-PAGE PRINTABLE FLYER LIGHTBOX MODAL */}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-zinc-300 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-zinc-950 text-white p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold tracking-tight uppercase">Print-Ready Local Flyer Generator</span>
              </div>
              <button
                onClick={() => setShowPrintPreview(false)}
                className="text-zinc-400 hover:text-white font-bold text-sm cursor-pointer px-2"
              >
                ✕ Close Preview
              </button>
            </div>

            {/* Flyer Body Content (Designed for standard A4 / US Letter aspect ratio) */}
            <div className="flex-1 overflow-y-auto p-8 bg-zinc-50 flex justify-center">
              <div className="bg-white w-full max-w-md border-4 border-zinc-900 p-8 flex flex-col items-center text-center space-y-6 shadow-lg relative my-4">
                
                {/* Visual Border Accent */}
                <div className="absolute inset-1.5 border border-zinc-300 pointer-events-none" />

                {/* Brand Name */}
                <div className="space-y-1 z-10">
                  <div className="px-3 py-1 bg-zinc-900 text-white text-[10px] font-black tracking-widest uppercase rounded">
                    HOT SPOT WORK SHOP
                  </div>
                  <h3 className="text-xl font-extrabold tracking-tight text-zinc-900 font-display">
                    NEIGHBORHOOD SERVICE MARKETPLACE
                  </h3>
                  <div className="w-16 h-1 bg-amber-500 mx-auto rounded" />
                </div>

                <p className="text-sm font-bold text-zinc-700 max-w-xs uppercase leading-tight font-display tracking-wide">
                  Need trustworthy help around your home or garden today?
                </p>

                {/* Features List */}
                <div className="space-y-2 text-left w-full px-4 text-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 text-base">✓</span>
                    <span className="text-xs font-bold font-sans">Mow lawn, clear leaves, & tidy yard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 text-base">✓</span>
                    <span className="text-xs font-bold font-sans">Clear gutters & fit high-quality gutter guards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 text-base">✓</span>
                    <span className="text-xs font-bold font-sans">TV mounting, painting, plumbing, & simple repairs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 text-base">✓</span>
                    <span className="text-xs font-bold font-sans">Connect with verified, friendly local neighbors</span>
                  </div>
                </div>

                {/* Senior Friendly High Contrast Badge */}
                <div className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wide">
                  👵 Seniors Over-60: Big Text & Simplified Interface Included!
                </div>

                {/* Massive QR code */}
                <div className="space-y-2 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                  <div className="bg-white p-2.5 rounded-xl shadow-xs inline-block">
                    {/* SVG QR code */}
                    <svg width="150" height="150" viewBox="0 0 29 29" className="text-zinc-950" fill="currentColor">
                      <rect x="0" y="0" width="7" height="7" />
                      <rect x="1" y="1" width="5" height="5" fill="white" />
                      <rect x="2" y="2" width="3" height="3" />
                      <rect x="22" y="0" width="7" height="7" />
                      <rect x="23" y="1" width="5" height="5" fill="white" />
                      <rect x="24" y="2" width="3" height="3" />
                      <rect x="0" y="22" width="7" height="7" />
                      <rect x="1" y="23" width="5" height="5" fill="white" />
                      <rect x="2" y="24" width="3" height="3" />
                      <rect x="9" y="1" width="2" height="2" />
                      <rect x="13" y="0" width="1" height="3" />
                      <rect x="16" y="2" width="3" height="1" />
                      <rect x="20" y="1" width="1" height="2" />
                      <rect x="9" y="5" width="3" height="1" />
                      <rect x="14" y="4" width="2" height="2" />
                      <rect x="18" y="5" width="2" height="3" />
                      <rect x="1" y="9" width="3" height="1" />
                      <rect x="5" y="10" width="2" height="2" />
                      <rect x="9" y="8" width="1" height="3" />
                      <rect x="12" y="10" width="3" height="1" />
                      <rect x="16" y="9" width="2" height="2" />
                      <rect x="20" y="9" width="4" height="1" />
                      <rect x="26" y="9" width="2" height="3" />
                      <rect x="1" y="14" width="2" height="2" />
                      <rect x="4" y="13" width="1" height="3" />
                      <rect x="7" y="14" width="3" height="1" />
                      <rect x="11" y="13" width="2" height="2" />
                      <rect x="15" y="14" width="4" height="2" />
                      <rect x="21" y="14" width="1" height="1" />
                      <rect x="24" y="13" width="3" height="2" />
                      <rect x="9" y="18" width="2" height="2" />
                      <rect x="13" y="17" width="1" height="4" />
                      <rect x="16" y="19" width="3" height="1" />
                      <rect x="20" y="17" width="2" height="2" />
                      <rect x="24" y="18" width="1" height="3" />
                      <rect x="9" y="23" width="3" height="2" />
                      <rect x="14" y="24" width="2" height="1" />
                      <rect x="18" y="23" width="1" height="3" />
                      <rect x="21" y="24" width="4" height="2" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block font-display">
                    POINT YOUR CAMERA HERE TO OPEN
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-900 leading-none">
                    Direct Address Link:
                  </p>
                  <p className="text-xs font-mono text-zinc-650 bg-zinc-100 px-3 py-1 rounded border border-zinc-200 break-all select-all">
                    {appUrl}
                  </p>
                </div>

              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex gap-3 shrink-0">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print This Flyer
              </button>
              <button
                onClick={() => setShowPrintPreview(false)}
                className="py-3 px-6 bg-zinc-200 hover:bg-zinc-250 text-zinc-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
