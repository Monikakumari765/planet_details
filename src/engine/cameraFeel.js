// EnglishEnglishEnglishEnglish：English"EnglishEnglishEnglish"EnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglish"EnglishEnglish"，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：
//   · EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish 2 EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
//   · EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
//   · EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglish
//   · EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
//
// EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
// （EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
import * as THREE from 'three';
import { prefersReducedMotion } from '../config.js';

const DEG = Math.PI / 180;

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish（EnglishEnglish）EnglishEnglishEnglish（Hz） */
function makeImpulse() { return { amp: 0, freq: 26, phase: 0 }; }

export function createCameraFeel() {
  const impulse = makeImpulse();
  let bobPhase = 0;          // EnglishEnglishEnglishEnglish（EnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  let bobAmp = 0;            // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish，EnglishEnglish/EnglishEnglishEnglishEnglishEnglish）
  let fovBias = 0;           // EnglishEnglishEnglishEnglish FOV EnglishEnglishEnglish（English）
  let time = 0;

  const q = new THREE.Quaternion();
  const e = new THREE.Euler(0, 0, 0, 'YXZ');

  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglish random() EnglishEnglishEnglishEnglish
  const n = (t, k) => Math.sin(t * 1.7 + k) * 0.6 + Math.sin(t * 3.1 + k * 2.3) * 0.4;

  return {
    /** EnglishEnglishEnglishEnglishEnglishEnglish。strength EnglishEnglishEnglishEnglish，0.01 ≈ 0.57°（EnglishEnglishEnglishEnglish） */
    impulse(strength, freq = 26) {
      if (strength > impulse.amp) { impulse.amp = strength; impulse.freq = freq; }
    },

    /**
     * @param {number} dt EnglishEnglishEnglishEnglish（English）
     * @param {object} s  { mode, speedKmS, walkSpeedMS, walking, altGroundKm, boosting }
     * @returns {{ quaternion, fovBiasDeg }} EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish FOV EnglishEnglish
     */
    update(dt, s) {
      // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish、FOV EnglishEnglishEnglishEnglishEnglishEnglish。
      // EnglishEnglishEnglishEnglish"EnglishEnglish"，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      if (prefersReducedMotion()) {
        impulse.amp = 0; bobAmp = 0; fovBias = 0;
        q.identity();
        return { quaternion: q, fovBiasDeg: 0 };
      }
      time += dt;
      const mode = s.mode ?? 'orbit';

      // ── EnglishEnglishEnglishEnglish ──
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish 2 English（EnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglish 0.25°。
      // English"EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      const wantBob = (mode === 'walk' && s.walking && !s.submerged) ? 1 : 0;
      bobAmp += (wantBob - bobAmp) * Math.min(dt * 6, 1);
      // EnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglish**EnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 5 English：EnglishEnglishEnglishEnglishEnglish 0.75m EnglishEnglish
      // EnglishEnglishEnglish、EnglishEnglish pitch EnglishEnglish 2，EnglishEnglish 8 Hz；English audio.js EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      // 1.63 Hz。EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish"EnglishEnglish"EnglishEnglishEnglish"EnglishEnglishEnglish"。
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish audio.js English _stepInterval）。
      const fStep = 1.2 + Math.min(s.walkSpeedMS / 9, 1) * 1.3;    // Hz
      if (mode === 'walk' && s.walkSpeedMS > 0.05) {
        bobPhase += fStep * Math.PI * 2 * dt;
      }
      // EnglishEnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）EnglishEnglish
      const bobPitch = Math.sin(bobPhase) * 0.0044 * bobAmp;        // ≈0.25°
      const bobRoll = Math.sin(bobPhase * 0.5) * 0.0031 * bobAmp;   // ≈0.18°

      // ── EnglishEnglishEnglishEnglish ──
      // EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      let shakePitch = 0, shakeRoll = 0, shakeYaw = 0;
      if (impulse.amp > 1e-5) {
        const t = time * impulse.freq;
        shakePitch = n(t, 0.0) * impulse.amp;
        shakeYaw = n(t, 2.1) * impulse.amp * 0.7;
        shakeRoll = n(t, 4.3) * impulse.amp * 0.5;
        impulse.amp *= Math.exp(-dt * 5.5);
      } else impulse.amp = 0;

      // ── EnglishEnglishEnglishEnglish ──
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglish 10 km/s EnglishEnglishEnglish，EnglishEnglishEnglishEnglish 0.12°，
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      let hiPitch = 0, hiRoll = 0;
      if (mode === 'fly') {
        const v = Math.max(0, s.speedKmS ?? 0);
        const a = Math.min(0.0021, Math.sqrt(v / 10) * 0.0004);
        if (a > 1e-6) {
          const t = time * 34;
          hiPitch = n(t, 1.3) * a;
          hiRoll = n(t, 5.7) * a * 0.8;
        }
      }

      e.set(
        bobPitch + shakePitch + hiPitch,
        shakeYaw,
        bobRoll + shakeRoll + hiRoll,
      );
      q.setFromEuler(e);

      // ── FOV EnglishEnglish ──
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      const target = impulse.amp > 0 ? -impulse.amp * 220 : 0;
      const boostTarget = (mode === 'fly' && s.boosting) ? 3.5 : 0;
      fovBias += ((target + boostTarget) - fovBias) * Math.min(dt * (impulse.amp > 0 ? 22 : 4), 1);

      return { quaternion: q, fovBiasDeg: fovBias };
    },

    /** EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish）——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
    get amplitude() { return impulse.amp; },
  };
}
