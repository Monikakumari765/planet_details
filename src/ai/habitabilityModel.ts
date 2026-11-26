export type PlanetId =
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune';

export interface PlanetBaseline {
  id: PlanetId;
  name: string;
  orbitalAU: number;
  gravityG: number;
  pressureAtm: number;
  co2Pct: number;
  oxygenPct: number;
  nitrogenPct: number;
  methanePct: number;
  magnetosphere: boolean;
  albedo: number;
  referenceTemperatureK: number;
  temperatureContext: 'surface' | 'cloud-top reference';
}

export interface HabitabilityScenario {
  orbitalAU: number;
  pressureAtm: number;
  co2Pct: number;
  oxygenPct: number;
  nitrogenPct: number;
}

export interface HabitabilityPrediction {
  temperatureK: number;
  esi: number;
  lifeSupportProbability: number;
  classification:
    | 'Optimal Biosphere'
    | 'Subsurface Extremophile Candidate'
    | 'Runaway Greenhouse'
    | 'Cryogenic World'
    | 'Marginal Surface Conditions';
  closestExoplanet: string;
  diagnostic: string;
  greenhouseFactor: number;
}

export const PLANET_BASELINES: readonly PlanetBaseline[] = [
  {
    id: 'mercury', name: 'Mercury', orbitalAU: 0.387, gravityG: 0.378,
    pressureAtm: 1e-14, co2Pct: 0, oxygenPct: 0, nitrogenPct: 0,
    methanePct: 0, magnetosphere: true, albedo: 0.088,
    referenceTemperatureK: 440, temperatureContext: 'surface',
  },
  {
    id: 'venus', name: 'Venus', orbitalAU: 0.723, gravityG: 0.904,
    pressureAtm: 92, co2Pct: 96.5, oxygenPct: 0, nitrogenPct: 3.5,
    methanePct: 0, magnetosphere: false, albedo: 0.75,
    referenceTemperatureK: 737, temperatureContext: 'surface',
  },
  {
    id: 'earth', name: 'Earth', orbitalAU: 1, gravityG: 1,
    pressureAtm: 1, co2Pct: 0.042, oxygenPct: 20.95, nitrogenPct: 78.08,
    methanePct: 0.00019, magnetosphere: true, albedo: 0.306,
    referenceTemperatureK: 288, temperatureContext: 'surface',
  },
  {
    id: 'mars', name: 'Mars', orbitalAU: 1.524, gravityG: 0.379,
    pressureAtm: 0.0064, co2Pct: 95.3, oxygenPct: 0.13, nitrogenPct: 2.7,
    methanePct: 0.00001, magnetosphere: false, albedo: 0.25,
    referenceTemperatureK: 210, temperatureContext: 'surface',
  },
  {
    id: 'jupiter', name: 'Jupiter', orbitalAU: 5.204, gravityG: 2.53,
    pressureAtm: 1, co2Pct: 0.0001, oxygenPct: 0, nitrogenPct: 0,
    methanePct: 0.3, magnetosphere: true, albedo: 0.503,
    referenceTemperatureK: 165, temperatureContext: 'cloud-top reference',
  },
  {
    id: 'saturn', name: 'Saturn', orbitalAU: 9.58, gravityG: 1.065,
    pressureAtm: 1, co2Pct: 0.0001, oxygenPct: 0, nitrogenPct: 0,
    methanePct: 0.45, magnetosphere: true, albedo: 0.342,
    referenceTemperatureK: 134, temperatureContext: 'cloud-top reference',
  },
  {
    id: 'uranus', name: 'Uranus', orbitalAU: 19.2, gravityG: 0.886,
    pressureAtm: 1, co2Pct: 0.0001, oxygenPct: 0, nitrogenPct: 0,
    methanePct: 2.3, magnetosphere: true, albedo: 0.3,
    referenceTemperatureK: 76, temperatureContext: 'cloud-top reference',
  },
  {
    id: 'neptune', name: 'Neptune', orbitalAU: 30, gravityG: 1.14,
    pressureAtm: 1, co2Pct: 0.0001, oxygenPct: 0, nitrogenPct: 0,
    methanePct: 1.5, magnetosphere: true, albedo: 0.29,
    referenceTemperatureK: 72, temperatureContext: 'cloud-top reference',
  },
];

const SOLAR_FLUX_AT_1_AU = 1361;
const STEFAN_BOLTZMANN = 5.670374419e-8;
const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
const sigmoid = (value: number): number => 1 / (1 + Math.exp(-clamp(value, -30, 30)));

