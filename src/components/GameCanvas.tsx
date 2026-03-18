import React, { useRef, useEffect, useState } from 'react';
import { GameState } from '../types/game';

interface GameCanvasProps {
  gameState: GameState;
  onGameOver: (score: number, time: number, stars: number) => void;
  onBack: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface ScorePopup {
  x: number;
  y: number;
  value: number;
  life: number;
}

interface Fish {
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  active: boolean;
  timer: number;
}

interface RainDrop {
  x: number;
  y: number;
  v: number;
  l: number;
}

const BALL_RADIUS = 10;
const PADDLE_WIDTH = 40;
const PADDLE_HEIGHT = 80;
const PADDLE_RADIUS = 40;
const INITIAL_BALL_SPEED = 3.5;
const SPEED_INCREMENT = 0.08;

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, onGameOver, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Start score from the cumulative total session score
  const [score, setScore] = useState(gameState.totalScore);
  const [rally, setRally] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(0);
  
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;

  // Adjusted difficulty based on boss
  const bossDifficulty = gameState.boss?.difficulty || 1;
  const currentInitialSpeed = INITIAL_BALL_SPEED + (bossDifficulty * 0.5);
  const currentSpeedIncrement = SPEED_INCREMENT + (bossDifficulty * 0.02);

  // Game state refs for persistent values across frames
  const ballRef = useRef({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: currentInitialSpeed, vy: 2, scale: 1 });
  const playerYRef = useRef(CANVAS_HEIGHT / 2);
  const opponentYRef = useRef(CANVAS_HEIGHT / 2);
  const particlesRef = useRef<Particle[]>([]);
  const popupsRef = useRef<ScorePopup[]>([]);
  const birdsRef = useRef<{x: number, y: number, vx: number, wing: number}[]>([]);
  const fishRef = useRef<Fish[]>([]);
  const rainRef = useRef<RainDrop[]>([]);
  
  const animationFrameRef = useRef<number>(null);
  const startTimeRef = useRef<number>(Date.now());
  const imagesRef = useRef<{ player: HTMLImageElement | null; opponent: HTMLImageElement | null }>({ player: null, opponent: null });

