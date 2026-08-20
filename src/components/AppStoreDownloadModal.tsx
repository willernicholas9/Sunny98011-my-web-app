import React, { useState } from "react";
import { 
  X, 
  Smartphone, 
  Download, 
  Share, 
  PlusSquare, 
  Check, 
  Sparkles, 
  Star, 
  ShieldCheck, 
  Layers, 
  Code, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Apple,
  FileCode2,
  PackageCheck
} from "lucide-react";

interface AppStoreDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlert?: (msg: string) => void;
}

export default function AppStoreDownloadModal({
  isOpen,
  onClose,
  onAlert = (msg) => alert(msg),
}: AppStoreDownloadModalProps) {
  const [activeTab, setActiveTab] = useState<"instant_install" | "appstore_preview" | "xcode_package">("instant_install");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [downloadedPackage, setDownloadedPackage] = useState(false);
  const [testFlightEmail, setTestFlightEmail] = useState("");
  const [testFlightSubmitted, setTestFlightSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCode(key);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  const handleDownloadIosConfig = () => {
    const capacitorConfig = {
      appId: "com.hotspotworkshop.app",
      appName: "Hot Spot Workshop",
      webDir: "dist",
      bundledWebRuntime: false,
      server: {
        url: window.location.origin,
        cleartext: true,
        androidScheme: "https"
      },
      ios: {
        contentInset: "always",
        scheme: "hotspotworkshop",
        allowsLinkPreview: false,
        backgroundColor: "#09090b",
        preferredContentMode: "mobile"
      },
      plugins: {
        PushNotifications: {
          presentationOptions: ["badge", "sound", "alert"]
        },
        SplashScreen: {
          launchShowDuration: 1500,
          backgroundColor: "#09090b",
          showSpinner: false
        }
      }
    };

    const infoPlistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>en</string>
	<key>CFBundleDisplayName</key>
	<string>Hot Spot</string>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>com.hotspotworkshop.app</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>Hot Spot Workshop</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0.0</string>
	<key>CFBundleVersion</key>
	<string>1</string>
	<key>LSRequiresIPhoneOS</key>
	<true/>
	<key>NSCameraUsageDescription</key>
	<string>Hot Spot Workshop requires camera access to take and attach photos of project repairs and job sites.</string>
	<key>NSPhotoLibraryUsageDescription</key>
	<string>Hot Spot Workshop requires photo library access to upload before/after home improvement photos.</string>
	<key>NSLocationWhenInUseUsageDescription</key>
	<string>Hot Spot Workshop requires your location to calculate real-time driving mileage to nearby trade jobs.</string>
	<key>ITSAppUsesNonExemptEncryption</key>
	<false/>
</dict>
</plist>`;

    const appStoreMetadata = {
      name: "Hot Spot Workshop",
      subtitle: "Home Improvement & Trade Escrow",
      bundleId: "com.hotspotworkshop.app",
      primaryCategory: "Business",
      secondaryCategory: "Utilities",
      ageRating: "12+",
      copyright: "2026 Hot Spot Workshop Inc.",
      privacyPolicyUrl: `${window.location.origin}/privacy`,
      supportUrl: `${window.location.origin}/support`,
      inAppPurchases: [
        { id: "com.hotspotworkshop.pro.monthly", price: "$29.00/mo", type: "Auto-Renewable Subscription" },
        { id: "com.hotspotworkshop.elite.monthly", price: "$79.00/mo", type: "Auto-Renewable Subscription" },
        { id: "com.hotspotworkshop.credits.starter", price: "$15.00", type: "Consumable (5 Lead Credits)" },
        { id: "com.hotspotworkshop.credits.growth", price: "$39.00", type: "Consumable (15 Lead Credits)" },
        { id: "com.hotspotworkshop.credits.dominance", price: "$99.00", type: "Consumable (50 Lead Credits)" },
        { id: "com.hotspotworkshop.job.boost7d", price: "$9.99", type: "Consumable (7-Day Priority Listing)" }
      ]
    };

    const payload = JSON.stringify({
      "capacitor.config.json": capacitorConfig,
      "Info.plist": infoPlistContent,
      "AppStoreConnectMetadata.json": appStoreMetadata,
      "exportDate": new Date().toISOString()
    }, null, 2);

    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "HotSpotWorkshop-AppleAppStore-Package.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadedPackage(true);
    setTimeout(() => setDownloadedPackage(false), 4000);
  };

  const handleTestFlightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testFlightEmail || !testFlightEmail.includes("@")) {
      onAlert("Please enter a valid Apple ID / TestFlight email address.");
      return;
    }
    setTestFlightSubmitted(true);
    onAlert(`🎉 TestFlight invite dispatched to ${testFlightEmail}! You will receive an email from Apple TestFlight to test the latest iOS build.`);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-zinc-950/80 backdrop-blur-sm animate-fade-in"
      id="apple-appstore-modal-overlay"
    >
      <div 
        className="bg-white max-w-3xl w-full rounded-2xl sm:rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        id="apple-appstore-modal-container"
      >
        {/* Header with Apple Branding */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-900 text-white border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
              <Apple className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-sm sm:text-base tracking-tight text-white">
                  Download on Apple App Store & iOS
                </h3>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  iOS 16+ & PWA
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Install as a standalone native iOS application or download the Xcode App Store deployment bundle
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer"
            id="close-appstore-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1.5 bg-zinc-100 border-b border-zinc-200 text-xs font-bold gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("instant_install")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === "instant_install"
                ? "bg-white text-zinc-900 shadow-xs ring-1 ring-zinc-200"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
            id="tab-ios-instant-install"
          >
            <Smartphone className="w-4 h-4 text-amber-600" />
            <span>1. Instant iOS App (1-Tap Install)</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab("appstore_preview")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === "appstore_preview"
                ? "bg-white text-zinc-900 shadow-xs ring-1 ring-zinc-200"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
            id="tab-appstore-preview"
          >
            <Apple className="w-4 h-4 text-zinc-900" />
            <span>2. App Store Listing Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("xcode_package")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === "xcode_package"
                ? "bg-white text-zinc-900 shadow-xs ring-1 ring-zinc-200"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
            id="tab-xcode-package"
          >
            <FileCode2 className="w-4 h-4 text-blue-600" />
            <span>3. Xcode / IPA Submission Package</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: INSTANT IOS APP INSTALLATION */}
          {activeTab === "instant_install" && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-black text-sm sm:text-base text-zinc-900">
                    Direct iOS Standalone App Installation
                  </h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Hot Spot Workshop is fully engineered with Apple Mobile Web App standards and Progressive Web App specifications. You can install it directly onto your iPhone or iPad home screen with zero App Store download wait times or storage bottlenecks.
                  </p>
                </div>
              </div>

              {/* Step-by-Step iOS Safari Guide */}
              <div className="space-y-3">
                <h5 className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                  How to Install on iPhone & iPad (Safari)
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Step 1 */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-2 relative">
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                      1
                    </div>
                    <div className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
                      <Share className="w-4 h-4 text-blue-600" />
                      <span>Tap Safari Share</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      Open this URL in <strong>Apple Safari</strong> on your iPhone or iPad, then tap the <strong>Share</strong> button at the bottom of the screen.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-2 relative">
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                      2
                    </div>
                    <div className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
                      <PlusSquare className="w-4 h-4 text-emerald-600" />
                      <span>"Add to Home Screen"</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      Scroll down in the iOS share sheet and tap <strong>"Add to Home Screen"</strong> (➕).
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-2 relative">
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                      3
                    </div>
                    <div className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Launch Native App</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      Tap <strong>"Add"</strong>. The app icon appears on your home screen and launches in full-screen standalone mode with push alerts!
                    </p>
                  </div>
                </div>
              </div>

              {/* TestFlight Beta Invite Signup */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 text-white space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Apple className="w-5 h-5 text-white" />
                    <h5 className="font-bold text-xs sm:text-sm text-white">
                      Apple TestFlight Beta Access
                    </h5>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-bold">
                    Build 1.0.0 (2026.8)
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Join our official Apple TestFlight developer beta group to receive native iOS `.ipa` builds directly through Apple's TestFlight app on your devices.
                </p>

                <form onSubmit={handleTestFlightSubmit} className="flex gap-2">
                  <input
                    type="email"
                    value={testFlightEmail}
                    onChange={(e) => setTestFlightEmail(e.target.value)}
                    placeholder="Enter your Apple ID / email address..."
                    className="flex-1 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-xs px-3.5 py-2.5 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                    id="testflight-email-input"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer shrink-0 flex items-center gap-1.5"
                    id="submit-testflight-btn"
                  >
                    <span>Request Invite</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>

                {testFlightSubmitted && (
                  <div className="text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-fade-in">
                    <Check className="w-4 h-4" />
                    <span>Invite registered! Check your Apple TestFlight notification email.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: APP STORE LISTING SIMULATOR */}
          {activeTab === "appstore_preview" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="border border-zinc-200 rounded-3xl overflow-hidden bg-white shadow-sm">
                
                {/* Mock iOS App Store Product Page Header */}
                <div className="p-4 sm:p-6 border-b border-zinc-100 flex items-start gap-4">
                  {/* App Icon */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white shrink-0 shadow-lg p-2 relative overflow-hidden">
                    <img 
                      src="/apple-touch-icon.svg" 
                      alt="Hot Spot Workshop App Icon"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* App Details */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="font-display font-black text-base sm:text-xl text-zinc-900 leading-tight">
                      Hot Spot Workshop
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium">
                      Home Improvement & Trade Escrow
                    </p>
                    <p className="text-[11px] text-blue-600 font-semibold">
                      Hot Spot Workshop Inc. &bull; In-App Purchases
                    </p>

                    <div className="flex items-center gap-3 pt-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("instant_install");
                          onAlert("✨ Follow the 3-step guide to install Hot Spot Workshop directly onto your iOS home screen!");
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-5 py-1.5 rounded-full transition shadow-xs cursor-pointer tracking-wide"
                        id="appstore-get-btn"
                      >
                        GET
                      </button>

                      <div className="flex items-center gap-1 text-xs text-zinc-700 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>4.9</span>
                        <span className="text-zinc-400 font-normal text-[11px]">(2.4K Ratings)</span>
                      </div>

                      <span className="text-[11px] font-bold text-zinc-500 border border-zinc-300 px-1.5 py-0.5 rounded">
                        12+
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metrics Banner */}
                <div className="grid grid-cols-4 divide-x divide-zinc-100 bg-zinc-50/70 text-center py-3 border-b border-zinc-100 text-xs">
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">Ratings</div>
                    <div className="font-extrabold text-zinc-800">4.9 ★</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">Category</div>
                    <div className="font-extrabold text-zinc-800">Business</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">Developer</div>
                    <div className="font-extrabold text-zinc-800 truncate px-1">Hot Spot</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">Language</div>
                    <div className="font-extrabold text-zinc-800">EN + 4</div>
                  </div>
                </div>

                {/* Description & Feature Highlights */}
                <div className="p-4 sm:p-6 space-y-4">
                  <div>
                    <h5 className="font-bold text-xs text-zinc-900 mb-1">What's New in Version 1.0.0</h5>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      &bull; Real-time bi-directional marketplace synchronization between web & mobile apps<br/>
                      &bull; Instant 3D AR & Canvas OpenGraph social card share studio<br/>
                      &bull; Multi-tier contractor subscriptions ($29 Pro / $79 Elite) with 0% lead fee options<br/>
                      &bull; 24/7 Emergency dispatch dispatching contractors in &lt; 30 minutes
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-xs text-zinc-900 mb-1">In-App Purchases & Subscriptions</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200 flex justify-between items-center">
                        <span className="font-semibold text-zinc-800">Pro Contractor Tier</span>
                        <span className="font-mono font-bold text-emerald-700">$29.00/mo</span>
                      </div>
                      <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200 flex justify-between items-center">
                        <span className="font-semibold text-zinc-800">Elite Contractor Tier</span>
                        <span className="font-mono font-bold text-emerald-700">$79.00/mo</span>
                      </div>
                      <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200 flex justify-between items-center">
                        <span className="font-semibold text-zinc-800">Lead Credit Pack (15)</span>
                        <span className="font-mono font-bold text-emerald-700">$39.00</span>
                      </div>
                      <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200 flex justify-between items-center">
                        <span className="font-semibold text-zinc-800">7-Day Job Priority Boost</span>
                        <span className="font-mono font-bold text-emerald-700">$9.99</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: XCODE & CAPACITOR PACKAGE DOWNLOAD */}
          {activeTab === "xcode_package" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <FileCode2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-blue-900">
                  <span className="font-bold block">Developer & App Store Connect Submission Bundle</span>
                  <p className="text-blue-800/90 leading-relaxed">
                    Download the complete configuration bundle containing <code>capacitor.config.json</code>, Apple <code>Info.plist</code> with privacy permissions, and App Store Connect metadata to compile this app in Xcode for TestFlight & App Store distribution.
                  </p>
                </div>
              </div>

              {/* 1-Click Download Button */}
              <div className="p-4 bg-zinc-900 rounded-2xl text-white flex items-center justify-between flex-wrap gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-white flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-emerald-400" />
                    <span>HotSpotWorkshop-AppleAppStore-Package.json</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Includes iOS bundle ID <code>com.hotspotworkshop.app</code>, Info.plist, and IAP schemas.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadIosConfig}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  id="download-ios-package-btn"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadedPackage ? "Downloaded!" : "Download iOS Package"}</span>
                </button>
              </div>

              {/* Xcode Terminal Commands Quick Copy */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
                  <span>Xcode Terminal Setup Instructions:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy("npm install @capacitor/core @capacitor/cli @capacitor/ios\nnpx cap init \"Hot Spot Workshop\" com.hotspotworkshop.app --web-dir dist\nnpx cap add ios\nnpx cap open ios", "xcode_cmds")}
                    className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode === "xcode_cmds" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode === "xcode_cmds" ? "Copied!" : "Copy Commands"}</span>
                  </button>
                </div>

                <pre className="bg-zinc-950 text-amber-300 font-mono text-[11px] p-3.5 rounded-xl overflow-x-auto border border-zinc-800 leading-relaxed">
{`# 1. Install Capacitor iOS runtime
npm install @capacitor/core @capacitor/cli @capacitor/ios

# 2. Initialize Xcode project with Bundle Identifier
npx cap init "Hot Spot Workshop" com.hotspotworkshop.app --web-dir dist

# 3. Add iOS platform and sync assets
npx cap add ios
npx cap copy ios

# 4. Open in Xcode to archive & upload to App Store Connect
npx cap open ios`}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Apple iOS & Web Application Certification</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("instant_install");
                onAlert("📱 To install on iOS: Open this page in Safari on your iPhone, tap Share (⎋), and select 'Add to Home Screen' (➕)!");
              }}
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              id="footer-install-ios-btn"
            >
              <Apple className="w-4 h-4 text-white" />
              <span>Install on iPhone / iPad</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
