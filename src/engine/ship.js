// EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish（6DOF，EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish dt（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）；
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishco-rotate，EnglishEnglish g=GM/r² EnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglishEnglishEnglishEnglishEnglish（M1）：
// - Input EnglishEnglishEnglish Pointer Events EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
// - EnglishEnglishEnglish → drag（EnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish）；EnglishEnglishEnglishEnglish → wheel（EnglishEnglish/EnglishEnglish/EnglishEnglish）；EnglishEnglishEnglishEnglish → pan
// - joystick / touchAscend / touchDescend / touchJump / touchSprint English TouchControls EnglishEnglishEnglishEnglish

import * as THREE from 'three';

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _v4 = new THREE.Vector3();
const _q1 = new THREE.Quaternion();
const _m1 = new THREE.Matrix4();

const isTyping = (e) => {
  const t = e.target;
  return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA');
};

// EnglishEnglishEnglishEnglish movementX/Y EnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglish
const clampMove = (m) => Math.max(-150, Math.min(150, m));

/**
 * EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish，EnglishEnglishEnglishEnglish）。
 *   ρ(h) = ρ₀·exp(−h/H)，H EnglishEnglishEnglishEnglishEnglish Rayleigh EnglishEnglish（EnglishEnglish 8.5km、EnglishEnglish 11.1km——
 *   EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），ρ₀ EnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglish**（EnglishEnglish 1.225 kg/m³、
 *   EnglishEnglish 0.020、EnglishEnglish 65）。
 *   q = ½ρv²（EnglishEnglish，Pa）；EnglishEnglishEnglishEnglishEnglish Sutton–Graves English q̇ ∝ √ρ·v³。
 *
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish rayleighScaleKm·2.4（EnglishEnglish 20.4km）：EnglishEnglish 30km EnglishEnglishEnglishEnglishEnglishEnglish，
 * English 60km EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 200 English，EnglishEnglishEnglishEnglishEnglishEnglish MPa EnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglish 120km
 * ——EnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 */
export function aeroAt(altKm, speedKmS, atm) {
  const H = atm.rayleighScaleKm ?? 8;
  const rho0 = atm.rho0 ?? 1.225;
  const rho = rho0 * Math.exp(-Math.max(altKm, 0) / H);
  const vMS = speedKmS * 1000;
  return { rho, q: 0.5 * rho * vMS * vMS, heat: Math.sqrt(Math.max(rho, 0)) * vMS * vMS * vMS };
}

export class Input {
  constructor(dom, canvas = null) {
    this.keys = new Set();
    this.dx = 0; this.dy = 0; this.wheel = 0; this.fovWheel = 0;
    this.locked = false;
    this.justPressed = new Set();
    this.drag = { active: false, dx: 0, dy: 0 };
    this.pan  = { active: false, dx: 0, dy: 0 };
    this.look = { active: false, dx: 0, dy: 0 };
    this.onLockChange = null;

    // Touch / joystick fields (set by TouchControls)
    this.joystick     = { x: 0, y: 0 };  // -1..1 analog stick
    this.touchAscend  = false;            // held: up-thrust / ascend in water
    this.touchDescend = false;            // held: down-thrust / dive
    this.touchSprint  = false;            // held: run
    this.touchJump    = false;            // one-shot: jump (consumed in updateWalk)

    // ── Gamepad（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish）────────────────────
    this._padIdx = -1;
    this._padKeys = new Set(); // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）
    this._padPrev = [];        // EnglishEnglishEnglishEnglishEnglish
    dom.addEventListener('gamepadconnected', (e) => { this._padIdx = e.gamepad.index; });
    dom.addEventListener('gamepaddisconnected', (e) => {
      if (e.gamepad.index === this._padIdx) this._padIdx = -1;
    });

    // Internal pointer-event tracking
    this._pointers    = new Map();  // pointerId → {x, y}
    this._ptrDownPos  = new Map();  // pointerId → {x, y} at pointerdown
    this._pinchDist   = 0;          // last two-finger distance
    this._pinchMid    = null;       // last two-finger midpoint
    this._tapStart    = 0;          // pointerdown timestamp for tap detection
    this._lastTapTime = 0;
    this._lastTapPos  = { x: 0, y: 0 };
    this.muteUntil    = 0;
    this._wasPinching = false;      // true during/after 2-finger gesture → suppresses tap
    this._canvas      = canvas;     // for releasing pointer capture on gesture cancel

    // ── Keyboard ──────────────────────────────────────────────────────────
    dom.addEventListener('keydown', (e) => {
      if (isTyping(e)) return;
      if (['Space', 'BracketLeft', 'BracketRight', 'Tab', 'PageUp', 'PageDown',
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      if (e.repeat) { this.keys.add(e.code); return; }
      this.keys.add(e.code);
      this.justPressed.add(e.code);
    });
    dom.addEventListener('keyup', (e) => { if (!isTyping(e)) this.keys.delete(e.code); });

    // ── Pointer lock ──────────────────────────────────────────────────────
    document.addEventListener('pointerlockchange', () => {
      this.locked = !!document.pointerLockElement;
      this.muteUntil = performance.now() + 150;
      this.dx = 0; this.dy = 0;
      if (!this.locked) this.keys.clear();
      this.onLockChange?.(this.locked);
    });

    // ── Mouse-move (pointer-lock only: uses movementX/Y) ──────────────────
    document.addEventListener('mousemove', (e) => {
      if (performance.now() < this.muteUntil) return;
      if (this.locked) {
        this.dx += clampMove(e.movementX);
        this.dy += clampMove(e.movementY);
      }
      // Non-locked movement handled by pointermove on canvas below
    });

    // ── Wheel ─────────────────────────────────────────────────────────────
    document.addEventListener('wheel', (e) => {
      if (isTyping(e)) return;
      // EnglishEnglishEnglishEnglishEnglishEnglish UI EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglish（#dir-body English overflow-y:auto）、
      // EnglishEnglish、EnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      if (e.target?.closest?.('#directory, #help, .tour-bar, .tc-panel, #hud-target, #start-screen')) return;
      // deltaMode EnglishEnglishEnglish：0=EnglishEnglish（Chrome/Edge），1=English（Firefox，×33），2=English（×100）
      const unit = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 100 : 1;
      // Shift+EnglishEnglish = FOV EnglishEnglish（10°–100°），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      const v = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY) * unit / 100, 1);
      if (e.shiftKey) this.fovWheel += v;
      else this.wheel += v;
    }, { passive: true });

    // ── Window blur ───────────────────────────────────────────────────────
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.drag.active = false; this.pan.active = false; this.look.active = false;
      this._pointers.clear(); this._ptrDownPos.clear();
      this._pinchDist = 0; this._pinchMid = null;
      this._wasPinching = false;
    });

    if (!canvas) return;

    // ── Canvas: Pointer Events (mouse + touch unified) ────────────────────
    canvas.addEventListener('pointerdown', (e) => {
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      try { canvas.setPointerCapture(e.pointerId); } catch { /* EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */ }
      const pt = { x: e.clientX, y: e.clientY };
      this._pointers.set(e.pointerId, { ...pt });
      this._ptrDownPos.set(e.pointerId, { ...pt });

      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        // Touch single-finger tap start
        if (this._pointers.size === 1) {
          this.drag.active = true;
          this._tapStart = performance.now();
          this._wasPinching = false; // fresh single-finger gesture
          // Synthesize mousedown so main.js downX/downY tracking catches it
          canvas.dispatchEvent(new MouseEvent('mousedown', {
            clientX: e.clientX, clientY: e.clientY, bubbles: false,
          }));
        } else if (this._pointers.size === 2) {
          // Two fingers: end single-drag, start pinch+pan
          this.drag.active = false;
          this._wasPinching = true;
          const pts = [...this._pointers.values()];
          this._pinchDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
          this._pinchMid  = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
        } else {
          // 3+ fingers: cancel everything
          this.drag.active = false; this.pan.active = false;
        }
      } else {
        // Mouse buttons
        if (this.locked) return;
        if (e.button === 0) {
          if (e.ctrlKey) this.look.active = true;
          else this.drag.active = true;
        } else if (e.button === 2 || e.button === 1) {
          this.pan.active = true;
          e.preventDefault();
        }
      }
    }, { passive: false });

