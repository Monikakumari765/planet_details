import { calculateObserverTelemetry, validateObserverCoordinates } from '../physics/userObserver.ts';

const PLANETS = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
const PLANET_LABELS = {
  mercury: 'Mercury',
  venus: 'Venus',
  earth: 'Earth',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  uranus: 'Uranus',
  neptune: 'Neptune',
};

function renderMarkup(root) {
  root.innerHTML = `
    <section class="observer-card" aria-label="Live user location and observer physics">
      <button id="observer-toggle" class="observer-toggle" type="button" aria-expanded="false" aria-controls="observer-panel">
        <span aria-hidden="true">📍</span> My Live Location
      </button>
      <div id="observer-panel" class="observer-panel" hidden>
        <header class="observer-header">
          <div>
            <span class="observer-eyebrow">LOCAL OBSERVER TELEMETRY</span>
            <h2>Earth Observer</h2>
          </div>
          <button id="observer-collapse" class="observer-collapse" type="button" aria-label="Collapse location panel">×</button>
        </header>
        <p class="observer-privacy">GPS is requested only when you tap the button. Coordinates stay in this browser session; horizon estimates ignore refraction and terrain.</p>
        <div class="observer-actions">
          <button id="observer-pin" class="observer-action observer-primary" type="button">📍 Pin My Live Location</button>
          <button id="observer-fly" class="observer-action" type="button" disabled>Fly to My Location</button>
        </div>
        <div class="observer-manual">
          <label>Latitude <input id="observer-latitude" type="number" min="-90" max="90" step="any" inputmode="decimal" placeholder="−90 to 90"></label>
          <label>Longitude <input id="observer-longitude" type="number" min="-180" max="180" step="any" inputmode="decimal" placeholder="−180 to 180"></label>
          <div class="observer-actions">
            <button id="observer-use-coordinates" class="observer-action" type="button">Use Coordinates</button>
            <button id="observer-default" class="observer-action observer-secondary" type="button">Use Default (0°, 0°)</button>
          </div>
        </div>
        <p id="observer-status" class="observer-status" role="status" aria-live="polite">Location not pinned.</p>
        <div class="observer-readouts" aria-live="polite">
          <div><span>Latitude / longitude</span><strong id="observer-coordinates">—</strong></div>
          <div><span>Earth spin at latitude</span><strong id="observer-speed">—</strong></div>
          <div><span>Centrifugal Δg</span><strong id="observer-gravity">—</strong></div>
          <div><span>Local sidereal time</span><strong id="observer-lst">—</strong></div>
          <label class="observer-target-label" for="observer-target">Sky target
            <select id="observer-target">
              ${PLANETS.map(id => `<option value="${id}"${id === 'mars' ? ' selected' : ''}>${PLANET_LABELS[id]}</option>`).join('')}
            </select>
          </label>
          <div class="observer-sky-readout"><span id="observer-target-name">Mars</span><strong id="observer-sky-status">Waiting for sky position</strong><small id="observer-altitude"></small></div>
        </div>
      </div>
    </section>
  `;
}

