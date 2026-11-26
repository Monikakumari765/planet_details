// EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish（manifest EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglish/EnglishEnglish/EnglishEnglish
// EnglishEnglish、EnglishEnglish、EnglishEnglish、EnglishEnglishEnglish、EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。

import * as THREE from 'three';
import { DEM_SOURCES } from './demTiles.js';
import { terrainReliefOffset } from './terrain.js';
import { isSunOcculted } from './photoExposure.js';

export function readMapDataCache(cache, id, image) {
  const entry = cache.get(id);
  return entry && entry.image === image ? entry.data : undefined;
}

export function textureBitmapOptions(meta = {}, size) {
  const scale = Math.min(1, size / Math.max(meta.width ?? size, meta.height ?? size));
  const resize = meta.width && meta.height ? {
    resizeWidth: Math.max(1, Math.round(meta.width * scale)),
    resizeHeight: Math.max(1, Math.round(meta.height * scale)), resizeQuality: 'high',
  } : {};
  return { ...resize, imageOrientation: 'flipY', premultiplyAlpha: 'none' };
}

export function drawTextureForSampling(ctx, image, width, height) {
  if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) {
    ctx.translate(0, height); ctx.scale(1, -1);
  }
  ctx.drawImage(image, 0, 0, width, height);
}
import { BODIES, MOON_PHYS } from '../astro/bodies.js';
import { solarActivityAt } from '../astro/solarCycle.js';
import { planetPosition, PLANETS, orbitPoints } from '../astro/planets.js';
import { moonGeocentric } from '../astro/moon.js';
import { jdUTtoTT } from '../astro/time.js';
import { moonLocalPosition, moonOrbitNormal, moonOrbitPoints, MOON_IDS } from '../astro/moons.js';
import { bodyToEclipticMatrix, tidalLockMatrix } from '../astro/rotation.js';
import { eclToWorldArr, eclToWorld, eclMatrixToWorldQuat, KM_PER_AU, asset } from '../config.js';
import { createPlanetMaterial, createCloudMaterial } from './planetMaterial.js';
import { QUALITY } from '../engine/quality.js';
import { createAtmosphere } from './atmosphere.js';
import { createRings } from './rings.js';
import { createSun } from './sun.js';
import { proceduralMapLazy, proceduralBandsLazy } from './proceduralTextures.js';
import { HeightField } from './terrain.js';
import { loadShapeModels } from './shapeModels.js';
import { idbGet, idbPut } from '../engine/texCache.js';
import { resourceQueue, whenIdle } from '../engine/resourceQueue.js';

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish（EnglishEnglishEnglish/EnglishEnglish）EnglishEnglish，EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish */
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。earth_clouds.jpg（11MB）**EnglishEnglishEnglishEnglish**：EnglishEnglishEnglishEnglishEnglish
// **EnglishEnglish**EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish GIBS EnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglishEnglish 3，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 11MB EnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
const TEX_PRIORITY = [
  'earth_day.jpg', 'earth_night.jpg', 'moon.jpg', 'sun.jpg',
  'mars.jpg', 'jupiter.jpg', 'saturn.jpg', 'saturn_ring.png', 'milkyway.jpg',
  'venus_surface.jpg', 'venus_atmosphere.jpg', 'mercury.jpg',
  'io.jpg', 'europa.png', 'ganymede.jpg', 'callisto.jpg', 'titan.jpg',
  'uranus.jpg', 'neptune.jpg', 'triton.jpg', 'pluto.jpg', 'charon.jpg',
  'earth_clouds.jpg',
];

function priorityOf(file) {
  const i = TEX_PRIORITY.indexOf(file);
  return i === -1 ? TEX_PRIORITY.length : i;
}

/** Decode to the hardware budget, preserving the source aspect ratio. */
async function loadFullImage(file, meta, size, priority, attempt = 0) {
  const medium = size <= 2048 && meta?.m;
  const version = (medium ? meta.mh : meta?.h) ?? meta?.h;
  const key = (version ? `${file}@${version}` : file) + (medium ? ':medium' : '');
  try {
    let blob = attempt === 0 ? await idbGet(key) : null;
    if (!blob) {
      blob = await resourceQueue.run('texture:' + key, async () => {
        const ctl = new AbortController();
        const timer = setTimeout(() => ctl.abort(), 25000);
        try {
          const res = await fetch(asset('textures/' + (medium ? 'medium/' + meta.m : file))+(version?'?v='+version:''), { signal: ctl.signal });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return await res.blob();
        } finally { clearTimeout(timer); }
      }, priority);
      idbPut(key, blob);
    }
    await whenIdle();
    const options = textureBitmapOptions(meta, size);
    // WebGL ignores Texture.flipY for ImageBitmap. Bake the orientation into
    // the decode so L1 HTMLImageElement -> L2/L3 bitmap preserves north/south.
    return await createImageBitmap(blob, options);
  } catch {
    if (attempt < 2) {
      await new Promise(r => setTimeout(r, 800 * 2 ** attempt));
      return loadFullImage(file, meta, size, priority, attempt + 1);
    }
    return null;
  }
}

/** L1 preview -> L2 1024px surroundings -> L3 focused maps.
 * Keep small decoded maps for eviction. Large maps have a byte budget; visiting
 * every planet must not keep every 8K texture resident on a shared-memory GPU. */
function progressiveTextures(files, cache, manifest, onProgress) {
  const records = new Map(files.map(file => [file, {
    file, base: null, size: 512, desired: 1024, busy: false, queued: false,
  }]));
  const queue = [...records.values()];
  for (const r of queue) r.queued = true;
  let active = 0, completed = 0, firstResolve, uploadTail = Promise.resolve();
  const upgrades = new Promise(resolve => { firstResolve = resolve; });
  if (!files.length) firstResolve();
  const publish = (r, image, size) => {
    const old = cache.get(r.file).image;
    cache.get(r.file).image = image;
    cache.get(r.file).userData.realLoaded = true;
    cache.get(r.file).needsUpdate = true;
    r.size = size;
    if (old !== r.base && old !== image) old.close?.();
  };
  const enqueue = (r, front = false) => {
    if (r.busy || r.queued || r.size === r.desired) return;
    r.queued = true;
    front ? queue.unshift(r) : queue.push(r);
  };
  async function job(r) {
    const size = r.base ? r.desired : 1024;
    const bmp = await loadFullImage(r.file, manifest[r.file], size, size > 1024 ? 40 : 0);
    if (bmp) {
      // Serialize replacements across animation frames; concurrent downloads
      // otherwise trigger several texture uploads in the same render.
      uploadTail = uploadTail.then(async () => {
        await new Promise(resolve => requestAnimationFrame(resolve));
        await whenIdle();
        if (size === 1024) r.base = bmp;
        if (size === 1024 || r.desired === size) publish(r, bmp, size);
        else bmp.close?.();
      });
      await uploadTail;
    }
    if (!r.initialDone) {
      r.initialDone = true;
      onProgress?.(++completed, files.length, r.file);
      if (completed === files.length) firstResolve();
    }
    if (!bmp) r.failedUntil = Date.now() + 30000;
  }
  function pump() {
    while (active < QUALITY.textureConcurrency && queue.length) {
      const r = queue.shift(); r.queued = false; r.busy = true; active++;
      job(r).catch(e => console.warn('[textures]', r.file, e.message)).finally(() => {
        r.busy = false; active--;
        if (!(r.failedUntil > Date.now())) enqueue(r, r.desired > 1024);
        pump();
      });
    }
  }
  function boost(files) {
    const desired = new Map();
    let budget = QUALITY.tier === 'high' ? 384 * 1024 * 1024 : 128 * 1024 * 1024;
    for (const file of files) {
      const r = records.get(file), meta = manifest[file];
      if (!r || !meta) continue;
      let size = Math.min(QUALITY.textureSize, /clouds|night|milkyway/.test(file) ? 2048 : QUALITY.textureSize);
      const scale = Math.min(1, size / Math.max(meta.width ?? size, meta.height ?? size));
      const bytes = (meta.width ?? size) * (meta.height ?? size / 2) * scale * scale * 4 * 4 / 3;
      if (bytes > budget) continue;
      budget -= bytes; desired.set(file, size);
    }
    for (const r of records.values()) {
      r.desired = desired.get(r.file) ?? 1024;
      if (r.base && r.desired === 1024 && r.size > 1024) publish(r, r.base, 1024);
      if (!(r.failedUntil > Date.now())) enqueue(r, r.desired > 1024);
    }
    queue.sort((a, b) => (desired.has(b.file) ? 1 : 0) - (desired.has(a.file) ? 1 : 0) ||
      files.indexOf(a.file) - files.indexOf(b.file));
    pump();
  }
  pump();
  return { upgrades, boost };
}

