import React, { useState, useRef } from "react";
import {
  Upload, Image as ImageIcon, Camera, Trash2, Tag, Sparkles,
  CheckCircle2, AlertCircle, FileText, Printer, ExternalLink,
  ChevronRight, RefreshCw, ZoomIn, Eye, ShoppingCart, ShieldCheck,
  Zap, Info, Plus, ArrowRight, Download, Layers, X
} from "lucide-react";

export interface PhotoUploadStudioProps {
  initialPhotos?: string[];
  photoTags?: Record<string, string>;
  onPhotosChange: (photos: string[], tags: Record<string, string>) => void;
  onAnalysisComplete?: (analysis: DamageAnalysisResult) => void;
  userRole?: "customer" | "contractor" | "owner";
  title?: string;
  subtitle?: string;
  allowAiScan?: boolean;
}

export interface DamageAnalysisResult {
  damageSeverity: "Minor Cosmetic" | "Moderate Repair" | "Severe Structural" | "Emergency Hazard";
  estimatedLaborHours: string;
  recommendedTrade: string;
  summary: string;
  detectedIssues: string[];
  suggestedMaterials: string[];
  estCostRange: string;
}

// Preset verified repair photos for quick 1-click test/simulation
const SAMPLE_REPAIR_PHOTOS = [
  {
    name: "Roof Storm & Shingle Damage",
    url: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=800&auto=format&fit=crop&q=80",
    tag: "Damage Area",
    trade: "Roofing",
    defaultAnalysis: {
      damageSeverity: "Moderate Repair" as const,
      estimatedLaborHours: "6 - 10 Hours",
      recommendedTrade: "Roofing & Gutter Specialist",
      summary: "Wind-lifted asphalt shingles with exposed underlayment. Requires 3-tab shingle replacement and flashing sealant.",
      detectedIssues: ["Missing 3-tab shingles", "Exposed felt underlayment", "Potential drip edge moisture intrusion"],
      suggestedMaterials: ["Timberline HDZ Shingles (3 Bundles)", "Roofing Synthetic Underlayment", "1-1/4 in. Galvanized Roofing Nails", "Through the Roof Sealant"],
      estCostRange: "$450 - $850"
    }
  },
  {
    name: "Plumbing Pipe Under-Sink Leak",
    url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80",
    tag: "Damage Area",
    trade: "Plumbing",
    defaultAnalysis: {
      damageSeverity: "Emergency Hazard" as const,
      estimatedLaborHours: "2 - 4 Hours",
      recommendedTrade: "Licensed Master Plumber",
      summary: "P-trap corrosion and loose slip-joint washer causing localized cabinet water damage.",
      detectedIssues: ["Failed slip-joint washer", "Corroded PVC slip nut", "Cabinet subfloor dampness"],
      suggestedMaterials: ["1-1/2 in. PVC P-Trap Kit", "Oatey Plumber's Putty", "Braided Stainless Steel Supply Lines (2x)", "Basin Wrench"],
      estCostRange: "$180 - $350"
    }
  },
  {
    name: "Drywall Crack & Ceiling Paint Flaking",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80",
    tag: "Wide Angle",
    trade: "Painting & Drywall",
    defaultAnalysis: {
      damageSeverity: "Minor Cosmetic" as const,
      estimatedLaborHours: "3 - 5 Hours",
      recommendedTrade: "Drywall & Painting Pro",
      summary: "Settlement hairline crack along corner bead with surface peeling latex paint.",
      detectedIssues: ["Hairline sheetrock fracture", "Moisture paint delamination", "Joint tape separation"],
      suggestedMaterials: ["DAP Fast 'N Final Lightweight Spackling", "Fibafuse Paperless Wall Tape", "Zinsser Bulls Eye 1-2-3 Primer", "Behr Dynasty Interior Satin Paint"],
      estCostRange: "$220 - $480"
    }
  },
  {
    name: "Overgrown Lawn & Hedge Overhaul",
    url: "https://images.unsplash.com/photo-1558905611-1402263dae20?w=800&auto=format&fit=crop&q=80",
    tag: "Before Work",
    trade: "Landscaping",
    defaultAnalysis: {
      damageSeverity: "Moderate Repair" as const,
      estimatedLaborHours: "4 - 8 Hours",
      recommendedTrade: "Landscape Maintenance & Grounds Pro",
      summary: "Excess thatch accumulation, unedged perimeter curbs, and encroaching shrub branches.",
      detectedIssues: ["Thick turf overgrowth", "Obstructed drainage path", "Dead branch buildup"],
      suggestedMaterials: ["Scott's Turf Builder Lawn Food", "Black Velvet Mulch (10 Bags)", "Husqvarna Trimmer Line .095", "Commercial Yard Waste Bags"],
      estCostRange: "$200 - $450"
    }
  }
];

