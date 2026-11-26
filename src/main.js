// EnglishEnglishEnglish：Google Earth EnglishEnglish × EnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglish：
//   orbit(EnglishEnglish, EnglishEnglish) — GE EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish/EnglishEnglish/EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish
//   fly(EnglishEnglishEnglishEnglish)     — EnglishEnglishEnglishEnglish 6DOF EnglishEnglish（F EnglishEnglish）
//   walk(EnglishEnglishEnglishEnglish)    — EnglishEnglishEnglishEnglish G EnglishEnglish，EnglishEnglishEnglishEnglish
// EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish/EnglishEnglish）EnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglish → HDR EnglishEnglish。

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { SimClock, dateToJD, jdUTtoTT } from './astro/time.js';
import { surfaceGravity } from './astro/bodies.js';
import { World } from './engine/floating.js';
import { Ship, Input } from './engine/ship.js';
import { OrbitCamera } from './engine/orbitCamera.js';
import { buildSolarSystem, texturesOfBody } from './scene/builder.js';
import { createStarfield, SKY_R } from './scene/starfield.js';
import { loadStarCatalog } from './astro/starCatalog.js';
import { NAMED_STARS } from './astro/stars.generated.js';
import { photoSkyVisibility } from './scene/photoExposure.js';
import { SURFACE_ALBEDO } from './scene/planetMaterial.js';
import { createMetering } from './engine/metering.js';
import { atmosphereFog } from './scene/atmosphere.js';
import { createBelts, createOortCloud } from './scene/belts.js';
import { createSmallBodies } from './scene/smallBodies.js';
import { createTNOScene } from './scene/tnoScene.js';
import { createComets } from './scene/comets.js';
import { createHeliosphere, VOYAGERS, voyagerPosition } from './scene/heliosphere.js';
import { TerrainManager } from './scene/terrain.js';
import { Labels } from './ui/labels.js';
import { HUD, targetInfo } from './ui/hud.js';
import { SearchUI } from './ui/search.js';
import { asset, eclToWorldArr, KM_PER_AU, raDecToWorld } from './config.js';
import { initQuality, makeFpsGuard, QUALITY, IS_MOBILE } from './engine/quality.js';
import { TouchControls } from './ui/touchControls.js';
import { t, bodyName, LANG, applyDomI18n } from './ui/i18n.js';
import { AudioEngine } from './engine/audio.js';
import { Compass } from './ui/compass.js';
import { ScaleReference } from './ui/scaleRef.js';
import { Bookmarks } from './ui/bookmarks.js';
import { TourSystem } from './ui/tours.js';
import { Narrator } from './ui/tts.js';
import { buildTourUI } from './ui/tourUI.js';
import { TeacherToolkit } from './ui/teacher.js';
import { EclipseSystem } from './scene/eclipses.js';
import { WebXRManager } from './engine/webxr.js';
import { createCockpit, createShipModel, createHelmet, createEvaSuit } from './scene/cockpit.js';
import { createSpacecraftModel, makeSpacecraftGlow, SPACECRAFT_TIMELINES,
         NEW_HORIZONS, newHorizonsPosition } from './scene/spacecraft.js';
import { createApolloLandmarks, createRoverSites } from './scene/landmarks.js';
import { createEphemerisLoader } from './engine/ephemerisLoader.js';
import { createCameraFeel } from './engine/cameraFeel.js';
import { bootstrapRenderer } from './engine/rendererBootstrap.js';
import { mountAstrobiologyLab } from './ui/astroLab.js';
import { createTerraformingOverlays } from './scene/terraformingOverlays.js';
import { createCosmicMotion } from './scene/cosmicMotion.js';
import { CosmicAudio, normalizePlanetProximity } from './audio/cosmicAudio.ts';
import { createUserObserverBeacon } from './scene/userObserverBeacon.js';
import { mountUserObserver } from './ui/userObserver.js';
import { mountCameraControls } from './ui/cameraControls.js';
import {
  observerSurfacePoint,
  worldVectorToEquatorialDirection,
} from './physics/userObserver.ts';
import { planetPosition } from './astro/planets.js';

let builder = null;
let terraformingOverlays = null;
let sky = null;
let cosmicMotion = null;
let observerBeacon = null;
let observerUi = null;
let observerFocusTween = null;
let universeMotionEnabled = true;
const cosmicAudio = new CosmicAudio();
const NORMAL_VIEW_DISTANCE_KM = 45 * KM_PER_AU;
let terraformOverlayState = {
  showHabitableZone: false,
  showLightPulse: false,
  targetPlanetId: 'earth',
};
const pendingPlanetAtmosphereVisuals = new Map();
/**
 * @param {string} planetName
 * @param {{ pressureAtm: number, co2Pct: number, o2Pct: number, predictedTempK: number, isReset?: boolean }} params
 * @returns {boolean}
 */
window.setPlanetAtmosphereVisual = (planetName, params = {}) => {
  const key = String(planetName).trim().toLowerCase();
  if (!params || typeof params !== 'object') {
    throw new TypeError('Planet atmosphere visual parameters must be an object');
  }
  if (
    !params.isReset &&
    (!Number.isFinite(params.pressureAtm) ||
      !Number.isFinite(params.co2Pct) ||
    !Number.isFinite(params.o2Pct) ||
    !Number.isFinite(params.predictedTempK))
  ) {
    throw new TypeError('Atmosphere pressure, CO₂, O₂, and predicted temperature must be finite numbers');
  }
  if (builder) return builder.setPlanetAtmosphereVisual(key, params);
  pendingPlanetAtmosphereVisuals.set(key, { ...params });
  return true;
};
window.addEventListener('terraform-atmosphere-update', event => {
  const detail = event.detail;
  if (!detail || typeof detail !== 'object' || typeof detail.planetName !== 'string') {
    throw new TypeError('terraform-atmosphere-update requires a planetName and visual parameters');
  }
  const { planetName, ...params } = detail;
  window.setPlanetAtmosphereVisual(planetName, params);
});
window.addEventListener('terraform-physics-overlays-change', event => {
  const detail = event.detail;
  if (!detail || typeof detail !== 'object') {
    throw new TypeError('terraform-physics-overlays-change requires overlay state');
  }
  terraformOverlayState = {
    showHabitableZone: !!detail.showHabitableZone,
    showLightPulse: !!detail.showLightPulse,
    targetPlanetId: String(detail.targetPlanetId ?? 'earth').toLowerCase(),
  };
  terraformingOverlays?.setState(terraformOverlayState);
});
window.addEventListener('continuous-universe-motion-change', event => {
  const detail = event.detail;
  if (!detail || typeof detail.enabled !== 'boolean') {
    throw new TypeError('continuous-universe-motion-change requires an enabled boolean');
  }
  universeMotionEnabled = detail.enabled;
  sky?.setMotionEnabled(universeMotionEnabled);
  cosmicMotion?.setEnabled(universeMotionEnabled);
});
window.addEventListener('cosmic-audio-toggle', event => {
  const detail = event.detail;
  if (!detail || typeof detail.enabled !== 'boolean') {
    throw new TypeError('cosmic-audio-toggle requires an enabled boolean');
  }
  cosmicAudio.setEnabled(detail.enabled).then(() => {
    window.dispatchEvent(new CustomEvent('cosmic-audio-state-change', {
      detail: { enabled: cosmicAudio.isEnabled },
    }));
  }).catch(error => {
    console.error('[cosmicAudio]', error);
    window.dispatchEvent(new CustomEvent('cosmic-audio-state-change', {
      detail: { enabled: cosmicAudio.isEnabled, error: 'Audio could not be started in this browser.' },
    }));
  });
});
window.addEventListener('cosmic-audio-volume-change', event => {
  const volume = event.detail?.volume;
  if (!Number.isFinite(volume)) {
    throw new TypeError('cosmic-audio-volume-change requires a finite volume');
  }
  cosmicAudio.setVolume(volume);
});

mountAstrobiologyLab();

const renderBoot = await bootstrapRenderer({
  canvas: document.getElementById('app'), create: options => new THREE.WebGLRenderer(options),
  status({ state }) {
    const text = document.getElementById('start-btn-text');
    if (text) { text.removeAttribute('data-i18n'); text.textContent = t(state === 'failed' ? 'start.retryGpu' : 'start.retryingGpu'); }
    if (state === 'failed') {
      const message = document.createElement('p');message.id = 'startup-error';message.setAttribute('role', 'alert');message.textContent = t('start.gpuUnavailable');
      const button = document.getElementById('start-btn');button.before(message);button.disabled = false;button.onclick = () => location.reload();
    }
  },
});
// Failure leaves an interactive retry screen; skip graphics-dependent setup.
if (renderBoot) {
const { renderer, canvas } = renderBoot;
initQuality(renderer); // EnglishEnglishEnglish buildSolarSystem EnglishEnglish（EnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, QUALITY.pixelRatio));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
// EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglishEnglishEnglishEnglish builder English DirectionalLight EnglishEnglishEnglishEnglish；
// EnglishEnglishEnglish castShadow EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = true;

const STAR_DEG = Math.PI / 180; // EnglishEnglishEnglishEnglish/EnglishEnglish（English）→ EnglishEnglish

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0); // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（English fog:true EnglishEnglishEnglishEnglishEnglish）

// EnglishEnglishEnglishEnglish（IBL）。EnglishEnglishEnglishEnglishEnglishEnglishEnglish envMap，EnglishEnglish metalness 0.6–0.8 EnglishEnglishEnglish——
// EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"、EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：
// MeshStandardMaterial EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish (1−metalness) EnglishEnglish 20%，
// EnglishEnglishEnglishEnglishEnglish 0，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglish"EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish。
{
  const W = 256, H = 128;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0.0, '#1a2233');   // EnglishEnglish：EnglishEnglish
  grd.addColorStop(0.5, '#2a2a30');   // EnglishEnglishEnglish
  grd.addColorStop(1.0, '#3a332c');   // EnglishEnglish：EnglishEnglish
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  // EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish）
  const sunGrd = g.createRadialGradient(W * 0.5, H * 0.28, 0, W * 0.5, H * 0.28, W * 0.16);
  sunGrd.addColorStop(0, 'rgba(255,244,230,1)');
  sunGrd.addColorStop(0.25, 'rgba(255,230,200,0.55)');
  sunGrd.addColorStop(1, 'rgba(255,230,200,0)');
  g.fillStyle = sunGrd; g.fillRect(0, 0, W, H);
  const envTex = new THREE.CanvasTexture(cv);
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  envTex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  scene.environment = pmrem.fromEquirectangular(envTex).texture;
  // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  scene.environmentIntensity = 0.35;
  envTex.dispose(); pmrem.dispose();
}
// R11：far EnglishEnglishEnglish ~106 ly EnglishEnglishEnglishEnglishEnglishEnglishEnglish 3D EnglishEnglish（EnglishEnglish）+ EnglishEnglishEnglishEnglishEnglishEnglish（100000 AU=1.58 ly）
const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 5e-7, 1e15);
scene.add(camera);
// EnglishEnglishEnglishEnglishEnglishEnglishEnglish（English scene/cockpit.js）。
//
// **EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish**：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
// （EnglishEnglish 2.2R EnglishEnglishEnglish near=5849 km），EnglishEnglishEnglish 0.6m、EnglishEnglishEnglish 16m EnglishEnglishEnglishEnglishEnglishEnglishEnglish——
// EnglishEnglishEnglishEnglishEnglishEnglishEnglish camera English，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish 1cm，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
const overlayScene = new THREE.Scene();
const overlayCam = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.01, 200);
// EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish，
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
{
  // EnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglish**（+z）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish +z EnglishEnglishEnglish
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglish -z（EnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglish，
  // EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  const key = new THREE.DirectionalLight(0xfff4e8, 2.4);
  key.position.set(0.35, 0.55, 1.0);
  overlayScene.add(key);
  const fill = new THREE.DirectionalLight(0x8fa8c8, 0.9);
  fill.position.set(-0.6, -0.4, 0.8);
  overlayScene.add(fill);
  overlayScene.add(new THREE.AmbientLight(0x5a6472, 0.35));
}
const cockpit = createCockpit();
overlayScene.add(cockpit);
const shipModel = createShipModel();
overlayScene.add(shipModel);
const helmet = createHelmet();
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EVA EnglishEnglishEnglish/EnglishEnglish），English cockpit.js EnglishEnglishEnglish
const evaSuit = createEvaSuit();
evaSuit.visible = false;
// **EnglishEnglishEnglishEnglishEnglishEnglishEnglish**，EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish ship.quat EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
// EnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
overlayScene.add(overlayCam);
overlayCam.add(evaSuit);
overlayScene.add(helmet);
let thirdPerson = false;   // V EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish

const ambient = new THREE.AmbientLight(0x404858, 0.02);
scene.add(ambient);

// HDR EnglishEnglish：HalfFloat EnglishEnglishEnglishEnglish——EnglishEnglish（EnglishEnglish ×14 HDR、EnglishEnglish、EnglishEnglishEnglishEnglish）English
// ACES EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 8-bit EnglishEnglishEnglishEnglishEnglish 1.0，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(
  window.innerWidth, window.innerHeight,
  { type: THREE.HalfFloatType, colorSpace: THREE.LinearSRGBColorSpace,
    samples: QUALITY.tier === 'high' ? Math.min(4, renderer.capabilities.maxSamples) : 0 }
));
composer.addPass(new RenderPass(scene, camera));
// === EnglishEnglishEnglishEnglish ===
// EnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglish），
// EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）。
// EnglishEnglishEnglishEnglishEnglishEnglishEnglish HDR EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish（×14）、EnglishEnglish、EnglishEnglishEnglishEnglishEnglish
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish ~1–5）EnglishEnglishEnglishEnglish。
// EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish radius EnglishEnglishEnglish。
const bloomPass = (QUALITY.tier === 'high' || QUALITY.tier === 'low')
  ? new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight),
      QUALITY.tier === 'high' ? 0.22 : 0.16,   // strength：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      QUALITY.tier === 'high' ? 0.14 : 0.12,   // radius：EnglishEnglishEnglishEnglishEnglishEnglishEnglish
      1.05)                                     // threshold（HDR EnglishEnglishEnglishEnglish）
  : null;
