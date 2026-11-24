// EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglish。

export const DEG = Math.PI / 180;
export const KM_PER_AU = 149597870.7;

/** EnglishEnglishEnglishEnglishEnglishEnglish [-π, π) */
export function wrapPI(a) {
  a = a % (2 * Math.PI);
  if (a >= Math.PI) a -= 2 * Math.PI;
  if (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

/** EnglishEnglishEnglishEnglishEnglishEnglish [0, 360) English */
export function wrap360(deg) {
  deg = deg % 360;
  return deg < 0 ? deg + 360 : deg;
}

/**
 * EnglishEnglishEnglishEnglishEnglishEnglish M = E − e·sinE。
 * EnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 * @param {number} M EnglishEnglishEnglishEnglish (rad)
 * @param {number} e EnglishEnglishEnglish [0,1)
 * @returns {number} EnglishEnglishEnglishEnglish E (rad)
 */
export function solveKepler(M, e) {
  M = wrapPI(M);
  let E = e < 0.8 ? M : Math.PI * Math.sign(M || 1);
  for (let i = 0; i < 30; i++) {
    const f = E - e * Math.sin(E) - M;
    const fp = 1 - e * Math.cos(E);
    const dE = f / fp;
    E -= dE;
    if (Math.abs(dE) < 1e-13) return E;
  }
  // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  let lo = M - e, hi = M + e;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (mid - e * Math.sin(mid) - M > 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

/**
 * EnglishEnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglish J2000 EnglishEnglishEnglishEnglish（km）。
 * @param {object} el { aAU, e, iDeg, LDeg, periDeg(ϖ), nodeDeg(Ω) }
 */
export function elementsToEcliptic(el) {
  const { aAU, e, iDeg, LDeg, periDeg, nodeDeg } = el;
  const omega = (periDeg - nodeDeg) * DEG; // EnglishEnglishEnglishEnglish ω
  const M = (LDeg - periDeg) * DEG;        // EnglishEnglishEnglishEnglish
  const E = solveKepler(M, e);

  // EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish x'）
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