  // Initial environment
  useEffect(() => {
    birdsRef.current = [
      { x: 100, y: 100, vx: 0.5, wing: 0 },
      { x: 700, y: 150, vx: -0.8, wing: 1 },
      { x: 400, y: 80, vx: 0.3, wing: 2 },
    ];

    // Initialize fish (Stage 1+)
    if (gameState.currentStageIndex >= 1) {
      fishRef.current = [...Array(4)].map(() => ({
        x: Math.random() * CANVAS_WIDTH,
        y: CANVAS_HEIGHT * 0.7,
        vx: (Math.random() - 0.5) * 2,
        vy: 0,
        scale: 0.6 + Math.random() * 0.6,
        active: false,
        timer: Math.random() * 100
      }));
    }

    // Initialize rain (Stage 2+)
    if (gameState.currentStageIndex >= 2) {
      rainRef.current = [...Array(150)].map(() => ({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        v: 12 + Math.random() * 8,
        l: 8 + Math.random() * 12
      }));
    }
  }, [gameState.currentStageIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load images — player paddle shows the selected product logo
    const playerImg = new Image();
    playerImg.src = gameState.product?.logo || gameState.player?.avatar || '';
    const bossImg = new Image();
    bossImg.src = gameState.boss?.avatar || '';

    playerImg.onload = () => { imagesRef.current.player = playerImg; };
    bossImg.onload = () => { imagesRef.current.opponent = bossImg; };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleY = canvas.height / rect.height;
      playerYRef.current = (e.clientY - rect.top) * scaleY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleY = canvas.height / rect.height;
      playerYRef.current = (e.touches[0].clientY - rect.top) * scaleY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    const createBurst = (x: number, y: number, color: string) => {
      for (let i = 0; i < 15; i++) {
        particlesRef.current.push({
          x, y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          life: 1.0,
          color
        });
      }
    };

    const createScorePopup = (x: number, y: number, value: number) => {
      popupsRef.current.push({ x, y, value, life: 1.0 });
    };

    let waveOffset = 0;

    const gameLoop = () => {
      // 0. ENVIRONMENT CALCULATIONS
      const cycleTime = (Date.now() - startTimeRef.current) % 120000;
      let dayFactor = 0;
      let sunsetFactor = 0;
      
      if (cycleTime < 10000) dayFactor = 1 - (cycleTime / 10000);
      else if (cycleTime >= 10000 && cycleTime < 45000) dayFactor = 0;
      else if (cycleTime >= 45000 && cycleTime < 60000) {
        dayFactor = (cycleTime - 45000) / 15000;
        sunsetFactor = Math.sin(((cycleTime - 45000) / 15000) * Math.PI);
      }
      else if (cycleTime >= 60000 && cycleTime < 110000) dayFactor = 1;
      else dayFactor = 1;

      // 1. UPDATE
      const aliveTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTime(aliveTime);

      const ball = ballRef.current;
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Win Condition Check (Cumulative)
      const winTarget = gameState.boss?.targetScore || 1000;
      if (score >= winTarget) {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        onGameOver(score, aliveTime, 3);
        return;
      }

      // Vertical bounce
      if (ball.y < BALL_RADIUS || ball.y > canvas.height - BALL_RADIUS) {
        ball.vy *= -1;
        createBurst(ball.x, ball.y, '#EAC086');
      }

      // AI Logic (Boss tracking)
      const dy = ball.y - opponentYRef.current;
      const aiBaseSpeed = 3.5 + (bossDifficulty * 1.5);
      const aiReactionRange = 25 - (bossDifficulty * 4);
      
      // Horizontal rolling factor
      const rollX = Math.sin(waveOffset * 0.5) * 5;
      
      if (Math.abs(dy) > aiReactionRange && ball.vx > 0) {
        opponentYRef.current += Math.sign(dy) * aiBaseSpeed * (dayFactor > 0.5 ? 1 : 0.8);
      }

      // Collision Player (Left)
      if (ball.x < PADDLE_WIDTH + BALL_RADIUS) {
          if (Math.abs(ball.y - playerYRef.current) < PADDLE_HEIGHT / 2 + BALL_RADIUS) {
              ball.vx = Math.abs(ball.vx) + currentSpeedIncrement;
              const deltaY = ball.y - playerYRef.current;
              ball.vy = deltaY * 0.2;
              setRally(prev => prev + 1);
              const points = 10 + Math.floor(rally * 1.5);
              setScore(prev => prev + points);
              createBurst(ball.x - BALL_RADIUS, ball.y, '#3B82F6');
              createScorePopup(ball.x + 20, ball.y, points);
          } else if (ball.x < 0) {
              if (lives > 1) {
                  setLives(l => l - 1);
                  ball.x = CANVAS_WIDTH / 2; ball.y = CANVAS_HEIGHT / 2; ball.vx = currentInitialSpeed; ball.vy = (Math.random() - 0.5) * 4;
                  setRally(0);
              } else {
                onGameOver(score, aliveTime, 0);
                return;
              }
          }
      }

      // Collision Opponent (Right)
      if (ball.x > canvas.width - PADDLE_WIDTH - BALL_RADIUS) {
          if (Math.abs(ball.y - opponentYRef.current) < PADDLE_HEIGHT / 2 + BALL_RADIUS) {
              ball.vx = -Math.abs(ball.vx) - currentSpeedIncrement;
              const deltaY = ball.y - opponentYRef.current; // Corrected to use boss paddle position
              ball.vy = deltaY * 0.2;
              setRally(prev => prev + 1);
              createBurst(ball.x + BALL_RADIUS, ball.y, '#EAC086');
          } else if (ball.x > canvas.width) {
              // BOSS MISS: Reset ball, NO life lost, add bonus points
              const missBonus = 50 + (bossDifficulty * 20);
              setScore(prev => prev + missBonus);
              createScorePopup(canvas.width - 100, ball.y, missBonus);
              
              ball.x = CANVAS_WIDTH / 2; ball.y = CANVAS_HEIGHT / 2; 
              ball.vx = -currentInitialSpeed; 
              ball.vy = (Math.random() - 0.5) * 4;
              setRally(0);
          }
      }

      // Misc Updates
      particlesRef.current = particlesRef.current.filter(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.02; return p.life > 0; });
      popupsRef.current = popupsRef.current.filter(p => { p.y -= 1; p.life -= 0.015; return p.life > 0; });
      birdsRef.current.forEach(b => { 
        b.x += b.vx; 
        b.wing += 0.15; 
        if (b.x > canvas.width + 50) b.x = -50; 
        if (b.x < -50) b.x = canvas.width + 50; 
      });

      // Fish Update
      fishRef.current.forEach(f => {
        if (!f.active) {
          f.timer -= 1;
          if (f.timer <= 0) {
            f.active = true;
            f.vy = -6 - Math.random() * 6;
            f.timer = 120 + Math.random() * 250;
          }
        } else {
          f.x += f.vx;
          f.y += f.vy;
          f.vy += 0.2;
          if (f.y > CANVAS_HEIGHT * 0.75) {
            f.active = false;
            f.y = CANVAS_HEIGHT * 0.75;
          }
        }
      });

      // Rain Update
      rainRef.current.forEach(r => {
        r.y += r.v;
        if (r.y > CANVAS_HEIGHT) {
          r.y = -20;
          r.x = Math.random() * CANVAS_WIDTH;
        }
      });

      waveOffset += 0.025;

      // 2. RENDER
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const lerpColor = (c1: string, c2: string, f: number) => {
        const r1 = parseInt(c1.substring(1, 3), 16), g1 = parseInt(c1.substring(3, 5), 16), b1 = parseInt(c1.substring(5, 7), 16);
        const r2 = parseInt(c2.substring(1, 3), 16), g2 = parseInt(c2.substring(3, 5), 16), b2 = parseInt(c2.substring(5, 7), 16);
        const r = Math.round(r1 + (r2 - r1) * f), g = Math.round(g1 + (g2 - g1) * f), b = Math.round(b1 + (b2 - b1) * f);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      };

      const horizonY = canvas.height * 0.4;
      const shorelineY = canvas.height * 0.65;
      
      const skyDayTop = gameState.currentStageIndex >= 2 ? '#708090' : '#4A90E2';
      const skyDayBottom = gameState.currentStageIndex >= 2 ? '#B0C4DE' : '#87CEEB';
      const skySunsetTop = '#FF5733';
      const skySunsetBottom = '#FFC300';
      const skyNightTop = '#01050A';
      const skyNightBottom = '#0A1525';

      const currentSkyTop = sunsetFactor > 0 ? lerpColor(skyDayTop, skySunsetTop, sunsetFactor) : lerpColor(skyDayTop, skyNightTop, dayFactor);
      const currentSkyBottom = sunsetFactor > 0 ? lerpColor(skyDayBottom, skySunsetBottom, sunsetFactor) : lerpColor(skyDayBottom, skyNightBottom, dayFactor);
      const seaTop = lerpColor('#1E3A8A', '#020A1A', dayFactor);
      const seaBottom = lerpColor('#3B82F6', '#0A1525', dayFactor);
      const sandTop = lerpColor('#C29F6D', '#4D3F2B', dayFactor);
      const sandBottom = lerpColor('#EAC086', '#5E4D35', dayFactor);

      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, currentSkyTop); skyGrad.addColorStop(1, currentSkyBottom);
      ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, canvas.width, horizonY);

