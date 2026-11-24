// EnglishEnglish：Medium English"EnglishEnglishEnglishEnglishEnglishEnglish High"EnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglish High/Low，
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglish、DEM EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
const MEDIUM = {
  tier: 'medium', label: 'Medium', pixelRatio: 1, atmoN: 16, atmoNL: 6,
  cloudN: 8, cloudNL: 3,
  terrainGrid: 52, anisotropy: 8, segHi: [80, 54], segLo: [44, 30],
  detail: true, textureSize: 4096, textureConcurrency: 2, shadowSize: 1536,
  rockCount: 400, targetFps: 60,
};
const HIGH = {
  tier: 'high', label: 'High', pixelRatio: 1.5, atmoN: 20, atmoNL: 8,
  cloudN: 10, cloudNL: 4,
  terrainGrid: 64, anisotropy: 8, segHi: [96, 64], segLo: [48, 32],
  detail: true, textureSize: 8192, textureConcurrency: 3, shadowSize: 2048,
  rockCount: 640, targetFps: 60,
};
const LOW = {
  tier: 'low', label: 'Low', pixelRatio: 1, atmoN: 12, atmoNL: 4,
  cloudN: 5, cloudNL: 2,
  terrainGrid: 40, anisotropy: 4, segHi: [64, 42], segLo: [40, 28],
  detail: false, textureSize: 4096, textureConcurrency: 2, shadowSize: 1024,
  rockCount: 240, targetFps: 45,
};
export const QUALITY = { ...HIGH, gpuName: '(EnglishEnglishEnglish)', hardware: 'unknown', renderScale: 1 };
export let IS_MOBILE = false;

// EnglishEnglishEnglishEnglishEnglishEnglish (TM)/(R)：'Intel(R) Arc(TM) A770'、'Intel(R) Arc(R) A380' EnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。
const ARC_MODEL = String.raw`Arc\s*(?:\((?:TM|R)\)\s*)?[AB]\d`;
const APPLE_M = String.raw`Apple\s*M[1-9]`;

export function classifyGpu(name = '') {
  if (/SwiftShader|llvmpipe|Basic Render|Software|Microsoft Basic/i.test(name)) return 'software';
  // Apple English M EnglishEnglishEnglishEnglishEnglish GPU English（EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish /Apple/ EnglishEnglishEnglishEnglishEnglishEnglish → Low，EnglishEnglishEnglishEnglish Mac EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  // EnglishEnglish M EnglishEnglishEnglish 'Apple GPU'（iOS）EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish IS_MOBILE EnglishEnglish Low。
  if (new RegExp(APPLE_M, 'i').test(name)) return 'discrete';
  if (new RegExp(`NVIDIA|GeForce|Quadro|RTX|GTX|Radeon\\s*(?:RX|Pro|VII|R[579]\\b)|FirePro|${ARC_MODEL}`, 'i').test(name)) {
    return 'discrete';
  }
  if (/Intel|Iris|Radeon.*Graphics|AMD.*Graphics|Apple|Mali|Adreno|PowerVR/i.test(name)) return 'integrated';
  return 'unknown';
}

export function qualityProfile(name, mobile = false, force = null) {
  const hardware = classifyGpu(name);
  // EnglishEnglishEnglishEnglish：EnglishEnglish force EnglishEnglish；EnglishEnglishEnglish GPU EnglishEnglish——EnglishEnglish/EnglishEnglishEnglishEnglishEnglish Low，
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English pickDiscreteTier），EnglishEnglishEnglishEnglishEnglish Low EnglishEnglishEnglishEnglishEnglish。
  const f = ['high', 'medium', 'low', 'lite'].includes(force) ? force : null;
  let tier = f === 'lite' ? 'low' : f;
  if (!tier) {
    if (mobile) tier = 'low';
    else if (hardware === 'discrete') tier = pickDiscreteTier(name);
    else tier = 'low';
  }
  const table = { high: HIGH, medium: MEDIUM, low: LOW };
  const profile = { ...(table[tier] ?? LOW), gpuName: name || '(EnglishEnglishEnglishEnglish)', hardware, renderScale: 1 };
  if (mobile) Object.assign(profile, { atmoN: 8, atmoNL: 3, cloudN: 3, cloudNL: 1, terrainGrid: 32,
    segHi: [48, 32], segLo: [32, 22], textureSize: 2048, rockCount: 160, targetFps: 40 });
  return profile;
}

/**
 * EnglishEnglishEnglishEnglishEnglish：Medium EnglishEnglishEnglish，High EnglishEnglish"EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish。
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglish（GT EnglishEnglish、GCN EnglishEnglish）English High EnglishEnglishEnglish 45 FPS
 * EnglishEnglish，EnglishEnglishEnglishEnglish Low EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English makeFpsGuard）。
 */
