// English（EnglishEnglish/EnglishEnglish/EnglishEnglishEnglish）EnglishEnglish。
// EnglishEnglishEnglishEnglishEnglishEnglish：
//   1. EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish→EnglishEnglishEnglishEnglish）
//   2. EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish→EnglishEnglishEnglishEnglish）
//   3. EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish→EnglishEnglish，EnglishEnglishEnglish→EnglishEnglishEnglishEnglishEnglish）
//
// **EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**（English planetMaterial.js English uEclOn EnglishEnglish：EnglishEnglishEnglishEnglish
// EnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：
//   ① English MultiplyBlending，English three EnglishEnglishEnglishEnglishEnglish (DstColor, Zero)——EnglishEnglish alpha EnglishEnglishEnglish
//      EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish shadow EnglishEnglish alpha，EnglishEnglishEnglishEnglishEnglishEnglishEnglish uOpacity EnglishEnglishEnglishEnglishEnglish；
//   ② EnglishEnglishEnglishEnglishEnglishEnglish（uColor=0x000000），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish
//      EnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglish**；
//   ③ ConeGeometry EnglishEnglish CylinderGeometry，English uv.x EnglishEnglishEnglishEnglishEnglishEnglish、uv.y EnglishEnglishEnglishEnglish，
//      EnglishEnglishEnglishEnglishEnglish"vUv.x = EnglishEnglish"EnglishEnglish，EnglishEnglish"EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglish transparent+DoubleSide EnglishEnglishEnglishEnglishEnglish（English rings.js EnglishEnglishEnglishEnglish），EnglishEnglishEnglish dst × col²。
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。

/**
 * EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 */
/** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。 */
function pushOccluder(receiver, occ, camPosKm, sunDistKm) {
  const u = receiver?.mat?.userData?.uniforms;
  if (!u?.uEclOn) return;
  if (!occ) { u.uEclOn.value = 0; return; }
  u.uEclOn.value = 1;
  // EnglishEnglishEnglish（EnglishEnglishEnglishEnglish = EnglishEnglishEnglishEnglish − EnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglish vPosW EnglishEnglishEnglishEnglishEnglish）
  u.uEclPos.value.set(occ.posKm[0] - camPosKm[0], occ.posKm[1] - camPosKm[1], occ.posKm[2] - camPosKm[2]);
  u.uEclR.value = occ.phys.radiusKm;
  u.uSunDistKm.value = sunDistKm;
}

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 *  EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（Io EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。 */
const ECLIPSE_RECEIVERS = ['earth', 'moon', 'io', 'europa', 'ganymede', 'callisto', 'titan'];

export class EclipseSystem {
  constructor() {
    this._nextEclipseCache = null;
    this._nextEclipseJd = 0;
  }

