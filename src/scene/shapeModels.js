// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（PDS SBN / Thomas English）。
//
// EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglish**，EnglishEnglishEnglish
// EnglishEnglishEnglishEnglishEnglishEnglishEnglish——Thomas EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（Phobos/Deimos/Janus/
// Epimetheus/Hyperion…）。EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish Stickney）English
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglishEnglishEnglish tools/fetch-shapes.mjs：magic 'SHP1' + nLat/nLon(u32) +
// scale/mn(f32) + uint16 EnglishEnglish。2°×2° EnglishEnglish，planetocentric，EnglishEnglishEnglish IAU English
// **EnglishEnglish**（Prime meridian W = …，English bodies.js EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
//
// EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglish load EnglishEnglish。

const grids = new Map();   // id -> { nLat, nLon, scale, mn, data: Uint16Array }

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglishEnglish/EnglishEnglishEnglishEnglish）。 */
export async function loadShapeModels(ids, base = '') {
  await Promise.all(ids.map(async (id) => {
    try {
      const res = await fetch(`${base}data/shapes/${id}.bin`);
      if (!res.ok) return;
      const buf = await res.arrayBuffer();
      if (buf.byteLength < 20) return;
      const dv = new DataView(buf);
      if (dv.getUint32(0, false) !== 0x53485031) return;   // 'SHP1'
      const nLat = dv.getUint32(4, true), nLon = dv.getUint32(8, true);
      const scale = dv.getFloat32(12, true), mn = dv.getFloat32(16, true);
      if (!nLat || !nLon || !(scale > 0) || 20 + nLat * nLon * 2 > buf.byteLength) return;
      const data = new Uint16Array(nLat * nLon);
      for (let i = 0; i < data.length; i++) data[i] = dv.getUint16(20 + i * 2, true);
      grids.set(id, { nLat, nLon, scale, mn, data });
    } catch { /* EnglishEnglish */ }
  }));
  return grids.size;
}

export function hasShapeModel(id) { return grids.has(id); }

/**
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglish（km）。
 * EnglishEnglishEnglish planetocentric（= asin(y)），EnglishEnglishEnglish terrain.sampleMap EnglishEnglishEnglishEnglish。
 * EnglishEnglishEnglishEnglishEnglish：2° EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglish），English _albedoReliefAt EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 */
export function shapeRadiusKm(id, dir) {
  const g = grids.get(id);
  if (!g) return null;
  const lat = Math.asin(Math.max(-1, Math.min(1, dir.y)));
  const lon = Math.atan2(-dir.z, dir.x);
  // EnglishEnglish → English（-90..90 EnglishEnglish），EnglishEnglish → English（0..360 EnglishEnglish，lon∈[-π,π] EnglishEnglish [0,360)）
  let fy = (0.5 - lat / Math.PI) * (g.nLat - 1);
  let fx = ((lon / Math.PI + 1) * 0.5) * (g.nLon - 1);
  fy = Math.max(0, Math.min(g.nLat - 1.0001, fy));
  // EnglishEnglishEnglishEnglishEnglishEnglish：English nLon-1 EnglishEnglish 0 EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  const nLonWrap = g.nLon - 1;
  fx = ((fx % nLonWrap) + nLonWrap) % nLonWrap;
  const y0 = Math.floor(fy), x0 = Math.floor(fx);
  const ty = fy - y0, tx = fx - x0;
  const x1 = (x0 + 1) % nLonWrap;
  const y1 = Math.min(y0 + 1, g.nLat - 1);
  const at = (y, x) => g.mn + g.data[y * g.nLon + x] * g.scale;
  const a = at(y0, x0), b = at(y0, x1), c = at(y1, x0), d = at(y1, x1);
  const top = a + (b - a) * tx;
  const bot = c + (d - c) * tx;
  return top + (bot - top) * ty;
}
