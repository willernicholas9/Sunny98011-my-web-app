import React, { useState, useMemo } from "react";
import { EmailLog } from "../types";
import { 
  Mail, CheckCircle2, Trash2, Shield, Clock, Sparkles, Search, 
  Download, Copy, Check, Eye, X, Send, AlertTriangle, Filter, RefreshCw, FileText, ChevronRight
} from "lucide-react";

interface EmailSimulatorProps {
  logs: EmailLog[];
  onClearLogs: () => void;
  onAddLog?: (log: EmailLog) => void;
  onDeleteLog?: (logId: string) => void;
  onClose: () => void;
}

export default function EmailSimulator({ 
  logs, 
  onClearLogs, 
  onAddLog, 
  onDeleteLog, 
  onClose 
}: EmailSimulatorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [inspectingLog, setInspectingLog] = useState<EmailLog | null>(null);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);
  const [showSimulateActions, setShowSimulateActions] = useState(true);

  // Filter logs based on category and search query
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        !searchTerm ||
        log.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.id.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === "all") return true;
      if (selectedCategory === "radius") return log.category === "radius_alert" || log.subject.includes("RADIUS");
      if (selectedCategory === "bids") return log.category === "bid_negotiation" || log.subject.includes("NEGOTIATION") || log.subject.includes("Offer") || log.subject.includes("Bid");
      if (selectedCategory === "outreach") return log.category === "outreach" || log.subject.includes("Campaign") || log.subject.includes("Newsletter");
      if (selectedCategory === "system") return log.category === "system" || log.category === "welcome" || log.subject.includes("Welcome") || log.subject.includes("Account");

      return true;
    });
  }, [logs, searchTerm, selectedCategory]);

  const handleCopyBody = (logId: string, bodyText: string) => {
    navigator.clipboard.writeText(bodyText);
    setCopiedLogId(logId);
    setTimeout(() => setCopiedLogId(null), 2000);
  };

  // Quick Simulation Event Dispatches
  const handleTriggerSimulatedLog = (type: "radius" | "bid" | "outreach" | "welcome") => {
    if (!onAddLog) return;

    const timestamp = new Date().toISOString();
    let newLog: EmailLog;

    if (type === "radius") {
      newLog = {
        id: `email-sim-${Math.random().toString(36).substring(2, 9)}`,
        recipientName: "Michael Smith",
        recipientEmail: "michael.smith@austinlandscaping.com",
        subject: "[RADIUS ALERT] New Home job near Austin (12 mi away!)",
        body: `Hi Michael Smith,\n\nWe picked up a new job post posted by John Doe in your active matching radius (12 miles away from Austin).\n\n🎯 JOB DETAILS:\nTitle: Front Yard Retaining Wall & Mulch\nOffered Budget: $1,800\nLocation: Austin, TX (78701)\n\nDescription: "Looking for an experienced contractor to replace a crumbling stone wall."\n\nTrades matching: Landscaping, General Handyman\n\nBest regards,\nHot Spot Workspace SMTP Relays`,
        timestamp,
        category: "radius_alert",
        senderName: "Hot Spot SMTP Dispatch",
        senderEmail: "alerts@hotspotworkshop.com",
        status: "dispatched",
        radiusMiles: 12
      };
    } else if (type === "bid") {
      newLog = {
        id: `email-sim-${Math.random().toString(36).substring(2, 9)}`,
        recipientName: "John Doe",
        recipientEmail: "johndoe@gmail.com",
        subject: "[NEGOTIATION] Counter-offer received from Sarah Jenkins!",
        body: `Hi John Doe,\n\nSarah Jenkins has responded with a competitive price update on your project "Kitchen Tile Backsplash".\n\n💰 Proposing New Price: $650\n💬 Message: "I can supply high-grade waterproofing membrane and start Friday morning!"\n\nLog in to your Hot Spot Work Shop dashboard to accept or negotiate.\n\nBest regards,\nHot Spot Workspace SMTP Relays`,
        timestamp,
        category: "bid_negotiation",
        senderName: "Hot Spot Bids Engine",
        senderEmail: "bids@hotspotworkshop.com",
        status: "dispatched"
      };
    } else if (type === "outreach") {
      newLog = {
        id: `email-sim-${Math.random().toString(36).substring(2, 9)}`,
        recipientName: "Austin Senior Community Members",
        recipientEmail: "newsletter@austinseniors.org",
        subject: "[OUTREACH] Trusted Neighborhood Contractor Marketplace Launch",
        body: `Hello Austin Community,\n\nDiscover Hot Spot Work Shop — a safe, transparent platform connecting local homeowners with verified contractors for lawn maintenance, gutter clearing, and repairs.\n\nFeatures:\n• Transparent bids\n• Real-time map distance tracking\n• Senior-friendly mode & 24/7 support\n\nVisit: https://hotspotworkshop.com\n\nBest regards,\nOutreach & Marketing Team`,
        timestamp,
        category: "outreach",
        senderName: "Community Outreach Team",
        senderEmail: "community@hotspotworkshop.com",
        status: "dispatched"
      };
    } else {
      newLog = {
        id: `email-sim-${Math.random().toString(36).substring(2, 9)}`,
        recipientName: "David Miller",
        recipientEmail: "david.m@apexplumbing.com",
        subject: "Welcome to Hot Spot Work Shop! Contractor Account Verified",
        body: `Hi David Miller,\n\nCongratulations! Your contractor profile for Apex Plumbing LLC has been verified.\n\nYou are now eligible to receive instant email notifications for open jobs within a 70-mile radius of Austin, TX.\n\nBest regards,\nHot Spot Account Operations`,
        timestamp,
        category: "welcome",
        senderName: "Hot Spot Account Verification",
        senderEmail: "support@hotspotworkshop.com",
        status: "dispatched"
      };
    }

    onAddLog(newLog);
  };

  // Export logs to JSON file
  const handleExportJSON = () => {
    if (logs.length === 0) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(logs, null, 2))}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `email_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-y-0 right-0 max-w-lg w-full bg-slate-900 text-slate-100 shadow-2xl z-50 flex flex-col border-l border-slate-700 animate-in slide-in-from-right duration-300" id="email-simulator-panel">
      {/* Simulator Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950 flex justify-between items-center shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider font-mono border border-amber-500/30">
              SMTP Relay Core
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Relay Service Active" />
            <span className="text-[10px] font-mono text-emerald-400 font-bold">PORT 587 TLS</span>
          </div>
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2 pt-0.5">
            <Mail className="w-5 h-5 text-amber-500" /> Platform Email Log Simulator
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title="Close Simulator Panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Simulator Explainer Banner */}
      <div className="p-3.5 bg-slate-950/60 border-b border-slate-800 text-xs text-slate-300 shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 items-center font-bold text-amber-300 text-xs">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Real-Time Dispatch Tracker</span>
          </div>
          <button
            type="button"
            onClick={() => setShowSimulateActions(!showSimulateActions)}
            className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{showSimulateActions ? "Hide Test Buttons" : "Show Test Buttons"}</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Tracks emails triggered when homeowners post jobs within a <strong>70-mile active radius</strong>, or when negotiations/bids are sent.
        </p>

        {/* Quick Simulation Action Buttons */}
        {showSimulateActions && onAddLog && (
          <div className="pt-1.5 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Test Instant Dispatches:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleTriggerSimulatedLog("radius")}
                className="px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-3 h-3 text-amber-400" />
                <span>+ Radius Job Alert</span>
              </button>
              <button
                type="button"
                onClick={() => handleTriggerSimulatedLog("bid")}
                className="px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-3 h-3 text-emerald-400" />
                <span>+ Counter Offer Email</span>
              </button>
              <button
                type="button"
                onClick={() => handleTriggerSimulatedLog("outreach")}
                className="px-2.5 py-1.5 bg-blue-500/15 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-3 h-3 text-blue-400" />
                <span>+ Campaign Email</span>
              </button>
              <button
                type="button"
                onClick={() => handleTriggerSimulatedLog("welcome")}
                className="px-2.5 py-1.5 bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-3 h-3 text-purple-400" />
                <span>+ Welcome Email</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-2 shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search email logs by recipient, subject, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl pl-8 pr-8 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition cursor-pointer ${
              selectedCategory === "all"
                ? "bg-amber-500 text-slate-950"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            All ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("radius")}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition cursor-pointer ${
              selectedCategory === "radius"
                ? "bg-amber-500 text-slate-950"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            ⚡ Radius Alerts
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("bids")}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition cursor-pointer ${
              selectedCategory === "bids"
                ? "bg-amber-500 text-slate-950"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            💰 Bids & Offers
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("outreach")}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition cursor-pointer ${
              selectedCategory === "outreach"
                ? "bg-amber-500 text-slate-950"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            📢 Outreach
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("system")}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition cursor-pointer ${
              selectedCategory === "system"
                ? "bg-amber-500 text-slate-950"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            🛡️ System
          </button>
        </div>
      </div>

      {/* Logs Viewport List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-52 space-y-3 text-slate-500">
            <Mail className="w-12 h-12 stroke-1 text-slate-600" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400">No email logs matched your criteria.</p>
              <p className="text-[11px] text-slate-500 max-w-xs">
                {logs.length === 0 
                  ? "Post a job or click one of the 'Test Instant Dispatches' buttons above to generate simulated SMTP logs!"
                  : "Try clearing your search term or selecting 'All' category."}
              </p>
            </div>
            {logs.length === 0 && onAddLog && (
              <button
                type="button"
                onClick={() => handleTriggerSimulatedLog("radius")}
                className="mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate First Sample Email</span>
              </button>
            )}
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-800/90 border border-slate-700/80 hover:border-amber-500/50 rounded-xl p-3.5 text-xs space-y-2.5 transition duration-150 hover:bg-slate-800 shadow-sm relative group"
            >
              {/* Header Info */}
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-slate-300 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> 
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> DISPATCHED
                  </span>
                  {onDeleteLog && (
                    <button
                      type="button"
                      onClick={() => onDeleteLog(log.id)}
                      className="text-slate-500 hover:text-rose-400 p-0.5 transition cursor-pointer"
                      title="Delete log entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Recipient & Subject Line */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 font-semibold text-[10px] uppercase font-mono block">To Recipient:</span>
                    <p className="text-slate-100 font-bold text-xs">{log.recipientName} <span className="text-slate-400 font-normal">(&lt;{log.recipientEmail}&gt;)</span></p>
                  </div>
                  {log.radiusMiles && (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono">
                      📍 {log.radiusMiles} mi away
                    </span>
                  )}
                </div>

                <div className="h-px bg-slate-700/60 my-1" />

                <div>
                  <span className="text-slate-400 font-semibold text-[10px] uppercase font-mono block">Subject Line:</span>
                  <p className="text-amber-300 font-bold tracking-tight text-xs leading-snug">{log.subject}</p>
                </div>
              </div>

              {/* Body snippet */}
              <div className="bg-slate-950/80 p-2.5 rounded-lg text-[11px] text-slate-300 whitespace-pre-line border border-slate-700/60 leading-relaxed font-sans line-clamp-4 relative">
                {log.body}
              </div>

              {/* Card Footer Tools */}
              <div className="flex items-center justify-between text-[10px] pt-1">
                <button
                  type="button"
                  onClick={() => setInspectingLog(log)}
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Full Email</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyBody(log.id, log.body)}
                    className="text-slate-400 hover:text-slate-200 font-semibold flex items-center gap-1 cursor-pointer"
                    title="Copy email message body"
                  >
                    {copiedLogId === log.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLogId === log.id ? "Copied" : "Copy Body"}</span>
                  </button>
                  <span className="text-slate-500 font-mono text-[9px]">ID: {log.id}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer controls */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="text-xs text-slate-400 hover:text-rose-400 disabled:opacity-40 disabled:hover:text-slate-400 flex items-center gap-1.5 font-semibold transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Clear Logs
          </button>
          <button
            onClick={handleExportJSON}
            disabled={logs.length === 0}
            className="text-xs text-slate-400 hover:text-amber-400 disabled:opacity-40 disabled:hover:text-slate-400 flex items-center gap-1.5 font-semibold transition cursor-pointer"
            title="Download Email Logs as JSON file"
          >
            <Download className="w-4 h-4" /> Export JSON
          </button>
        </div>

        <span className="text-[10px] font-mono text-slate-400">
          Total Logs: <strong className="text-amber-400">{logs.length}</strong>
        </span>
      </div>

      {/* FULL EMAIL INSPECTOR MODAL */}
      {inspectingLog && (
        <div 
          className="fixed inset-0 bg-slate-950/80 z-60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setInspectingLog(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wide">
                  SMTP Dispatch Header & Inspector
                </h4>
              </div>
              <button
                onClick={() => setInspectingLog(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Header Details Table */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">MESSAGE ID:</span>
                  <span className="text-slate-300">{inspectingLog.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">DATE/TIME:</span>
                  <span className="text-slate-300">{new Date(inspectingLog.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">FROM:</span>
                  <span className="text-amber-300">{inspectingLog.senderEmail || "alerts@hotspotworkshop.com"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">TO:</span>
                  <span className="text-slate-200">{inspectingLog.recipientName} &lt;{inspectingLog.recipientEmail}&gt;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">ENCRYPTION:</span>
                  <span className="text-emerald-400 font-bold">TLS 1.3 (Port 587)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">STATUS:</span>
                  <span className="text-emerald-400 font-bold">250 2.0.0 OK Message Accepted</span>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Subject:</span>
                <h3 className="text-sm font-bold text-amber-300 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  {inspectingLog.subject}
                </h3>
              </div>

              {/* Message Body */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Body Payload:</span>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-200 whitespace-pre-line leading-relaxed font-sans text-xs">
                  {inspectingLog.body}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => handleCopyBody(inspectingLog.id, inspectingLog.body)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold flex items-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy Message Body</span>
              </button>
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