function pickDiscreteTier(name) {
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish (TM)/(R)：'Intel(R) Arc(TM) A770' EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
  // EnglishEnglish A770 EnglishEnglishEnglishEnglishEnglish medium（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
  // Apple EnglishEnglish Pro/Max/Ultra English High；EnglishEnglishEnglish M1/M2/M3（8–10 English GPU）English GTX 1650 EnglishEnglish，
  // English High EnglishEnglishEnglishEnglishEnglishEnglishEnglish 45 FPS EnglishEnglish，EnglishEnglishEnglishEnglish Low EnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  // GTX EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 9xx/10xx：GTX 960 English GTX 980 EnglishEnglish Maxwell EnglishEnglishEnglishEnglishEnglishEnglish，
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English medium），EnglishEnglishEnglishEnglish（English high）。
  const ample = new RegExp([
    String.raw`RTX\s*[2-9]\d{3}`,                 // EnglishEnglish RTX
    String.raw`GTX\s*(?:16\d{2}|10[6-9]\d|9[78]\d)`,  // 1650/1660、1060 EnglishEnglish、970/980
    String.raw`Radeon\s*RX\s*(?:[5-9]\d{3}|[1-9]\d{4})`,
    ARC_MODEL,
    String.raw`Quadro\s*RTX`,
    APPLE_M + String.raw`\s*(?:Pro|Max|Ultra)`,   // EnglishEnglishEnglish M1/M2/M3 EnglishEnglish GTX 1650 English
  ].join('|'), 'i');
  return ample.test(name) ? 'high' : 'medium';
}

export function detectMobile() {
  if (typeof window === 'undefined') return false;
  const mobileAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent ?? '');
  const iPadDesktopAgent = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return mobileAgent || iPadDesktopAgent;
}

export function initQuality(renderer) {
  IS_MOBILE = detectMobile();
  let name = '';
  try {
    const gl = renderer.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (ext) name = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? '');
  } catch { /* Hidden GPU names start conservatively; frame pacing still adapts. */ }
  const force = new URLSearchParams(globalThis.location?.search ?? '').get('quality');
  Object.assign(QUALITY, qualityProfile(name, IS_MOBILE, force));
  if (IS_MOBILE) document.documentElement.classList.add('touch');
  console.info(`[quality] GPU: ${QUALITY.gpuName} → ${QUALITY.label} (${QUALITY.hardware})`);
  return QUALITY;
}

/** Resize HDR targets together with the drawing buffer. Ignore background/resume
 * gaps, retain each hardware profile, and use hysteresis to prevent oscillation. */
export function makeFpsGuard(renderer, onDegrade, onRestore, onResolutionChange) {
  const baseline = renderer.getPixelRatio();
  const baselineDetail = QUALITY.detail;
  // EnglishEnglishEnglishEnglish：?pr=1 EnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglish**。
  // EnglishEnglishEnglishEnglish（SwiftShader）EnglishEnglishEnglishEnglishEnglish 960×600 EnglishEnglish 729×456 EnglishEnglishEnglish，EnglishEnglishEnglishEnglish
  // EnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
  const PIN_PR = (() => {
    try {
      const v = new URLSearchParams(window.location.search).get('pr');
      return v == null ? null : Math.max(0.25, Math.min(3, Number(v) || 1));
    } catch { return null; }
  })();
  if (PIN_PR != null) {
    renderer.setPixelRatio(PIN_PR);
    return () => {};   // EnglishEnglishEnglish：EnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglish
  }
  const scales = [1, 0.88, 0.76, 0.65];
  let level = 0, time = 0, samples = [], lowSec = 0, highSec = 0, cooldown = 0;
  function change(next) {
    const degrading = next > level;
    level = next; lowSec = highSec = 0;
    // Integrated GPUs need a prompt second reduction during asset decoding or
    // CPU fallback generation; recovery still waits for a stable clear margin.
    cooldown = degrading && QUALITY.tier === 'low' ? 2 : 8;
    QUALITY.renderScale = scales[level];
    QUALITY.detail = baselineDetail;
    renderer.setPixelRatio(baseline * scales[level]);
    onResolutionChange?.();
    (next > 0 ? onDegrade : onRestore)?.();
  }
  return (dt) => {
    if (!Number.isFinite(dt) || dt <= 0 || dt > 0.5 ||
        (typeof document !== 'undefined' && document.hidden) || renderer.xr?.isPresenting) {
      time = 0; samples = []; lowSec = highSec = 0; return;
    }
    time += dt; samples.push(dt);
    if (time < 1) return;
    const fps = samples.length / time;
    const sorted = [...samples].sort((a, b) => a - b);
    const p95 = sorted[Math.floor((sorted.length - 1) * 0.95)];
    QUALITY.fps = fps; QUALITY.p95Ms = p95 * 1000;
    time = 0; samples = []; cooldown = Math.max(0, cooldown - 1);
    // Low must react before sustained pacing drops below its usable target.
    // High retains headroom for 60 Hz rAF clocks that report just under 60 FPS.
    const slow = fps < QUALITY.targetFps * (QUALITY.tier === 'high' ? 0.9 : 1.1) || p95 > 0.04;
    lowSec = slow ? lowSec + 1 : 0;
    highSec = fps >= Math.min(58, QUALITY.targetFps * 1.2) && p95 < 0.022 ? highSec + 1 : 0;
    if (cooldown === 0 && lowSec >= 3 && level < scales.length - 1) change(level + 1);
    else if (cooldown === 0 && highSec >= 20 && level > 0) change(level - 1);
  };
}
