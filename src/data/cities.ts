import { CityData } from "../types";

export const CITIES: CityData[] = [
  // Texas Cluster (within ~75 miles of Austin)
  { name: "Austin", state: "TX", zipCode: "78701", lat: 30.2672, lng: -97.7431 },
  { name: "Round Rock", state: "TX", zipCode: "78664", lat: 30.5083, lng: -97.6789 }, // ~17 miles
  { name: "Georgetown", state: "TX", zipCode: "78626", lat: 30.6382, lng: -97.678 },  // ~26 miles
  { name: "San Marcos", state: "TX", zipCode: "78666", lat: 29.8833, lng: -97.9414 }, // ~31 miles
  { name: "New Braunfels", state: "TX", zipCode: "78130", lat: 29.703, lng: -98.1245 }, // ~48 miles
  { name: "San Antonio", state: "TX", zipCode: "78205", lat: 29.4241, lng: -98.4936 },  // ~74 miles
  { name: "Killeen", state: "TX", zipCode: "76541", lat: 31.1171, lng: -97.7278 },      // ~59 miles
  
  // California Cluster (within ~70 miles of Los Angeles)
  { name: "Los Angeles", state: "CA", zipCode: "90001", lat: 34.0522, lng: -118.2437 },
  { name: "Pasadena", state: "CA", zipCode: "91101", lat: 34.1478, lng: -118.1445 },     // ~10 miles
  { name: "Long Beach", state: "CA", zipCode: "90802", lat: 33.7701, lng: -118.1937 },   // ~20 miles
  { name: "Anaheim", state: "CA", zipCode: "92801", lat: 33.8366, lng: -117.9143 },      // ~25 miles
  { name: "Irvine", state: "CA", zipCode: "92606", lat: 33.6846, lng: -117.8265 },       // ~40 miles
  { name: "Riverside", state: "CA", zipCode: "92501", lat: 33.9533, lng: -117.3962 },    // ~50 miles
  { name: "San Bernardino", state: "CA", zipCode: "92401", lat: 34.1083, lng: -117.2898 }, // ~55 miles

  // Illinois / Indiana (Chicago Area)
  { name: "Chicago", state: "IL", zipCode: "60601", lat: 41.8781, lng: -87.6298 },
  { name: "Evanston", state: "IL", zipCode: "60201", lat: 42.0451, lng: -87.6877 },      // ~12 miles
  { name: "Naperville", state: "IL", zipCode: "60540", lat: 41.7508, lng: -88.1535 },    // ~28 miles
  { name: "Gary", state: "IN", zipCode: "46402", lat: 41.5934, lng: -87.3464 },          // ~30 miles
  { name: "Joliet", state: "IL", zipCode: "60431", lat: 41.525, lng: -88.0817 },         // ~35 miles
  { name: "Kenosha", state: "WI", zipCode: "53140", lat: 42.5847, lng: -87.8212 },       // ~50 miles
];

// Calculate distance in miles between two latitude/longitude coordinates using the Haversine formula
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
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
