import React, { useEffect, useRef } from 'react';
import { DragonTheme, AudioReactiveState, ExpressionMode } from '../types';

interface CyberWingsVisualizerProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
  expression: ExpressionMode;
  flipHorizontal?: boolean;
}

export const CyberWingsVisualizer: React.FC<CyberWingsVisualizerProps> = ({
  theme,
  audioState,
  expression,
}) => {
  const leftWingRef = useRef<HTMLDivElement>(null);
  const rightWingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animId: number;

    const updateLoop = (timestamp: number) => {
      const freqData = audioState.frequencyData || [];
      const volume = audioState.volume || 0;
      const bass = audioState.bass || 0;

      const timeSec = timestamp / 1000;
      const idleHoverSpeed = expression === 'roar' ? 5.5 : 2.6;
      const idleAmplitude = expression === 'roar' ? 18 : 9;
      const idleSine = Math.sin(timeSec * idleHoverSpeed) * idleAmplitude;

      const totalAngle = idleSine + volume * 25 + bass * 15;

      const leftRotY = -totalAngle * 1.15;
      const leftRotZ = -(totalAngle * 0.35) + (bass * 6);
      const rightRotY = totalAngle * 1.15;
      const rightRotZ = (totalAngle * 0.35) - (bass * 6);

      if (leftWingRef.current) {
        leftWingRef.current.style.transform = `rotateY(${leftRotY.toFixed(2)}deg) rotateZ(${leftRotZ.toFixed(2)}deg)`;
      }
      if (rightWingRef.current) {
        rightWingRef.current.style.transform = `rotateY(${rightRotY.toFixed(2)}deg) rotateZ(${rightRotZ.toFixed(2)}deg)`;
      }

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [audioState, expression]);

  return (
    <div
      id="dragon-wings-visualizer"
      className="absolute pointer-events-none flex items-center justify-center select-none -z-10 overflow-visible"
      style={{
        width: '1000px',
        height: '600px',
        left: '50%',
        top: '46%',
        transform: 'translate(-50%, -50%)',
        perspective: '1200px',
      }}
    >
      <div className="relative w-full h-full flex items-center justify-between">
        {/* Left Wing */}
        <div
          ref={leftWingRef}
          className="absolute left-[2%] top-[5%] w-[480px] h-[550px]"
          style={{ transformOrigin: '94% 48%' }}
        >
          <svg viewBox="0 0 460 560" className="w-full h-full overflow-visible drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
            <path
              d="M 430 260 L 320 120 L 190 60 L 60 110 L 20 230 L 90 380 L 220 480 L 360 410 Z"
              fill={`${theme.primary}25`}
              stroke={theme.energy}
              strokeWidth="2"
            />
            <line x1="430" y1="260" x2="60" y2="110" stroke={theme.energy} strokeWidth="3" />
            <line x1="430" y1="260" x2="20" y2="230" stroke={theme.accent} strokeWidth="2" />
            <line x1="430" y1="260" x2="90" y2="380" stroke={theme.primary} strokeWidth="2" />
          </svg>
        </div>

        {/* Right Wing */}
        <div
          ref={rightWingRef}
          className="absolute right-[2%] top-[5%] w-[480px] h-[550px]"
          style={{ transformOrigin: '6% 48%' }}
        >
          <svg viewBox="0 0 460 560" className="w-full h-full overflow-visible drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
            <path
              d="M 30 260 L 140 120 L 270 60 L 400 110 L 440 230 L 370 380 L 240 480 Z"
              fill={`${theme.primary}25`}
              stroke={theme.energy}
              strokeWidth="2"
            />
            <line x1="30" y1="260" x2="400" y2="110" stroke={theme.energy} strokeWidth="3" />
            <line x1="30" y1="260" x2="440" y2="230" stroke={theme.accent} strokeWidth="2" />
            <line x1="30" y1="260" x2="370" y2="380" stroke={theme.primary} strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
};
