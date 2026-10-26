import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Clock,
  AlertTriangle,
  Upload,
  Camera,
  FileText,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  Sparkles,
  Zap,
  Check,
  Plus,
  ArrowRight,
  Building,
  UserCheck,
  CreditCard
} from "lucide-react";
import { Project, ProjectMilestone, UserRole } from "../../types";
import { monetizationService } from "../../services/monetizationService";

interface ProjectMilestoneTrackerProps {
  project: Project;
  currentUser: any;
  onUpdateMilestones?: (updatedMilestones: ProjectMilestone[]) => void;
  onCompleteProject?: () => void;
  compact?: boolean;
}

export const DEFAULT_PROJECT_MILESTONES = (totalBudget: number): ProjectMilestone[] => {
  const b = totalBudget || 2500;
  return [
    {
      id: "ms-1-demo",
      title: "1. Demo, Site Prep & Material Drop",
      description: "Dumpster drop, surface protection, demolition, and primary raw material delivery.",
      percentage: 30,
      amount: Math.round(b * 0.3),
      status: "approved_released",
      submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      releasedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      contractorNotes: "Demo completed, debris hauled to dumpster, framing lumber delivered.",
    },
    {
      id: "ms-2-roughin",
      title: "2. Rough-in & Primary Trades Build",
      description: "Framing, rough plumbing/electrical/HVAC, and core installation walkthrough.",
      percentage: 40,
      amount: Math.round(b * 0.4),
      status: "in_progress",
      contractorNotes: "Rough-in work underway. Ready for midway inspection.",
    },
    {
      id: "ms-3-finish",
      title: "3. Finish Work, Cleanup & Final Sign-off",
      description: "Cosmetic finishes, paint, fixtures, final sweep, and punch-list walkthrough.",
      percentage: 30,
      amount: Math.round(b * 0.3),
      status: "pending",
    },
  ];
};

