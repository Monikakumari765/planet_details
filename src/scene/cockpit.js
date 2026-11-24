// EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglishEnglishEnglish：EnglishEnglish"EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
// "EnglishEnglish"。EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglishEnglish：**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglish main.js EnglishEnglishEnglishEnglish
// EnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish
// 2.2R English near=5849 km），EnglishEnglishEnglish 0.6 m EnglishEnglishEnglishEnglishEnglishEnglishEnglish。

import * as THREE from 'three';

/** EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）。
 *  EnglishEnglish**EnglishEnglishEnglishEnglishEnglish FOV EnglishEnglishEnglishEnglishEnglishEnglish**——EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
 *  EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
 *  Z EnglishEnglish 0.62m：EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。 */
export function createCockpit() {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x565d68, roughness: 0.55, metalness: 0.35, emissive: 0x14181d, fog: false,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xb8bec8, roughness: 0.3, metalness: 0.9, fog: false,
  });
  const Z = -0.62;
  const mk = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  const top = mk(1, 0.05, 0.09, mat);
  const bottom = mk(1, 0.20, 0.14, mat);
  const left = mk(0.06, 1, 0.09, mat);
  const right = mk(0.06, 1, 0.09, mat);
  const trimT = mk(1, 0.010, 0.010, trimMat);
  const trimL = mk(0.010, 1, 0.010, trimMat);
  const trimR = mk(0.010, 1, 0.010, trimMat);
  const glow = new THREE.MeshBasicMaterial({ color: 0x2f6f8f, fog: false });
  const panels = [0, 1, 2].map(() => mk(0.16, 0.026, 0.006, glow));
  group.add(top, bottom, left, right, trimT, trimL, trimR, ...panels);

  /** EnglishEnglishEnglish FOV/EnglishEnglishEnglishEnglishEnglish。fovV EnglishEnglishEnglishEnglishEnglishEnglish（English）。 */
  group.userData.layout = (fovV, aspect) => {
    const halfH = Math.tan(fovV * Math.PI / 360) * -Z;   // EnglishEnglishEnglish Z EnglishEnglishEnglishEnglish
    const halfW = halfH * aspect;
    // English**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。0.93 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    const oy = halfH * 0.93, ox = halfW * 0.93;
    top.position.set(0, oy, Z); top.scale.x = ox * 2 + 0.20;
    bottom.position.set(0, -oy - 0.10, Z); bottom.scale.x = ox * 2 + 0.20;
    left.position.set(-ox, 0, Z); left.scale.y = oy * 2 + 0.30;
    right.position.set(ox, 0, Z); right.scale.y = oy * 2 + 0.30;
    trimT.position.set(0, oy - 0.030, Z + 0.006); trimT.scale.x = ox * 2 + 0.04;
    trimL.position.set(-ox + 0.030, 0, Z + 0.006); trimL.scale.y = oy * 2 + 0.04;
    trimR.position.set(ox - 0.030, 0, Z + 0.006); trimR.scale.y = oy * 2 + 0.04;
    panels.forEach((p, i) => p.position.set(-0.24 + i * 0.24, -oy - 0.045, Z + 0.004));
  };
  group.userData.layout(58, 1.6);
  group.renderOrder = 2;
  group.userData.isCockpit = true;
  return group;
}

/** EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）。EnglishEnglishEnglishEnglishEnglishEnglish：English ~9m EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglish + EnglishEnglish。 */
export function createShipModel() {
  const group = new THREE.Group();
  const hull = new THREE.MeshStandardMaterial({
    color: 0xb9bec6, roughness: 0.38, metalness: 0.85, fog: false,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x33373d, roughness: 0.55, metalness: 0.6, fog: false,
  });
  // EnglishEnglish：EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  const bodyGeo = new THREE.OctahedronGeometry(0.55, 0);
  bodyGeo.scale(1.0, 1.0, 4.2);
  group.add(new THREE.Mesh(bodyGeo, hull));
  // EnglishEnglish/EnglishEnglishEnglish
  const wing = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.06, 1.1), dark);
  wing.position.set(0, -0.05, 0.6);
  group.add(wing);
  // EnglishEnglishEnglishEnglishEnglish
  for (const x of [-0.42, 0.42]) {
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 0.9, 12), dark);
    eng.rotation.x = Math.PI / 2;
    eng.position.set(x, -0.02, 2.4);
    group.add(eng);
  }
  // EnglishEnglish：EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish（English update EnglishEnglish）
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0x7fc8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending,
    depthWrite: false, fog: false,
  });
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.6, 10, 1, true), flameMat);
  flame.rotation.x = -Math.PI / 2;
  flame.position.set(0, 0, 3.3);
  group.add(flame);
  group.scale.setScalar(1.6);   // EnglishEnglishEnglishEnglishEnglish ~14m，EnglishEnglishEnglishEnglishEnglish
  group.userData.isShipModel = true;
  group.userData.flame = flame;
  return group;
}

