import React, { useState, useEffect, useRef } from 'react';
import { DragonTheme, AudioReactiveState, ExpressionMode, StreamConfig, AvatarFlightMode, FlightPatternType, FlightPhysicsConfig, DragonGestureType } from '../types';
import { InfinityFlowCanvas } from './InfinityFlowCanvas';
import { DragonFaceSvg } from './DragonFaceSvg';
import { EnergyDustCanvas } from './EnergyDustCanvas';
import { ProceduralShieldSvg } from './ProceduralShieldSvg';
import { CyberWingsVisualizer } from './CyberWingsVisualizer';
import { DragonBreath } from './DragonBreath';
import { PlasmaFxCanvas } from './PlasmaFxCanvas';
import { InfinityFlightDragonCanvas } from './InfinityFlightDragonCanvas';
import { HolographicPedestalBase } from './HolographicPedestalBase';
import { MatrixCodeRainOverlay } from './MatrixCodeRainOverlay';

interface CyberDragonAvatarProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
  expression: ExpressionMode;
  streamConfig: StreamConfig;
  isInteractive?: boolean;
  flightMode?: AvatarFlightMode;
  flightPattern?: FlightPatternType;
  flightSpeed?: number;
  flightPhysics?: FlightPhysicsConfig;
  onRecall?: () => void;
  plasmaBurstCount?: number;
  activeGesture?: DragonGestureType | null;
}

export function CyberDragonAvatar({
  theme,
  audioState,
  expression,
  streamConfig,
  isInteractive = true,
  flightMode = 'docked',
  flightPattern = 'infinity',
  flightSpeed = 1.0,
  flightPhysics,
  onRecall,
  plasmaBurstCount = 0,
  activeGesture = null,
}: CyberDragonAvatarProps) {
  const [lookPos, setLookPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isGlitching, setIsGlitching] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isAirborne = flightMode === 'flight';

  // Mouse / gaze tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isInteractive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setLookPos({
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    });
  };

  const handleMouseLeave = () => {
    setLookPos({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (streamConfig.glitchBurstOnRoar && audioState.isRoaring) {
      setIsGlitching(true);
      const timer = window.setTimeout(() => setIsGlitching(false), 200);
      return () => clearTimeout(timer);
    }
  }, [audioState.isRoaring, streamConfig.glitchBurstOnRoar]);

  const avatarScale = streamConfig.avatarScale || 1.0;
  const flip = streamConfig.flipHorizontal ? 'scale-x-[-1]' : '';

  let gestureCss = '';
  if (activeGesture === 'barrel_roll') {
    gestureCss = 'animate-[spin_1.5s_ease-in-out_infinite]';
  } else if (activeGesture === 'wing_stretch') {
    gestureCss = 'scale-[1.12] transition-all duration-300';
  } else if (activeGesture === 'tail_whip') {
    gestureCss = 'translate-x-10 skew-x-6 transition-all duration-300';
  } else if (activeGesture === 'horn_charge') {
    gestureCss = 'translate-y-6 scale-105 transition-all duration-300';
  } else if (activeGesture === 'roar_salute') {
    gestureCss = '-translate-y-8 scale-110 transition-all duration-300';
  } else if (activeGesture === 'sonic_flare') {
    gestureCss = 'scale-115 transition-all duration-300';
  } else if (activeGesture === 'cyber_bow') {
    gestureCss = 'rotate-12 translate-y-8 transition-all duration-300';
  } else if (activeGesture === 'stealth_cloak') {
    gestureCss = 'opacity-35 filter blur-[0.5px] transition-all duration-300';
  }

  return (
    <div
      ref={containerRef}
      id="cyber-dragon-avatar-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden transition-all duration-300 select-none ${
        isGlitching ? 'filter invert-[0.08] contrast-125' : ''
      }`}
    >
      {isAirborne ? (
        <div className="absolute inset-0 w-full h-full animate-fadeIn">
          <InfinityFlightDragonCanvas
            theme={theme}
            audioState={audioState}
            expression={expression}
            flightPattern={flightPattern}
            flightSpeed={flightSpeed}
            flightPhysics={flightPhysics}
            onRecall={onRecall}
            interactive={isInteractive}
          />
        </div>
      ) : (
        <>
          {streamConfig.showInfinityAura && (
            <InfinityFlowCanvas
              theme={theme}
              audioState={audioState}
              expression={expression}
              isGlitching={isGlitching}
              preset={streamConfig.infinityFlowPreset || 'vortex'}
              noiseFloorSensitivity={streamConfig.infinityFlowNoiseFloorSensitivity ?? 1.0}
            />
          )}

          {streamConfig.showMatrixCodeRain !== false && (
            <MatrixCodeRainOverlay
              theme={theme}
              audioState={audioState}
            />
          )}

          {streamConfig.showHolographicPedestal !== false && (
            <HolographicPedestalBase
              theme={theme}
              audioState={audioState}
              scale={avatarScale}
            />
          )}

          {streamConfig.showEnergyDust !== false && (
            <EnergyDustCanvas
              theme={theme}
              audioState={audioState}
              intensity={streamConfig.energyDustIntensity ?? 1.0}
            />
          )}

          <div
            id="dragon-head-wrapper"
            className={`relative z-10 w-full max-w-[620px] aspect-[6/7] flex items-center justify-center transition-transform duration-100 ${flip} ${gestureCss}`}
            style={{
              transform: `translate(${streamConfig.avatarX + lookPos.x * 12}px, ${
                streamConfig.avatarY + lookPos.y * 8
              }px) scale(${avatarScale * (1 + audioState.volume * 0.04)})`,
            }}
          >
            {streamConfig.wingbeatVisualizer !== false && (
              <CyberWingsVisualizer
                theme={theme}
                audioState={audioState}
                expression={expression}
                flipHorizontal={streamConfig.flipHorizontal}
              />
            )}

            <DragonFaceSvg
              theme={theme}
              audioState={audioState}
              expression={expression}
              lookX={lookPos.x}
              lookY={lookPos.y}
              showRunes={streamConfig.showRunes}
            />

            {streamConfig.showPlasmaFx !== false && (
              <PlasmaFxCanvas
                theme={theme}
                audioState={audioState}
                expression={expression}
                lookX={lookPos.x}
                lookY={lookPos.y}
                enabled={true}
                preset={streamConfig.plasmaPreset || 'cyan'}
                intensity={streamConfig.plasmaIntensity ?? 1.2}
                arcFrequency={streamConfig.plasmaArcFrequency ?? 1.0}
                coreSize={streamConfig.plasmaCoreSize ?? 1.0}
                audioReactivity={streamConfig.plasmaAudioReactivity ?? 1.0}
                burstTriggerCount={plasmaBurstCount}
              />
            )}

            {streamConfig.showDragonBreath !== false && (
              <DragonBreath
                theme={theme}
                audioState={audioState}
                expression={expression}
                lookX={lookPos.x}
                lookY={lookPos.y}
                enabled={true}
                intensityMultiplier={streamConfig.dragonBreathIntensity ?? 1.0}
                roarThreshold={streamConfig.dragonBreathRoarThreshold ?? 0.55}
                audioSyncGain={streamConfig.dragonBreathAudioSyncGain ?? 1.2}
              />
            )}

            <ProceduralShieldSvg
              theme={theme}
              audioState={audioState}
              isActive={expression === 'shield'}
            />
          </div>
        </>
      )}
    </div>
  );
}