export default function ProjectMilestoneTracker({
  project,
  currentUser,
  onUpdateMilestones,
  onCompleteProject,
  compact = false,
}: ProjectMilestoneTrackerProps) {
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(() => {
    if (project.milestones && project.milestones.length > 0) {
      return project.milestones;
    }
    return DEFAULT_PROJECT_MILESTONES(project.budget || 2500);
  });

  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestonePercent, setNewMilestonePercent] = useState<number>(20);
  const [newMilestoneDesc, setNewMilestoneDesc] = useState("");

  // Instant Express Payout State ($9.99 monetization add-on)
  const [instantExpressModal, setInstantExpressModal] = useState<{
    milestone: ProjectMilestone;
    amount: number;
  } | null>(null);

  // Sync state if project.milestones updates from outside
  useEffect(() => {
    if (project.milestones && project.milestones.length > 0) {
      setMilestones(project.milestones);
    }
  }, [project.milestones]);

  const totalBudget = project.budget || 2500;
  const releasedAmount = milestones
    .filter((m) => m.status === "approved_released")
    .reduce((sum, m) => sum + m.amount, 0);
  const pendingVaultAmount = totalBudget - releasedAmount;
  const progressPercent = Math.min(100, Math.round((releasedAmount / (totalBudget || 1)) * 100));

  const isHomeowner = currentUser?.id === project.customerId || currentUser?.role === "customer";
  const isContractor = currentUser?.role === "contractor";
  const isPlatformOwner = currentUser?.role === "owner" || currentUser?.isPlatformOwner;

  // Save changes locally and alert parent
  const updateMilestonesState = (updated: ProjectMilestone[]) => {
    setMilestones(updated);
    project.milestones = updated;
    if (onUpdateMilestones) {
      onUpdateMilestones(updated);
    }
    try {
      const stored = localStorage.getItem("hsws_projects");
      if (stored) {
        const parsed: Project[] = JSON.parse(stored);
        const next = parsed.map((p) => {
          if (p.id === project.id) {
            const allReleased = updated.every((m) => m.status === "approved_released");
            return {
              ...p,
              milestones: updated,
              status: allReleased ? ("completed" as const) : p.status,
            };
          }
          return p;
        });
        localStorage.setItem("hsws_projects", JSON.stringify(next));
      }
    } catch (e) {
      console.warn("Could not save updated milestones to localStorage:", e);
    }
  };

  // Contractor marks milestone completed and submits for inspection
  const handleContractorSubmit = (milestoneId: string) => {
    const notes = submissionNotes[milestoneId] || "Stage work completed and inspected per agreement specifications.";
    const updated = milestones.map((m) => {
      if (m.id !== milestoneId) return m;
      return {
        ...m,
        status: "submitted" as const,
        submittedAt: new Date().toISOString(),
        contractorNotes: notes,
      };
    });

    updateMilestonesState(updated);
    setToastMessage("✓ Stage marked complete! Submitted to homeowner for inspection & partial payout release.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Homeowner or Platform Owner authorizes and releases partial escrow payout
  const handleHomeownerRelease = (milestoneId: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const target = milestones.find((m) => m.id === milestoneId);
      const updated = milestones.map((m) => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          status: "approved_released" as const,
          releasedAt: new Date().toISOString(),
        };
      });

      // Record 3% platform commission on this partial escrow release
      if (target) {
        try {
          monetizationService.recordEscrowCommission(
            { ...project, budget: target.amount },
            project.customerFirstName + "'s Contractor",
            3
          );
        } catch {}
      }

      updateMilestonesState(updated);
      setIsProcessing(false);
      setToastMessage(`🎉 Funds Released! $${(target?.amount || 0).toLocaleString()} transferred from Escrow Vault to Contractor.`);
      setTimeout(() => setToastMessage(null), 4500);

      // If all milestones released, optionally complete project
      const allReleased = updated.every((m) => m.status === "approved_released");
      if (allReleased && onCompleteProject) {
        onCompleteProject();
      }
    }, 450);
  };

  // Instant Express Same-Day Payout ($9.99 convenience fee)
  const handleExecuteInstantExpress = async () => {
    if (!instantExpressModal) return;
    setIsProcessing(true);
    try {
      const res = await monetizationService.purchaseInstantEscrowExpress(
        currentUser || { id: "contractor-1", fullName: "Verified Contractor" },
        instantExpressModal.amount,
        instantExpressModal.milestone.title
      );
      setToastMessage(`⚡ Instant Payout Triggered! $${instantExpressModal.amount.toLocaleString()} dispatched to debit card within 30 minutes.`);
      setInstantExpressModal(null);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Add custom milestone stage
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    const amount = Math.round(totalBudget * (newMilestonePercent / 100));
    const newMs: ProjectMilestone = {
      id: `ms-custom-${Date.now()}`,
      title: newMilestoneTitle.trim(),
      description: newMilestoneDesc.trim() || "Custom staged milestone deliverables.",
      percentage: newMilestonePercent,
      amount,
      status: "pending",
    };

    const updated = [...milestones, newMs];
    updateMilestonesState(updated);
    setShowAddMilestoneModal(false);
    setNewMilestoneTitle("");
    setNewMilestoneDesc("");
    setToastMessage("Added custom milestone to project escrow agreement!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900 via-slate-900 to-zinc-950 border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 text-white shadow-lg space-y-4 relative overflow-hidden" id={`milestone-tracker-${project.id}`}>
      {/* Background Glow */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3.5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display font-black text-xs sm:text-sm text-white">
                Milestone Escrow Vault & Progress Tracker
              </h4>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                100% Escrow Protected
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Check off project stages to trigger safe partial payouts as work finishes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowAddMilestoneModal(true)}
            className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Custom Stage</span>
          </button>
        </div>
      </div>

      {/* Escrow Financial Summary Bar */}
      <div className="grid grid-cols-3 gap-2 bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 text-center relative z-10">
        <div>
          <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Total Escrow</span>
          <span className="font-mono font-black text-xs sm:text-sm text-white">
            ${totalBudget.toLocaleString()}
          </span>
        </div>
        <div className="border-x border-zinc-800 px-1">
          <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Released Payouts</span>
          <span className="font-mono font-black text-xs sm:text-sm text-emerald-400">
            ${releasedAmount.toLocaleString()} ({progressPercent}%)
          </span>
        </div>
        <div>
          <span className="text-[10px] text-amber-400 uppercase font-semibold block">In Safe Vault</span>
          <span className="font-mono font-black text-xs sm:text-sm text-amber-400">
            ${pendingVaultAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Multi-segment Progress Meter */}
      <div className="space-y-1.5 relative z-10">
        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-semibold">
          <span>Staged Payout Completion</span>
          <span>{milestones.filter(m => m.status === "approved_released").length} of {milestones.length} Stages Released</span>
        </div>
        <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden flex p-0.5 gap-0.5">
          {milestones.map((m) => (
            <div
              key={m.id}
              style={{ width: `${m.percentage}%` }}
              className={`h-full rounded-xs transition-all duration-300 ${
                m.status === "approved_released"
                  ? "bg-emerald-500 shadow-xs"
                  : m.status === "submitted"
                  ? "bg-amber-400 animate-pulse"
                  : m.status === "in_progress"
                  ? "bg-blue-500"
                  : "bg-zinc-750"
              }`}
              title={`${m.title}: ${m.status}`}
            />
          ))}
        </div>
      </div>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="bg-emerald-950/90 border border-emerald-400 text-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Milestone Stages List */}
      <div className="space-y-2 relative z-10">
        {milestones.map((milestone, idx) => {
          const isReleased = milestone.status === "approved_released";
          const isSubmitted = milestone.status === "submitted";
          const isInProgress = milestone.status === "in_progress";
          const isPending = milestone.status === "pending";
          const isExpanded = expandedMilestoneId === milestone.id;

          return (
            <div
              key={milestone.id}
              className={`border rounded-xl transition overflow-hidden ${
                isReleased
                  ? "bg-emerald-950/25 border-emerald-500/40"
                  : isSubmitted
                  ? "bg-amber-950/30 border-amber-500/50 shadow-md"
                  : isInProgress
                  ? "bg-zinc-850/80 border-blue-500/40"
                  : "bg-zinc-850/40 border-zinc-800 opacity-80"
              }`}
            >
              {/* Row Header */}
              <div className="p-3 flex items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
                  {/* Status Indicator Icon */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isReleased
                        ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
                        : isSubmitted
                        ? "bg-amber-400 text-slate-950 font-black animate-pulse"
                        : isInProgress
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {isReleased ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : isSubmitted ? (
                      <Clock className="w-4 h-4" />
                    ) : isInProgress ? (
                      <Sparkles className="w-4 h-4" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-xs text-white leading-tight">
                        {milestone.title}
                      </span>
                      {isReleased && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-md font-bold">
                          ✓ Payout Released
                        </span>
                      )}
                      {isSubmitted && (
                        <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded-md font-bold animate-pulse">
                          ⏳ Inspection Requested
                        </span>
                      )}
                      {isInProgress && (
                        <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-1.5 py-0.2 rounded-md font-bold">
                          🔨 Work In Progress
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {milestone.description}
                    </p>
                  </div>
                </div>

                {/* Amount & Expand Toggle */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-mono font-black text-xs sm:text-sm text-emerald-400 block">
                      ${milestone.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {milestone.percentage}% Stage
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedMilestoneId(isExpanded ? null : milestone.id)}
                    className="p-1 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg transition cursor-pointer"
                    title="Toggle stage notes & actions"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons Strip */}
              <div className="px-3 pb-3 pt-1 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* Left Action: Contractor submit or Homeowner release */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Contractor: Check off stage & request payout */}
                  {(isInProgress || isPending) && (isContractor || isPlatformOwner) && (
                    <button
                      type="button"
                      onClick={() => handleContractorSubmit(milestone.id)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-1.5 rounded-lg text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Mark Stage Complete & Request Payout</span>
                    </button>
                  )}

                  {/* Homeowner / Client: Check off & release partial escrow payout */}
                  {isSubmitted && (isHomeowner || isPlatformOwner) && (
                    <button
                      type="button"
                      onClick={() => handleHomeownerRelease(milestone.id)}
                      disabled={isProcessing}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3.5 py-1.5 rounded-lg text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 animate-bounce"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Inspect & Release ${milestone.amount.toLocaleString()} Payout</span>
                    </button>
                  )}

                  {/* Homeowner early release if in progress */}
                  {isInProgress && (isHomeowner || isPlatformOwner) && (
                    <button
                      type="button"
                      onClick={() => handleHomeownerRelease(milestone.id)}
                      disabled={isProcessing}
                      className="bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-emerald-500/30 font-bold px-2.5 py-1.5 rounded-lg text-[11px] transition cursor-pointer"
                    >
                      <span>Authorize Early Release (${milestone.amount.toLocaleString()})</span>
                    </button>
                  )}

                  {/* Released Status Badge with Instant Express Option */}
                  {isReleased && (
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Payout Authorized & Paid</span>
                      </span>

                      {/* Contractor Instant Same-Day Escrow Express Payout Option ($9.99) */}
                      {(isContractor || isPlatformOwner) && (
                        <button
                          type="button"
                          onClick={() => setInstantExpressModal({ milestone, amount: milestone.amount })}
                          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-[10px] px-2.5 py-1 rounded-md transition shadow-xs flex items-center gap-1 cursor-pointer"
                          title="Instant same-day debit card cashout for $9.99 express fee"
                        >
                          <Zap className="w-3 h-3 fill-slate-950" />
                          <span>Instant Cashout ($9.99 Express)</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Notes link */}
                <button
                  type="button"
                  onClick={() => setExpandedMilestoneId(isExpanded ? null : milestone.id)}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                >
                  {milestone.contractorNotes ? "View Stage Log" : "Add Note / Proof"}
                </button>
              </div>

              {/* Expanded Inspection Log & Notes */}
              {isExpanded && (
                <div className="p-3 bg-black/40 border-t border-zinc-800/80 text-xs space-y-2.5 animate-in fade-in">
                  {milestone.contractorNotes && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-zinc-400 block">Contractor Field Notes:</span>
                      <p className="text-zinc-300 italic bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                        "{milestone.contractorNotes}"
                      </p>
                    </div>
                  )}

                  {milestone.submittedAt && (
                    <div className="text-[10px] text-zinc-400 flex items-center gap-2">
                      <span>Submitted: {new Date(milestone.submittedAt).toLocaleString()}</span>
                      {milestone.releasedAt && (
                        <span>• Released: {new Date(milestone.releasedAt).toLocaleString()}</span>
                      )}
                    </div>
                  )}

                  {/* Add or Edit Note Input */}
                  {!isReleased && (
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-400 block">
                        Inspection Log Note:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Passed plumbing pressure test, ready for tile..."
                          value={submissionNotes[milestone.id] || ""}
                          onChange={(e) => setSubmissionNotes({ ...submissionNotes, [milestone.id]: e.target.value })}
                          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const note = submissionNotes[milestone.id];
                            if (note) {
                              const updated = milestones.map(m => m.id === milestone.id ? { ...m, contractorNotes: note } : m);
                              updateMilestonesState(updated);
                              setToastMessage("Note saved to milestone inspection log.");
                              setTimeout(() => setToastMessage(null), 2500);
                            }
                          }}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instant Escrow Express Payout Modal ($9.99) */}
      {instantExpressModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-900 border-2 border-amber-500/60 rounded-3xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-white">Instant Same-Day Escrow Express</h3>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  Instant RTP / Debit Card
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Standard bank ACH takes 2-3 business days. With <strong>Instant Escrow Express</strong>, receive your <strong>${instantExpressModal.amount.toLocaleString()}</strong> payout directly to your linked debit card within 30 minutes.
            </p>

            <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Milestone Released:</span>
                <span className="font-bold text-white">${instantExpressModal.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Instant RTP Convenience Fee:</span>
                <span className="font-bold text-amber-400">$9.99</span>
              </div>
              <div className="flex justify-between border-t border-zinc-800 pt-1.5 font-bold text-emerald-400">
                <span>Net Instant Deposit:</span>
                <span className="font-mono text-sm">${(instantExpressModal.amount - 9.99).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setInstantExpressModal(null)}
                className="w-1/2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition cursor-pointer"
              >
                Standard Free ACH
              </button>
              <button
                type="button"
                onClick={handleExecuteInstantExpress}
                disabled={isProcessing}
                className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Cash Out Now ($9.99)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Milestone Modal */}
      {showAddMilestoneModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-display font-black text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add Custom Project Milestone</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMilestoneModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold mb-1">Stage Title</label>
                <input
                  type="text"
                  placeholder="e.g. Stage 4: Tile & Countertop Install"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">
                  Budget Percentage ({newMilestonePercent}% = ${Math.round(totalBudget * (newMilestonePercent / 100)).toLocaleString()})
                </label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={newMilestonePercent}
                  onChange={(e) => setNewMilestonePercent(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Stage Deliverables / Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe the completion criteria required for payout..."
                  value={newMilestoneDesc}
                  onChange={(e) => setNewMilestoneDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMilestoneModal(false)}
                  className="w-1/2 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl"
                >
                  Save Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
