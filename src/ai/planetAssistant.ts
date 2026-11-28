import { planetPosition } from '../astro/planets.js';
import { dateToJD, jdUTtoTT } from '../astro/time.js';

export interface PlanetAssistantAnswer {
  reply: string;
  targetPlanet?: string;
  followUps: string[];
}

const AU_KM = 149_597_870.7;
const C_KM_S = 299_792.458;
const BODIES = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'europa', 'titan', 'enceladus'];
const NAMES: Record<string, string> = { sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', earth: 'Earth', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', europa: 'Europa', titan: 'Titan', enceladus: 'Enceladus' };

const FACTS: Record<string, string> = {
  sun: 'The Sun is a G2V star made mainly of hydrogen (~73% by mass) and helium (~25%), with a ~5,778 K photosphere. Its core fuses hydrogen into helium; the solar wind and magnetic activity shape the heliosphere.',
  mercury: 'Mercury has an almost airless exosphere (oxygen, sodium, hydrogen, helium and potassium traces), ~0 bar surface pressure, 3.7 m/s² gravity, 4.25 km/s escape speed, an 88-day year and 0.034° axial tilt. Its large iron-rich core occupies most of its radius. Daytime reaches ~430°C, but the night side is far colder.',
  venus: 'Venus’s atmosphere is ~96.5% CO₂ and 3.5% N₂, with trace SO₂ and water; surface pressure is ~92 bar. A strong CO₂ greenhouse holds the surface near 465°C, making Venus the hottest planet. Gravity is 8.87 m/s², escape speed 10.36 km/s, year 224.7 days, and axial tilt ~177.4° (retrograde). The interior likely has an iron-rich core; cloud-top winds are super-rotating.',
  earth: 'Earth’s dry air is ~78.08% N₂, 20.95% O₂, 0.93% Ar and ~0.042% CO₂; water vapour varies. Mean sea-level pressure is 1 bar. Natural greenhouse gases warm the surface by about 33°C relative to an airless Earth. Surface gravity is 9.81 m/s², escape speed 11.2 km/s, year 365.256 days, and axial tilt 23.44°. A liquid iron-nickel outer core surrounds a solid inner core. Earth is the only world with confirmed surface liquid water and life.',
  mars: 'Mars’s thin atmosphere is ~95.3% CO₂, 2.7% N₂ and 1.6% Ar, with trace O₂ and CH₄; mean surface pressure is ~0.006 bar. Its weak greenhouse effect cannot prevent a cold climate. Gravity is 3.71 m/s², escape speed 5.03 km/s, year 687 days and axial tilt 25.2°. It has an iron-sulfur-rich core. Global dust storms occur, and ancient river channels plus polar ice record a wetter past.',
  jupiter: 'Jupiter’s atmosphere is roughly 89% H₂ and 10% He by volume, with CH₄, NH₃ and water traces; it has no solid surface or single surface pressure. Its H₂/He envelope surrounds metallic hydrogen and likely a diffuse heavy-element core. Cloud-top gravity is ~24.8 m/s², escape speed 59.5 km/s, year 11.86 years, and axial tilt 3.13°. The Great Red Spot is a long-lived anticyclone; jet-stream winds exceed 500 km/h.',
  saturn: 'Saturn is mostly H₂ and He with trace CH₄ and ammonia; no solid surface or single surface pressure exists. Its interior likely has a heavy-element core under metallic hydrogen. Cloud-top gravity is ~10.4 m/s², escape speed 35.5 km/s, year 29.45 years, and axial tilt ~26.7°. Winds can exceed 1,800 km/h, and its north-polar hexagon is a persistent jet-stream pattern.',
  uranus: 'Uranus’s atmosphere is mostly H₂ and He with ~2% CH₄ by volume, which absorbs red light. It has no solid surface; pressure rises inward through an ice-rich mantle (water, ammonia and methane) toward a rocky core. Cloud-top gravity is ~8.69 m/s², escape speed 21.3 km/s, year 84 years, and axial tilt ~97.8°. Its extreme seasons follow from this near-sideways rotation.',
  neptune: 'Neptune’s atmosphere is mainly H₂ and He with ~1–2% CH₄; there is no solid surface. Beneath it lies an ice-rich mantle and likely rocky core. Cloud-top gravity is ~11.2 m/s², escape speed 23.5 km/s, year 164.8 years, and axial tilt ~28.3°. Winds reach roughly 2,000 km/h, among the fastest measured in the Solar System.',
  moon: 'The Moon has an extremely tenuous exosphere, not a breathable atmosphere, and essentially no surface pressure. Gravity is 1.62 m/s², escape speed 2.38 km/s, it orbits Earth in 27.3 days, and its axial tilt is about 6.7° to the ecliptic. Its differentiated interior includes a small iron-rich core. Permanently shadowed polar craters contain water ice.',
  europa: 'Europa is an icy moon with a water-ice shell over a likely global salty ocean, heated in part by tidal flexing. Its tenuous oxygen exosphere has negligible pressure. The ocean is a compelling habitability target, but no life or biosignature has been detected. Its surface gravity is ~1.31 m/s² and escape speed ~2.0 km/s.',
  titan: 'Titan has a dense atmosphere of ~98.4% N₂ and ~1.4% CH₄, with trace H₂ and other hydrocarbons; surface pressure is ~1.47 bar. Methane and ethane form clouds, rain, rivers and lakes in a cold methane cycle. Beneath its icy crust may be a water-ammonia ocean. Surface gravity is ~1.35 m/s², escape speed ~2.64 km/s. Its rich organic chemistry is interesting, but life is unconfirmed.',
  enceladus: 'Enceladus has a tiny water-vapour-rich plume-fed exosphere and no substantial surface atmosphere. A global subsurface saltwater ocean vents through the south-polar tiger stripes; plume material includes water, salts, silica and organic compounds, with evidence for hydrothermal activity. This makes it a leading astrobiology target, but no biosignature or life has been confirmed. Gravity is ~0.11 m/s² and escape speed ~0.24 km/s.',
};

