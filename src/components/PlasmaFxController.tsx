import React from 'react';
import { StreamConfig, AudioReactiveState } from '../types';
import { Zap, Sparkles, Activity, ShieldAlert, Sliders, Flame, Radio } from 'lucide-react';
import { PLASMA_PRESET_COLORS } from './PlasmaFxCanvas';

interface PlasmaFxControllerProps {
  streamConfig: StreamConfig;
  audioState: AudioReactiveState;
  onUpdateStreamConfig: (newConfig: Partial<StreamConfig>) => void;
  onTriggerPlasmaBurst: () => void;
}

export function PlasmaFxController({
  streamConfig,
  audioState,
  onUpdateStreamConfig,
  onTriggerPlasmaBurst,
}: PlasmaFxControllerProps) {
  const isEnabled = streamConfig.showPlasmaFx !== false;
  const currentPreset = streamConfig.plasmaPreset || 'cyan';
  const intensity = streamConfig.plasmaIntensity ?? 1.2;
  const arcFrequency = streamConfig.plasmaArcFrequency ?? 1.0;
  const coreSize = streamConfig.plasmaCoreSize ?? 1.0;
  const audioReactivity = streamConfig.plasmaAudioReactivity ?? 1.0;

  // Dragon Breath Config
  const isBreathEnabled = streamConfig.showDragonBreath !== false;
  const breathIntensity = streamConfig.dragonBreathIntensity ?? 1.0;
  const breathRoarThresh = streamConfig.dragonBreathRoarThreshold ?? 0.55;
  const breathAudioGain = streamConfig.dragonBreathAudioSyncGain ?? 1.2;

  const presetList: Array<{ id: 'cyan' | 'gold' | 'violet' | 'emerald' | 'supernova'; label: string; bg: string }> = [
    { id: 'cyan', label: 'Quantum Cyan', bg: 'from-cyan-500 to-blue-600' },
    { id: 'gold', label: 'Solar Gold', bg: 'from-amber-400 to-orange-600' },
    { id: 'violet', label: 'Void Violet', bg: 'from-purple-500 to-pink-600' },
    { id: 'emerald', label: 'Bio Emerald', bg: 'from-emerald-400 to-teal-600' },
    { id: 'supernova', label: 'Supernova', bg: 'from-rose-500 to-cyan-400' },
  ];

  return (
    <div className="flex flex-col gap-4 text-slate-100">
      {/* Title & Master Power Toggle */}
      <div className="flex items-center justify-between p-3.5 bg-zinc-900/90 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-zinc-900 via-cyan-950/20 to-zinc-900 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20">
            <Zap className="w-5 h-5 animate-pulse text-cyan-300" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm tracking-wider uppercase text-zinc-100 flex items-center gap-2">
              <span>PLASMA FX ENGINE</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                60FPS ION ARCS
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono">
              High-voltage electrical discharge & speech-reactive plasma core
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => onUpdateStreamConfig({ showPlasmaFx: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
        </label>
      </div>

      {/* Manual Trigger Burst Banner */}
      <div className="p-4 bg-gradient-to-br from-cyan-950/40 via-zinc-900 to-purple-950/40 rounded-2xl border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
          <div>
            <span className="font-orbitron text-xs font-bold text-cyan-200 uppercase tracking-wider block">
              INSTANT PLASMA STORM
            </span>
            <span className="text-[11px] text-zinc-400">
              Unleash high-energy shockwaves and electrical arc tendrils
            </span>
          </div>
        </div>

        <button
          onClick={onTriggerPlasmaBurst}
          disabled={!isEnabled}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-orbitron text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-cyan-300/40 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>TRIGGER PLASMA BURST</span>
        </button>
      </div>

      {/* Presets & Color Schemes */}
      <div className="p-3.5 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col gap-2.5">
        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-cyan-400" />
          <span>PLASMA COLOR PRESET</span>
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {presetList.map((p) => {
            const isSelected = currentPreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onUpdateStreamConfig({ plasmaPreset: p.id })}
                disabled={!isEnabled}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-800 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/40 shadow-lg'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                } disabled:opacity-40`}
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${p.bg} shadow-md`} />
                <span className="text-[11px] font-semibold tracking-tight">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Tuning Sliders */}
      <div className="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>PLASMA DYNAMICS & ARC TUNING</span>
        </div>

        {/* Arc Intensity */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-300 font-medium">Plasma Arc Intensity</span>
            <span className="font-mono text-cyan-400 font-bold">{intensity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={intensity}
            onChange={(e) => onUpdateStreamConfig({ plasmaIntensity: parseFloat(e.target.value) })}
            disabled={!isEnabled}
            className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer disabled:opacity-40"
          />
        </div>

        {/* Lightning Arc Frequency */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-300 font-medium">Lightning Arc Frequency</span>
            <span className="font-mono text-cyan-400 font-bold">{arcFrequency.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="2.5"
            step="0.1"
            value={arcFrequency}
            onChange={(e) => onUpdateStreamConfig({ plasmaArcFrequency: parseFloat(e.target.value) })}
            disabled={!isEnabled}
            className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer disabled:opacity-40"
          />
        </div>

        {/* Maw Plasma Core Size */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-300 font-medium">Throat Plasma Core Size</span>
            <span className="font-mono text-cyan-400 font-bold">{coreSize.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="2.5"
            step="0.1"
            value={coreSize}
            onChange={(e) => onUpdateStreamConfig({ plasmaCoreSize: parseFloat(e.target.value) })}
            disabled={!isEnabled}
            className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer disabled:opacity-40"
          />
        </div>

        {/* Speech Audio Reactivity */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-300 font-medium">Speech Formant Audio Reactivity</span>
            <span className="font-mono text-cyan-400 font-bold">{audioReactivity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="2.5"
            step="0.1"
            value={audioReactivity}
            onChange={(e) => onUpdateStreamConfig({ plasmaAudioReactivity: parseFloat(e.target.value) })}
            disabled={!isEnabled}
            className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer disabled:opacity-40"
          />
        </div>

        {/* Real-time Voice Energy Meter */}
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-zinc-400 font-mono text-[11px]">SPEECH IONIZATION LEVEL:</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-28 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-75"
                style={{ width: `${Math.min(100, (audioState.volume || 0) * 100 * audioReactivity)}%` }}
              />
            </div>
            <span className="font-mono text-cyan-300 text-[11px]">
              {Math.round((audioState.volume || 0) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* DRAGON BREATH HOLOGRAPHIC FIRE PARTICLE SYSTEM MODULE */}
      <div className="p-4 bg-gradient-to-br from-amber-950/30 via-zinc-900 to-orange-950/30 rounded-2xl border border-amber-500/40 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 shadow-lg shadow-amber-500/20">
              <Flame className="w-5 h-5 text-amber-400 animate-bounce" style={{ animationDuration: '2s' }} />
            </div>
            <div>
              <h4 className="font-orbitron font-extrabold text-xs tracking-wider uppercase text-zinc-100 flex items-center gap-2">
                <span>DRAGON BREATH PARTICLE SYSTEM</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  HOLOGRAPHIC FIRE
                </span>
              </h4>
              <p className="text-[11px] text-zinc-400 font-mono">
                Syncs with mic gain & audio reactivity to emit fire density when roaring
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isBreathEnabled}
              onChange={(e) => onUpdateStreamConfig({ showDragonBreath: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {/* Dragon Breath Fine Tuning Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Fire Density Multiplier */}
          <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 flex flex-col gap-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-300 font-medium">Fire Particle Density</span>
              <span className="font-mono text-amber-400 font-bold">{breathIntensity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={breathIntensity}
              onChange={(e) => onUpdateStreamConfig({ dragonBreathIntensity: parseFloat(e.target.value) })}
              disabled={!isBreathEnabled}
              className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer disabled:opacity-40"
            />
            <span className="text-[10px] text-zinc-500 font-mono">Emitted flame & ember volume</span>
          </div>

          {/* Audio Reactivity Gain Sync */}
          <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 flex flex-col gap-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-300 font-medium">Audio Reactivity Gain</span>
              <span className="font-mono text-amber-400 font-bold">{breathAudioGain.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={breathAudioGain}
              onChange={(e) => onUpdateStreamConfig({ dragonBreathAudioSyncGain: parseFloat(e.target.value) })}
              disabled={!isBreathEnabled}
              className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer disabled:opacity-40"
            />
            <span className="text-[10px] text-zinc-500 font-mono">Mic volume amplification multiplier</span>
          </div>

          {/* Roar Trigger Sensitivity */}
          <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 flex flex-col gap-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-300 font-medium">Roar Fire Threshold</span>
              <span className="font-mono text-amber-400 font-bold">{Math.round(breathRoarThresh * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.9"
              step="0.05"
              value={breathRoarThresh}
              onChange={(e) => onUpdateStreamConfig({ dragonBreathRoarThreshold: parseFloat(e.target.value) })}
              disabled={!isBreathEnabled}
              className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer disabled:opacity-40"
            />
            <span className="text-[10px] text-zinc-500 font-mono">Cutoff for full roar breath blast</span>
          </div>
        </div>

        {/* Live Holographic Fire Particle Density Meter */}
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-zinc-400 font-mono text-[11px]">HOLOGRAPHIC FIRE DENSITY:</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-75"
                style={{
                  width: `${Math.min(
                    100,
                    (audioState.volume || 0) * 100 * breathAudioGain * breathIntensity
                  )}%`,
                }}
              />
            </div>
            <span className="font-mono text-amber-300 text-[11px] font-bold">
              {Math.round(
                Math.min(100, (audioState.volume || 0) * 100 * breathAudioGain * breathIntensity)
              )}
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
