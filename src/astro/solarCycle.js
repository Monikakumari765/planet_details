// EnglishEnglishEnglishEnglishEnglishEnglish：English**EnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish J2000 EnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglishEnglish 0.5 + 0.3·sin((jd − J2000)/(365.25×11)·2π)。EnglishEnglishEnglishEnglishEnglishEnglish，
// English**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 3–4 English**：EnglishEnglishEnglishEnglishEnglishEnglish 2005.5 / 2016.5 / 2027.5，
// EnglishEnglishEnglishEnglish 23 EnglishEnglishEnglishEnglish 2000.3、English 24 EnglishEnglish 2014.3、English 25 EnglishEnglish 2024.9——
// EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"。
//
// EnglishEnglish：SILSO / NOAA English 13 EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglish、EnglishEnglishEnglish）。

/** [EnglishEnglishEnglish, EnglishEnglishEnglish, EnglishEnglishEnglishEnglish 13 EnglishEnglishEnglishEnglishEnglishEnglishEnglish] */
const CYCLES = [
  [1933.7, 1937.4, 119.2],
  [1944.0, 1947.4, 151.8],
  [1954.2, 1958.2, 201.3],   // EnglishEnglishEnglishEnglishEnglishEnglishEnglish
  [1964.9, 1968.9, 110.6],
  [1976.5, 1979.9, 164.5],
  [1986.8, 1989.6, 158.5],
  [1996.4, 2000.3, 120.8],
  [2008.9, 2014.3, 81.9],    // EnglishEnglishEnglishEnglish
  [2019.9, 2024.9, 144.0],
];
/** EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
const REFERENCE_MAX = 201.3;
/** EnglishEnglishEnglishEnglishEnglish（English 26 EnglishEnglish）EnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
const NEXT_MIN_YEAR = 2030.5;

/** EnglishEnglishEnglishEnglishEnglish"English J2000 EnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
const J2000_YEAR = 2000.0;

/**
 * EnglishEnglishEnglishEnglishEnglishEnglish 0..1（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
 *
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：
 * EnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 *
 * @param {number} jdTT EnglishEnglishEnglish（TT）
 */
export function solarActivityAt(jdTT) {
  const year = J2000_YEAR + (jdTT - 2451545.0) / 365.25;
  if (year <= CYCLES[0][0]) return 0.05;
  for (let i = 0; i < CYCLES.length; i++) {
    const [minY, maxY, maxV] = CYCLES[i];
    const peak = maxV / REFERENCE_MAX;
    if (year < minY) continue;
    if (year <= maxY) {
      // EnglishEnglishEnglish：EnglishEnglish → EnglishEnglish
      const u = (year - minY) / Math.max(maxY - minY, 0.1);
      return 0.05 + (peak - 0.05) * (0.5 - 0.5 * Math.cos(Math.PI * u));
    }
    const nextMinY = i + 1 < CYCLES.length ? CYCLES[i + 1][0] : NEXT_MIN_YEAR;
    if (year <= nextMinY) {
      // EnglishEnglishEnglish：EnglishEnglish → EnglishEnglishEnglishEnglishEnglish
      const u = (year - maxY) / Math.max(nextMinY - maxY, 0.1);
      return 0.05 + (peak - 0.05) * (0.5 + 0.5 * Math.cos(Math.PI * u));
    }
  }
  return 0.05;
}

/** EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish） */
export const SOLAR_CYCLE_EXTREMA = CYCLES.map((c) => [...c]);
