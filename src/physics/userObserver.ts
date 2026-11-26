export interface ObserverCoordinates {
  latitude: number;
  longitude: number;
}

export interface EquatorialDirection {
  rightAscensionRad: number;
  declinationRad: number;
}

export interface WorldVector {
  x: number;
  y: number;
  z: number;
}

export interface ObserverTelemetry {
  rotationalSpeedMps: number;
  rotationalSpeedKmh: number;
  centrifugalGravityReductionMps2: number;
  localSiderealTimeHours: number;
  planetAltitudeDegrees: number | null;
  planetVisible: boolean | null;
}

const EARTH_EQUATORIAL_RADIUS_M = 6_371_000;
const EARTH_FLATTENING = 1 / 298.257223563;
const EARTH_ANGULAR_VELOCITY_RAD_S = 7.292115e-5;
const EQUATORIAL_ROTATION_SPEED_MPS = 465.1;
const EARTH_OBLIQUITY_RAD = (23.43928 * Math.PI) / 180;

export function validateObserverCoordinates(coordinates: ObserverCoordinates): ObserverCoordinates {
  const { latitude, longitude } = coordinates;
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new RangeError('Latitude must be between -90 and 90 degrees.');
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new RangeError('Longitude must be between -180 and 180 degrees.');
  }
  return { latitude, longitude };
}

export function observerSurfacePoint(
  latitudeDegrees: number,
  longitudeDegrees: number,
  equatorialRadiusKm: number,
  flattening = EARTH_FLATTENING,
): { position: WorldVector; normal: WorldVector } {
  validateObserverCoordinates({ latitude: latitudeDegrees, longitude: longitudeDegrees });
  if (!Number.isFinite(equatorialRadiusKm) || equatorialRadiusKm <= 0) {
    throw new RangeError('Equatorial radius must be a positive finite number.');
  }
  if (!Number.isFinite(flattening) || flattening < 0 || flattening >= 1) {
    throw new RangeError('Flattening must be a finite value between 0 and 1.');
  }

  const latitude = (latitudeDegrees * Math.PI) / 180;
  const longitude = (longitudeDegrees * Math.PI) / 180;
  const eccentricitySquared = flattening * (2 - flattening);
  const geocentricLatitude = Math.atan2(
    (1 - eccentricitySquared) * Math.sin(latitude),
    Math.cos(latitude),
  );
  const horizontal = equatorialRadiusKm * Math.cos(geocentricLatitude);

  return {
    position: {
      x: horizontal * Math.cos(longitude),
      y: equatorialRadiusKm * Math.sin(geocentricLatitude),
      z: -horizontal * Math.sin(longitude),
    },
    normal: {
      x: Math.cos(latitude) * Math.cos(longitude),
      y: Math.sin(latitude),
      z: -Math.cos(latitude) * Math.sin(longitude),
    },
  };
}

export function worldVectorToEquatorialDirection(vector: WorldVector): EquatorialDirection {
  if (![vector.x, vector.y, vector.z].every(Number.isFinite)) {
    throw new TypeError('Planet direction must contain finite coordinates.');
  }
  const eclipticX = vector.x;
  const eclipticY = -vector.z;
  const eclipticZ = vector.y;
  const equatorialY =
    eclipticY * Math.cos(EARTH_OBLIQUITY_RAD) -
    eclipticZ * Math.sin(EARTH_OBLIQUITY_RAD);
  const equatorialZ =
    eclipticY * Math.sin(EARTH_OBLIQUITY_RAD) +
    eclipticZ * Math.cos(EARTH_OBLIQUITY_RAD);
  const length = Math.hypot(vector.x, equatorialY, equatorialZ);
  if (length === 0) throw new RangeError('Planet direction must not be zero.');

  return {
    rightAscensionRad: normalizeRadians(Math.atan2(equatorialY, vector.x)),
    declinationRad: Math.asin(Math.max(-1, Math.min(1, equatorialZ / length))),
  };
}

export function calculateObserverTelemetry(
  coordinates: ObserverCoordinates,
  date: Date,
  planetDirection: EquatorialDirection | null,
): ObserverTelemetry {
  const { latitude, longitude } = validateObserverCoordinates(coordinates);
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
    throw new TypeError('Observer telemetry requires a valid date.');
  }
  if (planetDirection && (
    !Number.isFinite(planetDirection.rightAscensionRad) ||
    !Number.isFinite(planetDirection.declinationRad) ||
    Math.abs(planetDirection.declinationRad) > Math.PI / 2
  )) {
    throw new TypeError('Planet direction must contain valid right ascension and declination.');
  }

  const latitudeRad = (latitude * Math.PI) / 180;
  const latitudeCosine = Math.cos(latitudeRad);
  const rotationalSpeedMps = EQUATORIAL_ROTATION_SPEED_MPS * latitudeCosine;
  const centrifugalGravityReductionMps2 =
    EARTH_ANGULAR_VELOCITY_RAD_S ** 2 *
    EARTH_EQUATORIAL_RADIUS_M *
    latitudeCosine ** 2;
  const julianDateUtc = date.getTime() / 86_400_000 + 2_440_587.5;
  const centuries = (julianDateUtc - 2_451_545) / 36_525;
  const gmstDegrees =
    280.46061837 +
    360.98564736629 * (julianDateUtc - 2_451_545) +
    0.000387933 * centuries ** 2 -
    centuries ** 3 / 38_710_000;
  const localSiderealTimeRad = normalizeRadians(
    (gmstDegrees * Math.PI) / 180 + (longitude * Math.PI) / 180,
  );

  let planetAltitudeDegrees: number | null = null;
  let planetVisible: boolean | null = null;
  if (planetDirection) {
    const hourAngle = normalizeSignedRadians(
      localSiderealTimeRad - planetDirection.rightAscensionRad,
    );
    const sinAltitude =
      Math.sin(latitudeRad) * Math.sin(planetDirection.declinationRad) +
      latitudeCosine *
        Math.cos(planetDirection.declinationRad) *
        Math.cos(hourAngle);
    planetAltitudeDegrees = (Math.asin(Math.max(-1, Math.min(1, sinAltitude))) * 180) / Math.PI;
    planetVisible = planetAltitudeDegrees > 0;
  }

  return {
    rotationalSpeedMps,
    rotationalSpeedKmh: rotationalSpeedMps * 3.6,
    centrifugalGravityReductionMps2,
    localSiderealTimeHours: (localSiderealTimeRad * 12) / Math.PI,
    planetAltitudeDegrees,
    planetVisible,
  };
}

function normalizeRadians(angle: number): number {
  return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

function normalizeSignedRadians(angle: number): number {
  const normalized = normalizeRadians(angle);
  return normalized > Math.PI ? normalized - 2 * Math.PI : normalized;
}
