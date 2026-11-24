// EnglishEnglishEnglishEnglishEnglishEnglish（TNO）EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish）+ EnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglish。
// EnglishEnglishEnglish tno.js EnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglish（#6）。

import * as THREE from 'three';
import { TNO_IDS, TNO_DATA, tnoPosition, tnoOrbitPoints } from '../astro/tno.js';
import { createPlanetMaterial } from './planetMaterial.js';
import { createRings } from './rings.js';
import { proceduralMapLazy } from './proceduralTextures.js';
import { eclToWorldArr } from '../config.js';
import { J2000 } from '../astro/time.js';
import { QUALITY } from '../engine/quality.js';

const KM_PER_AU = 149597870.7;

/** EnglishEnglishEnglish → EnglishEnglish RGB（0–255）。EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。 */
const PALETTE_GLOW = {
  mars:   [255, 170, 110], // EnglishEnglish（Sedna、EnglishEnglishEnglishEnglish）
  pluto:  [235, 205, 185], // EnglishEnglish（EnglishEnglishEnglish）
  ice:    [170, 215, 255], // EnglishEnglish（EnglishEnglishEnglish、EnglishEnglishEnglish）
  triton: [185, 230, 255], // EnglishEnglish
  dark:   [190, 170, 140], // EnglishEnglishEnglish（EnglishEnglishEnglish、EnglishEnglishEnglish）
  gray:   [200, 205, 220], // EnglishEnglishEnglishEnglish（EnglishEnglish）
};

/** EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglish。 */
function makeGlowSprite(palette) {
  const [r, g, b] = PALETTE_GLOW[palette] ?? PALETTE_GLOW.gray;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish）
  const g1 = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g1.addColorStop(0, `rgba(${r},${g},${b},0.85)`);
  g1.addColorStop(0.22, `rgba(${r},${g},${b},0.45)`);
  g1.addColorStop(0.5, `rgba(${r},${g},${b},0.12)`);
  g1.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, 64, 64);
  // EnglishEnglishEnglish（EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  const g2 = ctx.createRadialGradient(32, 32, 0, 32, 32, 7);
  g2.addColorStop(0, 'rgba(255,255,255,0.95)');
  g2.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  return new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
}

/** EnglishEnglishEnglishEnglish：EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
const ORBIT_COLOR = 0x6680aa;

/**
 * EnglishEnglishEnglishEnglish TNO EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish entries EnglishEnglishEnglish update。
 */
