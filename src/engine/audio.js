// EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish（Web Audio API），EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglish：
//   [vacuum hiss]  ─┐
//   [atmo wind]    ─┤
//   [footstep]     ─┤→ bus(gain) → underwaterFilter(lowpass) → master(gain) → destination
//   [bubble]       ─┘
//
// underwaterFilter EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 20kHz（EnglishEnglish），
// EnglishEnglishEnglishEnglishEnglish ~450Hz，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。

// ── EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ──────────────────────────────────────────────────
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：
//   rock  — EnglishEnglish/EnglishEnglish：EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish
//   sand  — EnglishEnglish/ Titan：EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish
//   dirt  — EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish，EnglishEnglish + EnglishEnglishEnglishEnglish
//   ice   — EnglishEnglish：EnglishEnglishEnglishEnglish，EnglishEnglish + EnglishEnglishEnglishEnglish
const FOOTSTEP_PROFILES = {
  rock:  { filter: 'bandpass', freq: 1800, q: 1.5, gain: 0.13, dur: 0.12, freqJitter: 400 },
  sand:  { filter: 'bandpass', freq: 600,  q: 0.8, gain: 0.12, dur: 0.18, freqJitter: 200 },
  dirt:  { filter: 'lowpass',  freq: 900,  q: 1.2, gain: 0.14, dur: 0.12, freqJitter: 0   },
  ice:   { filter: 'highpass', freq: 3000, q: 0.7, gain: 0.10, dur: 0.08, freqJitter: 0   },
};

export class AudioEngine {
  constructor() {
    this.ctx = null;

    // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglish）
    this._enabled = false;
    this._volume = 0.6;           // EnglishEnglishEnglish 0-1
    this._vacuumEnabled = false;  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish）

    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（English setMode EnglishEnglish）
    this._mode = 'fly';
    this._env = { nearest: null, inAtmosphere: false, underwater: false, surface: 'rock' };

    // EnglishEnglishEnglishEnglishEnglishEnglish（English update EnglishEnglish，EnglishEnglishEnglishEnglish Ship.audioState）
    this._state = { speed: 0, walking: false, submerged: false, surfaceType: 'rock' };

    // ── EnglishEnglishEnglishEnglishEnglish（init EnglishEnglishEnglish）──
    this._bus = null;              // EnglishEnglish GainNode：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    this._underwaterFilter = null; // BiquadFilterNode：EnglishEnglishEnglishEnglishEnglishEnglishEnglish
    this._master = null;           // GainNode：EnglishEnglishEnglishEnglish + EnglishEnglishEnglish

    // ── EnglishEnglish buffer（init EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish）──
    this._whiteBuf = null;  // EnglishEnglishEnglish（EnglishEnglishEnglishEnglish / EnglishEnglishEnglishEnglish）
    this._pinkBuf = null;   // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish，EnglishEnglishEnglish）

    // ── EnglishEnglishEnglishEnglishEnglish（init EnglishEnglishEnglish，EnglishEnglish gain EnglishEnglishEnglishEnglish）──
    this._vacuum = null;    // { source, filter, gain } EnglishEnglishEnglishEnglishEnglishEnglish
    this._atmo = null;      // { source, filter, gain } EnglishEnglishEnglishEnglishEnglishEnglishEnglish
    this._engine = null;    // { source, filter, gain } EnglishEnglish/EnglishEnglishEnglishEnglishEnglish
    this._reentry = null;   // { source, filter, gain } EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish

    // ── EnglishEnglishEnglishEnglishEnglish ──
    this._stepTimer = 0;    // EnglishEnglishEnglishEnglishEnglishEnglish
    this._stepInterval = 0.5;
    this._bubbleTimer = 0;  // EnglishEnglishEnglishEnglishEnglishEnglish
  }

  get enabled() { return this._enabled; }

  get vacuumEnabled() { return this._vacuumEnabled; }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish AudioContext（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglish（click/touch/keydown）EnglishEnglishEnglishEnglishEnglish，EnglishEnglish ctx EnglishEnglishEnglishEnglish。
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish buffer。
   */
  init() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return; // Web Audio API EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）→ EnglishEnglishEnglishEnglish

    this.ctx = new Ctx();

