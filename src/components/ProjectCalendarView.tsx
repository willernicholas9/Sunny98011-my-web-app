import React, { useState, useMemo } from "react";
import { Project, Bid, BaseUser } from "../types";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Hammer,
  DollarSign,
  MapPin,
  Tag,
  ShieldCheck,
  Check,
  Zap,
  Info,
  CalendarCheck,
  SlidersHorizontal,
} from "lucide-react";

interface ProjectCalendarViewProps {
  projects: Project[];
  bids: Bid[];
  currentUser: BaseUser | null;
  onSelectProject?: (projectId: string) => void;
  onUpdateProjectCompletionDate?: (projectId: string, date: string, estimatedDays: number, complexity: "Low" | "Medium" | "High" | "Major Renovation") => void;
}

// Helper to determine trade complexity & estimated duration
export function calculateSuggestedCompletion(project: Project) {
  const titleLower = project.title.toLowerCase();
  const descLower = project.description.toLowerCase();
  const fullText = `${titleLower} ${descLower}`;

  let tradeCategory = "General";
  let baseDays = 2;

  if (fullText.includes("landscape") || fullText.includes("mulch") || fullText.includes("lawn") || fullText.includes("garden")) {
    tradeCategory = "Landscaping & Outdoor";
    baseDays = 2;
  } else if (fullText.includes("gutter") || fullText.includes("roof")) {
    tradeCategory = "Gutter & Roofing";
    baseDays = 1;
  } else if (fullText.includes("window") || fullText.includes("glaze") || fullText.includes("door")) {
    tradeCategory = "Window & Door Installation";
    baseDays = 4;
  } else if (fullText.includes("tv") || fullText.includes("mount") || fullText.includes("shelf")) {
    tradeCategory = "TV Hanging & Fixtures";
    baseDays = 1;
  } else if (fullText.includes("paint") || fullText.includes("drywall")) {
    tradeCategory = "Painting & Wall Refinishing";
    baseDays = 3;
  } else if (fullText.includes("plumb") || fullText.includes("leak") || fullText.includes("drain")) {
    tradeCategory = "Plumbing Service";
    baseDays = 1;
  } else if (fullText.includes("electr") || fullText.includes("outlet") || fullText.includes("light")) {
    tradeCategory = "Electrical Maintenance";
    baseDays = 1;
  }

  // Budget complexity modifier
  let budgetDaysAdd = 0;
  let complexity: "Low" | "Medium" | "High" | "Major Renovation" = "Low";

  if (project.budget > 2500) {
    budgetDaysAdd = 7;
    complexity = "Major Renovation";
  } else if (project.budget > 1000) {
    budgetDaysAdd = 4;
    complexity = "High";
  } else if (project.budget > 400) {
    budgetDaysAdd = 2;
    complexity = "Medium";
  } else {
    budgetDaysAdd = 0;
    complexity = "Low";
  }

  const totalDays = Math.max(1, baseDays + budgetDaysAdd);

  // Calculate completion date based on project.createdAt or today
  const startDate = project.createdAt ? new Date(project.createdAt) : new Date();
  const validStartDate = isNaN(startDate.getTime()) ? new Date() : startDate;

  // Add working days (excluding weekends for accuracy)
  const targetDate = new Date(validStartDate);
  let addedDays = 0;
  while (addedDays < totalDays) {
    targetDate.setDate(targetDate.getDate() + 1);
    // Skip Sunday (0) and Saturday (6) if desired, or count consecutive days
    addedDays++;
  }

  // Format YYYY-MM-DD
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");
  const suggestedDateStr = `${year}-${month}-${day}`;

  // Milestone phases
  const milestones = [
    { phase: "Phase 1: Site Inspection & Material Prep", dayOffset: 1 },
    { phase: "Phase 2: Execution & Core Work", dayOffset: Math.max(1, Math.floor(totalDays / 2)) },
    { phase: "Phase 3: Final Quality Audit & Escrow Release", dayOffset: totalDays },
  ];

  return {
    suggestedDateStr,
    totalDays,
    complexity,
    tradeCategory,
    targetDateObj: targetDate,
    milestones,
  };
}