async function loadTextures(onProgress, onBgProgress) {
  const getManifest = async path => {
    try {
      const response = await fetch(asset(path), { cache: 'no-store', signal: AbortSignal.timeout(8000) });
      return response.ok ? await response.json() : {};
    } catch { return {}; }
  };
  const [manifest, pManifest] = await Promise.all([
    getManifest('textures/manifest.json'), getManifest('textures/preview/manifest.json'),
  ]);
  const loader = new THREE.TextureLoader();
  const cache = new Map();
  const wanted = new Set();
  const collect = (t) => { if (t) Object.values(t).forEach((v) => typeof v === 'string' && wanted.add(v)); };
  Object.values(BODIES).forEach((b) => { collect(b.textures); if (b.rings?.texture) wanted.add(b.rings.texture); });
  Object.values(MOON_PHYS).forEach((m) => collect(m.textures));
  wanted.add('milkyway.jpg');

  // L1（EnglishEnglish，EnglishEnglish 0.5MB）：EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  let done = 0;
  const previewed = new Set();
  const tasks = [...wanted].map((file) => new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => finish(), 8000);
    const finish = () => {
      if (settled) return;
      settled = true; clearTimeout(timer);
      onProgress?.(++done, wanted.size, file); resolve();
    };
    if (!manifest[file]) { finish(); return; }
    const p = pManifest[file];
    loader.load(
      (p ? asset('textures/preview/' + p.p) : asset('textures/' + file)) + (p?.ph || p?.h ? '?v='+(p.ph??p.h) : ''),
      (tex) => {
        if (settled) { tex.dispose(); return; }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = QUALITY.anisotropy;
        cache.set(file, tex);
        if (p) previewed.add(file);
        finish();
      },
      undefined,
      () => { finish(); } // EnglishEnglish→EnglishEnglish
    );
  }));
  await Promise.all(tasks);

  // Failed previews retain a texture object so a later network recovery can
  // replace its image, including materials already bound to this placeholder.
  for (const file of wanted) {
    if (cache.has(file) || !pManifest[file]) continue;
    const owner = [...Object.entries(BODIES), ...Object.entries(MOON_PHYS)].find(([, p]) =>
      p.textures?.map === file || (p.textures?.cloudsOpaque && p.textures.clouds === file));
    let texture;
    if (owner) texture = texOf(cache, null, owner[0], owner[1]);
    else {
      const canvas=document.createElement('canvas');canvas.width=canvas.height=2;
      texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    }
    texture.anisotropy=QUALITY.anisotropy;cache.set(file,texture);previewed.add(file);
  }

  const files = [...previewed].sort((a, b) => priorityOf(a) - priorityOf(b));
  const { upgrades, boost } = progressiveTextures(files, cache, pManifest, onBgProgress);
  return { cache, upgrades, boost };
}

/** EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish HeightField EnglishEnglishEnglishEnglishEnglish
 * （EnglishEnglish=EnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish，R9-2c EnglishEnglishEnglish/EnglishEnglish） */
/** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish = baseSphereRadius(dir)。
 *
 *  EnglishEnglishEnglishEnglishEnglish：English DEM EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglish**EnglishEnglishEnglishEnglish**（EnglishEnglishEnglishEnglish）
 *  EnglishEnglishEnglishEnglish**EnglishEnglishEnglish**。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
 *  EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 *  EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（terrain._lowRelief），EnglishEnglishEnglishEnglishEnglishEnglish，
 *  EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglish _lowRelief EnglishEnglish，EnglishEnglishEnglishEnglish。 */
