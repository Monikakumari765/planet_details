// EnglishEnglishEnglish 3D EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（Issue #30: Voyager 1/2, Issue #31: New Horizons）。
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，1:1 EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish billboard（EnglishEnglishEnglishEnglishEnglish makeSpacecraftGlow EnglishEnglish）。
// EnglishEnglishEnglishEnglishEnglish heliosphere.js English Voyager EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish。

import * as THREE from 'three';
import { KM_PER_AU } from '../config.js';
import { sampledPosition } from '../astro/sampledEphemeris.js';

const DEG = Math.PI / 180;
const m = (v) => v * 0.001; // English→EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish km）

// ── EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish dispose EnglishEnglish）──
// EnglishEnglishEnglishEnglish：Voyager/New Horizons EnglishEnglishEnglishEnglishEnglishEnglish（aluminized Kapton）
function goldFoilMat() {
  return new THREE.MeshStandardMaterial({
    color: 0xd4af37, metalness: 0.8, roughness: 0.4,
  });
}
// EnglishEnglishEnglishEnglish：EnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglish
function darkStructMat() {
  return new THREE.MeshStandardMaterial({
    color: 0x2a2a2a, metalness: 0.6, roughness: 0.5,
  });
}
// EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish
function dishMat() {
  return new THREE.MeshStandardMaterial({
    color: 0xe8e0d0, metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide,
  });
}

// ── EnglishEnglishEnglishEnglish ──
// EnglishEnglishEnglishEnglishEnglishEnglish：LatheGeometry EnglishEnglishEnglishEnglishEnglishEnglishEnglish y = depth × (r/radius)²
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
function parabolicDish(radiusKm, depthKm, radialSeg = 32, profileSeg = 12) {
  const points = [];
  for (let i = 0; i <= profileSeg; i++) {
    const t = i / profileSeg;
    points.push(new THREE.Vector2(t * radiusKm, depthKm * t * t));
  }
  return new THREE.LatheGeometry(points, radialSeg);
}

// ── Voyager EnglishEnglish（EnglishEnglishEnglishEnglish：1977 EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）──
// EnglishEnglishEnglishEnglishEnglish：3.7m EnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglish、RTG English、13m EnglishEnglishEnglishEnglishEnglish
function createVoyagerModel() {
  const group = new THREE.Group();
  const gold = goldFoilMat();
  const dark = darkStructMat();
  const dish = dishMat();

  // EnglishEnglishEnglishEnglishEnglish：3.7m EnglishEnglishEnglishEnglishEnglish，English +Y（EnglishEnglish/EnglishEnglishEnglishEnglish）
  // EnglishEnglish Voyager EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"
  const dishRadius = m(1.85);
  const dishDepth = m(0.30);
  const dishMesh = new THREE.Mesh(parabolicDish(dishRadius, dishDepth, 32, 12), dish);
  group.add(dishMesh);

  // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  const hubGeo = new THREE.CylinderGeometry(m(0.12), m(0.15), m(0.40), 8);
  const hub = new THREE.Mesh(hubGeo, dark);
  hub.position.y = -m(0.20);
  group.add(hub);

  // EnglishEnglishEnglishEnglishEnglishEnglish（bus）：EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish
  const busGeo = new THREE.CylinderGeometry(m(0.80), m(0.80), m(0.50), 10);
  const bus = new THREE.Mesh(busGeo, gold);
  bus.position.y = -m(0.60);
  group.add(bus);

  // RTG English：English -X EnglishEnglishEnglishEnglish，EnglishEnglish 3 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English-238）
  // RTG EnglishEnglish ~470W EnglishEnglish，English Voyager EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  const rtgBoomLen = m(3.0);
  const rtgBoom = new THREE.Mesh(
    new THREE.CylinderGeometry(m(0.04), m(0.04), rtgBoomLen, 6), dark);
  rtgBoom.rotation.z = Math.PI / 2;
  rtgBoom.position.set(-rtgBoomLen / 2, -m(0.60), 0);
  group.add(rtgBoom);
  // 3 English RTG EnglishEnglish
  for (let i = 0; i < 3; i++) {
    const rtg = new THREE.Mesh(
      new THREE.CylinderGeometry(m(0.12), m(0.12), m(0.30), 8), gold);
    rtg.rotation.z = Math.PI / 2;
    rtg.position.set(-rtgBoomLen - m(0.15), -m(0.60), (i - 1) * m(0.25));
    group.add(rtg);
  }

  // EnglishEnglishEnglishEnglishEnglish：English +X EnglishEnglishEnglishEnglish 13m（EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish）
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  const magBoomLen = m(13.0);
  const magBoom = new THREE.Mesh(
    new THREE.CylinderGeometry(m(0.02), m(0.02), magBoomLen, 4), dark);
  magBoom.rotation.z = Math.PI / 2;
  magBoom.position.set(magBoomLen / 2, -m(0.60), 0);
  group.add(magBoom);
  // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）
  const magSensor = new THREE.Mesh(
    new THREE.IcosahedronGeometry(m(0.10), 0), dark);
  magSensor.position.set(magBoomLen, -m(0.60), 0);
  group.add(magSensor);

  // EnglishEnglishEnglish：English -Z EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish（IRIS、EnglishEnglishEnglishEnglishEnglishEnglish）
  const instBoomLen = m(2.5);
  const instBoom = new THREE.Mesh(
    new THREE.CylinderGeometry(m(0.05), m(0.05), instBoomLen, 6), dark);
  instBoom.rotation.x = Math.PI / 2;
  instBoom.position.set(0, -m(0.60), -instBoomLen / 2);
  group.add(instBoom);
  // EnglishEnglishEnglish
  const inst = new THREE.Mesh(
    new THREE.BoxGeometry(m(0.30), m(0.20), m(0.20)), gold);
  inst.position.set(0, -m(0.60), -instBoomLen);
  group.add(inst);

  return group;
}

