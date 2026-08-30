import React, { useState, useRef } from "react";
import { BeforeAfterPair, ContractorUser } from "../types";
import {
  Sparkles, Camera, Upload, ArrowRight, ShieldCheck, CheckCircle2,
  Trash2, Plus, Eye, Share2, Layers, Award, Sliders, Split,
  Maximize2, ExternalLink, Download, Lock, Check
} from "lucide-react";

interface ContractorPortfolioGalleryProps {
  contractor: ContractorUser;
  currentUser?: any;
  onUpdatePortfolio?: (updatedContractor: ContractorUser) => void;
  isEditable?: boolean;
  isOwner?: boolean;
}

const DEFAULT_PORTFOLIO_PAIRS: BeforeAfterPair[] = [
  {
    id: "sample-pair-1",
    title: "Complete Roof Storm Shingle Overhaul",
    trade: "Roofing",
    beforePhoto: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=800&auto=format&fit=crop&q=80",
    afterPhoto: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=80",
    description: "Replaced 28 squares of storm-damaged asphalt shingles with lifetime architectural shingles & seamless leak-proof flashing.",
    completionTime: "2 Days",
    costEstimate: "$6,200"
  },
  {
    id: "sample-pair-2",
    title: "Master Bathroom Luxury Tile & Plumbing Remodel",
    trade: "Plumbing Repair",
    beforePhoto: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80",
    afterPhoto: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&auto=format&fit=crop&q=80",
    description: "Full gut renovation: Installed walk-in rainfall shower, dual vanity P-traps, and anti-scald thermostatic valve system.",
    completionTime: "5 Days",
    costEstimate: "$8,400"
  },
  {
    id: "sample-pair-3",
    title: "Front Yard Turf & Modern Xeriscaping",
    trade: "Landscaping",
    beforePhoto: "https://images.unsplash.com/photo-1558905611-1402263dae20?w=800&auto=format&fit=crop&q=80",
    afterPhoto: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80",
    description: "Cleared unmanageable weed growth, regraded foundation slope, and laid drought-tolerant sod with flagstone path.",
    completionTime: "3 Days",
    costEstimate: "$3,800"
  }
];