function deformLowRelief(mesh, id, phys) {
  const hf = new HeightField(id, phys);
  const pos = mesh.geometry.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const h = hf.reliefRadius(v);
    pos.setXYZ(i, v.x * h, v.y * h, v.z * h);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

/** EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（192×108），
 *  _lowRelief EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ≥6 EnglishEnglishEnglishEnglish。 */
function reliefSphereGeo(radiusKm) {
  const [w, h] = QUALITY.segHi;
  const [wl, hl] = QUALITY.segLo;
  const fine = QUALITY.detail !== 0 && QUALITY.segHi[0] >= 64;
  return new THREE.SphereGeometry(radiusKm, fine ? w * 2 : wl, fine ? h * 2 : hl);
}

function deformIrregular(mesh, id, phys) {
  const hf = new HeightField(id, phys);
  const pos = mesh.geometry.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const h = hf.height(v);
    pos.setXYZ(i, v.x * h, v.y * h, v.z * h);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

const ORBIT_COLORS = {
  mercury: 0x8a8a8a, venus: 0xc9a06a, earth: 0x4a90d9, mars: 0xd96a4a,
  jupiter: 0xc9a06a, saturn: 0xd9c97a, uranus: 0x7ad9d9, neptune: 0x4a6ad9, pluto: 0x9a8aa9,
};

// Issue #29：EnglishEnglishEnglishEnglishEnglishEnglish（0=English 1=EnglishEnglish 2=EnglishEnglish 3=EnglishEnglish 4=EnglishEnglishEnglish）
// EnglishEnglish：EnglishEnglishEnglishEnglishEnglish OI 557.7nm EnglishEnglish；EnglishEnglish H3+ EnglishEnglish；EnglishEnglish H3+ EnglishEnglish；EnglishEnglishEnglish：EnglishEnglishEnglishEnglish。
// EnglishEnglish/EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（atmosphere.js），EnglishEnglishEnglish ACES EnglishEnglish。
const AURORA_MODE = { earth: 1, jupiter: 2, saturn: 3, triton: 4 };

// Issue #27：EnglishEnglishEnglishEnglishEnglishEnglish Ls —— EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
// EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish JD 2461125.8 English Ls=251°（LMD EnglishEnglishEnglishEnglishEnglishEnglishEnglish），
// Ls = EnglishEnglishEnglishEnglishEnglishEnglish − EnglishEnglishEnglishEnglishEnglish + 251。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
// （English/English/English/English = 199/184/147/158 English）English LMD EnglishEnglishEnglish 194/178/143/156 sol EnglishEnglish。
// English：EnglishEnglishEnglishEnglishEnglishEnglish（2024-05-08）EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish Ls=0 English 2024-11-12。
const MARS_PERIHELION_JD = 2461125.8;
const MARS_LON_PERIHELION = (() => {
  const p = planetPosition('mars', MARS_PERIHELION_JD);
  return Math.atan2(p.y, p.x) * 180 / Math.PI;
})();

/** EnglishEnglishEnglishEnglishEnglishEnglish（English，0–360），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
function marsLs(jdTT) {
  const p = planetPosition('mars', jdTT);
  const lon = Math.atan2(p.y, p.x) * 180 / Math.PI;
  return ((lon - MARS_LON_PERIHELION + 251) % 360 + 360) % 360;
}

const GAS_BAND_COLORS = {
  jupiter: [[200, 170, 130], [240, 225, 200], [170, 130, 95], [225, 200, 170], [150, 110, 80]],
  saturn: [[225, 205, 165], [240, 230, 200], [205, 180, 140], [230, 215, 185]],
  uranus: [[155, 205, 215], [175, 220, 228], [145, 195, 208]],
  neptune: [[60, 90, 200], [80, 120, 220], [50, 80, 180], [90, 140, 230]],
};

/** EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
const GLINT_ALBEDO = {
  mercury: 0.14, venus: 0.75, earth: 0.31, mars: 0.25, jupiter: 0.50,
  saturn: 0.47, uranus: 0.51, neptune: 0.41, pluto: 0.60,
  moon: 0.12, io: 0.63, europa: 0.67, ganymede: 0.43, callisto: 0.17,
  titan: 0.22, triton: 0.76, charon: 0.35,
};

/** EnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish） */
export function texturesOfBody(id) {
  const out = [];
  const b = BODIES[id];
  if (b?.textures) for (const v of Object.values(b.textures)) if (typeof v === 'string') out.push(v);
  if (b?.rings?.texture) out.push(b.rings.texture);
  const m = MOON_PHYS[id];
  if (m?.textures) for (const v of Object.values(m.textures)) if (typeof v === 'string') out.push(v);
  return out;
}

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish） */
function texOf(cache, file, bodyId, phys) {
  if (file && cache.has(file)) return cache.get(file);
  if (phys?.type === 'gas' || phys?.type === 'ice') {
    return proceduralBandsLazy(bodyId, GAS_BAND_COLORS[bodyId] ?? GAS_BAND_COLORS.jupiter);
  }
  return proceduralMapLazy(bodyId, phys?.surface?.palette ?? 'gray');
}

function sphereGeo(radiusKm, big) {
  const [wHi, hHi] = QUALITY.segHi;
  const [wLo, hLo] = QUALITY.segLo;
  return new THREE.SphereGeometry(radiusKm, big ? wHi : wLo, big ? hHi : hLo);
}

const HALO_DEFAULT_PRESSURE_ATM = {
  mercury: 0.001, venus: 92, earth: 1, mars: 0.0064,
  jupiter: 1, saturn: 1, uranus: 1, neptune: 1,
};
const HALO_MIN_PRESSURE_ATM = 0.001;
const HALO_MAX_PRESSURE_ATM = 100;
const HALO_DEFAULT_COLOR = new THREE.Color('#c9f4ff');
const HALO_OXYGEN_COLOR = new THREE.Color('#38bdf8');
const HALO_CARBON_DIOXIDE_COLOR = new THREE.Color('#f97316');
const HALO_BALANCED_COLOR = new THREE.Color('#e9fcff');

function haloPressureValues(pressureAtm) {
  const pressure = THREE.MathUtils.clamp(pressureAtm, HALO_MIN_PRESSURE_ATM, HALO_MAX_PRESSURE_ATM);
  const normalized = (Math.log10(pressure) + 3) / 5;
  return {
    opacity: 0.05 + normalized * 0.7,
    shellScale: 1.03 + normalized * 0.15,
  };
}

function nativeHaloColor(phys) {
  const rayleigh = phys.atmosphere?.rayleigh;
  if (!rayleigh) return HALO_DEFAULT_COLOR.clone();
  const channels = Array.isArray(rayleigh) ? rayleigh : [rayleigh, rayleigh, rayleigh];
  const maximum = Math.max(...channels, 1e-12);
  return new THREE.Color().setRGB(
    channels[0] / maximum,
    channels[1] / maximum,
    channels[2] / maximum,
  );
}

function terraformHaloColor(o2Pct, co2Pct) {
  const oxygenWeight = THREE.MathUtils.clamp(o2Pct / 35, 0, 1);
  const carbonDioxideWeight = THREE.MathUtils.clamp(co2Pct / 100, 0, 1);
  const color = HALO_DEFAULT_COLOR.clone().lerp(HALO_OXYGEN_COLOR, oxygenWeight);
  color.lerp(HALO_CARBON_DIOXIDE_COLOR, carbonDioxideWeight);
  const balancedWeight = Math.min(oxygenWeight, carbonDioxideWeight) * 0.8;
  return color.lerp(HALO_BALANCED_COLOR, balancedWeight);
}

function createTerraformHaloMaterial(color, opacity) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: color.clone() },
      uOpacity: { value: opacity },
      uFresnelPower: { value: 2.4 },
    },
    vertexShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vNormalView;
      varying vec3 vViewDirection;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vNormalView = normalize(normalMatrix * normal);
        vViewDirection = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uFresnelPower;
      varying vec3 vNormalView;
      varying vec3 vViewDirection;
      void main() {
        #include <logdepthbuf_fragment>
        float fresnel = pow(
          1.0 - max(dot(normalize(vNormalView), normalize(vViewDirection)), 0.0),
          uFresnelPower
        );
        float alpha = fresnel * uOpacity;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    side: THREE.FrontSide,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    fog: false,
  });
}

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish/EnglishEnglish=2（EnglishEnglish+EnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglish=1，EnglishEnglish=0 */
function detailModeOf(phys) {
  if (!QUALITY.detail) return 0;
  if (phys.type === 'gas' || phys.type === 'ice') return 2;
  return phys.landable ? 1 : 0;
}

