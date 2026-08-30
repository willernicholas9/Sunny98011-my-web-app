import React, { useState, useRef, useCallback } from "react";
import { MoveHorizontal, Sparkles } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
  className?: string;
  heightClass?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "Completed (After)",
  title,
  className = "",
  heightClass = "h-64 sm:h-80 md:h-96",
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 2) percentage = 2;
    if (percentage > 98) percentage = 98;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  }, [handleMove]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  return (
    <div className={`space-y-2 ${className}`}>
      {title && (
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 line-clamp-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{title}</span>
          </h4>
          <span className="text-[10px] text-zinc-650 font-mono">
            Drag slider to compare
          </span>
        </div>
      )}

      <div
        ref={containerRef}
        className={`relative w-full ${heightClass} rounded-2xl overflow-hidden select-none cursor-ew-resize bg-zinc-900 border border-zinc-200 shadow-md group`}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onTouchStart={(e) => {
          if (e.touches.length > 0) handleMove(e.touches[0].clientX);
        }}
        id="before-after-slider-container"
      >
        {/* Full After Image (Background) */}
        <img
          src={afterImage}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />

        {/* Clipped Before Image (Foreground overlay) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="absolute top-0 left-0 max-w-none h-full object-cover"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%",
            }}
            loading="lazy"
          />
          {/* Subtle gradient shadow along the divider */}
          <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-r from-transparent to-black/30 pointer-events-none" />
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[11px] font-black px-2.5 py-1 rounded-lg pointer-events-none shadow-sm flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span>{beforeLabel}</span>
        </div>
        <div className="absolute top-3 right-3 bg-emerald-600/90 backdrop-blur-xs text-white text-[11px] font-black px-2.5 py-1 rounded-lg pointer-events-none shadow-sm flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          <span>{afterLabel}</span>
        </div>

        {/* Divider Handle */}
        <div
          className="absolute inset-y-0 -ml-0.5 w-1 bg-white shadow-2xl pointer-events-none flex items-center justify-center"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-8 h-8 -ml-3.5 rounded-full bg-white text-zinc-900 shadow-xl border-2 border-amber-500 flex items-center justify-center transform transition-transform group-hover:scale-110">
            <MoveHorizontal className="w-4 h-4 text-amber-700" />
          </div>
        </div>

        {/* Instruction overlay badge on bottom */}
        <div className="absolute bottom-2.5 left-1/2 transform -translate-x-1/2 bg-zinc-950/70 backdrop-blur-xs text-white/90 text-[10px] font-bold px-3 py-1 rounded-full pointer-events-none border border-white/10">
          ↔ Slide or tap to inspect transformation
        </div>
      </div>
    </div>
  );
}
