export function mountCameraControls({ onNormalView }) {
  const root = document.getElementById('camera-controls');
  if (!root) throw new Error('Missing #camera-controls mount point');

  root.innerHTML = `
    <div class="camera-controls-pill" role="group" aria-label="Camera navigation">
      <button type="button" data-camera-action="normal-view" aria-label="Normal view" title="Normal View">⟲ Normal View</button>
    </div>
  `;

  root.querySelector('[data-camera-action="normal-view"]').addEventListener('click', onNormalView);
}
