// DEM EnglishEnglishEnglishEnglish LOD EnglishEnglish：EnglishEnglishEnglish（LOLA）EnglishEnglishEnglish（MOLA）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：
//   EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish DEM。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
//   EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、
//   EnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglish）。EnglishEnglish DEM EnglishEnglishEnglish GB English，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglishEnglish：
//   - EnglishEnglishEnglishEnglishEnglish：EnglishEnglish 0-8（EnglishEnglish 2^level × 2^level EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish）
//   - LRU EnglishEnglish：EnglishEnglish 64 EnglishEnglish，EnglishEnglishEnglish 32（EnglishEnglishEnglishEnglish，EnglishEnglish OOM）
//   - EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
//   - EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish 30 EnglishEnglishEnglishEnglish
//   - EnglishEnglishEnglishEnglishEnglishEnglish：height() EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish null EnglishEnglishEnglishEnglishEnglishEnglish
//
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish，EnglishEnglishEnglishEnglish）：
//   - DEM EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）
//   - EnglishEnglishEnglishEnglishEnglishEnglishEnglish DEM EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）
//   - EnglishEnglishEnglish：EnglishEnglishEnglishEnglish DEM EnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglish
//   - EnglishEnglishEnglish：EnglishEnglishEnglishEnglish DEM（EnglishEnglishEnglish）+ EnglishEnglishEnglishEnglish（EnglishEnglishEnglish DEM+EnglishEnglishEnglishEnglish）
//   - EnglishEnglishEnglish/EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish）
//   - EnglishEnglishEnglishEnglish：height() EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish DEM；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish +
//     EnglishEnglish uFade EnglishEnglishEnglishEnglish（#18）EnglishEnglish，EnglishEnglishEnglishEnglishEnglish
//
// EnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（tools/fetch-dem.mjs English NASA PDS/NOAA EnglishEnglish
// EnglishEnglishEnglishEnglish；LOLA=EnglishEnglish 16ppd、MOLA=EnglishEnglish 32ppd、ETOPO1=EnglishEnglishEnglishEnglish）。EnglishEnglishEnglishEnglishEnglish
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。

import { IS_MOBILE } from '../engine/quality.js';
import { asset } from '../config.js';
import { resourceQueue, whenIdle } from '../engine/resourceQueue.js';

/**
 * DEM EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish，EnglishEnglishEnglishEnglish）。
 * url EnglishEnglish：{z}=EnglishEnglish, {x}=English, {y}=English（EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
 * heightScale/heightOffset：English 16-bit EnglishEnglishEnglishEnglishEnglishEnglish km EnglishEnglish。
 *   EnglishEnglish = heightOffset + (raw / 65535) * heightScale
 *
 * maxLevel English**EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish**EnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 2^z × 2^z EnglishEnglish，EnglishEnglish 360°×180°，EnglishEnglishEnglish z EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
 * 360/(256·2^z) English/EnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish。
 * English"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglish z EnglishEnglish maxLevel；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 *
 *   moon  LOLA GDR ldem_16     5760×2880 → 0.0625°/px → maxLevel 4（EnglishEnglishEnglishEnglishEnglish）
 *   mars  MOLA MEGDR 32ppd    11520×5760 → 0.03125°/px → maxLevel 5（EnglishEnglishEnglishEnglish 4096，EnglishEnglish 2.8×）
 *   earth ETOPO1             21600×10800 → 0.01667°/px → maxLevel 6（EnglishEnglishEnglishEnglish 4096，EnglishEnglish 5.3×）
 *
 * EnglishEnglish：EnglishEnglishEnglish canvas EnglishEnglishEnglishEnglishEnglish 8 English，EnglishEnglish 16-bit EnglishEnglishEnglishEnglishEnglishEnglish R(English8English)+G(English8English)
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglish RGBA PNG EnglishEnglishEnglishEnglishEnglishEnglishEnglish 16 English PNG EnglishEnglishEnglish。
 */
export const DEM_SOURCES = {
  moon: {
    name: 'LOLA',
    url: 'dem/moon/{z}/{x}/{y}.png',  // EnglishEnglishEnglishEnglishEnglish，English asset() EnglishEnglish
    // LOLA EnglishEnglishEnglishEnglish：-9 km（EnglishEnglishEnglish）English +11 km（EnglishEnglishEnglish），English 20 km
    heightScale: 20,
    heightOffset: -9,
    tileSize: 256,
    maxLevel: 4,
    sourcePx: 5760,
  },
  mars: {
    name: 'MOLA',
    url: 'dem/mars/{z}/{x}/{y}.png',
    // MOLA EnglishEnglishEnglishEnglish：-9 km English +22 km（EnglishEnglishEnglish：EnglishEnglishEnglish −8.2 / EnglishEnglishEnglishEnglish +21.2），English 31 km
    heightScale: 31,
    heightOffset: -9,
    tileSize: 256,
    maxLevel: 5,
    sourcePx: 11520,
  },
  earth: {
    name: 'ETOPO1',
    url: 'dem/earth/{z}/{x}/{y}.png',
    // ETOPO1 EnglishEnglishEnglishEnglish：-11 km（EnglishEnglishEnglishEnglish）English +9 km（EnglishEnglish），English 20 km
    heightScale: 20,
    heightOffset: -11,
    tileSize: 256,
    maxLevel: 4,
    sourcePx: 21600,
  },
};

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish） */
export function levelExceedsSource(cfg, level) {
  if (!cfg?.sourcePx) return false;
  return 360 / (cfg.tileSize * 2 ** level) < 360 / cfg.sourcePx * 0.75;
}

