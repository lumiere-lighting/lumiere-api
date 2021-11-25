/**
 * General utility functions
 */

// Dependencies
import fs from 'fs';
import fetch from 'node-fetch';

// Convert 3 digit hex to 6 digit hex
function standardizeHex(hex) {
  hex = hex.replace(/#/g, '').toUpperCase();
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  return `#${hex}`;
}

// RGB to Hex
function rgbToHex(rgb = []) {
  return (
    '#' +
    rgb
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

// Download file
async function downloadFile(url, destination) {
  const res = await fetch(url);
  await new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(destination);
    res.body.pipe(fileStream);
    res.body.on('error', (err) => {
      reject(err);
    });
    fileStream.on('finish', () => {
      resolve();
    });
  });
}

export { standardizeHex, rgbToHex, downloadFile };