// Embedded fixed weights keep inference deterministic and independent of network services.
const greenhouseHiddenWeights = [
  [0.05, 0, 8, 4, 0, 0, 2, 0],
  [0, 0, 6, 2, 0, 0, 2, 0],
  [0, 0.5, 1, 0, 0.5, 0.5, 0.5, 0.8],
  [0, 0, 0, 0, 0.3, 0.2, 1.2, 0.1],
];
const greenhouseHiddenBias = [-8, -4, -2, -3];
const greenhouseOutputWeights = [10, 4, 0.2, 0.4];
const greenhouseOutputBias = -4;

const classifierHiddenWeights = [
  [5, 3, 3, 1, 0.4, 1, -1, -1],
  [0, 0, 0, 0, 0, 0, 8, 0],
  [0, 0, 0, 0, 0, 0, 0, 8],
];
const classifierHiddenBias = [-7, -4, -4];
const classifierOutputWeights = [4, -4, -4];
const classifierOutputBias = -1;

function sumProducts(weights: readonly number[], values: readonly number[]): number {
  return weights.reduce((sum, weight, index) => sum + weight * (values[index] ?? 0), 0);
}

function normalizedFeatures(
  planet: PlanetBaseline,
  scenario: HabitabilityScenario,
): number[] {
  return [
    Math.log(Math.max(scenario.orbitalAU, 0.3) / 30) / Math.log(0.3 / 30),
    clamp(planet.gravityG / 3, 0, 1),
    clamp((Math.log10(Math.max(scenario.pressureAtm, 0.001)) + 3) / 5, 0, 1),
    clamp(scenario.co2Pct / 100, 0, 1),
    clamp(scenario.oxygenPct / 35, 0, 1),
    clamp(scenario.nitrogenPct / 100, 0, 1),
    clamp(planet.methanePct / 5, 0, 1),
    planet.magnetosphere ? 1 : 0,
  ];
}

function greenhouseNetwork(features: readonly number[]): number {
  const hidden = greenhouseHiddenWeights.map((weights, index) =>
    sigmoid(sumProducts(weights, features) + greenhouseHiddenBias[index]),
  );
  return sigmoid(sumProducts(greenhouseOutputWeights, hidden) + greenhouseOutputBias);
}

function radiativeTemperature(orbitalAU: number, albedo: number): number {
  const solarFlux = SOLAR_FLUX_AT_1_AU / (orbitalAU * orbitalAU);
  return ((solarFlux * (1 - albedo)) / (4 * STEFAN_BOLTZMANN)) ** 0.25;
}

function exoplanetTwin(orbitalAU: number, gravityG: number): string {
  const solarFlux = 1 / (orbitalAU * orbitalAU);
  const candidates = [
    { name: 'TRAPPIST-1 e', flux: 0.65, gravity: 0.82 },
    { name: 'TRAPPIST-1 f', flux: 0.38, gravity: 0.95 },
    { name: 'TRAPPIST-1 g', flux: 0.26, gravity: 1.04 },
    { name: 'Kepler-186 f', flux: 0.29, gravity: null },
    { name: 'Kepler-452 b', flux: 1.1, gravity: null },
  ];
  return candidates
    .map(candidate => {
      const fluxDistance = Math.abs(Math.log(solarFlux / candidate.flux));
      const gravityDistance = candidate.gravity === null
        ? 0
        : Math.abs(Math.log(Math.max(gravityG, 0.01) / candidate.gravity));
      const score = Math.exp(-(0.75 * fluxDistance + 0.25 * gravityDistance));
      return { name: candidate.name, score };
    })
    .sort((a, b) => b.score - a.score)[0].name;
}

function classifyLifeSupport(
  temperatureK: number,
  scenario: HabitabilityScenario,
  planet: PlanetBaseline,
): { probability: number; classification: HabitabilityPrediction['classification'] } {
  const thermalSuitability = Math.exp(-0.5 * ((temperatureK - 288) / 65) ** 2);
  const pressureSuitability = Math.exp(
    -0.5 * (Math.log10(Math.max(scenario.pressureAtm, 0.001)) / 1.15) ** 2,
  );
  const oxygenSuitability =
    Math.exp(-0.5 * ((scenario.oxygenPct - 21) / 12) ** 2) *
    clamp(scenario.oxygenPct / 8, 0, 1);
  const gravitySuitability = Math.exp(
    -0.5 * (Math.log(Math.max(planet.gravityG, 0.01)) / 0.55) ** 2,
  );
  const nitrogenSuitability = clamp(scenario.nitrogenPct / 50, 0, 1);
  const greenhouseRisk = clamp((temperatureK - 320) / 400, 0, 1);
  const coldRisk = clamp((230 - temperatureK) / 160, 0, 1);
  const classifierFeatures = [
    thermalSuitability,
    pressureSuitability,
    oxygenSuitability,
    gravitySuitability,
    planet.magnetosphere ? 1 : 0,
    nitrogenSuitability,
    greenhouseRisk,
    coldRisk,
  ];
  const hidden = classifierHiddenWeights.map((weights, index) =>
    sigmoid(sumProducts(weights, classifierFeatures) + classifierHiddenBias[index]),
  );
  const probability = sigmoid(
    sumProducts(classifierOutputWeights, hidden) + classifierOutputBias,
  );

  let classification: HabitabilityPrediction['classification'];
  if (temperatureK >= 380 && scenario.pressureAtm >= 0.1 && scenario.co2Pct >= 10) {
    classification = 'Runaway Greenhouse';
  } else if (temperatureK <= 190) classification = 'Cryogenic World';
  else if (probability >= 0.72) classification = 'Optimal Biosphere';
  else if (probability < 0.35) classification = 'Subsurface Extremophile Candidate';
  else classification = 'Marginal Surface Conditions';

  return { probability, classification };
}