export default function ContractorPortfolioGallery({
  contractor,
  currentUser,
  onUpdatePortfolio,
  isEditable = false
}: ContractorPortfolioGalleryProps) {
  const [portfolioPairs, setPortfolioPairs] = useState<BeforeAfterPair[]>(
    contractor.beforeAfterPairs && contractor.beforeAfterPairs.length > 0
      ? contractor.beforeAfterPairs
      : DEFAULT_PORTFOLIO_PAIRS
  );

  const [activeViewMode, setActiveViewMode] = useState<"side_by_side" | "interactive_slider">("side_by_side");
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [activePairIndex, setActivePairIndex] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // New Pair Form State
  const [newTitle, setNewTitle] = useState("");
  const [newTrade, setNewTrade] = useState(contractor.trades[0] || "General Handyman Projects");
  const [newBeforeUrl, setNewBeforeUrl] = useState("");
  const [newAfterUrl, setNewAfterUrl] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTime, setNewTime] = useState("2 Days");
  const [newCost, setNewCost] = useState("$2,500");

  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);
  const truckFileInputRef = useRef<HTMLInputElement>(null);
  const licenseFileInputRef = useRef<HTMLInputElement>(null);

  const canEdit = isEditable || (currentUser && currentUser.id === contractor.id);

  const currentActivePair = portfolioPairs[activePairIndex] || portfolioPairs[0];

  const handleCreatePair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBeforeUrl || !newAfterUrl || !newTitle) {
      alert("Please provide title, before photo, and after photo.");
      return;
    }

    const newPair: BeforeAfterPair = {
      id: `pair-${Date.now()}`,
      title: newTitle,
      trade: newTrade,
      beforePhoto: newBeforeUrl,
      afterPhoto: newAfterUrl,
      description: newDesc,
      completionTime: newTime,
      costEstimate: newCost
    };

    const updated = [newPair, ...portfolioPairs];
    setPortfolioPairs(updated);
    if (onUpdatePortfolio) {
      onUpdatePortfolio({
        ...contractor,
        beforeAfterPairs: updated
      });
    }

    setNewTitle("");
    setNewBeforeUrl("");
    setNewAfterUrl("");
    setNewDesc("");
    setShowAddModal(false);
    setSaveToast("✓ New Before & After project showcase added to your profile!");
    setTimeout(() => setSaveToast(null), 4000);
  };

  const handleDeletePair = (pairId: string) => {
    const updated = portfolioPairs.filter(p => p.id !== pairId);
    setPortfolioPairs(updated);
    if (activePairIndex >= updated.length) setActivePairIndex(Math.max(0, updated.length - 1));
    if (onUpdatePortfolio) {
      onUpdatePortfolio({
        ...contractor,
        beforeAfterPairs: updated
      });
    }
  };

  const handleUploadVehiclePhoto = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const url = URL.createObjectURL(files[0]);
    if (onUpdatePortfolio) {
      onUpdatePortfolio({
        ...contractor,
        vehiclePhotoUrl: url
      });
    }
    setSaveToast("✓ Work vehicle & equipment photo updated!");
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleUploadLicensePhoto = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const url = URL.createObjectURL(files[0]);
    if (onUpdatePortfolio) {
      onUpdatePortfolio({
        ...contractor,
        licensePhotoUrl: url
      });
    }
    setSaveToast("✓ State contractor license document uploaded for verification!");
    setTimeout(() => setSaveToast(null), 3000);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6" id="contractor-portfolio-gallery">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-150 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-base sm:text-lg text-zinc-900 leading-tight">
                Before & After Work Portfolio Showcase
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {portfolioPairs.length} Completed Projects
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Verified job transformations completed by {contractor.fullName}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* View Mode Toggle */}
          <div className="bg-zinc-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold border border-zinc-200">
            <button
              onClick={() => setActiveViewMode("side_by_side")}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeViewMode === "side_by_side" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-500"
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setActiveViewMode("interactive_slider")}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeViewMode === "interactive_slider" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-500"
              }`}
            >
              Split Slider
            </button>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-3xs"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Transformation</span>
            </button>
          )}
        </div>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Featured Pair Main Stage */}
      {currentActivePair && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                🛠️ {currentActivePair.trade}
              </span>
              <h4 className="font-display font-black text-base text-zinc-900 mt-1">
                {currentActivePair.title}
              </h4>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold text-zinc-600">
              {currentActivePair.completionTime && (
                <span className="bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200">
                  ⏱️ {currentActivePair.completionTime}
                </span>
              )}
              {currentActivePair.costEstimate && (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  💰 {currentActivePair.costEstimate}
                </span>
              )}
            </div>
          </div>

          {/* VIEW 1: Side by Side */}
          {activeViewMode === "side_by_side" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* BEFORE PHOTO */}
              <div className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-200 aspect-4/3 group">
                <img
                  src={currentActivePair.beforePhoto}
                  alt="Before Transformation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                  BEFORE
                </span>
                <button
                  onClick={() => setLightboxImage(currentActivePair.beforePhoto)}
                  className="absolute bottom-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-black text-white rounded-lg backdrop-blur-xs transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* AFTER PHOTO */}
              <div className="relative rounded-2xl overflow-hidden bg-zinc-950 border-2 border-emerald-500 aspect-4/3 group shadow-sm">
                <img
                  src={currentActivePair.afterPhoto}
                  alt="After Transformation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                  AFTER (COMPLETED)
                </span>
                <button
                  onClick={() => setLightboxImage(currentActivePair.afterPhoto)}
                  className="absolute bottom-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-black text-white rounded-lg backdrop-blur-xs transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: Interactive Split Slider */}
          {activeViewMode === "interactive_slider" && (
            <div className="relative rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-300 aspect-16/9 sm:aspect-21/9 select-none">
              {/* After Photo (Full background) */}
              <img
                src={currentActivePair.afterPhoto}
                alt="After"
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md z-10">
                AFTER
              </span>

              {/* Before Photo (Clipped overlay) */}
              <div
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={currentActivePair.beforePhoto}
                  alt="Before"
                  className="absolute inset-y-0 left-0 max-w-none h-full object-cover"
                  style={{ width: "100%" }}
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md z-10">
                  BEFORE
                </span>
              </div>

              {/* Draggable Divider Line */}
              <div
                className="absolute inset-y-0 w-1 bg-white shadow-2xl z-20 flex items-center justify-center cursor-ew-resize"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="w-8 h-8 rounded-full bg-white text-zinc-900 shadow-xl border-2 border-zinc-400 flex items-center justify-center">
                  <Sliders className="w-4 h-4 rotate-90 text-blue-900" />
                </div>
              </div>

              {/* Range Input for Slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              />
            </div>
          )}

          {currentActivePair.description && (
            <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3.5 rounded-2xl border border-zinc-150">
              💡 <strong>Job Summary:</strong> {currentActivePair.description}
            </p>
          )}

          {/* Thumbnails of Other Transformations */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1">
            {portfolioPairs.map((pair, idx) => (
              <div
                key={pair.id}
                role="button"
                tabIndex={0}
                onClick={() => setActivePairIndex(idx)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActivePairIndex(idx);
                  }
                }}
                className={`shrink-0 flex items-center gap-2 p-1.5 rounded-2xl border-2 transition cursor-pointer select-none ${
                  activePairIndex === idx
                    ? "border-blue-600 bg-blue-50/50 shadow-2xs"
                    : "border-zinc-200 hover:border-zinc-300 bg-white"
                }`}
              >
                <img
                  src={pair.afterPhoto}
                  alt={pair.title}
                  className="w-12 h-12 rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left pr-2">
                  <div className="text-[11px] font-bold text-zinc-900 max-w-[130px] truncate">
                    {pair.title}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-medium">
                    {pair.trade}
                  </div>
                </div>

                {canEdit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePair(pair.id);
                    }}
                    className="p-1 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 rounded-lg transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Van & License Credentials Photos */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5 space-y-3">
        <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Verified Vehicle, Equipment & Contractor License Documentation
        </h4>
        <p className="text-xs text-zinc-500">
          Proves verified identity, commercial work truck, and active state trade license to prospective clients.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Work Vehicle / Truck Photo */}
          <div className="bg-white border border-zinc-200 p-3.5 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800">🚚 Branded Work Truck / Equipment</span>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => truckFileInputRef.current?.click()}
                  className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Upload Photo
                </button>
              )}
            </div>
            <input
              ref={truckFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUploadVehiclePhoto(e.target.files)}
            />
            <div className="aspect-16/9 rounded-xl bg-zinc-900 overflow-hidden relative border border-zinc-150">
              <img
                src={contractor.vehiclePhotoUrl || "https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=600&auto=format&fit=crop&q=80"}
                alt="Contractor Truck"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[9px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                Verified Pro Equipment
              </span>
            </div>
          </div>

          {/* State License ID Photo */}
          <div className="bg-white border border-zinc-200 p-3.5 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800">📜 State License & Insurance Certificate</span>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => licenseFileInputRef.current?.click()}
                  className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Upload ID
                </button>
              )}
            </div>
            <input
              ref={licenseFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUploadLicensePhoto(e.target.files)}
            />
            <div className="aspect-16/9 rounded-xl bg-emerald-950 overflow-hidden relative border border-emerald-200 flex flex-col items-center justify-center text-center p-4">
              {contractor.licensePhotoUrl ? (
                <img
                  src={contractor.licensePhotoUrl}
                  alt="License Certificate"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="space-y-1 text-emerald-100">
                  <ShieldCheck className="w-8 h-8 mx-auto text-emerald-400" />
                  <div className="text-xs font-black">Contractor License Active</div>
                  <div className="text-[10px] text-emerald-300 font-mono">Reg ID: US-PRO-{contractor.id.slice(0, 6).toUpperCase()}</div>
                </div>
              )}
              <span className="absolute bottom-2 left-2 bg-emerald-900/90 text-emerald-200 text-[9px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                State Board Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage}
              alt="Expanded View"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/20"
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="mt-3 px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add New Transformation Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-zinc-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-zinc-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <h3 className="font-display font-bold text-base text-zinc-900">
                  Add Before & After Project
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePair} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Project Headline</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Master Bathroom Tile & Shower Remodel"
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Trade Category</label>
                  <select
                    value={newTrade}
                    onChange={(e) => setNewTrade(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {contractor.trades.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Cost Estimate</label>
                  <input
                    type="text"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    placeholder="e.g. $4,500"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Before Photo URL or Preset</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newBeforeUrl}
                    onChange={(e) => setNewBeforeUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => beforeFileInputRef.current?.click()}
                    className="px-3 bg-zinc-200 hover:bg-zinc-300 rounded-xl font-bold text-zinc-700 shrink-0"
                  >
                    Upload
                  </button>
                </div>
                <input
                  ref={beforeFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setNewBeforeUrl(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">After Photo URL or Upload</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newAfterUrl}
                    onChange={(e) => setNewAfterUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => afterFileInputRef.current?.click()}
                    className="px-3 bg-zinc-200 hover:bg-zinc-300 rounded-xl font-bold text-zinc-700 shrink-0"
                  >
                    Upload
                  </button>
                </div>
                <input
                  ref={afterFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setNewAfterUrl(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Job Summary & Scope</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe the scope of work, materials used, and challenge solved..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs h-20 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-150">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-sm"
                >
                  Save to Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
