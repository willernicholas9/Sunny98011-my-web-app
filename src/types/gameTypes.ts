export type CharacterId = "zack" | "jet" | "naomi" | "dub";

export interface CharacterConfig {
  id: CharacterId;
  name: string;
  title: string;
  color: string;
  accentColor: string;
  avatarIcon: string;
  customHeadImage?: string;
  jumpSounds: string[];
  duckSounds: string[];
  hitSounds: string[];
  quote: string;
}

export type PlayerType = "human" | "cpu";

export type ActionState = "running" | "jumping" | "ducking" | "knocked_off";

export interface PlayerState {
  id: string;
  slotIndex: number; // 0, 1, 2, 3
  name: string;
  type: PlayerType;
  character: CharacterConfig;
  customHeadImage?: string;
  score: number;
  level: number; // 1 to 200
  action: ActionState;
  actionTimer: number; // Duration remaining for jump or duck
  knockedOff: boolean;
  knockedOffAngle: number;
  knockedOffRadius: number;
  knockedOffY: number;
  knockedOffVy: number;
  shieldActive: boolean;
  hasSpoken: boolean;
  lastSpeechText: string;
  speechBubbleTimer: number;
  combo: number;
  color: string;
  jumpStamina: number; // 0 to 100
  maxStamina: number; // default 100
  staminaExhausted?: boolean;
  multiplierTimer?: number; // Duration of active 2X Frenzy
  // Controls mapping for human players
  controls?: {
    jumpKey: string;
    duckKey: string;
  };
}

export type ObstacleType = "low_hurdle" | "high_laser" | "double_combo" | "shield_gem" | "slowmo_powerup" | "coin_gem";

export interface VisualParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  shape?: "circle" | "spark" | "ring" | "text";
  text?: string;
}

export interface Obstacle {
  id: string;
  type: ObstacleType;
  angle: number; // Radians along spiral arc
  level: number; // 1 to 200
  heightOffset: number; // Elevation along tower
  active: boolean;
  passedByPlayers: Record<string, boolean>; // player id -> boolean
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  characterName: string;
  characterId: CharacterId;
  levelReached: number;
  score: number;
  mode: string; // e.g. "1 Player + 3 CPUs"
  date: string;
}

export type GamePhase = "lobby" | "countdown" | "playing" | "game_over";

export type AIDifficulty = "easy" | "medium" | "hard" | "frenzy";

export interface GameSettings {
  humanPlayerCount: number; // 1 to 4
  aiDifficulty: AIDifficulty;
  musicVolume: number;
  sfxVolume: number;
  voicesEnabled: boolean;
  speedMultiplier: number;
  gameMode?: "classic" | "daily_challenge" | "speedrun";
  musicTrack?: "jump_around" | "ice_ice_baby" | "rotation" | "cyber_overdrive";
}
