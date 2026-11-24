// EnglishEnglishEnglishEnglishEnglishEnglish（#52）：EnglishEnglishEnglishEnglishEnglish / EnglishEnglish / EnglishEnglishEnglishEnglishEnglishEnglish localStorage，
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglish / EnglishEnglish、EnglishEnglish / EnglishEnglish JSON。
//
// EnglishEnglishEnglishEnglish：
// - EnglishEnglishEnglishEnglish，EnglishEnglishEnglish DOM / Three.js，EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// - state EnglishEnglishEnglish main.js English URL hash EnglishEnglish（applyLocationHash / copyShareUrl）EnglishEnglish，
//   EnglishEnglishEnglishEnglish posKm English mode EnglishEnglishEnglish fly / walk EnglishEnglish（URL hash EnglishEnglishEnglish orbit EnglishEnglish）。
// - localStorage EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。

const STORAGE_KEY = 'solar-wanderer:bookmarks';
const SCHEMA_VERSION = 1;

/** EnglishEnglishEnglishEnglishEnglish ID（EnglishEnglish + EnglishEnglish，EnglishEnglishEnglishEnglishEnglish） */
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export class Bookmarks {
  constructor() {
    /** @type {Array<{id,name,state,created}>} */
    this._items = [];
    this._load();
  }

  // ── EnglishEnglishEnglish ──────────────────────────────────────────────────────────

  /** English localStorage EnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish） */
  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      // EnglishEnglish：EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish）English { version, items }（EnglishEnglishEnglish）
      const items = Array.isArray(data) ? data : data?.items;
      if (Array.isArray(items)) this._items = items;
    } catch {
      // JSON EnglishEnglishEnglishEnglishEnglish localStorage EnglishEnglishEnglish → EnglishEnglishEnglish
      this._items = [];
    }
  }

  /** EnglishEnglish localStorage；EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish） */
  _persist() {
    try {
      const payload = JSON.stringify({ version: SCHEMA_VERSION, items: this._items });
      localStorage.setItem(STORAGE_KEY, payload);
    } catch {
      // EnglishEnglishEnglishEnglish / EnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglishEnglish
    }
  }

  // ── EnglishEnglish API ────────────────────────────────────────────────────────

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   * @param {string} name EnglishEnglishEnglishEnglish
   * @param {{posKm:number[], focusId:string, lat:number, lon:number, dist:number, jdTT:number, mode:string}} state
   * @returns {string} EnglishEnglishEnglish ID
   */
  save(name, state) {
    // posKm EnglishEnglishEnglish Float64Array → EnglishEnglishEnglishEnglishEnglishEnglishEnglish JSON EnglishEnglishEnglish
    const cleanState = {
      ...state,
      posKm: state.posKm
        ? Array.from(state.posKm)
        : undefined,
    };
    const bookmark = {
      id: genId(),
      name: name || `Bookmark ${this._items.length + 1}`,
      state: cleanState,
      created: Date.now(),
    };
    this._items.push(bookmark);
    this._persist();
    return bookmark.id;
  }

  /**
   * English ID EnglishEnglishEnglishEnglish。
   * @param {string} id
   * @returns {{id,name,state,created}|null}
   */
  load(id) {
    return this._items.find((b) => b.id === id) ?? null;
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish） */
  list() {
    return [...this._items].sort((a, b) => b.created - a.created);
  }

  /**
   * English ID EnglishEnglishEnglishEnglish。
   * @returns {boolean} EnglishEnglishEnglishEnglishEnglishEnglish
   */
  delete(id) {
    const idx = this._items.findIndex((b) => b.id === id);
    if (idx < 0) return false;
    this._items.splice(idx, 1);
    this._persist();
    return true;
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglish */
  clear() {
    this._items = [];
    this._persist();
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglish JSON EnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglish / EnglishEnglish）。
   * @returns {string}
   */
  exportJSON() {
    return JSON.stringify(
      { version: SCHEMA_VERSION, exported: Date.now(), items: this._items },
      null,
      2,
    );
  }

  /**
   * English JSON EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish，EnglishEnglish ID EnglishEnglishEnglish）。
   * @param {string} json exportJSON() EnglishEnglishEnglishEnglishEnglishEnglish
   * @returns {number} EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
   * @throws {Error} EnglishEnglishEnglishEnglishEnglishEnglishEnglish
   */
  importJSON(json) {
    const data = JSON.parse(json);
    const items = Array.isArray(data) ? data : data?.items;
    if (!Array.isArray(items)) {
      throw new Error('Invalid bookmark JSON: expected array or {items:[]}');
    }
    let count = 0;
    for (const b of items) {
      // EnglishEnglishEnglishEnglishEnglishEnglish
      if (!b || !b.id || !b.state) continue;
      // EnglishEnglishEnglishEnglishEnglishEnglish ID
      if (this._items.some((e) => e.id === b.id)) continue;
      this._items.push({
        id: b.id,
        name: b.name || 'Imported',
        state: b.state,
        created: b.created || Date.now(),
      });
      count++;
    }
    this._persist();
    return count;
  }
}