function explain(
  classification: HabitabilityPrediction['classification'],
  temperatureK: number,
  pressureAtm: number,
  oxygenPct: number,
): string {
  if (classification === 'Optimal Biosphere') {
    return 'Temperature, pressure, and oxygen fall within the model’s surface-support window.';
  }
  if (classification === 'Runaway Greenhouse') {
    return 'The radiative estimate is extremely hot; dense greenhouse gases dominate the surface outlook.';
  }
  if (classification === 'Cryogenic World') {
    return 'Low estimated temperature limits liquid-water surface conditions; subsurface niches are not assessed.';
  }
  if (classification === 'Subsurface Extremophile Candidate') {
    return `Surface support is limited (${pressureAtm.toPrecision(2)} atm, ${oxygenPct.toFixed(1)}% O₂); sheltered niches may be less severe.`;
  }
  return `Mixed conditions: estimated temperature is ${Math.round(temperatureK)} K, with one or more major support factors outside the model’s preferred range.`;
}

export function predictHabitability(
  planet: PlanetBaseline,
  scenario: HabitabilityScenario,
): HabitabilityPrediction {
  const safeScenario: HabitabilityScenario = {
    orbitalAU: clamp(scenario.orbitalAU, 0.3, 30),
    pressureAtm: clamp(scenario.pressureAtm, 0.001, 100),
    co2Pct: clamp(scenario.co2Pct, 0, 100),
    oxygenPct: clamp(scenario.oxygenPct, 0, 35),
    nitrogenPct: clamp(scenario.nitrogenPct, 0, 100),
  };
  const baselineScenario: HabitabilityScenario = {
    orbitalAU: planet.orbitalAU,
    pressureAtm: planet.pressureAtm,
    co2Pct: planet.co2Pct,
    oxygenPct: planet.oxygenPct,
    nitrogenPct: planet.nitrogenPct,
  };
  const baselineNetwork = greenhouseNetwork(normalizedFeatures(planet, baselineScenario));
  const scenarioNetwork = greenhouseNetwork(normalizedFeatures(planet, safeScenario));
  const response = clamp(scenarioNetwork / Math.max(baselineNetwork, 0.02), 0.2, 5) ** 0.5;
  const equilibriumK = radiativeTemperature(safeScenario.orbitalAU, planet.albedo);
  const baselineEquilibriumK = radiativeTemperature(planet.orbitalAU, planet.albedo);
  const baselineGreenhouseFactor = planet.referenceTemperatureK / baselineEquilibriumK;
  const greenhouseFactor = baselineGreenhouseFactor * response;
  const temperatureK = equilibriumK * greenhouseFactor;
  const { probability, classification } = classifyLifeSupport(
    temperatureK,
    safeScenario,
    planet,
  );

  const temperatureSimilarity = Math.exp(-Math.abs(Math.log(temperatureK / 288)));
  const gravitySimilarity = 1 - Math.abs((planet.gravityG - 1) / (planet.gravityG + 1));
  const pressureSimilarity = Math.exp(
    -0.5 * Math.abs(Math.log(safeScenario.pressureAtm)),
  );
  const fluxSimilarity = Math.exp(
    -0.25 * Math.abs(Math.log(1 / (safeScenario.orbitalAU * safeScenario.orbitalAU))),
  );
  const esi = clamp(
    temperatureSimilarity ** 0.4 *
      gravitySimilarity ** 0.2 *
      pressureSimilarity ** 0.2 *
      fluxSimilarity ** 0.2,
    0,
    1,
  );

  return {
    temperatureK,
    esi,
    lifeSupportProbability: probability,
    classification,
    closestExoplanet: exoplanetTwin(safeScenario.orbitalAU, planet.gravityG),
    diagnostic: explain(
      classification,
      temperatureK,
      safeScenario.pressureAtm,
      safeScenario.oxygenPct,
    ),
    greenhouseFactor,
  };
}
