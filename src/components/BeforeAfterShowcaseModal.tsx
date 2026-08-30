import React, { useState } from "react";
import { X, Sparkles, Plus, Image as ImageIcon, CheckCircle, Tag, DollarSign, Clock, Layers, Filter } from "lucide-react";
import { BeforeAfterPair, TRADE_OPTIONS } from "../types";
import BeforeAfterSlider from "./BeforeAfterSlider";

interface BeforeAfterShowcaseModalProps {
  onClose: () => void;
  contractorName?: string;
  initialPairs?: BeforeAfterPair[];
  onAddPair?: (pair: BeforeAfterPair) => void;
  currentUser?: any;
}

const PRESET_SHOWCASE_PAIRS: BeforeAfterPair[] = [
  {
    id: "showcase-1",
    title: "Storm-Damaged Shingle Replacement & Flashing Upgrade",
    trade: "General Handyman Projects",
    beforePhoto: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=900&auto=format&fit=crop&q=80",
    afterPhoto: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&auto=format&fit=crop&q=80",
    description: "Replaced 4 squares of storm-damaged shingles with GAF Timberline HDZ Architectural shingles, resealed aluminum step flashing, and installed drip edge guard.",
    completionTime: "2 Days",
    costEstimate: "$3,450",
  },
  {
    id: "showcase-2",
    title: "Complete Front Lawn Hydroseeding & Drought-Tolerant Garden",
    trade: "Landscaping",
    beforePhoto: "https://images.unsplash.com/photo-1558904541-efa8c4a08931?w=900&auto=format&fit=crop&q=80",
    afterPhoto: "https://images.unsplash.com/photo-1592417817098-8f3d6eb2251a?w=900&auto=format&fit=crop&q=80",
    description: "Cleared dead turf, graded soil, installed subterranean drip irrigation, laid 20 yards of triple-shred black mulch, and hydroseeded hardy Kentucky Bluegrass.",
    completionTime: "3 Days",
    costEstimate: "$2,800",
  },
  {
    id: "showcase-3",
    title: "Luxury Modern Bathroom Subway Tile & Floating Vanity",
    trade: "Plumbing Repair",
    beforePhoto: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=900&auto=format&fit=crop&q=80",
    afterPhoto: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=900&auto=format&fit=crop&q=80",
    description: "Full demo of 1980s pink fiberglass stall, installed Schluter waterproof membrane, matte white artisan subway tile with matte black Moen fixtures.",
    completionTime: "5 Days",
    costEstimate: "$6,200",
  },
  {
    id: "showcase-4",
    title: "Clogged Sagging Gutters to Seamless Aluminum & LeafGuard",
    trade: "Gutter Cleaning",
    beforePhoto: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&auto=format&fit=crop&q=80",
    afterPhoto: "https://images.unsplash.com/photo-1584463699028-eb518974a625?w=900&auto=format&fit=crop&q=80",
    description: "Removed rotted fascia board, installed 140 linear feet of custom extruded seamless 6-inch aluminum K-style gutters with micro-mesh leaf filters.",
    completionTime: "1 Day",
    costEstimate: "$1,650",
  },
  {
    id: "showcase-5",
    title: "Weathered Pine Deck Restored & Stained in Dark Walnut",
    trade: "Painting",
    beforePhoto: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop&q=80",
    afterPhoto: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80",
    description: "Deep pressure washed grey oxidation, replaced 6 warped planks, countersunk loose deck screws, and applied 2 coats of Sherwin-Williams SuperDeck stain.",
    completionTime: "2 Days",
    costEstimate: "$1,850",
  },
  {
    id: "showcase-6",
    title: "Custom Accent Wall, In-Wall Wire Concealment & 75\" OLED",
    trade: "TV Hanging",
    beforePhoto: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&auto=format&fit=crop&q=80",
    afterPhoto: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=900&auto=format&fit=crop&q=80",
    description: "Mounted heavy-duty Sanus full-motion articulating bracket to wood studs, fished HDMI and power through in-wall bridge, and calibrated surround soundbar.",
    completionTime: "3 Hours",
    costEstimate: "$420",
  },
];

