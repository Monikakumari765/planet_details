import { asset } from '../config.js';

const DEEP_SPACE_GAIN = 0.8;
const PLANETARY_GAIN = 0.22;
const DEEP_SPACE_CUTOFF_HZ = 8000;
const PLANETARY_CUTOFF_HZ = 600;
const MIN_DISTANCE_RADII = 1.2;
const MAX_DISTANCE_RADII = 20;
const ARPEGGIO_HZ = [220, 329.63, 440, 493.88, 523.25, 493.88, 440, 329.63];
const DRONE_VOICINGS = [
  { frequency: 55, gain: 0.048 },
  { frequency: 82.4069, gain: 0.036 },
];
const ARPEGGIO_INTERVAL_MS = 650;
const DRONE_BREATH_SECONDS = 16;

export function normalizePlanetProximity(distanceKm: number, radiusKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm < 0 ||
      !Number.isFinite(radiusKm) || radiusKm <= 0) {
    throw new RangeError('Planet distance and radius must be finite and radius must be positive');
  }
  const distanceInRadii = distanceKm / radiusKm;
  return 1 - Math.max(
    0,
    Math.min(
      1,
      (distanceInRadii - MIN_DISTANCE_RADII) /
        (MAX_DISTANCE_RADII - MIN_DISTANCE_RADII),
    ),
  );
}

export class CosmicAudio {
  private context: AudioContext | null = null;
  private filter: BiquadFilterNode | null = null;
  private spatialGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private trackBuffer: AudioBuffer | null = null;
  private trackLoadAttempted = false;
  private trackSource: AudioBufferSourceNode | null = null;
  private readonly synthSources = new Set<OscillatorNode>();
  private readonly droneGains: Array<{ gain: GainNode; base: number }> = [];
  private arpeggioTimer: number | null = null;
  private breathingTimer: number | null = null;
  private enabled = false;
  private volume = 0.45;
  private arpeggioIndex = 0;

  get isEnabled(): boolean {
    return this.enabled;
  }