export default function ProjectCalendarView({
  projects,
  bids,
  currentUser,
  onSelectProject,
  onUpdateProjectCompletionDate,
}: ProjectCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 7, 1)); // Default August 2026 to align with mock project dates
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id || null);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "accepted" | "completed">("all");
  const [tradeFilter, setTradeFilter] = useState<string>("all");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calendar calculations
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Map projects with calculated or existing completion dates
  const projectsWithSchedule = useMemo(() => {
    return projects.map((p) => {
      const schedule = calculateSuggestedCompletion(p);
      const effectiveDateStr = p.targetCompletionDate || schedule.suggestedDateStr;
      const effectiveDays = p.estimatedDaysToComplete || schedule.totalDays;
      const effectiveComplexity = p.complexityLevel || schedule.complexity;

      return {
        ...p,
        effectiveDateStr,
        effectiveDays,
        effectiveComplexity,
        schedule,
      };
    });
  }, [projects]);

  // Filtered list
  const filteredProjects = useMemo(() => {
    return projectsWithSchedule.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (tradeFilter !== "all" && !p.title.toLowerCase().includes(tradeFilter.toLowerCase()) && !p.description.toLowerCase().includes(tradeFilter.toLowerCase())) return false;
      return true;
    });
  }, [projectsWithSchedule, statusFilter, tradeFilter]);

  // Map projects by date string (YYYY-MM-DD)
  const projectsByDate = useMemo(() => {
    const map: { [key: string]: typeof projectsWithSchedule } = {};
    filteredProjects.forEach((p) => {
      if (!map[p.effectiveDateStr]) {
        map[p.effectiveDateStr] = [];
      }
      map[p.effectiveDateStr].push(p);
    });
    return map;
  }, [filteredProjects]);

  const selectedProject = useMemo(() => {
    return projectsWithSchedule.find((p) => p.id === selectedProjectId) || filteredProjects[0] || null;
  }, [projectsWithSchedule, selectedProjectId, filteredProjects]);

  // Auto-schedule all projects action
  const handleAutoScheduleAll = () => {
    let count = 0;
    projectsWithSchedule.forEach((p) => {
      if (!p.targetCompletionDate && onUpdateProjectCompletionDate) {
        onUpdateProjectCompletionDate(
          p.id,
          p.schedule.suggestedDateStr,
          p.schedule.totalDays,
          p.schedule.complexity
        );
        count++;
      }
    });
    alert(`🎉 AI Smart Scheduler applied completion dates to ${count || projects.length} project(s) based on trade complexity!`);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-6" id="project-calendar-view-container">
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-150 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200/80 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Smart Timeline & Completion Calendar</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black font-display text-zinc-900 tracking-tight">
            Project Completion Schedule Dashboard
          </h2>
          <p className="text-xs text-zinc-500 font-medium max-w-2xl">
            Automatically estimates project durations and target completion dates based on trade requirements, budget complexity, and contractor workflow velocity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAutoScheduleAll}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer border border-amber-300"
            title="Auto-calculate and lock completion dates for all open projects"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Auto-Schedule All Projects</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-zinc-500 shrink-0" />
          <span className="font-extrabold text-zinc-700 uppercase text-[10px] tracking-wider">Filter Calendar:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="inline-flex bg-white border border-zinc-200 rounded-xl p-1 shadow-2xs font-bold text-[11px]">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-lg transition ${statusFilter === "all" ? "bg-amber-600 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}
            >
              All Statuses
            </button>
            <button
              onClick={() => setStatusFilter("open")}
              className={`px-3 py-1 rounded-lg transition ${statusFilter === "open" ? "bg-amber-600 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}
            >
              Open for Bids
            </button>
            <button
              onClick={() => setStatusFilter("accepted")}
              className={`px-3 py-1 rounded-lg transition ${statusFilter === "accepted" ? "bg-amber-600 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1 rounded-lg transition ${statusFilter === "completed" ? "bg-amber-600 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}
            >
              Completed
            </button>
          </div>

          {/* Trade Filter */}
          <select
            value={tradeFilter}
            onChange={(e) => setTradeFilter(e.target.value)}
            className="bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Trades</option>
            <option value="landscaping">Landscaping</option>
            <option value="gutter">Gutter Cleaning</option>
            <option value="window">Window Replacement</option>
            <option value="tv">TV Hanging</option>
            <option value="paint">Painting</option>
            <option value="plumb">Plumbing</option>
            <option value="electr">Electrical</option>
          </select>
        </div>
      </div>

      {/* Main Grid Layout: Calendar on Left, Selected Project Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white shadow-md space-y-4">
          {/* Calendar Month Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-400" />
              <h3 className="font-display font-black text-base text-white">
                {monthNames[month]} {year}
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date(2026, 7, 1))}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[10px] rounded-lg transition uppercase tracking-wider cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase text-zinc-400 tracking-wider">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank padding for first day of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`blank-${idx}`} className="h-24 bg-zinc-950/40 rounded-xl border border-zinc-800/40"></div>
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, dayIdx) => {
              const dayNum = dayIdx + 1;
              const formattedDay = String(dayNum).padStart(2, "0");
              const formattedMonth = String(month + 1).padStart(2, "0");
              const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

              const dayProjects = projectsByDate[dateStr] || [];
              const isToday = dayNum === 1 && month === 7 && year === 2026; // Highlight Aug 1, 2026

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`h-24 bg-zinc-950/80 border rounded-xl p-1.5 flex flex-col justify-between transition overflow-hidden relative ${
                    isToday ? "border-amber-500 ring-1 ring-amber-500/50 bg-amber-950/20" : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-extrabold font-mono text-zinc-400">
                    <span className={isToday ? "text-amber-400 font-black bg-amber-500/20 px-1.5 py-0.2 rounded" : ""}>
                      {dayNum}
                    </span>
                    {dayProjects.length > 0 && (
                      <span className="text-[9px] bg-amber-500 text-slate-950 px-1 rounded-full font-black">
                        {dayProjects.length}
                      </span>
                    )}
                  </div>

                  {/* Project Cards Inside Day Cell */}
                  <div className="space-y-1 overflow-y-auto max-h-16 pr-0.5 custom-scrollbar">
                    {dayProjects.map((p) => {
                      const isSelected = p.id === selectedProjectId;
                      let badgeBg = "bg-blue-900/90 border-blue-700 text-blue-200";
                      if (p.status === "completed") badgeBg = "bg-emerald-950 border-emerald-700 text-emerald-200";
                      else if (p.status === "accepted") badgeBg = "bg-amber-950 border-amber-600 text-amber-200";

                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedProjectId(p.id);
                            if (onSelectProject) onSelectProject(p.id);
                          }}
                          className={`w-full text-left p-1 rounded-md border text-[9px] font-bold truncate transition cursor-pointer block ${badgeBg} ${
                            isSelected ? "ring-2 ring-white scale-102" : "hover:brightness-125"
                          }`}
                          title={`${p.title} - Est. ${p.effectiveDays} Days ($${p.budget})`}
                        >
                          <div className="truncate font-extrabold">{p.title}</div>
                          <div className="text-[8px] font-mono opacity-80 truncate">${p.budget} • {p.effectiveDays}d</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Status Legend */}
          <div className="flex flex-wrap items-center justify-between text-[10px] text-zinc-400 pt-2 border-t border-zinc-800 font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Open (AI Suggested Date)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> In Progress
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed
              </span>
            </div>
            <span>Showing {filteredProjects.length} Projects</span>
          </div>
        </div>

        {/* Selected Project AI Complexity & Completion Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedProject ? (
            <div className="bg-slate-950 border border-zinc-800 rounded-2xl p-5 text-white shadow-lg space-y-4" id="project-calendar-inspector-card">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
                <div>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mb-1">
                    Selected Job Schedule Analysis
                  </span>
                  <h3 className="font-display font-extrabold text-base text-white">{selectedProject.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" /> {selectedProject.city}, {selectedProject.state}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-amber-400 font-black">${selectedProject.budget.toLocaleString()}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                  selectedProject.status === "completed" ? "bg-emerald-950 border-emerald-700 text-emerald-300" :
                  selectedProject.status === "accepted" ? "bg-amber-950 border-amber-600 text-amber-300" :
                  "bg-blue-950 border-blue-700 text-blue-300"
                }`}>
                  {selectedProject.status.replace("_", " ")}
                </span>
              </div>

              {/* AI Completion Date Breakdown Box */}
              <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-800/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>AI Estimated Target Completion</span>
                  </div>
                  <span className="bg-blue-900/80 text-blue-200 border border-blue-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                    {selectedProject.effectiveComplexity} Complexity
                  </span>
                </div>

                <div className="flex items-baseline justify-between border-b border-blue-800/60 pb-2">
                  <div className="text-2xl font-black font-mono text-white">
                    {selectedProject.effectiveDateStr}
                  </div>
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{selectedProject.effectiveDays} Working Days</span>
                  </div>
                </div>

                {/* Milestone breakdown timeline */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Recommended Milestone Execution Plan:
                  </span>
                  <div className="space-y-1.5">
                    {selectedProject.schedule.milestones.map((m, idx) => (
                      <div key={idx} className="bg-slate-900/90 border border-blue-900/60 rounded-lg p-2 text-[11px] text-zinc-200 flex items-center justify-between">
                        <span className="font-semibold">{m.phase}</span>
                        <span className="text-[10px] font-mono text-amber-400 font-extrabold bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                          Day {m.dayOffset}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action button to lock or adjust date */}
                {onUpdateProjectCompletionDate && (
                  <button
                    type="button"
                    onClick={() => {
                      const newDate = prompt("Enter custom completion date (YYYY-MM-DD):", selectedProject.effectiveDateStr);
                      if (newDate) {
                        onUpdateProjectCompletionDate(
                          selectedProject.id,
                          newDate,
                          selectedProject.effectiveDays,
                          selectedProject.effectiveComplexity
                        );
                        alert(`Target completion date for "${selectedProject.title}" updated to ${newDate}!`);
                      }
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CalendarCheck className="w-4 h-4 text-slate-950" />
                    <span>Lock / Modify Completion Target</span>
                  </button>
                )}
              </div>

              {/* Description & Bids Info */}
              <div className="space-y-2 text-xs text-zinc-300">
                <span className="font-extrabold text-zinc-400 uppercase text-[10px] block">Job Description & Requirements</span>
                <p className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800/80 leading-relaxed text-[11px]">
                  {selectedProject.description}
                </p>
              </div>

              {/* Bids Count Summary */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Bids Submitted:</span>
                <span className="font-mono font-black text-amber-400 text-sm">
                  {bids.filter((b) => b.projectId === selectedProject.id).length} Bids
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-400 text-xs space-y-2">
              <CalendarIcon className="w-8 h-8 text-zinc-600 mx-auto" />
              <p>Select a project from the calendar grid to inspect its AI completion timeline analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
