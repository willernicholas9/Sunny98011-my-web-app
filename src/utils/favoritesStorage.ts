import { SafeStorage } from "./browserCompat";

const FAVORITES_STORAGE_KEY = "favorites";
const FAVORITES_EVENT = "hsws_favorites_updated";

/**
 * Retrieve the list of favorite project IDs from localStorage
 */
export function getFavoriteProjectIds(): string[] {
  try {
    const raw = SafeStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((id): id is string => typeof id === "string");
    }
  } catch (err) {
    console.warn("Failed to parse favorites from localStorage", err);
  }
  return [];
}

/**
 * Check if a given project ID is in the user's favorites
 */
export function isProjectFavorite(projectId: string): boolean {
  if (!projectId) return false;
  const current = getFavoriteProjectIds();
  return current.includes(projectId);
}

/**
 * Toggle a project ID in favorites, persisting to localStorage
 * @returns boolean - true if now favorited, false if removed
 */
export function toggleFavoriteProject(projectId: string): boolean {
  if (!projectId) return false;
  const current = getFavoriteProjectIds();
  const exists = current.includes(projectId);
  let updated: string[];

  if (exists) {
    updated = current.filter((id) => id !== projectId);
  } else {
    updated = [projectId, ...current.filter((id) => id !== projectId)];
  }

  try {
    SafeStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to persist favorites to localStorage", err);
  }

  // Notify all listeners
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(FAVORITES_EVENT, {
        detail: { projectId, isFavorite: !exists, allFavorites: updated },
      })
    );
  }

  return !exists;
}

export { FAVORITES_EVENT, FAVORITES_STORAGE_KEY };
