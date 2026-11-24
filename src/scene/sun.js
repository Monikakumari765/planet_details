// EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish）+ EnglishEnglishEnglishEnglish。
// English：EnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
// （K EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglish artifacts EnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：1/r^2.5 EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。

import * as THREE from 'three';
import { HASH_GLSL } from './glslNoise.js';

export function createSun(radiusKm, mapTex) {
  const group = new THREE.Group();

  const uniforms = {
    uTime: { value: 0 },
    // EnglishEnglishEnglishEnglish 0..1（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，English astro/solarCycle.js）——EnglishEnglishEnglishEnglishEnglishEnglishEnglish
    uSolarActivity: { value: 0.5 },
    uMap: { value: mapTex },
    // EnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglish**（EnglishEnglishEnglishEnglish）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglish**，EnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    uMapMean: { value: 0.33 },
    // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）English**EnglishEnglish**。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish
    // EnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ~900 English、
    // EnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    // English main.js EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish toneMappingExposure——EnglishEnglishEnglishEnglishEnglish OutputPass English）。
    uInvExposure: { value: 1 },
  };

  // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglish**EnglishEnglishEnglish。
  // English 64×32 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish <1%），EnglishEnglishEnglishEnglishEnglish 4096×2048。
  {
    const img = mapTex?.image;
    const iw = img && (img.width || img.naturalWidth);
    if (iw && typeof document !== 'undefined') {
      try {
        const c = document.createElement('canvas');
        c.width = 64; c.height = 32;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, 64, 32);
        const d = ctx.getImageData(0, 0, 64, 32).data;
        let s = 0;
        for (let i = 0; i < d.length; i += 4) {
          s += 0.2126 * Math.pow(d[i] / 255, 2.2)
             + 0.7152 * Math.pow(d[i + 1] / 255, 2.2)
             + 0.0722 * Math.pow(d[i + 2] / 255, 2.2);
        }
        const mean = s / (d.length / 4);
        if (mean > 1e-4) uniforms.uMapMean.value = mean;
      } catch { /* EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish */ }
    }
  }

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec2 vUv;
      varying vec3 vPos;
      varying vec3 vNormalV;
      varying vec3 vViewV;
      void main() {
        vUv = uv;
        vPos = position;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormalV = normalMatrix * normal;
        vViewV = -mv.xyz;
        gl_Position = projectionMatrix * mv;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uTime;
      uniform float uSolarActivity;
      uniform float uInvExposure;
      uniform float uMapMean;
      uniform sampler2D uMap;
      varying vec2 vUv;
      varying vec3 vPos;
      varying vec3 vNormalV;
      varying vec3 vViewV;

      ${HASH_GLSL}
      float hash(vec3 p) { return glslHash31(p); }
      float vnoise(vec3 p) {
        vec3 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
          f.z);
      }
      float fbm(vec3 p) {
        float s = 0.0, a = 0.5;
        for (int i = 0; i < 5; i++) { s += a * vnoise(p); a *= 0.5; p *= 2.1; }
        return s;
      }

      void main() {
        #include <logdepthbuf_fragment>
        vec3 p = normalize(vPos);
        vec3 sampled = texture2D(uMap, vUv).rgb;
        // EnglishEnglish（sun.jpg）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish**EnglishEnglish**（EnglishEnglish、EnglishEnglish），
        // EnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish 5772 K EnglishEnglishEnglishEnglishEnglish。
        //
        // EnglishEnglishEnglishEnglish base EnglishEnglish vec3(luminance)，English**EnglishEnglish**——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish (1.0, 0.975, 0.93)（EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"）。
        // **EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。**
        //
        // EnglishEnglishEnglishEnglishEnglish sampled * (0.85 / luminance)——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
        // EnglishEnglishEnglishEnglish、EnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        // EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        //
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglish"，EnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglish**EnglishEnglish：
        // EnglishEnglishEnglishEnglish CPU EnglishEnglishEnglishEnglishEnglishEnglish（uMapMean），EnglishEnglish 100% EnglishEnglish。
        vec3 base = sampled * (0.85 / max(uMapMean, 1e-3));
        // EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglish。
        //
        // EnglishEnglishEnglish 1.0 - smoothstep(0.35, 0.9, fp*700) EnglishEnglishEnglish：fp*700 English"EnglishEnglishEnglishEnglish
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglish"，English 1-smoothstep English x EnglishEnglishEnglishEnglish 0 —— EnglishEnglishEnglishEnglishEnglishEnglish
        // **EnglishEnglish 0.35 EnglishEnglish**（EnglishEnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglish。EnglishEnglish 2.2R EnglishEnglishEnglishEnglishEnglish 500px、
        // fp≈0.004、fp*700=2.8 → a1=a2=0，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglishEnglish：EnglishEnglish ≥ English 1 EnglishEnglishEnglishEnglishEnglish，≥ 3.5 EnglishEnglishEnglishEnglish。
        float fp = length(fwidth(p));
        float px1 = 1.0 / max(fp * 700.0, 1e-6);    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        float px2 = 1.0 / max(fp * 1450.0, 1e-6);   // EnglishEnglishEnglish
        float a1 = smoothstep(1.0, 3.5, px1);
        float a2 = smoothstep(1.0, 3.5, px2);
        float g1 = a1 > 0.01 ? vnoise(p * 700.0 + uTime * 0.001) : 0.5;
        float g2 = a2 > 0.01 ? vnoise(p * 1450.0 - uTime * 0.002) : 0.5;
        float granule = 1.0 + (g1 - 0.5) * 0.25 * a1 + (g2 - 0.5) * 0.1 * a2;
        // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——English"EnglishEnglishEnglishEnglishEnglishEnglish"
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        //
        // EnglishEnglishEnglish 17：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），
        // EnglishEnglish 6.0 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglishEnglishEnglishEnglish（±0.02/±0.03）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        float spotThr = mix(0.14, 0.30, clamp(uSolarActivity, 0.0, 1.0));
        float spots = 1.0 - smoothstep(spotThr - 0.02, spotThr + 0.03,
                                       fbm(p * 13.0 + 13.7 + uTime * 0.004));
        // EnglishEnglishEnglishEnglishEnglishEnglish 0.45：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglish"
        // EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish 0.75 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        vec3 col = base * granule * (1.0 - 0.45 * spots);
        col *= vec3(1.0, 0.98, 0.94);
        // EnglishEnglishEnglishEnglish：Neckel & Labs (1994) EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglish**
        // （EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 1000 K）。EnglishEnglishEnglishEnglish μ≈0.2 EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish 6%，
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        float mu = clamp(dot(normalize(vNormalV), normalize(vViewV)), 0.0, 1.0);
        float ld = 0.30 + 0.93 * mu - 0.23 * mu * mu + 0.14 * mu * mu * mu
                 - 0.16 * mu * mu * mu * mu + 0.02 * mu * mu * mu * mu * mu;
        // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish H⁻ EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——μ EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。
        col *= vec3(ld, pow(ld, 1.10), pow(ld, 1.30));
        // EnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglish**。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish；
        // EnglishEnglishEnglishEnglishEnglishEnglish d² EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）——EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ~900 English、EnglishEnglishEnglishEnglishEnglishEnglish。
        // tonemapping_fragment EnglishEnglishEnglishEnglishEnglish toneMappingExposure，EnglishEnglishEnglishEnglishEnglishEnglishEnglish，
        // EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        //
        // EnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglish**，EnglishEnglishEnglishEnglishEnglishEnglishEnglish ACES EnglishEnglishEnglishEnglish（≲0.8）：
        // EnglishEnglishEnglishEnglishEnglishEnglish，ACES EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglish 2.2 —— EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
        // English"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish）。
        // 0.92 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        gl_FragColor = vec4(col * 0.85 * uInvExposure, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });

  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radiusKm, 96, 64), mat);
  group.add(mesh);

  // ── EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，K English r^-2.5 EnglishEnglish + EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglish ──
  const coronaUniforms = {
    uTime: { value: 0 },
    uVisibility: { value: 0.000001 },
    uInvExposure: { value: 1 },
  };
  const coronaMat = new THREE.ShaderMaterial({
    uniforms: coronaUniforms,
    transparent: true,
    depthWrite: false,
    depthTest: true, // EnglishEnglishEnglishEnglish（THREE EnglishEnglishEnglish true）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（#14）
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec2 vUvC;
      void main() {
        vUvC = uv * 2.0 - 1.0; // [-1,1]，1 = 6 EnglishEnglishEnglishEnglishEnglish
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uTime;
      uniform float uVisibility;
      uniform float uInvExposure;   // EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish
      varying vec2 vUvC;

      ${HASH_GLSL}
      float hash2(vec2 p) { return glslHash31(vec3(p, 0.0)); }
      float vnoise2(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash2(i), hash2(i + vec2(1,0)), f.x), mix(hash2(i + vec2(0,1)), hash2(i + vec2(1,1)), f.x), f.y);
      }

      void main() {
        #include <logdepthbuf_fragment>
        float r = length(vUvC);            // 0..1 → 0..6 EnglishEnglishEnglishEnglish
        float rR = r * 6.0;                // EnglishEnglishEnglishEnglishEnglishEnglish
        if (rR < 0.995) discard;           // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        // K English：EnglishEnglishEnglishEnglish，EnglishEnglish ~r^-2.5
        float k = pow(rR, -2.5);
        // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglish
        float ang = atan(vUvC.y, vUvC.x);
        float streamer = 0.65 + 0.35 * (0.5 + 0.5 * sin(ang * 4.0 + uTime * 0.02))
                       * (0.7 + 0.6 * vnoise2(vec2(ang * 2.0, rR * 1.5 - uTime * 0.03)));
        // EnglishEnglishEnglishEnglishEnglishEnglish
        float polarDim = 0.55 + 0.45 * abs(cos(ang));
        float i = k * streamer * polarDim;
        // EnglishEnglish：EnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglish
        vec3 col = mix(vec3(1.0, 0.93, 0.78), vec3(0.85, 0.9, 1.0), smoothstep(1.0, 4.0, rR));
        float alpha = clamp(i * 0.85 * uVisibility, 0.0, 1.0);
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。**EnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish uInvExposure：
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish col*0.85 ≈ 0.72；EnglishEnglishEnglish 0.9 English r=1.14R☉ EnglishEnglishEnglish
        // i·alpha·0.9 = 0.46×0.215×0.9 ≈ 0.089，EnglishEnglish uInvExposure（2.2R EnglishEnglish
        // EnglishEnglishEnglishEnglishEnglish 0.02，English ×50）= 4.45 —— **EnglishEnglishEnglishEnglishEnglishEnglishEnglish 6 English**。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglish 54.7/255，EnglishEnglish 0.5/255。
        // EnglishEnglish K EnglishEnglish 1.2R☉ EnglishEnglishEnglishEnglishEnglish 1e-5~1e-6 EnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 10–15/255（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
        gl_FragColor = vec4(col * i * 0.0025 * uInvExposure, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  // EnglishEnglishEnglishEnglishEnglish = 12 EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish ~6R）
  const corona = new THREE.Mesh(new THREE.PlaneGeometry(radiusKm * 12, radiusKm * 12), coronaMat);
  corona.renderOrder = 4;
  corona.frustumCulled = false;
  // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish）
  corona.onBeforeRender = (renderer, scene, camera) => {
    corona.quaternion.copy(camera.quaternion);
  };
  group.add(corona);

  return {
    group, mesh, corona, coronaUniforms, uniforms,
    update(timeSec, camDistKm, occulted = false, solarActivity = null) {
      uniforms.uTime.value = timeSec;
      coronaUniforms.uTime.value = timeSec;
      if (solarActivity !== null) uniforms.uSolarActivity.value = solarActivity;
      // EnglishEnglishEnglishEnglish：K EnglishEnglish 1.2 R☉ EnglishEnglishEnglishEnglishEnglishEnglish 10⁻⁶ EnglishEnglish，EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"English
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 10⁻⁶，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish 10¹⁴，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      // EnglishEnglishEnglish。EnglishEnglishEnglish"EnglishEnglishEnglishEnglish"EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish
      // EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。
      // 0.02 English r=1R English alpha≈0.017——EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，English 0.55；EnglishEnglishEnglishEnglish 1.0。
      coronaUniforms.uVisibility.value = occulted ? 1 : 0.55;
    },
  };
}
