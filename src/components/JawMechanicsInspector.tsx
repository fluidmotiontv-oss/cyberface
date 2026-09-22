import { useState } from 'react';
import { AudioReactiveState, DragonTheme } from '../types';
import { Activity, Copy, Check, Code, Cpu } from 'lucide-react';
import { JAW_MECHANICS_STANDALONE_SNIPPET } from '../utils/jawAudioEngineSnippet';

interface JawMechanicsInspectorProps {
  audioState: AudioReactiveState;
  theme: DragonTheme;
}

export function JawMechanicsInspector({ audioState, theme }: JawMechanicsInspectorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(JAW_MECHANICS_STANDALONE_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const jawPx = Math.round(audioState.jawOpen * 42);
  const jawDeg = Math.round(audioState.jawOpen * 18);

  return (
    <div className="flex flex-col gap-4 text-slate-100 font-mono">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h3 className="font-orbitron text-sm font-semibold tracking-wider text-zinc-100 uppercase">
            60FPS Jaw Mechanics Telemetry
          </h3>
        </div>
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Engine' : 'Export Code'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-1">
          <span className="text-[10px] text-zinc-400">JAW OPEN %</span>
          <span className="text-lg font-bold text-cyan-300">{Math.round(audioState.jawOpen * 100)}%</span>
        </div>
        <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-1">
          <span className="text-[10px] text-zinc-400">PIXEL DROP</span>
          <span className="text-lg font-bold text-cyan-300">+{jawPx}px</span>
        </div>
        <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-1">
          <span className="text-[10px] text-zinc-400">PITCH ROTATE</span>
          <span className="text-lg font-bold text-cyan-300">{jawDeg}°</span>
        </div>
        <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-1">
          <span className="text-[10px] text-zinc-400">SPEECH FORMANT</span>
          <span className="text-lg font-bold text-cyan-300">{(audioState.speechFormant || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
