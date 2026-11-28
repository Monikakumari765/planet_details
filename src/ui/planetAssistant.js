import { answerPlanetQuestion } from '../ai/planetAssistant.ts';
import { isVoiceEnabled, setVoiceEnabled, speakText, stopSpeaking } from '../ai/voiceNarrator.ts';

const STARTERS = ['Live Mars distance?', 'Could life exist on Europa?', 'Compare Earth vs Venus', 'Why is Saturn tilted?'];

export function mountPlanetAssistant(flyTo) {
  const root = document.getElementById('ai-planet-assistant');
  if (!root) return null;
  root.innerHTML = `
    <button class="planet-guide-toggle" type="button" aria-expanded="false" aria-controls="planet-guide-panel">✦ AI Planet Guide</button>
    <section class="planet-guide-panel" id="planet-guide-panel" aria-label="AI Planetary Knowledge Assistant" hidden>
      <header class="planet-guide-header"><div><span class="planet-guide-kicker">DEEP SPACE · KNOWLEDGE SYSTEM</span><h2>Planetary Guide</h2></div><div class="planet-guide-header-actions"><button class="planet-guide-voice" type="button" aria-pressed="true"></button><button class="planet-guide-close" type="button" aria-label="Close assistant">×</button></div></header>
      <div class="planet-guide-messages" aria-live="polite"><div class="planet-guide-message assistant">Ask about worlds, weather, orbital physics, or habitability across the Solar System.</div></div>
      <div class="planet-guide-starters" aria-label="Starter questions"></div>
      <button class="planet-guide-fly" type="button" hidden></button>
      <form class="planet-guide-form"><input aria-label="Ask a planetary science question" placeholder="Ask the planetary guide…" autocomplete="off" /><button type="submit">Send</button></form>
    </section>`;

  const toggle = root.querySelector('.planet-guide-toggle');
  const panel = root.querySelector('.planet-guide-panel');
  const messages = root.querySelector('.planet-guide-messages');
  const form = root.querySelector('.planet-guide-form');
  const input = form.querySelector('input');
  const fly = root.querySelector('.planet-guide-fly');
  const voiceButton = root.querySelector('.planet-guide-voice');
  const updateVoiceButton = () => {
    const enabled = isVoiceEnabled();
    voiceButton.textContent = enabled ? '🔊 Voice: ON' : '🔇 Voice: OFF';
    voiceButton.setAttribute('aria-pressed', String(enabled));
    voiceButton.title = enabled ? 'Turn voice narration off' : 'Turn voice narration on';
  };
  updateVoiceButton();
  const setOpen = (open) => {
    if (!open) stopSpeaking();
    root.classList.toggle('open', open);
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) input.focus({ preventScroll: true });
  };
  toggle.addEventListener('click', () => setOpen(!root.classList.contains('open')));
  root.querySelector('.planet-guide-close').addEventListener('click', () => setOpen(false));
  voiceButton.addEventListener('click', () => {
    setVoiceEnabled(!isVoiceEnabled());
    updateVoiceButton();
  });
  root.querySelector('.planet-guide-starters').innerHTML = STARTERS.map((q) => `<button type="button" class="planet-guide-chip">${q}</button>`).join('');

  function ask(question) {
    const clean = question.trim();
    if (!clean) return;
    const user = document.createElement('div');
    user.className = 'planet-guide-message user';
    user.textContent = clean;
    const answer = answerPlanetQuestion(clean);
    const response = document.createElement('div');
    response.className = 'planet-guide-message assistant';
    const replyText = document.createElement('span');
    replyText.className = 'planet-guide-reply-text';
    replyText.textContent = answer.reply;
    const replay = document.createElement('button');
    replay.type = 'button';
    replay.className = 'planet-guide-replay';
    replay.textContent = '🔈 Replay';
    replay.setAttribute('aria-label', 'Replay this answer');
    replay.addEventListener('click', () => speakText(answer.reply));
    response.append(replyText, replay);
    messages.append(user, response);
    if (isVoiceEnabled()) speakText(answer.reply);
    messages.scrollTop = messages.scrollHeight;
    fly.hidden = !answer.targetPlanet;
    if (answer.targetPlanet) {
      const name = answer.targetPlanet[0].toUpperCase() + answer.targetPlanet.slice(1);
      fly.textContent = `🚀 Fly Camera to ${name}`;
      fly.onclick = () => { flyTo(answer.targetPlanet); };
    }
    root.querySelector('.planet-guide-followups')?.remove();
    const followups = document.createElement('div');
    followups.className = 'planet-guide-followups';
    for (const prompt of answer.followUps.slice(0, 4)) {
      const chip = document.createElement('button');
      chip.type = 'button'; chip.className = 'planet-guide-chip'; chip.textContent = prompt;
      chip.addEventListener('click', () => ask(prompt));
      followups.append(chip);
    }
    messages.append(followups);
    messages.scrollTop = messages.scrollHeight;
  }

  root.querySelectorAll('.planet-guide-starters .planet-guide-chip').forEach((chip) => chip.addEventListener('click', () => ask(chip.textContent)));
  form.addEventListener('submit', (event) => { event.preventDefault(); ask(input.value); input.value = ''; });
  return { collapse: () => setOpen(false) };
}
