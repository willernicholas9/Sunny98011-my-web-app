import React, { useState } from "react";
import { X, Calculator, Building, HardHat, DollarSign, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, FileCheck, Layers, Sparkles } from "lucide-react";

interface MaterialAndPermitEstimatorModalProps {
  onClose: () => void;
  initialCity?: string;
  initialTrade?: string;
}

interface MaterialCatalogItem {
  id: string;
  trade: string;
  name: string;
  unit: string;
  avgCostPerUnit: number;
  lowCost: number;
  highCost: number;
  typicalWasteFactor: number; // e.g. 10%
  description: string;
}

const MATERIAL_CATALOG: MaterialCatalogItem[] = [
  {
    id: "lumber_2x4",
    trade: "General Handyman Projects",
    name: "2x4x8' Premium Framing Lumber (SPF/Fir)",
    unit: "board",
    avgCostPerUnit: 4.85,
    lowCost: 3.95,
    highCost: 6.20,
    typicalWasteFactor: 10,
    description: "Standard structural stud framing lumber for interior & partition walls.",
  },
  {
    id: "drywall_sheet",
    trade: "Painting",
    name: "1/2\" x 4' x 8' Sheetrock Drywall Board",
    unit: "sheet",
    avgCostPerUnit: 14.50,
    lowCost: 12.00,
    highCost: 18.00,
    typicalWasteFactor: 12,
    description: "Standard gypsum wallboard for drywall repair & room additions.",
  },
  {
    id: "shingles_square",
    trade: "General Handyman Projects",
    name: "Architectural Shingles (GAF Timberline / Owens Corning)",
    unit: "square (100 sq ft)",
    avgCostPerUnit: 125.00,
    lowCost: 110.00,
    highCost: 155.00,
    typicalWasteFactor: 15,
    description: "Class A fire-rated 30-year lifetime architectural shingles.",
  },
  {
    id: "pex_tubing",
    trade: "Plumbing Repair",
    name: "1/2\" & 3/4\" PEX-A Flexible Water Supply Tubing",
    unit: "100 ft roll",
    avgCostPerUnit: 42.00,
    lowCost: 34.00,
    highCost: 55.00,
    typicalWasteFactor: 8,
    description: "Expansion-grade potable water supply lines, freeze & burst resistant.",
  },
  {
    id: "romex_wire",
    trade: "Electrical Maintenance",
    name: "12/2 NM-B Romex Copper Electrical Wire",
    unit: "250 ft roll",
    avgCostPerUnit: 118.00,
    lowCost: 95.00,
    highCost: 145.00,
    typicalWasteFactor: 5,
    description: "20-Amp residential circuit copper wiring for outlets & lighting.",
  },
  {
    id: "exterior_paint",
    trade: "Painting",
    name: "Premium 100% Acrylic Exterior House Paint",
    unit: "gallon (covers ~350 sq ft)",
    avgCostPerUnit: 58.00,
    lowCost: 45.00,
    highCost: 78.00,
    typicalWasteFactor: 5,
    description: "Sherwin-Williams / Benjamin Moore mildew-resistant exterior coating.",
  },
  {
    id: "mulch_bulk",
    trade: "Landscaping",
    name: "Triple-Shred Hardwood Dark Brown / Black Mulch",
    unit: "cubic yard (covers ~100 sq ft @ 3\" depth)",
    avgCostPerUnit: 38.00,
    lowCost: 30.00,
    highCost: 48.00,
    typicalWasteFactor: 5,
    description: "Organic moisture-retaining decorative ground cover.",
  },
  {
    id: "concrete_mix",
    trade: "General Handyman Projects",
    name: "High-Strength 5000 PSI Fast-Setting Concrete",
    unit: "80 lb bag",
    avgCostPerUnit: 6.90,
    lowCost: 5.50,
    highCost: 8.50,
    typicalWasteFactor: 5,
    description: "Ideal for post footings, patio slabs, and foundation piers.",
  },
];

interface PermitRule {
  projectScope: string;
  permitRequired: boolean;
  typicalFeeRange: string;
  reviewTurnaroundDays: string;
  inspectionsRequired: string[];
  notes: string;
}