export async function buildSolarSystem(scene, world, onProgress, onBgProgress) {
  // EnglishEnglishEnglishEnglishEnglish main.js English URL EnglishEnglish（?noatmo=1 EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  const skipAtmo = !!globalThis.__noAtmo;
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（PDS Thomas EnglishEnglishEnglishEnglish）：EnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglish**EnglishEnglish，EnglishEnglish
  // HeightField.baseRadius EnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  const shapeIds = [...Object.values(BODIES), ...Object.values(MOON_PHYS)]
    .map((p) => p?.shapeModel).filter(Boolean);
  if (shapeIds.length) {
    const n = await loadShapeModels(shapeIds, asset(''));
    if (n) console.log(`[shapes] EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ${n}/${shapeIds.length}`);
  }
  const { cache, upgrades, boost } = await loadTextures(onProgress, onBgProgress);
  const bodies = new Map();
  const orbitLines = new THREE.Group();
  scene.add(orbitLines);
  const terraformHaloGeometry = new THREE.SphereGeometry(1, 48, 32);

  // ---------- EnglishEnglish ----------
  const sunPhys = BODIES.sun;
  const sun = createSun(sunPhys.radiusKm, texOf(cache, 'sun.jpg', 'sun', sunPhys));
  const sunEntry = {
    id: 'sun', phys: sunPhys, isMoon: false, parentId: null,
    group: sun.group, mesh: sun.mesh, posKm: new Float64Array(3),
    uniforms: sun.uniforms,   // EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish uniform）
    coronaUniforms: sun.coronaUniforms,
  };
  // EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish StandardMaterial English）
  // EnglishEnglishEnglishEnglishEnglishEnglish = EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish（planetMaterial）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish NASA EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。EnglishEnglishEnglishEnglishEnglishEnglish
  // 0xfff2e0（EnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish、
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）。
  const sunLight = new THREE.PointLight(0xffffff, 1, 0, 0);
  sun.group.add(sunLight);
  // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglish**。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；
  // EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish mars-ground-dusk EnglishEnglish
  // EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish Rayleigh EnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglish、EnglishEnglishEnglish、EnglishEnglishEnglishEnglish，
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglish skyFraction（EnglishEnglishEnglishEnglishEnglishEnglish）。
  const skyLight = new THREE.HemisphereLight(0x8fb4ff, 0x40382e, 0);
  scene.add(skyLight);
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglish——
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish"EnglishEnglishEnglish"EnglishEnglishEnglishEnglish）。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ±400m EnglishEnglishEnglishEnglishEnglish；w=0 English castShadow EnglishEnglish、EnglishEnglishEnglish。
  globalThis.__scene = scene;   // EnglishEnglishEnglish
  const sunShadow = new THREE.DirectionalLight(0xffffff, 0);
  sunShadow.castShadow = false;
  sunShadow.shadow.mapSize.set(QUALITY.shadowSize, QUALITY.shadowSize);
  // EnglishEnglishEnglishEnglishEnglish（km）。EnglishEnglishEnglishEnglish 0.4km——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，English**EnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglishEnglish**：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），0.4km EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  // EnglishEnglish 0.8km（EnglishEnglishEnglish 2048 English → 0.78m/texel）。**EnglishEnglishEnglishEnglishEnglishEnglish**：EnglishEnglish 1.6km，
  // texel EnglishEnglish 1.56m English bias/normalBias EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）。EnglishEnglishEnglishEnglishEnglishEnglishEnglish bias English texel EnglishEnglish。
  const SHADOW_HALF = 0.8;
  sunShadow.shadow.camera.left = -SHADOW_HALF; sunShadow.shadow.camera.right = SHADOW_HALF;
  sunShadow.shadow.camera.top = SHADOW_HALF; sunShadow.shadow.camera.bottom = -SHADOW_HALF;
  sunShadow.shadow.camera.near = 0.02; sunShadow.shadow.camera.far = 6;
  sunShadow.shadow.bias = -0.00008;
  sunShadow.shadow.normalBias = 0.0006; // km EnglishEnglish = 0.6m：EnglishEnglishEnglishEnglishEnglishEnglish 0.4m EnglishEnglishEnglishEnglishEnglishEnglishEnglish
  scene.add(sunShadow);
  scene.add(sunShadow.target);
  scene.add(sun.group);
  world.register(sunEntry.posKm, sun.group);
  bodies.set('sun', sunEntry);

  // ---------- EnglishEnglish ----------
  for (const id of PLANETS) {
    const phys = BODIES[id];
    const group = new THREE.Group();
    const visualMapFile = phys.textures?.clouds && phys.textures?.cloudsOpaque
      ? phys.textures.clouds : phys.textures?.map;
    // Issue #26：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglish
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（tools/fetch-clouds.mjs EnglishEnglish，EnglishEnglish＝EnglishEnglish）；
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish luminance，EnglishEnglishEnglishEnglish。
    const cloudFile = phys.textures?.cloudsReal && cache.has(phys.textures.cloudsReal)
      ? phys.textures.cloudsReal
      : (phys.textures?.clouds && !phys.textures.cloudsOpaque && cache.has(phys.textures.clouds)
        ? phys.textures.clouds : null);
    const cloudTex = cloudFile ? cache.get(cloudFile) : null;
    const mat = createPlanetMaterial({
      map: texOf(cache, visualMapFile, id, phys),
      nightMap: phys.textures?.night ? cache.get(phys.textures.night) ?? null : null,
      oceanSpec: !!phys.surface?.ocean,
      ringShadow: phys.rings ? {
        tex: phys.rings.texture ? cache.get(phys.rings.texture) ?? null : null,
        innerKm: phys.rings.innerKm, outerKm: phys.rings.outerKm,
      } : null,
      detailMode: detailModeOf(phys),
      radiusKm: phys.radiusKm,
      bodyId: id,       // Issue #26/#27/#28/#36：EnglishEnglishEnglishEnglishEnglishEnglish
      cloudTex,         // Issue #26：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    });
    // English DEM EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish R EnglishEnglish（±0.5·ampKm），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 0.62·ampKm——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 3–6km，
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish"EnglishEnglishEnglish"。
    const relief = !DEM_SOURCES[id] && phys.landable;
    const reliefOffset = relief ? terrainReliefOffset(phys) : 0;
    const mesh = new THREE.Mesh(
      relief ? reliefSphereGeo(phys.radiusKm - reliefOffset) : sphereGeo(phys.radiusKm - reliefOffset, true),
      mat);
    if (relief) deformLowRelief(mesh, id, phys);
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish R English，
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish <0.6% EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish radiusKm EnglishEnglishEnglishEnglishEnglishEnglishEnglish，English bodies.js EnglishEnglish「EnglishEnglishEnglishEnglish」。
    if (!phys.landable) {
      const sy = 1 - (phys.oblateness ?? 0);
      mesh.scale.y = sy;
      // EnglishEnglishEnglishEnglishEnglishEnglish：y EnglishEnglishEnglishEnglish sy → EnglishEnglishEnglishEnglishEnglishEnglishEnglish y EnglishEnglishEnglishEnglishEnglish sy
      const u = mat.userData.uniforms;
      if (u?.uInvScaleY) u.uInvScaleY.value = 1 / Math.max(sy, 1e-3);
    }
    group.add(mesh);

    const entry = {
      id, phys, isMoon: false, parentId: 'sun', group, mesh,
      posKm: new Float64Array(3), mat,
      cloudFile,   // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish or EnglishEnglishEnglish），EnglishEnglishEnglish
    };

    if (!skipAtmo) {
      const defaults = haloPressureValues(HALO_DEFAULT_PRESSURE_ATM[id]);
      const color = nativeHaloColor(phys);
      const haloMat = createTerraformHaloMaterial(color, defaults.opacity);
      const halo = new THREE.Mesh(terraformHaloGeometry, haloMat);
      halo.name = `${id}-terraform-atmosphere-halo`;
      halo.renderOrder = 11;
      halo.scale.set(
        phys.radiusKm * defaults.shellScale,
        phys.radiusKm * defaults.shellScale * (1 - (phys.oblateness ?? 0)),
        phys.radiusKm * defaults.shellScale,
      );
      group.add(halo);
      entry.terraformHaloMesh = halo;
      entry.terraformAtmosphereDefaults = {
        color: color.clone(),
        opacity: defaults.opacity,
        shellScale: defaults.shellScale,
      };
    }

    // EnglishEnglish（EnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    if (cloudTex) {
      const cmat = createCloudMaterial(cloudTex, { radiusKm: phys.radiusKm });
      const cmesh = new THREE.Mesh(sphereGeo(phys.radiusKm * 1.0035, true), cmat);
      cmesh.renderOrder = 10;
      mesh.add(cmesh);
      entry.cloudMesh = cmesh;
      entry.cloudMat = cmat;
    }

    if (phys.atmosphere && !skipAtmo) {
      const atmo = createAtmosphere(phys, AURORA_MODE[id] ?? 0);
      group.add(atmo);
      entry.atmoMesh = atmo;
    }

    if (phys.rings) {
      const rtex = phys.rings.texture ? cache.get(phys.rings.texture) ?? null : null;
      const rings = createRings(phys, rtex);
      mesh.add(rings);
      entry.ringMesh = rings;
    }

    // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish AU EnglishEnglishEnglishEnglish"EnglishEnglish"EnglishEnglish）
    const glint = makeGlint(0xfff6e8);
    group.add(glint);
    entry.glint = glint;

    // EnglishEnglishEnglish（EnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    const jdNow = jdUTtoTT(Date.now() / 86400000 + 2440587.5);
    const pts = orbitPoints(id, jdNow, 512);
    const arr = new Float32Array(pts.length);
    for (let i = 0; i < pts.length; i += 3) {
      const w = eclToWorldArr({ x: pts[i], y: pts[i + 1], z: pts[i + 2] });
      arr[i] = w[0]; arr[i + 1] = w[1]; arr[i + 2] = w[2];
    }
    const og = new THREE.BufferGeometry();
    og.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const oline = new THREE.LineLoop(og, new THREE.LineBasicMaterial({
      color: ORBIT_COLORS[id], transparent: true, opacity: 0.3, fog: false,
    }));
    sun.group.add(oline);
    orbitLines.userData[id] = oline;
    oline.userData.isOrbit = true;
    oline.userData.jd = jdNow;
    oline.userData.baseOpacity = 0.3; // EnglishEnglishEnglishEnglishEnglishEnglish（main.js EnglishEnglishEnglishEnglishEnglishEnglishEnglish）

    scene.add(group);
    world.register(entry.posKm, group);
    bodies.set(id, entry);
  }

  // ---------- EnglishEnglish ----------
  for (const id of MOON_IDS) {
    const phys = MOON_PHYS[id];
    const fullPhys = { ...phys, id, type: 'moon' };
    // Issue #29：EnglishEnglishEnglishEnglishEnglishEnglish N2 EnglishEnglish（~1.4 Pa），EnglishEnglishEnglishEnglishEnglish atmosphere。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    if (id === 'triton' && !fullPhys.atmosphere) {
      fullPhys.atmosphere = {
        heightKm: 20, rayleighScaleKm: 5, mieScaleKm: 5,
        rayleigh: [1e-9, 1e-9, 1e-9], mie: 1e-9, mieG: 0.5, multiplier: 0.01,
      };
    }
    const group = new THREE.Group();
    const mat = createPlanetMaterial({
      map: texOf(cache, phys.textures?.map, id, fullPhys),
      detailMode: detailModeOf(fullPhys),
      radiusKm: phys.radiusKm,
      bodyId: id, // Issue #36：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish
    });
    const big = phys.radiusKm > 1000;
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：English DEM、EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish R−offset EnglishEnglishEnglish R。
    // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglish deformIrregular EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    const irregular = !!phys.shape?.dims;
    const relief = !DEM_SOURCES[id] && !irregular && fullPhys.landable;
    const reliefOffset = relief ? terrainReliefOffset(fullPhys) : 0;
    const mesh = new THREE.Mesh(
      relief ? reliefSphereGeo(phys.radiusKm - reliefOffset) : sphereGeo(phys.radiusKm - reliefOffset, big),
      mat);
    if (irregular) deformIrregular(mesh, id, fullPhys);
    else if (relief) deformLowRelief(mesh, id, fullPhys);
    group.add(mesh);

    const entry = {
      id, phys: fullPhys, isMoon: true, parentId: phys.parent, group, mesh,
      posKm: new Float64Array(3), mat,
    };

    if (phys.atmosphere && !skipAtmo) {
      const atmo = createAtmosphere(fullPhys, AURORA_MODE[id] ?? 0);
      group.add(atmo);
      entry.atmoMesh = atmo;
    }

    const glint = makeGlint(0xd8e2f0);
    group.add(glint);
    entry.glint = glint;

    // EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    const pts = moonOrbitPoints(id, 192);
    const arr = new Float32Array(pts.length);
    for (let i = 0; i < pts.length; i += 3) {
      const w = eclToWorldArr({ x: pts[i], y: pts[i + 1], z: pts[i + 2] });
      arr[i] = w[0]; arr[i + 1] = w[1]; arr[i + 2] = w[2];
    }
    const og = new THREE.BufferGeometry();
    og.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const oline = new THREE.LineLoop(og, new THREE.LineBasicMaterial({
      color: 0x7a8a9a, transparent: true, opacity: 0.25, fog: false,
    }));
    bodies.get(phys.parent).group.add(oline);
    oline.userData.isOrbit = true;
    oline.userData.baseOpacity = 0.25;
    orbitLines.userData[id] = oline;

    scene.add(group);
    world.register(entry.posKm, group);
    bodies.set(id, entry);
  }

  // ---------- EnglishEnglishEnglishEnglish ----------
  const _q = new THREE.Quaternion();
  const _sunDir = new THREE.Vector3();
  const _pole = new THREE.Vector3(); // Issue #36：EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  const _bodyQ = new THREE.Quaternion();          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English uBodyInv EnglishEnglish）
  const _bodyM4 = new THREE.Matrix4();

  // EnglishEnglish（km/English）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  const C_KM_PER_DAY = 299792.458 * 86400;

  // EnglishEnglishEnglishEnglishEnglishEnglish 0..1。English update() EnglishEnglish jdTT EnglishEnglish，postWorldUpdate() EnglishEnglishEnglish——
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish const EnglishEnglishEnglishEnglishEnglishEnglishEnglish ReferenceError，
  // EnglishEnglishEnglishEnglishEnglish try/catch EnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglish**（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
  let solarActivityNow = 0.5;

  /** EnglishEnglishEnglishEnglishEnglishEnglish：English t − d/c EnglishEnglish，2 EnglishEnglishEnglishEnglishEnglish。camEcl EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
  function apparentAt(fn, camEcl, jdTT) {
    let p = fn(jdTT);
    if (!camEcl) return p;
    for (let k = 0; k < 2; k++) {
      const d = Math.hypot(p.x - camEcl.x, p.y - camEcl.y, p.z - camEcl.z);
      p = fn(jdTT - d / C_KM_PER_DAY);
    }
    return p;
  }

  let orbitWorker;
  const pendingOrbits = new Set();
  function refreshOrbitLines(jdTT) {
    for (const id of PLANETS) {
      const line = orbitLines.userData[id];
      if (Math.abs(jdTT - line.userData.jd) < 1 || pendingOrbits.has(id)) continue;
      if (!orbitWorker && typeof Worker !== 'undefined') {
        orbitWorker = new Worker(new URL('../engine/orbitWorker.js', import.meta.url), { type: 'module' });
        orbitWorker.onmessage = ({ data }) => {
          pendingOrbits.delete(data.id);
          if (data.error) { console.warn('[orbit]', data.error); return; }
          const target = orbitLines.userData[data.id];
          target.geometry.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
          target.geometry.computeBoundingSphere();
          target.userData.jd = data.jd;
        };
      }
      if (!orbitWorker) return;
      pendingOrbits.add(id);
      orbitWorker.postMessage({ id, jd: jdTT });
    }
  }

  function update(jdTT, camPosKm) {
    refreshOrbitLines(jdTT);
    // EnglishEnglishEnglishEnglishEnglishEnglish（three EnglishEnglishEnglish km）→ EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish
    const camEcl = camPosKm ? { x: camPosKm[0], y: -camPosKm[2], z: camPosKm[1] } : null;
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    const eclPos = new Map();
    // Issue #27/#29/#36：EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish）
    // EnglishEnglishEnglishEnglishEnglishEnglish Ls（English，0-360）
    let ls = marsLs(jdTT);
    // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
    // EnglishEnglishEnglishEnglishEnglish J2000 EnglishEnglishEnglish 11 EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish、**EnglishEnglishEnglish 3–4 English**——
    // EnglishEnglishEnglishEnglishEnglishEnglish 2005.5/2016.5/2027.5，EnglishEnglishEnglishEnglish 2000.3/2014.3/2024.9。
    solarActivityNow = solarActivityAt(jdTT);
    // EnglishEnglishEnglishEnglishEnglishEnglish（Ls 180-360 EnglishEnglishEnglish）
    const marsDust = Math.max(0,
      THREE.MathUtils.smoothstep(ls, 180, 220) * (1 - THREE.MathUtils.smoothstep(ls, 330, 360)));
    // EnglishEnglishEnglishEnglish（EnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglish）
    const auroraStrength = 1.0;

    for (const [id, e] of bodies) {
      if (id === 'sun') {
        const m = bodyToEclipticMatrix('sun', jdTT);
        eclMatrixToWorldQuat(m, e.mesh.quaternion);
        continue;
      }
      // EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish t − d/c EnglishEnglishEnglishEnglishEnglish）
      let ecl;
      if (!e.isMoon) {
        ecl = apparentAt((t) => planetPosition(id, t), camEcl, jdTT);
      } else if (id === 'moon') {
        ecl = apparentAt((t) => {
          const ep = eclPos.get('earth') ?? planetPosition('earth', t);
          const mg = moonGeocentric(t);
          return { x: ep.x + mg.x, y: ep.y + mg.y, z: ep.z + mg.z };
        }, camEcl, jdTT);
      } else {
        ecl = apparentAt((t) => {
          const pp = eclPos.get(e.parentId) ?? planetPosition(e.parentId, t);
          const ml = moonLocalPosition(id, t);
          return { x: pp.x + ml.x, y: pp.y + ml.y, z: pp.z + ml.z };
        }, camEcl, jdTT);
      }
      eclPos.set(id, ecl);
      const w = eclToWorldArr(ecl);
      e.posKm[0] = w[0]; e.posKm[1] = w[1]; e.posKm[2] = w[2];

      // EnglishEnglish
      if (!e.isMoon || id === 'moon') {
        // EnglishEnglishEnglish IAU 2015 EnglishEnglishEnglishEnglish，EnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglish**English（EnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglish
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish ±7.9°、
        // EnglishEnglish ±6.7°），EnglishEnglishEnglishEnglishEnglishEnglish 59% EnglishEnglishEnglish 50%。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish IAU EnglishEnglish。
        const m = bodyToEclipticMatrix(id, jdTT);
        eclMatrixToWorldQuat(m, e.mesh.quaternion);
      } else {
        // EnglishEnglishEnglishEnglish：z=EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        const local = id === 'moon' ? moonGeocentric(jdTT) : moonLocalPosition(id, jdTT);
        const L = Math.hypot(local.x, local.y, local.z) || 1;
        const toParent = { x: -local.x / L, y: -local.y / L, z: -local.z / L };
        const nHat = moonOrbitNormal(id, jdTT);
        eclMatrixToWorldQuat(tidalLockMatrix(nHat, toParent), e.mesh.quaternion);
      }

      // EnglishEnglish uniform：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      const dKm = Math.hypot(e.posKm[0], e.posKm[1], e.posKm[2]);
      const dAU = Math.max(dKm / KM_PER_AU, 1e-6);
      _sunDir.set(-e.posKm[0] / dKm, -e.posKm[1] / dKm, -e.posKm[2] / dKm);
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，**EnglishEnglishEnglishEnglishEnglishEnglish**。
      //
      // EnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglish"：dAU>1 EnglishEnglish (1/d²)^0.55 EnglishEnglish。EnglishEnglishEnglishEnglishEnglish
      // （main.js English d^0.85）EnglishEnglishEnglishEnglish，English `sunI × EnglishEnglish` EnglishEnglishEnglishEnglishEnglishEnglish——
      // EnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**：EnglishEnglish（EnglishEnglishEnglish 0.106）EnglishEnglishEnglishEnglishEnglish
      // EnglishEnglish（0.25）EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish 2.77 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 0.588。
      //
      // EnglishEnglish sunI = 1/d²，EnglishEnglish = d²（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglish 1，
      // EnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglish**：EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      const sunI = 1 / (dAU * dAU);
      if (e.mat) {
        e.mat.userData.uniforms.uSunDir.value.copy(_sunDir);
        e.mat.userData.uniforms.uSunI.value = sunI;
        if (e.phys.rings) {
          // EnglishEnglishEnglishEnglish = EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish）
          e.mat.userData.uniforms.uRingNormal.value
            .set(0, 1, 0).applyQuaternion(e.mesh.quaternion);
          // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish × EnglishEnglishEnglishEnglish ≈ 0.09（EnglishEnglish）
          // × EnglishEnglishEnglishEnglishEnglish。EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish rings.opacity EnglishEnglish。
          const ringOpacity = e.phys.rings.opacity ?? 1;
          e.mat.userData.uniforms.uRingShine.value = 0.09 * ringOpacity * sunI;
        }
      }
      if (e.cloudMat) {
        const u = e.cloudMat.userData.uniforms;
        u.uCenter.value.copy(e.group.position);
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish（English createCloudMaterial EnglishEnglishEnglish）
        u.uCameraInside.value = e.group.position.length() < u.uRTop.value ? 1 : 0;
        u.uSunDir.value.copy(_sunDir);
        u.uSunI.value = sunI;
        // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglish**English**，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish vPosW EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish atan EnglishEnglishEnglish
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish）。
        u.uBodyInv.value.setFromMatrix4(
          _bodyM4.makeRotationFromQuaternion(_bodyQ.copy(e.mesh.quaternion).invert()));
      }
      if (e.atmoMesh) {
        const u = e.atmoMesh.material.userData.uniforms;
        u.uSunDir.value.copy(_sunDir);
        u.uSunI.value = 5 * (e.phys.atmosphere.multiplier ?? 1) * sunI;
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish，R8 #1）
        u.uAxis.value.set(0, 1, 0).applyQuaternion(e.mesh.quaternion);
      }
      if (e.ringMesh) {
        const u = e.ringMesh.material.userData.uniforms;
        u.uSunDir.value.copy(_sunDir);
        u.uSunI.value = sunI;
      }
      // === Issue #27/#29/#36：EnglishEnglish/EnglishEnglish uniforms ===
      // EnglishEnglishEnglishEnglishEnglish = arcsin(sunDir · poleAxis)，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      _pole.set(0, 1, 0).applyQuaternion(e.mesh.quaternion);
      const subsolarLat = Math.asin(
        THREE.MathUtils.clamp(_sunDir.dot(_pole), -1, 1)) * 180 / Math.PI;
      if (e.mat) {
        const u = e.mat.userData.uniforms;
        u.uLs.value = ls;
        u.uSubsolarLat.value = subsolarLat;
      }
      if (e.atmoMesh) {
        const u = e.atmoMesh.material.userData.uniforms;
        u.uSolarActivity.value = solarActivityNow;
        u.uAuroraStrength.value = auroraStrength;
        // EnglishEnglishEnglishEnglish：boost EnglishEnglishEnglishEnglish（EnglishEnglishEnglish）
        u.uDustStorm.value = (id === 'mars') ? marsDust : 0;
      }
    }
  }

  /** world.update EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglish） */
  let glintSkyFade = 1; // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglish"）
  function postWorldUpdate(shipPosKm, simTimeSec) {
    let nearestE = null, nearestSurf = Infinity;
    for (const [id, e] of bodies) {
      if (id === 'sun') continue;
      const dist = Math.hypot(
        e.posKm[0] - shipPosKm[0], e.posKm[1] - shipPosKm[1], e.posKm[2] - shipPosKm[2]
      );
      const surf = dist - e.phys.radiusKm;
      if (surf < nearestSurf) { nearestSurf = surf; nearestE = e; }
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglish φ（EnglishEnglishEnglish EnglishEnglish-EnglishEnglish-EnglishEnglish EnglishEnglish）+ EnglishEnglishEnglishEnglishEnglish
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglish：(sinφ + (π−φ)cosφ)/π，EnglishEnglish φ=0 EnglishEnglish，EnglishEnglish φ→π EnglishEnglish
      const bsX = -e.posKm[0], bsY = -e.posKm[1], bsZ = -e.posKm[2]; // EnglishEnglish→EnglishEnglish
      const bcX = shipPosKm[0] - e.posKm[0], bcY = shipPosKm[1] - e.posKm[1], bcZ = shipPosKm[2] - e.posKm[2]; // EnglishEnglish→EnglishEnglish
      const bsL = Math.hypot(bsX, bsY, bsZ) || 1, bcL = Math.hypot(bcX, bcY, bcZ) || 1;
      const cosPhi = Math.max(-1, Math.min(1, (bsX * bcX + bsY * bcY + bsZ * bcZ) / (bsL * bcL)));
      const phi = Math.acos(cosPhi);
      const phaseF = (Math.sin(phi) + (Math.PI - phi) * cosPhi) / Math.PI;
      if (e.atmoMesh) e.atmoMesh.material.userData.uniforms.uCenter.value.copy(e.group.position);
      if (e.ringMesh) e.ringMesh.material.userData.uniforms.uCenter.value.copy(e.group.position);
      if (e.phys.rings && e.mat) e.mat.userData.uniforms.uCenter.value.copy(e.group.position);
      // Issue #26/#28/#29：EnglishEnglishEnglishEnglish uniform（EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish）
      if (e.mat) e.mat.userData.uniforms.uTime.value = simTimeSec;
      if (e.cloudMat) e.cloudMat.userData.uniforms.uTime.value = simTimeSec;
      if (e.atmoMesh) e.atmoMesh.material.userData.uniforms.uTime.value = simTimeSec;
      // EnglishEnglishEnglishEnglish：EnglishEnglish ~3px EnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      const glintSize = dist * 0.004;
      e.glint.scale.setScalar(glintSize);
      const distFade = THREE.MathUtils.clamp((dist / (e.phys.radiusKm * 300) - 1) * 0.8, 0, 0.9);
      const albedoScale = Math.sqrt((GLINT_ALBEDO[id] ?? 0.15) / 0.3);
      // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 1/d²，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglish（30 AU
      // EnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglishEnglish（0.3 AU、EnglishEnglishEnglishEnglishEnglishEnglish）EnglishEnglish，EnglishEnglishEnglishEnglish −4.5 EnglishEnglish
      // +7.8 English，English 12 EnglishEnglishEnglish。EnglishEnglishEnglish 1/d²（English 1 AU EnglishEnglish）EnglishEnglishEnglish。
      const dAUg = Math.max(Math.hypot(e.posKm[0], e.posKm[1], e.posKm[2]) / KM_PER_AU, 1e-6);
      const flux = 1 / Math.max(dAUg * dAUg, 1e-6);
      e.glint.material.opacity = distFade * (0.2 + 0.8 * phaseF) * albedoScale
        * glintSkyFade * Math.min(1, flux * 1.4);
      // EnglishEnglish LOD：EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish 2.8 English km EnglishEnglish、EnglishEnglish 3.2 English km EnglishEnglish）；
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      if (e.isMoon) {
        const parent = bodies.get(e.parentId);
        const pd = Math.hypot(
          parent.posKm[0] - shipPosKm[0], parent.posKm[1] - shipPosKm[1], parent.posKm[2] - shipPosKm[2]
        );
        if (e.mesh.visible && pd > 3.2e8) e.mesh.visible = false;
        else if (!e.mesh.visible && pd < 2.8e8) e.mesh.visible = true;
      }
    }
    const dSunKm = Math.hypot(shipPosKm[0], shipPosKm[1], shipPosKm[2]);
    const dAU = Math.max(dSunKm / KM_PER_AU, 0.05);
    // EnglishEnglish Standard EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    // EnglishEnglishEnglishEnglishEnglish"10EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglish
    // English 0.55 EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish 1/d² EnglishEnglish 26× English
    // ACES EnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglish）。
    // EnglishEnglish π：StandardMaterial EnglishEnglishEnglishEnglishEnglish 1/π EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish（planetMaterial）
    // English albedo·NdotL·uSunI EnglishEnglishEnglishEnglish。English 2.5 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ~20%，EnglishEnglishEnglish
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish 200km EnglishEnglishEnglishEnglishEnglish）；English π EnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish：StandardMaterial EnglishEnglishEnglishEnglishEnglish 1/π，English π/d² EnglishEnglishEnglishEnglishEnglish
    // （EnglishEnglishEnglish pow(li, 0.55)，EnglishEnglishEnglishEnglish 1/d² EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 2.4 English）
    const li = 1 / (dAU * dAU);
    sunLight.intensity = Math.PI * li;
    // EnglishEnglishEnglish（tools/audit-scenarios.mjs English AUDIT_FOG）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    globalThis.__sunLight = sunLight; globalThis.__skyLight = skyLight;
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    // （Venera EnglishEnglishEnglishEnglishEnglish / Huygens EnglishEnglishEnglishEnglishEnglishEnglishEnglish）；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    const gt = nearestE?.phys.atmosphere?.groundTint;
    if (gt) {
      const w = Math.exp(-Math.max(nearestSurf, 0) / (nearestE.phys.atmosphere.rayleighScaleKm * 3));
      sunLight.intensity *= 1 + ((nearestE.phys.atmosphere.groundDim ?? 1) - 1) * w;
      sunLight.color.setRGB(
        1.0 + (gt[0] - 1.0) * w,       // EnglishEnglishEnglishEnglishEnglish = (1,1,1)，English w EnglishEnglishEnglishEnglishEnglish
        1.0 + (gt[1] - 1.0) * w,
        1.0 + (gt[2] - 1.0) * w);
    } else {
      sunLight.color.setHex(0xffffff);
    }
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English sunLight EnglishEnglishEnglishEnglish）
    {
      const atm = nearestE?.phys.atmosphere;
      if (atm) {
        const r = atm.rayleigh ?? [1, 1, 1];
        const mx = Math.max(r[0], r[1], r[2], 1e-12);
        // EnglishEnglishEnglish = Rayleigh EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
        skyLight.color.setRGB(r[0] / mx, r[1] / mx, r[2] / mx);
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        const ga = atm.groundAlbedo ?? 0.15;
        skyLight.groundColor.setRGB(ga * 1.1, ga * 0.95, ga * 0.8);
        // skyFraction：EnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglish ≈ 0.1–0.15；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；
        // EnglishEnglish（EnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglish（EnglishEnglish）EnglishEnglishEnglishEnglish。
        const frac = atm.skyFraction ?? 0.12;
        skyLight.intensity = Math.PI * li * frac;
      } else {
        skyLight.intensity = 0;
      }
    }
    // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish 2.7km EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）；0.3km EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish。
    const wSh = (nearestE && nearestE.phys.landable)
      ? THREE.MathUtils.smoothstep(2.7 - Math.max(nearestSurf, 0), 0, 2.4) : 0;
    if (wSh > 0.003) {
      _sunDir.copy(sun.group.position).normalize(); // EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）：EnglishEnglish→EnglishEnglish
      sunShadow.position.copy(_sunDir).multiplyScalar(3);
      sunShadow.target.position.set(0, 0, 0);
      sunShadow.intensity = sunLight.intensity * wSh;
      sunShadow.color.copy(sunLight.color);
      sunShadow.visible = true;
      sunShadow.castShadow = true;
      sunLight.intensity *= 1 - wSh;
    } else if (sunShadow.visible) {
      sunShadow.visible = false;
      sunShadow.castShadow = false;
      sunShadow.intensity = 0;
    }
    sun.update(simTimeSec, dSunKm, isSunOcculted(shipPosKm, sunPhys.radiusKm,
      [...bodies.values()].filter(b => b.phys.id !== 'sun')), solarActivityNow);
  }

  function setPlanetAtmosphereVisual(planetName, params = {}) {
    const id = String(planetName).trim().toLowerCase();
    const entry = bodies.get(id);
    if (!entry?.terraformHaloMesh) return false;

    const halo = entry.terraformHaloMesh;
    const uniforms = halo.material.uniforms;
    const surfaceUniforms = entry.mat.userData.uniforms;
    const defaults = entry.terraformAtmosphereDefaults;
    if (params.isReset) {
      uniforms.uColor.value.copy(defaults.color);
      uniforms.uOpacity.value = defaults.opacity;
      surfaceUniforms.uTerraformTintColor.value.setHex(0x000000);
      surfaceUniforms.uTerraformTintStrength.value = 0;
      halo.scale.set(
        entry.phys.radiusKm * defaults.shellScale,
        entry.phys.radiusKm * defaults.shellScale * (1 - (entry.phys.oblateness ?? 0)),
        entry.phys.radiusKm * defaults.shellScale,
      );
      return true;
    }
    if (
      !Number.isFinite(params.pressureAtm) ||
      !Number.isFinite(params.co2Pct) ||
      !Number.isFinite(params.o2Pct) ||
      !Number.isFinite(params.predictedTempK)
    ) {
      throw new TypeError('Atmosphere pressure, CO₂, O₂, and predicted temperature must be finite numbers');
    }

    const pressure = THREE.MathUtils.clamp(
      params.pressureAtm,
      HALO_MIN_PRESSURE_ATM,
      HALO_MAX_PRESSURE_ATM,
    );
    const co2Pct = THREE.MathUtils.clamp(params.co2Pct, 0, 100);
    const o2Pct = THREE.MathUtils.clamp(params.o2Pct, 0, 35);
    const values = haloPressureValues(pressure);
    uniforms.uColor.value.copy(terraformHaloColor(o2Pct, co2Pct));
    uniforms.uOpacity.value = values.opacity;
    const tintColor = surfaceUniforms.uTerraformTintColor.value;
    let tintStrength = 0;
    if (params.predictedTempK < 235) {
      tintColor.setHex(0xbae6fd);
      tintStrength = 0.035;
    } else if (params.predictedTempK <= 325 && pressure >= 0.1) {
      tintColor.setHex(0x0284c7);
      tintStrength = 0.045;
    } else if (params.predictedTempK > 350) {
      tintColor.setHex(0xea580c);
      tintStrength = 0.025 + Math.min(0.055, (params.predictedTempK - 350) * 0.00012);
    } else {
      tintColor.setHex(0x000000);
    }
    surfaceUniforms.uTerraformTintStrength.value = tintStrength;
    halo.scale.set(
      entry.phys.radiusKm * values.shellScale,
      entry.phys.radiusKm * values.shellScale * (1 - (entry.phys.oblateness ?? 0)),
      entry.phys.radiusKm * values.shellScale,
    );
    return true;
  }

  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish → ImageData）
  const mapDataCache = new Map();
  function mapDataOf(id) {
    const e = bodies.get(id);
    const file = e?.phys.textures?.map;
    let data = null;
    const tex = file ? cache.get(file) : null;
    const img = tex?.image;
    const cachedData = readMapDataCache(mapDataCache, id, img);
    if (cachedData !== undefined) return cachedData;
    if (img && (img.width || img.videoWidth)) {
      try {
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish 2048×1024）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（sRGB EnglishEnglishEnglishEnglish → EnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglish
        // om=(b-max(r,g·0.9))·6 EnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        const w = Math.min(img.width || img.videoWidth || 1024, 2048);
        const h = Math.max(1, Math.round(w / 2));
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        const ctx = cv.getContext('2d', { willReadFrequently: true });
        // CPU terrain sampling expects the original north-at-top atlas, while
        // GPU bitmaps have been flipped during decode to match TextureLoader.
        drawTextureForSampling(ctx, img, w, h);
        data = ctx.getImageData(0, 0, w, h);
      } catch { /* EnglishEnglishEnglishEnglishEnglish → null */ }
    }
    mapDataCache.delete(id);
    mapDataCache.set(id, { image: img, data });
    if (mapDataCache.size > 4) mapDataCache.delete(mapDataCache.keys().next().value);
    return data;
  }

  return { bodies, sunEntry, orbitLines, update, postWorldUpdate, mapDataOf, cache, upgrades, boostTextures: boost,
    setPlanetAtmosphereVisual,
    /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish） */
    setSkyFade(f) { glintSkyFade = f > 0.4 ? 1 : 0; } };
}

function makeGlint(color) {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  const tex = new THREE.CanvasTexture(c);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, color, transparent: true, opacity: 0.8,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  return sp;
}
