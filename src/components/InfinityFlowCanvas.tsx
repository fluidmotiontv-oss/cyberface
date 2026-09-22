import { useEffect, useRef } from 'react';
import { DragonTheme, AudioReactiveState, InfinityFlowPresetType } from '../types';

interface InfinityFlowCanvasProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
  expression: string;
  isGlitching?: boolean;
  preset?: InfinityFlowPresetType;
  noiseFloorSensitivity?: number;
}

interface Particle {
  t: number;           // Parametric progress (0 .. 2*PI)
  speed: number;       // Base speed
  size: number;        // Base size
  offsetAngle: number; // Radial offset angle
  distance: number;    // Radius distance from flow center
  alpha: number;       // Base alpha
  spin: number;        // Rotation angle
  spinSpeed: number;   // Spin velocity
  colorType: 'primary' | 'secondary' | 'energy' | 'accent';
  vortexCore: 0 | 1;
  vortexRadius: number;
  vortexAngle: number;
  shardSides: 3 | 4 | 6;
  nebulaRadius: number;
}

export function InfinityFlowCanvas({
  theme,
  audioState,
  expression,
  isGlitching = false,
  preset = 'vortex',
  noiseFloorSensitivity = 1.0,
}: InfinityFlowCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef<number>(0);
  const ringRotationRef = useRef<number>(0);

  // Initialize particle pool (200 particles)
  useEffect(() => {
    const particles: Particle[] = [];
    const count = 200;
    const colorTypes: ('primary' | 'secondary' | 'energy' | 'accent')[] = [
      'primary', 'energy', 'energy', 'accent', 'secondary',
    ];
    const shardTypes: (3 | 4 | 6)[] = [3, 4, 4, 6];

    for (let i = 0; i < count; i++) {
      particles.push({
        t: (i / count) * Math.PI * 2,
        speed: 0.0025 + Math.random() * 0.005,
        size: 1.5 + Math.random() * 3.5,
        offsetAngle: Math.random() * Math.PI * 2,
        distance: (Math.random() - 0.5) * 48,
        alpha: 0.35 + Math.random() * 0.65,
        spin: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.05,
        colorType: colorTypes[Math.floor(Math.random() * colorTypes.length)],
        vortexCore: i % 2 === 0 ? 0 : 1,
        vortexRadius: 15 + Math.random() * 120,
        vortexAngle: Math.random() * Math.PI * 2,
        shardSides: shardTypes[Math.floor(Math.random() * shardTypes.length)],
        nebulaRadius: 12 + Math.random() * 26,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      timeRef.current += 0.015;
      const t = timeRef.current;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      const noiseFloor = audioState.ambientNoiseFloor ?? 0.04;
      const sensitivity = noiseFloorSensitivity ?? 1.0;
      const ambientShift = Math.max(0.1, Math.min(2.5, noiseFloor * 3.2 * sensitivity));
      
      const vol = audioState.volume;
      const bass = audioState.bass;
      const treble = audioState.treble;
      const isRoar = audioState.isRoaring || expression === 'roar';

      const speedMultiplier = (0.7 + ambientShift * 0.8) * (1 + vol * 3.0 + (isRoar ? 2.8 : 0));
      const loopScaleX = width * 0.42 * (1 + vol * 0.08 + ambientShift * 0.04);
      const loopScaleY = height * 0.28 * (1 + vol * 0.08 + ambientShift * 0.04);

      const glitchX = (isGlitching || (isRoar && Math.random() > 0.65)) ? (Math.random() - 0.5) * 16 : 0;
      const glitchY = (isGlitching || (isRoar && Math.random() > 0.65)) ? (Math.random() - 0.5) * 8 : 0;

      ctx.save();
      ctx.translate(centerX + glitchX, centerY + glitchY);

      // 1. BACKGROUND RINGS
      ringRotationRef.current += 0.004 * (1 + ambientShift * 0.6 + vol * 1.8);
      const ringRot = ringRotationRef.current;
      const baseRadius = Math.min(width, height) * 0.38;
      const ringRadius = baseRadius * (1 + bass * 0.12 + ambientShift * 0.06);

      ctx.save();
      ctx.rotate(ringRot);
      ctx.strokeStyle = theme.gridColor || 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 1.2 + ambientShift * 0.6;
      ctx.setLineDash([8, 12, 2, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      const tickCount = 24;
      for (let i = 0; i < tickCount; i++) {
        const angle = (i / tickCount) * Math.PI * 2;
        const innerR = ringRadius - (i % 6 === 0 ? 12 : 6);
        const outerR = ringRadius + (i % 6 === 0 ? 6 : 2);
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
        ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
        ctx.strokeStyle = i % 6 === 0 ? theme.energy : theme.primary;
        ctx.lineWidth = i % 6 === 0 ? 1.8 : 0.9;
        ctx.stroke();
      }
      ctx.restore();

      const resolveColor = (colorType: 'primary' | 'secondary' | 'energy' | 'accent') => {
        if (colorType === 'energy') return theme.energy;
        if (colorType === 'secondary') return theme.secondary;
        if (colorType === 'accent') return theme.accent;
        return theme.primary;
      };

      const particles = particlesRef.current;

      // PRESETS
      if (preset === 'vortex') {
        const vortexCenterX1 = -loopScaleX * 0.62;
        const vortexCenterX2 = loopScaleX * 0.62;
        const vortexCenterY = 0;

        const vortexSpinSpeed = (0.02 + ambientShift * 0.035) * (1 + vol * 2.0);
        const vortexGlow = 14 + ambientShift * 18 + vol * 22;

        [vortexCenterX1, vortexCenterX2].forEach((vx, idx) => {
          ctx.save();
          ctx.translate(vx, vortexCenterY);
          ctx.rotate(ringRot * (idx === 0 ? 2 : -2));

          const eyeRadius = 16 * (1 + ambientShift * 0.35 + vol * 0.5);
          const eyeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, eyeRadius * 1.6);
          eyeGrad.addColorStop(0, theme.energy);
          eyeGrad.addColorStop(0.5, theme.primary);
          eyeGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = eyeGrad;
          ctx.globalAlpha = 0.5 + ambientShift * 0.3;
          ctx.beginPath();
          ctx.arc(0, 0, eyeRadius * 1.6, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = theme.energy;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 8, 2, 8]);
          ctx.shadowBlur = vortexGlow;
          ctx.shadowColor = theme.energy;
          ctx.beginPath();
          ctx.arc(0, 0, eyeRadius * 1.8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        });

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.vortexAngle += vortexSpinSpeed * (70 / Math.max(25, p.vortexRadius));
          p.vortexRadius -= 0.35 * speedMultiplier;
          if (p.vortexRadius < 10) {
            p.vortexRadius = 110 + Math.random() * 40;
            p.vortexCore = p.vortexCore === 0 ? 1 : 0;
          }

          const coreX = p.vortexCore === 0 ? vortexCenterX1 : vortexCenterX2;
          const currentR = p.vortexRadius * (1 + ambientShift * 0.2);
          const px = coreX + Math.cos(p.vortexAngle) * currentR;
          const py = vortexCenterY + Math.sin(p.vortexAngle) * (currentR * 0.75);

          const dynamicSize = p.size * (0.8 + ambientShift * 0.5 + vol * 0.8);
          const dynamicAlpha = Math.min(1, p.alpha * (0.45 + ambientShift * 0.45 + vol * 0.5));
          const color = resolveColor(p.colorType);

          ctx.save();
          ctx.beginPath();
          ctx.arc(px, py, dynamicSize, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = dynamicAlpha;
          ctx.shadowBlur = 6 + ambientShift * 10;
          ctx.shadowColor = color;
          ctx.fill();
          ctx.restore();
        }
      } else {
        // Default Lemniscate 8-Flow
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.t = (p.t + p.speed * speedMultiplier) % (Math.PI * 2);
          const basePx = loopScaleX * Math.sin(p.t);
          const basePy = loopScaleY * Math.sin(2 * p.t);
          const dx = Math.cos(p.offsetAngle) * (p.distance * (1 + ambientShift * 0.3 + vol * 0.4));
          const dy = Math.sin(p.offsetAngle) * (p.distance * (1 + ambientShift * 0.3 + vol * 0.4));
          const finalX = basePx + dx;
          const finalY = basePy + dy;

          const dynamicSize = p.size * (1 + ambientShift * 0.35 + vol * 1.2 + (isRoar ? 0.8 : 0));
          const dynamicAlpha = Math.min(1, p.alpha * (0.55 + ambientShift * 0.35 + vol * 0.7));
          const color = resolveColor(p.colorType);

          ctx.save();
          ctx.beginPath();
          ctx.arc(finalX, finalY, dynamicSize, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = dynamicAlpha;
          ctx.shadowBlur = 8 + ambientShift * 8 + vol * 10;
          ctx.shadowColor = color;
          ctx.fill();
          ctx.restore();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme, audioState, expression, isGlitching, preset, noiseFloorSensitivity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