    canvas.addEventListener('pointermove', (e) => {
      if (this.locked) return; // pointer-lock: handled by mousemove (movementX/Y)
      if (!this._pointers.has(e.pointerId)) return;

      const prev = this._pointers.get(e.pointerId);
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      const count = this._pointers.size;

      if (count === 1) {
        if (this.look.active)       { this.look.dx += dx; this.look.dy += dy; }
        else if (this.drag.active)  { this.drag.dx += dx; this.drag.dy += dy; }
        else if (this.pan.active)   { this.pan.dx  += dx; this.pan.dy  += dy; }
      } else if (count === 2) {
        const pts = [...this._pointers.values()];
        const newDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        const newMid  = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };

        // Pinch → wheel equivalent (spread = zoom in = wheel < 0)
        let pinchActive = false;
        if (this._pinchDist > 5 && newDist > 5) {
          const ratio = newDist / this._pinchDist;
          // 1.5% EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglish
          if (ratio > 0.1 && ratio < 10 && Math.abs(ratio - 1) > 0.015) {
            const wEq = -(Math.log(ratio) / Math.log(1.12)) * 1.6;
            this.wheel += wEq;
            pinchActive = true;
          }
        }
        this._pinchDist = newDist;

        // Two-finger translation → pan
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
        // EnglishEnglish look-at EnglishEnglishEnglishEnglishEnglishEnglish km English、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）。
        if (this._pinchMid && (!pinchActive || !this._wasPinching)) {
          const dmx = newMid.x - this._pinchMid.x;
          const dmy = newMid.y - this._pinchMid.y;
          if (Math.hypot(dmx, dmy) > 0.5) {
            this.pan.active = true;
            this.pan.dx += dmx;
            this.pan.dy += dmy;
          }
        }
        this._pinchMid = newMid;
      }
    }, { passive: true });

    const onPointerEnd = (e) => {
      const downPos = this._ptrDownPos.get(e.pointerId);
      const hadPinch = this._wasPinching;
      this._pointers.delete(e.pointerId);
      this._ptrDownPos.delete(e.pointerId);

      // Touch tap detection → synthesize click / dblclick on canvas
      if ((e.pointerType === 'touch' || e.pointerType === 'pen') && downPos) {
        const moved   = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
        const elapsed = performance.now() - this._tapStart;
        if (moved < 14 && elapsed < 400 && this._pointers.size === 0 && !hadPinch) {
          const now = performance.now();
          const dblDist = Math.hypot(e.clientX - this._lastTapPos.x, e.clientY - this._lastTapPos.y);
          if (now - this._lastTapTime < 360 && dblDist < 32) {
            canvas.dispatchEvent(new MouseEvent('dblclick', {
              clientX: e.clientX, clientY: e.clientY, bubbles: true, cancelable: true,
            }));
            this._lastTapTime = 0;
          } else {
            canvas.dispatchEvent(new MouseEvent('click', {
              clientX: e.clientX, clientY: e.clientY, bubbles: true, cancelable: true,
            }));
            this._lastTapTime = now;
            this._lastTapPos  = { x: e.clientX, y: e.clientY };
          }
        }
      }

      const remaining = this._pointers.size;
      if (remaining === 0) {
        this.drag.active = false; this.pan.active = false; this.look.active = false;
        this._pinchDist  = 0;    this._pinchMid  = null;
        this._wasPinching = false;
      } else if (remaining === 1) {
        // Back to single finger after two-finger gesture
        this._pinchDist = 0; this._pinchMid = null;
        this.pan.active = false;
        if (e.pointerType === 'touch' || e.pointerType === 'pen') {
          this.drag.active = true;
        }
      }
    };
    canvas.addEventListener('pointerup',     onPointerEnd);
    canvas.addEventListener('pointercancel', onPointerEnd);

    // Browser may implicitly release capture (alert, system gesture, scroll edge).
    // Treat it like pointerup so stale pointerIds don't accumulate.
    canvas.addEventListener('lostpointercapture', (e) => {
      if (this._pointers.has(e.pointerId)) onPointerEnd(e);
    });

    // Fallback: release on window in case pointer capture was lost
    window.addEventListener('mouseup', () => {
      if (this._pointers.size === 0) {
        this.drag.active = false; this.pan.active = false; this.look.active = false;
      }
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // ── Global: capture 2nd finger even when it lands on HUD/label elements ──
    // Without this, a second touch on a non-canvas element is never registered,
    // so canvas never enters pinch mode. Only allow promotion from exactly 1
    // existing pointer → 2; ignore 3rd+ fingers to keep state machine simple.
    // EnglishEnglish TouchControls EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish capture EnglishEnglish pointer，EnglishEnglish pinch
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish setPointerCapture EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish。
    window.addEventListener('pointerdown', (e) => {
      if (e.target === canvas) return;               // canvas already handled it
      if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
      if (this._pointers.size !== 1) return;         // only promote a lone pointer to pinch
      if (this._pointers.has(e.pointerId)) return;   // duplicate
      try { canvas.setPointerCapture(e.pointerId); } catch { return; }
      // EnglishEnglishEnglishEnglishEnglishEnglish（English TouchControls）EnglishEnglishEnglishEnglishEnglishEnglishEnglish setPointerCapture，
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，canvas EnglishEnglishEnglishEnglish pinch。
      e.stopImmediatePropagation();
      this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this._ptrDownPos.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this._pointers.size === 2) {
        this.drag.active = false; this.pan.active = false;
        this._wasPinching = true;
        const pts = [...this._pointers.values()];
        this._pinchDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        this._pinchMid  = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      }
    }, { capture: true, passive: true });
  }

  down(code) { return this.keys.has(code); }
  tapped(code) { return this.justPressed.has(code); }

  /**
   * EnglishEnglishEnglishEnglish（Gamepad API EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish）。
   * EnglishEnglish（EnglishEnglishEnglishEnglish）：
   *   EnglishEnglishEnglishEnglish：EnglishEnglishEnglish=EnglishEnglish（GE English WASD EnglishEnglish）/EnglishEnglishEnglish=EnglishEnglish/LB·RB=EnglishEnglishEnglishEnglish
   *   EnglishEnglishEnglishEnglish：EnglishEnglishEnglish=EnglishEnglish/EnglishEnglishEnglish=EnglishEnglishEnglishEnglish/EnglishEnglish=EnglishEnglish/LT·RT=EnglishEnglishEnglish
   *   EnglishEnglishEnglishEnglish：EnglishEnglishEnglish=EnglishEnglish/EnglishEnglishEnglish=EnglishEnglish
   *   EnglishEnglish：A=EnglishEnglish B=EnglishEnglishEnglishEnglish X=EnglishEnglish Y=EnglishEnglish/EnglishEnglish Start=EnglishEnglish Back=EnglishEnglishEnglishEnglish
   */
  pollGamepad(mode = 'orbit') {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    if (this._padIdx < 0) {
      const pads = navigator.getGamepads();
      for (let i = 0; i < pads.length; i++) if (pads[i]?.connected) { this._padIdx = i; break; }
      if (this._padIdx < 0) return;
    }
    const gp = navigator.getGamepads()[this._padIdx];
    if (!gp?.connected) { this._padIdx = -1; return; }

    const dz = (v) => (Math.abs(v) > 0.2 ? v : 0); // EnglishEnglish
    const lx = dz(gp.axes[0] ?? 0), ly = dz(gp.axes[1] ?? 0);
    const rx = dz(gp.axes[2] ?? 0), ry = dz(gp.axes[3] ?? 0);

    // EnglishEnglish → EnglishEnglishEnglishEnglish（English GE EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish）
    const want = new Set();
    if (mode === 'orbit') {
      if (ly < 0) want.add('KeyW'); if (ly > 0) want.add('KeyS');
      if (lx < 0) want.add('KeyA'); if (lx > 0) want.add('KeyD');
      if (ry < 0) want.add('PageUp'); if (ry > 0) want.add('PageDown');
    } else {
      this.dx += lx * 2.4; this.dy += ly * 2.4; // EnglishEnglishEnglishEnglishEnglish
      if (mode === 'walk') {
        this.joystick.x = rx; this.joystick.y = ry; // EnglishEnglishEnglishEnglishEnglish
      } else {
        if (ry < 0) want.add('KeyW'); if (ry > 0) want.add('KeyS');
        if (rx < 0) want.add('KeyA'); if (rx > 0) want.add('KeyD');
        if (gp.buttons[6]?.pressed) want.add('ShiftLeft');  // LT EnglishEnglish/EnglishEnglishEnglish
        if (gp.buttons[7]?.pressed) want.add('Equal');
      }
    }
    // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    for (const k of this._padKeys) if (!want.has(k)) this.keys.delete(k);
    for (const k of want) this.keys.add(k);
    this._padKeys = want;

    // EnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglish
    const BTN = { 0: 'Space', 1: 'KeyV', 2: 'KeyX', 3: 'KeyG', 4: 'BracketLeft', 5: 'BracketRight', 8: 'KeyN', 9: 'KeyP' };
    for (const [i, code] of Object.entries(BTN)) {
      const pressed = !!gp.buttons[i]?.pressed;
      const was = !!this._padPrev[i];
      if (pressed && !was) { this.keys.add(code); this.justPressed.add(code); }
      if (!pressed && was && !this._padKeys.has(code)) this.keys.delete(code);
      this._padPrev[i] = pressed;
    }
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish / EnglishEnglish / EnglishEnglish / EnglishEnglishEnglish）。
   * EnglishEnglishEnglishEnglish _pointers，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
   * EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，GE EnglishEnglish"EnglishEnglish"）。
   */
  cancelGestures() {
    if (this._canvas) {
      for (const id of this._pointers.keys()) {
        try { this._canvas.releasePointerCapture(id); } catch { /* EnglishEnglishEnglishEnglishEnglishEnglish */ }
      }
    }
    this._pointers.clear();
    this._ptrDownPos.clear();
    this.drag.active = false; this.pan.active = false; this.look.active = false;
    this._pinchDist = 0; this._pinchMid = null;
    this._wasPinching = false;
    this.drag.dx = 0; this.drag.dy = 0;
    this.pan.dx = 0; this.pan.dy = 0;
    this.look.dx = 0; this.look.dy = 0;
  }

  endFrame() {
    this.dx = 0; this.dy = 0; this.wheel = 0; this.fovWheel = 0;
    this.drag.dx = 0; this.drag.dy = 0;
    this.pan.dx  = 0; this.pan.dy  = 0;
    this.look.dx = 0; this.look.dy = 0;
    this.justPressed.clear();
  }
}

