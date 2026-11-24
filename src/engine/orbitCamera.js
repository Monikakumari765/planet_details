// Google Earth EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：
// - EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglish/EnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglish GE EnglishEnglishEnglishEnglishEnglishEnglish
// - EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）、EnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
// - flyTo：GE EnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglish，
//   EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish

import * as THREE from 'three';
import { prefersReducedMotion } from '../config.js';
import { IS_MOBILE } from './quality.js';

const DEG = Math.PI / 180;
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _vm = new THREE.Vector3(); // minDist/groundRadius/EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish _v1-3 EnglishEnglish）
const _va = new THREE.Vector3();
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _qf = new THREE.Quaternion(); // setInertial/EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish _q EnglishEnglish）
const _qg = new THREE.Quaternion(); // groundRadiusOf EnglishEnglish（R10：EnglishEnglishEnglishEnglish _qf——
                                    // setInertial English adoptPosition→minDist→groundRadiusOf
                                    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish V EnglishEnglishEnglishEnglish）
const IDENTITY_Q = new THREE.Quaternion();

const EYE_KM = 0.0017;          // EnglishEnglishEnglishEnglish 1.7 m（English ship.js EnglishEnglish）
const AUTO_TILT_MAX = 80 * DEG; // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish → EnglishEnglishEnglish，GE/NMS EnglishEnglishEnglishEnglish）
// EnglishEnglishEnglishEnglish：EnglishEnglishEnglish 100000 AU（EnglishEnglishEnglishEnglishEnglishEnglishEnglish），1 ly ≈ 63241 AU（R11 EnglishEnglishEnglishEnglish）
const MAX_DIST = 1.5e13;

const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10);

// EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"，EnglishEnglishEnglishEnglishEnglishEnglish
const NAV_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

