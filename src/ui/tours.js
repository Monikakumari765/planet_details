// EnglishEnglishEnglishEnglishEnglishEnglish（#39, #40）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，
// EnglishEnglishEnglishEnglishEnglishEnglishEnglish TTS EnglishEnglish，English"EnglishEnglishEnglishEnglish"EnglishEnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"。
//
// EnglishEnglishEnglishEnglish：
// - EnglishEnglishEnglishEnglishEnglish = EnglishEnglish GE English flyTo + EnglishEnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglish next/prev/skip EnglishEnglish
// - EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English i18n EnglishEnglish），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglish key-value EnglishEnglish
// - dist EnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglish null，English viewDist EnglishEnglish
// - action EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（flyTo/land/lookAt/zoomOut），TourSystem EnglishEnglishEnglishEnglish flyTo

import { LANG } from './i18n.js';

// ── EnglishEnglishEnglishEnglish UI EnglishEnglish（EnglishEnglishEnglish）─────────────────────────────────────────
// EnglishEnglish i18n.js EnglishEnglishEnglishEnglishEnglish { zh, en, es, ja, fr, de, ru }，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish i18n.js：EnglishEnglish"EnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglish。
const UI = {
  'tour.start':    { en: '🎬 Start tour' },
  'tour.next':     { en: '▶ Next' },
  'tour.prev':     { en: '◀ Prev' },
  'tour.skip':     { en: '⏭ Skip tour' },
  'tour.done':     { en: '🎉 Tour complete' },
  'tour.checkpoint': { en: 'Stop {n}/{t}' },
};

/** EnglishEnglish UI EnglishEnglishEnglish（English i18n.t() EnglishEnglishEnglish：EnglishEnglishEnglishEnglish → en → zh EnglishEnglish） */
function tt(key, vars) {
  const e = UI[key];
  let s = e ? (e[LANG] ?? e.en ?? e.zh ?? key) : key;
  if (vars) for (const k in vars) s = s.replaceAll('{' + k + '}', vars[k]);
  return s;
}

// ═══════════════════════════════════════════════════════════════════════
// EnglishEnglishEnglishEnglish
// ═══════════════════════════════════════════════════════════════════════

/**
 * Issue #39："EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish？"——EnglishEnglishEnglishEnglishEnglishEnglishEnglish
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
 */
