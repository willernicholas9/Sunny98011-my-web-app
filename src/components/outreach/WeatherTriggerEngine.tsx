import React, { useState } from "react";
import {
  Zap, CloudRain, Sun, Snowflake, AlertTriangle, ShieldCheck,
  TrendingUp, RefreshCw, CheckCircle2, ArrowRight, DollarSign,
  Radio, Compass, MapPin
} from "lucide-react";

interface WeatherTriggerEngineProps {
  onApplyWeatherBlitz?: (weatherData: {
    event: string;
    trade: string;
    zips: string;
    headline: string;
  }) => void;
}

export default function WeatherTriggerEngine({
  onApplyWeatherBlitz,
}: WeatherTriggerEngineProps) {
  const [autoWeatherTriggerEnabled, setAutoWeatherTriggerEnabled] = useState(true);
  const [selectedPresetEvent, setSelectedPresetEvent] = useState<string>("hail_storm");
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const WEATHER_EVENTS = [
    {
      id: "hail_storm",
      title: "Severe Hail & High Wind Storm (Dallas / North Texas)",
      icon: CloudRain,
      color: "border-blue-300 bg-blue-50/70",
      badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
      urgency: "HIGH PRIORITY",
      targetZips: "75201, 75001, 76101, 75034, 75024",
      primaryTrade: "Roofing & Gutter Guard Repair",
      adAngle: "Post-Hailstorm Free Roof Damage Inspection & Tarping. Direct licensed local bids with zero broker markup.",
      budgetBoost: "+40% spend to Nextdoor & Google LSA",
    },
    {
      id: "deep_freeze",
      title: "Sudden Arctic Deep Freeze (Central US / Midwest)",
      icon: Snowflake,
      color: "border-cyan-300 bg-cyan-50/70",
      badgeColor: "bg-cyan-100 text-cyan-900 border-cyan-300",
      urgency: "CRITICAL 24/7",
      targetZips: "60601, 63101, 55401, 48201, 53201",
      primaryTrade: "Plumbing, Burst Pipe Repair & Water Heaters",
      adAngle: "Emergency Freeze Plumbing Dispatch: Fast response for burst pipes, shutoff valve replacement, and insulated wraps.",
      budgetBoost: "+60% spend to SMS & Urgent Search",
    },
    {
      id: "summer_heatwave",
      title: "104°F Extreme Summer Heatwave (Texas / Southwest)",
      icon: Sun,
      color: "border-amber-300 bg-amber-50/70",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
      urgency: "SEASONAL PEAK",
      targetZips: "78701, 77001, 78201, 85001, 89101",
      primaryTrade: "HVAC & AC Compressor Repair",
      adAngle: "Emergency AC Repair & Capacitor Swap. Compare licensed local technician bids in minutes with escrow protection.",
      budgetBoost: "+35% spend to Facebook & Nextdoor",
    },
  ];

  const handleApply = (evt: typeof WEATHER_EVENTS[0]) => {
    if (onApplyWeatherBlitz) {
      onApplyWeatherBlitz({
        event: evt.title,
        trade: evt.primaryTrade,
        zips: evt.targetZips,
        headline: evt.adAngle,
      });
    }
    setAppliedNotice(`✔ Dispatched Emergency Weather Blitz for "${evt.title}" across target zip codes!`);
    setTimeout(() => setAppliedNotice(null), 4000);
  };

  return (
    <div className="bg-white border border-blue-900/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6" id="weather-trigger-engine">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-amber-300 shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
            <span>Autonomous Weather & Demand Trigger Engine</span>
          </div>
          <h2 className="text-2xl font-black font-display text-zinc-900 tracking-tight flex items-center gap-2">
            <span>Severe Weather & Emergency Repair Response System</span>
          </h2>
          <p className="text-xs text-zinc-600 leading-relaxed max-w-3xl">
            When severe weather strikes (hailstorms, pipe-burst freezes, summer heatwaves), the AI Agent automatically shifts ad budgets to high-urgency repair services in affected zip codes.
          </p>
        </div>

        <label className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-2xl cursor-pointer hover:bg-zinc-100 transition shrink-0">
          <input
            type="checkbox"
            checked={autoWeatherTriggerEnabled}
            onChange={(e) => setAutoWeatherTriggerEnabled(e.target.checked)}
            className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
          />
          <div className="text-xs">
            <div className="font-extrabold text-zinc-900">Auto Weather Sensor</div>
            <div className="text-[10px] text-zinc-500">Autonomous reallocation</div>
          </div>
        </label>
      </div>

      {appliedNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{appliedNotice}</span>
        </div>
      )}

      {/* Weather Trigger Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {WEATHER_EVENTS.map((evt) => {
          const EvtIcon = evt.icon;
          return (
            <div
              key={evt.id}
              className={`rounded-2xl border p-5 space-y-3 transition flex flex-col justify-between shadow-2xs ${evt.color}`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shadow-2xs">
                    <EvtIcon className="w-4 h-4 text-zinc-900" />
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${evt.badgeColor}`}>
                    {evt.urgency}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-xs text-zinc-900 leading-snug">
                    {evt.title}
                  </h3>
                  <div className="text-[11px] font-bold text-zinc-700 mt-1">
                    Focus: <span className="text-red-700 font-extrabold">{evt.primaryTrade}</span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-600 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-zinc-200/80">
                  {evt.adAngle}
                </p>

                <div className="text-[10px] font-mono text-zinc-600 bg-white/90 px-2.5 py-1.5 rounded-lg border border-zinc-200 truncate">
                  <strong className="text-zinc-900">Zips:</strong> {evt.targetZips}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200/80 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-zinc-700">{evt.budgetBoost}</span>
                <button
                  type="button"
                  onClick={() => handleApply(evt)}
                  className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer shadow-3xs"
                >
                  <span>Launch Blitz</span>
                  <ArrowRight className="w-3 h-3 text-amber-300" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
