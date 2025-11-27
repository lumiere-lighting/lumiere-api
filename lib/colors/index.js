// Dependencies
import debugSetup from 'debug';
import { createRequire } from 'module';
import {
  size,
  map,
  isArray,
  sortBy,
  orderBy,
  keyBy,
  flatten,
  uniqBy,
  filter
} from 'lodash-es';
import { standardizeHex } from '../utils.js';
import { colornames } from 'color-name-list';

// Debugger
const debug = debugSetup('lumiere:api-server:colors');

// Color sets.  To be able to get JSON, we have to do
// some custom things, but in future, import should work.
const require = createRequire(import.meta.url);

// COLOR NAME RULES
//
// - Don't add names with "random" in them.

// From the color-name package
// https://github.com/meodai/color-names
const namedColorsSet = {};
colornames.forEach((c) => {
  namedColorsSet[c.name] = c.hex;
});

// From the book "A Dictionary of Colour Combinations" compiled by Sanzo Wada
// via https://github.com/mattdesl/dictionary-of-colour-combinations
// Note that there are some basics like "black" here that we want to overwrite.
const sanzoWadaSet = require('./sanzo-wada.json');

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

// ColourLovers.com top palettes
// via https://github.com/Jam3/nice-color-palettes
const colourLoversPalettesSet = require('./colour-lovers-palettes.json');

// Pokemon
// via PokeAPI and customer scraper
const pokemonSet = require('./pokemon.json');

// Vega
// via https://github.com/vega/vega-scale/blob/master/src/palettes.js
const vegaSet = require('./vega.json');

// Programming languages
// via https://github.com/simonecorsi/github-languages-colors
const programmingLanguagesSet = require('./programming-languages.json');

// D3
// via https://github.com/d3/d3-scale-chromatic/tree/main/src/categorical
// and https://observablehq.com/@d3/color-schemes
const d3Set = require('./d3.json');

// TODO: Sets
// Pride flag colors (some are in custom): https://www.flagcolorcodes.com/flags/pride

// Custom colors
const customSet = require('./custom.json');

// Combine.  Order sort of matters as there may be duplicates.  But
// "Red" will not override "red"
const colors = {
  ...namedColorsSet,
  ...sanzoWadaSet,
  ...colourLoversPalettesSet,
  ...nameThatColorSet,
  ...chromaSet,
  ...crayolaSet,
  ...colorBrewerSet,
  ...sportsNcaaSet,
  ...sportsMajorSet,
  ...countriesSet,
  ...pokemonSet,
  ...programmingLanguagesSet,
  ...d3Set,
  ...vegaSet,
  ...customSet
};

// Sanity check
debug(`Found ${size(colors)} colors`);

// Make ids from colors.  Should only be numbers and letters.
function colorId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Make array, sort by name length and name, and make unique by id
const colorsArray = orderBy(
  uniqBy(
    map(colors, (v, k) => {
      return {
        id: colorId(k),
        name: k,
        colors: isArray(v) ? v : [v]
      };
    }).reverse(),
    'id'
  ),
  [(c) => c.id.length, 'name'],
  ['desc', 'asc']
);

// Take out any keywords and make sure is two or mor characters
const filtered = filter(colorsArray, (c) => {
  return ['random'].indexOf(c.id) === -1 && c.id.length > 2;
});

// Lookup
const colorLookup = keyBy(filtered, 'id');

// Update any references to other colors.  This is only one level deep.
let converted = map(filtered, (c) => {
  c.colors = flatten(
    map(c.colors, (color) => {
      return colorLookup[colorId(color)]
        ? colorLookup[colorId(color)].colors
        : color;
    })
  );

  return c;
});

// Standarize hex and fix any issues
converted = map(converted, (c) => {
  // Standardize
  c.colors = map(c.colors, standardizeHex);
  // Too long
  c.colors = filter(c.colors, (color) => color.length <= 7);

  return c;
});

export default converted;
