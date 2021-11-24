/**
 * The lights store is just an in-memory.
 */

// Dependencies
import cuid from 'cuid';
import { sortBy } from 'lodash-es';

let lightsStore = [
  {
    id: cuid(),
    source: 'api',
    input: 'white',
    sanitized: 'white',
    colors: ['#FFFFFF'],
    timestamp: new Date().getTime()
  }
];

// Add lights
function addSet(newLights) {
  lightsStore.push(newLights);
  lightsStore = sortBy(lightsStore, 'timestamp').reverse();
}

// Get recent
function getRecent(limit = 1) {
  return limit === 1 ? lightsStore[0] : lightsStore.slice(0, limit);
}

export { addSet, getRecent, lightsStore };
