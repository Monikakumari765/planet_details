// EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（Nishita EnglishEnglish）。
// EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglish vec3(0)。

import * as THREE from 'three';
import { HASH_GLSL } from './glslNoise.js';
import { QUALITY } from '../engine/quality.js';

export function createAtmosphere(phys, auroraMode = 0) {
  const a = phys.atmosphere;
  const Rg = phys.radiusKm;
  const Ra = Rg + a.heightKm;

  // mie / mieG EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）English [R,G,B] EnglishEnglish（EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  const mieArr  = Array.isArray(a.mie)  ? a.mie  : [a.mie,  a.mie,  a.mie ];
  const mieGArr = Array.isArray(a.mieG) ? a.mieG : [a.mieG, a.mieG, a.mieG];

  const uniforms = {
    uCenter: { value: new THREE.Vector3() },     // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish，km）
    uSunDir: { value: new THREE.Vector3(1, 0, 0) },
    uRg: { value: Rg },
    uRa: { value: Ra },
    uBetaR: { value: new THREE.Vector3(a.rayleigh[0] * 1000, a.rayleigh[1] * 1000, a.rayleigh[2] * 1000) }, // m⁻¹→km⁻¹
    uBetaM: { value: new THREE.Vector3(mieArr[0] * 1000, mieArr[1] * 1000, mieArr[2] * 1000) }, // EnglishEnglish Mie (km⁻¹)
    uHR: { value: a.rayleighScaleKm },
    uHM: { value: a.mieScaleKm },
    uG: { value: new THREE.Vector3(mieGArr[0], mieGArr[1], mieGArr[2]) }, // EnglishEnglish mieG (Henyey-Greenstein EnglishEnglishEnglishEnglish)
    uSunI: { value: 13.0 * (a.multiplier ?? 1) },
    uBoost: { value: 1.0 },  // Rayleigh EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish，EnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglish）
    uBoostM: { value: 1.0 }, // Mie EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish，EnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    uHaze: { value: a.haze ?? 0.0 }, // EnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish）
    // EnglishEnglishEnglish（Chappuis EnglishEnglishEnglish）：EnglishEnglishEnglish 25 km、EnglishEnglishEnglish 8 km EnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish"EnglishEnglishEnglish；EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    // English = EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish 1.0，EnglishEnglishEnglish 0.1，EnglishEnglish 0 EnglishEnglish）。
    uOzone: { value: a.ozone ?? 0.0 },
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish = EnglishEnglishEnglish"EnglishEnglishEnglishEnglish"EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
    // EnglishEnglishEnglishEnglishEnglish（EnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglish（English），
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish tholin EnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglish，
    // EnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglish**——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"。
    uMsDesat: { value: a.msDesat ?? 1.0 },
    // EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglish/EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 0（EnglishEnglish"EnglishEnglish"EnglishEnglishEnglish）。
    uGroundAlbedo: { value: a.groundAlbedo ?? 0.0 },
    // EnglishEnglish（R8 #1）：EnglishEnglishEnglishEnglishEnglish (1−ob) EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
    // EnglishEnglish"EnglishEnglishEnglishEnglish/EnglishEnglish"EnglishEnglishEnglishEnglish Rg English，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    // uStretch = 1/(1−ob) − 1（EnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglish）；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish → 0（EnglishEnglishEnglishEnglish）
    uAxis: { value: new THREE.Vector3(0, 1, 0) }, // EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish，EnglishEnglishEnglishEnglish）
    uStretch: { value: phys.landable ? 0 : (1 / (1 - (phys.oblateness ?? 0)) - 1) },
    // === Issue #27/#29：EnglishEnglish + EnglishEnglish uniforms ===
    uTime: { value: 0 },            // English（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    uSolarActivity: { value: 0.7 }, // EnglishEnglishEnglishEnglish 0..1（EnglishEnglishEnglishEnglishEnglishEnglish）
    uAuroraMode: { value: auroraMode }, // 0=English 1=EnglishEnglish 2=EnglishEnglish 3=EnglishEnglish 4=EnglishEnglishEnglish
    uAuroraStrength: { value: 1.0 },    // EnglishEnglishEnglishEnglishEnglishEnglish 0
    uDustStorm: { value: 0.0 },     // EnglishEnglishEnglishEnglishEnglishEnglish 0..1（boost EnglishEnglish）
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglish**EnglishEnglishEnglishEnglish 8bit EnglishEnglishEnglishEnglishEnglish**，EnglishEnglishEnglishEnglishEnglishEnglish
    // EnglishEnglishEnglishEnglish 1/255，English L EnglishEnglishEnglishEnglishEnglishEnglish ACES EnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglish L EnglishEnglish
    // EnglishEnglishEnglish（1/255），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（×68）EnglishEnglishEnglishEnglishEnglish ±25/255 EnglishEnglishEnglish
    // EnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。English sun.js EnglishEnglishEnglish uniform。
    uInvExposure: { value: 1 },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    // EnglishEnglish：FrontSide + depthTest EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish opaque EnglishEnglishEnglishEnglish，
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（#R15 EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
    // EnglishEnglish：DoubleSide EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    side: THREE.DoubleSide,
    // A volume integral already accounts for the entire atmosphere ray. Three
    // otherwise draws transparent DoubleSide meshes twice, integrating twice.
    forceSinglePass: true,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    vertexShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform vec3 uCenter;
      uniform vec3 uSunDir;
      uniform float uRg, uRa, uHR, uHM, uSunI, uBoost, uBoostM, uHaze, uStretch;
      uniform float uOzone;
      uniform float uMsDesat;
      uniform float uGroundAlbedo;
      uniform vec3 uBetaR, uBetaM, uG, uAxis; // uG EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglish
      // === Issue #27/#29 uniforms ===
      uniform float uTime;
      uniform float uSolarActivity;
      uniform int uAuroraMode;    // 0=English 1=EnglishEnglish 2=EnglishEnglish 3=EnglishEnglish 4=EnglishEnglishEnglish
      uniform float uAuroraStrength;
      uniform float uDustStorm;
      uniform float uInvExposure;
      varying vec3 vWorldPos;

      // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglish → EnglishEnglish（uStretch=0 EnglishEnglishEnglish）
      vec3 stretch(vec3 p) { return p + uAxis * (dot(p, uAxis) * uStretch); }

      // EnglishEnglish-EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；t EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglish），
      // EnglishEnglish (tNear, tFar)，EnglishEnglishEnglishEnglish (1e20, -1e20)
      vec2 raySphere(vec3 ro, vec3 rd, vec3 c, float r) {
        vec3 o = stretch(ro - c);
        vec3 d = stretch(rd);
        float a2 = dot(d, d);
        float b = dot(o, d);
        float det = b * b - a2 * (dot(o, o) - r * r);
        if (det < 0.0) return vec2(1e20, -1e20);
        float s = sqrt(det);
        return vec2((-b - s) / a2, (-b + s) / a2);
      }

      // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）
      float hAbove(vec3 p) { return length(stretch(p - uCenter)) - uRg; }

      // value-noise（EnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      ${HASH_GLSL}
      float phash(vec3 p) { return glslHash31(p); }
      float pnoise(vec3 p) {
        vec3 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(phash(i), phash(i + vec3(1,0,0)), f.x), mix(phash(i + vec3(0,1,0)), phash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(phash(i + vec3(0,0,1)), phash(i + vec3(1,0,1)), f.x), mix(phash(i + vec3(0,1,1)), phash(i + vec3(1,1,1)), f.x), f.y),
          f.z);
      }

      void main() {
        // Outside the shell use its near face, inside use its far face. This
        // keeps one integral per pixel across the atmospheric boundary.
        bool insideShell = length(stretch(-uCenter)) < uRa;
        if (gl_FrontFacing == insideShell) discard;
        #include <logdepthbuf_fragment>
        vec3 ro = vec3(0.0);
        vec3 rd = normalize(vWorldPos);

        vec2 tA = raySphere(ro, rd, uCenter, uRa);
        if (tA.x > tA.y) discard;
        float t0 = max(tA.x, 0.0);
        float t1 = tA.y;
        vec2 tG = raySphere(ro, rd, uCenter, uRg);
        if (tG.x < tG.y && tG.x > 0.0) t1 = min(t1, tG.x);
        if (t1 <= t0) discard;

        const int N = ${QUALITY.atmoN};
        const int NL = ${QUALITY.atmoNL};
        float ds = (t1 - t0) / float(N);
        float odR = 0.0, odM = 0.0, odO = 0.0;
        float odRlit = 0.0;   // EnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）
        vec3 inscR = vec3(0.0), inscM = vec3(0.0);
        vec3 auroraL = vec3(0.0); // Issue #29：EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish，EnglishEnglishEnglish BetaR/BetaM）

        for (int i = 0; i < N; i++) {
          vec3 p = ro + rd * (t0 + (float(i) + 0.5) * ds);
          float h = hAbove(p);
          float dR = exp(-h / uHR) * uBoost;   // Rayleigh EnglishEnglish（EnglishEnglishEnglishEnglish）
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish；uBoostM EnglishEnglishEnglish uBoost，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
          // Issue #27：EnglishEnglishEnglishEnglishEnglish boost EnglishEnglish（uDustStorm > 0 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
          float hazeEff = uHaze + uDustStorm * 0.6;
          float dM = (exp(-h / uHM) + hazeEff * exp(-h / max(uHM * 0.22, 0.5))) * uBoostM;
          odR += dR * ds;
          odM += dM * ds;
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish 0）。
          odRlit += smoothstep(-0.10, 0.10, dot(uSunDir, normalize(p - uCenter))) * dR * ds;
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglish 25 km、EnglishEnglish 8 km EnglishEnglishEnglishEnglishEnglishEnglish Chapman EnglishEnglish
          odO += exp(-pow((h - 25.0) / 8.0, 2.0)) * ds;
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
          vec2 tS = raySphere(p, uSunDir, uCenter, uRa);
          float sl = max(tS.y, 0.0) / float(NL);
          float olR = 0.0, olM = 0.0, olO = 0.0;
          bool shadowed = false;
          vec2 tSG = raySphere(p, uSunDir, uCenter, uRg * 0.998);
          if (tSG.x < tSG.y && tSG.y > 0.0 && tSG.x > 0.0) shadowed = true;
          if (!shadowed) {
            for (int j = 0; j < NL; j++) {
              vec3 q = p + uSunDir * ((float(j) + 0.5) * sl);
              float hq = hAbove(q);
              olR += exp(-hq / uHR) * sl;
              olM += exp(-hq / uHM) * sl;
              olO += exp(-pow((hq - 25.0) / 8.0, 2.0)) * sl;
            }
            // EnglishEnglishEnglishEnglishEnglishEnglish（km⁻¹，EnglishEnglishEnglishEnglish）：Chappuis EnglishEnglish 600 nm EnglishEnglish，
            // EnglishEnglishEnglish 1/3，EnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
            vec3 betaO = vec3(1.25e-3, 4.4e-4, 2.5e-5) * uOzone;
            vec3 T = exp(-(uBetaR * (odR + olR) + uBetaM * 1.1 * (odM + olM)
                           + betaO * (odO + olO)));
            inscR += T * dR * ds;
            inscM += T * dM * ds; // EnglishEnglish Mie：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
          }
          // === Issue #29：EnglishEnglishEnglishEnglishEnglishEnglish ===
          // EnglishEnglishEnglishEnglishEnglishEnglish（~65-75°EnglishEnglish）+ EnglishEnglishEnglish（EnglishEnglish 60-180km，EnglishEnglishEnglishEnglish）。
          // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish。
          // uAuroraMode=0 EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）；uAuroraStrength=0 EnglishEnglishEnglishEnglishEnglish。
          if (uAuroraMode > 0 && uAuroraStrength > 0.001) {
            vec3 srel = stretch(p - uCenter);
            float sh = length(srel) - uRg;
            // EnglishEnglishEnglishEnglishEnglish：EnglishEnglish 30-500km（English 300-350km EnglishEnglishEnglishEnglishEnglishEnglish）。
            // EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglish 60/20km——EnglishEnglishEnglish 60-180km EnglishEnglishEnglishEnglishEnglishEnglishEnglish，
            // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
            float shellH = uRa - uRg;
            float altMin, altMax;
            if (uAuroraMode == 2 || uAuroraMode == 3) { altMin = 30.0; altMax = min(500.0, shellH); }
            else { altMin = shellH * 0.35; altMax = shellH * 0.97; }
            float altF = smoothstep(altMin, altMin + (altMax - altMin) * 0.25, sh)
                       * (1.0 - smoothstep(altMax - (altMax - altMin) * 0.35, altMax, sh));
            // EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish dot）
            float magLat = dot(normalize(srel), uAxis);
            float poleProx = abs(magLat);
            // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish**English**EnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglish 3–6° English、
            // EnglishEnglishEnglishEnglishEnglish 67° EnglishEnglish（poleProx≈0.92），EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
            // （EnglishEnglishEnglish 15–16°，poleProx≈0.96）。
            // EnglishEnglishEnglishEnglish poleProx 0.80–0.96 EnglishEnglishEnglishEnglish，EnglishEnglish 26° EnglishEnglishEnglishEnglish，
            // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
            float ovalC, ovalW, aGain;
            if (uAuroraMode == 1)      { ovalC = 0.920; ovalW = 0.035; aGain = 1.00; } // EnglishEnglish
            else if (uAuroraMode == 2) { ovalC = 0.955; ovalW = 0.018; aGain = 0.22; } // EnglishEnglish H3+（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish）
            else if (uAuroraMode == 3) { ovalC = 0.950; ovalW = 0.016; aGain = 0.035; } // EnglishEnglish H3+ EnglishEnglishEnglish/EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
            else                       { ovalC = 0.900; ovalW = 0.040; aGain = 0.22; } // EnglishEnglishEnglish N2
            float oval = smoothstep(ovalC - ovalW, ovalC, poleProx)
                       * (1.0 - smoothstep(ovalC, ovalC + ovalW, poleProx));
            // EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglish Rg/45 EnglishEnglishEnglishEnglishEnglish（EnglishEnglish ~140km，
            // EnglishEnglish ~1550km）+ EnglishEnglishEnglishEnglish。EnglishEnglish srel*5.0 English km EnglishEnglishEnglish，EnglishEnglish ~1km
            // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。
            float curtain1 = pnoise(srel / uRg * 28.0 + vec3(0.0, 0.0, uTime * 0.06));
            float curtain2 = pnoise(srel / uRg * 90.0 + vec3(uTime * 0.03, 0.0, 0.0));
            // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglish**，
            // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish
            // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish earth-night EnglishEnglishEnglishEnglish）。
            vec3 sdir = normalize(srel);
            float lonA = atan(sdir.z, sdir.x);
            // EnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）
            float arcs = 0.42 + 0.58 * pow(0.5 + 0.5 * sin(lonA * 3.0 - uTime * 0.02), 2.0);
            // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
            float ovalJitter = 1.0 + 0.004 * sin(lonA * 2.0 + 1.3);
            float auroraInt = altF * oval * ovalJitter * arcs
                            * (0.12 + 0.88 * smoothstep(0.28, 0.92, curtain1))
                            * (0.55 + 0.45 * curtain2);
            auroraInt *= uSolarActivity * uAuroraStrength * aGain;
            // EnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：
            //  · EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）；
            //  · EnglishEnglish/EnglishEnglishEnglish H3+ EnglishEnglishEnglish**EnglishEnglish/EnglishEnglish**EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
            //    EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish。
            // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 4% EnglishEnglish——EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglish**English，
            // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglish：
            // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
            if (!shadowed) auroraInt = 0.0;
            // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）：
            //  EnglishEnglish=OI 557.7nm English；EnglishEnglish=H3+ EnglishEnglish；EnglishEnglish=H3+ EnglishEnglish；EnglishEnglishEnglish=English N2 English
            vec3 aColor;
            if (uAuroraMode == 1) aColor = vec3(0.15, 1.0, 0.35);
            else if (uAuroraMode == 2) aColor = vec3(0.55, 0.35, 1.0);
            else if (uAuroraMode == 3) aColor = vec3(0.80, 0.45, 0.90);
            else aColor = vec3(0.90, 0.40, 0.30);
            // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）：nadīr EnglishEnglish auroraL≈aColor，
            // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
            // EnglishEnglishEnglish 220/(t1-t0) EnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish 5-6 English。
            auroraL += aColor * auroraInt * ds / max(altMax - altMin, 1.0) * 0.12;
          }
        }

        float mu = dot(rd, uSunDir);
        float phR = 3.0 / (16.0 * PI) * (1.0 + mu * mu);
        // EnglishEnglish Henyey-Greenstein：uG English vec3，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        vec3 g2 = uG * uG;
        vec3 phM = 3.0 / (8.0 * PI) * ((1.0 - g2) * (1.0 + mu * mu)) /
                   ((2.0 + g2) * pow(max(1.0 + g2 - 2.0 * uG * mu, vec3(1e-6)), vec3(1.5)));

        vec3 L = uSunI * (uBetaR * phR * inscR + uBetaM * phM * inscM);
        L += auroraL; // Issue #29：EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        vec3 viewT = exp(-(uBetaR * odR + uBetaM * 1.1 * odM));
        float alpha = 1.0 - dot(viewT, vec3(0.3333));

        // EnglishEnglishEnglishEnglishEnglishEnglish（B3）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglishEnglish ≈ 1 − viewT（EnglishEnglishEnglishEnglishEnglish"EnglishEnglish"EnglishEnglish）。
        //
        // EnglishEnglish**EnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglish inscR：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
        // English inscR EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 30km English
        // EnglishEnglishEnglish 4%，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish
        // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）。EnglishEnglish"EnglishEnglishEnglishEnglishEnglish × EnglishEnglishEnglishEnglishEnglishEnglish √(2πR·H)"，
        // EnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
        vec3 msFrac = vec3(1.0) - viewT;
        float hCam = hAbove(ro);
        float hazeM = uHaze + uDustStorm * 0.6;
        float rhoRc = exp(-hCam / uHR) * uBoost;
        float rhoMc = (exp(-hCam / uHM) + hazeM * exp(-hCam / max(uHM * 0.22, 0.5))) * uBoostM;
        // EnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglish** E/(4π)：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglish 4π（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglish；
        // EnglishEnglishEnglishEnglish msFrac² EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish ∝ τ²）。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish），EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish）。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglish**：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish），
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish（English）。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish（EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglish
        // EnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        vec3 scatTint = uBetaR * rhoRc + uBetaM * rhoMc;
        float smax = max(max(scatTint.r, scatTint.g), scatTint.b);
        vec3 sNorm = smax > 1e-12 ? scatTint / smax : vec3(0.0);
        float msMean = (msFrac.r + msFrac.g + msFrac.b) * (1.0 / 3.0);
        sNorm = mix(sNorm, vec3(1.0), msMean * uMsDesat);
        float litFrac = odR > 1e-6 ? odRlit / odR : 0.0;
        L += uSunI * sNorm * (1.0 / (4.0 * PI)) * msFrac * msFrac * litFrac;

        // === EnglishEnglishEnglishEnglishEnglishEnglishEnglish ===
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish/EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
        // EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"。
        //
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**，
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish uSunI × groundAlbedo EnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglish RGB
        // 24/42/53，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 0.2/0.3/0.9，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglish。
        if (uGroundAlbedo > 0.0) {
          vec3 up = normalize(uCenter - ro);          // EnglishEnglishEnglish"English"（EnglishEnglishEnglishEnglishEnglishEnglish）
          float below = clamp(-dot(rd, up), 0.0, 1.0);
          float groundLit = odR > 1e-6 ? odRlit / odR : 0.0;
          vec3 twoWay = exp(-(uBetaR * odR + uBetaM * 1.1 * odM) * 1.5);
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglish**：
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglish Rayleigh EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
          // （EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish Rayleigh EnglishEnglish，EnglishEnglishEnglishEnglish
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish RGB 110,101,61）。
          vec3 gTint = normalize(uBetaR + vec3(1e-9));
          vec3 groundLitCol = mix(vec3(1.0), gTint * 1.7, 0.55);
          L += uSunI * uGroundAlbedo * groundLitCol * twoWay * (0.35 + 0.65 * below) * msFrac
             * (1.0 / PI) * groundLit;
        }

        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（×alpha：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。R8 #1 EnglishEnglish——
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish Ra EnglishEnglishEnglishEnglishEnglishEnglish）
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（uInvExposure），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ~1/255
        float dith = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5)
                   / 255.0 * uInvExposure;
        gl_FragColor = vec4(L + dith * alpha, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });

  const mesh = new THREE.Mesh(new THREE.SphereGeometry(Ra, 64, 48), mat);
  mesh.renderOrder = 100;
  mesh.frustumCulled = true;
  mat.userData.uniforms = uniforms;
  return mesh;
}