/** EnglishEnglishEnglishEnglishEnglish（+Y=EnglishEnglish, +X=EnglishEnglishEnglishEnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglish（English） */
function dirToLatLon(dir) {
  const lat = Math.asin(Math.max(-1, Math.min(1, dir.y))) * 180 / Math.PI;
  const lon = Math.atan2(-dir.z, dir.x) * 180 / Math.PI; // EnglishEnglishEnglishEnglish（English terrain.js EnglishEnglish）
  return { lat, lon };
}

/** EnglishEnglishEnglishEnglish（English）EnglishEnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish） */
function latLonToTile(lat, lon, level) {
  const n = 2 ** level;
  // EnglishEnglishEnglishEnglishEnglishEnglish：lon [-180,180] → [0,n]，lat [90,-90] → [0,n]
  const x = ((lon + 180) / 360) * n;
  const y = ((90 - lat) / 180) * n;
  const ix = Math.floor(x), iy = Math.floor(y);
  return {
    x: ((ix % n) + n) % n, // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）
    y: Math.max(0, Math.min(n - 1, iy)), // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）
    fx: x - ix,
    fy: y - iy,
  };
}

/**
 * LRU EnglishEnglishEnglishEnglish：Map EnglishEnglishEnglishEnglishEnglishEnglish，delete+set EnglishEnglish O(1) LRU EnglishEnglish。
 * EnglishEnglishEnglishEnglish Map EnglishEnglishEnglishEnglish：JS Map EnglishEnglishEnglishEnglishEnglish = EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish，
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 */
class LRUTileCache {
  constructor(max) {
    this.max = max;
    this.map = new Map(); // key "z/x/y" → { data, size, level }
  }

  get(level, x, y) {
    const key = `${level}/${x}/${y}`;
    const v = this.map.get(key);
    if (v) {
      // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）—— delete + set EnglishEnglishEnglishEnglishEnglishEnglish
      this.map.delete(key);
      this.map.set(key, v);
    }
    return v;
  }

  peek(level, x, y) { return this.map.get(`${level}/${x}/${y}`); }

  set(level, x, y, tile) {
    const key = `${level}/${x}/${y}`;
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.max) {
      // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish）
      const oldest = [...this.map.keys()].find(k => k !== '0/0/0');
      if (oldest !== undefined) this.map.delete(oldest);
    }
    this.map.set(key, tile);
  }

  clear() { this.map.clear(); }
  get size() { return this.map.size; }
}

/**
 * DEM EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglish DEM EnglishEnglishEnglishEnglish、EnglishEnglish、EnglishEnglish。
 *
 * EnglishEnglishEnglishEnglish：
 *   1. TerrainManager EnglishEnglishEnglish/EnglishEnglishEnglishEnglish DEMTileSource
 *   2. EnglishEnglish update() EnglishEnglish requestTiles() EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
 *   3. HeightField.height() EnglishEnglish getHeightSync() EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）
 *   4. EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish null，HeightField EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
 */
