let voiceEnabled = true;
let preferredVoice: SpeechSynthesisVoice | null = null;
export let lastSpokenText = '';
let voiceState: 'speaking' | 'paused' | 'idle' = 'idle';
let activeUtterance: SpeechSynthesisUtterance | null = null;
const voiceStateListeners = new Set<(state: 'speaking' | 'paused' | 'idle') => void>();
export const WELCOME_VOICE_PROMPT = 'Ask about worlds, weather, orbital physics, or habitability across the Solar System.';

function emitVoiceState(state: 'speaking' | 'paused' | 'idle') {
  voiceState = state;
  for (const listener of voiceStateListeners) listener(state);
}

function speechApi(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
    ? window.speechSynthesis
    : null;
}

function chooseVoice() {
  const synth = speechApi();
  if (!synth) return;
  const voices = synth.getVoices();
  if (!voices.length) return;

  const favorites = ['samantha', 'google uk english female', 'microsoft zira', 'victoria', 'karen', 'moira', 'ava', 'siri'];
  const english = voices.filter((voice) => /^en([_-]|$)/i.test(voice.lang));
  for (const name of favorites) {
    const found = english.find((voice) => voice.name.toLowerCase().includes(name));
    if (found) { preferredVoice = found; return; }
  }
  const markedFemale = english.find((voice) => /female|woman/i.test(voice.name));
  if (markedFemale) { preferredVoice = markedFemale; return; }
  preferredVoice = english.find((voice) => voice.default && /en-US|en-GB/i.test(voice.lang))
    ?? english.find((voice) => /en-US|en-GB/i.test(voice.lang))
    ?? english.find((voice) => voice.default)
    ?? english[0]
    ?? null;
}

if (typeof window !== 'undefined') {
  const synth = speechApi();
  synth?.addEventListener?.('voiceschanged', chooseVoice);
  // Some browsers populate the list asynchronously after the first call.
  chooseVoice();
  if (synth && !synth.getVoices().length) setTimeout(chooseVoice, 250);
}

export function cleanSpeechText(text: string): string {
  return text
    .replace(/CO₂/gi, 'carbon dioxide')
    .replace(/N₂/gi, 'nitrogen')
    .replace(/O₂/gi, 'oxygen')
    .replace(/H₂O/gi, 'water')
    .replace(/H₂/gi, 'hydrogen')
    .replace(/NH₃/gi, 'ammonia')
    .replace(/SO₂/gi, 'sulfur dioxide')
    .replace(/O₃/gi, 'ozone')
    .replace(/\bHe\b/g, 'helium')
    .replace(/\bAr\b/g, 'argon')
    .replace(/CH₄/gi, 'methane')
    .replace(/CO\b/gi, 'carbon monoxide')
    .replace(/km\/s²/gi, 'kilometers per second squared')
    .replace(/m\/s²/gi, 'meters per second squared')
    .replace(/km\/s/gi, 'kilometers per second')
    .replace(/m\/s/gi, 'meters per second')
    .replace(/°C/gi, ' degrees Celsius')
    .replace(/°/g, ' degrees ')
    .replace(/μs\s*\/\s*day/gi, 'microseconds per day')
    .replace(/\bAU\b/g, 'astronomical units')
    .replace(/\bkm\b/gi, 'kilometers')
    .replace(/\bkg\b/gi, 'kilograms')
    .replace(/%/g, ' percent')
    .replace(/(\d+(?:\.\d+)?)e([+-]?\d+)/gi, (_, value: string, exponent: string) => `${value} times ten to the ${exponent.startsWith('-') ? 'minus ' : ''}${exponent.replace(/^[+-]/, '')}`)
    .replace(/m²|squared|²/g, 'squared')
    .replace(/³/g, 'cubed')
    .replace(/Δ/g, 'delta ')
    .replace(/Φ/g, 'phi')
    .replace(/σ/g, 'sigma')
    .replace(/≈|~/g, 'about ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function speakText(text: string): void {
  const synth = speechApi();
  if (!voiceEnabled || !synth || !text.trim()) return;
  synth.cancel();
  activeUtterance = null;
  lastSpokenText = text;
  chooseVoice();
  const utterance = new SpeechSynthesisUtterance(cleanSpeechText(text));
  if (preferredVoice) utterance.voice = preferredVoice;
  utterance.lang = preferredVoice?.lang || 'en-US';
  utterance.pitch = 1.06;
  utterance.rate = 0.98;
  activeUtterance = utterance;
  utterance.onend = () => { if (activeUtterance === utterance) { activeUtterance = null; emitVoiceState('idle'); } };
  utterance.onerror = () => { if (activeUtterance === utterance) { activeUtterance = null; emitVoiceState('idle'); } };
  synth.speak(utterance);
  emitVoiceState('speaking');
}

export function stopSpeaking(): void {
  speechApi()?.cancel();
  activeUtterance = null;
  emitVoiceState('idle');
}

export function isVoiceEnabled(): boolean {
  return voiceEnabled;
}

export function setVoiceEnabled(enabled: boolean): void {
  const wasEnabled = voiceEnabled;
  voiceEnabled = Boolean(enabled);
  if (!voiceEnabled) {
    stopSpeaking();
  } else if (!wasEnabled && lastSpokenText) {
    // Turning voice back on should audibly resume the guide experience; cancel()
    // stopped the old utterance, so replay the most recent answer from its start.
    speakText(lastSpokenText);
  }
}

export function onVoiceStateChange(callback: (state: 'speaking' | 'paused' | 'idle') => void): () => void {
  voiceStateListeners.add(callback);
  callback(voiceState);
  return () => voiceStateListeners.delete(callback);
}

export function togglePlayPauseSpeech(): void {
  const synth = speechApi();
  if (!synth) { emitVoiceState('idle'); return; }
  if (synth.speaking && !synth.paused) {
    synth.pause();
    emitVoiceState('paused');
    return;
  }
  if (synth.paused) {
    synth.resume();
    emitVoiceState('speaking');
    return;
  }
  // An explicit play action also re-enables voice after the user turned autoplay off.
  voiceEnabled = true;
  speakText(lastSpokenText || WELCOME_VOICE_PROMPT);
}

export function getLastSpokenText(): string {
  return lastSpokenText;
}
