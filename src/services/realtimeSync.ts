// =========================================================================
// Real-Time Bi-Directional Website & Mobile App Synchronization Client
// =========================================================================

export interface SyncActivityEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  source: "website" | "app" | "server";
  city?: string;
}

export type SyncEntity = "projects" | "bids" | "contractors" | "chatMessages" | "emailLogs";

export interface SyncStatus {
  isConnected: boolean;
  isConnecting: boolean;
  activeClients: number;
  lastSyncTime: string | null;
  latencyMs: number;
  syncEventsCount: number;
  mode: "sse_live" | "broadcast_channel" | "polling";
}

type SyncListener = (event: {
  type: string;
  entity?: SyncEntity;
  action?: string;
  payload?: any;
  senderId?: string;
  timestamp: string;
  event?: SyncActivityEvent;
}) => void;

class RealtimeSyncManager {
  private eventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<SyncListener> = new Set();
  private statusListeners: Set<(status: SyncStatus) => void> = new Set();
  private clientId: string = `client-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;
  private activeClients: number = 1;
  private lastSyncTime: string | null = null;
  private latencyMs: number = 12;
  private syncEventsCount: number = 0;
  private reconnectTimer: any = null;
  private pingIntervalTimer: any = null;
  private clientType: "website" | "app" = "website";

  constructor() {
    // Detect if running as standalone PWA or website
    if (typeof window !== "undefined") {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
      this.clientType = isStandalone ? "app" : "website";

      // Setup BroadcastChannel for 0ms cross-tab sync
      try {
        if ("BroadcastChannel" in window) {
          this.broadcastChannel = new BroadcastChannel("hsws_realtime_sync");
          this.broadcastChannel.onmessage = (event) => {
            if (event.data && event.data.senderId !== this.clientId) {
              this.handleIncomingSync(event.data);
            }
          };
        }
      } catch (err) {
        console.warn("BroadcastChannel not supported:", err);
      }

      // Storage event fallback for older tabs
      window.addEventListener("storage", (e) => {
        if (e.key === "hsws_realtime_ping_event" && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (parsed.senderId !== this.clientId) {
              this.handleIncomingSync(parsed);
            }
          } catch {}
        }
      });
    }
  }

  private reconnectAttempts: number = 0;
  private processedEventIds: Set<string> = new Set();

  // Initialize and connect to SSE stream
  public connect() {
    if (typeof window === "undefined" || this.eventSource) return;

    this.isConnecting = true;
    this.notifyStatus();

    const connectSSE = () => {
      try {
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }

        const streamUrl = `/api/sync/stream?clientType=${this.clientType}&clientId=${this.clientId}`;
        this.eventSource = new EventSource(streamUrl);

        this.eventSource.onopen = () => {
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.lastSyncTime = new Date().toISOString();
          this.notifyStatus();
        };

        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "PING") {
              this.activeClients = data.activeClients || this.activeClients;
              this.lastSyncTime = new Date().toISOString();
              this.notifyStatus();
              return;
            }

            if (data.type === "INIT") {
              this.activeClients = data.activeClients || 1;
              this.isConnected = true;
              this.isConnecting = false;
              this.lastSyncTime = new Date().toISOString();
              this.notifyStatus();
              // Deliver INIT data
              this.notifyListeners(data);
              return;
            }

            // Deduplicate incoming events
            if (data.event?.id) {
              if (this.processedEventIds.has(data.event.id)) return;
              this.processedEventIds.add(data.event.id);
              if (this.processedEventIds.size > 100) {
                const arr = Array.from(this.processedEventIds);
                this.processedEventIds = new Set(arr.slice(50));
              }
            }

            // Standard Update or Broadcast
            this.handleIncomingSync(data);
          } catch (err) {
            console.warn("Failed to parse SSE event data", err);
          }
        };

        this.eventSource.onerror = () => {
          this.isConnected = false;
          this.isConnecting = false;
          this.notifyStatus();
          if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
          }

          // Exponential backoff reconnect: 3s, 6s, 12s, max 30s
          this.reconnectAttempts++;
          const delay = Math.min(30000, 3000 * Math.pow(1.5, Math.min(this.reconnectAttempts - 1, 6)));

          if (!this.reconnectTimer) {
            this.reconnectTimer = setTimeout(() => {
              this.reconnectTimer = null;
              connectSSE();
            }, delay);
          }
        };
      } catch (err) {
        console.warn("Error initiating SSE:", err);
        this.isConnecting = false;
        this.isConnected = false;
        this.notifyStatus();
      }
    };

    connectSSE();
  }

  private handleIncomingSync(data: any) {
    this.syncEventsCount++;
    this.lastSyncTime = new Date().toISOString();
    this.notifyStatus();
    this.notifyListeners(data);
  }

  // Subscribe to sync messages
  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Subscribe to status changes
  public onStatus(listener: (status: SyncStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private notifyListeners(data: any) {
    for (const listener of this.listeners) {
      try {
        listener(data);
      } catch (err) {
        console.error("Error in sync listener:", err);
      }
    }
  }

  private notifyStatus() {
    const status = this.getStatus();
    for (const listener of this.statusListeners) {
      try {
        listener(status);
      } catch (err) {
        console.error("Error in status listener:", err);
      }
    }
  }

  public getStatus(): SyncStatus {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      activeClients: this.activeClients,
      lastSyncTime: this.lastSyncTime,
      latencyMs: this.latencyMs,
      syncEventsCount: this.syncEventsCount,
      mode: this.isConnected ? "sse_live" : this.broadcastChannel ? "broadcast_channel" : "polling",
    };
  }

  // Publish an update from the current client (Website or App)
  public async publishUpdate(
    entity: SyncEntity,
    payload: any,
    action: "upsert" | "delete" | "batch" = "upsert",
    description?: string
  ): Promise<boolean> {
    const message = {
      type: "UPDATE",
      entity,
      action,
      payload,
      senderId: this.clientId,
      source: this.clientType,
      description: description || `${entity} update from ${this.clientType}`,
      timestamp: new Date().toISOString(),
    };

    // 1. Broadcast locally to all sibling tabs immediately via BroadcastChannel
    try {
      this.broadcastChannel?.postMessage(message);
    } catch {}

    // 2. Storage event backup for sibling windows
    try {
      localStorage.setItem("hsws_realtime_ping_event", JSON.stringify(message));
    } catch {}

    // 3. Post to backend to persist and broadcast to remote web & app devices
    try {
      const response = await fetch("/api/sync/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
      const result = await response.json();
      if (result.success) {
        this.lastSyncTime = new Date().toISOString();
        this.syncEventsCount++;
        this.notifyStatus();
        return true;
      }
    } catch (err) {
      console.warn("Failed to push update to sync server:", err);
    }
    return false;
  }

  // Broadcast a custom announcement / push across all devices
  public async broadcast(title: string, message: string, data?: any): Promise<boolean> {
    try {
      const payload = {
        title,
        message,
        source: this.clientType,
        senderId: this.clientId,
        data,
      };

      this.broadcastChannel?.postMessage({
        type: "BROADCAST",
        payload,
        timestamp: new Date().toISOString(),
      });

      const response = await fetch("/api/sync/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return response.ok;
    } catch (err) {
      console.warn("Broadcast failed:", err);
      return false;
    }
  }

  // Trigger interactive test ping between website and app
  public async triggerTestPing(senderName: string, city: string, message: string): Promise<any> {
    try {
      const response = await fetch("/api/sync/test-ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: senderName, city, message }),
      });
      return await response.json();
    } catch (err) {
      console.warn("Test ping failed:", err);
      return null;
    }
  }
}

export const realtimeSync = new RealtimeSyncManager();
