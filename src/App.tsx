import React, { useState, useEffect } from 'react';
import {
  DragonTheme,
  AudioConfig,
  ExpressionMode,
  StreamConfig,
  AvatarFlightMode,
  FlightPatternType,
  FlightPhysicsConfig,
  GestureItem,
  DragonGestureType,
} from './types';
import { DEFAULT_THEME, PRESET_THEMES } from './constants/themes';
import { DEFAULT_GESTURES } from './constants/gestures';
import { useAudioReactive } from './hooks/useAudioReactive';
import { CyberDragonAvatar } from './components/CyberDragonAvatar';
import { DragonTalkStudio } from './components/DragonTalkStudio';
import { SeedanceStudioPanel } from './components/SeedanceStudioPanel';
import { ThemeSelector } from './components/ThemeSelector';
import { AudioSettingsPanel } from './components/AudioSettingsPanel';
import { ExpressionController } from './components/ExpressionController';
import { StreamOverlayHUD } from './components/StreamOverlayHUD';
import { PlasmaFxController } from './components/PlasmaFxController';
import { GestureLibraryStudio } from './components/GestureLibraryStudio';
import { JawMechanicsInspector } from './components/JawMechanicsInspector';
import { CompanionFlightStudio } from './components/CompanionFlightStudio';
import { SmartObjectWrapper } from './components/SmartObjectWrapper';
import { BlenderExportPanel } from './components/BlenderExportPanel';
import { RecordingToolbar } from './components/RecordingToolbar';
import { ObsSetupGuideModal } from './components/ObsSetupGuideModal';
import { AmbientSoundscapeEngine } from './components/AmbientSoundscapeEngine';
import {
  Flame,
  Volume2,
  Tv,
  Palette,
  Bot,
  Clapperboard,
  Sliders,
  Plane,
  Sparkles,
  Maximize2,
  Minimize2,
  Radio,
  Cpu,
  Zap,
  Hand,
} from 'lucide-react';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<DragonTheme>(DEFAULT_THEME);
  const [expression, setExpression] = useState<ExpressionMode>('idle');
  const [activeTab, setActiveTab] = useState<'gestures' | 'talk' | 'plasma' | 'pipeline' | 'themes' | 'audio' | 'stream' | 'telemetry' | 'flight'>('gestures');
  const [isObsGuideOpen, setIsObsGuideOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [plasmaBurstCount, setPlasmaBurstCount] = useState(0);

  // Gesture state
  const [gestures, setGestures] = useState<GestureItem[]>(DEFAULT_GESTURES);
  const [activeGesture, setActiveGesture] = useState<DragonGestureType | null>(null);
  const [gestureProgress, setGestureProgress] = useState(0);
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true);

  // Trigger Gesture Handler
  const handleTriggerGesture = (id: DragonGestureType) => {
    const item = gestures.find((g) => g.id === id);
    const duration = item ? item.durationMs : 2000;

    setActiveGesture(id);
    setGestureProgress(0);

    const startTime = performance.now();
    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setGestureProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        setActiveGesture(null);
        setGestureProgress(0);
      }
    }, 30);
  };

  // Global Keyboard Shortcut Listener
  useEffect(() => {
    if (!shortcutsEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when typing inside input fields
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      const match = gestures.find((g) => g.shortcutKey === e.code);
      if (match) {
        e.preventDefault();
        handleTriggerGesture(match.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutsEnabled, gestures]);

  // Flight settings
  const [flightMode, setFlightMode] = useState<AvatarFlightMode>('docked');
  const [flightPattern, setFlightPattern] = useState<FlightPatternType>('infinity');
  const [flightSpeed, setFlightSpeed] = useState<number>(1.0);

  // Audio Config
  const [audioConfig, setAudioConfig] = useState<AudioConfig>({
    selectedDeviceId: '',
    gain: 1.8,
    noiseGate: 0.04,
    smoothing: 0.6,
    jawMultiplier: 1.4,
    roarThreshold: 0.55,
    beamEnabled: true,
    frequencyReactivity: 1.0,
    speechFormantWeight: 0.65,
    maxJawDropPx: 42,
    maxJawAngleDeg: 18,
    ambientSoundscapeEnabled: true,
    ambientSoundscapeVolume: 0.15,
  });

  // Stream Config
  const [streamConfig, setStreamConfig] = useState<StreamConfig>({
    overlayMode: 'app',
    avatarScale: 1.0,
    avatarX: 0,
    avatarY: 0,
    flipHorizontal: false,
    showStreamHud: true,
    showRunes: true,
    showInfinityAura: true,
    infinityFlowPreset: 'vortex',
    infinityFlowNoiseFloorSensitivity: 1.0,
    wingbeatVisualizer: true,
    showDragonBreath: true,
    dragonBreathIntensity: 1.0,
    glitchBurstOnRoar: true,
    showHolographicPedestal: true,
    showMatrixCodeRain: true,
    showEnergyDust: true,
    energyDustIntensity: 1.0,
    showPlasmaFx: true,
    plasmaPreset: 'cyan',
    plasmaIntensity: 1.2,
    plasmaArcFrequency: 1.0,
    plasmaCoreSize: 1.0,
    plasmaAudioReactivity: 1.0,
  });

  // Audio Reactive Hook
  const {
    audioState,
    devices,
    permissionError,
    isTestAudioPlaying,
    testAudioMode,
    startListening,
    stopListening,
    playTestAudio,
    stopTestAudio,
    refreshDevices,
  } = useAudioReactive(audioConfig);

  // Auto-connect mic on mount if allowed
  useEffect(() => {
    startListening();
  }, []);

  const handleUpdateAudioConfig = (newCfg: Partial<AudioConfig>) => {
    setAudioConfig((prev) => ({ ...prev, ...newCfg }));
  };

  const handleUpdateStreamConfig = (newCfg: Partial<StreamConfig>) => {
    setStreamConfig((prev) => ({ ...prev, ...newCfg }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Background style based on stream overlay mode
  let bgStyle = 'bg-zinc-950 text-slate-100';
  if (streamConfig.overlayMode === 'transparent') {
    bgStyle = 'bg-transparent text-slate-100';
  } else if (streamConfig.overlayMode === 'chroma') {
    if (streamConfig.chromaType === 'magenta') {
      bgStyle = 'bg-[#FF00FF] text-slate-100';
    } else {
      bgStyle = 'bg-[#00FF00] text-slate-100';
    }
  }

  return (
    <div className={`min-h-screen w-full flex flex-col font-sans relative overflow-x-hidden ${bgStyle}`}>
      {/* Headless Ambient 432Hz Soundscape Drone */}
      <AmbientSoundscapeEngine config={audioConfig} audioState={audioState} />

      {/* Top Header Bar */}
      {streamConfig.overlayMode === 'app' && (
        <header className="w-full bg-zinc-900/90 border-b border-zinc-800/80 px-4 py-2.5 flex items-center justify-between z-30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl border flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: `${currentTheme.primary}20`,
                borderColor: currentTheme.primary,
                color: currentTheme.energy,
              }}
            >
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-orbitron font-extrabold text-sm sm:text-base tracking-wider text-zinc-100">
                  CYBER DRAGON GUARDIAN
                </h1>
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider border"
                  style={{
                    backgroundColor: `${currentTheme.primary}15`,
                    borderColor: `${currentTheme.primary}40`,
                    color: currentTheme.energy,
                  }}
                >
                  SEEDANCE 2.5 // DRAGON 9
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono hidden sm:block">
                432Hz Golden Harmonic Speech Sync & Multimodal Animation Pipeline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlasmaBurstCount((prev) => prev + 1)}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 font-orbitron text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition cursor-pointer active:scale-95"
              title="Trigger Instant Plasma Shockwave Burst"
            >
              <Zap className="w-3.5 h-3.5 fill-cyan-300 text-cyan-300 animate-bounce" />
              <span className="hidden md:inline">PLASMA BURST</span>
            </button>
            <RecordingToolbar />
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
              title="Toggle Fullscreen Mode"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </header>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-0 relative overflow-hidden">
        {/* Left / Center Display Area: 3D Cyber Dragon Avatar */}
        <section
          className={`relative flex items-center justify-center p-4 min-h-[500px] lg:min-h-0 ${
            streamConfig.overlayMode === 'app' ? 'lg:col-span-7 xl:col-span-7' : 'w-full h-full'
          }`}
        >
          {/* Avatar Stage */}
          <CyberDragonAvatar
            theme={currentTheme}
            audioState={audioState}
            expression={expression}
            streamConfig={streamConfig}
            flightMode={flightMode}
            flightPattern={flightPattern}
            flightSpeed={flightSpeed}
            onRecall={() => setFlightMode('docked')}
            plasmaBurstCount={plasmaBurstCount}
            activeGesture={activeGesture}
          />

          {/* Quick Stance Emote Bar Overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-auto">
            <div className="max-w-xl mx-auto p-2 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl backdrop-blur-md shadow-2xl">
              <ExpressionController
                currentExpression={expression}
                onSetExpression={setExpression}
                theme={currentTheme}
                isRoaring={audioState.isRoaring}
              />
            </div>
          </div>
        </section>

        {/* Right Studio Control Dock */}
        {streamConfig.overlayMode === 'app' && (
          <section className="lg:col-span-5 xl:col-span-5 bg-zinc-950/95 border-l border-zinc-800/80 flex flex-col z-20 max-h-[calc(100vh-57px)] overflow-hidden">
            {/* Studio Navigation Tabs */}
            <div className="flex items-center overflow-x-auto bg-zinc-900/80 border-b border-zinc-800 p-1.5 gap-1 font-mono text-xs font-bold scrollbar-none">
              <button
                onClick={() => setActiveTab('gestures')}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'gestures'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-zinc-950 font-bold shadow-md shadow-purple-500/30'
                    : 'text-purple-300 hover:text-purple-100'
                }`}
              >
                <Hand className="w-3.5 h-3.5 fill-current" />
                <span>Gestures</span>
              </button>

              <button
                onClick={() => setActiveTab('plasma')}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'plasma'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/30'
                    : 'text-cyan-400 hover:text-cyan-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Plasma FX</span>
              </button>

              <button
                onClick={() => setActiveTab('talk')}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'talk'
                    ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AI Voice</span>
              </button>

              <button
                onClick={() => setActiveTab('pipeline')}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'pipeline'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Clapperboard className="w-3.5 h-3.5" />
                <span>Seedance 2.5</span>
              </button>

              <button
                onClick={() => setActiveTab('themes')}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'themes'
                    ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Themes</span>
              </button>

              <button
                onClick={() => setActiveTab('audio')}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'audio'
                    ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Mic Sync</span>
              </button>

              <button
                onClick={() => setActiveTab('stream')}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'stream'
                    ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>OBS Overlay</span>
              </button>

              <button
                onClick={() => setActiveTab('flight')}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'flight'
                    ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Plane className="w-3.5 h-3.5" />
                <span>Flight</span>
              </button>

              <button
                onClick={() => setActiveTab('telemetry')}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'telemetry'
                    ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Telemetry</span>
              </button>
            </div>

            {/* Studio Tab View Panel */}
            <div className="flex-1 p-4 overflow-y-auto space-y-6">
              {activeTab === 'gestures' && (
                <GestureLibraryStudio
                  theme={currentTheme}
                  gestures={gestures}
                  activeGesture={activeGesture}
                  gestureProgress={gestureProgress}
                  onTriggerGesture={handleTriggerGesture}
                  onUpdateGestures={setGestures}
                  shortcutsEnabled={shortcutsEnabled}
                  onToggleShortcuts={setShortcutsEnabled}
                />
              )}

              {activeTab === 'plasma' && (
                <PlasmaFxController
                  streamConfig={streamConfig}
                  audioState={audioState}
                  onUpdateStreamConfig={handleUpdateStreamConfig}
                  onTriggerPlasmaBurst={() => setPlasmaBurstCount((prev) => prev + 1)}
                />
              )}

              {activeTab === 'talk' && (
                <DragonTalkStudio
                  theme={currentTheme}
                  audioState={audioState}
                  onSetExpression={setExpression}
                />
              )}

              {activeTab === 'pipeline' && (
                <SeedanceStudioPanel
                  onClose={() => setActiveTab('talk')}
                  onTriggerDragonAction={(act) => {
                    if (act === 'awaken') setExpression('idle');
                    if (act === 'beam') setExpression('roar');
                    if (act === 'shield') setExpression('shield');
                    if (act === 'save_world') setExpression('hypersync');
                  }}
                />
              )}

              {activeTab === 'themes' && (
                <ThemeSelector
                  currentTheme={currentTheme}
                  onSelectTheme={setCurrentTheme}
                />
              )}

              {activeTab === 'audio' && (
                <AudioSettingsPanel
                  config={audioConfig}
                  audioState={audioState}
                  devices={devices}
                  permissionError={permissionError}
                  isTestAudioPlaying={isTestAudioPlaying}
                  testAudioMode={testAudioMode}
                  onUpdateConfig={handleUpdateAudioConfig}
                  onStartListening={startListening}
                  onStopListening={stopListening}
                  onPlayTestAudio={playTestAudio}
                  onStopTestAudio={stopTestAudio}
                  onRefreshDevices={refreshDevices}
                />
              )}

              {activeTab === 'stream' && (
                <StreamOverlayHUD
                  streamConfig={streamConfig}
                  theme={currentTheme}
                  audioState={audioState}
                  onUpdateStreamConfig={handleUpdateStreamConfig}
                  onOpenObsGuide={() => setIsObsGuideOpen(true)}
                />
              )}

              {activeTab === 'flight' && (
                <CompanionFlightStudio
                  theme={currentTheme}
                  flightMode={flightMode}
                  flightPattern={flightPattern}
                  flightSpeed={flightSpeed}
                  onSetFlightMode={setFlightMode}
                  onSetFlightPattern={setFlightPattern}
                  onSetFlightSpeed={setFlightSpeed}
                />
              )}

              {activeTab === 'telemetry' && (
                <div className="space-y-6">
                  <JawMechanicsInspector
                    audioState={audioState}
                    theme={currentTheme}
                  />
                  <SmartObjectWrapper
                    theme={currentTheme}
                    audioState={audioState}
                  />
                  <BlenderExportPanel theme={currentTheme} />
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* OBS Setup Modal */}
      <ObsSetupGuideModal
        isOpen={isObsGuideOpen}
        onClose={() => setIsObsGuideOpen(false)}
      />
    </div>
  );
}
