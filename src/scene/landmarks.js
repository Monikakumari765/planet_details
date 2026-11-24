// EnglishEnglishEnglishEnglish：Apollo EnglishEnglishEnglish（Issue #34）EnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish（Issue #35）。
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，1:1 EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）。
// LOD：EnglishEnglishEnglish billboard EnglishEnglish，EnglishEnglishEnglish 3D EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish（+Y=EnglishEnglish, +X=EnglishEnglishEnglishEnglishEnglish, EnglishEnglishEnglishEnglish），
//   English terrain.js HeightField.sampleMap EnglishEnglishEnglishEnglish：lon = atan2(-dir.z, dir.x)。

import * as THREE from 'three';

const DEG = Math.PI / 180;
const m = (v) => v * 0.001; // English→EnglishEnglish

// ── EnglishEnglishEnglishEnglish ──
// EnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）
// lat: EnglishEnglish（English），lon: EnglishEnglish（English，EnglishEnglishEnglishEnglish）
function latLonToDir(latDeg, lonDeg) {
  const lat = latDeg * DEG, lon = lonDeg * DEG;
  return new THREE.Vector3(
    Math.cos(lat) * Math.cos(lon),
    Math.sin(lat),
    -Math.cos(lat) * Math.sin(lon)
  );
}

// EnglishEnglishEnglish +Y EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish = EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
function alignToNormal(group, normal) {
  const up = new THREE.Vector3(0, 1, 0);
  group.quaternion.setFromUnitVectors(up, normal);
}

/**
 * English**EnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 *
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish"English，
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 */
function surfaceNormal(terrainMgr, id, dir, radiusKm) {
  const up = dir.clone().normalize();
  const helper = Math.abs(up.y) < 0.9
    ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const t1 = new THREE.Vector3().crossVectors(up, helper).normalize();
  const t2 = new THREE.Vector3().crossVectors(up, t1).normalize();
  const d = 4e-4;                      // EnglishEnglishEnglish（EnglishEnglishEnglishEnglish 0.7km）
  const h0 = terrainMgr.heightAt(id, up);
  const h1 = terrainMgr.heightAt(id, up.clone().addScaledVector(t1, d).normalize());
  const h2 = terrainMgr.heightAt(id, up.clone().addScaledVector(t2, d).normalize());
  const run = d * radiusKm;
  return new THREE.Vector3()
    .addScaledVector(t1, -(h1 - h0) / run)
    .addScaledVector(t2, -(h2 - h0) / run)
    .add(up)
    .normalize();
}

// ── Billboard EnglishEnglishEnglishEnglish ──
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
function makeBillboard(color) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const hex = '#' + color.toString(16).padStart(6, '0');
  // EnglishEnglishEnglish
  ctx.strokeStyle = hex;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(32, 6); ctx.lineTo(32, 58);
  ctx.moveTo(6, 32); ctx.lineTo(58, 32);
  ctx.stroke();
  // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.arc(32, 32, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = hex;
  ctx.lineWidth = 2;
  ctx.stroke();
  const tex = new THREE.CanvasTexture(c);
  return new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, transparent: true, opacity: 0.85,
    depthWrite: false, depthTest: true,
  }));
}

