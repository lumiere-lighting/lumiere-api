/**
 * Get lights
 */

// Dependencies
import express from 'express';
import createError from 'http-errors';
import httpContext from 'express-http-context';
import { lightsStore, getRecent } from './store.js';
import { addLights } from './controller.js';
import debugSetup from 'debug';

// Debug
const debug = debugSetup('lumiere:api:lights');

// Setup router
const router = express.Router();

// Get all lights
router.get('/', function (req, res, next) {
  const id = httpContext.get('reqId');

  res.json({
    id,
    success: true,
    results: lightsStore
  });
});

// Get current light
router.get('/current', function (req, res, next) {
  const id = httpContext.get('reqId');

  res.json({
    id,
    success: true,
    results: getRecent()
  });
});

// Add light
router.post('/', function (req, res, next) {
  const id = httpContext.get('reqId');
  const data = req.body;
  const io = req.app.get('io');

  if (!data || !data.input || !data.source) {
    return next(
      createError.BadRequest(
        'Missing required fields; should be something like: { "input": "text", "source", "web" }'
      )
    );
  }

  try {
    const newLights = addLights(data);

    if (io) {
      io.emit('lights', newLights);
    }

    res.json({
      id,
      success: true,
      results: newLights
    });
  } catch (e) {
    debug(e);
    return next(createError.BadRequest('Unable to turn input into colors.'));
  }
});

export default router;