const BACKYARD_TOUR = {
  id: 'backyard',
  title: { en: 'How Big Is Our Backyard?' },
  description: { en: 'Travel from Earth’s surface to the edge of the Solar System.' },
  checkpoints: [
    // 1. EnglishEnglishEnglishEnglish
    {
      bodyId: 'earth',
      dist: 1.003,
      action: 'land',
      duration: 10,
      narration: { en: 'Let us begin at your feet. You stand on Earth\'s surface — a blue marble 6,371 km in radius. Humanity has thrived here for 300,000 years, yet only yesterday did we truly leave its embrace.' },
    },
    // 2. EnglishEnglishEnglishEnglish
    {
      bodyId: 'earth',
      dist: 4,
      action: 'flyTo',
      duration: 9,
      narration: { en: 'Rising to Earth orbit. From here, the atmosphere is but a thin veil — less than 1% of Earth\'s radius. The International Space Station flies within this veil at 7.8 km/s, circling Earth every 90 minutes.' },
    },
    // 3. EnglishEnglish
    {
      bodyId: 'moon',
      dist: 4,
      action: 'flyTo',
      duration: 9,
      narration: { en: 'The Moon — Earth\'s only natural satellite, 384,000 km away on average. Apollo astronauts took 3 days to fly here; light makes the journey in 1.3 seconds. Tidal locking forever turns the same face toward us.' },
    },
    // 4. EnglishEnglish
    {
      bodyId: 'mars',
      dist: 4,
      action: 'flyTo',
      duration: 9,
      narration: { en: 'Mars, the Red Planet. At closest approach, 54.6 million km from Earth; at farthest, over 400 million km. With current rocket technology, the journey takes 6 to 9 months. It is humanity\'s next destination.' },
    },
    // 5. EnglishEnglish
    {
      bodyId: 'jupiter',
      dist: 4,
      action: 'flyTo',
      duration: 10,
      narration: { en: 'Jupiter — the giant of the Solar System. Eleven times Earth\'s radius, 780 million km from the Sun. The Voyager probes took 13 months to fly past. Its gravity acts as a sweeper, shielding the inner Solar System.' },
    },
    // 6. EnglishEnglish
    {
      bodyId: 'saturn',
      dist: 4,
      action: 'flyTo',
      duration: 10,
      narration: { en: 'Saturn and its magnificent rings. 1.4 billion km from the Sun; the Cassini spacecraft took 7 years to arrive. The rings span 280,000 km yet are only tens of meters thick — proportionally thinner than a sheet of paper.' },
    },
    // 7. EnglishEnglishEnglish
    {
      bodyId: 'neptune',
      dist: 4,
      action: 'flyTo',
      duration: 10,
      narration: { en: 'Neptune — the most distant planet. 4.5 billion km from the Sun, 30 times Earth\'s orbital distance. Voyager 2 took 12 years to reach here. Sunlight takes 4 hours to arrive.' },
    },
    // 8. EnglishEnglishEnglish1English
    {
      bodyId: 'voyager1',
      dist: null,
      action: 'flyTo',
      duration: 11,
      narration: { en: 'Voyager 1 — the farthest human-made object. Launched in 1977, it has flown for 47 years and now lies 24 billion km (160 AU) from the Sun. Its Golden Record carries Earth\'s greetings, drifting through interstellar space for billions of years to come.' },
    },
    // 9. EnglishEnglishEnglishEnglish
    {
      bodyId: 'heliopause',
      dist: null,
      action: 'flyTo',
      duration: 11,
      narration: { en: 'The Heliopause — where the solar wind ends. About 121 AU (18 billion km) from the Sun. Voyager 1 crossed here in 2012, becoming the first human-made object to enter interstellar space. The Sun\'s domain ends here.' },
    },
    // 10. EnglishEnglishEnglishEnglish
    {
      bodyId: 'oortcloud',
      dist: null,
      action: 'zoomOut',
      duration: 14,
      narration: { en: 'The Oort Cloud — the Solar System\'s final frontier. A spherical comet cloud 2,000 to 100,000 AU from the Sun. 100,000 AU is about 1.6 light-years. The nearest star, Proxima Centauri, lies 4.24 light-years away — our backyard, on the cosmic scale, is but a corner of it.' },
    },
  ],
};

/**
 * Issue #40："EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish"——EnglishEnglishEnglishEnglishEnglishEnglish
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglish"EnglishEnglishEnglishEnglish"。
 */
const EARTH_MOON_TOUR = {
  id: 'earth-moon',
  title: { en: 'Standing on the Moon, Looking at Earth' },
  description: { en: 'Explore the Moon and see Earth from its surface.' },
  checkpoints: [
    // 1. EnglishEnglishEnglishEnglish
    {
      bodyId: 'earth',
      dist: 4,
      action: 'flyTo',
      duration: 9,
      narration: { en: 'We begin in Earth orbit. Look at this blue planet — the only world in the known universe to harbor life. Atmosphere, oceans, land — everything life needs exists here in perfect measure.' },
    },
    // 2. EnglishEnglishEnglishEnglish
    {
      bodyId: 'moon',
      dist: 4,
      action: 'flyTo',
      duration: 10,
      narration: { en: 'Now we fly to the Moon. A journey of 384,000 km. Note the lunar surface — the dark areas are ancient basalt plains called "maria"; the bright areas are ancient highlands, covered in impact craters.' },
    },
    // 3. EnglishEnglishEnglishEnglish
    {
      bodyId: 'moon',
      dist: 1.003,
      action: 'land',
      duration: 11,
      narration: { en: 'Landing on the lunar surface. The Moon\'s gravity is one-sixth of Earth\'s. Apollo astronauts described walking here as a "slow-motion trampoline." Look around — no atmosphere means an eternally black sky, even with the Sun overhead.' },
    },
    // 4. EnglishEnglish
    {
      bodyId: 'moon',
      dist: 1.003,
      action: 'lookAt',
      duration: 10,
      narration: { en: 'Now turn around, face the Earth. Because of tidal locking, from the Moon\'s near side, Earth hangs nearly motionless in the sky — unlike the Moon as seen from Earth, which rises and sets. This is why we can never see the Moon\'s far side.' },
    },
    // 5. EnglishEnglishEnglishEnglishEnglishEnglish
    {
      bodyId: 'moon',
      dist: 1.003,
      action: 'lookAt',
      duration: 13,
      narration: { en: 'Behold the rising blue marble — this is the "Earthrise" captured by Apollo 8 astronauts in lunar orbit. Bill Anders said: "We came all this way to explore the Moon, and the most important thing is that we discovered the Earth." Carl Sagan called it the "Pale Blue Dot" — our only home.' },
    },
  ],
};

/** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（English id EnglishEnglish） */
/**
 * "EnglishEnglishEnglishEnglishEnglish"——EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
 * EnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglish → EnglishEnglishEnglish → EnglishEnglishEnglishEnglishEnglishEnglish。
 */
const GIANTS_TOUR = {
  id: 'giants',
  title: { en: 'Journey of the Giants' },
  description: { en: 'Visit Jupiter, its moons, and the rings of Saturn.' },
  checkpoints: [
    {
      bodyId: 'jupiter', dist: 3, action: 'flyTo', duration: 10,
      narration: { en: 'First stop: Jupiter. Its Great Red Spot is a giant storm that has raged for centuries — large enough to swallow the entire Earth. Note where it is right now: even its rotation is real in this simulation.' },
    },
    {
      bodyId: 'europa', dist: 4, action: 'flyTo', duration: 10,
      narration: { en: 'Europa. Beneath its icy crust hides a liquid ocean with more water than all of Earth\'s oceans combined — one of the most promising places to look for extraterrestrial life.' },
    },
    {
      bodyId: 'io', dist: 4, action: 'flyTo', duration: 10,
      narration: { en: 'Io, the most volcanically active body in the Solar System. Jupiter\'s gravity kneads it like dough; sulfur volcanoes erupt constantly, leaving barely a calm spot on its surface.' },
    },
    {
      bodyId: 'saturn', dist: 3.5, action: 'flyTo', duration: 10,
      narration: { en: 'The rings of Saturn. Hundreds of thousands of kilometers wide, yet only about 20 meters thick on average — if Saturn were the size of a room, the rings would be thinner than a sheet of paper. They are an orbital dance of countless ice chunks and rock debris.' },
    },
    {
      bodyId: 'titan', dist: 4, action: 'flyTo', duration: 12,
      narration: { en: 'Titan, our final stop. The only moon with a dense atmosphere: beneath the orange haze lie rivers, lakes, and seas of liquid methane. Standing on its surface, the air pressure is 50% higher than on Earth. The grand tour ends here — but you are now free to fly anywhere.' },
    },
  ],
};

export const TOURS = {
  [BACKYARD_TOUR.id]: BACKYARD_TOUR,
  [EARTH_MOON_TOUR.id]: EARTH_MOON_TOUR,
  [GIANTS_TOUR.id]: GIANTS_TOUR,
};

// ═══════════════════════════════════════════════════════════════════════
// TourSystem
// ═══════════════════════════════════════════════════════════════════════

/**
 * EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish flyTo + EnglishEnglishEnglishEnglish。
 *
 * @param {Object}   opts
 * @param {Function} opts.flyTo    (bodyId, fromId?) => void — GE EnglishEnglishEnglishEnglishEnglish
 * @param {Function} opts.select   (bodyId) => void — EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish）
 * @param {Function} opts.getMode  () => 'orbit'|'fly'|'walk' — EnglishEnglishEnglishEnglishEnglishEnglish
 * @param {Function} opts.setMode  (mode) => void — EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglish）
 * @param {Object}   opts.hud      HUD EnglishEnglish（EnglishEnglish tip() EnglishEnglishEnglishEnglish）
 */
