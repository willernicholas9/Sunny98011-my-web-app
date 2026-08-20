import React, { useState, useEffect, useRef, useCallback } from "react";
import { PlayerState, Obstacle, GamePhase, GameSettings, LeaderboardEntry } from "../../types/gameTypes";
import { SpiralTowerCanvas } from "./SpiralTowerCanvas";
import { PlayerControlHUD } from "./PlayerControlHUD";
import { GameLobby } from "./GameLobby";
import { GameOverModal } from "./GameOverModal";
import { LeaderboardModal } from "./LeaderboardModal";
import { audioEngine } from "../../services/audioEngine";
import { getLeaderboard, saveLeaderboardEntry, resetLeaderboard } from "../../data/leaderboardData";
import { Volume2, VolumeX, Trophy, RotateCcw, Play, Pause, ArrowLeft, Music } from "lucide-react";

export const SpiralFrenzyGame: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>("lobby");
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [settings, setSettings] = useState<GameSettings>({
    humanPlayerCount: 1,
    aiDifficulty: "medium",
    musicVolume: 0.4,
    sfxVolume: 0.7,
    voicesEnabled: true,
    speedMultiplier: 1.0,
  });

  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [highestLevelReached, setHighestLevelReached] = useState<number>(1);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [slowMoTimer, setSlowMoTimer] = useState<number>(0);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => getLeaderboard());
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

  // Refs for continuous game loop
  const playersRef = useRef<PlayerState[]>([]);
  playersRef.current = players;

  const obstaclesRef = useRef<Obstacle[]>([]);
  obstaclesRef.current = obstacles;

  const slowMoTimerRef = useRef<number>(0);
  slowMoTimerRef.current = slowMoTimer;

  const levelRef = useRef<number>(1);
  levelRef.current = currentLevel;

  const rotationRef = useRef<number>(0);
  rotationRef.current = rotationAngle;

  const phaseRef = useRef<GamePhase>("lobby");
  phaseRef.current = phase;

  const isPausedRef = useRef<boolean>(false);
  isPausedRef.current = isPaused;

  const isEndingRoundRef = useRef<boolean>(false);
  const nextObstacleIdRef = useRef<number>(1);

  // Toggle audio
  const handleToggleMute = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  // Jump trigger for player
  const triggerPlayerJump = useCallback((slotIdx: number) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.slotIndex !== slotIdx || p.knockedOff || p.action === "jumping") return p;

        const currentStamina = p.jumpStamina !== undefined ? p.jumpStamina : 100;
        const JUMP_COST = 34;

        // Check if player has enough stamina to jump (3 consecutive jumps from full)
        if (currentStamina < JUMP_COST) {
          audioEngine.playExhaustedSound(slotIdx);
          return {
            ...p,
            staminaExhausted: true,
            lastSpeechText: "LOW STAMINA!",
            speechBubbleTimer: 25,
          };
        }

        // Sound & Speech
        audioEngine.playJumpSound(slotIdx);
        const randomPhrase =
          p.character.jumpSounds[Math.floor(Math.random() * p.character.jumpSounds.length)];
        audioEngine.speakCharacterLine(randomPhrase, p.character.id);

        const newStamina = Math.max(0, currentStamina - JUMP_COST);

        return {
          ...p,
          action: "jumping",
          actionTimer: 25, // ~25 frames jump duration
          jumpStamina: newStamina,
          staminaExhausted: newStamina < JUMP_COST,
          lastSpeechText: randomPhrase,
          speechBubbleTimer: 35,
        };
      })
    );
  }, []);

  // Duck trigger for player
  const triggerPlayerDuck = useCallback((slotIdx: number) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.slotIndex !== slotIdx || p.knockedOff || p.action === "ducking") return p;

        // Sound & Speech
        audioEngine.playDuckSound(slotIdx);
        const randomPhrase =
          p.character.duckSounds[Math.floor(Math.random() * p.character.duckSounds.length)];
        audioEngine.speakCharacterLine(randomPhrase, p.character.id);

        return {
          ...p,
          action: "ducking",
          actionTimer: 25, // ~25 frames duck duration
          lastSpeechText: randomPhrase,
          speechBubbleTimer: 35,
        };
      })
    );
  }, []);

  // Keyboard Event Controls setup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phaseRef.current !== "playing") return;

      // Toggle Pause
      if (e.code === "KeyP" || e.code === "Escape") {
        e.preventDefault();
        setIsPaused((prev) => !prev);
        return;
      }

      if (isPausedRef.current) return;

      // Player 1: Up Arrow / Space / W -> Jump | Down Arrow / S -> Duck
      if (e.code === "ArrowUp" || e.code === "Space" || e.code === "KeyW") {
        e.preventDefault();
        triggerPlayerJump(0);
      } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        triggerPlayerDuck(0);
      }

      // Player 2 (If human): I -> Jump | K -> Duck
      if (settings.humanPlayerCount >= 2) {
        if (e.code === "KeyI") triggerPlayerJump(1);
        if (e.code === "KeyK") triggerPlayerDuck(1);
      }

      // Player 3 (If human): Numpad 8 -> Jump | Numpad 5 -> Duck
      if (settings.humanPlayerCount >= 3) {
        if (e.code === "Numpad8" || e.code === "KeyU") triggerPlayerJump(2);
        if (e.code === "Numpad5" || e.code === "KeyJ") triggerPlayerDuck(2);
      }

      // Player 4 (If human): Numpad 9 -> Jump | Numpad 6 -> Duck
      if (settings.humanPlayerCount >= 4) {
        if (e.code === "Numpad9" || e.code === "KeyO") triggerPlayerJump(3);
        if (e.code === "Numpad6" || e.code === "KeyL") triggerPlayerDuck(3);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerPlayerJump, triggerPlayerDuck, settings.humanPlayerCount]);

  // Start Countdown then Start Playing
  const handleStartGame = (initialPlayers: PlayerState[]) => {
    const playersWithStamina = initialPlayers.map((p) => ({
      ...p,
      jumpStamina: 100,
      maxStamina: 100,
      staminaExhausted: false,
    }));
    setPlayers(playersWithStamina);
    setObstacles([]);
    setCurrentLevel(1);
    setHighestLevelReached(1);
    setRotationAngle(0);
    setSlowMoTimer(0);
    slowMoTimerRef.current = 0;
    setPhase("countdown");
    setCountdownNum(3);
    setIsPaused(false);
    isEndingRoundRef.current = false;

    audioEngine.speakAnnouncer("3, 2, 1, Ascend!");

    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownNum(count);
      } else {
        clearInterval(interval);
        setPhase("playing");
        audioEngine.startMusic();
      }
    }, 900);
  };

  // Main Game Loop Effect
  useEffect(() => {
    if (phase !== "playing") {
      audioEngine.stopMusic();
      return;
    }

    let animationId: number;

    const gameLoop = (timestamp: number) => {
      if (isPausedRef.current) {
        animationId = requestAnimationFrame(gameLoop);
        return;
      }

      const curLvl = levelRef.current;
      const rot = rotationRef.current;

      // Decrement Slow-Motion Timer
      if (slowMoTimerRef.current > 0) {
        const nextSlowMo = Math.max(0, slowMoTimerRef.current - 0.016);
        slowMoTimerRef.current = nextSlowMo;
        setSlowMoTimer(nextSlowMo);
      }

      // 1. Calculate Spin Speed (Speed accelerates higher up to Level 200, slowed during Slow-Mo!)
      const baseSpinSpeed = 0.02 + (curLvl / 200) * 0.06;
      const speedMultiplier = slowMoTimerRef.current > 0 ? 0.35 : 1.0;
      const spinSpeed = baseSpinSpeed * speedMultiplier;

      const newRot = rot + spinSpeed;
      rotationRef.current = newRot;
      setRotationAngle(newRot);

      // 2. Ascend Spiral Height Level (Level 1 to Level 200)
      const levelAscentRate = 0.05 * speedMultiplier;
      const newLvl = Math.min(200, curLvl + levelAscentRate);
      levelRef.current = newLvl;
      setCurrentLevel(newLvl);
      if (newLvl > highestLevelReached) {
        setHighestLevelReached(newLvl);
      }

      audioEngine.updateTempoForLevel(newLvl);

      // Level Milestone Chime (Every 25 levels)
      if (Math.floor(newLvl) > Math.floor(curLvl) && Math.floor(newLvl) % 25 === 0) {
        audioEngine.playLevelUpChime();
        if (Math.floor(newLvl) === 50) audioEngine.speakAnnouncer("Level 50 reached!");
        if (Math.floor(newLvl) === 100) audioEngine.speakAnnouncer("Level 100! Halfway to the top!");
        if (Math.floor(newLvl) === 150) audioEngine.speakAnnouncer("Level 150! Maximum Frenzy!");
        if (Math.floor(newLvl) === 200) audioEngine.speakAnnouncer("Level 200 reached! You are the Apex Master!");
      }

      // 3. Update Players (Action timers, stamina regen, AI Bot decisions, speech timers, knockoff physics)
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.knockedOff) {
            // Physics falling animation
            return {
              ...p,
              knockedOffY: p.knockedOffY + p.knockedOffVy,
              knockedOffVy: p.knockedOffVy + 1.2, // Gravity
              speechBubbleTimer: Math.max(0, p.speechBubbleTimer - 1),
            };
          }

          let action = p.action;
          let actionTimer = Math.max(0, p.actionTimer - 1);
          let speechBubbleTimer = Math.max(0, p.speechBubbleTimer - 1);
          let multiplierTimer = Math.max(0, (p.multiplierTimer || 0) - 1);
          const maxStamina = p.maxStamina || 100;
          let jumpStamina = p.jumpStamina !== undefined ? p.jumpStamina : 100;

          // Stamina Regeneration Logic
          if (action === "ducking") {
            // Ducking provides faster stamina recovery (tactical breather)
            jumpStamina = Math.min(maxStamina, jumpStamina + 1.15);
          } else if (action === "running") {
            // Steady recovery while running
            const frenzyBonus = multiplierTimer > 0 ? 0.6 : 0;
            jumpStamina = Math.min(maxStamina, jumpStamina + 0.75 + frenzyBonus);
          }
          // Jumping: in-air does not regenerate stamina

          const staminaExhausted = jumpStamina < 34;

          if (actionTimer === 0 && action !== "running") {
            action = "running";
          }

          // Incremental Score for climbing with 2X Frenzy multiplier
          const isFrenzy = multiplierTimer > 0;
          let score = p.score + (10 + Math.floor(curLvl * 0.5)) * (isFrenzy ? 2 : 1);

          // AI CPU Bot Reflex Logic
          if (p.type === "cpu") {
            const slotAngle = (p.slotIndex * 0.6) + 0.3;
            const pAngle = newRot + slotAngle;

            // Find approaching obstacle
            obstaclesRef.current.forEach((obs) => {
              if (!obs.active) return;
              const obsAngle = newRot + obs.angle;
              const dist = obsAngle - pAngle;

              // If obstacle is approaching within AI reaction window (0.2 rad to 0.45 rad)
              if (dist > 0.18 && dist < 0.45) {
                // Reaction probability based on difficulty
                const accuracyProb =
                  settings.aiDifficulty === "easy"
                    ? 0.78
                    : settings.aiDifficulty === "medium"
                    ? 0.88
                    : settings.aiDifficulty === "hard"
                    ? 0.95
                    : 0.98;

                // Make decision if not already taking action
                if (action === "running" && Math.random() < accuracyProb) {
                  if (obs.type === "low_hurdle" && action !== "jumping") {
                    if (jumpStamina >= 34) {
                      action = "jumping";
                      actionTimer = 22;
                      jumpStamina = Math.max(0, jumpStamina - 34);
                      audioEngine.playJumpSound(p.slotIndex);
                    } else {
                      // AI is exhausted!
                      speechBubbleTimer = 25;
                      audioEngine.playExhaustedSound(p.slotIndex);
                    }
                  } else if (obs.type === "high_laser" && action !== "ducking") {
                    action = "ducking";
                    actionTimer = 22;
                    audioEngine.playDuckSound(p.slotIndex);
                  }
                }
              }
            });
          }

          return {
            ...p,
            level: newLvl,
            score,
            action,
            actionTimer,
            jumpStamina,
            staminaExhausted,
            speechBubbleTimer,
            multiplierTimer,
          };
        })
      );

      // 4. Spawn Obstacles and Floating Power-Ups along spiral
      const curObstacles = [...obstaclesRef.current];
      if (Math.random() < 0.045 + (curLvl / 200) * 0.04 && curObstacles.length < 8) {
        const randVal = Math.random();
        const obsType =
          randVal < 0.10
            ? "shield_gem"       // Floating Invincibility Shield
            : randVal < 0.20
            ? "slowmo_powerup"   // Floating Slow-Motion (3s)
            : randVal < 0.32
            ? "coin_gem"         // Floating 2X Gold Coin Frenzy
            : randVal < 0.66
            ? "low_hurdle"       // Low Hurdle
            : "high_laser";      // High Laser

        const newObs: Obstacle = {
          id: `obs-${nextObstacleIdRef.current++}`,
          type: obsType,
          angle: (Math.random() * 0.5) - newRot + 4.5, // Spawn ahead on spiral
          level: curLvl + 2,
          heightOffset: 0.3,
          active: true,
          passedByPlayers: {},
        };
        curObstacles.push(newObs);
      }

      // 5. Collision Checks between Players & Obstacles / Power-Ups
      const updatedObstacles = curObstacles.map((obs) => {
        if (!obs.active) return obs;

        const obsAngle = newRot + obs.angle;

        playersRef.current.forEach((p) => {
          if (p.knockedOff) return;

          const slotAngle = (p.slotIndex * 0.6) + 0.3;
          const pAngle = newRot + slotAngle;
          const dist = Math.abs(obsAngle - pAngle);

          // Close collision contact
          if (dist < 0.16 && !obs.passedByPlayers[p.id]) {
            obs.passedByPlayers[p.id] = true;

            if (obs.type === "shield_gem") {
              // Pick up Invincibility Shield!
              audioEngine.playGemSound();
              audioEngine.speakAnnouncer("Shield Activated!");
              setPlayers((prev) =>
                prev.map((pl) =>
                  pl.id === p.id
                    ? {
                        ...pl,
                        shieldActive: true,
                        jumpStamina: 100,
                        staminaExhausted: false,
                        score: pl.score + 500,
                        lastSpeechText: "SHIELD UP!",
                        speechBubbleTimer: 40,
                      }
                    : pl
                )
              );
            } else if (obs.type === "slowmo_powerup") {
              // Pick up 3-Second Slow Motion Power-Up!
              audioEngine.playSlowMoSound();
              audioEngine.speakAnnouncer("Slow Motion!");
              slowMoTimerRef.current = 3.0;
              setSlowMoTimer(3.0);
              setPlayers((prev) =>
                prev.map((pl) =>
                  pl.id === p.id
                    ? {
                        ...pl,
                        jumpStamina: 100,
                        staminaExhausted: false,
                        score: pl.score + 600,
                        lastSpeechText: "TIME WARP!",
                        speechBubbleTimer: 45,
                      }
                    : pl
                )
              );
            } else if (obs.type === "coin_gem") {
              // Pick up 2X Gold Coin Frenzy Power-Up!
              audioEngine.playGemSound();
              audioEngine.speakAnnouncer("2X Score Frenzy!");
              setPlayers((prev) =>
                prev.map((pl) =>
                  pl.id === p.id
                    ? {
                        ...pl,
                        multiplierTimer: 240, // 4 seconds at 60fps
                        jumpStamina: 100,
                        staminaExhausted: false,
                        score: pl.score + 800,
                        lastSpeechText: "2X SCORE FRENZY!",
                        speechBubbleTimer: 45,
                      }
                    : pl
                )
              );
            } else if (obs.type === "low_hurdle") {
              // MUST be jumping!
              if (p.action !== "jumping") {
                if (p.shieldActive) {
                  // Shield absorbs hit!
                  audioEngine.playHitSound();
                  setPlayers((prev) =>
                    prev.map((pl) => (pl.id === p.id ? { ...pl, shieldActive: false } : pl))
                  );
                } else {
                  // Knocked off!
                  handleKnockOffPlayer(p);
                }
              } else {
                // Successful jump bonus!
                const newCombo = (p.combo || 0) + 1;
                if (newCombo >= 2) {
                  audioEngine.playComboSound(newCombo);
                }
                setPlayers((prev) =>
                  prev.map((pl) =>
                    pl.id === p.id
                      ? {
                          ...pl,
                          score: pl.score + 200 * (pl.multiplierTimer && pl.multiplierTimer > 0 ? 2 : 1),
                          combo: newCombo,
                          jumpStamina: Math.min(pl.maxStamina || 100, (pl.jumpStamina || 0) + 14),
                          staminaExhausted: false,
                        }
                      : pl
                  )
                );
              }
            } else if (obs.type === "high_laser") {
              // MUST be ducking!
              if (p.action !== "ducking") {
                if (p.shieldActive) {
                  audioEngine.playHitSound();
                  setPlayers((prev) =>
                    prev.map((pl) => (pl.id === p.id ? { ...pl, shieldActive: false } : pl))
                  );
                } else {
                  handleKnockOffPlayer(p);
                }
              } else {
                // Successful duck bonus!
                const newCombo = (p.combo || 0) + 1;
                if (newCombo >= 2) {
                  audioEngine.playComboSound(newCombo);
                }
                setPlayers((prev) =>
                  prev.map((pl) =>
                    pl.id === p.id
                      ? {
                          ...pl,
                          score: pl.score + 200 * (pl.multiplierTimer && pl.multiplierTimer > 0 ? 2 : 1),
                          combo: newCombo,
                          jumpStamina: Math.min(pl.maxStamina || 100, (pl.jumpStamina || 0) + 18),
                          staminaExhausted: false,
                        }
                      : pl
                  )
                );
              }
            }
          }
        });

        // Deactivate past obstacles
        if (obsAngle < newRot - 2.0) {
          return { ...obs, active: false };
        }
        return obs;
      });

      setObstacles(updatedObstacles.filter((o) => o.active));

      // 6. Check Game Over / Round End Condition
      const alivePlayers = playersRef.current.filter((p) => !p.knockedOff);
      if (alivePlayers.length <= 1 && playersRef.current.length > 0 && !isEndingRoundRef.current) {
        isEndingRoundRef.current = true;
        // Schedule single game over transition after 1.2s while allowing knocked-off animation to finish
        setTimeout(() => {
          handleGameOver();
        }, 1300);
      }

      // Max Level 200 Win Condition!
      if (curLvl >= 200 && !isEndingRoundRef.current) {
        isEndingRoundRef.current = true;
        audioEngine.playMilestoneFanfare();
        setTimeout(() => {
          handleGameOver();
        }, 1000);
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationId);
  }, [phase, isPaused, settings.aiDifficulty, highestLevelReached]);

  // Handle Knocking Off a Player
  const handleKnockOffPlayer = (player: PlayerState) => {
    audioEngine.playHitSound();
    const randomPhrase =
      player.character.hitSounds[Math.floor(Math.random() * player.character.hitSounds.length)];
    audioEngine.speakCharacterLine(randomPhrase, player.character.id);

    setPlayers((prev) =>
      prev.map((pl) => {
        if (pl.id !== player.id) return pl;
        return {
          ...pl,
          knockedOff: true,
          knockedOffAngle: rotationRef.current + (pl.slotIndex * 0.6) + 0.3,
          knockedOffRadius: 180,
          knockedOffY: 260,
          knockedOffVy: -8, // Initial upward pop before falling
          lastSpeechText: randomPhrase,
          speechBubbleTimer: 45,
        };
      })
    );
  };

  // Handle Game Over
  const handleGameOver = () => {
    setPhase("game_over");
    audioEngine.stopMusic();

    const sorted = [...playersRef.current].sort((a, b) => b.score - a.score);
    const topPlayer = sorted[0];

    if (topPlayer) {
      audioEngine.speakAnnouncer(`Victory to ${topPlayer.name}! What a climb!`);

      // Save top score to leaderboard if impressive
      const updated = saveLeaderboardEntry({
        playerName: topPlayer.name,
        characterName: topPlayer.character.name,
        characterId: topPlayer.character.id,
        levelReached: Math.floor(topPlayer.level),
        score: topPlayer.score,
        mode: `${settings.humanPlayerCount} Human + ${4 - settings.humanPlayerCount} CPU`,
        date: new Date().toISOString().split("T")[0],
      });
      setLeaderboard(updated);
    }
  };

  const handleResetLeaderboard = () => {
    const fresh = resetLeaderboard();
    setLeaderboard(fresh);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center space-y-6 select-none font-sans">
      {/* Top Header Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-500/20">
            🌀
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              SPIRAL FRENZY <span className="text-amber-400 text-xs md:text-sm">LEVEL 200 CLIMBER</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Fuzion Frenzy Inspired 4-Player Walkway Dodge Arcade
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleMute}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition cursor-pointer"
            title="Toggle Mute"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
          </button>

          <button
            type="button"
            onClick={() => {
              const current = settings.musicTrack || "jump_around";
              const next =
                current === "jump_around"
                  ? "ice_ice_baby"
                  : current === "ice_ice_baby"
                  ? "cyber_overdrive"
                  : current === "cyber_overdrive"
                  ? "rotation"
                  : "jump_around";
              const updated = { ...settings, musicTrack: next };
              setSettings(updated);
              audioEngine.setMusicTrack(next);
            }}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-2 rounded-xl text-purple-300 text-xs font-bold transition cursor-pointer"
            title="Switch Soundtrack Remix"
          >
            <Music className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">
              {(settings.musicTrack || "jump_around") === "jump_around"
                ? "📢 Jump Around"
                : settings.musicTrack === "ice_ice_baby"
                ? "🧊 Ice Ice Baby"
                : settings.musicTrack === "cyber_overdrive"
                ? "⚡ Cyber Overdrive"
                : "🔀 DJ Mix"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsLeaderboardOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-2 rounded-xl text-amber-300 text-xs font-bold transition cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>

          {phase === "playing" && (
            <>
              <button
                type="button"
                onClick={() => setIsPaused((prev) => !prev)}
                className={`flex items-center gap-1.5 ${
                  isPaused
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
                    : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 font-bold"
                } px-3 py-2 rounded-xl text-xs transition cursor-pointer shadow-md`}
                title="Pause or Resume Game (Key: P)"
              >
                {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </button>

              <button
                type="button"
                onClick={() => setPhase("lobby")}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Exit</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Game State Renderer */}
      {phase === "lobby" && (
        <GameLobby
          settings={settings}
          onUpdateSettings={setSettings}
          onStartGame={handleStartGame}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {phase === "countdown" && (
        <div className="w-full max-w-4xl h-[520px] bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-4 text-white shadow-2xl animate-pulse">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center font-black text-6xl text-slate-950 shadow-2xl shadow-amber-500/40 animate-bounce">
            {countdownNum}
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">GET READY TO CLIMB!</h2>
          <p className="text-xs text-slate-400 font-semibold">Jump low hurdles & duck high lasers!</p>
        </div>
      )}

      {phase === "playing" && (
        <div className="w-full max-w-5xl space-y-4 relative">
          {/* Pause Modal Overlay */}
          {isPaused && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md rounded-3xl z-40 flex flex-col items-center justify-center space-y-5 text-white p-6 shadow-2xl animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400">
                <Pause className="w-10 h-10" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white uppercase tracking-wider">GAME PAUSED</h2>
                <p className="text-sm text-slate-300">Take a breather! Click Resume or press <span className="font-extrabold text-amber-400">[P]</span> / <span className="font-extrabold text-amber-400">[ESC]</span> to continue climbing.</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaused(false)}
                  className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black px-6 py-3 rounded-2xl transition shadow-xl flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>RESUME CLIMB</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhase("lobby")}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-5 py-3 rounded-2xl transition border border-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Lobby</span>
                </button>
              </div>
            </div>
          )}

          <SpiralTowerCanvas
            players={players}
            obstacles={obstacles}
            currentLevel={currentLevel}
            rotationAngle={rotationAngle}
            spinSpeed={(0.02 + (currentLevel / 200) * 0.06) * (slowMoTimer > 0 ? 0.35 : 1.0)}
            highestLevelReached={highestLevelReached}
            slowMoTimer={slowMoTimer}
            onPlayerJump={triggerPlayerJump}
            onPlayerDuck={triggerPlayerDuck}
          />

          <PlayerControlHUD
            players={players}
            currentLevel={currentLevel}
            onPlayerJump={triggerPlayerJump}
            onPlayerDuck={triggerPlayerDuck}
            isGamePlaying={phase === "playing"}
          />
        </div>
      )}

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={phase === "game_over"}
        players={players}
        currentLevel={currentLevel}
        onPlayAgain={() => handleStartGame(players)}
        onReturnToLobby={() => setPhase("lobby")}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
      />

      {/* Top 6 Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        entries={leaderboard}
        onResetLeaderboard={handleResetLeaderboard}
      />
    </div>
  );
};
