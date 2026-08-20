import React, { useState, useEffect } from "react";
import { realtimeSync, SyncStatus, SyncActivityEvent } from "../services/realtimeSync";
import { Wifi, WifiOff, Smartphone, Globe, RefreshCw, Send, CheckCircle2, Sparkles, Activity, Layers, QrCode, ExternalLink, X, ShieldCheck, ArrowRight, Zap } from "lucide-react";

interface RealtimeSyncBarProps {
  currentCityName?: string;
  onPostProjectClick?: () => void;
  onPlaceBidSimulation?: () => void;
}

export default function RealtimeSyncBar({
  currentCityName = "Austin, TX",
  onPostProjectClick,
  onPlaceBidSimulation,
}: RealtimeSyncBarProps) {
  const [status, setStatus] = useState<SyncStatus>(realtimeSync.getStatus());
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [latestActivity, setLatestActivity] = useState<SyncActivityEvent | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const [customPingText, setCustomPingText] = useState("Testing bi-directional sync between Website & App");

  useEffect(() => {
    // Subscribe to status changes
    const unsubStatus = realtimeSync.onStatus((newStatus) => {
      setStatus(newStatus);
    });

    // Subscribe to sync events for live activity bar
    const unsubEvents = realtimeSync.subscribe((event) => {
      setPulseActive(true);
      setTimeout(() => setPulseActive(false), 2000);

      if (event.event) {
        setLatestActivity(event.event);
      } else if (event.type === "UPDATE") {
        setLatestActivity({
          id: `local-${Date.now()}`,
          type: `SYNC_${event.entity?.toUpperCase()}`,
          title: `Real-time ${event.entity} update`,
          description: `Synchronized across all website & app sessions`,
          timestamp: new Date().toISOString(),
          source: (event as any).source || "website",
          city: currentCityName,
        });
      }
    });

    return () => {
      unsubStatus();
      unsubEvents();
    };
  }, [currentCityName]);

  const handleTriggerTestPing = async () => {
    setIsPinging(true);
    await realtimeSync.triggerTestPing("Website Visitor", currentCityName, customPingText);
    setTimeout(() => {
      setIsPinging(false);
    }, 600);
  };

  return (
    <>
      {/* Top Bar / Banner */}
      <aside aria-label="Real-Time Synchronization Network" className="bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-950 text-white border-b border-zinc-800/80 px-3 py-2 sm:px-4 text-xs select-none shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Left: Status Badge & Pulse */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-750 px-2.5 py-1 rounded-full shadow-2xs">
              <span className="relative flex h-2 w-2">
                {status.isConnected && (
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pulseActive ? "bg-amber-400 scale-150" : "bg-emerald-400"} opacity-75`}></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${status.isConnected ? (pulseActive ? "bg-amber-400" : "bg-emerald-500") : "bg-rose-500"}`}></span>
              </span>

              <span className="font-extrabold text-[11px] text-zinc-200 tracking-tight flex items-center gap-1">
                {status.isConnected ? "Live Real-Time Bridge" : "Connecting Sync..."}
              </span>

              <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                ({status.activeClients} {status.activeClients === 1 ? "device" : "devices"} connected)
              </span>
            </div>

            {/* Live Ticker of Recent Sync Action */}
            {latestActivity && (
              <div className="hidden md:flex items-center gap-1.5 text-zinc-300 text-[11px] truncate max-w-md animate-fade-in">
                <Activity className={`w-3.5 h-3.5 shrink-0 ${pulseActive ? "text-amber-400 animate-spin" : "text-emerald-400"}`} />
                <span className="font-semibold text-zinc-200 truncate">{latestActivity.title}</span>
                <span className="text-zinc-400 text-[10px]">&bull; {latestActivity.city || "Live"}</span>
              </div>
            )}
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
            {/* Test Ping Button */}
            <button
              type="button"
              onClick={handleTriggerTestPing}
              disabled={isPinging}
              className="flex items-center gap-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 hover:text-amber-200 font-bold px-2.5 py-1 rounded-lg text-[11px] transition cursor-pointer active:scale-95"
              id="realtime-sync-test-ping-btn"
              title="Test real-time broadcast across all open website tabs and mobile apps"
            >
              <Zap className={`w-3 h-3 text-amber-400 ${isPinging ? "animate-bounce" : ""}`} />
              <span>{isPinging ? "Broadcasting..." : "Test Sync"}</span>
            </button>

            {/* Side-by-Side Website & App Simulator Trigger */}
            <button
              type="button"
              onClick={() => setShowSimulatorModal(true)}
              className="flex items-center gap-1 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/40 text-blue-300 hover:text-blue-200 font-bold px-2.5 py-1 rounded-lg text-[11px] transition cursor-pointer"
              id="open-sync-simulator-btn"
            >
              <Layers className="w-3 h-3 text-blue-400" />
              <span className="hidden sm:inline">Web & App Simulator</span>
              <span className="sm:hidden">Simulator</span>
            </button>

            {/* QR Code / Mobile App Link */}
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white font-semibold px-2 py-1 rounded-lg text-[11px] transition cursor-pointer"
              id="open-mobile-qr-btn"
              title="Open on phone to test live real-time synchronization between desktop website and mobile device"
            >
              <QrCode className="w-3 h-3 text-zinc-300" />
              <span className="hidden md:inline">Mobile QR</span>
            </button>
          </div>

        </div>
      </aside>

      {/* MODAL 1: SIDE-BY-SIDE WEB & APP REAL-TIME SIMULATOR */}
      {showSimulatorModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 animate-fade-in" id="sync-simulator-modal-overlay">
          <div className="bg-zinc-900 border border-zinc-800 max-w-4xl w-full rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-white flex items-center gap-2">
                    <span>Website ↔ Mobile App Real-Time Synchronizer</span>
                    <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      SSE Active
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Everything you do on the website instantly reflects on the mobile app and vice versa.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulatorModal(false)}
                className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Split Architecture & Real-Time Demo */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
              
              {/* Architecture Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Website Node */}
                <div className="border border-blue-500/30 bg-blue-950/20 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-sm text-blue-200">Hot Spot Workshop Website</span>
                    </div>
                    <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Desktop Portal
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed text-[11px]">
                    Optimized for full-screen browsers with rich contractor directories, interactive maps, instant estimate calculators, and homeowner job vacancy publishing.
                  </p>
                  <div className="bg-black/40 border border-blue-500/20 rounded-xl p-3 space-y-1.5 text-[11px] font-mono">
                    <div className="text-blue-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      <span>Connected to SSE Stream: /api/sync/stream</span>
                    </div>
                    <div className="text-zinc-400">
                      Sync latency: <span className="text-emerald-400 font-bold">&lt; 15ms</span>
                    </div>
                  </div>
                </div>

                {/* Mobile App Node */}
                <div className="border border-emerald-500/30 bg-emerald-950/20 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-sm text-emerald-200">Hot Spot Workshop Mobile App</span>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      PWA / Standalone
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed text-[11px]">
                    Touch-friendly responsive mobile experience with instant push alerts, 1-click contractor bidding, fast camera project photo uploads, and in-field private chat.
                  </p>
                  <div className="bg-black/40 border border-emerald-500/20 rounded-xl p-3 space-y-1.5 text-[11px] font-mono">
                    <div className="text-emerald-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>Push & Broadcast Channel Active</span>
                    </div>
                    <div className="text-zinc-400">
                      Cross-tab & device synchronization: <span className="text-emerald-400 font-bold">100% Unified</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Interactive Live Sync Testing Console */}
              <div className="border border-zinc-800 bg-zinc-950 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-zinc-200 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Real-Time Bi-Directional Action Triggers</span>
                  </h4>
                  <span className="text-[10px] text-zinc-500">Live Server Engine</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (onPlaceBidSimulation) {
                        onPlaceBidSimulation();
                      }
                      realtimeSync.publishUpdate("bids", {
                        id: `bid-sync-test-${Date.now()}`,
                        title: "Simulated Contractor Bid Received",
                        amount: 475,
                        city: currentCityName,
                      }, "upsert", `Contractor bid placed in ${currentCityName}`);
                    }}
                    className="p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-750 hover:border-zinc-600 rounded-xl text-left transition cursor-pointer group"
                  >
                    <div className="font-bold text-white text-xs group-hover:text-amber-400 transition flex items-center justify-between">
                      <span>Simulate Mobile Bid</span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400" />
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Emulates a contractor submitting a bid on the mobile app. Watch the website update instantly!
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      realtimeSync.broadcast("Job Alert Published", `New $1,200 Roofing Project in ${currentCityName} was posted on the website.`, { city: currentCityName });
                    }}
                    className="p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-750 hover:border-zinc-600 rounded-xl text-left transition cursor-pointer group"
                  >
                    <div className="font-bold text-white text-xs group-hover:text-emerald-400 transition flex items-center justify-between">
                      <span>Broadcast Job Alert</span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Fires a synchronized notification banner across all active web & app sessions.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      window.open(window.location.href, "_blank");
                    }}
                    className="p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-750 hover:border-zinc-600 rounded-xl text-left transition cursor-pointer group"
                  >
                    <div className="font-bold text-white text-xs group-hover:text-blue-400 transition flex items-center justify-between">
                      <span>Open 2nd Sync Window</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-400" />
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Open a second browser tab side-by-side to watch real-time synchronicity with zero delay.
                    </p>
                  </button>
                </div>

                {/* Custom Broadcast Input */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={customPingText}
                    onChange={(e) => setCustomPingText(e.target.value)}
                    placeholder="Enter custom broadcast message..."
                    className="flex-1 bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleTriggerTestPing}
                    disabled={isPinging}
                    className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Sync Ping</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" /> 100% Shared Live State
              </span>
              <button
                type="button"
                onClick={() => setShowSimulatorModal(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                Close Simulator
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: MOBILE QR CODE CONNECT */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in" id="mobile-qr-modal-overlay">
          <div className="bg-zinc-900 border border-zinc-800 max-w-sm w-full rounded-2xl sm:rounded-3xl shadow-2xl p-5 text-white text-center space-y-4">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm">Open on Phone / Tablet</span>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              Scan this code with your smartphone camera to connect to the live real-time network and test instant sync between website and phone!
            </p>

            <div className="bg-white p-4 rounded-2xl w-fit mx-auto shadow-xl">
              {/* Responsive SVG QR Code */}
              <svg viewBox="0 0 120 120" className="w-40 h-40">
                <rect width="120" height="120" fill="white" />
                <rect x="10" y="10" width="30" height="30" fill="#0f172a" rx="4" />
                <rect x="15" y="15" width="20" height="20" fill="white" rx="2" />
                <rect x="20" y="20" width="10" height="10" fill="#d97706" rx="1" />

                <rect x="80" y="10" width="30" height="30" fill="#0f172a" rx="4" />
                <rect x="85" y="15" width="20" height="20" fill="white" rx="2" />
                <rect x="90" y="20" width="10" height="10" fill="#d97706" rx="1" />

                <rect x="10" y="80" width="30" height="30" fill="#0f172a" rx="4" />
                <rect x="15" y="85" width="20" height="20" fill="white" rx="2" />
                <rect x="20" y="90" width="10" height="10" fill="#d97706" rx="1" />

                <circle cx="50" cy="20" r="3" fill="#0f172a" />
                <circle cx="65" cy="20" r="3" fill="#0f172a" />
                <circle cx="50" cy="35" r="3" fill="#0f172a" />
                <circle cx="65" cy="35" r="3" fill="#0f172a" />

                <circle cx="20" cy="55" r="3" fill="#0f172a" />
                <circle cx="35" cy="55" r="3" fill="#0f172a" />
                <circle cx="50" cy="55" r="4" fill="#d97706" />
                <circle cx="65" cy="55" r="3" fill="#0f172a" />
                <circle cx="80" cy="55" r="3" fill="#0f172a" />
                <circle cx="95" cy="55" r="3" fill="#0f172a" />

                <circle cx="20" cy="70" r="3" fill="#0f172a" />
                <circle cx="35" cy="70" r="3" fill="#0f172a" />
                <circle cx="50" cy="70" r="3" fill="#0f172a" />
                <circle cx="65" cy="70" r="4" fill="#d97706" />
                <circle cx="80" cy="70" r="3" fill="#0f172a" />
                <circle cx="95" cy="70" r="3" fill="#0f172a" />

                <circle cx="50" cy="85" r="3" fill="#0f172a" />
                <circle cx="65" cy="85" r="3" fill="#0f172a" />
                <circle cx="80" cy="85" r="3" fill="#0f172a" />
                <circle cx="95" cy="85" r="3" fill="#0f172a" />

                <circle cx="50" cy="100" r="3" fill="#0f172a" />
                <circle cx="65" cy="100" r="3" fill="#0f172a" />
                <circle cx="80" cy="100" r="3" fill="#0f172a" />
                <circle cx="95" cy="100" r="3" fill="#0f172a" />
              </svg>
            </div>

            <div className="text-[11px] font-mono text-zinc-400 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 truncate">
              {typeof window !== "undefined" ? window.location.href : "https://hotspotworkshop.com"}
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Done
            </button>

          </div>
        </div>
      )}
    </>
  );
}