if (bloomPass) composer.addPass(bloomPass);
composer.addPass(new OutputPass());
const fxaaPass = QUALITY.tier === 'low' ? new ShaderPass(FXAAShader) : null;
if (fxaaPass) composer.addPass(fxaaPass);
composer.setPixelRatio(renderer.getPixelRatio());
function syncRenderResolution() {
  composer.setPixelRatio(renderer.getPixelRatio());
  if (bloomPass) bloomPass.setSize(window.innerWidth, window.innerHeight);
  if (fxaaPass) fxaaPass.uniforms.resolution.value.set(
    1 / (window.innerWidth * renderer.getPixelRatio()),
    1 / (window.innerHeight * renderer.getPixelRatio()));
}
syncRenderResolution();

// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish）
const fpsGuard = makeFpsGuard(renderer, () => {
  for (const [, e] of builder.bodies) {
    if (e.mat?.userData.uniforms?.uDetailMode) e.mat.userData.uniforms.uDetailMode.value =
      QUALITY.detail ? ((e.phys.type === 'gas' || e.phys.type === 'ice') ? 2 : (e.phys.landable ? 1 : 0)) : 0;
  }
  hud.tip(t('tip.quality'));
}, () => {
  // EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish detailMode（English builder.detailModeOf EnglishEnglishEnglish）
  for (const [, e] of builder.bodies) {
    if (e.mat?.userData.uniforms?.uDetailMode) {
      e.mat.userData.uniforms.uDetailMode.value =
        QUALITY.detail ? ((e.phys.type === 'gas' || e.phys.type === 'ice') ? 2 : (e.phys.landable ? 1 : 0)) : 0;
    }
  }
}, syncRenderResolution);

const hud = new HUD();
const world = new World();
const input = new Input(window, canvas);
const ship = new Ship();
const orbitCam = new OrbitCamera(camera);
const simClock = new SimClock();
const clock = new THREE.Clock();

let comets, labels, searchUI, touchControls, belts, oortCloud, tnoScene, smallBodies;
let appMode = 'orbit'; // orbit | fly | walk
const registry = new Map();
let selectedId = null;
const ephemerisLoader = createEphemerisLoader();
// EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish / EnglishEnglishEnglishEnglish / FOV EnglishEnglish（English engine/cameraFeel.js）
const cameraFeel = createCameraFeel();
let cameraFovBase = 58;   // EnglishEnglishEnglishEnglishEnglishEnglishEnglish FOV，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
const voyagerEntries = [];
const boundaryEntries = [];
const IDENTITY_Q = new THREE.Quaternion();
let lastLabelClickFocus = 'earth';
let lastLabelClickId = null;
let labelClickTimer = null;
const LABEL_CLICK_WINDOW = 250;

// EnglishEnglishEnglishEnglishEnglishEnglishEnglish（#3-#55 EnglishEnglish）
let audioEngine, compass, scaleRef, bookmarks, tourSystem, narrator, teacherToolkit, eclipseSystem, webxr;
let apolloLandmarks, roverSites;

init();

async function init() {
  applyDomI18n();
  builder = await buildSolarSystem(scene, world, (d, total) => hud.setLoading(d, total), (d, total) => hud.setBgLoading(d, total));
  for (const [planetName, params] of pendingPlanetAtmosphereVisuals) {
    builder.setPlanetAtmosphereVisual(planetName, params);
  }
  pendingPlanetAtmosphereVisuals.clear();
  terraformingOverlays = createTerraformingOverlays(
    scene,
    builder.sunEntry.group,
    builder.bodies,
  );
  terraformingOverlays.setState(terraformOverlayState);

  sky = createStarfield(builder.cache.get('milkyway.jpg'));
  sky.setMotionEnabled(universeMotionEnabled);
  scene.add(sky.group); // EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）

  // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglish 3D EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，R11）。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。
  cosmicMotion = createCosmicMotion();
  cosmicMotion.setEnabled(universeMotionEnabled);
  scene.add(cosmicMotion.starGroup, cosmicMotion.dustGroup);
  world.register(new Float64Array(3), cosmicMotion.dustGroup);

  scene.add(sky.brightGroup);
  world.register(new Float64Array(3), sky.brightGroup);
  loadStarCatalog().then((cat) => {
    if (cat) { sky.setCatalog(cat); return; }
    // EnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**（EnglishEnglishEnglishEnglishEnglishEnglish HUD EnglishEnglishEnglishEnglishEnglish）。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglish
    // EnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglish"EnglishEnglishEnglishEnglishEnglish"。EnglishEnglishEnglishEnglishEnglishEnglish。
    hud.tip(t('tip.starsUnavailable'));
  });

  // English/EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  belts = createBelts();
  scene.add(belts);
  world.register(new Float64Array(3), belts);

  // EnglishEnglishEnglishEnglishEnglishEnglish（JPL SBDB EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish，English scene/smallBodies.js）
  smallBodies = createSmallBodies();
  scene.add(smallBodies.group);
  world.register(new Float64Array(3), smallBodies.group);

  // R11：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（2000–100000 AU）
  oortCloud = createOortCloud(); // { group, update(dSunAU) }
  scene.add(oortCloud.group);
  world.register(new Float64Array(3), oortCloud.group);
  const helio = createHeliosphere();
  scene.add(helio);
  world.register(new Float64Array(3), helio);
  comets = createComets(world);
  for (const e of comets.entries) scene.add(e.group);

  // EnglishEnglishEnglishEnglish（#30, #31：3D EnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglish）
  for (const vg of VOYAGERS) {
    const group = new THREE.Group();
    const posKm = new Float64Array(3);
    world.register(posKm, group);
    scene.add(group);
    // EnglishEnglish 1:1 EnglishEnglishEnglishEnglish 3D EnglishEnglish（EnglishEnglishEnglishEnglishEnglish）
    try {
      const model = createSpacecraftModel(vg.id);
      group.add(model);
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（AU EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      const glow = makeSpacecraftGlow(0x88ccff);
      group.add(glow);
    } catch { /* EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish Group，EnglishEnglishEnglishEnglishEnglishEnglishEnglish */ }
    voyagerEntries.push({ vg, posKm, group, posFn: (jd) => voyagerPosition(vg, jd) });
  }

  // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（NEW_HORIZONS / newHorizonsPosition /
  // createSpacecraftModel('newhorizons')），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglish。
  {
    const group = new THREE.Group();
    const posKm = new Float64Array(3);
    world.register(posKm, group);
    scene.add(group);
    try {
      group.add(createSpacecraftModel('newhorizons'));
      group.add(makeSpacecraftGlow(0x88ffcc));
    } catch { /* EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish Group */ }
    voyagerEntries.push({ vg: NEW_HORIZONS, posKm, group, posFn: (jd) => newHorizonsPosition(jd) });
  }

  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"）
  const DEG = Math.PI / 180;
  const noseLon = 255.4 * DEG, noseLat = 5.1 * DEG;
  const noseEcl = {
    x: Math.cos(noseLat) * Math.cos(noseLon),
    y: Math.cos(noseLat) * Math.sin(noseLon),
    z: Math.sin(noseLat),
  };
  for (const [id, nameZh, nameEn, rAU, desc] of [
    ['termshock', 'EnglishEnglishEnglishEnglish（EnglishEnglish）', 'Termination Shock', 90,
      'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English 90 AU）。EnglishEnglishEnglish 1 EnglishEnglish 2004 EnglishEnglishEnglishEnglishEnglish。'],
    ['heliopause', 'EnglishEnglishEnglishEnglish（EnglishEnglish）', 'Heliopause', 121,
      'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglish"EnglishEnglishEnglishEnglish"EnglishEnglishEnglish（English 121 AU）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。'],
  ]) {
    const posKm = new Float64Array([0, 0, 0]);
    const w = eclToWorldArr({ x: noseEcl.x * rAU * KM_PER_AU, y: noseEcl.y * rAU * KM_PER_AU, z: noseEcl.z * rAU * KM_PER_AU });
    posKm[0] = w[0]; posKm[1] = w[1]; posKm[2] = w[2];
    const group = new THREE.Group();
    group.position.set(0, 0, 0);
    world.register(posKm, group);
    scene.add(group);
    boundaryEntries.push({ id, nameZh, nameEn, desc, posKm, group, rAU });
  }

  // R11：28 EnglishEnglishEnglishEnglishEnglish（TNO）— EnglishEnglishEnglishEnglish、EnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglishEnglish sun.group（EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  tnoScene = createTNOScene(scene, world, builder.sunEntry.group);
  for (const [id, e] of tnoScene.entries) {
    registry.set(id, {
      nameZh: e.phys.nameZh, nameEn: e.phys.nameEn,
      desc: e.phys.desc, kind: 'tno',
      phys: { radiusKm: e.phys.radiusKm, type: 'dwarf' },
      posKm: e.posKm, relObj: e.group, quatRef: null,
      groundRadius: null,
      minDistKm: e.phys.radiusKm * 1.5, // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      viewDist: Math.max(e.phys.radiusKm * 12, 3e5),
    });
  }

  buildRegistry();
  observerBeacon = createUserObserverBeacon(builder.bodies.get('earth'));
  observerUi = mountUserObserver({
    onLocationChange: coordinates => observerBeacon.setLocation(coordinates),
    onFlyToLocation: focusObserverLocation,
  });
  mountCameraControls({
    onZoomIn: () => zoomOrbitCamera(0.72),
    onZoomOut: () => zoomOrbitCamera(1 / 0.72),
    onNormalView: resetNormalView,
  });
  setupLabels();
  searchUI = new SearchUI(registry, (id) => flyTo(id), {
    getOrbits: () => orbitLinesOn,
    toggleOrbits: () => { orbitLinesOn = !orbitLinesOn; },
    onSelect: () => { touchControls?.closeDirectory(); },
  });

  // Mobile on-screen controls — only created on touch devices (IS_MOBILE)
  if (IS_MOBILE) {
    touchControls = new TouchControls(input, {
      switchToFly:    switchToFly,
      switchToOrbit:  switchToOrbit,
      toggleOrbits:   () => { orbitLinesOn = !orbitLinesOn; },
      toggleAudio:    () => { audioEngine?.toggle(); },
      warpUp:         () => hud.warpUp(),
      warpDown:       () => hud.warpDown(),
    });
  }

  setupTerrainMgr();

  // EnglishEnglish：GE EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）
  builder.update(simClock.jdTT, ship.posKm);
  orbitCam.init(orbitEnv, 'earth', 4);
  syncShipToOrbit();
  select('earth');

  // ---- URL hash EnglishEnglish（#1）：EnglishEnglishEnglishEnglishEnglish；Ctrl+L EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ----
  applyLocationHash();
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyL' && !e.shiftKey) {
      e.preventDefault(); // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      copyShareUrl();
    }
  });

  document.getElementById('start-btn').addEventListener('click', () => hud.hideStart());
  let downX = 0, downY = 0;
  canvas.addEventListener('mousedown', (e) => { downX = e.clientX; downY = e.clientY; });
  canvas.addEventListener('click', (e) => {
    // fly/walk EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish）；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    if ((appMode === 'fly' || appMode === 'walk') && !input.locked && !IS_MOBILE) canvas.requestPointerLock();
    else if (input.locked && labels.aimedId) select(labels.aimedId);
    else if (appMode === 'orbit' && !input.locked && !orbitCam.flight &&
      Math.hypot(e.clientX - downX, e.clientY - downY) < 6) {
      // EnglishEnglishEnglishEnglish = EnglishEnglishEnglishEnglishEnglishEnglish（R10-fix-3：EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      const hit = pickBody(e.clientX, e.clientY);
      if (hit && hit.id !== orbitCam.focusId) {
        orbitCam.setPendingFocus(hit.id, hit.localDir, hit.localDist);
        select(hit.id);
        focusTipUntil = performance.now() + 2600;
      }
    }
  });
  input.onLockChange = (locked) => {
    // Esc EnglishEnglish → EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    if (!locked && appMode === 'fly' && !IS_MOBILE) switchToOrbit();
  };
  window.addEventListener('resize', onResize);
  hud.loadingDone();

  // ── EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（#3-#55 EnglishEnglish）──────────────────────────────
  // EnglishEnglishEnglishEnglish（#4, #32）：EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish
  audioEngine = new AudioEngine();

  // 3D EnglishEnglishEnglish（#37）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  compass = new Compass(document.body);

  // EnglishEnglishEnglishEnglishEnglish（#38）：EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish
  scaleRef = new ScaleReference(scene, camera);

  // EnglishEnglishEnglishEnglish（#52）：localStorage EnglishEnglishEnglish
  bookmarks = new Bookmarks();

  // EnglishEnglishEnglishEnglish（#41）：Web Speech API
  narrator = new Narrator();

  // EnglishEnglishEnglishEnglish（#39, #40）：EnglishEnglish flyTo/select EnglishEnglish
  tourSystem = new TourSystem({
    flyTo: (id) => flyTo(id),
    select: (id) => select(id),
    getMode: () => appMode,
    setMode: (m) => { if (m === 'orbit' && appMode !== 'orbit') switchToOrbit(); },
    hud: hud,
  });
  // EnglishEnglish UI EnglishEnglish（EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglish）；onNarration English TTS EnglishEnglishEnglishEnglishEnglishEnglish
  const tourUIState = buildTourUI(tourSystem, narrator);
  tourSystem.onNarration = (text) => {
    if (narrator.supported && tourUIState.ttsOn) narrator.speak(text, LANG);
  };

  // EnglishEnglishEnglishEnglishEnglish（#42）：English TourSystem EnglishEnglishEnglishEnglish（isActive/_activeTourId EnglishEnglishEnglishEnglishEnglishEnglish）
  teacherToolkit = new TeacherToolkit({
    tours: tourSystem,
    select: (id) => select(id),
    flyTo: (id) => flyTo(id),
    hud: hud,
    nameOf: (id) => bodyName(registry.get(id) ?? { nameZh: id, nameEn: id }),
  });

  // EnglishEnglishEnglishEnglishEnglishEnglish（#25）
  eclipseSystem = new EclipseSystem();

  // WebXR/VR EnglishEnglish（#33）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  webxr = new WebXRManager(renderer, camera, scene);
  webxr.init().then((supported) => {
    if (!supported) return;
    const btn = webxr.createButton();
    if (btn) document.body.appendChild(btn);
    webxr.setControllerCallback(handleXREvent);
  });

  // Apollo EnglishEnglishEnglishEnglishEnglish（#34）EnglishEnglishEnglishEnglishEnglishEnglish（#35）—— try-catch EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  try { apolloLandmarks = createApolloLandmarks(scene, terrainMgr); } catch (e) { console.error('[Apollo landmarks]', e); }
  try { roverSites = createRoverSites(scene, terrainMgr); } catch (e) { console.error('[Rover sites]', e); }

  // EnglishEnglishEnglishEnglishEnglish：C EnglishEnglishEnglish、M EnglishEnglish、Ctrl+B EnglishEnglishEnglishEnglish、Ctrl+Shift+B EnglishEnglishEnglishEnglishEnglishEnglish、Y EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyC' && !e.repeat) { e.preventDefault(); compass?.toggle(); }
    if (e.code === 'KeyM' && !e.repeat) {
      e.preventDefault();
      const on = audioEngine?.toggle();
      hud.tip(t(on ? 'tip.audioOn' : 'tip.audioOff'));
    }
    // I-14：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（ScaleReference.toggleCompare）EnglishEnglishEnglishEnglishEnglish——
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。U EnglishEnglishEnglish。
    if (e.code === 'KeyU' && !e.repeat) {
      e.preventDefault();
      const on = scaleRef?.toggleCompare();
      if (on !== undefined) showActionTip(t(on ? 'tip.compareOn' : 'tip.compareOff'));
    }
    if (e.code === 'KeyY' && !e.repeat && appMode === 'walk') {
      e.preventDefault();
      const on = scaleRef?.toggleHuman();
      showActionTip(t(on ? 'tip.humanOn' : 'tip.humanOff'));
    }
    if (e.code === 'KeyB' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (e.shiftKey) restoreLatestBookmark();
      else saveBookmark();
    }
  });

  // I-15：EnglishEnglishEnglishEnglishEnglish ?tour= EnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglish URL，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
  try {
    const wantTour = new URLSearchParams(window.location.search).get('tour');
    if (wantTour && tourSystem?.start) {
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      setTimeout(() => { try { tourSystem.start(wantTour); } catch { /* EnglishEnglishEnglishEnglish id */ } }, 1500);
    }
  } catch { /* English location EnglishEnglish */ }

  window.__game = { get __nearest() { return nearestCache; }, ship, simClock, overlayScene, overlayCam, cockpit, shipModel, select, flyTo, orbitCam, orbitEnv, builder, registry, input, terrainMgr, camera, getMode: () => appMode, setOrbitLinesVisible: (v) => { orbitLinesOn = v; }, audioEngine, compass, scaleRef, bookmarks, tourSystem, narrator, teacherToolkit, eclipseSystem, webxr, smallBodies, quality: QUALITY, ephemerisLoader, renderer, composer, apolloLandmarks, roverSites, sky, labels, tnoScene, comets, oortCloud };
  renderer.setAnimationLoop(loop);

  // ── EnglishEnglishEnglishEnglish：EnglishEnglish/EnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ──
  // requestAnimationFrame EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish simClock EnglishEnglish。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  function syncClockAfterWake() {
    if (simClock.paused) return;
    const jdBefore = simClock.jdTT;
    simClock.tick(0);
    const jdAfter = simClock.jdTT;
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish
    if (Math.abs(jdAfter - jdBefore) > 1e-12) {
      builder.update(jdAfter, ship.posKm);
      comets.update(jdAfter, ship.posKm);
      tnoScene.update(jdAfter, ship.posKm);
      for (const v of voyagerEntries) {
        const p = v.posFn(jdAfter);
        const w = eclToWorldArr(p);
        v.posKm[0] = w[0]; v.posKm[1] = w[1]; v.posKm[2] = w[2];
      }
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncClockAfterWake();
  });
  window.addEventListener('pageshow', syncClockAfterWake);
  window.addEventListener('focus', syncClockAfterWake);
}

