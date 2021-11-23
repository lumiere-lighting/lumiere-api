/**
 * Get lights
 */

// Dependencies
import express from 'express';
import createError from 'http-errors';
import httpContext from 'express-http-context';
import lights from './store.js';
import { addLights } from './controller.js';

// Setup router
const router = express.Router();

// Get all lights
router.get('/', function (req, res, next) {
  const id = httpContext.get('reqId');

  res.json({
    id,
    success: true,
    results: lights.sort((a, b) => b.timestamp - a.timestamp)
  });
});

// Get current light
router.get('/current', function (req, res, next) {
  const id = httpContext.get('reqId');
  const sorted = lights.sort((a, b) => b.timestamp - a.timestamp);
  res.json({
    id,
    success: true,
    results: sorted[0]
  });
});

// Add light
router.post('/', function (req, res, next) {
  const data = req.body;

  if (!data || !data.input || !data.source) {
    return next(
      createError.BadRequest(
        'Missing required fields; should be something like: { "input": "text", "source", "web" }'
      )
    );
  }
});

export default router;
