import React from "react";
import { PlayerState } from "../../types/gameTypes";
import { Shield, Sparkles, Trophy, ArrowUp, ArrowDown, Zap } from "lucide-react";

interface PlayerControlHUDProps {
  players: PlayerState[];
  currentLevel: number;
  onPlayerJump: (playerIndex: number) => void;
  onPlayerDuck: (playerIndex: number) => void;
  isGamePlaying: boolean;
}

export const PlayerControlHUD: React.FC<PlayerControlHUDProps> = ({
  players,
  currentLevel,
  onPlayerJump,
  onPlayerDuck,
  isGamePlaying
}) => {
  return (
    <div className="w-full space-y-4">
      {/* Top Level Bar & Tower Elevation Marker (Level 1 to Level 200) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 font-black text-xl">
            {Math.min(200, Math.floor(currentLevel))}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest uppercase text-cyan-400">Spiral Tower Height</span>
              <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                Target: Level 200
              </span>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" /> Stamina System Active
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-300">
              {currentLevel >= 150
                ? "🔥 FRENZY SPEED! Ultra fast spinning!"
                : currentLevel >= 100
                ? "⚡ HIGH SPEED! Watch overhead lasers!"
                : currentLevel >= 50
                ? "🚀 RAPID CLIMB! Obstacles accelerating!"
                : "Ascending the spiral walkway... Manage jump stamina!"}
            </p>
          </div>
        </div>

        {/* Level 200 Progress Bar */}
        <div className="w-full md:w-1/2 space-y-1.5">
          <div className="flex justify-between text-xs font-black text-slate-400">
            <span>START (LVL 1)</span>
            <span className="text-amber-400 flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> LEVEL 200 APEX</span>
          </div>
          <div className="w-full h-3.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden p-0.5 relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-amber-400 to-rose-500 transition-all duration-200"
              style={{ width: `${Math.min(100, (currentLevel / 200) * 100)}%` }}
            />
            {/* Level 50, 100, 150 check markers */}
            <div className="absolute top-0 bottom-0 left-[25%] w-0.5 bg-slate-700/80" title="Level 50" />
            <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-amber-500/80" title="Level 100" />
            <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-purple-500/80" title="Level 150" />
          </div>
        </div>
      </div>

      {/* 4 Players Control HUD Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {players.map((player, idx) => {
          const isAlive = !player.knockedOff;
          const isHuman = player.type === "human";
          const stamina = player.jumpStamina !== undefined ? player.jumpStamina : 100;
          const canJump = stamina >= 34;
          const jumpsAvailable = Math.floor(stamina / 34);

          return (
            <div
              key={player.id}
              className={`relative bg-slate-900 border ${
                isAlive ? "border-slate-800 hover:border-slate-700" : "border-rose-950/60 opacity-60"
              } rounded-2xl p-3.5 flex flex-col justify-between space-y-3 transition shadow-lg overflow-hidden`}
              style={{ borderTopWidth: "4px", borderTopColor: player.color }}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-md overflow-hidden relative"
                    style={{ backgroundColor: player.color }}
                  >
                    {(player.customHeadImage || player.character.customHeadImage) ? (
                      <img
                        src={player.customHeadImage || player.character.customHeadImage}
                        alt="Custom Head"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      player.character.avatarIcon
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-white">{player.name}</span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.25 rounded-md uppercase ${
                          isHuman ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {isHuman ? `P${idx + 1}` : "CPU"}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">{player.character.title}</span>
                  </div>
                </div>

                {player.shieldActive && (
                  <div className="flex items-center gap-1 text-[10px] font-extrabold text-cyan-300 bg-cyan-950 border border-cyan-700 px-2 py-0.5 rounded-full animate-pulse">
                    <Shield className="w-3 h-3 text-cyan-400" />
                    <span>SHIELD</span>
                  </div>
                )}

                {player.multiplierTimer && player.multiplierTimer > 0 && (
                  <div className="flex items-center gap-1 text-[10px] font-extrabold text-amber-950 bg-amber-400 border border-amber-300 px-2 py-0.5 rounded-full animate-bounce">
                    <Sparkles className="w-3 h-3 text-amber-900" />
                    <span>2X FRENZY</span>
                  </div>
                )}
              </div>

              {/* Player Score & Level Metrics with Fuzion Frenzy Arc Gauge Styling */}
              <div className="bg-slate-950/90 rounded-2xl p-2.5 flex items-center justify-between border border-slate-800/80 text-xs relative overflow-hidden">
                {/* Gauge Background Accent Arc */}
                <div 
                  className="absolute right-0 top-0 bottom-0 w-24 opacity-25 pointer-events-none rounded-r-2xl"
                  style={{ background: `radial-gradient(circle at right, ${player.color}, transparent 80%)` }}
                />

                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">SCORE</span>
                  <span className="font-extrabold text-amber-400 text-sm font-mono">{player.score.toLocaleString()}</span>
                </div>

                <div className="text-right flex items-center gap-2">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">HEIGHT</span>
                    <span className="text-[10px] font-bold text-slate-400">LVL</span>
                  </div>
                  {/* Big Fuzion Frenzy Style Level Number Display */}
                  <div 
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-xl text-white font-mono shadow-inner border border-white/20"
                    style={{ backgroundColor: player.color }}
                  >
                    {Math.floor(player.level)}
                  </div>
                </div>
              </div>

              {/* Jump Stamina Gauge */}
              <div className="bg-slate-950/90 rounded-xl p-2 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1 font-bold">
                    <Zap className={`w-3 h-3 ${canJump ? "text-emerald-400" : "text-rose-400 animate-pulse"}`} />
                    <span className="text-slate-400 uppercase tracking-wider">Jump Stamina</span>
                  </div>
                  <span
                    className={`font-black font-mono px-1.5 py-0.5 rounded text-[9px] ${
                      stamina >= 68
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : stamina >= 34
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                    }`}
                  >
                    {stamina >= 68
                      ? `${jumpsAvailable} JUMPS READY`
                      : stamina >= 34
                      ? "1 JUMP READY"
                      : "⚡ RECHARGING..."}
                  </span>
                </div>

                {/* Segmented Stamina Bar */}
                <div className="w-full h-2.5 bg-slate-900 rounded-full border border-slate-800 overflow-hidden relative p-0.5 flex">
                  {/* 3 Jump Segments Markers */}
                  <div className="absolute top-0 bottom-0 left-[33.3%] w-0.5 bg-slate-950 z-10" />
                  <div className="absolute top-0 bottom-0 left-[66.6%] w-0.5 bg-slate-950 z-10" />

                  <div
                    className={`h-full rounded-full transition-all duration-100 ${
                      stamina >= 68
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-sm shadow-emerald-400/30"
                        : stamina >= 34
                        ? "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-sm shadow-amber-400/30"
                        : "bg-gradient-to-r from-rose-600 to-rose-400 animate-pulse shadow-sm shadow-rose-500/40"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, stamina))}%` }}
                  />
                </div>
              </div>

              {/* Status or Controls */}
              {isAlive ? (
                isHuman ? (
                  <div className="space-y-2">
                    {/* Keyboard Controls Hint */}
                    <div className="text-[10px] font-extrabold text-amber-300 text-center bg-slate-950/90 border border-amber-500/30 rounded-xl py-1.5 shadow-sm">
                      {idx === 0
                        ? "⌨ Controls: [↑ UP] Jump | [↓ DOWN] Duck"
                        : idx === 1
                        ? "⌨ Controls: [I] Jump | [K] Duck"
                        : idx === 2
                        ? "⌨ Controls: [Numpad 8] Jump | [Numpad 5] Duck"
                        : "⌨ Controls: [Numpad 9] Jump | [Numpad 6] Duck"}
                    </div>

                    {/* Touch / Mouse Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onPlayerJump(idx)}
                        disabled={!isGamePlaying || !canJump}
                        className={`flex items-center justify-center gap-1.5 font-extrabold text-xs py-2.5 px-2 rounded-xl transition shadow-md active:scale-95 cursor-pointer ${
                          canJump
                            ? "bg-gradient-to-b from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white shadow-cyan-500/20"
                            : "bg-slate-800/90 text-rose-300 border border-rose-500/40 opacity-70 cursor-not-allowed"
                        }`}
                        title={canJump ? "Jump over low barrier (Up Arrow)" : "Low Stamina! Wait ~0.8s to recharge"}
                      >
                        <ArrowUp className={`w-4 h-4 ${!canJump && "text-rose-400"}`} />
                        <span>{canJump ? "JUMP!" : "TIRED..."}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onPlayerDuck(idx)}
                        disabled={!isGamePlaying}
                        className="flex items-center justify-center gap-1.5 bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-extrabold text-xs py-2.5 px-2 rounded-xl transition shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                        title="Duck under high laser (Down Arrow) - Recharges stamina faster!"
                      >
                        <ArrowDown className="w-4 h-4" />
                        <span>DUCK!</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 bg-slate-800/40 rounded-xl border border-slate-800/80 text-xs font-extrabold text-cyan-400 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    <span>AI Bot Reflex ({canJump ? "Ready" : "Resting"})</span>
                  </div>
                )
              ) : (
                <div className="text-center py-2 bg-rose-950/40 border border-rose-900/60 rounded-xl text-rose-300 font-extrabold text-xs">
                  💥 KNOCKED OFF TOWER
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
