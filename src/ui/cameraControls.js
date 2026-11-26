export function mountCameraControls({ onZoomIn, onZoomOut, onNormalView }) {
  const root = document.getElementById('camera-controls');
  if (!root) throw new Error('Missing #camera-controls mount point');

  root.innerHTML = `
    <div class="camera-controls-pill" role="group" aria-label="Camera navigation">
      <button type="button" data-camera-action="zoom-in" aria-label="Zoom in" title="Zoom In">＋ Zoom In</button>
      <button type="button" data-camera-action="zoom-out" aria-label="Zoom out" title="Zoom Out">− Zoom Out</button>
      <button type="button" data-camera-action="normal-view" aria-label="Normal view" title="Normal View">⟲ Normal View</button>
    </div>
  `;

  root.querySelector('[data-camera-action="zoom-in"]').addEventListener('click', onZoomIn);
  root.querySelector('[data-camera-action="zoom-out"]').addEventListener('click', onZoomOut);
  root.querySelector('[data-camera-action="normal-view"]').addEventListener('click', onNormalView);
}
