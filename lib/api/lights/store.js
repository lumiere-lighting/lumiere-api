/**
 * The lights store is just an in-memory.
 */

// Dependencies
import cuid from 'cuid';

const lights = [
  {
    id: cuid(),
    source: 'api',
    input: 'white',
    lights: ['#FFFFFF'],
    timestamp: new Date().getTime()
  }
];
export default lights;
