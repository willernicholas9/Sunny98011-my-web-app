import React, { useState } from "react";
import { X, AlertTriangle, Zap, Phone, Clock, ShieldAlert, CheckCircle, MapPin, Send, Flame, Sparkles } from "lucide-react";
import { Project, ContractorUser, TRADE_OPTIONS } from "../types";

interface EmergencyDispatchModalProps {
  onClose: () => void;
  onDispatchEmergency?: (emergencyProject: Partial<Project>) => void;
  onDispatchSuccess?: (emergencyProject: any) => void;
  availableContractors?: ContractorUser[];
  currentUser?: any;
}

const EMERGENCY_CATEGORIES = [
  {
    id: "plumbing",
    label: "Burst Pipe / Major Water Leak",
    trade: "Plumbing Repair",
    icon: "💧",
    typicalCost: "$350 - $950",
    desc: "Active water leak, failed water heater, sump pump failure, or pipe burst.",
  },
  {
    id: "electrical",
    label: "Power Outage / Electrical Arcing",
    trade: "Electrical Maintenance",
    icon: "⚡",
    typicalCost: "$250 - $800",
    desc: "Sparks, tripped main breaker, burning smell, or localized circuit outage.",
  },
  {
    id: "roofing",
    label: "Storm Damage / Active Roof Leak",
    trade: "General Handyman Projects",
    icon: "🌪️",
    typicalCost: "$400 - $1,200",
    desc: "Water penetrating ceiling, missing shingles, fallen tree branch emergency tarping.",
  },
  {
    id: "hvac",
    label: "Furnace / A/C Failure in Extreme Weather",
    trade: "General Handyman Projects",
    icon: "❄️",
    typicalCost: "$280 - $750",
    desc: "No heat during winter freeze or broken cooling during severe heat advisory.",
  },
  {
    id: "locksmith",
    label: "Lockout / Broken Secure Entry",
    trade: "General Handyman Projects",
    icon: "🔑",
    typicalCost: "$150 - $350",
    desc: "Locked out of property, broken deadbolt, or forced entry security repair.",
  },
  {
    id: "other",
    label: "Other Urgent Trade Emergency",
    trade: "General Handyman Projects",
    icon: "🚨",
    typicalCost: "$200 - $900",
    desc: "Immediate hazard requiring same-day professional attention.",
  },
];