  /**
   * EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   * @param {number} jdTT - EnglishEnglishEnglish TT（EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
   * @param {Map} bodies - builder.bodies: id → { posKm, phys, mesh, ... }
   * @param {Float64Array} camPosKm - EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish km）
   */
  update(jdTT, bodies, camPosKm) {
    const sun = bodies.get('sun');
    if (!sun) return;

    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 0，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    for (const id of ECLIPSE_RECEIVERS) pushOccluder(bodies.get(id), null, camPosKm, 1);
    const distTo = (a) => Math.hypot(a.posKm[0], a.posKm[1], a.posKm[2]);

    const moon = bodies.get('moon');
    const earth = bodies.get('earth');

    // ── EnglishEnglish：EnglishEnglish→EnglishEnglish ──
    if (moon && earth) pushOccluder(earth, moon, camPosKm, distTo(earth));

    // ── EnglishEnglish：EnglishEnglish→EnglishEnglish ──
    if (moon && earth) pushOccluder(moon, earth, camPosKm, distTo(moon));

    // ── EnglishEnglish→EnglishEnglishEnglishEnglishEnglish ──
    const jupiter = bodies.get('jupiter');
    if (jupiter) {
      for (const moonId of ['io', 'europa', 'ganymede', 'callisto']) {
        const m = bodies.get(moonId);
        if (m) pushOccluder(m, jupiter, camPosKm, distTo(m));
      }
    }

    // ── EnglishEnglish→EnglishEnglishEnglish ──
    const saturn = bodies.get('saturn');
    const titan = bodies.get('titan');
    if (saturn && titan) pushOccluder(titan, saturn, camPosKm, distTo(titan));
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   * @param {string} type - 'solar' | 'lunar'
   * @param {number} fromJd - EnglishEnglish JD
   * @param {Function} getPositions - (jdTT) => { sun, moon, earth } EnglishEnglish
   * @returns {number} EnglishEnglishEnglishEnglishEnglish JD
   */
  getNextEclipse(type, fromJd, getPositions) {
    const R_SUN = 696000, R_EARTH = 6371, R_MOON = 1737.4;
    const hit = (jd) => {
      const p = getPositions(jd);
      return p ? isEclipse(type, p, R_SUN, R_EARTH, R_MOON) : false;
    };

    // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglishEnglish 1 EnglishEnglishEnglishEnglishEnglish 183 English = 26.3 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，30 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。
    const COARSE = 1 / 48;               // 30 EnglishEnglish
    const endJd = fromJd + 183;          // 6 EnglishEnglish
    for (let jd = fromJd; jd < endJd; jd += COARSE) {
      if (!hit(jd)) continue;
      // EnglishEnglishEnglishEnglishEnglish [jd-COARSE, jd]，EnglishEnglishEnglish 1 EnglishEnglishEnglishEnglish
      let lo = jd - COARSE, hi = jd;
      for (let i = 0; i < 20 && hi - lo > 1 / 1440; i++) {
        const mid = (lo + hi) / 2;
        if (hit(mid)) hi = mid; else lo = mid;
      }
      return hi;
    }
    return null;
  }
}

/** EnglishEnglish：EnglishEnglish"EnglishEnglishEnglishEnglishEnglish > 0.999"（EnglishEnglish 2.56°，EnglishEnglish"EnglishEnglishEnglishEnglish/English"，EnglishEnglishEnglishEnglishEnglishEnglishEnglish
 *  EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglish**——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 *  EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；
 *  EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。 */
export function isEclipse(type, p, R_SUN, R_EARTH, R_MOON) {
  const occ = type === 'solar' ? p.moon : p.earth;   // EnglishEnglishEnglish
  const rec = type === 'solar' ? p.earth : p.moon;   // EnglishEnglishEnglish
  const occR = type === 'solar' ? R_MOON : R_EARTH;
  const recR = type === 'solar' ? R_EARTH : R_MOON;

  // EnglishEnglishEnglish：EnglishEnglish → EnglishEnglishEnglish
  const ax = occ[0] - p.sun[0], ay = occ[1] - p.sun[1], az = occ[2] - p.sun[2];
  const dSunOcc = Math.hypot(ax, ay, az);
  if (!(dSunOcc > 0)) return false;
  const nx = ax / dSunOcc, ny = ay / dSunOcc, nz = az / dSunOcc;

  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  const rx = rec[0] - occ[0], ry = rec[1] - occ[1], rz = rec[2] - occ[2];
  const proj = rx * nx + ry * ny + rz * nz;          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  if (proj <= 0) return false;                        // EnglishEnglishEnglishEnglishEnglishEnglishEnglish

  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：R_occ − (R_sun − R_occ)·proj / dSunOcc（EnglishEnglishEnglish = EnglishEnglishEnglishEnglish）
  const umbraR = occR - (R_SUN - occR) * proj / dSunOcc;

  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  const px = rx - proj * nx, py = ry - proj * ny, pz = rz - proj * nz;
  const perp = Math.hypot(px, py, pz);

  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（|umbraR| + recR）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，English"EnglishEnglishEnglishEnglish"EnglishEnglish
  return perp < Math.abs(umbraR) + recR;
}