    // EnglishEnglishEnglish：bus → underwaterFilter → master → destination
    this._bus = this.ctx.createGain();
    this._bus.gain.value = 1;
    // EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish bus、EnglishEnglishEnglishEnglish——"EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
    // EnglishEnglishEnglishEnglish HRTF/EnglishEnglishEnglishEnglishEnglish 3D EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    this._stereo = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (this._stereo) { this._bus.connect(this._stereo); }

    this._underwaterFilter = this.ctx.createBiquadFilter();
    this._underwaterFilter.type = 'lowpass';
    this._underwaterFilter.frequency.value = 20000; // EnglishEnglishEnglishEnglishEnglishEnglish
    this._underwaterFilter.Q.value = 0.5;

    this._master = this.ctx.createGain();
    this._master.gain.value = 0; // EnglishEnglishEnglishEnglish，setEnabled EnglishEnglishEnglish

    (this._stereo ?? this._bus).connect(this._underwaterFilter);
    this._underwaterFilter.connect(this._master);
    this._master.connect(this.ctx.destination);

    // EnglishEnglishEnglishEnglishEnglish buffer（2 EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    this._whiteBuf = this._makeNoiseBuffer('white');
    this._pinkBuf = this._makeNoiseBuffer('pink');

    // EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish start，EnglishEnglish gain EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish）
    // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglish + EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    this._vacuum = this._createNoiseLayer(this._whiteBuf, 'lowpass', 600, 0);
    this._vacuum.gain.connect(this._bus);

    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）
    this._atmo = this._createNoiseLayer(this._pinkBuf, 'bandpass', 500, 0);
    this._atmo.gain.connect(this._bus);

    // EnglishEnglish/EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglish"EnglishEnglishEnglishEnglish"EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    this._engine = this._createNoiseLayer(this._pinkBuf, 'lowpass', 90, 0);
    this._engine.gain.connect(this._bus);

    // EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    this._reentry = this._createNoiseLayer(this._whiteBuf, 'bandpass', 620, 0);
    this._reentry.gain.connect(this._bus);
  }

  /**
   * EnglishEnglishEnglishEnglish buffer。
   * white — EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglish）
   * pink  — Paul Kellet EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish -3dB，EnglishEnglishEnglishEnglishEnglish）
   */
  _makeNoiseBuffer(type) {
    const sr = this.ctx.sampleRate;
    const len = sr * 2; // 2 English
    const buf = this.ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    } else {
      // Paul Kellet refined pink noise filter
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.0168980;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }
    }
    return buf;
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：BufferSource(loop) → BiquadFilter → Gain
   * EnglishEnglish { source, filter, gain }，gain EnglishEnglishEnglish 0（EnglishEnglish），English update EnglishEnglish。
   */
  _createNoiseLayer(buffer, filterType, freq, gainVal) {
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = freq;
    filter.Q.value = 0.7;
    const g = this.ctx.createGain();
    g.gain.value = gainVal;
    src.connect(filter);
    filter.connect(g);
    src.start();
    return { source: src, filter, gain: g };
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   * @param mode 'orbit' | 'fly' | 'walk'
   * @param env  { nearest, inAtmosphere, underwater, surface }
   *   - nearest: EnglishEnglishEnglishEnglish { id, radiusKm, distSurface, ... }
   *   - inAtmosphere: EnglishEnglishEnglishEnglishEnglishEnglishEnglish
   *   - underwater: EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）
   *   - surface: EnglishEnglishEnglishEnglish 'rock'|'sand'|'dirt'|'ice'
   */
  setMode(mode, env) {
    this._mode = mode || 'fly';
    if (env) {
      this._env = {
        nearest: env.nearest || null,
        inAtmosphere: !!env.inAtmosphere,
        underwater: !!env.underwater,
        surface: env.surface || 'rock',
      };
    }
  }

  /**
   * EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish/EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   * @param dt    EnglishEnglishEnglish（English）
   * @param state { speed, walking, submerged, surfaceType }
   *   - speed: EnglishEnglishEnglishEnglish（km/s，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
   *   - walking: EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）
   *   - submerged: EnglishEnglishEnglishEnglish
   *   - surfaceType: EnglishEnglishEnglishEnglishEnglishEnglish
   */
  update(dt, state) {
    if (!this.ctx || !this._enabled) return;
    if (state) Object.assign(this._state, state);

    const now = this.ctx.currentTime;
    const submerged = this._state.submerged || this._env.underwater;

    // ── EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish ──
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 20kHz（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）；
    // EnglishEnglishEnglishEnglishEnglish 450Hz，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    const targetCutoff = submerged ? 450 : 20000;
    this._underwaterFilter.frequency.setTargetAtTime(targetCutoff, now, 0.15);

    // ── EnglishEnglishEnglishEnglishEnglishEnglish（fly/orbit + EnglishEnglish + EnglishEnglishEnglishEnglish）──
    // EnglishEnglishEnglish（0.03），EnglishEnglishEnglish；EnglishEnglishEnglishEnglish，English setVacuum(true) EnglishEnglish
    const inVacuum = (this._mode === 'fly' || this._mode === 'orbit')
      && !this._env.inAtmosphere && !submerged;
    const vacuumTarget = (inVacuum && this._vacuumEnabled) ? 0.03 : 0;
    this._vacuum.gain.gain.setTargetAtTime(vacuumTarget, now, 0.3);

    // ── EnglishEnglishEnglishEnglishEnglishEnglishEnglish（fly/orbit + EnglishEnglishEnglishEnglish）──
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）EnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglish
    let atmoTarget = 0;
    if ((this._mode === 'fly' || this._mode === 'orbit')
      && this._env.inAtmosphere && !submerged) {
      const n = this._env.nearest;
      if (n) {
        // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish（0=EnglishEnglishEnglishEnglish，1=EnglishEnglish）
        const altFactor = Math.max(0, 1 - n.distSurface / Math.max(n.radiusKm * 0.3, 0.001));
        atmoTarget = 0.03 + altFactor * 0.07; // 0.03-0.10
      } else {
        atmoTarget = 0.04;
      }
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      const speedFreq = 400 + Math.min(this._state.speed * 50, 800);
      this._atmo.filter.frequency.setTargetAtTime(speedFreq, now, 0.2);
    }
    this._atmo.gain.gain.setTargetAtTime(atmoTarget, now, 0.15);

    // ── EnglishEnglish/EnglishEnglishEnglish（fly + EnglishEnglish）──
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    let engineTarget = 0;
    if (this._mode === 'fly' && !submerged) {
      const vKmS = Math.max(0, this._state.speed ?? 0);
      const vNorm = Math.min(1, Math.log10(1 + vKmS * 1000) / 4);  // 1 m/s→0，10 km/s→1
      engineTarget = 0.015 + vNorm * 0.055;
      this._engine.filter.frequency.setTargetAtTime(70 + vNorm * 130, now, 0.25);
    }
    this._engine.gain.gain.setTargetAtTime(engineTarget, now, 0.12);

    // ── EnglishEnglishEnglishEnglish（EnglishEnglishEnglish + EnglishEnglish）──
    // EnglishEnglish ∝ EnglishEnglishEnglishEnglish × EnglishEnglish²，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish q = ½ρv²）。
    let reentryTarget = 0;
    if (this._env.inAtmosphere && !submerged && this._mode !== 'walk') {
      const n = this._env.nearest;
      const dens = n ? Math.max(0, Math.min(1, 1 - n.distSurface / Math.max(n.radiusKm * 0.3, 0.001))) : 0;
      const vFrac = Math.min(1, Math.max(0, (this._state.speed ?? 0) / 8));  // 8 km/s ≈ EnglishEnglishEnglishEnglishEnglishEnglish
      reentryTarget = dens * vFrac * vFrac * 0.22;
      this._reentry.filter.frequency.setTargetAtTime(420 + vFrac * 900, now, 0.3);
    }
    this._reentry.gain.gain.setTargetAtTime(reentryTarget, now, 0.2);

    // ── EnglishEnglishEnglish（walk + EnglishEnglishEnglish + EnglishEnglishEnglish）──
    if (this._mode === 'walk' && this._state.walking && !submerged) {
      this._stepTimer += dt;
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish ~1.2 Hz，EnglishEnglish ~2.5 Hz
      const speedNorm = Math.min(this._state.speed / 0.009, 1);
      this._stepInterval = 1 / (1.2 + speedNorm * 1.3);
      if (this._stepTimer >= this._stepInterval) {
        this._stepTimer = 0;
        this._playFootstep(this._state.surfaceType);
      }
    } else {
      this._stepTimer = 0;
    }

    // ── EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）──
    if (submerged) {
      this._bubbleTimer += dt;
      const bubbleInterval = 0.8 + Math.random() * 1.5; // 0.8-2.3s EnglishEnglishEnglishEnglish
      if (this._bubbleTimer >= bubbleInterval) {
        this._bubbleTimer = 0;
        this._playBubble();
      }
    } else {
      this._bubbleTimer = 0;
    }
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglish。
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   */
  _playFootstep(surfaceType) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const profile = FOOTSTEP_PROFILES[surfaceType] || FOOTSTEP_PROFILES.rock;

    // EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish buffer EnglishEnglishEnglish
    const src = this.ctx.createBufferSource();
    src.buffer = this._whiteBuf;
    src.loop = false;
    src.playbackRate.value = 0.8 + Math.random() * 0.4; // EnglishEnglishEnglishEnglishEnglishEnglishEnglish

    const filter = this.ctx.createBiquadFilter();
    filter.type = profile.filter;
    filter.frequency.value = profile.freq + (Math.random() * 2 - 1) * profile.freqJitter;
    filter.Q.value = profile.q;

    const g = this.ctx.createGain();
    const dur = profile.dur;
    // ADSR EnglishEnglish：EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(profile.gain, now + 0.004);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    src.connect(filter);
    filter.connect(g);
    g.connect(this._bus);

    // EnglishEnglishEnglish buffer EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，English dur*1.5 EnglishEnglishEnglishEnglishEnglish
    src.start(now, Math.random() * 1.5, dur * 1.5);
    src.stop(now + dur * 1.5);
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish。
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   */
  /**
   * EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；English cameraFeel.impulse EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   */
  playLandingImpact(strength = 0.5) {
    if (!this.ctx || !this._enabled) return;
    const ctx = this.ctx, now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this._whiteBuf;
    src.loop = false;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 180 + strength * 220;
    filter.Q.value = 0.9;
    const g = ctx.createGain();
    const peak = Math.min(0.5, 0.12 + strength * 0.38);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(peak, now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    src.connect(filter); filter.connect(g); g.connect(this._bus);
    src.start(now);
    src.stop(now + 0.36);
  }

  _playBubble() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    const startFreq = 200 + Math.random() * 400;
    const endFreq = startFreq + 200 + Math.random() * 300;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

    const g = this.ctx.createGain();
    const peak = 0.035 + Math.random() * 0.035; // EnglishEnglishEnglishEnglish
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(peak, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(g);
    g.connect(this._bus);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  /**
   * EnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish AudioContext（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
   * EnglishEnglishEnglishEnglishEnglish ctx（EnglishEnglishEnglish tab EnglishEnglishEnglish ctx EnglishEnglishEnglishEnglishEnglish）。
   */
  setEnabled(on) {
    this._enabled = !!on;
    if (this._enabled) {
      if (!this.ctx) this.init();
      if (!this.ctx) return; // Web Audio EnglishEnglishEnglish
      if (this.ctx.state === 'suspended') this.ctx.resume();
    }
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const target = this._enabled ? this._volume : 0;
    // 50ms EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish
    this._master.gain.setTargetAtTime(target, now, 0.05);
  }

  /** EnglishEnglishEnglishEnglishEnglish（-1 English … +1 English）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   *  EnglishEnglishEnglishEnglishEnglishEnglish StereoPanner EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。 */
  setPan(v) {
    if (!this._stereo) return;
    this._stereo.pan.setTargetAtTime(
      Math.max(-1, Math.min(1, v)), this.ctx.currentTime, 0.08);
  }

  /** EnglishEnglishEnglish 0-1 */
  setVolume(v) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.ctx && this._enabled) {
      this._master.gain.setTargetAtTime(this._volume, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   */
  setVacuum(on) {
    this._vacuumEnabled = !!on;
  }

  /** EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish */
  toggle() {
    this.setEnabled(!this._enabled);
    return this._enabled;
  }
}
