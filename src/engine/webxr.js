// WebXR / VR EnglishEnglish（issue #33）：
// EnglishEnglish Three.js English WebXRManager（renderer.xr），EnglishEnglishEnglishEnglishEnglish VR EnglishEnglish。
// - EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（VR EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish simClock）
// - EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish
// - EnglishEnglishEnglishEnglish：WebXR EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
// - EnglishEnglish：Quest 2/3 EnglishEnglish >60fps，VR EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
//
// EnglishEnglishEnglishEnglish：
// - EnglishEnglishEnglish main.js：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish renderer/camera/scene，EnglishEnglishEnglishEnglishEnglishEnglish
// - VR EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（renderer.xr EnglishEnglishEnglishEnglishEnglishEnglish）
// - EnglishEnglishEnglishEnglish XRControllerModelFactory EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish

import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

// VR EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
const VR_PIXEL_RATIO = 1;       // VR EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish 1x EnglishEnglishEnglish
const RAY_LENGTH = 100;         // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
const TELEPORT_SPEED = 50;      // EnglishEnglishEnglishEnglishEnglishEnglish (km/s EnglishEnglish)
const PINCH_ZOOM_RATE = 0.5;    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish

export class WebXRManager {
  /**
   * @param {THREE.WebGLRenderer} renderer
   * @param {THREE.Camera} camera
   * @param {THREE.Scene} scene
   */
  constructor(renderer, camera, scene) {
    this._renderer = renderer;
    this._camera = camera;
    this._scene = scene;

    this._supported = false;
    this._session = null;
    this._button = null;
    this._callback = null;        // EnglishEnglishEnglishEnglishEnglishEnglishEnglish

    // EnglishEnglishEnglish
    this._controllers = [];
    this._controllerGrips = [];
    this._raycaster = new THREE.Raycaster();
    this._rays = [];              // EnglishEnglishEnglishEnglishEnglish Line
    this._factory = null;         // XRControllerModelFactory（EnglishEnglishEnglishEnglish）
    this._models = new Map();
    this._trackingRig = new THREE.Group();
    this._trackingRig.scale.setScalar(0.001); // XR metres -> scene kilometres
    this._poseMatrix = new THREE.Matrix4();

    // EnglishEnglishEnglishEnglish
    this._squeezeState = [false, false];  // EnglishEnglishEnglish squeeze
    this._selectState = [false, false];   // EnglishEnglishEnglish select (trigger)
    this._prevPinchDist = 0;              // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）
    this._grabOffset = null;              // EnglishEnglishEnglishEnglishEnglishEnglish

    // EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，VR EnglishEnglishEnglishEnglishEnglish
    this._savedPixelRatio = renderer.getPixelRatio();
    this._savedCameraAutoUpdate = renderer.xr.cameraAutoUpdate;

    // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    this._onSessionEnded = this._onSessionEnded.bind(this);
  }

  /**
   * EnglishEnglish WebXR EnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish secure context）。
   * @returns {Promise<boolean>}
   */
  async init() {
    if (typeof navigator === 'undefined' || !navigator.xr) {
      this._supported = false;
      return false;
    }
    try {
      this._supported = await navigator.xr.isSessionSupported('immersive-vr');
    } catch {
      this._supported = false;
    }
    return this._supported;
  }

  /** WebXR immersive-vr EnglishEnglishEnglishEnglish */
  get supported() { return this._supported; }

  /** EnglishEnglishEnglishEnglishEnglish XRSession（EnglishEnglish null） */
  get session() { return this._session; }

  /** EnglishEnglishEnglishEnglish VR EnglishEnglish */
  get inVR() { return this._session !== null; }

  /**
   * EnglishEnglishEnglishEnglishEnglish VR EnglishEnglishEnglishEnglish。WebXR EnglishEnglishEnglishEnglishEnglishEnglish null。
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish appendChild English document.body。
   * @returns {HTMLElement|null}
   */
  createButton() {
    if (!this._supported) return null;
    // VRButton.createButton EnglishEnglishEnglishEnglishEnglish session EnglishEnglishEnglish renderer.xr.setSession
    this._button = VRButton.createButton(this._renderer, {
      optionalFeatures: ['local-floor', 'bounded-floor', 'layers'],
    });
    // EnglishEnglish session EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    const origOnClick = this._button.onclick;
    this._button.onclick = async () => {
      if (this._session === null) {
        await this.enterVR();
      } else {
        this.exitVR();
      }
    };
    return this._button;
  }

