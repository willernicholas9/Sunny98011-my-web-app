import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  MapPin,
  Plus,
  X,
  Save,
  Check,
  ShieldCheck,
  Zap,
  Sparkles,
  RefreshCw,
  Globe,
  Radio,
  Sliders,
  Trash2,
  Copy,
  Info
} from "lucide-react";
import { CITIES, searchCitiesAndZips, getCityDetailsForZip } from "../../data/cities";
import { CityData } from "../../types";
import { autonomousAdWorker, AdWorkerState } from "../../services/autonomousAdWorker";

interface AgentZipCodeSearchBoxProps {
  initialZips?: string;
  onZipsChange?: (zipsString: string, zipList: string[]) => void;
  className?: string;
}

const REGION_PRESETS: { [key: string]: { label: string; zips: string; desc: string; icon: string } } = {
  central: {
    label: "⭐ Central US (CT Zone)",
    zips: "78701, 75201, 77001, 76102, 60601, 63101, 55401, 37201, 73101",
    desc: "Austin, Dallas, Houston, Fort Worth, Chicago, St. Louis, Minneapolis, Nashville, OKC",
    icon: "⭐"
  },
  midwest: {
    label: "Midwest & Great Lakes",
    zips: "60601, 48226, 44114, 53202, 55401, 46204, 64106",
    desc: "Chicago, Detroit, Cleveland, Milwaukee, Minneapolis, Indianapolis, Kansas City",
    icon: "🏙️"
  },
  southwest: {
    label: "Southwest & Texas Corridor",
    zips: "78701, 75201, 77001, 78205, 85001, 73101, 87101",
    desc: "Austin, Dallas, Houston, San Antonio, Phoenix, Oklahoma City, Albuquerque",
    icon: "🌵"
  },
  southeast: {
    label: "Southeast & Florida Coast",
    zips: "30301, 33101, 32801, 33602, 28202, 27601, 37201",
    desc: "Atlanta, Miami, Orlando, Tampa, Charlotte, Raleigh, Nashville",
    icon: "🌴"
  },
  northeast: {
    label: "Northeast Megalopolis",
    zips: "10001, 02108, 19102, 20001, 21201, 15222",
    desc: "New York, Boston, Philadelphia, Washington DC, Baltimore, Pittsburgh",
    icon: "🗽"
  },
  west: {
    label: "West Coast & Rockies",
    zips: "90001, 90210, 94102, 98101, 97201, 80202, 89101, 84101",
    desc: "LA, Beverly Hills, San Francisco, Seattle, Portland, Denver, Las Vegas, Salt Lake",
    icon: "🏔️"
  },
  all50: {
    label: "🔥 Top 20 National Metros",
    zips: "78701, 75201, 60601, 77001, 85001, 10001, 90001, 19102, 78205, 92101, 30301, 33101, 98101, 80202, 20001, 02108, 48226, 37201, 55401, 70112",
    desc: "High-density homeowner repair demand across all major metropolitan areas",
    icon: "🚀"
  }
};

const STORAGE_KEY = "hsws_ad_target_zips";

