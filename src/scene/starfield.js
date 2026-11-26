// EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）+ EnglishEnglishEnglishEnglishEnglishEnglish（BSC5，9096 English）。
// EnglishEnglishEnglishEnglishEnglish 3D EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（R11）。

import * as THREE from 'three';
import { raDecToWorld, LY_KM } from '../config.js';
import { bvToRgb, magToDisplayIntensity } from '../astro/starCatalog.js';

const DEG = Math.PI / 180;
// km，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish，EnglishEnglishEnglish）。
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish [EnglishEnglishEnglish, EnglishEnglishEnglish] EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// English 9e14 km（EnglishEnglishEnglish camera.far=1e15 English 90%）——English"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"，EnglishEnglishEnglishEnglishEnglishEnglish
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish 1e10 km）EnglishEnglish
// EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。9e14 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish(94ly≈8.89e14 km)，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// English sizeAttenuation:false + EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
const SKY_R = 9e14;
export { SKY_R };

/**
 * EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish，u=EnglishEnglish、v=EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
 * EnglishEnglish = EnglishEnglishEnglishEnglishEnglishEnglishEnglish × EnglishEnglishEnglishEnglishEnglishEnglish × EnglishEnglishEnglishEnglish × EnglishEnglishEnglish。
 * EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 */
