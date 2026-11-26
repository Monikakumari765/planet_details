// EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// - EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）
// - EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
// - HDR：EnglishEnglishEnglishEnglishEnglishEnglish 1/d²（EnglishEnglishEnglish=1）EnglishEnglish
// - R7 #4：EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish，SpaceEngine EnglishEnglish）——
//   EnglishEnglish/EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglish + EnglishEnglishEnglishEnglish；EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish。
//   EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglish R5 EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。

import * as THREE from 'three';
import { HASH_GLSL } from './glslNoise.js';
import { HAPKE_PARAMS } from '../astro/bodies.js';
import { QUALITY } from '../engine/quality.js';

// 1×1 EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish sampler EnglishEnglishEnglishEnglish
const DUMMY_TEX = new THREE.DataTexture(new Uint8Array([128, 128, 128, 128]), 1, 1);
DUMMY_TEX.needsUpdate = true;

/**
 * EnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 *
 * EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglish**English
 * EnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 *
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish `clamp((lum − 0.10) × 1.8, 0, 1)` English lum > 0.65 EnglishEnglishEnglishEnglish 1。
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglish**（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 * EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 */
const CLOUD_GLSL = /* glsl */ `
  // EnglishEnglish → EnglishEnglishEnglishEnglish。
  //
  // EnglishEnglish**EnglishEnglish**English GIBS English"EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglish（MODIS EnglishEnglish）EnglishEnglishEnglishEnglish
  // "EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"，EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish 0.70 → EnglishEnglishEnglishEnglishEnglishEnglish 0.775，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // （EnglishEnglishEnglishEnglishEnglish 180,193,211，63.8% EnglishEnglishEnglishEnglishEnglishEnglishEnglish >200，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
  //
  // EnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**（1.45 → 4.5）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish——
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
  // EnglishEnglish 4.5 EnglishEnglishEnglish 2.0 EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish 0.70 EnglishEnglish
  // EnglishEnglishEnglishEnglishEnglish 0.775 EnglishEnglishEnglish 0.33，EnglishEnglishEnglishEnglish 0.7 EnglishEnglish。
  // EnglishEnglishEnglish tools/audit-cloudab.mjs（EnglishEnglishEnglishEnglishEnglishEnglish (53,87,133) EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
  float cloudTau(vec3 cl) {
    float lum = clamp(dot(cl, vec3(0.34)), 0.0, 1.0);
    return pow(lum, 4.5) * 2.0;
  }
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（Beer–Lambert：EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  float cloudAlpha(vec3 cl) { return 1.0 - exp(-cloudTau(cl)); }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglish UV（EnglishEnglishEnglishEnglish + EnglishEnglish）。
   *
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglish **3D EnglishEnglish**EnglishEnglish，EnglishEnglishEnglish uv：uv.x EnglishEnglishEnglishEnglishEnglish 1→0 EnglishEnglish，
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（uv EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
   */
  vec2 cloudUV(vec2 uv, float t) {
    // uv English SphereGeometry EnglishEnglish（English latLonOf）：u EnglishEnglish = EnglishEnglish**EnglishEnglish**，
    // EnglishEnglishEnglishEnglishEnglish (0.5 − u)·2π，English v English (v − 0.5)·π EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    vec2 ang = vec2((0.5 - uv.x) * 6.2831853, (uv.y - 0.5) * 3.14159265);
    vec3 dir = vec3(cos(ang.y) * cos(ang.x), sin(ang.y), cos(ang.y) * sin(ang.x));
    float d = pnoise(dir * 8.0 + vec3(0.0, 0.0, t * 0.008));
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish：u EnglishEnglishEnglishEnglish，EnglishEnglish**EnglishEnglish**（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglish u。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    return uv + vec2(-t * 0.00002 + d * 0.008, d * 0.004);
  }
`;

// EnglishEnglish ID（EnglishEnglishEnglishEnglish int EnglishEnglishEnglishEnglish）：English bodies.js English key EnglishEnglish。
// English int EnglishEnglish string——GLSL ES 1.0 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，English int EnglishEnglishEnglishEnglishEnglishEnglish。
const BODY_EARTH = 3, BODY_MARS = 4, BODY_JUPITER = 5, BODY_SATURN = 6, BODY_TRITON = 100;
const BODY_ID_MAP = {
  earth: BODY_EARTH, mars: BODY_MARS, jupiter: BODY_JUPITER,
  saturn: BODY_SATURN, triton: BODY_TRITON,
};

// EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish NASA/JPL EnglishEnglishEnglishEnglish：EnglishEnglishEnglish/EnglishEnglishEnglish/EnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
// EnglishEnglishEnglish 1/d² EnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
// （EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：
// - grade：EnglishEnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglish）
// - sat：EnglishEnglishEnglish（ACES EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
// - veil/veilColor：EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish tholin EnglishEnglish，
//   EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
const BODY_GRADE = {
  mercury: { grade: [0.40, 0.38, 0.36] },          // EnglishEnglishEnglishEnglishEnglish 0.09，EnglishEnglishEnglishEnglish（MESSENGER）
  earth:   { grade: [1, 1, 1], sat: 1 },
  // EnglishEnglish/EnglishEnglish：ACES EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  // EnglishEnglishEnglish sat English**EnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglish
  // "EnglishEnglish R−B EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  jupiter: { sat: 1.35 },
  uranus:  { grade: [1.50, 1.65, 1.70] },          // EnglishEnglish（EnglishEnglishEnglish 2 EnglishEnglishEnglish）
  // Oxford/Irwin 2024: Neptune is pale green-blue, not enhanced Voyager blue.
  // Approximate display correction of this legacy map; not spectral calibration.
  // dim English**EnglishEnglishEnglish**EnglishEnglish（EnglishEnglishEnglishEnglishEnglish）：EnglishEnglishEnglishEnglishEnglishEnglish 0.442 EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglishEnglish 4 English（EnglishEnglishEnglishEnglishEnglishEnglish）。EnglishEnglishEnglishEnglish 0.45，EnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglish
  // EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  neptune: { grade: [2.50, 2.50, 2.50], tint: [0.86, 1.02, 1.09], tintMix: 0.94, dim: 0.28 },
  pluto:   { grade: [1, 1, 1], sat: 1 },
  triton:  { grade: [1.08, 1.00, 0.95], sat: 1 },
  callisto: { grade: [0.90, 0.90, 0.92] },         // EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish
  saturn:  { sat: 1.22 },                          // EnglishEnglish：ACES EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish）。
  // EnglishEnglishEnglishEnglishEnglish：English"EnglishEnglishEnglishEnglish×EnglishEnglish=EnglishEnglishEnglishEnglishEnglish 0.22"EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish 1.8 English，
  // EnglishEnglishEnglishEnglishEnglishEnglish——20R EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ~25px，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。
  titan:   { veil: 0.94, veilColor: [0.92, 0.45, 0.14] },
};
// EnglishEnglishEnglish（terrain.js EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish 0.40×），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// sat EnglishEnglishEnglishEnglish（EnglishEnglish：EnglishEnglishEnglish uSat EnglishEnglish ACES EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。

// ── EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish"EnglishEnglish"EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ──────────────
//
// EnglishEnglishEnglish"EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 0.136、
// EnglishEnglish 0.219，EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
// 0.99 English 0.25（English 4 English）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglishEnglish：albedo = EnglishEnglish × (EnglishEnglishEnglishEnglishEnglish / EnglishEnglishEnglishEnglishEnglishEnglish)。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
// EnglishEnglishEnglishEnglish（English、EnglishEnglish、EnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglishEnglish：
//   TEXTURE_LIN_MEAN —— tools/audit-texmean.mjs EnglishEnglish（sRGB EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
//   SURFACE_ALBEDO   —— EnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**：
//                       EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（≈0.20），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 0.434；
//                       EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish 0.67 EnglishEnglishEnglish。
// EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish / EnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglish 1，EnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglish，
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
export const TEXTURE_LIN_MEAN = {
  'enceladus.jpg': 0.1363, 'mimas.jpg': 0.1653, 'tethys.jpg': 0.1887, 'dione.jpg': 0.2106,
  'rhea.jpg': 0.1709, 'iapetus.jpg': 0.2244, 'titan.jpg': 0.2477, 'charon.jpg': 0.1664,
  'europa.png': 0.5171, 'io.jpg': 0.2872, 'callisto.jpg': 0.1669, 'ganymede.jpg': 0.2076,
  'moon.jpg': 0.3026, 'mercury.jpg': 0.2277, 'mars.jpg': 0.2186, 'earth_day.jpg': 0.1958,
  'pluto.jpg': 0.3975, 'jupiter.jpg': 0.3613, 'saturn.jpg': 0.5440, 'uranus.jpg': 0.5505,
  'neptune.jpg': 0.1010, 'triton.jpg': 0.3096, 'venus_atmosphere.jpg': 0.5543,
};

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish 1。 */
export const SURFACE_ALBEDO = {
  mercury: 0.106, venus: 0.67, earth: 0.20, moon: 0.136, mars: 0.25,
  jupiter: 0.538, saturn: 0.499, uranus: 0.488, neptune: 0.442, pluto: 0.52,
  io: 0.63, europa: 0.67, ganymede: 0.43, callisto: 0.17,
  mimas: 0.962, enceladus: 0.99, tethys: 0.80, dione: 0.998, rhea: 0.949,
  titan: 0.22, iapetus: 0.25, triton: 0.76, charon: 0.38,
  // ── 2026-10-18 EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（NSSDC / JPL EnglishEnglishEnglishEnglishEnglish / EnglishEnglishEnglishEnglishEnglish）。
  phobos: 0.071, deimos: 0.068, ceres: 0.09,
  hyperion: 0.30, phoebe: 0.081, janus: 0.71, epimetheus: 0.73,
  prometheus: 0.60, pandora: 0.50, pan: 0.50, atlas: 0.40,
  miranda: 0.32, ariel: 0.39, umbriel: 0.21, titania: 0.27, oberon: 0.23,
  puck: 0.32, portia: 0.30,
  proteus: 0.10, nereid: 0.155, larissa: 0.09, galatea: 0.60,
  hydra: 0.35, nix: 0.35, kerberos: 0.35, styx: 0.35,
  amalthea: 0.09, thebe: 0.05, metis: 0.06, adrastea: 0.05,
  daphnis: 0.50, helene: 0.60, telesto: 0.60, calypso: 0.60,
};

/** EnglishEnglish → EnglishEnglishEnglishEnglish。EnglishEnglishEnglish / EnglishEnglishEnglishEnglish / EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 1（EnglishEnglish）。 */
export function albedoScaleOf(texFile, bodyId) {
  const m = texFile ? TEXTURE_LIN_MEAN[texFile] : undefined;
  const a = bodyId ? SURFACE_ALBEDO[bodyId] : undefined;
  if (!(m > 0) || !(a > 0)) return 1;
  return a / m;
}

// EnglishEnglish → EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglish <id>.jpg EnglishEnglishEnglish）
const TEX_FILE_BY_BODY = { earth: 'earth_day.jpg', europa: 'europa.png', venus: 'venus_atmosphere.jpg' };
const texFileOf = (id) => TEX_FILE_BY_BODY[id] ?? `${id}.jpg`;

/** EnglishEnglishEnglishEnglishEnglish：**EnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，BODY_GRADE EnglishEnglishEnglish**EnglishEnglish**。
 *
 * EnglishEnglishEnglishEnglishEnglish BODY_GRADE EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish grade EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"——
 * EnglishEnglish 0.40 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 0.466 EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish 0.19，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
 * EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglish。
 *
 * EnglishEnglish（uGrade）EnglishEnglishEnglish（TERRAIN_GRADE）EnglishEnglishEnglish**EnglishEnglishEnglishEnglish**，EnglishEnglishEnglishEnglishEnglishEnglish
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。 */
const DISPLAY_GRADE = (() => {
  const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  const ids = new Set([...Object.keys(BODY_GRADE), ...Object.keys(SURFACE_ALBEDO)]);
  const out = {};
  for (const id of ids) {
    const g = BODY_GRADE[id] ?? {};
    const s = albedoScaleOf(texFileOf(id), id);
    const base = g.grade ?? [1, 1, 1];
    const l = lum(base) || 1;
    const grade = base.map((v) => (v / l) * s * (g.dim ?? 1));
    if (!g.grade && s === 1) continue;   // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish，EnglishEnglishEnglish
    out[id] = { grade, sat: g.sat ?? 1 };
  }
  return out;
})();

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish，English DISPLAY_GRADE）。 */
export const TERRAIN_GRADE = DISPLAY_GRADE;

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish DISPLAY_GRADE）。 */
export function displayGradeOf(bodyId) { return DISPLAY_GRADE[bodyId] ?? null; }

/**
 * Hapke EnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglish**（EnglishEnglishEnglish 0、EnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglish"EnglishEnglishEnglishEnglish"。
 *
 * EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"——EnglishEnglishEnglishEnglishEnglishEnglish = 2/3。
 * English Hapke EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 2/3：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 0.29，
 * EnglishEnglish `albedo(=EnglishEnglishEnglishEnglishEnglishEnglishEnglish) × shade` EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 2 EnglishEnglishEnglish
 * （EnglishEnglish：EnglishEnglishEnglishEnglishEnglish 134，EnglishEnglishEnglishEnglish 0.25 EnglishEnglishEnglishEnglish 162——EnglishEnglishEnglishEnglishEnglish）。
 *
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish μdμ（EnglishEnglishEnglishEnglishEnglish μ=cosθ）。
 * EnglishEnglishEnglishEnglishEnglish shade=μ EnglishEnglishEnglishEnglish 2/3，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 */
