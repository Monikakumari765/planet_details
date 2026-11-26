import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createCosmicMotion } from '../src/scene/cosmicMotion.js';

function starPositions(motion) {
  return motion.starGroup.children[0].geometry.getAttribute('position').array;
}

test('cosmic star particles drift and remain finite through repeated wraps', () => {
  const motion = createCosmicMotion();
  const cameraPosition = new THREE.Vector3(12, -34, 56);
  const positions = starPositions(motion);
  const initial = positions.slice();

  motion.update(50_000, cameraPosition);
  assert.deepEqual(motion.starGroup.position.toArray(), cameraPosition.toArray());
  assert.notDeepEqual(positions, initial);

  motion.update(100_000_000, cameraPosition);
  assert.ok(positions.every(Number.isFinite));
});

test('disabling universe motion freezes particles and dust rotation', () => {
  const motion = createCosmicMotion();
  const positions = starPositions(motion);
  const initial = positions.slice();

  motion.setEnabled(false);
  motion.update(50_000, new THREE.Vector3());
  assert.equal(motion.starGroup.visible, false);
  assert.equal(motion.dustGroup.visible, false);
  assert.deepEqual(positions, initial);
  assert.equal(motion.dustGroup.rotation.y, 0);

  motion.setEnabled(true);
  motion.update(50_000, new THREE.Vector3());
  assert.notDeepEqual(positions, initial);
  assert.ok(motion.dustGroup.rotation.y > 0);
});
