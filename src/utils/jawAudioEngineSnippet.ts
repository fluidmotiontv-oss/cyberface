export const JAW_MECHANICS_STANDALONE_SNIPPET = `/**
 * =======================================================================
 * D9 CYBER DRAGON: AUDIO-REACTIVE JAW MECHANICS (Web Audio API)
 * Direct frequency & amplitude mapping to 60FPS jaw animation frames
 * =======================================================================
 */

class AudioReactiveJawController {
  constructor(options = {}) {
    this.options = {
      fftSize: options.fftSize || 512,
      smoothing: options.smoothing || 0.75,
      noiseGate: options.noiseGate || 0.08,
      gain: options.gain || 1.8,
      jawMultiplier: options.jawMultiplier || 1.4,
      maxJawDropPx: options.maxJawDropPx || 42,
      maxJawAngleDeg: options.maxJawAngleDeg || 18,
      speechFormantWeight: options.speechFormantWeight || 0.65,
      targetElement: options.targetElement || '#cyber-dragon-jaw',
      onFrame: options.onFrame || null,
      ...options
    };

    this.audioCtx = null;
    this.analyser = null;
    this.stream = null;
    this.rafId = null;
    this.currentJawOpen = 0;
  }

  async start() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioCtx();
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
    });
    const source = this.audioCtx.createMediaStreamSource(this.stream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = this.options.fftSize;
    this.analyser.smoothingTimeConstant = 0.5;
    source.connect(this.analyser);
    this.loop();
  }

  loop() {
    if (!this.analyser) return;
    const bufferLength = this.analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(freqData);
    this.analyser.getByteTimeDomainData(timeData);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const norm = (timeData[i] - 128) / 128;
      sum += norm * norm;
    }
    const rms = Math.sqrt(sum / bufferLength);
    const amplifiedRms = Math.min(1.0, rms * this.options.gain);

    const sampleRate = this.audioCtx.sampleRate || 44100;
    const binHz = (sampleRate / 2) / bufferLength;
    let midSum = 0, midCount = 0;
    for (let i = 0; i < bufferLength; i++) {
      const freq = i * binHz;
      if (freq >= 300 && freq <= 2800) {
        midSum += freqData[i] / 255;
        midCount++;
      }
    }
    const speechFormant = midCount > 0 ? (midSum / midCount) : 0;
    const effectiveVol = amplifiedRms < this.options.noiseGate ? 0 : amplifiedRms;
    const isSpeaking = effectiveVol > 0 || speechFormant > 0.12;

    const targetJaw = isSpeaking
      ? Math.min(1.0, (effectiveVol * (1 - this.options.speechFormantWeight) + speechFormant * this.options.speechFormantWeight) * this.options.jawMultiplier)
      : 0;

    const lerpSpeed = targetJaw > this.currentJawOpen ? 0.45 : 0.22;
    this.currentJawOpen += (targetJaw - this.currentJawOpen) * lerpSpeed;

    const jawDropPx = this.currentJawOpen * this.options.maxJawDropPx;
    const jawRotateDeg = this.currentJawOpen * this.options.maxJawAngleDeg;

    const el = typeof this.options.targetElement === 'string'
      ? document.querySelector(this.options.targetElement)
      : this.options.targetElement;

    if (el) {
      el.style.transform = \`translate3d(0, \${jawDropPx.toFixed(2)}px, 0) rotate(\${jawRotateDeg.toFixed(2)}deg)\`;
    }

    if (typeof this.options.onFrame === 'function') {
      this.options.onFrame({
        jawOpen: this.currentJawOpen,
        jawDropPx,
        jawRotateDeg,
        rms: amplifiedRms,
        speechFormant,
        isSpeaking
      });
    }

    this.rafId = requestAnimationFrame(() => this.loop());
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    if (this.audioCtx && this.audioCtx.state !== 'closed') this.audioCtx.close();
  }
}
`;
