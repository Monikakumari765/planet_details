import * as THREE from 'three';
import { observerSurfacePoint } from '../physics/userObserver.ts';

const RING_INNER_KM = 30;
const RING_OUTER_KM = 38;
const PIN_HEIGHT_KM = 90;

export function createUserObserverBeacon(earthEntry) {
  if (!earthEntry?.mesh || !Number.isFinite(earthEntry.phys?.radiusKm)) {
    throw new TypeError('An Earth mesh and radius are required for the observer beacon.');
  }

  const anchor = new THREE.Group();
  anchor.name = 'user-observer-beacon';
  anchor.visible = false;

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
    depthWrite: false,
    toneMapped: false,
  });
  const pulseMaterial = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    transparent: true,
    opacity: 0.62,
    side: THREE.DoubleSide,
    depthWrite: false,
    toneMapped: false,
  });
  const pinMaterial = new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
    toneMapped: false,
  });

  const ringGeometry = new THREE.RingGeometry(RING_INNER_KM, RING_OUTER_KM, 48);
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 2;
  ring.renderOrder = 12;

  const pulseRing = new THREE.Mesh(ringGeometry, pulseMaterial);
  pulseRing.rotation.x = -Math.PI / 2;
  pulseRing.position.y = 1;
  pulseRing.renderOrder = 11;

  const pin = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 1.4, PIN_HEIGHT_KM, 8),
    pinMaterial,
  );
  pin.position.y = PIN_HEIGHT_KM / 2;
  pin.renderOrder = 12;

  const beaconTip = new THREE.Mesh(
    new THREE.SphereGeometry(6, 12, 8),
    new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  beaconTip.position.y = PIN_HEIGHT_KM;
  beaconTip.renderOrder = 13;

  anchor.add(pulseRing, ring, pin, beaconTip);
  earthEntry.mesh.add(anchor);

  let pulseTime = 0;
  return {
    setLocation(coordinates) {
      if (!coordinates) {
        anchor.visible = false;
        return;
      }
      const { position, normal } = observerSurfacePoint(
        coordinates.latitude,
        coordinates.longitude,
        earthEntry.phys.radiusKm,
      );
      anchor.position.set(position.x, position.y, position.z);
      anchor.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(normal.x, normal.y, normal.z).normalize(),
      );
      anchor.visible = true;
    },
    update(deltaSeconds) {
      pulseTime += Math.max(0, deltaSeconds);
      const phase = (Math.sin(pulseTime * 2.2) + 1) / 2;
      const pulseScale = 1 + phase * 0.55;
      pulseRing.scale.setScalar(pulseScale);
      pulseMaterial.opacity = 0.18 + (1 - phase) * 0.38;
      beaconTip.material.opacity = 0.68 + phase * 0.3;
    },
  };
}
