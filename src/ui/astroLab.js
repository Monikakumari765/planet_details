import { PLANET_BASELINES, predictHabitability } from '../ai/habitabilityModel.ts';

const PRESSURE_SLIDER_MIN = 0;
const PRESSURE_SLIDER_MAX = 1000;

function pressureToSlider(pressureAtm) {
  return ((Math.log10(Math.max(pressureAtm, 0.001)) + 3) / 5) * PRESSURE_SLIDER_MAX;
}

function sliderToPressure(sliderValue) {
  const fraction = (Number(sliderValue) - PRESSURE_SLIDER_MIN) /
    (PRESSURE_SLIDER_MAX - PRESSURE_SLIDER_MIN);
  return 10 ** (-3 + fraction * 5);
}

function formatPressure(pressure) {
  if (pressure < 0.001) return '<0.001 atm';
  if (pressure < 0.01) return `${pressure.toPrecision(2)} atm`;
  if (pressure < 10) return `${pressure.toFixed(2)} atm`;
  return `${pressure.toFixed(1)} atm`;
}

function mountMarkup(root) {
  root.innerHTML = `
    <section class="ai-lab-panel" aria-label="AI Astrobiology and Planetary Habitability Lab">
      <header class="ai-lab-header">
        <div>
          <span class="ai-lab-eyebrow">SOLAR SYSTEM OBSERVATORY</span>
          <h2>AI Astrobiology Lab</h2>
        </div>
        <button class="ai-lab-collapse" type="button" aria-expanded="true" aria-controls="ai-lab-content" aria-label="Collapse habitability lab">−</button>
      </header>
      <div id="ai-lab-content" class="ai-lab-content">
        <p class="ai-lab-intro">Explore how planetary conditions shape surface habitability.</p>
        <label class="ai-lab-planet-label" for="ai-lab-planet">Planet baseline</label>
        <select id="ai-lab-planet" class="ai-lab-select">
          ${PLANET_BASELINES.map(planet => `<option value="${planet.id}"${planet.id === 'earth' ? ' selected' : ''}>${planet.name}</option>`).join('')}
        </select>

        <div class="ai-lab-controls">
          <label class="ai-lab-slider">
            <span>Orbital distance <output id="ai-lab-orbit-value"></output></span>
            <input id="ai-lab-orbit" type="range" min="0.3" max="30" step="0.001" value="1" aria-label="Orbital distance in astronomical units">
          </label>
          <label class="ai-lab-slider">
            <span>Atmospheric pressure <output id="ai-lab-pressure-value"></output></span>
            <input id="ai-lab-pressure" type="range" min="0" max="1000" step="0.001" value="600" aria-label="Atmospheric pressure from 0.001 to 100 atmospheres">
          </label>
          <label class="ai-lab-slider">
            <span>CO₂ concentration <output id="ai-lab-co2-value"></output></span>
            <input id="ai-lab-co2" type="range" min="0" max="100" step="0.001" value="0.042" aria-label="Carbon dioxide concentration from 0 to 100 percent">
          </label>
          <label class="ai-lab-slider">
            <span>O₂ / biosignature level <output id="ai-lab-oxygen-value"></output></span>
            <input id="ai-lab-oxygen" type="range" min="0" max="35" step="0.01" value="20.95" aria-label="Oxygen concentration from 0 to 35 percent">
          </label>
        </div>

        <button id="ai-lab-reset" class="ai-lab-reset" type="button">Reset to Real Planet Data</button>

        <fieldset class="ai-lab-physics-toggles">
          <legend>3D physics overlays</legend>
          <label><input id="ai-lab-habitable-zone" type="checkbox"> <span>Show Habitable Zone Ring (0.95–1.67 AU)</span></label>
          <label><input id="ai-lab-light-pulse" type="checkbox"> <span>Show Earth–Target Light-Speed Pulse</span></label>
          <label><input id="ai-lab-universe-motion" type="checkbox" checked> <span>Continuous Universe Motion</span></label>
        </fieldset>

        <section class="ai-lab-audio" aria-label="Cosmic ambient audio">
          <button id="ai-lab-cosmic-audio" type="button" aria-pressed="false">Cosmic Audio: OFF</button>
          <label class="ai-lab-slider">
            <span>Ambient volume <output id="ai-lab-cosmic-volume-value">80%</output></span>
            <input id="ai-lab-cosmic-volume" type="range" min="0" max="100" step="1" value="80" aria-label="Cosmic ambient audio volume">
          </label>
          <p id="ai-lab-cosmic-audio-status" role="status" aria-live="polite">
            Audio starts only after you turn it on. Optional MP3: /audio/interstellar-theme.mp3.
          </p>
        </section>

        <div class="ai-lab-results" aria-live="polite">
          <div class="ai-lab-temperature">
            <span id="ai-lab-temp-context">PREDICTED SURFACE TEMPERATURE</span>
            <strong><span id="ai-lab-temperature">—</span><small> K</small></strong>
          </div>
          <div class="ai-lab-metric">
            <div class="ai-lab-metric-heading"><span>AI life-support probability</span><strong id="ai-lab-probability">—%</strong></div>
            <div class="ai-lab-bar"><span id="ai-lab-probability-bar"></span></div>
          </div>
          <div class="ai-lab-metric">
            <div class="ai-lab-metric-heading"><span>Earth Similarity Index</span><strong id="ai-lab-esi">—</strong></div>
            <div class="ai-lab-bar ai-lab-bar-esi"><span id="ai-lab-esi-bar"></span></div>
          </div>
          <div class="ai-lab-classification"><span id="ai-lab-classification-dot"></span><strong id="ai-lab-classification">—</strong></div>
          <p class="ai-lab-twin">Closest catalog match <strong id="ai-lab-twin">—</strong></p>
          <p id="ai-lab-diagnostic" class="ai-lab-diagnostic"></p>
        </div>

        <p class="ai-lab-caveat">Deterministic offline MLP for education, not validated life detection. Gas-giant temperatures refer to cloud-top levels; exoplanet matches are approximate.</p>
      </div>
    </section>
  `;
}

