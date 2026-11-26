import * as THREE from 'three';
import { KM_PER_AU } from '../config.js';

const LIGHT_SPEED_KM_S = 299792.458;
const PULSE_TIME_ACCELERATION = 1000;

export function createTerraformingOverlays(scene, sunGroup, bodies) {
  const habitableZone = new THREE.Mesh(
    new THREE.RingGeometry(0.95 * KM_PER_AU, 1.67 * KM_PER_AU, 192),
    new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      fog: false,
    }),
  );
  habitableZone.name = 'habitable-zone-ring';
  habitableZone.rotation.x = -Math.PI / 2;
  habitableZone.visible = false;
  sunGroup.add(habitableZone);

  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = new Float32Array(6);
  const lineAttribute = new THREE.BufferAttribute(linePositions, 3);
  lineAttribute.setUsage(THREE.DynamicDrawUsage);
  lineGeometry.setAttribute('position', lineAttribute);
  const pulseLine = new THREE.Line(
    lineGeometry,
    new THREE.LineBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      fog: false,
    }),
  );
  pulseLine.name = 'earth-target-light-pulse-line';
  pulseLine.frustumCulled = false;
  pulseLine.visible = false;
  scene.add(pulseLine);

  const photon = new THREE.Group();
  photon.name = 'earth-target-photon';
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(18000, 20, 14),
    new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      fog: false,
    }),
  );
  const aura = new THREE.Mesh(
    new THREE.SphereGeometry(52000, 20, 14),
    new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      fog: false,
    }),
  );
  photon.add(aura, core);
  photon.visible = false;
  scene.add(photon);

  let state = {
    showHabitableZone: false,
    showLightPulse: false,
    targetPlanetId: 'earth',
  };

  function setState(nextState) {
    state = {
      showHabitableZone: !!nextState.showHabitableZone,
      showLightPulse: !!nextState.showLightPulse,
      targetPlanetId: String(nextState.targetPlanetId ?? 'earth').toLowerCase(),
    };
    habitableZone.visible = state.showHabitableZone;
    pulseLine.visible = state.showLightPulse && state.targetPlanetId !== 'earth';
    photon.visible = pulseLine.visible;
  }

  function update(nowSeconds = performance.now() / 1000) {
    if (!state.showLightPulse || state.targetPlanetId === 'earth') return;
    const earth = bodies.get('earth');
    const target = bodies.get(state.targetPlanetId);
    if (!earth || !target) {
      pulseLine.visible = false;
      photon.visible = false;
      return;
    }

    const start = earth.group.position;
    const end = target.group.position;
    const distanceKm = start.distanceTo(end);
    if (distanceKm < 1) {
      pulseLine.visible = false;
      photon.visible = false;
      return;
    }

    pulseLine.visible = true;
    photon.visible = true;
    lineAttribute.setXYZ(0, start.x, start.y, start.z);
    lineAttribute.setXYZ(1, end.x, end.y, end.z);
    lineAttribute.needsUpdate = true;
    lineGeometry.computeBoundingSphere();

    const lightTravelSeconds = distanceKm / LIGHT_SPEED_KM_S / PULSE_TIME_ACCELERATION;
    const visualTravelSeconds = THREE.MathUtils.clamp(lightTravelSeconds, 1.2, 12);
    const progress = (nowSeconds % visualTravelSeconds) / visualTravelSeconds;
    photon.position.copy(start).lerp(end, progress);
  }

  function dispose() {
    sunGroup.remove(habitableZone);
    scene.remove(pulseLine, photon);
    habitableZone.geometry.dispose();
    habitableZone.material.dispose();
    lineGeometry.dispose();
    pulseLine.material.dispose();
    core.geometry.dispose();
    core.material.dispose();
    aura.geometry.dispose();
    aura.material.dispose();
  }

  return { setState, update, dispose };
}
