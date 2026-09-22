import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Video,
  Music,
  Sliders,
  Download,
  Play,
  RotateCcw,
  CheckCircle2,
  Film,
  Cpu,
  Eye,
  Wand2,
  X,
  Volume2,
  Image as ImageIcon,
  Copy,
  Check,
  Clapperboard,
  ArrowRight,
  Shield,
  Palette,
  Flame,
} from 'lucide-react';

interface SeedanceStudioPanelProps {
  onClose: () => void;
  onTriggerDragonAction?: (action: 'awaken' | 'beam' | 'shield' | 'save_world') => void;
}

export const SeedanceStudioPanel: React.FC<SeedanceStudioPanelProps> = ({
  onClose,
  onTriggerDragonAction,
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'character_sheet' | 'cdance_config' | 'export'>('pipeline');
  const [refImagesCount, setRefImagesCount] = useState(12);
  const [audioTrackCount, setAudioTrackCount] = useState(4);
  const [targetResolution, setTargetResolution] = useState<'1080p' | '4K'>('4K');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [copiedPromptIdx, setCopiedPromptIdx] = useState<number | null>(null);

  const promptTemplates = [
    {
      title: "Dragon 9 Core Ignition (Front View)",
      prompt: "Seedance 2.5 render: Cyber Dragon 9 front view, obsidian titanium scales, glowing cyan spine spikes, high-tech energy altar base, volumetric plasma sparks, 4k 60fps cinematic lighting",
    },
    {
      title: "Cosmic Beam Flight (Camera Trajectory)",
      prompt: "Low-angle camera orbit sweeping from dragon pedestal upwards as cosmic plasma beam ignites the sky, dramatic cinematic lighting, 4k 60fps",
    },
    {
      title: "Hexagonal Shield Salvation (3/4 Profile)",
      prompt: "Cyber Dragon 9 in 3/4 profile deploying a radiant hexagonal energy shield around Earth, golden 432Hz rune rings pulsing, epic space environment, 4k render",
    },
  ];

  const handleCopyPrompt = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptIdx(idx);
    setTimeout(() => setCopiedPromptIdx(null), 2000);
  };

  const handleRunExport = () => {
    setIsExporting(true);
    setExportProgress(0);
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 250);
  };

  return (
    <div className="flex flex-col gap-4 font-sans text-slate-100">
      {/* Header */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-amber-950/80 border border-cyan-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-orbitron font-bold text-cyan-200 tracking-wide">
              SEEDANCE 2.5 CARTOON PIPELINE
            </h3>
            <p className="text-[11px] text-cyan-400/80 font-mono">
              C Dance Multimodal Integration // Dragon 9 Studio
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[11px] font-mono font-bold">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
            activeTab === 'pipeline'
              ? 'bg-cyan-500 text-zinc-950 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Steps
        </button>
        <button
          onClick={() => setActiveTab('character_sheet')}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
            activeTab === 'character_sheet'
              ? 'bg-cyan-500 text-zinc-950 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Sheets
        </button>
        <button
          onClick={() => setActiveTab('cdance_config')}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
            activeTab === 'cdance_config'
              ? 'bg-cyan-500 text-zinc-950 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          C Dance
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
            activeTab === 'export'
              ? 'bg-cyan-500 text-zinc-950 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 space-y-4 text-xs font-sans">
        {activeTab === 'pipeline' && (
          <div className="space-y-3">
            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 space-y-1">
              <h4 className="font-semibold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                4-Step Cartoon Animation Pipeline
              </h4>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Seamlessly incorporate Seedance 2.5 via C Dance to animate Dragon 9 cartoon sequences with native 30s clips and up to 50 multimodal references.
              </p>
            </div>

            {/* Step 1 */}
            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-cyan-300 font-semibold font-mono">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Step 1: Character Sheets & Asset Locking
                </span>
                <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-cyan-400">
                  30 Refs
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Establish distinct front, side, and three-quarter angles for each Dragon 9 character to prevent identity drift across cuts.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-cyan-300 font-semibold font-mono">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Step 2: Storyboarding & Audio Timing
                </span>
                <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-cyan-400">
                  30s Clips
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Segment script into 30-second native generation windows. Prepare up to 10 independent audio/dialogue tracks for rhythm and pacing.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-cyan-300 font-semibold font-mono">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Step 3: C Dance Multimodal Config
                </span>
                <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-cyan-400">
                  50 Total Refs
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Load style guides, character sheets, and audio references into Seedance 2.5 in C Dance. Write precise motion and camera trajectory prompts.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-cyan-300 font-semibold font-mono">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Step 4: Extension & Pee Dub Export
                </span>
                <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-cyan-400">
                  4K Upscale
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Extend clips forward/backward to maintain continuity and finalize resolution for Pee Dub delivery.
              </p>
            </div>

            {/* Live Interactive Triggers */}
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <label className="text-[11px] font-bold font-mono text-zinc-300 block">
                Trigger Live Dragon Actions:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onTriggerDragonAction?.('awaken')}
                  className="px-2.5 py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-200 font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                  Awaken Dragon
                </button>
                <button
                  onClick={() => onTriggerDragonAction?.('beam')}
                  className="px-2.5 py-2 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  Plasma Beam
                </button>
                <button
                  onClick={() => onTriggerDragonAction?.('shield')}
                  className="px-2.5 py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Deploy Shield
                </button>
                <button
                  onClick={() => onTriggerDragonAction?.('save_world')}
                  className="px-2.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-amber-500 text-zinc-950 font-extrabold text-[11px] flex items-center justify-center gap-1 shadow-lg shadow-cyan-500/20 hover:brightness-110 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Save the World!
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'character_sheet' && (
          <div className="space-y-3">
            <h4 className="font-semibold text-cyan-300 flex items-center gap-1.5 font-mono">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              Dragon 9 Character Design Sheets
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Locked character design sheets to prevent identity and style drift across Seedance 2.5 cuts:
            </p>

            <div className="grid grid-cols-3 gap-2">
              <div className="aspect-square bg-zinc-950 rounded-xl border border-cyan-500/40 p-2 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold font-mono text-xs mb-1">
                  1
                </div>
                <span className="text-[11px] text-cyan-200 font-bold font-mono">Front View</span>
                <span className="text-[9px] text-zinc-500 font-mono">Ocular Lenses</span>
              </div>
              <div className="aspect-square bg-zinc-950 rounded-xl border border-pink-500/40 p-2 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-300 font-bold font-mono text-xs mb-1">
                  2
                </div>
                <span className="text-[11px] text-pink-200 font-bold font-mono">Side Profile</span>
                <span className="text-[9px] text-zinc-500 font-mono">Cyber Wings</span>
              </div>
              <div className="aspect-square bg-zinc-950 rounded-xl border border-emerald-500/40 p-2 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-bold font-mono text-xs mb-1">
                  3
                </div>
                <span className="text-[11px] text-emerald-200 font-bold font-mono">3/4 Angle</span>
                <span className="text-[9px] text-zinc-500 font-mono">Spine Array</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-zinc-300">Reference Tagging Count:</span>
                <span className="text-cyan-300 font-bold">{refImagesCount} / 30 images</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                value={refImagesCount}
                onChange={(e) => setRefImagesCount(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {activeTab === 'cdance_config' && (
          <div className="space-y-3 font-mono">
            <h4 className="font-semibold text-cyan-300 flex items-center gap-1.5 text-xs">
              <Sliders className="w-4 h-4 text-cyan-400" />
              C Dance Multimodal Configuration
            </h4>

            <div className="space-y-2">
              <label className="text-[11px] text-zinc-300 flex justify-between">
                <span>Audio Track Inputs (Pacing Sync):</span>
                <span className="text-cyan-400 font-bold">{audioTrackCount} / 10 tracks</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={audioTrackCount}
                onChange={(e) => setAudioTrackCount(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <span className="text-[11px] font-bold text-amber-300 block">
                Dragon 9 Prompt Templates:
              </span>

              {promptTemplates.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-zinc-300 font-bold">
                    <span>{item.title}</span>
                    <button
                      onClick={() => handleCopyPrompt(item.prompt, idx)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] transition cursor-pointer"
                    >
                      {copiedPromptIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
                      <span>{copiedPromptIdx === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-cyan-200 bg-zinc-900 p-2 rounded leading-relaxed">
                    {item.prompt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-3 font-mono">
            <h4 className="font-semibold text-cyan-300 flex items-center gap-1.5 text-xs">
              <Download className="w-4 h-4 text-cyan-400" />
              Pee Dub Resolution & Export
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 block">Resolution:</label>
                <div className="flex gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                  <button
                    onClick={() => setTargetResolution('1080p')}
                    className={`flex-1 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                      targetResolution === '1080p' ? 'bg-cyan-500 text-zinc-950' : 'text-zinc-400'
                    }`}
                  >
                    1080p
                  </button>
                  <button
                    onClick={() => setTargetResolution('4K')}
                    className={`flex-1 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                      targetResolution === '4K' ? 'bg-cyan-500 text-zinc-950' : 'text-zinc-400'
                    }`}
                  >
                    4K
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 block">Aspect Ratio:</label>
                <div className="flex gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                  <button
                    onClick={() => setAspectRatio('16:9')}
                    className={`flex-1 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                      aspectRatio === '16:9' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400'
                    }`}
                  >
                    16:9
                  </button>
                  <button
                    onClick={() => setAspectRatio('9:16')}
                    className={`flex-1 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                      aspectRatio === '9:16' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400'
                    }`}
                  >
                    9:16
                  </button>
                </div>
              </div>
            </div>

            {isExporting ? (
              <div className="space-y-1.5 p-3 rounded-lg bg-zinc-950 border border-cyan-500/30">
                <div className="flex justify-between text-[11px] text-cyan-300 font-bold">
                  <span>Exporting Pee Dub Package...</span>
                  <span>{exportProgress}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all duration-200"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={handleRunExport}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-amber-500 font-orbitron font-extrabold text-zinc-950 shadow-lg shadow-cyan-500/20 hover:brightness-110 flex items-center justify-center gap-2 transition cursor-pointer text-xs"
              >
                <Download className="w-4 h-4" />
                Render & Export Dragon 9 Package
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