export function mountAstrobiologyLab() {
  const root = document.getElementById('ai-astro-lab');
  if (!root) throw new Error('Missing #ai-astro-lab mount point');
  mountMarkup(root);

  const byId = id => {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing astrobiology lab element #${id}`);
    return element;
  };
  const planetSelect = byId('ai-lab-planet');
  const orbitSlider = byId('ai-lab-orbit');
  const pressureSlider = byId('ai-lab-pressure');
  const co2Slider = byId('ai-lab-co2');
  const oxygenSlider = byId('ai-lab-oxygen');
  const habitableZoneToggle = byId('ai-lab-habitable-zone');
  const lightPulseToggle = byId('ai-lab-light-pulse');
  const universeMotionToggle = byId('ai-lab-universe-motion');
  const cosmicAudioToggle = byId('ai-lab-cosmic-audio');
  const cosmicVolumeSlider = byId('ai-lab-cosmic-volume');
  const cosmicVolumeValue = byId('ai-lab-cosmic-volume-value');
  const cosmicAudioStatus = byId('ai-lab-cosmic-audio-status');
  const collapseButton = root.querySelector('.ai-lab-collapse');
  if (!collapseButton) throw new Error('Missing astrobiology lab collapse button');
  const setCollapsed = collapsed => {
    root.classList.toggle('collapsed', collapsed);
    collapseButton.setAttribute('aria-expanded', String(!collapsed));
    collapseButton.setAttribute(
      'aria-label',
      collapsed ? 'Expand habitability lab' : 'Collapse habitability lab',
    );
    collapseButton.textContent = collapsed ? '+' : '−';
  };
  if (window.matchMedia('(max-width: 768px)').matches) setCollapsed(true);
  const sliders = [orbitSlider, pressureSlider, co2Slider, oxygenSlider];
  let realPlanetSliderValues = null;
  let lastSelectedPlanetId = planetSelect.value;

  const selectedPlanet = () =>
    PLANET_BASELINES.find(planet => planet.id === planetSelect.value) ?? PLANET_BASELINES[2];

  function updatePhysicsOverlays() {
    window.dispatchEvent(new CustomEvent('terraform-physics-overlays-change', {
      detail: {
        showHabitableZone: habitableZoneToggle.checked,
        showLightPulse: lightPulseToggle.checked,
        targetPlanetId: selectedPlanet().id,
      },
    }));
  }

  function updateUniverseMotion() {
    window.dispatchEvent(new CustomEvent('continuous-universe-motion-change', {
      detail: { enabled: universeMotionToggle.checked },
    }));
  }

  function applyAtmosphereVisual(planet, scenario, predictedTempK, isReset = false) {
    window.dispatchEvent(new CustomEvent('terraform-atmosphere-update', {
      detail: {
        planetName: planet.id,
        pressureAtm: scenario.pressureAtm,
        co2Pct: scenario.co2Pct,
        o2Pct: scenario.oxygenPct,
        predictedTempK,
        isReset,
      },
    }));
  }

  function resetControls({ restoreVisual = false } = {}) {
    const planet = selectedPlanet();
    orbitSlider.value = String(planet.orbitalAU);
    pressureSlider.value = String(pressureToSlider(planet.pressureAtm));
    co2Slider.value = String(planet.co2Pct);
    oxygenSlider.value = String(planet.oxygenPct);
    realPlanetSliderValues = {
      orbit: orbitSlider.value,
      pressure: pressureSlider.value,
      co2: co2Slider.value,
      oxygen: oxygenSlider.value,
    };
    const prediction = render({ updateAtmosphere: !restoreVisual });
    if (restoreVisual) {
      applyAtmosphereVisual(planet, prediction.scenario, prediction.predictedTempK, true);
    }
  }

  function render({ updateAtmosphere = true } = {}) {
    const planet = selectedPlanet();
    const scenario = {
      orbitalAU: orbitSlider.value === realPlanetSliderValues.orbit
        ? planet.orbitalAU
        : Number(orbitSlider.value),
      pressureAtm: pressureSlider.value === realPlanetSliderValues.pressure
        ? planet.pressureAtm
        : sliderToPressure(pressureSlider.value),
      co2Pct: co2Slider.value === realPlanetSliderValues.co2
        ? planet.co2Pct
        : Number(co2Slider.value),
      oxygenPct: oxygenSlider.value === realPlanetSliderValues.oxygen
        ? planet.oxygenPct
        : Number(oxygenSlider.value),
      nitrogenPct: Math.max(
        0,
        planet.nitrogenPct -
          (Number(co2Slider.value) - planet.co2Pct) -
          (Number(oxygenSlider.value) - planet.oxygenPct),
      ),
    };
    const prediction = predictHabitability(planet, scenario);

    byId('ai-lab-orbit-value').textContent = `${scenario.orbitalAU.toFixed(2)} AU`;
    byId('ai-lab-pressure-value').textContent = formatPressure(scenario.pressureAtm);
    byId('ai-lab-co2-value').textContent = `${scenario.co2Pct.toFixed(2)}%`;
    byId('ai-lab-oxygen-value').textContent = `${scenario.oxygenPct.toFixed(2)}%`;
    byId('ai-lab-temperature').textContent = String(Math.round(prediction.temperatureK));
    byId('ai-lab-temp-context').textContent = planet.temperatureContext === 'surface'
      ? 'PREDICTED SURFACE TEMPERATURE'
      : 'PREDICTED CLOUD-TOP REFERENCE TEMPERATURE';
    byId('ai-lab-probability').textContent =
      `${Math.round(prediction.lifeSupportProbability * 100)}%`;
    byId('ai-lab-probability-bar').style.width =
      `${prediction.lifeSupportProbability * 100}%`;
    byId('ai-lab-esi').textContent = prediction.esi.toFixed(2);
    byId('ai-lab-esi-bar').style.width = `${prediction.esi * 100}%`;
    byId('ai-lab-classification').textContent = prediction.classification;
    byId('ai-lab-classification-dot').dataset.classification =
      prediction.classification.toLowerCase().replaceAll(' ', '-');
    byId('ai-lab-twin').textContent = prediction.closestExoplanet;
    byId('ai-lab-diagnostic').textContent = prediction.diagnostic;
    if (updateAtmosphere) {
      applyAtmosphereVisual(planet, scenario, prediction.temperatureK);
    }
    return { scenario, predictedTempK: prediction.temperatureK };
  }

  collapseButton.addEventListener('click', () => {
    setCollapsed(!root.classList.contains('collapsed'));
  });
  root.addEventListener('keydown', event => event.stopPropagation(), true);
  root.addEventListener('keyup', event => event.stopPropagation(), true);
  root.addEventListener('wheel', event => event.stopPropagation(), { capture: true, passive: true });

  planetSelect.addEventListener('change', () => {
    const previousPlanet = PLANET_BASELINES.find(planet => planet.id === lastSelectedPlanetId);
    if (previousPlanet) {
      applyAtmosphereVisual(previousPlanet, {
        pressureAtm: previousPlanet.pressureAtm,
        co2Pct: previousPlanet.co2Pct,
        oxygenPct: previousPlanet.oxygenPct,
      }, previousPlanet.referenceTemperatureK, true);
    }
    lastSelectedPlanetId = planetSelect.value;
    resetControls();
    updatePhysicsOverlays();
  });
  sliders.forEach(slider => slider.addEventListener('input', render));
  habitableZoneToggle.addEventListener('change', updatePhysicsOverlays);
  lightPulseToggle.addEventListener('change', updatePhysicsOverlays);
  universeMotionToggle.addEventListener('change', updateUniverseMotion);
  cosmicAudioToggle.addEventListener('click', () => {
    const enabled = cosmicAudioToggle.getAttribute('aria-pressed') !== 'true';
    cosmicAudioToggle.disabled = true;
    cosmicAudioStatus.textContent = enabled ? 'Starting ambient audio…' : 'Fading ambient audio…';
    window.dispatchEvent(new CustomEvent('cosmic-audio-toggle', { detail: { enabled } }));
  });
  cosmicVolumeSlider.addEventListener('input', () => {
    const volume = Number(cosmicVolumeSlider.value) / 100;
    cosmicVolumeValue.textContent = `${Math.round(volume * 100)}%`;
    window.dispatchEvent(new CustomEvent('cosmic-audio-volume-change', {
      detail: { volume },
    }));
  });
  window.addEventListener('cosmic-audio-state-change', event => {
    const { enabled, error } = event.detail ?? {};
    if (typeof enabled !== 'boolean') {
      throw new TypeError('cosmic-audio-state-change requires an enabled boolean');
    }
    cosmicAudioToggle.setAttribute('aria-pressed', String(enabled));
    cosmicAudioToggle.textContent = `Cosmic Audio: ${enabled ? 'ON' : 'OFF'}`;
    cosmicAudioToggle.disabled = false;
    cosmicAudioStatus.textContent = error ||
      (enabled ? 'Ambient soundscape is playing.' : 'Ambient audio is off.');
  });
  byId('ai-lab-reset').addEventListener('click', () => resetControls({ restoreVisual: true }));
  resetControls();
  updatePhysicsOverlays();
  updateUniverseMotion();
}