export function createTNOScene(scene, world, orbitLinesGroup) {
  const entries = new Map();
  const segLo = QUALITY.segLo ?? [24, 12];

  for (const id of TNO_IDS) {
    const d = TNO_DATA[id];
    const group = new THREE.Group();

    // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish（TNO EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish）
    const seg = Math.max(16, segLo[0]);
    const geo = new THREE.SphereGeometry(d.radiusKm, seg, Math.round(seg / 2));
    const tex = proceduralMapLazy(id, d.palette ?? 'gray', 512, 256);
    const mat = createPlanetMaterial({ map: tex, detailMode: 0, radiusKm: d.radiusKm });
    const mesh = new THREE.Mesh(geo, mat);
    // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish radiusKm，
    // EnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
    if (d.axes) {
      const [a, b, c] = d.axes;
      const R = d.radiusKm;
      mesh.scale.set(a / R, c / R, b / R);   // EnglishEnglishEnglish +Y EnglishEnglishEnglish（EnglishEnglishEnglish）
    }
    group.add(mesh);
    // English：EnglishEnglishEnglish（Ortiz 2017）EnglishEnglishEnglishEnglish（Morgado 2023）EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglish"——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    let ringMesh = null;
    if (d.rings) {
      ringMesh = createRings({ rings: d.rings, radiusKm: d.radiusKm }, null);
      mesh.add(ringMesh);
    }

    // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    const glint = makeGlowSprite(d.palette ?? 'gray');
    group.add(glint);

    const posKm = new Float64Array(3);
    world.register(posKm, group);
    scene.add(group);

    // EnglishEnglishEnglish（EnglishEnglishEnglishEnglish >200 km EnglishEnglishEnglishEnglishEnglish）
    let orbitLine = null;
    if (d.radiusKm >= 100) {
      const pts = tnoOrbitPoints(id, 192);
      const arr = new Float32Array(pts.length);
      for (let i = 0; i < pts.length; i += 3) {
        const w = eclToWorldArr({ x: pts[i], y: pts[i + 1], z: pts[i + 2] });
        arr[i] = w[0]; arr[i + 1] = w[1]; arr[i + 2] = w[2];
      }
      const og = new THREE.BufferGeometry();
      og.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      orbitLine = new THREE.LineLoop(og, new THREE.LineBasicMaterial({
        color: ORBIT_COLOR, transparent: true, opacity: 0.18, fog: false,
      }));
      orbitLine.userData.isOrbit = true;
      orbitLine.userData.baseOpacity = 0.18;
      orbitLine.frustumCulled = false;
      orbitLine.visible = false; // EnglishEnglishEnglishEnglish（English main.js KeyK EnglishEnglish，#4）
      orbitLinesGroup.add(orbitLine);
    }

    entries.set(id, { id, phys: d, posKm, group, mesh, mat, glint, orbitLine, ringMesh });
  }

  const _sunDir = new THREE.Vector3();
  let skyFadeF = 1; // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish TNO ≥17 English，EnglishEnglishEnglishEnglishEnglishEnglish）

  // EnglishEnglish（km/English）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English builder EnglishEnglish）
  const C_KM_PER_DAY = 299792.458 * 86400;

  // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglish——
  // EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  const TNO_ROT_HOURS = {
    pluto: 153.29, eris: 15.77, haumea: 3.92, makemake: 22.83, quaoar: 17.68,
    orcus: 13.19, sedna: 10.27, varuna: 6.34, ixion: 12.4, salacia: 6.09,
    az84: 6.76, ms4: 7.33, varda: 5.91, gonggong: 22.4, huya: 17.1,
  };
  function update(jdTT, shipPosKm) {
    for (const [id, e] of entries) {
      // EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish t − d/c EnglishEnglishEnglishEnglishEnglish；shipPosKm EnglishEnglishEnglishEnglish km）
      let jdUse = jdTT;
      if (shipPosKm) {
        let ecl0 = tnoPosition(id, jdTT);
        for (let k = 0; k < 2; k++) {
          const w0 = eclToWorldArr(ecl0);
          const d = Math.hypot(w0[0] - shipPosKm[0], w0[1] - shipPosKm[1], w0[2] - shipPosKm[2]);
          jdUse = jdTT - d / C_KM_PER_DAY;
          ecl0 = tnoPosition(id, jdUse);
        }
      }
      const ecl = tnoPosition(id, jdUse);
      const w = eclToWorldArr(ecl);
      e.posKm[0] = w[0]; e.posKm[1] = w[1]; e.posKm[2] = w[2];

      // EnglishEnglishEnglishEnglish + EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，R7 #4）
      const dKm = Math.hypot(e.posKm[0], e.posKm[1], e.posKm[2]);
      const dAU = Math.max(dKm / KM_PER_AU, 1e-6);
      _sunDir.set(-e.posKm[0] / dKm, -e.posKm[1] / dKm, -e.posKm[2] / dKm);
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish，EnglishEnglish d>1 EnglishEnglish ^0.55 EnglishEnglish。
      // EnglishEnglish = 0.75·d² EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      const sunI = 1 / (dAU * dAU);
      const u = e.mat.userData.uniforms;
      u.uSunDir.value.copy(_sunDir);
      u.uSunI.value = sunI;
      // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）
      if (e.ringMesh) {
        const ru = e.ringMesh.material?.uniforms;
        if (ru?.uSunDir) { ru.uSunDir.value.copy(_sunDir); ru.uSunI.value = sunI; }
        if (ru?.uRingNormal) ru.uRingNormal.value.set(0, 1, 0).applyQuaternion(e.mesh.quaternion);
      }

      // EnglishEnglish：EnglishEnglishEnglishEnglish TNO **EnglishEnglishEnglishEnglish**（tnoScene EnglishEnglishEnglishEnglishEnglish rotation EnglishEnglish），
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglish 3.9 EnglishEnglish"、EnglishEnglishEnglish"6.3 EnglishEnglishEnglishEnglishEnglishEnglish
      // EnglishEnglishEnglishEnglish"——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      const rotH = TNO_ROT_HOURS[id];
      if (rotH > 0) {
        const ang = ((jdTT - J2000) * 24 / rotH) % 1 * Math.PI * 2;
        e.mesh.rotation.y = ang;
      }

      // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish ~EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      const dist = Math.hypot(
        e.posKm[0] - shipPosKm[0], e.posKm[1] - shipPosKm[1], e.posKm[2] - shipPosKm[2]
      );
      // EnglishEnglish：EnglishEnglishEnglishEnglishEnglish 0.6°（dist*0.006），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      e.glint.scale.setScalar(Math.max(dist * 0.006, e.phys.radiusKm * 6));
      // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish（< EnglishEnglish×60）EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。
      // EnglishEnglish**EnglishEnglishEnglishEnglishEnglish**EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（30 AU English 90 AU）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      // EnglishEnglish ∝ (1/d²)·EnglishEnglishEnglishEnglish；English 40 AU EnglishEnglishEnglishEnglishEnglish，EnglishEnglish 0.25 EnglishEnglishEnglishEnglishEnglishEnglish。
      const dAUg = Math.max(dKm / 149597870.7, 1e-3);
      const flux = Math.min(1, (40 / dAUg) * (40 / dAUg));
      // EnglishEnglishEnglish α（EnglishEnglish—EnglishEnglish—EnglishEnglishEnglish）：cos α = (toSun·toCam)/(|toSun||toCam|)。
      // EnglishEnglish e.posKm English**EnglishEnglish**EnglishEnglish（EnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglish shipPosKm。
      let cosPhase = 1;
      if (shipPosKm) {
        const tsx = -e.posKm[0], tsy = -e.posKm[1], tsz = -e.posKm[2];
        const tcx = shipPosKm[0] - e.posKm[0];
        const tcy = shipPosKm[1] - e.posKm[1];
        const tcz = shipPosKm[2] - e.posKm[2];
        const ls = Math.hypot(tsx, tsy, tsz), lc = Math.hypot(tcx, tcy, tcz);
        if (ls > 0 && lc > 0) {
          cosPhase = Math.max(-1, Math.min(1, (tsx * tcx + tsy * tcy + tsz * tcz) / (ls * lc)));
        }
      }
      const phase = 0.25 + 0.75 * Math.max(0, cosPhase);
      e.glint.material.opacity =
        THREE.MathUtils.clamp((dist / (e.phys.radiusKm * 60) - 0.3), 0, 1)
        * 0.85 * skyFadeF * (0.35 + 0.65 * flux) * phase;
      // EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      e.mesh.visible = dist < e.phys.radiusKm * 900;
    }
  }

  return {
    entries,
    update,
    /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish） */
    setSkyFade(f) { skyFadeF = f > 0.4 ? 1 : 0; },
  };
}
