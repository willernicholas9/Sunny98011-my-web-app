import React from "react";
import { PlayerState } from "../../types/gameTypes";
import { Trophy, Medal, RotateCcw, Home, Sparkles } from "lucide-react";

interface GameOverModalProps {
  isOpen: boolean;
  players: PlayerState[];
  currentLevel: number;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
  onOpenLeaderboard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  players,
  currentLevel,
  onPlayAgain,
  onReturnToLobby,
  onOpenLeaderboard,
}) => {
  if (!isOpen) return null;

  // Rank players by score descending
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-6 text-white text-center relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Winner Crown Header */}
        <div className="relative z-10 space-y-3">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-500 to-rose-500 flex items-center justify-center text-4xl shadow-2xl shadow-amber-500/30 animate-bounce">
            👑
          </div>

          <div>
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              SPIRAL TOWER CHAMPION
            </span>
            <h2 className="text-3xl font-black text-white mt-1">{winner?.name} VICTORIOUS!</h2>
            <p className="text-xs text-slate-300 font-semibold mt-1">
              Highest Tower Altitude: <span className="text-cyan-400 font-black">Level {Math.floor(currentLevel)} / 200</span>
            </p>
          </div>
        </div>

        {/* Podium Rankings Table */}
        <div className="space-y-2 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">
            FINAL ROUND STANDINGS
          </div>

          {sorted.map((p, idx) => {
            const rank = idx + 1;
            const isWinner = rank === 1;

            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                  isWinner
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-200"
                    : "bg-slate-900/60 border-slate-800 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                      isWinner ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {rank === 1 ? "1st" : rank === 2 ? "2nd" : rank === 3 ? "3rd" : "4th"}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-lg">{p.character.avatarIcon}</span>
                    <div>
                      <span className="font-extrabold text-xs text-white block">{p.name}</span>
                      <span className="text-[10px] text-slate-400">LVL {Math.floor(p.level)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-black text-amber-400 text-sm">
                  {p.score.toLocaleString()} pts
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black py-3 px-4 rounded-xl transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer text-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold py-3 px-4 rounded-xl transition cursor-pointer text-xs"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Leaderboard</span>
          </button>

          <button
            type="button"
            onClick={onReturnToLobby}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold py-3 px-4 rounded-xl transition cursor-pointer text-xs"
          >
            <Home className="w-4 h-4" />
            <span>Lobby</span>
          </button>
        </div>
      </div>
    </div>
  );
};