function buildRegistry() {
  for (const [id, e] of builder.bodies) {
    registry.set(id, {
      nameZh: e.phys.nameZh, nameEn: e.phys.nameEn, phys: e.phys,
      desc: e.phys.desc, parentId: e.parentId,
      kind: id === 'sun' ? 'star' : e.isMoon ? 'moon' : 'planet',
      posKm: e.posKm, relObj: e.group, quatRef: e.mesh.quaternion,
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（R7 #1/#5）
      groundRadius: e.phys.landable ? (dir) => terrainMgr.heightAt(id, dir) : null,
      minDistKm: !e.phys.landable && e.phys.atmosphere && id !== 'sun'
        ? e.phys.radiusKm * 1.0012 : null,
    });
  }
  for (const e of comets.entries) {
    registry.set(e.c.id, {
      nameZh: e.c.nameZh, nameEn: e.c.nameEn, desc: e.c.desc, kind: 'comet',
      phys: { radiusKm: 10 }, posKm: e.posKm, relObj: e.group, viewDist: 2.5e6,
    });
  }
  for (const v of voyagerEntries) {
    registry.set(v.vg.id, {
      nameZh: v.vg.nameZh, nameEn: v.vg.nameEn, desc: v.vg.desc, kind: 'probe',
      phys: { radiusKm: 0.01 }, posKm: v.posKm, relObj: v.group, viewDist: 8e5,
    });
  }
  for (const b of boundaryEntries) {
    registry.set(b.id, {
      nameZh: b.nameZh, nameEn: b.nameEn, desc: b.desc, kind: 'boundary',
      phys: { radiusKm: 1 }, posKm: b.posKm, relObj: b.group, viewDist: 2.5 * KM_PER_AU,
    });
  }
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish，#7）。kind:'region' English pickBody/centerHit English
  // EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  // radiusKm EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（dist < radiusKm×1.6 EnglishEnglishEnglish）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  registry.set('asteroidbelt', {
    nameEn: 'Asteroid Belt', kind: 'region',
    desc: 'EnglishEnglishEnglishEnglishEnglish（2.1–3.4 AU）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
    phys: { radiusKm: 2 * KM_PER_AU }, posKm: new Float64Array(3), relObj: belts, viewDist: 5.5 * KM_PER_AU,
  });
  registry.set('kuiperbelt', {
    nameEn: 'Kuiper Belt', kind: 'region',
    desc: 'EnglishEnglishEnglishEnglish（30–50 AU）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
    phys: { radiusKm: 40 * KM_PER_AU }, posKm: new Float64Array(3), relObj: belts, viewDist: 75 * KM_PER_AU,
  });
  registry.set('oortcloud', {
    nameEn: 'Oort Cloud', kind: 'region',
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish 2 000–100 000 AU，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
    phys: { radiusKm: 200 * KM_PER_AU }, posKm: new Float64Array(3), relObj: oortCloud.group, viewDist: 6000 * KM_PER_AU,
  });
}

/** OrbitCamera EnglishEnglishEnglishEnglishEnglish */
const orbitEnv = {
  get(id) {
    const t = registry.get(id);
    return {
      posKm: t.posKm,
      radiusKm: t.phys?.radiusKm ?? 1,
      ringsOuterKm: t.phys?.rings?.outerKm ?? null,
      quat: t.quatRef ?? IDENTITY_Q,
      viewDist: t.viewDist,
      groundRadius: t.groundRadius ?? null,
      minDistKm: t.minDistKm ?? null,
    };
  },
  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（id+EnglishEnglish km）——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
   * （R8 #2 / R9-1b/1d）。EnglishEnglishEnglishEnglishEnglish null。 */
  centerHit(posKm, dir) {
    let best = null;
    for (const [id, t] of registry) {
      if (t.kind === 'region') continue; // EnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      const R = t.phys?.radiusKm ?? 0;
      if (R < 1) continue; // EnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      const margin = R * 1.004 + 1; // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      const ox = t.posKm[0] - posKm[0];
      const oy = t.posKm[1] - posKm[1];
      const oz = t.posKm[2] - posKm[2];
      const b = ox * dir.x + oy * dir.y + oz * dir.z;
      if (b <= 0) continue;
      const det = b * b - (ox * ox + oy * oy + oz * oz - margin * margin);
      if (det < 0) continue;
      const tHit = b - Math.sqrt(det);
      if (tHit > 1e-6 && (best === null || tHit < best.depth)) best = { id, depth: tHit };
    }
    return best;
  },
  centerDepth(posKm, dir) { return this.centerHit(posKm, dir)?.depth ?? null; },
};

function setupLabels() {
  labels = new Labels(document.getElementById('labels'), camera);
  // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish，EnglishEnglish/PageUpDown EnglishEnglishEnglishEnglishEnglishEnglishEnglish）；
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish fromId EnglishEnglishEnglishEnglishEnglishEnglish。
  labels.onSelect = (id) => {
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    if (appMode === 'orbit' && !orbitCam.flight && !id.startsWith('star_') &&
        registry.get(id)?.kind !== 'region') {
      if (!labelClickTimer || lastLabelClickId !== id) {
        lastLabelClickFocus = orbitCam.focusId;
      }
      lastLabelClickId = id;
      clearTimeout(labelClickTimer);
      labelClickTimer = setTimeout(() => { labelClickTimer = null; lastLabelClickId = null; }, LABEL_CLICK_WINDOW);
      if (id !== orbitCam.focusId) {
        orbitCam.setPendingFocus(id);
        focusTipUntil = performance.now() + 2600;
      }
    }
    select(id);
  };
  labels.onFlyTo = (id) => {
    clearTimeout(labelClickTimer);
    labelClickTimer = null;
    lastLabelClickId = null;
    const fromId = appMode === 'orbit' ? (lastLabelClickFocus ?? orbitCam.focusId) : null;
    flyTo(id, fromId);
  };
  for (const [id, t] of registry) {
    labels.add({
      id, name: bodyName(t),
      kind: t.kind === 'moon' ? 'moon' : t.kind === 'planet' || t.kind === 'star' ? 'planet'
        : ['region', 'tno', 'comet', 'probe', 'boundary'].includes(t.kind) ? t.kind : 'poi',
      radiusKm: t.phys?.radiusKm ?? 1,
      getRelPos: (v) => v.copy(t.relObj.position),
    });
  }
  // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglish）。
  // EnglishEnglishEnglish 2.5 English：BSC5 English 436 EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish；2.5 EnglishEnglishEnglishEnglishEnglishEnglish，
  // English"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——
  // stars.generated.js English zh EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  for (const s of NAMED_STARS) {
    if (s.mag > 2.5) continue;
    // EnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglish**：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglish，EnglishEnglishEnglishEnglish）。
    const dirWorld = raDecToWorld(s.ra * 15 * STAR_DEG, s.dec * STAR_DEG, new THREE.Vector3());
    const name = s.en;
    labels.add({
      id: 'star_' + s.en, name, kind: 'fixstar', radiusKm: 0.001,
      distText: s.ly > 0 ? s.ly + ' ' + t('u.ly') : '',
      getRelPos: (v) => v.copy(dirWorld).multiplyScalar(SKY_R * 0.97),
    });
  }
}

function select(id) {
  ephemerisLoader.prefetch(id, simClock.jdTT);
  selectedId = id;
  if (id !== 'earth') observerUi?.setTargetPlanet(id);
}

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish，~0.7° EnglishEnglish，R10）。EnglishEnglish { id, t, localDir, localDist } English null */
const _pickDir = new THREE.Vector3();
const _pickP = new THREE.Vector3();
const _pickHit = new THREE.Vector3();
const _pickQ = new THREE.Quaternion();
let focusTipUntil = 0;
let actionTipUntil = 0; // EnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglishEnglish

/** EnglishEnglishEnglishEnglish：EnglishEnglish 2.5 English，EnglishEnglish updateTip EnglishEnglishEnglish */
function showActionTip(text, ms = 2500) {
  actionTipUntil = performance.now() + ms;
  hud.tip(text);
}
function pickBody(cx, cy) {
  _pickDir.set(
    (cx / window.innerWidth) * 2 - 1, -((cy / window.innerHeight) * 2 - 1), 0.5
  ).unproject(camera).normalize(); // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  let best = null;
  for (const [id, t] of registry) {
    if (t.kind === 'region') continue; // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    const R = t.phys?.radiusKm ?? 0;
    if (R < 1) continue;
    _pickP.copy(t.relObj.position); // EnglishEnglishEnglishEnglishEnglishEnglish
    const b = _pickP.dot(_pickDir);
    if (b <= 0) continue;
    const margin = Math.max(R, b * 0.012); // EnglishEnglishEnglishEnglishEnglish ~0.7° EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    const det = b * b - (_pickP.lengthSq() - margin * margin);
    if (det < 0) continue;
    const tHit = b - Math.sqrt(det);
    if (best === null || tHit < best.t) best = { id, t: Math.max(tHit, 0), entry: t, p: _pickP.clone() };
  }
  if (!best) return null;
  const R = best.entry.phys?.radiusKm ?? 1;
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）
  _pickHit.copy(_pickDir).multiplyScalar(best.t).sub(best.p);
  // EnglishEnglishEnglishEnglishEnglish
  _pickQ.copy(best.entry.quatRef ?? IDENTITY_Q).invert();
  const localDist = Math.max(_pickHit.length(), R * 0.1);
  const localDir = _pickHit.clone().applyQuaternion(_pickQ).normalize();
  return { id: best.id, t: best.t, localDir, localDist };
}