// ════════════════════════════════════════════════════════════════════
// Apollo EnglishEnglishEnglishEnglishEnglish（Issue #34）
// EnglishEnglishEnglishEnglish：LRO NAC EnglishEnglishEnglishEnglish（NASA PDS），EnglishEnglishEnglishEnglishEnglishEnglish
// ════════════════════════════════════════════════════════════════════
export const APOLLO_SITES = [
  {
    id: 'apollo11',
    nameEn: 'Apollo 11',
    latDeg: 0.6741, lonDeg: 23.4730,
    siteNameZh: 'EnglishEnglish', siteNameEn: 'Mare Tranquillitatis',
    date: '1969-07-20',
    crewZh: 'EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish、EnglishEnglishEnglish',
    descZh: 'EnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish："EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。"',
    facts: ['EnglishEnglish 21.6 EnglishEnglish', 'EnglishEnglish 21.5 kg EnglishEnglish', 'EnglishEnglishEnglishEnglish 2.7 EnglishEnglish'],
    hasRover: false,
  },
  {
    id: 'apollo12',
    nameEn: 'Apollo 12',
    latDeg: -3.0128, lonDeg: -23.4219,
    siteNameZh: 'EnglishEnglishEnglish', siteNameEn: 'Oceanus Procellarum',
    date: '1969-11-19',
    crewZh: 'EnglishEnglishEnglish、EnglishEnglish、EnglishEnglish',
    descZh: 'EnglishEnglishEnglishEnglishEnglish 1967 EnglishEnglishEnglishEnglishEnglishEnglishEnglish3EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
    facts: ['EnglishEnglish 31.5 EnglishEnglish', 'EnglishEnglish 34.4 kg EnglishEnglish', 'EnglishEnglishEnglishEnglishEnglish3English'],
    hasRover: false,
  },
  {
    id: 'apollo15',
    nameEn: 'Apollo 15',
    latDeg: 26.1324, lonDeg: 3.6330,
    siteNameZh: 'EnglishEnglishEnglishEnglishEnglish', siteNameEn: 'Hadley Rille',
    date: '1971-07-30',
    crewZh: 'EnglishEnglishEnglish、EnglishEnglishEnglish、EnglishEnglish',
    descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish"EnglishEnglishEnglish"（15415 EnglishEnglishEnglishEnglish，English 41 EnglishEnglish）。',
    facts: ['EnglishEnglish 66.9 EnglishEnglish', 'EnglishEnglish 77.3 kg EnglishEnglish', 'EnglishEnglishEnglishEnglishEnglish 27.9 km'],
    hasRover: true,
  },
  {
    id: 'apollo16',
    nameEn: 'Apollo 16',
    latDeg: -8.9734, lonDeg: 15.5008,
    siteNameZh: 'EnglishEnglishEnglishEnglishEnglish', siteNameEn: 'Descartes Highlands',
    date: '1972-04-21',
    crewZh: 'English、EnglishEnglish、EnglishEnglishEnglish',
    descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
    facts: ['EnglishEnglish 71.0 EnglishEnglish', 'EnglishEnglish 95.7 kg EnglishEnglish', 'EnglishEnglishEnglishEnglishEnglish 26.7 km'],
    hasRover: true,
  },
  {
    id: 'apollo17',
    nameEn: 'Apollo 17',
    latDeg: 20.1911, lonDeg: 30.7723,
    siteNameZh: 'EnglishEnglishEnglish-EnglishEnglishEnglishEnglish', siteNameEn: 'Taurus-Littrow Valley',
    date: '1972-12-11',
    crewZh: 'EnglishEnglishEnglish、EnglishEnglishEnglish、EnglishEnglishEnglish',
    descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
    facts: ['EnglishEnglish 75.0 EnglishEnglish', 'EnglishEnglish 110.5 kg EnglishEnglish', 'EnglishEnglishEnglishEnglishEnglish 35.7 km'],
    hasRover: true,
  },
];

// ── Apollo 3D EnglishEnglishEnglishEnglishEnglish ──
// LM EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish + 4 EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
// EnglishEnglishEnglishEnglish：y=0 EnglishEnglishEnglish（EnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
function createLMDescentStage() {
  const group = new THREE.Group();
  const gold = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.4 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.6, roughness: 0.5 });

  // EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglish ~1.8m
  const stage = new THREE.Mesh(
    new THREE.CylinderGeometry(m(4.3), m(4.3), m(2.3), 8), gold);
  stage.position.y = m(2.95); // 1.8m(EnglishEnglish) + 2.3m/2(EnglishEnglishEnglishEnglish)
  group.add(stage);

  // 4 EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 8;
    const hip = new THREE.Vector3(
      Math.cos(angle) * m(3.0), m(1.8), Math.sin(angle) * m(3.0));
    const foot = new THREE.Vector3(
      Math.cos(angle) * m(4.5), 0, Math.sin(angle) * m(4.5));
    const dir = foot.clone().sub(hip);
    const len = dir.length();
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(m(0.08), m(0.08), len, 4), dark);
    leg.position.copy(hip).addScaledVector(dir, 0.5);
    // EnglishEnglishEnglishEnglish Y EnglishEnglishEnglishEnglishEnglish
    leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    group.add(leg);
    // EnglishEnglishEnglishEnglish
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(m(0.30), m(0.30), m(0.05), 8), dark);
    pad.position.copy(foot);
    group.add(pad);
  }

  return group;
}

