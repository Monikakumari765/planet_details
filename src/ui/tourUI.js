// EnglishEnglish UI（#39/#40 EnglishEnglishEnglish）：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish + EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
// TourSystem/Narrator EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish DOM。

import { LANG } from './i18n.js';

const UI = {
  'tour.group': { en: '🎬 Tours' },
  'tour.exit': { en: 'Exit tour' },
  'tour.prev': { en: 'Previous' },
  'tour.next': { en: 'Next' },
  'tour.stops': { en: '{n} stops' },
};

function tt(key, vars) {
  const e = UI[key];
  let s = e ? (e[LANG] ?? e.en ?? e.zh ?? key) : key;
  if (vars) for (const k in vars) s = s.replaceAll('{' + k + '}', vars[k]);
  return s;
}

/**
 * EnglishEnglishEnglishEnglish UI。
 * @param {Object} tourSystem TourSystem EnglishEnglish
 * @param {Object} narrator   Narrator EnglishEnglish（TTS；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）
 * @returns {{ ttsOn: boolean }} EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
 */
export function buildTourUI(tourSystem, narrator) {
  const state = { ttsOn: true };

  // ── EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish ──
  const dirBody = document.getElementById('dir-body');
  if (dirBody) {
    const det = document.createElement('details');
    const sum = document.createElement('summary');
    sum.textContent = tt('tour.group');
    det.appendChild(sum);
    for (const tour of tourSystem.tours) {
      const btn = document.createElement('button');
      btn.className = 'dir-item';
      btn.innerHTML = `${tour.title} <span>${tt('tour.stops', { n: tour.checkpointCount })}</span>`;
      btn.addEventListener('click', () => {
        // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish iOS Safari English TTS EnglishEnglishEnglishEnglish
        tourSystem.start(tour.id);
        refreshBar();
      });
      det.appendChild(btn);
    }
    dirBody.appendChild(det);
  }

  // ── EnglishEnglishEnglishEnglishEnglish（EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish）──
  const bar = document.createElement('div');
  bar.id = 'tour-bar';
  bar.style.display = 'none';
  bar.innerHTML = `
    <span id="tour-bar-title"></span>
    <button id="tour-bar-prev" title="${tt('tour.prev')}">⏮</button>
    <button id="tour-bar-next" title="${tt('tour.next')}">⏭</button>
    ${narrator?.supported ? '<button id="tour-bar-tts" title="TTS">🔊</button>' : ''}
    <button id="tour-bar-exit" title="${tt('tour.exit')}">✕</button>`;
  document.body.appendChild(bar);

  bar.querySelector('#tour-bar-prev').addEventListener('click', () => { tourSystem.prev(); refreshBar(); });
  bar.querySelector('#tour-bar-next').addEventListener('click', () => { tourSystem.next(); refreshBar(); });
  bar.querySelector('#tour-bar-exit').addEventListener('click', () => {
    tourSystem.skip();
    narrator?.stop?.();
    refreshBar();
  });
  bar.querySelector('#tour-bar-tts')?.addEventListener('click', (e) => {
    state.ttsOn = !state.ttsOn;
    e.target.textContent = state.ttsOn ? '🔊' : '🔇';
    if (!state.ttsOn) narrator?.stop?.();
  });

  function refreshBar() {
    const cur = tourSystem.current;
    if (!tourSystem.isActive || !cur) {
      bar.style.display = 'none';
      return;
    }
    bar.style.display = 'flex';
    const total = cur.checkpoint ? tourSystem.tours.find((x) => x.title === cur.title)?.checkpointCount : null;
    bar.querySelector('#tour-bar-title').textContent =
      `${cur.title} · ${tourSystem.checkpointIndex + 1}${total ? '/' + total : ''}`;
  }

  // EnglishEnglishEnglishEnglishEnglishEnglish/EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
  setInterval(refreshBar, 800);
  return state;
}