export default function AgentZipCodeSearchBox({
  initialZips,
  onZipsChange,
  className = ""
}: AgentZipCodeSearchBoxProps) {
  // Read stored target zips with resilient fallback
  const [targetZips, setTargetZips] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored.trim()) return stored;
    } catch {}
    const workerZips = autonomousAdWorker.getState().targetZips;
    return initialZips || workerZips || REGION_PRESETS.central.zips;
  });

  const [searchInput, setSearchInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "saving">("idle");
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => {
    try {
      const savedAt = localStorage.getItem("hsws_ad_target_zips_saved_at");
      if (savedAt) return new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {}
    return "Persistent (Active)";
  });
  const [copyStatus, setCopyStatus] = useState(false);
  const [quickAddInput, setQuickAddInput] = useState("");

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Parse active zip codes array
  const activeZipList = useMemo(() => {
    return targetZips
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length >= 3);
  }, [targetZips]);

  // Autocomplete search suggestions
  const searchResults: CityData[] = useMemo(() => {
    if (!searchInput.trim()) return [];
    return searchCitiesAndZips(searchInput, 6);
  }, [searchInput]);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync with background autonomous daemon & server
  const persistZips = (newZipString: string) => {
    const cleaned = newZipString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ");

    setTargetZips(cleaned);

    try {
      localStorage.setItem(STORAGE_KEY, cleaned);
      localStorage.setItem("hsws_ad_target_zips_saved_at", new Date().toISOString());
    } catch (e) {
      console.warn("Failed to write target zips to localStorage", e);
    }

    // Update 24/7 background worker engine
    autonomousAdWorker.saveTargetZips(cleaned, true);

    // Update parent callback
    if (onZipsChange) {
      const list = cleaned.split(",").map((s) => s.trim()).filter(Boolean);
      onZipsChange(cleaned, list);
    }

    // Sync with backend API
    fetch("/api/owner/agent-zips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetZips: cleaned })
    }).catch(() => {});

    setSaveStatus("saved");
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLastSavedTime(timeStr);
    setTimeout(() => setSaveStatus("idle"), 3000);
  };

  // Add a single ZIP code
  const handleAddZip = (zipToAdd: string) => {
    const cleanZip = zipToAdd.trim();
    if (!cleanZip) return;

    const currentList = targetZips
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!currentList.includes(cleanZip)) {
      const updated = [...currentList, cleanZip].join(", ");
      persistZips(updated);
    }
    setSearchInput("");
    setQuickAddInput("");
    setIsDropdownOpen(false);
  };

  // Remove a single ZIP code
  const handleRemoveZip = (zipToRemove: string) => {
    const currentList = targetZips
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const updated = currentList.filter((z) => z !== zipToRemove).join(", ");
    persistZips(updated);
  };

  // Apply Region Preset
  const handleApplyPreset = (presetKey: string) => {
    const preset = REGION_PRESETS[presetKey];
    if (preset) {
      persistZips(preset.zips);
    }
  };

  // Clear all ZIPs
  const handleClearAll = () => {
    persistZips("");
  };

  // Copy to clipboard
  const handleCopyZips = () => {
    navigator.clipboard.writeText(targetZips);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2500);
  };

  return (
    <div
      className={`bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5 ${className}`}
      id="agent-zip-code-search-box-card"
    >
      {/* Card Header with Status & Persistence Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-150 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-bold text-base text-zinc-900 leading-tight">
                AI Agent Target ZIP Code Search & Management
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1 uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                24/7 Persisted
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Search any US city or ZIP code. Target zones remain permanently locked in background storage even after you leave or close the app.
            </p>
          </div>
        </div>

        {/* Save indicator button */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => persistZips(targetZips)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-3xs ${
              saveStatus === "saved"
                ? "bg-emerald-600 text-white border border-emerald-700"
                : "bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-950"
            }`}
            title="Lock into 24/7 Background Persistent Daemon"
            id="agent-zip-persist-btn"
          >
            {saveStatus === "saved" ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved & Locked ({lastSavedTime})</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span>Save Target ZIPs</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Search Bar with Autocomplete Dropdown */}
      <div className="space-y-2">
        <label className="block text-xs font-extrabold text-zinc-900 uppercase tracking-wider">
          Instant City / State / ZIP Code Search Box
        </label>

        <div className="relative" ref={searchContainerRef}>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (searchResults.length > 0) {
                    handleAddZip(searchResults[0].zipCode);
                  } else if (searchInput.trim()) {
                    handleAddZip(searchInput.trim());
                  }
                }
              }}
              placeholder="Search by city (e.g. Austin, Dallas, Chicago, Miami) or enter 5-digit ZIP code (e.g. 78701)..."
              className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl pl-10 pr-24 py-3 text-xs font-medium text-zinc-900 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-hidden transition placeholder:text-zinc-400"
              id="agent-zip-search-input"
            />

            <div className="absolute right-2 flex items-center gap-1.5">
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg text-xs"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (searchInput.trim()) {
                    handleAddZip(searchInput.trim());
                  }
                }}
                disabled={!searchInput.trim()}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer shadow-3xs"
                id="agent-zip-add-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add ZIP</span>
              </button>
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-zinc-200 rounded-2xl shadow-xl z-30 overflow-hidden divide-y divide-zinc-100 max-h-72 overflow-y-auto">
              <div className="bg-zinc-50 px-3.5 py-1.5 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                <span>Matching US Metros & ZIP Codes ({searchResults.length})</span>
                <span>Click to Add</span>
              </div>
              {searchResults.map((city) => {
                const isAlreadyAdded = activeZipList.includes(city.zipCode);
                return (
                  <button
                    key={`${city.name}-${city.zipCode}`}
                    type="button"
                    onClick={() => handleAddZip(city.zipCode)}
                    className="w-full px-4 py-2.5 text-left text-xs flex items-center justify-between hover:bg-red-50/70 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-zinc-100 group-hover:bg-red-100 group-hover:text-red-700 flex items-center justify-center text-zinc-600 transition">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 group-hover:text-red-950">
                          {city.name}, {city.state}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono">
                          ZIP: <span className="font-bold text-zinc-700">{city.zipCode}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAlreadyAdded ? (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-250 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-zinc-100 group-hover:bg-red-600 group-hover:text-white text-zinc-700 px-2.5 py-1 rounded-xl transition flex items-center gap-1 shadow-3xs">
                          <Plus className="w-3 h-3" /> Add Target
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Active Targeted ZIP Code Chips */}
      <div className="space-y-2.5 bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider">
              Active Targeted Zones
            </span>
            <span className="bg-red-100 text-red-800 font-mono text-[10px] font-black px-2 py-0.5 rounded-full border border-red-200">
              {activeZipList.length} Active {activeZipList.length === 1 ? "ZIP" : "ZIPs"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyZips}
              className="text-[11px] font-bold text-zinc-600 hover:text-zinc-900 flex items-center gap-1 bg-white hover:bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
              title="Copy active ZIP list"
            >
              {copyStatus ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy List</span>
                </>
              )}
            </button>

            {activeZipList.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 bg-white hover:bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
                title="Clear all ZIP codes"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Chips Grid */}
        {activeZipList.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-400 italic bg-white rounded-xl border border-dashed border-zinc-250">
            No ZIP codes currently targeted. Search a city above or choose a preset region below to launch the autonomous agent.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
            {activeZipList.map((zip) => {
              const details = getCityDetailsForZip(zip);
              return (
                <div
                  key={zip}
                  className="bg-white hover:bg-red-50/50 border border-zinc-250 hover:border-red-300 rounded-xl px-2.5 py-1.5 text-xs flex items-center gap-2 shadow-3xs transition group"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="font-mono font-black text-zinc-900 group-hover:text-red-950">
                      {zip}
                    </span>
                    {details && (
                      <span className="text-[10px] text-zinc-500 font-medium border-l border-zinc-200 pl-1.5">
                        {details.label}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveZip(zip)}
                    className="text-zinc-400 hover:text-rose-600 hover:bg-rose-100 rounded-md p-0.5 transition cursor-pointer"
                    title={`Remove ${zip}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Regional Presets Bar */}
      <div className="space-y-2 pt-1 border-t border-zinc-150">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            1-Click High-Converting Regional Presets
          </span>
          <span className="text-[10px] text-zinc-400 font-medium">Click to load curated zones</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.entries(REGION_PRESETS).map(([key, preset]) => {
            const isSelected = targetZips === preset.zips;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleApplyPreset(key)}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                  isSelected
                    ? "bg-red-50 border-red-400 ring-1 ring-red-400/50 shadow-3xs"
                    : "bg-white hover:bg-zinc-50 border-zinc-200"
                }`}
                title={preset.desc}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-sm">{preset.icon}</span>
                  {isSelected && (
                    <span className="text-[8px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded-full uppercase">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-bold text-zinc-900 leading-tight truncate">
                  {preset.label}
                </div>
                <div className="text-[9px] text-zinc-400 mt-1 truncate">
                  {preset.zips.split(",").length} Metros
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Comma-Separated Direct String Editor */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-zinc-500">
          <span className="font-bold text-zinc-700">Raw Target String (Comma Separated)</span>
          <span>{activeZipList.length} ZIPs configured</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={targetZips}
            onChange={(e) => setTargetZips(e.target.value)}
            onBlur={() => persistZips(targetZips)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                persistZips(targetZips);
              }
            }}
            placeholder="e.g. 78701, 75201, 60601, 77001, 85001"
            className="flex-1 bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-800 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            id="raw-ad-target-zips-input"
          />
          <button
            type="button"
            onClick={() => persistZips(targetZips)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer shadow-3xs shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
        </div>
      </div>

      {/* Persistence Notice Info */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-snug">
          <strong>24/7 Autonomous Lock Active:</strong> All selected ZIP codes are automatically backed up to browser local storage, synchronized to the 24/7 daemon worker, and mirrored on the cloud relay server. When you leave the app or turn off your computer, the agent keeps monitoring weather events and homeowner repair demand in these exact zones.
        </div>
      </div>
    </div>
  );
}