/**
 * EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）。
 *
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"EnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 * EnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 */
export function createHelmet() {
  const group = new THREE.Group();
  const shell = new THREE.MeshStandardMaterial({
    color: 0x7a828c, roughness: 0.8, metalness: 0.12, emissive: 0x0d1015, fog: false,
    side: THREE.DoubleSide,
  });
  const trim = new THREE.MeshStandardMaterial({
    color: 0xd8dde4, roughness: 0.4, metalness: 0.45, fog: false,
  });
  const Z = -0.42;
  const mk = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  const top = mk(1, 0.03, 0.05, trim);
  const bottom = mk(1, 0.06, 0.06, trim);
  const left = mk(0.035, 1, 0.05, trim);
  const right = mk(0.035, 1, 0.05, trim);
  // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish"EnglishEnglishEnglish"EnglishEnglishEnglish
  const wallL = mk(0.25, 1.4, 0.02, shell);
  const wallR = mk(0.25, 1.4, 0.02, shell);
  const wallB = mk(1.4, 0.22, 0.02, shell);
  group.add(top, bottom, left, right, wallL, wallR, wallB);

  // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish，EnglishEnglish、EnglishEnglishEnglishEnglishEnglish
  const glove = new THREE.MeshStandardMaterial({
    color: 0x9aa0a8, roughness: 0.85, metalness: 0.05, fog: false,
  });
  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), glove);
  const handR = handL.clone();
  group.add(handL, handR);

  group.userData.layout = (fovV, aspect) => {
    const halfH = Math.tan(fovV * Math.PI / 360) * -Z;
    const halfW = halfH * aspect;
    const oy = halfH * 0.90, ox = halfW * 0.94;
    top.position.set(0, oy, Z); top.scale.x = ox * 2 + 0.10;
    bottom.position.set(0, -oy, Z); bottom.scale.x = ox * 2 + 0.10;
    left.position.set(-ox, 0, Z); left.scale.y = oy * 2 + 0.10;
    right.position.set(ox, 0, Z); right.scale.y = oy * 2 + 0.10;
    wallL.position.set(-halfW - 0.10, 0, Z + 0.02);
    wallR.position.set(halfW + 0.10, 0, Z + 0.02);
    wallB.position.set(0, -halfH - 0.10, Z + 0.02);
    handL.position.set(-halfW * 0.62, -halfH * 0.72, Z + 0.06);
    handR.position.set(halfW * 0.62, -halfH * 0.72, Z + 0.06);
  };
  group.userData.layout(58, 1.6);
  group.renderOrder = 2;
  group.userData.isHelmet = true;
  return group;
}

