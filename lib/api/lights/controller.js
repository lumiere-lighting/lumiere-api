/**
 * Constroller for lights
 */

// Dependencies
import debugSetup from 'debug';
import lights from './store.js';
import colors from '../../colors.js';

// Debug
const debug = debugSetup('lumiere:api:lights');

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

  // Convert input to lights
  const colors = [];

  // New lights
  const newLights = {
    id,
    input,
    source,
    lights: colors,
    timestamp: new Date().getTime()
  };

  // Add lights
  lights.push(newLights);

  return newLights;
}

export { addLights };
