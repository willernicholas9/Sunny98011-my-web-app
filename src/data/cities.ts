import { CityData } from "../types";

export const CITIES: CityData[] = [
  // ⭐ PREFERRED PRIMARY REGION: Central US Time Zone (CT - Texas, Midwest & Plains)
  { name: "Austin", state: "TX", zipCode: "78701", lat: 30.2672, lng: -97.7431 },
  { name: "Dallas", state: "TX", zipCode: "75201", lat: 32.7767, lng: -96.7970 },
  { name: "Houston", state: "TX", zipCode: "77001", lat: 29.7604, lng: -95.3698 },
  { name: "Chicago", state: "IL", zipCode: "60601", lat: 41.8781, lng: -87.6298 },
  { name: "Round Rock", state: "TX", zipCode: "78664", lat: 30.5083, lng: -97.6789 }, // ~17 miles from Austin
  { name: "Georgetown", state: "TX", zipCode: "78626", lat: 30.6382, lng: -97.678 },  // ~26 miles
  { name: "San Marcos", state: "TX", zipCode: "78666", lat: 29.8833, lng: -97.9414 }, // ~31 miles
  { name: "New Braunfels", state: "TX", zipCode: "78130", lat: 29.703, lng: -98.1245 }, // ~48 miles
  { name: "San Antonio", state: "TX", zipCode: "78205", lat: 29.4241, lng: -98.4936 },  // ~74 miles
  { name: "St. Louis", state: "MO", zipCode: "63101", lat: 38.6270, lng: -90.1994 },
  { name: "Minneapolis", state: "MN", zipCode: "55401", lat: 44.9778, lng: -93.2650 },
  { name: "Nashville", state: "TN", zipCode: "37201", lat: 36.1627, lng: -86.7816 },
  { name: "Oklahoma City", state: "OK", zipCode: "73101", lat: 35.4676, lng: -97.5164 },
  { name: "Killeen", state: "TX", zipCode: "76541", lat: 31.1171, lng: -97.7278 },
  
  // Secondary Region: California Cluster (Pacific Time Zone)
  { name: "Los Angeles", state: "CA", zipCode: "90001", lat: 34.0522, lng: -118.2437 },
  { name: "Pasadena", state: "CA", zipCode: "91101", lat: 34.1478, lng: -118.1445 },
  { name: "Long Beach", state: "CA", zipCode: "90802", lat: 33.7701, lng: -118.1937 },
  { name: "Anaheim", state: "CA", zipCode: "92801", lat: 33.8366, lng: -117.9143 },
  { name: "Irvine", state: "CA", zipCode: "92606", lat: 33.6846, lng: -117.8265 },

  // Secondary Region: Eastern US Metros
  { name: "Atlanta", state: "GA", zipCode: "30301", lat: 33.7490, lng: -84.3880 },
  { name: "Miami", state: "FL", zipCode: "33101", lat: 25.7617, lng: -80.1918 },
  { name: "New York", state: "NY", zipCode: "10001", lat: 40.7128, lng: -74.0060 },
];

const distanceCache = new Map<string, number>();

// Calculate distance in miles between two latitude/longitude coordinates using the Haversine formula
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const key = `${lat1},${lon1},${lat2},${lon2}`;
  const cached = distanceCache.get(key);
  if (cached !== undefined) return cached;

  const R = 3958.8; // Radius of the Earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = Math.round(R * c * 10) / 10; // Round to 1 decimal place
  distanceCache.set(key, distance);
  return distance;
}

// Find a city by name (case-insensitive) or search match
export function findCity(nameOrZip: string): CityData | null {
  const query = nameOrZip.trim().toLowerCase();
  if (!query) return null;
  return (
    CITIES.find(
      (c) =>
        c.name.toLowerCase() === query ||
        c.zipCode === query ||
        `${c.name.toLowerCase()}, ${c.state.toLowerCase()}` === query
    ) || null
  );
}
