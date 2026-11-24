// EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish Horizons EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（moonsData.generated.js）。
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish J2000 EnglishEnglish（km）。
//
// EnglishEnglishEnglishEnglishEnglish（λ/ϖ/Ω EnglishEnglishEnglishEnglish，English tools/fit-moons.mjs）：
//   Ω(t) = Ω₀ + Ω̇·Δt，ϖ(t) = ϖ₀ + ϖ̇·Δt，M(t) = M₀ + n·Δt，EnglishEnglish n = λ̇ − ϖ̇
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish Horizons EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）。

import { elementsToEcliptic, KM_PER_AU } from './kepler.js';
import { MOON_ELEMENTS as FITTED_ELEMENTS, MOON_EPOCH_JD } from './moonsData.generated.js';
import { MOON_PHYS } from './bodies.js';
import { sampledPosition, sampledState } from './sampledEphemeris.js';
import { moonGeocentric } from './moon.js';

/**
 * EnglishEnglishEnglish/English/English/English：**EnglishEnglish** Horizons EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 *
 * EnglishEnglishEnglishEnglishEnglishEnglish：`moonsData.generated.js` English tools/fit-moons.mjs EnglishEnglishEnglishEnglish，EnglishEnglish
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"902–905 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish，
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish）。
 *
 * EnglishEnglishEnglishEnglish：New Horizons EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish/EnglishEnglishEnglishEnglish JPL Solar System
 * Dynamics English Buie English 2012 EnglishEnglishEnglishEnglishEnglish；e、i EnglishEnglish <0.01 / <1°，English"EnglishEnglishEnglishEnglish"
 * EnglishEnglish）。**EnglishEnglishEnglishEnglishEnglish Horizons，EnglishEnglishEnglish npm run fit-moons EnglishEnglishEnglishEnglishEnglishEnglish**——
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglish MOON_ELEMENTS EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
 *
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish e English <0.006）。
 */
const PUBLISHED_ELEMENTS = {
  nix:      { aKm: 48694, e: 0.0020, iDeg: 0.15, nodeDeg: 223.0, periDeg: 0, M0Deg: 0, nDegPerDay: 360 / 24.8546, nodeDotDegPerDay: 0, periDotDegPerDay: 0 },
  hydra:    { aKm: 64738, e: 0.0059, iDeg: 0.24, nodeDeg: 223.0, periDeg: 0, M0Deg: 0, nDegPerDay: 360 / 38.2018, nodeDotDegPerDay: 0, periDotDegPerDay: 0 },
  kerberos: { aKm: 57783, e: 0.0035, iDeg: 0.39, nodeDeg: 223.0, periDeg: 0, M0Deg: 0, nDegPerDay: 360 / 32.1676, nodeDotDegPerDay: 0, periDotDegPerDay: 0 },
  styx:     { aKm: 42656, e: 0.0002, iDeg: 0.81, nodeDeg: 223.0, periDeg: 0, M0Deg: 0, nDegPerDay: 360 / 20.1616, nodeDotDegPerDay: 0, periDotDegPerDay: 0 },
};

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：**EnglishEnglishEnglishEnglishEnglish**（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）。 */
const MOON_ELEMENTS = { ...PUBLISHED_ELEMENTS, ...FITTED_ELEMENTS };

export const MOON_IDS = Object.keys(MOON_ELEMENTS);