export class OrbitCamera {
  constructor(camera = null) {
    this.camera = camera;
    this.focusId = 'earth';
    this.lat = 12 * DEG;
    this.lon = 0;
    this.dist = 1;        // km，EnglishEnglishEnglishEnglishEnglish
    this.distTarget = 1;
    this.vLat = 0;        // EnglishEnglishEnglishEnglishEnglish rad/s
    this.vLon = 0;
    this.heading = 0;     // GE EnglishEnglish（Shift+A/D EnglishEnglish，EnglishEnglishEnglish）
    this.tilt = 0;        // GE EnglishEnglish（Shift+W/S，0=EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish）
    this.panOffset = new THREE.Vector3(); // EnglishEnglishEnglishEnglish（EnglishEnglishEnglish km，EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish）
    this.flight = null;
    this.posKm = new Float64Array(3);
    this.quat = new THREE.Quaternion();
    this._autoTilt = 0;   // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish tilt English）
    this._dolly = 1;      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    this._dollyDepth = null; // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglish panOffset English
                             // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    this._dollyTargetId = null; // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，R9-1b）
    this._radialGesture = false; // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English mid-gesture English dolly）
    this.inertial = false; // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish（R9-1e）
    this._streak = 0;      // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglish，R9-1c）
    this._streakIdle = 0;
    this._zoomHold = 0;    // PageUp/Down EnglishEnglishEnglishEnglishEnglish
    this._navHold = 0;     // EnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglish（R10：EnglishEnglishEnglishEnglishEnglish→EnglishEnglishEnglishEnglish）
    this.pendingFocusId = null; // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（R10-fix-3）
    this.pendingTargetLocal = null; // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    this.transition = null; // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  }

  /** EnglishEnglishEnglishEnglishEnglish：EnglishEnglish（EnglishEnglish，EnglishEnglishEnglish）EnglishEnglishEnglish（EnglishEnglishEnglishEnglish） */
  frameQuat(f) { return this.inertial ? IDENTITY_Q : f.quat; }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglish） */
  setInertial(on, env) {
    if (this.inertial === on) return;
    const pos = Float64Array.from(this.posKm);
    _qf.copy(this.quat);
    this.inertial = on;
    this.adoptPosition(env, this.focusId, pos, _qf);
  }

  /** env.get(id) -> { posKm:Float64Array, radiusKm, ringsOuterKm?, quat:THREE.Quaternion(EnglishEnglish→EnglishEnglish), viewDist? } */
  init(env, focusId, distMul = 4) {
    this.focusId = focusId;
    const f = env.get(focusId);
    this.dist = this.distTarget = f.radiusKm * distMul;
    // EnglishEnglishEnglishEnglish：EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    this.alignSunward(env);
    this.compute(env);
  }

  alignSunward(env) {
    const f = env.get(this.focusId);
    _v1.set(-f.posKm[0], -f.posKm[1], -f.posKm[2]).normalize(); // EnglishEnglishEnglishEnglish
    _q.copy(this.frameQuat(f)).invert();
    _v1.applyQuaternion(_q); // → EnglishEnglishEnglish
    this.lat = Math.asin(THREE.MathUtils.clamp(_v1.y, -1, 1)) * 0.6;
    this.lon = Math.atan2(-_v1.z, _v1.x);
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
   * quat EnglishEnglishEnglishEnglishEnglish heading/tilt，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（R7 #1/#7 EnglishEnglishEnglishEnglish）。
   */
  adoptPosition(env, focusId, worldPosKm, quat = null) {
    this.focusId = focusId;
    const f = env.get(focusId);
    _v1.set(
      worldPosKm[0] - f.posKm[0], worldPosKm[1] - f.posKm[1], worldPosKm[2] - f.posKm[2]
    );
    const d = _v1.length();
    _v2.copy(_v1).normalize(); // EnglishEnglish（EnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglish
    _q.copy(this.frameQuat(f)).invert();
    _v1.applyQuaternion(_q).normalize();
    this.lat = Math.asin(THREE.MathUtils.clamp(_v1.y, -1, 1));
    this.lon = Math.atan2(-_v1.z, _v1.x);
    this.dist = this.distTarget = Math.max(d, this.minDist(f));
    this.vLat = this.vLon = 0;
    this.heading = 0;
    this.tilt = 0;
    this.panOffset.set(0, 0, 0);
    this.flight = null;
    this._dolly = 1;
    this._dollyDepth = null;
    this._dollyTargetId = null;
    this._radialGesture = false;
    this.pendingFocusId = null;
    this.pendingTargetLocal = null;
    this.transition = null;
    if (quat) this.adoptOrientation(f, _v2, quat);
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
  _snapshot() {
    return {
      focusId: this.focusId,
      lat: this.lat, lon: this.lon, dist: this.dist, distTarget: this.distTarget,
      heading: this.heading, tilt: this.tilt,
      panOffset: this.panOffset.clone(),
      vLat: this.vLat, vLon: this.vLon,
      inertial: this.inertial,
      _dolly: this._dolly, _dollyDepth: this._dollyDepth,
      _dollyTargetId: this._dollyTargetId, _radialGesture: this._radialGesture,
    };
  }
  _restore(s) {
    this.focusId = s.focusId;
    this.lat = s.lat; this.lon = s.lon;
    this.dist = s.dist; this.distTarget = s.distTarget;
    this.heading = s.heading; this.tilt = s.tilt;
    this.panOffset.copy(s.panOffset);
    this.vLat = s.vLat; this.vLon = s.vLon;
    this.inertial = s.inertial;
    this._dolly = s._dolly; this._dollyDepth = s._dollyDepth;
    this._dollyTargetId = s._dollyTargetId; this._radialGesture = s._radialGesture;
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
   * @param targetLocalDir EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
   * @param targetLocalDist EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）
   */
  setPendingFocus(id, targetLocalDir = null, targetLocalDist = 0) {
    this.pendingFocusId = id;
    this.pendingTargetLocal = targetLocalDir
      ? { dir: targetLocalDir.clone().normalize(), dist: targetLocalDist }
      : null;
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish（English update EnglishEnglishEnglishEnglishEnglish）。 */
  _userNavigating(input) {
    const d = input.drag, p = input.pan, l = input.look;
    if (d && (d.active || Math.abs(d.dx) + Math.abs(d.dy) > 0.5)) return true;
    if (p && (p.active || Math.abs(p.dx) + Math.abs(p.dy) > 0.5)) return true;
    if (l && l.active) return true;
    for (const k of NAV_KEYS) if (input.down(k)) return true;
    return false;
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
  _startTransition(env) {
    if (!this.pendingFocusId || this.pendingFocusId === this.focusId) {
      this.transition = null;
      return;
    }
    const toId = this.pendingFocusId;
    const snap = this._snapshot();
    this.adoptPosition(env, toId, this.posKm, this.quat);
    const targetDist = this.dist;
    this._restore(snap);
    this.transition = {
      toId,
      fromPos: Float64Array.from(this.posKm),
      fromQuat: this.quat.clone(),
      targetDist,
      targetLocal: this.pendingTargetLocal
        ? { dir: this.pendingTargetLocal.dir.clone(), dist: this.pendingTargetLocal.dist }
        : null,
      t: 0,
      faceT: 0, // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish
    };
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish，EnglishEnglish/PageUpDown EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   * EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish lookAt EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
   * EnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。 */
  _updateTransition(dt, input, env) {
    const tr = this.transition;
    const toF = env.get(tr.toId);

    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish）
    _v1.set(toF.posKm[0], toF.posKm[1], toF.posKm[2]);
    if (tr.targetLocal) {
      _v2.copy(tr.targetLocal.dir).applyQuaternion(toF.quat).multiplyScalar(tr.targetLocal.dist);
      _v1.add(_v2);
    }
    const targetWorldPos = _v1; // alias

    // ---- EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）----
    let zoomK = 0;
    if (input.down('PageUp') || input.down('Equal') || input.down('NumpadAdd')) zoomK -= 1;
    if (input.down('PageDown') || input.down('Minus') || input.down('NumpadSubtract')) zoomK += 1;

    if (input.wheel !== 0) {
      this._streak = Math.min(this._streak + Math.abs(input.wheel) * 0.18, 1);
      this._streakIdle = 0;
    } else {
      this._streakIdle += dt;
      if (this._streakIdle > 0.35) this._streak = Math.max(this._streak - dt * 2, 0);
    }
    this._zoomHold = zoomK !== 0 ? Math.min(this._zoomHold + dt, 2.5) : 0;

    const zoomActive = input.wheel !== 0 || zoomK !== 0;
    if (zoomActive) {
      let zoomMul = 1;
      if (zoomK !== 0) zoomMul *= Math.exp(zoomK * (0.55 + this._zoomHold * 0.65) * dt);
      if (input.wheel !== 0) {
        zoomMul *= Math.pow(1.12 + 0.26 * this._streak, THREE.MathUtils.clamp(input.wheel, -3, 3));
      }
      tr.targetDist *= zoomMul;
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish lat/lon EnglishEnglishEnglish）
      const minD = toF.minDistKm ?? toF.radiusKm * 1.004 + 1;
      tr.targetDist = THREE.MathUtils.clamp(tr.targetDist, minD, MAX_DIST);
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglish/PageDown = EnglishEnglish（t↑），EnglishEnglishEnglish/PageUp = EnglishEnglish（t↓）
      const advance = Math.abs(input.wheel) * 0.12 + Math.abs(zoomK) * dt * 0.9;
      const dir = (input.wheel < 0 || zoomK < 0) ? 1 : -1;
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish = EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（t EnglishEnglish 0，EnglishEnglishEnglishEnglish t>=1 EnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      if (dir < 0 && tr.t <= 1e-6) {
        this.adoptPosition(env, this.focusId, this.posKm, this.quat);
        return;
      }
      tr.t = THREE.MathUtils.clamp(tr.t + dir * advance, 0, 1);
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglish 0.35s EnglishEnglishEnglishEnglishEnglishEnglishEnglish
      tr.faceT = Math.min(1, tr.faceT + dt / 0.35);
    }
    // EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    if (tr.t > 0 && tr.faceT < 1) {
      tr.faceT = Math.min(1, tr.faceT + dt / 0.35);
    }

    const u = smoother(tr.t);
    const uLook = smoother(tr.faceT);

    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    _v2.set(tr.fromPos[0] - toF.posKm[0], tr.fromPos[1] - toF.posKm[1], tr.fromPos[2] - toF.posKm[2]);
    const startDist = _v2.length();
    if (startDist > 1e-9) _v2.normalize(); else _v2.set(0, 0, 1);

    // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglish targetDist EnglishEnglish
    _v3.copy(targetWorldPos).addScaledVector(_v2, tr.targetDist);

    // EnglishEnglishEnglishEnglishEnglishEnglish
    this.posKm[0] = tr.fromPos[0] + (_v3.x - tr.fromPos[0]) * u;
    this.posKm[1] = tr.fromPos[1] + (_v3.y - tr.fromPos[1]) * u;
    this.posKm[2] = tr.fromPos[2] + (_v3.z - tr.fromPos[2]) * u;

    // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English uLook EnglishEnglish）
    _va.set(0, 1, 0).applyQuaternion(tr.fromQuat);
    _vm.set(0, 1, 0).applyQuaternion(this.frameQuat(toF));
    const upX = _va.x + (_vm.x - _va.x) * uLook;
    const upY = _va.y + (_vm.y - _va.y) * uLook;
    const upZ = _va.z + (_vm.z - _va.z) * uLook;
    const upLen = Math.hypot(upX, upY, upZ) || 1;

    // EnglishEnglishEnglishEnglishEnglishEnglish lookAt EnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    // EnglishEnglish：EnglishEnglish slerp English“EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish”EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglish lookAt EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    _m.lookAt(
      new THREE.Vector3(this.posKm[0], this.posKm[1], this.posKm[2]),
      targetWorldPos,
      new THREE.Vector3(upX / upLen, upY / upLen, upZ / upLen)
    );
    const targetQuat = new THREE.Quaternion().setFromRotationMatrix(_m);
    this.quat.slerpQuaternions(tr.fromQuat, targetQuat, uLook);

    if (tr.t >= 1 && tr.faceT >= 0.99) {
      // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      this.focusId = tr.toId;
      this.adoptPosition(env, tr.toId, this.posKm, this.quat);
      this.pendingFocusId = null;
      this.pendingTargetLocal = null;
      this.transition = null;
    }
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish heading/tilt（u = EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish） */
  adoptOrientation(f, u, quat) {
    const view = _va.set(0, 0, -1).applyQuaternion(quat);
    const cosT = THREE.MathUtils.clamp(-view.dot(u), -1, 1);
    const tiltTotal = Math.acos(cosT); // 0=EnglishEnglishEnglishEnglishEnglishEnglish，π/2=EnglishEnglishEnglish
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish p（tilt∈(0,π) EnglishEnglish“EnglishEnglishEnglishEnglish”EnglishEnglishEnglishEnglishEnglishEnglish）
    const p = _v3.copy(view).addScaledVector(u, -view.dot(u));
    if (p.lengthSq() < 1e-10) {
      // EnglishEnglish≈EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish heading
      p.set(0, 1, 0).applyQuaternion(quat);
      p.addScaledVector(u, -p.dot(u));
    }
    if (p.lengthSq() < 1e-10) { this.heading = 0; this.tilt = 0; return; }
    p.normalize();
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish np EnglishEnglishEnglish ep
    const np = _vm.set(0, 1, 0).applyQuaternion(this.frameQuat(f));
    np.addScaledVector(u, -np.dot(u));
    if (np.lengthSq() < 1e-10) { this.heading = 0; this.tilt = tiltTotal - this._autoTilt; return; }
    np.normalize();
    const ep = _va.crossVectors(u, np); // English compute English applyAxisAngle(u, heading) EnglishEnglishEnglish
    this.heading = Math.atan2(p.dot(ep), p.dot(np));
    // EnglishEnglishEnglish = EnglishEnglish tilt + EnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish compute EnglishEnglishEnglishEnglishEnglishEnglish
    const ground = this.groundRadiusOf(f);
    this.tilt = tiltTotal - this.autoTiltOf(f, Math.max(this.dist - ground, 0));
  }

  /** EnglishEnglish lat/lon EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglish = EnglishEnglishEnglishEnglish） */
  groundRadiusOf(f) {
    if (!f.groundRadius) return f.radiusKm;
    const cl = Math.cos(this.lat);
    _vm.set(cl * Math.cos(this.lon), Math.sin(this.lat), -cl * Math.sin(this.lon));
    // EnglishEnglishEnglishEnglishEnglish lat/lon EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    if (this.inertial) _vm.applyQuaternion(_qg.copy(f.quat).invert());
    return f.groundRadius(_vm);
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish startAlt EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（GE/NMS EnglishEnglishEnglishEnglish） */
  autoTiltOf(f, alt) {
    const startAlt = THREE.MathUtils.clamp(f.radiusKm * 0.04, 1, 600);
    const t = 1 - THREE.MathUtils.clamp(alt / startAlt, 0, 1);
    return t <= 0 ? 0 : AUTO_TILT_MAX * Math.pow(t, 1.6);
  }

  /**
   * EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）：
   * - EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish + 1.7m EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，R7 #1）
   * - EnglishEnglish/EnglishEnglish：env EnglishEnglish minDistKm（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，R7 #5）
   * - EnglishEnglish（EnglishEnglishEnglish）：EnglishEnglishEnglish R×1.004+1
   */
  minDist(f) {
    if (f.groundRadius) return this.groundRadiusOf(f) + EYE_KM;
    if (f.minDistKm) return f.minDistKm;
    return f.radiusKm * 1.004 + 1;
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglish（chart flip）：EnglishEnglishEnglishEnglish ±90° English
   * lat→180°−lat、lon+=180°、heading+=180°、vLat EnglishEnglish —— EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish）。
   */
  poleNormalize() {
    const HALF = Math.PI / 2;
    if (this.lat > HALF || this.lat < -HALF) {
      this.lat = (this.lat > HALF ? Math.PI : -Math.PI) - this.lat;
      this.lon += Math.PI;
      this.heading += Math.PI;
      this.vLat = -this.vLat;
    }
    if (this.lon > Math.PI) this.lon -= 2 * Math.PI;
    else if (this.lon < -Math.PI) this.lon += 2 * Math.PI;
    if (this.heading > Math.PI) this.heading -= 2 * Math.PI;
    else if (this.heading < -Math.PI) this.heading += 2 * Math.PI;
  }

  arrivalDist(env, id) {
    const t = env.get(id);
    if (t.viewDist) return t.viewDist;
    // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish、EnglishEnglishEnglish），EnglishEnglish Go/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    const r = Math.max(t.radiusKm, t.ringsOuterKm ?? 0);
    // EnglishEnglishEnglishEnglishEnglishEnglish 3.5 EnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish FOV/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    const fallback = Math.max(t.radiusKm * 3.5, 3);
    if (!IS_MOBILE || !this.camera) return fallback;
    const vFOV = this.camera.fov * DEG;
    const aspect = this.camera.aspect;
    const hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * aspect);
    const limiting = Math.min(vFOV, hFOV);
    const margin = 1.18; // 18% EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish UI EnglishEnglish
    const distFit = (r * margin) / Math.tan(limiting / 2);
    return Math.max(distFit, fallback);
  }

  /** GE EnglishEnglishEnglishEnglishEnglishEnglishEnglish（fromIdOverride EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish） */
  flyTo(env, toId, fromIdOverride = null) {
    this.pendingFocusId = null;
    this.pendingTargetLocal = null;
    this.transition = null;
    const to = env.get(toId);
    const from = env.get(fromIdOverride ?? this.focusId);
    const sep = Math.hypot(
      to.posKm[0] - from.posKm[0], to.posKm[1] - from.posKm[1], to.posKm[2] - from.posKm[2]
    );
    const h0 = Math.max(this.dist, this.minDist(from));
    const h1 = this.arrivalDist(env, toId);
    // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish）
    _v1.set(
      this.posKm[0] - from.posKm[0], this.posKm[1] - from.posKm[1], this.posKm[2] - from.posKm[2]
    );
    const dir0 = _v1.lengthSq() > 0 ? _v1.clone().normalize() : new THREE.Vector3(0, 0.3, 1).normalize();
    _v2.set(-to.posKm[0], -to.posKm[1], -to.posKm[2]).normalize(); // EnglishEnglishEnglishEnglishEnglishEnglishEnglish
    const dir1 = _v2.clone().addScaledVector(new THREE.Vector3(0, 1, 0), 0.45).normalize();
    // EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish ~2s，EnglishEnglishEnglishEnglish ~7s）
    let dur = THREE.MathUtils.clamp(1.6 + Math.log10(Math.max(sep + h0, 10) / 1e4) * 0.55, 1.8, 7);
    // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglish"——
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglishEnglish：**EnglishEnglishEnglishEnglishEnglish**EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglishEnglish dur = 0.01 —— EnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish
    // EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 4.5s EnglishEnglishEnglish）。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish。
    if (prefersReducedMotion()) dur = Math.min(dur, 0.8);
    // EnglishEnglishEnglishEnglish（GE EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    this.flight = { toId, fromId: fromIdOverride ?? this.focusId, t: 0, dur, h0, h1, dir0, dir1, start: performance.now() };
  }

  cancelFlight(env) {
    if (!this.flight) return;
    // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    const to = this.flight.toId;
    this.flight = null;
    this.adoptPosition(env, to, this.posKm);
  }

  update(dt, input, env) {
    this._dtLast = dt;
    if (this.flight) {
      this.updateFlight(dt, env);
      return;
    }
    // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish/PageUpDown EnglishEnglishEnglishEnglishEnglishEnglishEnglish（R10-fix-3）
    if (this.pendingFocusId && this.pendingFocusId !== this.focusId) {
      if (!this.transition || this.transition.toId !== this.pendingFocusId) {
        this._startTransition(env);
      }
    }
    if (this.transition) {
      // EnglishEnglish / EnglishEnglish / EnglishEnglish / EnglishEnglishEnglishEnglish = EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglish
      // EnglishEnglish（faceT）EnglishEnglishEnglishEnglishEnglish（t），EnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish"。
      if (this._userNavigating(input)) {
        this.adoptPosition(env, this.focusId, this.posKm, this.quat);
      } else {
        this._updateTransition(dt, input, env);
        return;
      }
    }
    let f = env.get(this.focusId);
    const drag = input.drag;

    // ---- Google Earth EnglishEnglishEnglishEnglish ----
    const shift = input.down('ShiftLeft') || input.down('ShiftRight');
    // EnglishEnglish = EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglish（R7 #1/#7）
    const groundR = this.groundRadiusOf(f);
    const alt = Math.max(this.dist - groundR, f.radiusKm * 1e-6);
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish、EnglishEnglishEnglish，GE EnglishEnglish）。
    // EnglishEnglish 3e-6 rad/s（EnglishEnglish≈19 m/s）：EnglishEnglish 0.015 English 25km EnglishEnglishEnglishEnglishEnglishEnglish，
    // R7 EnglishEnglishEnglishEnglishEnglishEnglish 1.7m，EnglishEnglishEnglishEnglishEnglishEnglish≈95 km/s EnglishEnglish
    const panRate = 1.0 * THREE.MathUtils.clamp(alt / f.radiusKm, 3e-6, 1.2);
    const up = (input.down('KeyW') || input.down('ArrowUp')) ? 1 : 0;
    const dn = (input.down('KeyS') || input.down('ArrowDown')) ? 1 : 0;
    const lf = (input.down('KeyA') || input.down('ArrowLeft')) ? 1 : 0;
    const rt = (input.down('KeyD') || input.down('ArrowRight')) ? 1 : 0;
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（R10）：EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish（0.45→1.65 English）
    this._navHold = (up || dn || lf || rt) ? Math.min(this._navHold + dt, 2) : 0;
    const navMul = 0.45 + this._navHold * 0.6;
    if (!shift) {
      // EnglishEnglish（EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish；↑English ↓English ←English →English；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      const sN = up - dn, sE = rt - lf;
      const ch = Math.cos(this.heading), sh = Math.sin(this.heading);
      this.lat += (sN * ch - sE * sh) * panRate * navMul * dt;
      this.lon += ((sN * sh + sE * ch) * panRate * navMul * dt) /
        Math.max(Math.abs(Math.cos(this.lat)), 0.15);
    } else {
      // Shift+A/D EnglishEnglishEnglishEnglish；Shift+W/S EnglishEnglish —— EnglishEnglish 360° EnglishEnglishEnglishEnglish
      //（EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      this.heading += (lf - rt) * 1.1 * navMul * dt;
      this.tilt += (up - dn) * 0.9 * navMul * dt;
      if (this.tilt > Math.PI) this.tilt -= 2 * Math.PI;
      if (this.tilt < -Math.PI) this.tilt += 2 * Math.PI;
      if (this.heading > Math.PI) this.heading -= 2 * Math.PI;
      if (this.heading < -Math.PI) this.heading += 2 * Math.PI;
    }
    // PageUp/PageDown English +/- EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    let zoomK = 0;
    if (input.down('PageUp') || input.down('Equal') || input.down('NumpadAdd')) zoomK -= 1;
    if (input.down('PageDown') || input.down('Minus') || input.down('NumpadSubtract')) zoomK += 1;
    // R EnglishEnglishEnglishEnglish（GE: EnglishEnglishEnglish、EnglishEnglishEnglish、EnglishEnglishEnglishEnglish）——EnglishEnglishEnglishEnglishEnglishEnglish（~0.4s），EnglishEnglishEnglish
    if (input.tapped('KeyR')) this._resetAnim = true;
    if (this._resetAnim) {
      const k = Math.exp(-dt * 7);
      this.heading *= k;
      this.tilt *= k;
      this.panOffset.multiplyScalar(k);
      if (Math.abs(this.heading) < 1e-3 && Math.abs(this.tilt) < 1e-3 && this.panOffset.lengthSq() < 1e-8) {
        this.heading = 0; this.tilt = 0; this.panOffset.set(0, 0, 0);
        this._resetAnim = false;
      }
    }

    // Ctrl+EnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglish/EnglishEnglish（EnglishEnglishEnglishEnglishEnglish 3D EnglishEnglish，R7 #7）
    if (input.look?.active && (input.look.dx !== 0 || input.look.dy !== 0)) {
      this.heading += input.look.dx * 0.0035;
      this.tilt += input.look.dy * 0.0035;
      if (this.tilt > Math.PI) this.tilt -= 2 * Math.PI;
      if (this.tilt < -Math.PI) this.tilt += 2 * Math.PI;
      if (this.heading > Math.PI) this.heading -= 2 * Math.PI;
      if (this.heading < -Math.PI) this.heading += 2 * Math.PI;
    }

    // EnglishEnglish/EnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglish（EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    if (input.pan.active && (input.pan.dx !== 0 || input.pan.dy !== 0)) {
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish dolly（EnglishEnglish dolly EnglishEnglishEnglishEnglish panOffset，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      if (Math.abs(this._dolly - 1) > 1e-4) {
        this._dolly = 1;
        this._dollyDepth = null;
        this._dollyTargetId = null;
      }
      const k = this.dist * 0.0012;
      _v2.set(1, 0, 0).applyQuaternion(this.quat);  // EnglishEnglishEnglish
      _v3.set(0, 1, 0).applyQuaternion(this.quat);  // EnglishEnglishEnglish
      _v2.multiplyScalar(-input.pan.dx * k).addScaledVector(_v3, input.pan.dy * k);
      _q.copy(this.frameQuat(f)).invert();
      _v2.applyQuaternion(_q); // EnglishEnglish → EnglishEnglishEnglish
      this.panOffset.add(_v2);
      const maxPan = this.dist * 2 + f.radiusKm * 2;
      if (this.panOffset.length() > maxPan) this.panOffset.setLength(maxPan);
    }

    // ---- EnglishEnglish → EnglishEnglishEnglish（EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish） ----
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（≈"EnglishEnglishEnglishEnglishEnglishEnglish"：EnglishEnglishEnglish、EnglishEnglishEnglish，R7 #7）
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
    // EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    let sensMin = 2e-6;
    if (IS_MOBILE && alt < f.radiusKm * 0.5) sensMin = 1.2e-5;
    const sens = THREE.MathUtils.clamp(0.00123 * alt / f.radiusKm, sensMin, 0.0052);
    if (drag.active) {
      const ch = Math.cos(this.heading), sh = Math.sin(this.heading);
      this.vLat = ((drag.dy * ch - drag.dx * sh) * sens) / Math.max(dt, 1e-3);
      this.vLon = ((-drag.dx * ch - drag.dy * sh) * sens) / Math.max(dt, 1e-3);
    }
    this.lon += this.vLon * dt;
    this.lat += this.vLat * dt;
    this.poleNormalize();
    // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglish"）
    const damp = prefersReducedMotion() ? 0 : Math.exp(-dt * (drag.active ? 0 : 4.5));
    this.vLon *= damp;
    this.vLat *= damp;

    // ---- EnglishEnglish（R8 #2 / R9-1b/c/d）：EnglishEnglishEnglish PageUp/Down EnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglish" ----
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（R9-1c）：EnglishEnglishEnglishEnglish（×1.12/English），EnglishEnglishEnglishEnglishEnglish（EnglishEnglish ×1.38/English）；
    // PageUp/Down EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（0.55 → 2.2 /s）
    if (input.wheel !== 0) {
      this._streak = Math.min(this._streak + Math.abs(input.wheel) * 0.18, 1);
      this._streakIdle = 0;
    } else {
      this._streakIdle += dt;
      if (this._streakIdle > 0.35) this._streak = Math.max(this._streak - dt * 2, 0);
    }
    this._zoomHold = zoomK !== 0 ? Math.min(this._zoomHold + dt, 2.5) : 0;
    let zoomMul = 1;
    if (zoomK !== 0) zoomMul *= Math.exp(zoomK * (0.55 + this._zoomHold * 0.65) * dt);
    if (input.wheel !== 0) {
      zoomMul *= Math.pow(1.12 + 0.26 * this._streak, THREE.MathUtils.clamp(input.wheel, -3, 3));
    }

    // （R10 EnglishEnglish）EnglishEnglish/PageUp/Down EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish —— EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglish；
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish / EnglishEnglish / EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（main.js pickBody）。

    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（dolly）：
    // - EnglishEnglishEnglish：EnglishEnglishEnglishEnglish（EnglishEnglish panOffset / look-at EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
    // - EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish）。
    // - EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglish dolly。
    // EnglishEnglishEnglishEnglish"English panOffset"EnglishEnglishEnglishEnglish offAxis EnglishEnglish dolly，dolly EnglishEnglishEnglishEnglishEnglishEnglish
    // EnglishEnglishEnglish panOffset，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish look-at EnglishEnglishEnglishEnglishEnglishEnglishEnglish
    //（EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglish"）。
    const cl = Math.cos(this.lat);
    _v3.set(cl * Math.cos(this.lon), Math.sin(this.lat), -cl * Math.sin(this.lon))
      .applyQuaternion(this.frameQuat(f)); // EnglishEnglishEnglishEnglish（EnglishEnglish）
    _va.set(0, 0, -1).applyQuaternion(this.quat); // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish）
    const viewRadial = Math.abs(_va.dot(_v3) + 1) < 0.03; // EnglishEnglish ≈ −EnglishEnglish
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"EnglishEnglish（EnglishEnglishEnglishEnglishEnglish）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish look-at EnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish dolly。
    const panLen = this.panOffset.length();
    _vm.set(cl * Math.cos(this.lon), Math.sin(this.lat), -cl * Math.sin(this.lon));
    const panDotRadial = panLen > 0 ? this.panOffset.dot(_vm) : 0;
    const panMostlyPerp = panLen > 0 && Math.abs(panDotRadial) < panLen * 0.25;
    // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish dolly（_dolly ≠ 1）EnglishEnglishEnglishEnglishEnglish dolly；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    //（_radialGesture）EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish auto-tilt English viewRadial EnglishEnglishEnglishEnglish
    // EnglishEnglishEnglishEnglishEnglish dolly，EnglishEnglish look-at EnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：
    // - EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish + EnglishEnglish/EnglishEnglishEnglishEnglish，auto-tilt EnglishEnglishEnglishEnglishEnglishEnglish）。
    // - EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish（EnglishEnglish look-at EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
    // - EnglishEnglish：dolly（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
    const zoomActive = input.wheel !== 0 || zoomK !== 0;
    const inDollyGesture = Math.abs(this._dolly - 1) > 1e-5;
    // EnglishEnglishEnglishEnglishEnglishEnglish：
    // - EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish / EnglishEnglish / EnglishEnglishEnglishEnglish（auto-tilt EnglishEnglishEnglishEnglishEnglishEnglish）。
    // - EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish tilt EnglishEnglish，EnglishEnglishEnglishEnglishEnglish
    //   EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglish，EnglishEnglishEnglishEnglishEnglish dolly EnglishEnglishEnglishEnglishEnglishEnglish。
    // - EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish look-at EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    // - EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglish auto-tilt EnglishEnglishEnglishEnglishEnglishEnglishEnglish，
    //   EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish dolly，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish"EnglishEnglish
    //   EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
    const mobilePinchRadial = IS_MOBILE && zoomActive &&
      input.pan.dx === 0 && input.pan.dy === 0 && this.panOffset.lengthSq() === 0;
    const shouldBeRadial = (this.panOffset.lengthSq() === 0 &&
      (Math.abs(this.tilt) <= 0.02 || viewRadial || mobilePinchRadial)) ||
      (panMostlyPerp && viewRadial);
    const canStartRadial = zoomActive && !inDollyGesture && !this._radialGesture && shouldBeRadial;
    // EnglishEnglishEnglishEnglish distTarget English（EnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    const needsRadialSmooth = !inDollyGesture && !this._radialGesture &&
      Math.abs(this.dist - this.distTarget) > 1e-6 && shouldBeRadial;
    if (canStartRadial) this._radialGesture = true;
    const useRadial = this._radialGesture || canStartRadial || needsRadialSmooth;
    if (useRadial) {
      this._dolly = 1;
      this._dollyTargetId = null;
      const minD = this.minDist(f);
      const base = minD - 0.002; // EnglishEnglish = EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish ≥ 2m EnglishEnglish）
      const a = Math.max(this.distTarget - base, 0.0008);
      let target = base + a * zoomMul;
      // EnglishEnglishEnglish：EnglishEnglishEnglish zoom out（EnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish
      // EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglish"。EnglishEnglishEnglishEnglish zoom out EnglishEnglishEnglishEnglish 2% EnglishEnglish，EnglishEnglishEnglish
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish zoom in EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      if (IS_MOBILE && zoomMul > 1 && this.distTarget < minD * 1.5) {
        target = Math.max(target, this.distTarget + f.radiusKm * 0.02);
      }
      this.distTarget = THREE.MathUtils.clamp(target, minD, MAX_DIST);
      this.dist += (this.distTarget - this.dist) * Math.min(dt * 7, 1);
    } else {
      this.distTarget = this.dist; // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      if (zoomMul !== 1) {
        if (this._dolly === 1) {
          // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish）
          this._dollyDepth = null;
          this._dollyTargetId = null;
          _va.set(0, 0, -1).applyQuaternion(this.quat);
          const hit = env.centerHit?.(this.posKm, _va) ?? null;
          if (hit) {
            this._dollyTargetId = hit.id ?? null;
            this._dollyDepth = hit.depth;
          } else {
            const d = env.centerDepth?.(this.posKm, _va) ?? null;
            if (d != null) this._dollyDepth = d;
          }
        }
        this._dolly *= zoomMul;
      }
      if (Math.abs(this._dolly - 1) > 1e-5) {
        _va.set(0, 0, -1).applyQuaternion(this.quat);
        // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）
        if (this._dollyTargetId && env.get) {
          const tb = env.get(this._dollyTargetId);
          if (tb) {
            // EnglishEnglish=EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）→ EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
            const margin = this._dollyTargetId === this.focusId
              ? this.minDist(tb) : (tb.minDistKm ?? tb.radiusKm * 1.004 + 1);
            _v2.set(
              tb.posKm[0] - this.posKm[0], tb.posKm[1] - this.posKm[1], tb.posKm[2] - this.posKm[2]
            );
            const b = _v2.dot(_va);
            if (b > 0) {
              const det = b * b - (_v2.lengthSq() - margin * margin);
              if (det > 0) {
                const tHit = b - Math.sqrt(det);
                if (tHit > 1e-6) this._dollyDepth = tHit;
              }
            }
          }
        }
        if (this._dollyDepth == null) {
          _v1.copy(this.panOffset).applyQuaternion(this.frameQuat(f));
          _v1.set(
            f.posKm[0] + _v1.x - this.posKm[0],
            f.posKm[1] + _v1.y - this.posKm[1],
            f.posKm[2] + _v1.z - this.posKm[2]
          );
          const t = _v1.dot(_va);
          this._dollyDepth = t > f.radiusKm * 1e-6 ? t : null;
        }
        const depth = this._dollyDepth;
        if (depth == null || depth <= f.radiusKm * 1e-6) {
          this._dolly = 1; // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglish
        } else {
          // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）；T = EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
          const k = Math.min(dt * 7, 1);
          const T = depth * this._dolly;
          const sNew = Math.max(depth + (T - depth) * k, 1e-9);
          let delta = depth - sNew; // >0 = EnglishEnglishEnglishEnglishEnglish
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglish：|pos + V·δ − f.pos| ≥ minDist（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
          if (delta > 0) {
            _v2.set(
              this.posKm[0] - f.posKm[0], this.posKm[1] - f.posKm[1], this.posKm[2] - f.posKm[2]
            );
            const minD = this.minDist(f);
            const b = _v2.dot(_va);
            const c = _v2.lengthSq() - minD * minD;
            const det = b * b - c;
            if (c > 0 && det > 0) {
              const tHit = -b - Math.sqrt(det);
              if (tHit > 0 && delta > tHit) delta = Math.max(tHit - 1e-6, 0);
            }
          }
          // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（R9-1c）
          if (delta < 0) {
            const rSun = Math.hypot(this.posKm[0], this.posKm[1], this.posKm[2]);
            if (rSun > MAX_DIST) delta = 0;
          }
          this.posKm[0] += _va.x * delta;
          this.posKm[1] += _va.y * delta;
          this.posKm[2] += _va.z * delta;
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglish panOffset（lat/lon/dist/heading/tilt EnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglish）
          _v1.set(
            this.posKm[0] - f.posKm[0], this.posKm[1] - f.posKm[1], this.posKm[2] - f.posKm[2]
          );
          const cl = Math.cos(this.lat);
          _v3.set(cl * Math.cos(this.lon), Math.sin(this.lat), -cl * Math.sin(this.lon))
            .applyQuaternion(this.frameQuat(f)); // EnglishEnglish（EnglishEnglish）
          _v1.addScaledVector(_v3, -this.dist); // EnglishEnglishEnglishEnglish（EnglishEnglish）
          _q.copy(this.frameQuat(f)).invert();
          this.panOffset.copy(_v1.applyQuaternion(_q));
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglish = EnglishEnglishEnglishEnglish / EnglishEnglishEnglish
          this._dollyDepth = depth - delta;
          this._dolly = this._dollyDepth <= 1e-9 ? 1 : T / this._dollyDepth;
          if (Math.abs(this._dolly - 1) < 1e-4) this._dolly = 1;
        }
      } else {
        this._dollyDepth = null;
        this._dollyTargetId = null;
      }
    }

    // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish 0.35s EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish dolly EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish
    // mid-gesture EnglishEnglishEnglishEnglishEnglish dolly EnglishEnglish look-at EnglishEnglishEnglish。
    if (input.wheel === 0 && zoomK === 0 && Math.abs(this._dolly - 1) < 1e-4 && this._streakIdle > 0.35) {
      this._radialGesture = false;
      this._dollyDepth = null;
      this._dollyTargetId = null;
    }

    this.compute(env);
  }

  compute(env) {    const f = env.get(this.focusId);
    const fq = this.frameQuat(f); // EnglishEnglish（EnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglish（R9-1e）
    // EnglishEnglishEnglishEnglishEnglishEnglish → EnglishEnglish（EnglishEnglishEnglishEnglish = EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish）
    const cl = Math.cos(this.lat);
    _v1.set(cl * Math.cos(this.lon), Math.sin(this.lat), -cl * Math.sin(this.lon))
      .applyQuaternion(fq);
    let ox = 0, oy = 0, oz = 0;
    if (this.panOffset.lengthSq() > 0) {
      _v3.copy(this.panOffset).applyQuaternion(fq);
      ox = _v3.x; oy = _v3.y; oz = _v3.z;
    }
    this.posKm[0] = f.posKm[0] + ox + _v1.x * this.dist;
    this.posKm[1] = f.posKm[1] + oy + _v1.y * this.dist;
    this.posKm[2] = f.posKm[2] + oz + _v1.z * this.dist;
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish"）
    const dcx = this.posKm[0] - f.posKm[0], dcy = this.posKm[1] - f.posKm[1], dcz = this.posKm[2] - f.posKm[2];
    const dc = Math.hypot(dcx, dcy, dcz);
    const minD = this.minDist(f);
    if (dc < minD && dc > 0) {
      const k = Math.min(1, (this._dtLast || 0.016) * 10); // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish
      const nd = dc + (minD - dc) * k;
      const push = nd / dc;
      this.posKm[0] = f.posKm[0] + dcx * push;
      this.posKm[1] = f.posKm[1] + dcy * push;
      this.posKm[2] = f.posKm[2] + dcz * push;
    }
    // EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglish = EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish heading（GE EnglishEnglish）
    _v2.set(0, 1, 0).applyQuaternion(fq);
    if (this.heading !== 0) _v2.applyAxisAngle(_v1, this.heading);
    _v3.copy(_v1).negate(); // EnglishEnglish
    _m.lookAt(new THREE.Vector3(), _v3, _v2);
    this.quat.setFromRotationMatrix(_m);
    // EnglishEnglish：EnglishEnglish tilt + EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish→EnglishEnglishEnglishEnglishEnglishEnglishEnglish，R7 #1），EnglishEnglishEnglishEnglishEnglish X English
    this._autoTilt = this.autoTiltOf(f, Math.max(this.dist - this.groundRadiusOf(f), 0));
    const tiltTotal = this.tilt + this._autoTilt;
    if (tiltTotal !== 0) {
      _q.set(Math.sin(tiltTotal / 2), 0, 0, Math.cos(tiltTotal / 2));
      this.quat.multiply(_q);
    }
  }

  updateFlight(dt, env) {
    const fl = this.flight;
    fl.t = Math.min(1, (performance.now() - fl.start) / 1000 / fl.dur);
    const s = smoother(fl.t);
    const from = env.get(fl.fromId);
    const to = env.get(fl.toId);

    // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    const cx = from.posKm[0] + (to.posKm[0] - from.posKm[0]) * s;
    const cy = from.posKm[1] + (to.posKm[1] - from.posKm[1]) * s;
    const cz = from.posKm[2] + (to.posKm[2] - from.posKm[2]) * s;
    const sep = Math.hypot(
      to.posKm[0] - from.posKm[0], to.posKm[1] - from.posKm[1], to.posKm[2] - from.posKm[2]
    );

    // GE EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish
    const h = Math.exp(Math.log(fl.h0) * (1 - s) + Math.log(fl.h1) * s) +
      Math.sin(Math.PI * s) * sep * 0.22;

    // EnglishEnglishEnglishEnglishEnglishEnglish
    _v1.copy(fl.dir0).lerp(fl.dir1, s).normalize();
    this.posKm[0] = cx + _v1.x * h;
    this.posKm[1] = cy + _v1.y * h;
    this.posKm[2] = cz + _v1.z * h;

    // EnglishEnglish：English 60% EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish
    const sLook = smoother(Math.min(1, fl.t / 0.6));
    const lx = cx + (to.posKm[0] - cx) * sLook;
    const ly = cy + (to.posKm[1] - cy) * sLook;
    const lz = cz + (to.posKm[2] - cz) * sLook;
    _v3.set(lx - this.posKm[0], ly - this.posKm[1], lz - this.posKm[2]).normalize();
    // EnglishEnglishEnglish：EnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglish
    _v2.set(0, 1, 0).lerp(_v1.set(0, 1, 0).applyQuaternion(to.quat), s).normalize();
    _m.lookAt(new THREE.Vector3(), _v3, _v2);
    this.quat.setFromRotationMatrix(_m);

    if (fl.t >= 1) {
      // EnglishEnglish：EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      this.flight = null;
      this.adoptPosition(env, fl.toId, this.posKm);
      this.distTarget = this.dist;
    }
  }
}