/** GE EnglishEnglishEnglish：EnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（fromId EnglishEnglishEnglish orbit EnglishEnglishEnglishEnglishEnglishEnglish） */
function flyTo(id, fromId = null, arrivalDistance = null) {
  if (!registry.has(id)) return;
  select(id);
  if (appMode !== 'orbit') {
    // EnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English quat：EnglishEnglishEnglishEnglish）
    const focus = nearestCache?.id ?? 'sun';
    document.exitPointerLock?.();
    orbitCam.adoptPosition(orbitEnv, focus, ship.posKm, ship.quat);
    appMode = 'orbit';
    ship.mode = 'fly';
  }
  orbitCam.flyTo(orbitEnv, id, fromId, arrivalDistance);
}

function prepareOrbitCameraAction() {
  if (appMode !== 'orbit') switchToOrbit();
  if (orbitCam.flight) orbitCam.cancelFlight(orbitEnv);
  if (orbitCam.transition || orbitCam.pendingFocusId) {
    orbitCam.adoptPosition(orbitEnv, orbitCam.focusId, orbitCam.posKm, orbitCam.quat);
  }
  observerFocusTween = null;
}

function zoomOrbitCamera(factor) {
  prepareOrbitCameraAction();
  orbitCam.zoomByFactor(factor, orbitEnv);
}

function resetNormalView() {
  prepareOrbitCameraAction();
  if (orbitCam.focusId === 'sun') {
    orbitCam.adoptPosition(orbitEnv, 'sun', orbitCam.posKm, orbitCam.quat);
    orbitCam.setDistanceTarget(NORMAL_VIEW_DISTANCE_KM, orbitEnv);
    return;
  }
  flyTo('sun', null, NORMAL_VIEW_DISTANCE_KM);
}

function focusObserverLocation(coordinates) {
  if (!builder || !registry.has('earth')) {
    throw new Error('Earth is not ready yet. Try again after the scene loads.');
  }
  if (appMode !== 'orbit') switchToOrbit();
  if (orbitCam.flight) orbitCam.cancelFlight(orbitEnv);

  const earth = builder.bodies.get('earth');
  const { position } = observerSurfacePoint(
    coordinates.latitude,
    coordinates.longitude,
    earth.phys.radiusKm,
  );
  const localDirection = new THREE.Vector3(position.x, position.y, position.z).normalize();
  const targetLat = Math.asin(THREE.MathUtils.clamp(localDirection.y, -1, 1));
  const targetLon = Math.atan2(-localDirection.z, localDirection.x);
  const targetDistance = Math.max(
    earth.phys.radiusKm * 1.04,
    orbitCam.minDist(orbitEnv.get('earth')),
  );

  select('earth');
  orbitCam.transition = null;
  if (orbitCam.focusId !== 'earth') {
    observerFocusTween = null;
    orbitCam.setPendingFocus('earth', localDirection, targetDistance);
    return;
  }

  orbitCam.pendingFocusId = null;
  orbitCam.pendingTargetLocal = null;
  observerFocusTween = {
    fromLat: orbitCam.lat,
    fromLon: orbitCam.lon,
    toLat: targetLat,
    toLon: targetLon,
    lonDelta: shortestAngleDelta(orbitCam.lon, targetLon),
    fromDistance: orbitCam.distTarget,
    toDistance: targetDistance,
    elapsed: 0,
    duration: 1.15,
  };
}

