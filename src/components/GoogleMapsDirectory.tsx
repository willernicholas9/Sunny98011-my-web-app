import React, { useState, useMemo } from "react";
import { Project, Bid, CityData } from "../types";
import { 
  MapPin, 
  X, 
  ArrowUpRight, 
  DollarSign, 
  Compass, 
  Layers, 
  ListFilter, 
  Grid3X3, 
  Building2, 
  Sparkles, 
  ChevronRight, 
  Layers2,
  HardHat,
  Tag
} from "lucide-react";
import { findCity } from "../data/cities";

interface GoogleMapsDirectoryProps {
  projects: Project[];
  bids: Bid[];
  allCities: CityData[];
  onClose: () => void;
  onSelectProject: (projectId: string) => void;
}

export interface ProjectCluster {
  id: string;
  key: string;
  city: string;
  state: string;
  zipCode?: string;
  lat: number;
  lng: number;
  projects: Project[];
  totalBudget: number;
  biddingCount: number;
  ongoingCount: number;
  statusType: "all_bidding" | "all_ongoing" | "mixed";
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
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null);
  const [activeClusterDetailId, setActiveClusterDetailId] = useState<string | null>(null);
  const [clusterGrouping, setClusterGrouping] = useState<"city" | "zip">("city");
  const [enableClustering, setEnableClustering] = useState<boolean>(true);
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
      const query = searchCityQuery.toLowerCase();
      return (
        p.city.toLowerCase().includes(query) ||
        p.title.toLowerCase().includes(query) ||
        (p.zipCode && p.zipCode.includes(query)) ||
        p.state.toLowerCase().includes(query)
      );
    });
  }, [projects, filterType, budgetFilter, searchCityQuery]);

  // Generate Clusters from Filtered Projects
  const clusters = useMemo<ProjectCluster[]>(() => {
    if (!enableClustering) {
      // Return 1 cluster per project (unclustered individual mode)
      return filteredProjects.map((p) => {
        const cityData = allCities.find((c) => c.name.toLowerCase() === p.city.toLowerCase()) || findCity(p.city) || allCities[0];
        const isOngoing = p.status === "accepted";
        return {
          id: `single-${p.id}`,
          key: p.id,
          city: p.city,
          state: p.state,
          zipCode: p.zipCode,
          lat: cityData.lat,
          lng: cityData.lng,
          projects: [p],
          totalBudget: p.budget,
          biddingCount: isOngoing ? 0 : 1,
          ongoingCount: isOngoing ? 1 : 0,
          statusType: isOngoing ? "all_ongoing" : "all_bidding",
        };
      });
    }

    const groupMap = new Map<string, Project[]>();

    filteredProjects.forEach((p) => {
      const groupKey = clusterGrouping === "zip" && p.zipCode
        ? `${p.zipCode.trim()}`
        : `${p.city.toLowerCase().trim()}_${p.state.toLowerCase().trim()}`;
      
      const existing = groupMap.get(groupKey) || [];
      existing.push(p);
      groupMap.set(groupKey, existing);
    });

    const result: ProjectCluster[] = [];

    groupMap.forEach((projs, key) => {
      const first = projs[0];
      const cityData = allCities.find((c) => c.name.toLowerCase() === first.city.toLowerCase()) || findCity(first.city) || allCities[0];
      const totalBudget = projs.reduce((sum, item) => sum + item.budget, 0);
      const biddingCount = projs.filter((item) => item.status === "open" || item.status === "bid_placed").length;
      const ongoingCount = projs.filter((item) => item.status === "accepted").length;

      let statusType: "all_bidding" | "all_ongoing" | "mixed" = "mixed";
      if (biddingCount > 0 && ongoingCount === 0) statusType = "all_bidding";
      if (ongoingCount > 0 && biddingCount === 0) statusType = "all_ongoing";

      result.push({
        id: `cluster-${key}`,
        key,
        city: first.city,
        state: first.state,
        zipCode: first.zipCode,
        lat: cityData.lat,
        lng: cityData.lng,
        projects: projs,
        totalBudget,
        biddingCount,
        ongoingCount,
        statusType,
      });
    });

    // Sort by largest clusters first
    return result.sort((a, b) => b.projects.length - a.projects.length);
  }, [filteredProjects, enableClustering, clusterGrouping, allCities]);

  // Selected project details
  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  // Active Cluster selected for inspection drawer
  const activeClusterDetail = useMemo(() => {
    if (!activeClusterDetailId) return null;
    return clusters.find((c) => c.id === activeClusterDetailId) || null;
  }, [clusters, activeClusterDetailId]);

  // Cluster density calculations
  const densityStats = useMemo(() => {
    const multiProjectClusters = clusters.filter((c) => c.projects.length > 1);
    const topCluster = clusters[0];
    return {
      totalClusters: clusters.length,
      multiProjectCount: multiProjectClusters.length,
      topHubName: topCluster ? `${topCluster.city}, ${topCluster.state}` : "None",
      topHubVolume: topCluster ? topCluster.projects.length : 0,
    };
  }, [clusters]);

  // Group cities coordinates bounds for displaying on map
  const activeClusterBounds = useMemo(() => {
    if (filteredProjects.length === 0) return { latMin: 29, latMax: 43, lngMin: -122, lngMax: -85 };

    const lats = filteredProjects.map((p) => {
      const city = allCities.find((c) => c.name.toLowerCase() === p.city.toLowerCase()) || findCity(p.city) || allCities[0];
      return city.lat;
    });
    const lngs = filteredProjects.map((p) => {
      const city = allCities.find((c) => c.name.toLowerCase() === p.city.toLowerCase()) || findCity(p.city) || allCities[0];
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
    const latRange = activeClusterBounds.latMax - activeClusterBounds.latMin;
    const lngRange = activeClusterBounds.lngMax - activeClusterBounds.lngMin;

    // Standard map projection flip for latitude
    const yPercent = 100 - ((lat - activeClusterBounds.latMin) / (latRange || 1)) * 100;
    const xPercent = ((lng - activeClusterBounds.lngMin) / (lngRange || 1)) * 100;

    return {
      x: Math.min(94, Math.max(6, xPercent)),
      y: Math.min(94, Math.max(6, yPercent)),
    };
  };

  // Find cluster that contains the currently selected project
  const selectedProjectCluster = useMemo(() => {
    if (!selectedProjectId) return null;
    return clusters.find((c) => c.projects.some((p) => p.id === selectedProjectId));
  }, [clusters, selectedProjectId]);

  return (
    <div className="fixed inset-0 bg-zinc-950/70 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs animate-fade-in" id="google-maps-directory-overlay">
      <div className="bg-white max-w-6xl w-full h-[90vh] sm:h-[86vh] rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-150 bg-zinc-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 p-2 rounded-xl text-white shadow-xs">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-sm sm:text-base text-zinc-900 leading-none">
                  Interactive Google Map Directory
                </h2>
                {enableClustering && (
                  <span className="hidden sm:inline-flex items-center gap-1 bg-amber-500/15 text-amber-900 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <Grid3X3 className="w-2.5 h-2.5" /> High-Density Clustering Active
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-500 font-medium mt-1 uppercase tracking-wider">
                Plotting {filteredProjects.length} projects across {clusters.length} regional clusters
              </p>
            </div>
          </div>

          {/* Quick Stats & Density Summary */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold shrink-0">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Top Hub: <strong>{densityStats.topHubName}</strong> ({densityStats.topHubVolume} jobs)</span>
            </div>

            <div className="px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Bidding: <strong>{projects.filter(p => p.status === "open" || p.status === "bid_placed").length}</strong></span>
            </div>

            <div className="px-2.5 py-1.5 bg-sky-50 border border-sky-200 text-sky-900 rounded-xl flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              <span>Ongoing: <strong>{projects.filter(p => p.status === "accepted").length}</strong></span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 rounded-xl transition cursor-pointer"
              id="close-maps-directory-btn"
              title="Close Map"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Grid Workspace */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Sidebar controls & listing list */}
          <div className="w-full md:w-80 border-r border-zinc-150 flex flex-col bg-zinc-50/50 overflow-y-auto shrink-0">
            
            {/* Filters bar */}
            <div className="p-3.5 sm:p-4 space-y-3.5 border-b border-zinc-150 bg-white/70">
              
              {/* Location search input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                  Search Map Locations
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search city, zip, or job..."
                    value={searchCityQuery}
                    onChange={(e) => setSearchCityQuery(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden text-zinc-800 shadow-3xs"
                  />
                  {searchCityQuery && (
                    <button
                      onClick={() => setSearchCityQuery("")}
                      className="absolute right-2.5 top-2 text-zinc-450 hover:text-zinc-700 text-xs font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Clustering Mode & Criteria Controls */}
              <div className="space-y-1.5 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-amber-950 uppercase tracking-wider flex items-center gap-1">
                    <Grid3X3 className="w-3 h-3 text-amber-600" /> High-Density Cluster
                  </label>
                  <button
                    onClick={() => setEnableClustering(!enableClustering)}
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md transition cursor-pointer ${
                      enableClustering
                        ? "bg-amber-600 text-white shadow-3xs"
                        : "bg-zinc-200 text-zinc-700"
                    }`}
                  >
                    {enableClustering ? "ON (Clustered)" : "OFF (Pins)"}
                  </button>
                </div>

                {enableClustering && (
                  <div className="flex items-center gap-1 pt-1 text-[10px] font-bold">
                    <span className="text-zinc-500 text-[9px] uppercase tracking-wider">Group By:</span>
                    <button
                      onClick={() => setClusterGrouping("city")}
                      className={`flex-1 py-1 px-1.5 rounded-lg text-center transition cursor-pointer text-[10px] ${
                        clusterGrouping === "city"
                          ? "bg-white text-amber-950 font-black shadow-3xs border border-amber-300"
                          : "text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      City Metro
                    </button>
                    <button
                      onClick={() => setClusterGrouping("zip")}
                      className={`flex-1 py-1 px-1.5 rounded-lg text-center transition cursor-pointer text-[10px] ${
                        clusterGrouping === "zip"
                          ? "bg-white text-amber-950 font-black shadow-3xs border border-amber-300"
                          : "text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      Zip Code
                    </button>
                  </div>
                )}
              </div>

              {/* Status filter selection tabs */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block flex items-center gap-1">
                  <ListFilter className="w-3 h-3" /> Filter by Job Stage
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 rounded-xl text-[11px] font-bold">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`py-1 rounded-lg text-center transition cursor-pointer ${
                      filterType === "all" ? "bg-white text-zinc-900 shadow-3xs" : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    All Active
                  </button>
                  <button
                    onClick={() => setFilterType("bidding")}
                    className={`py-1 rounded-lg text-center transition cursor-pointer ${
                      filterType === "bidding" ? "bg-white text-zinc-900 shadow-3xs" : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    Bidding
                  </button>
                  <button
                    onClick={() => setFilterType("ongoing")}
                    className={`py-1 rounded-lg text-center transition cursor-pointer ${
                      filterType === "ongoing" ? "bg-white text-zinc-900 shadow-3xs" : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    Ongoing
                  </button>
                </div>
              </div>

              {/* Budget Range Filter Dropdown */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="budget-filter-select" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-600" /> Filter by Budget
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
                  className="w-full bg-white border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-zinc-800 focus:ring-1 focus:ring-amber-500 focus:outline-hidden cursor-pointer shadow-3xs"
                >
                  <option value="all">All Budget Brackets</option>
                  <option value="under_500">Under $500</option>
                  <option value="500_to_1000">$500 – $1,000</option>
                  <option value="1000_to_5000">$1,000 – $5,000</option>
                  <option value="5000_plus">$5,000+ (Premium)</option>
                </select>
              </div>
            </div>

            {/* List entries */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                <span>Matched Listings ({filteredProjects.length})</span>
                <span>{clusters.length} Hubs</span>
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
                      onClick={() => {
                        setSelectedProjectId(proj.id);
                        // Also highlight cluster
                        const matchedClust = clusters.find((c) => c.projects.some((p) => p.id === proj.id));
                        if (matchedClust && matchedClust.projects.length > 1) {
                          setActiveClusterDetailId(matchedClust.id);
                        } else {
                          setActiveClusterDetailId(null);
                        }
                      }}
                      className={`w-full text-left p-2.5 rounded-2xl border transition-all flex flex-col gap-1 cursor-pointer ${
                        isActive
                          ? "bg-amber-500/15 border-amber-500 shadow-xs ring-1 ring-amber-500/40"
                          : "bg-white border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-display font-bold text-xs text-zinc-900 line-clamp-1 leading-tight flex-1">
                          {proj.title}
                        </span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 leading-none ${
                          isOngoing ? "bg-sky-100 text-sky-850" : "bg-amber-100 text-amber-850"
                        }`}>
                          {isOngoing ? "Ongoing" : "Bidding"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-zinc-500">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-zinc-400" />
                          {proj.city}, {proj.state} {proj.zipCode && `(${proj.zipCode})`}
                        </span>
                        <span className="font-bold text-emerald-800">
                          ${proj.budget.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-zinc-100 text-[9px] font-mono font-medium text-zinc-400">
                        <span>Bids Placed: {bidCount}</span>
                        <span className="text-amber-700 font-semibold uppercase font-sans flex items-center gap-0.5">
                          View on Map <ChevronRight className="w-2.5 h-2.5" />
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
            <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
              <div className="bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-md border border-zinc-200 flex gap-1 text-[10px] font-bold select-none">
                <button
                  onClick={() => setMapMode("street")}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                    mapMode === "street" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Map</span>
                </button>
                <button
                  onClick={() => setMapMode("satellite")}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                    mapMode === "satellite" ? "bg-zinc-950 text-white" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <Layers className="w-3 h-3 text-amber-500" />
                  <span>Satellite</span>
                </button>
              </div>

              {/* Cluster Mode Toggle Badge */}
              <button
                onClick={() => setEnableClustering(!enableClustering)}
                className="bg-white/90 backdrop-blur-md border border-zinc-200 text-zinc-800 px-2.5 py-1 rounded-xl shadow-md text-[10px] font-bold flex items-center gap-1.5 hover:bg-zinc-50 cursor-pointer"
                title="Toggle Cluster View"
              >
                <Grid3X3 className="w-3 h-3 text-amber-600" />
                <span>{enableClustering ? `Clusters: ${clusters.length}` : `Pins: ${filteredProjects.length}`}</span>
              </button>

              {budgetFilter !== "all" && (
                <div className="bg-emerald-600 text-white px-2.5 py-1 rounded-xl shadow-md text-[10px] font-extrabold flex items-center gap-1.5 animate-in fade-in duration-150">
                  <DollarSign className="w-3 h-3" />
                  <span>
                    {budgetFilter === "under_500" ? "< $500" :
                     budgetFilter === "500_to_1000" ? "$500–$1k" :
                     budgetFilter === "1000_to_5000" ? "$1k–$5k" : "$5k+"}
                  </span>
                  <button
                    onClick={() => setBudgetFilter("all")}
                    className="hover:bg-emerald-700 p-0.5 rounded-md ml-0.5 cursor-pointer"
                    title="Clear budget filter"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Interactive SVG Radar-Grid representing the Google Map surface */}
            <div className="flex-1 relative overflow-hidden select-none" id="google-maps-svg-surface">
              
              {/* Map background based on mode */}
              <div className={`absolute inset-0 transition-colors duration-300 ${
                mapMode === "satellite"
                  ? "bg-zinc-900 bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:24px_24px]"
                  : "bg-blue-50/80 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:24px_24px]"
              }`}>
                {/* Visual Rivers / Coastal outlines for premium Google Map aesthetics */}
                <svg className="absolute inset-0 w-full h-full opacity-35" pointerEvents="none">
                  <path d="M -100 200 C 300 250, 400 500, 1200 450" fill="none" stroke={mapMode === "satellite" ? "#0f172a" : "#93c5fd"} strokeWidth="15" />
                  <path d="M 150 -100 C 320 200, 200 600, 800 900" fill="none" stroke={mapMode === "satellite" ? "#0f172a" : "#93c5fd"} strokeWidth="8" />
                  <circle cx="50%" cy="50%" r="280" fill="none" stroke={mapMode === "satellite" ? "#1e293b" : "#cbd5e1"} strokeWidth="0.75" strokeDasharray="5 5" />
                  <circle cx="50%" cy="50%" r="140" fill="none" stroke={mapMode === "satellite" ? "#1e293b" : "#cbd5e1"} strokeWidth="0.75" strokeDasharray="5 5" />
                </svg>
              </div>

              {/* Dynamic Plotted Cluster Markers */}
              {clusters.map((cluster) => {
                const coords = getCoordinates(cluster.lat, cluster.lng);
                const isMulti = cluster.projects.length > 1;
                const isHovered = hoveredClusterId === cluster.id;
                const isDetailActive = activeClusterDetailId === cluster.id;
                const containsSelectedProject = selectedProjectId ? cluster.projects.some(p => p.id === selectedProjectId) : false;
                const isNearTop = coords.y < 28;
                const singleProj = cluster.projects[0];

                return (
                  <div
                    key={cluster.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                    style={{
                      left: `${coords.x}%`,
                      top: `${coords.y}%`,
                      zIndex: isDetailActive || containsSelectedProject ? 40 : isHovered ? 35 : 10,
                    }}
                  >
                    {/* ============================================================== */}
                    {/* CASE A: MULTI-PROJECT CLUSTER MARKER (HIGH DENSITY AGGREGATE) */}
                    {/* ============================================================== */}
                    {isMulti ? (
                      <div className="group relative flex flex-col items-center">
                        
                        {/* Hover Tooltip for Multi-Project Cluster */}
                        {!isDetailActive && !containsSelectedProject && (
                          <div
                            className={`absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-150 min-w-[240px] max-w-[300px] ${
                              isNearTop ? "top-full mt-3" : "bottom-full mb-3"
                            } ${
                              isHovered
                                ? "opacity-100 scale-100 translate-y-0 block"
                                : "opacity-0 scale-95 hidden group-hover:block group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
                            }`}
                            data-testid={`cluster-tooltip-${cluster.id}`}
                          >
                            {isNearTop && (
                              <div className="w-2.5 h-2.5 bg-zinc-900 border-l border-t border-zinc-700/80 transform rotate-45 -mb-1.5 mx-auto"></div>
                            )}

                            <div className="bg-zinc-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-zinc-700/80 text-left space-y-2">
                              <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-1.5">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                                  <Building2 className="w-3 h-3" /> {cluster.city}, {cluster.state} {cluster.zipCode && `(${cluster.zipCode})`}
                                </span>
                                <span className="text-[10px] font-black bg-amber-500 text-zinc-950 px-1.5 py-0.5 rounded-full font-mono">
                                  {cluster.projects.length} Jobs
                                </span>
                              </div>

                              <div className="space-y-1 max-h-36 overflow-y-auto">
                                {cluster.projects.slice(0, 3).map((p) => (
                                  <div key={p.id} className="text-[10px] flex items-center justify-between gap-2 bg-zinc-800/80 p-1.5 rounded-lg">
                                    <span className="font-medium text-zinc-200 truncate flex-1">{p.title}</span>
                                    <span className="font-bold text-emerald-400 font-mono shrink-0">${p.budget.toLocaleString()}</span>
                                  </div>
                                ))}
                                {cluster.projects.length > 3 && (
                                  <p className="text-[9px] text-zinc-400 italic text-center pt-0.5">
                                    +{cluster.projects.length - 3} more jobs in this area
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-[9px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                                <span className="text-emerald-400 font-bold font-mono">
                                  Total Pool: ${cluster.totalBudget.toLocaleString()}
                                </span>
                                <span className="text-amber-400 font-bold">Click cluster to explore ➔</span>
                              </div>
                            </div>

                            {!isNearTop && (
                              <div className="w-2.5 h-2.5 bg-zinc-900 border-r border-b border-zinc-700/80 transform rotate-45 -mt-1.5 mx-auto"></div>
                            )}
                          </div>
                        )}

                        <button
                          id={`cluster-marker-${cluster.id}`}
                          data-testid={`cluster-marker-${cluster.id}`}
                          onClick={() => {
                            setActiveClusterDetailId(cluster.id);
                            setSelectedProjectId(null);
                          }}
                          onMouseEnter={() => setHoveredClusterId(cluster.id)}
                          onMouseLeave={() => setHoveredClusterId(null)}
                          className="relative flex flex-col items-center cursor-pointer transition-transform duration-200 transform group-hover:scale-110"
                        >
                          {/* Pulsating Cluster Radar Halo */}
                          <span className={`absolute -inset-2 rounded-full animate-ping opacity-40 ${
                            cluster.statusType === "all_bidding"
                              ? "bg-amber-400"
                              : cluster.statusType === "all_ongoing"
                              ? "bg-sky-400"
                              : "bg-amber-500"
                          }`} />

                          {/* Clustered Bubble Marker */}
                          <div className={`relative p-2.5 rounded-2xl border-2 shadow-xl flex items-center justify-center gap-1.5 transition-all ${
                            isDetailActive || containsSelectedProject
                              ? "bg-zinc-950 border-amber-400 text-white ring-4 ring-amber-400/30 scale-110"
                              : cluster.statusType === "all_bidding"
                              ? "bg-gradient-to-br from-amber-500 to-amber-600 border-white text-white"
                              : cluster.statusType === "all_ongoing"
                              ? "bg-gradient-to-br from-sky-500 to-sky-600 border-white text-white"
                              : "bg-gradient-to-br from-amber-500 via-amber-600 to-sky-600 border-white text-white"
                          }`}>
                            <Grid3X3 className="w-4 h-4 shrink-0" />
                            <span className="font-display font-black text-xs leading-none">
                              {cluster.projects.length}
                            </span>
                          </div>

                          {/* Cluster Sub-Badge with City and Total Budget */}
                          <span className={`mt-1 text-[9px] font-black px-2 py-0.5 rounded-full shadow-md border whitespace-nowrap uppercase tracking-wider transition ${
                            isDetailActive || containsSelectedProject
                              ? "bg-zinc-900 border-amber-400 text-amber-300 opacity-100"
                              : "bg-white/95 border-zinc-300 text-zinc-800 opacity-90 group-hover:opacity-100"
                          }`}>
                            {cluster.city} • ${Math.round(cluster.totalBudget / 1000)}k pool
                          </span>
                        </button>
                      </div>
                    ) : (
                      /* ============================================================== */
                      /* CASE B: SINGLE-PROJECT PIN MARKER                              */
                      /* ============================================================== */
                      (() => {
                        const isOngoing = singleProj.status === "accepted";
                        const isSelected = selectedProjectId === singleProj.id;

                        return (
                          <div className="group relative flex flex-col items-center">
                            {/* Hover Tooltip for Single Project */}
                            {!isSelected && (
                              <div
                                className={`absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-150 min-w-[220px] max-w-[280px] ${
                                  isNearTop ? "top-full mt-2.5" : "bottom-full mb-2.5"
                                } ${
                                  isHovered
                                    ? "opacity-100 scale-100 translate-y-0 block"
                                    : "opacity-0 scale-95 hidden group-hover:block group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
                                }`}
                                data-testid={`tooltip-${singleProj.id}`}
                              >
                                {isNearTop && (
                                  <div className="w-2.5 h-2.5 bg-zinc-900 border-l border-t border-zinc-700/80 transform rotate-45 -mb-1.5 mx-auto"></div>
                                )}

                                <div className="bg-zinc-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-zinc-700/80 text-left space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-400/15 px-1.5 py-0.5 rounded-md border border-amber-400/20">
                                      {singleProj.city}, {singleProj.state}
                                    </span>
                                    <span className="text-xs font-black text-emerald-400 font-mono shrink-0">
                                      ${singleProj.budget.toLocaleString()}
                                    </span>
                                  </div>

                                  <div className="flex items-start gap-2">
                                    {singleProj.images && singleProj.images.length > 0 && singleProj.images[0] && (
                                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-zinc-700 bg-zinc-800">
                                        <img
                                          src={singleProj.images[0]}
                                          alt={singleProj.title}
                                          referrerPolicy="no-referrer"
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold font-display text-white line-clamp-2 leading-snug">
                                        {singleProj.title}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between text-[9px] text-zinc-400 pt-1.5 border-t border-zinc-800/80">
                                    <span className="flex items-center gap-1">
                                      <span className={`w-1.5 h-1.5 rounded-full ${isOngoing ? "bg-sky-400 animate-pulse" : "bg-amber-400"}`}></span>
                                      {isOngoing ? "Ongoing" : "Open Bid"}
                                    </span>
                                    <span className="text-amber-400 font-bold shrink-0">View details ➔</span>
                                  </div>
                                </div>

                                {!isNearTop && (
                                  <div className="w-2.5 h-2.5 bg-zinc-900 border-r border-b border-zinc-700/80 transform rotate-45 -mt-1.5 mx-auto"></div>
                                )}
                              </div>
                            )}

                            <button
                              id={`map-marker-${singleProj.id}`}
                              data-testid={`project-marker-${singleProj.id}`}
                              onClick={() => {
                                setSelectedProjectId(singleProj.id);
                                setActiveClusterDetailId(null);
                              }}
                              onMouseEnter={() => setHoveredClusterId(cluster.id)}
                              onMouseLeave={() => setHoveredClusterId(null)}
                              className="group relative flex flex-col items-center cursor-pointer"
                              title={`${singleProj.title} • Budget: $${singleProj.budget.toLocaleString()}`}
                            >
                              {isSelected && (
                                <span className={`absolute -inset-2.5 rounded-full animate-ping opacity-60 ${
                                  isOngoing ? "bg-sky-400" : "bg-amber-400"
                                }`} />
                              )}

                              <div className={`p-2 rounded-full border shadow-md transition-all scale-100 group-hover:scale-110 flex items-center justify-center ${
                                isSelected 
                                  ? "bg-zinc-950 border-white text-white scale-110" 
                                  : isOngoing 
                                    ? "bg-sky-500 border-white text-white" 
                                    : "bg-amber-500 border-white text-white"
                              }`}>
                                <MapPin className="w-4 h-4 fill-current" />
                              </div>

                              <span className={`mt-1 text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm border whitespace-nowrap uppercase tracking-wider transition ${
                                isSelected 
                                  ? "bg-zinc-900 border-zinc-700 text-white font-black opacity-100" 
                                  : "bg-white border-zinc-200 text-zinc-700 group-hover:opacity-100 opacity-60 font-semibold"
                              }`}>
                                {singleProj.city} - ${singleProj.budget}
                              </span>
                            </button>
                          </div>
                        );
                      })()
                    )}
                  </div>
                );
              })}

              {/* ============================================================== */}
              {/* CLUSTER EXPLORER DRAWER / OVERLAY                              */}
              {/* ============================================================== */}
              {activeClusterDetail && (
                <div 
                  className="absolute right-3 top-3 bottom-3 w-80 max-w-[calc(100%-24px)] bg-white/95 backdrop-blur-md rounded-3xl border border-zinc-200 shadow-2xl z-30 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-200"
                  id="cluster-detail-drawer"
                >
                  {/* Drawer Header */}
                  <div className="p-3.5 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-black">
                        <Grid3X3 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-display font-black text-sm text-white leading-tight">
                          {activeClusterDetail.city}, {activeClusterDetail.state}
                        </h3>
                        <p className="text-[10px] text-amber-300 font-mono">
                          {activeClusterDetail.projects.length} Projects • ${activeClusterDetail.totalBudget.toLocaleString()} Total
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveClusterDetailId(null)}
                      className="p-1 text-zinc-400 hover:text-white rounded-lg transition"
                      title="Close Cluster Explorer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Drawer Project List */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest px-1">
                      <span>Projects in Cluster</span>
                      <span className="text-zinc-600">{activeClusterDetail.zipCode ? `Zip: ${activeClusterDetail.zipCode}` : "Metro Area"}</span>
                    </div>

                    {activeClusterDetail.projects.map((proj) => {
                      const isOngoing = proj.status === "accepted";
                      const isSelected = selectedProjectId === proj.id;
                      const bidCount = bids.filter(b => b.projectId === proj.id).length;

                      return (
                        <div
                          key={proj.id}
                          className={`p-3 rounded-2xl border transition-all space-y-2 ${
                            isSelected
                              ? "bg-amber-50 border-amber-400 shadow-xs"
                              : "bg-white border-zinc-200 hover:border-zinc-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-display font-bold text-xs text-zinc-900 leading-snug line-clamp-1 flex-1">
                              {proj.title}
                            </h4>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase leading-none shrink-0 ${
                              isOngoing ? "bg-sky-100 text-sky-850" : "bg-amber-100 text-amber-850"
                            }`}>
                              {isOngoing ? "Ongoing" : "Bidding"}
                            </span>
                          </div>

                          <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">
                            {proj.description}
                          </p>

                          <div className="flex items-center justify-between text-[10px] bg-zinc-50 p-2 rounded-xl border border-zinc-100">
                            <div>
                              <span className="block text-[8px] uppercase font-bold text-zinc-400">Budget</span>
                              <span className="font-black text-emerald-800 font-mono">${proj.budget.toLocaleString()}</span>
                            </div>
                            <div className="text-right">
                              <span className="block text-[8px] uppercase font-bold text-zinc-400">Offers</span>
                              <span className="font-bold text-zinc-700">{bidCount} bids</span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => setSelectedProjectId(proj.id)}
                              className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold py-1 text-[10px] rounded-xl text-center transition"
                            >
                              Inspect Details
                            </button>
                            <button
                              onClick={() => {
                                onSelectProject(proj.id);
                                onClose();
                              }}
                              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-1 text-[10px] rounded-xl text-center transition shadow-3xs"
                            >
                              Open Job
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* SINGLE PROJECT INFOWINDOW POPUP PANEL                          */}
              {/* ============================================================== */}
              {selectedProject && !activeClusterDetail && (
                (() => {
                  const matchedCity = allCities.find((c) => c.name.toLowerCase() === selectedProject.city.toLowerCase()) || findCity(selectedProject.city) || allCities[0];
                  const coords = getCoordinates(matchedCity.lat, matchedCity.lng);
                  const isOngoing = selectedProject.status === "accepted";
                  const totalBids = bids.filter(b => b.projectId === selectedProject.id).length;

                  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${selectedProject.title}, ${selectedProject.city}, ${selectedProject.state} ${selectedProject.zipCode || matchedCity.zipCode}`
                  )}`;

                  return (
                    <div
                      className="absolute z-30 bg-white rounded-2xl border border-zinc-200 shadow-2xl p-4 w-72 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-150"
                      style={{
                        left: `calc(${coords.x}% - 144px)`,
                        top: `calc(${coords.y}% - 225px)`,
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
                          className="text-zinc-400 hover:text-zinc-600 p-0.5"
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
                          <span>{selectedProject.city}, {selectedProject.state} ({selectedProject.zipCode || matchedCity.zipCode})</span>
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
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Google Map Data Directory • {clusters.length} Active Regional Clusters</span>
              </span>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Bidding Stage</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                  <span>Ongoing Jobs</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-md bg-gradient-to-r from-amber-500 to-sky-500"></span>
                  <span>Multi-Project Cluster</span>
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

