// EnglishEnglishEnglishEnglishEnglish（#42）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglish、Q&A EnglishEnglish。
//
// EnglishEnglishEnglishEnglish：
// - EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglish，EnglishEnglishEnglishEnglish
// - EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglish URL EnglishEnglishEnglishEnglish（main.js English #focusId,lat,lon,dist,jd），
//   EnglishEnglish tour EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
// - Q&A EnglishEnglish：EnglishEnglishEnglishEnglish → select + flyTo EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish
// - EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（Vite EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）

import { LANG } from './i18n.js';
import { TOURS } from './tours.js';

// ── EnglishEnglishEnglishEnglish UI EnglishEnglish ──────────────────────────────────────────────────
const UI = {
  'teacher.lessonTitle': { en: 'Lesson Plan' },
  'teacher.duration':   { en: 'Duration' },
  'teacher.action':     { en: 'Action' },
  'teacher.totalDuration': { en: 'Total duration' },
  'teacher.checkpoints': { en: 'Checkpoints' },
  'teacher.classroomUrl': { en: 'Classroom sync URL' },
  'teacher.classroomCopied': { en: '📋 Classroom sync URL copied to clipboard' },
  'teacher.askHighlight': { en: '🎯 Highlight: {name}' },
  'teacher.offlineTitle': { en: 'Offline usage' },
};

function tt(key, vars) {
  const e = UI[key];
  let s = e ? (e[LANG] ?? e.en ?? e.zh ?? key) : key;
  if (vars) for (const k in vars) s = s.replaceAll('{' + k + '}', vars[k]);
  return s;
}

/** action EnglishEnglishEnglishEnglishEnglishEnglishEnglish */
const ACTION_LABELS = {
  flyTo:   { en: 'Fly to' },
  land:    { en: 'Land' },
  lookAt:  { en: 'Look at' },
  zoomOut: { en: 'Zoom out' },
};

/**
 * EnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish、EnglishEnglishEnglishEnglishEnglishEnglish、Q&A EnglishEnglish。
 *
 * @param {Object}   opts
 * @param {Object}   opts.tours   TourSystem EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
 * @param {Function} opts.select  (bodyId) => void — EnglishEnglishEnglishEnglish
 * @param {Function} opts.flyTo   (bodyId) => void — EnglishEnglishEnglishEnglish
 * @param {Object}   [opts.hud]   HUD EnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish）
 * @param {Function} [opts.nameOf] (bodyId) => string — EnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglish，EnglishEnglishEnglish ID）
 */
export class TeacherToolkit {
  constructor({ tours, select, flyTo, hud, nameOf }) {
    this.tours = tours;
    this.select = select;
    this.flyTo = flyTo;
    this.hud = hud;
    this.nameOf = nameOf ?? ((id) => id);
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   * EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   * @param {string} tourId 'backyard' | 'earth-moon'
   * @returns {string|null} EnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish null
   */
  generateLessonPlan(tourId) {
    const tour = TOURS[tourId];
    if (!tour) return null;

    const title = tour.title[LANG] ?? tour.title.en ?? tour.title.zh;
    const desc = tour.description[LANG] ?? tour.description.en ?? tour.description.zh;
    const lines = [];

    lines.push(`═══════════════════════════════════════════════════════════`);
    lines.push(`  ${tt('teacher.lessonTitle')}: ${title}`);
    lines.push(`═══════════════════════════════════════════════════════════`);
    lines.push('');
    lines.push(desc);
    lines.push('');
    lines.push(`${tt('teacher.checkpoints')}: ${tour.checkpoints.length}`);
    const totalDur = tour.checkpoints.reduce((s, c) => s + (c.duration || 0), 0);
    lines.push(`${tt('teacher.totalDuration')}: ${totalDur} s`);
    lines.push('');

    tour.checkpoints.forEach((cp, i) => {
      const narration = cp.narration[LANG] ?? cp.narration.en ?? cp.narration.zh;
      const actionLabel = ACTION_LABELS[cp.action]?.[LANG]
        ?? ACTION_LABELS[cp.action]?.en
        ?? cp.action;
      const distText = cp.dist != null
        ? `${cp.dist}× R`
        : 'default';

      lines.push(`─── ${tt('teacher.checkpoints')} ${i + 1}/${tour.checkpoints.length} ───`);
      lines.push(`  Body: ${cp.bodyId}`);
      lines.push(`  Distance: ${distText}`);
      lines.push(`  ${tt('teacher.action')}: ${actionLabel}`);
      lines.push(`  ${tt('teacher.duration')}: ${cp.duration}s`);
      lines.push(`  Narration:`);
      // EnglishEnglishEnglish 60 EnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglish
      lines.push(this._wrapText(narration, 60, '    '));
      lines.push('');
    });

    // EnglishEnglishEnglishEnglishEnglishEnglish
    lines.push(`─── ${tt('teacher.offlineTitle')} ───`);
    lines.push(this._offlineInstructions());

    return lines.join('\n');
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglish URL。
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglish #hash）EnglishEnglish tour EnglishEnglish，
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   * @param {string} [tourId] EnglishEnglishEnglishEnglishEnglishEnglish ID；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
   * @returns {string|null} EnglishEnglish URL，EnglishEnglishEnglishEnglishEnglishEnglishEnglish null
   */
  startClassroomMode(tourId) {
    if (typeof window === 'undefined' || !window.location) return null;

    // EnglishEnglishEnglishEnglishEnglishEnglishEnglish tourId，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    let finalTourId = tourId;
    if (!finalTourId && this.tours?.isActive) {
      finalTourId = this.tours._activeTourId;
    }
    if (!finalTourId || !TOURS[finalTourId]) return null;

    // EnglishEnglishEnglishEnglish hash（EnglishEnglishEnglishEnglishEnglishEnglish），EnglishEnglish tour EnglishEnglishEnglishEnglish
    const url = new URL(window.location.href);
    url.searchParams.set('tour', finalTourId);

    const syncUrl = url.toString();

    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(syncUrl).catch(() => {});
    }

    if (this.hud) this.hud.tip(tt('teacher.classroomCopied'));

    return syncUrl;
  }

  /**
   * Q&A EnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish。
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglish。
   * @param {string} bodyId EnglishEnglishEnglishEnglishEnglishEnglish ID
   */
  askQuestion(bodyId) {
    this.select(bodyId);
    this.flyTo(bodyId);
    if (this.hud) {
      this.hud.tip(tt('teacher.askHighlight', { name: this.nameOf(bodyId) }));
    }
  }

  // ── EnglishEnglish ──────────────────────────────────────────────────────────

  /** EnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）。 */
  _wrapText(text, width, indent = '') {
    if (!text) return '';
    const chars = [...text]; // EnglishEnglishEnglishEnglish Unicode（EnglishEnglish/EnglishEnglishEnglish）
    const lines = [];
    for (let i = 0; i < chars.length; i += width) {
      lines.push(indent + chars.slice(i, i + width).join(''));
    }
    return lines.join('\n');
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。 */
  _offlineInstructions() {
    return [
      '  1. Run `npm run build` to produce static files (dist/)',
      '  2. Copy dist/ to any offline device / USB / LAN server',
      '  3. Open index.html in a browser — works fully offline',
      '  4. Ephemeris data is bundled in the code; no network needed',
      '  5. Texture assets are in public/textures/ — copy them too',
    ].join('\n');
  }
}
