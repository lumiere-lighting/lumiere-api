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
import { addLightsFromText, addLightsFromTextOrImage } from './controller.js';
import colors from '../../colors/index.js';

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
    const newLights = addLightsFromText(data);

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
router.post('/twilio', async function (req, res, next) {
  const io = req.app.get('io');
  const helpColor1 = sample(colors);
  const helpColor2 = sample(colors);
  const newMessage = (response) =>
    new twilio.twiml.MessagingResponse().message(response);

  // Responses
  const responses = [
    'Thanks for the colors: [[COLORNAMES]].',
    'Our robots are working extra hard and found these colors: [[COLORNAMES]].',
    'Wait for it... Colors!\n\nWe found these colors: [[COLORNAMES]]'
  ];
  const imageResponse =
    "Thanks for sharing your image!  It can take some time to upload it, so be patient. \n\nAlso, we don't ever save the image you send us; we just get some colors from it.";
  const response = sample(responses);
  const errorResponse = `Unable to find any colors or images in that message.  Why don't you try something like "${helpColor1.name}" or "${helpColor2.name}"?`;
  let message;

  try {
    const newLights = await addLightsFromTextOrImage(
      req.body.Body,
      req.body.MediaUrl0,
      req.body.MediaContentType0,
      'twilio'
    );

    // Add found colors to message
    if (newLights.image) {
      message = newMessage(imageResponse);
    } else {
      message = newMessage(
        response.replace(
          /\[\[COLORNAMES\]\]/g,
          newLights.colorNames
            ? newLights.colorNames.join(', ')
            : newLights.colors.join(', ')
        )
      );
    }

    if (io) {
      io.emit('lights', newLights);
    }
  } catch (e) {
    debug(e);
    message = newMessage(errorResponse);
  }

  // Send back message
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(message.toString());
});

export default router;