  /**
   * EnglishEnglish VR EnglishEnglish。EnglishEnglishEnglish renderer.xr EnglishEnglishEnglishEnglishEnglishEnglish。
   * @returns {Promise<boolean>} EnglishEnglishEnglishEnglishEnglishEnglish
   */
  async enterVR() {
    if (!this._supported || this._session) return false;

    try {
      this._savedPixelRatio = this._renderer.getPixelRatio();
      this._savedCameraAutoUpdate = this._renderer.xr.cameraAutoUpdate;
      this._renderer.xr.setReferenceSpaceType('local');
      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor', 'layers'],
      });
      this._session = session;
      session.addEventListener('end', this._onSessionEnded);

      // EnglishEnglish XR EnglishEnglish
      this._renderer.xr.enabled = true;
      this._renderer.xr.cameraAutoUpdate = false;
      await this._renderer.xr.setSession(session);

      // EnglishEnglishEnglishEnglish：VR EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish
      this._renderer.setPixelRatio(VR_PIXEL_RATIO);

      // EnglishEnglishEnglishEnglish foveated rendering（Quest 2/3 EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      this._tryFoveatedRendering();

      // EnglishEnglishEnglishEnglishEnglish
      this._setupControllers();

      return true;
    } catch (err) {
      console.warn('[WebXR] EnglishEnglish VR EnglishEnglish:', err);
      const session = this._session;
      this._onSessionEnded();
      await session?.end().catch(() => {});
      return false;
    }
  }

  /** EnglishEnglish VR EnglishEnglish */
  exitVR() {
    if (this._session) {
      this._session.end();
    }
  }

  /** session end EnglishEnglish：EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglish */
  _onSessionEnded() {
    if (this._session) {
      this._session.removeEventListener('end', this._onSessionEnded);
      this._session = null;
    }
    this._renderer.xr.enabled = false;
    this._renderer.xr.cameraAutoUpdate = this._savedCameraAutoUpdate;
    this._renderer.setPixelRatio(this._savedPixelRatio);
    this._cleanupControllers();
    this._callback?.({ type: 'sessionend' });
  }

  /**
   * EnglishEnglishEnglishEnglish foveated rendering（EnglishEnglishEnglishEnglishEnglish）。
   * Quest 2/3 EnglishEnglish WebXR layers EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   */
  _tryFoveatedRendering() {
    this._renderer.xr.setFoveation?.(0.5);
    try {
      const gl = this._renderer.getContext();
      // WEBGL_qcom_framebuffer_foveated EnglishEnglishEnglishEnglishEnglish
      const ext = gl.getExtension('WEBGL_qcom_framebuffer_foveated');
      if (ext) {
        // EnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        console.info('[WebXR] foveated rendering EnglishEnglishEnglishEnglishEnglish');
      }
    } catch {
      // EnglishEnglishEnglishEnglish：EnglishEnglishEnglish VR EnglishEnglish
    }
  }

  // ── EnglishEnglishEnglishEnglishEnglish ──────────────────────────────────────────────────────

  _setupControllers() {
    this._scene.add(this._trackingRig);
    // EnglishEnglishEnglishEnglish factory（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
    if (!this._factory) {
      try {
        this._factory = new XRControllerModelFactory();
      } catch {
        this._factory = null; // GLTFLoader EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      }
    }

    for (let i = 0; i < 2; i++) {
      const controller = this._renderer.xr.getController(i);
      const grip = this._renderer.xr.getControllerGrip(i);

      // EnglishEnglishEnglishEnglishEnglish（EnglishEnglish，EnglishEnglish -Z）
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1),
      ]);
      const ray = new THREE.Line(geo, new THREE.LineBasicMaterial({
        color: 0x66ccff, transparent: true, opacity: 0.6,
      }));
      ray.scale.z = RAY_LENGTH;
      controller.add(ray);
      this._rays.push(ray);

      // EnglishEnglishEnglishEnglish
      const handlers = {
        selectstart: () => this._onSelectStart(i), selectend: () => this._onSelectEnd(i),
        squeezestart: () => this._onSqueezeStart(i), squeezeend: () => this._onSqueezeEnd(i),
        connected: e => { controller.userData.swInputSource = e.data; },
        disconnected: () => { delete controller.userData.swInputSource; },
      };
      controller.userData.swXrHandlers = handlers;
      for (const [event, handler] of Object.entries(handlers)) controller.addEventListener(event, handler);

      this._trackingRig.add(controller);
      this._controllers.push(controller);

      // EnglishEnglishEnglishEnglishEnglish 3D EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      if (this._factory) {
        try {
          const model = this._models.get(grip) ?? this._factory.createControllerModel(grip);
          this._models.set(grip, model);
          grip.add(model);
        } catch { /* EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish */ }
      }
      this._trackingRig.add(grip);
      this._controllerGrips.push(grip);
    }
  }

  _cleanupControllers() {
    for (const c of this._controllers) {
      c.removeFromParent();
      for (const [event, handler] of Object.entries(c.userData.swXrHandlers ?? {})) c.removeEventListener(event, handler);
      delete c.userData.swXrHandlers;
    }
    for (const g of this._controllerGrips) { g.removeFromParent(); this._models.get(g)?.removeFromParent(); }
    this._trackingRig.removeFromParent();
    for (const r of this._rays) { r.removeFromParent(); r.geometry.dispose(); r.material.dispose(); }
    this._controllers = [];
    this._controllerGrips = [];
    this._rays = [];
    this._squeezeState = [false, false];
    this._selectState = [false, false];
    this._prevPinchDist = 0;
    this._grabOffset = null;
  }

  // ── EnglishEnglishEnglishEnglishEnglishEnglishEnglish ──────────────────────────────────────────────────

  /** trigger EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish */
  _onSelectStart(hand) {
    this._selectState[hand] = true;
    const hit = this._raycastBody(hand);
    if (hit && this._callback) {
      this._callback({ type: 'select', hand, bodyId: hit.bodyId, point: hit.point });
    }
  }

  _onSelectEnd(hand) {
    this._selectState[hand] = false;
  }

  /** squeeze EnglishEnglish：EnglishEnglish/EnglishEnglish */
  _onSqueezeStart(hand) {
    this._squeezeState[hand] = true;
    // EnglishEnglish squeeze → EnglishEnglishEnglishEnglish
    if (this._squeezeState[0] && this._squeezeState[1]) {
      this._prevPinchDist = this._controllerDistance();
    } else {
      // EnglishEnglish squeeze → EnglishEnglishEnglishEnglish
      this._grabOffset = this._controllers[hand].position.clone();
    }
  }

  _onSqueezeEnd(hand) {
    this._squeezeState[hand] = false;
    this._grabOffset = null;
    this._prevPinchDist = 0;
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish bodies EnglishEnglish） */
  _raycastBody(hand) {
    const controller = this._controllers[hand];
    if (!controller) return null;

    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish → EnglishEnglish
    const origin = new THREE.Vector3();
    const direction = new THREE.Vector3(0, 0, -1);
    controller.getWorldPosition(origin);
    controller.getWorldDirection(direction);
    // getWorldDirection EnglishEnglish -Z EnglishEnglish，EnglishEnglishEnglishEnglish（Three.js EnglishEnglish）
    direction.negate();

    this._raycaster.set(origin, direction);
    this._raycaster.far = RAY_LENGTH;

    // EnglishEnglishEnglishEnglish callback EnglishEnglish bodies，EnglishEnglishEnglishEnglishEnglishEnglish raycast scene children
    if (this._callback) {
      this._callback({
        type: 'raycast', hand,
        origin: { x: origin.x, y: origin.y, z: origin.z },
        direction: { x: direction.x, y: direction.y, z: direction.z },
      });
    }
    return null;
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish） */
  _controllerDistance() {
    if (this._controllers.length < 2) return 0;
    return this._controllers[0].position.distanceTo(this._controllers[1].position);
  }

  // ── EnglishEnglishEnglishEnglish ────────────────────────────────────────────────────────

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish。
   * @param {number} dt EnglishEnglishEnglish（English）
   */
  update(dt) {
    if (!this._session || this._controllers.length === 0) return;
    this._updateTrackingCamera();

    // EnglishEnglish/EnglishEnglishEnglishEnglishEnglish
    for (let i = 0; i < this._controllers.length; i++) {
      const c = this._controllers[i];
      const source = c.userData.swInputSource ?? [...this._session.inputSources].find(s => s.handedness === (i === 0 ? 'left' : 'right'));
      const rawAxes = source?.gamepad?.axes;
      const axes = rawAxes?.length >= 4 ? rawAxes.slice(2, 4) : rawAxes ?? c.userData.axes;
      if (!axes) continue;

      // EnglishEnglishEnglish/EnglishEnglish Y English → EnglishEnglishEnglishEnglish
      const forward = -axes[1] || 0;
      const sideways = axes[0] || 0;
      if (Math.abs(forward) > 0.1 || Math.abs(sideways) > 0.1) {
        if (this._callback) {
          this._callback({
            type: 'teleport',
            forward: forward * TELEPORT_SPEED * dt,
            sideways: sideways * TELEPORT_SPEED * dt,
          });
        }
      }
    }

    // EnglishEnglishEnglishEnglishEnglishEnglish
    if (this._squeezeState[0] && this._squeezeState[1] && this._prevPinchDist > 0) {
      const dist = this._controllerDistance();
      const delta = this._prevPinchDist - dist; // EnglishEnglishEnglishEnglish → EnglishEnglish
      if (Math.abs(delta) > 0.001 && this._callback) {
        this._callback({
          type: 'zoom',
          delta: delta * PINCH_ZOOM_RATE,
        });
      }
      this._prevPinchDist = dist;
    }

    // EnglishEnglishEnglishEnglishEnglishEnglish
    const grabHand = this._squeezeState[0] ? 0 : (this._squeezeState[1] ? 1 : -1);
    if (grabHand >= 0 && this._grabOffset) {
      const c = this._controllers[grabHand];
      const delta = c.position.clone().sub(this._grabOffset).multiplyScalar(0.001).applyQuaternion(this._camera.quaternion);
      if (delta.lengthSq() > 1e-8 && this._callback) {
        this._callback({
          type: 'grab',
          delta: { x: delta.x, y: delta.y, z: delta.z },
        });
      }
      this._grabOffset = c.position.clone();
    }
  }

  /** Three's XR poses use metres. Convert translations, preserve unit rotation,
   * and set kilometre clip planes before the XR ArrayCamera is rendered. */
  _updateTrackingCamera() {
    const xrCamera = this._renderer.xr.getCamera?.();
    if (!xrCamera?.cameras?.length) return;
    this._camera.updateMatrixWorld(true);
    this._trackingRig.position.copy(this._camera.position);
    this._trackingRig.quaternion.copy(this._camera.quaternion);
    this._trackingRig.updateMatrixWorld(true);
    for (const view of [...xrCamera.cameras, xrCamera]) {
      this._poseMatrix.copy(view.matrix);
      for (const i of [12, 13, 14]) this._poseMatrix.elements[i] *= 0.001;
      view.matrixWorld.multiplyMatrices(this._camera.matrixWorld, this._poseMatrix);
      view.matrixWorldInverse.copy(view.matrixWorld).invert();
      view.near = this._camera.near; view.far = this._camera.far;
      if (view !== xrCamera) {
        const p = view.projectionMatrix.elements, n = view.near, f = view.far;
        p[10] = -(f + n) / (f - n); p[14] = -2 * f * n / (f - n);
        view.projectionMatrixInverse.copy(view.projectionMatrix).invert();
      }
    }
    // A conservative central frustum covers both eyes for scene culling;
    // rendering still uses the original asymmetric per-eye projections.
    xrCamera.projectionMatrix.copy(xrCamera.cameras[0].projectionMatrix);
    xrCamera.projectionMatrix.elements[0] *= 0.9;
    xrCamera.projectionMatrix.elements[8] = 0;
    xrCamera.projectionMatrixInverse.copy(xrCamera.projectionMatrix).invert();
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   * @param {function} cb EnglishEnglishEnglishEnglish，EnglishEnglish { type, hand, ...payload }
   *   type: 'select' | 'raycast' | 'teleport' | 'zoom' | 'grab'
   */
  setControllerCallback(cb) {
    this._callback = cb;
  }
}