// ── New Horizons EnglishEnglish（EnglishEnglishEnglishEnglish：2006 EnglishEnglishEnglish，2015 EnglishEnglishEnglishEnglishEnglishEnglish）──
// EnglishEnglishEnglishEnglishEnglish：2.1m EnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglish、RTG、EnglishEnglishEnglishEnglish
function createNewHorizonsModel() {
  const group = new THREE.Group();
  const gold = goldFoilMat();
  const dark = darkStructMat();
  const dish = dishMat();

  // EnglishEnglishEnglishEnglishEnglish：2.1m EnglishEnglishEnglishEnglishEnglish（English Voyager English，EnglishEnglishEnglishEnglishEnglish）
  const dishRadius = m(1.05);
  const dishDepth = m(0.20);
  const dishMesh = new THREE.Mesh(parabolicDish(dishRadius, dishDepth, 32, 10), dish);
  group.add(dishMesh);

  // EnglishEnglishEnglishEnglishEnglishEnglish（New Horizons EnglishEnglishEnglishEnglishEnglishEnglish）
  const busGeo = new THREE.CylinderGeometry(m(0.70), m(0.70), m(0.50), 6);
  const bus = new THREE.Mesh(busGeo, gold);
  bus.position.y = -m(0.35);
  group.add(bus);

  // RTG：English -X EnglishEnglishEnglishEnglish（English Voyager EnglishEnglish，English-238 EnglishEnglish）
  const rtgArmLen = m(1.5);
  const rtgArm = new THREE.Mesh(
    new THREE.CylinderGeometry(m(0.03), m(0.03), rtgArmLen, 4), dark);
  rtgArm.rotation.z = Math.PI / 2;
  rtgArm.position.set(-rtgArmLen / 2, -m(0.35), 0);
  group.add(rtgArm);
  // RTG EnglishEnglish
  const rtg = new THREE.Mesh(
    new THREE.CylinderGeometry(m(0.20), m(0.20), m(0.60), 8), gold);
  rtg.rotation.z = Math.PI / 2;
  rtg.position.set(-rtgArmLen - m(0.30), -m(0.35), 0);
  group.add(rtg);

  // EnglishEnglishEnglishEnglish（4 EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const thruster = new THREE.Mesh(
      new THREE.ConeGeometry(m(0.05), m(0.15), 6), dark);
    thruster.position.set(
      Math.cos(angle) * m(0.70), -m(0.60), Math.sin(angle) * m(0.70));
    thruster.rotation.x = Math.PI; // EnglishEnglish
    group.add(thruster);
  }

  // EnglishEnglishEnglishEnglish（+X EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish LORRI EnglishEnglishEnglishEnglishEnglishEnglish）
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(m(0.40), m(0.01), m(0.30)), dark);
  platform.position.set(m(0.90), -m(0.35), 0);
  group.add(platform);

  return group;
}

// ── EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 3D EnglishEnglish ──
// type: 'voyager1' | 'voyager2' | 'newhorizons'
// EnglishEnglish THREE.Group，1:1 EnglishEnglishEnglishEnglish（km），+Y EnglishEnglishEnglishEnglishEnglish
export function createSpacecraftModel(type) {
  switch (type) {
    case 'voyager1':
    case 'voyager2':
      return createVoyagerModel();
    case 'newhorizons':
      return createNewHorizonsModel();
    default:
      throw new Error(`Unknown spacecraft type: ${type}`);
  }
}

// ── EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish glint）──
// 1:1 EnglishEnglishEnglishEnglishEnglishEnglishEnglish AU EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish billboard EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
export function makeSpacecraftGlow(color = 0x88ccff) {
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
  return new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, color, transparent: true, opacity: 0.8,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
}

// ════════════════════════════════════════════════════════════════════
// EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
// ════════════════════════════════════════════════════════════════════
export const SPACECRAFT_TIMELINES = {
  voyager1: {
    nameEn: 'Voyager 1',
    events: [
      { date: '1977-09-05', titleZh: 'EnglishEnglish', titleEn: 'Launch',
        descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { date: '1979-03-05', titleZh: 'EnglishEnglishEnglishEnglish', titleEn: 'Jupiter Flyby',
        descZh: 'EnglishEnglishEnglishEnglish 349,000 km，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { date: '1980-11-12', titleZh: 'EnglishEnglishEnglishEnglish', titleEn: 'Saturn Flyby',
        descZh: 'EnglishEnglishEnglishEnglish 124,000 km，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { date: '1990-02-14', titleZh: 'EnglishEnglishEnglishEnglish', titleEn: 'Pale Blue Dot',
        descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish 0.12 EnglishEnglish——EnglishEnglish·EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish《EnglishEnglishEnglishEnglish》。' },
      { date: '2012-08-25', titleZh: 'EnglishEnglishEnglishEnglishEnglishEnglish', titleEn: 'Heliopause Crossing',
        descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish 121 AU。' },
      { date: '2026-01-01', titleZh: 'EnglishEnglish', titleEn: 'Current',
        descZh: 'EnglishEnglishEnglish 166 AU，EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish 2025–2030 EnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
    ],
  },
  voyager2: {
    nameEn: 'Voyager 2',
    events: [
      { date: '1977-08-20', titleZh: 'EnglishEnglish', titleEn: 'Launch',
        descZh: 'EnglishEnglishEnglishEnglish1EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { date: '1979-07-09', titleZh: 'EnglishEnglishEnglishEnglish', titleEn: 'Jupiter Flyby',
        descZh: 'EnglishEnglishEnglishEnglish 570,000 km，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { date: '1981-08-25', titleZh: 'EnglishEnglishEnglishEnglish', titleEn: 'Saturn Flyby',
        descZh: 'EnglishEnglishEnglishEnglish 161,000 km，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { date: '1986-01-24', titleZh: 'EnglishEnglishEnglishEnglishEnglish', titleEn: 'Uranus Flyby',
        descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish 10 EnglishEnglishEnglishEnglishEnglishEnglish。' },
      { date: '1989-08-25', titleZh: 'EnglishEnglishEnglishEnglishEnglish', titleEn: 'Neptune Flyby',
        descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { date: '2018-11-05', titleZh: 'EnglishEnglishEnglishEnglishEnglishEnglish', titleEn: 'Heliopause Crossing',
        descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish 119 AU。' },
      { date: '2026-01-01', titleZh: 'EnglishEnglish', titleEn: 'Current',
        descZh: 'EnglishEnglishEnglish 139 AU，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
    ],
  },
  newhorizons: {
    nameEn: 'New Horizons',
    events: [
      { date: '2006-01-19', titleZh: 'EnglishEnglish', titleEn: 'Launch',
        descZh: 'English 16.26 km/s EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { date: '2007-02-28', titleZh: 'EnglishEnglishEnglishEnglish', titleEn: 'Jupiter Flyby',
        descZh: 'EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { date: '2015-07-14', titleZh: 'EnglishEnglishEnglishEnglishEnglish', titleEn: 'Pluto Flyby',
        descZh: 'EnglishEnglishEnglishEnglish 12,500 km，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { date: '2019-01-01', titleZh: 'Arrokoth EnglishEnglish', titleEn: 'Arrokoth Flyby',
        descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish Arrokoth（2014 MU69），EnglishEnglishEnglishEnglish 3,500 km，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { date: '2026-01-01', titleZh: 'EnglishEnglish', titleEn: 'Current',
        descZh: 'EnglishEnglishEnglish 59 AU，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
    ],
  },
};

// ════════════════════════════════════════════════════════════════════
// New Horizons EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（Issue #31）
// English heliosphere.js English Voyager EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish
// ════════════════════════════════════════════════════════════════════
export const NEW_HORIZONS = {
  id: 'newhorizons',
  nameEn: 'New Horizons',
  // 2026.0 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish < 1 AU EnglishEnglish，EnglishEnglishEnglishEnglishEnglish）
  // EnglishEnglish：EnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish lon≈286°, lat≈-1.5°）
  r0AU: 58.6, rateAUyr: 2.95, lonDeg: 286.0, latDeg: -1.5, epochYear: 2026.0,
  desc: '2006 EnglishEnglishEnglish，2015 EnglishEnglishEnglishEnglishEnglishEnglish，2019 EnglishEnglishEnglish Arrokoth。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
};

/** New Horizons EnglishEnglishEnglishEnglish（km，EnglishEnglish J2000）——English voyagerPosition EnglishEnglish */
export function newHorizonsPosition(jdTT) {
  const sampled = sampledPosition('newhorizons', jdTT);
  if (sampled) return sampled;
  const year = 2000 + (jdTT - 2451545.0) / 365.25;
  const r = (NEW_HORIZONS.r0AU + NEW_HORIZONS.rateAUyr * (year - NEW_HORIZONS.epochYear)) * KM_PER_AU;
  const lon = NEW_HORIZONS.lonDeg * DEG, lat = NEW_HORIZONS.latDeg * DEG;
  return {
    x: r * Math.cos(lat) * Math.cos(lon),
    y: r * Math.cos(lat) * Math.sin(lon),
    z: r * Math.sin(lat),
  };
}

// ════════════════════════════════════════════════════════════════════
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（Issue #31）
// 2015-07-14 11:47 UTC EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish ~12,500 km（EnglishEnglish ~13,688 km）
// EnglishEnglishEnglishEnglish ~13.78 km/s，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish < 0.01°）
// ════════════════════════════════════════════════════════════════════
const NH_FLYBY_JD = 2457217.99;       // 2015-07-14 11:47 UTC
const NH_FLYBY_SPEED = 13.78;          // km/s EnglishEnglishEnglishEnglishEnglish
const NH_FLYBY_CLOSEST = 13688;        // km，EnglishEnglishEnglishEnglishEnglishEnglish

/** New Horizons EnglishEnglishEnglishEnglishEnglishEnglishEnglish（km，EnglishEnglish J2000）
 *  EnglishEnglishEnglishEnglish（±EnglishEnglish）EnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish/EnglishEnglish）。
 *  EnglishEnglishEnglishEnglishEnglishEnglish planetPosition('pluto', jdTT) EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。 */
export function newHorizonsPlutoRelativePosition(jdTT) {
  const dtSec = (jdTT - NH_FLYBY_JD) * 86400;
  // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）：lon≈286°, lat≈0°
  // New Horizons EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  const lon = 286 * DEG;
  const vx = Math.cos(lon), vy = Math.sin(lon);
  // EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）
  const ox = -vy, oy = vx;
  return {
    x: vx * NH_FLYBY_SPEED * dtSec + ox * NH_FLYBY_CLOSEST,
    y: vy * NH_FLYBY_SPEED * dtSec + oy * NH_FLYBY_CLOSEST,
    z: 0,
  };
}

/** EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
export const NH_FLYBY = {
  jdStart: NH_FLYBY_JD - 1.0,   // EnglishEnglishEnglish 1 EnglishEnglishEnglish
  jdEnd: NH_FLYBY_JD + 1.0,     // EnglishEnglishEnglish 1 EnglishEnglishEnglish
  jdClosest: NH_FLYBY_JD,
  closestApproachKm: NH_FLYBY_CLOSEST,
  speedKmS: NH_FLYBY_SPEED,
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish 2 EnglishEnglishEnglishEnglish ~60 EnglishEnglishEnglish
  recommendedRate: (2.0 * 86400) / 60,
};
