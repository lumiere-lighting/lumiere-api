/**
 * General utility functions
 */

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

export { standardizeHex };
