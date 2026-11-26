// EnglishEnglishEnglishEnglishEnglish（#38）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglishEnglishEnglishEnglish：
// 1. EnglishEnglishEnglishEnglish（toggleHuman）：EnglishEnglishEnglishEnglishEnglishEnglishEnglish 1.7 m EnglishEnglishEnglishEnglishEnglishEnglish，
//    EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglish——
//    EnglishEnglishEnglishEnglishEnglish 1.7 m EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// 2. EnglishEnglishEnglishEnglish（toggleCompare）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
//    EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish、EnglishEnglish、EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglish）。
//    3D EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish / EnglishEnglishEnglishEnglishEnglishEnglishEnglish world，EnglishEnglishEnglish scene EnglishEnglish。
// EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish = max(near×5, 500) km，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。

import * as THREE from 'three';
import { t, LANG } from './i18n.js';

// ── EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish：NASA/IAU，English bodies.js EnglishEnglish）──────────────────
const EARTH_RADIUS_KM = 6371.0;
const MOON_RADIUS_KM = 1737.4;
const EARTH_MOON_DIST_KM = 384400; // EnglishEnglishEnglishEnglish
const LIGHT_TIME_S = EARTH_MOON_DIST_KM / 299792.458; // ≈1.28 s

// ── EnglishEnglish i18n EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish key EnglishEnglish i18n.js EnglishEnglishEnglishEnglishEnglish）──────────
const I18N = {
  'scaleref.title': { en: 'Earth – Moon Scale' },
  'scaleref.earthD': { en: 'Earth Ø' },
  'scaleref.moonD': { en: 'Moon Ø' },
  'scaleref.distance': { en: 'Avg. distance' },
  'scaleref.lightTime': { en: 'Light travel' },
  'scaleref.scale': { en: 'Scale' },
  'scaleref.human': { en: 'Human reference 1.7 m' },
};

function tt(key, vars) {
  const g = t(key, vars);
  if (g !== key) return g;
  const e = I18N[key];
  if (!e) return key;
  let s = typeof e === 'string' ? e : (e[LANG] ?? e.en ?? e.zh ?? key);
  if (vars) for (const k in vars) s = s.replaceAll('{' + k + '}', vars[k]);
  return s;
}

// EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _pos = new THREE.Vector3();

