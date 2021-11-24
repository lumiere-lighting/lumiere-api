// Dependencies
import { getRecent, lightsStore } from './store.js';

// Emit lights
function emitLights(io, specific) {
  if (io) {
    io.emit('lights', specific || getRecent());
  }
}

// Emit all lights
function emitAllLights(io) {
  if (io) {
    io.emit('lights', lightsStore);
  }
}

// Export
export { emitLights, emitAllLights };