const CITY_PERMIT_RULES: Record<string, PermitRule[]> = {
  default: [
    {
      projectScope: "Water Heater Replacement (Electric / Gas)",
      permitRequired: true,
      typicalFeeRange: "$65 - $110",
      reviewTurnaroundDays: "Same Day / Over-the-counter",
      inspectionsRequired: ["Final Plumbing/Gas Inspection"],
      notes: "Required for homeowner safety & pressure relief valve compliance.",
    },
    {
      projectScope: "Roof Shingle Tear-Off & Re-decking",
      permitRequired: true,
      typicalFeeRange: "$100 - $180",
      reviewTurnaroundDays: "1 - 2 Business Days",
      inspectionsRequired: ["Mid-Roof Sheathing / Flashing", "Final Roof"],
      notes: "Permit required if replacing >25% of total roof surface or any wood decking.",
    },
    {
      projectScope: "Electrical Service Panel Upgrade (200A)",
      permitRequired: true,
      typicalFeeRange: "$120 - $220",
      reviewTurnaroundDays: "2 - 3 Business Days",
      inspectionsRequired: ["Rough Electrical / Meter Hookup", "Final Electrical"],
      notes: "Utility provider disconnect & reconnect coordination required.",
    },
    {
      projectScope: "Raised Deck Construction (>30 inches off ground)",
      permitRequired: true,
      typicalFeeRange: "$95 - $210",
      reviewTurnaroundDays: "3 - 5 Business Days",
      inspectionsRequired: ["Footing Depth (Frost line 42\")", "Rough Framing", "Final Guardrails"],
      notes: "Requires simple scale site plan and ledger board bolt spacing specs.",
    },
    {
      projectScope: "Interior Drywall Repair & Painting (< 1 Room)",
      permitRequired: false,
      typicalFeeRange: "$0 (Exempt)",
      reviewTurnaroundDays: "Instant - No Filing Needed",
      inspectionsRequired: ["None"],
      notes: "Cosmetic finish work and minor patching is completely permit-exempt.",
    },
    {
      projectScope: "Gutter Cleaning, Seamless Extrusion & Downspouts",
      permitRequired: false,
      typicalFeeRange: "$0 (Exempt)",
      reviewTurnaroundDays: "Instant - No Filing Needed",
      inspectionsRequired: ["None"],
      notes: "Exterior drainage maintenance is permit-exempt in all residential zones.",
    },
    {
      projectScope: "Fence Installation (< 6 ft Height)",
      permitRequired: false,
      typicalFeeRange: "$0 - $35 (Zoning Check)",
      reviewTurnaroundDays: "1 Day (Zoning Clearance)",
      inspectionsRequired: ["Zoning Setback Check"],
      notes: "Check property line setbacks and utility 811 call before digging posts.",
    },
  ],
};

