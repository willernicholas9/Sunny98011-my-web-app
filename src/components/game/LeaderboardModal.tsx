import React from "react";
import { LeaderboardEntry } from "../../types/gameTypes";
import { Trophy, Medal, Sparkles, X, RefreshCw } from "lucide-react";

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  onResetLeaderboard: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  entries,
  onResetLeaderboard,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-white relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black text-2xl">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">TOP 6 TOWER LEADERBOARD</h2>
            <p className="text-xs text-slate-400 font-semibold">Highest Spiral Tower Climbers (Level 1 to 200)</p>
          </div>
        </div>

        {/* Leaderboard Table / Cards */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {entries.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-sm font-semibold">
              No scores recorded yet. Climb the spiral tower to set the first record!
            </p>
          ) : (
            entries.slice(0, 6).map((entry, index) => {
              const rank = index + 1;
              const isGold = rank === 1;
              const isSilver = rank === 2;
              const isBronze = rank === 3;

              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                    isGold
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-200 shadow-md shadow-amber-500/5"
                      : isSilver
                      ? "bg-slate-300/10 border-slate-400/40 text-slate-200"
                      : isBronze
                      ? "bg-amber-700/10 border-amber-700/40 text-amber-300"
                      : "bg-slate-950/60 border-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isGold
                          ? "bg-amber-400 text-slate-950 shadow-md"
                          : isSilver
                          ? "bg-slate-300 text-slate-950"
                          : isBronze
                          ? "bg-amber-700 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {rank === 1 ? "👑 1" : `#${rank}`}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-white">{entry.playerName}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-md font-semibold">
                          {entry.characterName}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {entry.mode} • {entry.date}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-amber-400 font-black text-sm">{entry.score.toLocaleString()} pts</div>
                    <div className="text-cyan-400 font-extrabold text-xs">
                      LVL {entry.levelReached} / 200
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
          <button
            type="button"
            onClick={onResetLeaderboard}
            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 font-semibold transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Leaderboard</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold py-2 px-5 rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
