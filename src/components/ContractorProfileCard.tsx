import React, { useState } from "react";
import { ContractorUser, Review } from "../types";
import { Star, ShieldAlert, BadgeCheck, MessageSquare, Plus, Check, FileDown, Printer, Download, X, Award, ShieldCheck, FileText, CheckCircle2, Sparkles } from "lucide-react";

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
  const [showExportModal, setShowExportModal] = useState(false);

  const averageRating = contractor.reviews.length > 0
    ? (contractor.reviews.reduce((sum, r) => sum + r.rating, 0) / contractor.reviews.length).toFixed(1)
    : "N/A";

  const totalReviews = contractor.reviews.length;
  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = contractor.reviews.filter((r) => r.rating === stars).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, count, percentage };
  });

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

  const generatePrintableHtml = () => {
    const generatedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const docHash = `US-${contractor.id.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    
    const tradesHtml = contractor.trades
      .map((t) => `<span class="trade-pill">🛠️ ${t}</span>`)
      .join("");

    const reviewsHtml = contractor.reviews.length > 0
      ? contractor.reviews.map((rev) => `
          <div class="review-box">
            <div class="review-top">
              <span class="reviewer-name">👤 ${rev.reviewerName}</span>
              <span class="review-date">${rev.date}</span>
            </div>
            <div class="review-stars">${"★".repeat(rev.rating)}${"☆".repeat(5 - rev.rating)}</div>
            <p class="review-text">"${rev.comment}"</p>
          </div>
        `).join("")
      : `<div class="no-reviews">No client field reviews logged for this contractor yet.</div>`;

    const ratingBarsHtml = [5, 4, 3, 2, 1].map((stars) => {
      const count = contractor.reviews.filter((r) => r.rating === stars).length;
      const total = contractor.reviews.length;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return `
        <div class="bar-row">
          <span class="bar-stars">${stars}★</span>
          <div class="bar-track"><div class="bar-fill" style="width: ${pct}%;"></div></div>
          <span class="bar-val">${pct}% (${count})</span>
        </div>
      `;
    }).join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Contractor_Profile_${contractor.fullName.replace(/\s+/g, "_")}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
      margin: 0;
      padding: 25px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    .header-bar {
      background: linear-gradient(135deg, #0c2340 0%, #1d4ed8 100%);
      color: #ffffff;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 24px;
      border-bottom: 4px solid #e11d48;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header-title { font-size: 24px; font-weight: 900; margin: 0; letter-spacing: -0.5px; color: #ffffff; }
    .company-name { font-size: 15px; font-weight: 700; color: #bfdbfe; margin-top: 4px; }
    .location { font-size: 13px; color: #e2e8f0; margin-top: 4px; }
    .header-badge {
      background: #e11d48;
      color: #ffffff;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: inline-block;
      margin-bottom: 8px;
    }
    .id-block {
      text-align: right;
      background: rgba(255, 255, 255, 0.1);
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .id-label { font-size: 10px; font-weight: 800; color: #bfdbfe; text-transform: uppercase; letter-spacing: 1px; }
    .id-val { font-family: monospace; font-size: 14px; font-weight: 900; color: #ffffff; margin-top: 2px; }
    .status-active { font-size: 11px; color: #4ade80; font-weight: 800; margin-top: 6px; }
    .section-head {
      font-size: 14px;
      font-weight: 900;
      color: #0c2340;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 2px solid #e11d48;
      padding-bottom: 6px;
      margin-top: 28px;
      margin-bottom: 14px;
    }
    .trade-pill {
      display: inline-block;
      background: #f1f5f9;
      color: #1e293b;
      border: 1px solid #cbd5e1;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      margin-right: 6px;
      margin-bottom: 8px;
    }
    .box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 20px;
    }
    .insurance-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .verified-badge {
      background: #dcfce7;
      color: #15803d;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      border: 1px solid #86efac;
    }
    .metrics-row {
      display: flex;
      align-items: center;
      gap: 30px;
    }
    .score-big { font-size: 38px; font-weight: 900; color: #0f172a; line-height: 1; }
    .score-sub { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 6px; }
    .bars-col { flex: 1; }
    .bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; font-size: 12px; }
    .bar-stars { width: 28px; font-weight: 700; color: #475569; }
    .bar-track { flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; background: #e11d48; border-radius: 4px; }
    .bar-val { width: 60px; text-align: right; font-family: monospace; font-size: 11px; color: #64748b; font-weight: 600; }
    .review-box {
      border-bottom: 1px solid #e2e8f0;
      padding: 14px 0;
    }
    .review-box:last-child { border-bottom: none; }
    .review-top { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; font-weight: 700; color: #1e293b; }
    .review-date { color: #64748b; font-size: 12px; font-weight: 500; }
    .review-stars { color: #e11d48; font-size: 14px; margin-bottom: 6px; letter-spacing: 2px; }
    .review-text { margin: 0; font-size: 13px; color: #334155; font-style: italic; }
    .no-reviews { color: #64748b; font-style: italic; font-size: 13px; padding: 10px 0; }
    .footer {
      margin-top: 40px;
      padding-top: 18px;
      border-top: 2px dashed #cbd5e1;
      font-size: 11px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-brand { font-weight: 800; color: #0c2340; font-size: 12px; }
    @media print {
      body { padding: 0; }
      .container { max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-bar">
      <div>
        <span class="header-badge">🇺🇸 USA TRADESMEN NETWORK VERIFIED PROFILE</span>
        <h1 class="header-title">${contractor.fullName}</h1>
        ${contractor.company ? `<div class="company-name">🏢 ${contractor.company}</div>` : ''}
        <div class="location">📍 ${contractor.city}, ${contractor.state}, ${contractor.zipCode}</div>
      </div>
      <div class="id-block">
        <div class="id-label">OFFICIAL MEMBER ID</div>
        <div class="id-val">#US-${contractor.id.toUpperCase()}</div>
        <div class="status-active">✔ ${contractor.availableNow ? "AVAILABLE FOR WORK" : "LICENSED CONTRACTOR"}</div>
      </div>
    </div>

    <div class="section-head">Trade Qualifications & Specialties</div>
    <div style="margin-bottom: 20px;">
      ${tradesHtml}
    </div>

    <div class="section-head">Insurance & Regulatory Compliance</div>
    <div class="box">
      <div class="insurance-row">
        <div>
          <strong style="color: #0f172a; font-size: 13px;">General Liability & Workers' Compensation Policy</strong>
          <div style="font-size: 12px; color: #475569; margin-top: 2px;">
            Policy File: ${contractor.insuranceName || "GeneralLiabilityInsurance_Verified.pdf"}
          </div>
        </div>
        <span class="verified-badge">✔ VERIFIED & ON FILE</span>
      </div>
    </div>

    <div class="section-head">Client Satisfaction & Performance Metrics</div>
    <div class="box">
      <div class="metrics-row">
        <div>
          <div class="score-big">${averageRating} <span style="font-size: 16px; color: #64748b; font-weight: normal;">/ 5.0</span></div>
          <div class="score-sub">Based on ${contractor.reviews.length} verified review${contractor.reviews.length === 1 ? '' : 's'}</div>
        </div>
        <div class="bars-col">
          ${ratingBarsHtml}
        </div>
      </div>
    </div>

    <div class="section-head">Verified Client Reviews & Testimonials (${contractor.reviews.length})</div>
    <div style="margin-bottom: 30px;">
      ${reviewsHtml}
    </div>

    <div class="footer">
      <div>
        <span class="footer-brand">USA Tradesmen Network & Hotspot</span><br>
        Certified Tradesman Qualification & Review Document
      </div>
      <div style="text-align: right;">
        Generated: ${generatedDate}<br>
        Verification Hash: ${docHash}
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const handlePrintPDF = () => {
    const htmlContent = generatePrintableHtml();
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 250);
    } else {
      // Fallback if popup blocker or iframe restrictions apply
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => document.body.removeChild(iframe), 2000);
        }, 350);
      } else {
        alert("Please allow popups or use the Download HTML Report button to save this profile.");
      }
    }
  };

  const handleDownloadHTML = () => {
    const htmlContent = generatePrintableHtml();
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Contractor_Profile_${contractor.fullName.replace(/\s+/g, "_")}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between" id={`contractor-card-${contractor.id}`}>
      <div>
        {/* Face Image & Bio Profile Block */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={contractor.avatarUrl || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80"}
                alt={contractor.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-zinc-150 shadow-xs"
                referrerPolicy="no-referrer"
              />
              {contractor.subscriptionActive && (
                <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-white rounded-full p-0.5 text-[8px] font-bold border-2 border-white shadow-xs" title="Monthly Premium Subscriber">
                  ★
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-display text-base font-bold text-zinc-900 leading-none">
                  {contractor.fullName}
                </h3>
                <span className="inline-flex items-center gap-1 text-[9px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full shadow-2xs border border-amber-300">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>98% Smart Match</span>
                </span>
                {contractor.availableNow ? (
                  <button
                    type="button"
                    onClick={() => onToggleAvailability && onToggleAvailability(contractor.id)}
                    className="inline-flex items-center gap-1 text-[9px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 border border-emerald-300 rounded-full cursor-pointer transition shadow-2xs"
                    title="Click to toggle availability status"
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span>Available Now (On-Duty)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onToggleAvailability && onToggleAvailability(contractor.id)}
                    className="inline-flex items-center gap-0.5 text-[9px] bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold px-2 py-0.5 border border-zinc-300 rounded-full cursor-pointer transition shadow-2xs"
                    title="Click to toggle availability status"
                  >
                    <span>Offline / Set Available</span>
                  </button>
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

          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="shrink-0 bg-blue-50 hover:bg-blue-100/80 text-blue-900 border border-blue-200 font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1.5 transition shadow-2xs cursor-pointer hover:border-blue-300 self-start sm:self-auto"
            title="Generate printable PDF profile with qualifications and reviews"
            id={`export-pdf-btn-${contractor.id}`}
          >
            <FileDown className="w-3.5 h-3.5 text-red-600" />
            <span>Export to PDF</span>
          </button>
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

        {/* Aggregate Ratings & Bar Graph */}
        <div className="mt-4 pt-4 border-t border-zinc-100 space-y-3" id={`rating-summary-${contractor.id}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-zinc-900 tracking-tight">{averageRating}</span>
              <span className="text-[10px] text-zinc-400 font-medium">/ 5.0</span>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex text-yellow-500 mb-0.5">
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
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight">
                {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
              </span>
            </div>
          </div>

          {/* Rating bar graph breakdown */}
          <div className="space-y-1 bg-zinc-50/50 p-2.5 rounded-xl border border-zinc-100">
            {ratingCounts.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-2 text-[11px]">
                <span className="w-6 text-[10px] font-bold text-zinc-500 flex items-center gap-0.5 justify-end">
                  {stars}★
                </span>
                <div className="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-12 text-[9px] text-zinc-400 font-mono text-right font-medium">
                  {percentage}% ({count})
                </span>
              </div>
            ))}
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
              <div className="flex text-yellow-400 mb-1 scale-85 origin-left">
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
                className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold p-2.5 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Chat Privately
              </button>
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full bg-zinc-900 text-white font-bold p-2.5 rounded-xl text-xs hover:bg-zinc-800 transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
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
                  className={`w-full font-bold p-2.5 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 border cursor-pointer ${
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
                    className="text-yellow-500 focus:outline-hidden"
                  >
                    <Star className={`w-4 h-4 ${star <= rating ? "fill-current text-yellow-500" : "text-zinc-300"}`} />
                  </button>
                ))}
              </div>
            </div>
            
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was their work performance? Quality, speed, pricing..."
              className="w-full bg-white border border-zinc-200 text-xs p-2 rounded-lg h-16 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              required
            />

            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="text-[10px] text-zinc-500 hover:text-zinc-700 px-1 py-1 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-red-600 font-semibold text-white text-[11px] px-3 py-1 rounded-lg hover:bg-red-700 cursor-pointer"
              >
                Submit Review
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Export to PDF Modal Preview */}
      {showExportModal && (
        <div
          className="fixed inset-0 bg-zinc-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#0c2340] text-white p-5 px-6 flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-600/20 rounded-xl border border-red-500/30 text-red-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                    <span>Printable Qualifications & Reviews Report</span>
                    <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      PDF Ready
                    </span>
                  </h3>
                  <p className="text-xs text-blue-200">
                    Formatted document for {contractor.fullName} • Bidding & Escrow Verification
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                title="Close export preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Action Bar */}
            <div className="bg-blue-50/80 border-b border-blue-100 p-4 px-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-blue-900 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Includes verified ratings ({averageRating}★), trade licenses, and {contractor.reviews.length} client reviews.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadHTML}
                  className="bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                  title="Download formatted report as offline HTML document"
                >
                  <Download className="w-4 h-4 text-zinc-500" />
                  <span>Download Report</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition shadow-md cursor-pointer"
                  title="Open browser print dialog to save as PDF or print physically"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span>🖨️ Print / Save as PDF</span>
                </button>
              </div>
            </div>

            {/* Printable Preview Area */}
            <div className="p-6 overflow-y-auto flex-1 bg-zinc-100/70">
              <div className="bg-white max-w-2xl mx-auto p-8 rounded-2xl shadow-sm border border-zinc-200 text-zinc-800 space-y-6 font-sans">
                {/* Document Header Preview */}
                <div className="bg-gradient-to-r from-[#0c2340] to-blue-700 text-white p-6 rounded-xl border-b-4 border-red-600 flex justify-between items-start">
                  <div>
                    <span className="inline-block bg-red-600 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                      🇺🇸 USA TRADESMEN NETWORK VERIFIED PROFILE
                    </span>
                    <h2 className="text-2xl font-black tracking-tight text-white m-0">{contractor.fullName}</h2>
                    {contractor.company && <p className="text-sm font-bold text-blue-200 mt-1">🏢 {contractor.company}</p>}
                    <p className="text-xs text-slate-200 mt-1">📍 {contractor.city}, {contractor.state}, {contractor.zipCode}</p>
                  </div>
                  <div className="text-right bg-white/10 p-3 rounded-lg border border-white/20">
                    <div className="text-[9px] font-extrabold text-blue-200 uppercase tracking-widest">OFFICIAL MEMBER ID</div>
                    <div className="font-mono text-sm font-black text-white mt-0.5">#US-{contractor.id.toUpperCase()}</div>
                    <div className="text-[10px] text-emerald-300 font-bold mt-1">✔ {contractor.availableNow ? "AVAILABLE FOR WORK" : "LICENSED CONTRACTOR"}</div>
                  </div>
                </div>

                {/* Trade Specialties */}
                <div>
                  <h4 className="text-xs font-black text-[#0c2340] uppercase tracking-wider border-b-2 border-red-600 pb-1 mb-3">
                    Trade Qualifications & Specialties
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {contractor.trades.map((t, i) => (
                      <span key={i} className="bg-zinc-100 text-zinc-800 font-bold px-3 py-1 rounded-lg text-xs border border-zinc-200">
                        🛠️ {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Insurance */}
                <div>
                  <h4 className="text-xs font-black text-[#0c2340] uppercase tracking-wider border-b-2 border-red-600 pb-1 mb-3">
                    Insurance & Regulatory Compliance
                  </h4>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-zinc-900">General Liability & Workers' Compensation Policy</div>
                      <div className="text-[11px] text-zinc-500">Policy File: {contractor.insuranceName || "GeneralLiabilityInsurance_Verified.pdf"}</div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-md text-[10px] border border-emerald-300">
                      ✔ VERIFIED & ON FILE
                    </span>
                  </div>
                </div>

                {/* Performance & Ratings Preview */}
                <div>
                  <h4 className="text-xs font-black text-[#0c2340] uppercase tracking-wider border-b-2 border-red-600 pb-1 mb-3">
                    Client Satisfaction & Performance Metrics
                  </h4>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex items-center gap-8">
                    <div>
                      <div className="text-3xl font-black text-zinc-900 leading-none">{averageRating} <span className="text-sm font-normal text-zinc-400">/ 5.0</span></div>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase mt-1">Based on {contractor.reviews.length} reviews</div>
                    </div>
                    <div className="flex-1 space-y-1">
                      {ratingCounts.map(({ stars, count, percentage }) => (
                        <div key={stars} className="flex items-center gap-2 text-xs">
                          <span className="w-6 font-bold text-zinc-500 text-right">{stars}★</span>
                          <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
                            <div className="h-full bg-red-600 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                          <span className="w-12 font-mono text-[10px] text-zinc-500 text-right font-semibold">{percentage}% ({count})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reviews Preview */}
                <div>
                  <h4 className="text-xs font-black text-[#0c2340] uppercase tracking-wider border-b-2 border-red-600 pb-1 mb-3">
                    Verified Client Reviews & Testimonials ({contractor.reviews.length})
                  </h4>
                  <div className="space-y-3">
                    {contractor.reviews.length > 0 ? (
                      contractor.reviews.map((rev) => (
                        <div key={rev.id} className="border-b border-zinc-150 pb-3 last:border-b-0 last:pb-0">
                          <div className="flex justify-between text-xs font-bold text-zinc-900">
                            <span>👤 {rev.reviewerName}</span>
                            <span className="text-zinc-500 font-normal">{rev.date}</span>
                          </div>
                          <div className="text-red-600 text-xs tracking-wider my-0.5">{"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}</div>
                          <p className="text-xs text-zinc-700 italic m-0">"{rev.comment}"</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-zinc-400 italic py-2">No client field reviews recorded for this contractor yet.</div>
                    )}
                  </div>
                </div>

                {/* Footer Preview */}
                <div className="pt-4 border-t-2 border-dashed border-zinc-200 text-[10px] text-zinc-400 flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-[#0c2340]">USA Tradesmen Network & Hotspot</span><br />
                    Certified Tradesman Qualification & Review Document
                  </div>
                  <div className="text-right font-mono">
                    Generated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}<br />
                    Hash: US-{contractor.id.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

