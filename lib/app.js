/**
 * Main API app.
 */

// Dependencies
import express from 'express';
import dotenv from 'dotenv';
import debugSetup from 'debug';
import morgan from 'morgan';
import createError from 'http-errors';
import httpContext from 'express-http-context';
import cuid from 'cuid';
import cors from 'cors';
import routeLights from './api/lights/routes.js';
import { emitLights } from './api/lights/socket.js';

// Environment configuration
dotenv.config();
const isProduction = process.env.NODE_ENV === 'production';

// Setup debug
const debug = debugSetup('lumiere:api');

// Create app
const app = express();

// Configure
app.use(httpContext.middleware);
app.use(function (req, res, next) {
  const id = req.headers['x-correlation-id'] || cuid();
  httpContext.set('reqId', id);
  res.setHeader('x-correlation-id', id);
  next();
});
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// We serve the express app in the main process file,
// but we want to keep the logic here.
app.__handleSocket = (io) => {
  // Attach reference to app
  app.set('io', io);

  // Each connection
  io.on('connection', (socket) => {
    debug('Socket connected');

    socket.on('disconnect', () => {
      debug('Socket disconnected');
    });

    // Send initial lights
    emitLights(io);
  });
};

// Routes
app.use('/lights', routeLights);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  debug(err);

  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = isProduction ? {} : err;
  res.locals.status = err.status || 500;
  const id = httpContext.get('reqId');

  // Render the error page
  res.status(res.locals.status).json({
    id,
    success: false,
    status: res.locals.status,
    error: res.locals.status < 500 ? err.message : 'Internal server error'
  });
});

// Export
export default app;
