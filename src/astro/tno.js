// EnglishEnglishEnglishEnglishEnglishEnglish（TNOs）EnglishEnglish：EnglishEnglish JPL EnglishEnglishEnglishEnglish（EnglishEnglish J2000.0）。
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglish（ETNO）English 28 EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglish planets.js EnglishEnglish：el=[a(AU),e,i(°),L(°),ϖ(°),Ω(°)]，rate=[…]/EnglishEnglishEnglishEnglish
// EnglishEnglish：JPL Small Body Database + MPC (Brown et al. 2004, Trujillo & Sheppard 2014 English)

import { elementsToEcliptic } from './kepler.js';
import { centuriesTT } from './time.js';
import { TNO_ORBITS, TNO_EPOCH_JD } from './tnoOrbits.generated.js';
import { sampledPosition } from './sampledEphemeris.js';

// el: [a, e, i, L, ϖ, Ω]  (all degrees; L = M + ϖ at J2000.0)
// rate: [da, de, di, dL, dϖ, dΩ] per Julian century (only dL significant for TNOs)
const TABLE = {
  // ── EnglishEnglishEnglishEnglishEnglishEnglishEnglish ──────────────────────────────────────────────────
  // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish IAU EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 2.2px EnglishEnglishEnglishEnglish）。
  // EnglishEnglishEnglish TNO English，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish + EnglishEnglish + EnglishEnglish）EnglishEnglishEnglishEnglish。
  // EnglishEnglishEnglish J2000 EnglishEnglishEnglish：a=2.7675AU、e=0.07582、i=10.593°、
  // Ω=80.305°、ϖ=73.597°→ω=353.292°、L=95.989°；
  // EnglishEnglishEnglishEnglish n=0.2141°/day ≈ 7820°/EnglishEnglish（EnglishEnglish rate EnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
  ceres: {
    // EnglishEnglishEnglish 5 EnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglish ϖ**（EnglishEnglishEnglishEnglishEnglishEnglish ω）——elementsToEcliptic
    // EnglishEnglishEnglish omega = periDeg − nodeDeg。
    el: [2.7675, 0.07582, 10.593, 95.989, 73.597, 80.305],
    rate: [0, 0, 0, 7820.0, 0, 0],
    nameEn: 'Ceres', radiusKm: 469.7,
    palette: 'gray', dwarfPlanet: true,
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglish 940km，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  eris: {
    el: [67.864, 0.44068, 44.045, 29.59, 187.59, 35.95],
    rate: [0, 0, 0, 64.4, 0, 0],
    nameEn: 'Eris', radiusKm: 1163,
    palette: 'ice',
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish 2326 km，EnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish 559 English，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  sedna: {
    el: [506.8, 0.84320, 11.930, 92.91, 95.31, 144.26],
    rate: [0, 0, 0, 3.16, 0, 0],
    nameEn: 'Sedna', radiusKm: 497,
    palette: 'mars',
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish）。EnglishEnglishEnglishEnglishEnglish 11400 English，EnglishEnglishEnglish 76 AU EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（ETNO）。EnglishEnglish 2076 EnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  makemake: {
    el: [45.436, 0.16200, 29.007, 150.12, 15.62, 79.62],
    rate: [0, 0, 0, 117.4, 0, 0],
    nameEn: 'Makemake', radiusKm: 717,
    palette: 'dark',
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish 77%。EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish MK2。',
  },
  haumea: {
    el: [43.218, 0.18890, 28.213, 144.10, 2.10, 121.90],
    rate: [0, 0, 0, 126.8, 0, 0],
    // EnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglish**（EnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglish/EnglishEnglish/EnglishEnglishEnglishEnglishEnglish。
    // EnglishEnglishEnglish axes EnglishEnglish：EnglishEnglishEnglishEnglish 3.9 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    // English：Ortiz et al. 2017 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish 2287km、EnglishEnglish 70km）。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    rings: { innerKm: 2252, outerKm: 2322, opacity: 0.9, tint: [0.85, 0.88, 0.95],
      narrow: [[2287, 70, 0.6]] },   // [EnglishEnglish km, EnglishEnglish km, EnglishEnglishEnglishEnglish]
    // EnglishEnglishEnglishEnglish Ortiz et al. 2017（EnglishEnglishEnglishEnglish）English Jacobi EnglishEnglishEnglish。
    nameEn: 'Haumea', radiusKm: 798,
    axes: [1161, 852, 513],   // EnglishEnglish km（English/English/English）
    palette: 'ice',
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish 3.9 EnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English 2320×1700×1030 km）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  quaoar: {
    el: [43.694, 0.03560, 7.987, 184.04, 336.44, 188.94],
    rate: [0, 0, 0, 124.6, 0, 0],
    nameEn: 'Quaoar', radiusKm: 555,
    palette: 'pluto',
    // English：Morgado et al. 2023，EnglishEnglishEnglish 4057km（English 7.4 EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
    // EnglishEnglish（~5km），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish。
    rings: { innerKm: 4040, outerKm: 4074, opacity: 0.9, tint: [0.9, 0.92, 1.0],
      narrow: [[4057, 5, 0.85]] },   // EnglishEnglish（~5km），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglish。2023 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  gonggong: {
    el: [67.38, 0.50060, 30.695, 289.15, 184.15, 336.85],
    rate: [0, 0, 0, 65.1, 0, 0],
    nameEn: 'Gonggong', radiusKm: 621,
    palette: 'mars',
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish 33 AU，EnglishEnglishEnglish 101 AU，EnglishEnglishEnglishEnglishEnglishEnglish（30°）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  orcus: {
    el: [39.419, 0.22710, 20.573, 165.63, 341.63, 268.63],
    rate: [0, 0, 0, 145.4, 0, 0],
    nameEn: 'Orcus', radiusKm: 458,
    palette: 'ice',
    desc: 'EnglishEnglishEnglishEnglishEnglish（plutino），EnglishEnglishEnglishEnglishEnglishEnglish 3:2 EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（Vanth），EnglishEnglishEnglish 280 km，EnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  // ── EnglishEnglishEnglishEnglishEnglishEnglish（KBOs） ─────────────────────────────────────────────
  varuna: {
    el: [43.131, 0.05100, 17.200, 139.34, 357.34, 97.24],
    rate: [0, 0, 0, 127.1, 0, 0],
    nameEn: 'Varuna', radiusKm: 339,
    palette: 'dark',
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish 6.3 EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  ixion: {
    el: [39.658, 0.24240, 19.580, 289.05, 11.05, 71.05],
    rate: [0, 0, 0, 144.2, 0, 0],
    nameEn: 'Ixion', radiusKm: 325,
    palette: 'dark',
    desc: 'EnglishEnglishEnglishEnglishEnglish，3:2 EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  huya: {
    el: [39.756, 0.28120, 15.467, 28.96, 236.96, 169.06],
    rate: [0, 0, 0, 143.6, 0, 0],
    nameEn: 'Huya', radiusKm: 214,
    palette: 'gray',
    desc: 'EnglishEnglishEnglishEnglishEnglish，3:2 EnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  salacia: {
    el: [42.189, 0.10500, 23.940, 331.06, 232.06, 280.76],
    rate: [0, 0, 0, 131.4, 0, 0],
    nameEn: 'Salacia', radiusKm: 427,
    palette: 'ice',
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish（~12%），EnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  ms4: {
    el: [41.932, 0.13800, 17.670, 273.00, 69.00, 216.00],
    rate: [0, 0, 0, 132.5, 0, 0],
    nameEn: '2002 MS4', radiusKm: 400,
    palette: 'gray',
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish 800 km，EnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  chaos: {
    el: [46.059, 0.09600, 12.040, 325.37, 115.37, 58.87],
    rate: [0, 0, 0, 115.0, 0, 0],
    nameEn: 'Chaos', radiusKm: 300,
    palette: 'gray',
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  varda: {
    el: [46.444, 0.13950, 21.485, 92.29, 254.29, 184.19],
    rate: [0, 0, 0, 113.7, 0, 0],
    nameEn: 'Varda', radiusKm: 370,
    palette: 'gray',
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  typhon: {
    el: [37.637, 0.53630, 2.430, 158.34, 348.34, 319.64],
    rate: [0, 0, 0, 156.0, 0, 0],
    nameEn: 'Typhon', radiusKm: 97,
    palette: 'mars',
    desc: 'EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish 17 AU（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  tx300: {
    el: [43.158, 0.12310, 25.882, 24.43, 175.43, 86.43],
    rate: [0, 0, 0, 127.0, 0, 0],
    nameEn: '2002 TX300', radiusKm: 143,
    palette: 'ice',
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish（88%），EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  ux25: {
    el: [42.583, 0.14230, 19.466, 34.48, 209.48, 30.78],
    rate: [0, 0, 0, 129.6, 0, 0],
    nameEn: '2002 UX25', radiusKm: 340,
    palette: 'gray',
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglish 0.82 g/cm³，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  uk126: {
    el: [73.67, 0.48980, 23.369, 108.16, 118.16, 131.36],
    rate: [0, 0, 0, 56.9, 0, 0],
    nameEn: '2007 UK126', radiusKm: 315,
    palette: 'pluto',
    desc: 'EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish 37 AU，EnglishEnglishEnglishEnglish 109 AU。EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglish。',
  },
  // ── EnglishEnglishEnglishEnglishEnglishEnglishEnglish（SDOs English ETNOs） ──────────────────────────────────
  fy27: {
    el: [59.05, 0.48820, 33.000, 225.5, 35.5, 183.50],
    rate: [0, 0, 0, 79.2, 0, 0],
    nameEn: '2013 FY27', radiusKm: 370,
    palette: 'gray',
    desc: 'EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish 30 AU，EnglishEnglishEnglishEnglish 33°。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish 740 km，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  ceto: {
    el: [102.1, 0.82890, 22.311, 3.01, 358.01, 180.21],
    rate: [0, 0, 0, 34.9, 0, 0],
    nameEn: 'Ceto', radiusKm: 87,
    palette: 'gray',
    desc: 'EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish 17 AU，EnglishEnglishEnglishEnglish 187 AU，EnglishEnglishEnglishEnglishEnglish 1032 English。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  az84: {
    el: [39.4, 0.18100, 13.600, 89.4, 266.4, 252.20],
    rate: [0, 0, 0, 145.5, 0, 0],
    nameEn: '2003 AZ84', radiusKm: 362,
    palette: 'gray',
    // EnglishEnglishEnglish 1:0.7:0.6。**axes EnglishEnglishEnglish**（English haumea EnglishEnglishEnglish，EnglishEnglishEnglishEnglish）。
    // EnglishEnglish 362km EnglishEnglishEnglishEnglishEnglish：English b=0.7a、c=0.6a，(a·b·c)^(1/3)=362 → a≈484。
    axes: [484, 339, 291],
    desc: 'EnglishEnglishEnglishEnglishEnglish，3:2 EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish 1:0.7:0.6）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  gv9: {
    el: [42.1, 0.07800, 22.000, 190.5, 34.5, 133.50],
    rate: [0, 0, 0, 131.8, 0, 0],
    nameEn: '2004 GV9', radiusKm: 265,
    palette: 'gray',
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 530 km。EnglishEnglishEnglishEnglish 22° EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  rhadamanthus: {
    el: [38.6, 0.21000, 13.000, 252.0, 39.0, 175.00],
    rate: [0, 0, 0, 150.1, 0, 0],
    nameEn: 'Rhadamanthus', radiusKm: 68,
    palette: 'gray',
    desc: 'EnglishEnglishEnglishEnglishEnglish，3:2 EnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。',
  },
  qu182: {
    el: [51.0, 0.12000, 14.000, 195.0, 359.0, 310.00],
    rate: [0, 0, 0, 98.8, 0, 0],
    nameEn: '2005 QU182', radiusKm: 208,
    palette: 'gray',
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish 364 EnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 416 km，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  // ── EnglishEnglishEnglishEnglishEnglish（ETNO） ────────────────────────────────────────────────
  goblin: {
    el: [1083.0, 0.93960, 11.670, 236.7, 237.2, 118.90],
    rate: [0, 0, 0, 1.01, 0, 0],
    nameEn: 'The Goblin', radiusKm: 150,
    palette: 'ice',
    desc: 'EnglishEnglishEnglishEnglishEnglish（ETNO），EnglishEnglishEnglishEnglish 65 AU，EnglishEnglishEnglishEnglishEnglish 2100 AU，EnglishEnglishEnglishEnglishEnglish 35600 English。2015 EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（Planet Nine）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  vp113: {
    el: [263.0, 0.69340, 24.070, 23.1, 24.3, 90.80],
    rate: [0, 0, 0, 8.44, 0, 0],
    nameEn: '2012 VP113', radiusKm: 150,
    palette: 'ice',
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish 80 AU——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish Sedna EnglishEnglishEnglishEnglishEnglish）。EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglish"EnglishEnglish"（Biden）EnglishEnglish V English P English VP。',
  },
  farout: {
    el: [317.0, 0.79300, 9.960, 56.5, 68.3, 125.70],
    rate: [0, 0, 0, 6.38, 0, 0],
    nameEn: 'Farout', radiusKm: 310,
    palette: 'ice',
    desc: '2018 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English 124 AU），EnglishEnglish"Farout"。EnglishEnglishEnglishEnglishEnglish 620 km，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish 5645 English。',
  },
  farfarout: {
    el: [312.0, 0.84200, 26.700, 353.6, 6.4, 84.90],
    rate: [0, 0, 0, 6.53, 0, 0],
    nameEn: 'FarFarOut', radiusKm: 175,
    palette: 'ice',
    desc: '2021 EnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English 132 AU）。EnglishEnglish"FarFarOut"。EnglishEnglishEnglishEnglish 50 AU，EnglishEnglishEnglishEnglish 575 AU，EnglishEnglishEnglishEnglishEnglish 5515 English。',
  },
};

export const TNO_IDS = Object.keys(TABLE);
export const TNO_DATA = TABLE;

/** EnglishEnglish TNO EnglishEnglishEnglishEnglish J2000 EnglishEnglish（km）。
 * EnglishEnglishEnglish tnoOrbits.generated.js（JPL SBDB EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglish）；
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglish J2000 EnglishEnglishEnglish。 */
export function tnoPosition(id, jdTT) {
  const sampled = sampledPosition(id, jdTT);
  if (sampled) return sampled;
  const o = TNO_ORBITS[id];
  if (o) {
    const dt = jdTT - (o.epochJd ?? TNO_EPOCH_JD);
    const periDeg = o.periDeg + o.periDotDegPerDay * dt;
    const nodeDeg = o.nodeDeg + o.nodeDotDegPerDay * dt;
    const M = o.M0Deg + o.nDegPerDay * dt;
    return elementsToEcliptic({
      aAU: o.aAU, e: o.e, iDeg: o.iDeg,
      LDeg: periDeg + M, periDeg, nodeDeg,
    });
  }
  const T = centuriesTT(jdTT);
  const { el, rate } = TABLE[id];
  return elementsToEcliptic({
    aAU: el[0] + rate[0] * T,
    e:    el[1] + rate[1] * T,
    iDeg: el[2] + rate[2] * T,
    LDeg: el[3] + rate[3] * T,
    periDeg: el[4] + rate[4] * T,
    nodeDeg: el[5] + rate[5] * T,
  });
}

/** EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish km，EnglishEnglishEnglishEnglishEnglishEnglishEnglish） */
export function tnoOrbitPoints(id, n = 192) {
  const o = TNO_ORBITS[id];
  const el = o ? [o.aAU, o.e, o.iDeg, 0, o.periDeg, o.nodeDeg] : TABLE[id].el;
  const pts = new Float64Array(n * 3);
  for (let i = 0; i < n; i++) {
    const p = elementsToEcliptic({
      aAU: el[0], e: el[1], iDeg: el[2],
      LDeg: el[4] + (i / (n - 1)) * 360, // sweep M from 0→360
      periDeg: el[4], nodeDeg: el[5],
    });
    pts[i * 3] = p.x; pts[i * 3 + 1] = p.y; pts[i * 3 + 2] = p.z;
  }
  return pts;
}
