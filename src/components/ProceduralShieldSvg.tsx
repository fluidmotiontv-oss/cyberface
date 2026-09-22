import React from 'react';
import { DragonTheme, AudioReactiveState } from '../types';

interface ProceduralShieldSvgProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
  isActive: boolean;
}

export const ProceduralShieldSvg: React.FC<ProceduralShieldSvgProps> = ({
  theme,
  audioState,
  isActive,
}) => {
  if (!isActive) return null;

  return (
    <svg
      viewBox="0 0 600 700"
      className="absolute inset-0 w-full h-full pointer-events-none z-25 overflow-visible select-none animate-pulse"
    >
      <ellipse
        cx="300"
        cy="360"
        rx="240"
        ry="280"
        fill={`${theme.energy}15`}
        stroke={theme.energy}
        strokeWidth="3"
        strokeDasharray="12 8"
      />
      <ellipse
        cx="300"
        cy="360"
        rx="220"
        ry="260"
        fill="none"
        stroke={theme.accent}
        strokeWidth="1.5"
      />
    </svg>
  );
};
