import { QueuedUpdate, QueuedUpdateType, PersistenceState } from "../types/persistenceTypes";

const QUEUE_STORAGE_KEY = "hsws_offline_project_queue";
const SIMULATED_OFFLINE_KEY = "hsws_simulated_offline";

type Listener = (state: PersistenceState) => void;
type SyncHandler = (update: QueuedUpdate) => Promise<boolean>;

class PersistenceCheckService {
  private listeners: Set<Listener> = new Set();
  private queue: QueuedUpdate[] = [];
  private isSimulatedOffline: boolean = false;
  private isSyncing: boolean = false;
  private lastSyncTimestamp: string | null = null;
  private lastCheckedTimestamp: string = new Date().toISOString();
  private syncHandler: SyncHandler | null = null;
  private checkIntervalId: any = null;

  constructor() {
    this.loadFromStorage();
    this.initEventListeners();
  }

  private loadFromStorage() {
    try {
      const savedQueue = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (savedQueue) {
        const parsed = JSON.parse(savedQueue);
        if (Array.isArray(parsed)) {
          this.queue = parsed;
        }
      }
      const savedSimulated = localStorage.getItem(SIMULATED_OFFLINE_KEY);
      if (savedSimulated !== null) {
        this.isSimulatedOffline = JSON.parse(savedSimulated) === true;
      }
    } catch (e) {
      console.warn("Failed to load persistence queue from localStorage", e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
      localStorage.setItem(SIMULATED_OFFLINE_KEY, JSON.stringify(this.isSimulatedOffline));
    } catch (e) {
      console.warn("Failed to save persistence queue to localStorage", e);
    }
  }

  private initEventListeners() {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      this.lastCheckedTimestamp = new Date().toISOString();
      this.notifyListeners();
      // If we came back online and we are not in simulated offline, auto-sync
      if (!this.isSimulatedOffline && this.queue.length > 0) {
        this.processSyncQueue();
      }
    });

    window.addEventListener("offline", () => {
      this.lastCheckedTimestamp = new Date().toISOString();
      this.notifyListeners();
    });

    // Periodic heartbeat connectivity check every 30 seconds
    this.checkIntervalId = setInterval(() => {
      this.checkConnectivity();
    }, 30000);
  }

  public registerSyncHandler(handler: SyncHandler) {
    this.syncHandler = handler;
  }

  public isOnline(): boolean {
    if (this.isSimulatedOffline) return false;
    if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean") {
      return navigator.onLine;
    }
    return true;
  }

  public isSimulated(): boolean {
    return this.isSimulatedOffline;
  }

  public setSimulatedOffline(val: boolean) {
    const wasOffline = !this.isOnline();
    this.isSimulatedOffline = val;
    this.saveToStorage();
    this.notifyListeners();

    // If turned back online and was previously offline, trigger auto-sync
    if (wasOffline && this.isOnline() && this.queue.length > 0) {
      this.processSyncQueue();
    }
  }

  public toggleSimulatedOffline() {
    this.setSimulatedOffline(!this.isSimulatedOffline);
  }

  public async checkConnectivity(): Promise<boolean> {
    this.lastCheckedTimestamp = new Date().toISOString();

    if (this.isSimulatedOffline) {
      this.notifyListeners();
      return false;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      this.notifyListeners();
      return false;
    }

    // Try a lightweight network check
    try {
      // In web app, we can fetch health or standard origin with cache busting
      const response = await fetch(`/api/health?t=${Date.now()}`, {
        method: "HEAD",
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const online = response.ok || response.status < 500;
      this.notifyListeners();
      if (online && this.queue.length > 0 && !this.isSyncing) {
        this.processSyncQueue();
      }
      return online;
    } catch {
      // If fetch fails but navigator is online, might be local or network glitch
      const isNavOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
      this.notifyListeners();
      return isNavOnline;
    }
  }

  public queueUpdate(
    type: QueuedUpdateType,
    title: string,
    payload: any,
    description?: string
  ): QueuedUpdate {
    const newUpdate: QueuedUpdate = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      title,
      description,
      payload,
      timestamp: new Date().toISOString(),
      status: "queued",
      retryCount: 0,
    };

    this.queue = [newUpdate, ...this.queue];
    this.saveToStorage();
    this.notifyListeners();

    // If we happen to be online, trigger sync immediately in the background
    if (this.isOnline() && !this.isSyncing) {
      setTimeout(() => this.processSyncQueue(), 500);
    }

    return newUpdate;
  }

  public removeQueuedUpdate(id: string) {
    this.queue = this.queue.filter((item) => item.id !== id);
    this.saveToStorage();
    this.notifyListeners();
  }

  public clearQueue() {
    this.queue = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  public async processSyncQueue(): Promise<{ total: number; synced: number; failed: number }> {
    if (this.isSyncing) {
      return { total: this.queue.length, synced: 0, failed: 0 };
    }

    if (!this.isOnline()) {
      return { total: this.queue.length, synced: 0, failed: this.queue.length };
    }

    if (this.queue.length === 0) {
      return { total: 0, synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.notifyListeners();

    let syncedCount = 0;
    let failedCount = 0;
    const remainingQueue: QueuedUpdate[] = [];

    // Process all queued updates sequentially to preserve ordering
    for (const update of [...this.queue]) {
      try {
        update.status = "syncing";
        this.notifyListeners();

        let success = true;
        if (this.syncHandler) {
          success = await this.syncHandler(update);
        } else {
          // Default mock cloud sync latency simulation
          await new Promise((resolve) => setTimeout(resolve, 350));
          success = true;
        }

        if (success) {
          update.status = "synced";
          syncedCount++;
        } else {
          update.status = "failed";
          update.retryCount += 1;
          failedCount++;
          remainingQueue.push(update);
        }
      } catch (err: any) {
        update.status = "failed";
        update.retryCount += 1;
        update.errorMessage = err?.message || "Sync request failed";
        failedCount++;
        remainingQueue.push(update);
      }
    }

    this.queue = remainingQueue;
    this.isSyncing = false;
    this.lastSyncTimestamp = new Date().toISOString();
    this.saveToStorage();
    this.notifyListeners();

    return {
      total: syncedCount + failedCount,
      synced: syncedCount,
      failed: failedCount,
    };
  }

  public getState(): PersistenceState {
    const online = this.isOnline();
    return {
      isOnline: online,
      isSimulatedOffline: this.isSimulatedOffline,
      isSyncing: this.isSyncing,
      queue: [...this.queue],
      lastSyncTimestamp: this.lastSyncTimestamp,
      lastCheckedTimestamp: this.lastCheckedTimestamp,
      pendingCount: this.queue.filter((u) => u.status === "queued" || u.status === "failed" || u.status === "syncing").length,
    };
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Emit initial state
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error("Error in persistence-check listener:", err);
      }
    });
  }

  public destroy() {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
    }
    this.listeners.clear();
  }
}

export const persistenceCheck = new PersistenceCheckService();
