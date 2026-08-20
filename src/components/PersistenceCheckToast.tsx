import React, { useState, useEffect } from "react";
import { persistenceCheck } from "../services/persistenceCheck";
import { PersistenceState, QueuedUpdate } from "../types/persistenceTypes";
import {
  WifiOff,
  Wifi,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  X,
  ChevronUp,
  ChevronDown,
  Trash2,
  Send,
  SlidersHorizontal,
  Info,
  ShieldCheck,
} from "lucide-react";

interface PersistenceCheckToastProps {
  onSyncManual?: () => void;
}

export default function PersistenceCheckToast({ onSyncManual }: PersistenceCheckToastProps) {
  const [state, setState] = useState<PersistenceState>(persistenceCheck.getState());
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);
  const [previousOnlineState, setPreviousOnlineState] = useState(persistenceCheck.isOnline());
  const [lastSyncedCount, setLastSyncedCount] = useState(0);

  useEffect(() => {
    const unsubscribe = persistenceCheck.subscribe((newState) => {
      // Detect transition from offline to online
      if (!previousOnlineState && newState.isOnline) {
        setShowRestoredNotice(true);
        const timer = setTimeout(() => {
          setShowRestoredNotice(false);
        }, 6000);
        return () => clearTimeout(timer);
      }
      setPreviousOnlineState(newState.isOnline);
      setState(newState);
    });

    return () => unsubscribe();
  }, [previousOnlineState]);

  const handleCheckConnection = async () => {
    setIsCheckingConnection(true);
    try {
      const isUp = await persistenceCheck.checkConnectivity();
      if (!isUp) {
        // Audio or visual cue
      }
    } finally {
      setTimeout(() => setIsCheckingConnection(false), 600);
    }
  };

  const handleToggleSimulatedOffline = () => {
    persistenceCheck.toggleSimulatedOffline();
  };

  const handleSyncNow = async () => {
    const count = state.pendingCount;
    const result = await persistenceCheck.processSyncQueue();
    if (result.synced > 0) {
      setLastSyncedCount(result.synced);
      setShowRestoredNotice(true);
      setTimeout(() => setShowRestoredNotice(false), 5000);
    }
    if (onSyncManual) onSyncManual();
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return iso;
    }
  };

  const formatUpdateTypeLabel = (type: string) => {
    switch (type) {
      case "create_project":
        return "New Project Post";
      case "update_project":
        return "Project Edit";
      case "place_bid":
        return "Bid Submission";
      case "accept_bid":
        return "Contractor Hired";
      case "counter_bid":
        return "Counter-Offer";
      case "agree_project":
        return "Contract Signed";
      case "complete_project":
        return "Job Completed";
      case "project_image_update":
        return "Photos Uploaded";
      case "review_submission":
        return "Review Rating";
      default:
        return "Project Action";
    }
  };

  const isOffline = !state.isOnline;

  return (
    <>
      {/* Toast Warning when Offline */}
      {isOffline && (
        <div
          className={`fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 transition-all duration-300 ${
            isMinimized ? "translate-y-2 opacity-90" : "animate-in slide-in-from-bottom-5"
          }`}
          id="persistence-check-offline-toast"
          data-testid="persistence-check-offline-toast"
        >
          <div className="bg-amber-950/95 backdrop-blur-md text-white border-2 border-amber-500/80 rounded-2xl shadow-2xl p-4 ring-4 ring-amber-500/20">
            {/* Header row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 animate-pulse">
                  <WifiOff className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 font-display">
                      Offline Mode (Persistence-Check)
                    </h4>
                    {state.isSimulatedOffline && (
                      <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/40">
                        Simulated
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-300 font-medium">
                    Auto-Queue & Sync Protocol Active
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title={isMinimized ? "Expand notice" : "Minimize notice"}
                >
                  {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Expanded Body Content */}
            {!isMinimized && (
              <div className="mt-3 space-y-3 pt-2 border-t border-amber-800/60">
                <p className="text-xs text-amber-100/90 leading-relaxed font-sans">
                  You are currently disconnected. Any project postings, bids, contractor agreements, or updates
                  will be <strong className="text-amber-300 font-bold underline decoration-amber-400/60">safely queued locally</strong> and synced automatically once your network connection is restored.
                </p>

                {/* Queue status badge and info */}
                <div className="bg-black/30 rounded-xl p-2.5 flex items-center justify-between border border-amber-500/20 text-xs">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-bold text-amber-200">
                      {state.pendingCount === 0
                        ? "No pending updates in queue"
                        : `${state.pendingCount} update${state.pendingCount === 1 ? "" : "s"} queued for sync`}
                    </span>
                  </div>
                  {state.pendingCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowQueueModal(true)}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      View Queue →
                    </button>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCheckConnection}
                    disabled={isCheckingConnection}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                    id="persistence-check-reconnect-btn"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingConnection ? "animate-spin" : ""}`} />
                    <span>{isCheckingConnection ? "Checking..." : "Check Connection"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleSimulatedOffline}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white text-xs font-semibold border border-white/10 transition cursor-pointer"
                    title="Toggle offline test mode on/off"
                  >
                    {state.isSimulatedOffline ? "Restore Online (Test)" : "Simulate Offline"}
                  </button>

                  {state.pendingCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowQueueModal(true)}
                      className="px-3 py-2 rounded-xl bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 text-xs font-bold border border-amber-600/40 transition cursor-pointer"
                    >
                      Inspect ({state.pendingCount})
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification when Reconnected / Synced */}
      {showRestoredNotice && !isOffline && (
        <div
          className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300"
          id="persistence-sync-restored-toast"
          data-testid="persistence-sync-restored-toast"
        >
          <div className="bg-emerald-950/95 backdrop-blur-md text-white border-2 border-emerald-500/80 rounded-2xl shadow-2xl p-4 ring-4 ring-emerald-500/20">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                  {state.isSyncing ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 font-display">
                    {state.isSyncing ? "⚡ Connection Restored: Syncing..." : "✅ Sync Complete"}
                  </h4>
                  <p className="text-xs text-emerald-100/90 leading-snug">
                    {state.isSyncing
                      ? "Your connection has returned! Automatically syncing all queued project updates..."
                      : lastSyncedCount > 0
                      ? `Successfully synced and published ${lastSyncedCount} queued project update${
                          lastSyncedCount === 1 ? "" : "s"
                        } to the cloud.`
                      : "Network connection is active and healthy. All changes are in sync."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRestoredNotice(false)}
                className="text-emerald-300/70 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Queued Updates Inspector Modal */}
      {showQueueModal && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-55 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowQueueModal(false)}
          id="persistence-queue-modal"
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] shadow-2xl border border-zinc-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm text-white">
                    Offline Project Sync Queue
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Persistence-Check Status: {isOffline ? "🔴 Offline" : "🟢 Online"} • {state.queue.length} Total
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQueueModal(false)}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: List of queued items */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1 bg-zinc-50">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Automatic Background Synchronization</span>
                  <span>
                    Items listed below are persisted safely in your browser storage. As soon as connectivity returns, they will be dispatched and verified sequentially.
                  </span>
                </div>
              </div>

              {state.queue.length === 0 ? (
                <div className="text-center py-10 space-y-2 bg-white rounded-2xl border border-dashed border-zinc-300">
                  <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="text-sm font-bold text-zinc-800">Queue is completely empty!</h4>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                    All project updates, bids, and profile changes are in sync.
                  </p>
                </div>
              ) : (
                state.queue.map((item: QueuedUpdate, idx: number) => (
                  <div
                    key={item.id}
                    className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-[10px] font-mono font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-zinc-900">
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            item.status === "synced"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.status === "syncing"
                              ? "bg-blue-100 text-blue-800 animate-pulse"
                              : item.status === "failed"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => persistenceCheck.removeQueuedUpdate(item.id)}
                          className="text-zinc-400 hover:text-rose-600 p-1 transition cursor-pointer"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-100 gap-1">
                      <span className="font-mono bg-zinc-100 px-2 py-0.5 rounded text-[10px] text-zinc-700">
                        {formatUpdateTypeLabel(item.type)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {formatTime(item.timestamp)}
                      </span>
                    </div>

                    {/* Payload Summary preview */}
                    {item.payload && (
                      <div className="bg-zinc-50 rounded-lg p-2 text-[10px] font-mono text-zinc-600 overflow-x-auto max-h-20 border border-zinc-150">
                        {item.payload.title && <div>Title: {item.payload.title}</div>}
                        {item.payload.budget && <div>Budget: ${item.payload.budget}</div>}
                        {item.payload.amount && <div>Amount: ${item.payload.amount}</div>}
                        {item.payload.contractorName && <div>Contractor: {item.payload.contractorName}</div>}
                        {item.payload.status && <div>New Status: {item.payload.status}</div>}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 bg-white border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSimulatedOffline}
                  className="px-3 py-1.5 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                >
                  {state.isSimulatedOffline ? "Restore Live Network" : "Test Simulated Offline"}
                </button>
                {state.queue.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Are you sure you want to clear all queued offline updates?")) {
                        persistenceCheck.clearQueue();
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    Clear Queue
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQueueModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-700 transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={state.queue.length === 0 || state.isSyncing}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${state.isSyncing ? "animate-spin" : ""}`} />
                  <span>{state.isSyncing ? "Syncing..." : "Sync All Now"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
