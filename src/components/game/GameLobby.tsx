import React, { useState } from "react";
import { GameSettings, PlayerState, AIDifficulty } from "../../types/gameTypes";
import { CHARACTERS } from "../../data/characters";
import { Users, Volume2, VolumeX, Play, Trophy, Sparkles, Shield, Music, Zap, Camera, Upload, Trash2, Smile } from "lucide-react";
import { audioEngine } from "../../services/audioEngine";

// Preset Fun Custom Heads
const PRESET_HEADS = [
  {
    id: "shades",
    label: "🕶️ Shades",
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23f59e0b"/><circle cx="35" cy="45" r="14" fill="%230f172a"/><circle cx="65" cy="45" r="14" fill="%230f172a"/><rect x="20" y="38" width="60" height="12" rx="4" fill="%230f172a"/><path d="M 30 70 Q 50 85 70 70" stroke="%230f172a" stroke-width="6" fill="none" stroke-linecap="round"/></svg>',
  },
  {
    id: "robot",
    label: "🤖 Cyber Bot",
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="16" fill="%2338bdf8"/><rect x="20" y="30" width="60" height="24" rx="6" fill="%23020617"/><circle cx="35" cy="42" r="6" fill="%2322d3ee"/><circle cx="65" cy="42" r="6" fill="%2322d3ee"/><rect x="25" y="65" width="50" height="8" rx="2" fill="%23020617"/><line x1="50" y1="0" x2="50" y2="10" stroke="%2338bdf8" stroke-width="6"/><circle cx="50" cy="0" r="6" fill="%23f43f5e"/></svg>',
  },
  {
    id: "crown",
    label: "👑 Crown",
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23ec4899"/><polygon points="20,70 25,30 40,50 50,20 60,50 75,30 80,70" fill="%23f59e0b" stroke="%23fde047" stroke-width="3"/><circle cx="25" cy="28" r="4" fill="%23f43f5e"/><circle cx="50" cy="18" r="5" fill="%2338bdf8"/><circle cx="75" cy="28" r="4" fill="%23f43f5e"/><path d="M 35 80 Q 50 90 65 80" stroke="%23ffffff" stroke-width="5" fill="none" stroke-linecap="round"/></svg>',
  },
  {
    id: "cat",
    label: "😺 Kitty",
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="55" r="40" fill="%2310b981"/><polygon points="15,40 25,10 40,30" fill="%23059669"/><polygon points="85,40 75,10 60,30" fill="%23059669"/><circle cx="35" cy="50" r="8" fill="%23fef08a"/><circle cx="65" cy="50" r="8" fill="%23fef08a"/><circle cx="35" cy="50" r="3" fill="%230f172a"/><circle cx="65" cy="50" r="3" fill="%230f172a"/><polygon points="50,60 45,66 55,66" fill="%23f43f5e"/></svg>',
  },
  {
    id: "alien",
    label: "👽 Alien",
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="42" ry="46" fill="%23a855f7"/><ellipse cx="32" cy="45" rx="12" ry="18" fill="%23020617" transform="rotate(-15 32 45)"/><ellipse cx="68" cy="45" rx="12" ry="18" fill="%23020617" transform="rotate(15 68 45)"/><ellipse cx="34" cy="42" rx="4" ry="6" fill="%2322d3ee"/><ellipse cx="66" cy="42" rx="4" ry="6" fill="%2322d3ee"/><path d="M 40 75 Q 50 82 60 75" stroke="%23020617" stroke-width="4" fill="none"/></svg>',
  },
  {
    id: "cowboy",
    label: "🤠 Cowboy",
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="58" r="38" fill="%23f97316"/><path d="M 10 38 Q 50 20 90 38 L 85 22 Q 50 12 15 22 Z" fill="%2378350f"/><ellipse cx="50" cy="36" rx="45" ry="10" fill="%2392400e"/><circle cx="35" cy="54" r="6" fill="%230f172a"/><circle cx="65" cy="54" r="6" fill="%230f172a"/><path d="M 35 74 Q 50 86 65 74" stroke="%230f172a" stroke-width="5" fill="none" stroke-linecap="round"/></svg>',
  },
];

