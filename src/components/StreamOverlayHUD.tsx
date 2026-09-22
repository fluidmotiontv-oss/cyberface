import React from 'react';
import { StreamConfig, DragonTheme, AudioReactiveState } from '../types';
import { Tv, Sliders, Sparkles, Layers, HelpCircle, Wind, CloudFog, Zap } from 'lucide-react';

interface StreamOverlayHUDProps {
  streamConfig: StreamConfig;
  theme: DragonTheme;
  audioState: AudioReactiveState;
  onUpdateStreamConfig: (newConfig: Partial<StreamConfig>) => void;
  onOpenObsGuide: () => void;
}

export function StreamOverlayHUD({
  streamConfig,
  theme,
  audioState,
  onUpdateStreamConfig,
  onOpenObsGuide,
}: StreamOverlayHUDProps) {
  return (
    <div className="flex flex-col gap-4 text-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tv className="w-5 h-5 text-cyan-400" />
          <h3 className="font-orbitron text-sm font-semibold tracking-wider text-zinc-100 uppercase">
            Broadcast & OBS Setup
          </h3>
        </div>
        <button
          onClick={onOpenObsGuide}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>OBS Guide</span>
        </button>
      </div>

      <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-2.5">
        <span className="text-[11px] font-mono text-zinc-400 uppercase">
          BACKGROUND / KEYING MODE
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => onUpdateStreamConfig({ overlayMode: 'app' })}
            className={`p-2.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
              streamConfig.overlayMode === 'app'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Cyber Dark</span>
          </button>
          <button
            onClick={() => onUpdateStreamConfig({ overlayMode: 'transparent' })}
            className={`p-2.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
              streamConfig.overlayMode === 'transparent'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Transparent</span>
          </button>
          <button
            onClick={() => onUpdateStreamConfig({ overlayMode: 'chroma', chromaType: 'green' })}
            className={`p-2.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
              streamConfig.overlayMode === 'chroma' && streamConfig.chromaType === 'green'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-[#00FF00] shadow-sm" />
            <span>Chroma Green</span>
          </button>
          <button
            onClick={() => onUpdateStreamConfig({ overlayMode: 'chroma', chromaType: 'magenta' })}
            className={`p-2.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
              streamConfig.overlayMode === 'chroma' && streamConfig.chromaType === 'magenta'
                ? 'bg-pink-500/20 border-pink-400 text-pink-200'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-[#FF00FF] shadow-sm" />
            <span>Chroma Magenta</span>
          </button>
        </div>
      </div>

      <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>AVATAR SCALE & VISUAL FX TOGGLES</span>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-300 font-medium">Avatar Scale</span>
            <span className="font-mono text-zinc-400">{Math.round(streamConfig.avatarScale * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.6"
            max="1.5"
            step="0.05"
            value={streamConfig.avatarScale}
            onChange={(e) => onUpdateStreamConfig({ avatarScale: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={streamConfig.showStreamHud}
              onChange={(e) => onUpdateStreamConfig({ showStreamHud: e.target.checked })}
              className="w-3.5 h-3.5 accent-cyan-400 rounded cursor-pointer"
            />
            <span>Broadcast HUD</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={streamConfig.showInfinityAura}
              onChange={(e) => onUpdateStreamConfig({ showInfinityAura: e.target.checked })}
              className="w-3.5 h-3.5 accent-cyan-400 rounded cursor-pointer"
            />
            <span>Infinity Flow Aura</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={streamConfig.wingbeatVisualizer !== false}
              onChange={(e) => onUpdateStreamConfig({ wingbeatVisualizer: e.target.checked })}
              className="w-3.5 h-3.5 accent-cyan-400 rounded cursor-pointer"
            />
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <Wind className="w-3.5 h-3.5" />
              Wingbeat 3D
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={streamConfig.showPlasmaFx !== false}
              onChange={(e) => onUpdateStreamConfig({ showPlasmaFx: e.target.checked })}
              className="w-3.5 h-3.5 accent-cyan-400 rounded cursor-pointer"
            />
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-cyan-300" />
              Plasma FX
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
            <input
              type="checkbox"
              checked={streamConfig.showDragonBreath !== false}
              onChange={(e) => onUpdateStreamConfig({ showDragonBreath: e.target.checked })}
              className="w-3.5 h-3.5 accent-cyan-400 rounded cursor-pointer"
            />
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <CloudFog className="w-3.5 h-3.5" />
              Dragon Breath
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