function shortestAngleDelta(from, to) {
  return ((to - from + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
}

function syncShipToOrbit() {
  ship.posKm[0] = orbitCam.posKm[0];
  ship.posKm[1] = orbitCam.posKm[1];
  ship.posKm[2] = orbitCam.posKm[2];
  ship.quat.copy(orbitCam.quat);
  ship.vel.set(0, 0, 0);
}

function switchToOrbit() {
  appMode = 'orbit';
  ship.mode = 'fly';
  document.exitPointerLock?.();
  const focus = nearestCache?.id ?? selectedId ?? 'sun';
  orbitCam.adoptPosition(orbitEnv, focus, ship.posKm, ship.quat); // EnglishEnglishEnglishEnglish（R7 #7）
  // EnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish GE EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、
  // EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"（R10 EnglishEnglishEnglishEnglishEnglish）。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：adoptPosition EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish this.tilt EnglishEnglish -autoTilt，
  // EnglishEnglishEnglish auto-tilt EnglishEnglish，English tilt EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、
  // EnglishEnglishEnglishEnglish dolly。EnglishEnglishEnglishEnglish auto-tilt EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  orbitCam.tilt = 0;
  orbitCam.panOffset.set(0, 0, 0); // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish dolly
  orbitCam.distTarget = orbitCam.dist + Math.max(orbitCam.dist * 0.002, 0.05);
  // English walk/fly EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 0.8s EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish walk，EnglishEnglish“EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglish”。
  lastTakeoff = performance.now();
  input.cancelGestures(); // EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
}

function switchToFly() {
  if (orbitCam.flight) orbitCam.cancelFlight(orbitEnv);
  appMode = 'fly';
  ship.mode = 'fly';
  syncShipToOrbit();
  if (!IS_MOBILE) canvas.requestPointerLock();
}

// ---------- EnglishEnglish ----------
const terrainMgr = new TerrainManager();
function setupTerrainMgr() {
  terrainMgr.physOf = (id) => builder.bodies.get(id).phys;
  terrainMgr.meshOf = (id) => builder.bodies.get(id).mesh;
  terrainMgr.getMapData = (id) => builder.mapDataOf(id);
}

// ---------- EnglishEnglishEnglish ----------
const _rel = new THREE.Vector3();
const _fogView = new THREE.Vector3();
const _fogUp = new THREE.Vector3();
const _fogSun = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _sunLocal = new THREE.Vector3();
let exposureTarget = 1;
let meter = null;
let lastMeterAt = 0;
let meteredLog2 = null;
let nearestCache = null;
let lastTakeoff = -1e9; // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish 0.8s EnglishEnglish，EnglishEnglishEnglish）
let prevOrbitDist = 0;   // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（km），EnglishEnglishEnglishEnglishEnglishEnglish
let approachMS = 0;      // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（m/s，English=EnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish

function loop() {
  const frameDelta = clock.getDelta();
  const dtReal = Math.min(frameDelta, 0.1);

  // EnglishEnglishEnglishEnglish
  handleTimeKeys();
  input.pollGamepad(appMode); // EnglishEnglish（EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish）
  simClock.rateTarget = hud.warpRate(simClock.paused); // rate English tick EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）
  const jdTT = simClock.tick(dtReal);

  // EnglishEnglishEnglishEnglish（try-catch EnglishEnglish：builder.update EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  try {
    builder.update(jdTT, ship.posKm);
  } catch (e) {
    if (!loop._builderErr) {
      loop._builderErr = true;
      console.error('[builder.update]', e);
      hud.tip('EnglishEnglishEnglishEnglishEnglishEnglish: ' + e.message);
    }
  }
  if (observerUi?.getCoordinates() && performance.now() - (loop._observerUpdate ?? 0) > 750) {
    loop._observerUpdate = performance.now();
    try {
      const date = new Date();
      const targetId = observerUi.getTargetPlanet();
      let direction = null;
      if (targetId !== 'earth') {
        const jdNowTT = jdUTtoTT(dateToJD(date));
        const earthPosition = planetPosition('earth', jdNowTT);
        const targetPosition = planetPosition(targetId, jdNowTT);
        const worldDirection = eclToWorldArr({
          x: targetPosition.x - earthPosition.x,
          y: targetPosition.y - earthPosition.y,
          z: targetPosition.z - earthPosition.z,
        });
        direction = worldVectorToEquatorialDirection({
          x: worldDirection[0],
          y: worldDirection[1],
          z: worldDirection[2],
        });
      }
      observerUi.update(date, direction);
    } catch (e) {
      loopErr('observerTelemetry', e);
    }
  }
  try { comets.update(jdTT, ship.posKm); } catch (e) { loopErr('comets', e); }
  try { tnoScene.update(jdTT, ship.posKm); } catch (e) { loopErr('tnoScene', e); }
  try { smallBodies.update(jdTT, ship.posKm); } catch (e) { loopErr('smallBodies', e); }
  try {
    for (const v of voyagerEntries) {
      const p = v.posFn(jdTT);
      const w = eclToWorldArr(p);
      v.posKm[0] = w[0]; v.posKm[1] = w[1]; v.posKm[2] = w[2];
    }
  } catch (e) { loopErr('voyagers', e); }

  const nearest = findNearest();
  nearestCache = nearest;
  const env = makeEnv(nearest);

  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish）：EnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  //
  // EnglishEnglish _lastTexBoost EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish performance.now() - undefined English NaN，
  // English NaN > 1000 EnglishEnglish false，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
  if (builder?.boostTextures && performance.now() - (loop._lastTexBoost ?? 0) > 1000) {
    loop._lastTexBoost = performance.now();
    const files = [];
    for (const id of [orbitCam.focusId, nearest?.id, selectedId]) {
      ephemerisLoader.prefetch(id, simClock.jdTT);
      if (id) for (const f of texturesOfBody(id)) if (!files.includes(f)) files.push(f);
    }
    if (files.length) builder.boostTextures(files);
  }

  // ---------- EnglishEnglishEnglishEnglish ----------
  try {
  if (appMode === 'orbit') {
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（GE EnglishEnglish）
    if (orbitCam.flight && input.drag.active) orbitCam.cancelFlight(orbitEnv);
    if (observerFocusTween) {
      if (input.drag.active || input.pan.active || input.wheel !== 0) {
        observerFocusTween = null;
      } else {
        const tween = observerFocusTween;
        tween.elapsed = Math.min(tween.elapsed + dtReal, tween.duration);
        const t = tween.elapsed / tween.duration;
        const eased = t * t * (3 - 2 * t);
        orbitCam.lat = tween.fromLat + (tween.toLat - tween.fromLat) * eased;
        orbitCam.lon = tween.fromLon + tween.lonDelta * eased;
        orbitCam.distTarget =
          tween.fromDistance + (tween.toDistance - tween.fromDistance) * eased;
        orbitCam.vLat = orbitCam.vLon = 0;
        if (t >= 1) {
          orbitCam.lat = tween.toLat;
          orbitCam.lon = tween.toLon;
          observerFocusTween = null;
        }
      }
    }
    orbitCam.update(dtReal, input, orbitEnv);
    syncShipToOrbit();
    // EnglishEnglishEnglish（m/s）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish ship.vel——
    // syncShipToOrbit() EnglishEnglishEnglishEnglishEnglish ship.vel EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish ship.vel.length()
    // EnglishEnglish 0，EnglishEnglishEnglishEnglishEnglishEnglishEnglish"0.004–0.03 rad EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish，
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish dist。
    {
      const dDist = prevOrbitDist - orbitCam.dist;
      // EnglishEnglishEnglishEnglish adoptPosition EnglishEnglish dist EnglishEnglish，EnglishEnglish 1km/English EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      approachMS = Math.abs(dDist) < 1 ? dDist / Math.max(dtReal, 1e-4) * 1000 : 0;
      prevOrbitDist = orbitCam.dist;
    }
    // EnglishEnglish：English G，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（NMS EnglishEnglishEnglishEnglishEnglish，R7 #1）
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ship.js English 20km EnglishEnglish。EnglishEnglishEnglishEnglishEnglish max(20, R*0.05)：
    // EnglishEnglishEnglish 318km——English G EnglishEnglish 300km EnglishEnglish**EnglishEnglishEnglishEnglish**EnglishEnglishEnglish +1.7m，
    // EnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    const landRange = 20;
    let autoLand = false;
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"。
    const inputIdle = !input.drag.active && !input.pan.active && input.wheel === 0;
    if (nearest?.landable && !orbitCam.flight && nearest.distSurface < 30 &&
      performance.now() - lastTakeoff > 800 && inputIdle &&
      terrainMgr.baseReady(nearest.id)) { // DEM EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish→EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      _rel.set(
        ship.posKm[0] - nearest.posKm[0], ship.posKm[1] - nearest.posKm[1], ship.posKm[2] - nearest.posKm[2]
      );
      const relLen = _rel.length();
      _q.copy(builder.bodies.get(nearest.id).mesh.quaternion).invert();
      _rel.applyQuaternion(_q).normalize();
      const altGround = relLen - terrainMgr.heightAt(nearest.id, _rel);
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 5m：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      autoLand = altGround < (IS_MOBILE ? 0.005 : 0.0022);
    }
    // DEM EnglishEnglishEnglishEnglishEnglish G EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish baseReady，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish G EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。
    if (input.tapped('KeyG') && nearest?.landable && nearest.distSurface < landRange &&
        !terrainMgr.baseReady(nearest.id)) {
      hud.tip(t('tip.terrainLoading'));
    }
    if ((autoLand || (input.tapped('KeyG') && nearest?.landable && nearest.distSurface < landRange &&
        terrainMgr.baseReady(nearest.id)))
      && !orbitCam.flight) {
      // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（0.004–0.03 rad，English 0.23°–1.7°）
      const impactMS = Math.max(0, approachMS);
      const landStrength = Math.min(1, impactMS / 50);              // 50 m/s EnglishEnglish
      cameraFeel.impulse(Math.min(0.03, 0.004 + impactMS * 0.0005), 24);
      audioEngine?.playLandingImpact?.(landStrength);
      ship.enterWalk(env); // EnglishEnglishEnglishEnglishEnglishEnglish（yaw+pitch EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      appMode = 'walk';
      // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      if (!IS_MOBILE) try { canvas.requestPointerLock(); } catch { /* EnglishEnglishEnglishEnglishEnglishEnglish */ }
    }
    if (input.tapped('KeyF') && !orbitCam.flight) switchToFly();
  } else {
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish/PageUp → EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish，R7 #1；
    // EnglishEnglish 0.5 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglish = EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish，R10）
    if (appMode === 'walk' && !ship.walk.diving &&
      (input.wheel >= 0.5 || input.down('PageUp'))) {
      lastTakeoff = performance.now();
      document.exitPointerLock?.();
      orbitCam.adoptPosition(orbitEnv, ship.walk.bodyId, ship.posKm, ship.quat);
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglish tilt EnglishEnglishEnglishEnglishEnglish，EnglishEnglish adoptPosition EnglishEnglishEnglish -autoTilt English auto-tilt
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish dolly。
      orbitCam.tilt = 0;
      orbitCam.panOffset.set(0, 0, 0); // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      orbitCam.distTarget = orbitCam.dist + Math.max(orbitCam.dist * 0.002, 0.05);
      appMode = 'orbit';
      ship.mode = 'fly';
      ship.vel.set(0, 0, 0);
      input.cancelGestures(); // EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglish
    } else {
      // D-6：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglish dtReal，English"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"
      // EnglishEnglishEnglish 90 EnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglish**EnglishEnglish（EnglishEnglish 16×：
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
      // EnglishEnglishEnglishEnglishEnglishEnglish tapped，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish n English。
      {
        const warp = Math.min(16, Math.max(1, Math.round(simClock._rate ?? 1)));
        for (let i = 0; i < warp; i++) {
          if (i > 0) input.justPressed?.clear?.();
          ship.update(dtReal, input, env);
        }
      }
      if (appMode === 'walk' && ship.mode === 'fly') {
        switchToOrbit(); // EnglishEnglishEnglishEnglish G EnglishEnglish → EnglishEnglishEnglishEnglish
      } else {
        appMode = ship.mode === 'walk' ? 'walk' : 'fly';
      }
      if (appMode === 'fly' && input.tapped('KeyF')) switchToOrbit();
    }
  }
  if (input.tapped('KeyT') && selectedId) flyTo(selectedId);
  } catch (e) { loopErr('modeUpdate', e); }

  // EnglishEnglishEnglishEnglish（EnglishEnglish=EnglishEnglishEnglishEnglish）
  try { world.update(ship.posKm); } catch (e) { loopErr('world', e); }
  try {
    sky?.update(dtReal);
    cosmicMotion?.update(dtReal, camera.position);
    observerBeacon?.update(dtReal);
  } catch (e) { loopErr('cosmicMotion', e); }
  try {
    let proximity = 0;
    for (const [id, body] of builder.bodies) {
      if (id === 'sun') continue;
      const radiusKm = body.phys?.radiusKm;
      if (!Number.isFinite(radiusKm) || radiusKm <= 0) continue;
      const distanceKm = camera.position.distanceTo(body.group.position);
      proximity = Math.max(proximity, normalizePlanetProximity(distanceKm, radiusKm));
    }
    cosmicAudio.updateSpatialAudio(proximity);
  } catch (e) { loopErr('cosmicAudio', e); }
  try {
    builder.postWorldUpdate(ship.posKm, performance.now() / 1000);
  } catch (e) {
    if (!loop._postWorldErr) {
      loop._postWorldErr = true;
      console.error('[postWorldUpdate]', e);
    }
  }
  terraformingOverlays?.update(performance.now() / 1000);
  // ── EnglishEnglish / EnglishEnglishEnglishEnglish ──────────────────────────────────────────────────────
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"EnglishEnglishEnglish：EnglishEnglish=EnglishEnglishEnglish，EnglishEnglish=English（EnglishEnglishEnglishEnglishEnglishEnglish）。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish +Z EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
  {
    if (appMode === 'fly' && input.tapped('KeyV')) thirdPerson = !thirdPerson;
    const showCockpit = appMode === 'fly' && !thirdPerson;
    cockpit.visible = showCockpit;
    shipModel.visible = appMode === 'fly' && thirdPerson;
    // EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"EnglishEnglish：EnglishEnglishEnglishEnglishEnglish CSS EnglishEnglish，EnglishEnglishEnglish 3D EnglishEnglishEnglish。
    // 3D EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglishEnglishEnglishEnglish、FOV、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。
    document.body.classList.toggle('walk-mode', appMode === 'walk');
    helmet.visible = false;
    // EnglishEnglish：EnglishEnglishEnglishEnglishEnglish"EnglishEnglish"（EVA EnglishEnglishEnglish/EnglishEnglish + EnglishEnglishEnglishEnglish）
    evaSuit.visible = appMode === 'walk';
    if (evaSuit.visible) {
      const a = ship.audioState ?? {};
      evaSuit.userData.update?.(dtReal, a.speed ?? 0, !!a.walking, !!a.submerged);
    }
    if (shipModel.visible) {
      shipModel.position.set(0, 0, 0);
      shipModel.quaternion.copy(ship.quat);
      const fl = shipModel.userData.flame;
      if (fl) {
        // EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish / EnglishEnglishEnglish"EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        const thr = Math.min(1, ship.vel.length() / Math.max(ship.speedSetting, 1e-9) * 0.9);
        fl.material.opacity = 0.25 + 0.6 * thr;
        fl.scale.set(0.8 + 0.5 * thr, 0.6 + 1.4 * thr, 0.8 + 0.5 * thr);
      }
    }
    // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglish 16m、EnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglishEnglish**EnglishEnglish** FOV/EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    overlayCam.fov = camera.fov;
    overlayCam.aspect = camera.aspect;
    overlayCam.updateProjectionMatrix();
    cockpit.userData.layout?.(overlayCam.fov, overlayCam.aspect);
    helmet.userData.layout?.(overlayCam.fov, overlayCam.aspect);
    evaSuit.userData.layout?.(overlayCam.fov, overlayCam.aspect);
    if (thirdPerson && shipModel.visible) {
      overlayCam.position.set(0, 2.6, 16).applyQuaternion(ship.quat);
      overlayCam.quaternion.copy(ship.quat);
      overlayCam.lookAt(0, 0, 0);
    } else {
      overlayCam.position.set(0, 0, 0);
      overlayCam.quaternion.copy(ship.quat);
    }
  }

  camera.quaternion.copy(ship.quat);
  // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglish/EnglishEnglishEnglishEnglish。
  // EnglishEnglishEnglishEnglishEnglish FOV，EnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  try {
    const feel = cameraFeel.update(dtReal, {
      mode: appMode,
      walking: ship.audioState?.walking,
      walkSpeedMS: (ship.audioState?.speed ?? 0) * 1000,   // km/s → m/s
      submerged: ship.audioState?.submerged,
      speedKmS: ship.vel.length(),
      boosting: input.keys?.has?.('ShiftLeft') || input.keys?.has?.('ShiftRight'),
    });
    camera.quaternion.multiply(feel.quaternion);   // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish
    // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish q = ½ρv² EnglishEnglish。English"EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglish——
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish**EnglishEnglish**EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    {
      const q = ship.aero?.q ?? 0;
      if (q > 150) {
        const amp = Math.min(0.022, q * 2.2e-5);
        const t = performance.now() * 0.001;
        _shakeE.set(Math.sin(t * 37.0) * amp, Math.sin(t * 29.0 + 1.7) * amp, Math.sin(t * 43.0 + 3.1) * amp * 0.6);
        _shakeQ.setFromEuler(_shakeE);
        camera.quaternion.multiply(_shakeQ);
      }
    }
    // EnglishEnglishEnglishEnglish / EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：Sutton–Graves English q̇ ∝ √ρ·v³。
    // EnglishEnglishEnglishEnglish 2e10（60km/7.8km/s EnglishEnglishEnglish 1），English ~85km EnglishEnglishEnglishEnglish。
    {
      const heat = ship.aero?.heat ?? 0;
      const plasma = Math.min(1, Math.max(0, heat / 2e10));
      if (Math.abs(plasma - _plasmaShown) > 0.004) {
        _plasmaShown = plasma;
        reentryGlow.style.opacity = plasma.toFixed(3);
      }
    }
    camera.fov = THREE.MathUtils.clamp(cameraFovBase + feel.fovBiasDeg, 10, 100);
    camera.updateProjectionMatrix();
  } catch (e) { loopErr('cameraFeel', e); }

  // EnglishEnglish（try-catch EnglishEnglish：DEM EnglishEnglishEnglishEnglishEnglishEnglish）
  try {
    if (nearest && nearest.landable) {
      const e = builder.bodies.get(nearest.id);
      _rel.set(
        ship.posKm[0] - e.posKm[0], ship.posKm[1] - e.posKm[1], ship.posKm[2] - e.posKm[2]
      );
      _q.copy(e.mesh.quaternion).invert();
      _rel.applyQuaternion(_q).normalize();
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：_q EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      _sunLocal.copy(e.mat.userData.uniforms.uSunDir.value).applyQuaternion(_q);
      terrainMgr.update(nearest, _rel, performance.now() / 1000, _sunLocal);
    } else {
      terrainMgr.update(null, null);
    }
  } catch (e) {
    if (!loop._terrainErr) {
      loop._terrainErr = true;
      console.error('[terrain]', e);
    }
  }

  try { updateAtmosphereFogAndExposure(nearest, dtReal); } catch (e) { loopErr('atmoFog', e); }
  try { handleUIKeys(); } catch (e) { loopErr('uiKeys', e); }

  // HUD
  try {
  hud.updateTime(simClock);
  const flight = orbitCam.flight;
  hud.updateNav({ audioOn: audioEngine?.enabled,
    mode: appMode,
    flight: flight ? { toName: bodyName(registry.get(flight.toId)), t: flight.t } : null,
    speed: ship.vel.length(),
    speedSetting: ship.speedSetting,
    focusName: appMode === 'orbit' ? bodyName(registry.get(orbitCam.focusId)) : null,
    nearest: nearest ? { name: bodyName(registry.get(nearest.id)), distSurface: nearest.distSurface } : null,
    gravity: appMode === 'walk' ? surfaceGravity(builder.bodies.get(ship.walk.bodyId).phys) : null,
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish Δv EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    dv: (appMode === 'fly' && ship.gravityMode) ? ship.dvBudget : null,
  });
  updateTip(nearest);
  if (selectedId) {
    const t = registry.get(selectedId);
    const dist = Math.hypot(
      t.posKm[0] - ship.posKm[0], t.posKm[1] - ship.posKm[1], t.posKm[2] - ship.posKm[2]
    );
    const dSun = Math.hypot(t.posKm[0], t.posKm[1], t.posKm[2]);
    hud.updateTarget(targetInfo(selectedId, registry, dist, dSun, jdTT));
  } else {
    hud.updateTarget(null);
  }
  // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish → EnglishEnglish）。
  // EnglishEnglish 0.002 rad ≈ 0.11°：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish-EnglishEnglishEnglish。
  const occluders = [];
  for (const [bid, be] of builder.bodies) {
    const gp = be.group.position; // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    const d = gp.length();
    const r = be.phys.radiusKm;
    if (d > r && r / d > 0.002) occluders.push({ id: bid, pos: gp, r: r * 0.999 });
  }
  labels.update(selectedId, occluders);
  // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish try-catch EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish"60 FPS EnglishEnglishEnglishEnglishEnglish"）。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish DOM。
  try {
    const errN = window.__errLog?.length ?? 0;
    if (errN !== loop._errShown) {
      loop._errShown = errN;
      hud.setErrorCount(errN, errN ? window.__errLog[errN - 1].tag : null);
    }
  } catch { /* EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */ }
  document.getElementById('crosshair').style.display =
    appMode === 'orbit' ? 'none' : '';

  // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  // EnglishEnglish（#8）：5e-7 km EnglishEnglishEnglishEnglishEnglishEnglish + 1e15 km far EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish
  // "EnglishEnglish"EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish），English
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish < EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish）。
  {
    let dNear = nearest ? nearest.distSurface : Infinity;
    for (const [, e] of tnoScene.entries) {
      const d = Math.hypot(
        e.posKm[0] - ship.posKm[0], e.posKm[1] - ship.posKm[1], e.posKm[2] - ship.posKm[2]
      ) - e.phys.radiusKm;
      if (d < dNear) dNear = d;
    }
    // EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"（EnglishEnglish 1e8 km）
    // EnglishEnglish 5e7 km，English 2.5e6 km EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglish Sprite，EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish ~2.8e6 km），EnglishEnglishEnglishEnglishEnglishEnglish。
    for (const [, t] of registry) {
      if (t.kind !== 'comet' && t.kind !== 'probe') continue;
      // EnglishEnglishEnglish Sprite，EnglishEnglishEnglishEnglishEnglish ~2.8e6 km（EnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      const half = t.kind === 'comet'
        ? Math.max(t.phys?.radiusKm ?? 1, t.relObj?.children?.[0]?.scale?.x ?? 0)
        : (t.phys?.radiusKm ?? 1);
      const d = Math.hypot(
        t.posKm[0] - ship.posKm[0], t.posKm[1] - ship.posKm[1], t.posKm[2] - ship.posKm[2]
      ) - half;
      if (d < dNear) dNear = d;
    }
    const want = appMode === 'walk'
      ? 5e-7
      : THREE.MathUtils.clamp(Math.max(dNear, 0) * 0.3, 5e-7, 1e10);
    if (Math.abs(want - camera.near) > camera.near * 0.02) {
      camera.near = want;
      camera.updateProjectionMatrix();
    }
  }

  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish held-zoom、EnglishEnglishEnglishEnglishEnglishEnglish
  touchControls?.update(appMode, nearestCache, orbitCam);
  } catch (e) { loopErr('hud', e); }

  // ── EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（#3-#55 EnglishEnglish）──────────────────────────────
  // EnglishEnglishEnglishEnglishEnglishEnglish try-catch：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  try {
    // EnglishEnglishEnglishEnglish（#4, #32）：EnglishEnglishEnglishEnglish/EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglish
    if (audioEngine) {
      // EnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
      // EnglishEnglishEnglish HRTF/EnglishEnglishEnglishEnglishEnglish 3D EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      {
        const rollIn = (input.down('KeyQ') ? 1 : 0) - (input.down('KeyE') ? 1 : 0);
        _audioPan += (rollIn * 0.55 - _audioPan) * Math.min(dtReal * 3, 1);
        audioEngine.setPan?.(_audioPan);
      }
      const nearestBody = nearest ? builder.bodies.get(nearest.id) : null;
      const atm = nearestBody?.phys?.atmosphere;
      const inAtmo = !!(atm && nearest.distSurface < atm.heightKm);
      audioEngine.setMode(appMode, {
        nearest: nearest ? { id: nearest.id, radiusKm: nearest.radiusKm, distSurface: nearest.distSurface } : null,
        inAtmosphere: inAtmo,
        underwater: !!ship.walk?.submerged,
        surface: ship.audioState?.surfaceType || 'rock',
      });
      audioEngine.update(dtReal, ship.audioState);
    }
  } catch (e) { console.error('[audioEngine]', e); }

  try {
    // 3D EnglishEnglishEnglish（#37）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    if (compass && compass.visible) {
      const nearestBody = nearest ? builder.bodies.get(nearest.id) : null;
      let sunDir = null, zenithDir = null, northDir = null, nearestBodyDir = null;
      if (nearestBody) {
        // EnglishEnglish = EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish）
        _rel.set(
          ship.posKm[0] - nearestBody.posKm[0],
          ship.posKm[1] - nearestBody.posKm[1],
          ship.posKm[2] - nearestBody.posKm[2]
        );
        const relLen = _rel.length() || 1;
        zenithDir = { x: _rel.x / relLen, y: _rel.y / relLen, z: _rel.z / relLen };
        // EnglishEnglishEnglish = EnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）。
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish 45° English"English"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 45°，
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。
        const bodyQuat = nearestBody.mesh.quaternion;
        const nq = _q.copy(bodyQuat);
        const axis = {
          x: 2 * (nq.x * nq.y - nq.w * nq.z),
          y: 1 - 2 * (nq.x * nq.x + nq.z * nq.z),
          z: 2 * (nq.y * nq.z + nq.w * nq.x),
        };
        const dotAz = axis.x * zenithDir.x + axis.y * zenithDir.y + axis.z * zenithDir.z;
        let nx = axis.x - dotAz * zenithDir.x;
        let ny = axis.y - dotAz * zenithDir.y;
        let nz = axis.z - dotAz * zenithDir.z;
        const nl = Math.hypot(nx, ny, nz);
        if (nl < 1e-4) { nx = axis.x; ny = axis.y; nz = axis.z; }
        else { nx /= nl; ny /= nl; nz /= nl; }
        northDir = { x: nx, y: ny, z: nz };
        // EnglishEnglishEnglishEnglish（EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
        const sunPos = builder.bodies.get('sun').posKm;
        sunDir = {
          x: sunPos[0] - ship.posKm[0],
          y: sunPos[1] - ship.posKm[1],
          z: sunPos[2] - ship.posKm[2],
        };
        const sunLen = Math.hypot(sunDir.x, sunDir.y, sunDir.z) || 1;
        sunDir.x /= sunLen; sunDir.y /= sunLen; sunDir.z /= sunLen;
        // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish fly/orbit EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
        if (appMode !== 'walk') {
          nearestBodyDir = { x: -zenithDir.x, y: -zenithDir.y, z: -zenithDir.z };
        }
      }
      compass.update({
        cameraQuat: camera.quaternion,
        sunDir,
        zenithDir,
        northDir,
        nearestBodyDir,
        nearestBodyName: nearest ? bodyName(registry.get(nearest.id)) : null,
      });
    }
  } catch (e) { console.error('[compass]', e); }

  try {
    // EnglishEnglishEnglishEnglishEnglish（#38）：EnglishEnglishEnglishEnglishEnglishEnglish
    scaleRef?.update({ mode: appMode, cinematic });
  } catch (e) { console.error('[scaleRef]', e); }
  try {
    for (const [id, landmarks] of [['moon', apolloLandmarks], ['mars', roverSites]]) {
      const entry = builder.bodies.get(id);
      if (!landmarks || !entry) continue;
      const local = _rel.set(ship.posKm[0] - entry.posKm[0], ship.posKm[1] - entry.posKm[1], ship.posKm[2] - entry.posKm[2]);
      local.applyQuaternion(_q.copy(entry.mesh.quaternion).invert());
      landmarks.update(local);
    }
  } catch (e) { loopErr('landmarks', e); }

  try {
    // EnglishEnglishEnglishEnglishEnglishEnglish（#25）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    eclipseSystem?.update(jdTT, builder.bodies, ship.posKm);
  } catch (e) { console.error('[eclipseSystem]', e); }

  try {
    // WebXR/VR（#33）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    webxr?.update(dtReal);
  } catch (e) { console.error('[webxr]', e); }

  try { fpsGuard(frameDelta); } catch (e) { loopErr('fpsGuard', e); }
  // Shift+EnglishEnglish：FOV EnglishEnglish（10°–100°，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  try {
    if (input.fovWheel !== 0) {
      cameraFovBase = THREE.MathUtils.clamp(cameraFovBase * Math.pow(1.12, input.fovWheel), 10, 100);
      camera.fov = cameraFovBase;
      camera.updateProjectionMatrix();
      const mm = 43.27 / (2 * Math.tan(camera.fov * Math.PI / 360));
      showActionTip(t('tip.fov', { deg: camera.fov.toFixed(0), mm: mm.toFixed(0) }), 1200);
    }
  } catch (e) { loopErr('fov', e); }
  try { input.endFrame(); } catch (e) { loopErr('input', e); }
  try {
    if (renderer.xr.isPresenting) renderer.render(scene, camera);
    else composer.render();
    // ── EnglishEnglishEnglishEnglish（?meter=1，EnglishEnglishEnglish）────────────────────────────────────
    // English 150ms English HDR EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"。
    // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglish
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    if (DEBUG_FLAGS.meter) {
      if (!meter) meter = createMetering(renderer);
      if (meter && performance.now() - lastMeterAt > 150) {
        lastMeterAt = performance.now();
        const src = composer.readBuffer?.texture ?? null;
        const lg = meter.sample(src);
        if (lg !== null) meteredLog2 = lg;
      }
    }
    // EnglishEnglish/EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）
    if ((appMode === 'fly' && (cockpit.visible || shipModel.visible))
        || (appMode === 'walk' && evaSuit.visible)) {
      if (!overlayScene.environment) overlayScene.environment = scene.environment;
      renderer.autoClear = false;
      renderer.clearDepth();
      renderer.render(overlayScene, overlayCam);
      renderer.autoClear = true;
    }
  } catch (e) {
    // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish
    if (!loop._renderErr) {
      loop._renderErr = true;
      console.error('[composer.render]', e);
    }
  }
}

// EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish composer.render() EnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglishEnglishEnglish window.__errLog（EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish"），EnglishEnglishEnglishEnglish。
function loopErr(tag, e) {
  const k = '_e_' + tag;
  (window.__errLog = window.__errLog || []).push({ tag, msg: String(e?.message || e), t: Date.now() });
  if (!loop[k]) {
    loop[k] = true;
    console.error('[' + tag + ']', e);
    try { hud.tip(tag + ' EnglishEnglish: ' + (e?.message || e)); } catch { /* hud EnglishEnglishEnglishEnglishEnglish */ }
  }
}

function findNearest() {
  let best = null;
  for (const [id, e] of builder.bodies) {
    const d = Math.hypot(
      e.posKm[0] - ship.posKm[0], e.posKm[1] - ship.posKm[1], e.posKm[2] - ship.posKm[2]
    );
    const ds = d - e.phys.radiusKm;
    if (!best || ds < best.distSurface) {
      best = {
        id, posKm: e.posKm, radiusKm: e.phys.radiusKm,
        landable: !!e.phys.landable, distSurface: ds,
        // EnglishEnglish phys：EnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglish nearest.phys.atmosphere。
        // EnglishEnglishEnglishEnglish id，EnglishEnglishEnglishEnglishEnglishEnglish builder.bodies.get(id).phys。
        phys: e.phys,
      };
    }
  }
  return best;
}

function makeEnv(nearest) {
  return {
    nearest,
    getBodyQuat: (id) => builder.bodies.get(id).mesh.quaternion,
    getBodyPos: (id) => builder.bodies.get(id).posKm,
    heightFn: (id, dir) => terrainMgr.heightAt(id, dir),
    heightSolidFn: (id, dir) => terrainMgr.heightSolidAt(id, dir),
    isWater: (id, dir) => terrainMgr.isWater(id, dir),
    phys: (id) => builder.bodies.get(id).phys,
    baseReady: (id) => terrainMgr.baseReady(id),
  };
}

function handleTimeKeys() {
  if (input.tapped('BracketRight')) hud.warpUp();
  if (input.tapped('BracketLeft')) hud.warpDown();
  if (input.tapped('KeyP')) simClock.paused = !simClock.paused;
  if (input.tapped('KeyN')) { simClock.setNow(); hud.warpReset(); simClock.paused = false; }
}

const PLANET_KEYS = {
  Digit1: 'mercury', Digit2: 'venus', Digit3: 'earth', Digit4: 'mars', Digit5: 'jupiter',
  Digit6: 'saturn', Digit7: 'uranus', Digit8: 'neptune', Digit9: 'pluto', Digit0: 'sun',
};

// EnglishEnglishEnglishEnglishEnglish**EnglishEnglish**：EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
// EnglishEnglishEnglishEnglishEnglishEnglish 6–8 EnglishEnglishEnglishEnglish（EnglishEnglish earth-space），English"EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglish O EnglishEnglish。TNO EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）。
let orbitLinesOn = true;   // EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
let tnoOrbitsOn = false;
let directoryTabKeyBound = false;

function handleUIKeys() {
  if (!directoryTabKeyBound) {
    directoryTabKeyBound = true;
    window.addEventListener('keydown', (e) => {
      if (e.code !== 'Tab' || e.repeat) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      e.preventDefault();
      document.querySelector('#directory')?.classList.toggle('open');
    });
  }
  for (const [key, id] of Object.entries(PLANET_KEYS)) {
    if (input.tapped(key)) flyTo(id); // GE EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish
  }
  if (input.tapped('KeyO')) orbitLinesOn = !orbitLinesOn;
  if (input.tapped('KeyK')) { // K：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（#4）
    tnoOrbitsOn = !tnoOrbitsOn;
    hud.tip(tnoOrbitsOn ? t('tip.tnoOrbitsOn') : t('tip.tnoOrbitsOff'));
  }
  // V：EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish，R9-1e）
  if (input.tapped('KeyV') && appMode === 'orbit' && !orbitCam.flight) {
    orbitCam.setInertial(!orbitCam.inertial, orbitEnv);
  }
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish body.cinematic EnglishEnglish CSS English，EnglishEnglishEnglishEnglishEnglish WebGL EnglishEnglish、CSS EnglishEnglishEnglish——
  // EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。3D EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  const showOrbits = orbitLinesOn && appMode !== 'walk' && !cinematic;
  // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish）。
  // 6R→300R EnglishEnglishEnglishEnglish：EnglishEnglish 38 English km EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  for (const [id, line] of Object.entries(builder.orbitLines.userData)) {
    const e = builder.bodies.get(id);
    let f = 1;
    if (e) {
      const R = e.phys.radiusKm;
      const d = Math.hypot(
        e.posKm[0] - ship.posKm[0], e.posKm[1] - ship.posKm[1], e.posKm[2] - ship.posKm[2]
      ) - R;
      f = THREE.MathUtils.smoothstep(d, R * 6, R * 300);
    }
    line.visible = showOrbits && f > 0.01;
    if (line.visible) line.material.opacity = (line.userData.baseOpacity ?? 0.3) * f;
  }
  // EnglishEnglishEnglishEnglish（TNO）EnglishEnglishEnglish：EnglishEnglishEnglishEnglish（K），EnglishEnglishEnglishEnglish（#4）
  const showTnoOrbits = tnoOrbitsOn && appMode !== 'walk' && !cinematic;
  for (const [, e] of tnoScene.entries) {
    if (!e.orbitLine) continue;
    const R = e.phys.radiusKm ?? 500;
    const d = Math.hypot(
      e.posKm[0] - ship.posKm[0], e.posKm[1] - ship.posKm[1], e.posKm[2] - ship.posKm[2]
    ) - R;
    const f = THREE.MathUtils.smoothstep(d, R * 6, R * 300);
    e.orbitLine.visible = showTnoOrbits && f > 0.01;
    if (e.orbitLine.visible) e.orbitLine.material.opacity = (e.orbitLine.userData.baseOpacity ?? 0.18) * f;
  }
  // J：EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  if (input.tapped('KeyJ') && appMode === 'fly') {
    ship.gravityMode = !ship.gravityMode;
    hud.tip(t(ship.gravityMode ? 'tip.gravityOn' : 'tip.gravityOff'));
  }
  if (input.tapped('KeyL')) labels.setVisible(!labels.visible);
  if (input.tapped('KeyH')) hud.toggleHelp();
  // Z：EnglishEnglish/EnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（HUD/EnglishEnglish/EnglishEnglish/EnglishEnglish/EnglishEnglish/EnglishEnglishEnglish），
  // EnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglish（L EnglishEnglish、O EnglishEnglish、C EnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglish，
  // EnglishEnglishEnglish、EnglishEnglish、EnglishEnglish、VR EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish。
  if (input.tapped('KeyZ')) setCinematic(!cinematic);
}

let cinematic = false;
let cinematicTimer = 0;
function setCinematic(on) {
  cinematic = on;
  clearTimeout(cinematicTimer);
  if (on) {
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    hud.tip(t('tip.cinematicOn'));
    cinematicTimer = setTimeout(() => document.body.classList.add('cinematic'), 1200);
  } else {
    document.body.classList.remove('cinematic');
    hud.tip(t('tip.cinematicOff'));
  }
}

// EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）：
//   ?noatmo=1  EnglishEnglishEnglishEnglishEnglish（EnglishEnglish"EnglishEnglish vs EnglishEnglish"EnglishEnglishEnglish）
//   ?nofog=1   EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
const DEBUG_FLAGS = (() => {
  const q = new URLSearchParams(window.location.search);
  const f = { noatmo: q.get('noatmo') === '1', nofog: q.get('nofog') === '1', meter: q.get('meter') === '1' };
  globalThis.__noAtmo = f.noatmo;   // builder EnglishEnglishEnglishEnglishEnglishEnglish
  return f;
})();

// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglish）：?clean=1
if (typeof document !== 'undefined' && document.body
    && new URLSearchParams(window.location.search).get('clean') === '1') {
  cinematic = true;
  document.body.classList.add('cinematic');
}

