import React from 'react';
import { AudioConfig, AudioReactiveState } from '../types';
import {
  Mic,
  MicOff,
  Volume2,
  Sliders,
  Play,
  Square,
  RefreshCw,
  Flame,
  Zap,
  Radio,
  Waves,
} from 'lucide-react';

interface AudioSettingsPanelProps {
  config: AudioConfig;
  audioState: AudioReactiveState;
  devices: MediaDeviceInfo[];
  permissionError: string | null;
  isTestAudioPlaying: boolean;
  testAudioMode: 'voice-synth' | 'dragon-roar' | 'cyber-beat';
  onUpdateConfig: (newConfig: Partial<AudioConfig>) => void;
  onStartListening: (deviceId?: string) => void;
  onStopListening: () => void;
  onPlayTestAudio: (mode: 'voice-synth' | 'dragon-roar' | 'cyber-beat') => void;
  onStopTestAudio: () => void;
  onRefreshDevices: () => void;
}

export function AudioSettingsPanel({
  config,
  audioState,
  devices,
  permissionError,
  isTestAudioPlaying,
  testAudioMode,
  onUpdateConfig,
  onStartListening,
  onStopListening,
  onPlayTestAudio,
  onStopTestAudio,
  onRefreshDevices,
}: AudioSettingsPanelProps) {
  return (
    <div className="flex flex-col gap-4 text-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className={`w-5 h-5 ${audioState.isListening ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
          <h3 className="font-orbitron text-sm font-semibold tracking-wider text-zinc-100 uppercase">
            Audio Input Sync
          </h3>
        </div>
        {audioState.isListening ? (
          <button
            onClick={onStopListening}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/40 transition-all cursor-pointer"
          >
            <MicOff className="w-3.5 h-3.5" />
            <span>MUTE MIC</span>
          </button>
        ) : (
          <button
            onClick={() => onStartListening(config.selectedDeviceId)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500 text-zinc-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>CONNECT MIC</span>
          </button>
        )}
      </div>

      {permissionError && (
        <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-mono">
          {permissionError} (Check browser microphone permission in address bar)
        </div>
      )}

      {/* Mic Gain & Sensitivity */}
      <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-3.5">
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>LIP-SYNC & RE-ACTIVITY TUNING</span>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-300 font-medium">Microphone Gain</span>
            <span className="font-mono text-zinc-400">{config.gain.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="4.0"
            step="0.1"
            value={config.gain}
            onChange={(e) => onUpdateConfig({ gain: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-300 font-medium">Jaw Opening Sensitivity</span>
            <span className="font-mono text-zinc-400">{config.jawMultiplier.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={config.jawMultiplier}
            onChange={(e) => onUpdateConfig({ jawMultiplier: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Built-in Test Sound Player */}
      <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>TEST AUDIO GENERATOR</span>
          </div>
          {isTestAudioPlaying && (
            <span className="text-[10px] font-mono text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/30 animate-pulse">
              PLAYING TEST SYNC
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              if (isTestAudioPlaying && testAudioMode === 'voice-synth') onStopTestAudio();
              else onPlayTestAudio('voice-synth');
            }}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              isTestAudioPlaying && testAudioMode === 'voice-synth'
                ? 'bg-cyan-500 text-zinc-950 border-cyan-400'
                : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {isTestAudioPlaying && testAudioMode === 'voice-synth' ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>Voice Synth</span>
          </button>
          <button
            onClick={() => {
              if (isTestAudioPlaying && testAudioMode === 'dragon-roar') onStopTestAudio();
              else onPlayTestAudio('dragon-roar');
            }}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              isTestAudioPlaying && testAudioMode === 'dragon-roar'
                ? 'bg-rose-500 text-white border-rose-400'
                : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {isTestAudioPlaying && testAudioMode === 'dragon-roar' ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>Dragon Roar</span>
          </button>
          <button
            onClick={() => {
              if (isTestAudioPlaying && testAudioMode === 'cyber-beat') onStopTestAudio();
              else onPlayTestAudio('cyber-beat');
            }}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              isTestAudioPlaying && testAudioMode === 'cyber-beat'
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {isTestAudioPlaying && testAudioMode === 'cyber-beat' ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>Cyber Beat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
