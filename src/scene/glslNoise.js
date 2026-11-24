// EnglishEnglish GLSL EnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglish `fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453)`
// EnglishEnglishEnglish scene/ EnglishEnglish 4 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（planetMaterial EnglishEnglish、atmosphere、
// terrain、sun），EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：
//
// **sin EnglishEnglishEnglish mediump GPU EnglishEnglishEnglishEnglish**——EnglishEnglishEnglishEnglish sin EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish GPU EnglishEnglish）。EnglishEnglishEnglishEnglishEnglishEnglish sin EnglishEnglishEnglishEnglish
// EnglishEnglish（Dave Hoskins EnglishEnglishEnglishEnglish），fract/dot English mediump EnglishEnglishEnglishEnglishEnglishEnglish。

export const HASH_GLSL = /* glsl */ `
  // EnglishEnglishEnglish → [0,1) EnglishEnglishEnglishEnglishEnglishEnglish。English sin，mediump EnglishEnglishEnglish。
  float glslHash31(vec3 p3) {
    p3 = fract(p3 * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
`;
