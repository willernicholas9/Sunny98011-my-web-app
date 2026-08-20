import React, { useMemo } from "react";
import { CITIES, getDistance } from "../data/cities";
import { Compass, Navigation, MapPin, Globe, ArrowUpRight, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";

// Custom elegant SVG map pin for the active user's base location
function UserLocationPin() {
  return (
    <div className="relative flex items-center justify-center">
      <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-cyan-400 opacity-60"></span>
      <svg
        viewBox="0 0 24 24"
        className="relative w-5 h-5 text-cyan-400 drop-shadow-[0_2px_4px_rgba(6,182,212,0.5)] transition-transform duration-300 group-hover:scale-110"
        fill="currentColor"
      >
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// Custom elegant SVG map pin for the project/job site location
function ProjectLocationPin() {
  return (
    <div className="relative flex items-center justify-center">
      <span className="animate-ping absolute inline-flex h-4.5 w-4.5 rounded-full bg-rose-500 opacity-60"></span>
      <svg
        viewBox="0 0 24 24"
        className="relative w-5.5 h-5.5 text-rose-500 drop-shadow-[0_2px_4px_rgba(244,63,94,0.5)] transition-transform duration-300 group-hover:scale-110"
        fill="currentColor"
      >
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

interface ProjectMiniMapProps {
  userCityName: string;
  projectCityName: string;
  compact?: boolean;
  onViewOnMap?: () => void;
}

export default function ProjectMiniMap({
  userCityName,
  projectCityName,
  compact = false,
  onViewOnMap,
}: ProjectMiniMapProps) {
  // Find cities data
  const userCity = useMemo(() => {
    return CITIES.find((c) => c.name.toLowerCase() === userCityName.toLowerCase()) || CITIES[0];
  }, [userCityName]);

  const projectCity = useMemo(() => {
    return CITIES.find((c) => c.name.toLowerCase() === projectCityName.toLowerCase()) || CITIES[0];
  }, [projectCityName]);

  // Calculate distance
  const distance = useMemo(() => {
    return getDistance(userCity.lat, userCity.lng, projectCity.lat, projectCity.lng);
  }, [userCity, projectCity]);

  // Calculate bearing angle in degrees & compass direction
  const { bearing, directionLabel, dx, dy } = useMemo(() => {
    if (userCityName.toLowerCase() === projectCityName.toLowerCase()) {
      return { bearing: 0, directionLabel: "Local", dx: 0, dy: 0 };
    }

    const dLngRad = ((projectCity.lng - userCity.lng) * Math.PI) / 180;
    const userLatRad = (userCity.lat * Math.PI) / 180;
    const projLatRad = (projectCity.lat * Math.PI) / 180;

    const y = Math.sin(dLngRad) * Math.cos(projLatRad);
    const x =
      Math.cos(userLatRad) * Math.sin(projLatRad) -
      Math.sin(userLatRad) * Math.cos(projLatRad) * Math.cos(dLngRad);
    
    let bearingRad = Math.atan2(y, x);
    let bearingDegrees = (bearingRad * 180) / Math.PI;
    if (bearingDegrees < 0) {
      bearingDegrees += 360;
    }

    // Compass Text Identifier
    let label = "N";
    if (bearingDegrees >= 22.5 && bearingDegrees < 67.5) label = "North-East (NE)";
    else if (bearingDegrees >= 67.5 && bearingDegrees < 112.5) label = "East (E)";
    else if (bearingDegrees >= 112.5 && bearingDegrees < 157.5) label = "South-East (SE)";
    else if (bearingDegrees >= 157.5 && bearingDegrees < 202.5) label = "South (S)";
    else if (bearingDegrees >= 202.5 && bearingDegrees < 247.5) label = "South-West (SW)";
    else if (bearingDegrees >= 247.5 && bearingDegrees < 292.5) label = "West (W)";
    else if (bearingDegrees >= 292.5 && bearingDegrees < 337.5) label = "North-West (NW)";
    else label = "North (N)";

    // Visual X, Y coordinate vectors within -1 to 1 bounds
    const visualDistance = Math.min(80, Math.max(25, (distance / 85) * 80));
    const plotX = Math.sin(bearingRad) * visualDistance;
    const plotY = -Math.cos(bearingRad) * visualDistance;

    return {
      bearing: Math.round(bearingDegrees),
      directionLabel: label,
      dx: plotX,
      dy: plotY,
    };
  }, [userCity, projectCity, userCityName, projectCityName, distance]);

  const isSameCity = userCityName.toLowerCase() === projectCityName.toLowerCase();
  const isTooFar = distance > 120;

  if (compact) {
    return (
      <div 
        onClick={onViewOnMap}
        className="relative h-20 w-full bg-slate-950 rounded-xl border border-zinc-300/80 hover:border-amber-500 overflow-hidden shadow-2xs cursor-pointer group transition-all duration-200 select-none my-1"
        title="Click to view interactive map directory"
        id={`compact-map-thumb-${projectCityName}`}
      >
        {/* Dark Grid & Radar Sweep Backdrop */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
          <div className="w-[180px] h-[180px] rounded-full border border-blue-500/30 flex items-center justify-center">
            <div className="w-[120px] h-[120px] rounded-full border border-blue-400/20 flex items-center justify-center">
              <div className="w-[60px] h-[60px] rounded-full border border-blue-300/20"></div>
            </div>
          </div>
          <div className="absolute left-0 right-0 h-[0.5px] bg-blue-500/30"></div>
          <div className="absolute top-0 bottom-0 w-[0.5px] bg-blue-500/30"></div>
        </div>

        {/* Vector Trajectory Line between User Base and Project */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <svg className="w-full h-full">
            <line
              x1="30%"
              y1="50%"
              x2="70%"
              y2="50%"
              stroke={isSameCity ? "#10b981" : "#f59e0b"}
              strokeWidth="2"
              strokeDasharray="4 3"
              className="animate-[dash_1.5s_linear_infinite]"
            />
          </svg>
        </div>

        {/* User Base Location Pin (Left Side) */}
        <div className="absolute left-[26%] top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
          <div className="relative">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-cyan-400 opacity-75"></span>
            <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 border border-white shadow-xs"></div>
          </div>
          <span className="text-[9px] font-extrabold text-cyan-200 bg-slate-900/90 border border-cyan-800/80 px-1.5 py-0.5 rounded shadow-2xs uppercase tracking-tight hidden sm:inline-block">
            {userCityName}
          </span>
        </div>

        {/* Project Location Pin (Right Side) */}
        <div className="absolute left-[70%] top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
          <div className="relative">
            <span className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-rose-500 opacity-75"></span>
            <div className="w-4 h-4 rounded-full bg-rose-500 border border-white shadow-xs"></div>
          </div>
          <span className="text-[9px] font-extrabold text-rose-100 bg-rose-950/90 border border-rose-800/80 px-1.5 py-0.5 rounded shadow-2xs uppercase tracking-tight hidden sm:inline-block">
            {projectCityName}
          </span>
        </div>

        {/* Overlay Floating Badge: Distance & Compass Direction */}
        <div className="absolute top-1.5 left-2 z-20 flex items-center gap-1 bg-slate-900/90 border border-blue-800/80 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-md">
          <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
          <span>{projectCityName}</span>
          <span className="text-amber-400 font-extrabold font-mono ml-0.5">
            ({distance} mi {isSameCity ? "• Local" : `• ${directionLabel}`})
          </span>
        </div>

        {/* Action Prompt */}
        <div className="absolute bottom-1.5 right-2 z-20 flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wider transition shadow-sm">
          <Compass className="w-3 h-3 text-slate-950 animate-spin-slow" />
          <span>View Map Directory</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border border-zinc-200/80 rounded-xl bg-white p-3.5 shadow-xs shrink-0 w-full md:w-56" id={`project-minimap-${projectCityName}`}>
      {/* Title Header bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>Spatial Matcher</span>
        </span>
        <span className="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
          {distance} mi
        </span>
      </div>

      {/* Visual Workspace Canvas */}
      <div className="relative h-40 bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden flex items-center justify-center select-none" id={`minimap-screen-${projectCityName}`}>
        
        {/* Radar concentric sweep grids */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[150px] h-[150px] rounded-full border border-zinc-800/60 flex items-center justify-center">
            <div className="w-[100px] h-[100px] rounded-full border border-zinc-800/80 flex items-center justify-center">
              <div className="w-[50px] h-[50px] rounded-full border border-zinc-850/90 flex items-center justify-center"></div>
            </div>
          </div>
          {/* Compass grid crosses */}
          <div className="absolute left-0 right-0 h-[0.5px] bg-zinc-800/40"></div>
          <div className="absolute top-0 bottom-0 w-[0.5px] bg-zinc-800/40"></div>
          
          {/* Compass labels */}
          <span className="absolute top-1 text-[8px] font-mono font-medium text-zinc-650">N</span>
          <span className="absolute bottom-1 text-[8px] font-mono font-medium text-zinc-650">S</span>
          <span className="absolute right-1 text-[8px] font-mono font-medium text-zinc-650">E</span>
          <span className="absolute left-1 text-[8px] font-mono font-medium text-zinc-650">W</span>
        </div>

        {/* --- LOCALLY MATCHED RADAR SCENE (distance <= 120 mi) --- */}
        {!isTooFar ? (
          <div className="relative w-full h-full">
            
            {/* Dashed trajectory line between caller city base and project site */}
            {!isSameCity && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line
                  x1="50%"
                  y1="50%"
                  x2={`calc(50% + ${dx}px)`}
                  y2={`calc(50% + ${dy}px)`}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="3 3.5"
                  className="animate-[dash_2s_linear_infinite]"
                />
              </svg>
            )}

            {/* Base Coordinate Center (User's active base city) */}
            <div 
              className="absolute top-1/2 left-1/2 flex flex-col items-center group z-10"
              style={{ transform: "translate(-50%, -100%)" }}
            >
              <UserLocationPin />
              <div className="absolute top-5 bg-zinc-900 border border-zinc-800 text-[8px] text-cyan-200 font-extrabold px-1.5 py-0.25 rounded-md whitespace-nowrap select-none scale-90 group-hover:scale-100 transition shadow-lg opacity-85 pointer-events-none uppercase">
                Base: {userCityName}
              </div>
            </div>

            {/* Project Site Coordinates (Dynamic Offset Marker) */}
            {!isSameCity ? (
              <div 
                className="absolute top-1/2 left-1/2 flex flex-col items-center group z-20"
                style={{ 
                  transform: `translate(calc(-50% + ${dx}px), calc(-100% + ${dy}px))` 
                }}
              >
                <ProjectLocationPin />
                <div className="absolute top-5 bg-rose-950 border border-rose-800 text-[8px] text-rose-100 font-extrabold px-1.5 py-0.25 rounded-md whitespace-nowrap scale-95 group-hover:scale-105 transition shadow-lg opacity-90 pointer-events-none uppercase">
                  Job: {projectCityName}
                </div>
              </div>
            ) : (
              // Same City Overlay Badge
              <div className="absolute top-2 left-2 flex items-center gap-1 text-[8px] bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-bold px-1.5 py-0.5 rounded uppercase">
                <span className="relative flex h-1 w-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-500"></span>
                </span>
                Same City (Local)
              </div>
            )}

            {/* Sweep Light Indicator effect on background */}
            <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 to-transparent pointer-events-none"></div>

          </div>
        ) : (
          /* --- LONG DISTANCE TRANSIT OVERVIEW (distance > 120 mi) --- */
          <div className="w-full h-full flex flex-col justify-between p-2.5">
            <div className="text-[9px] text-zinc-400 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-center font-medium">
              🌍 Different Metropolitan Market Listing ({userCity.state} ➔ {projectCity.state})
            </div>

            {/* Transit visual path */}
            <div className="relative flex items-center justify-between px-3 py-4">
              {/* Curved Connection Path */}
              <svg className="absolute inset-x-0 top-0 h-12 w-full pointer-events-none">
                <path
                  d="M 20 25 Q 90 0 160 25"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.25"
                  strokeDasharray="4 3"
                />
              </svg>

              {/* Start node */}
              <div className="flex flex-col items-center">
                <UserLocationPin />
                <span className="text-[8px] font-bold text-zinc-300 mt-1 uppercase">{userCityName}</span>
              </div>

              {/* Flying direction icon representing far commute */}
              <div className="animate-bounce mb-2">
                <ArrowUpRight className="w-3.5 h-3.5 text-yellow-500" />
              </div>

              {/* End node */}
              <div className="flex flex-col items-center">
                <ProjectLocationPin />
                <span className="text-[8px] font-bold text-zinc-300 mt-1 uppercase">{projectCityName}</span>
              </div>
            </div>

            <div className="text-[8px] text-yellow-500 text-center font-semibold italic bg-amber-950/20 py-0.5 border border-amber-900/30 rounded">
              High mileage out-of-market trade task
            </div>
          </div>
        )}

      </div>

      {/* Compass metadata details footer */}
      <div className="mt-2.5 text-[10px] text-zinc-500 bg-zinc-50 border border-zinc-150 p-1.5 rounded-lg space-y-1">
        <div className="flex justify-between font-medium">
          <span>Heading:</span>
          <span className="text-zinc-800 font-bold">{isSameCity ? "Locally Centered" : `${bearing}° ${directionLabel}`}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Transit Level:</span>
          <span className="text-zinc-800 font-bold">
            {isSameCity ? "None" : distance <= 25 ? "Short Range" : distance <= 70 ? "Standard Range" : "Long Distance"}
          </span>
        </div>
      </div>
    </div>
  );
}
