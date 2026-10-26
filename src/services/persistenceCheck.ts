import { QueuedUpdate, QueuedUpdateType, PersistenceState } from "../types/persistenceTypes";

const QUEUE_STORAGE_KEY = "hsws_offline_project_queue";
const HISTORY_STORAGE_KEY = "hsws_offline_synced_history";
const SIMULATED_OFFLINE_KEY = "hsws_simulated_offline";

type Listener = (state: PersistenceState) => void;
type SyncHandler = (update: QueuedUpdate) => Promise<boolean>;

class PersistenceCheckService {
  private listeners: Set<Listener> = new Set();
  private queue: QueuedUpdate[] = [];
  private history: QueuedUpdate[] = [];
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

  private resolveEndpoint(type: QueuedUpdateType): string {
    switch (type) {
      case "create_project":
        return "/api/projects";
      case "update_project":
        return "/api/projects/update";
      case "place_bid":
        return "/api/bids";
      case "accept_bid":
        return "/api/bids/accept";
      case "counter_bid":
        return "/api/bids/counter";
      case "agree_project":
        return "/api/contracts/agree";
      case "complete_project":
        return "/api/projects/complete";
      case "project_image_update":
        return "/api/projects/images";
      case "review_submission":
        return "/api/reviews";
      case "contractor_availability":
        return "/api/contractors/schedule";
      case "contractor_portfolio_update":
        return "/api/contractors/portfolio";
      default:
        return "/api/sync/update";
    }
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
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          this.history = parsed;
        }
      }
      const savedSimulated = localStorage.getItem(SIMULATED_OFFLINE_KEY);
      if (savedSimulated !== null) {
        this.isSimulatedOffline = JSON.parse(savedSimulated) === true;
      }
    } catch (e) {
      console.warn("Failed to load persistence queue/history from localStorage", e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(this.history.slice(0, 50)));
      localStorage.setItem(SIMULATED_OFFLINE_KEY, JSON.stringify(this.isSimulatedOffline));
    } catch (e) {
      console.warn("Failed to save persistence queue/history to localStorage", e);
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
      const isNavOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
      this.notifyListeners();
      return isNavOnline;
    }
  }

  public queueUpdate(
    type: QueuedUpdateType,
    title: string,
    payload: any,
    description?: string,
    targetEndpoint?: string
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
      targetEndpoint: targetEndpoint || this.resolveEndpoint(type),
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

  public clearHistory() {
    this.history = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  public async syncSingleUpdate(id: string): Promise<boolean> {
    const updateIndex = this.queue.findIndex((u) => u.id === id);
    if (updateIndex === -1) return false;
    if (!this.isOnline()) return false;

    const update = { ...this.queue[updateIndex] };
    update.status = "syncing";
    this.queue[updateIndex] = update;
    this.notifyListeners();

    let success = false;
    try {
      if (this.syncHandler) {
        success = await this.syncHandler(update);
      } else {
        await new Promise((res) => setTimeout(res, 400));
        success = true;
      }
    } catch (err: any) {
      update.errorMessage = err?.message || "Sync failed";
    }

    if (success) {
      update.status = "synced";
      update.syncedAt = new Date().toISOString();
      this.queue = this.queue.filter((u) => u.id !== id);
      this.history = [update, ...this.history.filter((h) => h.id !== update.id)].slice(0, 50);
      this.lastSyncTimestamp = new Date().toISOString();
    } else {
      update.status = "failed";
      update.retryCount = (update.retryCount || 0) + 1;
      this.queue[updateIndex] = update;
    }

    this.saveToStorage();
    this.notifyListeners();
    return success;
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
          update.syncedAt = new Date().toISOString();
          syncedCount++;
          // Add to synced history log
          this.history = [update, ...this.history.filter((h) => h.id !== update.id)].slice(0, 50);
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

  public queueTestAction(): QueuedUpdate {
    const sampleActions = [
      {
        type: "create_project" as QueuedUpdateType,
        title: "New Project: Custom Pergola & Patio Stonework",
        description: "Budget: $14,500 • Austin, TX • Client: Sarah Jenkins",
        payload: {
          title: "Custom Pergola & Patio Stonework",
          budget: 14500,
          city: "Austin",
          category: "Framing & Masonry",
          description: "Cedar framing, UV tinted polycarbonate roof panels, and Texas limestone border pavers.",
          urgent: false,
        },
        endpoint: "/api/projects",
      },
      {
        type: "place_bid" as QueuedUpdateType,
        title: "Bid Submitted: Master Bathroom Remodel",
        description: "Quote: $8,750 • Lone Star Craftsmen LLC • Timeline: 12 days",
        payload: {
          projectId: "proj-101",
          amount: 8750,
          contractor: "Lone Star Craftsmen LLC",
          notes: "Full demolition, Schluter-KERDI waterproofing, and brass plumbing fixtures included.",
        },
        endpoint: "/api/bids",
      },
      {
        type: "review_submission" as QueuedUpdateType,
        title: "5-Star Verified Review: Apex Roofing Solutions",
        description: "Rating: 5.0 ★ • 'Flawless ridge vent replacement during hail storm'",
        payload: {
          contractorId: "c-apex",
          rating: 5,
          comment: "Flawless ridge vent replacement during hail storm. Punctual, tidy, and zero water leaks.",
          reviewer: "Marcus Vance",
        },
        endpoint: "/api/reviews",
      },
      {
        type: "agree_project" as QueuedUpdateType,
        title: "Contract Signed & Milestone Escrow Locked",
        description: "Project: Modern Kitchen Island • Agreed Value: $12,200",
        payload: {
          projectId: "proj-202",
          agreedAmount: 12200,
          termsAccepted: true,
          depositPercent: 30,
        },
        endpoint: "/api/contracts/agree",
      },
      {
        type: "complete_project" as QueuedUpdateType,
        title: "Final Completion Sign-Off & Warranty Activated",
        description: "Job #4092: Hardwood Floor Refinishing • Verified 100% Complete",
        payload: {
          projectId: "proj-4092",
          completedAt: new Date().toISOString(),
          satisfactionScore: 10,
        },
        endpoint: "/api/projects/complete",
      },
    ];

    const sample = sampleActions[Math.floor(Math.random() * sampleActions.length)];
    return this.queueUpdate(sample.type, sample.title, sample.payload, sample.description, sample.endpoint);
  }

  public getState(): PersistenceState {
    const online = this.isOnline();
    return {
      isOnline: online,
      isSimulatedOffline: this.isSimulatedOffline,
      isSyncing: this.isSyncing,
      queue: [...this.queue],
      history: [...this.history],
      lastSyncTimestamp: this.lastSyncTimestamp,
      lastCheckedTimestamp: this.lastCheckedTimestamp,
      pendingCount: this.queue.filter((u) => u.status === "queued" || u.status === "failed" || u.status === "syncing").length,
    };
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
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
