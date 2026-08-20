import React, { useState, useEffect } from "react";
import { Hammer, CircleAlert, Mail, LogOut, LogIn, HardHat, Bot, Wifi, WifiOff, Cloud, RefreshCw, Crown, Smartphone, Apple } from "lucide-react";
import { persistenceCheck } from "../services/persistenceCheck";
import { PersistenceState } from "../types/persistenceTypes";

export type TabType = "spiral_game" | "projects" | "contractors" | "my_dashboard" | "stripe_hub" | "outreach" | "ai_agent" | "owner_suite" | "monetize";

interface NavbarProps {
  currentUser: any;
  onTriggerLogin: () => void;
  onLogout: () => void;
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onToggleEmailLog: () => void;
  emailCount: number;
  onOpenAppStoreModal?: () => void;
}

export default function Navbar({
  currentUser,
  onTriggerLogin,
  onLogout,
  activeTab,
  onChangeTab,
  onToggleEmailLog,
  emailCount,
  onOpenAppStoreModal,
}: NavbarProps) {
  const [persistenceState, setPersistenceState] = useState<PersistenceState>(persistenceCheck.getState());

  useEffect(() => {
    const unsub = persistenceCheck.subscribe((st) => {
      setPersistenceState(st);
    });
    return () => unsub();
  }, []);
  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-40" id="platform-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-extrabold shadow-sm">
              <Hammer className="w-5 h-5 text-white transform -rotate-12" />
            </div>
            <div>
              <span className="font-display font-extrabold text-base tracking-tight text-zinc-900 block leading-none">
                Hot Spot Work Shop
              </span>
              <span className="text-[9px] text-zinc-400 font-mono tracking-widest uppercase block mt-1.5 font-bold">
                Local Contractors Marketplace
              </span>
            </div>
          </div>

          {/* Navigation Links Tabs */}
          <nav className="hidden md:flex space-x-1" aria-label="Global Navigation">
            <button
              onClick={() => onChangeTab("projects")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition duration-150 ${
                activeTab === "projects"
                  ? "bg-amber-100 text-amber-900 shadow-3xs font-extrabold"
                  : "text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
              id="nav-tab-projects"
            >
              🏢 Active Projects Forum
            </button>
            <button
              onClick={() => onChangeTab("contractors")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition duration-150 ${
                activeTab === "contractors"
                  ? "bg-amber-100 text-amber-900 shadow-3xs font-extrabold"
                  : "text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
              id="nav-tab-contractors"
            >
              👨‍🔧 Contractors Directory
            </button>
            <button
              onClick={() => onChangeTab("my_dashboard")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition duration-150 ${
                activeTab === "my_dashboard"
                  ? "bg-amber-100 text-amber-900 shadow-3xs font-extrabold"
                  : "text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
              id="nav-tab-dashboard"
            >
              🛠️ My Dashboard Console
            </button>
            {(currentUser?.role === "owner" || currentUser?.isPlatformOwner || currentUser?.username === "nwiller9185") && (
              <>
                <button
                  onClick={() => onChangeTab("outreach")}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition duration-150 ${
                    activeTab === "outreach"
                      ? "bg-amber-100 text-amber-900 shadow-3xs font-extrabold"
                      : "text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                  id="nav-tab-outreach"
                >
                  📣 Outreach & Campaigns
                </button>
                <button
                  onClick={() => onChangeTab("ai_agent")}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition duration-150 flex items-center gap-1.5 ${
                    activeTab === "ai_agent"
                      ? "bg-red-600 text-white shadow-md animate-pulse font-extrabold"
                      : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                  }`}
                  id="nav-tab-ai-agent"
                  title="Autonomous AI Advertising & System Installer Agent"
                >
                  <Bot className="w-4 h-4 text-red-600 group-hover:animate-bounce inline" />
                  <span>🤖 AI Ad Agent</span>
                </button>
                <button
                  onClick={() => onChangeTab("owner_suite")}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition duration-150 flex items-center gap-1.5 ${
                    activeTab === "owner_suite"
                      ? "bg-amber-500 text-zinc-950 shadow-md ring-2 ring-amber-300 font-extrabold"
                      : "bg-amber-100/80 text-amber-950 hover:bg-amber-200 border border-amber-300"
                  }`}
                  id="nav-tab-owner-suite"
                  title="Platform Creator & Owner Executive Suite"
                >
                  <span>👑 Owner Console</span>
                </button>
              </>
            )}
            <button
              onClick={() => onChangeTab("monetize")}
              className={`px-4 py-2 text-xs font-black rounded-xl transition duration-150 flex items-center gap-1.5 ${
                activeTab === "monetize"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md ring-2 ring-amber-300 font-extrabold"
                  : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200"
              }`}
              id="nav-tab-monetize"
              title="Monetization Hub, Subscriptions, Boosts & Revenue Ledger"
            >
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>💰 Go Pro / Monetize</span>
            </button>
            <button
              onClick={() => onChangeTab("spiral_game")}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition duration-150 flex items-center gap-1.5 ${
                activeTab === "spiral_game"
                  ? "bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 text-slate-950 shadow-md font-black"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-250 font-semibold"
              }`}
              id="nav-tab-spiral-game"
              title="Bonus 3D Arcade Tower Climber Game"
            >
              <span>🌀 Arcade Game</span>
            </button>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Apple App Store & iOS Install Button */}
            <button
              type="button"
              onClick={onOpenAppStoreModal}
              title="Download on Apple App Store & iOS Home Screen"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 shadow-xs transition duration-150 active:scale-95 cursor-pointer shrink-0"
              id="navbar-appstore-btn"
            >
              <Apple className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">App Store</span>
              <span className="sm:hidden inline">iOS</span>
            </button>

            {/* Persistence & Connectivity Status Badge */}
            <button
              type="button"
              onClick={() => {
                // Toggle simulation for quick tester convenience
                persistenceCheck.toggleSimulatedOffline();
              }}
              title={
                persistenceState.isOnline
                  ? "Persistence-Check: Online & Cloud Synced. Click to simulate Offline mode."
                  : `Persistence-Check: Offline. ${persistenceState.pendingCount} update(s) queued for sync. Click to restore Online mode.`
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                persistenceState.isOnline
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                  : "bg-amber-500 text-white border-amber-600 shadow-xs animate-pulse"
              }`}
              id="navbar-persistence-status-pill"
            >
              {persistenceState.isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 hidden sm:inline" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>
                    Offline {persistenceState.pendingCount > 0 ? `(${persistenceState.pendingCount} Q)` : ""}
                  </span>
                </>
              )}
            </button>

            {/* Quick Email logs toggle */}
            <button
              onClick={onToggleEmailLog}
              title="SMTP Email tracker logs debugger drawer"
              className="relative p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition duration-150"
            >
              <Mail className="w-4 h-4 text-zinc-500" />
              {emailCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white font-bold rounded-full w-4 h-4 flex items-center justify-center text-[8px] border-2 border-white animate-pulse">
                  {emailCount}
                </span>
              )}
            </button>

            {/* Profile controller */}
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-zinc-500 block leading-tight font-semibold">Logged in:</span>
                  <span className="text-xs font-bold text-zinc-800 block max-w-[130px] truncate">
                    {currentUser.fullName}
                  </span>
                </div>
                
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-lg object-cover border border-zinc-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center border border-zinc-200" title={currentUser.fullName}>
                    <HardHat className="w-4 h-4 text-zinc-600" />
                  </div>
                )}

                <button
                  onClick={onLogout}
                  title="Sign out of workspace session"
                  className="p-2 text-zinc-400 hover:text-red-650 rounded-xl hover:bg-zinc-50 transition"
                  id="nav-logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onTriggerLogin}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5"
                id="nav-login-btn"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In / Register
              </button>
            )}
          </div>

        </div>

        {/* Mobile Nav bar (secondary row since we are responsive) */}
        <div className="flex md:hidden justify-center gap-1.5 pb-2 border-t border-zinc-100 pt-2 flex-wrap" role="group">
          <button
            onClick={() => onChangeTab("projects")}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
              activeTab === "projects" ? "bg-amber-100 text-amber-900" : "text-zinc-600"
            }`}
          >
            🏢 Projects Board
          </button>
          <button
            onClick={() => onChangeTab("contractors")}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
              activeTab === "contractors" ? "bg-amber-100 text-amber-900" : "text-zinc-600"
            }`}
          >
            👨‍🔧 Contractors
          </button>
          <button
            onClick={() => onChangeTab("my_dashboard")}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
              activeTab === "my_dashboard" ? "bg-amber-100 text-amber-900" : "text-zinc-600"
            }`}
          >
            🛠️ Dashboard
          </button>
          <button
            onClick={onOpenAppStoreModal}
            className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition bg-zinc-950 text-white flex items-center gap-1"
            id="mobile-nav-appstore-btn"
          >
            <Apple className="w-3 h-3 text-white" />
            <span>App Store</span>
          </button>
          {(currentUser?.role === "owner" || currentUser?.isPlatformOwner || currentUser?.username === "nwiller9185") && (
            <>
              <button
                onClick={() => onChangeTab("outreach")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
                  activeTab === "outreach" ? "bg-amber-100 text-amber-900" : "text-zinc-600"
                }`}
              >
                📣 Outreach
              </button>
              <button
                onClick={() => onChangeTab("ai_agent")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition flex items-center gap-1 ${
                  activeTab === "ai_agent" ? "bg-red-600 text-white" : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                <span>🤖 AI Ad Agent</span>
              </button>
            </>
          )}
          {(currentUser?.role === "owner" || currentUser?.isPlatformOwner || currentUser?.username === "nwiller9185") && (
            <button
              onClick={() => onChangeTab("owner_suite")}
              className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition ${
                activeTab === "owner_suite" ? "bg-amber-500 text-zinc-950 font-black" : "bg-amber-100 text-amber-950 border border-amber-300"
              }`}
            >
              👑 Owner Console
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