const MOUSE_SENS   = 0.0022;
const WALK_SENS    = 0.00085;
const WALK_SMOOTH_TAU  = 0.05;
const WALK_FRAME_CLAMP = 260;
const MAX_SUN_R  = 1.55e13;
const WALK_EYE_KM = 0.0017;
const MIN_SPEED = 0.001;
const MAX_SPEED = 3e8;

// EnglishEnglish palette → EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English AudioEngine EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
// EnglishEnglish/EnglishEnglishEnglish palette EnglishEnglishEnglish 'rock'；EnglishEnglish/Titan EnglishEnglishEnglish 'sand'；
// EnglishEnglishEnglishEnglishEnglish 'dirt'；EnglishEnglishEnglishEnglishEnglish 'ice'。
const SURFACE_PALETTE_TO_AUDIO = {
  mars: 'sand', titan: 'sand',
  earth: 'dirt',
  ice: 'ice', pluto: 'ice', triton: 'ice',
};
const surfaceTypeOf = (phys) => {
  const p = phys?.surface?.palette;
  return SURFACE_PALETTE_TO_AUDIO[p] || 'rock';
};

export class Ship {
  constructor() {
    this.mode = 'fly';
    this.posKm = new Float64Array(3);
    this.quat = new THREE.Quaternion();
    this.vel = new THREE.Vector3();
    this.speedSetting = 10;
    // EnglishEnglishEnglishEnglishEnglish（km/s）。EnglishEnglishEnglishEnglishEnglishEnglishEnglish Δv EnglishEnglishEnglishEnglish——EnglishEnglish"EnglishEnglishEnglishEnglish"English
    // "EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    // 9.4 km/s ≈ EnglishEnglishEnglish 200km EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish/EnglishEnglishEnglishEnglish）。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    this.dvBudget = 9.4;
    // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    // EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    this.gravityMode = false;
    this.effSpeed = 0;
    this.damping = true;
    this.walk = {
      bodyId: null, localPos: new THREE.Vector3(),
      yaw: 0, pitch: 0, vAlt: 0, grounded: false,
      smx: 0, smy: 0, diving: false, submerged: false,
      groundSmooth: null, // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（null = EnglishEnglishEnglishEnglish）
    };
    // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglish AudioEngine EnglishEnglish（EnglishEnglishEnglishEnglishEnglish audio，EnglishEnglish）。
    // updateWalk / updateFly EnglishEnglishEnglishEnglish，main.js EnglishEnglishEnglishEnglishEnglish AudioEngine.update()。
    this.audioState = { walking: false, speed: 0, submerged: false, surfaceType: 'rock' };
  }

