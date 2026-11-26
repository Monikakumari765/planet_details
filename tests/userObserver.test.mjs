import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateObserverTelemetry,
  observerSurfacePoint,
  validateObserverCoordinates,
  worldVectorToEquatorialDirection,
} from '../src/physics/userObserver.ts';

test('observer coordinates are range-checked and normalized to numeric pairs', () => {
  assert.deepEqual(validateObserverCoordinates({ latitude: 22, longitude: 78 }), {
    latitude: 22,
    longitude: 78,
  });
  assert.throws(() => validateObserverCoordinates({ latitude: 91, longitude: 0 }), RangeError);
  assert.throws(() => validateObserverCoordinates({ latitude: 0, longitude: -181 }), RangeError);
});

test('Earth beacon surface points follow longitude and geodetic latitude on the oblate globe', () => {
  const equator = observerSurfacePoint(0, 0, 6371);
  assert.equal(equator.position.x, 6371);
  assert.ok(Math.abs(equator.position.y) < 1e-10);
  assert.ok(Math.abs(equator.position.z) < 1e-10);

  const east = observerSurfacePoint(0, 90, 6371);
  assert.ok(Math.abs(east.position.x) < 1e-10);
  assert.equal(east.position.z, -6371);

  const pole = observerSurfacePoint(90, 0, 6371);
  assert.ok(Math.abs(pole.position.y - 6371) < 1e-10);
  assert.ok(Math.abs(pole.normal.y - 1) < 1e-12);
});

test('observer rotational speed and centrifugal reduction match latitude', () => {
  const date = new Date('2026-01-01T00:00:00Z');
  const equator = calculateObserverTelemetry(
    { latitude: 0, longitude: 0 },
    date,
    null,
  );
  assert.equal(equator.rotationalSpeedMps, 465.1);
  assert.equal(equator.rotationalSpeedKmh, 465.1 * 3.6);
  assert.ok(Math.abs(equator.centrifugalGravityReductionMps2 - 0.0339) < 0.0002);

  const indiaLatitude = calculateObserverTelemetry(
    { latitude: 22, longitude: 78 },
    date,
    null,
  );
  const expectedIndiaSpeed = 465.1 * Math.cos((22 * Math.PI) / 180) * 3.6;
  assert.ok(Math.abs(indiaLatitude.rotationalSpeedKmh - expectedIndiaSpeed) < 1e-10);
  assert.ok(indiaLatitude.centrifugalGravityReductionMps2 < equator.centrifugalGravityReductionMps2);
});

test('local sidereal time correctly determines a target above or below the horizon', () => {
  const date = new Date('2026-05-01T12:00:00Z');
  const observer = { latitude: 35, longitude: -120 };
  const lst = calculateObserverTelemetry(observer, date, null).localSiderealTimeHours;
  const rightAscensionRad = (lst * Math.PI) / 12;

  const overhead = calculateObserverTelemetry(observer, date, {
    rightAscensionRad,
    declinationRad: (35 * Math.PI) / 180,
  });
  assert.ok(Math.abs(overhead.planetAltitudeDegrees - 90) < 1e-5);
  assert.equal(overhead.planetVisible, true);

  const opposite = calculateObserverTelemetry(observer, date, {
    rightAscensionRad: rightAscensionRad + Math.PI,
    declinationRad: -(35 * Math.PI) / 180,
  });
  assert.ok(Math.abs(opposite.planetAltitudeDegrees + 90) < 1e-5);
  assert.equal(opposite.planetVisible, false);
});

test('world-space ecliptic vectors convert to equatorial directions', () => {
  const direction = worldVectorToEquatorialDirection({ x: 1, y: 0, z: 0 });
  assert.equal(direction.rightAscensionRad, 0);
  assert.equal(direction.declinationRad, 0);
  assert.throws(
    () => worldVectorToEquatorialDirection({ x: 0, y: 0, z: 0 }),
    RangeError,
  );
});