const RATES_CACHE = new Map();

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglish（deg/day）：{ node: Ω̇, peri: ϖ̇, mCorr: 0 }；EnglishEnglishEnglishEnglishEnglishEnglishEnglish */
export function moonSecularRates(id) {
  if (RATES_CACHE.has(id)) return RATES_CACHE.get(id);
  const el = MOON_ELEMENTS[id];
  const rates = {
    node: el?.nodeDotDegPerDay ?? 0,
    peri: el?.periDotDegPerDay ?? 0,
    mCorr: 0, // λ̇ EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish nDegPerDay English，EnglishEnglishEnglishEnglishEnglishEnglish
  };
  RATES_CACHE.set(id, rates);
  return rates;
}

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（km，EnglishEnglish J2000；English J2 EnglishEnglishEnglishEnglish） */
export function moonLocalPosition(id, jdTT) {
  const sampled = sampledPosition(id, jdTT);
  if (sampled) return sampled;
  const el = MOON_ELEMENTS[id];
  const dt = jdTT - MOON_EPOCH_JD;
  const r = moonSecularRates(id);
  const M = el.M0Deg + (el.nDegPerDay + r.mCorr) * dt;
  const periDeg = el.periDeg + r.peri * dt;
  const nodeDeg = el.nodeDeg + r.node * dt;
  return elementsToEcliptic({
    aAU: el.aKm / KM_PER_AU,
    e: el.e,
    iDeg: el.iDeg,
    LDeg: periDeg + M,
    periDeg,
    nodeDeg,
  });
}

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：n ∝ r × v，r EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
function normalFromPosition(posFn, jdTT, hDays) {
  const a = posFn(jdTT - hDays), b = posFn(jdTT + hDays);
  const vx = (b.x - a.x) / (2 * hDays), vy = (b.y - a.y) / (2 * hDays), vz = (b.z - a.z) / (2 * hDays);
  const x = a.y * vz - a.z * vy, y = a.z * vx - a.x * vz, z = a.x * vy - a.y * vx;
  const r = Math.hypot(x, y, z);
  return r > 0 ? { x: x / r, y: y / r, z: z / r } : null;
}

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglish 1/40，EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish 27.32 English） */
const MOON_NORMAL_STEP_DAYS = 27.32 / 40;

/**
 * EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish J2000 EnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 *
 * EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglish——
 * EnglishEnglishEnglishEnglishEnglishEnglish moonGeocentric（Meeus/EnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish Horizons
 * EnglishEnglishEnglishEnglishEnglish（tools/fit-moons.mjs EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 20 EnglishEnglishEnglish，EnglishEnglishEnglishEnglish
 * 27.32 EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish：nDegPerDay English +11.5%，EnglishEnglishEnglishEnglishEnglishEnglishEnglish 160 English）。
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish、EnglishEnglishEnglish"，EnglishEnglishEnglish JPL EnglishEnglishEnglishEnglishEnglishEnglishEnglish
 * （2035 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 4.5°）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 */
export function moonOrbitNormal(id, jdTT) {
  const s = jdTT != null ? sampledState(id, jdTT) : null;
  if (s) {
    const x = s.y * s.vz - s.z * s.vy, y = s.z * s.vx - s.x * s.vz, z = s.x * s.vy - s.y * s.vx;
    const r = Math.hypot(x, y, z);
    if (r > 0) return { x: x / r, y: y / r, z: z / r };
  }
  if (id === 'moon' && jdTT != null) {
    const n = normalFromPosition(moonGeocentric, jdTT, MOON_NORMAL_STEP_DAYS);
    if (n) return n;
  }
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish
  const el = MOON_ELEMENTS[id];
  const i = (el.iDeg * Math.PI) / 180;
  const nodeDeg = jdTT != null
    ? el.nodeDeg + moonSecularRates(id).node * (jdTT - MOON_EPOCH_JD)
    : el.nodeDeg;
  const O = (nodeDeg * Math.PI) / 180;
  return { x: Math.sin(i) * Math.sin(O), y: -Math.sin(i) * Math.cos(O), z: Math.cos(i) };
}

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish，km；EnglishEnglish jdTT EnglishEnglish J2 EnglishEnglishEnglishEnglish） */
export function moonOrbitPoints(id, n = 256, jdTT) {
  const el = MOON_ELEMENTS[id];
  const dt = jdTT != null ? jdTT - MOON_EPOCH_JD : 0;
  const r = jdTT != null ? moonSecularRates(id) : { node: 0, peri: 0 };
  const periDeg = el.periDeg + r.peri * dt;
  const nodeDeg = el.nodeDeg + r.node * dt;
  const pts = new Float64Array(n * 3);
  for (let k = 0; k < n; k++) {
    const p = elementsToEcliptic({
      aAU: el.aKm / KM_PER_AU, e: el.e, iDeg: el.iDeg,
      LDeg: periDeg + (k / (n - 1)) * 360,
      periDeg, nodeDeg,
    });
    pts[k * 3] = p.x; pts[k * 3 + 1] = p.y; pts[k * 3 + 2] = p.z;
  }
  return pts;
}

export { MOON_PHYS };