  speed() { return this.vel.length(); }

  update(dt, input, env) {
    if (input.wheel !== 0 && this.mode === 'fly') {
      this.speedSetting *= Math.pow(0.5, input.wheel);
      this.speedSetting = Math.min(MAX_SPEED, Math.max(MIN_SPEED, this.speedSetting));
    }
    if (input.tapped('KeyG') && env.nearest) {
      // DEM EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      const ready = !env.baseReady || env.baseReady(env.nearest.id);
      if (this.mode === 'fly' && env.nearest.landable && env.nearest.distSurface < 20 && ready) {
        this.enterWalk(env);
      } else if (this.mode === 'walk') {
        this.exitWalk(env);
      }
    }
    if (this.mode === 'walk') this.updateWalk(dt, input, env);
    else this.updateFly(dt, input, env);
  }

  updateFly(dt, input, env) {
    // View: pointer-lock uses dx/dy; mobile uses single-finger drag
    const lookDx = input.locked ? input.dx : input.drag.dx;
    const lookDy = input.locked ? input.dy : input.drag.dy;
    const yaw   = -lookDx * MOUSE_SENS;
    const pitch = -lookDy * MOUSE_SENS;
    let roll = 0;
    if (input.down('KeyQ')) roll += 1.2 * dt;
    if (input.down('KeyE')) roll -= 1.2 * dt;
    _q1.set(pitch / 2, yaw / 2, roll / 2, 1).normalize();
    this.quat.multiply(_q1).normalize();

    // Thrust — keyboard + joystick
    const jx = input.joystick.x;
    const jy = input.joystick.y;
    _v1.set(0, 0, 0);
    if (input.down('KeyW') || jy < -0.15) _v1.z -= 1;
    if (input.down('KeyS') || jy > 0.15)  _v1.z += 1;
    if (input.down('KeyA') || jx < -0.15) _v1.x -= 1;
    if (input.down('KeyD') || jx > 0.15)  _v1.x += 1;
    if (input.down('KeyR') || input.down('Space') || input.touchAscend)  _v1.y += 1;
    if (input.down('KeyC') || input.touchDescend) _v1.y -= 1;

    const thrusting = _v1.lengthSq() > 0;
    if (thrusting) _v1.normalize().applyQuaternion(this.quat);

    let cap = this.speedSetting;
    if (env.nearest) {
      const d = Math.max(env.nearest.distSurface, 0.001);
      cap = Math.min(cap, Math.max(0.02, d * 0.6));
    }
    this.effSpeed = thrusting ? cap : 0;
    const boost = (input.down('ShiftLeft') || input.touchSprint) ? 2 : 1;

    if (this.gravityMode) {
      // ── EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish ──
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
      // EnglishEnglishEnglish：**EnglishEnglishEnglishEnglish**——EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。
      // EnglishEnglishEnglishEnglish Δv EnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      if (this.dvBudget > 0) {
        const dv = cap * boost * 0.5 * dt;
        const use = Math.min(this.dvBudget, dv);
        this.vel.addScaledVector(_v1, use);
        this.dvBudget -= use;
      }
      const nb = env.nearest;
      if (nb && nb.phys?.gm) {
        _v3.set(this.posKm[0] - nb.posKm[0], this.posKm[1] - nb.posKm[1], this.posKm[2] - nb.posKm[2]);
        const r2 = Math.max(_v3.lengthSq(), 1e-6);
        const r = Math.sqrt(r2);
        const a = nb.phys.gm / r2;                        // km/s²
        this.vel.addScaledVector(_v3, -a * dt / r);
      }
      const rSun2 = Math.max(this.posKm[0] ** 2 + this.posKm[1] ** 2 + this.posKm[2] ** 2, 1e-6);
      const aSun = 1.32712440018e11 / rSun2;
      const rSunLen = Math.sqrt(rSun2);
      this.vel.x -= aSun * dt * this.posKm[0] / rSunLen;
      this.vel.y -= aSun * dt * this.posKm[1] / rSunLen;
      this.vel.z -= aSun * dt * this.posKm[2] / rSunLen;

      // === EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）===
      // EnglishEnglishEnglishEnglishEnglishEnglish ∝ ½ρv²·CL·A，EnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglish。
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"，
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"。
      {
        const nb2 = env.nearest;
        const atmL = nb2?.phys?.atmosphere;
        if (atmL && this.aero && this.aero.q > 200) {
          _v3.set(this.posKm[0] - nb2.posKm[0], this.posKm[1] - nb2.posKm[1], this.posKm[2] - nb2.posKm[2]);
          const rl = _v3.length() || 1;
          _v3.multiplyScalar(1 / rl);                    // EnglishEnglishEnglish"English"
          // EnglishEnglishEnglishEnglish（km/s）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
          const vrUp = this.vel.dot(_v3);
          const vhMS = Math.sqrt(Math.max(0, this.vel.lengthSq() - vrUp * vrUp)) * 1000;
          // EnglishEnglishEnglishEnglish：60–140 m/s EnglishEnglishEnglishEnglish
          const t = Math.max(0, Math.min(1, (vhMS - 60) / 80));
          const stall = t * t * (3 - 2 * t);
          // EnglishEnglishEnglishEnglishEnglish（m/s²）：EnglishEnglish × EnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglish km/s²
          const liftMS = this.aero.q * 0.00040 * stall;
          this.vel.addScaledVector(_v3, liftMS * 1e-3 * dt);
          this.aero.liftMS = liftMS;
        } else if (this.aero) {
          this.aero.liftMS = 0;
        }
      }
      if (input.tapped('KeyX')) { /* EnglishEnglishEnglishEnglishEnglish X EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */ }
    } else if (this.damping) {
      _v2.copy(_v1).multiplyScalar(cap * boost);
      const k = 1 - Math.exp(-dt * 3.5);
      this.vel.lerp(_v2, k);
      if (!thrusting && this.vel.lengthSq() < 1e-10) this.vel.set(0, 0, 0);
    } else {
      this.vel.addScaledVector(_v1, cap * boost * 0.5 * dt);
    }
    if (!this.gravityMode && input.tapped('KeyX')) this.vel.set(0, 0, 0);

    // === EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ===
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（audio.js EnglishEnglishEnglishEnglishEnglish），**EnglishEnglishEnglishEnglishEnglishEnglish**：English 7 km/s EnglishEnglish
    // EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish。EnglishEnglish"EnglishEnglishEnglishEnglish"English"EnglishEnglishEnglishEnglish"
    // EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    //
    // EnglishEnglish：EnglishEnglishEnglishEnglish ρ(h)=ρ0·exp(-h/H)；EnglishEnglishEnglishEnglishEnglish a = q/β（q=½ρv²，β EnglishEnglishEnglish
    // EnglishEnglish）；EnglishEnglishEnglishEnglishEnglish Sutton–Graves English q̇ ∝ √ρ·v³。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English main.js）。
    this.aero = this.aero || { q: 0, heat: 0, rho: 0, alt: Infinity };
    {
      const nb = env.nearest;
      const atmN = nb?.phys?.atmosphere;
      if (atmN && Number.isFinite(nb.distSurface)) {
        const alt = Math.max(nb.distSurface, 0);            // km
        const a = aeroAt(alt, this.vel.length(), atmN);
        this.aero.rho = a.rho; this.aero.alt = alt; this.aero.q = a.q; this.aero.heat = a.heat;
        if (a.q > 1e-6) {
          // EnglishEnglishEnglishEnglish β = m/(Cd·A) ≈ 500 kg/m²（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
          const aMS = a.q / 500;
          const dv = Math.min(this.vel.length(), aMS * 1e-3 * dt);   // km/s
          if (this.vel.length() > 0) this.vel.multiplyScalar(1 - dv / this.vel.length());
        }
      } else {
        this.aero.q = 0; this.aero.heat = 0; this.aero.rho = 0; this.aero.alt = Infinity;
      }
    }

    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish**EnglishEnglish**EnglishEnglish（EnglishEnglishEnglish），EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglish"
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    if (!this._prevPosKm) this._prevPosKm = new Float64Array(3);
    this._prevPosKm[0] = this.posKm[0];
    this._prevPosKm[1] = this.posKm[1];
    this._prevPosKm[2] = this.posKm[2];
    this.posKm[0] += this.vel.x * dt;
    this.posKm[1] += this.vel.y * dt;
    this.posKm[2] += this.vel.z * dt;