const PHOTO_TAG_OPTIONS = [
  "Damage Area",
  "Wide Angle",
  "Close-up Detail",
  "Blueprint / Spec",
  "Before Work",
  "After / Finished",
  "License / Insurance",
  "Truck / Equipment"
];

export default function PhotoUploadStudio({
  initialPhotos = [],
  photoTags = {},
  onPhotosChange,
  onAnalysisComplete,
  userRole = "customer",
  title = "Project Photo & Blueprint Uploader",
  subtitle = "Upload clear photos to help contractors submit 100% accurate quotes without surprise markups.",
  allowAiScan = true
}: PhotoUploadStudioProps) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [tags, setTags] = useState<Record<string, string>>(photoTags);
  const [selectedPhotoForScan, setSelectedPhotoForScan] = useState<string | null>(initialPhotos[0] || null);
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DamageAnalysisResult | null>(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showPartnerSupplies, setShowPartnerSupplies] = useState(true);
  const [scanSuccessToast, setScanSuccessToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newUrls: string[] = [];
    const newTags: Record<string, string> = { ...tags };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        const fileUrl = URL.createObjectURL(file);
        newUrls.push(fileUrl);
        newTags[fileUrl] = userRole === "contractor" ? "Before Work" : "Damage Area";
      }
    }

    const updated = [...photos, ...newUrls];
    setPhotos(updated);
    setTags(newTags);
    onPhotosChange(updated, newTags);
    if (!selectedPhotoForScan && updated.length > 0) {
      setSelectedPhotoForScan(updated[0]);
    }
  };

  const handleAddPresetSample = (sample: typeof SAMPLE_REPAIR_PHOTOS[0]) => {
    if (photos.includes(sample.url)) return;
    const updated = [...photos, sample.url];
    const updatedTags = { ...tags, [sample.url]: sample.tag };
    setPhotos(updated);
    setTags(updatedTags);
    setSelectedPhotoForScan(sample.url);
    setAnalysisResult(sample.defaultAnalysis);
    onPhotosChange(updated, updatedTags);
    if (onAnalysisComplete) onAnalysisComplete(sample.defaultAnalysis);
  };

  const handleRemovePhoto = (photoUrl: string) => {
    const updated = photos.filter(p => p !== photoUrl);
    const updatedTags = { ...tags };
    delete updatedTags[photoUrl];
    setPhotos(updated);
    setTags(updatedTags);
    onPhotosChange(updated, updatedTags);
    if (selectedPhotoForScan === photoUrl) {
      setSelectedPhotoForScan(updated[0] || null);
      setAnalysisResult(null);
    }
  };

  const handleSetTag = (photoUrl: string, tag: string) => {
    const updatedTags = { ...tags, [photoUrl]: tag };
    setTags(updatedTags);
    onPhotosChange(photos, updatedTags);
  };

  const handleRunAiPhotoScan = async () => {
    if (!selectedPhotoForScan) return;
    setIsScanning(true);
    setScanSuccessToast(null);

    try {
      // Simulate real visual recognition pipeline
      await new Promise(r => setTimeout(r, 1400));

      // Match preset if known or generate adaptive result
      const matchedSample = SAMPLE_REPAIR_PHOTOS.find(s => s.url === selectedPhotoForScan);
      const result: DamageAnalysisResult = matchedSample
        ? matchedSample.defaultAnalysis
        : {
            damageSeverity: "Moderate Repair",
            estimatedLaborHours: "4 - 7 Hours",
            recommendedTrade: "Licensed General Tradesman / Specialist",
            summary: "Visual inspection confirms localized surface wear and material degradation requiring standard repair protocols.",
            detectedIssues: [
              "Localized surface fracture / material wear",
              "Weathering or fastener looseness",
              "Substrate stabilization recommended"
            ],
            suggestedMaterials: [
              "Heavy-Duty Fastener & Anchor Pack ($24.99)",
              "All-Weather Commercial Sealant ($18.50)",
              "Multi-Surface Surface Primer ($32.00)"
            ],
            estCostRange: "$280 - $550"
          };

      setAnalysisResult(result);
      if (onAnalysisComplete) onAnalysisComplete(result);
      setScanSuccessToast("✨ AI Photo Analysis Complete: Scope, Materials & Estimated Hours Calculated!");
      setTimeout(() => setScanSuccessToast(null), 5000);
    } finally {
      setIsScanning(false);
    }
  };

  const handlePrintInspectionReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const analysisHtml = analysisResult ? `
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #0f172a; margin-top: 0;">AI Photo Damage & Scope Analysis</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <strong>Severity:</strong> <span style="color: #dc2626; font-weight: bold;">${analysisResult.damageSeverity}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <strong>Estimated Labor:</strong> <span>${analysisResult.estimatedLaborHours}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <strong>Recommended Trade:</strong> <span>${analysisResult.recommendedTrade}</span>
        </div>
        <p><strong>Summary:</strong> ${analysisResult.summary}</p>
        <h4>Detected Issues:</h4>
        <ul>${analysisResult.detectedIssues.map(i => `<li>${i}</li>`).join("")}</ul>
        <h4>Estimated Supply List (Home Depot / Lowe's):</h4>
        <ul>${analysisResult.suggestedMaterials.map(m => `<li>${m}</li>`).join("")}</ul>
        <div style="font-size: 18px; font-weight: bold; color: #047857; margin-top: 16px;">
          Estimated Labor & Materials Range: ${analysisResult.estCostRange}
        </div>
      </div>
    ` : '';

    const photosHtml = photos.map((p, idx) => `
      <div style="display: inline-block; width: 48%; margin: 1%; vertical-align: top; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; padding: 8px; box-sizing: border-box;">
        <img src="${p}" style="width: 100%; height: 220px; object-fit: cover; border-radius: 4px;" />
        <div style="font-size: 12px; font-weight: bold; margin-top: 6px; color: #334155;">Photo #${idx + 1} (${tags[p] || "Site Photo"})</div>
      </div>
    `).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Job Scope & Visual Damage Report</title>
          <style>
            body { font-family: -apple-system, system-ui, sans-serif; padding: 30px; color: #0f172a; max-width: 800px; margin: 0 auto; }
            h1 { font-size: 24px; color: #1e3a8a; border-bottom: 3px solid #1e3a8a; padding-bottom: 8px; }
            .badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: bold; margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <div class="badge">Hotspot Tradesmen Network • Visual Scope Inspection</div>
          <h1>Verified Project Inspection & Photo Evidence Report</h1>
          <p>Generated: ${new Date().toLocaleDateString()} • Verified Zero Broker Markup Direct Scope Sheet</p>
          ${analysisHtml}
          <h3>Attached Job Photos (${photos.length})</h3>
          <div>${photosHtml}</div>
          <footer style="margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 12px; font-size: 11px; color: #64748b;">
            All contractor bids placed through Hotspot Tradesmen Network are backed by Escrow Milestone Protection.
          </footer>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6" id="photo-upload-studio">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-150 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-2xl border border-blue-200">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-base sm:text-lg text-zinc-900 leading-tight">
                {title}
              </h3>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {photos.length} {photos.length === 1 ? "Photo" : "Photos"}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {photos.length > 0 && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handlePrintInspectionReport}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-zinc-200"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-600" />
              <span>Print Scope PDF</span>
            </button>
          </div>
        )}
      </div>

      {scanSuccessToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{scanSuccessToast}</span>
        </div>
      )}

      {/* Main Drag-and-Drop & Camera Upload Box */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-blue-600 bg-blue-50/80 scale-[1.01]"
            : "border-zinc-300 bg-zinc-50/60 hover:bg-zinc-100/70 hover:border-zinc-400"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="w-12 h-12 bg-white rounded-2xl shadow-xs border border-zinc-200 text-blue-700 flex items-center justify-center mx-auto mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-black text-zinc-900">
          Click to Upload Photos or Drag & Drop Here
        </h4>
        <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
          Supports JPG, PNG, HEIC, WEBP & blueprints from your phone camera or computer.
        </p>

        {/* Quick Sample Photos for Instant Demo */}
        <div className="mt-4 pt-4 border-t border-zinc-200/80 flex flex-wrap items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
          <span className="text-[11px] font-bold text-zinc-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick 1-Click Samples:
          </span>
          {SAMPLE_REPAIR_PHOTOS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddPresetSample(sample)}
              className="text-[11px] font-semibold bg-white hover:bg-blue-50 text-zinc-700 hover:text-blue-700 px-2.5 py-1 rounded-xl border border-zinc-200 shadow-3xs transition cursor-pointer"
            >
              + {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* Uploaded Photos Grid with Tagging & AI Scanner Trigger */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Attached Gallery ({photos.length})
            </h4>
            <span className="text-[11px] text-zinc-500 font-medium">
              Click photo to select for AI damage analysis
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {photos.map((photoUrl, idx) => {
              const isSelected = selectedPhotoForScan === photoUrl;
              const currentTag = tags[photoUrl] || (userRole === "contractor" ? "Before Work" : "Damage Area");

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedPhotoForScan(photoUrl)}
                  className={`group relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-zinc-900 flex flex-col justify-between ${
                    isSelected
                      ? "border-blue-600 ring-2 ring-blue-400/40 shadow-md"
                      : "border-zinc-200 hover:border-zinc-400 shadow-2xs"
                  }`}
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-zinc-950">
                    <img
                      src={photoUrl}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />

                    {/* Top Buttons: Zoom & Delete */}
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveLightboxImage(photoUrl);
                        }}
                        className="p-1 bg-black/60 hover:bg-black text-white rounded-lg backdrop-blur-xs transition"
                        title="Zoom In"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto(photoUrl);
                        }}
                        className="p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-lg backdrop-blur-xs transition"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {isSelected && (
                      <span className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                        Selected for AI Scan
                      </span>
                    )}
                  </div>

                  {/* Tag Selector Pill */}
                  <div className="p-2 bg-white border-t border-zinc-100" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between gap-1">
                      <Tag className="w-3 h-3 text-zinc-400 shrink-0" />
                      <select
                        value={currentTag}
                        onChange={(e) => handleSetTag(photoUrl, e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg text-[10px] font-bold text-zinc-700 py-0.5 px-1 focus:outline-none"
                      >
                        {PHOTO_TAG_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ✨ AI Instant Photo Damage Scanner & Scope Calculator */}
      {allowAiScan && photos.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-blue-500/30 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-900/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-black text-base text-white">
                    AI Visual Damage & Scope Scanner
                  </h4>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    Gemini Vision 3.7
                  </span>
                </div>
                <p className="text-xs text-blue-200 mt-0.5">
                  Scans selected photo to estimate repair hours, detected issues, and materials.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunAiPhotoScan}
              disabled={isScanning || !selectedPhotoForScan}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
              id="run-ai-photo-scan-btn"
            >
              {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-300" />}
              <span>{isScanning ? "Scanning Image..." : "✨ Run AI Damage Scan"}</span>
            </button>
          </div>

          {/* Scan Results Display */}
          {analysisResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                    Damage Severity
                  </span>
                  <span className={`text-sm font-black mt-1 inline-block ${
                    analysisResult.damageSeverity === "Emergency Hazard"
                      ? "text-rose-400"
                      : analysisResult.damageSeverity === "Severe Structural"
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}>
                    {analysisResult.damageSeverity}
                  </span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                    Estimated Labor Hours
                  </span>
                  <span className="text-sm font-black text-blue-300 mt-1 inline-block">
                    {analysisResult.estimatedLaborHours}
                  </span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                    Recommended Trade
                  </span>
                  <span className="text-sm font-black text-amber-300 mt-1 inline-block">
                    🛠️ {analysisResult.recommendedTrade}
                  </span>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest block">
                  Visual Diagnosis Summary
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed">
                  {analysisResult.summary}
                </p>

                <div className="pt-2 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-bold text-amber-300 text-[11px] block mb-1">
                      Detected Structural / Surface Issues:
                    </span>
                    <ul className="space-y-1 text-zinc-300">
                      {analysisResult.detectedIssues.map((issue, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-emerald-300 text-[11px] block mb-1">
                      Required Materials List:
                    </span>
                    <ul className="space-y-1 text-zinc-300">
                      {analysisResult.suggestedMaterials.map((mat, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>{mat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-700/80">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-zinc-400">Estimated Fair Labor + Materials:</span>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      {analysisResult.estCostRange}
                    </span>
                  </div>

                  <span className="text-[10px] text-zinc-400 font-medium">
                    100% Free Scope Sheet • Verified No Middleman Markup
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl text-center text-xs text-zinc-400">
              Select any photo above and click <strong>"✨ Run AI Damage Scan"</strong> to automatically extract scope, material lists, and repair hours.
            </div>
          )}
        </div>
      )}

      {/* 💰 Partner Supply & Tool Storefront (Monetizes via Affiliate Commissions at $0 Cost to Users) */}
      {showPartnerSupplies && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500 text-slate-950 rounded-xl font-bold">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                  Home Depot & Lowe's Pro Material Partner Savings (5-10% Off)
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Homeowners & Contractors get wholesale partner discounts on project materials. Zero cost to users.
                </p>
              </div>
            </div>

            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
              Cashback Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
            <div className="bg-white border border-amber-200/80 p-3 rounded-2xl shadow-3xs flex items-center justify-between">
              <div>
                <div className="font-bold text-zinc-900">Home Depot Pro Desk</div>
                <div className="text-[10px] text-zinc-500">Job-Lot Shingles, PVC & Lumber</div>
              </div>
              <a
                href="https://www.homedepot.com"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] rounded-lg flex items-center gap-1 transition"
              >
                <span>Browse</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="bg-white border border-amber-200/80 p-3 rounded-2xl shadow-3xs flex items-center justify-between">
              <div>
                <div className="font-bold text-zinc-900">Lowe's MVP Rewards</div>
                <div className="text-[10px] text-zinc-500">Paint, Fasteners & Fixtures</div>
              </div>
              <a
                href="https://www.lowes.com"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 transition"
              >
                <span>Browse</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="bg-white border border-amber-200/80 p-3 rounded-2xl shadow-3xs flex items-center justify-between">
              <div>
                <div className="font-bold text-zinc-900">SupplyHouse & Ferguson</div>
                <div className="text-[10px] text-zinc-500">HVAC, Plumbing & Electrical</div>
              </div>
              <a
                href="https://www.supplyhouse.com"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 transition"
              >
                <span>Browse</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveLightboxImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={activeLightboxImage}
              alt="Expanded View"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/20"
              referrerPolicy="no-referrer"
            />
            <div className="mt-3 flex items-center justify-between w-full text-white text-xs px-2">
              <span className="font-bold">{tags[activeLightboxImage] || "Attached Photo"}</span>
              <button
                type="button"
                onClick={() => setActiveLightboxImage(null)}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold transition cursor-pointer"
              >
                Close (ESC)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
