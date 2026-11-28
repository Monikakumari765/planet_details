// EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish / GM / EnglishEnglish / EnglishEnglish / EnglishEnglish / EnglishEnglish / EnglishEnglish / EnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglish km，GM EnglishEnglish km³/s²（EnglishEnglish g = GM/r²，English km/s² → ×1000 English m/s²）。
//
// ── EnglishEnglishEnglishEnglish（radiusKm English oblateness EnglishEnglishEnglishEnglish） ────────────────────────────────
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish mesh.scale.y = 1 − oblateness，English
//     EnglishEnglishEnglishEnglish = radiusKm，EnglishEnglishEnglish = radiusKm × (1 − oblateness)
// EnglishEnglish `oblateness` EnglishEnglishEnglishEnglishEnglish f = (a−b)/a，`radiusKm` EnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglish a**。
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
// （EnglishEnglish 69911、EnglishEnglish 58232、EnglishEnglishEnglish 25362、EnglishEnglishEnglish 24622），
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 3.4%（2036 km）、EnglishEnglish 2.2%（1581 km），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（1 bar English），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：
//     EnglishEnglish 71492 × (1−0.06487) = 66854 ✓   EnglishEnglish 60268 × (1−0.09796) = 54364 ✓
//     EnglishEnglishEnglish 25559 × (1−0.02293) = 24973 ✓  EnglishEnglishEnglish 24764 × (1−0.01708) = 24341 ✓
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish 6371、EnglishEnglish 3389.5）EnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglish：
// EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish R English，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；
// English 0.3%–0.6% EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglishEnglish `oblateness` EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。

