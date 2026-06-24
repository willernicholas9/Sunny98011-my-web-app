import React from "react";
import { Hammer, CircleAlert, Mail, LogOut, LogIn, HardHat } from "lucide-react";

interface NavbarProps {
  currentUser: any;
  onTriggerLogin: () => void;
  onLogout: () => void;
  activeTab: "projects" | "contractors" | "my_dashboard" | "stripe_hub";
  onChangeTab: (tab: "projects" | "contractors" | "my_dashboard" | "stripe_hub") => void;
  onToggleEmailLog: () => void;
  emailCount: number;
}

export default function Navbar({
  currentUser,
  onTriggerLogin,
  onLogout,
  activeTab,
  onChangeTab,
  onToggleEmailLog,
  emailCount,
}: NavbarProps) {
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
                  ? "bg-amber-100 text-amber-900 shadow-3xs"
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
                  ? "bg-amber-100 text-amber-900 shadow-3xs"
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
                  ? "bg-amber-100 text-amber-900 shadow-3xs"
                  : "text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
              id="nav-tab-dashboard"
            >
              🛠️ My Dashboard Console
            </button>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
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
        </div>

      </div>
    </header>
  );
}