export function hapkeDiskMean(w, B0, h, g) {
  const sq = Math.sqrt(Math.max(1 - w, 1e-6));
  const ca = 1;                       // EnglishEnglishEnglish 0
  const denom = 1 + g * g + 2 * g * ca;
  const P = (1 - g * g) / Math.pow(Math.max(denom, 1e-6), 1.5);
  const B = B0 / (1 + Math.tan(0) / Math.max(h, 1e-4));   // α=0 → B=B0
  let num = 0, den = 0;
  const N = 64;
  for (let i = 0; i < N; i++) {
    const mu = (i + 0.5) / N;
    const H = (1 + 2 * mu) / (1 + 2 * mu * sq);
    const shade = 0.25 * 0.5 * ((1 + B) * P + H * H - 1);
    num += shade * mu;
    den += mu;
  }
  return num / den;
}

export function createPlanetMaterial({
  map, nightMap = null, oceanSpec = false, ringShadow = null,
  detailMode = 0, radiusKm = 1, // detailMode: 0 English / 1 EnglishEnglish / 2 EnglishEnglishEnglishEnglish
  bodyId = null, cloudTex = null, // bodyId EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；cloudTex EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
}) {
  // ringShadow: { tex|null, innerKm, outerKm } —— EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  // EnglishEnglishEnglishEnglishEnglish Hapke EnglishEnglishEnglish BRDF；EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish）EnglishEnglish Lambert。
  const hp = HAPKE_PARAMS[bodyId] ?? null;
  const uniforms = {
    uMap: { value: map },
    uNight: { value: nightMap ?? DUMMY_TEX },
    uHasNight: { value: nightMap ? 1 : 0 },
    uOcean: { value: oceanSpec ? 1 : 0 },
    uSunDir: { value: new THREE.Vector3(1, 0, 0) }, // EnglishEnglishEnglish，EnglishEnglishEnglishEnglish
    uSunI: { value: 1.0 },                          // EnglishEnglishEnglishEnglishEnglishEnglishEnglish
    uHasRing: { value: ringShadow ? 1 : 0 },
    uHasRingTex: { value: ringShadow?.tex ? 1 : 0 },
    uRingTex: { value: ringShadow?.tex ?? DUMMY_TEX },
    uRingInner: { value: ringShadow?.innerKm ?? 1 },
    uRingOuter: { value: ringShadow?.outerKm ?? 2 },
    uRingNormal: { value: new THREE.Vector3(0, 1, 0) }, // EnglishEnglishEnglishEnglish（EnglishEnglish，EnglishEnglishEnglishEnglish）
    uRingShine: { value: 0 },                          // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish 0）
    uCenter: { value: new THREE.Vector3() },            // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish）
    uDetailMode: { value: detailMode },                 // EnglishEnglishEnglishEnglishEnglishEnglishEnglish 0
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglish（EnglishEnglishEnglish 0.8–1.0）EnglishEnglishEnglishEnglishEnglishEnglishEnglish，
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"——EnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    // EnglishEnglishEnglishEnglish 15–17 English。EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish 1.0，EnglishEnglish 0.2。
    uDetailAmp: { value: (() => {
      const a = bodyId ? SURFACE_ALBEDO[bodyId] : undefined;
      return a == null ? 1 : Math.max(0.2, Math.min(1, 1.45 - a));
    })() },
    uRadius: { value: radiusKm },
    // === Issue #26/#27/#28/#29/#36：EnglishEnglishEnglishEnglishEnglishEnglish uniforms ===
    uTime: { value: 0 },           // English（EnglishEnglish，EnglishEnglishEnglishEnglish/EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglish）
    uLs: { value: 0 },             // EnglishEnglishEnglishEnglishEnglishEnglish（English，EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    uSubsolarLat: { value: 0 },    // EnglishEnglishEnglishEnglishEnglish（English，EnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish）
    uBodyId: { value: BODY_ID_MAP[bodyId] ?? 0 }, // EnglishEnglish ID（EnglishEnglishEnglishEnglishEnglish）
    uCloudTex: { value: cloudTex ?? DUMMY_TEX },  // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）
    uHasClouds: { value: cloudTex ? 1 : 0 },
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（BODY_GRADE English；EnglishEnglish = EnglishEnglishEnglish）
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（DISPLAY_GRADE EnglishEnglishEnglishEnglishEnglishEnglish）
    uGrade: { value: new THREE.Vector3(...(DISPLAY_GRADE[bodyId]?.grade ?? [1, 1, 1])) },
    uInvScaleY: { value: 1 },
    uDetailScaleN: { value: Math.min(1, radiusKm / 400) },
    // Hapke EnglishEnglishEnglishEnglishEnglish：English shade EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 2/3，
    // EnglishEnglish albedo(=EnglishEnglishEnglishEnglishEnglishEnglishEnglish) × shade EnglishEnglishEnglishEnglishEnglish = A_geo × 2/3（EnglishEnglishEnglishEnglish）。
    uHapkeNorm: { value: (() => {
      if (!hp) return 1;
      const dm = hapkeDiskMean(hp.w, hp.B0, hp.h, hp.g);
      return dm > 1e-6 ? (2 / 3) / dm : 1;
    })() },
    uSat: { value: BODY_GRADE[bodyId]?.sat ?? 1.0 },
    uNaturalTint: { value: new THREE.Vector3(...(BODY_GRADE[bodyId]?.tint ?? [1, 1, 1])) },
    uNaturalTintMix: { value: BODY_GRADE[bodyId]?.tintMix ?? 0 },
    uVeil: { value: BODY_GRADE[bodyId]?.veil ?? 0.0 },
    uVeilColor: { value: new THREE.Vector3(...(BODY_GRADE[bodyId]?.veilColor ?? [0, 0, 0])) },
    uTerraformTintColor: { value: new THREE.Color(0x000000) },
    uTerraformTintStrength: { value: 0 },
    // EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish，EnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    uEclOn: { value: 0 },
    uEclPos: { value: new THREE.Vector3() },
    uEclR: { value: 1 },
    uSunDistKm: { value: 1.496e8 },
    // EnglishEnglishEnglishEnglish：Hapke EnglishEnglishEnglish BRDF（English src/astro/bodies.js HAPKE_PARAMS）
    uHapke: { value: hp ? 1 : 0 },
    uW: { value: hp?.w ?? 0.25 },
    uB0: { value: hp?.B0 ?? 1.0 },
    uHh: { value: hp?.h ?? 0.06 },
    uHg: { value: hp?.g ?? -0.3 },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      #include <common>
      uniform float uInvScaleY;   // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      uniform float uDetailScaleN;
      #include <logdepthbuf_pars_vertex>
      varying vec2 vUv;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      varying vec3 vObjPos;
      void main() {
        vUv = uv;
        // EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglish**EnglishEnglishEnglish**：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglish modelMatrix EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 5.6°，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        vNormalW = normalize(mat3(modelMatrix) * vec3(normal.x, normal.y * uInvScaleY, normal.z));
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vPosW = wp.xyz;
        vObjPos = position; // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
        gl_Position = projectionMatrix * viewMatrix * wp;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform sampler2D uMap;
      uniform sampler2D uNight;
      uniform int uHasNight;
      uniform int uOcean;
      uniform int uHasRing;
      uniform int uHasRingTex;
      uniform sampler2D uRingTex;
      uniform float uRingInner, uRingOuter;
      uniform vec3 uRingNormal;
      uniform float uRingShine;
      uniform vec3 uCenter;
      uniform vec3 uSunDir;
      uniform float uSunI;
      uniform int uDetailMode;
      uniform float uDetailAmp;
      uniform float uRadius;
      // === Issue #26/#27/#28/#36 uniforms ===
      uniform float uTime;
      uniform float uLs;
      uniform float uSubsolarLat;
      uniform int uBodyId;
      uniform sampler2D uCloudTex;
      uniform int uHasClouds;
      uniform vec3 uGrade;
      uniform float uInvScaleY;
      uniform float uDetailScaleN;
      uniform float uHapkeNorm;
      uniform float uSat;
      uniform vec3 uNaturalTint;
      uniform float uNaturalTintMix;
      uniform float uVeil;
      uniform vec3 uVeilColor;
      uniform vec3 uTerraformTintColor;
      uniform float uTerraformTintStrength;
      uniform int uEclOn;
      uniform vec3 uEclPos;
      uniform float uEclR;
      uniform float uSunDistKm;
      const float SUN_RADIUS_KM = 695700.0;
      uniform int uHapke;
      uniform float uW, uB0, uHh, uHg;
      varying vec2 vUv;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      varying vec3 vObjPos;

      ${HASH_GLSL}
      float phash(vec3 p) { return glslHash31(p); }
      float pnoise(vec3 p) {
        vec3 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(phash(i), phash(i + vec3(1,0,0)), f.x), mix(phash(i + vec3(0,1,0)), phash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(phash(i + vec3(0,0,1)), phash(i + vec3(1,0,1)), f.x), mix(phash(i + vec3(0,1,1)), phash(i + vec3(1,1,1)), f.x), f.y),
          f.z);
      }
${CLOUD_GLSL}

      // EnglishEnglishEnglishEnglishEnglishEnglishEnglish [-π, π]（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，English 0/2π EnglishEnglishEnglishEnglish）
      float angleDiff(float a, float b) {
        float d = a - b;
        return mod(d + 3.14159265, 6.2831853) - 3.14159265;
      }

      void main() {
        #include <logdepthbuf_fragment>
        vec3 n = normalize(vNormalW);
        vec3 albedo = texture2D(uMap, vUv).rgb;
        float app = uRadius / max(length(vPosW), uRadius); // EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish）
        // EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
        if (uDetailMode > 0) {
          float dist = length(vPosW); // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）
          // EnglishEnglishEnglishEnglishEnglish 0.01 English（#18：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish→EnglishEnglishEnglishEnglish）
          float fade = smoothstep(0.01, 0.18, app);
          if (fade > 0.001) {
            vec3 p = vObjPos / uRadius;
            if (uDetailMode == 2) {
              // EnglishEnglish/EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglish + EnglishEnglishEnglish
              vec3 ps = vec3(p.x * 0.22, p.y, p.z * 0.22);
              float t1 = pnoise(ps * 48.0);
              float t2 = pnoise(ps * 190.0) * smoothstep(0.18, 0.7, app);
              float storm = smoothstep(0.74, 0.95, pnoise(p * 85.0 + 13.7));
              // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
              // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 0
              float polarDamp = 1.0;
              if (uBodyId == 6) polarDamp = 1.0 - smoothstep(0.78, 0.92, abs(p.y));
              albedo *= 1.0 + fade * polarDamp * ((t1 - 0.5) * 0.16 + (t2 - 0.5) * 0.10);
              albedo = mix(albedo, albedo * vec3(1.10, 1.05, 0.97), fade * storm * 0.55 * polarDamp);
            } else {
              // EnglishEnglish/EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（#21：EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
              float t1 = pnoise(p * 64.0);
              float t2 = pnoise(p * 340.0) * smoothstep(0.2, 0.75, app);
              float t3 = pnoise(p * 1200.0) * smoothstep(0.35, 0.9, app);
              // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（3R English app=0.33 English fade English=1，EnglishEnglishEnglish 0.22 EnglishEnglishEnglish
              // EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
              albedo *= 1.0 + fade * uDetailAmp
                      * ((t1 - 0.5) * 0.13 + (t2 - 0.5) * 0.075 + (t3 - 0.5) * 0.035);
              // === EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ===
              // EnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglish**，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglish
              // "EnglishEnglishEnglishEnglishEnglishEnglishEnglish"，EnglishEnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish）。
              // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish fade EnglishEnglish。
              {
                vec3 pn = vObjPos / uRadius;
                float k = 64.0;
                float e = 0.05;                      // EnglishEnglishEnglishEnglishEnglishEnglish（English 1/20 English）
                float f0 = pnoise(pn * k);
                vec3 g = vec3(
                  pnoise(pn * k + vec3(e, 0, 0)) - f0,
                  pnoise(pn * k + vec3(0, e, 0)) - f0,
                  pnoise(pn * k + vec3(0, 0, e)) - f0);
                n = normalize(n + g * (1.6 * fade * uDetailScaleN));
              }
            }
          }
          // === Issue #28：EnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglish ===
          // EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）+ System III EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglish。
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglish，EnglishEnglishEnglishEnglishEnglish。
          // === EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）===
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish 12 English），EnglishEnglishEnglishEnglish
          // （EnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish festoon。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish
          // EnglishEnglish，EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"——EnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
          if (uBodyId == 5 || uBodyId == 6) {
            float lat = vObjPos.y / uRadius; // EnglishEnglishEnglishEnglishEnglish -1..1
            // EnglishEnglishEnglishEnglish：EnglishEnglishEnglish 12 English（24 EnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglish
            float jets = (uBodyId == 5) ? 24.0 : 16.0;
            float windSpeed = sin(lat * jets + 0.6) * 0.00022;
            float flow = uTime * windSpeed;
            vec3 jp = vObjPos / uRadius;
            // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish |dwind/dlat| EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
            float shear = abs(cos(lat * jets + 0.6));
            // EnglishEnglishEnglishEnglishEnglish ~6:1 EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
            float turb = pnoise(vec3(jp.x * 4.0 + flow, jp.y * 26.0, jp.z * 4.0 + flow * 0.5))
                       * (0.05 + 0.11 * shear) * smoothstep(0.015, 0.12, app);
            albedo *= 1.0 + turb;
            // EnglishEnglish（eddy）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）
            float eddyN = pnoise(vec3(jp.x * 9.0 - flow * 0.7, jp.y * 42.0, jp.z * 9.0 - flow * 0.35));
            float eddy = smoothstep(0.60, 0.86, eddyN) * shear
                       * smoothstep(0.03, 0.18, app);
            albedo = mix(albedo, albedo * vec3(1.13, 1.06, 0.96), eddy * 0.40);
            // EnglishEnglishEnglish（EnglishEnglishEnglish）：EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
            if (uBodyId == 5) {
              float conv = pnoise(jp * 25.0 + vec3(uTime * 0.03)) * smoothstep(0.15, 0.5, app);
              albedo *= 1.0 + conv * 0.06;
            }
            // EnglishEnglishEnglish：EnglishEnglish（EnglishEnglishEnglishEnglishEnglish）EnglishEnglish GRS English ~22°S——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
            // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglish。
            // English UV EnglishEnglishEnglishEnglish（EnglishEnglishEnglish UV EnglishEnglishEnglishEnglish）：EnglishEnglish GRS EnglishEnglish u≈0.368, v≈0.628。
            if (uBodyId == 5) {
              vec2 grsD = vec2(angleDiff(vUv.x, 0.368), vUv.y - 0.628);
              float grs = (1.0 - smoothstep(0.008, 0.040, abs(grsD.x)))
                        * (1.0 - smoothstep(0.004, 0.022, abs(grsD.y)));
              vec3 grsCol = albedo * vec3(1.80, 0.74, 0.52) + vec3(0.05, 0.004, 0.0);
              albedo = mix(albedo, grsCol, grs * 0.85);
            }
          }
          // === Issue #36：EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish） ===
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ~51° EnglishEnglishEnglish 70% EnglishEnglish，EnglishEnglishEnglishEnglishEnglish
          // EnglishEnglishEnglishEnglish（EnglishEnglish 80°+），EnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish —— EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
          if (uBodyId == 3) { // EnglishEnglish：EnglishEnglishEnglish 23.5°，EnglishEnglishEnglishEnglish（EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
            float lat = vObjPos.y / uRadius;
            float ss = uSubsolarLat / 23.5;
            float nCap = smoothstep(0.85 + ss * 0.04, 0.92 + ss * 0.04, lat);
            float sCap = smoothstep(0.85 - ss * 0.04, 0.92 - ss * 0.04, -lat);
            float cap = max(nCap, sCap);
            albedo = mix(albedo, vec3(0.95, 0.97, 1.0), cap * 0.5);
          }
          if (uBodyId == 4) { // EnglishEnglish：EnglishEnglishEnglishEnglish（CO₂ EnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
            float latS = vObjPos.y / uRadius; // sin(EnglishEnglish)
            // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish Ls=270°；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish Ls=90°
            float winterN = 0.5 + 0.5 * cos((uLs - 270.0) * 0.0174532925);
            float winterS = 0.5 + 0.5 * cos((uLs - 90.0) * 0.0174532925);
            // EnglishEnglishEnglishEnglishEnglishEnglish sin(82°)≈0.990；EnglishEnglishEnglishEnglishEnglishEnglish sin(55°)≈0.819
            float edgeN = mix(0.990, 0.819, winterN * winterN);
            float edgeS = mix(0.990, 0.819, winterS * winterS);
            float capN = smoothstep(edgeN - 0.015, edgeN + 0.02, latS);
            float capS = smoothstep(edgeS - 0.015, edgeS + 0.02, -latS);
            float cap = max(capN, capS);
            // CO₂ EnglishEnglishEnglishEnglish、English；EnglishEnglishEnglishEnglishEnglishEnglishEnglish
            albedo = mix(albedo, vec3(0.92, 0.94, 0.99), cap * 0.55);
          }
        }
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；BODY_GRADE English）
        // EnglishEnglishEnglishEnglishEnglish（DISPLAY_GRADE）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        albedo *= uGrade;
        albedo = mix(albedo, dot(albedo, vec3(0.2126, 0.7152, 0.0722)) * uNaturalTint, uNaturalTintMix);
        albedo = mix(vec3(dot(albedo, vec3(0.3333))), albedo, uSat);
        // EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（~0.03-0.06，EnglishEnglishEnglishEnglishEnglish），
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（Blue Marble/EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
        if (uBodyId == 3) {
          float om = clamp((albedo.b - max(albedo.r, albedo.g * 0.9)) * 6.0, 0.0, 1.0);
          // EnglishEnglishEnglishEnglishEnglish：EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglish"（EnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglish
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish 24%。EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglish
          // ——EnglishEnglishEnglishEnglishEnglishEnglishEnglish 0.7–0.9，EnglishEnglishEnglishEnglishEnglishEnglish 0.03–0.06，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
          float lum3 = dot(albedo, vec3(0.3333));
          om *= 1.0 - smoothstep(0.42, 0.68, lum3);
          albedo *= mix(vec3(1.0), vec3(0.52, 0.60, 0.86), om * 0.8);
        }
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（2013 EnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglish+ACES English
        // EnglishEnglishEnglishEnglishEnglish；EnglishEnglish（2017+ EnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        // （~77°N EnglishEnglish 6 EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
        if (uBodyId == 6) {
          vec3 pp = vObjPos / uRadius;
          float poleF = smoothstep(0.84, 0.95, abs(pp.y));
          albedo = mix(albedo, vec3(0.79, 0.74, 0.60), poleF * 0.78);
          float hexBand = smoothstep(0.950, 0.968, pp.y) * (1.0 - smoothstep(0.978, 0.995, pp.y));
          albedo *= 1.0 + cos(6.0 * atan(pp.z, pp.x)) * hexBand * 0.06;
        }
        // EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）；
        // EnglishEnglishEnglishEnglishEnglishEnglish（~200 km，app≈0.93 EnglishEnglishEnglishEnglish < 7.5%R）EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        float veilEff = uVeil;
        if (uDetailMode > 0) veilEff = uVeil * (1.0 - smoothstep(0.50, 0.93, app));
        albedo = mix(albedo, uVeilColor, veilEff);
        float ndl = dot(n, uSunDir);
        float day = smoothstep(-0.06, 0.12, ndl);
        // === Issue #26：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ===
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（1.0035×），UV EnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
        // EnglishEnglishEnglishEnglish（day>0）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）。
        float cloudShadow = 1.0;
        if (uBodyId == 3 && uHasClouds == 1 && uDetailMode > 0) {
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish UV EnglishEnglish（EnglishEnglishEnglishEnglish + EnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
          vec3 cloudCol = texture2D(uCloudTex, cloudUV(vUv, uTime)).rgb;
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English CLOUD_GLSL），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
          cloudShadow = 1.0 - cloudAlpha(cloudCol) * 0.32 * day;
        }
        // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        float ringSh = 1.0;
        if (uHasRing == 1) {
          vec3 rel = vPosW - uCenter;
          float denom = dot(uRingNormal, uSunDir);
          if (abs(denom) > 1e-4) {
            float t = -dot(uRingNormal, rel) / denom;
            if (t > 0.0) {
              float r = length(rel + uSunDir * t);
              float u = (r - uRingInner) / (uRingOuter - uRingInner);
              if (u > 0.0 && u < 1.0) {
                float a = uHasRingTex == 1 ? texture2D(uRingTex, vec2(u, 0.5)).a : 0.3;
                ringSh = 1.0 - a * 0.88;
              }
            }
          }
        }
        // === EnglishEnglishEnglishEnglish：Hapke EnglishEnglishEnglish BRDF EnglishEnglish Lambert ===
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 0° EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 40%+），EnglishEnglishEnglishEnglishEnglish
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，Lambert EnglishEnglishEnglishEnglishEnglish。EnglishEnglish Hapke(1981/1986) EnglishEnglishEnglishEnglishEnglish：
        //   r = (w/4π)·[μ0/(μ0+μ)]·[(1+B(α))·P(α) + H(μ0)H(μ) − 1]
        //   B(α) = B0/(1+tan(α/2)/h)          EnglishEnglishEnglish
        //   P(α) = Henyey-Greenstein（English g = EnglishEnglishEnglishEnglish）
        //   H(x) = (1+2x)/(1+2x√(1−w))        Chandrasekhar EnglishEnglish
        // r EnglishEnglishEnglish cos(EnglishEnglishEnglish)，EnglishEnglishEnglishEnglishEnglishEnglishEnglish ndl；English r·π/w EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        // Lambert，EnglishEnglishEnglishEnglishEnglishEnglishEnglish（uSunI / EnglishEnglish / EnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglish。
        float shade = max(ndl, 0.0);
        if (uHapke == 1) {
          vec3 V = normalize(cameraPosition - vPosW);
          vec3 L = normalize(uSunDir);
          float mu0 = max(dot(n, L), 0.0);
          float mu  = max(dot(n, V), 0.0);
          float ca  = clamp(dot(L, V), -1.0, 1.0);
          float alpha = acos(ca);
          float B = uB0 / (1.0 + tan(alpha * 0.5) / max(uHh, 1e-4));
          float gg = uHg;
          float denom = 1.0 + gg * gg + 2.0 * gg * ca;
          float P = (1.0 - gg * gg) / pow(max(denom, 1e-4), 1.5);
          float sq = sqrt(max(1.0 - uW, 1e-4));
          float H0 = (1.0 + 2.0 * mu0) / (1.0 + 2.0 * mu0 * sq);
          float H1 = (1.0 + 2.0 * mu)  / (1.0 + 2.0 * mu  * sq);
          float r = (uW / 12.566370614) * (mu0 / max(mu0 + mu, 1e-4))
                  * ((1.0 + B) * P + H0 * H1 - 1.0);
          shade = clamp(r * 3.14159265 / max(uW, 1e-3), 0.0, 4.0);
        // EnglishEnglishEnglishEnglishEnglish（English hapkeDiskMean）：EnglishEnglish Hapke EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        shade *= uHapkeNorm;
        }
        // === EnglishEnglishEnglishEnglish（EnglishEnglishEnglish）===
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
        // EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglish**EnglishEnglish、
        // EnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglish**EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
        float eclSh = 1.0;
        if (uEclOn == 1) {
          vec3 toOcc = uEclPos - vPosW;
          float dOcc = max(length(toOcc), 1.0);
          float aOcc = asin(clamp(uEclR / dOcc, 0.0, 1.0));
          // === EnglishEnglishEnglish ===
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish/EnglishEnglishEnglish
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（Baily's beads）。EnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglish**。
          {
            vec3 toOccN = toOcc / dOcc;
            vec3 helper = abs(toOccN.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
            vec3 e1 = normalize(cross(toOccN, helper));
            vec3 e2 = cross(toOccN, e1);
            vec3 toSunN = -normalize(uSunDir);
            float az = atan(dot(toSunN, e2), dot(toSunN, e1));
            float edge = 1.0 + 0.0045 * (sin(az * 9.0) * 0.5
                        + sin(az * 17.0 + 1.3) * 0.3 + sin(az * 31.0 + 2.7) * 0.2);
            aOcc *= edge;
          }
          float aSun = asin(clamp(SUN_RADIUS_KM / max(uSunDistKm, 1.0), 0.0, 1.0));
          float sep = acos(clamp(dot(toOcc / dOcc, normalize(uSunDir)), -1.0, 1.0));
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglish |aOcc−aSun| EnglishEnglishEnglish aSun−aOcc：
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish：9.6° vs 0.05°），
          // EnglishEnglishEnglish sep=0 EnglishEnglishEnglish aSun−aOcc English aSun+aOcc EnglishEnglishEnglish，EnglishEnglishEnglish 50% —— 
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。
          float lo = abs(aOcc - aSun), hi = aOcc + aSun;
          float cover = 1.0 - smoothstep(lo, hi, sep);
          eclSh = 1.0 - cover;
        }
        vec3 col = albedo * shade * uSunI * ringSh * cloudShadow * eclSh;
        // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglish，EnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
        if (uDetailMode == 2) {
          float muv = max(dot(n, normalize(-vPosW)), 0.0);
          col *= 0.55 + 0.45 * pow(muv, 0.55);
        }
        // === Issue #27：EnglishEnglishEnglishEnglishEnglishEnglish ===
        // Ls 180-360 EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish（EnglishEnglish Fe₂O₃ EnglishEnglish）。
        if (uBodyId == 4 && uDetailMode > 0) {
          // EnglishEnglishEnglishEnglishEnglish：Ls 180-220 EnglishEnglish，220-330 EnglishEnglish，330-360 EnglishEnglish
          float stormSeason = smoothstep(180.0, 220.0, uLs) * (1.0 - smoothstep(330.0, 360.0, uLs));
          vec3 dp = vObjPos / uRadius;
          // EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglish
          float dust = 0.5 + 0.5 * pnoise(dp * 4.0 + vec3(uTime * 0.015));
          dust *= 0.6 + 0.4 * pnoise(dp * 10.0 + vec3(uTime * 0.03));
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
          vec3 dustColor = vec3(0.82, 0.62, 0.45);
          float haze = stormSeason * dust * 0.55;
          col = mix(col, col * dustColor * 0.7 + dustColor * 0.12, haze);
        }
        // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglish
        // EnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**：
        // EnglishEnglishEnglishEnglishEnglishEnglish 0.0035，EnglishEnglishEnglishEnglish（sunI≈0.011）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 31%，
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglish 0.35%，EnglishEnglishEnglishEnglish。
        col += albedo * 0.0035 * uSunI;
        // EnglishEnglish（ringshine）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglish）。
        if (uHasRing == 1) {
          float ringSide = max(0.0, dot(n, uRingNormal));
          col += albedo * uRingShine * ringSide;
        }
        if (uHasNight == 1) {
          vec3 city = texture2D(uNight, vUv).rgb;
          // EnglishEnglishEnglishEnglish：3.0 EnglishEnglishEnglish + EnglishEnglishEnglishEnglish（ISS EnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglish；ACES EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
        vec3 cityGlow = city * vec3(1.12, 1.0, 0.82);
        col += cityGlow * (1.0 - day) * 3.0;
        }
        if (uOcean == 1) {
          // EnglishEnglishEnglishEnglishEnglish smoothstep EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
          // 0/1 EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。English 0.02–0.12 EnglishEnglishEnglishEnglish，
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
          float oceanMask = smoothstep(0.02, 0.12, albedo.b - max(albedo.r, albedo.g * 0.9));
          vec3 v = normalize(cameraPosition - vPosW);
          vec3 h = normalize(uSunDir + v);
          // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish ~3° EnglishEnglish），
          // EnglishEnglish 90 EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），1.6 EnglishEnglishEnglishEnglishEnglishEnglishEnglish
          float spec = pow(max(dot(n, h), 0.0), 340.0);
          col += vec3(1.0, 0.97, 0.9) * spec * oceanMask * uSunI * max(ndl, 0.0) * 1.1;
        }
        col += uTerraformTintColor * uTerraformTintStrength;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  mat.userData.uniforms = uniforms;
  return mat;
}

/** EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
 *  Issue #26：EnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）+ EnglishEnglishEnglishEnglish UV。
 *  EnglishEnglishEnglishEnglishEnglish builder EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。 */
export function createCloudMaterial(cloudTex, opts = {}) {
  const R = opts.radiusKm ?? 6371;
  // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish 1.5 km EnglishEnglishEnglish 22 km（EnglishEnglishEnglishEnglishEnglishEnglishEnglish 12–16 km，EnglishEnglishEnglishEnglishEnglish 20 km）。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  const baseR = R * (opts.baseRatio ?? 1.0002);
  const topR = R * (opts.topRatio ?? 1.0035);
  const uniforms = {
    uMap: { value: cloudTex },
    uSunDir: { value: new THREE.Vector3(1, 0, 0) },
    uSunI: { value: 1.0 },
    uTime: { value: 0 }, // English，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    uCenter: { value: new THREE.Vector3() }, // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish，km），EnglishEnglishEnglishEnglish
    uRBase: { value: baseR },
    uRTop: { value: topR },
    uThicknessKm: { value: topR - baseR },
    // EnglishEnglishEnglishEnglishEnglish High EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    uVolumetric: { value: (opts.volumetric ?? (QUALITY.tier === 'high' && QUALITY.detail)) ? 1 : 0 },
    uSteps: { value: QUALITY.cloudN },
    uLightSteps: { value: QUALITY.cloudNL },
    uCameraInside: { value: 0 },
    // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish → EnglishEnglish）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish
    // latLonOf EnglishEnglishEnglish；English builder EnglishEnglishEnglish mesh.quaternion EnglishEnglish。
    uBodyInv: { value: new THREE.Matrix3() },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish alpha EnglishEnglishEnglishEnglishEnglishEnglishEnglish），
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish alpha EnglishEnglishEnglishEnglishEnglish。
    premultipliedAlpha: true,
    // DoubleSide + EnglishEnglishEnglishEnglishEnglish uCameraInside EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      #include <common>
      uniform float uInvScaleY;   // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      #include <logdepthbuf_pars_vertex>
      varying vec2 vUv;
      varying vec3 vNormalW;
      varying vec3 vPosW;
      void main() {
        vUv = uv;
        // EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglish**EnglishEnglishEnglish**：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglish modelMatrix EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 5.6°，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        vNormalW = normalize(mat3(modelMatrix) * vec3(normal.x, normal.y * uInvScaleY, normal.z));
        vPosW = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform sampler2D uMap;
      uniform vec3 uSunDir;
      uniform float uSunI;
      uniform float uTime;
      uniform vec3 uCenter;
      uniform float uRBase;
      uniform float uRTop;
      uniform float uThicknessKm;
      uniform int uVolumetric;   // 0 = EnglishEnglishEnglishEnglishEnglishEnglish（Low / EnglishEnglishEnglish）
      uniform int uSteps;        // EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      uniform int uLightSteps;
      uniform float uCameraInside;  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      uniform mat3 uBodyInv;        // EnglishEnglish → EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      varying vec2 vUv;
      varying vec3 vNormalW;
      varying vec3 vPosW;

      // EnglishEnglishEnglishEnglishEnglishEnglish → (EnglishEnglishEnglish, EnglishEnglishEnglish)；EnglishEnglishEnglishEnglishEnglish (1,-1)
      vec2 raySphere(vec3 ro, vec3 rd, vec3 c, float r) {
        vec3 oc = ro - c;
        float b = dot(oc, rd);
        float h = b * b - (dot(oc, oc) - r * r);
        if (h < 0.0) return vec2(1.0, -1.0);
        h = sqrt(h);
        return vec2(-b - h, -b + h);
      }

      // EnglishEnglishEnglishEnglish → EnglishEnglishEnglish**EnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglish UV
      //
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish vPosW EnglishEnglish
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——
      //   ① EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）；
      //   ② atan EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
      //      EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish。
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      //
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish Three.js SphereGeometry English uv EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish
      // EnglishEnglishEnglishEnglishEnglishEnglish。SphereGeometry EnglishEnglishEnglishEnglish
      //     x = −r·cos(2πu)·sin(θ),  z = r·sin(2πu)·sin(θ)
      // EnglishEnglish atan2(z, x) = π − 2πu，English
      //     u_EnglishEnglish = 0.5 − atan2(z,x)/2π        （**EnglishEnglish** + 0.5）
      // EnglishEnglish +0.5 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglish**。u EnglishEnglish 1−u EnglishEnglishEnglishEnglish
      // SphereGeometry English uv EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，English tests/rendering.test.mjs。
      // v English：uv.y = 1 EnglishEnglishEnglish，EnglishEnglishEnglish 0.5 + asin(y)/π EnglishEnglishEnglishEnglish。
      vec2 latLonOf(vec3 q) {
        vec3 rel = uBodyInv * (q - uCenter);
        float rl = max(length(rel), 0.001);
        return vec2(0.5 - atan(rel.z, rel.x) / 6.2831853,
                    0.5 + asin(clamp(rel.y / rl, -1.0, 1.0)) / 3.14159265);
      }

      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish value-noise，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      ${HASH_GLSL}
      float phash(vec3 p) { return glslHash31(p); }
      float pnoise(vec3 p) {
        vec3 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(phash(i), phash(i + vec3(1,0,0)), f.x), mix(phash(i + vec3(0,1,0)), phash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(phash(i + vec3(0,0,1)), phash(i + vec3(1,0,1)), f.x), mix(phash(i + vec3(0,1,1)), phash(i + vec3(1,1,1)), f.x), f.y),
          f.z);
      }
${CLOUD_GLSL}

      /**
       * EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
       * EnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglish"EnglishEnglishEnglish，
       * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
       */
      /**
       * EnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
       */
      void cloudBasis(vec3 rel, out vec3 east, out vec3 north, out float rl, out float cosLat) {
        rl = max(length(rel), 0.001);
        vec3 nn = rel / rl;
        cosLat = max(length(nn.xz), 0.02);      // EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish
        vec2 h = nn.xz / cosLat;
        east = vec3(-h.y, 0.0, h.x);
        north = cross(nn, east);
      }

      /**
       * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish uv EnglishEnglishEnglish）。
       *
       * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：latLonOf English atan(z, x)，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
       * uv.x English 1 EnglishEnglish 0。dFdx(uv.x) EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，GPU EnglishEnglishEnglishEnglishEnglish
       * mip，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
       * EnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglish**——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
       * EnglishEnglishEnglishEnglish（EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish 0 EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
       * EnglishEnglishEnglishEnglishEnglish；EnglishEnglish mipmap EnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish LOD EnglishEnglish）。
       *
       * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish，
       * EnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglish
       * continue/break，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish dFdx EnglishEnglishEnglishEnglishEnglishEnglish。
       */
      vec2 cloudFootprint(vec3 rel, vec3 east, vec3 north, float rl, float cosLat, bool dxAxis) {
        vec3 d = dxAxis ? dFdx(rel) : dFdy(rel);
        return vec2(dot(d, east) / (6.2831853 * rl * cosLat),
                    dot(d, north) / (3.14159265 * rl));
      }

      float cloudDensity(vec2 uv, float hFrac, vec2 gx, vec2 gy) {
        vec3 cl = textureGrad(uMap, cloudUV(uv, uTime), gx, gy).rgb;
        float prof = smoothstep(0.0, 0.18, hFrac) * (1.0 - smoothstep(0.55, 1.0, hFrac));
        return cloudTau(cl) * prof;
      }

      void main() {
        #include <logdepthbuf_fragment>
        vec3 n = normalize(vNormalW);
        vec3 rd = normalize(vPosW);
        vec3 ro = vec3(0.0);            // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        vec3 L = normalize(uSunDir);

        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish**EnglishEnglish discard EnglishEnglish**English。
        //
        // EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish：
        //  · EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglish continue/break，EnglishEnglishEnglishEnglishEnglishEnglishEnglish dFdx EnglishEnglishEnglish。
        //  · EnglishEnglishEnglishEnglish discard EnglishEnglish——discard EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglish**EnglishEnglishEnglishEnglishEnglish
        //    EnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（1.0），
        //    EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglish mip → EnglishEnglishEnglishEnglish
        //    EnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**：EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        vec3 relE = uBodyInv * (vPosW - uCenter);
        vec3 cEast, cNorth; float cRl, cCos;
        cloudBasis(relE, cEast, cNorth, cRl, cCos);
        vec2 gX = cloudFootprint(relE, cEast, cNorth, cRl, cCos, true);
        vec2 gY = cloudFootprint(relE, cEast, cNorth, cRl, cCos, false);

        // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish），
        // EnglishEnglishEnglish（EnglishEnglish、EnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish，
        // EnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish。EnglishEnglish FrontSide EnglishEnglishEnglish BackSide EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        if (uCameraInside > 0.5) { if (gl_FrontFacing) discard; }
        else { if (!gl_FrontFacing) discard; }

        vec2 tRt = raySphere(ro, rd, uCenter, uRTop);
        float tEnter = max(tRt.x, 0.0);
        if (tRt.y <= tEnter) discard;

        float dayF = smoothstep(-0.06, 0.12, dot(n, L));
        vec3 nightTint = mix(vec3(0.010, 0.013, 0.020), vec3(0.004), dayF);

        // ── EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish ───────────────────────────────────────
        // Low / EnglishEnglishEnglish。SwiftShader EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish，p50）：
        //   EnglishEnglishEnglishEnglish 92.4 ms ｜ EnglishEnglish 99.3 ms（+7%）｜ EnglishEnglish 126.6 ms（+37%）
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 27 ms，EnglishEnglishEnglishEnglish 45 FPS EnglishEnglish 30 EnglishEnglish——
        // EnglishEnglishEnglishEnglishEnglishEnglish High English（EnglishEnglish）EnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglish**EnglishEnglish，EnglishEnglishEnglishEnglish premultipliedAlpha EnglishEnglish。
        if (uVolumetric == 0) {
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglish**，
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——English cloudAlpha（Beer–Lambert）EnglishEnglish cloudDensity。
          // EnglishEnglishEnglish hFrac=0.5 EnglishEnglishEnglishEnglishEnglishEnglishEnglish alpha English，EnglishEnglishEnglishEnglishEnglishEnglishEnglish，
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。
          vec2 luv = cloudUV(latLonOf(ro + rd * tEnter), uTime);
          // EnglishEnglishEnglish**alpha EnglishEnglish**，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。EnglishEnglishEnglishEnglishEnglish
          // EnglishEnglishEnglishEnglish 0.65，EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
          float alpha = cloudAlpha(textureGrad(uMap, luv, gX, gY).rgb) * mix(0.42, 1.0, dayF) * 0.65;
          vec3 col = vec3(max(dot(n, L), 0.0)) * uSunI + nightTint;
          gl_FragColor = vec4(col * alpha, alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          return;
        }

        // ── EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ─────────────────────────
        // EnglishEnglishEnglish 22 km（EnglishEnglish 1.5 km）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglish
        // "EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        vec2 tRb = raySphere(ro, rd, uCenter, uRBase);
        float t1 = min(tRt.y, (tRb.x > 0.0 ? tRb.x : tRt.y));
        if (t1 <= tEnter) discard;
        float span = t1 - tEnter;

        const int N = ${QUALITY.cloudN};
        const int NL = ${QUALITY.cloudNL};
        float ds = span / float(N);
        vec3 acc = vec3(0.0);
        float T = 1.0;
        for (int i = 0; i < N; i++) {
          if (i >= uSteps) break;
          vec3 pp = ro + rd * (tEnter + (float(i) + 0.5) * ds);
          vec3 rel = pp - uCenter;
          float rl = length(rel);
          float hFrac = clamp((rl - uRBase) / max(uThicknessKm, 0.001), 0.0, 1.0);
          float d = cloudDensity(latLonOf(pp), hFrac, gX, gY);
          if (d <= 0.002) continue;
          // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
          float shadow = 0.0;
          for (int j = 1; j <= NL; j++) {
            if (j > uLightSteps) break;
            vec3 q = pp + L * (float(j) * ds);
            float ql = max(length(q - uCenter), 0.001);
            float qh = clamp((ql - uRBase) / max(uThicknessKm, 0.001), 0.0, 1.0);
            shadow += cloudDensity(latLonOf(q), qh, gX, gY);
          }
          float sunT = exp(-shadow * 1.7);
          // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
          float silver = pow(clamp(dot(rd, L), 0.0, 1.0), 8.0) * 1.6;
          float ndl = dot(normalize(rel), L);
          vec3 lit = (vec3(max(ndl, 0.0)) * sunT + vec3(silver * sunT * 0.3)) * uSunI;
          float a = 1.0 - exp(-d * ds * 0.55);
          acc += lit * a * T;
          T *= 1.0 - a;
          if (T < 0.01) break;
        }
        acc += nightTint * (1.0 - T);
        gl_FragColor = vec4(acc, 1.0 - T);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  mat.userData.uniforms = uniforms;
  return mat;
}