    const rSun = Math.hypot(this.posKm[0], this.posKm[1], this.posKm[2]);
    if (rSun > MAX_SUN_R) {
      const s = MAX_SUN_R / rSun;
      this.posKm[0] *= s; this.posKm[1] *= s; this.posKm[2] *= s;
      _v1.set(this.posKm[0], this.posKm[1], this.posKm[2]).normalize();
      const vr = this.vel.dot(_v1);
      if (vr > 0) this.vel.addScaledVector(_v1, -vr);
    }

    if (env.nearest) {
      const n = env.nearest;
      _v1.set(this.posKm[0] - n.posKm[0], this.posKm[1] - n.posKm[1], this.posKm[2] - n.posKm[2]);
      const dist = _v1.length();
      let minR = n.radiusKm + (n.landable ? 0.005 : n.radiusKm * 0.001);
      // === EnglishEnglishEnglishEnglish ===
      // EnglishEnglish"EnglishEnglishEnglishEnglishEnglish + 5 m"EnglishEnglish，EnglishEnglishEnglishEnglish 5 m EnglishEnglish**EnglishEnglishEnglishEnglish**——
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      // （DEM EnglishEnglish + EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglish、EnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglish。
      // EnglishEnglish dist < 1.05 R EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      if (n.landable && env.heightFn && dist > 0 && dist < n.radiusKm * 1.05) {
        _v1.normalize();
        _v4.copy(_v1).applyQuaternion(_q1.copy(env.getBodyQuat(n.id)).invert());  // EnglishEnglish→EnglishEnglish
        const h = env.heightFn(n.id, _v4);
        if (Number.isFinite(h) && h > 0) minR = h + 0.005;
      }
      // === EnglishEnglishEnglishEnglish ===
      // EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish 2 AU/s，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish → **EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish**；EnglishEnglishEnglishEnglish
      // EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"English"EnglishEnglishEnglishEnglishEnglish。
      // EnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish-EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      if (dist < minR && dist > 0) {
        _v1.normalize();
        this.posKm[0] = n.posKm[0] + _v1.x * minR;
        this.posKm[1] = n.posKm[1] + _v1.y * minR;
        this.posKm[2] = n.posKm[2] + _v1.z * minR;
        const vr = this.vel.dot(_v1);
        if (vr < 0) this.vel.addScaledVector(_v1, -vr);
      } else if (this._prevPosKm) {
        const ax = this._prevPosKm[0] - n.posKm[0];
        const ay = this._prevPosKm[1] - n.posKm[1];
        const az = this._prevPosKm[2] - n.posKm[2];
        const dx = this.posKm[0] - this._prevPosKm[0];
        const dy = this.posKm[1] - this._prevPosKm[1];
        const dz = this.posKm[2] - this._prevPosKm[2];
        const A = dx * dx + dy * dy + dz * dz;
        if (A > 1e-18) {
          const B = 2 * (ax * dx + ay * dy + az * dz);
          const C = ax * ax + ay * ay + az * az - minR * minR;
          const disc = B * B - 4 * A * C;
          if (disc >= 0) {
            const t = (-B - Math.sqrt(disc)) / (2 * A);
            if (t >= 0 && t <= 1) {
              // EnglishEnglishEnglish t EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish
              this.posKm[0] = this._prevPosKm[0] + dx * t;
              this.posKm[1] = this._prevPosKm[1] + dy * t;
              this.posKm[2] = this._prevPosKm[2] + dz * t;
              const px = this.posKm[0] - n.posKm[0];
              const py = this.posKm[1] - n.posKm[1];
              const pz = this.posKm[2] - n.posKm[2];
              const pl = Math.hypot(px, py, pz) || 1;
              const vr = (this.vel.x * px + this.vel.y * py + this.vel.z * pz) / pl;
              if (vr < 0) { this.vel.x -= vr * px / pl; this.vel.y -= vr * py / pl; this.vel.z -= vr * pz / pl; }
            }
          }
        }
      }
    }

    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish / EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish / EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    this.audioState.walking = false;
    this.audioState.speed = this.vel.length();
    this.audioState.submerged = false;
    this.audioState.surfaceType = env.nearest
      ? surfaceTypeOf(env.phys(env.nearest.id))
      : this.audioState.surfaceType;
  }

  enterWalk(env) {
    const n = env.nearest;
    this.mode = 'walk';
    const w = this.walk;
    w.bodyId = n.id;
    _v1.set(this.posKm[0] - n.posKm[0], this.posKm[1] - n.posKm[1], this.posKm[2] - n.posKm[2]);
    _q1.copy(env.getBodyQuat(n.id)).invert();
    _v1.applyQuaternion(_q1);
    const h = env.heightFn(n.id, _v2.copy(_v1).normalize());
    w.localPos.copy(_v2).multiplyScalar(h + WALK_EYE_KM);
    w.vAlt = 0;
    w.grounded = true;
    const frame = this.walkFrame(_m1, env);
    _v3.set(0, 0, -1).applyQuaternion(this.quat);
    _q1.copy(env.getBodyQuat(w.bodyId)).invert();
    _v3.applyQuaternion(_q1);
    const e = new THREE.Vector3().setFromMatrixColumn(frame, 0);
    const upv = new THREE.Vector3().setFromMatrixColumn(frame, 1);
    const nrt = new THREE.Vector3().setFromMatrixColumn(frame, 2);
    w.yaw   = Math.atan2(_v3.dot(e), _v3.dot(nrt));
    w.pitch = Math.asin(THREE.MathUtils.clamp(_v3.dot(upv), -1, 1));
    w.smx = 0; w.smy = 0;
    w.diving = false; w.submerged = false;
    w.groundSmooth = null; // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    this.vel.set(0, 0, 0);
  }

  exitWalk(env) {
    this.mode = 'walk-exit';
    const up = _v1.copy(this.walk.localPos).normalize().applyQuaternion(env.getBodyQuat(this.walk.bodyId));
    this.posKm[0] += up.x * 0.003;
    this.posKm[1] += up.y * 0.003;
    this.posKm[2] += up.z * 0.003;
    this.vel.set(0, 0, 0);
    this.mode = 'fly';
  }

  walkFrame(outM, env) {
    const u = _v2.copy(this.walk.localPos).normalize();
    const poleY = Math.abs(u.y) > 0.999;
    const east  = poleY ? _v3.set(1, 0, 0) : _v3.set(0, 1, 0).cross(u).normalize();
    const north = new THREE.Vector3().crossVectors(u, east);
    return outM.makeBasis(east.clone(), u.clone(), north);
  }

  updateWalk(dt, input, env) {
    const w = this.walk;
    const bodyPos  = env.getBodyPos(w.bodyId);
    const bodyQuat = env.getBodyQuat(w.bodyId);
    const phys = env.phys(w.bodyId);
    const r = w.localPos.length();
    const g = (phys.gm / (r * r));

    // View input — pointer-lock OR single-finger drag OR touch drag
    let inDx = input.locked ? input.dx : (input.drag.active ? input.drag.dx : 0);
    let inDy = input.locked ? input.dy : (input.drag.active ? input.drag.dy : 0);
    inDx = Math.max(-WALK_FRAME_CLAMP, Math.min(WALK_FRAME_CLAMP, inDx));
    inDy = Math.max(-WALK_FRAME_CLAMP, Math.min(WALK_FRAME_CLAMP, inDy));
    const sm = 1 - Math.exp(-Math.min(dt, 0.033) / WALK_SMOOTH_TAU);
    w.smx += (inDx - w.smx) * sm;
    w.smy += (inDy - w.smy) * sm;
    w.yaw   += w.smx * WALK_SENS;
    w.pitch -= w.smy * WALK_SENS;
    if (w.pitch >  Math.PI) w.pitch -= 2 * Math.PI;
    if (w.pitch < -Math.PI) w.pitch += 2 * Math.PI;
    if (w.yaw   >  Math.PI) w.yaw   -= 2 * Math.PI;
    if (w.yaw   < -Math.PI) w.yaw   += 2 * Math.PI;

    const frame = this.walkFrame(_m1, env);
    const east  = _v1.setFromMatrixColumn(frame, 0).clone();
    const up    = _v2.setFromMatrixColumn(frame, 1).clone();
    const north = _v3.setFromMatrixColumn(frame, 2).clone();

    const fwd   = north.clone().multiplyScalar(Math.cos(w.yaw)).addScaledVector(east, Math.sin(w.yaw));
    const right = new THREE.Vector3().crossVectors(fwd, up).normalize();

    // Movement — keyboard + virtual joystick
    const jx = input.joystick.x;
    const jy = input.joystick.y;
    const move = new THREE.Vector3();
    if (input.down('KeyW') || jy < -0.15) move.add(fwd);
    if (input.down('KeyS') || jy > 0.15)  move.sub(fwd);
    if (input.down('KeyD') || jx > 0.15)  move.add(right);
    if (input.down('KeyA') || jx < -0.15) move.sub(right);

    const dirNow = w.localPos.clone().normalize();
    const surfR  = phys.radiusKm + 0.001;
    const onWater = !!env.isWater?.(w.bodyId, dirNow);
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglish/EnglishEnglishEnglish）
    const wantDescend = input.down('PageDown') || input.touchDescend || input.wheel <= -0.5;
    // EnglishEnglishEnglishEnglish：**EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglish"**。EnglishEnglish inWater EnglishEnglish w.diving English r < surfR+1e-7，
    // EnglishEnglishEnglishEnglish r = surfR + EnglishEnglish(1.7m)，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、
    // EnglishEnglishEnglishEnglishEnglish，EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"。
    const inWater = onWater && r < surfR + 0.0015;
    // EnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglish**（EnglishEnglishEnglish + EnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglish w.diving EnglishEnglishEnglishEnglishEnglish、EnglishEnglish"EnglishEnglishEnglishEnglish"EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglish 3 English diving EnglishEnglishEnglish false。
    w.diving = inWater && wantDescend;
    let speed = ((input.down('ShiftLeft') || input.touchSprint) ? 0.009 : 0.003);
    if (inWater) speed *= 0.45;
    const moving = move.lengthSq() > 0;
    if (moving) {
      move.normalize().multiplyScalar(speed * dt);
      // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"，
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish 3 m/s **EnglishEnglishEnglishEnglishEnglish**
      // （EnglishEnglish DEM EnglishEnglishEnglish/EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
      //
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish ≈ speed·dt，EnglishEnglish tan(60°)=1.73 EnglishEnglishEnglishEnglish。
      // 60° EnglishEnglishEnglish 45°：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，45° EnglishEnglishEnglishEnglishEnglishEnglishEnglish；
      // EnglishEnglish"EnglishEnglish"，EnglishEnglishEnglishEnglishEnglish。
      if (!inWater) {
        const cand = w.localPos.clone().add(move).normalize();
        const rise = env.heightFn(w.bodyId, cand) - env.heightFn(w.bodyId, dirNow);
        const run = speed * dt;
        if (rise > run * 1.73) move.set(0, 0, 0);
      }
      w.localPos.add(move);
    }

    if (inWater && input.wheel !== 0) {
      const depth = Math.max(surfR - w.localPos.length(), 0.0002);
      const step  = Math.max(0.0004, depth * 0.12);
      w.localPos.addScaledVector(up, step * Math.max(-3, Math.min(3, input.wheel)));
    }
    // Water vertical with touch
    if (inWater && input.touchAscend)  w.vAlt += g * 0.5 * dt;

    // Jump / ascend
    const jumpTriggered = input.tapped('Space') || input.touchJump;
    if (jumpTriggered) {
      if (w.grounded) {
        w.vAlt = inWater ? 0.0024 : 0.0042;
        w.grounded = false;
      }
      input.touchJump = false; // consume
    }
    if (inWater) {
      if (input.down('Space') || input.touchAscend) w.vAlt += g * 0.5 * dt;
      // EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish，EnglishEnglish"EnglishEnglish"EnglishEnglishEnglishEnglish"EnglishEnglish"。
      // EnglishEnglishEnglishEnglishEnglishEnglish ∝ EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglish 1.2 m/s；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      const depth = Math.max(0, surfR - w.localPos.length());
      if (wantDescend) {
        w.vAlt -= g * 0.5 * dt;
      } else {
        const wantV = Math.min(depth * 0.6, 0.0012);
        w.vAlt += (wantV - w.vAlt) * Math.min(dt * 2.5, 1);
      }
      w.vAlt *= Math.exp(-dt * 0.8);   // EnglishEnglish
    } else {
      w.vAlt -= g * dt;
    }
    w.localPos.addScaledVector(up, w.vAlt * dt);

    const dir = w.localPos.clone().normalize();
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish w.diving EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    const rr = w.localPos.length();
    w.submerged = onWater && rr < surfR - 0.0002;
    // EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglish（EnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglish 1.4m —— EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    // EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglish heightFn（=EnglishEnglish）EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    let ground;
    if (w.diving) {
      ground = (env.heightSolidFn ?? env.heightFn)(w.bodyId, dir) + WALK_EYE_KM;
    } else if (onWater) {
      ground = surfR - 0.0014 + WALK_EYE_KM;
    } else {
      ground = env.heightFn(w.bodyId, dir) + WALK_EYE_KM;
    }
    // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，English DEM EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    // EnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglish：
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
    if (w.groundSmooth == null) w.groundSmooth = ground;
    if (w.grounded) {
      const delta = ground - w.groundSmooth;
      // EnglishEnglishEnglish（>5m）= DEM EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish/English
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglish）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      // （EnglishEnglishEnglish ground EnglishEnglish → grounded=false → EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 1 EnglishEnglish）
      const big = Math.abs(delta) > 0.005;
      const tau = big ? 0.55 : (delta > 0 ? 0.03 : 0.11);
      w.groundSmooth += delta * (1 - Math.exp(-dt / tau));
      if (Math.abs(delta) < 1e-7) w.groundSmooth = ground;
      if (big) {
        w.localPos.copy(dir).multiplyScalar(w.groundSmooth); // EnglishEnglishEnglishEnglish
        w.vAlt = 0;
        ground = w.groundSmooth;
      }
    } else {
      w.groundSmooth = ground; // EnglishEnglish/EnglishEnglish：EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish
    }
    ground = w.grounded ? w.groundSmooth : ground;
    if (w.localPos.length() <= ground) {
      w.localPos.copy(dir).multiplyScalar(ground);
      w.vAlt = 0; w.grounded = true;
    } else if (w.localPos.length() > ground + 0.0001) {
      w.grounded = false;
    }

    const worldOff = w.localPos.clone().applyQuaternion(bodyQuat);
    this.posKm[0] = bodyPos[0] + worldOff.x;
    this.posKm[1] = bodyPos[1] + worldOff.y;
    this.posKm[2] = bodyPos[2] + worldOff.z;

    const lookM  = new THREE.Matrix4();
    const camFwd = fwd.clone().multiplyScalar(Math.cos(w.pitch)).addScaledVector(up, Math.sin(w.pitch));
    const camUp  = up.clone().multiplyScalar(Math.cos(w.pitch)).addScaledVector(fwd, -Math.sin(w.pitch));
    lookM.lookAt(new THREE.Vector3(), camFwd, camUp);
    this.quat.setFromRotationMatrix(lookM).premultiply(bodyQuat);

    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglish / EnglishEnglishEnglishEnglish / EnglishEnglish / EnglishEnglishEnglishEnglish
    this.audioState.walking = moving;
    this.audioState.speed = speed;
    this.audioState.submerged = !!w.submerged;
    this.audioState.surfaceType = surfaceTypeOf(phys);
  }
}