      // Sea
      const seaGrad = ctx.createLinearGradient(0, horizonY, 0, shorelineY);
      seaGrad.addColorStop(0, seaTop); seaGrad.addColorStop(1, seaBottom);
      ctx.fillStyle = seaGrad; ctx.fillRect(0, horizonY, canvas.width, shorelineY - horizonY);

      // Reflection of Celestial Bodies
      const targetX = dayFactor < 0.5 ? canvas.width * 0.7 : canvas.width * 0.2;
      const reflectGrad = ctx.createLinearGradient(targetX - 70, horizonY, targetX + 70, horizonY);
      const reflectColor = dayFactor < 0.5 ? (sunsetFactor > 0 ? 'rgba(255, 87, 51, 0.2)' : 'rgba(255, 223, 0, 0.15)') : 'rgba(200, 230, 255, 0.08)';
      reflectGrad.addColorStop(0, 'transparent');
      reflectGrad.addColorStop(0.5, reflectColor);
      reflectGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = reflectGrad;
      ctx.fillRect(targetX - 100, horizonY, 200, shorelineY - horizonY);

      // Vertical Waves (Water texture)
      for (let j = 0; j < 6; j++) {
        const progression = ((waveOffset * 0.5 + j * 0.8) % 4) / 4; 
        const waveY = horizonY + (shorelineY - horizonY) * progression;
        const waveOpacity = progression * 0.3 * (1 - dayFactor * 0.5);
        const waveWidth = 1 + progression * 3;
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${waveOpacity})`;
        ctx.lineWidth = waveWidth;
        ctx.beginPath();
        for (let i = -40; i <= canvas.width + 40; i += 40) {
          const curve = Math.sin(i * 0.01 + waveOffset) * 10 * progression;
          ctx.lineTo(i + rollX * progression * 2, waveY + curve);
        }
        ctx.stroke();
      }

      // Fish Rendering
      fishRef.current.forEach(f => {
        if (!f.active) return;
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.scale(f.vx > 0 ? 1 : -1, 1);
        ctx.fillStyle = '#88C0D0';
        ctx.beginPath();
        ctx.ellipse(0, 0, 12 * f.scale, 6 * f.scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-10 * f.scale, 0);
        ctx.lineTo(-18 * f.scale, -6 * f.scale);
        ctx.lineTo(-18 * f.scale, 6 * f.scale);
        ctx.fill();
        ctx.restore();
      });

      // Sand
      const sandGrad = ctx.createLinearGradient(0, shorelineY, 0, canvas.height);
      sandGrad.addColorStop(0, sandTop); sandGrad.addColorStop(1, sandBottom);
      ctx.fillStyle = sandGrad; ctx.fillRect(0, shorelineY, canvas.width, canvas.height - shorelineY);

      // Shoreline Wash (Dynamic Foam)
      const washDepth = Math.max(0, Math.sin(waveOffset * 1.2) * 80 + 20);
      const washGrad = ctx.createLinearGradient(0, shorelineY, 0, shorelineY + washDepth);
      const washAlpha = 0.5 * (1 - dayFactor * 0.4);
      washGrad.addColorStop(0, `rgba(255, 255, 255, ${washAlpha + 0.3})`);
      washGrad.addColorStop(0.6, `rgba(255, 255, 255, ${washAlpha * 0.5})`);
      washGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = washGrad; ctx.beginPath(); ctx.moveTo(0, shorelineY);
      for (let i = 0; i <= canvas.width; i += 20) ctx.lineTo(i, shorelineY + washDepth + Math.sin(i * 0.05 + waveOffset * 2) * 10);
      ctx.lineTo(canvas.width, shorelineY); ctx.fill();

      // Celestial Bodies with Glow (Higher Arc)
      if (dayFactor < 1) { // Sun
        ctx.save();
        ctx.globalAlpha = 1 - dayFactor;
        const sunX = canvas.width * 0.7;
        const sunProg = Math.min(cycleTime / 60000, 1);
        const sunY = horizonY - Math.sin(sunProg * Math.PI) * (horizonY - 80);
        
        const sunGlow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 200);
        sunGlow.addColorStop(0, sunsetFactor > 0 ? 'rgba(255, 87, 51, 0.4)' : 'rgba(255, 255, 200, 0.4)');
        sunGlow.addColorStop(1, 'rgba(255, 150, 50, 0)');
        ctx.fillStyle = sunGlow;
        ctx.beginPath(); ctx.arc(sunX, sunY, 200, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = sunsetFactor > 0 ? '#FFC300' : '#FFFDE7';
        ctx.beginPath(); ctx.arc(sunX, sunY, 50, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      if (dayFactor > 0) { // Moon & Stars
        ctx.save();
        ctx.globalAlpha = dayFactor;
        const moonX = canvas.width * 0.2;
        const nightProg = (cycleTime >= 60000) ? (cycleTime - 60000) / 60000 : (cycleTime / 60000);
        const moonY = horizonY - Math.sin(nightProg * Math.PI) * (horizonY - 100);
        
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 30; i++) {
          const sFactor = Math.abs(Math.sin(waveOffset * 0.4 + i));
          ctx.globalAlpha = dayFactor * sFactor;
          const sx = (Math.sin(i * 999) * 0.5 + 0.5) * canvas.width;
          const sy = (Math.cos(i * 888) * 0.5 + 0.5) * (horizonY - 50);
          ctx.fillRect(sx, sy, 2, 2);
        }

        const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 150);
        moonGlow.addColorStop(0, 'rgba(200, 230, 255, 0.3)');
        moonGlow.addColorStop(1, 'rgba(100, 150, 255, 0)');
        ctx.fillStyle = moonGlow;
        ctx.beginPath(); ctx.arc(moonX, moonY, 150, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#F0F4FF';
        ctx.beginPath(); ctx.arc(moonX, moonY, 40, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      // Birds (Seagulls)
      const drawBirds = () => {
        birdsRef.current.forEach(b => {
          ctx.strokeStyle = dayFactor < 0.6 ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          const flap = Math.sin(b.wing) * 10;
          ctx.moveTo(b.x, b.y);
          ctx.quadraticCurveTo(b.x - 15, b.y - flap, b.x - 30, b.y);
          ctx.moveTo(b.x, b.y);
          ctx.quadraticCurveTo(b.x + 15, b.y - flap, b.x + 30, b.y);
          ctx.stroke();
        });
      };
      drawBirds();

      // Rain Rendering
      if (gameState.currentStageIndex >= 2) {
        ctx.strokeStyle = 'rgba(200, 200, 255, 0.4)';
        ctx.lineWidth = 1.2;
        rainRef.current.forEach(r => {
          ctx.beginPath();
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x - 3, r.y + r.l);
          ctx.stroke();
        });
      }

      // Boss avatar — photo clipped in circle
      const drawAvatar = (x: number, y: number, img: HTMLImageElement | null) => {
        const r = PADDLE_RADIUS * 1.2;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath(); ctx.ellipse(x + 12, y + 12, r, r * 0.4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
        if (img) {
          // Crop from top (show face/torso, not full body)
          const srcH = img.naturalWidth; // square crop from top
          ctx.drawImage(img, 0, 0, img.naturalWidth, srcH, x - r, y - r, r * 2, r * 2);
        } else {
          ctx.fillStyle = '#1A2B3C'; ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }
        ctx.restore();
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
      };

      // Player paddle — white circle with product logo contained (no distortion)
      const drawProductPaddle = (x: number, y: number, img: HTMLImageElement | null) => {
        const r = PADDLE_RADIUS * 1.2;
        ctx.save();
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath(); ctx.ellipse(x + 12, y + 12, r, r * 0.4, 0, 0, Math.PI * 2); ctx.fill();
        // White background circle
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF'; ctx.fill();
        ctx.clip();
        // Draw logo centered and contained (preserves aspect ratio)
        if (img && img.naturalWidth > 0) {
          const padding = r * 0.3;
          const maxSize = (r - padding) * 2;
          const aspect = img.naturalWidth / img.naturalHeight;
          let dw = maxSize, dh = maxSize;
          if (aspect > 1) { dh = maxSize / aspect; }
          else { dw = maxSize * aspect; }
          ctx.drawImage(img, x - dw / 2, y - dh / 2, dw, dh);
        }
        ctx.restore();
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
      };

      drawProductPaddle(PADDLE_WIDTH + 10, playerYRef.current, imagesRef.current.player);
      drawAvatar(canvas.width - PADDLE_WIDTH - 10, opponentYRef.current, imagesRef.current.opponent);

      // Ball
      ctx.fillStyle = dayFactor > 0.5 ? '#88C0D0' : '#FFD700';
      ctx.shadowBlur = 15; ctx.shadowColor = dayFactor > 0.5 ? '#88C0D0' : '#FFD700';
      ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_RADIUS * 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // HUD (Centered)
      ctx.fillStyle = '#FFFFFF'; ctx.font = '900 36px Inter'; ctx.textAlign = 'center';
      ctx.fillText(`PONTOS: ${score}`, canvas.width / 2, 50);
      
      const hudTarget = gameState.boss?.targetScore || 1000;
      const progressBaseline = (gameState.currentStageIndex === 0) ? 0 : 0; // The progress should be relative to the stage total.
      // Actually, if we use cumulative score, the bar should fill up towards the next target.
      const previousTarget = gameState.currentStageIndex > 0 ? (gameState.boss?.targetScore || 1000) * 0.5 : 0; // Rough estimation or just 0
      const progress = Math.min(score / hudTarget, 1);
      
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(canvas.width / 2 - 200, 70, 400, 15);
      ctx.fillStyle = gameState.product?.color || '#FF4B2B'; ctx.fillRect(canvas.width / 2 - 200, 70, 400 * progress, 15);
      ctx.fillStyle = '#FFFFFF'; ctx.font = '700 16px Inter'; ctx.fillText(`META DESTA FASE: ${hudTarget}`, canvas.width / 2, 110);

      // TOTAL ACUMULADO is now just "score" if score starts at totalScore.
      // To clarify, we can show "PONTOS DA SESSÃO" and "META FINAL".

      // BOSS & PRODUCT INFO (Moved to avoid overlap)
      ctx.textAlign = 'right'; ctx.font = '900 18px Inter'; ctx.fillStyle = '#FFFFFF';
      ctx.fillText(gameState.boss?.name.toUpperCase() || 'BOSS', canvas.width - 150, 40);
      ctx.font = '700 12px Inter'; ctx.fillStyle = '#FF4E6B';
      ctx.fillText(gameState.boss?.role.toUpperCase() || 'GESTOR', canvas.width - 150, 60);
      
      ctx.textAlign = 'left'; ctx.font = '900 18px Inter'; ctx.fillStyle = '#FFFFFF';
      ctx.fillText('PRODUTO:', 40, 40);
      ctx.fillStyle = gameState.product?.color || '#FFFFFF';
      ctx.fillText(gameState.product?.name.toUpperCase() || 'GERAL', 40, 65);

      // Lives
      for (let i = 0; i < lives; i++) {
        ctx.fillStyle = '#FF4B2B'; ctx.beginPath(); ctx.arc(40 + i * 30, 95, 8, 0, Math.PI * 2); ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gameState, onGameOver, score, rally, lives]);

  return (
    <div 
      className="h-screen w-screen bg-cover bg-center flex flex-col items-center justify-center p-4 overflow-hidden relative"
      style={{ backgroundImage: "url('/assets/beach_bg.png')" }}
    >
      {/* Background Overlay for Depth */}
      <div className="absolute inset-0 bg-[#0A192F]/60 backdrop-blur-[2px]" />

      <div className="relative z-10 border-[8px] md:border-[12px] border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden rounded-[30px] md:rounded-[40px] max-w-[95vw] max-h-[90vh] aspect-[12/8] flex items-center justify-center bg-black">
        <canvas 
          ref={canvasRef} 
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT} 
          className="w-full h-full object-contain cursor-none transition-opacity duration-500" 
        />
        <button 
          onClick={onBack} 
          className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-20 px-6 py-3 md:px-8 md:py-4 bg-black/40 hover:bg-black/80 backdrop-blur-xl text-white font-black text-[10px] md:text-xs uppercase tracking-[0.3em] rounded-full border-2 border-white/30 transition-all duration-300 shadow-2xl active:scale-95"
        >
          Sair do Jogo
        </button>
      </div>
    </div>
  );
};

export default GameCanvas;
