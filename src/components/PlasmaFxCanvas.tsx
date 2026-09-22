import React, { useEffect, useRef } from 'react';
import { DragonTheme, AudioReactiveState, ExpressionMode } from '../types';

export interface PlasmaFxCanvasProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
  expression: ExpressionMode;
  lookX?: number;
  lookY?: number;
  enabled?: boolean;
  preset?: 'cyan' | 'gold' | 'violet' | 'emerald' | 'supernova';
  intensity?: number;
  arcFrequency?: number;
  coreSize?: number;
  audioReactivity?: number;
  burstTriggerCount?: number;
}

interface PlasmaArc {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
  maxLife: number;
  branches: { x: number; y: number }[];
  color: string;
  width: number;
}

interface PlasmaSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
}

interface PlasmaPulseRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export const PLASMA_PRESET_COLORS = {
  cyan: { primary: '#06b6d4', secondary: '#3b82f6', core: '#ffffff', glow: '#00f0ff' },
  gold: { primary: '#eab308', secondary: '#f97316', core: '#ffffff', glow: '#ffaa00' },
  violet: { primary: '#a855f7', secondary: '#ec4899', core: '#ffffff', glow: '#d8b4fe' },
  emerald: { primary: '#10b981', secondary: '#06b6d4', core: '#ffffff', glow: '#34d399' },
  supernova: { primary: '#f43f5e', secondary: '#38bdf8', core: '#ffffff', glow: '#ffffff' },
};

