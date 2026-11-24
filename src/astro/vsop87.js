// VSOP87 EnglishEnglishEnglishEnglishEnglishEnglishEnglish：J2000 EnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglish VSOP87 EnglishEnglishEnglishEnglish MB，EnglishEnglishEnglishEnglishEnglishEnglish < 0.001" EnglishEnglish，EnglishEnglishEnglish 50-100KB，
// EnglishEnglish < 0.1° vs JPL Horizons（-3000 English +3000 English）。
//
// VSOP87 EnglishEnglish L/B/R EnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglish"（dynamical ecliptic of date）English，
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish J2000 EnglishEnglishEnglish（English planets.js English Standish EnglishEnglishEnglishEnglish）。
// EnglishEnglishEnglish IAU 1976 EnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglish：
//   Francou, G., Berthier, M., 1998, "VSOP87 solutions"
//   Meeus, J., "Astronomical Algorithms", 2nd ed., Ch. 25/31

import { centuriesTT } from './time.js';
import { KM_PER_AU } from './kepler.js';

// ── VSOP87 EnglishEnglishEnglishEnglish（tools/fetch-vsop87.mjs EnglishEnglishEnglishEnglish，astronomia EnglishEnglishEnglishEnglish） ──
import { VSOP87_DATA } from './vsop87Data.js';

// EnglishEnglishEnglishEnglishEnglish VSOP87 English，pluto EnglishEnglishEnglish null，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
const DATA = { ...VSOP87_DATA, pluto: null };

// ── EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish → J2000 EnglishEnglishEnglish ───────────────────────────────
// VSOP87 English L/B/R English dynamical ecliptic of date English，
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish J2000 EnglishEnglishEnglish（English planets.js EnglishEnglish）。
// EnglishEnglish：EnglishEnglish(of date) → EnglishEnglish(of date) → EnglishEnglish → EnglishEnglish(J2000) → EnglishEnglish(J2000)
// EnglishEnglishEnglishEnglish IAU 1976（Liebe-Pitjeva），±3000 EnglishEnglishEnglish < 0.01°（EnglishEnglishEnglish 0.1° EnglishEnglish）。

const ASEC = Math.PI / (180 * 3600); // EnglishEnglish → EnglishEnglish
const EPS0 = 23.43929111 * Math.PI / 180; // J2000 EnglishEnglishEnglishEnglishEnglish

/** 3×3 EnglishEnglishEnglishEnglishEnglishEnglish（v' = M·v EnglishEnglish，English rotation.js English Rx/Rz EnglishEnglish） */
function mm3(a, b) {
  const r = new Array(9);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
  return r;
}
const Rxm = (t) => [1, 0, 0, 0, Math.cos(t), Math.sin(t), 0, -Math.sin(t), Math.cos(t)];
const Rzm = (t) => [Math.cos(t), Math.sin(t), 0, -Math.sin(t), Math.cos(t), 0, 0, 0, 1];
// EnglishEnglish：SOFA/IAU English Ry English Rx/Rz EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish
const RymSOFA = (t) => [Math.cos(t), 0, Math.sin(t), 0, 1, 0, -Math.sin(t), 0, Math.cos(t)];

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish (date → J2000)，EnglishEnglish 3×3 EnglishEnglishEnglishEnglishEnglish */
function precessionMatrix(T) {
  // IAU 1976 EnglishEnglishEnglish（EnglishEnglish）
  const zeta = (2306.2181 * T + 0.30188 * T * T + 0.017998 * T * T * T) * ASEC;
  const z = (2306.2181 * T + 1.09468 * T * T + 0.018203 * T * T * T) * ASEC;
  const theta = (2004.3109 * T - 0.42665 * T * T - 0.041833 * T * T * T) * ASEC;
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish
  const eps = EPS0 + (-46.8150 * T - 0.00059 * T * T + 0.001813 * T * T * T) * ASEC;

  // v_eclJ2000 = Rx(−ε0) · Rz(−z) · Ry(θ) · Rz(−ζ) · Rx(+ε) · v_eclDate
  const P = mm3(Rzm(-z), mm3(RymSOFA(theta), Rzm(-zeta)));
  return mm3(Rxm(-EPS0), mm3(P, Rxm(eps)));
}

// ── VSOP87 EnglishEnglishEnglishEnglish ────────────────────────────────────────────────────
/** English L0 + L1·T + L2·T² + … ，EnglishEnglish = Σ A·cos(B + C·T) */
function evalSeries(series, T) {
  let sum = 0;
  let tPow = 1;
  for (let n = 0; n < series.length; n++) {
    const terms = series[n];
    let s = 0;
    for (let i = 0; i < terms.length; i++) {
      const t = terms[i];
      s += t[0] * Math.cos(t[1] + t[2] * T);
    }
    sum += s * tPow;
    tPow *= T;
  }
  return sum;
}

