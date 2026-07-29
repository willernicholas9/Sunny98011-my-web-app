import React, { useState, useMemo } from "react";
import { Project, Bid, CityData } from "../types";
import { MapPin, ToggleLeft, ToggleRight, X, ArrowUpRight, DollarSign, Compass, Layers, ListFilter, HelpCircle, HardHat, Calendar } from "lucide-react";
import { CITIES } from "../data/cities";

interface GoogleMapsDirectoryProps {
  projects: Project[];
  bids: Bid[];
  allCities: CityData[];
  onClose: () => void;
  onSelectProject: (projectId: string) => void;
}

export default function GoogleMapsDirectory({
  projects,
  bids,
  allCities,
  onClose,
  onSelectProject,
}: GoogleMapsDirectoryProps) {
  const [filterType, setFilterType] = useState<"all" | "bidding" | "ongoing">("all");
  const [budgetFilter, setBudgetFilter] = useState<"all" | "under_500" | "500_to_1000" | "1000_to_5000" | "5000_plus">("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<"satellite" | "street">("street");
  const [searchCityQuery, setSearchCityQuery] = useState("");

  // Filter projects by stage and budget
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Filter out completed projects
      if (p.status === "completed") return false;

      // Filter by stage
      if (filterType === "bidding") {
        return p.status === "open" || p.status === "bid_placed";
      }
      if (filterType === "ongoing") {
        return p.status === "accepted";
      }
      return true; // "all"
    }).filter((p) => {
      // Filter by budget range bracket
      if (budgetFilter === "under_500") {
        return p.budget < 500;
      }
      if (budgetFilter === "500_to_1000") {
        return p.budget >= 500 && p.budget <= 1000;
      }
      if (budgetFilter === "1000_to_5000") {
        return p.budget > 1000 && p.budget <= 5000;
      }
      if (budgetFilter === "5000_plus") {
        return p.budget > 5000;
      }
      return true; // "all"
    }).filter((p) => {
      // Search filter
      if (!searchCityQuery) return true;
      return (
        p.city.toLowerCase().includes(searchCityQuery.toLowerCase()) ||
        p.title.toLowerCase().includes(searchCityQuery.toLowerCase())
      );
    });
  }, [projects, filterType, budgetFilter, searchCityQuery]);

  // Selected project details
  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  // Group cities coordinates bounds for displaying on map
  const activeCluster = useMemo(() => {
    // Determine which cluster is active based on the projects we have
    // E.g., Texas Cluster, California Cluster, Illinois Cluster
    if (filteredProjects.length === 0) return { latMin: 29, latMax: 43, lngMin: -122, lngMax: -85 };

    let lats = filteredProjects.map((p) => {
      const city = allCities.find((c) => c.name.toLowerCase() === p.city.toLowerCase()) || allCities[0];
      return city.lat;
    });
    let lngs = filteredProjects.map((p) => {
      const city = allCities.find((c) => c.name.toLowerCase() === p.city.toLowerCase()) || allCities[0];
      return city.lng;
    });

    return {
      latMin: Math.min(...lats) - 0.8,
      latMax: Math.max(...lats) + 0.8,
      lngMin: Math.min(...lngs) - 1.2,
      lngMax: Math.max(...lngs) + 1.2,
    };
  }, [filteredProjects, allCities]);

  // Convert lat/lng to visual SVG viewbox percentage coordinates
  const getCoordinates = (lat: number, lng: number) => {
    const latRange = activeCluster.latMax - activeCluster.latMin;
    const lngRange = activeCluster.lngMax - activeCluster.lngMin;

    // Standard map projection flip for latitude
    const yPercent = 100 - ((lat - activeCluster.latMin) / (latRange || 1)) * 100;
    const xPercent = ((lng - activeCluster.lngMin) / (lngRange || 1)) * 100;

    return {
      x: Math.min(95, Math.max(5, xPercent)),
      y: Math.min(95, Math.max(5, yPercent)),
    };
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in" id="google-maps-directory-overlay">
      <div className="bg-white max-w-6xl w-full h-[85vh] rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="p-4 border-b border-zinc-150 bg-zinc-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 p-2 rounded-xl text-white">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-base text-zinc-900 leading-none">
                Interactive Google Map Job Directory
              </h2>
              <p className="text-[10px] text-zinc-500 font-medium mt-1 uppercase tracking-wider">
                Plotting live bidding stage & ongoing service contracts
              </p>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex gap-4 text-xs font-semibold shrink-0">
            <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Bidding: {projects.filter(p => p.status === "open" || p.status === "bid_placed").length} Stage</span>
            </div>
            <div className="px-3 py-1.5 bg-sky-50 border border-sky-200 text-sky-900 rounded-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              <span>Ongoing: {projects.filter(p => p.status === "accepted").length} Active</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 rounded-xl transition cursor-pointer"
            id="close-maps-directory-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dashboard Grid Workspace */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Sidebar controls & listing list */}
          <div className="w-full md:w-80 border-r border-zinc-150 flex flex-col bg-zinc-50/50 overflow-y-auto shrink-0">
            {/* Filters bar */}
            <div className="p-4 space-y-4 border-b border-zinc-150">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                  Search Map Locations
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search city, trade or job title..."
                    value={searchCityQuery}
                    onChange={(e) => setSearchCityQuery(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden text-zinc-800"
                  />
                  {searchCityQuery && (
                    <button
                      onClick={() => setSearchCityQuery("")}
                      className="absolute right-2.5 top-2.5 text-zinc-450 hover:text-zinc-700 text-xs font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Status filter selection tabs */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block flex items-center gap-1">
                  <ListFilter className="w-3 h-3" /> Filter by Job Stage
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 rounded-xl text-[11px] font-bold">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`py-1.5 rounded-lg text-center transition ${
                      filterType === "all" ? "bg-white text-zinc-900 shadow-3xs" : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    All Active
                  </button>
                  <button
                    onClick={() => setFilterType("bidding")}
                    className={`py-1.5 rounded-lg text-center transition ${
                      filterType === "bidding" ? "bg-white text-zinc-900 shadow-3xs" : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    Bidding
                  </button>
                  <button
                    onClick={() => setFilterType("ongoing")}
                    className={`py-1.5 rounded-lg text-center transition ${
                      filterType === "ongoing" ? "bg-white text-zinc-900 shadow-3xs" : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    Ongoing
                  </button>
                </div>
              </div>

              {/* Budget Range Filter Dropdown */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="budget-filter-select" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-600" /> Filter by Budget Range
                  </label>
                  {budgetFilter !== "all" && (
                    <button
                      onClick={() => setBudgetFilter("all")}
                      className="text-[10px] text-amber-600 hover:text-amber-700 font-extrabold cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <select
                  id="budget-filter-select"
                  data-testid="budget-filter-select"
                  value={budgetFilter}
                  onChange={(e) => setBudgetFilter(e.target.value as any)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 focus:ring-1 focus:ring-amber-500 focus:outline-hidden cursor-pointer shadow-3xs"
                >
                  <option value="all">All Budget Brackets</option>
                  <option value="under_500">Under $500</option>
                  <option value="500_to_1000">$500 – $1,000</option>
                  <option value="1000_to_5000">$1,000 – $5,000</option>
                  <option value="5000_plus">$5,000+ (Premium Jobs)</option>
                </select>
              </div>
            </div>

            {/* List entries */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                Matched Listings ({filteredProjects.length})
              </div>

              {filteredProjects.length === 0 ? (
                <div className="text-center py-10 px-4 text-zinc-400 italic text-xs">
                  No matches found for the selected map parameters.
                </div>
              ) : (
                filteredProjects.map((proj) => {
                  const isActive = selectedProjectId === proj.id;
                  const bidCount = bids.filter(b => b.projectId === proj.id).length;
                  const isOngoing = proj.status === "accepted";

                  return (
                    <button
                      key={proj.id}
                      onClick={() => setSelectedProjectId(proj.id)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                        isActive
                          ? "bg-amber-500/10 border-amber-500 shadow-xs"
                          : "bg-white border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-display font-bold text-xs text-zinc-900 line-clamp-1 leading-tight flex-1">
                          {proj.title}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 leading-none ${
                          isOngoing ? "bg-sky-100 text-sky-850" : "bg-amber-100 text-amber-850"
                        }`}>
                          {isOngoing ? "Ongoing" : "Bidding"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-zinc-500">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-zinc-400" />
                          {proj.city}, {proj.state}
                        </span>
                        <span className="font-bold text-zinc-700">
                          ${proj.budget.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-1.5 border-t border-zinc-100 text-[9px] font-mono font-medium text-zinc-400">
                        <span>Bids Placed: {bidCount}</span>
                        <span className="text-amber-700 font-semibold uppercase font-sans">
                          Details ➔
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Map Viewer Sandbox */}
          <div className="flex-1 bg-zinc-100 relative flex flex-col justify-between overflow-hidden">
            
            {/* Map Mode Buttons & Active Filter Badge overlay */}
            <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
              <div className="bg-white p-1 rounded-xl shadow-md border border-zinc-200 flex gap-1 text-[10px] font-bold select-none">
                <button
                  onClick={() => setMapMode("street")}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                    mapMode === "street" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Map View</span>
                </button>
                <button
                  onClick={() => setMapMode("satellite")}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                    mapMode === "satellite" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  <span>Satellite View</span>
                </button>
              </div>

              {budgetFilter !== "all" && (
                <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl shadow-md text-[10px] font-extrabold flex items-center gap-1.5 animate-in fade-in duration-150">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>
                    Budget: {
                      budgetFilter === "under_500" ? "< $500" :
                      budgetFilter === "500_to_1000" ? "$500 – $1,000" :
                      budgetFilter === "1000_to_5000" ? "$1,000 – $5,000" : "$5,000+"
                    }
                  </span>
                  <button
                    onClick={() => setBudgetFilter("all")}
                    className="hover:bg-emerald-700 p-0.5 rounded-md ml-0.5 cursor-pointer"
                    title="Clear budget filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Interactive SVG Radar-Grid representing the Google Map surface */}
            <div className="flex-1 relative overflow-hidden" id="google-maps-svg-surface">
              
              {/* Map background based on mode */}
              <div className={`absolute inset-0 transition-colors duration-300 ${
                mapMode === "satellite"
                  ? "bg-zinc-900 bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:24px_24px]"
                  : "bg-blue-50 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px]"
              }`}>
                {/* Visual Rivers / Coastal outlines for premium Google Map aesthetics */}
                <svg className="absolute inset-0 w-full h-full opacity-35" pointerEvents="none">
                  <path d="M -100 200 C 300 250, 400 500, 1200 450" fill="none" stroke={mapMode === "satellite" ? "#0f172a" : "#93c5fd"} strokeWidth="15" />
                  <path d="M 150 -100 C 320 200, 200 600, 800 900" fill="none" stroke={mapMode === "satellite" ? "#0f172a" : "#93c5fd"} strokeWidth="8" />
                  <circle cx="50%" cy="50%" r="280" fill="none" stroke={mapMode === "satellite" ? "#1e293b" : "#cbd5e1"} strokeWidth="0.75" strokeDasharray="5 5" />
                  <circle cx="50%" cy="50%" r="140" fill="none" stroke={mapMode === "satellite" ? "#1e293b" : "#cbd5e1"} strokeWidth="0.75" strokeDasharray="5 5" />
                </svg>
              </div>

              {/* Dynamic Plotted Pin Markers */}
              {filteredProjects.map((proj) => {
                const city = allCities.find((c) => c.name.toLowerCase() === proj.city.toLowerCase()) || allCities[0];
                const coords = getCoordinates(city.lat, city.lng);
                const isOngoing = proj.status === "accepted";
                const isSelected = selectedProjectId === proj.id;
                const isNearTop = coords.y < 28;

                return (
                  <div
                    key={proj.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                    style={{
                      left: `${coords.x}%`,
                      top: `${coords.y}%`,
                      zIndex: isSelected ? 40 : hoveredProjectId === proj.id ? 35 : 10,
                    }}
                  >
                    <button
                      id={`map-marker-${proj.id}`}
                      data-testid={`project-marker-${proj.id}`}
                      onClick={() => setSelectedProjectId(proj.id)}
                      onMouseEnter={() => setHoveredProjectId(proj.id)}
                      onMouseLeave={() => setHoveredProjectId(null)}
                      className="group relative flex flex-col items-center cursor-pointer"
                      title={`${proj.title} • Budget: $${proj.budget.toLocaleString()}`}
                    >
                      {/* Dynamic Hover Tooltip showing Title & Budget */}
                      {!isSelected && (
                        <div
                          className={`absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-150 min-w-[220px] max-w-[280px] ${
                            isNearTop ? "top-full mt-2.5" : "bottom-full mb-2.5"
                          } ${
                            hoveredProjectId === proj.id
                              ? "opacity-100 scale-100 translate-y-0 block"
                              : "opacity-0 scale-95 hidden group-hover:block group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
                          }`}
                          data-testid={`tooltip-${proj.id}`}
                        >
                          {/* Top arrow if positioned below marker (near top of map) */}
                          {isNearTop && (
                            <div className="w-2.5 h-2.5 bg-zinc-900 border-l border-t border-zinc-700/80 transform rotate-45 -mb-1.5 mx-auto"></div>
                          )}

                          <div className="bg-zinc-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-zinc-700/80 text-left space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-400/15 px-1.5 py-0.5 rounded-md border border-amber-400/20">
                                {proj.city}, {proj.state}
                              </span>
                              <span className="text-xs font-black text-emerald-400 font-mono shrink-0">
                                ${proj.budget.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-start gap-2.5">
                              {proj.images && proj.images.length > 0 && proj.images[0] && (
                                <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-zinc-700 bg-zinc-800 shadow-sm">
                                  <img
                                    src={proj.images[0]}
                                    alt={proj.title}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold font-display text-white line-clamp-2 leading-snug">
                                  {proj.title}
                                </p>
                                <p className="text-[10px] text-zinc-400 mt-0.5 capitalize truncate">
                                  {proj.type === "home" ? "🏠 Residential" : "🏢 Commercial"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[9px] text-zinc-400 pt-1.5 border-t border-zinc-800/80">
                              <span className="flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${isOngoing ? "bg-sky-400 animate-pulse" : "bg-amber-400"}`}></span>
                                {isOngoing ? "Ongoing Contract" : "Open for Bidding"}
                              </span>
                              <span className="text-amber-400 font-bold shrink-0">View details ➔</span>
                            </div>
                          </div>

                          {/* Bottom arrow if positioned above marker (standard position) */}
                          {!isNearTop && (
                            <div className="w-2.5 h-2.5 bg-zinc-900 border-r border-b border-zinc-700/80 transform rotate-45 -mt-1.5 mx-auto"></div>
                          )}
                        </div>
                      )}

                      {/* Interactive Radar Ring */}
                      {isSelected && (
                        <span className={`absolute -inset-2.5 rounded-full animate-ping opacity-60 ${
                          isOngoing ? "bg-sky-400" : "bg-amber-400"
                        }`} />
                      )}

                      {/* Styled Location Pin */}
                      <div className={`p-2 rounded-full border shadow-md transition-all scale-100 group-hover:scale-110 flex items-center justify-center ${
                        isSelected 
                          ? "bg-zinc-950 border-white text-white scale-110" 
                          : isOngoing 
                            ? "bg-sky-500 border-white text-white" 
                            : "bg-amber-500 border-white text-white"
                      }`}>
                        <MapPin className="w-4 h-4 fill-current" />
                      </div>

                      {/* Hover / Selection Badge */}
                      <span className={`mt-1 text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm border whitespace-nowrap uppercase tracking-wider transition ${
                        isSelected 
                          ? "bg-zinc-900 border-zinc-700 text-white font-black opacity-100" 
                          : "bg-white border-zinc-200 text-zinc-700 group-hover:opacity-100 opacity-60 font-semibold"
                      }`}>
                        {proj.city} - ${proj.budget}
                      </span>
                    </button>
                  </div>
                );
              })}

              {/* InfoWindow popup panel */}
              {selectedProject && (
                (() => {
                  const matchedCity = allCities.find((c) => c.name.toLowerCase() === selectedProject.city.toLowerCase()) || allCities[0];
                  const coords = getCoordinates(matchedCity.lat, matchedCity.lng);
                  const isOngoing = selectedProject.status === "accepted";
                  const totalBids = bids.filter(b => b.projectId === selectedProject.id).length;

                  // External Google Maps directions url linking with actual coordinate parameters
                  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${selectedProject.title}, ${selectedProject.city}, ${selectedProject.state} ${selectedProject.zipCode}`
                  )}`;

                  return (
                    <div
                      className="absolute z-30 bg-white rounded-2xl border border-zinc-200 shadow-2xl p-4 w-72 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-150"
                      style={{
                        left: `calc(${coords.x}% - 144px)`,
                        top: `calc(${coords.y}% - 225px)`,
                        // Avoid sliding out of bounds on map margins
                        transform: "translateY(-10px)",
                      }}
                    >
                      {/* Popup Arrow */}
                      <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-zinc-200 rotate-45"></div>

                      <div className="flex justify-between items-start gap-1">
                        <span className={`text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded uppercase font-mono ${
                          isOngoing ? "bg-sky-50 border border-sky-200 text-sky-850" : "bg-amber-50 border border-amber-200 text-amber-850"
                        }`}>
                          {isOngoing ? "🤝 Ongoing / Active" : "⌛ Bidding / Hiring"}
                        </span>
                        <button
                          onClick={() => setSelectedProjectId(null)}
                          className="text-zinc-400 hover:text-zinc-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-display font-extrabold text-xs text-zinc-900 leading-tight">
                          {selectedProject.title}
                        </h4>
                        <p className="text-[10px] text-zinc-500 line-clamp-2">
                          {selectedProject.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-zinc-50 border border-zinc-100 p-2 rounded-xl">
                        <div>
                          <span className="block text-zinc-400 font-semibold uppercase text-[8px]">Budget Offer</span>
                          <span className="font-extrabold text-emerald-800">${selectedProject.budget.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block text-zinc-400 font-semibold uppercase text-[8px]">Offers Logged</span>
                          <span className="font-bold text-zinc-700">{totalBids} bids</span>
                        </div>
                        <div className="col-span-2 border-t border-zinc-150 pt-1 flex items-center gap-1 text-zinc-505">
                          <MapPin className="w-3 h-3 text-zinc-400" />
                          <span>{selectedProject.city}, {selectedProject.state} ({matchedCity.zipCode})</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-900 rounded-xl py-1.5 text-[10px] font-bold text-center flex items-center justify-center gap-1"
                        >
                          <span>Directions</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        </a>
                        <button
                          onClick={() => {
                            onSelectProject(selectedProject.id);
                            onClose();
                          }}
                          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 text-[10px] rounded-xl text-center"
                        >
                          View App Post
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}

            </div>

            {/* Bottom Help Legend Bar */}
            <div className="p-3 bg-zinc-900 text-white text-[10px] font-medium flex flex-wrap justify-between items-center gap-2 border-t border-zinc-800 z-10">
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Google Map Data Live Layers Integration</span>
              </span>
              <div className="flex gap-4 shrink-0">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Bidding Stage (Open / Pitching)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                  <span>Ongoing Jobs (Mutually Matched)</span>
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
