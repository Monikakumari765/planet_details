// Global constants and coordinate conventions.
// World units are kilometers (km). The world axes use ecliptic J2000 mapped by M:(x,y,z) -> (x,z,-y).

import * as THREE from 'three';


/** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：/en/ EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish fetch EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish） */
export const ASSET_BASE = (typeof document !== 'undefined' && document.documentElement?.dataset?.base) || '/';
/** EnglishEnglishEnglishEnglishEnglishEnglish URL（textures/ data/ dem/ EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish） */
export const asset = (p) => ASSET_BASE + p;

export const KM_PER_AU = 149597870.7;
export const C_KM_S = 299792.458;

// The application UI is English-only.
export const LANG = 'en';

/** EnglishEnglishEnglishEnglish {x,y,z} → three EnglishEnglish Vector3 */
export function eclToWorld(p, out = new THREE.Vector3()) {
  return out.set(p.x, p.z, -p.y);
}

/** EnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglish（double EnglishEnglishEnglish） */
export function eclToWorldArr(p) {
  return [p.x, p.z, -p.y];
}

/** EnglishEnglish J2000 (RA,Dec EnglishEnglish) → EnglishEnglishEnglishEnglish */
export function raDecToWorld(ra, dec, out = new THREE.Vector3()) {
  const OBL = (23.43928 * Math.PI) / 180;
  const xq = Math.cos(dec) * Math.cos(ra);
  const yq = Math.cos(dec) * Math.sin(ra);
  const zq = Math.sin(dec);
  // EnglishEnglish→EnglishEnglish: Rx(−ε)
  const xe = xq;
  const ye = yq * Math.cos(OBL) + zq * Math.sin(OBL);
  const ze = -yq * Math.sin(OBL) + zq * Math.cos(OBL);
  return out.set(xe, ze, -ye);
}

/** 3x3 EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish）→ three EnglishEnglishEnglishEnglishEnglishEnglish（English M EnglishEnglishEnglishEnglish） */
const M_ECL2WORLD = new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);
const M_INV = M_ECL2WORLD.clone().transpose();
const tmpM = new THREE.Matrix4();
export function eclMatrixToWorldQuat(m9, out = new THREE.Quaternion()) {
  tmpM.set(m9[0], m9[1], m9[2], 0, m9[3], m9[4], m9[5], 0, m9[6], m9[7], m9[8], 0, 0, 0, 0, 1);
  tmpM.premultiply(M_ECL2WORLD).multiply(M_INV);
  return out.setFromRotationMatrix(tmpM);
}

/** EnglishEnglishEnglishEnglishEnglish */
export function formatSpeed(kmS) {
  if (kmS >= KM_PER_AU) return (kmS / KM_PER_AU).toFixed(2) + ' AU/s';
  if (kmS >= 0.01 * C_KM_S) return (kmS / C_KM_S).toFixed(2) + ' c';
  if (kmS >= 1) return kmS >= 1000 ? (kmS / 1000).toFixed(1) + ' Mm/s' : kmS.toFixed(1) + ' km/s';
  return (kmS * 1000).toFixed(1) + ' m/s';
}

export const LY_KM = 9460730472580.8; // 1 EnglishEnglish（km）

/** EnglishEnglishEnglishEnglishEnglish */
export function formatDist(km) {
  if (km >= LY_KM * 0.01) return (km / LY_KM).toFixed(4) + ' ly';
  if (km >= 0.05 * KM_PER_AU) return (km / KM_PER_AU).toFixed(3) + ' AU';
  if (km >= 1e6) return (km / 1e6).toFixed(2) + ' Mkm';
  if (km >= 1) return Math.round(km).toLocaleString() + ' km';
  return Math.round(km * 1000) + ' m';
}

/**
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（prefers-reduced-motion）。
 * CSS EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish JS EnglishEnglishEnglish，
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglish"EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish matchMedia。
 */
let _reducedMotion = null;
export function prefersReducedMotion() {
  if (_reducedMotion !== null) return _reducedMotion;
  if (typeof window === 'undefined' || !window.matchMedia) return (_reducedMotion = false);
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  _reducedMotion = mq.matches;
  const on = () => { _reducedMotion = mq.matches; };
  if (mq.addEventListener) mq.addEventListener('change', on);
  else mq.addListener?.(on);
  return _reducedMotion;
}
