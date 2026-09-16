import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function FloatingScrollTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsVisible(window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 bg-zinc-950/95 hover:bg-zinc-900 text-amber-400 p-3 rounded-full shadow-2xl border border-amber-500/40 backdrop-blur-md transition-transform duration-150 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center group"
      title="Back to Top & Filters"
      id="touch-scroll-to-top-btn"
      aria-label="Scroll back to top"
    >
      <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform text-white" />
    </button>
  );
}