export class TourSystem {
  constructor({ flyTo, select, getMode, setMode, hud }) {
    this.flyTo = flyTo;
    this.select = select;
    this.getMode = getMode;
    this.setMode = setMode;
    this.hud = hud;
    this._activeTourId = null;
    this._checkpointIndex = -1;
    this._timer = null;
    // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish TTS（Narrator）
    this.onNarration = null;
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（flyTo EnglishEnglish orbit EnglishEnglish）。
   * @param {string} tourId 'backyard' | 'earth-moon'
   * @returns {boolean} EnglishEnglishEnglishEnglishEnglishEnglish
   */
  start(tourId) {
    const tour = TOURS[tourId];
    if (!tour) return false;
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish——flyTo EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish walk EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    if (this.getMode && this.getMode() !== 'orbit' && this.setMode) {
      this.setMode('orbit');
    }
    this._activeTourId = tourId;
    this._checkpointIndex = -1;
    this.next();
    return true;
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。 */
  next() {
    if (!this._activeTourId) return false;
    const tour = TOURS[this._activeTourId];
    this._checkpointIndex++;
    if (this._checkpointIndex >= tour.checkpoints.length) {
      this._finish();
      return false;
    }
    this._gotoCheckpoint(tour.checkpoints[this._checkpointIndex]);
    return true;
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。 */
  prev() {
    if (!this._activeTourId) return false;
    this._checkpointIndex = Math.max(0, this._checkpointIndex - 1);
    const tour = TOURS[this._activeTourId];
    this._gotoCheckpoint(tour.checkpoints[this._checkpointIndex]);
    return true;
  }

  /** EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglish）。 */
  skip() {
    this._activeTourId = null;
    this._checkpointIndex = -1;
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    if (this.hud) this.hud.tip(null);
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   * @returns {{id:string, title:string, narration:string, checkpoint:Object}|null}
   */
  get current() {
    if (!this._activeTourId) return null;
    const tour = TOURS[this._activeTourId];
    const cp = tour.checkpoints[this._checkpointIndex];
    if (!cp) return null;
    return {
      id: cp.bodyId,
      title: tour.title[LANG] ?? tour.title.en ?? tour.title.zh,
      narration: cp.narration[LANG] ?? cp.narration.en ?? cp.narration.zh,
      checkpoint: cp,
    };
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish）。 */
  get tours() {
    return Object.values(TOURS).map((t) => ({
      id: t.id,
      title: t.title[LANG] ?? t.title.en ?? t.title.zh,
      description: t.description[LANG] ?? t.description.en ?? t.description.zh,
      checkpointCount: t.checkpoints.length,
    }));
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。 */
  get isActive() {
    return this._activeTourId !== null;
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglish（0-based），EnglishEnglishEnglishEnglishEnglish -1。 */
  get checkpointIndex() {
    return this._checkpointIndex;
  }

  // ── EnglishEnglish ──────────────────────────────────────────────────────────

  _gotoCheckpoint(cp) {
    // EnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish action EnglishEnglish flyTo EnglishEnglishEnglishEnglishEnglish；
    // 'land'/'lookAt'/'zoomOut' EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish action EnglishEnglishEnglishEnglish
    this.flyTo(cp.bodyId);
    this.select(cp.bodyId);

    // EnglishEnglishEnglishEnglish（HUD tip）
    const text = cp.narration[LANG] ?? cp.narration.en ?? cp.narration.zh;
    if (this.hud) {
      const progress = tt('tour.checkpoint', {
        n: this._checkpointIndex + 1,
        t: TOURS[this._activeTourId].checkpoints.length,
      });
      this.hud.tip(`${progress}　${text}`);
    }

    // EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish TTS）
    if (this.onNarration) this.onNarration(text, cp);

    // EnglishEnglishEnglishEnglish
    if (this._timer) clearTimeout(this._timer);
    if (cp.duration > 0) {
      this._timer = setTimeout(() => this.next(), cp.duration * 1000);
    }
  }

  _finish() {
    const wasActive = this._activeTourId;
    this._activeTourId = null;
    this._checkpointIndex = -1;
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    if (this.hud) this.hud.tip(tt('tour.done'));
  }
}
