// EnglishEnglishEnglishEnglish：DOM EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish 5° EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish；
// EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。

import * as THREE from 'three';
import { formatDist } from '../config.js';

const _v = new THREE.Vector3();
const _fwd = new THREE.Vector3();
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish Vector3 EnglishEnglishEnglish——
// Vector3 EnglishEnglish（199 English/English），EnglishEnglishEnglish GC EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
const _ndc = new THREE.Vector3();

export class Labels {
  constructor(container, camera) {
    this.container = container;
    this.camera = camera;
    this.items = new Map(); // id -> { el, target }
    this.onSelect = null;
    this.onFlyTo = null;
    this.aimedId = null;
    this.visible = true;
  }

  /** target: { id, nameZh, getRelPos():Vector3(EnglishEnglishEnglishEnglishkm), radiusKm, kind, distText? } */
  add(target) {
    const el = document.createElement('div');
    // label-faint：EnglishEnglishEnglishEnglish（daysky）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    // （TNO ≥17 English、EnglishEnglish、EnglishEnglishEnglish、EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    const faint = ['tno', 'comet', 'probe', 'boundary', 'region'].includes(target.kind);
    el.className = 'body-label' + (target.kind === 'moon' ? ' label-moon' : '') +
      (target.kind === 'poi' ? ' label-poi' : '') +
      (target.kind === 'fixstar' ? ' label-star' : '') +
      (faint ? ' label-faint' : '');
    el.innerHTML = `<span class="ln">${target.name ?? target.nameEn ?? target.nameZh}</span><span class="ld"></span>`;
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onSelect?.(target.id);
    });
    el.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      this.onFlyTo?.(target.id); // GE EnglishEnglish：EnglishEnglishEnglishEnglish
    });
    this.container.appendChild(el);
    this.items.set(target.id, { el, target });
  }

  setVisible(v) {
    this.visible = v;
    this.container.style.display = v ? '' : 'none';
  }

  /**
   * @param occluders EnglishEnglishEnglishEnglishEnglish [{id, pos:Vector3(EnglishEnglishEnglishEnglish), r:km}] —— EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
   * （EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 2.5R EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
   */
  /** EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish） */
  _hide(item, el) {
    if (item._shown !== false) { el.style.display = 'none'; item._shown = false; }
  }

  update(selectedId, occluders = []) {
    if (!this.visible) return;
    const occList = Array.isArray(occluders) ? occluders : (occluders ? [occluders] : []);
    const w = window.innerWidth, h = window.innerHeight;
    let bestAim = null, bestAng = 0.09; // ~5°
    const frame = []; // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）
    // EnglishEnglishEnglishEnglish（EnglishEnglish）：EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish ndc.z>1
    this.camera.getWorldDirection(_fwd);
    for (const item of this.items.values()) {
      const { el, target } = item;
      const rel = target.getRelPos(_v);
      const dist = rel.length();

      // EnglishEnglishEnglishEnglishEnglish？EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish，EnglishEnglish far=1e15 English ndc.z≈1 EnglishEnglishEnglishEnglishEnglishEnglish）
      // —— EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（#3）：English ndc.z>1 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      const vz = rel.x * _fwd.x + rel.y * _fwd.y + rel.z * _fwd.z;
      if (vz <= 0) { this._hide(item, el); item._hideStreak = 0; continue; }

      // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish → EnglishEnglish
      let wantHide = false;
      if (occList.length && dist > 1) {
        for (const oc of occList) {
          if (oc.id === target.id) continue; // EnglishEnglishEnglishEnglishEnglishEnglishEnglish
          const tc = (rel.x * oc.pos.x + rel.y * oc.pos.y + rel.z * oc.pos.z) / dist;
          if (tc > 0 && tc < dist - oc.r * 0.5) {
            const d2 = oc.pos.lengthSq() - tc * tc;
            if (d2 < oc.r * oc.r * 0.96) { wantHide = true; break; }
          }
        }
      }
      const ndc = _ndc.copy(rel).project(this.camera);
      if (ndc.x < -1.08 || ndc.x > 1.08 || ndc.y < -1.08 || ndc.y > 1.08) wantHide = true;
      // EnglishEnglish（EnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglish
      if (dist < target.radiusKm * 1.6) wantHide = true;

      // EnglishEnglish：EnglishEnglish 2 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      if (wantHide) {
        item._hideStreak = (item._hideStreak || 0) + 1;
        if (item._hideStreak >= 2) { this._hide(item, el); continue; }
      } else {
        item._hideStreak = 0;
      }

      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：`display=''` EnglishEnglishEnglish 199 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      // EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
      if (item._shown !== true) { el.style.display = ''; item._shown = true; }
      const x = ((ndc.x + 1) / 2) * w;
      const y = ((1 - ndc.y) / 2) * h;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      // EnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglish**English**EnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglish。
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"3.2 AU"。
      const detail = target.id === selectedId || target.id === this.aimedId;
      // EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish querySelector EnglishEnglish 199 EnglishEnglishEnglishEnglishEnglishEnglishEnglish
      // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
      const ld = item._ld ?? (item._ld = el.querySelector('.ld'));
      if (ld) ld.textContent = detail ? (target.distText ?? formatDist(dist)) : '';
      el.classList.toggle('selected', target.id === selectedId);
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish：EnglishEnglish > EnglishEnglishEnglishEnglish > English）
      const name = target.name ?? target.nameZh ?? '';
      frame.push({
        id: target.id, el, x, y,
        bw: Math.min(40 + name.length * 8, 150), bh: 30,
        score: (target.id === selectedId ? 1e9 : 0) + (target.radiusKm / Math.max(dist, 1e-6)),
      });
      if (target.kind !== 'fixstar') {
        const angOff = Math.hypot(ndc.x * (w / h), ndc.y) * 0.5 * (this.camera.fov * Math.PI / 180);
        if (angOff < bestAng) { bestAng = angOff; bestAim = target.id; }
      }
    }

    // EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    // （EnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish）
    frame.sort((a, b) => b.score - a.score);
    const accepted = [];
    for (const it of frame) {
      const overlap = accepted.some((a) =>
        Math.abs(a.x - it.x) < (a.bw + it.bw) / 2 && Math.abs(a.y - it.y) < (a.bh + it.bh) / 2);
      if (overlap) this._hide(it, it.el);
      else accepted.push(it);
    }
    // EnglishEnglishEnglishEnglish
    if (this.aimedId && this.aimedId !== bestAim) {
      this.items.get(this.aimedId)?.el.classList.remove('aimed');
    }
    if (bestAim) this.items.get(bestAim)?.el.classList.add('aimed');
    this.aimedId = bestAim;
  }
}
