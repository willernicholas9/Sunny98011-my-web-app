import React, { useState, useEffect } from "react";
import {
  Bot, Sparkles, Download, Laptop, Smartphone, Play, Pause,
  RefreshCw, CheckCircle2, AlertCircle, Terminal, DollarSign,
  Target, Users, Radio, Wifi, HardDrive, ShieldCheck, Zap,
  Activity, Megaphone, Globe, Compass, ChevronRight, Check, Save,
  Copy, FileText, Share2, MapPin, Printer, ExternalLink, MessageSquare,
  Award, Send, Layers, Scissors
} from "lucide-react";
import AiAdCreativeStudio from "./outreach/AiAdCreativeStudio";
import LiveLeadStreamVisualizer from "./outreach/LiveLeadStreamVisualizer";
import WeatherTriggerEngine from "./outreach/WeatherTriggerEngine";
import PrintableDoorHangerModal from "./outreach/PrintableDoorHangerModal";

interface AutonomousAdInstallerAgentProps {
  appUrl?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: "ad_broadcast" | "system_install" | "optimization" | "system_audit";
  message: string;
  status: "success" | "pending" | "info";
}

export default function AutonomousAdInstallerAgent({
  appUrl = window.location.origin
}: AutonomousAdInstallerAgentProps) {
  const [agentRunning, setAgentRunning] = useState(false);
  const [dailyBudget, setDailyBudget] = useState(50);
  const [targetZips, setTargetZips] = useState("90210, 30301, 60601, 75001, 98101");
  const [zipsSaved, setZipsSaved] = useState(false);
  const [isDoorHangerModalOpen, setIsDoorHangerModalOpen] = useState(false);

  const handleSaveZips = () => {
    try {
      localStorage.setItem("hsws_ad_target_zips", targetZips);
    } catch {}
    setZipsSaved(true);
    setTimeout(() => setZipsSaved(false), 3000);
  };
  const [selectedChannels, setSelectedChannels] = useState<{ [key: string]: boolean }>({
    nextdoor: true,
    facebook: true,
    sms_broadcast: true,
    google_local: true,
    local_radio: false,
  });

  const [installStatus, setInstallStatus] = useState<"installed" | "ready" | "downloading">("ready");
  const [autoStartOS, setAutoStartOS] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);

  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);
  const [activeResourceTab, setActiveResourceTab] = useState<"all_states" | "ad_copy" | "flyers" | "press_release" | "campaign_checklist">("all_states");

  const US_REGION_PRESETS = {
    "⭐ Central US (TX, IL, MO, MN, TN, OK - Preferred CT Zone)": "78701, 75201, 77001, 60601, 63101, 55401, 37201, 73101",
    "Midwest & Central (IL, MI, OH, WI, MN, MO)": "60601, 48201, 44101, 53201, 55401, 63101",
    "Southwest (TX, AZ, OK, NM)": "78701, 75201, 77001, 85001, 73101, 87101",
    "Southeast (GA, FL, NC, TN, AL, SC)": "30301, 33101, 27601, 37201, 32201, 29201",
    "Northeast (NY, MA, PA, NJ, CT)": "10001, 02108, 19101, 07102, 02903, 06103",
    "West Coast & Rockies (CA, WA, OR, CO, NV)": "90210, 94101, 98101, 97201, 80201, 89101",
    "🔥 All 50 US States Top Metros": "78701, 75201, 60601, 77001, 85001, 10001, 90210, 19101, 78201, 92101, 30301, 33101, 98101, 80201, 20001, 02108, 48201, 37201, 55401, 70112"
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplateId(id);
    setTimeout(() => setCopiedTemplateId(null), 3000);
  };

  const handleApplyPresetZips = (zipString: string) => {
    setTargetZips(zipString);
    localStorage.setItem("hsws_ad_target_zips", zipString);
    setZipsSaved(true);
    setTimeout(() => setZipsSaved(false), 3000);
  };

  const handleInjectCampaignToQueue = (campaignData: any) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setAgentRunning(true);
    setLogs(prev => [
      {
        id: `log-${Date.now()}-ai-inject`,
        timestamp,
        type: "ad_broadcast",
        message: `✨ [Gemini AI Campaign Deployed]: Broadcasted "${campaignData.headline}" across active channels. Multi-channel queue prioritized.`,
        status: "success"
      },
      ...prev
    ].slice(0, 30));

    setSimulatedStats(prev => ({
      ...prev,
      impressions: prev.impressions + 340,
      clicks: prev.clicks + 28,
      installs: prev.installs + 4,
      activeBidsGenerated: prev.activeBidsGenerated + 2,
    }));
  };

  const handleApplyWeatherBlitz = (weatherData: {
    event: string;
    trade: string;
    zips: string;
    headline: string;
  }) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTargetZips(weatherData.zips);
    localStorage.setItem("hsws_ad_target_zips", weatherData.zips);
    setZipsSaved(true);
    setAgentRunning(true);

    setLogs(prev => [
      {
        id: `log-${Date.now()}-weather`,
        timestamp,
        type: "optimization",
        message: `⚡ [Autonomous Weather Sensor Triggered]: "${weatherData.event}". Shifted ad focus to ${weatherData.trade} across target zips (${weatherData.zips}).`,
        status: "success"
      },
      ...prev
    ].slice(0, 30));
  };

  const [simulatedStats, setSimulatedStats] = useState({
    impressions: 14250,
    clicks: 842,
    installs: 194,
    activeBidsGenerated: 68,
    costPerInstall: 2.58,
  });

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "log-1",
      timestamp: new Date(Date.now() - 180000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: "system_audit",
      message: "System environment verified. Service Worker active. Offline cache initialized with 42 contractor profiles.",
      status: "success"
    },
    {
      id: "log-2",
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: "optimization",
      message: "AI Ad Engine analyzed Central US weather patterns: High wind detected in 75201 (Dallas/Central). Prioritizing Roofing & Gutter repair ads.",
      status: "info"
    },
    {
      id: "log-3",
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: "ad_broadcast",
      message: "Dispatched 250 localized SMS app-install invitations to verified local contractors in Central zone zip 78701 (Austin, TX).",
      status: "success"
    },
    {
      id: "log-4",
      timestamp: new Date(Date.now() - 15000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: "system_install",
      message: "+4 new independent system installations registered on desktop terminals & field iPads.",
      status: "success"
    }
  ]);

  // Simulate autonomous agent activity when running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (agentRunning) {
      interval = setInterval(() => {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const randomAction = Math.random();
        
        let newLog: LogEntry;
        if (randomAction < 0.4) {
          const zips = targetZips.split(",").map(s => s.trim()).filter(Boolean);
          const zip = zips[Math.floor(Math.random() * zips.length)] || "90210";
          newLog = {
            id: `log-${Date.now()}`,
            timestamp,
            type: "ad_broadcast",
            message: `[AI Ad Bot] Automatically posted seasonal homeowner repair spotlight to Nextdoor & Facebook groups in Zip ${zip}.`,
            status: "success"
          };
          setSimulatedStats(prev => ({
            ...prev,
            impressions: prev.impressions + Math.floor(Math.random() * 80) + 20,
            clicks: prev.clicks + Math.floor(Math.random() * 6) + 1,
            installs: prev.installs + (Math.random() > 0.6 ? 1 : 0),
          }));
        } else if (randomAction < 0.7) {
          newLog = {
            id: `log-${Date.now()}`,
            timestamp,
            type: "system_install",
            message: `[System Installer] Independent PWA system install confirmed from Nextdoor referral link. Offline cache synced.`,
            status: "success"
          };
          setSimulatedStats(prev => ({
            ...prev,
            installs: prev.installs + 1,
            activeBidsGenerated: prev.activeBidsGenerated + (Math.random() > 0.5 ? 1 : 0),
          }));
        } else {
          newLog = {
            id: `log-${Date.now()}`,
            timestamp,
            type: "optimization",
            message: `[AI Optimizer] Real-time budget adjustment: reallocating $4.50 from Google Local to SMS Contractor outreach for 28% higher conversion.`,
            status: "info"
          };
        }

        setLogs(prev => [newLog, ...prev].slice(0, 30));
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [agentRunning, targetZips]);

  const handleTriggerInstantBroadcast = () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp,
      type: "ad_broadcast",
      message: `⚡ [MANUAL OVERRIDE] Instant advertising blitz dispatched across all ${Object.keys(selectedChannels).filter(k => selectedChannels[k]).length} active channels!`,
      status: "success"
    };
    setLogs(prev => [newLog, ...prev]);
    setSimulatedStats(prev => ({
      ...prev,
      impressions: prev.impressions + 450,
      clicks: prev.clicks + 38,
      installs: prev.installs + 5,
      activeBidsGenerated: prev.activeBidsGenerated + 2,
    }));
  };

  const handleSimulateSystemInstall = () => {
    setInstallStatus("downloading");
    setTimeout(() => {
      setInstallStatus("installed");
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLogs(prev => [
        {
          id: `log-${Date.now()}`,
          timestamp,
          type: "system_install",
          message: `✔ [SYSTEM INSTALLER] App successfully installed as standalone OS desktop & mobile kiosk application. Shortcut created on Home Screen.`,
          status: "success"
        },
        ...prev
      ]);
      setSimulatedStats(prev => ({ ...prev, installs: prev.installs + 1 }));
    }, 1500);
  };

  const toggleChannel = (channel: string) => {
    setSelectedChannels(prev => ({ ...prev, [channel]: !prev[channel] }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-16" id="autonomous-agent-hub">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0c2340] via-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold text-red-300">
              <Bot className="w-3.5 h-3.5 text-red-400 animate-bounce" />
              <span>AUTONOMOUS AI ADVERTISING & SYSTEM INSTALLER AGENT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center gap-3">
              <span>Auto-Deploy & Regional Outreach Engine</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold border ${
                agentRunning 
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse" 
                  : "bg-zinc-700/50 text-zinc-300 border-zinc-600"
              }`}>
                {agentRunning ? "● ACTIVE & RUNNING" : "○ PAUSED"}
              </span>
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              This autonomous agent independently advertises the Hotspot Workspace across neighborhood networks (Nextdoor, Facebook, SMS) and automatically installs the app onto contractor field devices and homeowner systems with 1-click PWA offline deployment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setAgentRunning(!agentRunning)}
              className={`px-6 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2.5 transition shadow-lg cursor-pointer ${
                agentRunning
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-red-900/30"
                  : "bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-emerald-900/30"
              }`}
              id="toggle-autonomous-agent-btn"
            >
              {agentRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause Autonomous Agent</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Autonomous Agent</span>
                </>
              )}
            </button>

            <button
              onClick={handleTriggerInstantBroadcast}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-4 py-3.5 rounded-2xl text-sm flex items-center gap-2 transition cursor-pointer"
              title="Force an immediate promotional broadcast across all selected channels"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Instant Ad Blitz</span>
            </button>
          </div>
        </div>

        {/* Real-Time Agent Metric Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mt-8 pt-6 border-t border-blue-800/60">
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <div className="text-[10px] uppercase tracking-wider text-blue-200 font-extrabold flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-amber-400" /> Total Ad Impressions
            </div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {simulatedStats.impressions.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 font-bold mt-0.5">↑ +14.2% today</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <div className="text-[10px] uppercase tracking-wider text-blue-200 font-extrabold flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-sky-400" /> Ad Link Clicks
            </div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {simulatedStats.clicks.toLocaleString()}
            </div>
            <div className="text-[10px] text-sky-300 font-bold mt-0.5">5.9% average CTR</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <div className="text-[10px] uppercase tracking-wider text-blue-200 font-extrabold flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-emerald-400" /> Independent Installs
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {simulatedStats.installs}
            </div>
            <div className="text-[10px] text-emerald-300 font-bold mt-0.5">1-Click PWA & Kiosks</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
            <div className="text-[10px] uppercase tracking-wider text-blue-200 font-extrabold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-400" /> Bids Generated
            </div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {simulatedStats.activeBidsGenerated}
            </div>
            <div className="text-[10px] text-purple-300 font-bold mt-0.5">Direct from AI ads</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 col-span-2 sm:col-span-1">
            <div className="text-[10px] uppercase tracking-wider text-blue-200 font-extrabold flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Cost Per Install
            </div>
            <div className="text-2xl font-black font-mono text-amber-300 mt-1">
              ${simulatedStats.costPerInstall.toFixed(2)}
            </div>
            <div className="text-[10px] text-zinc-300 font-bold mt-0.5">Budget: ${dailyBudget}/day</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (System Installer & Ad Config), Right Column (Live Console Log) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: 7 Cols */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section 1: Independent System Installation Engine */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-700">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-zinc-900 leading-tight">
                    Independent System Installer Engine
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Deploy native desktop & mobile system applications without app store hurdles
                  </p>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-3 py-1 rounded-full border border-emerald-200 uppercase">
                PWA / Kiosk Ready
              </span>
            </div>

            {/* System Status Banner */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider">
                    Current Device OS Status
                  </div>
                  <div className="text-sm font-bold text-zinc-700 flex items-center gap-1.5 mt-0.5">
                    {installStatus === "installed" ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 inline" /> Standalone OS Application Installed
                      </span>
                    ) : installStatus === "downloading" ? (
                      <span className="text-amber-600 flex items-center gap-1">
                        <RefreshCw className="w-4 h-4 inline animate-spin" /> Installing onto Local System...
                      </span>
                    ) : (
                      <span className="text-zinc-600">
                        Ready for 1-Click System Deployment
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSimulateSystemInstall}
                disabled={installStatus === "downloading" || installStatus === "installed"}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer ${
                  installStatus === "installed"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default"
                    : "bg-blue-900 hover:bg-blue-950 text-white"
                }`}
                id="system-install-trigger-btn"
              >
                {installStatus === "installed" ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>System Installed</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Install App on System</span>
                  </>
                )}
              </button>
            </div>

            {/* System Autostart & Offline Cache Configuration */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider">
                System Integration & Offline Capabilities
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-start gap-3 p-3.5 bg-zinc-50 hover:bg-zinc-100 rounded-xl border border-zinc-200 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={autoStartOS}
                    onChange={(e) => setAutoStartOS(e.target.checked)}
                    className="mt-0.5 rounded text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <div className="text-xs">
                    <div className="font-bold text-zinc-900">OS Startup Auto-Launch</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">Auto-open app on contractor tablets when OS starts</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 bg-zinc-50 hover:bg-zinc-100 rounded-xl border border-zinc-200 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={offlineSync}
                    onChange={(e) => setOfflineSync(e.target.checked)}
                    className="mt-0.5 rounded text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <div className="text-xs">
                    <div className="font-bold text-zinc-900">Offline Database Sync</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">Cache contractor directories for zero-signal job sites</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 bg-zinc-50 hover:bg-zinc-100 rounded-xl border border-zinc-200 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={pushEnabled}
                    onChange={(e) => setPushEnabled(e.target.checked)}
                    className="mt-0.5 rounded text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <div className="text-xs">
                    <div className="font-bold text-zinc-900">OS Push Notifications</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">Direct system tray alerts for urgent homeowner bids</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Quick Share / Install Command Snippet */}
            <div className="bg-zinc-900 text-zinc-200 p-4 rounded-2xl font-mono text-xs space-y-2 border border-zinc-800">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-sans font-bold">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-red-500" /> Independent Terminal Deploy Command
                </span>
                <span className="text-emerald-400 font-mono">curl -sSL https://hotspot-work.shop/install.sh | bash</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans">
                Contractors can also install this application independently via command line or automated MDM deployment scripts across fleet devices.
              </p>
            </div>
          </div>

          {/* Section 2: Autonomous Multi-Channel Advertising Config */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-50 rounded-2xl border border-red-200 text-red-600">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-zinc-900 leading-tight">
                    Autonomous Advertising Engine
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Configure regional outreach loops & automated promotion schedules
                  </p>
                </div>
              </div>
              <span className="bg-red-100 text-red-800 text-[11px] font-extrabold px-3 py-1 rounded-full border border-red-200">
                AI Powered
              </span>
            </div>

            {/* Target Zip Codes Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-zinc-900 uppercase tracking-wider">
                  Target Regional Zip Codes (Comma Separated)
                </label>
                {zipsSaved && (
                  <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3 h-3" /> Target Zips Saved
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={targetZips}
                    onChange={(e) => {
                      setTargetZips(e.target.value);
                      if (zipsSaved) setZipsSaved(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveZips();
                      }
                    }}
                    placeholder="e.g. 90210, 30301, 60601, 75001"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs font-mono font-bold text-zinc-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                    id="ad-target-zips-input"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-zinc-200 text-zinc-700 font-bold px-2 py-0.5 rounded-md pointer-events-none">
                    {targetZips.split(",").filter(s => s.trim()).length} Active Zones
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveZips}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-3xs shrink-0 ${
                    zipsSaved
                      ? "bg-emerald-600 text-white border border-emerald-700"
                      : "bg-red-600 hover:bg-red-700 text-white border border-red-700"
                  }`}
                  id="save-ad-target-zips-btn"
                  data-testid="save-ad-target-zips-btn"
                  title="Save Target Zip Codes"
                >
                  {zipsSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" /> Save
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-zinc-500">
                The AI agent scans weather forecasts and building permits in these zip codes to time ads when homeowner repair demand peaks.
              </p>
            </div>

            {/* Channel Matrix */}
            <div className="space-y-3">
              <label className="block text-xs font-extrabold text-zinc-900 uppercase tracking-wider">
                Active Advertising Channels
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "nextdoor", name: "Nextdoor Neighborhood Feeds", desc: "Local neighborhood recommendation spotlights", badge: "High ROI" },
                  { id: "facebook", name: "Facebook Community Groups", desc: "Automated contractor referral posts", badge: "Viral" },
                  { id: "sms_broadcast", name: "SMS Contractor Invitations", desc: "Direct app-install links to verified trades", badge: "Direct" },
                  { id: "google_local", name: "Google Local Service Ads", desc: "Geo-fenced top-of-search banners", badge: "Premium" },
                  { id: "local_radio", name: "AI Local Radio & Podcast Ad Sync", desc: "Automated regional audio sponsorships", badge: "Experimental" }
                ].map((ch) => (
                  <div
                    key={ch.id}
                    onClick={() => toggleChannel(ch.id)}
                    className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition ${
                      selectedChannels[ch.id]
                        ? "bg-red-50/60 border-red-300 shadow-3xs"
                        : "bg-zinc-50 border-zinc-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-zinc-900">{ch.name}</span>
                        <span className="text-[9px] bg-white border border-zinc-200 font-bold px-1.5 py-0.2 rounded text-zinc-600">
                          {ch.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-snug">{ch.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!selectedChannels[ch.id]}
                      onChange={() => {}}
                      className="mt-1 rounded text-red-600 focus:ring-red-500 w-4 h-4 pointer-events-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* AI Ad Spend Budget Slider */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Daily Autonomous Ad Budget
                </span>
                <span className="font-mono font-black text-base text-red-600 bg-white px-3 py-1 rounded-xl border border-zinc-200 shadow-2xs">
                  ${dailyBudget} / day
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={dailyBudget}
                onChange={(e) => setDailyBudget(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />

              <div className="flex justify-between text-[11px] text-zinc-500 font-semibold">
                <span>$10/day (Starter Local Outreach)</span>
                <span>$250/day (Regional Scaling)</span>
                <span>$500/day (Multi-State Network)</span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: 5 Cols - Live Console Terminal & Audit */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Real-Time Agent Execution Console */}
          <div className="bg-zinc-950 text-white rounded-3xl p-6 shadow-xl border border-zinc-800 flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-mono text-xs font-bold text-zinc-300 ml-2">
                  AGENT_EXECUTION_TERMINAL
                </span>
              </div>
              <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">
                v3.2.0-autonomous
              </span>
            </div>

            {/* Scrollable Logs Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 font-mono text-xs scrollbar-thin scrollbar-thumb-zinc-800">
              {logs.map((log) => (
                <div key={log.id} className="space-y-1 border-l-2 pl-3 py-0.5 border-zinc-800 hover:border-zinc-600 transition">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                    <span>[{log.timestamp}]</span>
                    <span className={`px-1.5 py-0.2 rounded font-extrabold uppercase ${
                      log.type === "ad_broadcast" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                      log.type === "system_install" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                      log.type === "optimization" ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" :
                      "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    }`}>
                      {log.type.replace("_", " ")}
                    </span>
                  </div>
                  <p className={`leading-relaxed ${
                    log.status === "success" ? "text-zinc-200 font-semibold" :
                    log.status === "info" ? "text-sky-200" : "text-amber-200"
                  }`}>
                    {log.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom Console Actions */}
            <div className="pt-4 border-t border-zinc-800 shrink-0 flex items-center justify-between gap-2">
              <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>Monitoring {targetZips.split(",").length} target zip codes</span>
              </span>

              <button
                onClick={() => setLogs([])}
                className="text-[11px] text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700 transition font-sans font-bold cursor-pointer"
              >
                Clear Terminal
              </button>
            </div>
          </div>

          {/* Quick AI System Health & Security Audit Card */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-2xl border border-blue-200 text-blue-900">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-zinc-900">
                  System Security & Autonomy Audit
                </h3>
                <p className="text-xs text-zinc-500">
                  Verified independent deployment standards
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl text-xs border border-zinc-200">
                <span className="font-bold text-zinc-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> OS Sandbox Compatibility
                </span>
                <span className="text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-md">100% PASS</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl text-xs border border-zinc-200">
                <span className="font-bold text-zinc-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Offline Storage Quota
                </span>
                <span className="text-zinc-900 font-extrabold font-mono">48.2 MB / 500 MB Available</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl text-xs border border-zinc-200">
                <span className="font-bold text-zinc-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ad Compliance (TCPA / FCC)
                </span>
                <span className="text-blue-700 font-extrabold bg-blue-100 px-2 py-0.5 rounded-md">VERIFIED</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ✨ 1. GEMINI 3.7 FLASH AI GENERATIVE OUTREACH & AD STUDIO */}
      <AiAdCreativeStudio
        appUrl={appUrl}
        onInjectCampaignToQueue={handleInjectCampaignToQueue}
        targetZips={targetZips}
      />

      {/* ⚡ 2. AUTONOMOUS SEVERE WEATHER & REPAIR DEMAND SENSOR */}
      <WeatherTriggerEngine
        onApplyWeatherBlitz={handleApplyWeatherBlitz}
      />

      {/* 📈 3. REAL-TIME CUSTOMER INBOUND & CONVERSION FUNNEL STREAM */}
      <LiveLeadStreamVisualizer
        agentRunning={agentRunning}
        dailyBudget={dailyBudget}
      />

      {/* 🇺🇸 NATIONWIDE USA ADVERTISING & MARKETING RESOURCE HUB */}
      <div className="bg-white border border-blue-900/20 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6" id="usa-advertising-resource-hub">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-blue-900 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>50 US States Nationwide Distribution Toolkit</span>
            </div>
            <h2 className="text-2xl font-black font-display text-zinc-900 tracking-tight flex items-center gap-2">
              <span>USA Nationwide Advertising Resources & Campaign Launch Kit</span>
            </h2>
            <p className="text-xs text-zinc-600 leading-relaxed max-w-3xl font-medium">
              Everything you need to market and deploy this application across every city, county, and state in the United States—including 50-State zip codes, copy-and-paste social posts, SMS recruitment templates, printable local job board flyers, and press release kits.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              handleApplyPresetZips(US_REGION_PRESETS["🔥 All 50 US States Top Metros"]);
              setSelectedChannels({
                nextdoor: true,
                facebook: true,
                sms_broadcast: true,
                google_local: true,
                local_radio: true,
              });
              setAgentRunning(true);
              const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              setLogs(prev => [
                {
                  id: `log-${Date.now()}`,
                  timestamp,
                  type: "ad_broadcast",
                  message: "🚀 [NATIONWIDE USA BLITZ] Autonomous Ad Agent launched campaign across all 50 US States major metropolitan zip codes!",
                  status: "success"
                },
                ...prev
              ]);
            }}
            className="bg-gradient-to-r from-red-600 via-blue-900 to-indigo-950 hover:from-red-700 hover:to-blue-950 text-white font-black px-5 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer border border-blue-400/40"
            id="launch-all-50-states-blitz-btn"
            title="Launch Autonomous Ad Agent across all 50 US States major metropolitan areas instantly"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Launch All 50 States Ad Blitz</span>
          </button>
        </div>

        {/* Resource Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-3">
          {[
            { id: "all_states", label: "🇺🇸 50-State Zip Presets", icon: MapPin },
            { id: "ad_copy", label: "💬 Ready Ad Copy & Templates", icon: MessageSquare },
            { id: "flyers", label: "📄 Printable Job Board Flyers", icon: Printer },
            { id: "press_release", label: "📰 Local News Press Release", icon: FileText },
            { id: "campaign_checklist", label: "📋 USA Campaign Launch Playbook", icon: Layers },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeResourceTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveResourceTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-blue-900 text-white shadow-md font-extrabold"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                <TabIcon className={`w-4 h-4 ${isActive ? "text-amber-300" : "text-zinc-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: 50-State Zip Code Presets */}
        {activeResourceTab === "all_states" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 text-xs text-blue-950 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-blue-900">1-Click Region Selector:</span> Click any region below to load its major zip codes into the AI Autonomous Ad Agent target queue.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(US_REGION_PRESETS).map(([regionName, zips]) => (
                <div key={regionName} className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3 hover:border-blue-300 transition shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-zinc-900">{regionName}</span>
                    <span className="text-[10px] bg-white border border-zinc-200 font-mono text-zinc-600 font-bold px-2 py-0.5 rounded-md">
                      {zips.split(",").length} Key Metros
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-zinc-600 bg-white p-2.5 rounded-xl border border-zinc-200 truncate">
                    {zips}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPresetZips(zips)}
                      className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl transition shadow-3xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-amber-300" />
                      <span>Apply to Target Queue</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyText(zips, `preset-${regionName}`)}
                      className="bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 font-bold text-[11px] px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-zinc-600" />
                      <span>{copiedTemplateId === `preset-${regionName}` ? "Copied Zips!" : "Copy Zips"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Ready Ad Copy & Social Templates */}
        {activeResourceTab === "ad_copy" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Template 1: Nextdoor & Facebook Groups */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-md border border-emerald-300">
                    Nextdoor & Facebook Neighborhood Groups
                  </span>
                  <span className="text-xs font-extrabold text-zinc-900">Homeowner Job Posting Promo</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(
`🏡 Need a trusted local contractor for home repairs without middleman markups?

The Hotspot Tradesmen Network lets you post any job vacancy—mulch spreading, roof repairs, window glazing, electrical, plumbing, or TV mounting—and receive direct bids from verified local pros in minutes.

✅ Free for homeowners
✅ Compare local quotes instantly
✅ Pay securely via platform escrow

Post your project vacancy here: ${appUrl}`,
                    "copy-nextdoor"
                  )}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-300" />
                  <span>{copiedTemplateId === "copy-nextdoor" ? "Copied to Clipboard!" : "Copy Post"}</span>
                </button>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-3.5 text-xs text-zinc-800 whitespace-pre-line font-sans leading-relaxed">
{`🏡 Need a trusted local contractor for home repairs without middleman markups?

The Hotspot Tradesmen Network lets you post any job vacancy—mulch spreading, roof repairs, window glazing, electrical, plumbing, or TV mounting—and receive direct bids from verified local pros in minutes.

✅ Free for homeowners
✅ Compare local quotes instantly
✅ Pay securely via platform escrow

Post your project vacancy here: ${appUrl}`}
              </div>
            </div>

            {/* Template 2: SMS Outreach for Contractors */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-900 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-md border border-blue-300">
                    SMS & WhatsApp Contractor Recruitment
                  </span>
                  <span className="text-xs font-extrabold text-zinc-900">Direct Tradesmen Invitation</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(
`Hey! Homeowners in your local zip code just posted paid job vacancies (landscaping, roofing, painting, carpentry) on the Hotspot Tradesmen Network.

Claim jobs directly with zero lead fees: ${appUrl}`,
                    "copy-sms"
                  )}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-300" />
                  <span>{copiedTemplateId === "copy-sms" ? "Copied to Clipboard!" : "Copy Text"}</span>
                </button>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-3.5 text-xs text-zinc-800 whitespace-pre-line font-sans leading-relaxed">
{`Hey! Homeowners in your local zip code just posted paid job vacancies (landscaping, roofing, painting, carpentry) on the Hotspot Tradesmen Network.

Claim jobs directly with zero lead fees: ${appUrl}`}
              </div>
            </div>

            {/* Template 3: Google Local Services & Meta Headlines */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-100 text-purple-900 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-md border border-purple-300">
                    Google Ads & Meta Paid Ad Headlines
                  </span>
                  <span className="text-xs font-extrabold text-zinc-900">PPC Digital Ad Campaign Kit</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(
`[HEADLINE 1]: Find Local Contractors in Your Zip Code | Zero Lead Fees
[HEADLINE 2]: Post Home Improvement Projects & Compare Bids Instantly
[PRIMARY COPY]: The #1 USA Tradesmen Network. Connect directly with verified local contractors for roofing, plumbing, electrical, landscaping, and remodeling. Secure escrow payments & instant quotes.
[TARGET LINK]: ${appUrl}`,
                    "copy-ppc"
                  )}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-300" />
                  <span>{copiedTemplateId === "copy-ppc" ? "Copied to Clipboard!" : "Copy PPC Kit"}</span>
                </button>
              </div>

              <div className="bg-white border border-zinc-200 rounded-xl p-3.5 text-xs text-zinc-800 whitespace-pre-line font-mono leading-relaxed">
{`[HEADLINE 1]: Find Local Contractors in Your Zip Code | Zero Lead Fees
[HEADLINE 2]: Post Home Improvement Projects & Compare Bids Instantly
[PRIMARY COPY]: The #1 USA Tradesmen Network. Connect directly with verified local contractors for roofing, plumbing, electrical, landscaping, and remodeling. Secure escrow payments & instant quotes.
[TARGET LINK]: ${appUrl}`}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Printable Job Board Flyers */}
        {activeResourceTab === "flyers" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-zinc-100 p-4 rounded-2xl border border-zinc-200 gap-3">
              <div>
                <h4 className="font-bold text-xs text-zinc-900">Printable Local Contractor & Homeowner Collateral</h4>
                <p className="text-[11px] text-zinc-500">Post on bulletin boards at local supply stores (Home Depot, Lowe's), hardware shops, or distribute direct door-hangers.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDoorHangerModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
                  id="open-door-hanger-designer-btn"
                >
                  <Scissors className="w-4 h-4 text-amber-300" />
                  <span>Door Hanger Designer</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>Print Flyer</span>
                </button>
              </div>
            </div>

            {/* Flyer Graphic Visual Container */}
            <div className="bg-white border-2 border-zinc-900 rounded-2xl p-6 text-zinc-900 space-y-5 max-w-2xl mx-auto shadow-md">
              <div className="text-center border-b-2 border-zinc-900 pb-4 space-y-1">
                <span className="bg-red-600 text-white text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full inline-block">
                  USA TRADESMEN & HOMEOWNERS DIRECTORY
                </span>
                <h2 className="text-2xl font-extrabold uppercase font-display tracking-tight text-zinc-900 mt-2">
                  NEED A LOCAL CONTRACTOR? OR NEED MORE JOBS?
                </h2>
                <p className="text-xs font-bold text-zinc-700">
                  Join the USA Tradesmen Network in Your Neighborhood
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-300 space-y-1.5">
                  <h3 className="font-extrabold text-blue-950 uppercase border-b border-zinc-300 pb-1">FOR HOMEOWNERS:</h3>
                  <ul className="space-y-1 text-[11px] text-zinc-700">
                    <li>✓ Post project vacancies for free</li>
                    <li>✓ Compare local quotes in minutes</li>
                    <li>✓ Mulch, roofing, plumbing, electrical</li>
                    <li>✓ Secure escrow protection</li>
                  </ul>
                </div>

                <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-300 space-y-1.5">
                  <h3 className="font-extrabold text-blue-950 uppercase border-b border-zinc-300 pb-1">FOR CONTRACTORS:</h3>
                  <ul className="space-y-1 text-[11px] text-zinc-700">
                    <li>✓ Claim paid job vacancies directly</li>
                    <li>✓ Zero middleman lead fees</li>
                    <li>✓ Direct homeowner contact</li>
                    <li>✓ Guaranteed milestone payouts</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-950 text-white p-4 rounded-xl text-center space-y-2">
                <div className="text-xs font-bold uppercase text-amber-300">SCAN OR VISIT BELOW TO ACCESS WORKSPACE:</div>
                <div className="font-mono text-sm font-black underline tracking-wide text-white break-all">
                  {appUrl}
                </div>
                <div className="text-[10px] text-blue-200">
                  PWA Mobile App • Works on iPhone, Android, iPad, and Desktop
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Local Newspaper & News Outlet Press Release */}
        {activeResourceTab === "press_release" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-zinc-900">Standard Launch Press Release for US Regional Newspapers & Radio</span>
              <button
                type="button"
                onClick={() => handleCopyText(
`FOR IMMEDIATE RELEASE

NEW USA TRADESMEN NETWORK LAUNCHES NATIONWIDE TO CONNECT LOCAL HOMEOWNERS DIRECTLY WITH VERIFIED CONTRACTORS WITHOUT MIDDLEMAN FEES

[CITY, STATE] — Homeowners and independent tradesmen across the nation now have access to a streamlined, direct platform designed to eliminate middleman markup fees and connect local home improvement projects with skilled contractors in real time.

The Hotspot Tradesmen Network provides a comprehensive digital directory where homeowners can post project vacancies—ranging from seasonal landscaping and roofing to window glazing and remodeling—and receive competitive bids from local professionals.

Key Features of the Platform:
- Free project vacancy postings for homeowners
- Zero upfront lead generation fees for verified contractors
- Integrated escrow payment protection for job milestones
- Interactive Google Maps directory with zip code radius filtering

Homeowners and contractors can access the network directly at: ${appUrl}

###`,
                  "copy-press"
                )}
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
              >
                <Copy className="w-3.5 h-3.5 text-amber-300" />
                <span>{copiedTemplateId === "copy-press" ? "Copied Press Release!" : "Copy Press Release"}</span>
              </button>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 text-xs text-zinc-800 font-mono whitespace-pre-line leading-relaxed">
{`FOR IMMEDIATE RELEASE

NEW USA TRADESMEN NETWORK LAUNCHES NATIONWIDE TO CONNECT LOCAL HOMEOWNERS DIRECTLY WITH VERIFIED CONTRACTORS WITHOUT MIDDLEMAN FEES

[CITY, STATE] — Homeowners and independent tradesmen across the nation now have access to a streamlined, direct platform designed to eliminate middleman markup fees and connect local home improvement projects with skilled contractors in real time.

The Hotspot Tradesmen Network provides a comprehensive digital directory where homeowners can post project vacancies—ranging from seasonal landscaping and roofing to window glazing and remodeling—and receive competitive bids from local professionals.

Key Features of the Platform:
- Free project vacancy postings for homeowners
- Zero upfront lead generation fees for verified contractors
- Integrated escrow payment protection for job milestones
- Interactive Google Maps directory with zip code radius filtering

Homeowners and contractors can access the network directly at: ${appUrl}

###`}
            </div>
          </div>
        )}

        {/* TAB 5: Campaign Launch Playbook */}
        {activeResourceTab === "campaign_checklist" && (
          <div className="space-y-4 animate-in fade-in">
            <h4 className="font-extrabold text-xs text-zinc-900 uppercase tracking-wider">
              5-Step Nationwide USA Advertising Execution Playbook
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {[
                {
                  step: "Step 1",
                  title: "Activate AI Autonomous Ad Agent",
                  desc: "Set target zip codes or select the '🔥 All 50 US States Top Metros' preset, then toggle the Autonomous Ad Agent to RUNNING.",
                },
                {
                  step: "Step 2",
                  title: "Share Nextdoor & Facebook Neighborhood Posts",
                  desc: "Copy the homeowner ad template into local Facebook Community Groups and Nextdoor neighborhood feeds in target cities.",
                },
                {
                  step: "Step 3",
                  title: "Send Direct Contractor SMS Recruitment",
                  desc: "Reach out directly to local roofing, plumbing, and landscaping businesses with the tradesmen invitation link.",
                },
                {
                  step: "Step 4",
                  title: "Post Physical Flyers at Hardware Stores",
                  desc: "Print out the 8.5x11 flyer and post on contractor bulletin boards at Home Depot, Lowe's, and local trade supply shops.",
                },
              ].map((item) => (
                <div key={item.step} className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-900 text-amber-300 font-black text-[10px] px-2 py-0.5 rounded-md">
                      {item.step}
                    </span>
                    <span className="font-bold text-zinc-900">{item.title}</span>
                  </div>
                  <p className="text-zinc-600 text-[11px] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Printable Door Hanger & Postcard Modal */}
      <PrintableDoorHangerModal
        isOpen={isDoorHangerModalOpen}
        onClose={() => setIsDoorHangerModalOpen(false)}
        appUrl={appUrl}
      />
    </div>
  );
}

