import React, { useEffect, useRef } from 'react';
import { DragonTheme, AudioReactiveState } from '../types';

interface EnergyDustCanvasProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
  intensity?: number;
  density?: number;
  interactive?: boolean;
}

export const EnergyDustCanvas: React.FC<EnergyDustCanvasProps> = ({
  theme,
  audioState,
  intensity = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.02;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const count = Math.floor(40 * intensity);
      for (let i = 0; i < count; i++) {
        const x = (Math.sin(time + i * 2) * 0.4 + 0.5) * w;
        const y = ((time * 20 + i * 35) % h);
        const radius = (1 + Math.sin(time + i) * 1) * 2;

        ctx.fillStyle = theme.energy;
        ctx.globalAlpha = 0.4 + Math.sin(time + i) * 0.3 + audioState.volume * 0.3;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

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
  }, [theme, audioState, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
};
