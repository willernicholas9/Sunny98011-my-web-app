import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Heart,
  DollarSign,
  Calendar,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HardHat,
  Briefcase,
  Flame,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { Project } from "../types";
import { CITIES } from "../data/cities";

interface AreaJobsBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  currentCityName?: string;
  onSelectCity?: (cityName: string) => void;
  onSelectProject?: (project: Project) => void;
  favoriteProjectIds: string[];
  onToggleFavorite: (projectId: string) => void;
  currentUser?: any;
  onOpenPostJob?: () => void;
}

// Memoized individual job card item for high-performance fluid rendering
const AreaJobCardItem = React.memo(function AreaJobCardItem({
  project,
  isFavorite,
  isRecentlySaved,
  onSelectProject,
  onToggleFavorite,
  onClose,
  formatDate,
  getRelativeTime,
}: {
  project: Project;
  isFavorite: boolean;
  isRecentlySaved: boolean;
  onSelectProject?: (project: Project) => void;
  onToggleFavorite: (projectId: string) => void;
  onClose: () => void;
  formatDate: (dateStr?: string) => string;
  getRelativeTime: (dateStr?: string) => string;
}) {
  return (
    <div
      id={`area-job-card-${project.id}`}
      onClick={() => {
        if (onSelectProject) {
          onSelectProject(project);
          onClose();
        }
      }}
      className="group relative flex flex-col justify-between bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all duration-150 hover:shadow-lg cursor-pointer text-left transform-gpu"
    >
      {/* Top Row: Money & Heart Quick-Save Button */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          {/* Money / Budget Badge */}
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
              ${project.budget?.toLocaleString() || "Quote"}
            </span>
            <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">
              Budget
            </span>
          </div>

          {/* Date Listed */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>Listed: <strong className="text-zinc-200">{formatDate(project.createdAt)}</strong></span>
            <span className="text-zinc-600">•</span>
            <span className="text-amber-400 font-medium">{getRelativeTime(project.createdAt)}</span>
          </div>
        </div>

        {/* Quick-Save 'Heart' Icon Button */}
        <button
          id={`quick-save-job-${project.id}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(project.id);
          }}
          aria-label={isFavorite ? "Remove from saved jobs" : "Save job to favorites"}
          title={isFavorite ? "Saved! Click to remove" : "Quick-Save job for later"}
          className={`p-2 rounded-xl transition-transform active:scale-90 border focus:outline-none focus:ring-2 focus:ring-rose-500 ${
            isFavorite
              ? "bg-rose-500/20 border-rose-500/50 text-rose-500 hover:bg-rose-500/30"
              : "bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-rose-400 hover:border-zinc-600 hover:bg-zinc-800"
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>
      </div>

      {/* Job Title & Category Badge */}
      <div className="space-y-1.5 mb-3 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {project.isEmergency && (
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] uppercase font-black px-2 py-0.5 rounded-md flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400" /> Emergency
            </span>
          )}
          <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize">
            {project.type || "Home"}
          </span>
          {project.complexityLevel && (
            <span className="bg-zinc-800/60 text-zinc-400 text-[10px] px-2 py-0.5 rounded-md">
              {project.complexityLevel}
            </span>
          )}
        </div>

        <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-amber-300 transition-colors line-clamp-2">
          {project.title}
        </h3>

        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      </div>

      {/* Location & Target Date Footer */}
      <div className="pt-3 border-t border-zinc-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1 text-zinc-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{project.city}, {project.state} {project.zipCode}</span>
          </span>
          {project.targetCompletionDate && (
            <span className="text-[11px] text-zinc-500">
              Target: {formatDate(project.targetCompletionDate)}
            </span>
          )}
        </div>

        {/* Card Button CTA */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Open for Proposals
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-transform">
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
});

function AreaJobsBoardModalComponent({
  isOpen,
  onClose,
  projects = [],
  currentCityName = "Austin",
  onSelectCity,
  onSelectProject,
  favoriteProjectIds = [],
  onToggleFavorite,
  currentUser,
  onOpenPostJob,
}: AreaJobsBoardModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>("all");
  const [budgetSort, setBudgetSort] = useState<"newest" | "highest" | "lowest">("newest");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);

  // Debounce search query to eliminate keystroke lag
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 120);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Sync selected area filter with currentCityName when modal opens
  useEffect(() => {
    if (isOpen && currentCityName) {
      setSelectedAreaFilter(currentCityName.toLowerCase());
    }
  }, [isOpen, currentCityName]);

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Recently Listed";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Recently Listed";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently Listed";
    }
  };

  // Format relative time helper
  const getRelativeTime = (dateStr?: string) => {
    if (!dateStr) return "Just now";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
      return `${Math.floor(diffDays / 30)}mo ago`;
    } catch {
      return "Active";
    }
  };

  // Distinct city list from projects + predefined cities
  const availableCities = useMemo(() => {
    const citiesSet = new Set<string>();
    if (currentCityName) citiesSet.add(currentCityName);
    projects.forEach((p) => {
      if (p.city) citiesSet.add(p.city);
    });
    CITIES.forEach((c) => citiesSet.add(c.name));
    return Array.from(citiesSet);
  }, [projects, currentCityName]);

  // Filtered and sorted projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Saved only filter
      if (showSavedOnly && !favoriteProjectIds.includes(project.id)) {
        return false;
      }

      // City filter
      if (selectedAreaFilter !== "all") {
        const matchesCity = project.city?.toLowerCase() === selectedAreaFilter.toLowerCase();
        if (!matchesCity) return false;
      }

      // Search query filter
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        const inTitle = project.title?.toLowerCase().includes(q);
        const inDesc = project.description?.toLowerCase().includes(q);
        const inCity = project.city?.toLowerCase().includes(q);
        const inZip = project.zipCode?.toLowerCase().includes(q);
        const inTrade = project.emergencyCategory?.toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inCity && !inZip && !inTrade) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (budgetSort === "highest") {
        return (b.budget || 0) - (a.budget || 0);
      }
      if (budgetSort === "lowest") {
        return (a.budget || 0) - (b.budget || 0);
      }
      // "newest"
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [projects, selectedAreaFilter, debouncedSearch, budgetSort, showSavedOnly, favoriteProjectIds]);

  // Total value in current view
  const totalValue = useMemo(() => {
    return filteredProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
  }, [filteredProjects]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      id="area-jobs-board-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-6xl h-[92vh] max-h-[900px] flex flex-col rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden text-zinc-100"
        id="area-jobs-board-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="area-jobs-board-title"
      >
        {/* Top Header with Prominent Title and Easy Close 'X' Button */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 bg-zinc-900/90 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="area-jobs-board-title"
                  className="text-lg sm:text-xl font-black font-display tracking-tight text-white"
                >
                  Area Jobs Board
                </h2>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                  Live Feed
                </span>
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {selectedAreaFilter === "all" ? "Showing all regional jobs" : `Active jobs in ${selectedAreaFilter.toUpperCase()}`}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-emerald-400 font-semibold font-mono">
                  {filteredProjects.length} Available
                </span>
              </p>
            </div>
          </div>

          {/* Close 'X' Button in Top Right Corner */}
          <div className="flex items-center gap-2">
            <button
              id="close-area-jobs-board-btn"
              onClick={onClose}
              className="p-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              title="Close Board (Esc)"
              aria-label="Close Area Jobs Board"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action & Filter Bar */}
        <div className="px-5 sm:px-8 py-3.5 bg-zinc-900/60 border-b border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, trade, zip code, or keyword..."
              className="w-full pl-9 pr-8 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition"
              id="area-jobs-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs p-1"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Area Dropdown */}
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <select
                value={selectedAreaFilter}
                onChange={(e) => {
                  setSelectedAreaFilter(e.target.value);
                  if (onSelectCity && e.target.value !== "all") {
                    onSelectCity(e.target.value);
                  }
                }}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
                id="area-jobs-city-selector"
              >
                <option value="all" className="bg-zinc-900 text-white">All Areas</option>
                {availableCities.map((city) => (
                  <option key={city} value={city.toLowerCase()} className="bg-zinc-900 text-white">
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget / Date Sort */}
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300">
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <select
                value={budgetSort}
                onChange={(e) => setBudgetSort(e.target.value as any)}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
                id="area-jobs-sort-selector"
              >
                <option value="newest" className="bg-zinc-900 text-white">Date: Newest First</option>
                <option value="highest" className="bg-zinc-900 text-white">Money: Highest First</option>
                <option value="lowest" className="bg-zinc-900 text-white">Money: Lowest First</option>
              </select>
            </div>

            {/* Quick-Save 'Heart' Filter Toggle */}
            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              id="area-jobs-saved-filter-toggle"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                showSavedOnly
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm"
                  : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500 hover:text-white"
              }`}
              title="Show only jobs you've saved with the heart icon"
            >
              <Heart
                className={`w-3.5 h-3.5 ${showSavedOnly ? "fill-rose-500 text-rose-500" : "text-rose-400"}`}
              />
              <span>Saved Jobs</span>
              {favoriteProjectIds.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-rose-500/30 text-rose-200 rounded-full font-mono text-[10px]">
                  {favoriteProjectIds.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Informational Sub-header Banner with Aggregate Stats */}
        <div className="px-5 sm:px-8 py-2.5 bg-zinc-900/40 border-b border-zinc-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <strong className="text-white font-mono">{filteredProjects.length}</strong> jobs currently available
            </span>
            <span className="hidden sm:inline text-zinc-600">•</span>
            <span className="hidden sm:flex items-center gap-1">
              <span>Total Area Job Volume:</span>
              <strong className="text-emerald-400 font-mono">${totalValue.toLocaleString()}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-zinc-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Escrow Protected
            </span>
            {onOpenPostJob && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPostJob();
                }}
                className="text-amber-400 hover:text-amber-300 underline font-semibold"
              >
                + Post a Project
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Job Cards Grid */}
        <div
          className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-4"
          id="area-jobs-board-cards-container"
        >
          {filteredProjects.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl">
              <Heart className="w-10 h-10 text-zinc-600 mb-2" />
              <h3 className="text-sm font-bold text-white">No Matching Jobs Found</h3>
              <p className="text-xs text-zinc-400 max-w-sm mt-1">
                {showSavedOnly
                  ? "You have not saved any jobs to your favorites yet. Click the heart icon on any job card to save it for later!"
                  : "No projects match your current search or area filter. Try changing your search query or selecting 'All Areas'."}
              </p>
              {showSavedOnly && (
                <button
                  onClick={() => setShowSavedOnly(false)}
                  className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-xl text-white transition"
                >
                  View All Available Jobs
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredProjects.map((project) => (
                <AreaJobCardItem
                  key={project.id}
                  project={project}
                  isFavorite={favoriteProjectIds.includes(project.id)}
                  isRecentlySaved={lastSavedId === project.id}
                  onSelectProject={onSelectProject}
                  onToggleFavorite={onToggleFavorite}
                  onClose={onClose}
                  formatDate={formatDate}
                  getRelativeTime={getRelativeTime}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Footer Bar */}
        <div className="px-5 sm:px-8 py-3 bg-zinc-900/90 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Tip:</span>
            <span>Click the <Heart className="w-3.5 h-3.5 inline text-rose-500 fill-rose-500" /> icon on any job card to quick-save it to your saved jobs list.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl text-xs transition border border-zinc-700"
            >
              Close Board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(AreaJobsBoardModalComponent);
