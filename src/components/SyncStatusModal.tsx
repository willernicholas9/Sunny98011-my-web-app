import React, { useState, useEffect } from "react";
import { persistenceCheck } from "../services/persistenceCheck";
import { realtimeSync, SyncStatus } from "../services/realtimeSync";
import { PersistenceState, QueuedUpdate } from "../types/persistenceTypes";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  X,
  Trash2,
  Send,
  Info,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Database,
  Radio,
  FileText,
  Activity,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  HardDrive,
  Check,
  Server,
  CloudUpload,
} from "lucide-react";

interface SyncStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncManual?: () => void;
}

export default function SyncStatusModal({ isOpen, onClose, onSyncManual }: SyncStatusModalProps) {
  const [state, setState] = useState<PersistenceState>(persistenceCheck.getState());
  const [realtimeStatus, setRealtimeStatus] = useState<SyncStatus>(realtimeSync.getStatus());
  const [activeTab, setActiveTab] = useState<"queued" | "history" | "diagnostics">("queued");
  const [expandedPayloadIds, setExpandedPayloadIds] = useState<Set<string>>(new Set());
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [activeSyncingId, setActiveSyncingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubPersistence = persistenceCheck.subscribe((newState) => {
      setState(newState);
    });

    const unsubRealtime = realtimeSync.onStatus((newStatus) => {
      setRealtimeStatus(newStatus);
    });

    return () => {
      unsubPersistence();
      unsubRealtime();
    };
  }, []);

  if (!isOpen) return null;

  const isOffline = !state.isOnline;

  const togglePayloadExpand = (id: string) => {
    setExpandedPayloadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCheckConnection = async () => {
    setIsCheckingConnection(true);
    try {
      const isUp = await persistenceCheck.checkConnectivity();
      setSyncFeedback(isUp ? "Cloud connection is active and healthy!" : "Network is currently unreachable or offline.");
      setTimeout(() => setSyncFeedback(null), 3500);
    } finally {
      setTimeout(() => setIsCheckingConnection(false), 500);
    }
  };

  const handleToggleSimulatedOffline = () => {
    persistenceCheck.toggleSimulatedOffline();
  };

  const handleSyncAllNow = async () => {
    const count = state.pendingCount;
    if (count === 0) return;
    const result = await persistenceCheck.processSyncQueue();
    if (result.synced > 0) {
      setSyncFeedback(`Successfully uploaded ${result.synced} action(s) to the cloud!`);
      setTimeout(() => setSyncFeedback(null), 4000);
    } else if (result.failed > 0) {
      setSyncFeedback(`Sync failed for ${result.failed} action(s). Will retry when network stabilizes.`);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
    if (onSyncManual) onSyncManual();
  };

  const handleSyncSingle = async (id: string) => {
    setActiveSyncingId(id);
    try {
      const success = await persistenceCheck.syncSingleUpdate(id);
      if (success) {
        setSyncFeedback("Action successfully uploaded to the cloud!");
      } else {
        setSyncFeedback("Failed to upload action. Check connection and retry.");
      }
      setTimeout(() => setSyncFeedback(null), 3000);
    } finally {
      setActiveSyncingId(null);
    }
  };

  const handleQueueTestAction = () => {
    const item = persistenceCheck.queueTestAction();
    setActiveTab("queued");
    setSyncFeedback(`Queued test action: "${item.title}". Waiting for upload.`);
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  const formatTime = (iso?: string | null) => {
    if (!iso) return "Never";
    try {
      const d = new Date(iso);
      return `${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })} • ${d.toLocaleDateString([], { month: "short", day: "numeric" })}`;
    } catch {
      return iso;
    }
  };

  const getRelativeTime = (iso: string) => {
    try {
      const diffMs = Date.now() - new Date(iso).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      return `${diffHr}h ago`;
    } catch {
      return "";
    }
  };

  const formatUpdateTypeBadge = (type: string) => {
    switch (type) {
      case "create_project":
        return { label: "Project Post", color: "bg-blue-100 text-blue-800 border-blue-300" };
      case "update_project":
        return { label: "Project Edit", color: "bg-indigo-100 text-indigo-800 border-indigo-300" };
      case "place_bid":
        return { label: "Bid Placed", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
      case "accept_bid":
        return { label: "Hired Contractor", color: "bg-purple-100 text-purple-800 border-purple-300" };
      case "counter_bid":
        return { label: "Counter Offer", color: "bg-amber-100 text-amber-800 border-amber-300" };
      case "agree_project":
        return { label: "Contract Signed", color: "bg-teal-100 text-teal-800 border-teal-300" };
      case "complete_project":
        return { label: "Job Completed", color: "bg-cyan-100 text-cyan-800 border-cyan-300" };
      case "project_image_update":
        return { label: "Photo Upload", color: "bg-pink-100 text-pink-800 border-pink-300" };
      case "review_submission":
        return { label: "Review Rating", color: "bg-orange-100 text-orange-800 border-orange-300" };
      case "contractor_availability":
        return { label: "Schedule Shift", color: "bg-lime-100 text-lime-800 border-lime-300" };
      default:
        return { label: "Local Action", color: "bg-zinc-100 text-zinc-800 border-zinc-300" };
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-55 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
      id="sync-status-history-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sync-status-modal-title"
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-zinc-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        id="sync-status-history-modal"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="sync-status-modal-title" className="font-display font-extrabold text-base text-white tracking-tight">
                  Cloud Sync Status & History
                </h3>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    isOffline
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  }`}
                >
                  {isOffline ? "Offline Mode" : "Cloud Online"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Local action buffer & background synchronization to cloud relay
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer border border-zinc-800"
            title="Close Sync Status Modal"
            id="close-sync-status-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Connectivity Banner Strip */}
        <div className="bg-zinc-900/95 border-b border-zinc-800 px-5 py-3 text-xs text-zinc-300">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                {!isOffline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    !isOffline ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                ></span>
              </span>
              <span className="font-semibold text-white">
                {!isOffline ? "Connected to Cloud Relay" : "Disconnected • Actions Buffered Locally"}
              </span>
              <span className="text-zinc-500 font-mono hidden md:inline">|</span>
              <span className="text-zinc-400 text-[11px] hidden md:inline">
                Last checked: {formatTime(state.lastCheckedTimestamp)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Simulate Offline Mode Toggle */}
              <button
                type="button"
                onClick={handleToggleSimulatedOffline}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  state.isSimulatedOffline
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                    : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750 hover:text-white"
                }`}
                title={
                  state.isSimulatedOffline
                    ? "Simulated Offline is active. Click to reconnect."
                    : "Click to simulate loss of network connectivity to test offline action buffering."
                }
                id="toggle-simulated-offline-btn"
              >
                {state.isSimulatedOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
                <span>{state.isSimulatedOffline ? "Restore Online" : "Simulate Offline"}</span>
              </button>

              {/* Ping Connectivity */}
              <button
                type="button"
                onClick={handleCheckConnection}
                disabled={isCheckingConnection}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-750 hover:text-white transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                title="Send a quick health probe to check cloud connection"
                id="ping-cloud-health-btn"
              >
                <Activity className={`w-3.5 h-3.5 ${isCheckingConnection ? "animate-spin text-amber-400" : "text-emerald-400"}`} />
                <span>Ping Cloud</span>
              </button>
            </div>
          </div>

          {/* Feedback alert toast */}
          {syncFeedback && (
            <div className="mt-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-200 px-3 py-1.5 rounded-lg text-xs flex items-center justify-between animate-in fade-in duration-150">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{syncFeedback}</span>
              </span>
              <button
                type="button"
                onClick={() => setSyncFeedback(null)}
                className="text-amber-400/60 hover:text-amber-200 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-5 pt-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("queued")}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                activeTab === "queued"
                  ? "border-amber-600 text-amber-900 bg-white rounded-t-lg shadow-2xs"
                  : "border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 rounded-t-lg"
              }`}
              id="tab-queued-actions"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Waiting to Upload</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black ${
                  state.pendingCount > 0 ? "bg-amber-500 text-white" : "bg-zinc-200 text-zinc-700"
                }`}
              >
                {state.pendingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                activeTab === "history"
                  ? "border-emerald-600 text-emerald-900 bg-white rounded-t-lg shadow-2xs"
                  : "border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 rounded-t-lg"
              }`}
              id="tab-synced-history"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Synced History</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-zinc-200 text-zinc-700">
                {state.history?.length || 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("diagnostics")}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                activeTab === "diagnostics"
                  ? "border-blue-600 text-blue-900 bg-white rounded-t-lg shadow-2xs"
                  : "border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 rounded-t-lg"
              }`}
              id="tab-sync-diagnostics"
            >
              <Server className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Telemetry &</span> Diagnostics
            </button>
          </div>

          {/* Quick Queue Test Action */}
          <button
            type="button"
            onClick={handleQueueTestAction}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg transition cursor-pointer mb-1 shadow-2xs active:scale-95"
            title="Generate a sample local action into the queue to test background upload"
            id="queue-test-action-btn"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Queue Test Action</span>
          </button>
        </div>

        {/* Tab 1: Waiting to Upload (Queued actions) */}
        {activeTab === "queued" && (
          <div className="p-5 overflow-y-auto space-y-3.5 flex-1 bg-zinc-50">
            {/* Informational Banner */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Zero-Loss Offline Action Guarantee</span>
                <span className="text-[11px] text-amber-900">
                  Every project post, bid proposal, message, and milestone confirmation made without network connectivity is saved securely in your browser's persistent storage. Once connectivity is restored, they are uploaded sequentially to the cloud without duplicate charges or conflicting states.
                </span>
              </div>
            </div>

            {state.queue.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3 bg-white rounded-2xl border border-dashed border-zinc-300 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">All Local Actions Are In Sync!</h4>
                  <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
                    There are currently no offline actions waiting to be uploaded to the cloud. Any changes you make while offline will automatically appear here.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleQueueTestAction}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Create Sample Offline Action</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleSimulatedOffline}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs border border-zinc-300 transition cursor-pointer"
                  >
                    <WifiOff className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Toggle Simulated Offline</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
                  <span className="font-semibold text-zinc-700">
                    {state.queue.length} action{state.queue.length === 1 ? "" : "s"} waiting for cloud upload
                  </span>
                  <span className="text-[11px]">Sorted oldest first (FIFO execution order)</span>
                </div>

                {state.queue.map((item: QueuedUpdate, idx: number) => {
                  const badge = formatUpdateTypeBadge(item.type);
                  const isExpanded = expandedPayloadIds.has(item.id);
                  const isThisSyncing = state.isSyncing || activeSyncingId === item.id || item.status === "syncing";

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl p-4 shadow-2xs space-y-2.5 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center text-xs font-mono font-black shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-zinc-900 leading-tight">
                                {item.title}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.color}`}>
                                {badge.label}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-[11px] text-zinc-600 mt-0.5 font-medium">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status & Control buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              isThisSyncing
                                ? "bg-blue-100 text-blue-800 border-blue-300 animate-pulse"
                                : item.status === "failed"
                                ? "bg-rose-100 text-rose-800 border-rose-300"
                                : "bg-amber-100 text-amber-800 border-amber-300"
                            }`}
                          >
                            {isThisSyncing ? "Uploading..." : item.status === "failed" ? "Retry Needed" : "Waiting for Cloud"}
                          </span>

                          {/* Individual Upload Now button */}
                          <button
                            type="button"
                            onClick={() => handleSyncSingle(item.id)}
                            disabled={isThisSyncing || isOffline}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer disabled:opacity-40"
                            title={isOffline ? "Cannot upload while offline. Reconnect or turn off Simulated Offline." : "Upload this single action to cloud immediately"}
                          >
                            <ArrowUpRight className={`w-3.5 h-3.5 ${isThisSyncing ? "animate-spin" : ""}`} />
                          </button>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove this pending action: "${item.title}"?`)) {
                                persistenceCheck.removeQueuedUpdate(item.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Discard / Cancel this offline action"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Meta information row */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-100 gap-2">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-600">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            {formatTime(item.timestamp)} ({getRelativeTime(item.timestamp)})
                          </span>
                          {item.targetEndpoint && (
                            <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-[10px] text-zinc-600 border border-zinc-200">
                              {item.targetEndpoint}
                            </span>
                          )}
                          {item.retryCount > 0 && (
                            <span className="text-amber-700 font-bold text-[10px]">
                              Retries: {item.retryCount}
                            </span>
                          )}
                        </div>

                        {/* Toggle payload inspection */}
                        <button
                          type="button"
                          onClick={() => togglePayloadExpand(item.id)}
                          className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-zinc-900 font-semibold cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-zinc-400" />
                          <span>{isExpanded ? "Hide Payload Data" : "Inspect Payload Data"}</span>
                          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* Expandable Payload Viewer */}
                      {isExpanded && item.payload && (
                        <div className="bg-zinc-900 rounded-xl p-3 text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-48 border border-zinc-800 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between text-zinc-400 pb-1.5 mb-1.5 border-b border-zinc-800">
                            <span>Serialized JSON Payload to be sent to Cloud:</span>
                            <span className="text-zinc-500">Action ID: {item.id}</span>
                          </div>
                          <pre className="whitespace-pre-wrap">{JSON.stringify(item.payload, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Synced History */}
        {activeTab === "history" && (
          <div className="p-5 overflow-y-auto space-y-3.5 flex-1 bg-zinc-50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-zinc-900">Uploaded Actions History</h4>
                <p className="text-[11px] text-zinc-500">
                  Actions that were created offline and successfully transmitted to the cloud once connectivity was restored.
                </p>
              </div>
              {state.history && state.history.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Clear the synced actions history log?")) {
                      persistenceCheck.clearHistory();
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                >
                  Clear History
                </button>
              )}
            </div>

            {(!state.history || state.history.length === 0) ? (
              <div className="text-center py-12 px-4 space-y-2 bg-white rounded-2xl border border-dashed border-zinc-300">
                <Clock className="w-10 h-10 text-zinc-400 mx-auto" />
                <h4 className="text-sm font-bold text-zinc-800">No Synced Actions Yet</h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  When you queue local actions and they are uploaded upon connection recovery, their audit trail will be logged here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {state.history.map((item: QueuedUpdate, idx: number) => {
                  const badge = formatUpdateTypeBadge(item.type);
                  return (
                    <div
                      key={item.id || idx}
                      className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-900">{item.title}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.2 rounded border ${badge.color}`}>
                                {badge.label}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-[11px] text-zinc-600 mt-0.5">{item.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Uploaded to Cloud</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-zinc-500 pt-1.5 border-t border-zinc-100">
                        <span>Created: {formatTime(item.timestamp)}</span>
                        <span className="text-emerald-700 font-bold">
                          Synced: {formatTime(item.syncedAt || item.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Technical Diagnostics */}
        {activeTab === "diagnostics" && (
          <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-zinc-50">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Synchronization & Resilience Infrastructure
              </h4>
              <p className="text-[11px] text-zinc-500">
                Underlying protocols preserving data integrity during intermittent connectivity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Card 1: SSE Stream */}
              <div className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-800 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-emerald-600" />
                    <span>Real-time SSE Stream</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      realtimeStatus.isConnected
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {realtimeStatus.isConnected ? "Live Connected" : "Connecting..."}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Endpoint: <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-800 font-mono">/api/sync/stream</code>
                </p>
                <p className="text-[11px] text-zinc-500">
                  Connected devices / tabs: <span className="font-bold text-zinc-800">{realtimeStatus.activeClients}</span>
                </p>
              </div>

              {/* Card 2: Offline Buffer */}
              <div className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-800 flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-amber-600" />
                    <span>Client Storage Buffer</span>
                  </span>
                  <span className="text-[10px] font-bold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full">
                    localStorage
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Storage key: <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-800 font-mono">hsws_offline_project_queue</code>
                </p>
                <p className="text-[11px] text-zinc-500">
                  Queue count: <span className="font-bold text-zinc-800">{state.queue.length} items</span>
                </p>
              </div>

              {/* Card 3: Conflict Policy */}
              <div className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-zinc-800">Conflict Resolution</span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Optimistic local mutations with sequential FIFO cloud reconciliation. Timestamps prevent stale writes over newer versions.
                </p>
              </div>

              {/* Card 4: Reconnect Backoff */}
              <div className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-zinc-800">Auto-Flush Triggers</span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Browser <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-800 font-mono">window.online</code> events + 30s heartbeat health checks automatically trigger queue upload when connectivity returns.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 bg-white border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {state.queue.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to discard all queued offline actions?")) {
                    persistenceCheck.clearQueue();
                  }
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                id="clear-offline-queue-btn"
              >
                Clear Queue ({state.queue.length})
              </button>
            )}
            <span className="text-[11px] text-zinc-500 hidden sm:inline">
              {state.pendingCount === 0 ? "All items synchronized" : `${state.pendingCount} action(s) waiting for cloud upload`}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-700 transition cursor-pointer"
              id="sync-status-modal-close-btn"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSyncAllNow}
              disabled={state.queue.length === 0 || state.isSyncing || isOffline}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              title={
                isOffline
                  ? "Reconnect to upload queued actions"
                  : state.queue.length === 0
                  ? "Queue is empty"
                  : "Upload all pending local actions to the cloud now"
              }
              id="sync-all-now-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${state.isSyncing ? "animate-spin" : ""}`} />
              <span>{state.isSyncing ? "Uploading to Cloud..." : "Upload All to Cloud"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
