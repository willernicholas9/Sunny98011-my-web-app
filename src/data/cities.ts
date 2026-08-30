import { CityData } from "../types";

export type { CityData };

export const CITIES: CityData[] = [
  // ⭐ PREFERRED PRIMARY REGION: Central US Time Zone (CT - Texas, Midwest & Plains)
  { name: "Austin", state: "TX", zipCode: "78701", lat: 30.2672, lng: -97.7431 },
  { name: "Dallas", state: "TX", zipCode: "75201", lat: 32.7767, lng: -96.7970 },
  { name: "Houston", state: "TX", zipCode: "77001", lat: 29.7604, lng: -95.3698 },
  { name: "San Antonio", state: "TX", zipCode: "78205", lat: 29.4241, lng: -98.4936 },
  { name: "Fort Worth", state: "TX", zipCode: "76102", lat: 32.7555, lng: -97.3308 },
  { name: "Chicago", state: "IL", zipCode: "60601", lat: 41.8781, lng: -87.6298 },
  { name: "Round Rock", state: "TX", zipCode: "78664", lat: 30.5083, lng: -97.6789 }, // ~17 miles from Austin
  { name: "Georgetown", state: "TX", zipCode: "78626", lat: 30.6382, lng: -97.6780 },  // ~26 miles
  { name: "San Marcos", state: "TX", zipCode: "78666", lat: 29.8833, lng: -97.9414 }, // ~31 miles
  { name: "New Braunfels", state: "TX", zipCode: "78130", lat: 29.7030, lng: -98.1245 }, // ~48 miles
  { name: "St. Louis", state: "MO", zipCode: "63101", lat: 38.6270, lng: -90.1994 },
  { name: "Minneapolis", state: "MN", zipCode: "55401", lat: 44.9778, lng: -93.2650 },
  { name: "Nashville", state: "TN", zipCode: "37201", lat: 36.1627, lng: -86.7816 },
  { name: "Oklahoma City", state: "OK", zipCode: "73101", lat: 35.4676, lng: -97.5164 },
  { name: "Tulsa", state: "OK", zipCode: "74103", lat: 36.1540, lng: -95.9928 },
  { name: "Killeen", state: "TX", zipCode: "76541", lat: 31.1171, lng: -97.7278 },
  { name: "Waco", state: "TX", zipCode: "76701", lat: 31.5493, lng: -97.1467 },
  { name: "Kansas City", state: "MO", zipCode: "64106", lat: 39.0997, lng: -94.5786 },
  { name: "Omaha", state: "NE", zipCode: "68102", lat: 41.2565, lng: -95.9345 },
  { name: "Milwaukee", state: "WI", zipCode: "53202", lat: 43.0389, lng: -87.9065 },
  { name: "Indianapolis", state: "IN", zipCode: "46204", lat: 39.7684, lng: -86.1581 },
  { name: "New Orleans", state: "LA", zipCode: "70112", lat: 29.9511, lng: -90.0715 },
  { name: "Memphis", state: "TN", zipCode: "38103", lat: 35.1495, lng: -90.0490 },

  // Secondary Region: California & West (Pacific & Mountain Time Zones)
  { name: "Los Angeles", state: "CA", zipCode: "90001", lat: 34.0522, lng: -118.2437 },
  { name: "Beverly Hills", state: "CA", zipCode: "90210", lat: 34.0736, lng: -118.4004 },
  { name: "Pasadena", state: "CA", zipCode: "91101", lat: 34.1478, lng: -118.1445 },
  { name: "Long Beach", state: "CA", zipCode: "90802", lat: 33.7701, lng: -118.1937 },
  { name: "Anaheim", state: "CA", zipCode: "92801", lat: 33.8366, lng: -117.9143 },
  { name: "Irvine", state: "CA", zipCode: "92606", lat: 33.6846, lng: -117.8265 },
  { name: "San Francisco", state: "CA", zipCode: "94102", lat: 37.7749, lng: -122.4194 },
  { name: "San Diego", state: "CA", zipCode: "92101", lat: 32.7157, lng: -117.1611 },
  { name: "San Jose", state: "CA", zipCode: "95113", lat: 37.3382, lng: -121.8863 },
  { name: "Seattle", state: "WA", zipCode: "98101", lat: 47.6062, lng: -122.3321 },
  { name: "Portland", state: "OR", zipCode: "97201", lat: 45.5152, lng: -122.6784 },
  { name: "Denver", state: "CO", zipCode: "80202", lat: 39.7392, lng: -104.9903 },
  { name: "Phoenix", state: "AZ", zipCode: "85001", lat: 33.4484, lng: -112.0740 },
  { name: "Las Vegas", state: "NV", zipCode: "89101", lat: 36.1699, lng: -115.1398 },
  { name: "Salt Lake City", state: "UT", zipCode: "84101", lat: 40.7608, lng: -111.8910 },
  { name: "Albuquerque", state: "NM", zipCode: "87101", lat: 35.0844, lng: -106.6504 },

  // Secondary Region: Eastern & Southeastern US Metros
  { name: "Atlanta", state: "GA", zipCode: "30301", lat: 33.7490, lng: -84.3880 },
  { name: "Miami", state: "FL", zipCode: "33101", lat: 25.7617, lng: -80.1918 },
  { name: "Orlando", state: "FL", zipCode: "32801", lat: 28.5383, lng: -81.3792 },
  { name: "Tampa", state: "FL", zipCode: "33602", lat: 27.9506, lng: -82.4572 },
  { name: "Jacksonville", state: "FL", zipCode: "32202", lat: 30.3322, lng: -81.6557 },
  { name: "Charlotte", state: "NC", zipCode: "28202", lat: 35.2271, lng: -80.8431 },
  { name: "Raleigh", state: "NC", zipCode: "27601", lat: 35.7796, lng: -78.6382 },
  { name: "New York", state: "NY", zipCode: "10001", lat: 40.7128, lng: -74.0060 },
  { name: "Boston", state: "MA", zipCode: "02108", lat: 42.3601, lng: -71.0589 },
  { name: "Philadelphia", state: "PA", zipCode: "19102", lat: 39.9526, lng: -75.1652 },
  { name: "Pittsburgh", state: "PA", zipCode: "15222", lat: 40.4406, lng: -79.9959 },
  { name: "Washington", state: "DC", zipCode: "20001", lat: 38.9072, lng: -77.0369 },
  { name: "Baltimore", state: "MD", zipCode: "21201", lat: 39.2904, lng: -76.6122 },
  { name: "Columbus", state: "OH", zipCode: "43215", lat: 39.9612, lng: -82.9988 },
  { name: "Cleveland", state: "OH", zipCode: "44114", lat: 41.4993, lng: -81.6944 },
  { name: "Cincinnati", state: "OH", zipCode: "45202", lat: 39.1031, lng: -84.5120 },
  { name: "Detroit", state: "MI", zipCode: "48226", lat: 42.3314, lng: -83.0458 },
  { name: "Louisville", state: "KY", zipCode: "40202", lat: 38.2527, lng: -85.7585 },
  { name: "Birmingham", state: "AL", zipCode: "35203", lat: 33.5186, lng: -86.8104 },
  { name: "Richmond", state: "VA", zipCode: "23219", lat: 37.5407, lng: -77.4360 },
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

// Search cities & ZIP codes by partial input
export function searchCitiesAndZips(query: string, maxResults: number = 8): CityData[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CITIES.filter((c) => {
    return (
      c.zipCode.startsWith(q) ||
      c.name.toLowerCase().includes(q) ||
      c.state.toLowerCase() === q ||
      `${c.name.toLowerCase()}, ${c.state.toLowerCase()}`.includes(q)
    );
  }).slice(0, maxResults);
}

// Helper to look up City and State info for any 5-digit ZIP code
export function getCityDetailsForZip(zip: string): { name: string; state: string; label: string } | null {
  const cleanZip = zip.trim();
  const found = CITIES.find((c) => c.zipCode === cleanZip);
  if (found) {
    return {
      name: found.name,
      state: found.state,
      label: `${found.name}, ${found.state}`,
    };
  }
  return null;
}
