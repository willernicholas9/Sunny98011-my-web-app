import React, { useState, useRef, useEffect, useMemo } from "react";
import { MapPin, Search, X, Check, Plus, ChevronDown, Sparkles } from "lucide-react";
import { CityData } from "../types";
import VoiceInputButton from "./VoiceInputButton";

interface CityHubSearchBoxProps {
  currentCityName: string;
  allCities: CityData[];
  onSelectCity: (cityName: string) => void;
  onAddCustomCity: (newCity: CityData) => void;
  onNotify: (message: string) => void;
}

const POPULAR_HUBS = [
  { name: "Austin", state: "TX" },
  { name: "Dallas", state: "TX" },
  { name: "Houston", state: "TX" },
  { name: "Chicago", state: "IL" },
  { name: "Atlanta", state: "GA" },
  { name: "Miami", state: "FL" },
  { name: "Phoenix", state: "AZ" },
  { name: "Denver", state: "CO" },
];

export const CityHubSearchBox = React.memo(function CityHubSearchBox({
  currentCityName,
  allCities,
  onSelectCity,
  onAddCustomCity,
  onNotify,
}: CityHubSearchBoxProps) {
  const [searchInput, setSearchInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Active city info lookup
  const activeCity = useMemo(() => {
    return (
      allCities.find((c) => c.name.toLowerCase() === currentCityName.toLowerCase()) ||
      allCities[0]
    );
  }, [allCities, currentCityName]);

  // Instant fuzzy filter matching city name, state, or ZIP
  const filteredCities = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (!q) return allCities.slice(0, 15);

    // Remove state commas if typed like "Austin, TX"
    const cleaned = q.replace(/,/g, " ").replace(/\s+/g, " ").trim();
    const tokens = cleaned.split(" ");

    return allCities.filter((city) => {
      const cityLower = city.name.toLowerCase();
      const stateLower = city.state.toLowerCase();
      const zipLower = city.zipCode.toLowerCase();

      return tokens.every(
        (t) =>
          cityLower.includes(t) ||
          stateLower.startsWith(t) ||
          zipLower.includes(t)
      );
    });
  }, [allCities, searchInput]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (cityName: string) => {
    onSelectCity(cityName);
    setSearchInput("");
    setIsOpen(false);
    onNotify(`📍 Hub center adjusted to ${cityName}! Distances updated.`);
  };

  const handleAddCustom = () => {
    const query = searchInput.trim();
    if (!query) return;

    const parts = query.split(",");
    const cityNameInput = parts[0].trim();
    const stateNameInput = parts[1] ? parts[1].trim().toUpperCase() : "TX";

    // Check if it already matches existing city
    const existing = allCities.find(
      (c) => c.name.toLowerCase() === cityNameInput.toLowerCase()
    );

    if (existing) {
      handleSelect(existing.name);
      return;
    }

    const formattedName =
      cityNameInput.charAt(0).toUpperCase() + cityNameInput.slice(1);
    const newCity: CityData = {
      name: formattedName,
      state: stateNameInput,
      zipCode: Math.floor(10000 + Math.random() * 90000).toString(),
      lat: 30.2672 + (Math.random() - 0.5) * 1.5,
      lng: -97.7431 + (Math.random() - 0.5) * 1.5,
    };

    onAddCustomCity(newCity);
    setSearchInput("");
    setIsOpen(false);
    onNotify(`✨ New location "${formattedName}, ${stateNameInput}" added! Hub centered.`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) =>
        prev < filteredCities.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredCities.length) {
        handleSelect(filteredCities[highlightedIndex].name);
      } else if (filteredCities.length === 1) {
        handleSelect(filteredCities[0].name);
      } else if (searchInput.trim()) {
        handleAddCustom();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const isCentralTime = activeCity
    ? ["TX", "IL", "MO", "MN", "TN", "OK", "KS", "WI"].includes(activeCity.state)
    : false;

  return (
    <div className="space-y-2 md:col-span-1" ref={containerRef}>
      {/* Label and Active Center Header */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          Active City Hub
        </label>
        <span
          className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-2 py-0.5 rounded-full"
          title="Preferred coverage in Central Time Zone"
        >
          {isCentralTime ? "⭐ Central Time (CT)" : "⭐ Active Zone"}
        </span>
      </div>

      {/* Active City Pill Banner */}
      <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200/80 rounded-xl px-3 py-1.5 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-extrabold text-amber-950 truncate">
            {activeCity ? `${activeCity.name}, ${activeCity.state}` : currentCityName}
          </span>
          {activeCity?.zipCode && (
            <span className="text-[10px] font-mono text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-200 shrink-0">
              ZIP {activeCity.zipCode}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="text-[11px] font-black text-amber-800 hover:text-amber-950 flex items-center gap-0.5 cursor-pointer shrink-0 ml-1.5"
          id="toggle-city-search-btn"
        >
          <span>Change</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Instant Interactive City Search Input with 0-Lag Local State */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type any city or ZIP (e.g. Austin, Dallas, 75201)..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="w-full bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-200 hover:border-amber-400 focus:border-amber-500 rounded-xl pl-9 pr-24 py-2 text-xs font-medium text-zinc-900 focus:outline-hidden transition shadow-2xs placeholder:text-zinc-400"
            id="custom-city-blank-search-bar"
            autoComplete="off"
          />

          <div className="absolute right-1.5 flex items-center gap-1">
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setHighlightedIndex(-1);
                  inputRef.current?.focus();
                }}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-md text-xs cursor-pointer"
                title="Clear input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <VoiceInputButton
              onTranscript={(spoken) => {
                if (!spoken.trim()) return;
                setSearchInput(spoken.trim());
                setIsOpen(true);
                setHighlightedIndex(0);
              }}
              size="xs"
              title="Speak city or ZIP code"
            />

            <button
              type="button"
              onClick={handleAddCustom}
              disabled={!searchInput.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-[11px] px-2.5 py-1 rounded-lg transition cursor-pointer shadow-3xs"
            >
              Go
            </button>
          </div>
        </div>

        {/* Live Autocomplete Suggestions Overlay */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-zinc-200 rounded-2xl shadow-xl z-40 overflow-hidden max-h-64 overflow-y-auto divide-y divide-zinc-100">
            <div className="bg-zinc-50 px-3 py-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>
                {searchInput.trim()
                  ? `Matching Locations (${filteredCities.length})`
                  : "Indexed Hubs (Top Cities)"}
              </span>
              <span className="text-[9px] text-zinc-400 font-normal">Press Enter to select</span>
            </div>

            {filteredCities.length > 0 ? (
              filteredCities.map((city, idx) => {
                const isSelected = city.name.toLowerCase() === currentCityName.toLowerCase();
                const isHighlighted = idx === highlightedIndex;
                const isCentral = ["TX", "IL", "MO", "MN", "TN", "OK", "KS", "WI"].includes(city.state);

                return (
                  <button
                    key={`${city.zipCode}-${city.name}`}
                    type="button"
                    onClick={() => handleSelect(city.name)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between transition cursor-pointer text-xs ${
                      isHighlighted
                        ? "bg-amber-50 text-amber-950"
                        : isSelected
                        ? "bg-amber-100/50 text-amber-950 font-bold"
                        : "hover:bg-zinc-50 text-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-amber-600" : "text-zinc-400"}`} />
                      <span className="font-semibold">{city.name}, {city.state}</span>
                      <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1 rounded">
                        {city.zipCode}
                      </span>
                      {isCentral && (
                        <span className="text-[9px] text-amber-800 bg-amber-50 border border-amber-200 px-1 rounded hidden sm:inline">
                          Central (CT)
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center space-y-2">
                <p className="text-xs text-zinc-500">
                  No predefined metro found for "{searchInput}"
                </p>
                <button
                  type="button"
                  onClick={handleAddCustom}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add & Center on "{searchInput.trim()}"</span>
                </button>
              </div>
            )}

            {/* Quick action to add custom city if search query is entered and doesn't exactly match */}
            {searchInput.trim() &&
              filteredCities.length > 0 &&
              !filteredCities.some((c) => c.name.toLowerCase() === searchInput.trim().toLowerCase()) && (
                <div className="p-2 bg-amber-50/50 border-t border-amber-100">
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    className="w-full text-left text-xs text-amber-900 hover:text-amber-950 font-bold px-2 py-1.5 rounded-lg hover:bg-amber-100/80 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Or center custom coordinates on "{searchInput.trim()}"</span>
                  </button>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Quick 1-Tap Popular City Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 pt-0.5 scrollbar-none">
        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 mr-1">
          Quick:
        </span>
        {POPULAR_HUBS.map((hub) => {
          const isSelected = hub.name.toLowerCase() === currentCityName.toLowerCase();
          return (
            <button
              key={hub.name}
              type="button"
              onClick={() => handleSelect(hub.name)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition cursor-pointer border ${
                isSelected
                  ? "bg-amber-600 text-white border-amber-600 shadow-2xs font-black"
                  : "bg-white hover:bg-amber-50 text-zinc-700 hover:text-zinc-900 border-zinc-200"
              }`}
            >
              {hub.name}
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default CityHubSearchBox;