const FOLLOWUPS: Record<string, string[]> = {
  general: ['How far is Mars right now?', 'Could life exist on Europa?', 'Compare Earth and Venus'],
  habitability: ['What makes Europa habitable?', 'What is the Earth Similarity Index?', 'Could Enceladus support life?'],
  atmosphere: ['Which planet has the strongest winds?', 'Why is Venus so hot?', 'Compare Earth and Mars'],
};

export function liveDistance(target: string, now = new Date()) {
  const jdTT = jdUTtoTT(dateToJD(now));
  const earth = planetPosition('earth', jdTT);
  const other = target === 'sun'
    ? { x: 0, y: 0, z: 0 }
    : target === 'moon'
      ? (() => { const m = planetPosition('earth', jdTT); return { x: m.x, y: m.y, z: m.z }; })()
      : planetPosition(target, jdTT);
  const km = Math.hypot(earth.x - other.x, earth.y - other.y, earth.z - other.z);
  return { km, au: km / AU_KM, lightMinutes: km / C_KM_S / 60 };
}

function detectBody(question: string) {
  const q = question.toLowerCase();
  const aliases: Record<string, string[]> = { sun: ['sun', 'solar'], moon: ['moon', 'luna'], earth: ['earth'], jupiter: ['jupiter'], saturn: ['saturn'], mercury: ['mercury'], venus: ['venus'], mars: ['mars'], uranus: ['uranus'], neptune: ['neptune'], europa: ['europa'], titan: ['titan'], enceladus: ['enceladus'] };
  return Object.entries(aliases).find(([, words]) => words.some((word) => new RegExp(`\\b${word}\\b`, 'i').test(q)))?.[0];
}

