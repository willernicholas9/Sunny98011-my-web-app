import React, { useState } from "react";
import { X, Users, HardHat, Plus, Filter, MapPin, DollarSign, Calendar, ShieldCheck, CheckCircle, Search, MessageSquare, Briefcase } from "lucide-react";
import { SubcontractorCrewPost, TRADE_OPTIONS } from "../types";

interface SubcontractorCrewBoardModalProps {
  onClose: () => void;
  currentUser?: any;
  onOpenChat?: (recipientId: string, recipientName: string, recipientRole: "customer" | "contractor") => void;
}

const INITIAL_CREW_POSTS: SubcontractorCrewPost[] = [
  {
    id: "crew-1",
    creatorId: "gc-101",
    creatorName: "Apex Commercial General Contractors",
    creatorCompany: "Apex Builders LLC",
    creatorRole: "gc_seeking_crew",
    trade: "General Handyman Projects",
    title: "Need 2 Experienced Drywall Finishers / Tapers for Commercial Office",
    description: "Hang and Level-4 finish 40 sheets of 5/8\" drywall. Mud, tape, and sand ready for paint. All scaffolding and lifts provided on job site.",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    crewSize: 2,
    dayRateOrBudget: 380,
    durationDays: 3,
    startDate: "Tomorrow Morning (7:00 AM)",
    insuranceRequired: true,
    toolsProvided: true,
    status: "open",
    applicantsCount: 4,
    createdAt: "2026-06-12T10:00:00Z",
  },
  {
    id: "crew-2",
    creatorId: "sub-202",
    creatorName: "Precision Tile & Stone Crew",
    creatorCompany: "Precision Tile Masters",
    creatorRole: "sub_available",
    trade: "Plumbing Repair",
    title: "3-Man Tile & Waterproofing Crew Available for Subcontract",
    description: "Schluter-certified master tile setters with wet saws, laser levels, and complete tool rigs. Available for bathroom remodels, kitchen backsplashes, and commercial floors.",
    city: "Detroit",
    state: "MI",
    zipCode: "48226",
    crewSize: 3,
    dayRateOrBudget: 950,
    durationDays: 5,
    startDate: "Available Immediately",
    insuranceRequired: true,
    toolsProvided: true,
    status: "open",
    applicantsCount: 7,
    createdAt: "2026-06-11T14:30:00Z",
  },
  {
    id: "crew-3",
    creatorId: "gc-103",
    creatorName: "Lakeshore Residential Restorations",
    creatorCompany: "Lakeshore Restorations",
    creatorRole: "gc_seeking_crew",
    trade: "Landscaping",
    title: "Seeking 4-Person Landscaping & Sod Crew for Subdivision Grading",
    description: "Need strong crew to lay 12 pallets of Kentucky Bluegrass sod and spread 30 yards of topsoil. Bobcat operator on site.",
    city: "Grand Rapids",
    state: "MI",
    zipCode: "49503",
    crewSize: 4,
    dayRateOrBudget: 1200,
    durationDays: 2,
    startDate: "This Thursday",
    insuranceRequired: false,
    toolsProvided: true,
    status: "open",
    applicantsCount: 3,
    createdAt: "2026-06-10T16:00:00Z",
  },
  {
    id: "crew-4",
    creatorId: "sub-204",
    creatorName: "VoltGuard Master Electricians",
    creatorCompany: "VoltGuard Power Systems",
    creatorRole: "sub_available",
    trade: "Electrical Maintenance",
    title: "Licensed Master Electrician Available for Commercial Panel Pulls & EV Sub-Panels",
    description: "Fully licensed & insured master electrician available for rough-ins, service upgrades, and municipal inspection walk-throughs.",
    city: "Austin",
    state: "TX",
    zipCode: "78704",
    crewSize: 1,
    dayRateOrBudget: 650,
    durationDays: 1,
    startDate: "Flexible / On-Call",
    insuranceRequired: true,
    toolsProvided: true,
    status: "open",
    applicantsCount: 9,
    createdAt: "2026-06-09T08:15:00Z",
  },
];

