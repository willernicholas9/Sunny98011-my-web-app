import React from "react";
import { Hammer, Briefcase, Users, PlusCircle, Wrench, Crown, Sparkles, MapPin } from "lucide-react";
import { TabType } from "./Navbar";

interface MobileBottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenPostProjectModal: () => void;
  onOpenContractorProModal: () => void;
  currentUser: any;
  unreadCount?: number;
}

export default function MobileBottomNav({
  activeTab,
  onChangeTab,
  onOpenPostProjectModal,
  onOpenContractorProModal,
  currentUser,
  unreadCount = 0,
}: MobileBottomNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-2 py-1.5 shadow-lg safe-area-pb"
      aria-label="Mobile Navigation Bar"
      id="mobile-bottom-navigation-bar"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Jobs Board */}
        <button
          type="button"
          onClick={() => onChangeTab("projects")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer min-w-[56px] min-h-[44px] relative ${
            activeTab === "projects"
              ? "text-amber-700 font-extrabold"
              : "text-zinc-500 hover:text-zinc-800"
          }`}
          id="mobile-nav-tab-jobs"
        >
          <div className="relative">
            <Briefcase className={`w-5 h-5 ${activeTab === "projects" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white font-black rounded-full px-1.5 py-0.2 text-[8px] border border-white shadow-xs animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 leading-tight">Jobs</span>
        </button>

        {/* 2. Contractors Directory */}
        <button
          type="button"
          onClick={() => onChangeTab("contractors")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer min-w-[56px] min-h-[44px] ${
            activeTab === "contractors"
              ? "text-amber-700 font-extrabold"
              : "text-zinc-500 hover:text-zinc-800"
          }`}
          id="mobile-nav-tab-contractors"
        >
          <Users className={`w-5 h-5 ${activeTab === "contractors" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] mt-0.5 leading-tight">Pros</span>
        </button>

        {/* 3. CENTER ACTION: Post a Job */}
        <button
          type="button"
          onClick={onOpenPostProjectModal}
          className="flex flex-col items-center justify-center py-0.5 px-3 -mt-3.5 bg-gradient-to-tr from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-2xl shadow-md border-2 border-white transition active:scale-95 cursor-pointer min-h-[46px]"
          id="mobile-nav-post-job-center-btn"
          title="Post a New Project Vacancy in 30 seconds"
        >
          <PlusCircle className="w-5 h-5 stroke-[2.5]" />
          <span className="text-[10px] font-black leading-tight uppercase tracking-wider">Post Job</span>
        </button>

        {/* 4. Toolbox & Rebates */}
        <button
          type="button"
          onClick={() => onChangeTab("rebates")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer min-w-[56px] min-h-[44px] ${
            activeTab === "rebates"
              ? "text-emerald-700 font-extrabold"
              : "text-zinc-500 hover:text-zinc-800"
          }`}
          id="mobile-nav-tab-rebates"
        >
          <Wrench className={`w-5 h-5 ${activeTab === "rebates" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] mt-0.5 leading-tight">Rebates</span>
        </button>

        {/* 5. Go Pro / Monetization / Owner Suite */}
        <button
          type="button"
          onClick={() => {
            if (currentUser?.role === "owner" || currentUser?.isPlatformOwner) {
              onChangeTab("owner_suite");
            } else {
              onChangeTab("monetize");
            }
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer min-w-[56px] min-h-[44px] relative ${
            activeTab === "monetize" || activeTab === "owner_suite"
              ? "text-amber-600 font-extrabold"
              : "text-zinc-500 hover:text-zinc-800"
          }`}
          id="mobile-nav-tab-monetize"
        >
          <Crown className={`w-5 h-5 ${activeTab === "monetize" || activeTab === "owner_suite" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] mt-0.5 leading-tight">
            {currentUser?.role === "owner" ? "Owner" : "Go Pro 💰"}
          </span>
        </button>
      </div>
    </nav>
  );
}
