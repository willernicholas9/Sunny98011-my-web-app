import React, { useState, useRef } from "react";
import { Project, CityData } from "../types";
import { Upload, X, Info, Hammer, MapPin, DollarSign, Image as ImageIcon, Save, Check, Calculator, Sparkles } from "lucide-react";
import { CITIES } from "../data/cities";
import InstantQuoteCalculator from "./InstantQuoteCalculator";
import PhotoUploadStudio, { DamageAnalysisResult } from "./PhotoUploadStudio";

interface ProjectFormProps {
  onAddProject: (projectData: Omit<Project, "id" | "customerId" | "customerFirstName" | "customerLastName" | "customerPhone" | "customerAddress" | "customerEmail" | "createdAt" | "status" | "agreedByCustomer" | "agreedByContractor" | "serviceFeeCharge">) => void;
  onClose: () => void;
  currentUser?: any | null;
  initialData?: {
    title?: string;
    tradeCategory?: string;
    budget?: number;
    description?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

// Preset decorative icons/illustrations so that mock listings look beautiful
const IMAGE_PRESETS = [
  { name: "Lawn & Garden", url: "https://images.unsplash.com/photo-1558905611-1402263dae20?w=600&auto=format&fit=crop&q=80" },
  { name: "Gutters & Roofs", url: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=600&auto=format&fit=crop&q=80" },
  { name: "TV hanging / Electric", url: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&auto=format&fit=crop&q=80" },
  { name: "Windows / Glazing", url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80" },
];

export default function ProjectForm({ onAddProject, onClose, currentUser, initialData }: ProjectFormProps) {
  const [showCalculatorWidget, setShowCalculatorWidget] = useState(false);
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [budget, setBudget] = useState(initialData?.budget ? String(initialData.budget) : "");
  const [type, setType] = useState<"home" | "business">("home");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState(initialData?.zipCode || "");
  const [zipSaved, setZipSaved] = useState(false);
  const [city, setCity] = useState(initialData?.city || "Austin");
  const [state, setState] = useState(initialData?.state || "TX");
  const [autoFillFromProfile, setAutoFillFromProfile] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [emergencyCategory, setEmergencyCategory] = useState<"Plumbing Leak" | "Power Outage" | "Roof/Storm Damage" | "HVAC/Heating" | "Locksmith" | "Other">("Plumbing Leak");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSaveZip = () => {
    if (!zipCode.trim()) return;
    const foundCity = CITIES.find((c) => c.zipCode === zipCode.trim());
    if (foundCity) {
      setCity(foundCity.name);
      setState(foundCity.state);
    }
    try {
      localStorage.setItem("hsws_saved_zip", zipCode.trim());
    } catch {}
    setZipSaved(true);
    setTimeout(() => setZipSaved(false), 3000);
  };
  
  // Pictures & AI Damage Analysis Control
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [photoTags, setPhotoTags] = useState<Record<string, string>>({});
  const [damageScanAnalysis, setDamageScanAnalysis] = useState<DamageAnalysisResult | undefined>(undefined);

  const handleAutoFillToggle = (checked: boolean) => {
    setAutoFillFromProfile(checked);
    if (checked && currentUser) {
      if (currentUser.address) setAddress(currentUser.address);
      if (currentUser.zipCode) setZipCode(currentUser.zipCode);
      if (currentUser.city) {
        const foundCity = CITIES.find(
          (c) =>
            c.name.toLowerCase() === currentUser.city.toLowerCase() ||
            c.zipCode === currentUser.zipCode
        );
        if (foundCity) {
          setCity(foundCity.name);
          setState(foundCity.state);
          if (!currentUser.zipCode) setZipCode(foundCity.zipCode);
        } else {
          setCity(currentUser.city);
          if (currentUser.state) setState(currentUser.state);
        }
      } else if (currentUser.zipCode) {
        const foundCity = CITIES.find((c) => c.zipCode === currentUser.zipCode);
        if (foundCity) {
          setCity(foundCity.name);
          setState(foundCity.state);
        }
      }
    } else if (!checked) {
      setAddress("");
      setZipCode("");
    }
  };

  const handleAddressChange = (val: string) => {
    setAddress(val);
    if (autoFillFromProfile && currentUser && val !== currentUser.address) {
      setAutoFillFromProfile(false);
    }
  };

  // Address and city synchronization helper
  const handleZipChange = (zip: string) => {
    setZipCode(zip);
    const foundCity = CITIES.find(c => c.zipCode === zip);
    if (foundCity) {
      setCity(foundCity.name);
      setState(foundCity.state);
    }
    if (autoFillFromProfile && currentUser && zip !== currentUser.zipCode) {
      setAutoFillFromProfile(false);
    }
  };

  const handleCitySelect = (cityName: string) => {
    const foundCity = CITIES.find(c => c.name === cityName);
    if (foundCity) {
      setCity(foundCity.name);
      setState(foundCity.state);
      setZipCode(foundCity.zipCode);
      if (autoFillFromProfile && currentUser && foundCity.name !== currentUser.city) {
        setAutoFillFromProfile(false);
      }
    } else {
      setCity(cityName);
      if (autoFillFromProfile && currentUser && cityName !== currentUser.city) {
        setAutoFillFromProfile(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!title.trim()) {
      setFormError("Please enter a project title.");
      return;
    }
    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      setFormError("Please specify a valid budget greater than zero.");
      return;
    }

    const finalImages = uploadedImages.length > 0 
      ? uploadedImages 
      : ["https://images.unsplash.com/photo-1581094288338-2314dddb7eed?w=600&auto=format&fit=crop&q=80"];

    onAddProject({
      title,
      description,
      budget: budgetNum,
      type,
      address,
      city,
      state,
      zipCode,
      images: finalImages,
      photoTags: Object.keys(photoTags).length > 0 ? photoTags : undefined,
      damageScanAnalysis,
      isEmergency,
      emergencyCategory: isEmergency ? emergencyCategory : undefined,
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-55 overflow-y-auto" role="dialog" aria-modal="true" id="project-form-modal">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-zinc-200">
        <div className="sticky top-0 bg-white border-b border-zinc-150 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 p-1.5 rounded-lg text-amber-700">
              <Hammer className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-zinc-900">Post a New Project Request</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-650 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick AI Estimator Banner */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border border-blue-800 rounded-2xl p-4 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-xs text-white block">Unsure of fair contractor pricing?</span>
                <span className="text-[11px] text-slate-300">Use our AI Price Estimator to calculate market quotes instantly.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCalculatorWidget(!showCalculatorWidget)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-3xs"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>{showCalculatorWidget ? "Hide Price Estimator" : "Calculate Fair Price"}</span>
            </button>
          </div>

          {showCalculatorWidget && (
            <InstantQuoteCalculator
              onApplyEstimateToForm={(trade, estimatedBudget, autoTitle, autoDesc) => {
                setBudget(estimatedBudget.toString());
                if (!title) setTitle(autoTitle);
                if (!description) setDescription(autoDesc);
                setShowCalculatorWidget(false);
              }}
              onClose={() => setShowCalculatorWidget(false)}
            />
          )}

          {/* Project Header fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Project Title</label>
              <input
                type="text"
                placeholder="e.g. Garden cleanout & weed barrier installation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-zinc-50/50 border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden transition"
                id="form-project-title"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Target Budget ($)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-zinc-500 font-semibold text-sm">$</span>
                <input
                  type="number"
                  placeholder="e.g. 450"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                  className="w-full bg-zinc-50/50 border border-zinc-300 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden transition font-semibold"
                  id="form-project-budget"
                />
              </div>
            </div>
          </div>

          {/* ⚡ Emergency 24/7 Service Option Card */}
          <div className="bg-gradient-to-r from-rose-950/10 via-rose-900/5 to-transparent border border-rose-300 rounded-2xl p-4 space-y-3" id="project-emergency-option-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <div>
                  <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider font-display">24/7 Emergency Dispatch Request</h4>
                  <p className="text-[11px] text-zinc-600">Need urgent help? (e.g., Burst pipe, blackout, lockout, roof leak)</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {isEmergency && (
              <div className="pt-2 border-t border-rose-200/60 space-y-2 animate-fadeIn">
                <label className="block text-[11px] font-bold text-rose-900 uppercase tracking-wider">Select Emergency Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(["Plumbing Leak", "Power Outage", "Roof/Storm Damage", "HVAC/Heating", "Locksmith", "Other"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEmergencyCategory(cat)}
                      className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition text-left cursor-pointer ${
                        emergencyCategory === cat
                          ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                          : "bg-white text-zinc-700 border-rose-200 hover:border-rose-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Property Scope</label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setType("home")}
                className={`py-2.5 px-4 text-xs font-semibold rounded-xl border text-center transition ${
                  type === "home"
                    ? "border-amber-600 bg-amber-50/70 text-amber-900 shadow-3xs font-bold"
                    : "border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                }`}
                id="form-type-home"
              >
                🏡 Home Property
              </button>
              <button
                type="button"
                onClick={() => setType("business")}
                className={`py-2.5 px-4 text-xs font-semibold rounded-xl border text-center transition ${
                  type === "business"
                    ? "border-cyan-600 bg-cyan-50/70 text-cyan-900 shadow-3xs font-bold"
                    : "border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                }`}
                id="form-type-business"
              >
                🏢 Business Property
              </button>
            </div>
          </div>

          {/* Location & Address Section with Auto-Fill Option */}
          <div className="bg-zinc-50/60 border border-zinc-200/80 rounded-2xl p-4 space-y-4" id="project-location-section">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/80 pb-3">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold font-display text-zinc-800 uppercase tracking-wider">
                  Location & Address
                </span>
              </div>
              {currentUser && (
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 bg-white border border-zinc-200 px-3 py-1.5 rounded-xl shadow-3xs cursor-pointer hover:bg-amber-50/50 hover:border-amber-300 transition select-none">
                  <input
                    type="checkbox"
                    checked={autoFillFromProfile}
                    onChange={(e) => handleAutoFillToggle(e.target.checked)}
                    className="w-4 h-4 rounded-md border-zinc-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    id="auto-fill-profile-checkbox"
                    data-testid="auto-fill-profile-checkbox"
                  />
                  <span>Auto-fill from Profile</span>
                </label>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Street Address (Hidden from Public)</label>
                <input
                  type="text"
                  placeholder="e.g. 512 Whispering Pines Dr."
                  value={address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  required
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-amber-500 focus:outline-hidden transition"
                  id="form-project-address"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Zip Code</span>
                  {zipSaved && (
                    <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                      <Check className="w-3 h-3" /> Zip Saved
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="78664"
                    value={zipCode}
                    onChange={(e) => {
                      handleZipChange(e.target.value);
                      if (zipSaved) setZipSaved(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveZip();
                      }
                    }}
                    required
                    className="flex-1 bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-amber-500 focus:outline-hidden transition"
                    id="form-project-zip"
                  />
                  <button
                    type="button"
                    onClick={handleSaveZip}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-3xs shrink-0 ${
                      zipSaved
                        ? "bg-emerald-600 text-white border border-emerald-700"
                        : "bg-amber-600 hover:bg-amber-700 text-white border border-amber-700"
                    }`}
                    id="save-project-zip-btn"
                    data-testid="save-project-zip-btn"
                    title="Save Zip Code"
                  >
                    {zipSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Saved
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" /> Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Project Specific Location (City/State)</label>
              <select
                value={city}
                onChange={(e) => handleCitySelect(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-amber-500 focus:outline-hidden transition"
                id="form-project-city"
              >
                {CITIES.map((c) => (
                  <option key={c.zipCode} value={c.name}>
                    {c.name}, {c.state} ({c.zipCode})
                  </option>
                ))}
                {!CITIES.some((c) => c.name.toLowerCase() === city.toLowerCase()) && (
                  <option value={city}>
                    {city}, {state} ({zipCode})
                  </option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Detailed Project Specification & Tasks</label>
            <textarea
              placeholder="Describe exactly what needs to be done. E.g. 'Looking for assistance with clearing leaves from gutters, bagging lawn debris, spreading mulch. Bring your own rake and heavy-duty bags...'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full bg-zinc-50/50 border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-hidden transition leading-relaxed"
              id="form-project-desc"
            />
          </div>

          {/* Area to Post Pictures: Advanced PhotoUploadStudio with AI Damage Scan & Tagging */}
          <div className="space-y-2">
            <PhotoUploadStudio
              initialPhotos={uploadedImages}
              photoTags={photoTags}
              userRole="customer"
              title="Project Photo, Blueprint & Damage Uploader"
              subtitle="Upload damage or project photos for free AI scope calculations & instant contractor bidding."
              onPhotosChange={(newPhotos, newTags) => {
                setUploadedImages(newPhotos);
                setPhotoTags(newTags);
              }}
              onAnalysisComplete={(analysis) => {
                setDamageScanAnalysis(analysis);
                if (!description) {
                  setDescription(`AI Visual Diagnosis: ${analysis.summary}\nDetected: ${analysis.detectedIssues.join(", ")}`);
                }
              }}
            />
          </div>

          {/* Service Fee notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-xs text-amber-900">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <div className="space-y-1">
              <span className="font-bold">Hot Spot Work Shop Customer Agreement:</span>
              <p className="leading-relaxed">
                Posting is free. When both you and a contractor accept a project, a service charge applies based on project price:
              </p>
              <ul className="list-disc list-inside mt-0.5 font-medium space-y-0.5">
                <li>Under $25,000: <strong className="font-extrabold">$5.00 service fee</strong>.</li>
                <li>$25,001 and above: <strong className="font-extrabold">$20.00 service fee</strong>.</li>
                <li><em>Absolutely no fee is billed until the job is accepted and agreed upon by both you and the contractor.</em></li>
              </ul>
            </div>
          </div>

          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-150">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-650 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
              id="form-submit-btn"
            >
              Request Project Launch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
