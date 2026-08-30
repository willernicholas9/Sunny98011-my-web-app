export type QueuedUpdateType =
  | "create_project"
  | "update_project"
  | "place_bid"
  | "accept_bid"
  | "counter_bid"
  | "agree_project"
  | "complete_project"
  | "project_image_update"
  | "review_submission"
  | "contractor_availability"
  | "contractor_portfolio_update"
  | "custom_update";

export interface QueuedUpdate {
  id: string;
  type: QueuedUpdateType;
  title: string;
  description?: string;
  payload: any;
  timestamp: string;
  status: "queued" | "syncing" | "synced" | "failed";
  retryCount: number;
  errorMessage?: string;
}

export interface PersistenceState {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  isSyncing: boolean;
  queue: QueuedUpdate[];
  lastSyncTimestamp: string | null;
  lastCheckedTimestamp: string;
  pendingCount: number;
}
