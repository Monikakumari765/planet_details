// 3D EnglishEnglishEnglishEnglishEnglishEnglish（#37）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish SVG EnglishEnglishEnglish。
// EnglishEnglishEnglishEnglishEnglish、EnglishEnglish、EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish（orbit/fly/walk）EnglishEnglish。
//
// EnglishEnglishEnglishEnglish：
// - English SVG EnglishEnglish（EnglishEnglishEnglish Three.js EnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish。
// - EnglishEnglishEnglishEnglishEnglishEnglish {x,y,z} / THREE.Vector3，EnglishEnglishEnglishEnglishEnglish {x,y,z,w} / THREE.Quaternion——
//   EnglishEnglishEnglishEnglish，EnglishEnglish import Three.js，EnglishEnglishEnglishEnglishEnglishEnglish。
// - EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish Lambert EnglishEnglishEnglishEnglishEnglishEnglish
//   EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglish → EnglishEnglish，90° EnglishEnglish → EnglishEnglish，EnglishEnglish → EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）。
// - i18n：EnglishEnglishEnglishEnglish t()（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。

import { t, LANG } from './i18n.js';

// ── EnglishEnglish i18n EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish key EnglishEnglishEnglish i18n.js EnglishEnglishEnglishEnglishEnglish）────────
const I18N = {
  'compass.title': { en: 'Compass (C)' },
  'compass.sun': { en: 'Sun' },
  'compass.zenith': { en: 'Zenith' },
  'compass.nearest': { en: 'Nearest' },
  'compass.north': { en: 'N' },
  'compass.south': { en: 'S' },
  'compass.east': { en: 'E' },
  'compass.west': { en: 'W' },
};

/** EnglishEnglishEnglishEnglish i18n，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
function tt(key, vars) {
  const g = t(key, vars);
  if (g !== key) return g;
  const e = I18N[key];
  if (!e) return key;
  let s = typeof e === 'string' ? e : (e[LANG] ?? e.en ?? e.zh ?? key);
  if (vars) for (const k in vars) s = s.replaceAll('{' + k + '}', vars[k]);
  return s;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const R = 48; // EnglishEnglishEnglishEnglish（SVG EnglishEnglish）

// ── EnglishEnglishEnglish / EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish Three.js）──────────────────────────────

/**
 * EnglishEnglishEnglish v EnglishEnglishEnglishEnglishEnglishEnglish q EnglishEnglishEnglishEnglish（world → camera space）。
 * EnglishEnglishEnglishEnglishEnglishEnglish，q⁻¹ = EnglishEnglish = {x:-qx, y:-qy, z:-qz, w:qw}。
 * EnglishEnglishEnglishEnglish v' = q⁻¹ ⊗ v ⊗ q EnglishEnglishEnglishEnglishEnglishEnglishEnglish q* v q*⁻¹ → EnglishEnglishEnglish applyQuat(v, conjugate(q))。
 */
function applyInvQuat(v, q) {
  // EnglishEnglish
  const qx = -q.x, qy = -q.y, qz = -q.z, qw = q.w;
  const vx = v.x, vy = v.y, vz = v.z;
  // t = 2 × cross(q.xyz, v)
  const tx = 2 * (qy * vz - qz * vy);
  const ty = 2 * (qz * vx - qx * vz);
  const tz = 2 * (qx * vy - qy * vx);
  // v' = v + qw * t + cross(q.xyz, t)
  return {
    x: vx + qw * tx + (qy * tz - qz * ty),
    y: vy + qw * ty + (qz * tx - qx * tz),
    z: vz + qw * tz + (qx * ty - qy * tx),
  };
}

