import React, { useState } from "react";
import { MapPin, Navigation, ExternalLink, ZoomIn, ZoomOut, CheckCircle2, Compass, Layers } from "lucide-react";

interface PropertyCoordinateThumbnailMapProps {
  coordinates: { lat: number; lng: number };
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  compact?: boolean;
  onOpenFullMap?: () => void;
}

function PropertyCoordinateThumbnailMap({
  coordinates,
  address,
  city,
  state,
  zipCode,
  compact = true,
  onOpenFullMap,
}: PropertyCoordinateThumbnailMapProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(2); // 1 = neighborhood, 2 = block/lot, 3 = parcel close-up
  const [mapStyle, setMapStyle] = useState<"blueprint" | "satellite">("blueprint");

  const { lat, lng } = coordinates;
  const latFormatted = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}`;
  const lngFormatted = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;

  // SVG grid lines based on zoom
  const gridDensity = zoomLevel === 1 ? 40 : zoomLevel === 2 ? 25 : 15;

  return (
    <div className="relative group overflow-hidden rounded-2xl border border-amber-300/80 bg-amber-50/40 shadow-xs transition hover:shadow-md hover:border-amber-400">
      {/* Top Header / Coordinate pill */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-amber-100/90 via-orange-50/80 to-amber-100/90 border-b border-amber-200 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-amber-950">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
            📍 Property Location Pin
          </span>
          <span className="font-mono text-[10px] bg-white/90 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-md shadow-2xs">
            {latFormatted}, {lngFormatted}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Zoom controls */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel((prev) => Math.max(1, prev - 1));
            }}
            title="Zoom out"
            className="p-1 text-amber-900 hover:text-amber-950 hover:bg-amber-200/60 rounded-md transition"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel((prev) => Math.min(3, prev + 1));
            }}
            title="Zoom in parcel view"
            className="p-1 text-amber-900 hover:text-amber-950 hover:bg-amber-200/60 rounded-md transition"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {/* Map style toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMapStyle((prev) => (prev === "blueprint" ? "satellite" : "blueprint"));
            }}
            title="Toggle Map Style"
            className="p-1 text-amber-900 hover:text-amber-950 hover:bg-amber-200/60 rounded-md transition"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div className={`relative w-full ${compact ? "h-32 sm:h-36" : "h-48"} overflow-hidden cursor-pointer select-none`}>
        {/* Background Canvas */}
        {mapStyle === "blueprint" ? (
          <div className="absolute inset-0 bg-[#f8f9fa] bg-[radial-gradient(#e9ecef_1px,transparent_1px)] [background-size:16px_16px]">
            {/* SVG street grid simulation */}
            <svg className="w-full h-full opacity-60" viewBox="0 0 400 200" preserveAspectRatio="none">
              <defs>
                <pattern id="streetGrid" width={gridDensity} height={gridDensity} patternUnits="userSpaceOnUse">
                  <path d={`M ${gridDensity} 0 L 0 0 0 ${gridDensity}`} fill="none" stroke="#d1d5db" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#streetGrid)" />
              
              {/* Roads / Main Thoroughfares */}
              <line x1="0" y1="90" x2="400" y2="110" stroke="#fcd34d" strokeWidth="6" strokeLinecap="round" />
              <line x1="0" y1="90" x2="400" y2="110" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 4" />
              <line x1="180" y1="0" x2="220" y2="200" stroke="#e5e7eb" strokeWidth="5" />
              <line x1="280" y1="0" x2="260" y2="200" stroke="#e5e7eb" strokeWidth="4" />
              
              {/* Surrounding parcels / properties */}
              <rect x="70" y="30" width="45" height="40" rx="3" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="1" />
              <rect x="125" y="35" width="45" height="35" rx="3" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" />
              <rect x="235" y="40" width="50" height="40" rx="3" fill="#fef3c7" stroke="#fde68a" strokeWidth="1" />
              
              {/* Target Property Lot (Highlighted) */}
              <rect
                x="175"
                y="65"
                width={zoomLevel === 1 ? 30 : zoomLevel === 2 ? 50 : 70}
                height={zoomLevel === 1 ? 25 : zoomLevel === 2 ? 40 : 55}
                rx="4"
                fill="#fef08a"
                fillOpacity="0.85"
                stroke="#d97706"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            </svg>
          </div>
        ) : (
          <div className="absolute inset-0 bg-[#1e293b]">
            {/* Satellite Lot Style */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_50%,#0f766e_0%,#0f172a_80%)]" />
            <svg className="w-full h-full opacity-70" viewBox="0 0 400 200" preserveAspectRatio="none">
              <path d="M 0,100 Q 150,80 400,120" stroke="#64748b" strokeWidth="8" fill="none" />
              <rect x="175" y="70" width="50" height="45" rx="3" fill="#047857" fillOpacity="0.4" stroke="#34d399" strokeWidth="1.5" />
            </svg>
          </div>
        )}

        {/* Center Target Crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Pulsing radius ring */}
          <div className="absolute w-16 h-16 rounded-full border-2 border-amber-500/40 bg-amber-400/20 animate-ping" />
          <div className="absolute w-28 h-28 rounded-full border border-amber-400/30 border-dashed" />
          
          {/* Animated Pin */}
          <div className="relative flex flex-col items-center -translate-y-3 z-10">
            <div className="bg-amber-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white ring-2 ring-amber-400 animate-bounce duration-1000">
              <MapPin className="w-4 h-4 fill-white text-amber-600" />
            </div>
            <div className="w-2 h-1 bg-zinc-900/40 rounded-full blur-[1px] -mt-0.5" />
          </div>
        </div>

        {/* Floating Property Address & GPS Chip */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-amber-200/80 shadow-xs flex items-center gap-1.5 text-[11px] font-semibold text-zinc-900 max-w-[70%] truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              {address ? `${address}, ` : ""}{city || ""}{state ? `, ${state}` : ""}
            </span>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] rounded-xl shadow-xs transition cursor-pointer shrink-0"
            title="Open exact pin in Google Maps"
          >
            <span>Open Map</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default React.memo(PropertyCoordinateThumbnailMap);
