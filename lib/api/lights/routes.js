/**
 * Get lights
 */

// Dependencies
import express from 'express';
import createError from 'http-errors';
import httpContext from 'express-http-context';
import debugSetup from 'debug';
import twilio from 'twilio';
import { sample } from 'lodash-es';
import { lightsStore, getRecent } from './store.js';
import { addLights } from './controller.js';
import colors from '../../colors.js';

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

// Add light via Twilio
router.post('/twilio', function (req, res, next) {
  const io = req.app.get('io');
  const helpColor1 = sample(colors);
  const helpColor2 = sample(colors);
  const newMessage = (response) =>
    new twilio.twiml.MessagingResponse().message(response);

  // Responses
  const responses = [
    'Thanks for your input; your color(s) should show up in a few seconds.',
    'Yay! More colors! Might take a moment to update those colors for you.',
    'Our robots are working hard to get those colors just right for you.',
    'Wait for it... Bam! Colors!'
  ];
  const response = sample(responses);
  let message = newMessage(response);

  // Check for contents
  if (!req.body || !req.body.Body) {
    debug('No request body given to Twilio endpoint.', req.body);
    message = newMessage(
      `Unable to find any colors in that message.  Why don't you try something like "${helpColor1.name}" or "${helpColor2.name}"?`
    );
  }

  // Turn input into colors
  try {
    const newLights = addLights({ source: 'twilio', input: req.body.Body });

    if (io) {
      io.emit('lights', newLights);
    }
  } catch (e) {
    debug('Error trying to figure out lights from Twilio message.', e);
    message = newMessage(
      `Unable to find any colors in that message.  Why don't you try something like "${helpColor1.name}" or "${helpColor2.name}"?`
    );
  }

  // Send back message
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(message.toString());
});

export default router;
