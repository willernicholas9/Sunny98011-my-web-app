import React, { useState } from "react";
import { Project, Bid, BaseUser } from "../../types";
import {
  DollarSign,
  MapPin,
  Sparkles,
  Zap,
  Flame,
  Shield,
  Clock,
  ArrowRight,
  Eye,
  MessageSquare,
  Image as ImageIcon,
  CheckCircle,
  PhoneCall,
  Lock,
} from "lucide-react";
import QuickBidModal from "./QuickBidModal";
import { monetizationService } from "../../services/monetizationService";

interface ProjectOpportunityTableProps {
  projects: Project[];
  bids: Bid[];
  currentUser: BaseUser | null;
  currentCityName?: string;
  onPlaceBid?: (projectId: string, amount: number, message: string) => void;
  onSelectProject?: (projectId: string) => void;
  onStartChat?: (recipientId: string, recipientName: string, recipientRole: "customer" | "contractor") => void;
  onViewOnMap?: (projectId: string) => void;
  onOpenMonetizationModal?: (kind: "contractor_pro" | "lead_unlock" | "rush_dispatch" | "project_boost", project?: Project) => void;
}

function ProjectOpportunityTableComponent({
  projects,
  bids,
  currentUser,
  currentCityName,
  onPlaceBid,
  onSelectProject,
  onStartChat,
  onViewOnMap,
  onOpenMonetizationModal,
}: ProjectOpportunityTableProps) {
  const [activeBidProject, setActiveBidProject] = useState<Project | null>(null);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden" id="opportunity-table-container">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-zinc-950 text-white font-bold text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <th className="py-3.5 px-4">Opportunity & Scope</th>
              <th className="py-3.5 px-3">Category</th>
              <th className="py-3.5 px-3">Location</th>
              <th className="py-3.5 px-3 text-right">Target Budget</th>
              <th className="py-3.5 px-3 text-center">Competition / Odds</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-150">
            {projects.map((project) => {
              const projectBids = bids.filter((b) => b.projectId === project.id);
              const bidCount = projectBids.length;
              const isZeroBid = bidCount === 0 && (project.status === "open" || project.status === "bid_placed");

              return (
                <tr
                  key={project.id}
                  className="hover:bg-amber-50/40 transition-colors group"
                >
                  {/* Title & Scope */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {project.isEmergency && (
                          <span className="px-1.5 py-0.5 text-[9px] font-black rounded-md bg-rose-600 text-white animate-pulse">
                            ⚡ EMERGENCY
                          </span>
                        )}
                        {project.isBoosted && (
                          <span className="px-1.5 py-0.5 text-[9px] font-black rounded-md bg-amber-500 text-slate-950">
                            🚀 BOOSTED
                          </span>
                        )}
                        <span className="font-extrabold text-zinc-900 text-xs sm:text-sm group-hover:text-amber-800 transition">
                          {project.title}
                        </span>
                      </div>
                      <p className="text-zinc-500 text-[11px] line-clamp-1">
                        {project.description}
                      </p>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      project.type === "business" ? "bg-cyan-100 text-cyan-800" : "bg-zinc-100 text-zinc-700"
                    }`}>
                      {project.type === "business" ? "Commercial" : "Residential"}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-zinc-600">
                    <div className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{project.city}, {project.state}</span>
                    </div>
                  </td>

                  {/* Budget */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <div className="font-display font-black text-sm text-emerald-700">
                      ${project.budget.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-zinc-400 font-medium">
                      ${project.budget <= 25000 ? "5" : "20"} fee
                    </div>
                  </td>

                  {/* Competition Status */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {isZeroBid ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>0 Bids (1st Mover!)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        <Zap className="w-3 h-3 text-amber-600" />
                        <span>{bidCount} {bidCount === 1 ? "Bid" : "Bids"}</span>
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      project.status === "open" ? "bg-zinc-100 text-zinc-800" :
                      project.status === "bid_placed" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                      project.status === "accepted" ? "bg-blue-100 text-blue-900 border border-blue-200" :
                      "bg-emerald-100 text-emerald-800"
                    }`}>
                      {project.status === "open" ? "Open" :
                       project.status === "bid_placed" ? "Active Bids" :
                       project.status === "accepted" ? "Matched" : "Completed"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {currentUser?.role === "contractor" && (project.status === "open" || project.status === "bid_placed") && (
                        <>
                          {!monetizationService.isLeadUnlocked(project.id, currentUser?.id) && (
                            <button
                              type="button"
                              onClick={() => onOpenMonetizationModal?.("lead_unlock", project)}
                              className="bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold px-2.5 py-1.5 rounded-xl text-xs transition border border-amber-300/80 flex items-center gap-1 cursor-pointer"
                              title="Direct Phone & Email Unlock ($15)"
                            >
                              <PhoneCall className="w-3 h-3 text-amber-700" />
                              <span className="hidden sm:inline">Lead ($15)</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setActiveBidProject(project)}
                            className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs transition shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Quick Bid</span>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectProject) {
                            onSelectProject(project.id);
                          }
                          const el = document.getElementById(`project-card-${project.id}`);
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "center" });
                            el.classList.add("ring-4", "ring-amber-500");
                            setTimeout(() => el.classList.remove("ring-4", "ring-amber-500"), 2500);
                          }
                        }}
                        className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer"
                        title="View Full Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quick Bid Modal */}
      {activeBidProject && (
        <QuickBidModal
          project={activeBidProject}
          currentUser={currentUser}
          existingBids={bids.filter((b) => b.projectId === activeBidProject.id)}
          onClose={() => setActiveBidProject(null)}
          onSubmitBid={(amount, message) => {
            if (onPlaceBid) {
              onPlaceBid(activeBidProject.id, amount, message);
            }
          }}
        />
      )}
    </div>
  );
}

export default React.memo(ProjectOpportunityTableComponent);

