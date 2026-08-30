import React from "react";
import { Project, Bid } from "../types";
import { Briefcase, TrendingUp, DollarSign, ShieldCheck, Info } from "lucide-react";

interface DashboardStatsProps {
  currentUser: any;
  projects: Project[];
  bids: Bid[];
}

function DashboardStatsComponent({ currentUser, projects, bids }: DashboardStatsProps) {
  if (!currentUser) return null;

  const isCustomer = currentUser.role === "customer";

  // Calculations
  const userProjects = isCustomer
    ? projects.filter((p) => p.customerId === currentUser.id)
    : projects.filter((p) => p.acceptedContractorId === currentUser.id);

  const totalProjectsCount = userProjects.length;

  // Active Bids
  let activeBidsCount = 0;
  if (isCustomer) {
    // For customers, active bids are pending offers received on their posted projects
    const customerProjectIds = userProjects.map((p) => p.id);
    activeBidsCount = bids.filter(
      (b) => customerProjectIds.includes(b.projectId) && b.status === "pending"
    ).length;
  } else {
    // For contractors, active bids are pending offers they placed
    activeBidsCount = bids.filter(
      (b) => b.contractorId === currentUser.id && b.status === "pending"
    ).length;
  }

  // Fees Collected/Paid on behalf of the user
  const platformFeesCollected = userProjects
    .filter((p) => p.agreedByCustomer && p.agreedByContractor)
    .reduce((sum, p) => sum + (p.serviceFeeCharge !== undefined ? p.serviceFeeCharge : (p.budget <= 25000 ? 5 : 20)), 0);

  // Total potential platform fees from all customer's open listings
  const pendingPlatformFees = isCustomer
    ? userProjects
        .filter((p) => !(p.agreedByCustomer && p.agreedByContractor))
        .reduce((sum, p) => sum + (p.serviceFeeCharge !== undefined ? p.serviceFeeCharge : (p.budget <= 25000 ? 5 : 20)), 0)
    : 0;

  return (
    <div className="space-y-4" id="dashboard-summary-stats-widget">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Stat Item 1: Total Projects */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs hover:border-zinc-300 transition duration-200 flex items-start gap-4">
          <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-zinc-950 shrink-0">
            <Briefcase className="w-5 h-5 text-zinc-700" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              {isCustomer ? "Your Listings Posted" : "Your Managed Work Jobs"}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-display text-zinc-900 font-mono">
                {totalProjectsCount}
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">project{totalProjectsCount !== 1 ? "s" : ""}</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-normal">
              {isCustomer 
                ? "Total projects you requested across local hotspots" 
                : "Active matches successfully secured on the trade board"}
            </p>
          </div>
        </div>

        {/* Stat Item 2: Active Bids */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs hover:border-zinc-300 transition duration-200 flex items-start gap-4">
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 shrink-0">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              {isCustomer ? "Active Bids Awaiting Review" : "Active Bids Placed"}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-display text-zinc-900 font-mono">
                {activeBidsCount}
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">bid{activeBidsCount !== 1 ? "s" : ""}</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-normal">
              {isCustomer 
                ? "Competitive bids on your open vacancies waiting for action" 
                : "Active pending quotes you submitted to target customers"}
            </p>
          </div>
        </div>

        {/* Stat Item 3: Platform Fees */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs hover:border-zinc-300 transition duration-200 flex items-start gap-4">
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white shrink-0">
            <DollarSign className="w-5 h-5 text-amber-500" />
          </div>
          <div className="space-y-1 flex-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              {isCustomer ? "Platform Fees Billed" : "Associated Project Fees"}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-display text-zinc-900 font-mono">
                ${platformFeesCollected.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                Paid
              </span>
            </div>
            <div className="text-[10px] text-zinc-500 flex flex-col gap-0.5">
              <span>
                {isCustomer 
                  ? "Fees billed on mutually agreed & signed projects." 
                  : "Platform service fees billed on your active customer agreements."}
              </span>
              {isCustomer && pendingPlatformFees > 0 && (
                <span className="text-zinc-400 font-medium">
                  (${pendingPlatformFees.toFixed(2)} pending in draft listings)
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Platform Fee Strategy Informational Helper Bar */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 px-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[11px] text-zinc-650">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {isCustomer ? (
              <>
                <strong className="text-zinc-800">Hot Spot Platform Policy:</strong> Homeowners are charged a low service fee of <strong className="text-zinc-850">$5.00</strong> (jobs under $25,000) or <strong className="text-zinc-850">$20.00</strong> (jobs over $25,000) <span className="underline decoration-amber-500">only after both parties mutually authorize</span> the contract. Bids & proposals are 100% free to post and receive.
                {currentUser?.sharedWithFriend && (
                  <span className="block mt-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50 w-fit">
                    🎁 LAUNCH SPECIAL ACTIVE: Your first mutual job agreement fee is completely FREE ($0.00)!
                  </span>
                )}
              </>
            ) : (
              <>
                <strong className="text-zinc-800">Contractor Platform Policy:</strong> Professional accounts have a flat monthly subscription of <strong className="text-zinc-850">{currentUser?.sharedWithFriend ? "FREE ($0.00/mo)" : "$20.00/mo"}</strong> (Active: <span className="text-emerald-700 font-bold">Yes</span>). Homeowners pay the low per-project service fees directly. Placed bids are free & direct.
                {currentUser?.sharedWithFriend && (
                  <span className="block mt-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50 w-fit">
                    🎁 LAUNCH SPECIAL ACTIVE: First month's premium membership subscription fee is fully waived to $0.00!
                  </span>
                )}
              </>
            )}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-zinc-400 select-none font-medium text-[10px] shrink-0 uppercase tracking-widest">
          <Info className="w-3.5 h-3.5 text-zinc-400" /> Trust Guaranteed
        </div>
      </div>
    </div>
  );
}

export default React.memo(DashboardStatsComponent);

