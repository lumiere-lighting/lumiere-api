/**
 * Get colormap colors:
 * https://www.npmjs.com/package/colormap
 *
 * Which are colors from by matplotlib color scales, cmocean o
 * ceanographic colormaps, cosine gradients and others
 */

// Dependencies
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import colormap from 'colormap';

// Constants and helpers
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const finalColorsFile = path.join(__dirname, '..', 'colormap.json');

// Available maps
const colormaps = {
  jet: { name: 'Jet scale' },
  hsv: { name: 'HSV scale', min: 11 },
  hot: { name: 'Hot scale' },
  cool: { name: 'Cool scale' },
  spring: { name: 'Spring scale' },
  summer: { name: 'Summer scale' },
  autumn: { name: 'Autumn scale' },
  winter: { name: 'Winter scale' },
  bone: { name: 'Bone scale' },
  copper: { name: 'Copper scale' },
  greys: { name: 'Greys scale' },
  YIGnBu: { name: 'YIGnBu scale' },
  greens: { name: 'Greens scale' },
  YIOrRd: { name: 'YIOrRd scale' },
  bluered: { name: 'Blue-red scale' },
  RdBu: { name: 'RdBu scale' },
  picnic: { name: 'Picnic scale', min: 11 },
  rainbow: { name: 'Rainboq scale' },
  portland: { name: 'Portland scale' },
  blackbody: { name: 'Blackbody scale' },
  earth: { name: 'Earth scale' },
  electric: { name: 'Electric scale' },
  viridis: { name: 'Viridis scale' },
  inferno: { name: 'Inferno scale' },
  magma: { name: 'Magma scale' },
  plasma: { name: 'Plasma scale' },
  warm: { name: 'Warm scale' },
  cool: { name: 'Cool scale' },
  'rainbow-soft': { name: 'Rainbow Soft scale', min: 11 },
  bathymetry: { name: 'Bathymetry scale' },
  cdom: { name: 'CDOM scale' },
  chlorophyll: { name: 'Chlorophyll scale' },
  density: { name: 'Density scale' },
  'freesurface-blue': { name: 'Free Surface Blue scale' },
  'freesurface-red': { name: 'Free Surface Red scale' },
  oxygen: { name: 'oOygen scale' },
  par: { name: 'Par scale' },
  phase: { name: 'Phase scale' },
  salinity: { name: 'Salinity scale' },
  temperature: { name: 'Temperature scale' },
  turbidity: { name: 'Turbidity scale' },
  'velocity-blue': { name: 'Velocity Blue scale' },
  'velocity-green': { name: 'Velocity Red scale' },
  cubehelix: { name: 'Cubehelix scale', min: 16 }
};

let compiledData = {};
for (const ci in colormaps) {
  const c = colormaps[ci];
  const cMap = colormap({
    colormap: ci,
    nshades: c.min || 10,
    format: 'hex',
    alpha: 1
  });
  compiledData[c.name] = cMap;
}

// Write file
fs.writeFileSync(finalColorsFile, JSON.stringify(compiledData, null, 2));