/** EnglishEnglishEnglishEnglish */
function cross3(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

/** EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish null） */
function normalize3(v) {
  const len = Math.hypot(v.x, v.y, v.z);
  if (len < 1e-12) return null;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 * EnglishEnglishEnglishEnglish（Three.js）：-Z = EnglishEnglish, +X = English, +Y = English。
 * SVG EnglishEnglish：+X = English, +Y = English（EnglishEnglish Y）。
 *
 * @returns {{x:number, y:number, opacity:number, behind:boolean}}
 */
function projectToDisc(dir, cameraQuat) {
  const cam = applyInvQuat(dir, cameraQuat);
  const sx = cam.x;
  const sy = -cam.y; // SVG Y EnglishEnglish
  const sz = cam.z;  // >0 = EnglishEnglishEnglishEnglishEnglish

  if (sz <= 0.001) {
    // EnglishEnglishEnglish：Lambert EnglishEnglishEnglishEnglish，EnglishEnglishEnglish→EnglishEnglish，90°EnglishEnglish→EnglishEnglish
    return { x: sx * R, y: sy * R, opacity: 1, behind: false };
  }
  // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  const len = Math.hypot(sx, sy);
  if (len < 1e-6) {
    return { x: 0, y: R * 0.82, opacity: 0.22, behind: true };
  }
  return {
    x: (sx / len) * R * 0.82,
    y: (sy / len) * R * 0.82,
    opacity: 0.22,
    behind: true,
  };
}

export class Compass {
  /**
   * @param {HTMLElement} container EnglishEnglishEnglishEnglish（EnglishEnglish document.body）
   */
  constructor(container) {
    this.visible = true;
    this._build(container);
  }

  _build(container) {
    this.root = document.createElement('div');
    this.root.className = 'compass-widget';
    this.root.style.cssText = [
      'position:fixed', 'bottom:14px', 'right:14px', 'z-index:15',
      'pointer-events:none', 'opacity:0.88',
      'transition:opacity 0.3s',
      'font-family:inherit',
    ].join(';');

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', '120');
    svg.setAttribute('height', '120');
    svg.setAttribute('viewBox', '-60 -60 120 120');
    svg.setAttribute('aria-label', tt('compass.title'));

    // ── EnglishEnglishEnglishEnglish ──
    const bg = document.createElementNS(SVG_NS, 'circle');
    bg.setAttribute('cx', '0'); bg.setAttribute('cy', '0'); bg.setAttribute('r', String(R + 4));
    bg.setAttribute('fill', 'rgba(3,6,15,0.86)');
    bg.setAttribute('stroke', 'rgba(56,189,248,0.22)');
    bg.setAttribute('stroke-width', '1');
    svg.appendChild(bg);

    // ── EnglishEnglish（EnglishEnglishEnglishEnglishEnglish）──
    const inner = document.createElementNS(SVG_NS, 'circle');
    inner.setAttribute('cx', '0'); inner.setAttribute('cy', '0'); inner.setAttribute('r', String(R * 0.5));
    inner.setAttribute('fill', 'none');
    inner.setAttribute('stroke', 'rgba(56,189,248,0.16)');
    inner.setAttribute('stroke-width', '0.5');
    svg.appendChild(inner);

    // ── EnglishEnglishEnglishEnglishEnglish ──
    for (const [x1, y1, x2, y2] of [[0, -R, 0, R], [-R, 0, R, 0]]) {
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', String(x1)); line.setAttribute('y1', String(y1));
      line.setAttribute('x2', String(x2)); line.setAttribute('y2', String(y2));
      line.setAttribute('stroke', 'rgba(56,189,248,0.12)');
      line.setAttribute('stroke-width', '0.5');
      svg.appendChild(line);
    }

    // ── EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）──
    // EnglishEnglish：EnglishEnglish cardinal（EnglishEnglish），EnglishEnglish sun/body/zenith（EnglishEnglish）
    this._markers = {};

    // Cardinal: N / S / E / W
    for (const key of ['north', 'south', 'east', 'west']) {
      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('font-size', '10');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', key === 'north' ? '#38bdf8' : '#94a3b8');
      text.setAttribute('opacity', '0');
      text.textContent = tt('compass.' + key);
      svg.appendChild(text);
      this._markers[key] = { el: text, opacity: 0 };
    }

    // Sun marker
    this._markers.sun = this._mkMarker(svg, '#ffcc55', '☉', 9);

    // Nearest body marker
    this._markers.body = this._mkMarker(svg, '#7fd4ff', '●', 7);

    // Zenith marker
    this._markers.zenith = this._mkMarker(svg, '#a8e8a8', '↑', 9);

    // ── EnglishEnglish（EnglishEnglishEnglishEnglish）──
    const center = document.createElementNS(SVG_NS, 'circle');
    center.setAttribute('cx', '0'); center.setAttribute('cy', '0'); center.setAttribute('r', '1.5');
    center.setAttribute('fill', 'rgba(56,189,248,0.65)');
    svg.appendChild(center);

    // ── EnglishEnglishEnglishEnglish ──
    this._modeLabel = document.createElementNS(SVG_NS, 'text');
    this._modeLabel.setAttribute('x', '0');
    this._modeLabel.setAttribute('y', String(R + 16));
    this._modeLabel.setAttribute('text-anchor', 'middle');
    this._modeLabel.setAttribute('font-size', '8');
    this._modeLabel.setAttribute('fill', '#94a3b8');
    svg.appendChild(this._modeLabel);

    this.root.appendChild(svg);
    container.appendChild(this.root);
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish + EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish） */
  _mkMarker(svg, color, symbol, fontSize) {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('opacity', '0');

    const dot = document.createElementNS(SVG_NS, 'circle');
    dot.setAttribute('r', '3');
    dot.setAttribute('fill', color);
    g.appendChild(dot);

    const sym = document.createElementNS(SVG_NS, 'text');
    sym.setAttribute('text-anchor', 'middle');
    sym.setAttribute('dominant-baseline', 'central');
    sym.setAttribute('font-size', String(fontSize));
    sym.setAttribute('fill', color);
    sym.setAttribute('y', '-8');
    sym.textContent = symbol;
    g.appendChild(sym);

    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('dominant-baseline', 'central');
    label.setAttribute('font-size', '6');
    label.setAttribute('fill', color);
    label.setAttribute('y', '10');
    g.appendChild(label);

    svg.appendChild(g);
    return { el: g, dot, sym, label, opacity: 0 };
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
  _updateMarker(key, dir, quat, labelText) {
    const m = this._markers[key];
    if (!m || !dir) {
      m.el.setAttribute('opacity', '0');
      m.opacity = 0;
      return;
    }
    const p = projectToDisc(dir, quat);
    m.el.setAttribute('transform', `translate(${p.x.toFixed(2)},${p.y.toFixed(2)})`);
    m.el.setAttribute('opacity', String(p.opacity));
    if (labelText !== undefined) m.label.textContent = labelText;
    m.opacity = p.opacity;
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   * @param {object} state
   *   mode: 'orbit'|'fly'|'walk'
   *   cameraQuat: {x,y,z,w} — EnglishEnglishEnglishEnglishEnglishEnglishEnglish
   *   sunDir: {x,y,z}|null — EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）
   *   nearestBodyDir: {x,y,z}|null — EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
   *   nearestBodyName: string|null
   *   northDir: {x,y,z}|null — EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
   *   zenithDir: {x,y,z}|null — EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）
   */
  update(state) {
    if (!this.visible || !state) return;
    const q = state.cameraQuat;
    if (!q) return;

    // ── EnglishEnglish ──
    this._updateMarker('sun', state.sunDir, q, state.sunDir ? tt('compass.sun') : '');

    // ── EnglishEnglishEnglishEnglish ──
    this._updateMarker('body', state.nearestBodyDir, q,
      state.nearestBodyDir ? (state.nearestBodyName || tt('compass.nearest')) : '');

    // ── EnglishEnglish ──
    this._updateMarker('zenith', state.zenithDir, q, state.zenithDir ? tt('compass.zenith') : '');

    // ── EnglishEnglishEnglishEnglish N / S / E / W ──
    const north = state.northDir ? normalize3(state.northDir) : null;
    const zenith = state.zenithDir ? normalize3(state.zenithDir) : null;

    if (north) {
      this._updateMarker('north', north, q);
      this._updateMarker('south', { x: -north.x, y: -north.y, z: -north.z }, q);

      // East = cross(North, Zenith)（EnglishEnglishEnglish：N × Up = East）
      if (zenith) {
        const east = normalize3(cross3(north, zenith));
        if (east) {
          this._updateMarker('east', east, q);
          this._updateMarker('west', { x: -east.x, y: -east.y, z: -east.z }, q);
        } else {
          // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish）：EnglishEnglishEnglishEnglishEnglish/English
          this._hideMarker('east');
          this._hideMarker('west');
        }
      } else {
        this._hideMarker('east');
        this._hideMarker('west');
      }
    } else {
      this._hideMarker('north');
      this._hideMarker('south');
      this._hideMarker('east');
      this._hideMarker('west');
    }

    // ── EnglishEnglishEnglishEnglish ──
    if (state.mode) {
      this._modeLabel.textContent = state.mode.toUpperCase();
    }
  }

  _hideMarker(key) {
    const m = this._markers[key];
    if (m) {
      m.el.setAttribute('opacity', '0');
      m.opacity = 0;
    }
  }

  setVisible(on) {
    this.visible = on;
    this.root.style.display = on ? '' : 'none';
  }

  toggle() {
    this.setVisible(!this.visible);
    return this.visible;
  }

  dispose() {
    this.root.remove();
  }
}
