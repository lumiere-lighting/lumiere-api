// Dependencies
import lights from './store.js';

// Emit lights
function emitLights(io, specific) {
  if (io) {
    io.emit('lights', specific || lights[0]);
  }
}

// Emit all lights
function emitAllLights(io) {
  if (io) {
    io.emit('lights', lights);
  }
}

// Export
export { emitLights, emitAllLights };