function updateTip(nearest) {
  // EnglishEnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglishEnglishEnglishEnglish）English 2.5s EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  if (performance.now() < actionTipUntil) return;
  const atm = nearest ? builder.bodies.get(nearest.id)?.phys.atmosphere : null;
  if (performance.now() < focusTipUntil && appMode === 'orbit') {
    const tipId = orbitCam.pendingFocusId ?? selectedId ?? orbitCam.focusId;
    const tipName = bodyName(registry.get(tipId)) || t('word.target');
    if (orbitCam.pendingFocusId && orbitCam.pendingFocusId !== orbitCam.focusId) {
      hud.tip(t('tip.pendingFocus', { name: tipName }));
    } else {
      hud.tip(t('tip.lockedFocus', { name: tipName }));
    }
  } else if (orbitCam.flight) {
    hud.tip(t('tip.flyingTo', { name: bodyName(registry.get(orbitCam.flight.toId)) }));
  } else if (appMode === 'walk') {
    hud.tip(IS_MOBILE ? t('tip.walkTouch') : (input.locked ? t('tip.walkLocked') : t('tip.walkUnlocked')));
  } else if (nearest && nearest.landable &&
    nearest.distSurface < Math.max(20, nearest.radiusKm * 0.05)) {
    hud.tip(t('tip.landNear', { name: bodyName(registry.get(nearest.id)) }));
  } else if (appMode === 'orbit' && nearest && nearest.landable &&
    nearest.distSurface < nearest.radiusKm * 0.6) {
    hud.tip(t('tip.landAny'));
  } else if (nearest && !nearest.landable && nearest.id !== 'sun' && atm &&
    nearest.distSurface < atm.heightKm) {
    hud.tip(t('tip.enterAtmo', { name: bodyName(registry.get(nearest.id)) }));
  } else if (nearest && !nearest.landable && nearest.id !== 'sun' && nearest.distSurface < nearest.radiusKm * 0.5) {
    hud.tip(t('tip.gasGiant'));
  } else if (nearest && nearest.id === 'sun' && nearest.distSurface < nearest.radiusKm * 2) {
    hud.tip(t('tip.sun'));
  } else if (appMode === 'orbit' && orbitCam.inertial) {
    hud.tip(t('tip.inertial', { name: bodyName(registry.get(orbitCam.focusId)) }));
  } else {
    hud.tip(null);
  }
}

const immersionEl = document.getElementById('immersion');
let lastBoosted = null; // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 1）

function updateAtmosphereFogAndExposure(nearest, dt) {
  const dSunAU = Math.hypot(ship.posKm[0], ship.posKm[1], ship.posKm[2]) / KM_PER_AU;
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglish≈1；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // EnglishEnglish = EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish）。EnglishEnglishEnglishEnglishEnglish uSunI = 1/d² EnglishEnglishEnglishEnglishEnglish 1，
  // EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish"EnglishEnglishEnglishEnglish"EnglishEnglishEnglish：
  // EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  //
  // EnglishEnglishEnglish pow(dAU, 0.85) EnglishEnglishEnglish [0.25, 12]：13 AU EnglishEnglishEnglishEnglishEnglishEnglish，English uSunI EnglishEnglish
  // English (1/d²)^0.55 EnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
  //
  // EnglishEnglish 0.75 English**EnglishEnglishEnglishEnglishEnglishEnglishEnglish**：EnglishEnglishEnglish 1（EnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // ACES EnglishEnglishEnglishEnglish（English 0.8 EnglishEnglish）EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish"EnglishEnglish"EnglishEnglish
  // EnglishEnglishEnglish ~0.86）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。English 1.0 EnglishEnglishEnglishEnglishEnglishEnglish 10.6% EnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  // ── EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ─────────────────────────────────────────────────
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（0.75·d²）EnglishEnglishEnglish**EnglishEnglish**，EnglishEnglishEnglish**EnglishEnglishEnglish**：EnglishEnglish（0.106）
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglish（0.136）EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglish**EnglishEnglish（EnglishEnglish 0.75）：EnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（40R EnglishEnglishEnglish、100R EnglishEnglishEnglish）EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  let exposureAdapt = 1;
  {
    const fid = orbitCam.focusId ?? nearest?.id;
    const a = fid ? SURFACE_ALBEDO[fid] : null;
    const e = fid ? builder.bodies.get(fid) : null;
    if (a > 0 && e && fid !== 'sun') {
      const rr = Math.hypot(
        ship.posKm[0] - e.posKm[0], ship.posKm[1] - e.posKm[1], ship.posKm[2] - e.posKm[2]
      ) / Math.max(e.phys.radiusKm, 1e-6);
      const w = 1 - THREE.MathUtils.smoothstep(rr, 40, 100);
      if (w > 0) {
        exposureAdapt = 1 + (Math.pow(0.62 / Math.max(a, 0.03), 1.0) - 1) * w;
      }
    }
  }
  exposureTarget = THREE.MathUtils.clamp(
    0.75 * Math.max(dSunAU, 0.004) ** 2 * exposureAdapt, 0.02, 6000);
  // EnglishEnglishEnglishEnglish：English"EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish 0.22 EnglishEnglishEnglishEnglishEnglish。
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish / EnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglish。
  if (DEBUG_FLAGS.meter && meteredLog2 !== null) {
    const L = Math.pow(2, meteredLog2);
    if (L > 1e-9) exposureTarget = THREE.MathUtils.clamp(0.30 / L, 0.02, 6000);
  }

  let fogDensity = 0;
  let skyFade = 1; // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish）
  let immersion = 0; // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish，R7 #5）
  let immTint = null;
  let waterFx = null; // EnglishEnglishEnglishEnglish（R9-2b）
  let _groundTintW = 0;        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglishEnglish，0=EnglishEnglishEnglishEnglish）
  let _groundTintCol = null;   // EnglishEnglishEnglish [r,g,b]
  const fogColor = new THREE.Color(0x000000);
  if (nearest) {
    const e = builder.bodies.get(nearest.id);
    const atm = e.phys.atmosphere;
    for (const id of new Set([nearest.id, orbitCam.focusId])) {
      const body = builder.bodies.get(id); if (!body) continue;
      const radial = new THREE.Vector3(ship.posKm[0] - body.posKm[0], ship.posKm[1] - body.posKm[1], ship.posKm[2] - body.posKm[2]);
      const distanceKm = radial.length();
      radial.normalize();
      const towardSun = new THREE.Vector3(...body.posKm).normalize().negate();
      const view = camera.getWorldDirection(new THREE.Vector3());
      skyFade = Math.min(skyFade, photoSkyVisibility({ radiusKm: body.phys.radiusKm, distanceKm,
        sunElevation: id === 'sun' ? 1 : radial.dot(towardSun), phaseCosine: id === 'sun' ? 1 : radial.dot(towardSun),
        viewCosine: -view.dot(radial), dSunAU,
        airless: !body.phys.atmosphere }));
    }
    const inAtmo = atm && nearest.distSurface < atm.heightKm;
    // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglish interiorBoost EnglishEnglish"EnglishEnglishEnglishEnglishEnglish"English"EnglishEnglishEnglishEnglishEnglish"
    if (e.atmoMesh) {
      const gasGiant = e.phys.type === 'gas' || e.phys.type === 'ice';
      const depth = inAtmo ? 1 - Math.max(nearest.distSurface, 0) / atm.heightKm : 0;
      let boostVal = 1, boostMVal = 1;
      // depth EnglishEnglishEnglish NaN（EnglishEnglishEnglishEnglishEnglish distSurface EnglishEnglishEnglish）——EnglishEnglish interiorBoost
      // EnglishEnglishEnglishEnglish uBoost，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish NaN，
      // three EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。EnglishEnglishEnglishEnglish。
      if (!Number.isFinite(depth)) {
        // EnglishEnglish 1 / 1
      } else if (gasGiant && inAtmo) {
        boostVal = boostMVal = 1 + depth * depth * 24;
      } else if (inAtmo && atm.interiorBoost) {
        const t = THREE.MathUtils.smoothstep(depth, 0.05, 0.35);
        boostVal  = 1 + (atm.interiorBoost          - 1) * t;
        boostMVal = 1 + ((atm.interiorBoostM ?? 1)  - 1) * t;
      }
      const u = e.atmoMesh.material.userData.uniforms;
      u.uBoost.value  = boostVal;
      u.uBoostM.value = boostMVal;
      if (lastBoosted && lastBoosted !== e.atmoMesh) {
        const lu = lastBoosted.material.userData.uniforms;
        lu.uBoost.value = 1; lu.uBoostM.value = 1;
      }
      lastBoosted = e.atmoMesh;
      if (gasGiant && inAtmo) {
        // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
        immersion = THREE.MathUtils.smoothstep(depth, 0.45, 0.85);
        const b = atm.rayleigh;
        const m = Math.max(b[0], b[1], b[2]);
        immTint = [b[0] / m, b[1] / m, b[2] / m];
      }
    }
    // EnglishEnglishEnglishEnglish（R9-2b）：EnglishEnglishEnglishEnglish → EnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish
    if (e.phys.landable && e.phys.surface?.ocean) {
      _rel.set(
        ship.posKm[0] - e.posKm[0], ship.posKm[1] - e.posKm[1], ship.posKm[2] - e.posKm[2]
      );
      const relLen = _rel.length();
      _q.copy(e.mesh.quaternion).invert();
      _rel.applyQuaternion(_q).normalize();
      const surfR = e.phys.radiusKm + 0.001;
      if (relLen < surfR - 0.00003 && terrainMgr.isWater(nearest.id, _rel)) {
        const depth = surfR - relLen; // km
        const dim = Math.exp(-depth * 1.6); // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        waterFx = { depth, dim };
      }
    }
    if (inAtmo) {
      const alt = Math.max(nearest.distSurface, 0);
      if (atm.groundTint) {
        _groundTintCol = atm.groundTint;
        _groundTintW = Math.exp(-alt / (atm.rayleighScaleKm * 3));
      }
      _rel.set(
        ship.posKm[0] - e.posKm[0], ship.posKm[1] - e.posKm[1], ship.posKm[2] - e.posKm[2]
      ).normalize();
      const sunDir = new THREE.Vector3(-e.posKm[0], -e.posKm[1], -e.posKm[2]).normalize();
      const sunElev = _rel.dot(sunDir);
      const day = THREE.MathUtils.clamp(sunElev * 4 + 0.1, 0, 1);
      // ── EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**（EnglishEnglish C-4）──────────────
      // EnglishEnglishEnglish depthTest EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      // EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglish
      // EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish"EnglishEnglishEnglishEnglishEnglish"English"EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglish
      // （EnglishEnglish Mie EnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      // **EnglishEnglishEnglishEnglishEnglishEnglishEnglish**：atmosphereFog EnglishEnglishEnglishEnglish up·view、up·sun EnglishEnglishEnglish，
      // EnglishEnglishEnglishEnglishEnglishEnglish Three EnglishEnglishEnglish（EnglishEnglishEnglishEnglish (x,y,z)→(x,z,−y) EnglishEnglishEnglishEnglish）。
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglish up/sunDir EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 0 → EnglishEnglishEnglishEnglish。
      _fogUp.set(_rel.x, _rel.z, -_rel.y);
      _fogSun.set(-e.posKm[0], -e.posKm[2], e.posKm[1]).normalize();
      const fogRes = atmosphereFog(e.phys, {
        altKm: alt,
        up: _fogUp,
        viewDir: camera.getWorldDirection(_fogView),
        sunDir: _fogSun,
        sunI: 5 * (atm.multiplier ?? 1) / Math.max(dSunAU * dSunAU, 1e-6),
        boost: e.atmoMesh?.material.userData.uniforms.uBoost.value ?? 1,
        boostM: e.atmoMesh?.material.userData.uniforms.uBoostM.value ?? 1,
        dustStorm: e.atmoMesh?.material.userData.uniforms.uDustStorm.value ?? 0,
      });
      renderer.__fogDbg = {
        color: fogRes ? [...fogRes.color] : null, alpha: fogRes?.alpha, density: fogRes?.density,
        alt, up: [_fogUp.x, _fogUp.y, _fogUp.z], view: [_fogView.x, _fogView.y, _fogView.z],
        sun: [_fogSun.x, _fogSun.y, _fogSun.z], sunI: 5 * (atm.multiplier ?? 1) / Math.max(dSunAU * dSunAU, 1e-6),
        boost: e.atmoMesh?.material.userData.uniforms.uBoost.value,
        boostM: e.atmoMesh?.material.userData.uniforms.uBoostM.value,
        dust: e.atmoMesh?.material.userData.uniforms.uDustStorm.value,
        distSurface: nearest.distSurface,
      };
      // EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish NaN（EnglishEnglishEnglishEnglishEnglish distSurface EnglishEnglishEnglishEnglishEnglishEnglishEnglish
      // NaN，English depth→interiorBoost→uBoost EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglishEnglish
      // NaN，three EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish NaN。
      if (fogRes && fogRes.color.every(Number.isFinite) && Number.isFinite(fogRes.density)) {
        // EnglishEnglishEnglish = L/α：FogExp2 EnglishEnglishEnglishEnglishEnglishEnglish mix(EnglishEnglish, English) = EnglishEnglish·(1−α) + L，
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。fogDensityMult EnglishEnglish"EnglishEnglishEnglishEnglish"（EnglishEnglish
        // English Venera EnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
        fogColor.setRGB(fogRes.color[0], fogRes.color[1], fogRes.color[2]);
        fogDensity = Math.min(fogRes.density * (atm.fogDensityMult ?? 1), 2.5);
      }
      // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      const density = Math.exp(-alt / (atm.rayleighScaleKm * 2.2));
      // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish——
      // EnglishEnglishEnglishEnglish 21km EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      // EnglishEnglish 3.0：EnglishEnglish/EnglishEnglishEnglishEnglishEnglish → skyFade=0 EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）；
      // 30km EnglishEnglishEnglishEnglishEnglish density≈0.2 → skyFade≈0.4 EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
      skyFade = Math.min(skyFade, THREE.MathUtils.clamp(1 - day * density * 3.0, 0, 1));
      // EnglishEnglishEnglishEnglishEnglishEnglish（R9-2b）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish
      if (e.cloudMesh && !waterFx) {
        const hc = e.phys.radiusKm * 0.0035;
        const veil = Math.exp(-(((alt - hc) / 1.8) ** 2)) * 0.4 * (0.3 + 0.7 * day);
        if (veil > immersion) {
          immersion = veil;
          immTint = [0.9, 0.94, 1.0];
        }
      }
    }
  }
  if (waterFx) {
    // EnglishEnglish（R9-2b）：EnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish
    const { depth, dim } = waterFx;
    // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 650nm EnglishEnglish
    // 450nm English 30 English），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。
    fogColor.setRGB(0.004 + 0.030 * dim, 0.030 + 0.115 * dim, 0.060 + 0.150 * dim);
    // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 20–50m（EnglishEnglishEnglish）；EnglishEnglishEnglishEnglishEnglishEnglish。
    // FogExp2 English 1−exp(−(ρd)²) English d=1/ρ EnglishEnglish 63%，EnglishEnglish ρ EnglishEnglish 1/L。
    // EnglishEnglishEnglish 16（L≈62m）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。
    fogDensity = 35 + depth * 60;
    skyFade = Math.min(skyFade, 0.04);
    exposureTarget = Math.max(exposureTarget * Math.max(dim, 0.045), 0.05);
    const wr = Math.round((0.04 + 0.16 * dim) * 255);
    const wg = Math.round((0.12 + 0.34 * dim) * 255);
    const wb = Math.round((0.2 + 0.42 * dim) * 255);
    immersionEl.style.background =
      `radial-gradient(ellipse at center, rgba(${wr},${wg},${wb},0.45) 0%, rgba(${Math.round(wr * 0.4)},${Math.round(wg * 0.4)},${Math.round(wb * 0.4)},0.9) 85%)`;
    immersionEl.style.opacity = THREE.MathUtils.clamp(0.3 + depth * 0.5, 0, 0.9).toFixed(3);
  } else {
    // EnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish）
    if (immersion > 0 && immTint) {
      skyFade = Math.min(skyFade, 1 - immersion); // EnglishEnglishEnglishEnglishEnglishEnglishEnglish
      const cr = Math.round((immTint[0] * 0.45 + 0.55) * 255);
      const cg = Math.round((immTint[1] * 0.45 + 0.55) * 255);
      const cb = Math.round((immTint[2] * 0.45 + 0.55) * 255);
      immersionEl.style.background =
        `radial-gradient(ellipse at center, rgba(${cr},${cg},${cb},0.75) 0%, rgb(${cr},${cg},${cb}) 78%)`;
    }
    immersionEl.style.opacity = immersion.toFixed(3);
  }

  scene.fog.color.copy(fogColor);
  scene.fog.density = DEBUG_FLAGS.nofog ? 0 : fogDensity;
  renderer.__fogRef = scene.fog;   // EnglishEnglishEnglish（tools/probe-titanfog.mjs）
  sky.setFade(skyFade / Math.max(1, renderer.toneMappingExposure));
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglish
  try {
    const sp = builder.bodies.get('sun')?.posKm;
    if (sp) sky.setSunDir?.(-sp[0], -sp[1], -sp[2]);   // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish
  } catch { /* EnglishEnglishEnglishEnglishEnglish */ }
  // EnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（skyFade），
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish、
  // TNO EnglishEnglish（≥17 English）、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  // （EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
  // EnglishEnglish/EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
  const surfVis = skyFade > 0.4 && appMode !== 'walk';
  belts.visible = surfVis;
  oortCloud.group.visible = surfVis;
  smallBodies.group.visible = surfVis;
  comets.setSkyFade(skyFade);
  tnoScene.setSkyFade(surfVis ? 1 : 0);
  builder.setSkyFade(skyFade);
  for (const v of voyagerEntries) v.group.visible = surfVis;
  oortCloud.update(dSunAU);            // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（#5）
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglish。EnglishEnglishEnglish skyFade<0.5 EnglishEnglish，
  // English skyFade EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）。
  document.getElementById('labels').classList.toggle('daysky', skyFade < 0.5 && appMode === 'walk');
  // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish（TNO/EnglishEnglish/EnglishEnglishEnglish/EnglishEnglish/EnglishEnglish）EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish
  document.getElementById('labels').classList.toggle('walksky', appMode === 'walk');

  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  ambient.intensity += ((appMode === 'walk' ? 0.14 : 0.02) - ambient.intensity) * Math.min(dt * 3, 1);
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish"EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish，English builder EnglishEnglishEnglishEnglish）
  {
    const gt = _groundTintW > 0 ? _groundTintCol : null;
    if (gt) {
      ambient.color.setRGB(
        0x40 / 255 + (gt[0] * 0.6 - 0x40 / 255) * _groundTintW,
        0x48 / 255 + (gt[1] * 0.6 - 0x48 / 255) * _groundTintW,
        0x58 / 255 + (gt[2] * 0.6 - 0x58 / 255) * _groundTintW);
    } else {
      ambient.color.setHex(0x404858);
    }
  }

  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（#21）：EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish ~0.4s），EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish ~1.4s）
  const adaptSpeed = exposureTarget < renderer.toneMappingExposure ? 2.5 : 0.7;
  renderer.toneMappingExposure +=
    (exposureTarget - renderer.toneMappingExposure) * Math.min(dt * adaptSpeed, 1);
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English sun.js English uInvExposure EnglishEnglish）
  {
    const su = builder.bodies.get('sun')?.uniforms;
    if (su?.uInvExposure) su.uInvExposure.value = 1 / Math.max(renderer.toneMappingExposure, 1e-4);
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English sun.js EnglishEnglishEnglish）
    const cu = builder.bodies.get('sun')?.coronaUniforms;
    if (cu?.uInvExposure) cu.uInvExposure.value = 1 / Math.max(renderer.toneMappingExposure, 1e-4);
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    // （EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglish uniform EnglishEnglishEnglishEnglishEnglishEnglish。
    const invExp = 1 / Math.max(renderer.toneMappingExposure, 1e-4);
    for (const bd of builder.bodies.values()) {
      const au = bd.atmoMesh?.material.userData.uniforms;
      if (au?.uInvExposure) au.uInvExposure.value = invExp;
    }
  }
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  syncRenderResolution();
}

