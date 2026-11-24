// EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish/EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。

import * as THREE from 'three';

/** EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish）：EnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglish 1D EnglishEnglish alpha EnglishEnglish */
function makeNarrowRingTexture(innerKm, outerKm, narrow, diffuse = 0.03) {
  const W = 1024;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = 1;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(W, 1);
  for (let i = 0; i < W; i++) {
    const r = innerKm + (i / (W - 1)) * (outerKm - innerKm);
    let a = diffuse; // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish）
    for (const [rc, w, tau] of narrow) {
      const d = Math.abs(r - rc) / Math.max(w, 1);
      a += tau * Math.exp(-d * d * 2.8);
    }
    const v = Math.max(0, Math.min(255, Math.round(a * 255)));
    img.data[i * 4] = 200; img.data[i * 4 + 1] = 200; img.data[i * 4 + 2] = 205;
    img.data[i * 4 + 3] = v;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  return tex;
}

export function createRings(phys, ringTex) {
  const { innerKm, outerKm, opacity = 1, narrow } = phys.rings;
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  if (!ringTex && narrow) ringTex = makeNarrowRingTexture(innerKm, outerKm, narrow, phys.rings.diffuse);
  const SEG = 256;

  // EnglishEnglishEnglishEnglishEnglishEnglish：uv.x = EnglishEnglishEnglishEnglishEnglish
  const geo = new THREE.BufferGeometry();
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= SEG; i++) {
    const a = (i / SEG) * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    pos.push(innerKm * c, 0, innerKm * s, outerKm * c, 0, outerKm * s);
    uv.push(0, 0.5, 1, 0.5);
  }
  for (let i = 0; i < SEG; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);

  // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish+EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（NASA EnglishEnglishEnglishEnglishEnglish），
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  const tint = phys.rings.tint ?? [1, 1, 1];
  const uniforms = {
    uMap: { value: ringTex },
    uHasMap: { value: ringTex ? 1 : 0 },
    uSunDir: { value: new THREE.Vector3(1, 0, 0) },
    uCenter: { value: new THREE.Vector3() }, // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）
    uPlanetR: { value: phys.radiusKm },
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish（km）
    uRingInner: { value: innerKm },
    uRingOuter: { value: outerKm },
    uSunI: { value: 1.0 },
    uOpacity: { value: opacity },
    uTint: { value: new THREE.Vector3(tint[0], tint[1], tint[2]) },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    // three r165 English transparent+DoubleSide EnglishEnglishEnglishEnglish BackSide/FrontSide EnglishEnglishEnglishEnglish
    // （three.module.js:29185）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish alpha EnglishEnglish
    // 1-(1-a)²：C English 0.1→0.19 EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    forceSinglePass: true,
    vertexShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec2 vUv;
      varying vec3 vPosW;
      varying vec3 vNormalW;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vPosW = wp.xyz;
        vNormalW = normalize(mat3(modelMatrix) * vec3(0.0, 1.0, 0.0));
        gl_Position = projectionMatrix * viewMatrix * wp;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform sampler2D uMap;
      uniform int uHasMap;
      uniform vec3 uSunDir;
      uniform vec3 uCenter;
      uniform float uPlanetR, uSunI, uOpacity;
      uniform float uRingInner, uRingOuter;
      uniform vec3 uTint;
      varying vec2 vUv;
      varying vec3 vPosW;
      varying vec3 vNormalW;

      void main() {
        #include <logdepthbuf_fragment>
        vec4 tex = uHasMap == 1
          ? texture2D(uMap, vec2(vUv.x, 0.5))
          : vec4(0.55, 0.5, 0.45, 0.5);
        // ── EnglishEnglishEnglishEnglish ──────────────────────────────────────────────────
        // EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglish**，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish Seeliger EnglishEnglish：
        //     I/F ∝ μ0/(μ0+μ) · P(α)
        // μ0 = EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、μ = EnglishEnglishEnglishEnglishEnglish、α = EnglishEnglishEnglish。
        //
        // EnglishEnglishEnglishEnglish max(ndl,0) + pow(max(−ndl,0),0.7)·0.35 + 0.45·(1−|ndl|)——
        // English vNormalW English**EnglishEnglishEnglishEnglish**（EnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：
        //   · EnglishEnglishEnglishEnglish：EnglishEnglish（μ→0）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish；
        //   · EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。
        //     （EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish 1° English 0° EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
        // EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        vec3 nrm = normalize(vNormalW);
        vec3 toCam = -normalize(vPosW - cameraPosition);   // EnglishEnglish → EnglishEnglish
        float mu0 = abs(dot(nrm, uSunDir));
        float mu = abs(dot(nrm, toCam));
        float seeliger = mu0 / max(mu0 + mu, 1e-4);
        float cosA = dot(toCam, uSunDir);                  // EnglishEnglishEnglishEnglishEnglishEnglish
        float surge = 1.0 + 0.5 * exp(-(1.0 - cosA) * 25.0);   // EnglishEnglish：English ±8° EnglishEnglishEnglish
        float phase = 0.55 + 0.45 * cosA                       // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
                    + 0.9 * pow(max(-cosA, 0.0), 3.0);         // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）
        float lit = seeliger * phase * surge;
        // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        vec3 rel = vPosW - uCenter;
        float along = dot(rel, uSunDir);
        vec3 perp = rel - along * uSunDir;
        float shadow = 1.0;
        if (along < 0.0) {
          shadow = smoothstep(uPlanetR * 0.985, uPlanetR * 1.02, length(perp));
        }
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglish phase English，EnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        // pow(dot(viewRay,uSunDir),8)·2.5 EnglishEnglishEnglishEnglishEnglish，English phase EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        // EnglishEnglish 3.2 EnglishEnglish Seeliger EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish seeliger·phase ≈ 0.28，
        // EnglishEnglishEnglish ≈ 0.45），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglish**EnglishEnglishEnglishEnglish**，EnglishEnglishEnglishEnglishEnglishEnglish。
        // ── EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish ──────────────────────────────────────────
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglish
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）EnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglish"
        // EnglishEnglishEnglish——B EnglishEnglish A EnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        //
        // EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish
        // EnglishEnglishEnglishEnglish；EnglishEnglish 1/μ0 EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish）。
        // EnglishEnglishEnglish（10 English）——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish。
        vec3 sunInPlane = uSunDir - nrm * dot(uSunDir, nrm);
        float sunInPlaneLen = length(sunInPlane);
        if (sunInPlaneLen > 1e-4 && mu0 > 0.02) {
          vec3 mdir = sunInPlane / sunInPlaneLen;
          float rSpan = uRingOuter - uRingInner;
          float dstep = rSpan / 24.0;
          float tau = 0.0;
          for (int i = 1; i <= 10; i++) {
            vec3 q = vPosW + mdir * (float(i) * dstep);
            vec3 rq = q - uCenter;
            float rr = length(rq - nrm * dot(rq, nrm));   // EnglishEnglishEnglishEnglishEnglishEnglishEnglish
            if (rr < uRingInner || rr > uRingOuter) continue;
            float uu = (rr - uRingInner) / max(rSpan, 1.0);
            tau += texture2D(uMap, vec2(uu, 0.5)).a * dstep;
          }
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：tau English"EnglishEnglishEnglishEnglishEnglish τ×Δr"，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
          // （Δr EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
          // EnglishEnglishEnglishEnglishEnglishEnglish，tau EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish × EnglishEnglishEnglishEnglishEnglishEnglishEnglish"，
          // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglish 1/μ0；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
          tau /= max(rSpan, 1.0);
          // EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish B EnglishEnglish A EnglishEnglish
          // EnglishEnglishEnglishEnglishEnglish 20–40%），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 0.29 EnglishEnglish，
          // EnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"。
          shadow *= 1.0 - 0.35 * (1.0 - exp(-tau * 1.2 / max(mu0, 0.06)));
        }
        vec3 col = tex.rgb * uTint * (lit * shadow * uSunI * 3.2 + 0.002);
        gl_FragColor = vec4(col, tex.a * uOpacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  mat.userData.uniforms = uniforms;

  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 50;
  return mesh;
}
