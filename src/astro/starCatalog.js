// EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish BSC5, CDS V/50）EnglishEnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglish tools/fetch-stars.mjs EnglishEnglish：public/data/stars.bin EnglishEnglishEnglish 9096 English，
// src/astro/stars.generated.js EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish）。
//
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish JS EnglishEnglishEnglish：9096 English × 5 English float EnglishEnglishEnglish JS EnglishEnglishEnglishEnglishEnglishEnglish，
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
import { asset } from '../config.js';

/** EnglishEnglishEnglishEnglish：f32 raDeg, f32 decDeg, f32 vmag, f32 bv, f32 distLy */
export const STAR_RECORD_BYTES = 20;
const HEADER_BYTES = 12;
const MAGIC = 'SWST';

/**
 * EnglishEnglish stars.bin。EnglishEnglishEnglish，Node EnglishEnglishEnglishEnglishEnglish。
 * @returns {{ count:number, ra:Float32Array, dec:Float32Array, mag:Float32Array,
 *             bv:Float32Array, distLy:Float32Array }|null}
 */
export function parseStarCatalog(buffer) {
  const dv = new DataView(buffer);
  if (buffer.byteLength < HEADER_BYTES) return null;
  if (String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3)) !== MAGIC) return null;
  const version = dv.getUint16(4, true);
  if (version !== 1) return null;                       // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish
  const count = dv.getUint32(8, true);
  if (buffer.byteLength < HEADER_BYTES + count * STAR_RECORD_BYTES) return null;
  const ra = new Float32Array(count), dec = new Float32Array(count);
  const mag = new Float32Array(count), bv = new Float32Array(count);
  const distLy = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const o = HEADER_BYTES + i * STAR_RECORD_BYTES;
    ra[i] = dv.getFloat32(o, true);
    dec[i] = dv.getFloat32(o + 4, true);
    mag[i] = dv.getFloat32(o + 8, true);
    bv[i] = dv.getFloat32(o + 12, true);
    distLy[i] = dv.getFloat32(o + 16, true);
  }
  return { count, ra, dec, mag, bv, distLy };
}

let _cache = null;

/** EnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglish null（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish） */
export async function loadStarCatalog() {
  if (_cache !== null) return _cache;
  try {
    const r = await fetch(asset('data/stars.bin'), { signal: AbortSignal.timeout(20000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    _cache = parseStarCatalog(await r.arrayBuffer());
    if (_cache) console.info(`[stars] EnglishEnglish ${_cache.count} English`);
  } catch (e) {
    console.info('[stars] EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish', e?.message ?? e);
    _cache = null;
  }
  return _cache;
}

/** B−V EnglishEnglishEnglish → EnglishEnglish RGB。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 *  B−V EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（Ballesteros 2012）：T = 4600·(1/(0.92·BV+1.7) + 1/(0.92·BV+0.62)) */
export function bvToRgb(bv, out = [1, 1, 1]) {
  const b = Math.max(-0.4, Math.min(2.0, bv));
  const T = 4600 * (1 / (0.92 * b + 1.7) + 1 / (0.92 * b + 0.62));
  // EnglishEnglish → RGB（Tanner Helland EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish G=1）
  const t = T / 100;
  let r, g, bl;
  if (t <= 66) { r = 255; g = 99.4708025861 * Math.log(t) - 161.1195681661; }
  else { r = 329.698727446 * Math.pow(t - 60, -0.1332047592); g = 288.1221695283 * Math.pow(t - 60, -0.0755148492); }
  if (t >= 66) bl = 255;
  else if (t <= 19) bl = 0;
  else bl = 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  const cl = (x) => Math.max(0, Math.min(255, x)) / 255;
  r = cl(r); g = cl(g); bl = cl(bl);
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 1：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish，
  // EnglishEnglishEnglishEnglishEnglish G/B EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  const m = Math.max(r, g, bl) || 1;
  out[0] = r / m; out[1] = g / m; out[2] = bl / m;
  return out;
}

/** EnglishEnglish → EnglishEnglish**EnglishEnglish**。Pogson EnglishEnglish：EnglishEnglish 5 EnglishEnglishEnglishEnglish 100 English，0 English = 1。
 *  EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English magToDisplayIntensity）。 */
export function magToIntensity(mag) {
  return Math.pow(10, -0.4 * mag);
}

/**
 * EnglishEnglish → **EnglishEnglish**EnglishEnglish。
 *
 * EnglishEnglishEnglish Pogson EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：6 EnglishEnglishEnglish 0 EnglishEnglish 250 English，English 8 EnglishEnglishEnglishEnglishEnglish
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglish 6 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish BSC5 EnglishEnglishEnglish 6.5 English
 * EnglishEnglishEnglish）。EnglishEnglish：EnglishEnglishEnglish Pogson English，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 *
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglish"EnglishEnglish"：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
 * EnglishEnglishEnglishEnglishEnglishEnglish（Weber–Fechner EnglishEnglishEnglish），6 EnglishEnglishEnglish 1 EnglishEnglishEnglish**EnglishEnglish**EnglishEnglishEnglishEnglishEnglish
 * 100 English。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 *
 * EnglishEnglish 0.55 English 0 English → 1、6.5 English → English 0.037（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），
 * EnglishEnglishEnglish（−1.46 English）→ English 2.1 EnglishEnglish 0 EnglishEnglish。
 */
export function magToDisplayIntensity(mag) {
  return Math.pow(magToIntensity(mag), 0.55);
}