interface GameLobbyProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onStartGame: (players: PlayerState[]) => void;
  onOpenLeaderboard: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  settings,
  onUpdateSettings,
  onStartGame,
  onOpenLeaderboard,
  isMuted,
  onToggleMute,
}) => {
  const [humanCount, setHumanCount] = useState<number>(settings.humanPlayerCount);
  const [difficulty, setDifficulty] = useState<AIDifficulty>(settings.aiDifficulty);

  // Default Player Customization
  const [playerNames, setPlayerNames] = useState<string[]>([
    "Player 1",
    "Player 2",
    "Player 3",
    "Player 4",
  ]);

  const [selectedChars, setSelectedChars] = useState<string[]>([
    "zack",
    "jet",
    "naomi",
    "dub",
  ]);

  const [customHeads, setCustomHeads] = useState<Record<number, string>>({});

  const handleFileUpload = (slotIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomHeads((prev) => ({
          ...prev,
          [slotIdx]: event.target!.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStart = () => {
    // Generate 4 player states
    const players: PlayerState[] = [0, 1, 2, 3].map((slotIdx) => {
      const isHuman = slotIdx < humanCount;
      const charConfig = CHARACTERS.find((c) => c.id === selectedChars[slotIdx]) || CHARACTERS[slotIdx];

      return {
        id: `player-${slotIdx}`,
        slotIndex: slotIdx,
        name: isHuman ? playerNames[slotIdx] || `Player ${slotIdx + 1}` : `CPU ${slotIdx + 1} (${charConfig.name})`,
        type: isHuman ? "human" : "cpu",
        character: charConfig,
        customHeadImage: customHeads[slotIdx],
        score: 0,
        level: 1,
        action: "running",
        actionTimer: 0,
        knockedOff: false,
        knockedOffAngle: 0,
        knockedOffRadius: 180,
        knockedOffY: 200,
        knockedOffVy: 0,
        shieldActive: false,
        hasSpoken: false,
        lastSpeechText: "",
        speechBubbleTimer: 0,
        combo: 0,
        color: charConfig.color,
        jumpStamina: 100,
        maxStamina: 100,
        staminaExhausted: false,
      };
    });

    onUpdateSettings({
      ...settings,
      humanPlayerCount: humanCount,
      aiDifficulty: difficulty,
    });

    onStartGame(players);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Hero Arcade Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-purple-800/60 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Inspired by Fuzion Frenzy
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
              JUMP AROUND <span className="text-amber-400">SPIRAL RUSH 200</span>
            </h1>
            <p className="text-sm md:text-base text-slate-300 max-w-xl font-medium">
              Ascend a spinning spiral walkway up to <span className="font-extrabold text-cyan-400">Level 200</span>! The walkway spins faster the higher you climb. Jump over low hurdles & duck under overhead lasers!
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-xl font-black font-mono">
                ⬆ UP ARROW = JUMP
              </span>
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-xl font-black font-mono">
                ⬇ DOWN ARROW = DUCK
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-xl font-bold font-mono">
                ⚡ JUMP STAMINA: 3 CHARGES (RECHARGES ON RUN/DUCK)
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 shrink-0">
            <button
              type="button"
              onClick={onStartGame ? handleStart : undefined}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black text-lg py-4 px-8 rounded-2xl transition-all duration-200 shadow-xl shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <Play className="w-6 h-6 fill-slate-950" />
              <span>START RACE!</span>
            </button>

            <button
              type="button"
              onClick={onOpenLeaderboard}
              className="flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-amber-300 font-extrabold text-sm py-2.5 px-5 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Top 6 Leaderboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lobby Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Mode & Player Setup */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 text-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" /> 1. Human Players & CPUs
            </h2>
            <span className="text-xs font-bold text-slate-400">Total: 4 Slots</span>
          </div>

          {/* Select Human Players Count */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
              Human Players Count
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setHumanCount(count)}
                  className={`py-3 px-2 rounded-2xl font-black text-xs md:text-sm border transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    humanCount === count
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20"
                      : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span>{count} Human</span>
                  <span className="text-[10px] opacity-80 font-semibold">
                    +{4 - count} CPU{4 - count === 1 ? "" : "s"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Difficulty Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
              Computer AI Difficulty
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["easy", "medium", "hard", "frenzy"] as AIDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 px-2 rounded-xl font-extrabold text-xs border uppercase transition cursor-pointer ${
                    difficulty === diff
                      ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Sound & Music Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
              <span>Audio & Arcade Soundtrack</span>
              <span className="text-[10px] text-amber-400 font-extrabold uppercase">Homemade Synth Remixes</span>
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleMute}
                  className={`flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer shrink-0 ${
                    isMuted
                      ? "bg-rose-950 text-rose-300 border-rose-800"
                      : "bg-slate-800 text-cyan-300 border-slate-700"
                  }`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isMuted ? "Audio Muted" : "Audio Active"}</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 grow">
                  <Music className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">Synthesizer & Player Voice Synth</span>
                </div>
              </div>

              {/* Soundtrack Remix Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const nextTrack = "jump_around";
                    onUpdateSettings({ ...settings, musicTrack: nextTrack });
                    audioEngine.setMusicTrack(nextTrack);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-extrabold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    (settings.musicTrack || "jump_around") === "jump_around"
                      ? "bg-purple-600 text-white border-purple-400 shadow-md"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span>📢 Jump Around</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const nextTrack = "ice_ice_baby";
                    onUpdateSettings({ ...settings, musicTrack: nextTrack });
                    audioEngine.setMusicTrack(nextTrack);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-extrabold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    settings.musicTrack === "ice_ice_baby"
                      ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow-md font-black"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span>🧊 Ice Ice Baby</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const nextTrack = "cyber_overdrive";
                    onUpdateSettings({ ...settings, musicTrack: nextTrack });
                    audioEngine.setMusicTrack(nextTrack);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-extrabold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    settings.musicTrack === "cyber_overdrive"
                      ? "bg-rose-500 text-white border-rose-300 shadow-md font-black"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span>⚡ Overdrive</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const nextTrack = "rotation";
                    onUpdateSettings({ ...settings, musicTrack: nextTrack });
                    audioEngine.setMusicTrack(nextTrack);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-extrabold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    settings.musicTrack === "rotation"
                      ? "bg-amber-500 text-slate-950 border-amber-300 shadow-md font-black"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span>🔀 DJ Mix</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: 4 Players Character Lineup */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> 2. Character Rosters
            </h2>
            <span className="text-xs font-bold text-slate-400">Choose Character</span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {[0, 1, 2, 3].map((slotIdx) => {
              const isHuman = slotIdx < humanCount;
              const currentChar = CHARACTERS.find((c) => c.id === selectedChars[slotIdx]) || CHARACTERS[slotIdx];

              return (
                <div
                  key={slotIdx}
                  className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3 space-y-2"
                  style={{ borderLeftWidth: "4px", borderLeftColor: currentChar.color }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentChar.color }} />
                      {isHuman ? `PLAYER ${slotIdx + 1}` : `CPU ${slotIdx + 1}`}
                    </span>
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                        isHuman ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isHuman ? "HUMAN CONTROLLER" : "COMPUTER AI"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Name input for human */}
                    {isHuman ? (
                      <input
                        type="text"
                        value={playerNames[slotIdx]}
                        onChange={(e) => {
                          const updated = [...playerNames];
                          updated[slotIdx] = e.target.value;
                          setPlayerNames(updated);
                        }}
                        placeholder={`Player ${slotIdx + 1} Name`}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-hidden focus:border-cyan-500"
                      />
                    ) : (
                      <div className="bg-slate-900 border border-slate-800/60 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-400">
                        {currentChar.name} Bot
                      </div>
                    )}

                    {/* Character selector */}
                    <select
                      value={selectedChars[slotIdx]}
                      onChange={(e) => {
                        const updated = [...selectedChars];
                        updated[slotIdx] = e.target.value;
                        setSelectedChars(updated);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-extrabold text-white focus:outline-hidden focus:border-cyan-500 cursor-pointer"
                    >
                      {CHARACTERS.map((char) => (
                        <option key={char.id} value={char.id}>
                          {char.avatarIcon} {char.name} ({char.title})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Head Picture Feature */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                      <span className="flex items-center gap-1.5 text-amber-300">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Custom Head Photo / Avatar</span>
                      </span>
                      {customHeads[slotIdx] && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...customHeads };
                            delete updated[slotIdx];
                            setCustomHeads(updated);
                          }}
                          className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Reset Head
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Active Head Avatar Preview */}
                      <div
                        className="w-9 h-9 rounded-xl border border-amber-400/60 overflow-hidden shrink-0 flex items-center justify-center text-lg font-bold shadow-sm"
                        style={{ backgroundColor: currentChar.color }}
                      >
                        {customHeads[slotIdx] ? (
                          <img
                            src={customHeads[slotIdx]}
                            alt="Custom Head"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          currentChar.avatarIcon
                        )}
                      </div>

                      {/* File Upload Button */}
                      <label className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] font-extrabold text-cyan-300 hover:text-cyan-200 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Custom Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(slotIdx, e)}
                        />
                      </label>
                    </div>

                    {/* Quick Preset Fun Heads */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px]">
                      <span className="text-slate-500 font-bold shrink-0">Presets:</span>
                      {PRESET_HEADS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setCustomHeads((prev) => ({
                              ...prev,
                              [slotIdx]: preset.url,
                            }));
                          }}
                          className={`px-2 py-0.5 rounded-lg border font-bold shrink-0 cursor-pointer transition ${
                            customHeads[slotIdx] === preset.url
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                              : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
