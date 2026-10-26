import { Project, CityData, Bid } from "../types";
import { getDistance } from "../data/cities";

// ============================================================================
// 1. HIGH-SPEED BIDIRECTIONAL CITY-TO-CITY DISTANCE CACHE
// ============================================================================
// Avoids repeated trigonometric Haversine computations across all projects
const cityPairDistanceCache = new Map<string, number>();

/**
 * Returns a canonical key for two city names regardless of order
 */
function getCityPairKey(cityA: string, cityB: string): string {
  const a = (cityA || "").trim().toLowerCase();
  const b = (cityB || "").trim().toLowerCase();
  return a <= b ? `${a}:::${b}` : `${b}:::${a}`;
}

/**
 * Get memoized distance in miles between two cities.
 * If both cities are identical, instantly returns 0 with zero math overhead.
 */
export function getMemoizedCityDistance(
  cityAName: string,
  latA: number,
  lngA: number,
  cityBName: string,
  latB: number,
  lngB: number
): number {
  const normA = (cityAName || "").trim().toLowerCase();
  const normB = (cityBName || "").trim().toLowerCase();

  // Instant zero distance for same city or exact same coordinates
  if (normA === normB || (latA === latB && lngA === lngB)) {
    return 0;
  }

  const key = getCityPairKey(normA, normB);
  const cached = cityPairDistanceCache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  const calculated = getDistance(latA, lngA, latB, lngB);
  cityPairDistanceCache.set(key, calculated);
  return calculated;
}

// ============================================================================
// 2. CITY-BASED SPATIAL FILTER CACHE (LRU / Multi-Entry Map)
// ============================================================================
export interface CitySpatialCacheEntry {
  cacheKey: string;
  cityName: string;
  radiusLimit: number;
  projectsSignature: string;
  spatialProjects: Project[];
  projectDistanceMap: Map<string, number>;
  timestamp: number;
}

// Bounded in-memory cache to remember up to 40 distinct (city, radius, projects) states
const SPATIAL_CACHE_MAX_SIZE = 40;
const spatialFilterCache = new Map<string, CitySpatialCacheEntry>();

/**
 * Computes a lightweight fast signature of the projects array to detect changes
 * without deep serializing all objects.
 */
export function computeProjectsSignature(projects: Project[]): string {
  if (!projects || projects.length === 0) return "empty_0";
  const len = projects.length;
  const firstId = projects[0]?.id || "";
  const lastId = projects[len - 1]?.id || "";
  const midId = projects[Math.floor(len / 2)]?.id || "";
  const sampleStatus = projects[0]?.status || "";
  return `${len}_${firstId}_${midId}_${lastId}_${sampleStatus}`;
}

/**
 * Dedicated Memoization Engine for City-Based Project Filtering.
 * Evaluates distances and extracts the subset of projects within the city radius limit.
 * Results are cached persistently to ensure 60+ FPS scrolling with zero CPU spikes.
 */
export function getMemoizedCitySpatialProjects(
  projects: Project[],
  activeCityData: CityData,
  radiusLimit: number,
  cityMap: Map<string, CityData>,
  defaultCity: CityData
): { spatialProjects: Project[]; projectDistanceMap: Map<string, number>; isCacheHit: boolean } {
  const normCityName = (activeCityData?.name || "Austin").trim().toLowerCase();
  const radius = Math.max(1, radiusLimit || 70);
  const projectsSig = computeProjectsSignature(projects);
  const cacheKey = `${normCityName}__r${radius}__${projectsSig}`;

  const cachedEntry = spatialFilterCache.get(cacheKey);
  if (cachedEntry) {
    return {
      spatialProjects: cachedEntry.spatialProjects,
      projectDistanceMap: cachedEntry.projectDistanceMap,
      isCacheHit: true,
    };
  }

  // Cache miss: compute project distance map and spatial projects
  const distanceMap = new Map<string, number>();
  const spatialMatchingProjects: Project[] = [];

  const activeLat = activeCityData.lat;
  const activeLng = activeCityData.lng;
  const activeName = activeCityData.name;

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const projectCityName = project.city || "";
    const pCity = cityMap.get(projectCityName.toLowerCase()) || defaultCity;

    const dist = getMemoizedCityDistance(
      activeName,
      activeLat,
      activeLng,
      pCity.name,
      pCity.lat,
      pCity.lng
    );

    distanceMap.set(project.id, dist);

    // City radius filter boundary check
    if (dist <= radius) {
      spatialMatchingProjects.push(project);
    }
  }

  // Evict oldest entries if capacity is reached
  if (spatialFilterCache.size >= SPATIAL_CACHE_MAX_SIZE) {
    const oldestKey = spatialFilterCache.keys().next().value;
    if (oldestKey) spatialFilterCache.delete(oldestKey);
  }

  spatialFilterCache.set(cacheKey, {
    cacheKey,
    cityName: normCityName,
    radiusLimit: radius,
    projectsSignature: projectsSig,
    spatialProjects: spatialMatchingProjects,
    projectDistanceMap: distanceMap,
    timestamp: Date.now(),
  });

  return {
    spatialProjects: spatialMatchingProjects,
    projectDistanceMap: distanceMap,
    isCacheHit: false,
  };
}

// ============================================================================
// 3. STABLE REFERENCE GUARD FOR SCROLL-PERFORMANCE
// ============================================================================
/**
 * Compares two Project arrays for structural identity (same IDs in same order,
 * with identical core properties like status and budget).
 * If identical, returns the previous array reference to eliminate Virtual DOM
 * reconciliation overhead during page scrolling.
 */
export function areProjectListsIdentical(
  prevList: Project[] | null | undefined,
  newList: Project[]
): boolean {
  if (!prevList) return false;
  if (prevList === newList) return true;
  if (prevList.length !== newList.length) return false;

  for (let i = 0; i < newList.length; i++) {
    const a = prevList[i];
    const b = newList[i];
    if (
      a.id !== b.id ||
      a.status !== b.status ||
      a.budget !== b.budget ||
      a.isBoosted !== b.isBoosted ||
      a.isEmergency !== b.isEmergency
    ) {
      return false;
    }
  }
  return true;
}

// Clear caches utility if needed (e.g. data reset)
export function clearCityFilterMemoizationCache(): void {
  cityPairDistanceCache.clear();
  spatialFilterCache.clear();
}
