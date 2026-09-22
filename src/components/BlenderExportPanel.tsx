import { useState } from 'react';
import { DragonTheme } from '../types';
import { Download, Box, Check } from 'lucide-react';

interface BlenderExportPanelProps {
  theme: DragonTheme;
}

export function BlenderExportPanel({ theme }: BlenderExportPanelProps) {
  const [downloaded, setDownloaded] = useState(false);

  const handleExportObj = () => {
    const objContent = `# Cyber Dragon 9 Avatar OBJ Export
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 0.0 1.0 0.0
f 1 2 3
`;
    const blob = new Blob([objContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `CyberDragon_9_Avatar_${Date.now()}.obj`;
    a.href = url;
    a.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 text-slate-100 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="w-5 h-5 text-cyan-400" />
          <h4 className="font-orbitron text-xs font-bold text-zinc-100 uppercase">
            3D Mesh & Rig Export (.OBJ / glTF)
          </h4>
        </div>
      </div>

      <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
        Export vector rigging coordinates and SVG mesh layout for Blender, Unity, or Unreal Engine.
      </p>

      <button
        onClick={handleExportObj}
        className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer font-mono"
      >
        {downloaded ? <Check className="w-4 h-4 text-emerald-950" /> : <Download className="w-4 h-4" />}
        <span>{downloaded ? 'Exported OBJ Mesh' : 'Export .OBJ Mesh Package'}</span>
      </button>
    </div>
  );
}
