import React, { useState, useMemo, useEffect } from "react";
import { Project, Bid, CityData, ContractorUser } from "../types";
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
  Flame,
  Star,
  ShieldCheck,
  Phone,
  Maximize2,
  Sliders,
  CheckCircle2,
  UserCheck,
  TrendingUp,
  Award
} from "lucide-react";
import { findCity } from "../data/cities";
import { INITIAL_CONTRACTORS } from "../data/mockData";

interface GoogleMapsDirectoryProps {
  projects: Project[];
  bids: Bid[];
  contractors?: ContractorUser[];
  currentCityName?: string;
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

export interface ContractorWithRating extends ContractorUser {
  avgRating: number;
  reviewCount: number;
}

export interface ContractorHeatmapCluster {
  id: string;
  key: string;
  neighborhood: string;
  zipCode: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  contractors: ContractorWithRating[];
  contractorCount: number;
  avgRating: number;
  totalReviews: number;
  topTrades: string[];
  densityLevel: "ultra" | "hotspot" | "high" | "moderate";
  heatRadius: number;
  intensityScore: number;
}

// Well-known neighborhood coordinates for Austin, TX
const AUSTIN_NEIGHBORHOOD_GEO: Record<string, { name: string; lat: number; lng: number }> = {
  "78701": { name: "Downtown & Capitol Corridor", lat: 30.2672, lng: -97.7431 },
  "78704": { name: "South Congress & Zilker", lat: 30.2450, lng: -97.7610 },
  "78702": { name: "East Austin Arts & Trades", lat: 30.2620, lng: -97.7180 },
  "78722": { name: "Mueller & Cherrywood", lat: 30.2980, lng: -97.7050 },
  "78751": { name: "Hyde Park & North Loop", lat: 30.3150, lng: -97.7260 },
  "78758": { name: "The Domain & Tech Center", lat: 30.4020, lng: -97.7250 },
  "78746": { name: "Westlake Hills & Estates", lat: 30.2780, lng: -97.8050 },
  "78664": { name: "Round Rock Gateway", lat: 30.5083, lng: -97.6789 },
};

export default function GoogleMapsDirectory({
  projects,
  bids,
  contractors = INITIAL_CONTRACTORS,
  currentCityName = "Austin",
  allCities,
  onClose,
  onSelectProject,
}: GoogleMapsDirectoryProps) {
  // Existing project filtering state
  const [filterType, setFilterType] = useState<"all" | "bidding" | "ongoing">("all");
  const [budgetFilter, setBudgetFilter] = useState<"all" | "under_500" | "500_to_1000" | "1000_to_5000" | "5000_plus">("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeClusterDetailId, setActiveClusterDetailId] = useState<string | null>(null);
  const [clusterGrouping, setClusterGrouping] = useState<"city" | "zip">("city");
  const [enableClustering, setEnableClustering] = useState<boolean>(true);
  const [mapMode, setMapMode] = useState<"satellite" | "street">("street");
  const [searchCityQuery, setSearchCityQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchCityQuery);
    }, 120);
    return () => clearTimeout(timer);
  }, [searchCityQuery]);

  // HEATMAP DATA VISUALIZATION LAYER STATE
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [heatmapRatingThreshold, setHeatmapRatingThreshold] = useState<"4.0" | "4.5" | "4.8">("4.5");
  const [heatmapIntensity, setHeatmapIntensity] = useState<"vivid" | "standard" | "subtle">("vivid");
  const [heatmapTradeFilter, setHeatmapTradeFilter] = useState<string>("all");
  const [viewScope, setViewScope] = useState<"active_city" | "regional">("active_city");
  const [selectedHeatmapClusterId, setSelectedHeatmapClusterId] = useState<string | null>(null);
  const [showHeatmapControlMenu, setShowHeatmapControlMenu] = useState<boolean>(false);

  // Active City Data
  const activeCityData = useMemo(() => {
    const cityName = currentCityName || "Austin";
    return (
      allCities.find((c) => c.name.toLowerCase() === cityName.toLowerCase()) ||
      findCity(cityName) ||
      allCities[0]
    );
  }, [allCities, currentCityName]);

  // Compute average ratings and prepare contractors pool
  const contractorsWithRatings = useMemo<ContractorWithRating[]>(() => {
    const list = contractors && contractors.length > 0 ? contractors : INITIAL_CONTRACTORS;
    return list.map((c) => {
      const revs = c.reviews || [];
      const avg = revs.length > 0
        ? revs.reduce((sum, r) => sum + r.rating, 0) / revs.length
        : 5.0;
      return {
        ...c,
        avgRating: Number(avg.toFixed(1)),
        reviewCount: revs.length,
      };
    });
  }, [contractors]);

  // Filter high-rated contractors belonging to the active city (or nearby regional bounds)
  const activeCityHighRatedContractors = useMemo<ContractorWithRating[]>(() => {
    const minRating = parseFloat(heatmapRatingThreshold);
    const activeCityLower = (currentCityName || "Austin").toLowerCase();

    return contractorsWithRatings.filter((c) => {
      // Rating threshold
      if (c.avgRating < minRating) return false;

      // Trade filter
      if (heatmapTradeFilter !== "all") {
        const matchesTrade = c.trades?.some((t) =>
          t.toLowerCase().includes(heatmapTradeFilter.toLowerCase())
        );
        if (!matchesTrade) return false;
      }

      // In active city mode: match active city name or state
      if (viewScope === "active_city") {
        return (
          c.city.toLowerCase() === activeCityLower ||
          (activeCityLower === "austin" && (c.city.toLowerCase() === "round rock" || c.state.toUpperCase() === "TX"))
        );
      }

      return true; // in regional mode include all qualified
    });
  }, [contractorsWithRatings, heatmapRatingThreshold, heatmapTradeFilter, viewScope, currentCityName]);

  // Available Trades in the contractor set for filtering
  const availableTrades = useMemo(() => {
    const tradeSet = new Set<string>();
    contractorsWithRatings.forEach((c) => {
      c.trades?.forEach((t) => tradeSet.add(t));
    });
    return Array.from(tradeSet).sort();
  }, [contractorsWithRatings]);

  // Group high-rated contractors into Geographic Heatmap Clusters in the active city
  const contractorHeatmapClusters = useMemo<ContractorHeatmapCluster[]>(() => {
    if (activeCityHighRatedContractors.length === 0) return [];

    const groupMap = new Map<string, ContractorWithRating[]>();

    activeCityHighRatedContractors.forEach((contractor) => {
      const zip = contractor.zipCode?.trim() || activeCityData.zipCode || "78701";
      const key = `${contractor.city.toLowerCase()}_${zip}`;
      const existing = groupMap.get(key) || [];
      existing.push(contractor);
      groupMap.set(key, existing);
    });

    const clustersList: ContractorHeatmapCluster[] = [];

    groupMap.forEach((members, key) => {
      const first = members[0];
      const zip = first.zipCode?.trim() || activeCityData.zipCode || "78701";

      let neighborhoodName = `${first.city} (${zip})`;
      let lat = activeCityData.lat;
      let lng = activeCityData.lng;

      // Match known Austin neighborhoods or calculate deterministic district coordinate
      if (first.city.toLowerCase() === "austin" && AUSTIN_NEIGHBORHOOD_GEO[zip]) {
        neighborhoodName = AUSTIN_NEIGHBORHOOD_GEO[zip].name;
        lat = AUSTIN_NEIGHBORHOOD_GEO[zip].lat;
        lng = AUSTIN_NEIGHBORHOOD_GEO[zip].lng;
      } else {
        // Deterministic offset based on zip code hash for realistic spatial clustering
        let hash = 0;
        for (let i = 0; i < zip.length; i++) {
          hash = (hash << 5) - hash + zip.charCodeAt(i);
        }
        const latOffset = (((hash % 100) / 100) - 0.5) * 0.08;
        const lngOffset = ((((hash >> 3) % 100) / 100) - 0.5) * 0.10;
        lat = activeCityData.lat + latOffset;
        lng = activeCityData.lng + lngOffset;
        neighborhoodName = `${first.city} - District ${zip}`;
      }

      const totalReviews = members.reduce((sum, c) => sum + c.reviewCount, 0);
      const avgRating = Number(
        (members.reduce((sum, c) => sum + c.avgRating, 0) / members.length).toFixed(2)
      );

      // Collect top unique trades
      const tradesCount: Record<string, number> = {};
      members.forEach((c) => {
        c.trades?.forEach((t) => {
          tradesCount[t] = (tradesCount[t] || 0) + 1;
        });
      });
      const topTrades = Object.keys(tradesCount).sort((a, b) => tradesCount[b] - tradesCount[a]);

      const contractorCount = members.length;
      let densityLevel: "ultra" | "hotspot" | "high" | "moderate" = "moderate";
      if (contractorCount >= 3) densityLevel = "ultra";
      else if (contractorCount === 2) densityLevel = "hotspot";
      else if (avgRating >= 4.9) densityLevel = "high";

      // Heat radius in pixels
      const heatRadius = Math.min(130, 65 + contractorCount * 22);
      const intensityScore = Math.min(1.0, 0.35 + contractorCount * 0.2 + (avgRating - 4.0) * 0.25);

      clustersList.push({
        id: `heat-cluster-${key}`,
        key,
        neighborhood: neighborhoodName,
        zipCode: zip,
        city: first.city,
        state: first.state,
        lat,
        lng,
        contractors: members,
        contractorCount,
        avgRating,
        totalReviews,
        topTrades,
        densityLevel,
        heatRadius,
        intensityScore,
      });
    });

    // Sort by largest contractor density first
    return clustersList.sort((a, b) => b.contractorCount - a.contractorCount || b.avgRating - a.avgRating);
  }, [activeCityHighRatedContractors, activeCityData]);

  // Selected Heatmap Cluster Detail for Drawer
  const selectedHeatmapCluster = useMemo(() => {
    if (!selectedHeatmapClusterId) return null;
    return contractorHeatmapClusters.find((c) => c.id === selectedHeatmapClusterId) || null;
  }, [contractorHeatmapClusters, selectedHeatmapClusterId]);

  // Filter projects by stage and budget
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (p.status === "completed") return false;

      if (filterType === "bidding") {
        return p.status === "open" || p.status === "bid_placed";
      }
      if (filterType === "ongoing") {
        return p.status === "accepted";
      }
      return true;
    }).filter((p) => {
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
      return true;
    }).filter((p) => {
      if (!debouncedSearchQuery) return true;
      const query = debouncedSearchQuery.toLowerCase();
      return (
        p.city.toLowerCase().includes(query) ||
        p.title.toLowerCase().includes(query) ||
        (p.zipCode && p.zipCode.includes(query)) ||
        p.state.toLowerCase().includes(query)
      );
    });
  }, [projects, filterType, budgetFilter, debouncedSearchQuery]);

  // Generate Clusters from Filtered Projects
  const clusters = useMemo<ProjectCluster[]>(() => {
    if (!enableClustering) {
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

  // Coordinates bounds: adapts dynamically to Active City Focus or Regional Overview
  const activeClusterBounds = useMemo(() => {
    if (viewScope === "active_city") {
      // Zoom in tightly on the active city metro area for high-resolution heatmap
      return {
        latMin: activeCityData.lat - 0.20,
        latMax: activeCityData.lat + 0.20,
        lngMin: activeCityData.lng - 0.25,
        lngMax: activeCityData.lng + 0.25,
      };
    }

    // Regional view spanning all projects
    if (filteredProjects.length === 0) return { latMin: 29, latMax: 43, lngMin: -122, lngMax: -85 };

    const lats = filteredProjects.map((p) => {
      const city = allCities.find((c) => c.name.toLowerCase() === p.city.toLowerCase()) || findCity(p.city) || allCities[0];
      return city.lat;
    });
    const lngs = filteredProjects.map((p) => {
      const city = allCities.find((c) => c.name.toLowerCase() === p.city.toLowerCase()) || findCity(p.city) || allCities[0];
      return city.lng;
    });

    // Also include active city so the active heatmap is within visual bounds
    lats.push(activeCityData.lat);
    lngs.push(activeCityData.lng);

    return {
      latMin: Math.min(...lats) - 0.8,
      latMax: Math.max(...lats) + 0.8,
      lngMin: Math.min(...lngs) - 1.2,
      lngMax: Math.max(...lngs) + 1.2,
    };
  }, [viewScope, activeCityData, filteredProjects, allCities]);

  // Convert lat/lng to visual SVG viewbox percentage coordinates
  const getCoordinates = (lat: number, lng: number) => {
    const latRange = activeClusterBounds.latMax - activeClusterBounds.latMin;
    const lngRange = activeClusterBounds.lngMax - activeClusterBounds.lngMin;

    const yPercent = 100 - ((lat - activeClusterBounds.latMin) / (latRange || 1)) * 100;
    const xPercent = ((lng - activeClusterBounds.lngMin) / (lngRange || 1)) * 100;

    return {
      x: Math.min(94, Math.max(6, xPercent)),
      y: Math.min(94, Math.max(6, yPercent)),
    };
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/75 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs animate-fade-in" id="google-maps-directory-overlay">
      <div className="bg-white max-w-6xl w-full h-[92vh] sm:h-[88vh] rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-150 bg-zinc-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 p-2.5 rounded-2xl text-white shadow-xs">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-extrabold text-sm sm:text-base text-zinc-900 leading-none">
                  Interactive Google Map Directory
                </h2>
                {showHeatmap && (
                  <span className="inline-flex items-center gap-1 bg-rose-500/15 text-rose-900 border border-rose-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <Flame className="w-3 h-3 text-rose-600 animate-pulse" /> Contractor Heatmap Active ({currentCityName})
                  </span>
                )}
                {enableClustering && (
                  <span className="hidden md:inline-flex items-center gap-1 bg-amber-500/15 text-amber-900 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <Grid3X3 className="w-2.5 h-2.5" /> Clustered Hubs
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-500 font-medium mt-1 uppercase tracking-wider">
                {showHeatmap 
                  ? `Heatmap: ${activeCityHighRatedContractors.length} High-Rated Pros clustered across ${contractorHeatmapClusters.length} zones in ${currentCityName}` 
                  : `Plotting ${filteredProjects.length} projects across ${clusters.length} regional clusters`}
              </p>
            </div>
          </div>

          {/* Quick Stats & View Mode Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold shrink-0">
            {/* View Scope Switcher: Active City Metro vs Regional Overview */}
            <div className="flex items-center bg-zinc-200/80 p-1 rounded-xl text-[10px] font-bold">
              <button
                onClick={() => setViewScope("active_city")}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  viewScope === "active_city"
                    ? "bg-white text-zinc-950 shadow-3xs font-black"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
                title={`Zoom into ${currentCityName} neighborhood contractor clusters`}
              >
                <Building2 className="w-3 h-3 text-amber-600" />
                <span>{currentCityName} Metro</span>
              </button>
              <button
                onClick={() => setViewScope("regional")}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  viewScope === "regional"
                    ? "bg-white text-zinc-950 shadow-3xs font-black"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
                title="View wide regional project map"
              >
                <Maximize2 className="w-3 h-3 text-zinc-500" />
                <span>Regional</span>
              </button>
            </div>

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
          
          {/* Sidebar controls & matched listing */}
          <div className="w-full md:w-80 border-r border-zinc-150 flex flex-col bg-zinc-50/50 overflow-y-auto shrink-0">
            
            {/* Filters bar */}
            <div className="p-3.5 sm:p-4 space-y-3 border-b border-zinc-150 bg-white/70">
              
              {/* HEATMAP DATA VISUALIZATION LAYER TOGGLE & CONTROLS */}
              <div className="space-y-2 p-3 bg-gradient-to-br from-rose-50 via-amber-50/50 to-orange-50 border border-rose-200/80 rounded-2xl shadow-3xs">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-500 animate-bounce" />
                    <span>Contractor Heatmap</span>
                  </label>
                  <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`text-[9px] font-black px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                      showHeatmap
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                    }`}
                    id="toggle-contractor-heatmap-btn"
                  >
                    <span>{showHeatmap ? "LAYER ON" : "LAYER OFF"}</span>
                  </button>
                </div>

                {showHeatmap && (
                  <div className="space-y-2 pt-1 border-t border-rose-200/60">
                    <div className="flex items-center justify-between text-[9px] font-bold text-rose-900">
                      <span>Rating Filter:</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setHeatmapRatingThreshold("4.0")}
                          className={`px-1.5 py-0.5 rounded cursor-pointer ${
                            heatmapRatingThreshold === "4.0" ? "bg-rose-600 text-white" : "bg-white text-zinc-700 border border-rose-200"
                          }`}
                        >
                          4.0+ ★
                        </button>
                        <button
                          onClick={() => setHeatmapRatingThreshold("4.5")}
                          className={`px-1.5 py-0.5 rounded cursor-pointer ${
                            heatmapRatingThreshold === "4.5" ? "bg-rose-600 text-white" : "bg-white text-zinc-700 border border-rose-200"
                          }`}
                        >
                          4.5+ ★
                        </button>
                        <button
                          onClick={() => setHeatmapRatingThreshold("4.8")}
                          className={`px-1.5 py-0.5 rounded cursor-pointer ${
                            heatmapRatingThreshold === "4.8" ? "bg-rose-600 text-white" : "bg-white text-zinc-700 border border-rose-200"
                          }`}
                        >
                          4.8+ ★ Elite
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-bold text-rose-900">
                      <span>Heat Intensity:</span>
                      <div className="flex gap-1">
                        {(["subtle", "standard", "vivid"] as const).map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => setHeatmapIntensity(lvl)}
                            className={`px-1.5 py-0.5 rounded capitalize cursor-pointer ${
                              heatmapIntensity === lvl ? "bg-amber-600 text-white" : "bg-white text-zinc-700 border border-rose-200"
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {availableTrades.length > 0 && (
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-500 block uppercase">
                          Trade Specialization
                        </label>
                        <select
                          value={heatmapTradeFilter}
                          onChange={(e) => setHeatmapTradeFilter(e.target.value)}
                          className="w-full bg-white border border-rose-200 rounded-lg px-2 py-1 text-[10px] font-bold text-zinc-800 cursor-pointer shadow-3xs"
                        >
                          <option value="all">All Contractor Trades ({availableTrades.length})</option>
                          {availableTrades.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="p-1.5 bg-white/80 rounded-xl border border-rose-100 flex items-center justify-between text-[9px]">
                      <span className="text-zinc-600 font-medium">Clustered in {currentCityName}:</span>
                      <span className="font-mono font-black text-rose-700">
                        {activeCityHighRatedContractors.length} Pros ({contractorHeatmapClusters.length} Hotspots)
                      </span>
                    </div>
                  </div>
                )}
              </div>

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
                      className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-700 text-xs font-bold"
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
                        setSelectedHeatmapClusterId(null);
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
            <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-24px)]">
              {/* Street vs Satellite */}
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

              {/* Heatmap Layer Quick Toggle */}
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`px-2.5 py-1 rounded-xl shadow-md text-[10px] font-black flex items-center gap-1.5 transition cursor-pointer border ${
                  showHeatmap
                    ? "bg-rose-600 text-white border-rose-500 shadow-rose-500/20"
                    : "bg-white/90 backdrop-blur-md text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                }`}
                title="Toggle High-Rated Contractor Density Heatmap"
                id="heatmap-layer-toggle-badge"
              >
                <Flame className={`w-3.5 h-3.5 ${showHeatmap ? "text-amber-200 fill-amber-300 animate-pulse" : "text-rose-500"}`} />
                <span>Heatmap: {showHeatmap ? "ON" : "OFF"}</span>
                {showHeatmap && (
                  <span className="bg-rose-700 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono">
                    {activeCityHighRatedContractors.length} Pros
                  </span>
                )}
              </button>

              {/* Cluster Mode Toggle Badge */}
              <button
                onClick={() => setEnableClustering(!enableClustering)}
                className="bg-white/90 backdrop-blur-md border border-zinc-200 text-zinc-800 px-2.5 py-1 rounded-xl shadow-md text-[10px] font-bold flex items-center gap-1.5 hover:bg-zinc-50 cursor-pointer"
                title="Toggle Cluster View"
              >
                <Grid3X3 className="w-3 h-3 text-amber-600" />
                <span>{enableClustering ? `Job Hubs: ${clusters.length}` : `Pins: ${filteredProjects.length}`}</span>
              </button>

              {/* Quick Focus Button for Active City */}
              <button
                onClick={() => setViewScope(viewScope === "active_city" ? "regional" : "active_city")}
                className="bg-white/90 backdrop-blur-md border border-zinc-200 text-zinc-800 px-2.5 py-1 rounded-xl shadow-md text-[10px] font-black flex items-center gap-1 hover:bg-zinc-50 cursor-pointer"
                title={`Center map on ${currentCityName}`}
              >
                <Building2 className="w-3 h-3 text-rose-600" />
                <span>{viewScope === "active_city" ? `📍 Focused: ${currentCityName}` : `🎯 Focus ${currentCityName}`}</span>
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

            {/* Interactive Surface representing the Google Map surface */}
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

              {/* ============================================================== */}
              {/* HIGH-RATED CONTRACTOR HEATMAP VISUALIZATION LAYER             */}
              {/* ============================================================== */}
              {showHeatmap && (
                <div
                  className="absolute inset-0 pointer-events-none z-15 overflow-hidden transition-opacity duration-300"
                  style={{
                    willChange: "transform, opacity",
                    contain: "paint",
                    opacity: heatmapIntensity === "vivid" ? 1.0 : heatmapIntensity === "standard" ? 0.82 : 0.6,
                  }}
                  id="contractor-heatmap-svg-layer"
                >
                  <svg
                    className="w-full h-full"
                    style={{
                      filter: heatmapIntensity === "vivid" ? "blur(14px)" : heatmapIntensity === "standard" ? "blur(10px)" : "blur(7px)",
                      WebkitFilter: heatmapIntensity === "vivid" ? "blur(14px)" : heatmapIntensity === "standard" ? "blur(10px)" : "blur(7px)",
                      transform: "translateZ(0)",
                    }}
                  >
                    <defs>
                      {/* Radial Gradients for Each Contractor Cluster Hotspot */}
                      {contractorHeatmapClusters.map((cluster) => {
                        const isHighDensity = cluster.contractorCount >= 3;
                        return (
                          <radialGradient
                            key={`heat-rad-${cluster.id}`}
                            id={`heat-rad-${cluster.id}`}
                            cx="50%"
                            cy="50%"
                            r="50%"
                          >
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={isHighDensity ? 0.95 : 0.85} />
                            <stop offset="28%" stopColor="#f97316" stopOpacity={isHighDensity ? 0.85 : 0.70} />
                            <stop offset="58%" stopColor="#f59e0b" stopOpacity={isHighDensity ? 0.65 : 0.50} />
                            <stop offset="80%" stopColor="#10b981" stopOpacity={isHighDensity ? 0.45 : 0.30} />
                            <stop offset="94%" stopColor="#06b6d4" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                          </radialGradient>
                        );
                      })}
                    </defs>

                    {/* Render Hardware-Accelerated Thermal Gradient Blobs */}
                    <g>
                      {contractorHeatmapClusters.map((cluster) => {
                        const coords = getCoordinates(cluster.lat, cluster.lng);
                        return (
                          <circle
                            key={`heat-blob-${cluster.id}`}
                            cx={`${coords.x}%`}
                            cy={`${coords.y}%`}
                            r={cluster.heatRadius}
                            fill={`url(#heat-rad-${cluster.id})`}
                          />
                        );
                      })}
                    </g>
                  </svg>
                </div>
              )}

              {/* ============================================================== */}
              {/* HEATMAP CLUSTER HOTSPOT INTERACTIVE PINS / BADGES             */}
              {/* ============================================================== */}
              {showHeatmap && contractorHeatmapClusters.map((cluster) => {
                const coords = getCoordinates(cluster.lat, cluster.lng);
                const isSelected = selectedHeatmapClusterId === cluster.id;

                return (
                  <div
                    key={`heat-pin-${cluster.id}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                    style={{
                      left: `${coords.x}%`,
                      top: `${coords.y}%`,
                      zIndex: isSelected ? 48 : 25,
                    }}
                  >
                    <div className="group relative flex flex-col items-center">
                      
                      {/* Hover Tooltip for Heatmap Cluster */}
                      {!isSelected && (
                        <div
                          className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-150 min-w-[220px] max-w-[280px] opacity-0 scale-95 hidden group-hover:block group-hover:opacity-100 group-hover:scale-100"
                        >
                          <div className="bg-zinc-950/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-rose-500/40 text-left space-y-2">
                            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1">
                                <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />
                                {cluster.neighborhood}
                              </span>
                              <span className="text-[10px] font-black bg-rose-600 text-white px-1.5 py-0.5 rounded-full font-mono">
                                {cluster.contractorCount} Pros
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-zinc-400">Avg Rating:</span>
                              <span className="font-bold text-amber-400 flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {cluster.avgRating.toFixed(1)} / 5.0
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-zinc-400">Verified Reviews:</span>
                              <span className="font-bold text-emerald-400">{cluster.totalReviews} reviews</span>
                            </div>

                            <div className="text-[9px] text-zinc-300 pt-1 border-t border-zinc-800/80">
                              <span className="text-zinc-400 block mb-0.5">Top Trades:</span>
                              <div className="flex flex-wrap gap-1">
                                {cluster.topTrades.slice(0, 3).map((t) => (
                                  <span key={t} className="bg-zinc-800 px-1.5 py-0.5 rounded text-[8px] text-zinc-200">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <p className="text-[9px] text-rose-400 font-bold text-center pt-0.5">
                              Click to inspect contractor cluster ➔
                            </p>
                          </div>
                          <div className="w-2.5 h-2.5 bg-zinc-950 border-r border-b border-rose-500/40 transform rotate-45 -mt-1.5 mx-auto"></div>
                        </div>
                      )}

                      {/* Hotspot Action Button */}
                      <button
                        id={`heat-cluster-btn-${cluster.id}`}
                        data-testid={`heat-cluster-btn-${cluster.id}`}
                        onClick={() => {
                          setSelectedHeatmapClusterId(cluster.id);
                          setActiveClusterDetailId(null);
                          setSelectedProjectId(null);
                        }}
                        className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl shadow-xl transition-all duration-200 cursor-pointer transform group-hover:scale-110 ${
                          isSelected
                            ? "bg-rose-600 text-white ring-4 ring-rose-400/50 scale-110 shadow-rose-600/40"
                            : "bg-zinc-950/95 hover:bg-rose-950 text-white border border-rose-500/60"
                        }`}
                      >
                        {/* Ping radar halo */}
                        <span className="absolute -inset-2 rounded-2xl bg-rose-500/30 animate-ping" />

                        <div className="p-1 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shrink-0">
                          <Flame className="w-3.5 h-3.5 fill-current animate-bounce" />
                        </div>

                        <div className="text-left leading-tight">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-black font-mono">
                              {cluster.contractorCount} Pros
                            </span>
                            <span className="text-[9px] font-extrabold text-amber-300 flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                              {cluster.avgRating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-[8px] font-medium text-zinc-300 block max-w-[90px] truncate">
                            {cluster.neighborhood}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Dynamic Plotted Project Cluster Markers */}
              {clusters.map((cluster) => {
                const coords = getCoordinates(cluster.lat, cluster.lng);
                const isMulti = cluster.projects.length > 1;
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
                      zIndex: isDetailActive || containsSelectedProject ? 40 : 10,
                    }}
                  >
                    {/* MULTI-PROJECT CLUSTER MARKER */}
                    {isMulti ? (
                      <div className="group relative flex flex-col items-center">
                        {!isDetailActive && !containsSelectedProject && (
                          <div
                            className={`absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-150 min-w-[240px] max-w-[300px] ${
                              isNearTop ? "top-full mt-3" : "bottom-full mb-3"
                            } opacity-0 scale-95 hidden group-hover:block group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0`}
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
                            setSelectedHeatmapClusterId(null);
                          }}
                          className="relative flex flex-col items-center cursor-pointer transition-transform duration-200 transform group-hover:scale-110"
                        >
                          <span className={`absolute -inset-2 rounded-full animate-ping opacity-40 ${
                            cluster.statusType === "all_bidding"
                              ? "bg-amber-400"
                              : cluster.statusType === "all_ongoing"
                              ? "bg-sky-400"
                              : "bg-amber-500"
                          }`} />

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
                      /* SINGLE-PROJECT PIN MARKER */
                      (() => {
                        const isOngoing = singleProj.status === "accepted";
                        const isSelected = selectedProjectId === singleProj.id;

                        return (
                          <div className="group relative flex flex-col items-center">
                            {!isSelected && (
                              <div
                                className={`absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-150 min-w-[220px] max-w-[280px] ${
                                  isNearTop ? "top-full mt-2.5" : "bottom-full mb-2.5"
                                } opacity-0 scale-95 hidden group-hover:block group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0`}
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

                                  <p className="text-xs font-bold font-display text-white line-clamp-2 leading-snug">
                                    {singleProj.title}
                                  </p>

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
                                setSelectedHeatmapClusterId(null);
                              }}
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
              {/* CONTRACTOR CLUSTER INSPECTOR DRAWER / OVERLAY                  */}
              {/* ============================================================== */}
              {selectedHeatmapCluster && (
                <div 
                  className="absolute right-3 top-3 bottom-3 w-88 max-w-[calc(100%-24px)] bg-white/95 backdrop-blur-md rounded-3xl border border-rose-200 shadow-2xl z-40 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-200"
                  id="contractor-cluster-drawer"
                >
                  {/* Drawer Header */}
                  <div className="p-4 bg-gradient-to-br from-zinc-950 via-zinc-900 to-rose-950 text-white border-b border-rose-900/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-gradient-to-br from-rose-500 to-amber-500 text-white rounded-xl shadow-md">
                        <Flame className="w-5 h-5 fill-current animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-display font-black text-sm text-white leading-tight">
                            {selectedHeatmapCluster.neighborhood}
                          </h3>
                        </div>
                        <p className="text-[10px] text-rose-300 font-mono">
                          {selectedHeatmapCluster.city}, {selectedHeatmapCluster.state} • Zip {selectedHeatmapCluster.zipCode}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedHeatmapClusterId(null)}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-xl bg-zinc-800/60 hover:bg-zinc-800 transition cursor-pointer"
                      title="Close Inspector"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Cluster Performance Metrics Bar */}
                  <div className="grid grid-cols-3 gap-1 p-2.5 bg-rose-50/70 border-b border-rose-100 text-center text-[10px]">
                    <div className="bg-white p-1.5 rounded-xl border border-rose-100">
                      <span className="block text-[8px] font-bold text-zinc-400 uppercase">Top Pros</span>
                      <span className="font-black text-rose-600 font-mono text-xs">{selectedHeatmapCluster.contractorCount} Clustered</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-xl border border-rose-100">
                      <span className="block text-[8px] font-bold text-zinc-400 uppercase">Avg Rating</span>
                      <span className="font-black text-amber-600 font-mono text-xs flex items-center justify-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {selectedHeatmapCluster.avgRating.toFixed(1)}
                      </span>
                    </div>
                    <div className="bg-white p-1.5 rounded-xl border border-rose-100">
                      <span className="block text-[8px] font-bold text-zinc-400 uppercase">Reviews</span>
                      <span className="font-black text-emerald-700 font-mono text-xs">{selectedHeatmapCluster.totalReviews} Total</span>
                    </div>
                  </div>

                  {/* Cluster Contractors List */}
                  <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
                      <span>High-Rated Pros in Zone</span>
                      <span className="text-rose-600 font-mono">{selectedHeatmapCluster.topTrades.length} Trades Available</span>
                    </div>

                    {selectedHeatmapCluster.contractors.map((contractor) => (
                      <div
                        key={contractor.id}
                        className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-3xs hover:border-rose-300 transition-all space-y-2.5"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={contractor.avatarUrl}
                            alt={contractor.fullName}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-xl object-cover border border-zinc-200 shadow-2xs shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-display font-bold text-xs text-zinc-900 truncate leading-snug">
                                {contractor.fullName}
                              </h4>
                              {contractor.verifiedProBadge && (
                                <span className="inline-flex items-center gap-0.5 text-[8px] font-black bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md shrink-0">
                                  <ShieldCheck className="w-2.5 h-2.5 text-amber-600" /> PRO
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-500 truncate font-medium">
                              {contractor.company || "Independent Contractor"}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-black text-amber-600 flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {contractor.avgRating.toFixed(1)}
                              </span>
                              <span className="text-[9px] text-zinc-400 font-medium">
                                ({contractor.reviewCount} verified reviews)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Trades Badges */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {contractor.trades?.slice(0, 3).map((trade) => (
                            <span
                              key={trade}
                              className="text-[9px] font-bold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md"
                            >
                              {trade}
                            </span>
                          ))}
                          {contractor.trades && contractor.trades.length > 3 && (
                            <span className="text-[9px] font-semibold text-zinc-400 px-1 py-0.5">
                              +{contractor.trades.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Latest review quote if exists */}
                        {contractor.reviews && contractor.reviews.length > 0 && (
                          <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-100 text-[9px] text-zinc-600 italic line-clamp-2">
                            "{contractor.reviews[0].comment}"
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={`tel:${contractor.phone}`}
                            className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold py-1.5 text-[10px] rounded-xl text-center transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Phone className="w-3 h-3 text-zinc-600" />
                            <span>Contact Pro</span>
                          </a>
                          <button
                            onClick={() => {
                              onClose();
                            }}
                            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 text-[10px] rounded-xl text-center transition shadow-3xs cursor-pointer"
                          >
                            Invite to Job
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Drawer Footer */}
                  <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-[10px]">
                    <span className="text-zinc-500 font-medium">Hotspot Cluster: {selectedHeatmapCluster.neighborhood}</span>
                    <button
                      onClick={() => setSelectedHeatmapClusterId(null)}
                      className="font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                    >
                      Back to Map
                    </button>
                  </div>
                </div>
              )}

              {/* CLUSTER EXPLORER DRAWER / OVERLAY */}
              {activeClusterDetail && (
                <div 
                  className="absolute right-3 top-3 bottom-3 w-80 max-w-[calc(100%-24px)] bg-white/95 backdrop-blur-md rounded-3xl border border-zinc-200 shadow-2xl z-30 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-200"
                  id="cluster-detail-drawer"
                >
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

              {/* SINGLE PROJECT INFOWINDOW POPUP PANEL */}
              {selectedProject && !activeClusterDetail && !selectedHeatmapCluster && (
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
                        <div className="col-span-2 border-t border-zinc-150 pt-1 flex items-center gap-1 text-zinc-500">
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
            <div className="p-3 bg-zinc-900 text-white text-[10px] font-medium flex flex-wrap justify-between items-center gap-3 border-t border-zinc-800 z-10">
              <div className="flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Google Map Directory • {clusters.length} Job Hubs</span>
                {showHeatmap && (
                  <span className="hidden sm:inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                    <Flame className="w-3 h-3 text-rose-400 fill-rose-400" />
                    <span>{activeCityHighRatedContractors.length} High-Rated Contractors in {currentCityName}</span>
                  </span>
                )}
              </div>

              {/* Heatmap & Stage Legend */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
                {showHeatmap && (
                  <div className="flex items-center gap-1.5 bg-zinc-800/80 px-2.5 py-1 rounded-xl border border-zinc-700">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase">Contractor Density:</span>
                    <span className="text-[9px] text-cyan-400">Low</span>
                    <div className="w-16 h-2 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600"></div>
                    <span className="text-[9px] text-rose-400 font-bold">Hotspot</span>
                  </div>
                )}
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Bidding</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                  <span>Ongoing</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-md bg-gradient-to-r from-amber-500 to-sky-500"></span>
                  <span>Job Cluster</span>
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
