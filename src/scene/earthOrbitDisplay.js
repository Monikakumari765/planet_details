import * as THREE from 'three';

const EARTH_RADIUS_KM = 6371;
const DEG = Math.PI / 180;
const OBLIQUITY = 23.43928 * DEG;
const LABEL_PIXEL_WIDTH = 92;
const LABEL_PIXEL_HEIGHT = 22;

// Representative low-Earth-orbit paths for the observatory-style Earth view.
// Their geometry is illustrative and is not a live satellite ephemeris.
const ORBITS = [
  { id: 'iss', label: 'ISS', color: 0x62d7ff, altitude: 420, inclination: 51.6, node: 12, periodMin: 92.7, phase: 0.25 },
  { id: 'hubble', label: 'HUBBLE', color: 0xffd166, altitude: 540, inclination: 28.5, node: 104, periodMin: 95.4, phase: 2.2 },
  { id: 'landsat', label: 'LANDSAT 9', color: 0x9a8cff, altitude: 705, inclination: 98.2, node: 214, periodMin: 98.9, phase: 4.1 },
  { id: 'terra', label: 'TERRA', color: 0x75e0a5, altitude: 705, inclination: 98.2, node: 42, periodMin: 98.9, phase: 1.2 },
];

function orbitPoint(orbit, angle, out = new THREE.Vector3()) {
  const r = EARTH_RADIUS_KM + orbit.altitude;
  const i = orbit.inclination * DEG;
  const n = orbit.node * DEG;
  const x = r * Math.cos(angle);
  const y = r * Math.sin(angle) * Math.cos(i);
  const z = r * Math.sin(angle) * Math.sin(i);
  return out.set(
    x * Math.cos(n) + z * Math.sin(n),
    y,
    -x * Math.sin(n) + z * Math.cos(n),
  );
}

function makeLabelTexture(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 276;
  canvas.height = 66;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(5, 15, 28, 0.88)';
  ctx.strokeStyle = `#${color.toString(16).padStart(6, '0')}`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(2, 2, canvas.width - 4, canvas.height - 4, 18);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#e7f5ff';
  ctx.font = '700 26px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 18, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createSatellite(orbit) {
  const marker = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.OctahedronGeometry(1, 0),
    new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
  );
  marker.add(body);

  const panelMaterial = new THREE.MeshBasicMaterial({ color: orbit.color, toneMapped: false });
  const panelGeometry = new THREE.BoxGeometry(3.2, 0.12, 0.9);
  const panels = new THREE.Mesh(panelGeometry, panelMaterial);
  marker.add(panels);

  const labelTexture = makeLabelTexture(orbit.label, orbit.color);
  const label = new THREE.Sprite(new THREE.SpriteMaterial({
    map: labelTexture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    toneMapped: false,
  }));
  label.center.set(0, 0.5);
  return { marker, label, labelTexture, panelGeometry, panelMaterial };
}

export function createEarthOrbitDisplay(earthEntry) {
  if (!earthEntry?.group || !earthEntry?.phys?.radiusKm) return null;

  const root = new THREE.Group();
  root.name = 'earth-observatory-orbits';
  // Align the orbit planes with Earth's inertial equator while leaving them
  // independent of the planet's daily spin.
  root.rotation.x = -OBLIQUITY;
  earthEntry.group.add(root);

  const entries = ORBITS.map((orbit) => {
    const points = [];
    for (let i = 0; i < 256; i++) points.push(orbitPoint(orbit, i / 256 * Math.PI * 2));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: orbit.color,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
      toneMapped: false,
    });
    const path = new THREE.LineLoop(geometry, material);
    path.renderOrder = 8;
    root.add(path);

    const satellite = createSatellite(orbit);
    satellite.marker.renderOrder = 9;
    satellite.label.renderOrder = 10;
    root.add(satellite.marker, satellite.label);
    return { orbit, path, ...satellite };
  });
  const cameraRight = new THREE.Vector3();

  return {
    update(jdTT, camera, focusId, mode) {
      const cameraDistance = camera.position.distanceTo(earthEntry.group.position);
      const visible = mode === 'orbit' && focusId === 'earth'
        && cameraDistance > EARTH_RADIUS_KM * 1.8
        && cameraDistance < EARTH_RADIUS_KM * 28;
      root.visible = visible;
      if (!visible) return;

      const worldPerPixel = Math.max(
        1,
        2 * cameraDistance * Math.tan(camera.fov * DEG / 2) / Math.max(1, window.innerHeight),
      );
      cameraRight.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
      for (const entry of entries) {
        const { orbit, marker, label } = entry;
        const angle = orbit.phase + (jdTT - 2451545.0) * 86400 * Math.PI * 2 / (orbit.periodMin * 60);
        marker.position.copy(orbitPoint(orbit, angle));
        const markerSize = THREE.MathUtils.clamp(worldPerPixel * 8, 22, EARTH_RADIUS_KM * 0.08);
        marker.scale.setScalar(markerSize);
        label.position.copy(marker.position).addScaledVector(cameraRight, markerSize * 1.2);
        label.scale.set(worldPerPixel * LABEL_PIXEL_WIDTH, worldPerPixel * LABEL_PIXEL_HEIGHT, 1);
      }
    },
  };
}
