import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePlanetProximity } from '../src/audio/cosmicAudio.ts';

test('planet proximity maps the configured radius range to a smooth 0–1 value', () => {
  assert.equal(normalizePlanetProximity(1.2, 1), 1);
  assert.equal(normalizePlanetProximity(10.6, 1), 0.5);
  assert.equal(normalizePlanetProximity(20, 1), 0);
  assert.equal(normalizePlanetProximity(100, 1), 0);
});

test('planet proximity rejects invalid distances and radii', () => {
  assert.throws(() => normalizePlanetProximity(-1, 1), RangeError);
  assert.throws(() => normalizePlanetProximity(1, 0), RangeError);
  assert.throws(() => normalizePlanetProximity(Number.NaN, 1), RangeError);
});