export default function EmergencyDispatchModal({
  onClose,
  onDispatchEmergency,
  onDispatchSuccess,
  availableContractors = [],
  currentUser,
}: EmergencyDispatchModalProps) {
  const [selectedCategory, setSelectedCategory] = useState(EMERGENCY_CATEGORIES[0]);
  const [address, setAddress] = useState(currentUser?.address || "704 Congress Ave");
  const [city, setCity] = useState(currentUser?.city || "Austin");
  const [state, setState] = useState(currentUser?.state || "TX");
  const [zipCode, setZipCode] = useState(currentUser?.zipCode || "78701");
  const [phone, setPhone] = useState(currentUser?.phone || "512-555-0199");
  const [emergencyDetails, setEmergencyDetails] = useState("");
  const [targetEta, setTargetEta] = useState<number>(30); // 30 mins
  const [isDispatched, setIsDispatched] = useState(false);
  const [dispatchedCount, setDispatchedCount] = useState(0);

  // Count active on-call contractors in the area
  const onCallPros = availableContractors.filter((c) => c.availableNow !== false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emergencyProject: Partial<Project> = {
      id: `proj-emerg-${Date.now()}`,
      title: `🚨 EMERGENCY: ${selectedCategory.label}`,
      description: `[24/7 RAPID DISPATCH: ETA < ${targetEta} mins]\n${emergencyDetails || selectedCategory.desc}\n\nUrgent Homeowner Phone: ${phone}`,
      budget: targetEta <= 30 ? 550 : 400,
      type: "home",
      city: city || "Austin",
      state: state || "TX",
      zipCode: zipCode || "78701",
      address: address || "Emergency Jobsite",
      customerFirstName: currentUser?.fullName ? currentUser.fullName.split(" ")[0] : "Emergency",
      customerLastName: currentUser?.fullName ? currentUser.fullName.split(" ")[1] || "Client" : "Homeowner",
      customerPhone: phone,
      customerEmail: currentUser?.email || "urgent@workshop.com",
      status: "open",
      agreedByCustomer: false,
      agreedByContractor: false,
      createdAt: new Date().toISOString(),
      serviceFeeCharge: 5,
      isEmergency: true,
      emergencyCategory: selectedCategory.trade as any,
      isBoosted: true,
      boostTier: "urgent_rush",
      images: [
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80",
      ],
      emergencyPhoneContact: phone,
      emergencyEtaMinutes: targetEta,
    };

    if (onDispatchSuccess) {
      onDispatchSuccess(emergencyProject);
    } else if (onDispatchEmergency) {
      onDispatchEmergency(emergencyProject);
    }
    setDispatchedCount(Math.max(3, onCallPros.length));
    setIsDispatched(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="bg-white max-w-2xl w-full rounded-3xl border-2 border-rose-500 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        id="emergency-dispatch-modal"
      >
        {/* Urgent Emergency Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-rose-600 flex items-center justify-center shadow-lg animate-pulse">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-base sm:text-lg text-white">
                  24/7 Rapid Emergency Dispatch
                </h3>
                <span className="bg-white/20 text-white font-mono text-[10px] font-black px-2 py-0.5 rounded-full border border-white/30 uppercase tracking-wider animate-pulse">
                  On-Call Pro Siren
                </span>
              </div>
              <p className="text-xs text-rose-100 font-medium">
                Live contractor broadcast for water leaks, power outages, and storm damage
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-rose-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isDispatched ? (
          /* Confirmation Screen */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-black text-2xl text-zinc-900">
                Emergency Dispatch Broadcasted!
              </h3>
              <p className="text-sm text-zinc-600 max-w-md mx-auto">
                We have instantly alerted <strong>{dispatchedCount} verified on-call trade pros</strong> within your area. Expected response within <strong>{targetEta} minutes</strong>.
              </p>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-left space-y-2 max-w-md mx-auto text-xs">
              <div className="flex items-center justify-between text-rose-900 font-bold">
                <span>Category:</span>
                <span>{selectedCategory.label}</span>
              </div>
              <div className="flex items-center justify-between text-rose-900 font-bold">
                <span>Direct Callback Phone:</span>
                <span>{phone}</span>
              </div>
              <div className="flex items-center justify-between text-rose-900 font-bold">
                <span>Target Arrival ETA:</span>
                <span className="text-emerald-700 font-extrabold">&lt; {targetEta} Minutes</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-black px-6 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-md"
              >
                View Live Job on Project Forum
              </button>
            </div>
          </div>
        ) : (
          /* Emergency Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
            {/* Live On-Call Alert Bar */}
            <div className="bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-300 rounded-2xl p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-900 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>{onCallPros.length || 6} Certified On-Call Contractors Available Now</span>
              </div>
              <span className="text-amber-800 font-mono font-black text-[11px]">
                ⚡ Avg Response: 14 mins
              </span>
            </div>

            {/* Step 1: Select Emergency Category */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-zinc-700">
                1. Select Emergency Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {EMERGENCY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                      selectedCategory.id === cat.id
                        ? "bg-rose-50 border-2 border-rose-500 shadow-xs"
                        : "bg-white border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <span className="text-2xl shrink-0">{cat.icon}</span>
                    <div className="space-y-0.5 flex-1">
                      <p className="text-xs font-black text-zinc-900 leading-snug">{cat.label}</p>
                      <p className="text-[10px] text-zinc-500 line-clamp-1">{cat.desc}</p>
                      <span className="text-[10px] text-emerald-700 font-bold block pt-0.5">
                        Typical: {cat.typicalCost}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Desired Response ETA */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-zinc-700">
                2. Target Arrival Window
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mins: 30, label: "Immediate (<30m)", badge: "Priority Rush" },
                  { mins: 60, label: "Under 1 Hour", badge: "Standard Urgent" },
                  { mins: 120, label: "Same Day (<2h)", badge: "Flexible Today" },
                ].map((item) => (
                  <button
                    key={item.mins}
                    type="button"
                    onClick={() => setTargetEta(item.mins)}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      targetEta === item.mins
                        ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                        : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                    }`}
                  >
                    <Clock className={`w-3.5 h-3.5 mx-auto mb-1 ${targetEta === item.mins ? "text-amber-400" : "text-zinc-500"}`} />
                    <p className="text-xs font-extrabold leading-tight">{item.label}</p>
                    <span className="text-[9px] font-mono opacity-80">{item.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Location & Contact */}
            <div className="space-y-3 bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
              <label className="block text-xs font-black uppercase tracking-wider text-zinc-700">
                3. Incident Location & Callback Phone
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-[11px] font-bold text-zinc-600">
                    Direct Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 704 Congress Ave"
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-zinc-600">
                    City & State *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State"
                      className="w-16 bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-medium text-center focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-zinc-600">
                    Direct Callback Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="512-555-0199"
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-[11px] font-bold text-zinc-600">
                    Describe Immediate Hazard (Shutoffs, Active Leaks, Hazards)
                  </label>
                  <textarea
                    rows={2}
                    value={emergencyDetails}
                    onChange={(e) => setEmergencyDetails(e.target.value)}
                    placeholder="e.g. Water shutoff valve stuck, water spraying in master basement..."
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Submit Emergency Broadcast Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              id="broadcast-emergency-btn"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>Broadcast Emergency Siren to {onCallPros.length || 6} On-Call Pros</span>
            </button>

            <p className="text-center text-[11px] text-zinc-500 font-medium">
              🛡️ No dispatch surcharge. Homeowner only pays accepted contractor quote upon completion.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
