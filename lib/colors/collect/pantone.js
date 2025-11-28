/**
 * Scraper to get pantone colors
 * https://github.com/Margaret2/pantone-colors/blob/master/pantone-colors.json
 */

// Dependencies
import path from 'path';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

// Constants and helpers
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const finalColorsFile = path.join(__dirname, '..', 'pantone.json');
const jsonSource =
  'https://raw.githubusercontent.com/Margaret2/pantone-colors/refs/heads/master/pantone-colors.json';

// Get data
const sourceData = await (await fetch(jsonSource)).json();

// Match up names and values
let compiledData = {};
sourceData.names.forEach((name, index) => {
  compiledData[name.replace(/-/g, ' ')] = sourceData.values[index];
});

// Write file
fs.writeFileSync(finalColorsFile, JSON.stringify(compiledData, null, 2));
