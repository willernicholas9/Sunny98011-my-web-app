import React, { useRef, useEffect } from "react";
import { PlayerState, Obstacle, VisualParticle } from "../../types/gameTypes";

interface SpiralTowerCanvasProps {
  players: PlayerState[];
  obstacles: Obstacle[];
  currentLevel: number;
  rotationAngle: number;
  spinSpeed: number;
  highestLevelReached: number;
  slowMoTimer?: number;
  onCanvasResize?: (width: number, height: number) => void;
  onPlayerJump?: (playerIndex: number) => void;
  onPlayerDuck?: (playerIndex: number) => void;
}

export const SpiralTowerCanvas: React.FC<SpiralTowerCanvasProps> = ({
  players,
  obstacles,
  currentLevel,
  rotationAngle,
  spinSpeed,
  highestLevelReached,
  slowMoTimer = 0,
  onPlayerJump,
  onPlayerDuck,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Mutable state refs to guarantee smooth 60fps render loop without tearing down animation frame
  const playersRef = useRef<PlayerState[]>(players);
  playersRef.current = players;

  const obstaclesRef = useRef<Obstacle[]>(obstacles);
  obstaclesRef.current = obstacles;

  const currentLevelRef = useRef<number>(currentLevel);
  currentLevelRef.current = currentLevel;

  const rotationAngleRef = useRef<number>(rotationAngle);
  rotationAngleRef.current = rotationAngle;

  const spinSpeedRef = useRef<number>(spinSpeed);
  spinSpeedRef.current = spinSpeed;

  const slowMoTimerRef = useRef<number>(slowMoTimer);
  slowMoTimerRef.current = slowMoTimer;

  // Particle Engine State
  const particlesRef = useRef<VisualParticle[]>([]);
  const prevActionsRef = useRef<Record<string, string>>({});

  const getCachedImage = (src: string): HTMLImageElement | null => {
    if (!src) return null;
    if (imageCacheRef.current.has(src)) {
      const img = imageCacheRef.current.get(src)!;
      return img.complete && img.naturalWidth !== 0 ? img : null;
    }
    const img = new Image();
    img.src = src;
    imageCacheRef.current.set(src, img);
    return null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;

    // Distant Cyber City Skyline buildings (generated once)
    const cityBuildings = [
      { x: 30, w: 45, h: 220, color: "#0c1527", windows: 14 },
      { x: 85, w: 60, h: 310, color: "#111c33", windows: 20 },
      { x: 155, w: 40, h: 180, color: "#0a1120", windows: 10 },
      { x: 205, w: 55, h: 260, color: "#13203b", windows: 18 },
      { x: 270, w: 50, h: 200, color: "#0d1628", windows: 12 },
      { x: 640, w: 50, h: 210, color: "#0c1527", windows: 12 },
      { x: 700, w: 65, h: 290, color: "#111d36", windows: 22 },
      { x: 775, w: 45, h: 240, color: "#0a1222", windows: 15 },
      { x: 830, w: 60, h: 320, color: "#142240", windows: 24 },
      { x: 900, w: 45, h: 190, color: "#0d1729", windows: 11 },
    ];

    const render = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const curLvl = currentLevelRef.current;
      const rot = rotationAngleRef.current;
      const speed = spinSpeedRef.current;
      const isSlowMo = slowMoTimerRef.current > 0;
      const currentPlayers = playersRef.current;
      const currentObs = obstaclesRef.current;

      const centerX = width / 2;
      const centerY = height / 2 + 45;

      const now = Date.now();

      // ==========================================
      // 1. SKY & DISTANT CYBERPUNK CITYSCAPE
      // ==========================================
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      // Sky shifts slightly into vibrant twilight/synthwave as altitude nears Level 200
      const skyProg = Math.min(1, curLvl / 200);
      bgGradient.addColorStop(0, skyProg > 0.6 ? "#1e0b2b" : "#060913");
      bgGradient.addColorStop(0.45, skyProg > 0.6 ? "#170f38" : "#0c1322");
      bgGradient.addColorStop(1, skyProg > 0.6 ? "#2d124d" : "#170f26");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Starfield / Cosmic Stardust in Background
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      for (let st = 0; st < 35; st++) {
        const starX = (st * 47 + (st % 3) * 110) % width;
        const starY = (st * 31 + (st % 5) * 50) % (height * 0.55);
        const starTwinkle = 0.3 + 0.7 * Math.sin(now / 400 + st);
        ctx.fillStyle = `rgba(224, 242, 254, ${starTwinkle * 0.6})`;
        ctx.fillRect(starX, starY, 1.5, 1.5);
      }

      // Cyber Grid Backdrop Perspective Floor Lines
      ctx.strokeStyle = "rgba(56, 189, 248, 0.05)";
      ctx.lineWidth = 1;
      const gridStep = 45;
      for (let x = 0; x < width; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Distant Cyber Skyscrapers
      cityBuildings.forEach((bld, idx) => {
        ctx.fillStyle = bld.color;
        const bldY = height - bld.h;
        ctx.fillRect(bld.x, bldY, bld.w, bld.h);

        // Skyscraper Top Warning Beacon Light
        const beaconPulse = Math.sin(now / 300 + idx) > 0.2;
        if (beaconPulse) {
          ctx.fillStyle = idx % 2 === 0 ? "#f43f5e" : "#38bdf8";
          ctx.beginPath();
          ctx.arc(bld.x + bld.w / 2, bldY - 3, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Window Rows
        ctx.fillStyle = idx % 3 === 0 ? "rgba(253, 224, 71, 0.25)" : "rgba(56, 189, 248, 0.2)";
        for (let w = 0; w < bld.windows; w++) {
          const wx = bld.x + 6 + (w % 3) * 12;
          const wy = bldY + 12 + Math.floor(w / 3) * 16;
          if (wy < height - 20) {
            ctx.fillRect(wx, wy, 4, 6);
          }
        }
      });

      // Distant Flying Aero-Cars (Hover Traffic)
      const traffic1X = (now * 0.08) % (width + 120) - 60;
      const traffic1Y = 90 + Math.sin(now / 1000) * 10;
      ctx.fillStyle = "#f43f5e";
      ctx.fillRect(traffic1X, traffic1Y, 14, 3);
      ctx.fillStyle = "rgba(244, 63, 94, 0.3)";
      ctx.fillRect(traffic1X - 25, traffic1Y, 25, 3); // Red headlight streak

      const traffic2X = width - ((now * 0.12) % (width + 120) - 60);
      const traffic2Y = 140 + Math.cos(now / 1200) * 8;
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(traffic2X, traffic2Y, 16, 3);
      ctx.fillStyle = "rgba(56, 189, 248, 0.3)";
      ctx.fillRect(traffic2X + 16, traffic2Y, 30, 3); // Blue headlight streak

      // Tower Altitude Milestone Watermark in backdrop
      ctx.save();
      ctx.fillStyle = curLvl >= 150 ? "rgba(244, 63, 94, 0.12)" : curLvl >= 100 ? "rgba(245, 158, 11, 0.12)" : "rgba(56, 189, 248, 0.10)";
      ctx.font = "900 84px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`LEVEL ${Math.min(200, Math.floor(curLvl))}`, centerX, 105);
      ctx.restore();

      // ==========================================
      // 2. CENTRAL TOWER SHAFT (CYBER ENERGY CORE)
      // ==========================================
      const towerRadius = 145;
      const towerHeight = height * 0.82;
      const towerTopY = centerY - towerHeight / 2 - 35;

      // Outer Core Metallic Body
      const towerGrad = ctx.createLinearGradient(centerX - towerRadius, 0, centerX + towerRadius, 0);
      towerGrad.addColorStop(0, "#020617");
      towerGrad.addColorStop(0.25, "#0f172a");
      towerGrad.addColorStop(0.5, isSlowMo ? "#a855f7" : "#0ea5e9"); // Energy Core
      towerGrad.addColorStop(0.75, "#0f172a");
      towerGrad.addColorStop(1, "#020617");

      ctx.fillStyle = towerGrad;
      ctx.beginPath();
      ctx.roundRect(centerX - towerRadius, towerTopY, towerRadius * 2, towerHeight, 22);
      ctx.fill();

      // Core Vertical Neon Plasma Conduit
      const corePulse = Math.sin(now / 180) * 0.2 + 0.8;
      ctx.strokeStyle = isSlowMo ? `rgba(192, 132, 252, ${corePulse * 0.8})` : `rgba(56, 189, 248, ${corePulse * 0.8})`;
      ctx.lineWidth = 6;
      ctx.shadowColor = isSlowMo ? "#c084fc" : "#38bdf8";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(centerX, towerTopY + 10);
      ctx.lineTo(centerX, towerTopY + towerHeight - 10);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Ascending Plasma Energy Rings on the Tower Core
      for (let r = 0; r < 5; r++) {
        const ringY = towerTopY + ((now * 0.05 + r * 75) % (towerHeight - 20));
        ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(centerX, ringY, towerRadius * 0.9, 14, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Tower Level Tickers along the core
      ctx.save();
      ctx.font = "900 11px monospace";
      ctx.textAlign = "right";
      const levelSteps = [200, 175, 150, 125, 100, 75, 50, 25, 10, 1];
      levelSteps.forEach((lvl) => {
        const yPos = centerY + 180 - (lvl - curLvl) * 2.8;
        if (yPos > 45 && yPos < height - 45) {
          const isApex = lvl === 200;
          ctx.fillStyle = isApex ? "#f43f5e" : lvl >= 100 ? "#f59e0b" : "#38bdf8";
          ctx.fillText(`LVL ${lvl} ${isApex ? "👑 APEX" : ""}`, centerX - towerRadius - 12, yPos + 4);

          ctx.beginPath();
          ctx.strokeStyle = isApex ? "rgba(244, 63, 94, 0.6)" : "rgba(56, 189, 248, 0.25)";
          ctx.lineWidth = isApex ? 2.5 : 1;
          ctx.moveTo(centerX - towerRadius, yPos);
          ctx.lineTo(centerX + towerRadius, yPos);
          ctx.stroke();
        }
      });
      ctx.restore();

      // ==========================================
      // 3. 3D SPINNING SPIRAL WALKWAY
      // ==========================================
      const spiralRadiusX = 215;
      const spiralRadiusY = 68;
      const totalSpiralTurns = 4;
      const pointsPerTurn = 64;
      const totalPoints = totalSpiralTurns * pointsPerTurn;

      // Draw Spiral Walkway Rails
      for (let i = 0; i < totalPoints - 1; i++) {
        const t1 = i / pointsPerTurn;
        const t2 = (i + 1) / pointsPerTurn;

        const a1 = rot + t1 * Math.PI * 2;
        const a2 = rot + t2 * Math.PI * 2;

        const x1 = centerX + Math.cos(a1) * spiralRadiusX;
        const y1 = centerY + Math.sin(a1) * spiralRadiusY - t1 * 72 + 125;

        const x2 = centerX + Math.cos(a2) * spiralRadiusX;
        const y2 = centerY + Math.sin(a2) * spiralRadiusY - t2 * 72 + 125;

        const depth1 = Math.sin(a1); // -1 (back) to +1 (front)

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        if (depth1 > 0) {
          // Front Walkway Platform (Illuminated Cyber Floor)
          ctx.strokeStyle = isSlowMo
            ? `rgba(168, 85, 247, ${0.45 + depth1 * 0.55})`
            : `rgba(14, 165, 233, ${0.45 + depth1 * 0.55})`;
          ctx.lineWidth = 15 * (0.75 + depth1 * 0.3);
          ctx.stroke();

          // High-Intensity Neon Rim Railing
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = isSlowMo ? "#e879f9" : "#a5f3fc";
          ctx.lineWidth = 2.5;
          ctx.stroke();
        } else {
          // Back Walkway (Dimmed Depth Shade)
          ctx.strokeStyle = `rgba(15, 23, 42, ${0.35 + (1 + depth1) * 0.3})`;
          ctx.lineWidth = 9;
          ctx.stroke();
        }
      }

      // ==========================================
      // 4. OBSTACLES & POWER-UPS
      // ==========================================
      currentObs.forEach((obs) => {
        if (!obs.active) return;

        const obsAngle = rot + obs.angle;
        const depth = Math.sin(obsAngle);

        const x = centerX + Math.cos(obsAngle) * spiralRadiusX;
        const y = centerY + Math.sin(obsAngle) * spiralRadiusY - obs.heightOffset * 72 + 125;

        if (depth > -0.25) {
          ctx.save();
          const scale = 0.65 + (depth + 1) * 0.38;

          if (obs.type === "low_hurdle") {
            // --- LOW BLUE ELECTRIC PLASMA HURDLE (JUMP!) ---
            const barWidth = 60 * scale;
            const barHeight = 11 * scale;
            const barY = y - 13 * scale;

            // Metallic Support End Stands
            ctx.fillStyle = "#1e3a8a";
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.roundRect(x - barWidth / 2 - 4 * scale, y - 18 * scale, 8 * scale, 20 * scale, 3 * scale);
            ctx.roundRect(x + barWidth / 2 - 4 * scale, y - 18 * scale, 8 * scale, 20 * scale, 3 * scale);
            ctx.fill();
            ctx.stroke();

            // Glowing Blue Electric Beam Tube
            const blueGrad = ctx.createLinearGradient(x, barY - barHeight / 2, x, barY + barHeight / 2);
            blueGrad.addColorStop(0, "#bae6fd");
            blueGrad.addColorStop(0.3, "#38bdf8");
            blueGrad.addColorStop(0.7, "#0284c7");
            blueGrad.addColorStop(1, "#0369a1");

            ctx.fillStyle = blueGrad;
            ctx.shadowColor = "#38bdf8";
            ctx.shadowBlur = 20 * scale;
            ctx.beginPath();
            ctx.roundRect(x - barWidth / 2, barY - barHeight / 2, barWidth, barHeight, 5 * scale);
            ctx.fill();

            // Lightning Core Sparks
            ctx.fillStyle = "#ffffff";
            ctx.shadowBlur = 10 * scale;
            ctx.beginPath();
            ctx.roundRect(x - barWidth / 2 + 5 * scale, barY - 2 * scale, barWidth - 10 * scale, 4 * scale, 2 * scale);
            ctx.fill();

            // Action Instruction Pill Badge
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 1.5;
            const badgeW = 120 * scale;
            const badgeH = 20 * scale;
            const badgeY = y - 34 * scale;
            ctx.beginPath();
            ctx.roundRect(x - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 10 * scale);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#38bdf8";
            ctx.font = `900 ${Math.max(10, 11 * scale)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("⬆ JUMP OVER BAR", x, badgeY);
          } else if (obs.type === "high_laser") {
            // --- HIGH RED OVERHEAD LASER BEAM (DUCK!) ---
            const archWidth = 66 * scale;
            const barY = y - 52 * scale;
            const barHeight = 13 * scale;

            // Tall Metallic Frame Uprights
            ctx.fillStyle = "#7f1d1d";
            ctx.fillRect(x - archWidth / 2 - 3 * scale, y - 62 * scale, 6 * scale, 62 * scale);
            ctx.fillRect(x + archWidth / 2 - 3 * scale, y - 62 * scale, 6 * scale, 62 * scale);

            // Overhead Crimson Hazard Beam
            const redGrad = ctx.createLinearGradient(x, barY - barHeight / 2, x, barY + barHeight / 2);
            redGrad.addColorStop(0, "#fca5a5");
            redGrad.addColorStop(0.35, "#ef4444");
            redGrad.addColorStop(0.8, "#b91c1c");
            redGrad.addColorStop(1, "#7f1d1d");

            ctx.fillStyle = redGrad;
            ctx.shadowColor = "#ef4444";
            ctx.shadowBlur = 22 * scale;
            ctx.beginPath();
            ctx.roundRect(x - archWidth / 2, barY - barHeight / 2, archWidth, barHeight, 5 * scale);
            ctx.fill();

            // Yellow Duck Signs Mounted atop Red Beam (Matching Fuzion Frenzy style!)
            const signRadius = 11 * scale;
            const signOffsets = [-archWidth * 0.28, archWidth * 0.28];

            signOffsets.forEach((signXOffset) => {
              const signX = x + signXOffset;
              const signY = barY - barHeight / 2 - signRadius + 2 * scale;

              ctx.fillStyle = "#facc15";
              ctx.strokeStyle = "#b91c1c";
              ctx.lineWidth = 2.5 * scale;
              ctx.shadowColor = "#fde047";
              ctx.shadowBlur = 12 * scale;
              ctx.beginPath();
              ctx.arc(signX, signY, signRadius, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();

              ctx.shadowBlur = 0;
              ctx.fillStyle = "#020617";
              ctx.font = `900 ${Math.max(10, 12 * scale)}px sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText("🦆", signX, signY + 1);
            });

            // Action Instruction Pill Badge
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 1.5;
            const badgeW = 124 * scale;
            const badgeH = 20 * scale;
            const badgeY = y - 76 * scale;
            ctx.beginPath();
            ctx.roundRect(x - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 10 * scale);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#fde047";
            ctx.font = `900 ${Math.max(10, 11 * scale)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("⬇ DUCK UNDER BAR", x, badgeY);
          } else if (obs.type === "shield_gem") {
            // --- INVINCIBILITY SHIELD GEM ---
            const floatBob = Math.sin(now / 150) * 8 * scale;
            const py = y - 36 * scale + floatBob;

            // Rotating 3D Energy Forcefield Ring
            ctx.strokeStyle = "#22d3ee";
            ctx.lineWidth = 3 * scale;
            ctx.shadowColor = "#67e8f9";
            ctx.shadowBlur = 22 * scale;
            ctx.beginPath();
            ctx.arc(x, py, (16 + Math.sin(now / 200) * 4) * scale, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = "#0891b2";
            ctx.beginPath();
            ctx.arc(x, py, 12 * scale, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.fillStyle = "#a5f3fc";
            ctx.font = `900 ${Math.max(10, 11 * scale)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText("🛡️ SHIELD", x, py - 20 * scale);
          } else if (obs.type === "slowmo_powerup") {
            // --- SLOW-MOTION TIME WARP POWER-UP ---
            const floatBob = Math.cos(now / 150) * 8 * scale;
            const py = y - 36 * scale + floatBob;

            ctx.strokeStyle = "#c084fc";
            ctx.lineWidth = 3 * scale;
            ctx.shadowColor = "#e879f9";
            ctx.shadowBlur = 24 * scale;
            ctx.beginPath();
            ctx.arc(x, py, (17 + Math.cos(now / 180) * 4) * scale, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = "#7c3aed";
            ctx.beginPath();
            ctx.arc(x, py, 13 * scale, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.fillStyle = "#f0abfc";
            ctx.font = `900 ${Math.max(10, 11 * scale)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText("⏱️ SLOW-MO", x, py - 20 * scale);
          } else if (obs.type === "coin_gem") {
            // --- 2X GOLD COIN FRENZY ---
            const floatBob = Math.sin(now / 120) * 8 * scale;
            const py = y - 36 * scale + floatBob;
            const spinWidth = Math.abs(Math.cos(now / 180)) * (14 * scale);

            ctx.strokeStyle = "#fbbf24";
            ctx.lineWidth = 3 * scale;
            ctx.shadowColor = "#fde047";
            ctx.shadowBlur = 24 * scale;
            ctx.beginPath();
            ctx.arc(x, py, (18 + Math.sin(now / 150) * 4) * scale, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = "#f59e0b";
            ctx.beginPath();
            ctx.ellipse(x, py, Math.max(4, spinWidth), 14 * scale, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.fillStyle = "#fef08a";
            ctx.font = `900 ${Math.max(10, 11 * scale)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText("💰 2X FRENZY", x, py - 20 * scale);
          }

          ctx.restore();
        }
      });

      // ==========================================
      // 5. PLAYERS RENDERING & DEPTH SORTING
      // ==========================================
      const sortedPlayers = [...currentPlayers].sort((pA, pB) => {
        const slotAngleA = pA.slotIndex * 0.6 + 0.3;
        const slotAngleB = pB.slotIndex * 0.6 + 0.3;
        const depthA = pA.knockedOff ? -10 : Math.sin(rot + slotAngleA);
        const depthB = pB.knockedOff ? -10 : Math.sin(rot + slotAngleB);
        return depthA - depthB;
      });

      sortedPlayers.forEach((player) => {
        ctx.save();

        if (player.knockedOff) {
          // Render falling physics down off the tower into the cyber abyss!
          const kx = centerX + Math.cos(player.knockedOffAngle) * player.knockedOffRadius;
          const ky = player.knockedOffY;

          const customHead = player.customHeadImage || player.character.customHeadImage;
          const headImg = customHead ? getCachedImage(customHead) : null;

          if (headImg) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(kx, ky, 15, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(headImg, kx - 15, ky - 15, 30, 30);
            ctx.restore();

            ctx.strokeStyle = player.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(kx, ky, 15, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.arc(kx, ky, 15, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 14px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(player.character.avatarIcon, kx, ky);
          }

          // Fall Streak line
          ctx.strokeStyle = "rgba(239, 68, 68, 0.7)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(kx, ky - 25);
          ctx.lineTo(kx, ky);
          ctx.stroke();

          // Fall Speech text
          if (player.speechBubbleTimer > 0) {
            ctx.fillStyle = "#ffffff";
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 2;
            ctx.font = "900 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(player.lastSpeechText || "WOAHHH!", kx, ky - 28);
          }

          ctx.restore();
          return;
        }

        // Active Player on Track
        const slotAngle = player.slotIndex * 0.6 + 0.3;
        const pAngle = rot + slotAngle;
        const depth = Math.sin(pAngle);
        const scale = 0.72 + (depth + 1) * 0.36;

        const px = centerX + Math.cos(pAngle) * spiralRadiusX;
        let py = centerY + Math.sin(pAngle) * spiralRadiusY - 0.3 * 72 + 125;

        // Jump Elevation Curve
        const isJumping = player.action === "jumping";
        const isDucking = player.action === "ducking";

        if (isJumping) {
          const jumpArc = Math.sin((player.actionTimer / 25) * Math.PI) * 50;
          py -= jumpArc;
        }

        const charHeight = (isDucking ? 28 : 50) * scale;
        const charWidth = 24 * scale;

        // Detect action change for particle spawn
        const prevAction = prevActionsRef.current[player.id];
        if (prevAction !== player.action) {
          prevActionsRef.current[player.id] = player.action;
          if (isJumping) {
            // Jump Liftoff Particle Burst
            for (let sp = 0; sp < 6; sp++) {
              particlesRef.current.push({
                x: px,
                y: py + 2,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 1.5,
                color: player.color,
                size: Math.random() * 3 + 2,
                life: 15,
                maxLife: 15,
                shape: "spark",
              });
            }
          } else if (isDucking) {
            // Duck Slide Spark Burst
            for (let sp = 0; sp < 5; sp++) {
              particlesRef.current.push({
                x: px,
                y: py + 4,
                vx: -Math.random() * 3 - 1,
                vy: -Math.random() * 2,
                color: "#fbbf24",
                size: Math.random() * 3 + 2,
                life: 18,
                maxLife: 18,
                shape: "spark",
              });
            }
          }
        }

        // Walkway Ground Shadow
        const shadowY = py + (isJumping ? Math.sin((player.actionTimer / 25) * Math.PI) * 50 : 4);

        // Player Slot Floor Ring Marker (Glowing player color)
        ctx.strokeStyle = player.color;
        ctx.lineWidth = 3 * scale;
        ctx.shadowColor = player.color;
        ctx.shadowBlur = 14 * scale;
        ctx.beginPath();
        ctx.ellipse(px, shadowY, charWidth * 1.15, 11 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.ellipse(px, shadowY, charWidth * (isJumping ? 0.4 : 0.8), (isJumping ? 4 : 8) * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Animated Limbs (Legs & Arms Cycle)
        const runCycle = Math.sin(now / 75 + player.slotIndex) * 13 * scale;
        ctx.lineWidth = 4 * scale;
        ctx.lineCap = "round";

        // Legs
        ctx.strokeStyle = "#0f172a";
        if (isJumping) {
          ctx.beginPath();
          ctx.moveTo(px - 5 * scale, py - charHeight * 0.3);
          ctx.lineTo(px - 9 * scale, py - charHeight * 0.15);
          ctx.moveTo(px + 5 * scale, py - charHeight * 0.3);
          ctx.lineTo(px + 9 * scale, py - charHeight * 0.15);
          ctx.stroke();
        } else if (isDucking) {
          ctx.beginPath();
          ctx.moveTo(px - 6 * scale, py - charHeight * 0.4);
          ctx.lineTo(px - 11 * scale, py);
          ctx.moveTo(px + 6 * scale, py - charHeight * 0.4);
          ctx.lineTo(px + 11 * scale, py);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(px - 5 * scale, py - charHeight * 0.35);
          ctx.lineTo(px - 5 * scale + runCycle, py);
          ctx.moveTo(px + 5 * scale, py - charHeight * 0.35);
          ctx.lineTo(px + 5 * scale - runCycle, py);
          ctx.stroke();
        }

        // Boots
        ctx.fillStyle = "#020617";
        if (!isJumping && !isDucking) {
          ctx.beginPath();
          ctx.arc(px - 5 * scale + runCycle, py, 4.5 * scale, 0, Math.PI * 2);
          ctx.arc(px + 5 * scale - runCycle, py, 4.5 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // Torso Cyber Armor Suit
        const torsoGrad = ctx.createLinearGradient(px - charWidth / 2, 0, px + charWidth / 2, 0);
        torsoGrad.addColorStop(0, player.color);
        torsoGrad.addColorStop(0.5, "#ffffff");
        torsoGrad.addColorStop(1, player.color);

        ctx.fillStyle = torsoGrad;
        ctx.shadowColor = player.character.accentColor;
        ctx.shadowBlur = 14 * scale;

        ctx.beginPath();
        ctx.roundRect(px - charWidth / 2, py - charHeight + 14 * scale, charWidth, charHeight - 16 * scale, 8 * scale);
        ctx.fill();

        // Chest Core Arc Reactor Emblem
        ctx.fillStyle = player.character.accentColor || "#f59e0b";
        ctx.beginPath();
        ctx.arc(px, py - charHeight / 2 + 8 * scale, 4.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Arms
        ctx.strokeStyle = player.color;
        if (isJumping) {
          ctx.beginPath();
          ctx.moveTo(px - charWidth / 2, py - charHeight * 0.6);
          ctx.lineTo(px - charWidth / 2 - 9 * scale, py - charHeight * 0.9);
          ctx.moveTo(px + charWidth / 2, py - charHeight * 0.6);
          ctx.lineTo(px + charWidth / 2 + 9 * scale, py - charHeight * 0.9);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(px - charWidth / 2, py - charHeight * 0.55);
          ctx.lineTo(px - charWidth / 2 - 6 * scale, py - charHeight * 0.55 - runCycle * 0.5);
          ctx.moveTo(px + charWidth / 2, py - charHeight * 0.55);
          ctx.lineTo(px + charWidth / 2 + 6 * scale, py - charHeight * 0.55 + runCycle * 0.5);
          ctx.stroke();
        }

        // Head Avatar or Custom Upload Photo
        const customHead = player.customHeadImage || player.character.customHeadImage;
        const headImg = customHead ? getCachedImage(customHead) : null;

        if (headImg) {
          ctx.save();
          const headRadius = Math.max(12, 16 * scale);
          const headX = px;
          const headY = py - charHeight + 10 * scale;

          ctx.beginPath();
          ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(headImg, headX - headRadius, headY - headRadius, headRadius * 2, headRadius * 2);
          ctx.restore();

          // Outer Helmet Ring
          ctx.strokeStyle = player.character.accentColor || "#f59e0b";
          ctx.lineWidth = 2.5 * scale;
          ctx.beginPath();
          ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${Math.max(13, 17 * scale)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(player.character.avatarIcon, px, py - charHeight + 10 * scale);
        }

        // Overhead Player Name & Slot Tag
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = `900 ${Math.max(10, 11 * scale)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(
          `${player.type === "human" ? "P" : "CPU"}${player.slotIndex + 1}: ${player.name}`,
          px,
          py - charHeight - 8 * scale
        );

        // Jump Stamina Gauge
        const playerStamina = player.jumpStamina !== undefined ? player.jumpStamina : 100;
        const staminaBarW = 34 * scale;
        const staminaBarH = 4.5 * scale;
        const staminaBarX = px - staminaBarW / 2;
        const staminaBarY = py - charHeight - 16 * scale;

        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(staminaBarX - 1, staminaBarY - 1, staminaBarW + 2, staminaBarH + 2, 2);
        ctx.fill();
        ctx.stroke();

        const currentFillW = Math.max(0, (playerStamina / 100) * staminaBarW);
        ctx.fillStyle =
          playerStamina >= 68 ? "#10b981" : playerStamina >= 34 ? "#f59e0b" : "#ef4444";

        ctx.beginPath();
        ctx.roundRect(staminaBarX, staminaBarY, currentFillW, staminaBarH, 1.5);
        ctx.fill();

        // Low Stamina Alert Badge
        if (playerStamina < 34) {
          ctx.fillStyle = "#f87171";
          ctx.font = `900 ${Math.max(9, 10 * scale)}px sans-serif`;
          ctx.fillText("⚡ TIRED", px, staminaBarY - 4 * scale);

          // Exhaust steam particles
          if (Math.random() < 0.25) {
            particlesRef.current.push({
              x: px + (Math.random() - 0.5) * 10,
              y: py - charHeight + 10,
              vx: (Math.random() - 0.5) * 0.8,
              vy: -1 - Math.random(),
              color: "rgba(248, 113, 113, 0.8)",
              size: 2,
              life: 14,
              maxLife: 14,
              shape: "circle",
            });
          }
        }

        // Active Shield Forcefield
        if (player.shieldActive) {
          ctx.strokeStyle = "#22d3ee";
          ctx.lineWidth = 3 * scale;
          ctx.shadowColor = "#67e8f9";
          ctx.shadowBlur = 18 * scale;
          ctx.beginPath();
          ctx.arc(px, py - charHeight / 2, charHeight * 0.85, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 2X Frenzy Multiplier Aura & Sparks
        if (player.multiplierTimer && player.multiplierTimer > 0) {
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 3.5 * scale;
          ctx.shadowColor = "#fef08a";
          ctx.shadowBlur = 22 * scale;
          ctx.beginPath();
          ctx.arc(px, py - charHeight / 2, charHeight * 0.95, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = "#fef08a";
          ctx.font = `900 ${Math.max(11, 13 * scale)}px sans-serif`;
          ctx.fillText("💰 2X FRENZY!", px, py - charHeight - 34 * scale);
        }

        // Combo Streak Overhead Popup
        if (player.combo && player.combo >= 2) {
          ctx.fillStyle = player.combo >= 5 ? "#f43f5e" : "#f59e0b";
          ctx.font = `900 ${Math.max(10, 12 * scale)}px sans-serif`;
          ctx.fillText(`🔥 ${player.combo}X COMBO!`, px, py - charHeight - 24 * scale);
        }

        // Speech Bubble
        if (player.speechBubbleTimer > 0 && player.lastSpeechText) {
          ctx.save();
          ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
          ctx.strokeStyle = player.color;
          ctx.lineWidth = 2;

          const speechX = px;
          const speechY = py - charHeight - 44 * scale;

          ctx.beginPath();
          ctx.roundRect(speechX - 48, speechY - 14, 96, 24, 10);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#ffffff";
          ctx.font = "900 11px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`"${player.lastSpeechText}"`, speechX, speechY - 2);
          ctx.restore();
        }

        ctx.restore();
      });

      // ==========================================
      // 6. PARTICLE SYSTEM UPDATE & RENDER
      // ==========================================
      const aliveParticles: VisualParticle[] = [];
      particlesRef.current.forEach((pt) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;

        if (pt.life > 0) {
          const alpha = pt.life / pt.maxLife;
          ctx.fillStyle = pt.color.includes("rgba") ? pt.color : pt.color;
          ctx.globalAlpha = alpha;

          if (pt.shape === "spark") {
            ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
          } else {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            ctx.fill();
          }

          aliveParticles.push(pt);
        }
      });
      ctx.globalAlpha = 1.0;
      particlesRef.current = aliveParticles;

      // High-speed Warp Flare Streaks at high level
      if (speed > 0.038) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
        ctx.lineWidth = 2;
        for (let s = 0; s < 10; s++) {
          const sx = centerX - spiralRadiusX + ((s * 65 + (now % 300)) % (spiralRadiusX * 2));
          const sy = centerY - 110 + ((s * 42) % 320);
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + 35, sy + 18);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // Run single continuous animation frame loop!

  return (
    <div className="relative w-full h-[520px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center select-none group">
      <canvas
        ref={canvasRef}
        width={960}
        height={520}
        className="w-full h-full object-cover block"
      />

      {/* On-screen display Touch Control Overlay Buttons for Jump & Duck */}
      {(onPlayerJump || onPlayerDuck) && (() => {
        const p1 = players.find((p) => p.slotIndex === 0);
        const p1Stamina = p1 ? (p1.jumpStamina !== undefined ? p1.jumpStamina : 100) : 100;
        const p1CanJump = p1Stamina >= 34;

        return (
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between pointer-events-none z-30">
            {/* On-Screen Jump Button */}
            {onPlayerJump && (
              <button
                type="button"
                onClick={() => onPlayerJump(0)}
                disabled={!p1CanJump}
                className={`pointer-events-auto font-black px-6 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-2.5 active:scale-90 transition duration-150 cursor-pointer ${
                  p1CanJump
                    ? "bg-gradient-to-tr from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 text-white shadow-cyan-500/40 border-cyan-300/40"
                    : "bg-slate-900/90 text-rose-300 border-rose-500/50 opacity-75 cursor-not-allowed"
                }`}
                id="onscreen-jump-btn"
              >
                <span className="text-xl">{p1CanJump ? "⬆️" : "⚡"}</span>
                <div className="text-left">
                  <div className="text-xs uppercase tracking-wider font-extrabold text-cyan-200">
                    {p1CanJump ? "ON-SCREEN ACTION" : "RECHARGING STAMINA"}
                  </div>
                  <div className="text-base font-black leading-none">
                    {p1CanJump ? "JUMP OVER BAR" : "LOW STAMINA..."}
                  </div>
                </div>
              </button>
            )}

            {/* On-Screen Duck Button */}
            {onPlayerDuck && (
              <button
                type="button"
                onClick={() => onPlayerDuck(0)}
                className="pointer-events-auto bg-gradient-to-tr from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-black px-6 py-3.5 rounded-2xl shadow-2xl shadow-amber-500/40 border border-amber-300/40 flex items-center gap-2.5 active:scale-90 transition duration-150 cursor-pointer"
                id="onscreen-duck-btn"
              >
                <span className="text-xl">⬇️</span>
                <div className="text-left">
                  <div className="text-xs uppercase tracking-wider font-extrabold text-amber-200">ON-SCREEN ACTION</div>
                  <div className="text-base font-black leading-none">DUCK UNDER BAR</div>
                </div>
              </button>
            )}
          </div>
        );
      })()}

      {/* Slow-Motion Effect Active Banner Overlay */}
      {slowMoTimer > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-purple-500/60 px-4 py-2 rounded-2xl shadow-xl shadow-purple-500/30 backdrop-blur-md flex items-center gap-3 animate-pulse">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-fuchsia-500 flex items-center justify-center text-lg font-black text-white shadow-lg">
            ⏱️
          </div>
          <div>
            <div className="text-[10px] font-black tracking-widest text-purple-300 uppercase">
              TIME WARP DILATION ACTIVE
            </div>
            <div className="text-sm font-black text-white flex items-center gap-2">
              <span>SLOW MOTION:</span>
              <span className="text-amber-400 font-mono text-base">{slowMoTimer.toFixed(1)}s</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