export function mountUserObserver({ onLocationChange, onFlyToLocation } = {}) {
  const root = document.getElementById('user-observer');
  if (!root) throw new Error('Missing #user-observer mount point');
  renderMarkup(root);

  const byId = id => {
    const element = root.querySelector(`#${id}`);
    if (!element) throw new Error(`Missing observer UI element #${id}`);
    return element;
  };
  const toggleButton = byId('observer-toggle');
  const panel = byId('observer-panel');
  const status = byId('observer-status');
  const pinButton = byId('observer-pin');
  const flyButton = byId('observer-fly');
  const targetSelect = byId('observer-target');
  let coordinates = null;
  let targetPlanet = 'mars';

  function setExpanded(expanded) {
    panel.hidden = !expanded;
    root.classList.toggle('expanded', expanded);
    document.documentElement.classList.toggle('observer-open', expanded);
    toggleButton.setAttribute('aria-expanded', String(expanded));
    if (expanded) {
      window.dispatchEvent(new CustomEvent('mobile-drawer-change', {
        detail: { drawer: 'observer', open: true },
      }));
    }
  }

  function showStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle('observer-error', isError);
  }

  function applyCoordinates(nextCoordinates, message) {
    const validated = validateObserverCoordinates(nextCoordinates);
    coordinates = validated;
    byId('observer-latitude').value = validated.latitude.toFixed(6);
    byId('observer-longitude').value = validated.longitude.toFixed(6);
    byId('observer-coordinates').textContent =
      `${validated.latitude.toFixed(4)}°, ${validated.longitude.toFixed(4)}°`;
    flyButton.disabled = false;
    showStatus(message);
    setExpanded(true);
    onLocationChange?.(validated);
  }

  function handleGeolocationError(error) {
    let message = 'Location could not be read. Enter coordinates manually or use the default location.';
    if (error?.code === 1) message = 'Location permission was denied. Enter coordinates manually or use the default location.';
    else if (error?.code === 2) message = 'Your location is unavailable. Enter coordinates manually or use the default location.';
    else if (error?.code === 3) message = 'Location request timed out. Try again or enter coordinates manually.';
    showStatus(message, true);
    setExpanded(true);
  }

  toggleButton.addEventListener('click', () => setExpanded(panel.hidden));
  byId('observer-collapse').addEventListener('click', () => setExpanded(false));
  pinButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showStatus('Geolocation is unavailable in this browser. Enter coordinates manually or use the default location.', true);
      setExpanded(true);
      return;
    }
    pinButton.disabled = true;
    showStatus('Requesting a one-time location fix…');
    try {
      navigator.geolocation.getCurrentPosition(
        position => {
          pinButton.disabled = false;
          try {
            applyCoordinates({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }, 'Location pinned on this device. Tap again to refresh.');
          } catch (error) {
            showStatus(error.message, true);
          }
        },
        error => {
          pinButton.disabled = false;
          handleGeolocationError(error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 },
      );
    } catch (error) {
      pinButton.disabled = false;
      handleGeolocationError(error);
    }
  });
  byId('observer-use-coordinates').addEventListener('click', () => {
    const latitudeInput = byId('observer-latitude');
    const longitudeInput = byId('observer-longitude');
    if (latitudeInput.value.trim() === '' || longitudeInput.value.trim() === '') {
      showStatus('Enter both latitude and longitude to place the observer.', true);
      return;
    }
    try {
      applyCoordinates({
        latitude: Number(latitudeInput.value),
        longitude: Number(longitudeInput.value),
      }, 'Manual coordinates pinned for this session.');
    } catch (error) {
      showStatus(error.message, true);
    }
  });
  byId('observer-default').addEventListener('click', () => {
    applyCoordinates({ latitude: 0, longitude: 0 }, 'Using the default observer location (0°, 0°).');
  });
  flyButton.addEventListener('click', () => {
    if (!coordinates) return;
    try {
      onFlyToLocation?.(coordinates);
      showStatus('Flying to your observer beacon.');
    } catch (error) {
      showStatus(error.message, true);
    }
  });
  targetSelect.addEventListener('change', () => {
    targetPlanet = targetSelect.value;
    byId('observer-target-name').textContent = PLANET_LABELS[targetPlanet];
  });

  return {
    collapse() {
      setExpanded(false);
    },
    setTargetPlanet(id) {
      if (!PLANETS.includes(id)) return;
      targetPlanet = id;
      targetSelect.value = id;
      byId('observer-target-name').textContent = PLANET_LABELS[id];
    },
    update(date, planetDirection) {
      if (!coordinates) return;
      const telemetry = calculateObserverTelemetry(coordinates, date, planetDirection);
      byId('observer-speed').textContent = `${telemetry.rotationalSpeedKmh.toFixed(1)} km/h`;
      byId('observer-gravity').textContent =
        `${telemetry.centrifugalGravityReductionMps2.toFixed(4)} m/s²`;
      byId('observer-lst').textContent = `${telemetry.localSiderealTimeHours.toFixed(2)} h`;
      if (targetPlanet === 'earth') {
        byId('observer-sky-status').textContent = 'Earth is your observer world';
        byId('observer-altitude').textContent = 'Choose another planet to check its horizon position.';
      } else if (telemetry.planetVisible === null) {
        byId('observer-sky-status').textContent = 'Sky position unavailable';
        byId('observer-altitude').textContent = '';
      } else {
        byId('observer-sky-status').textContent = telemetry.planetVisible
          ? 'Above horizon · visible now'
          : 'Below horizon';
        byId('observer-altitude').textContent =
          `Altitude ${telemetry.planetAltitudeDegrees.toFixed(1)}° · ${PLANET_LABELS[targetPlanet]}`;
      }
    },
    getCoordinates() {
      return coordinates ? { ...coordinates } : null;
    },
    getTargetPlanet() {
      return targetPlanet;
    },
  };
}