export function answerPlanetQuestion(question: string): PlanetAssistantAnswer {
  const q = question.trim().toLowerCase();
  const target = detectBody(q);
  const compare = q.match(/compare\s+([a-z]+)\s+(?:and|vs\.?|versus)\s+([a-z]+)/i);
  if (compare) {
    const a = detectBody(compare[1]); const b = detectBody(compare[2]);
    if (a && b) return { reply: `${NAMES[a]}: ${FACTS[a]}\n\n${NAMES[b]}: ${FACTS[b]}`, targetPlanet: a, followUps: [`How does ${NAMES[a]}'s gravity compare?`, `Could life exist on ${NAMES[b]}?`] };
  }
  if (/hottest|hotter|temperature extreme/.test(q)) return { reply: 'Venus is the hottest planet by average surface temperature (~465°C), even though Mercury is closer to the Sun. Venus’s dense CO₂ atmosphere traps heat through an intense greenhouse effect.', targetPlanet: 'venus', followUps: FOLLOWUPS.atmosphere };
  if (/strongest gravity|most gravity|highest gravity/.test(q)) return { reply: 'Jupiter has the strongest cloud-top gravity among the planets, about 24.8 m/s² (2.53 Earth g). The Sun’s surface gravity is much stronger overall, around 274 m/s².', targetPlanet: 'jupiter', followUps: FOLLOWUPS.general };
  if (/most moons|which planet.*moons|planet.*most.*moon/.test(q)) return { reply: 'The known moon counts can change as small satellites are discovered and confirmed. Saturn currently has the largest confirmed family; Jupiter is also exceptionally rich in moons. Ask about Saturn or Jupiter for their environments and major satellites.', targetPlanet: 'saturn', followUps: ['What is Saturn like?', 'Tell me about Europa', 'Compare Jupiter and Saturn'] };
  if (/esi|earth similarity|similarity index/.test(q)) return { reply: 'The Earth Similarity Index (ESI) is a 0–1 comparison of selected properties such as radius, density, escape velocity and surface temperature. It measures resemblance, not life or habitability: a high score does not establish liquid water, a suitable atmosphere, or biosignatures.', ...(target ? { targetPlanet: target } : {}), followUps: FOLLOWUPS.habitability };
  if (/life|habit|biosignature|water|ocean/.test(q)) {
    const body = target ?? (q.includes('life') ? 'europa' : undefined);
    const detail = body ? `${NAMES[body]}: ${FACTS[body]}` : 'Liquid water is stable at a world’s surface only when temperature and pressure allow it; it can also persist below ice, where tidal or internal heat supplies energy. Europa and Enceladus likely have subsurface oceans, while Titan may have a deep water-ammonia ocean. Organic chemistry or water alone is not evidence of life; no extraterrestrial biosignature has been confirmed.';
    return { reply: detail + (body ? '\n\nHabitability is plausible in some environments, but there is no confirmed evidence of life.' : ''), ...(body ? { targetPlanet: body } : {}), followUps: FOLLOWUPS.habitability };
  }
  if (/distance|light.?travel|light delay|how far|telemetry/.test(q) && target) {
    if (target === 'moon' || target === 'europa' || target === 'titan' || target === 'enceladus') {
      return { reply: `${NAMES[target]} is a natural satellite, so this planetary ephemeris view reports its host’s Earth distance, not a moon-resolved spacecraft range.`, targetPlanet: target, followUps: FOLLOWUPS.general };
    }
    const d = liveDistance(target);
    return { reply: `Live Earth–${NAMES[target]} center-to-center distance: ${d.au.toFixed(4)} AU (${d.km.toLocaleString('en-US', { maximumFractionDigits: 0 })} km). One-way light travel time is about ${d.lightMinutes.toFixed(2)} minutes (t = d/c).`, targetPlanet: target, followUps: ['How does light delay affect communication?', `Tell me about ${NAMES[target]} gravity`] };
  }
  if (/clock|relativ|time dilation|drift/.test(q) && target) {
    const d = liveDistance(target);
    const r = target === 'sun' ? 695700 : 149597870.7;
    const phi = (1.32712440018e11 / r - 3.986004418e5 / (d.km || r)) / (C_KM_S * C_KM_S);
    const drift = Math.abs(phi) * 86400 * 1e6;
    return { reply: `A rough gravitational clock-rate comparison for ${NAMES[target]} versus an Earth-surface reference is about ${drift.toFixed(2)} μs/day at this epoch. This estimate uses a simplified Sun-plus-Earth potential and omits rotation, altitude and relativistic coordinate conventions; spacecraft clock corrections require a full mission model.`, targetPlanet: target, followUps: FOLLOWUPS.general };
  }
  if (target) {
    const category = /atmos|weather|storm|wind|pressure|gas|greenhouse/.test(q) ? 'Atmosphere & weather' : /gravity|orbit|escape|core|tilt|year|structure/.test(q) ? 'Gravity, orbit & structure' : 'Planetary profile';
    return { reply: `${category} — ${FACTS[target]}`, targetPlanet: target, followUps: /atmos|weather|storm|wind|pressure|gas|greenhouse/.test(q) ? FOLLOWUPS.atmosphere : FOLLOWUPS.general };
  }
  return { reply: 'I can help with planetary atmospheres, weather, gravity, orbital structure, live Earth-to-planet distance and light delay, relativistic clock-rate estimates, or astrobiology. Try naming a world, such as “Live Mars distance?” or “Could life exist on Europa?”', followUps: FOLLOWUPS.general };
}
