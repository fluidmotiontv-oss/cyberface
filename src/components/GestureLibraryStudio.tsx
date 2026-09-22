import React, { useState, useEffect } from 'react';
import { GestureItem, DragonGestureType, DragonTheme } from '../types';
import { DEFAULT_GESTURES } from '../constants/gestures';
import { MacroSequenceStudio } from './MacroSequenceStudio';
import {
  Hand,
  Keyboard,
  Sparkles,
  Zap,
  RotateCcw,
  Play,
  Activity,
  ShieldAlert,
  Wind,
  Compass,
  Check,
  Edit3,
  Film,
  Layers,
} from 'lucide-react';

interface GestureLibraryStudioProps {
  theme: DragonTheme;
  gestures: GestureItem[];
  activeGesture: DragonGestureType | null;
  gestureProgress: number; // 0..100
  onTriggerGesture: (id: DragonGestureType) => void;
  onUpdateGestures: (newGestures: GestureItem[]) => void;
  shortcutsEnabled: boolean;
  onToggleShortcuts: (enabled: boolean) => void;
}

export function GestureLibraryStudio({
  theme,
  gestures,
  activeGesture,
  gestureProgress,
  onTriggerGesture,
  onUpdateGestures,
  shortcutsEnabled,
  onToggleShortcuts,
}: GestureLibraryStudioProps) {
  const [studioSection, setStudioSection] = useState<'macro' | 'single'>('macro');
  const [rebindingId, setRebindingId] = useState<DragonGestureType | null>(null);

  // Key Rebinding Listener
  useEffect(() => {
    if (!rebindingId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Don't bindEscape or Alone Modifiers
      if (e.key === 'Escape') {
        setRebindingId(null);
        return;
      }
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

      const code = e.code; // e.g. 'KeyW', 'Digit1', 'Space'
      const label = e.key.length === 1 ? e.key.toUpperCase() : e.key;

      const updated = gestures.map((g) => {
        if (g.id === rebindingId) {
          return { ...g, shortcutKey: code, shortcutLabel: label };
        }
        return g;
      });

      onUpdateGestures(updated);
      setRebindingId(null);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [rebindingId, gestures, onUpdateGestures]);

  const handleResetDefaults = () => {
    onUpdateGestures(DEFAULT_GESTURES);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Kinetic':
        return 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300';
      case 'Combat':
        return 'bg-rose-500/15 border-rose-500/40 text-rose-300';
      case 'Aura':
        return 'bg-purple-500/15 border-purple-500/40 text-purple-300';
      default:
        return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300';
    }
  };

  return (
    <div className="flex flex-col gap-4 text-slate-100">
      {/* SECTION NAV TABS HEADER */}
      <div className="p-1.5 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex items-center justify-between gap-2 shadow-xl">
        <div className="grid grid-cols-2 gap-1.5 flex-1">
          <button
            onClick={() => setStudioSection('macro')}
            className={`py-2.5 px-3 rounded-xl font-orbitron text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer border ${
              studioSection === 'macro'
                ? 'bg-purple-500 text-zinc-950 border-purple-300 shadow-lg shadow-purple-500/20'
                : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border-zinc-800/80'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>MACRO SEQUENCES (COMBOS)</span>
          </button>

          <button
            onClick={() => setStudioSection('single')}
            className={`py-2.5 px-3 rounded-xl font-orbitron text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer border ${
              studioSection === 'single'
                ? 'bg-cyan-500 text-zinc-950 border-cyan-300 shadow-lg shadow-cyan-500/20'
                : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border-zinc-800/80'
            }`}
          >
            <Hand className="w-4 h-4" />
            <span>SINGLE GESTURES & HOTKEYS</span>
          </button>
        </div>
      </div>

      {/* MACRO SEQUENCE STUDIO SECTION */}
      {studioSection === 'macro' && (
        <MacroSequenceStudio
          theme={theme}
          gestures={gestures}
          activeGesture={activeGesture}
          gestureProgress={gestureProgress}
          onTriggerGesture={onTriggerGesture}
        />
      )}

      {/* SINGLE GESTURES LIBRARY SECTION */}
      {studioSection === 'single' && (
        <div className="flex flex-col gap-4">
          {/* Header Banner */}
          <div className="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20">
                  <Hand className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-orbitron font-extrabold text-sm tracking-wider uppercase text-zinc-100 flex items-center gap-2">
                    <span>GESTURE LIBRARY</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                      HOTKEY ANIMATIONS
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Assign keyboard shortcuts or click buttons to trigger Wing Stretch, Tail Whip, & Combat Stances
                  </p>
                </div>
              </div>

              <button
                onClick={handleResetDefaults}
                className="px-2.5 py-1 text-xs font-mono rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition flex items-center gap-1.5 cursor-pointer"
                title="Reset hotkeys to defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Global Keyboard Listener Switch */}
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Keyboard className="w-4 h-4 text-cyan-400" />
                <span className="font-medium text-zinc-200">Global Keyboard Shortcuts</span>
                <span className="text-[10px] text-zinc-500 hidden sm:inline">(Press 1-8 while streaming)</span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={shortcutsEnabled}
                  onChange={(e) => onToggleShortcuts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            {/* Active Gesture Live Indicator */}
            {activeGesture && (
              <div className="p-3 bg-cyan-950/40 rounded-xl border border-cyan-400/50 flex flex-col gap-1.5 shadow-lg shadow-cyan-500/10 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-orbitron font-bold text-cyan-300 flex items-center gap-2 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
                    <span>ACTIVE GESTURE: {gestures.find((g) => g.id === activeGesture)?.name || activeGesture}</span>
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">{Math.round(gestureProgress)}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-75"
                    style={{ width: `${gestureProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Gesture Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gestures.map((item) => {
              const isActive = activeGesture === item.id;
              const isRebinding = rebindingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative overflow-hidden ${
                    isActive
                      ? 'bg-zinc-800/95 border-cyan-400 ring-2 ring-cyan-500/40 shadow-xl shadow-cyan-500/20'
                      : 'bg-zinc-900/90 border-zinc-800/90 hover:border-zinc-700'
                  }`}
                >
                  {/* Category Badge & Rebind Button */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase border ${getCategoryColor(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>

                    <button
                      onClick={() => setRebindingId(isRebinding ? null : item.id)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 border transition cursor-pointer ${
                        isRebinding
                          ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold animate-pulse'
                          : 'bg-zinc-950/80 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                      title="Click to rebind shortcut key"
                    >
                      <Keyboard className="w-3 h-3" />
                      <span>{isRebinding ? 'Press Key...' : `Key [${item.shortcutLabel}]`}</span>
                    </button>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="font-orbitron text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                      <span>{item.name}</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{item.description}</p>
                  </div>

                  {/* Trigger Button */}
                  <button
                    onClick={() => onTriggerGesture(item.id)}
                    disabled={isActive}
                    className={`w-full py-2 px-3 rounded-xl font-orbitron text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition cursor-pointer border ${
                      isActive
                        ? 'bg-cyan-500 text-zinc-950 border-cyan-300 shadow-md'
                        : 'bg-zinc-950 hover:bg-cyan-500/20 hover:border-cyan-400/50 text-cyan-300 border-zinc-800'
                    } disabled:opacity-80`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isActive ? 'ANIMATING...' : 'TRIGGER GESTURE'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