/**
 * VSOP87 EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish J2000，km）。
 * @param {string} bodyId mercury|venus|earth|emb|mars|jupiter|saturn|uranus|neptune|pluto
 * @param {number} jdTT TT EnglishEnglishEnglish
 * @returns {{x:number,y:number,z:number}} EnglishEnglishEnglishEnglish J2000 EnglishEnglish (km)
 */
export function planetaryPositionVSOP(bodyId, jdTT) {
  const Tcy = centuriesTT(jdTT);
  // VSOP87 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（millennia），EnglishEnglishEnglishEnglish：
  // EnglishEnglishEnglishEnglish——EnglishEnglish L1 = 6283.076 rad/EnglishEnglish（1000 English），26087.903 = EnglishEnglish rad/EnglishEnglish。
  const T = Tcy / 10;

  // EnglishEnglishEnglishEnglishEnglish VSOP87 English：EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）
  if (bodyId === 'pluto') {
    // English Standish EnglishEnglishEnglishEnglish（English planets.js EnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    return plutoApprox(jdTT);
  }

  const data = DATA[bodyId] || DATA[bodyId === 'emb' ? 'earth' : bodyId];
  if (!data) throw new Error(`VSOP87: unknown body "${bodyId}"`);

  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  const L = evalSeries(data.L, T);
  const B = evalSeries(data.B, T);
  const R = evalSeries(data.R, T);

  // English → EnglishEnglish（EnglishEnglishEnglishEnglishEnglish）
  const cosB = Math.cos(B);
  const x0 = R * cosB * Math.cos(L);
  const y0 = R * cosB * Math.sin(L);
  const z0 = R * Math.sin(B);

  // EnglishEnglishEnglishEnglish → J2000 EnglishEnglish（IAU 1976 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  // EnglishEnglishEnglishEnglish：VSOP87D EnglishEnglish date EnglishEnglishEnglish，EnglishEnglishEnglish J2000 EnglishEnglish precessionMatrix EnglishEnglishEnglish
  const m = precessionMatrix(Tcy);
  const x = m[0] * x0 + m[3] * y0 + m[6] * z0;
  const y = m[1] * x0 + m[4] * y0 + m[7] * z0;
  const z = m[2] * x0 + m[5] * y0 + m[8] * z0;

  return { x: x * KM_PER_AU, y: y * KM_PER_AU, z: z * KM_PER_AU };
}

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglish（VSOP87 EnglishEnglishEnglishEnglishEnglish，English Standish EnglishEnglishEnglishEnglish） */
function plutoApprox(jdTT) {
  // English planets.js English TABLE.pluto EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  const T = centuriesTT(jdTT);
  const aAU = 39.48211675 - 0.00031596 * T;
  const e = 0.24882730 + 0.00005170 * T;
  const iDeg = 17.14001206 + 0.00004818 * T;
  const LDeg = 238.92903833 + 145.20780515 * T;
  const periDeg = 224.06891629 - 0.04062942 * T;
  const nodeDeg = 110.30393684 - 0.01183482 * T;
  const DEG = Math.PI / 180;
  const omega = (periDeg - nodeDeg) * DEG;
  const M = (LDeg - periDeg) * DEG;
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  let E = M;
  for (let k = 0; k < 20; k++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  const xp = aAU * (Math.cos(E) - e);
  const yp = aAU * Math.sqrt(1 - e * e) * Math.sin(E);
  const cw = Math.cos(omega), sw = Math.sin(omega);
  const cO = Math.cos(nodeDeg * DEG), sO = Math.sin(nodeDeg * DEG);
  const ci = Math.cos(iDeg * DEG), si = Math.sin(iDeg * DEG);
  const x = (cw * cO - sw * sO * ci) * xp + (-sw * cO - cw * sO * ci) * yp;
  const y = (cw * sO + sw * cO * ci) * xp + (-sw * sO + cw * cO * ci) * yp;
  const z = (sw * si) * xp + (cw * si) * yp;
  return { x: x * KM_PER_AU, y: y * KM_PER_AU, z: z * KM_PER_AU };
}

/** VSOP87 EnglishEnglishEnglishEnglishEnglishEnglishEnglish */
export function vsop87Supported(bodyId) {
  return bodyId !== 'pluto' && DATA[bodyId] != null;
}
