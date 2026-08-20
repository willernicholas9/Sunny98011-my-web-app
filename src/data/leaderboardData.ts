import { LeaderboardEntry } from "../types/gameTypes";

const LEADERBOARD_KEY = "hsws_spiral_frenzy_leaderboard";

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: "lb-1",
    playerName: "CyberZack",
    characterName: "Zack",
    characterId: "zack",
    levelReached: 188,
    score: 38400,
    mode: "1 Human + 3 CPUs",
    date: "2026-08-06"
  },
  {
    id: "lb-2",
    playerName: "NinjaJet",
    characterName: "Jet",
    characterId: "jet",
    levelReached: 164,
    score: 31200,
    mode: "1 Human + 3 CPUs",
    date: "2026-08-05"
  },
  {
    id: "lb-3",
    playerName: "VaporNaomi",
    characterName: "Naomi",
    characterId: "naomi",
    levelReached: 142,
    score: 26800,
    mode: "2 Humans + 2 CPUs",
    date: "2026-08-04"
  },
  {
    id: "lb-4",
    playerName: "HeavyDub",
    characterName: "Dub",
    characterId: "dub",
    levelReached: 118,
    score: 21500,
    mode: "1 Human + 3 CPUs",
    date: "2026-08-03"
  },
  {
    id: "lb-5",
    playerName: "ApexClimber",
    characterName: "Zack",
    characterId: "zack",
    levelReached: 95,
    score: 17200,
    mode: "1 Human + 3 CPUs",
    date: "2026-08-02"
  },
  {
    id: "lb-6",
    playerName: "SpiralMaster",
    characterName: "Jet",
    characterId: "jet",
    levelReached: 78,
    score: 14100,
    mode: "4 Humans",
    date: "2026-08-01"
  }
];

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const saved = localStorage.getItem(LEADERBOARD_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => b.score - a.score).slice(0, 6);
      }
    }
  } catch (e) {
    console.warn("Error loading leaderboard", e);
  }
  return INITIAL_LEADERBOARD;
}

export function saveLeaderboardEntry(newEntry: Omit<LeaderboardEntry, "id">): LeaderboardEntry[] {
  const current = getLeaderboard();
  const entry: LeaderboardEntry = {
    ...newEntry,
    id: `lb-${Date.now()}`
  };

  const updated = [...current, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6); // Keep top 6 scores!

  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Error saving leaderboard", e);
  }

  return updated;
}

export function resetLeaderboard(): LeaderboardEntry[] {
  try {
    localStorage.removeItem(LEADERBOARD_KEY);
  } catch (e) {}
  return INITIAL_LEADERBOARD;
}