// ── EnglishEnglishEnglishEnglish（aerial perspective）English JS EnglishEnglish ────────────────────────────────
//
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish depthTest EnglishEnglishEnglishEnglish，EnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish
// ——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
// EnglishEnglishEnglishEnglish**。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（fogColor = rayleigh EnglishEnglish × 0.5 ×
// day…），EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish"EnglishEnglishEnglish
// EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish C-4）。
//
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（Rayleigh + EnglishEnglish Mie + EnglishEnglish + EnglishEnglishEnglishEnglish
// EnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglishEnglish）English JS EnglishEnglishEnglishEnglishEnglish，EnglishEnglish：
//   · color   —— EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish L（EnglishEnglishEnglishEnglishEnglishEnglishEnglish，HDR EnglishEnglish）
//   · alpha   —— 1 − EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
//   · source  —— L / alpha，EnglishEnglishEnglish j/σt：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
//                EnglishEnglishEnglish FogExp2 EnglishEnglishEnglish，"EnglishEnglishEnglishEnglish → EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
//   · density —— EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（km⁻¹），FogExp2 English ρ。
//
// EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish），16×8 English，EnglishEnglishEnglishEnglishEnglish。
export function atmosphereFog(phys, opts) {
  const a = phys?.atmosphere;
  if (!a) return null;
  const Rg = phys.radiusKm;
  const Ra = Rg + a.heightKm;
  const bR = [a.rayleigh[0] * 1000, a.rayleigh[1] * 1000, a.rayleigh[2] * 1000]; // m⁻¹→km⁻¹
  const mieIn = Array.isArray(a.mie) ? a.mie : [a.mie, a.mie, a.mie];
  const bM = [mieIn[0] * 1000, mieIn[1] * 1000, mieIn[2] * 1000];
  const gIn = Array.isArray(a.mieG) ? a.mieG : [a.mieG, a.mieG, a.mieG];
  const HR = a.rayleighScaleKm, HM = a.mieScaleKm;
  const haze = a.haze ?? 0;
  const ozone = a.ozone ?? 0;
  const groundAlbedo = a.groundAlbedo ?? 0;
  const boost = opts.boost ?? 1;
  const boostM = opts.boostM ?? 1;
  const hazeEff = haze + (opts.dustStorm ?? 0) * 0.6;
  const msDesat = a.msDesat ?? 1.0;
  const sunI = opts.sunI;

  const { up, viewDir, sunDir } = opts;
  // EnglishEnglishEnglishEnglishEnglish**EnglishEnglish**EnglishEnglish（1.7m）。
  //
  // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish altKm = max(distSurface, 0) = 0，EnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish-EnglishEnglishEnglishEnglishEnglish——det = b²，EnglishEnglishEnglishEnglish，`gr[0]` EnglishEnglish
  // ±1ulp EnglishEnglishEnglishEnglishEnglish，t1 EnglishEnglishEnglish ~1e-9，EnglishEnglishEnglishEnglishEnglishEnglish 0：alpha = 0、L = 0，
  // EnglishEnglishEnglishEnglishEnglish（EnglishEnglish `fogDbg` English out English 0、density EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish）。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 1.7m，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  const altKm = Math.max(opts.altKm ?? 0, 0.0017);
  const cx = -up.x * (Rg + altKm), cy = -up.y * (Rg + altKm), cz = -up.z * (Rg + altKm);
  const rdx = viewDir.x, rdy = viewDir.y, rdz = viewDir.z;
  const sdx = sunDir.x, sdy = sunDir.y, sdz = sunDir.z;

  // EnglishEnglish-EnglishEnglishEnglish。**EnglishEnglishEnglishEnglishEnglish**：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish"EnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
  const hitD = (ox, oy, oz, dx, dy, dz, r) => {
    const gx = ox - cx, gy = oy - cy, gz = oz - cz;
    const b = gx * dx + gy * dy + gz * dz;
    const cc = gx * gx + gy * gy + gz * gz - r * r;
    const det = b * b - cc;
    if (det < 0) return null;
    const sq = Math.sqrt(det);
    return [-b - sq, -b + sq];
  };
  const hit = (ox, oy, oz, r) => hitD(ox, oy, oz, rdx, rdy, rdz, r);
  const hAbove = (px, py, pz) => Math.hypot(px - cx, py - cy, pz - cz) - Rg;

  const shell = hit(0, 0, 0, Ra);
  if (!shell) return null;
  let t0 = Math.max(shell[0], 0), t1 = shell[1];
  const gr = hit(0, 0, 0, Rg);
  if (gr && gr[1] > 0) {
    // gr[0] ≤ 0 = EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
    // EnglishEnglish**EnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，odR EnglishEnglish 1e83，
    // exp(−τ) EnglishEnglishEnglish、alpha EnglishEnglish 1 English NaN。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    if (gr[0] <= 0) return null;
    t1 = Math.min(t1, gr[0]);
  }
  if (t1 <= t0) return null;

  const N = 16, NL = 8;
  const ds = (t1 - t0) / N;
  let odR = 0, odM = 0, odO = 0, odRlit = 0;
  const inscR = [0, 0, 0], inscM = [0, 0, 0];

  for (let i = 0; i < N; i++) {
    const t = t0 + (i + 0.5) * ds;
    const px = rdx * t, py = rdy * t, pz = rdz * t;
    // EnglishEnglishEnglishEnglish 0：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish、EnglishEnglishEnglishEnglish）EnglishEnglishEnglish
    // exp(−h/H) EnglishEnglish 1e80 EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"。
    const h = Math.max(hAbove(px, py, pz), 0);
    const dR = Math.exp(-h / HR) * boost;
    const dM = (Math.exp(-h / HM) + hazeEff * Math.exp(-h / Math.max(HM * 0.22, 0.5))) * boostM;
    odR += dR * ds;
    odM += dM * ds;
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）
    const pl = Math.hypot(px - cx, py - cy, pz - cz) || 1;
    const litDot = ((px - cx) * sdx + (py - cy) * sdy + (pz - cz) * sdz) / pl;
    odRlit += Math.max(0, Math.min(1, (litDot + 0.10) / 0.20)) * dR * ds;
    odO += Math.exp(-(((h - 25) / 8) ** 2)) * ds;

    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    const ts = hitD(px, py, pz, sdx, sdy, sdz, Ra);
    const shadow = hitD(px, py, pz, sdx, sdy, sdz, Rg * 0.998);
    const shadowed = !!(shadow && shadow[0] < shadow[1] && shadow[1] > 0 && shadow[0] > 0);
    if (!shadowed && ts) {
      const sl = Math.max(ts[1], 0) / NL;
      let olR = 0, olM = 0, olO = 0;
      for (let j = 0; j < NL; j++) {
        const q = (j + 0.5) * sl;
        const hq = Math.max(hAbove(px + sdx * q, py + sdy * q, pz + sdz * q), 0);
        olR += Math.exp(-hq / HR) * sl;
        olM += Math.exp(-hq / HM) * sl;
        olO += Math.exp(-(((hq - 25) / 8) ** 2)) * sl;
      }
      const betaO = [1.25e-3 * ozone, 4.4e-4 * ozone, 2.5e-5 * ozone];
      for (let k = 0; k < 3; k++) {
        const tau = bR[k] * (odR + olR) + bM[k] * 1.1 * (odM + olM) + betaO[k] * (odO + olO);
        const T = Math.exp(-tau);
        inscR[k] += T * dR * ds;
        inscM[k] += T * dM * ds;
      }
    }
  }

  const mu = rdx * sdx + rdy * sdy + rdz * sdz;
  const phR = (3 / (16 * Math.PI)) * (1 + mu * mu);
  const out = [0, 0, 0];
  const msFrac = [0, 0, 0];
  for (let k = 0; k < 3; k++) {
    const g = gIn[k], g2 = g * g;
    const phM = (3 / (8 * Math.PI)) * ((1 - g2) * (1 + mu * mu))
      / ((2 + g2) * Math.pow(Math.max(1 + g2 - 2 * g * mu, 1e-6), 1.5));
    out[k] = sunI * (bR[k] * phR * inscR[k] + bM[k] * phM * inscM[k]);
  }
  // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish × EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // inscR——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  const hCam0 = altKm;
  const rhoRc = Math.exp(-hCam0 / HR) * boost;
  const rhoMc = (Math.exp(-hCam0 / HM)
    + hazeEff * Math.exp(-hCam0 / Math.max(HM * 0.22, 0.5))) * boostM;
  const litFrac = odR > 1e-6 ? odRlit / odR : 0;
  const scatTint = [0, 0, 0];
  let smax = 0;
  for (let k = 0; k < 3; k++) {
    scatTint[k] = bR[k] * rhoRc + bM[k] * rhoMc;
    smax = Math.max(smax, scatTint[k]);
  }
  for (let k = 0; k < 3; k++) {
    msFrac[k] = 1 - Math.exp(-(bR[k] * odR + bM[k] * 1.1 * odM));
  }
  // msMean EnglishEnglishEnglish msFrac EnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish 0，
  // JS EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish）。
  const msMean = (msFrac[0] + msFrac[1] + msFrac[2]) / 3;
  for (let k = 0; k < 3; k++) {
    const sNorm = smax > 1e-12 ? scatTint[k] / smax : 0;
    const sMix = sNorm + (1 - sNorm) * msMean * msDesat;   // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）
    out[k] += sunI * sMix * (1 / (4 * Math.PI)) * msFrac[k] * msFrac[k] * litFrac;
  }
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  if (groundAlbedo > 0) {
    const upx = -cx, upy = -cy, upz = -cz;
    const ul = Math.hypot(upx, upy, upz) || 1;
    const below = Math.max(0, Math.min(1, -(rdx * upx + rdy * upy + rdz * upz) / ul));
    const groundLit = odR > 1e-6 ? odRlit / odR : 0;
    const bm = Math.max(bR[0], bR[1], bR[2]) || 1;
    const gTint = [bR[0] / bm, bR[1] / bm, bR[2] / bm];
    for (let k = 0; k < 3; k++) {
      const gcol = 1 * (1 - 0.55) + gTint[k] * 1.7 * 0.55;
      const twoWay = Math.exp(-(bR[k] * odR + bM[k] * 1.1 * odM) * 1.5);
      out[k] += sunI * groundAlbedo * gcol * twoWay * (0.35 + 0.65 * below) * msFrac[k]
        * (1 / Math.PI) * groundLit;
    }
  }

  // EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish alpha EnglishEnglishEnglishEnglish）
  let meanT = 0;
  for (let k = 0; k < 3; k++) meanT += Math.exp(-(bR[k] * odR + bM[k] * 1.1 * odM));
  meanT /= 3;
  const alpha = 1 - meanT;

  // EnglishEnglishEnglish：L/α。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish j/σt（EnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  const al = Math.max(alpha, 1e-3);
  const color = [out[0] / al, out[1] / al, out[2] / al];

  // FogExp2 English ρ。EnglishEnglishEnglishEnglishEnglish 1−exp(−(ρd)²)，EnglishEnglishEnglishEnglish 1−exp(−σd) EnglishEnglishEnglishEnglish，
  // EnglishEnglishEnglishEnglish ρ EnglishEnglishEnglishEnglishEnglish；English**EnglishEnglishEnglish**（Koschmieder L=3.912/σ）EnglishEnglishEnglishEnglishEnglish：
  // English 1−exp(−(ρL)²)=0.98 ⇒ ρL=1.98 ⇒ ρ≈0.5σ。English σ/2 English 20km EnglishEnglishEnglishEnglishEnglish
  // EnglishEnglish <2%（0.91 vs 0.92），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  const hCam = altKm;
  let density = 0;
  for (let k = 0; k < 3; k++) {
    density += bR[k] * Math.exp(-hCam / HR) * boost
      + bM[k] * 1.1 * (Math.exp(-hCam / HM)
        + hazeEff * Math.exp(-hCam / Math.max(HM * 0.22, 0.5))) * boostM;
  }
  density /= 6;   // = σ/2，EnglishEnglish

  return { color, alpha, density };
}
