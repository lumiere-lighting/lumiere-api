/**
 * Controller for lights
 */

// Dependencies
import BadWords from 'bad-words';
import debugSetup from 'debug';
import cuid from 'cuid';
import { filter, each, uniq, flatten } from 'lodash-es';
import { addSet } from './store.js';
import colors from '../../colors.js';
import { standardizeHex } from '../../utils.js';

// Debug
const debug = debugSetup('lumiere:api:lights');

// Setup filter
const badWordsFilter = new BadWords();

// Add lights function
function addLights(data) {
  // Check structure
  if (!data || !data.input || !data.input) {
    debug(data);
    throw new Error('Trying to add lights that are not formatted correctly.');
  }

  // Check input
  if (!data.input.toString || !data.input.toString().trim()) {
    debug(data);
    throw new Error('Input is not readable or empty.');
  }

  // Input
  const input = data.input.toString().trim();
  const source = data.source || 'unknown';

  // Check for bad words
  const filtered = badWordsFilter.clean(input).trim();
  if (!filtered) {
    debug(filtered);
    throw new Error('Filtered input is empty.');
  }

  // Convert input to lights
  const colors = inputToColors(filtered);
  if (!colors.colors || colors.colors.length === 0) {
    throw new Error('No colors found in input.');
  }

  // New lights
  const newLights = {
    id: cuid(),
    source,
    input,
    sanitized: colors.sanitized,
    colors: colors.colors,
    timestamp: new Date().getTime()
  };

  // Add lights
  addSet(newLights);

  return newLights;
}

// Input to color
function inputToColors(input = '') {
  input = input.trim();

  // #123456
  // #123456, #123902
  // #123456, #123902 red
  // red
  // red green
  // red, green
  // this is some red here and then blue here
  // bright green and green
  // bright, bright green and strawberry

  // Convert input to where we can search for color identifiers.  Color
  // identifiers should not have numbers, since we use the index as
  // reference.
  let searchableInput = input.toLowerCase().replace(/[^a-z0-9#]/g, '');

  // Look for color ids, then replace with index.  Important that colors
  // are in order of longest id first.
  let indexedInput = searchableInput;
  each(colors, (color, ci) => {
    if (indexedInput.indexOf(color.id) !== -1) {
      indexedInput = indexedInput.replace(new RegExp(color.id, 'g'), ` ${ci},`);
    }
  });

  // Look for hex values and add comma
  indexedInput = indexedInput.replace(/#([0-9a-f]{6}|[0-9a-f]{3})/gi, ' #$1,');

  // Remove any unfound text (maybe better way to do this)
  let matched = indexedInput.match(/ (#[0-9a-f]+|[0-9]+),/g);
  indexedInput = matched ? matched.join('') : '';

  // Recombine with the indexes and hex values
  let indexes = filter(indexedInput.split(',')).map((i) => i.trim());

  // Get original color info
  let combinedColors = filter(
    indexes.map((index) => {
      if (index.indexOf('#') === 0) {
        return { name: standardizeHex(index), colors: [standardizeHex(index)] };
      } else {
        return colors[index];
      }
    })
  );

  // The final thing we want to do is make sure that the input is
  // not all black.  Black is valid if between other colors.
  let flattenedColors = flatten(combinedColors.map((color) => color.colors));
  if (
    uniq(flattenedColors).length === 1 &&
    uniq(flattenedColors)[0] === '#000000'
  ) {
    throw new Error('Input is all black.');
  }

  // Make sure we have something
  if (flattenedColors.length === 0) {
    throw new Error('No colors found in input.');
  }

  return {
    sanitized: combinedColors.map((color) => color.name).join(', '),
    colors: flattenedColors
  };
}

export { addLights };
