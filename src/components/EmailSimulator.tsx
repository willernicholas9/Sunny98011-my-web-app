import React from "react";
import { EmailLog } from "../types";
import { Mail, CheckCircle2, Trash2, Shield, Calendar, Clock, Sparkles } from "lucide-react";

interface EmailSimulatorProps {
  logs: EmailLog[];
  onClearLogs: () => void;
  onClose: () => void;
}

export default function EmailSimulator({ logs, onClearLogs, onClose }: EmailSimulatorProps) {
  return (
    <div className="fixed inset-y-0 right-0 max-w-md w-full bg-slate-900 text-slate-100 shadow-2xl z-50 flex flex-col border-l border-slate-700" id="email-simulator-panel">
      {/* Simulator Header */}
      <div className="p-6 border-b border-slate-700 bg-slate-950 flex justify-between items-center shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider font-mono border border-amber-500/30">
              Workshop Tech Core
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h3 className="text-base font-bold font-display text-white flex items-center gap-1.5 pt-0.5">
            <Mail className="w-5 h-5 text-amber-500" /> Platform Email Log Simulator
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
        >
          ✕
        </button>
      </div>

      {/* Simulator Explainer */}
      <div className="p-4 bg-slate-950/40 border-b border-slate-700 text-xs text-slate-300 leading-relaxed shrink-0 space-y-1.5">
        <div className="flex gap-2 items-start font-medium text-amber-300 text-[11px]">
          <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Real-time email relay tracker!</span>
        </div>
        <p>
          Whenever a customer posts a project, our coordinates engine alerts contractors registered in that city's **70-mile active radius** who checked <em>"Sign up for Email Alerts"</em>.
        </p>
      </div>

      {/* Logs Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-48 space-y-2 text-slate-500">
            <Mail className="w-10 h-10 stroke-1" />
            <p className="text-xs italic">Email dispatch buffer is empty.</p>
            <p className="text-[10px] text-slate-600 max-w-xs">Post a project to trigger emails dynamically to nearby registered contractors!</p>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 text-xs space-y-2.5 transition duration-150 hover:bg-slate-800"
            >
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-slate-300 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" /> {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> DISPATCHED
                </span>
              </div>

              <div className="space-y-1">
                <div>
                  <span className="text-slate-400 font-semibold text-[10px] uppercase font-mono block">Recipient:</span>
                  <p className="text-slate-200 font-semibold">{log.recipientName} ({log.recipientEmail})</p>
                </div>
                <div className="h-px bg-slate-700/50 my-1" />
                <div>
                  <span className="text-slate-400 font-semibold text-[10px] uppercase font-mono block">Subject Line:</span>
                  <p className="text-amber-300 font-bold tracking-tight">{log.subject}</p>
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg text-[11px] text-slate-300 whitespace-pre-line border border-slate-705/45 leading-relaxed font-sans">
                {log.body}
              </div>

              <div className="text-[9px] text-slate-500 text-right italic pt-1 flex justify-between items-center">
                <span className="flex items-center gap-1 font-mono">
                  <Shield className="w-3 h-3" /> TLS SECURE RELAY
                </span>
                <span>ID: {log.id}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer controls */}
      <div className="p-4 bg-slate-950 border-t border-slate-700 flex justify-between items-center shrink-0">
        <button
          onClick={onClearLogs}
          disabled={logs.length === 0}
          className="text-xs text-slate-400 hover:text-red-400 disabled:opacity-40 disabled:hover:text-slate-400 flex items-center gap-1.5 font-semibold transition"
        >
          <Trash2 className="w-4 h-4" /> Clear Console Buffer
        </button>
        <span className="text-[10px] font-mono text-slate-500">
          Logs synced live (Count: {logs.length})
        </span>
      </div>
    </div>
  );
}
