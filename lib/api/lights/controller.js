/**
 * Controller for lights
 */

// Dependencies
import fs from 'fs';
import BadWords from 'bad-words';
import debugSetup from 'debug';
import cuid from 'cuid';
import tmp from 'tmp';
import colorThief from 'colorthief';
import mime from 'mime-types';
import { filter, each, uniq, flatten } from 'lodash-es';
import { addSet } from './store.js';
import colors from '../../colors.js';
import { rgbToHex, standardizeHex, downloadFile } from '../../utils.js';

// Debug
const debug = debugSetup('lumiere:api:lights');

// Setup filter
const badWordsFilter = new BadWords();

// Add lights function
function addLightsFromText(data, shouldAddSet = true) {
  // Check structure
  if (!data || !data.input) {
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
  const colors = textToColors(filtered);
  if (!colors.colors || colors.colors.length === 0) {
    throw new Error('No colors found in input.');
  }

  // New lights
  const newLights = {
    id: cuid(),
    source,
    input: filtered,
    sanitized: colors.sanitized,
    colors: colors.colors,
    timestamp: new Date().getTime()
  };

  // Add lights
  if (shouldAddSet) {
    addSet(newLights);
  }

  return newLights;
}

// Add lights from input or image
async function addLightsFromTextOrImage(
  input,
  image,
  imageType,
  source,
  shouldAddSet = true
) {
  // Check for contents
  if (!input && !image) {
    throw new Error('No request body or image provided.');
  }

  // Check for images.
  // If needed, image type is MediaContentType0
  let imageColors;
  if (image) {
    imageColors = await imageToColors(image, imageType);
    debug(imageColors);
  }

  // Check for body
  let inputColors;
  let filteredInput;
  if (input) {
    inputColors = textToColors(input);
    filteredInput = badWordsFilter.clean(input).trim();
  }

  // Combine colors
  let colors;
  if (imageColors || inputColors) {
    colors = []
      .concat(inputColors ? inputColors.colors : [])
      .concat(imageColors ? imageColors.colors : []);
  } else {
    throw new Error('Unable to find any colors from body or image.');
  }

  // New lights
  const newLights = {
    id: cuid(),
    source,
    image: image ? true : false,
    input: filteredInput ? filteredInput : '',
    sanitized: inputColors ? inputColors.sanitized : undefined,
    colors: colors,
    timestamp: new Date().getTime()
  };

  // Add lights
  if (shouldAddSet) {
    addSet(newLights);
  }

  return newLights;
}

// Input to color
function textToColors(input = '') {
  input = input.trim();

  // Remove any bad words
  let filtered = badWordsFilter.clean(input).trim();

  // Split on commas.  As "blue, green" should be blue and green, not bluegreen
  let filteredSplit = filtered.split(',');

  // Go through each split
  let foundSplit = filteredSplit.map((separated) => {
    // Convert input to where we can search for color identifiers.  Color
    // identifiers should not have numbers, since we use the index as
    // reference.
    let searchableInput = separated.toLowerCase().replace(/[^a-z0-9#]/g, '');

    // Look for color ids, then replace with index.  Important that colors
    // are in order of longest id first.
    let indexedInput = searchableInput;
    each(colors, (color, ci) => {
      if (indexedInput.indexOf(color.id) !== -1) {
        indexedInput = indexedInput.replace(
          new RegExp(color.id, 'g'),
          ` ${ci},`
        );
      }
    });

    // Look for hex values and add comma
    indexedInput = indexedInput.replace(
      /#([0-9a-f]{6}|[0-9a-f]{3})/gi,
      ' #$1,'
    );

    // Remove any unfound text (maybe better way to do this)
    let matched = indexedInput.match(/ (#[0-9a-f]+|[0-9]+),/g);
    indexedInput = matched ? matched.join('') : '';

    // Recombine with the indexes and hex values
    let indexes = filter(indexedInput.split(',')).map((i) => i.trim());

    // Get original color info
    let combinedColors = filter(
      indexes.map((index) => {
        if (index.indexOf('#') === 0) {
          return {
            name: standardizeHex(index),
            colors: [standardizeHex(index)]
          };
        } else {
          return colors[index];
        }
      })
    );

    return combinedColors;
  });

  // Flatten
  let foundColors = flatten(foundSplit);

  // The final thing we want to do is make sure that the input is
  // not all black.  Black is valid if between other colors.
  let flattenedColors = flatten(foundColors.map((color) => color.colors));
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
    sanitized: foundColors.map((color) => color.name),
    colors: flattenedColors
  };
}

// Image to colors
async function imageToColors(image, imageType, paletteSize = 5) {
  if (!image) {
    throw new Error('No image provided.');
  }

  // Check if it is a remote file, download
  if (image.indexOf('http') === 0) {
    let url = image;
    image = `${tmp.tmpNameSync()}.${mime.extension(imageType)}`;
    await downloadFile(url, image);
  }

  const palette = await colorThief.getPalette(image, paletteSize);

  return {
    colors: palette.map(rgbToHex)
  };
}

export {
  addLightsFromText,
  addLightsFromTextOrImage,
  textToColors,
  imageToColors
};