// EnglishEnglish：EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
function createFlag() {
  const group = new THREE.Group();
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.7, roughness: 0.4 });
  const flagMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.8, side: THREE.DoubleSide });

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(m(0.02), m(0.02), m(2.4), 4), poleMat);
  pole.position.y = m(1.2);
  group.add(pole);

  // EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglish"EnglishEnglish）
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(m(1.5), m(0.9)), flagMat);
  flag.position.set(m(0.75), m(1.9), 0);
  group.add(flag);

  return group;
}

// EnglishEnglishEnglish（LRV）：EnglishEnglishEnglish 15/16/17 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
function createLRV() {
  const group = new THREE.Group();
  const gold = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.4 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.6, roughness: 0.5 });

  // EnglishEnglish
  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(m(3.0), m(0.3), m(1.5)), gold);
  chassis.position.y = m(0.8);
  group.add(chassis);

  // EnglishEnglishEnglishEnglish
  for (const z of [-m(0.4), m(0.4)]) {
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(m(0.8), m(0.5), m(0.5)), dark);
    seat.position.set(0, m(1.2), z);
    group.add(seat);
  }

  // 4 EnglishEnglishEnglish（EnglishEnglishEnglishEnglish）
  for (let i = 0; i < 4; i++) {
    const wx = (i < 2 ? -1 : 1) * m(1.2);
    const wz = (i % 2 === 0 ? -1 : 1) * m(0.6);
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(m(0.4), m(0.4), m(0.3), 8), dark);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, m(0.4), wz);
    group.add(wheel);
  }

  return group;
}

// EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
function createFootprints() {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({
    color: 0x666666, transparent: true, opacity: 0.4, depthWrite: false,
  });
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  for (let i = 0; i < 12; i++) {
    const fp = new THREE.Mesh(
      new THREE.CircleGeometry(m(0.15), 6), mat);
    fp.rotation.x = -Math.PI / 2; // EnglishEnglishEnglishEnglishEnglish
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish Math.random()：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    // English RockField English"EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
    const j1 = ((Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1 + 1) % 1;
    const j2 = ((Math.sin(i * 39.3468 + 11.135) * 24634.6345) % 1 + 1) % 1;
    fp.position.set(
      m(1) + i * m(0.4) + (j1 - 0.5) * m(0.2),
      m(0.01), // 1cm EnglishEnglishEnglish z-fight
      (i % 2 === 0 ? 1 : -1) * m(0.15) + (j2 - 0.5) * m(0.1)
    );
    group.add(fp);
  }
  return group;
}

// ── Apollo EnglishEnglishEnglishEnglishEnglishEnglish ──
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。EnglishEnglish { entries, group, update }
// update(camRelPosKm): LOD EnglishEnglish，camRelPosKm EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
export function createApolloLandmarks(scene, terrainMgr) {
  const moonMesh = terrainMgr.meshOf('moon');
  const group = new THREE.Group();
  moonMesh.add(group);

  const entries = APOLLO_SITES.map((site) => {
    const dir = latLonToDir(site.latDeg, site.lonDeg);
    const h = terrainMgr.heightAt('moon', dir);
    const pos = dir.clone().multiplyScalar(h + m(0.05)); // 5cm EnglishEnglishEnglish z-fight

    const siteGroup = new THREE.Group();
    siteGroup.position.copy(pos);
    alignToNormal(siteGroup, surfaceNormal(terrainMgr, 'moon', dir, 1737.4));

    // 3D EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）
    const model = new THREE.Group();
    model.add(createLMDescentStage());
    const flag = createFlag();
    flag.position.set(m(4), 0, m(1));
    model.add(flag);
    if (site.hasRover) {
      const lrv = createLRV();
      lrv.position.set(m(8), 0, m(2));
      model.add(lrv);
    }
    model.add(createFootprints());
    model.visible = false; // EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish
    siteGroup.add(model);

    // Billboard（EnglishEnglishEnglishEnglishEnglish）
    const billboard = makeBillboard(0xffaa44);
    billboard.scale.setScalar(m(15));
    siteGroup.add(billboard);

    group.add(siteGroup);

    return { site, group: siteGroup, model, billboard, dir, posLocal: pos };
  });

  // LOD EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish billboard / 3D EnglishEnglish
  // camRelPosKm: EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（Vector3，km）
  function update(camRelPosKm) {
    if (!camRelPosKm) return;
    for (const e of entries) {
      const h = terrainMgr.heightAt('moon', e.dir);
      e.posLocal.copy(e.dir).multiplyScalar(h + m(0.05));
      e.group.position.copy(e.posLocal);
      const dx = camRelPosKm.x - e.posLocal.x;
      const dy = camRelPosKm.y - e.posLocal.y;
      const dz = camRelPosKm.z - e.posLocal.z;
      const dist = Math.hypot(dx, dy, dz);
      // 3D EnglishEnglish：5km EnglishEnglishEnglish，10km→5km EnglishEnglish
      const modelFade = THREE.MathUtils.clamp((10 - dist) / 5, 0, 1);
      e.model.visible = modelFade > 0.01;
      // Billboard：1km EnglishEnglishEnglishEnglishEnglish，EnglishEnglish ~EnglishEnglishEnglishEnglishEnglishEnglish
      e.billboard.visible = dist > 0.5;
      const bbScale = THREE.MathUtils.clamp(dist * 0.008, m(15), m(200));
      e.billboard.scale.setScalar(bbScale);
    }
  }

  return { entries, group, update };
}

// ════════════════════════════════════════════════════════════════════
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（Issue #35）
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（NASA/JPL EnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglish
// ════════════════════════════════════════════════════════════════════
export const ROVER_SITES = [
  {
    id: 'perseverance',
    nameEn: 'Perseverance',
    latDeg: 18.4447, lonDeg: 77.4508,
    siteNameZh: 'EnglishEnglishEnglishEnglishEnglishEnglish', siteNameEn: 'Jezero Crater',
    landingDate: '2021-02-18',
    agency: 'NASA',
    descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
    roverType: 'nuclear', // EnglishEnglishEnglish（MMRTG）
    path: [
      { latDeg: 18.4447, lonDeg: 77.4508, date: '2021-02-18',
        titleZh: 'EnglishEnglish', descZh: 'Octavia E. Butler EnglishEnglishEnglish， Autonomous Landing EnglishEnglish < 10m。' },
      { latDeg: 18.4230, lonDeg: 77.4510, date: '2021-06-01',
        titleZh: 'Séítah EnglishEnglish', descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，English SuperCam EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { latDeg: 18.4000, lonDeg: 77.4400, date: '2022-04-01',
        titleZh: 'EnglishEnglishEnglishEnglishEnglish', descZh: 'EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { latDeg: 18.3700, lonDeg: 77.4200, date: '2023-02-01',
        titleZh: 'Three Forks', descZh: 'EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish Mars Sample Return EnglishEnglish。' },
      { latDeg: 18.3500, lonDeg: 77.4000, date: '2024-06-01',
        titleZh: 'Bright Angel', descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
    ],
  },
  {
    id: 'curiosity',
    nameEn: 'Curiosity',
    latDeg: -4.5895, lonDeg: 137.4417,
    siteNameZh: 'EnglishEnglishEnglishEnglishEnglish', siteNameEn: 'Gale Crater',
    landingDate: '2012-08-06',
    agency: 'NASA',
    descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish（Aeolis Mons）EnglishEnglishEnglishEnglishEnglishEnglish。',
    roverType: 'nuclear',
    path: [
      { latDeg: -4.5895, lonDeg: 137.4417, date: '2012-08-06',
        titleZh: 'EnglishEnglish', descZh: 'Bradbury Landing，"EnglishEnglishEnglishEnglishEnglish" Entry-Descent-Landing EnglishEnglish。' },
      { latDeg: -4.5900, lonDeg: 137.4400, date: '2013-03-01',
        titleZh: 'Yellowknife Bay', descZh: 'EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish pH EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。' },
      { latDeg: -4.5900, lonDeg: 137.3800, date: '2014-09-01',
        titleZh: 'Pahrump Hills', descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { latDeg: -4.7500, lonDeg: 137.3000, date: '2016-09-01',
        titleZh: 'Murray Buttes', descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglish Murray EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishtes EnglishEnglish。' },
      { latDeg: -4.8600, lonDeg: 137.2700, date: '2017-09-01',
        titleZh: 'Vera Rubin Ridge', descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { latDeg: -4.9200, lonDeg: 137.3000, date: '2019-05-01',
        titleZh: 'Glen Torridon', descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish、EnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { latDeg: -5.0000, lonDeg: 137.3500, date: '2024-06-01',
        titleZh: 'Marker Band Valley', descZh: 'EnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
    ],
  },
  {
    id: 'zhurong',
    nameEn: 'Zhurong',
    latDeg: 25.066, lonDeg: 109.926,
    siteNameZh: 'EnglishEnglishEnglishEnglishEnglish', siteNameEn: 'Utopia Planitia',
    landingDate: '2021-05-15',
    agency: 'CNSA',
    descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
    roverType: 'solar',
    path: [
      { latDeg: 25.066, lonDeg: 109.926, date: '2021-05-15',
        titleZh: 'EnglishEnglish', descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { latDeg: 25.055, lonDeg: 109.920, date: '2021-07-01',
        titleZh: 'EnglishEnglishEnglishEnglish', descZh: 'EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { latDeg: 25.050, lonDeg: 109.915, date: '2021-09-01',
        titleZh: 'EnglishEnglishEnglishEnglishEnglishEnglish', descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 40m EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { latDeg: 25.045, lonDeg: 109.910, date: '2022-05-01',
        titleZh: 'EnglishEnglishEnglishEnglish', descZh: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 35m EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
    ],
  },
  {
    id: 'opportunity',
    nameEn: 'Opportunity',
    latDeg: -1.9462, lonDeg: 354.4734,
    siteNameZh: 'EnglishEnglishEnglishEnglishEnglish', siteNameEn: 'Meridiani Planum',
    landingDate: '2004-01-25',
    agency: 'NASA',
    descZh: 'EnglishEnglish 90 EnglishEnglishEnglish，EnglishEnglishEnglishEnglish 14 English，EnglishEnglish 45 km。EnglishEnglishEnglishEnglishEnglish"EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish。',
    roverType: 'solar',
    path: [
      { latDeg: -1.9462, lonDeg: 354.4734, date: '2004-01-25',
        titleZh: 'EnglishEnglish', descZh: 'Eagle Crater EnglishEnglishEnglish，"hole in one" EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { latDeg: -1.9500, lonDeg: 354.3500, date: '2004-04-01',
        titleZh: 'Endurance Crater', descZh: 'EnglishEnglishEnglishEnglishEnglish"EnglishEnglish"EnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { latDeg: -2.0500, lonDeg: 354.2500, date: '2007-09-01',
        titleZh: 'Victoria Crater', descZh: 'EnglishEnglishEnglishEnglish 750m EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。' },
      { latDeg: -1.9500, lonDeg: 354.5000, date: '2011-08-01',
        titleZh: 'Endeavour Crater',
        descZh: 'EnglishEnglish 22km EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
      { latDeg: -1.9500, lonDeg: 354.5500, date: '2018-06-01',
        titleZh: 'Perseverance Valley', descZh: 'EnglishEnglishEnglishEnglish。2018 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish。EnglishEnglish 45.16 km。' },
    ],
  },
];

// ── EnglishEnglishEnglish 3D EnglishEnglishEnglishEnglishEnglish ──
// EnglishEnglishEnglishEnglishEnglish：EnglishEnglish + EnglishEnglish + 6 English（EnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglish）
function createNuclearRover() {
  const group = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.7, roughness: 0.4 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.6, roughness: 0.5 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.4 });

  // EnglishEnglish（EnglishEnglishEnglishEnglish）
  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(m(2.8), m(1.2), m(1.8)), body);
  chassis.position.y = m(1.0);
  group.add(chassis);

  // EnglishEnglishEnglishEnglish（Mastcam/ZCam）
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(m(0.05), m(0.05), m(1.5), 6), dark);
  mast.position.set(0, m(2.3), 0);
  group.add(mast);
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish
  const camHead = new THREE.Mesh(
    new THREE.BoxGeometry(m(0.4), m(0.3), m(0.3)), body);
  camHead.position.set(0, m(3.0), 0);
  group.add(camHead);

  // 6 EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  for (let i = 0; i < 6; i++) {
    const wx = (i < 3 ? -1 : 1) * m(1.3);
    const wz = ((i % 3) - 1) * m(0.7);
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(m(0.35), m(0.35), m(0.25), 10), dark);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, m(0.35), wz);
    group.add(wheel);
  }

  // RTG（EnglishEnglishEnglishEnglish，EnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglish）
  const rtg = new THREE.Mesh(
    new THREE.CylinderGeometry(m(0.25), m(0.25), m(0.6), 8), gold);
  rtg.rotation.z = Math.PI / 2;
  rtg.position.set(m(1.7), m(1.0), 0);
  group.add(rtg);

  // EnglishEnglishEnglish
  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(m(0.04), m(0.04), m(1.5), 6), dark);
  arm.position.set(-m(1.0), m(1.5), m(0.5));
  arm.rotation.z = Math.PI / 4;
  group.add(arm);

  return group;
}

// EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglish）
function createSolarRover() {
  const group = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.7, roughness: 0.4 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.6, roughness: 0.5 });
  const panel = new THREE.MeshStandardMaterial({ color: 0x1a3a6a, metalness: 0.3, roughness: 0.2 });

  // EnglishEnglish
  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(m(1.5), m(0.6), m(1.2)), body);
  chassis.position.y = m(0.6);
  group.add(chassis);

  // EnglishEnglishEnglishEnglish（EnglishEnglishEnglish）
  for (const x of [-m(0.8), 0, m(0.8)]) {
    const sp = new THREE.Mesh(
      new THREE.BoxGeometry(m(0.7), m(0.02), m(1.0)), panel);
    sp.position.set(x, m(1.0), 0);
    group.add(sp);
  }

  // EnglishEnglish
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(m(0.03), m(0.03), m(1.0), 6), dark);
  mast.position.set(0, m(1.5), 0);
  group.add(mast);
  const camHead = new THREE.Mesh(
    new THREE.BoxGeometry(m(0.2), m(0.2), m(0.2)), body);
  camHead.position.set(0, m(2.0), 0);
  group.add(camHead);

  // 6 EnglishEnglishEnglish
  for (let i = 0; i < 6; i++) {
    const wx = (i < 3 ? -1 : 1) * m(0.7);
    const wz = ((i % 3) - 1) * m(0.4);
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(m(0.20), m(0.20), m(0.15), 8), dark);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, m(0.20), wz);
    group.add(wheel);
  }

  return group;
}

// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
function createRoverModel(site) {
  if (site.roverType === 'nuclear') return createNuclearRover();
  return createSolarRover();
}

// EnglishEnglishEnglishEnglishEnglish
function createPathLine(waypoints, terrainMgr) {
  const points = [];
  for (const wp of waypoints) {
    const dir = latLonToDir(wp.latDeg, wp.lonDeg);
    const h = terrainMgr.heightAt('mars', dir);
    points.push(dir.clone().multiplyScalar(h + m(0.3))); // 30cm EnglishEnglish
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({
    color: 0xff6600, transparent: true, opacity: 0.7, fog: true,
  });
  return new THREE.Line(geo, mat);
}

// EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish）
function createWaypointMarker() {
  const geo = new THREE.OctahedronGeometry(m(0.5), 0);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  return new THREE.Mesh(geo, mat);
}

// ── EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ──
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。EnglishEnglish { entries, group, update }
// update(camRelPosKm): LOD EnglishEnglish，camRelPosKm EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
export function createRoverSites(scene, terrainMgr) {
  const marsMesh = terrainMgr.meshOf('mars');
  const group = new THREE.Group();
  marsMesh.add(group);

  const entries = ROVER_SITES.map((site) => {
    const dir = latLonToDir(site.latDeg, site.lonDeg);
    const h = terrainMgr.heightAt('mars', dir);
    const pos = dir.clone().multiplyScalar(h + m(0.05));

    const siteGroup = new THREE.Group();
    siteGroup.position.copy(pos);
    alignToNormal(siteGroup, surfaceNormal(terrainMgr, 'mars', dir, 3389.5));

    // EnglishEnglishEnglish 3D EnglishEnglish
    const model = createRoverModel(site);
    model.visible = false;
    siteGroup.add(model);

    // Billboard
    const billboard = makeBillboard(0xff6600);
    billboard.scale.setScalar(m(10));
    siteGroup.add(billboard);

    group.add(siteGroup);

    // EnglishEnglishEnglishEnglish（EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    const pathGroup = new THREE.Group();
    const pathLine = createPathLine(site.path, terrainMgr);
    pathGroup.add(pathLine);

    // EnglishEnglishEnglishEnglish
    const waypointMeshes = [];
    for (const wp of site.path) {
      const wpDir = latLonToDir(wp.latDeg, wp.lonDeg);
      const wpH = terrainMgr.heightAt('mars', wpDir);
      const wpPos = wpDir.clone().multiplyScalar(wpH + m(0.5));
      const marker = createWaypointMarker();
      marker.position.copy(wpPos);
      marker.userData.waypoint = wp; // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      pathGroup.add(marker);
      waypointMeshes.push(marker);
    }

    group.add(pathGroup);

    return {
      site, group: siteGroup, model, billboard, dir, posLocal: pos,
      pathGroup, pathLine, waypointMeshes,
    };
  });

  // LOD EnglishEnglish
  function update(camRelPosKm) {
    if (!camRelPosKm) return;
    for (const e of entries) {
      const field = terrainMgr.field('mars');
      const h = field.height(e.dir);
      e.posLocal.copy(e.dir).multiplyScalar(h + m(0.05));
      e.group.position.copy(e.posLocal);
      const revision = field.demSource?.revision ?? 0;
      if (e.demRevision !== revision) {
        const positions = e.pathLine.geometry.attributes.position;
        for (let i = 0; i < e.site.path.length; i++) {
          const wp = e.site.path[i], dir = latLonToDir(wp.latDeg, wp.lonDeg);
          const radius = field.height(dir);
          positions.setXYZ(i, dir.x * (radius + m(0.3)), dir.y * (radius + m(0.3)), dir.z * (radius + m(0.3)));
          e.waypointMeshes[i].position.copy(dir).multiplyScalar(radius + m(0.5));
        }
        positions.needsUpdate = true;
        e.pathLine.geometry.computeBoundingSphere();
        e.demRevision = revision;
      }
      const dx = camRelPosKm.x - e.posLocal.x;
      const dy = camRelPosKm.y - e.posLocal.y;
      const dz = camRelPosKm.z - e.posLocal.z;
      const dist = Math.hypot(dx, dy, dz);
      // 3D EnglishEnglish：3km EnglishEnglishEnglish，5km→3km EnglishEnglish
      const modelFade = THREE.MathUtils.clamp((5 - dist) / 2, 0, 1);
      e.model.visible = modelFade > 0.01;
      // Billboard：0.5km EnglishEnglishEnglish
      e.billboard.visible = dist > 0.3;
      const bbScale = THREE.MathUtils.clamp(dist * 0.008, m(10), m(150));
      e.billboard.scale.setScalar(bbScale);
      // EnglishEnglishEnglish：50km EnglishEnglishEnglish
      e.pathGroup.visible = dist < 50;
      // EnglishEnglishEnglishEnglish：20km EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish
      const wpScale = THREE.MathUtils.clamp(dist * 0.02, m(0.5), m(5));
      for (const wp of e.waypointMeshes) {
        wp.scale.setScalar(wpScale);
        wp.visible = dist < 20;
      }
    }
  }

  return { entries, group, update };
}
