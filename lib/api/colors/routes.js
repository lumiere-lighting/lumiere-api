/**
 * Colors routes
 */

// Dependencies
import express from 'express';
import httpContext from 'express-http-context';
import debugSetup from 'debug';
import colors from '../../colors/index.js';

// Debug
const debug = debugSetup('lumiere:api:colors');

// Setup router
const router = express.Router();

// Get all colors
router.get('/', function (req, res, next) {
  const id = httpContext.get('reqId');

  res.json({
    id,
    success: true,
    results: colors
  });
});

export default router;
