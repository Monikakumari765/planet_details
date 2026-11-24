// EnglishEnglishEnglishEnglishEnglishEnglish（#41）：EnglishEnglish Web Speech API (speechSynthesis) EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
//
// EnglishEnglishEnglishEnglish：
// - EnglishEnglishEnglishEnglishEnglish API，EnglishEnglishEnglish；EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（TourSystem English HUD tip EnglishEnglishEnglish）
// - English speech selection uses the en-US BCP-47 voice tag
// - EnglishEnglishEnglishEnglishEnglish：iOS Safari EnglishEnglish speak() EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish；
//   Chrome EnglishEnglishEnglish voices EnglishEnglishEnglishEnglish，EnglishEnglishEnglish voiceschanged EnglishEnglish
// - EnglishEnglishEnglishEnglish（0.1–10），EnglishEnglish 1.0；EnglishEnglishEnglishEnglishEnglishEnglish 0.9（EnglishEnglish，EnglishEnglishEnglishEnglish）

import { LANG } from './i18n.js';

/** EnglishEnglishEnglishEnglishEnglishEnglish → BCP-47 EnglishEnglishEnglishEnglish（speechSynthesis EnglishEnglish） */
const LANG_TO_BCP47 = {
  en: 'en-US',
};

/**
 * EnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish speechSynthesis，EnglishEnglish speak/stop/pause/resume EnglishEnglish。
 *
 * EnglishEnglishEnglishEnglish：
 *   const narrator = new Narrator();
 *   if (narrator.supported) narrator.speak('EnglishEnglish，EnglishEnglish', 'zh');
 *
 * EnglishEnglishEnglishEnglishEnglish：EnglishEnglish speak() EnglishEnglishEnglishEnglishEnglishEnglishEnglish（click/touchend）EnglishEnglishEnglishEnglishEnglishEnglishEnglish，
 * EnglishEnglish iOS Safari EnglishEnglishEnglishEnglishEnglish。EnglishEnglish speak EnglishEnglishEnglishEnglishEnglishEnglish。
 */
export class Narrator {
  constructor() {
    // English Node/SSR EnglishEnglishEnglish window EnglishEnglishEnglish，EnglishEnglishEnglishEnglish
    this._synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this._utteranceCtor = typeof SpeechSynthesisUtterance !== 'undefined' ? SpeechSynthesisUtterance : null;
    this._voices = [];
    this._rate = 1;
    this._volume = 1;
    this._pitch = 1;
    this._currentUtterance = null;
    this._paused = false;

    if (this._synth) {
      this._loadVoices();
      // Chrome / Edge EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglish getVoices() EnglishEnglishEnglish，
      // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish voiceschanged EnglishEnglish。EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
      this._synth.onvoiceschanged = () => this._loadVoices();
    }
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglish Web Speech API。 */
  get supported() {
    return !!this._synth && !!this._utteranceCtor;
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglish。 */
  get speaking() {
    return this._synth ? this._synth.speaking && !this._synth.paused : false;
  }

  /** EnglishEnglishEnglishEnglishEnglish。 */
  get paused() {
    return this._paused;
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglish。 */
  get voices() {
    return this._voices;
  }

  /**
   * EnglishEnglishEnglishEnglish。
   * @param {string} text EnglishEnglishEnglishEnglish
   * @param {string} [lang] EnglishEnglishEnglishEnglish（zh/en/es/ja/fr/de/ru），EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
   */
  speak(text, lang = LANG) {
    if (!this.supported || !text) return;
    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish（speechSynthesis EnglishEnglishEnglishEnglishEnglishEnglishEnglish，EnglishEnglish cancel EnglishEnglish）
    this.stop();

    const utterance = new this._utteranceCtor(text);
    utterance.lang = LANG_TO_BCP47[lang] || lang || 'en-US';
    utterance.rate = this._rate;
    utterance.volume = this._volume;
    utterance.pitch = this._pitch;

    // EnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglish BCP-47，EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    const voice = this._findVoice(utterance.lang);
    if (voice) utterance.voice = voice;

    // EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish
    utterance.onend = () => {
      if (this._currentUtterance === utterance) this._currentUtterance = null;
      this._paused = false;
    };
    utterance.onerror = () => {
      if (this._currentUtterance === utterance) this._currentUtterance = null;
      this._paused = false;
    };

    this._currentUtterance = utterance;
    this._paused = false;
    this._synth.speak(utterance);
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。 */
  stop() {
    if (this._synth) this._synth.cancel();
    this._currentUtterance = null;
    this._paused = false;
  }

  /** EnglishEnglishEnglishEnglish（English resume EnglishEnglish）。 */
  pause() {
    if (this._synth && this._synth.speaking && !this._synth.paused) {
      this._synth.pause();
      this._paused = true;
    }
  }

  /** EnglishEnglishEnglishEnglishEnglishEnglishEnglish。 */
  resume() {
    if (this._synth && this._synth.paused) {
      this._synth.resume();
      this._paused = false;
    }
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglish。
   * @param {number} rate 0.1（EnglishEnglish）– 10（EnglishEnglish），EnglishEnglish 1.0。EnglishEnglishEnglishEnglishEnglishEnglish 0.85–1.0。
   */
  setRate(rate) {
    this._rate = Math.max(0.1, Math.min(10, rate));
  }

  /**
   * EnglishEnglishEnglishEnglish。
   * @param {number} volume 0（EnglishEnglish）– 1（EnglishEnglish），EnglishEnglish 1.0。
   */
  setVolume(volume) {
    this._volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * EnglishEnglishEnglishEnglish。
   * @param {number} pitch 0（EnglishEnglish）– 2（EnglishEnglish），EnglishEnglish 1.0。
   */
  setPitch(pitch) {
    this._pitch = Math.max(0, Math.min(2, pitch));
  }

  // ── EnglishEnglish ──────────────────────────────────────────────────────────

  _loadVoices() {
    if (this._synth) {
      this._voices = this._synth.getVoices() || [];
    }
  }

  /**
   * EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish。
   * Match exact BCP-47 voice tags first, then match by language prefix.
   * @param {string} langTag BCP-47 language tag
   * @returns {SpeechSynthesisVoice|null}
   */
  _findVoice(langTag) {
    if (!this._voices.length) return null;
    const tag = langTag.toLowerCase();
    // Exact match
    let voice = this._voices.find((v) => v.lang.toLowerCase() === tag);
    if (voice) return voice;
    const prefix = tag.split('-')[0];
    voice = this._voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    return voice || null;
  }
}
