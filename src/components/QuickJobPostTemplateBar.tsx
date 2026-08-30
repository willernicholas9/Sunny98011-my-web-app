import React from "react";
import { Sparkles, Zap, Flame, ShieldCheck, Plus, CheckCircle2, ArrowRight, DollarSign } from "lucide-react";

interface QuickTemplate {
  icon: string;
  name: string;
  trade: string;
  defaultBudget: number;
  description: string;
  badge?: string;
}

const TEMPLATES: QuickTemplate[] = [
  {
    icon: "🌱",
    name: "Yard Cleanup & Mulching",
    trade: "Landscaping",
    defaultBudget: 350,
    description: "Spread 4 yards of premium dark hardwood mulch, edge garden beds, trim overgrown shrubs, and haul away brush debris.",
    badge: "Popular",
  },
  {
    icon: "🚰",
    name: "Emergency Pipe / Faucet Leak",
    trade: "Plumbing",
    defaultBudget: 220,
    description: "Fix leaking pipe / shutoff valve under bathroom vanity and inspect drain lines for water damage or pressure drops.",
    badge: "Fast Pro",
  },
  {
    icon: "⚡",
    name: "EV Charger / 240V Outlet",
    trade: "Electrical",
    defaultBudget: 650,
    description: "Install dedicated NEMA 14-50 50A breaker circuit from main panel to garage for Level 2 EV charging station.",
    badge: "High Value",
  },
  {
    icon: "🎨",
    name: "Interior Room Painting",
    trade: "Painting",
    defaultBudget: 480,
    description: "Prep walls, spackle drywall holes, tape trim, and apply two coats of premium satin paint in master bedroom (14x16 ft).",
  },
  {
    icon: "🔨",
    name: "Drywall Patch & Texture",
    trade: "Drywall & Framing",
    defaultBudget: 275,
    description: "Repair two 12x12-inch drywall cutouts from plumbing inspection, blend orange-peel texture, and prime ready for paint.",
  },
  {
    icon: "🏠",
    name: "Gutter Guard Install & Clean",
    trade: "Gutter & Siding",
    defaultBudget: 390,
    description: "Clean out 140 linear ft of roof gutters, flush downspouts, and install stainless micro-mesh gutter guards.",
  },
  {
    icon: "📺",
    name: "TV Wall Mount & Cable Conceal",
    trade: "Handyman",
    defaultBudget: 150,
    description: "Mount 65-inch 4K OLED TV onto drywall with wood studs, conceal power and HDMI cables behind wall with in-wall kit.",
  },
];

interface QuickJobPostTemplateBarProps {
  onSelectTemplate: (template: { title: string; description: string; budget: number; tradeCategory?: string }) => void;
  onOpenCustomPost: () => void;
  onOpenRushDispatch: () => void;
}

export default function QuickJobPostTemplateBar({
  onSelectTemplate,
  onOpenCustomPost,
  onOpenRushDispatch,
}: QuickJobPostTemplateBarProps) {
  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 border border-amber-500/20 rounded-3xl p-3 sm:p-4 space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-amber-500 text-slate-950">
            <Zap className="w-3.5 h-3.5" />
          </span>
          <h4 className="font-display font-black text-xs sm:text-sm text-zinc-900 leading-tight">
            Fast 15-Second Job Launcher
          </h4>
          <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
            1-Click Pre-Filled Scope
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenRushDispatch}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[10px] sm:text-xs font-black transition cursor-pointer shadow-xs active:scale-95"
            id="quick-rush-dispatch-launcher-btn"
          >
            <Flame className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            <span>Rush Priority Pro ($25)</span>
          </button>

          <button
            type="button"
            onClick={onOpenCustomPost}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-950 hover:bg-zinc-800 text-amber-400 text-[10px] sm:text-xs font-black transition cursor-pointer shadow-xs active:scale-95"
            id="quick-post-custom-vacancy-btn"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span className="text-white">Custom Vacancy</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Template Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
        {TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.name}
            type="button"
            onClick={() => {
              onSelectTemplate({
                title: `${tmpl.trade}: ${tmpl.name}`,
                description: tmpl.description,
                budget: tmpl.defaultBudget,
                tradeCategory: tmpl.trade,
              });
            }}
            className="snap-start shrink-0 flex items-center gap-2 px-3 py-2 bg-white hover:bg-amber-50 hover:border-amber-400 border border-zinc-200 rounded-2xl shadow-3xs transition cursor-pointer group active:scale-95 text-left"
          >
            <span className="text-base group-hover:scale-110 transition">{tmpl.icon}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xs text-zinc-900 group-hover:text-amber-900 whitespace-nowrap">
                  {tmpl.name}
                </span>
                {tmpl.badge && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900">
                    {tmpl.badge}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
                <span className="text-emerald-700 font-bold font-mono">Avg ${tmpl.defaultBudget}</span>
                <span>•</span>
                <span>{tmpl.trade}</span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-amber-600 transition shrink-0 ml-1" />
          </button>
        ))}
      </div>
    </div>
  );
}
