import { useEffect, useRef } from 'react';
import { DragonTheme, AudioReactiveState } from '../types';

interface MatrixCodeRainOverlayProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
}

export function MatrixCodeRainOverlay({
  theme,
  audioState,
}: MatrixCodeRainOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const chars = '01010101DRAGON9CYBERNETICS';
    const cols = 30;
    const drops: number[] = new Array(cols).fill(1);

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = 'rgba(9, 9, 11, 0.08)';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = theme.energy;
      ctx.font = '12px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = (i * w) / cols;
        const y = drops[i] * 18;

        ctx.fillText(text, x, y);

        if (y > h && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
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
  }, [theme, audioState]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40"
    />
  );
}
