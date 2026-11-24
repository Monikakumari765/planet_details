// EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）。EnglishEnglish**EnglishEnglishEnglish**（English main.js English ?meter=1 EnglishEnglish）：
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglishEnglishEnglish：EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglish
// EnglishEnglishEnglish。EnglishEnglishEnglishEnglish（EnglishEnglishEnglish）EnglishEnglishEnglish**EnglishEnglishEnglishEnglish**EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglish
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglish：English HDR EnglishEnglishEnglishEnglishEnglishEnglishEnglish 1×1 EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish 16 EnglishEnglish**EnglishEnglish**EnglishEnglish
// （EnglishEnglishEnglishEnglishEnglish = EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglish（150ms）
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
import * as THREE from 'three';

const FRAG = /* glsl */ `
  uniform sampler2D uTex;
  varying vec2 vUv;
  void main() {
    float acc = 0.0, wsum = 0.0;
    for (int y = 0; y < 4; y++) {
      for (int x = 0; x < 4; x++) {
        // EnglishEnglishEnglishEnglishEnglishEnglish 60%：EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
        vec2 uv = 0.2 + (vec2(float(x), float(y)) + 0.5) / 4.0 * 0.6;
        vec3 c = texture2D(uTex, uv).rgb;
        float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
        // **EnglishEnglishEnglishEnglishEnglishEnglishEnglish**：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        float w = smoothstep(2e-4, 4e-3, l);
        acc += log2(max(l, 1e-6)) * w;
        wsum += w;
      }
    }
    // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish）：EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    if (wsum < 1e-3) { gl_FragColor = vec4(0.0); return; }
    gl_FragColor = vec4(acc / wsum, 0.0, 0.0, 1.0);
  }
`;

export function createMetering(renderer) {
  let rt;
  try {
    rt = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.FloatType, format: THREE.RGBAFormat, depthBuffer: false, stencilBuffer: false,
    });
  } catch { return null; }
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTex: { value: null } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: FRAG,
    depthTest: false, depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  quad.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(quad);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const buf = new Float32Array(4);
  let ok = true;
  return {
    /** EnglishEnglish log2(EnglishEnglishEnglishEnglishEnglishEnglish)；EnglishEnglishEnglishEnglish null */
    sample(srcTex) {
      if (!ok || !srcTex) return null;
      try {
        mat.uniforms.uTex.value = srcTex;
        const prev = renderer.getRenderTarget();
        renderer.setRenderTarget(rt);
        renderer.render(scene, cam);
        renderer.readRenderTargetPixels(rt, 0, 0, 1, 1, buf);
        renderer.setRenderTarget(prev);
        const v = buf[0];
        if (!Number.isFinite(v)) { ok = false; return null; }
        return v;
      } catch { ok = false; return null; }
    },
  };
}
