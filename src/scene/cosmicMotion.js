import * as THREE from 'three';
import { KM_PER_AU, raDecToWorld } from '../config.js';

const STAR_COUNT = 1800;
const STAR_FIELD_RADIUS_KM = 8e8;
const STAR_FLOW_KM_S = 20;
const DUST_COUNT = 1400;
const DUST_ROTATION_RAD_S = 0.00001;

export function createCosmicMotion() {
  const starGroup = new THREE.Group();
  starGroup.name = 'solar-apex-star-stream';
  starGroup.frustumCulled = false;

  const apex = raDecToWorld(270.73 * Math.PI / 180, 30 * Math.PI / 180, new THREE.Vector3())
    .normalize();
  const reference = Math.abs(apex.y) > 0.95
    ? new THREE.Vector3(1, 0, 0)
    : new THREE.Vector3(0, 1, 0);
  const tangent = new THREE.Vector3().crossVectors(apex, reference).normalize();
  const bitangent = new THREE.Vector3().crossVectors(apex, tangent).normalize();
  const positions = new Float32Array(STAR_COUNT * 3);
  const colors = new Float32Array(STAR_COUNT * 3);
  let seed = 246813579;
  const random = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

  for (let i = 0; i < STAR_COUNT; i++) {
    const across = (random() * 2 - 1) * STAR_FIELD_RADIUS_KM;
    const vertical = (random() * 2 - 1) * STAR_FIELD_RADIUS_KM;
    const along = (random() * 2 - 1) * STAR_FIELD_RADIUS_KM;
    const offset = i * 3;
    positions[offset] = tangent.x * across + bitangent.x * vertical + apex.x * along;
    positions[offset + 1] = tangent.y * across + bitangent.y * vertical + apex.y * along;
    positions[offset + 2] = tangent.z * across + bitangent.z * vertical + apex.z * along;
    const brightness = 0.12 + random() * 0.28;
    const warmth = random();
    colors[offset] = brightness;
    colors[offset + 1] = brightness * (0.88 + warmth * 0.1);
    colors[offset + 2] = brightness * (0.72 + warmth * 0.2);
  }
  const initialPositions = positions.slice();

  const starGeometry = new THREE.BufferGeometry();
  const positionAttribute = new THREE.BufferAttribute(positions, 3);
  positionAttribute.setUsage(THREE.DynamicDrawUsage);
  starGeometry.setAttribute('position', positionAttribute);
  starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const starMaterial = new THREE.PointsMaterial({
    size: 1.25,
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
    fog: false,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
  });
  const starPoints = new THREE.Points(starGeometry, starMaterial);
  starPoints.frustumCulled = false;
  starPoints.renderOrder = -7;
  starGroup.add(starPoints);

  const dustGroup = new THREE.Group();
  dustGroup.name = 'zodiacal-dust';
  const dustPositions = new Float32Array(DUST_COUNT * 3);
  const dustColors = new Float32Array(DUST_COUNT * 3);
  for (let i = 0; i < DUST_COUNT; i++) {
    const radius = (0.25 + random() * 4.75) * KM_PER_AU;
    const angle = random() * Math.PI * 2;
    const offset = i * 3;
    dustPositions[offset] = Math.cos(angle) * radius;
    dustPositions[offset + 1] = (random() * 2 - 1) * radius * 0.018;
    dustPositions[offset + 2] = Math.sin(angle) * radius;
    const brightness = 0.035 + random() * 0.055;
    dustColors[offset] = brightness;
    dustColors[offset + 1] = brightness * 0.48;
    dustColors[offset + 2] = brightness * 0.2;
  }

  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  dustGeometry.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
  const dustMaterial = new THREE.PointsMaterial({
    size: 1.4,
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
    fog: false,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
  });
  const dustPoints = new THREE.Points(dustGeometry, dustMaterial);
  dustPoints.frustumCulled = false;
  dustPoints.renderOrder = -6;
  dustGroup.add(dustPoints);

  let enabled = true;
  let flowDistance = 0;

  function setEnabled(value) {
    enabled = !!value;
    starGroup.visible = enabled;
    dustGroup.visible = enabled;
  }

  function update(dt, cameraPosition) {
    starGroup.position.copy(cameraPosition);
    if (!enabled) return;

    flowDistance = (flowDistance + STAR_FLOW_KM_S * dt) % (2 * STAR_FIELD_RADIUS_KM);
    for (let i = 0; i < STAR_COUNT; i++) {
      const offset = i * 3;
      const along =
        initialPositions[offset] * apex.x +
        initialPositions[offset + 1] * apex.y +
        initialPositions[offset + 2] * apex.z +
        flowDistance;
      const wrapped = along > STAR_FIELD_RADIUS_KM
        ? along - 2 * STAR_FIELD_RADIUS_KM
        : along;
      const offsetAlong = flowDistance + wrapped - along;
      positions[offset] = initialPositions[offset] + apex.x * offsetAlong;
      positions[offset + 1] = initialPositions[offset + 1] + apex.y * offsetAlong;
      positions[offset + 2] = initialPositions[offset + 2] + apex.z * offsetAlong;
    }
    positionAttribute.needsUpdate = true;
    dustGroup.rotation.y += DUST_ROTATION_RAD_S * dt;
  }

  return { starGroup, dustGroup, setEnabled, update };
}