function makeMilkyWayTexture() {
  if (typeof document === 'undefined') return null;
  // 2048×1024：1024×512 EnglishEnglishEnglishEnglishEnglishEnglish 0.35°，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // （EnglishEnglish earth-night EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
  const W = 2048, H = 1024;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const img = g.createImageData(W, H);
  const d = img.data;
  // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  let seed = 20240611;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const angDiff = (a, b) => { let x = (a - b) % 360; if (x > 180) x -= 360; if (x < -180) x += 360; return x; };
  for (let y = 0; y < H; y++) {
    const b = (0.5 - y / H) * 180;               // EnglishEnglish −90..+90
    for (let x = 0; x < W; x++) {
      const l = x / W * 360;                     // EnglishEnglish 0..360
      // EnglishEnglish：EnglishEnglishEnglishEnglish 7°（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      // EnglishEnglish：EnglishEnglish（English、English）+ EnglishEnglish（English、English）——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      let I = 0.40 * Math.exp(-Math.abs(b) / 9) + 0.12 * Math.exp(-Math.abs(b) / 30);
      // EnglishEnglishEnglishEnglish（l≈0）EnglishEnglishEnglishEnglishEnglishEnglish
      const dl = angDiff(l, 0);
      I *= 1 + 1.9 * Math.exp(-(dl * dl) / (52 * 52));
      // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish 2–4° EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      const dust = Math.exp(-(((b + 3.0) / 4.2) ** 2)) * (0.45 + 0.55 * (Math.sin(l * 0.09 + 1.3) ** 2));
      I *= 1 - 0.62 * dust;
      // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish
      // EnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglish；
      // EnglishEnglishEnglish fBm → EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglish
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglish/EnglishEnglishEnglish），English"EnglishEnglish"EnglishEnglishEnglishEnglish。
      // 这里只保留结构；细颗粒由恒星点源提供，避免放大银河贴图时出现像素噪声。
      I = Math.max(0, Math.min(1, I));
      const i4 = (y * W + x) * 4;
      // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish 5000K）
      d[i4] = Math.round(255 * I * 1.00);
      d[i4 + 1] = Math.round(255 * I * 0.955);
      d[i4 + 2] = Math.round(255 * I * 0.88);
      d[i4 + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  // EnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglish，EnglishEnglishEnglishEnglish/English mip EnglishEnglishEnglishEnglishEnglish。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  tex.magFilter = THREE.LinearFilter;
  // EnglishEnglish mipmap：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish mip English，EnglishEnglishEnglishEnglishEnglishEnglish。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（SKY_R），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.anisotropy = 1;
  return tex;
}

/**
 * EnglishEnglishEnglish：EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish 30–90° EnglishEnglishEnglishEnglish。
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglish**，EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。
 */
function createZodiacalLight() {
  const uniforms = {
    uSunDir: { value: new THREE.Vector3(1, 0, 0) },
    uIntensity: { value: 0.0012 },
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（English createStarfield EnglishEnglishEnglishEnglish）
    uFade: { value: 1.0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide, depthWrite: false, depthTest: false,
    transparent: true, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      varying vec3 vDir;
      uniform vec3 uSunDir;
      uniform float uIntensity;
      uniform float uFade;
      void main() {
        #include <logdepthbuf_fragment>
        vec3 d = normalize(vDir);
        // EnglishEnglishEnglish +Y = EnglishEnglishEnglish，EnglishEnglish d.y EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        float lat = asin(clamp(d.y, -1.0, 1.0));
        float band = exp(-abs(lat) / 0.14);            // EnglishEnglishEnglish ±15°
        float cosEl = dot(d, normalize(uSunDir));
        float elon = acos(clamp(cosEl, -1.0, 1.0));    // EnglishEnglishEnglish（EnglishEnglish）
        // **EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。**
        //
        // EnglishEnglish band * (0.25 + 0.75*bright) EnglishEnglishEnglish 0.25 EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish
        // **EnglishEnglishEnglishEnglishEnglishEnglish 25% EnglishEnglish**，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglish
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish 30–90° EnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        // EnglishEnglishEnglish——EnglishEnglishEnglishEnglish 50:1 EnglishEnglish，EnglishEnglishEnglishEnglishEnglish 4:1。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        // EnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**。
        // EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglish，English 90° EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        float bright = exp(-(elon * elon) / (0.85 * 0.85));
        float I = band * bright * bright * uIntensity * uFade;
        // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
        gl_FragColor = vec4(vec3(1.0, 0.965, 0.90) * I, 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(SKY_R, 96, 48), mat);
  mesh.renderOrder = 1;
  mesh.frustumCulled = false;
  return { mesh, uniforms };
}

export function createStarfield(milkywayTex) {
  const group = new THREE.Group();
  const rotatingDome = new THREE.Group();
  group.add(rotatingDome);
  const fadeMats = []; // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  let milkyMat = null;
  let motionEnabled = true;

  // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish（NGP: RA 192.8595°, Dec 27.1284°；EnglishEnglish: RA 266.405°, Dec −28.936°）
  //
  // **EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。**
  //
  // 2026-09-30 EnglishEnglishEnglishEnglishEnglishEnglishEnglish milkyway.jpg EnglishEnglishEnglishEnglishEnglishEnglish（1.9MB → 0.53MB，EnglishEnglish
  // 1.4 → 0.4），EnglishEnglish 2026-10-17 EnglishEnglish"EnglishEnglishEnglishEnglish 0/255"EnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglish
  // EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish 0.5 EnglishEnglish 0.34。
  // EnglishEnglishEnglishEnglish 1.9MB EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  milkywayTex = milkywayTex ?? makeMilkyWayTexture();
  if (milkywayTex) {
    milkywayTex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({
      map: milkywayTex, side: THREE.BackSide, depthWrite: false, fog: false,
      transparent: true,
      color: new THREE.Color(0.5, 0.5, 0.55), // EnglishEnglishEnglishEnglishEnglish
    });
    milkyMat = mat;
    // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ~7°，32 EnglishEnglishEnglishEnglishEnglishEnglish 5.6°——EnglishEnglishEnglishEnglishEnglishEnglish
    // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。128×64 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(SKY_R, 256, 128), mat);
    const xg = raDecToWorld(266.405 * DEG, -28.936 * DEG, new THREE.Vector3()); // EnglishEnglish → EnglishEnglish+X
    const zg = raDecToWorld(192.8595 * DEG, 27.1284 * DEG, new THREE.Vector3()); // NGP → EnglishEnglish+Y
    // EnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish −Z（EnglishEnglishUVEnglishEnglish），English Z English = −(xg×y)
    const y = zg.clone().sub(xg.clone().multiplyScalar(zg.dot(xg))).normalize();
    const zCol = new THREE.Vector3().crossVectors(xg, y).negate();
    const m = new THREE.Matrix4().makeBasis(xg, y, zCol);
    mesh.quaternion.setFromRotationMatrix(m);
    mesh.renderOrder = -10;
    rotatingDome.add(mesh);
  }

  // **EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish。**
  //
  // EnglishEnglishEnglishEnglishEnglish 32×32 EnglishEnglishEnglishEnglishEnglishEnglish sprite，EnglishEnglishEnglishEnglishEnglish 1.7px：EnglishEnglishEnglishEnglishEnglishEnglish
  // 32×32 EnglishEnglishEnglishEnglishEnglish 1.7 EnglishEnglish，mipmap EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglish"EnglishEnglish/EnglishEnglish"EnglishEnglishEnglish"English"。EnglishEnglishEnglishEnglishEnglish map English
  // PointsMaterial，EnglishEnglishEnglishEnglishEnglishEnglishEnglish 1–2 EnglishEnglishEnglishEnglishEnglish，EnglishEnglish"EnglishEnglishEnglishEnglish"。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish 6px、EnglishEnglish 14px（EnglishEnglishEnglish，EnglishEnglishEnglishEnglish）。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglish"（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglish 1–2 EnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglish。

  // ── EnglishEnglishEnglishEnglish（BSC5，9096 English V ≤ 6.5）────────────────────────────────────
  // EnglishEnglishEnglish**EnglishEnglish**EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  // EnglishEnglishEnglish"132 EnglishEnglishEnglishEnglishEnglish + 11900 EnglishEnglishEnglishEnglishEnglishEnglish"：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglish −1.46 English 2.95 EnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。
  //
  // EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（sizeAttenuation:false）：
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglish"，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  const brightGroup = new THREE.Group(); // EnglishEnglishEnglishEnglishEnglishEnglish（posKm=[0,0,0]=EnglishEnglish）
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish [size, maxMag, minMag] EnglishEnglishEnglishEnglishEnglishEnglish，
  // EnglishEnglishEnglishEnglish min/max EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——English 92 EnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglish**，
  // EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish 9004 EnglishEnglishEnglish）。
  const LAYERS = [
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（3.4 / 2.6 / 1.4）。EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    // （−1.46 English）EnglishEnglishEnglish 2.4 EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish——"EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    { size: 3.4, lo: -Infinity, hi: 0.5 },   // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish、EnglishEnglish、EnglishEnglishEnglish…）
    { size: 2.6, lo: 0.5, hi: 2.0 },         // EnglishEnglish
    { size: 1.4, lo: 2.0, hi: Infinity },    // EnglishEnglishEnglishEnglishEnglish
  ];
  const layers = [];
  for (const spec of LAYERS) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(0), 3));
    const mat = new THREE.PointsMaterial({
      size: spec.size, sizeAttenuation: false, vertexColors: true, fog: false,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    fadeMats.push(mat);
    const pts = new THREE.Points(geo, mat);
    pts.renderOrder = spec.size > 2 ? -8 : -9;
    brightGroup.add(pts);
    layers.push({ mat, geo, lo: spec.lo, hi: spec.hi });
  }
  // ── EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish V=6.5，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ──────────────
  //
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish log N ∝ 0.6m EnglishEnglish，6.5 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglish
  // EnglishEnglishEnglish，EnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish"EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglish 9,096 English
  // EnglishEnglishEnglishEnglishEnglishEnglish 0.22 English/EnglishEnglishEnglish；EnglishEnglishEnglish 11,900 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  // EnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglish**EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish，|b| EnglishEnglishEnglishEnglish 12°），EnglishEnglishEnglishEnglishEnglish，
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  {
    const COUNT = 11000;
    const ngp = raDecToWorld(192.8595 * DEG, 27.1284 * DEG, new THREE.Vector3());
    const pos = new Float32Array(COUNT * 3), col = new Float32Array(COUNT * 3);
    let s = 987654321;
    const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    const v = new THREE.Vector3();
    let n = 0, guard = 0;
    while (n < COUNT && guard++ < COUNT * 40) {
      const z = rnd() * 2 - 1, phi = rnd() * Math.PI * 2, r = Math.sqrt(1 - z * z);
      v.set(r * Math.cos(phi), z, r * Math.sin(phi));
      const sinB = Math.max(-1, Math.min(1, v.dot(ngp)));
      if (rnd() > Math.exp(-Math.abs(Math.asin(sinB)) / 0.22)) continue;
      pos[n * 3] = v.x * SKY_R * 0.98;
      pos[n * 3 + 1] = v.y * SKY_R * 0.98;
      pos[n * 3 + 2] = v.z * SKY_R * 0.98;
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      const I = 0.22 * (0.25 + 0.75 * Math.pow(rnd(), 2.2));
      const t = rnd();
      const cr = t < 0.5 ? 1.0 : (t < 0.85 ? 1.0 : 1.0);
      const cg = t < 0.5 ? 0.95 : (t < 0.85 ? 0.92 : 0.78);
      const cb = t < 0.5 ? 0.90 : (t < 0.85 ? 0.76 : 0.56);
      col[n * 3] = cr * I; col[n * 3 + 1] = cg * I; col[n * 3 + 2] = cb * I;
      n++;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos.subarray(0, n * 3), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col.subarray(0, n * 3), 3));
    const mat = new THREE.PointsMaterial({
      size: 1.4, sizeAttenuation: false, vertexColors: true, fog: false,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    fadeMats.push(mat);
    const pts = new THREE.Points(geo, mat);
    pts.renderOrder = -9;
    brightGroup.add(pts);
  }

  brightGroup.frustumCulled = false;

  const _dir = new THREE.Vector3();
  const _rgb = [1, 1, 1];
  // EnglishEnglish：EnglishEnglishEnglishEnglish camera.far/LY_KM EnglishEnglishEnglishEnglishEnglish 94 ly（EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  const PARALLAX_LY_LIMIT = 94;

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。cat English null（EnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish。 */
  function setCatalog(cat) {
    if (!cat) return 0;
    const buckets = layers.map(() => ({ pos: [], col: [] }));
    for (let i = 0; i < cat.count; i++) {
      const mag = cat.mag[i];
      const li = layers.findIndex((L) => mag >= L.lo && mag < L.hi);
      if (li < 0) continue;
      raDecToWorld(cat.ra[i] * DEG, cat.dec[i] * DEG, _dir);
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      const ly = cat.distLy[i] > 0 ? Math.min(cat.distLy[i], PARALLAX_LY_LIMIT) : PARALLAX_LY_LIMIT;
      const d = ly * LY_KM;
      const b = buckets[li];
      b.pos.push(_dir.x * d, _dir.y * d, _dir.z * d);
      bvToRgb(cat.bv[i], _rgb);
      // EnglishEnglish → EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglish，English magToDisplayIntensity）。
      // EnglishEnglishEnglish 0 EnglishEnglishEnglishEnglish 1 EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      const I = 1.15 * magToDisplayIntensity(mag);
      b.col.push(_rgb[0] * I, _rgb[1] * I, _rgb[2] * I);
    }
    layers.forEach((L, i) => {
      const b = buckets[i];
      L.geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(b.pos), 3));
      L.geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(b.col), 3));
      L.geo.computeBoundingSphere();
      L.count = b.pos.length / 3;
    });
    return cat.count;
  }

  group.frustumCulled = false;

  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish group English（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  const zodiacal = createZodiacalLight();
  group.add(zodiacal.mesh);
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglish**：EnglishEnglishEnglishEnglishEnglish fadeMats English，EnglishEnglish/EnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglishEnglish 2%、EnglishEnglishEnglishEnglishEnglish 100%，EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglish"
  // （EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
  // （ShaderMaterial EnglishEnglish opacity，EnglishEnglishEnglishEnglish uFade）
  zodiacal.uniforms.uFade.value = 1;

  return {
    group,
    update(dt) {
      if (motionEnabled) rotatingDome.rotation.y += 0.00015 * dt;
    },
    setMotionEnabled(value) { motionEnabled = !!value; },
    /** EnglishEnglishEnglishEnglish（EnglishEnglishEnglish）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
    setSunDir(x, y, z) { zodiacal.uniforms.uSunDir.value.set(x, y, z); },
    brightGroup,       // EnglishEnglish main.js English scene.add + world.register([0,0,0], brightGroup)
    setCatalog,
    /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish） */
    get starCounts() { return layers.map((L) => L.count ?? 0); },
    /** f∈[0,1]：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（0=EnglishEnglishEnglish） */
    setFade(f) {
      for (const m of fadeMats) m.opacity = f;
      if (milkyMat) milkyMat.opacity = f;
      zodiacal.uniforms.uFade.value = f;
      group.visible = f > 0.01;
      brightGroup.visible = f > 0.01;
    },
  };
}
