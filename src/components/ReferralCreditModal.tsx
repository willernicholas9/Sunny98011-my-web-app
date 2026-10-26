import React, { useState } from "react";
import { 
  Gift, 
  Copy, 
  Check, 
  Send, 
  Users, 
  DollarSign, 
  Sparkles, 
  Share2, 
  Home, 
  ShieldCheck, 
  X, 
  CheckCircle2 
} from "lucide-react";
import { monetizationService } from "../services/monetizationService";
import { UserRole } from "../types";

interface ReferralCreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    id: string;
    fullName: string;
    role: UserRole;
    email?: string;
  };
  onCreditApplied?: (amount: number) => void;
}

export default function ReferralCreditModal({
  isOpen,
  onClose,
  currentUser,
  onCreditApplied
}: ReferralCreditModalProps) {
  const [copied, setCopied] = useState(false);
  const [neighborInput, setNeighborInput] = useState("");
  const [neighborName, setNeighborName] = useState("");
  const [claimCodeInput, setClaimCodeInput] = useState("");
  const [activeTab, setActiveTab] = useState<"invite" | "claim">("invite");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const referralCode = `NEIGHBOR25-${currentUser.fullName.split(" ")[0].toUpperCase()}`;
  const referralLink = `${window.location.origin}/?ref=${referralCode}&inviter=${encodeURIComponent(currentUser.fullName)}`;
  const currentWalletCredits = monetizationService.getUserReferralCredits(currentUser.id);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!neighborInput.trim()) {
      setErrorMessage("Please enter your neighbor's email address or phone number.");
      return;
    }

    const result = monetizationService.issueReferralCredit(
      currentUser,
      neighborInput.trim(),
      neighborName.trim() || undefined
    );

    setFeedbackMessage(`Success! An invite and $25.00 repair credit was sent to ${neighborName || neighborInput}. A $25.00 credit is reserved for your next project!`);
    setNeighborInput("");
    setNeighborName("");
    setErrorMessage(null);

    if (onCreditApplied) {
      onCreditApplied(25);
    }
  };

  const handleClaimCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimCodeInput.trim()) {
      setErrorMessage("Please enter a valid referral code.");
      return;
    }

    const result = monetizationService.issueReferralCredit(
      currentUser,
      currentUser.email || currentUser.fullName,
      "Neighbor Referral Code"
    );

    setFeedbackMessage("🎉 $25.00 Referral Credit applied to your HomeServices wallet! It will automatically discount your next project or escrow fee.");
    setClaimCodeInput("");
    setErrorMessage(null);

    if (onCreditApplied) {
      onCreditApplied(25);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/75 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-zinc-200 w-full max-w-lg overflow-hidden flex flex-col my-auto transition-all"
        id="referral-credit-modal"
      >
        {/* Banner Header */}
        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white text-amber-600 flex items-center justify-center shadow-lg font-black text-xl">
                $25
              </div>
              <div>
                <span className="bg-white/20 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Homeowner & Neighbor Referral
                </span>
                <h2 className="text-xl font-black text-white mt-1">Give $25, Get $25 Credit</h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-amber-100 mt-3 leading-relaxed relative z-10">
            Share local trusted contractors with your neighborhood. When your neighbor posts or accepts a project, you both receive a <strong>$25.00 platform credit</strong>!
          </p>

          {/* User's current credit badge */}
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
            <span className="text-amber-100 font-medium">Your Active Referral Credits:</span>
            <span className="bg-white text-amber-900 font-black px-3 py-1 rounded-xl shadow-sm text-sm">
              ${currentWalletCredits.toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 bg-zinc-50 text-xs font-black">
          <button
            onClick={() => {
              setActiveTab("invite");
              setFeedbackMessage(null);
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "invite"
                ? "border-amber-500 text-amber-600 bg-white"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Invite Neighbors</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("claim");
              setFeedbackMessage(null);
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === "claim"
                ? "border-amber-500 text-amber-600 bg-white"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Claim Neighbor Code</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {feedbackMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-snug">{feedbackMessage}</div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-snug animate-fade-in">
              {errorMessage}
            </div>
          )}

          {activeTab === "invite" ? (
            <div className="space-y-4">
              {/* Quick Link Copy */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-zinc-700 uppercase tracking-wider block">
                  Your Unique Referral Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono text-zinc-700 truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="shrink-0 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Direct Invite Form */}
              <form onSubmit={handleSendInvite} className="space-y-3 pt-3 border-t border-zinc-100">
                <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                  Directly Invite a Neighbor
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                      Neighbor's Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bob or Apt 4B"
                      value={neighborName}
                      onChange={(e) => setNeighborName(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                      Email or Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="neighbor@gmail.com or 512-555-0199"
                      value={neighborInput}
                      onChange={(e) => setNeighborInput(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  id="send-neighbor-invite-btn"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send $25.00 Credit Invitation</span>
                </button>
              </form>

              {/* How it works */}
              <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/60 space-y-1.5 text-xs text-amber-900">
                <span className="font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  How Referral Credits Work:
                </span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Referral credits are credited directly to your platform wallet balance and can be applied toward customer acceptance fees ($7.99), emergency boosts, or escrow milestones.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black text-zinc-900">Have a Neighbor's Referral Code?</h3>
                <p className="text-xs text-zinc-650">
                  Enter their referral code below to instantly activate your $25.00 welcome project credit!
                </p>
              </div>

              <form onSubmit={handleClaimCode} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                    Referral Code or Neighbor Email
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NEIGHBOR25-DAVE or neighbor@gmail.com"
                    value={claimCodeInput}
                    onChange={(e) => setClaimCodeInput(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-xs font-mono uppercase focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  id="claim-referral-code-btn"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Redeem $25.00 Welcome Credit</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-xs">
          <span className="text-zinc-650 font-medium">Valid on all local home services &amp; contractors</span>
          <button
            onClick={onClose}
            className="text-zinc-700 hover:text-zinc-900 font-bold px-3 py-1.5 rounded-xl hover:bg-zinc-200 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