export const BODIES = {
  sun: {
    id: 'sun', nameEn: 'Sun', nameZh: 'Sun', type: 'star', parent: null,
    radiusKm: 695700, gm: 1.32712440018e11, oblateness: 0.00005,
    rotation: 'iau', landable: false,
    textures: { map: 'sun.jpg' },
    desc: 'G2V EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 99.86%。EnglishEnglishEnglishEnglishEnglish 5772K，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 3.8×10²⁶ EnglishEnglishEnglishEnglish。',
  },
  mercury: {
    id: 'mercury', nameEn: 'Mercury', nameZh: 'Mercury', type: 'rocky', parent: 'sun',
    radiusKm: 2439.7, gm: 2.2032e4, oblateness: 0,
    rotation: 'iau', landable: true,
    surface: { ampKm: 4, roughness: 0.55, craters: 1.0, palette: 'gray' },
    textures: { map: 'mercury.jpg' },
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，3:2 EnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish 600°C，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  venus: {
    id: 'venus', nameEn: 'Venus', nameZh: 'Venus', type: 'rocky', parent: 'sun',
    radiusKm: 6051.8, gm: 3.24859e5, oblateness: 0,
    rotation: 'iau', landable: true,
    surface: { ampKm: 3, roughness: 0.45, craters: 0.2, palette: 'venus' },
    atmosphere: {
      // EnglishEnglishEnglishEnglishEnglish"EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish 0.7
      groundAlbedo: 0.7,
      skyFraction: 0.65,   // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish
      rho0: 65.0,          // EnglishEnglishEnglishEnglishEnglishEnglish kg/m³（EnglishEnglishEnglish 53 English）
      // EnglishEnglishEnglishEnglish：multiplier English 6 EnglishEnglish 1.5，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish
      heightKm: 90, rayleighScaleKm: 15.9, mieScaleKm: 5,
      // Rayleigh EnglishEnglishEnglishEnglish：CO₂ + H₂SO₄ EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（Venera EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish）
      rayleigh: [8e-6, 4.5e-6, 1.0e-6],
      // EnglishEnglish Mie（EnglishEnglishEnglishEnglish）：EnglishEnglishEnglishEnglish mie EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；
      // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish 90km CO₂+EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish（Venera EnglishEnglish）。
      mie: [4.5e-6, 2.6e-6, 0.9e-6],
      mieG: 0.65,  // EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      multiplier: 1.5,
      haze: 0.90,  // EnglishEnglishEnglishEnglishEnglishEnglish
      // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglish 5~20 km
      // interiorBoost=5：L.r≈0.93 → ACES≈0.73，EnglishEnglishEnglishEnglish（boostEnglishEnglishEnglishEnglishEnglishEnglishACESEnglishEnglishEnglishEnglish）
      interiorBoost: 5,
      interiorBoostM: 0.6,  // Mie EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      fogDensityMult: 5,    // EnglishEnglishEnglishEnglishEnglishEnglish 5~20 km（Venera EnglishEnglishEnglishEnglish）
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：92 bar CO₂ + EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      // （Venera 13/14 EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      groundTint: [1.0, 0.50, 0.14], groundDim: 0.55,
    },
    textures: { map: 'venus_surface.jpg', clouds: 'venus_atmosphere.jpg', cloudsOpaque: true },
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish”EnglishEnglishEnglish”，EnglishEnglish 92 EnglishEnglishEnglishEnglishEnglishEnglish CO₂ EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish 465°C，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  earth: {
    id: 'earth', nameEn: 'Earth', nameZh: 'Earth', type: 'rocky', parent: 'sun',
    radiusKm: 6371.0, gm: 3.986004418e5, oblateness: 0.0033528,
    rotation: 'iau', landable: true,
    surface: { ampKm: 2.5, roughness: 0.5, craters: 0, palette: 'earth', ocean: true },
    atmosphere: {
      groundAlbedo: 0.12,
      ozone: 1,
      msDesat: 1.0,        // EnglishEnglishEnglishEnglishEnglish（EnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglish）→ EnglishEnglishEnglishEnglishEnglishEnglishEnglish
      skyFraction: 0.20,   // EnglishEnglishEnglishEnglish/EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      heightKm: 60, rayleighScaleKm: 8.5, mieScaleKm: 1.2,
      // multiplier 0.72：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish Blue Marble EnglishEnglishEnglishEnglishEnglishEnglishEnglish，
      // English Rayleigh EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）；EnglishEnglishEnglishEnglishEnglishEnglishEnglish interiorBoost EnglishEnglishEnglish 1.0
      // mie EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish AOD(550nm) ≈ 0.10，EnglishEnglish 1.2km
      // → β = AOD/H = 0.083 km⁻¹。EnglishEnglish 3.996e-6 m⁻¹（AOD≈0.005）EnglishEnglishEnglishEnglish 20 English，
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish Ångström EnglishEnglish ≈0.5
      // （EnglishEnglishEnglish α≈1.3 EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglish。
      rayleigh: [5.802e-6, 13.558e-6, 33.1e-6],
      mie: [7.7e-5, 8.3e-5, 9.3e-5], mieG: 0.72, multiplier: 0.66,
      interiorBoost: 1.52, // ≈1/0.66：EnglishEnglish multiplier EnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    },
    // EnglishEnglish**English**English earth_clouds.jpg。
    //
    // EnglishEnglishEnglish NASA GIBS English MODIS_Terra_Cloud_Fraction_Day（clouds_real.png）English"EnglishEnglish
    // EnglishEnglishEnglishEnglish"。EnglishEnglish**EnglishEnglish**——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish 0.72），
    // EnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish cloudAlpha，EnglishEnglishEnglish 64% EnglishEnglishEnglishEnglishEnglish
    // EnglishEnglish >50% EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglish"EnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish
    // （EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 2.0% → 25.4%，400km EnglishEnglish 18.3% → 96.2%）。
    // EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish Cloud_Optical_Thickness EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish；
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish。
    textures: { map: 'earth_day.jpg', night: 'earth_night.jpg', clouds: 'earth_clouds.jpg' },
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。71% EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglish。',
  },
  mars: {
    id: 'mars', nameEn: 'Mars', nameZh: 'Mars', type: 'rocky', parent: 'sun',
    radiusKm: 3389.5, gm: 4.282837e4, oblateness: 0.00589,
    rotation: 'iau', landable: true,
    surface: { ampKm: 8, roughness: 0.6, craters: 0.6, palette: 'mars' },
    atmosphere: {
      groundAlbedo: 0.2,
      ozone: 0.12,
      msDesat: 0.75,       // EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish ≈0.9）
      skyFraction: 0.45,   // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      rho0: 0.020,         // EnglishEnglishEnglishEnglishEnglishEnglish kg/m³（EnglishEnglishEnglish 1.6%）
      // EnglishEnglish：Rayleigh English>English（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）+ Mie EnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      // EnglishEnglish：Fe₂O₃ EnglishEnglish（~1.5 µm）EnglishEnglish mieG EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
      //       EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglish——Curiosity Sol-956、Perseverance Sol-257 EnglishEnglishEnglishEnglish。
      heightKm: 80, rayleighScaleKm: 11.1, mieScaleKm: 9,
      // Rayleigh EnglishEnglishEnglishEnglishEnglishEnglish（CO₂ EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      rayleigh: [5.0e-7, 3.0e-7, 1.2e-7],
      // betaM [R,G,B]：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish τ≈0.4
      // （EnglishEnglishEnglishEnglishEnglishEnglish 5），EnglishEnglish 9 km → β = τ/H ≈ 4.4e-5 km⁻¹。
      // EnglishEnglish τ≈0.002 EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      // EnglishEnglishEnglish**EnglishEnglish**EnglishEnglish（English>English>English）：Fe₂O₃ EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      // （EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。）
      mie: [4.4e-5, 3.6e-5, 2.8e-5],
      // mieG [R,G,B]：EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish Fe₂O₃ g≈0.55–0.75），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      mieG: [0.60, 0.65, 0.72],
      multiplier: 0.75,  // EnglishEnglishEnglishEnglish τ EnglishEnglishEnglishEnglish：EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      haze: 0.35,   // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish 0.22·HM ≈ 2km）：EnglishEnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglish
      // EnglishEnglishEnglish interiorBoost：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      // uBoost（Rayleigh）= 8 → EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 1/4）
      // uBoostM（Mie）= 1.5 → EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
      interiorBoost: 8,
      interiorBoostM: 1.5,
    },
    textures: { map: 'mars.jpg' },
    desc: 'EnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish 21.9 km）EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish 4000 km）。EnglishEnglish CO₂ EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  jupiter: {
    id: 'jupiter', nameEn: 'Jupiter', nameZh: 'Jupiter', type: 'gas', parent: 'sun',
    // EnglishEnglishEnglishEnglish（1 bar English），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglish「EnglishEnglishEnglishEnglish」EnglishEnglish
    radiusKm: 71492, gm: 1.26686534e8, oblateness: 0.06487,
    rotation: 'iau', landable: false,
    atmosphere: {
      heightKm: 350, rayleighScaleKm: 27, mieScaleKm: 27,
      rayleigh: [4e-7, 3.5e-7, 2.5e-7], mie: 3e-7, mieG: 0.7, multiplier: 0.8,
    },
    // EnglishEnglishEnglishEnglish：Halo 1.40–1.71 R_J、Main 1.72–1.81 R_J、Amalthea/Thebe Gossamer English 3.11 R_J。
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish ~10⁻⁶，EnglishEnglishEnglishEnglishEnglishEnglishEnglish，
    // EnglishEnglish（EnglishEnglishEnglishEnglish）EnglishEnglishEnglish——EnglishEnglish diffuse EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
    rings: { innerKm: 100000, outerKm: 222000, texture: null, opacity: 0.18, diffuse: 0.004,
      tint: [0.62, 0.55, 0.48],
      narrow: [
        [111000, 22000, 0.006],   // Halo（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
        [126000, 6400, 0.014],    // Main（EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
        [155000, 52000, 0.005],   // Amalthea Gossamer
        [202000, 40000, 0.003],   // Thebe Gossamer
      ] },
    textures: { map: 'jupiter.jpg' },
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 2.5 English。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  saturn: {
    id: 'saturn', nameEn: 'Saturn', nameZh: 'Saturn', type: 'gas', parent: 'sun',
    radiusKm: 60268, gm: 3.7931187e7, oblateness: 0.09796,
    rotation: 'iau', landable: false,
    atmosphere: {
      heightKm: 300, rayleighScaleKm: 40, mieScaleKm: 40,
      rayleigh: [3.5e-7, 3.0e-7, 2.0e-7], mie: 2.5e-7, mieG: 0.7, multiplier: 0.8,
    },
    // tint EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish），
    // EnglishEnglish [1.35,1.16,0.88] EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    rings: { innerKm: 74500, outerKm: 140220, texture: 'saturn_ring.png', tint: [1.18, 1.15, 1.06] },
    textures: { map: 'saturn.jpg' },
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglish 20 English，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  uranus: {
    id: 'uranus', nameEn: 'Uranus', nameZh: 'Uranus', type: 'ice', parent: 'sun',
    radiusKm: 25559, gm: 5.793939e6, oblateness: 0.02293,
    rotation: 'iau', landable: false,
    atmosphere: {
      heightKm: 250, rayleighScaleKm: 28, mieScaleKm: 28,
      rayleigh: [2.0e-7, 3.2e-7, 3.6e-7], mie: 1.5e-7, mieG: 0.65, multiplier: 0.9,
    },
    rings: { innerKm: 41837, outerKm: 51600, texture: null, opacity: 0.22, tint: [0.55, 0.62, 0.66],
      // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish km、EnglishEnglish km、EnglishEnglishEnglishEnglishEnglishEnglish）：EnglishEnglish 6/5/4/α/β/η/γ/δ/ε
      narrow: [
        [41837, 2, 0.35], [42234, 3, 0.4], [42570, 2, 0.35],  // 6, 5, 4
        [44718, 7, 0.7], [45661, 9, 0.65],                     // α, β
        [47176, 2, 0.3], [47627, 4, 0.6], [48300, 4, 0.55],    // η, γ, δ
        [51149, 45, 1.0],                                      // ε（EnglishEnglish，EnglishEnglishEnglishEnglish）
      ] },
    textures: { map: 'uranus.jpg' },
    desc: '“EnglishEnglish”EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish 98°。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（-224°C）。',
  },
  neptune: {
    id: 'neptune', nameEn: 'Neptune', nameZh: 'Neptune', type: 'ice', parent: 'sun',
    radiusKm: 24764, gm: 6.836529e6, oblateness: 0.01708,
    rotation: 'iau', landable: false,
    atmosphere: {
      heightKm: 250, rayleighScaleKm: 25, mieScaleKm: 25,
      rayleigh: [1.8e-7, 2.8e-7, 4.0e-7], mie: 1.5e-7, mieG: 0.65, multiplier: 0.9,
    },
    // EnglishEnglishEnglishEnglishEnglish：Galle(N42) / Le Verrier(N53) / Lassell(N55 EnglishEnglish) / Arago(N63) / Adams(N63)。
    // EnglishEnglishEnglishEnglish（τ ~10⁻⁴），English Adams EnglishEnglishEnglish 5 EnglishEnglishEnglishEnglishEnglish（Courage / Liberté / Égalité / Fraternité），
    // EnglishEnglish**EnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish。
    rings: { innerKm: 41900, outerKm: 62980, texture: null, opacity: 0.3, diffuse: 0.004,
      tint: [0.50, 0.52, 0.60],
      narrow: [
        [41900, 2000, 0.010],     // Galle (N42)
        [53200, 113, 0.012],      // Le Verrier (N53)
        [55400, 4400, 0.006],     // Lassell (N55) EnglishEnglish
        [57600, 100, 0.009],      // Arago (N63)
        [62930, 50, 0.016],       // Adams (N63)
      ] },
    textures: { map: 'neptune.jpg' },
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（2100 km/h）。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。',
  },
  pluto: {
    id: 'pluto', nameEn: 'Pluto', nameZh: 'Pluto', type: 'dwarf', parent: 'sun',
    radiusKm: 1188.3, gm: 8.71e2, oblateness: 0,
    rotation: 'iau', landable: true,
    surface: { ampKm: 3, roughness: 0.5, craters: 0.4, palette: 'pluto' },
    textures: { map: 'pluto.jpg' },
    desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglish 2015 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish“EnglishEnglishEnglishEnglishEnglishEnglishEnglish”。',
  },
};

// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish moonsData.generated.js EnglishEnglish Horizons EnglishEnglishEnglishEnglish）
export const MOON_PHYS = {
  moon:      { nameEn: 'Moon', nameZh: 'Moon', parent: 'earth', radiusKm: 1737.4, gm: 4.9048695e3,
               landable: true, surface: { ampKm: 5, roughness: 0.55, craters: 1.2, palette: 'gray' },
               textures: { map: 'moon.jpg' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
  phobos:    { nameEn: 'Phobos', nameZh: 'Phobos', parent: 'mars', radiusKm: 11.27, gm: 7.087e-4,
               landable: true, shape: { dims: [27.0, 18.4, 22.0] }, // EnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglish
               shapeModel: 'phobos',   // PDS Thomas EnglishEnglishEnglishEnglish（2°×2°），English tools/fetch-shapes.mjs
               // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish Phobos EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish roughness EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；
               // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（amp ≈ 0.4% R）。
               surface: { ampKm: 0.05, roughness: 0.45, craters: 0.7, palette: 'gray' },
               textures: { map: 'phobos.jpg' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish（27×22×18 km），EnglishEnglishEnglishEnglish（9376 km），EnglishEnglishEnglishEnglishEnglish 1.8 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
  deimos:    { nameEn: 'Deimos', nameZh: 'Deimos', parent: 'mars', radiusKm: 6.2, gm: 9.6e-5,
               landable: true, shape: { dims: [15.0, 11.0, 12.2] }, // EnglishEnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglish
               shapeModel: 'deimos',
               // English Phobos EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish。
               surface: { ampKm: 0.03, roughness: 0.45, craters: 0.7, palette: 'gray' },
               textures: { map: 'deimos.jpg' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
  io:        { nameEn: 'Io', nameZh: 'Io', parent: 'jupiter', radiusKm: 1821.6, gm: 5.916e3,
               landable: true, surface: { ampKm: 4, roughness: 0.5, craters: 0.1, palette: 'io' },
               textures: { map: 'io.jpg' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
  europa:    { nameEn: 'Europa', nameZh: 'Europa', parent: 'jupiter', radiusKm: 1560.8, gm: 3.203e3,
               landable: true, surface: { ampKm: 0.8, roughness: 0.35, craters: 0.05, palette: 'ice' },
               textures: { map: 'europa.png' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
  ganymede:  { nameEn: 'Ganymede', nameZh: 'Ganymede', parent: 'jupiter', radiusKm: 2634.1, gm: 9.887e3,
               landable: true, surface: { ampKm: 2, roughness: 0.45, craters: 0.7, palette: 'gray' },
               textures: { map: 'ganymede.jpg' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
  callisto:  { nameEn: 'Callisto', nameZh: 'Callisto', parent: 'jupiter', radiusKm: 2410.3, gm: 7.179e3,
               landable: true, surface: { ampKm: 2.5, roughness: 0.5, craters: 1.3, palette: 'callisto' },
               textures: { map: 'callisto.jpg' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish 40 EnglishEnglishEnglishEnglish。' },
  mimas:     { nameEn: 'Mimas', nameZh: 'Mimas', parent: 'saturn', radiusKm: 198.2, gm: 2.504,
               landable: true,
               // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish Mimas EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish crater rim EnglishEnglishEnglishEnglishEnglish；
               // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（amp ≈ 0.4% R）。
               surface: { ampKm: 0.8, roughness: 0.5, craters: 0.8, palette: 'iceBright' },
               textures: { map: 'mimas.jpg' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish“EnglishEnglish”。' },
  enceladus: { nameEn: 'Enceladus', nameZh: 'Enceladus', parent: 'saturn', radiusKm: 252.1, gm: 7.211,
               landable: true, surface: { ampKm: 1, roughness: 0.35, craters: 0.3, palette: 'iceBright' },
               textures: { map: 'enceladus.jpg' },
               desc: 'EnglishEnglish“EnglishEnglish”EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish E English，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglish 1，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
  tethys:    { nameEn: 'Tethys', nameZh: 'Tethys', parent: 'saturn', radiusKm: 531.1, gm: 41.21,
               landable: true, surface: { ampKm: 2, roughness: 0.5, craters: 1.0, palette: 'iceMid' },
               textures: { map: 'tethys.jpg' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish 0.98 g/cm³。' },
  dione:     { nameEn: 'Dione', nameZh: 'Dione', parent: 'saturn', radiusKm: 561.4, gm: 73.116,
               landable: true, surface: { ampKm: 2, roughness: 0.5, craters: 0.9, palette: 'iceBright' },
               textures: { map: 'dione.jpg' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
  rhea:      { nameEn: 'Rhea', nameZh: 'Rhea', parent: 'saturn', radiusKm: 763.8, gm: 153.94,
               landable: true, surface: { ampKm: 2, roughness: 0.5, craters: 1.1, palette: 'iceBright' },
               textures: { map: 'rhea.jpg' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
  titan:     { nameEn: 'Titan', nameZh: 'Titan', parent: 'saturn', radiusKm: 2574.7, gm: 8.978e3,
               landable: true, surface: { ampKm: 1.5, roughness: 0.4, craters: 0.1, palette: 'titan' },
               textures: { map: 'titan.jpg' },
               atmosphere: { groundAlbedo: 0.10, skyFraction: 0.55, heightKm: 200, rayleighScaleKm: 20, mieScaleKm: 50,
                             // multiplier 1.6：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish 3.0 EnglishEnglishEnglishEnglish
                             // EnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）；EnglishEnglishEnglishEnglishEnglishEnglishEnglish interiorBoost EnglishEnglish
                             // EnglishEnglish mie：tholin EnglishEnglishEnglishEnglishEnglishEnglishEnglish（English>English>EnglishEnglishEnglish），
                             // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglish mie EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
                             // EnglishEnglishEnglishEnglishEnglish Cassini/Huygens EnglishEnglishEnglishEnglish：tholin EnglishEnglishEnglishEnglishEnglishEnglish
                             // EnglishEnglishEnglishEnglishEnglishEnglish τ ≈ 3–5（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish
                             // EnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglish 50 km。EnglishEnglish τ≈0.05 EnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglish
                             // EnglishEnglishEnglishEnglishEnglish**EnglishEnglish**（EnglishEnglishEnglishEnglishEnglishEnglishEnglish），English Huygens EnglishEnglishEnglish
                             // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
                             // β = τ/H = 3.7/50 km ≈ 7.4e-5 km⁻¹（EnglishEnglishEnglishEnglish：tholin EnglishEnglish）。
                             rayleigh: [8e-7, 5e-7, 2e-7], mie: [7.4e-5, 5.6e-5, 3.4e-5], mieG: 0.7, multiplier: 1.0,
                             interiorBoost: 1.9,
                             // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：tholin EnglishEnglishEnglish 0.1% EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
                             // （Huygens EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
                             groundTint: [1.0, 0.60, 0.28], groundDim: 0.9,
                             // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（Huygens EnglishEnglishEnglishEnglish 20 km EnglishEnglish
                             // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglish 0.22 English
                             msDesat: 0.0, // tholin EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglish**，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
                             haze: 0.30 }, // EnglishEnglishEnglishEnglish（tholin），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（1.5 EnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
  iapetus:   { nameEn: 'Iapetus', nameZh: 'Iapetus', parent: 'saturn', radiusKm: 734.5, gm: 120.51,
               landable: true, surface: { ampKm: 4, roughness: 0.55, craters: 1.0, palette: 'iapetus' },
               textures: { map: 'iapetus.jpg' },
               desc: 'EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
  miranda:   { nameEn: 'Miranda', nameZh: 'Miranda', parent: 'uranus', radiusKm: 235.8, gm: 4.4,
               landable: true,
               // Miranda EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish roughness EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；
               // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（amp ≈ 0.4% R）。
               surface: { ampKm: 0.9, roughness: 0.5, craters: 0.6, palette: 'iceMid' },
               textures: { map: 'miranda.jpg' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（20 km）。' },
  ariel:     { nameEn: 'Ariel', nameZh: 'Ariel', parent: 'uranus', radiusKm: 578.9, gm: 86.4,
               landable: true, surface: { ampKm: 2, roughness: 0.5, craters: 0.7, palette: 'iceDim' },
               textures: { map: 'ariel.jpg' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
  umbriel:   { nameEn: 'Umbriel', nameZh: 'Umbriel', parent: 'uranus', radiusKm: 584.7, gm: 81.5,
               landable: true, surface: { ampKm: 2, roughness: 0.5, craters: 1.0, palette: 'dark' },
               textures: { map: 'umbriel.jpg' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish。' },
  titania:   { nameEn: 'Titania', nameZh: 'Titania', parent: 'uranus', radiusKm: 788.4, gm: 228.2,
               landable: true, surface: { ampKm: 2, roughness: 0.5, craters: 0.8, palette: 'gray' },
               textures: { map: 'titania.jpg' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
  oberon:    { nameEn: 'Oberon', nameZh: 'Oberon', parent: 'uranus', radiusKm: 761.4, gm: 192.4,
               landable: true, surface: { ampKm: 2.5, roughness: 0.5, craters: 1.0, palette: 'gray' },
               textures: { map: 'oberon.jpg' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
  triton:    { nameEn: 'Triton', nameZh: 'Triton', parent: 'neptune', radiusKm: 1353.4, gm: 1.428e3,
               landable: true, surface: { ampKm: 1.5, roughness: 0.4, craters: 0.2, palette: 'triton' },
               textures: { map: 'triton.jpg' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglish -235°C，EnglishEnglishEnglishEnglishEnglishEnglishEnglish 8 km EnglishEnglish。' },
  charon:    { nameEn: 'Charon', nameZh: 'Charon', parent: 'pluto', radiusKm: 606.0, gm: 105.88,
               landable: true, surface: { ampKm: 3, roughness: 0.5, craters: 0.7, palette: 'gray' },
               textures: { map: 'charon.jpg' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish“EnglishEnglishEnglish”。' },

  // ── EnglishEnglishEnglishEnglish ────────────────────────────────────────────────────────────
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish、gm EnglishEnglishEnglishEnglishEnglish（GM[km³/s²] = 6.674e-20 × M[kg]）。
  // EnglishEnglishEnglishEnglishEnglish，surface EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  amalthea:  { nameEn: 'Amalthea', nameZh: 'Amalthea', parent: 'jupiter', radiusKm: 83.5, gm: 0.1388,
               landable: true, surface: { ampKm: 1.5, roughness: 0.6, craters: 0.6, palette: 'jupInner' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglish（270×168×150 km）。' },
  thebe:     { nameEn: 'Thebe', nameZh: 'Thebe', parent: 'jupiter', radiusKm: 49.3, gm: 0.0287,
               landable: true, surface: { ampKm: 1.2, roughness: 0.6, craters: 0.7, palette: 'jupInner' } },
  metis:     { nameEn: 'Metis', nameZh: 'Metis', parent: 'jupiter', radiusKm: 21.5, gm: 0.0024,
               landable: true, surface: { ampKm: 0.8, roughness: 0.6, craters: 0.8, palette: 'jupInner' } },
  adrastea:  { nameEn: 'Adrastea', nameZh: 'Adrastea', parent: 'jupiter', radiusKm: 8.2, gm: 0.000496,
               landable: true, surface: { ampKm: 0.5, roughness: 0.6, craters: 0.8, palette: 'jupInner' } },

  hyperion:  { nameEn: 'Hyperion', nameZh: 'Hyperion', parent: 'saturn', radiusKm: 135.0, gm: 0.375,
               landable: true, shapeModel: 'hyperion',
               surface: { ampKm: 6, roughness: 0.8, craters: 1.1, palette: 'hyperion' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（410×260×220 km），EnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish 0.3。' },
  phoebe:    { nameEn: 'Phoebe', nameZh: 'Phoebe', parent: 'saturn', radiusKm: 106.5, gm: 0.553,
               landable: true, surface: { ampKm: 4, roughness: 0.7, craters: 1.0, palette: 'phoebe' },
               desc: 'EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
  janus:     { nameEn: 'Janus', nameZh: 'Janus', parent: 'saturn', radiusKm: 89.5, gm: 0.127,
               landable: true, shapeModel: 'janus',
               surface: { ampKm: 2.5, roughness: 0.6, craters: 0.9, palette: 'satIce' } },
  epimetheus:{ nameEn: 'Epimetheus', nameZh: 'Epimetheus', parent: 'saturn', radiusKm: 58.1, gm: 0.0352,
               landable: true, shapeModel: 'epimetheus',
               surface: { ampKm: 2, roughness: 0.6, craters: 0.9, palette: 'satIce' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglish"EnglishEnglishEnglish。' },
  prometheus: { nameEn: 'Prometheus', nameZh: 'Prometheus', parent: 'saturn', radiusKm: 43.1, gm: 0.01065,
               landable: true, surface: { ampKm: 1.8, roughness: 0.7, craters: 0.8, palette: 'satIce' } },
  pandora:   { nameEn: 'Pandora', nameZh: 'Pandora', parent: 'saturn', radiusKm: 40.7, gm: 0.00915,
               landable: true, surface: { ampKm: 1.8, roughness: 0.7, craters: 0.8, palette: 'satIce' } },
  pan:       { nameEn: 'Pan', nameZh: 'Pan', parent: 'saturn', radiusKm: 14.1, gm: 0.00033,
               landable: true, surface: { ampKm: 0.8, roughness: 0.6, craters: 0.5, palette: 'satIce' },
               desc: 'EnglishEnglishEnglishEnglish A EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——"EnglishEnglishEnglishEnglishEnglish"。EnglishEnglishEnglishEnglishEnglish。' },

  puck:      { nameEn: 'Puck', nameZh: 'Puck', parent: 'uranus', radiusKm: 81.0, gm: 0.1934,
               landable: true, surface: { ampKm: 2.5, roughness: 0.6, craters: 0.9, palette: 'puck' } },
  portia:    { nameEn: 'Portia', nameZh: 'Portia', parent: 'uranus', radiusKm: 67.6, gm: 0.1121,
               landable: true, surface: { ampKm: 2, roughness: 0.6, craters: 0.8, palette: 'uranDark' } },
  juliet:    { nameEn: 'Juliet', nameZh: 'Juliet', parent: 'uranus', radiusKm: 53.0, gm: 0.0374,
               landable: true, surface: { ampKm: 1.8, roughness: 0.6, craters: 0.8, palette: 'uranDark' } },
  ophelia:   { nameEn: 'Ophelia', nameZh: 'Ophelia', parent: 'uranus', radiusKm: 21.4, gm: 0.01201,
               landable: true, surface: { ampKm: 1, roughness: 0.6, craters: 0.7, palette: 'uranDark' } },
  cordelia:  { nameEn: 'Cordelia', nameZh: 'Cordelia', parent: 'uranus', radiusKm: 20.1, gm: 0.0083,
               landable: true, surface: { ampKm: 1, roughness: 0.6, craters: 0.7, palette: 'uranDark' } },
  bianca:    { nameEn: 'Bianca', nameZh: 'Bianca', parent: 'uranus', radiusKm: 27.0, gm: 0.00614,
               landable: true, surface: { ampKm: 1.2, roughness: 0.6, craters: 0.7, palette: 'uranDark' } },
  cressida:  { nameEn: 'Cressida', nameZh: 'Cressida', parent: 'uranus', radiusKm: 41.0, gm: 0.0227,
               landable: true, surface: { ampKm: 1.5, roughness: 0.6, craters: 0.8, palette: 'uranDark' } },
  desdemona: { nameEn: 'Desdemona', nameZh: 'Desdemona', parent: 'uranus', radiusKm: 32.0, gm: 0.01201,
               landable: true, surface: { ampKm: 1.4, roughness: 0.6, craters: 0.7, palette: 'uranDark' } },
  rosalind:  { nameEn: 'Rosalind', nameZh: 'Rosalind', parent: 'uranus', radiusKm: 36.0, gm: 0.01669,
               landable: true, surface: { ampKm: 1.4, roughness: 0.6, craters: 0.7, palette: 'uranDark' } },
  belinda:   { nameEn: 'Belinda', nameZh: 'Belinda', parent: 'uranus', radiusKm: 45.0, gm: 0.0240,
               landable: true, surface: { ampKm: 1.6, roughness: 0.6, craters: 0.8, palette: 'uranDark' } },

  nereid:    { nameEn: 'Nereid', nameZh: 'Nereid', parent: 'neptune', radiusKm: 170.0, gm: 2.069,
               landable: true, surface: { ampKm: 4, roughness: 0.7, craters: 0.8, palette: 'nereid' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（e ≈ 0.75），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 7 English——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。' },
  proteus:   { nameEn: 'Proteus', nameZh: 'Proteus', parent: 'neptune', radiusKm: 210.0, gm: 2.937,
               landable: true, surface: { ampKm: 5, roughness: 0.7, craters: 1.0, palette: 'proteus' },
               desc: 'EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish 0.096）。' },
  larissa:   { nameEn: 'Larissa', nameZh: 'Larissa', parent: 'neptune', radiusKm: 97.0, gm: 0.2803,
               landable: true, surface: { ampKm: 3, roughness: 0.7, craters: 0.9, palette: 'nepInner' } },
  galatea:   { nameEn: 'Galatea', nameZh: 'Galatea', parent: 'neptune', radiusKm: 88.0, gm: 0.1415,
               landable: true, surface: { ampKm: 3, roughness: 0.7, craters: 0.9, palette: 'nepInner' } },
  despina:   { nameEn: 'Despina', nameZh: 'Despina', parent: 'neptune', radiusKm: 75.0, gm: 0.1402,
               landable: true, surface: { ampKm: 2.5, roughness: 0.7, craters: 0.8, palette: 'nepInner' } },
  thalassa:  { nameEn: 'Thalassa', nameZh: 'Thalassa', parent: 'neptune', radiusKm: 41.0, gm: 0.0232,
               landable: true, surface: { ampKm: 1.5, roughness: 0.6, craters: 0.7, palette: 'nepInner' } },
  naiad:     { nameEn: 'Naiad', nameZh: 'Naiad', parent: 'neptune', radiusKm: 33.0, gm: 0.0130,
               landable: true, surface: { ampKm: 1.2, roughness: 0.6, craters: 0.7, palette: 'nepInner' } },

  nix:       { nameEn: 'Nix', nameZh: 'Nix', parent: 'pluto', radiusKm: 19.5, gm: 0.0030,
               landable: true, surface: { ampKm: 1, roughness: 0.6, craters: 0.7, palette: 'gray' },
               desc: 'EnglishEnglishEnglishEnglish 2015 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）。' },
  hydra:     { nameEn: 'Hydra', nameZh: 'Hydra', parent: 'pluto', radiusKm: 20.5, gm: 0.0032,
               landable: true, surface: { ampKm: 1, roughness: 0.6, craters: 0.7, palette: 'gray' } },
  kerberos:  { nameEn: 'Kerberos', nameZh: 'Kerberos', parent: 'pluto', radiusKm: 9.5, gm: 0.0011,
               landable: true, surface: { ampKm: 0.6, roughness: 0.6, craters: 0.7, palette: 'gray' } },
  styx:      { nameEn: 'Styx', nameZh: 'Styx', parent: 'pluto', radiusKm: 8.0, gm: 0.00067,
               landable: true, surface: { ampKm: 0.5, roughness: 0.6, craters: 0.7, palette: 'gray' } },
};

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglish m/s² */
/**
 * EnglishEnglishEnglishEnglishEnglish Hapke EnglishEnglishEnglishEnglishEnglishEnglishEnglish（Hapke 1981 / 1986 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
 *
 *   w      EnglishEnglishEnglishEnglishEnglishEnglishEnglish（0–1）
 *   B0, h  EnglishEnglishEnglishEnglish（opposition surge）EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish）
 *   g      Henyey-Greenstein EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish = EnglishEnglishEnglishEnglish
 *
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 0° EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
 * English 40% EnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，English Lambert EnglishEnglishEnglishEnglishEnglish。
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 */
export const HAPKE_PARAMS = {
  // EnglishEnglishEnglishEnglishEnglishEnglish：English、EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglish
  moon:       { w: 0.23, B0: 1.6, h: 0.06, g: -0.35 },
  mercury:    { w: 0.14, B0: 1.5, h: 0.06, g: -0.35 },
  phobos:     { w: 0.07, B0: 1.3, h: 0.06, g: -0.30 },
  deimos:     { w: 0.08, B0: 1.3, h: 0.06, g: -0.30 },
  // English/EnglishEnglishEnglishEnglishEnglish
  io:         { w: 0.55, B0: 1.1, h: 0.07, g: -0.30 },
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish
  europa:     { w: 0.8, B0: 0.8, h: 0.05, g: -0.25 },
  ganymede:   { w: 0.45, B0: 0.8, h: 0.05, g: -0.25 },
  callisto:   { w: 0.22, B0: 1.0, h: 0.06, g: -0.28 },
  // EnglishEnglishEnglishEnglishEnglish：EnglishEnglish，EnglishEnglishEnglishEnglishEnglish。
  // **w EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**——EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish 0.962 EnglishEnglish 0.70、
  // EnglishEnglishEnglishEnglishEnglish 0.998 EnglishEnglish 0.65），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
  // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
  mimas:      { w: 0.99, B0: 0.7, h: 0.05, g: -0.22 },
  enceladus:  { w: 0.98, B0: 0.5, h: 0.04, g: -0.20 },
  tethys:     { w: 0.95, B0: 0.6, h: 0.05, g: -0.22 },
  dione:      { w: 0.99, B0: 0.7, h: 0.05, g: -0.24 },
  rhea:       { w: 0.98, B0: 0.7, h: 0.05, g: -0.24 },
  // EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  iapetus:    { w: 0.45, B0: 0.9, h: 0.05, g: -0.28 },
  // EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  miranda:    { w: 0.40, B0: 0.9, h: 0.05, g: -0.26 },
  ariel:      { w: 0.42, B0: 0.9, h: 0.05, g: -0.26 },
  umbriel:    { w: 0.22, B0: 1.0, h: 0.06, g: -0.28 },
  titania:    { w: 0.30, B0: 0.9, h: 0.05, g: -0.27 },
  oberon:     { w: 0.25, B0: 1.0, h: 0.06, g: -0.28 },
  // EnglishEnglishEnglishEnglishEnglishEnglish：English/EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish
  triton:     { w: 0.9, B0: 0.8, h: 0.05, g: -0.25 },
  pluto:      { w: 0.45, B0: 0.9, h: 0.05, g: -0.27 },
  charon:     { w: 0.35, B0: 0.9, h: 0.05, g: -0.27 },
};

export function surfaceGravity(body) {
  return (body.gm / (body.radiusKm * body.radiusKm)) * 1000;
}

/** EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish，EnglishEnglishEnglish） */
export function rotationPeriodHours(bodyId) {
  const p = { sun: 609.12, mercury: 1407.5, venus: -5832.5, earth: 23.934, mars: 24.623,
              jupiter: 9.925, saturn: 10.656, uranus: -17.24, neptune: 16.11, pluto: -153.29 };
  return p[bodyId] ?? null;
}
