// EnglishEnglishEnglishEnglish：SBDB EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（cometOrbits.generated.js，English tools/fetch-small-bodies.mjs
// English JPL SBDB EnglishEnglish）EnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglish。

import * as THREE from 'three';
import { solveKepler, KM_PER_AU, DEG } from '../astro/kepler.js';
import { eclToWorld } from '../config.js';
import { COMET_ORBITS } from '../astro/cometOrbits.generated.js';
import { sampledPosition } from '../astro/sampledEphemeris.js';

const GM_SUN = 1.32712440018e11; // km³/s²

// q:EnglishEnglishEnglishAU e i Ω ω Tp(JD) P(English)
export const COMETS = [
  { id: 'halley', nameEn: '1P/Halley',
    q: 0.586, e: 0.967, i: 162.26, node: 58.42, peri: 111.33, tp: 2446470.95, pYears: 75.32,
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，English 75–76 EnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglish 1986 English，EnglishEnglish 2061 English。' },
  { id: 'halebopp', nameEn: 'C/1995 O1',
    q: 0.914, e: 0.99511, i: 89.43, node: 282.47, peri: 130.59, tp: 2450544.4, pYears: 2533,
    desc: '1997 EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish 18 EnglishEnglish，EnglishEnglishEnglishEnglishEnglish 2500 English。' },
  { id: 'cg67p', nameEn: '67P/C-G',
    q: 1.243, e: 0.641, i: 7.04, node: 50.14, peri: 12.78, tp: 2459520.5, pYears: 6.44,
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglish 2014–2016 EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish"EnglishEnglish。' },
  { id: 'encke', nameEn: '2P/Encke',
    q: 0.336, e: 0.848, i: 11.78, node: 334.57, peri: 186.55, tp: 2460239.5, pYears: 3.30,
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（3.3 English），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
];

/** EnglishEnglishEnglishEnglishEnglishEnglish（km，EnglishEnglish J2000）：EnglishEnglish SBDB EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish */
export function cometPosition(c, jdTT) {
  const sampled = sampledPosition(c.id, jdTT);
  if (sampled) return sampled;
  const o = COMET_ORBITS[c.id];
  if (o) {
    const aKm = o.aAU * KM_PER_AU;
    const n = Math.sqrt(GM_SUN / (aKm * aKm * aKm)) * 86400 / DEG; // °/English
    const M = o.M0Deg + n * (jdTT - o.epochJd);
    const E = solveKepler(M * DEG, o.e);
    const xp = aKm * (Math.cos(E) - o.e);
    const yp = aKm * Math.sqrt(1 - o.e * o.e) * Math.sin(E);
    const w = o.periArgDeg * DEG, O = o.nodeDeg * DEG, inc = o.iDeg * DEG;
    const cw = Math.cos(w), sw = Math.sin(w), cO = Math.cos(O), sO = Math.sin(O);
    const ci = Math.cos(inc), si = Math.sin(inc);
    return {
      x: (cw * cO - sw * sO * ci) * xp + (-sw * cO - cw * sO * ci) * yp,
      y: (cw * sO + sw * cO * ci) * xp + (-sw * sO + cw * cO * ci) * yp,
      z: (sw * si) * xp + (cw * si) * yp,
    };
  }
  const a = c.q / (1 - c.e);
  const n = 360 / (c.pYears * 365.25); // °/English
  const M = n * (jdTT - c.tp);
  const E = solveKepler((M % 360) * DEG, c.e);
  const xp = a * (Math.cos(E) - c.e) * KM_PER_AU;
  const yp = a * Math.sqrt(1 - c.e * c.e) * Math.sin(E) * KM_PER_AU;
  const w = c.peri * DEG, O = c.node * DEG, inc = c.i * DEG;
  const cw = Math.cos(w), sw = Math.sin(w), cO = Math.cos(O), sO = Math.sin(O);
  const ci = Math.cos(inc), si = Math.sin(inc);
  return {
    x: (cw * cO - sw * sO * ci) * xp + (-sw * cO - cw * sO * ci) * yp,
    y: (cw * sO + sw * cO * ci) * xp + (-sw * sO + cw * cO * ci) * yp,
    z: (sw * si) * xp + (cw * si) * yp,
  };
}

function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(220,240,255,1)');
  g.addColorStop(0.3, 'rgba(180,220,255,0.4)');
  g.addColorStop(1, 'rgba(150,200,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/** EnglishEnglishEnglishEnglishEnglishEnglish（syndyne EnglishEnglishEnglishEnglish） */
const DUST_N = 220;

/** Bounded visual approximation: activity is not an observed gas-production
 * model. Keep a diffuse coma below ~150,000 km diameter rather than millions. */
export function cometAppearance(rAU) {
  const activity = Math.max(0, Math.min(1, (4 - rAU) / 3.5));
  return { activity, comaDiameterKm: 4000 + activity * 140000,
    comaOpacity: activity * 0.25 / (1 + rAU * 0.5),
    ionOpacity: activity * 0.06 / (1 + rAU * rAU) };
}

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglish { entries: [{c, group, head, ionTail, dustTail, posKm}], update(jdTT) } */
export function createComets(world) {
  const glow = makeGlowTexture();
  const entries = COMETS.map((c) => {
    const group = new THREE.Group();
    // EnglishEnglish：EnglishEnglishEnglish（CN/C₂ 388nm EnglishEnglish）EnglishEnglishEnglishEnglish
    const head = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glow, color: 0xcfe8d8, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    group.add(head);

    // I EnglishEnglishEnglishEnglish：English、English、English（CO⁺ ~420nm），EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish）EnglishEnglish
    const ionGeo = new THREE.CylinderGeometry(0.2, 0.02, 1, 12, 1, true);
    ionGeo.translate(0, 0.5, 0);
    const ionTail = new THREE.Mesh(ionGeo, new THREE.MeshBasicMaterial({
      color: 0x7fb4ff, transparent: true, opacity: 0.22,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false,
    }));
    group.add(ionTail);

    // II EnglishEnglishEnglishEnglish：English、EnglishEnglish、English syndyne EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    // （EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(DUST_N * 3);
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustTail = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      color: 0xf0e6c8, size: 2.6, sizeAttenuation: false, transparent: true, opacity: 0.35,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
    }));
    dustTail.frustumCulled = false;
    group.add(dustTail);

    const posKm = new Float64Array(3);
    world.register(posKm, group);
    return { c, group, head, ionTail, dustTail, dustPos, dustGeo, posKm };
  });

  const _dir = new THREE.Vector3();
  const _lag = new THREE.Vector3();
  const _up = new THREE.Vector3(0, 1, 0);
  const _q = new THREE.Quaternion();
  const C_KM_PER_DAY = 299792.458 * 86400;

  return {
    entries,
    /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish） */
    setSkyFade(f) {
      const vis = f > 0.4;
      for (const e of entries) e.group.visible = vis;
    },
    update(jdTT, shipPosKm) {
      for (const e of entries) {
        // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish t − d/c EnglishEnglish）
        let jdUse = jdTT;
        if (shipPosKm) {
          let p0 = cometPosition(e.c, jdTT);
          for (let k = 0; k < 2; k++) {
            const w0 = eclToWorld(p0);
            const d = Math.hypot(w0.x - shipPosKm[0], w0.y - shipPosKm[1], w0.z - shipPosKm[2]);
            jdUse = jdTT - d / C_KM_PER_DAY;
            p0 = cometPosition(e.c, jdUse);
          }
        }
        const p = cometPosition(e.c, jdUse);
        const w = eclToWorld(p);
        e.posKm[0] = w.x; e.posKm[1] = w.y; e.posKm[2] = w.z;
        const rAU = Math.hypot(p.x, p.y, p.z) / KM_PER_AU;
        // EnglishEnglishEnglish：4 AU EnglishEnglishEnglish（EnglishEnglishEnglishEnglish），EnglishEnglish ∝ 1/r²（EnglishEnglish）× EnglishEnglishEnglish
        const appearance = cometAppearance(rAU), act = appearance.activity;
        e.head.scale.setScalar(appearance.comaDiameterKm);
        e.head.material.opacity = appearance.comaOpacity;
        e.head.visible = appearance.comaOpacity > 0.001;

        // ── EnglishEnglishEnglish：EnglishEnglishEnglishEnglish ──
        const ionLen = act * act * 0.5 * KM_PER_AU;
        e.ionTail.visible = act > 0.02;
        if (e.ionTail.visible) {
          e.ionTail.scale.set(ionLen * 0.015, ionLen, ionLen * 0.015);
          _dir.set(w.x, w.y, w.z).normalize();
          _q.setFromUnitVectors(_up, _dir);
          e.ionTail.quaternion.copy(_q);
          e.ionTail.material.opacity = appearance.ionOpacity;
        }

        // ── EnglishEnglishEnglish：syndyne EnglishEnglish（EnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglish）──
        e.dustTail.visible = act > 0.03;
        if (e.dustTail.visible) {
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish，EnglishEnglishEnglish）——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
          const pAhead = eclToWorld(cometPosition(e.c, jdTT + 0.5));
          _lag.set(pAhead.x - w.x, pAhead.y - w.y, pAhead.z - w.z).normalize().negate();
          _dir.set(w.x, w.y, w.z).normalize(); // EnglishEnglish
          const dustLen = act * 0.28 * KM_PER_AU;
          const curveK = 0.9; // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishβEnglishEnglishEnglishEnglishEnglish）
          for (let i = 0; i < DUST_N; i++) {
            const s = i / (DUST_N - 1);
            // syndyne：EnglishEnglish = English + s·L·(EnglishEnglish + s·curveK·EnglishEnglishEnglishEnglish)，EnglishEnglishEnglishEnglish
            const px = _dir.x + s * curveK * _lag.x;
            const py = _dir.y + s * curveK * _lag.y;
            const pz = _dir.z + s * curveK * _lag.z;
            e.dustPos[i * 3] = px * dustLen * s;
            e.dustPos[i * 3 + 1] = py * dustLen * s;
            e.dustPos[i * 3 + 2] = pz * dustLen * s;
          }
          e.dustGeo.attributes.position.needsUpdate = true;
          e.dustTail.material.opacity = (0.10 + act * 0.30) / (1 + rAU * 0.6);
        }
      }
    },
  };
}
