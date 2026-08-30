import React, { useState } from "react";
import { X, ShieldCheck, CheckCircle2, DollarSign, Clock, AlertTriangle, Upload, Camera, FileText, ChevronRight, Lock, Unlock, Sparkles } from "lucide-react";
import { Project, ProjectMilestone, UserRole } from "../types";

interface MilestoneEscrowManagerModalProps {
  onClose: () => void;
  project: Project;
  onUpdateMilestones: (updatedMilestones: ProjectMilestone[]) => void;
  currentUserRole?: UserRole;
}

const DEFAULT_MILESTONES = (totalBudget: number): ProjectMilestone[] => [
  {
    id: "ms-1",
    title: "Stage 1: Deposit, Material Procurement & Site Prep",
    description: "Covers wholesale material delivery, dumpster drop, surface protection, and demo prep.",
    percentage: 30,
    amount: Math.round(totalBudget * 0.3),
    status: "approved_released",
    submittedAt: "2026-06-10T14:30:00Z",
    releasedAt: "2026-06-11T09:15:00Z",
    contractorNotes: "All framing lumber, shingles, and underlayment delivered on site.",
    proofPhotoUrl: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "ms-2",
    title: "Stage 2: Rough Framing, Mechanical & Trade Execution",
    description: "Installation of core structural components, rough plumbing/electrical, and primary build.",
    percentage: 40,
    amount: Math.round(totalBudget * 0.4),
    status: "in_progress",
    contractorNotes: "Rough framing complete. Ready for homeowner midway inspection.",
    proofPhotoUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "ms-3",
    title: "Stage 3: Final Finish, Trim, Cleanup & Walkthrough",
    description: "Final cosmetic finishes, paint touch-ups, site cleanup, and owner sign-off.",
    percentage: 30,
    amount: Math.round(totalBudget * 0.3),
    status: "pending",
  },
];