// ---- EnglishEnglishEnglish URL（issue #1）----
// EnglishEnglish：#<focusId>,<lat_deg>,<lon_deg>,<dist_km>,<jdTT>
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；fly/walk EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。

function applyLocationHash() {
  const hash = location.hash.slice(1);
  if (!hash) return;
  const parts = hash.split(',');
  if (parts.length < 4) return;
  const [focusId, latDeg, lonDeg, distKm, jdStr] = parts;
  if (!registry.has(focusId)) return;
  const DEG = Math.PI / 180;
  const lat = parseFloat(latDeg), lon = parseFloat(lonDeg), dist = parseFloat(distKm);
  if (!isFinite(lat) || !isFinite(lon) || !isFinite(dist) || dist <= 0) return;
  orbitCam.focusId = focusId;
  orbitCam.lat = lat * DEG;
  orbitCam.lon = lon * DEG;
  orbitCam.dist = dist;
  orbitCam.distTarget = dist;
  orbitCam.tilt = 0;
  orbitCam.heading = 0;
  orbitCam.panOffset.set(0, 0, 0);
  if (jdStr) {
    const jd = parseFloat(jdStr);
    if (isFinite(jd) && jd > 2000000) simClock.jdTT = jd;
  }
  syncShipToOrbit();
  select(focusId);
}

// ── VR EnglishEnglishEnglishEnglishEnglish（WebXRManager EnglishEnglish）─────────────────────────────────
let _audioPan = 0;   // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
const _shakeE = new THREE.Euler();
const _shakeQ = new THREE.Quaternion();
let _plasmaShown = -1;
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（DOM EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish HDR EnglishEnglish）
const reentryGlow = (() => {
  const d = document.createElement('div');
  d.id = 'reentry-glow';
  d.setAttribute('aria-hidden', 'true');
  document.body.appendChild(d);
  return d;
})();
const _xrOrigin = new THREE.Vector3();
const _xrDir = new THREE.Vector3();
const _xrV = new THREE.Vector3();

function handleXREvent(ev) {
  if (ev.type === 'sessionend') { syncRenderResolution(); return; }
  if (ev.type === 'grab' && appMode === 'orbit') {
    orbitCam.panOffset.sub(_xrV.set(ev.delta.x, ev.delta.y, ev.delta.z));
    return;
  }
  if (ev.type === 'teleport' || ev.type === 'zoom') {
    // EnglishEnglishEnglishEnglish / EnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish：EnglishEnglish/EnglishEnglish=EnglishEnglish）
    if (appMode !== 'orbit') return;
    const factor = ev.type === 'teleport' ? (1 - ev.forward * 0.4) : (1 + ev.delta * 4);
    const next = orbitCam.distTarget * Math.min(1.5, Math.max(0.67, factor));
    const minD = registry.get(orbitCam.focusId)?.minDistKm ?? 0.01;
    orbitCam.distTarget = Math.max(next, minD);
  } else if (ev.type === 'raycast') {
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish pickBody English VR English）
    _xrOrigin.set(ev.origin.x, ev.origin.y, ev.origin.z);
    _xrDir.set(ev.direction.x, ev.direction.y, ev.direction.z).normalize();
    const hit = pickBodyByRay(_xrOrigin, _xrDir);
    if (hit) {
      select(hit);
      showActionTip(`${bodyName(registry.get(hit))}`, 1800);
    }
  }
  // grab（EnglishEnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，English VR EnglishEnglishEnglishEnglish
}

/** VR EnglishEnglishEnglishEnglish：EnglishEnglishEnglish = min(EnglishEnglishEnglishEnglishEnglishEnglish + 0.3° EnglishEnglish)，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
function pickBodyByRay(origin, dir) {
  let best = null, bestScore = 1;
  for (const [id, e] of registry) {
    if (!e.relObj || !e.phys?.radiusKm) continue;
    e.relObj.getWorldPosition(_xrV);
    _xrV.sub(origin);
    const dist = _xrV.length();
    if (dist < 1e-6) continue;
    _xrV.divideScalar(dist);
    const ang = Math.acos(Math.min(1, Math.max(-1, _xrV.dot(dir))));
    const hitAng = Math.atan(e.phys.radiusKm / dist) + 0.005;
    const score = ang / hitAng;
    if (score < bestScore) { bestScore = score; best = id; }
  }
  return best;
}

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（Ctrl+B）；orbit EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，fly/walk EnglishEnglishEnglishEnglishEnglishEnglishEnglish */function saveBookmark() {
  if (!bookmarks) return;
  const focusId = appMode === 'orbit' ? orbitCam.focusId : (selectedId ?? orbitCam.focusId);
  const entry = registry.get(focusId);
  const name = bodyName(entry ?? { nameZh: focusId, nameEn: focusId });
  bookmarks.save(name, {
    focusId,
    lat: orbitCam.lat, lon: orbitCam.lon, dist: orbitCam.dist,
    jdTT: simClock.jdTT, mode: appMode,
  });
  showActionTip(t('tip.bookmarkSaved', { name }));
}

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（Ctrl+Shift+B）：orbit EnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
function restoreLatestBookmark() {
  const items = bookmarks?.list?.() ?? [];
  // list() English created **EnglishEnglish**EnglishEnglish（EnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglish items[0]。
  // EnglishEnglishEnglish items[length-1] = EnglishEnglishEnglishEnglishEnglish——"EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  const latest = items[0];
  if (!latest) { showActionTip(t('tip.bookmarkNone')); return; }
  const s = latest.state ?? {};
  if (s.jdTT) simClock.set(s.jdTT);
  if (s.focusId && registry.has(s.focusId)) {
    if (appMode !== 'orbit') switchToOrbit();
    if (s.lat != null) orbitCam.lat = s.lat;
    if (s.lon != null) orbitCam.lon = s.lon;
    if (s.dist != null) { orbitCam.dist = s.dist; orbitCam.distTarget = s.dist; }
    select(s.focusId);
  }
}

function copyShareUrl() {
  if (appMode !== 'orbit') return; // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（fly/walk EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
  const DEG = Math.PI / 180;
  const lat = (orbitCam.lat / DEG).toFixed(5);
  const lon = (orbitCam.lon / DEG).toFixed(5);
  const dist = orbitCam.dist.toFixed(3);
  const jd = simClock.jdTT.toFixed(3);
  const hash = `#${orbitCam.focusId},${lat},${lon},${dist},${jd}`;
  const url = location.href.replace(/#.*$/, '') + hash;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(url)
      .then(() => showActionTip(t('tip.urlCopied')))
      .catch(() => { history.replaceState(null, '', hash); showActionTip(t('tip.urlUpdated')); });
  } else {
    history.replaceState(null, '', hash);
    showActionTip(t('tip.urlUpdated'));
  }
}

} // Graphics-dependent application setup.

// ── Service Worker：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English public/sw.js）───────────────
// EnglishEnglish https English localhost、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；file:// EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
// "EnglishEnglish U EnglishEnglishEnglish index.html"）EnglishEnglish serviceWorker，EnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：sw.js EnglishEnglishEnglish GET English"EnglishEnglishEnglishEnglish"，EnglishEnglishEnglish /src/*.js
// EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
// EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish worker EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish
// EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。
const DEV = import.meta.env?.DEV === true;
if (DEV && typeof navigator !== 'undefined' && navigator.serviceWorker) {
  navigator.serviceWorker.getRegistrations?.()
    .then((rs) => rs.forEach((r) => r.unregister()))
    .catch(() => {});
}
if (!DEV && typeof navigator !== 'undefined' && 'serviceWorker' in navigator
    && (location.protocol === 'https:' || location.hostname === 'localhost'
        || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(asset('sw.js')).catch((e) => {
      console.info('[sw] EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）', e?.message ?? e);
    });
  });
}
