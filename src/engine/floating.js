// EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish：EnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglishEnglish double（Float64Array, EnglishEnglishEnglish, km）EnglishEnglish，
// EnglishEnglishEnglish mesh.position EnglishEnglish (EnglishEnglishEnglishEnglish − EnglishEnglishEnglishEnglishEnglishEnglish)。GPU EnglishEnglishEnglishEnglishEnglishEnglishEnglish，
// EnglishEnglish logarithmicDepthBuffer EnglishEnglishEnglish 10cm English 10^10 km EnglishEnglishEnglishEnglishEnglishEnglish。

import * as THREE from 'three';

export class World {
  constructor() {
    this.entities = []; // { posKm: Float64Array(3), object3D }
  }

  register(posKm, object3D) {
    const e = { posKm, object3D };
    this.entities.push(e);
    return e;
  }

  /** cameraPosKm: Float64Array(3) EnglishEnglishEnglishEnglish（EnglishEnglish/EnglishEnglish） */
  update(cameraPosKm) {
    for (const e of this.entities) {
      e.object3D.position.set(
        e.posKm[0] - cameraPosKm[0],
        e.posKm[1] - cameraPosKm[1],
        e.posKm[2] - cameraPosKm[2]
      );
    }
  }
}

const _v = new THREE.Vector3();

/** EnglishEnglishEnglishEnglishEnglish → EnglishEnglish km */
export function distKm(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/** EnglishEnglishEnglishEnglishEnglish a EnglishEnglish b EnglishEnglishEnglishEnglishEnglish（three Vector3，EnglishEnglishEnglish） */
export function dirTo(a, b, out = _v) {
  out.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  return out.normalize();
}
