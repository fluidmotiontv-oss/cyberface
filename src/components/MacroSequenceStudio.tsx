import React, { useState, useEffect, useRef } from 'react';
import {
  GestureItem,
  DragonGestureType,
  DragonTheme,
  MacroSequence,
  MacroStep,
} from '../types';
import { DEFAULT_MACRO_PRESETS } from '../constants/macroPresets';
import {
  Play,
  Square,
  Disc,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Clock,
  Sparkles,
  Layers,
  Copy,
  Edit3,
  Save,
  RotateCcw,
  Check,
  Zap,
  Repeat,
  Activity,
  ArrowRight,
  Film,
  Sliders,
  CheckCircle2,
  X,
} from 'lucide-react';

interface MacroSequenceStudioProps {
  theme: DragonTheme;
  gestures: GestureItem[];
  activeGesture: DragonGestureType | null;
  gestureProgress: number;
  onTriggerGesture: (id: DragonGestureType) => void;
  onRecordingGestureTriggered?: (id: DragonGestureType) => void;
}

const STORAGE_KEY = 'dragon_cyber_macro_sequences_v1';

export function MacroSequenceStudio({
  theme,
  gestures,
  activeGesture,
  gestureProgress,
  onTriggerGesture,
}: MacroSequenceStudioProps) {
  // Saved / Custom sequences
  const [sequences, setSequences] = useState<MacroSequence[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to parse saved macro sequences:', err);
    }
    return DEFAULT_MACRO_PRESETS;
  });

  // Save sequences to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sequences));
    } catch (err) {
      console.warn('Failed to save macro sequences to localStorage:', err);
    }
  }, [sequences]);

  // Playback state
  const [playingSeqId, setPlayingSeqId] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [stepProgress, setStepProgress] = useState<number>(0);
  const [isLoopingOverride, setIsLoopingOverride] = useState<boolean>(false);

  // Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSteps, setRecordingSteps] = useState<MacroStep[]>([]);
  const [recordingName, setRecordingName] = useState<string>('');
  const [lastTriggerTime, setLastTriggerTime] = useState<number>(0);

  // Editor state
  const [editingSeq, setEditingSeq] = useState<MacroSequence | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);

  // Filter state
  const [filterTab, setFilterTab] = useState<'all' | 'custom' | 'presets'>('all');

  // Timer refs for playback execution
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const stepStartTimeRef = useRef<number>(0);
  const stepTotalDurationRef = useRef<number>(0);

  // Clean up playback timers on unmount
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Helper to get gesture metadata
  const getGestureInfo = (id: DragonGestureType) => {
    return gestures.find((g) => g.id === id) || {
      id,
      name: id,
      category: 'Kinetic',
      description: '',
      shortcutKey: '',
      shortcutLabel: '',
      durationMs: 2000,
    };
  };

  // Compute total duration of a macro sequence
  const calculateSequenceDuration = (seq: MacroSequence) => {
    return seq.steps.reduce((acc, step) => {
      const g = getGestureInfo(step.gestureId);
      return acc + g.durationMs + (step.delayMs || 0);
    }, 0);
  };

  // --- RECORDING HANDLERS ---
  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingSteps([]);
    setRecordingName(`Recorded Sequence #${sequences.filter((s) => !s.isPreset).length + 1}`);
    setLastTriggerTime(performance.now());
    if (playingSeqId) handleStopPlayback();
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    setRecordingSteps([]);
  };

  // Intercept gesture triggers when recording is active
  const handleTriggerWithRecording = (gestureId: DragonGestureType) => {
    const now = performance.now();

    if (isRecording) {
      const prevGesture = recordingSteps[recordingSteps.length - 1];
      let measuredDelay = 500; // default initial delay

      if (recordingSteps.length > 0 && prevGesture) {
        const prevInfo = getGestureInfo(prevGesture.gestureId);
        const elapsedSinceLast = now - lastTriggerTime;
        // Delay is the wait time AFTER the previous gesture finishes
        measuredDelay = Math.max(100, Math.min(5000, Math.round(elapsedSinceLast - prevInfo.durationMs)));
      }

      const newStep: MacroStep = {
        id: `rec-step-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        gestureId,
        delayMs: measuredDelay,
      };

      setRecordingSteps((prev) => [...prev, newStep]);
      setLastTriggerTime(now);
    }

    // Always trigger the actual gesture movement
    onTriggerGesture(gestureId);
  };

  const handleSaveRecordedSequence = () => {
    if (recordingSteps.length === 0) return;

    const newSeq: MacroSequence = {
      id: `macro-custom-${Date.now()}`,
      name: recordingName.trim() || 'Custom Macro Sequence',
      description: `${recordingSteps.length} movements recorded live`,
      isPreset: false,
      isLooping: false,
      createdAt: Date.now(),
      steps: recordingSteps,
    };

    setSequences((prev) => [newSeq, ...prev]);
    setIsRecording(false);
    setRecordingSteps([]);
  };

  // --- PLAYBACK ENGINE ---
  const handleStopPlayback = () => {
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    playbackTimerRef.current = null;
    animationFrameRef.current = null;
    setPlayingSeqId(null);
    setActiveStepIndex(-1);
    setStepProgress(0);
  };

  const executeStep = (seq: MacroSequence, stepIdx: number) => {
    if (stepIdx >= seq.steps.length) {
      // Reached end of sequence
      if (seq.isLooping || isLoopingOverride) {
        // Loop back to start
        executeStep(seq, 0);
      } else {
        handleStopPlayback();
      }
      return;
    }

    const currentStep = seq.steps[stepIdx];
    const gestureInfo = getGestureInfo(currentStep.gestureId);
    const gestureDuration = gestureInfo.durationMs;
    const delayDuration = currentStep.delayMs || 0;
    const totalStepMs = gestureDuration + delayDuration;

    setActiveStepIndex(stepIdx);
    setStepProgress(0);
    stepStartTimeRef.current = performance.now();
    stepTotalDurationRef.current = totalStepMs;

    // Trigger the gesture movement!
    onTriggerGesture(currentStep.gestureId);

    // Animate step progress bar smoothly
    const updateProgress = () => {
      const elapsed = performance.now() - stepStartTimeRef.current;
      const pct = Math.min(100, (elapsed / totalStepMs) * 100);
      setStepProgress(pct);

      if (elapsed < totalStepMs) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(updateProgress);

    // Schedule next step
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    playbackTimerRef.current = setTimeout(() => {
      executeStep(seq, stepIdx + 1);
    }, totalStepMs);
  };

  const handlePlaySequence = (seq: MacroSequence) => {
    if (playingSeqId === seq.id) {
      handleStopPlayback();
      return;
    }

    if (isRecording) setIsRecording(false);

    handleStopPlayback();
    setPlayingSeqId(seq.id);
    executeStep(seq, 0);
  };

  const handleToggleLoopSeq = (seqId: string) => {
    setSequences((prev) =>
      prev.map((s) => (s.id === seqId ? { ...s, isLooping: !s.isLooping } : s))
    );
  };

  // --- EDITOR / BUILDER HANDLERS ---
  const handleOpenEditor = (seq: MacroSequence) => {
    setEditingSeq(JSON.parse(JSON.stringify(seq)));
    setIsEditorOpen(true);
  };

  const handleCreateNewMacro = () => {
    const newSeq: MacroSequence = {
      id: `macro-custom-${Date.now()}`,
      name: `New Combo #${sequences.filter((s) => !s.isPreset).length + 1}`,
      description: 'Custom sequenced gestures with custom delays',
      isPreset: false,
      isLooping: false,
      createdAt: Date.now(),
      steps: [
        { id: `step-${Date.now()}-1`, gestureId: 'wing_stretch', delayMs: 500 },
        { id: `step-${Date.now()}-2`, gestureId: 'horn_charge', delayMs: 500 },
      ],
    };
    setEditingSeq(newSeq);
    setIsEditorOpen(true);
  };

  const handleSaveEditorSeq = () => {
    if (!editingSeq) return;

    setSequences((prev) => {
      const exists = prev.some((s) => s.id === editingSeq.id);
      if (exists) {
        return prev.map((s) => (s.id === editingSeq.id ? editingSeq : s));
      }
      return [editingSeq, ...prev];
    });

    setIsEditorOpen(false);
    setEditingSeq(null);
  };

  const handleDuplicateSequence = (seq: MacroSequence) => {
    const copy: MacroSequence = {
      ...JSON.parse(JSON.stringify(seq)),
      id: `macro-custom-${Date.now()}`,
      name: `${seq.name} (Copy)`,
      isPreset: false,
      createdAt: Date.now(),
    };
    setSequences((prev) => [copy, ...prev]);
  };

  const handleDeleteSequence = (seqId: string) => {
    setSequences((prev) => prev.filter((s) => s.id !== seqId));
    if (playingSeqId === seqId) handleStopPlayback();
  };

  const handleResetToPresets = () => {
    setSequences(DEFAULT_MACRO_PRESETS);
    localStorage.removeItem(STORAGE_KEY);
    handleStopPlayback();
  };

  // Filtered list
  const filteredSequences = sequences.filter((seq) => {
    if (filterTab === 'custom') return !seq.isPreset;
    if (filterTab === 'presets') return seq.isPreset;
    return true;
  });

  return (
    <div className="flex flex-col gap-4 text-slate-100">
      {/* MACRO SEQUENCE STUDIO HEADER */}
      <div className="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col gap-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-400 text-purple-300 shadow-lg shadow-purple-500/20">
              <Film className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-orbitron font-extrabold text-sm tracking-wider uppercase text-zinc-100 flex items-center gap-2">
                <span>MACRO SEQUENCE ENGINE</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  CHOREOGRAPHY
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Record & play back multi-gesture combos with frame-accurate delay timing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="px-3 py-1.5 text-xs font-orbitron font-bold uppercase rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 border border-rose-400 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Disc className="w-4 h-4 text-white animate-pulse" />
                <span>RECORD MACRO</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStopRecording}
                  className="px-3 py-1.5 text-xs font-orbitron font-bold uppercase rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 border border-amber-300 transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/30"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>STOP REC ({recordingSteps.length} STEPS)</span>
                </button>
                <button
                  onClick={handleCancelRecording}
                  className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700 cursor-pointer"
                  title="Discard Recording"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={handleCreateNewMacro}
              className="px-3 py-1.5 text-xs font-orbitron font-bold uppercase rounded-xl bg-cyan-600/30 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-400/50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>NEW COMBO</span>
            </button>
          </div>
        </div>

        {/* LIVE RECORDING HUD BAR */}
        {isRecording && (
          <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-500/50 flex flex-col gap-2 animate-fadeIn shadow-lg shadow-rose-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-orbitron font-bold text-rose-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="uppercase tracking-wider">LIVE RECORDING IN PROGRESS</span>
                <span className="text-[11px] font-mono font-normal text-rose-200/80">
                  (Trigger gestures using hotkeys 1-8 or buttons below)
                </span>
              </div>
              <span className="text-xs font-mono text-rose-300 font-bold px-2 py-0.5 rounded bg-rose-500/20 border border-rose-400/40">
                {recordingSteps.length} MOVEMENT{recordingSteps.length === 1 ? '' : 'S'} CAPTURED
              </span>
            </div>

            {/* Live Captured Step Chips Timeline */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 min-h-[42px] scrollbar-thin scrollbar-thumb-zinc-700">
              {recordingSteps.length === 0 ? (
                <span className="text-xs text-rose-300/60 font-mono italic">
                  Waiting for first gesture trigger... Click any gesture card or press keys 1-8
                </span>
              ) : (
                recordingSteps.map((step, idx) => {
                  const info = getGestureInfo(step.gestureId);
                  return (
                    <div key={step.id} className="flex items-center gap-1.5 shrink-0">
                      <div className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-rose-400/60 flex items-center gap-1.5 text-xs font-mono text-zinc-200">
                        <span className="font-bold text-rose-400">#{idx + 1}</span>
                        <span>{info.name}</span>
                        {idx > 0 && (
                          <span className="text-[10px] text-zinc-400 font-sans">
                            (+{(step.delayMs / 1000).toFixed(1)}s delay)
                          </span>
                        )}
                      </div>
                      {idx < recordingSteps.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-rose-400/60" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Recording Finalize Form */}
            {recordingSteps.length > 0 && (
              <div className="flex items-center gap-2 pt-1 border-t border-rose-500/30 mt-1">
                <input
                  type="text"
                  value={recordingName}
                  onChange={(e) => setRecordingName(e.target.value)}
                  placeholder="Macro Sequence Title..."
                  className="flex-1 bg-zinc-950 border border-rose-500/40 rounded-lg px-2.5 py-1 text-xs text-zinc-100 font-mono focus:outline-none focus:border-rose-400"
                />
                <button
                  onClick={handleSaveRecordedSequence}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-orbitron text-xs font-bold uppercase rounded-lg border border-emerald-300 transition flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>SAVE MACRO</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ACTIVE PLAYBACK HUD BAR */}
        {playingSeqId && (
          <div className="p-3.5 bg-purple-950/40 rounded-xl border border-purple-400/50 flex flex-col gap-2 shadow-lg shadow-purple-500/10 animate-fadeIn">
            {(() => {
              const currentSeq = sequences.find((s) => s.id === playingSeqId);
              if (!currentSeq) return null;
              const currentStep = currentSeq.steps[activeStepIndex];
              const currentInfo = currentStep ? getGestureInfo(currentStep.gestureId) : null;

              return (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-orbitron font-bold text-purple-300 uppercase tracking-wider">
                      <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
                      <span>PLAYING: {currentSeq.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 font-mono border border-purple-400/30">
                        STEP {activeStepIndex + 1} / {currentSeq.steps.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsLoopingOverride(!isLoopingOverride)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 border transition cursor-pointer ${
                          isLoopingOverride || currentSeq.isLooping
                            ? 'bg-purple-500/30 border-purple-400 text-purple-300'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <Repeat className="w-3 h-3" />
                        <span>{isLoopingOverride || currentSeq.isLooping ? 'LOOPING ON' : 'LOOP OFF'}</span>
                      </button>

                      <button
                        onClick={handleStopPlayback}
                        className="px-2.5 py-1 bg-rose-500 hover:bg-rose-400 text-white font-orbitron text-[10px] font-bold uppercase rounded-lg border border-rose-300 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        <span>HALT</span>
                      </button>
                    </div>
                  </div>

                  {/* Active Step Progress & Movement Info */}
                  <div className="flex items-center justify-between text-xs font-mono text-purple-200">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
                      <span>{currentInfo ? currentInfo.name : 'Initializing...'}</span>
                    </span>
                    <span className="text-[11px] text-purple-300/80">
                      Step Progress: {Math.round(stepProgress)}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-purple-500/30">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 transition-all duration-75"
                      style={{ width: `${stepProgress}%` }}
                    />
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* QUICK GESTURE DIRECT TRIGGER BAR FOR RECORDING */}
        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-orbitron font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>QUICK GESTURE TRIGGER STRIP</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {isRecording ? '🔴 Click to record movements live into timeline' : 'Click to trigger or test individual gestures'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5">
            {gestures.map((g) => {
              const isActive = activeGesture === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => handleTriggerWithRecording(g.id)}
                  className={`p-2 rounded-lg text-left border transition flex flex-col justify-between gap-1 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-zinc-950 border-amber-300 shadow-md font-bold'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800 hover:border-zinc-700'
                  }`}
                  title={`Trigger ${g.name} (Key [${g.shortcutLabel}])`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-zinc-950/60 text-amber-300 font-bold">
                      [{g.shortcutLabel}]
                    </span>
                    <span className="text-[9px] text-zinc-400 font-mono">{(g.durationMs / 1000).toFixed(1)}s</span>
                  </div>
                  <span className="text-[10px] font-orbitron font-bold truncate leading-tight mt-0.5">
                    {g.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FILTER TABS & MACRO LIBRARY GRID */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1 rounded-lg font-mono transition cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-purple-500 text-zinc-950 font-bold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Macros ({sequences.length})
            </button>
            <button
              onClick={() => setFilterTab('custom')}
              className={`px-3 py-1 rounded-lg font-mono transition cursor-pointer ${
                filterTab === 'custom'
                  ? 'bg-purple-500 text-zinc-950 font-bold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Custom Saved ({sequences.filter((s) => !s.isPreset).length})
            </button>
            <button
              onClick={() => setFilterTab('presets')}
              className={`px-3 py-1 rounded-lg font-mono transition cursor-pointer ${
                filterTab === 'presets'
                  ? 'bg-purple-500 text-zinc-950 font-bold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Presets ({sequences.filter((s) => s.isPreset).length})
            </button>
          </div>

          <button
            onClick={handleResetToPresets}
            className="text-xs font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
            title="Reset sequences to default presets"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Presets</span>
          </button>
        </div>

        {/* SEQUENCE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredSequences.map((seq) => {
            const isPlaying = playingSeqId === seq.id;
            const totalDurationSec = (calculateSequenceDuration(seq) / 1000).toFixed(1);

            return (
              <div
                key={seq.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative overflow-hidden ${
                  isPlaying
                    ? 'bg-zinc-900 border-purple-400 ring-2 ring-purple-500/40 shadow-xl shadow-purple-500/20'
                    : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Card Top Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-orbitron font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                        <span>{seq.name}</span>
                      </h4>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase border ${
                          seq.isPreset
                            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {seq.isPreset ? 'Preset' : 'Custom'}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{seq.description}</p>
                  </div>

                  {/* Actions dropdown / buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleLoopSeq(seq.id)}
                      className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                        seq.isLooping
                          ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                      }`}
                      title={seq.isLooping ? 'Looping enabled' : 'Click to enable looping'}
                    >
                      <Repeat className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditor(seq)}
                      className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition cursor-pointer"
                      title="Edit Sequence & Delays"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicateSequence(seq)}
                      className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition cursor-pointer"
                      title="Duplicate Sequence"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {!seq.isPreset && (
                      <button
                        onClick={() => handleDeleteSequence(seq.id)}
                        className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                        title="Delete Custom Macro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Timeline Chain Pills Visualizer */}
                <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-purple-400" />
                      <span>{seq.steps.length} MOVEMENTS</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>EST. TOTAL: {totalDurationSec}s</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-zinc-800">
                    {seq.steps.map((step, idx) => {
                      const info = getGestureInfo(step.gestureId);
                      const isStepActive = isPlaying && activeStepIndex === idx;

                      return (
                        <React.Fragment key={step.id}>
                          <div
                            className={`px-2 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1 shrink-0 transition-all ${
                              isStepActive
                                ? 'bg-purple-500 text-zinc-950 font-bold border-purple-300 shadow-lg shadow-purple-500/30 scale-105 animate-pulse'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                            }`}
                          >
                            <span className="text-[9px] opacity-70">#{idx + 1}</span>
                            <span>{info.name}</span>
                          </div>

                          {idx < seq.steps.length - 1 && (
                            <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-500 shrink-0">
                              <ArrowRight className="w-3 h-3 text-zinc-600" />
                              <span className="px-1 py-0.2 bg-zinc-900 rounded border border-zinc-800 text-cyan-400">
                                +{(step.delayMs / 1000).toFixed(1)}s
                              </span>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Play Sequence Button */}
                <button
                  onClick={() => handlePlaySequence(seq)}
                  className={`w-full py-2.5 px-3 rounded-xl font-orbitron text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition cursor-pointer border ${
                    isPlaying
                      ? 'bg-purple-500 text-zinc-950 border-purple-300 shadow-lg shadow-purple-500/20'
                      : 'bg-zinc-950 hover:bg-purple-500/20 hover:border-purple-400/50 text-purple-300 border-zinc-800'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>HALT MACRO SEQUENCE</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>PLAY MACRO SEQUENCE</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* MACRO SEQUENCE STEP EDITOR MODAL / PANEL */}
      {isEditorOpen && editingSeq && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-zinc-900 border border-purple-500/40 rounded-2xl shadow-2xl p-5 flex flex-col gap-4 text-zinc-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400 text-purple-300">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-orbitron font-extrabold text-sm uppercase text-zinc-100">
                    MACRO SEQUENCE TIMELINE EDITOR
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Reorder movements and adjust individual delay pauses between steps
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Description Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono text-zinc-300">Macro Sequence Title</label>
                <input
                  type="text"
                  value={editingSeq.name}
                  onChange={(e) => setEditingSeq({ ...editingSeq, name: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono text-zinc-300">Description / Log</label>
                <input
                  type="text"
                  value={editingSeq.description}
                  onChange={(e) => setEditingSeq({ ...editingSeq, description: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            {/* Steps Timeline Builder */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs font-orbitron font-bold uppercase text-purple-300">
                <span>MOVEMENT SEQUENCE TIMELINE ({editingSeq.steps.length} STEPS)</span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  TOTAL ESTIMATED DURATION: {(calculateSequenceDuration(editingSeq) / 1000).toFixed(1)}s
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {editingSeq.steps.map((step, idx) => {
                  const gestureInfo = getGestureInfo(step.gestureId);

                  return (
                    <div
                      key={step.id}
                      className="p-3 bg-zinc-950/90 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                    >
                      {/* Step Number & Gesture Select */}
                      <div className="flex items-center gap-2.5 flex-1">
                        <span className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>

                        <select
                          value={step.gestureId}
                          onChange={(e) => {
                            const newGestureId = e.target.value as DragonGestureType;
                            const updatedSteps = [...editingSeq.steps];
                            updatedSteps[idx] = { ...step, gestureId: newGestureId };
                            setEditingSeq({ ...editingSeq, steps: updatedSteps });
                          }}
                          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-purple-400 cursor-pointer"
                        >
                          {gestures.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name} ({(g.durationMs / 1000).toFixed(1)}s)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Adjustable Delay Input & Controls */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-lg border border-zinc-800 text-xs font-mono">
                          <Clock className="w-3.5 h-3.5 text-cyan-400 ml-1" />
                          <span className="text-zinc-400 text-[11px]">Delay After:</span>
                          <input
                            type="number"
                            min="0"
                            max="5000"
                            step="100"
                            value={step.delayMs}
                            onChange={(e) => {
                              const delay = Math.max(0, parseInt(e.target.value) || 0);
                              const updatedSteps = [...editingSeq.steps];
                              updatedSteps[idx] = { ...step, delayMs: delay };
                              setEditingSeq({ ...editingSeq, steps: updatedSteps });
                            }}
                            className="w-16 bg-zinc-950 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-amber-300 font-bold font-mono focus:outline-none"
                          />
                          <span className="text-zinc-400 text-[10px] mr-1">ms</span>
                        </div>

                        {/* Step Order & Delete Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            disabled={idx === 0}
                            onClick={() => {
                              const updatedSteps = [...editingSeq.steps];
                              const temp = updatedSteps[idx];
                              updatedSteps[idx] = updatedSteps[idx - 1];
                              updatedSteps[idx - 1] = temp;
                              setEditingSeq({ ...editingSeq, steps: updatedSteps });
                            }}
                            className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            disabled={idx === editingSeq.steps.length - 1}
                            onClick={() => {
                              const updatedSteps = [...editingSeq.steps];
                              const temp = updatedSteps[idx];
                              updatedSteps[idx] = updatedSteps[idx + 1];
                              updatedSteps[idx + 1] = temp;
                              setEditingSeq({ ...editingSeq, steps: updatedSteps });
                            }}
                            className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            disabled={editingSeq.steps.length <= 1}
                            onClick={() => {
                              const updatedSteps = editingSeq.steps.filter((_, i) => i !== idx);
                              setEditingSeq({ ...editingSeq, steps: updatedSteps });
                            }}
                            className="p-1 rounded bg-zinc-900 hover:bg-rose-500/20 border border-zinc-800 text-rose-400 hover:text-rose-300 disabled:opacity-30 cursor-pointer"
                            title="Remove Step"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Step Button */}
              <button
                onClick={() => {
                  const newStep: MacroStep = {
                    id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                    gestureId: 'wing_stretch',
                    delayMs: 500,
                  };
                  setEditingSeq({ ...editingSeq, steps: [...editingSeq.steps, newStep] });
                }}
                className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 text-purple-300 border border-dashed border-purple-500/40 hover:border-purple-400 rounded-xl font-orbitron text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>ADD MOVEMENT TO SEQUENCE</span>
              </button>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <button
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-orbitron text-xs font-bold uppercase cursor-pointer"
              >
                CANCEL
              </button>

              <button
                onClick={handleSaveEditorSeq}
                className="px-5 py-2 bg-purple-500 hover:bg-purple-400 text-zinc-950 rounded-xl font-orbitron text-xs font-bold uppercase border border-purple-300 shadow-lg shadow-purple-500/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>SAVE MACRO SEQUENCE</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