// ── EnglishEnglishEnglishEnglish EVA English（EnglishEnglishEnglishEnglishEnglishEnglish）────────────────────────────────────────
//
// EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglish
// EnglishEnglish**——EnglishEnglishEnglishEnglish CSS EnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish
// EnglishEnglish"：EnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglishEnglishEnglishEnglishEnglish（overlayScene）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish
// EnglishEnglishEnglish（EnglishEnglishEnglish ship.quat EnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglish**English FOV EnglishEnglish**English：EnglishEnglish FOV/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
// EnglishEnglishEnglishEnglish layout(fov, aspect) EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
export function createEvaSuit() {
  const root = new THREE.Group();
  const fabric = new THREE.MeshStandardMaterial({ color: 0xdfe3e8, roughness: 0.82, metalness: 0.04, fog: false });
  const glove = new THREE.MeshStandardMaterial({ color: 0x39404a, roughness: 0.5, metalness: 0.18, fog: false });
  const accent = new THREE.MeshStandardMaterial({ color: 0xd8802a, roughness: 0.55, metalness: 0.12, fog: false });

  const limb = (a, b, r, mat) => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const m = new THREE.Mesh(
      new THREE.CapsuleGeometry(r, Math.max(len - 2 * r, 0.002), 5, 12), mat);
    m.position.copy(a).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return m;
  };

  // EnglishEnglishEnglish（EnglishEnglishEnglishEnglish）：-Z EnglishEnglishEnglishEnglish，+Y English。EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish。
  // EnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglish**EnglishEnglish：fov 58° English，EnglishEnglish z EnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // y = -z·tan(29°) ≈ -0.554z。EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish 0.5m）EnglishEnglishEnglishEnglishEnglishEnglishEnglish，
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglish，
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  const JOINTS = {
    shoulder: (s) => new THREE.Vector3(s * 0.24, -0.30, 0.12),
    elbow: (s) => new THREE.Vector3(s * 0.30, -0.26, -0.14),
    wrist: (s) => new THREE.Vector3(s * 0.27, -0.21, -0.40),
  };
  const arms = [];
  for (const s of [-1, 1]) {
    const arm = new THREE.Group();
    const sh = JOINTS.shoulder(s), el = JOINTS.elbow(s), wr = JOINTS.wrist(s);
    arm.add(limb(sh, el, 0.068, fabric));
    arm.add(limb(el, wr, 0.055, fabric));
    // EnglishEnglish：EMU EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish"EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglish
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.011, 6, 16), accent);
    ring.position.copy(wr);
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), el.clone().sub(wr).normalize());
    arm.add(ring);
    // EnglishEnglish：EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    const tip = new THREE.Vector3(s * 0.22, -0.155, -0.60);
    const g = new THREE.Mesh(new THREE.CapsuleGeometry(0.050, 0.11, 5, 12), glove);
    const gd = tip.clone().sub(wr).normalize();
    g.position.copy(wr).addScaledVector(gd, 0.075);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), gd);
    arm.add(g);
    root.add(arm);
    arms.push({ arm, base: arm.position.clone(), s });
  }

  let phase = 0, bob = 0;
  /** dt: English；speedKmS: EnglishEnglishEnglishEnglish（km/s）；walking: EnglishEnglishEnglishEnglishEnglishEnglishEnglish；submerged: EnglishEnglishEnglishEnglishEnglish */
  root.userData.update = (dt, speedKmS = 0, walking = false, submerged = false) => {
    // EnglishEnglishEnglish audio.js EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish ~1.2Hz，EnglishEnglish ~2.5Hz），EnglishEnglishEnglishEnglishEnglishEnglishEnglish
    const speedNorm = Math.min(speedKmS / 0.009, 1);
    const freq = walking ? 1.2 + speedNorm * 1.3 : 0.22;   // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    phase += dt * freq * Math.PI * 2;
    const amp = walking ? 0.010 + speedNorm * 0.010 : 0.0016;
    bob += ((walking ? 1 : 0) - bob) * Math.min(dt * 3, 1);
    for (const { arm, base, s } of arms) {
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish，EnglishEnglishEnglish π
      const sw = Math.sin(phase + (s > 0 ? Math.PI : 0));
      arm.position.set(
        base.x + sw * amp * 0.5 * bob,
        base.y + Math.abs(sw) * amp * 0.7 * bob,
        base.z - sw * amp * 2.2 * bob);
      arm.rotation.x = sw * 0.05 * bob;
      arm.rotation.z = -s * (0.02 + 0.03 * bob);
    }
    // EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglish），EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    root.position.y = submerged ? Math.sin(phase * 0.35) * 0.006 : 0;
    root.visible = true;
  };

  /** EnglishEnglishEnglish FOV/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish） */
  root.userData.layout = (fov, aspect) => {
    const halfH = Math.tan((fov * Math.PI / 180) / 2);
    const k = THREE.MathUtils.clamp(halfH / Math.tan((58 * Math.PI / 180) / 2), 0.7, 1.5);
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish
    const ax = Math.min(Math.max(aspect / 1.7, 0.85), 1.35);
    for (const { arm, base } of arms) {
      arm.position.set(base.x * ax, base.y * k, base.z * k);
    }
  };

  // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // EnglishEnglish。0.82 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  root.scale.setScalar(0.82);
  root.userData.layout(58, 1.7);
  return root;
}