  setVolume(value: number): void {
    if (!Number.isFinite(value)) throw new TypeError('Cosmic audio volume must be finite');
    this.volume = Math.max(0, Math.min(1, value));
    if (this.context && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.enabled ? this.volume : 0,
        this.context.currentTime,
        0.08,
      );
    }
  }

  updateSpatialAudio(normalizedPlanetProximity: number): void {
    if (!Number.isFinite(normalizedPlanetProximity)) {
      throw new TypeError('Planet proximity must be finite');
    }
    if (!this.context || !this.filter || !this.spatialGain) return;

    const proximity = Math.max(0, Math.min(1, normalizedPlanetProximity));
    const now = this.context.currentTime;
    this.spatialGain.gain.setTargetAtTime(
      DEEP_SPACE_GAIN + (PLANETARY_GAIN - DEEP_SPACE_GAIN) * proximity,
      now,
      0.45,
    );
    this.filter.frequency.setTargetAtTime(
      DEEP_SPACE_CUTOFF_HZ +
        (PLANETARY_CUTOFF_HZ - DEEP_SPACE_CUTOFF_HZ) * proximity,
      now,
      0.6,
    );
  }

  async setEnabled(value: boolean): Promise<void> {
    if (value === this.enabled) return;
    if (value) {
      this.enabled = true;
      try {
        this.createAudioGraph();
        const context = this.requireContext();
        await context.resume();
        if (!this.trackLoadAttempted) await this.loadOptionalTrack();
        if (!this.enabled) return;
        if (this.trackBuffer) this.startTrack();
        else this.startSynth();
        this.masterGain?.gain.setTargetAtTime(this.volume, context.currentTime, 0.12);
      } catch (error) {
        this.enabled = false;
        if (this.context && this.masterGain) {
          this.masterGain.gain.setTargetAtTime(0, this.context.currentTime, 0.08);
        }
        throw error;
      }
      return;
    }

    this.enabled = false;
    const context = this.context;
    if (!context || !this.masterGain) return;
    this.masterGain.gain.setTargetAtTime(0, context.currentTime, 0.12);
    await new Promise<void>(resolve => window.setTimeout(resolve, 750));
    this.stopSources();
    await context.suspend();
  }

  private createAudioGraph(): void {
    if (this.context) return;
    const Constructor = window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Constructor) throw new Error('Web Audio API is not supported in this browser');

    this.context = new Constructor();
    this.filter = this.context.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = DEEP_SPACE_CUTOFF_HZ;
    this.filter.Q.value = 0.5;

    this.spatialGain = this.context.createGain();
    this.spatialGain.gain.value = DEEP_SPACE_GAIN;
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0;

    const dryGain = this.context.createGain();
    dryGain.gain.value = 0.76;
    this.filter.connect(this.spatialGain);
    this.spatialGain.connect(dryGain);
    dryGain.connect(this.masterGain);

    const leftDelay = this.context.createDelay(2);
    leftDelay.delayTime.value = 0.43;
    const leftFeedback = this.context.createGain();
    leftFeedback.gain.value = 0.2;
    const leftPan = this.context.createStereoPanner();
    leftPan.pan.value = -0.65;
    this.spatialGain.connect(leftDelay);
    leftDelay.connect(leftFeedback);
    leftFeedback.connect(leftDelay);
    leftDelay.connect(leftPan);
    leftPan.connect(this.masterGain);

    const rightDelay = this.context.createDelay(2);
    rightDelay.delayTime.value = 0.67;
    const rightFeedback = this.context.createGain();
    rightFeedback.gain.value = 0.16;
    const rightPan = this.context.createStereoPanner();
    rightPan.pan.value = 0.65;
    this.spatialGain.connect(rightDelay);
    rightDelay.connect(rightFeedback);
    rightFeedback.connect(rightDelay);
    rightDelay.connect(rightPan);
    rightPan.connect(this.masterGain);

    this.masterGain.connect(this.context.destination);
  }

  private requireContext(): AudioContext {
    if (!this.context) throw new Error('Cosmic audio context was not initialized');
    return this.context;
  }

  private async loadOptionalTrack(): Promise<void> {
    this.trackLoadAttempted = true;
    try {
      const response = await fetch(asset('audio/interstellar-theme.mp3'));
      if (!response.ok) {
        console.info('[cosmicAudio] Optional MP3 not found; using procedural ambience.');
        return;
      }
      this.trackBuffer = await this.requireContext().decodeAudioData(await response.arrayBuffer());
    } catch (error) {
      console.info('[cosmicAudio] Optional MP3 could not be loaded; using procedural ambience.', error);
    }
  }

  private startTrack(): void {
    const context = this.requireContext();
    if (!this.trackBuffer || this.trackSource) return;
    const source = context.createBufferSource();
    source.buffer = this.trackBuffer;
    source.loop = true;
    source.connect(this.filter!);
    source.onended = () => {
      if (this.trackSource === source) this.trackSource = null;
      source.disconnect();
    };
    source.start();
    this.trackSource = source;
  }

  private startSynth(): void {
    const context = this.requireContext();
    const now = context.currentTime;
    this.startOrganDrone(now);
    this.arpeggioIndex = 0;
    this.updateDroneBreath();
    this.playArpeggioNote();
    this.arpeggioTimer = window.setInterval(
      () => this.playArpeggioNote(),
      ARPEGGIO_INTERVAL_MS,
    );
    this.breathingTimer = window.setInterval(() => this.updateDroneBreath(), 250);
  }

  private startOrganDrone(now: number): void {
    const context = this.requireContext();
    this.droneGains.length = 0;
    for (const voice of DRONE_VOICINGS) {
      for (const partial of [
        { frequency: voice.frequency, type: 'sine' as OscillatorType, gain: voice.gain },
        { frequency: voice.frequency * 2, type: 'triangle' as OscillatorType, gain: voice.gain * 0.18 },
      ]) {
        const oscillator = context.createOscillator();
        const voiceGain = context.createGain();
        oscillator.type = partial.type;
        oscillator.frequency.value = partial.frequency;
        voiceGain.gain.value = partial.gain * 0.55;
        oscillator.connect(voiceGain);
        voiceGain.connect(this.filter!);
        this.droneGains.push({ gain: voiceGain, base: partial.gain });
        this.trackSynthSource(oscillator, voiceGain);
        oscillator.start(now);
      }
    }
  }

  private updateDroneBreath(): void {
    if (!this.context || !this.enabled) return;
    const now = this.context.currentTime;
    const phase = (now % DRONE_BREATH_SECONDS) / DRONE_BREATH_SECONDS * Math.PI * 2;
    const swell = 0.55 + 0.45 * (0.5 - 0.5 * Math.cos(phase));
    for (const voice of this.droneGains) {
      voice.gain.gain.setTargetAtTime(voice.base * swell, now, 0.45);
    }
  }

  private playArpeggioNote(): void {
    if (!this.enabled || !this.context || !this.filter) return;
    const context = this.context;
    const now = context.currentTime;
    const frequency = ARPEGGIO_HZ[this.arpeggioIndex % ARPEGGIO_HZ.length];
    this.arpeggioIndex++;

    for (const type of ['sine', 'triangle'] as const) {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      const peak = type === 'sine' ? 0.012 : 0.0035;
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      envelope.gain.setValueAtTime(0.0001, now);
      envelope.gain.linearRampToValueAtTime(peak, now + 0.035);
      envelope.gain.setTargetAtTime(peak * 0.48, now + 0.15, 0.14);
      envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.78);
      oscillator.connect(envelope);
      envelope.connect(this.filter);
      this.trackSynthSource(oscillator, envelope);
      oscillator.start(now);
      oscillator.stop(now + 0.82);
    }
  }

  private trackSynthSource(oscillator: OscillatorNode, output: AudioNode): void {
    this.synthSources.add(oscillator);
    oscillator.onended = () => {
      this.synthSources.delete(oscillator);
      oscillator.disconnect();
      output.disconnect();
    };
  }

  private stopSources(): void {
    if (this.arpeggioTimer !== null) {
      window.clearInterval(this.arpeggioTimer);
      this.arpeggioTimer = null;
    }
    if (this.breathingTimer !== null) {
      window.clearInterval(this.breathingTimer);
      this.breathingTimer = null;
    }
    this.droneGains.length = 0;
    const now = this.context?.currentTime ?? 0;
    if (this.trackSource) {
      this.trackSource.stop(now);
      this.trackSource = null;
    }
    for (const oscillator of this.synthSources) {
      try {
        oscillator.stop(now);
      } catch {
        // A transient arpeggio oscillator may already have scheduled its end.
      }
    }
    this.synthSources.clear();
  }
}
