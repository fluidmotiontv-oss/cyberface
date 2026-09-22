import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Volume2,
  Play,
  Square,
  Wand2,
  RefreshCw,
  Radio,
  Sliders,
  Flame,
  CheckCircle2,
  Bot,
  Clapperboard,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import {
  globalAudio432Pipeline,
  DRAGON_VOICE_PRESETS,
  PRESET_SCRIPT_LIBRARY,
  VoicePreset,
} from '../utils/audio432Processor';
import { AudioReactiveState, DragonTheme, SeedanceScript } from '../types';

interface DragonTalkStudioProps {
  theme: DragonTheme;
  audioState: AudioReactiveState;
  onSetExpression?: (expr: any) => void;
}

export const DragonTalkStudio: React.FC<DragonTalkStudioProps> = ({
  theme,
  audioState,
  onSetExpression,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<VoicePreset>(DRAGON_VOICE_PRESETS[0]);
  const [is432Tuned, setIs432Tuned] = useState(true);
  const [customText, setCustomPrompt] = useState(DRAGON_VOICE_PRESETS[0].avatarVoicePrompt);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // AI Speech & Script Generation States
  const [aiTopic, setAiTopic] = useState('');
  const [isGeneratingAiSpeech, setIsGeneratingAiSpeech] = useState(false);
  const [scriptPrompt, setScriptPrompt] = useState('Cyber dragon wakes and saves the world');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<SeedanceScript | null>(null);
  const [activeScriptStep, setActiveScriptStep] = useState(0);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Toggle 432Hz Tuning
  const handleToggle432 = (enable: boolean) => {
    setIs432Tuned(enable);
    globalAudio432Pipeline.setTuning432(enable);
  };

  // Trigger Dragon Speech
  const handlePlayVoiceLine = (textToSpeak: string) => {
    if (isPlaying) {
      globalAudio432Pipeline.stopPlayback();
      setIsPlaying(false);
      onSetExpression?.('idle');
      return;
    }

    setIsPlaying(true);
    onSetExpression?.('talk');

    globalAudio432Pipeline.speakVoiceLine(
      textToSpeak,
      selectedVoice,
      () => {
        setIsPlaying(true);
        onSetExpression?.('talk');
      },
      () => {
        setIsPlaying(false);
        onSetExpression?.('idle');
      }
    );
  };

  // Generate Dragon Speech via Server-Side Gemini API
  const handleGenerateAiSpeech = async () => {
    setIsGeneratingAiSpeech(true);
    try {
      const res = await fetch('/api/dragon/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic || 'Cyber Dragon awakening proclamation' }),
      });
      const data = await res.json();
      if (data && data.text) {
        setCustomPrompt(data.text);
        handlePlayVoiceLine(data.text);
      } else {
        throw new Error('No text returned');
      }
    } catch (err) {
      console.warn('Network or API issue, using offline Dragon 9 speech synthesis:', err);
      const fallbackText = "I am Dragon 9 Prime Overlord. Frequencies locked to 432Hz golden harmonic flow.";
      setCustomPrompt(fallbackText);
      handlePlayVoiceLine(fallbackText);
    } finally {
      setIsGeneratingAiSpeech(false);
    }
  };

  // Generate Seedance 2.5 Episode Script via Server-Side Gemini API
  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    try {
      const res = await fetch('/api/dragon/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: scriptPrompt || 'Cyber dragon wakes and saves the world',
          episodeType: 'Action Climax',
          durationSeconds: 30,
        }),
      });
      const data = await res.json();
      if (data && data.script) {
        setGeneratedScript(data.script);
        setActiveScriptStep(0);
      } else {
        throw new Error('No script returned');
      }
    } catch (err) {
      console.warn('Network or API issue, loading offline default Seedance 2.5 script:', err);
      setGeneratedScript({
        title: "Cyber Dragon 9: Awakening & Seedance 2.5 Pipeline",
        logline: "When dark energy threatens the cyber grid, Dragon 9 ignites its 432Hz plasma core to restore universal harmony.",
        scenes: [
          {
            step: 1,
            title: "Step 1: Character Sheets & Asset Prep",
            cameraPrompt: "Cyber Dragon 9 front and 3/4 angle character sheet, obsidian cybernetics, glowing cyan spine spikes, 4K render",
            action: "Dragon 9 slumbers on the holographic pedestal, blue runes pulsing gently at 432Hz.",
            audioSyncTrack: "Sub-bass 40Hz rumble with 432Hz carrier tone"
          },
          {
            step: 2,
            title: "Step 2: Storyboarding & Audio Sync",
            cameraPrompt: "Cinematic wide tracking shot of Dragon 9 spreading energy wings, volumetric plasma sparks, 30s native window",
            action: "Core engine ignites! Cyber Dragon opens laser ocular lenses and speaks with thunderous resonance.",
            audioSyncTrack: "Voice dialogue track 1: 'Frequencies locked to universal flow!'"
          },
          {
            step: 3,
            title: "Step 3: C Dance Multimodal Execution",
            cameraPrompt: "Low-angle camera orbit following cosmic plasma beam piercing storm clouds, saving the metropolis",
            action: "Cosmic plasma beam destroys void corruption, deploying a radiant hexagonal energy shield around Earth.",
            audioSyncTrack: "Peak orchestral synth crescendo with rhythmic sub-bass pulse"
          },
          {
            step: 4,
            title: "Step 4: Extension & Pee Dub Export",
            cameraPrompt: "360 orbit camera around Cyber Dragon hovering victoriously over restored digital city",
            action: "Dragon 9 roars in triumph as light spreads across the global network, securing peace.",
            audioSyncTrack: "Triumphant cyber fanfare fading into peaceful 432Hz ambient chimes"
          }
        ]
      });
      setActiveScriptStep(0);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleCopyCameraPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 font-sans text-slate-100">
      {/* 1. Header & 432Hz Tuning Selector */}
      <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="p-1.5 rounded-lg border text-xs"
              style={{
                backgroundColor: `${theme.primary}20`,
                borderColor: theme.primary,
                color: theme.energy,
              }}
            >
              <MessageSquare className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="font-orbitron font-bold text-xs text-zinc-100 flex items-center gap-2">
                <span>AI VOICE SYNTH & TALKING DRAGON</span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase transition-all ${
                    is432Tuned
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {is432Tuned ? '432Hz GOLDEN TUNING' : '440Hz STANDARD'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Gemini AI Prompting + 60FPS Real-Time Jaw Articulation
              </p>
            </div>
          </div>

          {/* 432Hz / 440Hz Switch */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-[11px] font-mono">
            <button
              onClick={() => handleToggle432(true)}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer font-bold ${
                is432Tuned
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              432Hz
            </button>
            <button
              onClick={() => handleToggle432(false)}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                !is432Tuned
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              440Hz
            </button>
          </div>
        </div>
      </div>

      {/* 2. AI Prompting: Ask Gemini to generate dragon speech live */}
      <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-cyan-500/30 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>GEMINI AI DRAGON SPEECH GENERATOR</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            SERVER-SIDE API
          </span>
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Type any topic or command to generate custom Cyber Dragon dialogue powered by Gemini AI with live lip-sync & plasma effects:
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateAiSpeech()}
            placeholder="e.g. Awakening the 432Hz core to save Earth..."
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 focus:border-cyan-500 focus:outline-none"
          />
          <button
            onClick={handleGenerateAiSpeech}
            disabled={isGeneratingAiSpeech}
            className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition shadow-lg shadow-cyan-500/20"
          >
            {isGeneratingAiSpeech ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
            <span>AI Speak</span>
          </button>
        </div>
      </div>

      {/* 3. Text & Speech Input & Live Speak Controller */}
      <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-300">
          <span className="font-bold flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            Current Speech Line Text
          </span>
          <span className="text-[10px] text-zinc-500">
            {audioState.isSpeaking ? '  LIP SYNC ACTIVE' : '  STANDBY'}
          </span>
        </div>

        <textarea
          rows={3}
          value={customText}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Enter custom narration or dragon voice line..."
          className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono focus:outline-none focus:border-cyan-500 transition-all resize-none"
        />

        <button
          onClick={() => handlePlayVoiceLine(customText)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-orbitron font-bold text-xs transition-all cursor-pointer uppercase ${
            isPlaying
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/40'
              : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-lg shadow-cyan-500/30'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>HALT DRAGON SPEECH</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>SPEAK LIVE WITH 432Hz LIP SYNC</span>
            </>
          )}
        </button>
      </div>

      {/* 4. Select Cyber Voice Timbre */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-rajdhani font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          Select Cyber Dragon Voice Timbre
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DRAGON_VOICE_PRESETS.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                setSelectedVoice(v);
                setCustomPrompt(v.avatarVoicePrompt);
              }}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col gap-1 ${
                selectedVoice.id === v.id
                  ? 'bg-zinc-900 border-cyan-500/80 shadow-md shadow-cyan-500/20'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-orbitron font-bold text-xs text-zinc-100">
                  {v.name}
                </span>
                {selectedVoice.id === v.id && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                )}
              </div>
              <div className="text-[10px] text-cyan-300 font-mono">{v.title}</div>
              <p className="text-[10px] text-zinc-400 leading-tight line-clamp-2">
                {v.character}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Seedance 2.5 AI Episode Script Generator */}
      <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
            <Clapperboard className="w-4 h-4 text-amber-400" />
            <span>SEEDANCE 2.5 CARTOON SCRIPT GENERATOR</span>
          </div>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
            30s NATIVE CLIP
          </span>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
          Generate an AI cartoon episode script with Seedance 2.5 camera prompts, character action, and audio sync tracks:
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={scriptPrompt}
            onChange={(e) => setScriptPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateScript()}
            placeholder="e.g. Cyber dragon wakes and saves the world..."
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 focus:border-amber-500 focus:outline-none"
          />
          <button
            onClick={handleGenerateScript}
            disabled={isGeneratingScript}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition shadow-lg shadow-amber-500/20"
          >
            {isGeneratingScript ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Generate Script</span>
          </button>
        </div>

        {/* Display Generated Script */}
        {generatedScript && (
          <div className="flex flex-col gap-2.5 pt-2 border-t border-zinc-800">
            <div className="p-2.5 bg-zinc-950 rounded-lg border border-amber-500/40 space-y-1">
              <span className="text-[10px] font-mono text-amber-400 block font-bold">
                {generatedScript.title}
              </span>
              <p className="text-[11px] text-zinc-300 italic">
                "{generatedScript.logline}"
              </p>
            </div>

            {/* Scene Step Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {generatedScript.scenes.map((scene, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveScriptStep(idx)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono whitespace-nowrap transition cursor-pointer ${
                    activeScriptStep === idx
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Step {scene.step}
                </button>
              ))}
            </div>

            {/* Active Scene Detail */}
            {generatedScript.scenes[activeScriptStep] && (
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex flex-col gap-2 text-xs font-mono">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span>{generatedScript.scenes[activeScriptStep].title}</span>
                  <button
                    onClick={() => handleCopyCameraPrompt(generatedScript.scenes[activeScriptStep].cameraPrompt)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] transition cursor-pointer"
                  >
                    {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-400" />}
                    <span>{copiedPrompt ? 'Copied' : 'Copy Prompt'}</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 block">Seedance 2.5 Camera Prompt:</span>
                  <p className="p-2 bg-zinc-900 rounded text-[11px] text-cyan-200 leading-relaxed">
                    {generatedScript.scenes[activeScriptStep].cameraPrompt}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 block">Character Action:</span>
                  <p className="text-[11px] text-zinc-300 font-sans">
                    {generatedScript.scenes[activeScriptStep].action}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 block">Audio Sync Track:</span>
                  <p className="text-[10px] text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-800/40">
                      {generatedScript.scenes[activeScriptStep].audioSyncTrack}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