export default function MaterialAndPermitEstimatorModal({
  onClose,
  initialCity = "Austin",
  initialTrade = "All",
}: MaterialAndPermitEstimatorModalProps) {
  const [activeTab, setActiveTab] = useState<"materials" | "permits">("materials");
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({
    lumber_2x4: 20,
    drywall_sheet: 8,
    shingles_square: 4,
  });

  const handleQuantityChange = (id: string, qty: number) => {
    setSelectedItems({
      ...selectedItems,
      [id]: Math.max(0, qty),
    });
  };

  // Calculate material estimate total
  const totalMaterialCost = MATERIAL_CATALOG.reduce((sum, item) => {
    const qty = selectedItems[item.id] || 0;
    const wasteMultiplier = 1 + item.typicalWasteFactor / 100;
    return sum + qty * item.avgCostPerUnit * wasteMultiplier;
  }, 0);

  const permitRules = CITY_PERMIT_RULES.default;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="bg-white max-w-4xl w-full rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        id="material-permit-estimator-modal"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-900 text-white border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-sm sm:text-base text-white">
                  Trade Material Cost & Municipal Permit Guide
                </h3>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                  Updated 2026 Index
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Calculate live material estimates and check regional municipal permit requirements
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

        {/* Tab Selector */}
        <div className="bg-zinc-100 p-2 border-b border-zinc-200 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("materials")}
            className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "materials"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Material Cost Estimator</span>
            {totalMaterialCost > 0 && (
              <span className="bg-zinc-950 text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-mono">
                ${Math.round(totalMaterialCost).toLocaleString()}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("permits")}
            className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "permits"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>City Municipal Permit Matrix</span>
            <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full text-[10px]">
              {selectedCity}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-zinc-50/60">
          {activeTab === "materials" ? (
            /* Material Estimator Tab */
            <div className="space-y-5">
              {/* Summary Bar */}
              <div className="bg-white border-2 border-amber-400 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                <div>
                  <span className="text-[10px] uppercase font-mono font-black text-amber-700 tracking-wider block">
                    ESTIMATED TRADE MATERIALS SUBTOTAL
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-black text-2xl sm:text-3xl text-zinc-900">
                      ${Math.round(totalMaterialCost).toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      (Includes standard 5–15% waste factor)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const cleared: Record<string, number> = {};
                      MATERIAL_CATALOG.forEach((m) => (cleared[m.id] = 0));
                      setSelectedItems(cleared);
                    }}
                    className="text-xs text-zinc-500 hover:text-zinc-900 font-bold px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 transition cursor-pointer"
                  >
                    Reset Quantities
                  </button>
                </div>
              </div>

              {/* Material Items Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-700">
                  Select Quantities by Trade Material
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MATERIAL_CATALOG.map((item) => {
                    const qty = selectedItems[item.id] || 0;
                    const itemTotal = qty * item.avgCostPerUnit * (1 + item.typicalWasteFactor / 100);

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-2xl border p-4 transition shadow-2xs space-y-3 ${
                          qty > 0 ? "border-amber-400 ring-1 ring-amber-400/50" : "border-zinc-200"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md">
                              {item.trade}
                            </span>
                            <h5 className="font-bold text-xs text-zinc-900 mt-1 leading-snug">
                              {item.name}
                            </h5>
                            <p className="text-[10px] text-zinc-500 mt-0.5">{item.description}</p>
                          </div>
                          <span className="font-mono text-xs font-extrabold text-zinc-800 shrink-0">
                            ${item.avgCostPerUnit.toFixed(2)} / {item.unit}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-600">Qty:</span>
                            <input
                              type="number"
                              min="0"
                              value={qty}
                              onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                              className="w-16 bg-zinc-50 border border-zinc-300 rounded-lg px-2 py-1 text-xs font-bold text-center focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                            />
                            <span className="text-[11px] text-zinc-500">units</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-zinc-400 block font-mono">
                              +{item.typicalWasteFactor}% waste
                            </span>
                            <span className="text-xs font-black font-mono text-emerald-700">
                              ${Math.round(itemTotal).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Permits Guide Tab */
            <div className="space-y-5">
              {/* City Selection Bar */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div>
                  <h4 className="font-display font-black text-sm text-zinc-900">
                    Municipal Permit Matrix & Inspection Protocols
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Jurisdiction code requirements for residential remodeling & trade repairs
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-600">City Jurisdiction:</span>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Austin">Austin, TX</option>
                    <option value="Detroit">Detroit, MI</option>
                    <option value="Grand Rapids">Grand Rapids, MI</option>
                    <option value="Ann Arbor">Ann Arbor, MI</option>
                    <option value="Lansing">Lansing, MI</option>
                    <option value="Traverse City">Traverse City, MI</option>
                    <option value="Kalamazoo">Kalamazoo, MI</option>
                  </select>
                </div>
              </div>

              {/* Permit Rules List */}
              <div className="space-y-3">
                {permitRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {rule.permitRequired ? (
                          <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Permit Required
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Permit Exempt (No Fee)
                          </span>
                        )}
                        <h5 className="font-display font-black text-xs sm:text-sm text-zinc-900">
                          {rule.projectScope}
                        </h5>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-bold">
                        <span className="text-zinc-600">Fee: <strong className="text-zinc-900 font-mono">{rule.typicalFeeRange}</strong></span>
                        <span className="text-zinc-400">&bull;</span>
                        <span className="text-zinc-600">Turnaround: <strong className="text-zinc-900">{rule.reviewTurnaroundDays}</strong></span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {rule.notes}
                    </p>

                    <div className="pt-2 border-t border-zinc-150 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <FileCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span><strong>Inspections:</strong> {rule.inspectionsRequired.join(", ")}</span>
                      </div>

                      <a
                        href={`https://google.com/search?q=${encodeURIComponent(`${selectedCity} building department residential permits`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1"
                      >
                        <span>City Building Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