export class DEMTileSource {
  constructor(bodyId, options = {}) {
    this.bodyId = bodyId;
    // EnglishEnglishEnglishEnglishEnglish：EnglishEnglish options.sources EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish/EnglishEnglish）
    const sources = options.sources ?? DEM_SOURCES;
    this.config = sources[bodyId] ?? null;
    // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish、EnglishEnglishEnglish）→ EnglishEnglishEnglishEnglishEnglishEnglishEnglish
    this.cache = new LRUTileCache(options.maxCache ?? (IS_MOBILE ? 32 : 64));
    this.loading = new Map(); // key → Promise，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    this._priority = 0;
    this._offline = false;
    this._failures = new Map();
    this._controllers = new Set();
    this._dirty = false; // EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish
    this.revision = 0;
    this._disposed = false;
    // EnglishEnglishEnglish lite EnglishEnglish：EnglishEnglish DEM EnglishEnglishEnglish（EnglishEnglishEnglish/EnglishEnglish）
    const maxLvl = this.config?.maxLevel ?? 0;
    this.sampleLevel = IS_MOBILE ? Math.min(6, maxLvl) : maxLvl;
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglish DEM EnglishEnglishEnglishEnglishEnglish */
  static hasSource(bodyId, sources = DEM_SOURCES) {
    return !!sources[bodyId];
  }

  get hasSource() { return this.config !== null; }
  get isOffline() { return this._offline; }
  get priority() { return this._priority; }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglish（English TerrainManager EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish） */
  setPriority(p) { this._priority = p; }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish） */
  get hasNewTiles() { return this._dirty; }
  clearDirty() { this._dirty = false; }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish）。
   * @param {number} level EnglishEnglishEnglishEnglishEnglish 0-8
   * @param {number} x English（EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish）
   * @param {number} y English（EnglishEnglishEnglishEnglish，EnglishEnglish）
   * @returns {Promise<{level,x,y,data:Float32Array,size:number}|null>}
   */
  async getTile(level, x, y) {
    if (!this.config || this._disposed) return null;
    level = Math.min(level, this.config.maxLevel);
    const n = 2 ** level;
    x = ((x % n) + n) % n; // EnglishEnglishEnglishEnglish
    y = Math.max(0, Math.min(n - 1, y));

    const cached = this.cache.get(level, x, y);
    if (cached) return cached;

    const key = `${level}/${x}/${y}`;
    // EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish fetch
    if (this.loading.has(key)) return this.loading.get(key);

    if ((this._failures.get(key) ?? 0) > Date.now()) return null;
    const promise = resourceQueue.run(`dem:${this.bodyId}/${key}`,
      () => this._fetchTile(level, x, y), 100 + this._priority + (level === 0 ? 10 : 0));
    this.loading.set(key, promise);
    try {
      const tile = await promise;
      if (tile && !this._disposed) {
        this.cache.set(level, x, y, tile);
        this._offline = false;
        this._failures.delete(key);
        this._dirty = true; // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
        this.revision++;
      }
      return tile;
    } finally {
      this.loading.delete(key);
    }
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
  async _fetchTile(level, x, y) {
    const url = asset(this.config.url
      .replace('{z}', level)
      .replace('{x}', x)
      .replace('{y}', y));
    if (this._disposed) return null;
    const ctl = new AbortController();
    this._controllers.add(ctl);
    const timer = setTimeout(() => ctl.abort(), 12000);
    try {
      const res = await fetch(url, { mode: 'cors', signal: ctl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      await whenIdle();
      const data = await this._decodeTile(blob);
      if (!data) throw new Error('EnglishEnglishEnglishEnglish');
      return { level, x, y, data, size: this.config.tileSize };
    } catch (e) {
      // Keep valid cached terrain. A failed fine tile must not discard the
      // whole planet's DEM, and transient errors retry after a bounded cooldown.
      this._failures.set(`${level}/${x}/${y}`, Date.now() + 30000);
      this._offline = this.cache.size === 0;
      if (!this._disposed) console.warn(`[DEM] ${this.bodyId} ${level}/${x}/${y}: ${e.message}`);
      return null;
    } finally {
      clearTimeout(timer);
      this._controllers.delete(ctl);
    }
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（Float32Array，km）。
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglish createImageBitmap + Canvas EnglishEnglishEnglishEnglish；
   * Node/EnglishEnglishEnglishEnglishEnglish createImageBitmap → EnglishEnglish null（EnglishEnglishEnglishEnglishEnglishEnglish）。
   * EnglishEnglish：16-bit EnglishEnglishEnglishEnglishEnglishEnglish R(English8English)+G(English8English) EnglishEnglish（Terrain RGB EnglishEnglish）。
   */
  async _decodeTile(blob) {
    if (typeof createImageBitmap === 'undefined') return null;
    const bmp = await createImageBitmap(blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
    const w = bmp.width, h = bmp.height;
    const canvas = typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(w, h)
      : document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bmp, 0, 0);
    const img = ctx.getImageData(0, 0, w, h);
    bmp.close?.();
    const { heightScale, heightOffset } = this.config;
    const n = w * h;
    const heights = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const r = img.data[i * 4];
      const g = img.data[i * 4 + 1];
      const raw = (r << 8) | g; // 16-bit EnglishEnglishEnglish
      heights[i] = heightOffset + (raw / 65535) * heightScale;
    }
    return heights;
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（km，EnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
   * @param {number} lat EnglishEnglish（English）
   * @param {number} lon EnglishEnglish（English）
   * @param {number} [level] EnglishEnglishEnglishEnglishEnglish，EnglishEnglish sampleLevel
   * @returns {Promise<number|null>} EnglishEnglish km，English null（EnglishEnglish/EnglishEnglishEnglish）
   */
  async getHeight(lat, lon, level) {
    if (!this.config) return null;
    level = Math.min(level ?? this.sampleLevel, this.config.maxLevel);
    const t = latLonToTile(lat, lon, level);
    const tile = await this.getTile(level, t.x, t.y);
    if (!tile) return null;
    return this._sampleTile(tile, t.fx, t.fy);
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
   * English HeightField.height() EnglishEnglishEnglishEnglishEnglish——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   *
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（fetch-dem.mjs），
   * EnglishEnglish i EnglishEnglishEnglishEnglish [i, i+1)，EnglishEnglishEnglish i+0.5。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
   * fx∈[0,1] EnglishEnglishEnglishEnglishEnglish [0, s-1]——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish 0 English、
   * EnglishEnglishEnglishEnglish 255 English，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish z4 ≈ 2.7km）；
   * EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish ~1km/EnglishEnglish）EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish LOD EnglishEnglishEnglish"EnglishEnglish"（lon=0° EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
   * EnglishEnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   *
   * @param {THREE.Vector3} dir EnglishEnglishEnglishEnglish（+Y=EnglishEnglish, +X=EnglishEnglishEnglishEnglishEnglish）
   * @returns {number|null} EnglishEnglish km，English null（EnglishEnglishEnglishEnglishEnglish/EnglishEnglish）
   */
  getHeightSync(dir) {
    if (!this.config) return null;
    const { lat, lon } = dirToLatLon(dir);
    const s = this.config.tileSize;
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish ≤4 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish
    for (let level = this.sampleLevel; level >= 0; level--) {
      const n = 2 ** level;
      const span = n * s; // EnglishEnglishEnglishEnglishEnglish
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish → English 0.5 EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
      let gx = ((lon + 180) / 360) * span - 0.5;
      let gy = ((90 - lat) / 180) * span - 0.5;
      gx = ((gx % span) + span) % span;              // EnglishEnglishEnglishEnglish（180° EnglishEnglishEnglishEnglishEnglishEnglish）
      gy = Math.max(0, Math.min(span - 1.001, gy));  // EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）
      const x0 = Math.floor(gx), y0 = Math.floor(gy);
      const tx = gx - x0, ty = gy - y0;
      const px = (X, Y) => {
        const Xi = ((X % span) + span) % span;
        const Yi = Math.max(0, Math.min(span - 1, Y));
        const tile = this.cache.peek(level, Math.floor(Xi / s), Math.floor(Yi / s));
        return tile ? tile.data[(Yi % s) * s + (Xi % s)] : null;
      };
      const h00 = px(x0, y0), h10 = px(x0 + 1, y0);
      const h01 = px(x0, y0 + 1), h11 = px(x0 + 1, y0 + 1);
      if (h00 === null || h10 === null || h01 === null || h11 === null) continue;
      return h00 * (1 - tx) * (1 - ty) + h10 * tx * (1 - ty)
           + h01 * (1 - tx) * ty + h11 * tx * ty;
    }
    return null; // EnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
  _sampleTile(tile, fx, fy) {
    const s = tile.size;
    const px = fx * (s - 1);
    const py = fy * (s - 1);
    const x0 = Math.floor(px), y0 = Math.floor(py);
    const x1 = Math.min(x0 + 1, s - 1), y1 = Math.min(y0 + 1, s - 1);
    const tx = px - x0, ty = py - y0;
    const h00 = tile.data[y0 * s + x0];
    const h10 = tile.data[y0 * s + x1];
    const h01 = tile.data[y1 * s + x0];
    const h11 = tile.data[y1 * s + x1];
    return h00 * (1 - tx) * (1 - ty) + h10 * tx * (1 - ty)
         + h01 * (1 - tx) * ty + h11 * tx * ty;
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish）。
   * EnglishEnglish 3×3 EnglishEnglish（EnglishEnglishEnglishEnglish），fire-and-forget。
   * @param {THREE.Vector3} dirLocal EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
   * @param {number} level EnglishEnglishEnglishEnglishEnglishEnglishEnglish
   */
  requestTiles(dirLocal, level) {
    if (!this.config || this._disposed) return;
    level = Math.min(level, this.config.maxLevel);
    const { lat, lon } = dirToLatLon(dirLocal);
    const t = latLonToTile(lat, lon, level);
    // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglish——EnglishEnglish fetch EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    this.getTile(level, t.x, t.y);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        this.getTile(level, t.x + dx, t.y + dy);
      }
    }
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish 1×1 EnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish */
  async preloadBase() {
    if (!this.config) return;
    await this.getTile(0, 0, 0);
  }

  dispose() {
    this._disposed = true;
    for (const ctl of this._controllers) ctl.abort();
    this._controllers.clear();
    this._failures.clear();
    this.cache.clear();
    this.loading.clear();
  }
}