export default function BeforeAfterShowcaseModal({
  onClose,
  contractorName,
  initialPairs = [],
  onAddPair,
  currentUser,
}: BeforeAfterShowcaseModalProps) {
  const [selectedTrade, setSelectedTrade] = useState<string>("all");
  const [pairs, setPairs] = useState<BeforeAfterPair[]>(() => {
    return initialPairs.length > 0 ? [...initialPairs, ...PRESET_SHOWCASE_PAIRS] : PRESET_SHOWCASE_PAIRS;
  });
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New pair form state
  const [newTitle, setNewTitle] = useState("");
  const [newTrade, setNewTrade] = useState("General Handyman Projects");
  const [newBeforeUrl, setNewBeforeUrl] = useState("");
  const [newAfterUrl, setNewAfterUrl] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newCost, setNewCost] = useState("");
  const [successToast, setSuccessToast] = useState(false);

  const filteredPairs = selectedTrade === "all"
    ? pairs
    : pairs.filter((p) => p.trade.toLowerCase() === selectedTrade.toLowerCase());

  const handleCreatePair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newBeforeUrl || !newAfterUrl) return;

    const newPair: BeforeAfterPair = {
      id: `pair-${Date.now()}`,
      title: newTitle,
      trade: newTrade,
      beforePhoto: newBeforeUrl,
      afterPhoto: newAfterUrl,
      description: newDescription || "High-quality professional trade transformation.",
      completionTime: newDuration || "1-2 Days",
      costEstimate: newCost.startsWith("$") ? newCost : `$${newCost}`,
    };

    setPairs([newPair, ...pairs]);
    if (onAddPair) onAddPair(newPair);

    setIsAddingNew(false);
    setNewTitle("");
    setNewBeforeUrl("");
    setNewAfterUrl("");
    setNewDescription("");
    setNewDuration("");
    setNewCost("");

    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="bg-white max-w-4xl w-full rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        id="before-after-showcase-modal"
      >
        {/* Header with Luxury Brand Accent */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-900 text-white border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-sm sm:text-base text-white">
                  Before & After Transformation Gallery
                </h3>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                  Interactive Sliders
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {contractorName
                  ? `Verified craftsmanship showcase by ${contractorName}`
                  : "Explore real-world contractor transformations with interactive comparison sliders"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              id="upload-transformation-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Transformation</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Toast */}
        {successToast && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Transformation successfully added to showcase and contractor profile!</span>
            </div>
            <button onClick={() => setSuccessToast(false)} className="text-white/80 hover:text-white font-bold">✕</button>
          </div>
        )}

        {/* Trade Filter Bar */}
        <div className="bg-zinc-50 px-4 py-2.5 border-b border-zinc-200 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-zinc-500 font-bold flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Trade:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedTrade("all")}
            className={`px-3 py-1 rounded-lg font-bold transition shrink-0 cursor-pointer ${
              selectedTrade === "all"
                ? "bg-zinc-900 text-white"
                : "bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
            }`}
          >
            All Trades ({pairs.length})
          </button>
          {TRADE_OPTIONS.map((trade) => (
            <button
              key={trade}
              type="button"
              onClick={() => setSelectedTrade(trade)}
              className={`px-3 py-1 rounded-lg font-bold transition shrink-0 cursor-pointer ${
                selectedTrade === trade
                  ? "bg-amber-500 text-zinc-950 font-extrabold shadow-xs"
                  : "bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
              }`}
            >
              {trade}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-zinc-100/60">
          {/* Add New Transformation Form Accordion */}
          {isAddingNew && (
            <form
              onSubmit={handleCreatePair}
              className="bg-white border-2 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
              id="new-transformation-form"
            >
              <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-zinc-900 text-sm sm:text-base">
                      Publish Completed Job Transformation
                    </h4>
                    <p className="text-[11px] text-zinc-500">
                      Showcase before & after photos to build instant homeowner trust
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-700 font-bold"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-700">
                    Transformation Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Bath Subway Tile & Vanity Renovation"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-zinc-700">
                    Trade Category *
                  </label>
                  <select
                    value={newTrade}
                    onChange={(e) => setNewTrade(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
                  >
                    {TRADE_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-zinc-700">
                      Job Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2 Days"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-zinc-700">
                      Total Cost / Value
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. $3,200"
                      value={newCost}
                      onChange={(e) => setNewCost(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-zinc-700">
                    Before Photo URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://... (Jobsite before repair)"
                    value={newBeforeUrl}
                    onChange={(e) => setNewBeforeUrl(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-zinc-700">
                    Completed (After) Photo URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://... (Finished jobsite photo)"
                    value={newAfterUrl}
                    onChange={(e) => setNewAfterUrl(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-700">
                    Scope of Work / Key Materials Used
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe specific materials, repairs, and steps taken..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2 rounded-xl text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Publish Showcase Slider</span>
                </button>
              </div>
            </form>
          )}

          {/* Transformations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPairs.map((pair) => (
              <div
                key={pair.id}
                className="bg-white rounded-3xl border border-zinc-200 shadow-md overflow-hidden flex flex-col hover:shadow-xl transition duration-200"
                id={`showcase-card-${pair.id}`}
              >
                {/* Interactive Slider Widget */}
                <div className="p-3 bg-zinc-950">
                  <BeforeAfterSlider
                    beforeImage={pair.beforePhoto}
                    afterImage={pair.afterPhoto}
                    heightClass="h-60 sm:h-72"
                  />
                </div>

                {/* Card Content & Details */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full">
                        {pair.trade}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-600">
                        {pair.completionTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            {pair.completionTime}
                          </span>
                        )}
                        {pair.costEstimate && (
                          <span className="flex items-center gap-0.5 text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {pair.costEstimate}
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="font-display font-black text-zinc-900 text-sm sm:text-base leading-snug">
                      {pair.title}
                    </h4>

                    {pair.description && (
                      <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                        {pair.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-zinc-150 flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Verified Completed Jobsite</span>
                    </span>
                    <span className="text-zinc-400 font-mono">100% Guaranteed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPairs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-zinc-200 p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-zinc-800 text-sm">No transformations found for {selectedTrade}</h4>
              <p className="text-xs text-zinc-500">Be the first to upload a before and after transformation for this trade category!</p>
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                Add New Transformation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