export class ScaleReference {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   */
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this._human = null;       // THREE.Group
    this._humanGeos = [];
    this._humanMat = null;
    this._compareGroup = null; // THREE.Group
    this._compareGeos = [];
    this._compareMats = [];
    this._compareOverlay = null;
    this._curCompareScale = 0;
  }

  // ── EnglishEnglishEnglishEnglish ────────────────────────────────────────────────────────

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglish（true=EnglishEnglish） */
  toggleHuman() {
    if (this._human) {
      this._disposeHuman();
      return false;
    }
    this._createHuman();
    return true;
  }

  _createHuman() {
    const group = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: 0x2a3a4a });

    // EnglishEnglish（EnglishEnglish）：EnglishEnglish 0.2m，EnglishEnglish 1.1m → EnglishEnglish 1.5m
    const bodyGeo = new THREE.CapsuleGeometry(0.0002, 0.0011, 4, 8);
    const body = new THREE.Mesh(bodyGeo, mat);
    body.position.y = 0.00075; // EnglishEnglishEnglishEnglish，EnglishEnglishEnglish y=0
    group.add(body);

    // EnglishEnglish（EnglishEnglish）：EnglishEnglish 0.12m
    const headGeo = new THREE.SphereGeometry(0.00012, 12, 8);
    const head = new THREE.Mesh(headGeo, mat);
    head.position.y = 0.00162; // EnglishEnglishEnglishEnglish + EnglishEnglishEnglish
    group.add(head);

    // EnglishEnglish ≈ 0.00174 km = 1.74m（EnglishEnglish 1.7m EnglishEnglish）
    this._human = group;
    this._humanGeos = [bodyGeo, headGeo];
    this._humanMat = mat;
    this.scene.add(group);
  }

  _updateHuman(camPos, camQuat) {
    _forward.set(0, 0, -1).applyQuaternion(camQuat);
    _right.set(1, 0, 0).applyQuaternion(camQuat);
    _up.set(0, 1, 0).applyQuaternion(camQuat);

    // EnglishEnglishEnglishEnglishEnglishEnglish 5m、EnglishEnglish 2m、EnglishEnglish 1.5m（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    _pos.copy(camPos)
      .addScaledVector(_forward, 0.005)
      .addScaledVector(_right, 0.002)
      .addScaledVector(_up, -0.0015);
    this._human.position.copy(_pos);
  }

  _disposeHuman() {
    if (!this._human) return;
    this.scene.remove(this._human);
    for (const g of this._humanGeos) g.dispose();
    this._humanMat?.dispose();
    this._human = null;
    this._humanGeos = [];
    this._humanMat = null;
  }

  // ── EnglishEnglishEnglishEnglishEnglishEnglish ────────────────────────────────────────────────────

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglish（true=EnglishEnglish） */
  toggleCompare() {
    if (this._compareGroup) {
      this._disposeCompare();
      return false;
    }
    this._createCompare();
    return true;
  }

  _createCompare() {
    const group = new THREE.Group();

    // EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS_KM, 32, 16);
    const earthMat = new THREE.MeshBasicMaterial({ color: 0x2266bb });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.position.x = -EARTH_MOON_DIST_KM / 2;
    group.add(earth);

    // EnglishEnglish：EnglishEnglishEnglishEnglish（=EnglishEnglishEnglish 27.3%）
    const moonGeo = new THREE.SphereGeometry(MOON_RADIUS_KM, 24, 12);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.x = EARTH_MOON_DIST_KM / 2;
    group.add(moon);

    // EnglishEnglishEnglishEnglishEnglish
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-EARTH_MOON_DIST_KM / 2, 0, 0),
      new THREE.Vector3(EARTH_MOON_DIST_KM / 2, 0, 0),
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x6688aa, transparent: true, opacity: 0.35 });
    const line = new THREE.Line(lineGeo, lineMat);
    group.add(line);

    this._compareGroup = group;
    this._compareGeos = [earthGeo, moonGeo, lineGeo];
    this._compareMats = [earthMat, moonMat, lineMat];
    this.scene.add(group);

    // HTML EnglishEnglishEnglishEnglish
    this._createCompareOverlay();
  }

  _createCompareOverlay() {
    const el = document.createElement('div');
    el.className = 'scaleref-overlay';
    el.style.cssText = [
      'position:fixed', 'top:14px', 'left:50%', 'transform:translateX(-50%)',
      'z-index:15', 'pointer-events:none',
      'background:rgba(3,6,15,0.86)', 'border:1px solid rgba(56,189,248,0.22)',
      'border-radius:8px', 'padding:10px 16px',
      'font-size:13px', 'line-height:1.7', 'color:#f8fafc',
      'box-shadow:0 8px 32px rgba(0,0,0,0.75)',
      'backdrop-filter:blur(16px)', 'white-space:nowrap',
      'font-family:inherit',
    ].join(';');

    const fmt = (n) => n.toLocaleString();
    el.innerHTML = [
      `<div style="font-size:14px;font-weight:bold;color:#f8fafc;margin-bottom:4px;">${tt('scaleref.title')}</div>`,
      `<div>${tt('scaleref.earthD')}: <b>${fmt(Math.round(EARTH_RADIUS_KM * 2))}</b> km</div>`,
      `<div>${tt('scaleref.moonD')}: <b>${fmt(Math.round(MOON_RADIUS_KM * 2))}</b> km <span style="opacity:0.6">(${(MOON_RADIUS_KM / EARTH_RADIUS_KM * 100).toFixed(1)}%)</span></div>`,
      `<div>${tt('scaleref.distance')}: <b>${fmt(EARTH_MOON_DIST_KM)}</b> km <span style="opacity:0.6">(${(EARTH_MOON_DIST_KM / EARTH_RADIUS_KM).toFixed(1)} R⊕)</span></div>`,
      `<div>${tt('scaleref.lightTime')}: <b>${LIGHT_TIME_S.toFixed(2)}</b> s</div>`,
      `<div class="sr-scale-row">${tt('scaleref.scale')}: <b class="sr-scale-val">1 : …</b></div>`,
    ].join('');

    document.body.appendChild(el);
    this._compareOverlay = el;
  }

  _updateCompare(camPos, camQuat) {
    // EnglishEnglishEnglishEnglish FOV / EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    const fovRad = this.camera.fov * Math.PI / 180;
    const hFovRad = 2 * Math.atan(Math.tan(fovRad / 2) * this.camera.aspect);
    const limitingFov = Math.min(fovRad, hFovRad);

    // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish × 5（EnglishEnglishEnglish），EnglishEnglishEnglish 500 km
    const minDist = Math.max(this.camera.near * 5 + 10, 500);
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ~60%
    const viewWidth = 2 * minDist * Math.tan(limitingFov / 2);
    const scale = (viewWidth * 0.6) / EARTH_MOON_DIST_KM;

    _forward.set(0, 0, -1).applyQuaternion(camQuat);
    this._compareGroup.position.copy(camPos).addScaledVector(_forward, minDist);
    this._compareGroup.scale.setScalar(scale);

    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish >1% EnglishEnglish DOM）
    if (Math.abs(this._curCompareScale - scale) / Math.max(scale, 1e-9) > 0.01) {
      this._curCompareScale = scale;
      const ratio = Math.round(1 / scale);
      const val = this._compareOverlay?.querySelector('.sr-scale-val');
      if (val) val.textContent = `1 : ${ratio.toLocaleString()}`;
    }
  }

  _disposeCompare() {
    if (!this._compareGroup) return;
    this.scene.remove(this._compareGroup);
    for (const g of this._compareGeos) g.dispose();
    for (const m of this._compareMats) m.dispose();
    this._compareOverlay?.remove();
    this._compareGroup = null;
    this._compareGeos = [];
    this._compareMats = [];
    this._compareOverlay = null;
    this._curCompareScale = 0;
  }

  // ── EnglishEnglishEnglishEnglish ────────────────────────────────────────────────────────

  /**
   * EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish / EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   * @param {object} [state] EnglishEnglish（EnglishEnglishEnglishEnglish）；EnglishEnglishEnglish this.camera EnglishEnglish
   */
  update(state = {}) {
    if (!this._human && !this._compareGroup) return;
    // EnglishEnglish/EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish——EnglishEnglish WebGL EnglishEnglish，
    // body.cinematic EnglishEnglish CSS EnglishEnglishEnglish，EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    const show = !state.cinematic;
    if (this._human) this._human.visible = show;
    if (this._compareGroup) this._compareGroup.visible = show;
    if (!show) return;
    const camPos = this.camera.position;
    const camQuat = this.camera.quaternion;
    if (this._human) this._updateHuman(camPos, camQuat);
    if (this._compareGroup) this._updateCompare(camPos, camQuat);
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
  dispose() {
    this._disposeHuman();
    this._disposeCompare();
  }
}