export default function MilestoneEscrowManagerModal({
  onClose,
  project,
  onUpdateMilestones,
  currentUserRole = "customer",
}: MilestoneEscrowManagerModalProps) {
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(() => {
    return project.milestones && project.milestones.length > 0
      ? project.milestones
      : DEFAULT_MILESTONES(project.budget || 2500);
  });

  const [activeTab, setActiveTab] = useState<string>(milestones[0]?.id || "");
  const [submissionPhoto, setSubmissionPhoto] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalBudget = project.budget || 2500;
  const releasedAmount = milestones
    .filter((m) => m.status === "approved_released")
    .reduce((sum, m) => sum + m.amount, 0);
  const pendingAmount = totalBudget - releasedAmount;
  const progressPercent = Math.round((releasedAmount / totalBudget) * 100);

  const handleContractorSubmit = (milestoneId: string) => {
    const updated = milestones.map((m) => {
      if (m.id !== milestoneId) return m;
      return {
        ...m,
        status: "submitted" as const,
        submittedAt: new Date().toISOString(),
        contractorNotes: submissionNotes || m.contractorNotes || "Milestone completed per specifications.",
        proofPhotoUrl: submissionPhoto || m.proofPhotoUrl || "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=80",
      };
    });
    setMilestones(updated);
    onUpdateMilestones(updated);
    setToastMessage("Milestone submitted to homeowner for inspection and release!");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleHomeownerRelease = (milestoneId: string) => {
    const updated = milestones.map((m) => {
      if (m.id !== milestoneId) return m;
      return {
        ...m,
        status: "approved_released" as const,
        releasedAt: new Date().toISOString(),
      };
    });
    setMilestones(updated);
    onUpdateMilestones(updated);
    setToastMessage(`Funds authorized! $${milestones.find((m) => m.id === milestoneId)?.amount.toLocaleString()} released to contractor.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="bg-white max-w-3xl w-full rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        id="milestone-escrow-manager-modal"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-900 text-white border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-sm sm:text-base text-white">
                  Milestone-Based Escrow Vault
                </h3>
                <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                  100% Payout Protection
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Staged payout release tied to verified jobsite progress and photo inspections
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-white font-bold">✕</button>
          </div>
        )}

        {/* Project & Escrow Financial Summary */}
        <div className="p-4 sm:p-5 bg-zinc-50 border-b border-zinc-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase font-black text-zinc-400 tracking-wider block">
                PROJECT ESCROW VAULT #{project.id}
              </span>
              <h4 className="font-display font-black text-zinc-900 text-sm sm:text-base">
                {project.title}
              </h4>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold block">Released to Date</span>
                <span className="font-display font-black text-emerald-700 text-sm sm:text-base">
                  ${releasedAmount.toLocaleString()}
                </span>
              </div>
              <div className="w-px h-8 bg-zinc-200" />
              <div>
                <span className="text-[10px] text-zinc-500 font-bold block">Held in Escrow</span>
                <span className="font-display font-black text-amber-700 text-sm sm:text-base">
                  ${pendingAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-zinc-600">
              <span>Escrow Release Progress</span>
              <span>{progressPercent}% Released (${releasedAmount.toLocaleString()} of ${totalBudget.toLocaleString()})</span>
            </div>
            <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Milestones List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {milestones.map((m, idx) => {
            const isReleased = m.status === "approved_released";
            const isSubmitted = m.status === "submitted";
            const isInProgress = m.status === "in_progress";

            return (
              <div
                key={m.id}
                className={`rounded-2xl border p-4 sm:p-5 transition shadow-2xs space-y-3 ${
                  isReleased
                    ? "bg-emerald-50/50 border-emerald-300"
                    : isSubmitted
                    ? "bg-amber-50/60 border-amber-400 ring-2 ring-amber-400/40"
                    : "bg-white border-zinc-200"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isReleased
                          ? "bg-emerald-600 text-white"
                          : isSubmitted
                          ? "bg-amber-500 text-slate-950 animate-pulse"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {isReleased ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-display font-black text-xs sm:text-sm text-zinc-900">
                          {m.title}
                        </h5>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md">
                          {m.percentage}% of Budget
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-display font-black text-sm sm:text-base text-zinc-900 block">
                      ${m.amount.toLocaleString()}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        isReleased
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : isSubmitted
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {isReleased ? "Funds Released" : isSubmitted ? "Submitted for Review" : "Pending Release"}
                    </span>
                  </div>
                </div>

                {/* Milestone Verification Photos & Notes */}
                {(m.proofPhotoUrl || m.contractorNotes) && (
                  <div className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-wrap sm:flex-nowrap items-center gap-3 text-xs">
                    {m.proofPhotoUrl && (
                      <img
                        src={m.proofPhotoUrl}
                        alt="Milestone proof"
                        className="w-16 h-16 rounded-lg object-cover border border-zinc-200 shrink-0"
                      />
                    )}
                    <div className="space-y-1 flex-1">
                      <p className="text-zinc-700">
                        <strong>Contractor Inspection Note:</strong> {m.contractorNotes}
                      </p>
                      {m.releasedAt && (
                        <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Authorized & Released on {new Date(m.releasedAt).toLocaleDateString()}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Milestone Action Buttons */}
                <div className="pt-2 border-t border-zinc-200/80 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
                    {isReleased ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Escrow Vault Cleared</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Secured in Hot Spot Escrow</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Contractor Action: Submit Milestone */}
                    {!isReleased && !isSubmitted && (
                      <button
                        type="button"
                        onClick={() => handleContractorSubmit(m.id)}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Submit Milestone Verification</span>
                      </button>
                    )}

                    {/* Homeowner Action: Authorize Release */}
                    {isSubmitted && !isReleased && (
                      <button
                        type="button"
                        onClick={() => handleHomeownerRelease(m.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-1.5 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authorize & Release ${m.amount.toLocaleString()}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
