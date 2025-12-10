/**
 * Lego colors from Rebrickable
 * https://rebrickable.com/downloads/
 *
 * Download colors zip/csv to local lego-colors.csv
 */

// Dependencies
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { csvParse } from 'd3-dsv';

// Constants and helpers
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const finalColorsFile = path.join(__dirname, '..', 'lego.json');
const colorSourceCsv = path.join(__dirname, 'lego-colors.csv');

// Get data
const sourceData = csvParse(fs.readFileSync(colorSourceCsv, 'utf-8'));

// Match up names and values
let compiledData = {};
sourceData.forEach((data) => {
  // id: '216',
  // name: 'Rust',
  // rgb: 'B31004',
  // is_trans: 'False',
  // num_parts: '31',
  // num_sets: '17',
  // y1: '1989',
  // y2: '2001'

  // Some names are no good
  if (data.name.match(/(unknown|no color)/i)) {
    return;
  }

  compiledData[`LEGO ${data.name}`] = data.rgb;
});

// Write file
fs.writeFileSync(finalColorsFile, JSON.stringify(compiledData, null, 2));