export default function SubcontractorCrewBoardModal({
  onClose,
  currentUser,
  onOpenChat,
}: SubcontractorCrewBoardModalProps) {
  const [posts, setPosts] = useState<SubcontractorCrewPost[]>(INITIAL_CREW_POSTS);
  const [filterRole, setFilterRole] = useState<"all" | "gc_seeking_crew" | "sub_available">("all");
  const [filterTrade, setFilterTrade] = useState<string>("all");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedToast, setAppliedToast] = useState<string | null>(null);

  // New post form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState<"gc_seeking_crew" | "sub_available">("gc_seeking_crew");
  const [trade, setTrade] = useState("General Handyman Projects");
  const [city, setCity] = useState(currentUser?.city || "Austin");
  const [state, setState] = useState(currentUser?.state || "TX");
  const [crewSize, setCrewSize] = useState(2);
  const [dayRate, setDayRate] = useState(350);
  const [durationDays, setDurationDays] = useState(3);
  const [startDate, setStartDate] = useState("Tomorrow");
  const [insuranceRequired, setInsuranceRequired] = useState(true);

  const filteredPosts = posts.filter((p) => {
    if (filterRole !== "all" && p.creatorRole !== filterRole) return false;
    if (filterTrade !== "all" && p.trade.toLowerCase() !== filterTrade.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.creatorCompany.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const newPost: SubcontractorCrewPost = {
      id: `crew-${Date.now()}`,
      creatorId: currentUser?.id || "user-temp",
      creatorName: currentUser?.fullName || "General Contractor Partner",
      creatorCompany: currentUser?.company || "Trade Network Partner",
      creatorRole: role,
      trade,
      title,
      description,
      city,
      state,
      zipCode: currentUser?.zipCode || "78701",
      crewSize,
      dayRateOrBudget: dayRate,
      durationDays,
      startDate,
      insuranceRequired,
      toolsProvided: true,
      status: "open",
      applicantsCount: 0,
      createdAt: new Date().toISOString(),
    };

    setPosts([newPost, ...posts]);
    setIsCreatingPost(false);
    setTitle("");
    setDescription("");
    setAppliedToast("Your Subcontractor Crew listing has been published to the B2B network!");
    setTimeout(() => setAppliedToast(null), 3500);
  };

  const handleApply = (post: SubcontractorCrewPost) => {
    setPosts(
      posts.map((p) => (p.id === post.id ? { ...p, applicantsCount: p.applicantsCount + 1 } : p))
    );
    setAppliedToast(`Application & Escrow Lock sent to ${post.creatorCompany}! They will be notified via SMS.`);
    setTimeout(() => setAppliedToast(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="bg-white max-w-4xl w-full rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        id="subcontractor-crew-board-modal"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-900 text-white border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-sm sm:text-base text-white">
                  Subcontractor Crew & B2B Day-Labor Board
                </h3>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                  Contractor Network
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Connect General Contractors with certified sub-trade crews and specialized day labor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingPost(!isCreatingPost)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              id="post-crew-listing-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Crew Listing</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Alert Toast */}
        {appliedToast && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{appliedToast}</span>
            </div>
            <button onClick={() => setAppliedToast(null)} className="text-white font-bold">✕</button>
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex bg-zinc-200 p-1 rounded-xl font-bold">
            <button
              type="button"
              onClick={() => setFilterRole("all")}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                filterRole === "all" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              All Listings ({posts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterRole("gc_seeking_crew")}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                filterRole === "gc_seeking_crew" ? "bg-amber-500 text-slate-950 font-extrabold shadow-xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              👷 Crew Wanted (GCs)
            </button>
            <button
              type="button"
              onClick={() => setFilterRole("sub_available")}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                filterRole === "sub_available" ? "bg-amber-500 text-slate-950 font-extrabold shadow-xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              🛠️ Sub Crew Available
            </button>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search trades, city, crew..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-zinc-100/60">
          {/* Create Listing Accordion */}
          {isCreatingPost && (
            <form
              onSubmit={handleCreatePost}
              className="bg-white border-2 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
              id="new-crew-listing-form"
            >
              <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-zinc-900 text-sm sm:text-base">
                      Publish Subcontractor / Crew Request
                    </h4>
                    <p className="text-[11px] text-zinc-500">
                      Reach certified tradesmen, specialized sub-crews, and equipment operators
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingPost(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-700 font-bold"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-zinc-700">Listing Type *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    <option value="gc_seeking_crew">👷 General Contractor Seeking Sub Crew</option>
                    <option value="sub_available">🛠️ Subcontractor Crew Ready for Hire</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-zinc-700">Trade Category *</label>
                  <select
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    {TRADE_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-700">Listing Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Need 2 Finish Drywallers for 3 Days on Commercial Remodel"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-zinc-700">Crew Size</label>
                    <input
                      type="number"
                      min="1"
                      value={crewSize}
                      onChange={(e) => setCrewSize(Number(e.target.value))}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-center focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-zinc-700">Day Rate / Budget ($)</label>
                    <input
                      type="number"
                      min="50"
                      value={dayRate}
                      onChange={(e) => setDayRate(Number(e.target.value))}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-center focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-zinc-700">Est. Duration (Days)</label>
                    <input
                      type="number"
                      min="1"
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-center focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-zinc-700">City & State</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State"
                        className="w-16 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium text-center focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-zinc-700">Target Start Date</label>
                    <input
                      type="text"
                      placeholder="e.g. Immediate / This Thursday"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-700">Scope of Work & Jobsite Details *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Describe specific trade requirements, tools needed, and jobsite access..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingPost(false)}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2 rounded-xl text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Publish Crew Listing</span>
                </button>
              </div>
            </form>
          )}

          {/* Listings List */}
          <div className="space-y-3">
            {filteredPosts.map((post) => {
              const isGC = post.creatorRole === "gc_seeking_crew";

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-2xs hover:shadow-md transition space-y-3"
                  id={`crew-post-${post.id}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            isGC
                              ? "bg-amber-100 text-amber-900 border-amber-300"
                              : "bg-blue-100 text-blue-900 border-blue-300"
                          }`}
                        >
                          {isGC ? "👷 Crew Wanted" : "🛠️ Sub Available"}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md">
                          {post.trade}
                        </span>
                        <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-400" />
                          {post.city}, {post.state}
                        </span>
                      </div>

                      <h4 className="font-display font-black text-sm sm:text-base text-zinc-900">
                        {post.title}
                      </h4>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {post.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-display font-black text-base sm:text-lg text-zinc-900 block font-mono">
                        ${post.dayRateOrBudget}/day
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500 block">
                        {post.crewSize} Pro{post.crewSize > 1 ? "s" : ""} &bull; {post.durationDays} Days
                      </span>
                    </div>
                  </div>

                  {/* Meta Bar & Apply Action */}
                  <div className="pt-3 border-t border-zinc-150 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                      <span><strong>Posted by:</strong> {post.creatorCompany}</span>
                      <span>&bull;</span>
                      <span><strong>Start:</strong> {post.startDate}</span>
                      <span>&bull;</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Escrow Day-Rate Guaranteed</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {onOpenChat && (
                        <button
                          type="button"
                          onClick={() => onOpenChat(post.creatorId, post.creatorCompany || post.creatorName, "contractor")}
                          className="bg-zinc-150 hover:bg-zinc-200 text-zinc-800 font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-zinc-600" />
                          <span>Chat</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleApply(post)}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{isGC ? "Apply to Crew Request" : "Hire Subcontractor Crew"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
