// Dependencies
import { createRequire } from 'module';
import { map, isArray, sortBy, keyBy, flatten, uniqBy } from 'lodash-es';
import { standardizeHex } from '../utils.js';

// Color sets.  To be able to get JSON, we have to do
// some custom things, but in future, import should work.
const require = createRequire(import.meta.url);

// X11 color names 'http'://www.w3.org/TR/css3-color/#svg-color
// via Chroma JS
const chromaSet = require('./chroma.json');

// Color brewer (via D3)
const colorBrewerSet = require('./color-brewer.json');

// Name that color
// http://chir.ag/projects/name-that-color/
const nameThatColorSet = require('./name-that-color.json');

// Crayola Crayon colors via
// http://en.wikipedia.org/wiki/List_of_Crayola_crayon_colors
const crayolaSet = require('./crayola.json');

// Country flag colors
// 'http'://vexillology.wikia.com/wiki/'User':HansLN/National_flag_colors
const countriesSet = require('./countries.json');

// Sports (NBA, MLB, NFL, NHL, MLS, EPL)
// https://teamcolors.jim-nielsen.com/
// https://github.com/jimniels/teamcolors
const sportsMajorSet = require('./sports-major.json');

// Sports (NCAA)
// https://github.com/glidej/ncaa-team-colors
const sportsNcaaSet = require('./sports-ncaa.json');

// Custom colors
const customSet = require('./custom.json');

// Combine.  Order matters as there may be duplicates.
const colors = {
  ...nameThatColorSet,
  ...chromaSet,
  ...crayolaSet,
  ...colorBrewerSet,
  ...sportsNcaaSet,
  ...sportsMajorSet,
  ...countriesSet,
  ...customSet
};

// Make ids from colors.  Should not includ numbers.
function colorId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .trim();
}

// Make array, sort by name length
const colorsArray = sortBy(
  uniqBy(
    map(colors, (v, k) => {
      return {
        id: colorId(k),
        name: k,
        colors: isArray(v) ? v : [v]
      };
    }),
    'id'
  ),
  (c) => c.id.length
).reverse();

// Lookup
const colorLookup = keyBy(colorsArray, 'id');

// Update any references to other colors
let converted = map(colorsArray, (c) => {
  c.colors = flatten(
    map(c.colors, (color) => {
      return colorLookup[colorId(color)]
        ? colorLookup[colorId(color)].colors
        : color;
    })
  );

  return c;
});

// Standarize hex
converted = map(converted, (c) => {
  c.colors = map(c.colors, standardizeHex);
  return c;
});

export default converted;
