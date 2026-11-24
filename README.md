<div align="center">

# PLANETS MOTION

### A real-scale journey through our Solar System

Explore planetary orbits, descend to the surface, and travel outward to the edge of the Solar System — in your browser.

<p>
  <a href="https://github.com/Monikakumari765/PLANETS-DETAIL"><img src="https://img.shields.io/badge/PROJECT-PLANETS--DETAIL-172033?style=flat-square&logo=github&logoColor=white" alt="GitHub repository"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/LICENSE-MIT-52796f?style=flat-square" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/THREE.JS-0.165-222?style=flat-square&logo=three.js&logoColor=white" alt="Three.js 0.165">
  <img src="https://img.shields.io/badge/RENDERING-WebGL2-243b53?style=flat-square" alt="WebGL2">
</p>

**Maintained by Monika Kumari**

</div>

<p align="center">
  <img src="./public/preview.png" alt="Planets Motion: a detailed view of Earth against a star-filled background" width="100%">
</p>

<p align="center"><sub>One browser. A whole Solar System to explore.</sub></p>

---

## Explore

Planets Motion is an interactive 3D astronomy experience built around a true 1:1 kilometre-scale Solar System. It combines sampled NASA/JPL states with analytical orbital models, so you can move between system-wide views and supported planetary surfaces.

| Discover | Experience |
| --- | --- |
| Planets, moons, comets, trans-Neptunian objects, and spacecraft | Orbit, fly freely, land, and walk on supported worlds |
| Rings, atmospheres, procedural surface detail, and optional terrain | A real-time simulation with time controls and touch support |
| English and Chinese entry points | Runs in a modern browser with WebGL2 |

### At a glance

| Parameter | Project details |
| --- | --- |
| Scale | 1:1; world distances are represented in kilometres |
| Reach | From close-up surface exploration to the distant Oort Cloud |
| Orbital data | Sampled NASA/JPL ephemerides where available, with analytical fallbacks |
| Rendering | Three.js 0.165, WebGL2, and GLSL |
| Interface | English and Chinese |

> Orbital precision depends on the body, epoch, and available sampled data. See the project documentation and verification tools for the applicable reference ranges.

## Get started

**Requirements:** Node.js and npm.

```bash
git clone https://github.com/Monikakumari765/PLANETS-DETAIL.git
cd PLANETS-DETAIL
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

### Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Preview a production build |
| `npm test` | Run the offline Node.js test suite |
| `npm run verify` | Compare ephemerides with NASA/JPL Horizons (requires internet) |

## Data and assets

Large downloaded or generated assets are intentionally excluded from this repository to keep it lightweight. This includes `public/textures/`, `public/dem/`, and `public/data/ephemeris/`. Without those files, the application uses procedural rendering and analytical ephemeris fallbacks where available.

Regenerate optional data when needed:

```bash
npm run fetch-textures
npm run fetch-dem
npm run fetch-ephemeris
```

These commands require an internet connection and can download substantial data.

## Project and attribution

This repository is maintained by **Monika Kumari**. The original MIT license and copyright notices are preserved in [LICENSE](./LICENSE); third-party data and asset acknowledgements are listed in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

NASA/JPL ephemeris services and public planetary science data are credited to their respective providers.
