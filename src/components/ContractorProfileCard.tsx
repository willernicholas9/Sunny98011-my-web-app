import React, { useState } from "react";
import { ContractorUser, Review } from "../types";
import { Star, ShieldAlert, BadgeCheck, MessageSquare, Plus, Check } from "lucide-react";

interface ContractorProfileCardProps {
  key?: string | number;
  contractor: ContractorUser;
  currentUser: any;
  onAddReview: (contractorId: string, rating: number, comment: string) => void;
  onToggleAvailability?: (contractorId: string) => void;
  onStartChat?: (recipientId: string, recipientName: string, recipientRole: "customer" | "contractor") => void;
}

export default function ContractorProfileCard({
  contractor,
  currentUser,
  onAddReview,
  onToggleAvailability,
  onStartChat,
}: ContractorProfileCardProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  const averageRating = contractor.reviews.length > 0
    ? (contractor.reviews.reduce((sum, r) => sum + r.rating, 0) / contractor.reviews.length).toFixed(1)
    : "N/A";

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert("Please enter a review comment.");
      return;
    }
    // Only premium authenticated users or generic customers can submit reviews
    if (!currentUser) {
      alert("Please register or log in to write a review.");
      return;
    }
    onAddReview(contractor.id, rating, comment);
    setComment("");
    setShowReviewForm(false);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between" id={`contractor-card-${contractor.id}`}>
      <div>
        {/* Face Image & Bio Profile Block */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <img
              src={contractor.avatarUrl || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80"}
              alt={contractor.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-zinc-150 shadow-xs"
              referrerPolicy="no-referrer"
            />
            {contractor.subscriptionActive && (
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 text-[8px] font-bold border-2 border-white shadow-xs" title="Monthly Premium Subscriber">
                ★
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-display text-base font-bold text-zinc-900 leading-none">
                {contractor.fullName}
              </h3>
              {contractor.availableNow ? (
                <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 border border-emerald-200 rounded-full">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Available Now
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-[9px] bg-zinc-100 text-zinc-500 font-medium px-1.5 py-0.5 border border-zinc-250 rounded-full">
                  Busy / Offline
                </span>
              )}
              {contractor.insuranceUrl && (
                <span className="inline-flex items-center gap-0.5 text-[9px] bg-cyan-50 text-cyan-750 font-semibold px-1.5 py-0.5 border border-cyan-200 rounded-full">
                  <BadgeCheck className="w-2.5 h-2.5" /> Insured
                </span>
              )}
            </div>

            {contractor.company && (
              <p className="text-xs font-semibold text-zinc-500 tracking-tight leading-none">
                🏢 {contractor.company}
              </p>
            )}

            <p className="text-[11px] text-zinc-500 font-medium">
              📍 {contractor.city}, {contractor.state}, {contractor.zipCode}
            </p>
          </div>
        </div>

        {/* Subscription Status & Trade badges */}
        <div className="mt-4">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Trade Specialties</div>
          <div className="flex flex-wrap gap-1">
            {contractor.trades.map((trade, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-md border border-zinc-200 transition-colors"
              >
                🛠️ {trade}
              </span>
            ))}
          </div>
        </div>

        {/* Insurance Statement Upload */}
        <div className="mt-4 pt-3.5 border-t border-zinc-100">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Insurance & Bonding File</div>
          {contractor.insuranceUrl ? (
            <div className="text-xs text-zinc-700 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between">
              <span className="truncate font-semibold text-[11px]">📄 {contractor.insuranceName || "GeneralLiabilityInsurance.pdf"}</span>
              <span className="text-[9px] text-emerald-600 bg-white font-bold px-1.5 py-0.5 rounded border border-emerald-200 uppercase select-none font-mono tracking-tight shrink-0">Verified</span>
            </div>
          ) : (
            <div className="text-xs text-zinc-400 italic bg-zinc-50/50 p-2 rounded-xl border border-zinc-105 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> No insurance files uploaded
            </div>
          )}
        </div>

        {/* Aggregate Ratings */}
        <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-extrabold text-zinc-850">{averageRating}</span>
            <div className="flex text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.round(Number(averageRating) || 0)
                      ? "fill-current"
                      : "text-zinc-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-zinc-400">({contractor.reviews.length} feedback)</span>
          </div>
        </div>

        {/* Reviews Lists Drawer */}
        <div className="mt-4 space-y-2.5 max-h-48 overflow-y-auto">
          {contractor.reviews.map((rev) => (
            <div key={rev.id} className="p-3 bg-zinc-50 rounded-xl border border-zinc-150 text-xs">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-bold text-zinc-805">👤 {rev.reviewerName}</span>
                <span className="text-zinc-400">{rev.date}</span>
              </div>
              <div className="flex text-amber-400 mb-1 scale-85 origin-left">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < rev.rating ? "fill-current" : "text-zinc-200"}`} />
                ))}
              </div>
              <p className="text-zinc-650 italic leading-relaxed">"{rev.comment}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Review Insertion block */}
      <div className="mt-5 pt-4 border-t border-zinc-100">
        {!showReviewForm ? (
          currentUser && currentUser.role === "customer" ? (
            <div className="space-y-2">
              <button
                onClick={() => onStartChat && onStartChat(contractor.id, contractor.fullName, "contractor")}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold p-2.5 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Chat Privately
              </button>
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full bg-zinc-900 text-white font-bold p-2.5 rounded-xl text-xs hover:bg-zinc-800 transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Leave Field Review
              </button>
            </div>
          ) : (
            currentUser?.role === "contractor" ? (
              currentUser.id === contractor.id ? (
                <button
                  type="button"
                  onClick={() => onToggleAvailability?.(contractor.id)}
                  className={`w-full font-bold p-2.5 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 border ${
                    contractor.availableNow
                      ? "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 border-zinc-350"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600"
                  }`}
                >
                  {contractor.availableNow ? "🔴 Mark Busy / Offline" : "🟢 Go Available Now"}
                </button>
              ) : (
                <p className="text-[10px] text-zinc-400 italic text-center">Contractors cannot review other contractors</p>
              )
            ) : (
              <p className="text-xs text-zinc-400 italic text-center">Login as customer to write reviews</p>
            )
          )
        ) : (
          <form onSubmit={handleReviewSubmit} className="space-y-3 bg-zinc-50 p-3 rounded-xl border border-zinc-150">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Rate stars:</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-amber-500 focus:outline-hidden"
                  >
                    <Star className={`w-4 h-4 ${star <= rating ? "fill-current text-amber-500" : "text-zinc-300"}`} />
                  </button>
                ))}
              </div>
            </div>
            
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was their work performance? Quality, speed, pricing..."
              className="w-full bg-white border border-zinc-200 text-xs p-2 rounded-lg h-16 focus:ring-1 focus:ring-amber-550 focus:outline-hidden"
              required
            />

            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="text-[10px] text-zinc-500 hover:text-zinc-700 px-1 py-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-amber-600 font-semibold text-white text-[11px] px-3 py-1 rounded-lg hover:bg-amber-700"
              >
                Submit Review
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
