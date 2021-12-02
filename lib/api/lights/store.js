/**
 * The lights store is just an in-memory.
 */

// Dependencies
import cuid from 'cuid';
import { sortBy } from 'lodash-es';
import { maxLightsStore } from '../../config.js';

let lightsStore = [
  {
    id: cuid(),
    source: 'api',
    input: 'white',
    colorNames: ['white'],
    colors: ['#FFFFFF'],
    timestamp: new Date().getTime()
  }
];

// Add lights
function addSet(newLights) {
  lightsStore.push(newLights);
  lightsStore = sortBy(lightsStore, 'timestamp').reverse();

  if (maxLightsStore && maxLightsStore > 0) {
    lightsStore = lightsStore.slice(0, maxLightsStore);
  }
}

// Get recent
function getRecent(limit = 1) {
  return limit === 1 ? lightsStore[0] : lightsStore.slice(0, limit);
}

export { addSet, getRecent, lightsStore };
