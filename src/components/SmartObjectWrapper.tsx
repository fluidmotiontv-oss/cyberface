import { useState } from 'react';
import { DragonTheme, AudioReactiveState } from '../types';
import { Code, Copy, Check, Sparkles, Box } from 'lucide-react';
import { WEB_COMPONENT_SOURCE_CODE } from '../web-component/cyber-dragon-avatar';

interface SmartObjectWrapperProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
}

export function SmartObjectWrapper({ theme }: SmartObjectWrapperProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(WEB_COMPONENT_SOURCE_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 text-slate-100 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="w-5 h-5 text-cyan-400" />
          <h3 className="font-orbitron text-sm font-semibold tracking-wider text-zinc-100 uppercase">
            HTML5 Web Component Smart Object
          </h3>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all cursor-pointer font-mono"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Source' : 'Copy Component'}</span>
        </button>
      </div>

      <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 text-xs font-mono">
        <span className="text-zinc-400 block">Usage in HTML:</span>
        <pre className="p-2.5 bg-zinc-900 rounded-lg text-cyan-300 overflow-x-auto text-[11px]">
          {`<cyber-dragon-avatar
  theme="cyber-neon"
  jaw-multiplier="1.4"
  width="100%"
  height="500px">
</cyber-dragon-avatar>`}
        </pre>
      </div>
    </div>
  );
}
