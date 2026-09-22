import React, { useEffect, useRef } from 'react';
import { DragonTheme, AudioReactiveState, ExpressionMode, FlightPatternType, FlightPhysicsConfig } from '../types';

interface InfinityFlightDragonCanvasProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
  expression: ExpressionMode;
  flightPattern?: FlightPatternType;
  flightSpeed?: number;
  flightPhysics?: FlightPhysicsConfig;
  onRecall?: () => void;
  interactive?: boolean;
}

export const InfinityFlightDragonCanvas: React.FC<InfinityFlightDragonCanvasProps> = ({
  theme,
  audioState,
  expression,
  flightPattern = 'infinity',
  flightSpeed = 1.0,
  onRecall,
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
      time += 0.02 * flightSpeed;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Lemniscate path
      const scaleX = w * 0.35;
      const scaleY = h * 0.25;

      const px = cx + Math.sin(time) * scaleX;
      const py = cy + (Math.sin(2 * time) / 2) * scaleY;

      // Draw flying dragon core
      ctx.save();
      ctx.translate(px, py);

      ctx.beginPath();
      ctx.arc(0, 0, 24 + audioState.volume * 12, 0, Math.PI * 2);
      ctx.fillStyle = theme.energy;
      ctx.shadowBlur = 20;
      ctx.shadowColor = theme.energy;
      ctx.fill();

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
  }, [theme, audioState, flightPattern, flightSpeed]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      {onRecall && (
        <button
          onClick={onRecall}
          className="absolute top-4 right-4 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer shadow-lg z-30"
        >
          Re-assemble Dock
        </button>
      )}
    </div>
  );
};
