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
  res.set('Cache-control', `public, max-age=${60 * 60 * 24 * 7}`);

  // Paginate
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100000;
  const offset = (page - 1) * limit;
  const pages = Math.ceil(colors.length / limit);
  const paginatedColors = colors.slice(offset, offset + limit);

  res.json({
    id,
    success: true,
    page,
    limit,
    pages,
    totalColors: colors.length,
    results: paginatedColors
  });
});

export default router;