export const PlasmaFxCanvas: React.FC<PlasmaFxCanvasProps> = ({
  theme,
  audioState,
  expression,
  lookX = 0,
  lookY = 0,
  enabled = true,
  preset = 'cyan',
  intensity = 1.0,
  arcFrequency = 1.0,
  coreSize = 1.0,
  audioReactivity = 1.0,
  burstTriggerCount = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const arcsRef = useRef<PlasmaArc[]>([]);
  const sparksRef = useRef<PlasmaSpark[]>([]);
  const ringsRef = useRef<PlasmaPulseRing[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const prevBurstRef = useRef<number>(burstTriggerCount);

  const audioRef = useRef(audioState);
  audioRef.current = audioState;
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const expressionRef = useRef(expression);
  expressionRef.current = expression;
  const lookRef = useRef({ lookX, lookY });
  lookRef.current = { lookX, lookY };
  const presetRef = useRef(preset);
  presetRef.current = preset;
  const intensityRef = useRef(intensity);
  intensityRef.current = intensity;
  const arcFreqRef = useRef(arcFrequency);
  arcFreqRef.current = arcFrequency;
  const coreSizeRef = useRef(coreSize);
  coreSizeRef.current = coreSize;
  const audioReactRef = useRef(audioReactivity);
  audioReactRef.current = audioReactivity;

  // Manual Burst trigger listener
  useEffect(() => {
    if (burstTriggerCount > prevBurstRef.current) {
      prevBurstRef.current = burstTriggerCount;
      triggerManualBurst();
    }
  }, [burstTriggerCount]);

  const triggerManualBurst = () => {
    const curLook = lookRef.current;
    const mouthX = 300 + curLook.lookX * 4;
    const mouthY = 370 + curLook.lookY * 3;
    const presetColors = PLASMA_PRESET_COLORS[presetRef.current] || PLASMA_PRESET_COLORS.cyan;

    // Shockwave Rings
    for (let i = 0; i < 4; i++) {
      ringsRef.current.push({
        x: mouthX,
        y: mouthY,
        radius: 10 + i * 15,
        maxRadius: 220 + i * 40,
        alpha: 0.95,
        color: i % 2 === 0 ? presetColors.glow : presetColors.primary,
      });
    }

    // Exploding Sparks
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3.0 + Math.random() * 8.0;
      sparksRef.current.push({
        x: mouthX,
        y: mouthY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 4,
        alpha: 1.0,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.6,
        color: Math.random() < 0.5 ? presetColors.core : presetColors.glow,
      });
    }

    // Heavy Lightning Arcs
    const landmarks = [
      { x: 180, y: 140 }, // Left Horn
      { x: 420, y: 140 }, // Right Horn
      { x: 300, y: 120 }, // Crown
      { x: 250, y: 260 }, // Left Eye
      { x: 350, y: 260 }, // Right Eye
      { x: mouthX, y: mouthY }, // Maw
    ];

    for (let i = 0; i < 12; i++) {
      const p1 = landmarks[Math.floor(Math.random() * landmarks.length)];
      const p2 = landmarks[Math.floor(Math.random() * landmarks.length)];
      if (p1 !== p2) {
        arcsRef.current.push(generateArc(p1.x, p1.y, p2.x, p2.y, presetColors.glow, 3.5));
      }
    }
  };

  const generateArc = (x1: number, y1: number, x2: number, y2: number, color: string, width = 2): PlasmaArc => {
    const steps = 6;
    const branches: { x: number; y: number }[] = [{ x: x1, y: y1 }];
    const dx = (x2 - x1) / steps;
    const dy = (y2 - y1) / steps;

    for (let i = 1; i < steps; i++) {
      const jitter = (Math.random() - 0.5) * 28;
      const bx = x1 + dx * i + (dy !== 0 ? jitter : jitter * 0.5);
      const by = y1 + dy * i + (dx !== 0 ? jitter : jitter * 0.5);
      branches.push({ x: bx, y: by });
    }
    branches.push({ x: x2, y: y2 });

    return {
      x1,
      y1,
      x2,
      y2,
      life: 0,
      maxLife: 0.1 + Math.random() * 0.15,
      branches,
      color,
      width,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const baseWidth = 600;
      const baseHeight = 700;
      const targetWidth = baseWidth * dpr;
      const targetHeight = baseHeight * dpr;

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, baseWidth, baseHeight);

      if (!enabled) {
        arcsRef.current = [];
        sparksRef.current = [];
        ringsRef.current = [];
        ctx.restore();
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const audio = audioRef.current;
      const expr = expressionRef.current;
      const look = lookRef.current;
      const presetColors = PLASMA_PRESET_COLORS[presetRef.current] || PLASMA_PRESET_COLORS.cyan;
      const mult = intensityRef.current;
      const freq = arcFreqRef.current;
      const cSize = coreSizeRef.current;
      const react = audioReactRef.current;

      const vol = Math.max(0, audio.volume || 0) * react;
      const bass = Math.max(0, audio.bass || 0) * react;
      const jaw = Math.max(0, audio.jawOpen || 0);

      const mouthX = 300 + look.lookX * 4;
      const mouthY = 370 + look.lookY * 3 + jaw * 16;
      const leftHorn = { x: 180 + look.lookX * 3, y: 140 + look.lookY * 2 };
      const rightHorn = { x: 420 + look.lookX * 3, y: 140 + look.lookY * 2 };
      const crown = { x: 300 + look.lookX * 4, y: 115 + look.lookY * 2 };

      // --- 1. MAW PLASMA CHARGE ORB ---
      const orbRadius = (12 + vol * 30 + bass * 22) * cSize * mult;
      if (orbRadius > 2) {
        ctx.save();
        ctx.translate(mouthX, mouthY);

        // Outer Aura Glow
        const orbGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, orbRadius * 2.2);
        orbGrad.addColorStop(0, presetColors.core);
        orbGrad.addColorStop(0.3, presetColors.glow);
        orbGrad.addColorStop(0.7, presetColors.primary);
        orbGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = orbGrad;
        ctx.shadowBlur = 24 * mult;
        ctx.shadowColor = presetColors.glow;
        ctx.globalAlpha = Math.min(0.9, 0.4 + vol * 0.6);
        ctx.beginPath();
        ctx.arc(0, 0, orbRadius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Hot Inner Plasma Core
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = presetColors.core;
        ctx.beginPath();
        ctx.arc(0, 0, orbRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // --- 2. RANDOM ARC GENERATION ---
      const spawnChance = (0.12 * freq + vol * 0.35 + (audio.isRoaring ? 0.6 : 0.0)) * mult;
      if (Math.random() < spawnChance && arcsRef.current.length < 20) {
        // Pick 2 random points
        const points = [
          leftHorn,
          rightHorn,
          crown,
          { x: 250 + look.lookX * 4, y: 260 + look.lookY * 3 },
          { x: 350 + look.lookX * 4, y: 260 + look.lookY * 3 },
          { x: mouthX, y: mouthY },
        ];
        const idx1 = Math.floor(Math.random() * points.length);
        let idx2 = Math.floor(Math.random() * points.length);
        if (idx2 === idx1) idx2 = (idx1 + 1) % points.length;

        const p1 = points[idx1];
        const p2 = points[idx2];
        const arcColor = Math.random() < 0.6 ? presetColors.glow : presetColors.core;
        arcsRef.current.push(generateArc(p1.x, p1.y, p2.x, p2.y, arcColor, 1.8 + Math.random() * 2));
      }

      // --- 3. DRAW PLASMA LIGHTNING ARCS ---
      const activeArcs: PlasmaArc[] = [];
      for (let i = 0; i < arcsRef.current.length; i++) {
        const arc = arcsRef.current[i];
        arc.life += dt;
        if (arc.life < arc.maxLife) {
          ctx.save();
          ctx.beginPath();
          if (arc.branches.length > 0) {
            ctx.moveTo(arc.branches[0].x, arc.branches[0].y);
            for (let j = 1; j < arc.branches.length; j++) {
              ctx.lineTo(arc.branches[j].x, arc.branches[j].y);
            }
          }
          ctx.strokeStyle = arc.color;
          ctx.lineWidth = arc.width * mult;
          ctx.shadowBlur = 14 * mult;
          ctx.shadowColor = arc.color;
          ctx.globalAlpha = 1 - arc.life / arc.maxLife;
          ctx.stroke();

          // Hot White Core Line
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.max(1, arc.width * 0.4);
          ctx.stroke();

          ctx.restore();
          activeArcs.push(arc);
        }
      }
      arcsRef.current = activeArcs;

      // --- 4. CONTINUOUS PLASMA SPARKS ---
      if ((vol > 0.1 || expr === 'roar' || expr === 'talk') && Math.random() < 0.4 * mult) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4.0;
        sparksRef.current.push({
          x: mouthX,
          y: mouthY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.0,
          radius: 1.5 + Math.random() * 3,
          alpha: 1.0,
          life: 0,
          maxLife: 0.4 + Math.random() * 0.5,
          color: Math.random() < 0.5 ? presetColors.glow : presetColors.primary,
        });
      }

      // --- 5. DRAW SPARKS ---
      const activeSparks: PlasmaSpark[] = [];
      for (let i = 0; i < sparksRef.current.length; i++) {
        const s = sparksRef.current[i];
        s.life += dt;
        if (s.life < s.maxLife) {
          s.x += s.vx * (60 * dt);
          s.y += s.vy * (60 * dt);
          s.alpha = 1 - s.life / s.maxLife;

          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.fillStyle = s.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = s.color;
          ctx.globalAlpha = s.alpha;
          ctx.beginPath();
          ctx.arc(0, 0, s.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          activeSparks.push(s);
        }
      }
      sparksRef.current = activeSparks;

      // --- 6. DRAW PLASMA SHOCKWAVE RINGS ---
      const activeRings: PlasmaPulseRing[] = [];
      for (let i = 0; i < ringsRef.current.length; i++) {
        const ring = ringsRef.current[i];
        ring.radius += (ring.maxRadius - ring.radius) * 0.08 + 2;
        ring.alpha *= 0.92;

        if (ring.alpha > 0.01 && ring.radius < ring.maxRadius) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
          ctx.strokeStyle = ring.color;
          ctx.lineWidth = 3.5 * ring.alpha;
          ctx.shadowBlur = 18;
          ctx.shadowColor = ring.color;
          ctx.globalAlpha = ring.alpha;
          ctx.stroke();
          ctx.restore();

          activeRings.push(ring);
        }
      }
      ringsRef.current = activeRings;

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [enabled]);

  return (
    <canvas
      ref={canvasRef}
      id="plasma-fx-canvas"
      className="absolute inset-0 w-full h-full pointer-events-none z-25 overflow-visible select-none"
    />
  );
};
