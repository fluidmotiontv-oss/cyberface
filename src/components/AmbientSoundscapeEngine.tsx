import { useEffect, useRef } from 'react';
import { AudioConfig, AudioReactiveState } from '../types';

interface AmbientSoundscapeEngineProps {
  config: AudioConfig;
  audioState: AudioReactiveState;
}

export function AmbientSoundscapeEngine({
  config,
  audioState,
}: AmbientSoundscapeEngineProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const enabled = config.ambientSoundscapeEnabled ?? true;
  const baseVolume = config.ambientSoundscapeVolume ?? 0.18;

  useEffect(() => {
    if (!enabled) {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      masterGainRef.current = null;
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGainRef.current = masterGain;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      const freqs = [108, 162, 216, 432];
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        oscGain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
      });
    } catch {
      // ignore
    }

    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      masterGainRef.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain || !enabled) return;

    const isMicActive = audioState.isListening && (audioState.volume > (config.noiseGate || 0.04) || audioState.isSpeaking);
    const duckingFactor = isMicActive ? 0.15 : 1.0;
    const targetVolume = Math.max(0, baseVolume * duckingFactor);

    masterGain.gain.setTargetAtTime(targetVolume, ctx.currentTime, 0.12);
  }, [audioState.isListening, audioState.volume, audioState.isSpeaking, config.noiseGate, baseVolume, enabled]);

  return null;
}
