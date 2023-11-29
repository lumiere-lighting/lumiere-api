/**
 * Main API app.
 */

// Dependencies
import express from 'express';
import debugSetup from 'debug';
import morgan from 'morgan';
import createError from 'http-errors';
import httpContext from 'express-http-context';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit'
import cuid from 'cuid';
import cors from 'cors';
import { sampleSize } from 'lodash-es';
import { nodeEnv, proxies } from './config.js';
import routeLights from './api/lights/routes.js';
import routeColors from './api/colors/routes.js';
import { emitLights } from './api/lights/socket.js';
import colors from './colors/index.js';

// Environment
const isProduction = nodeEnv === 'production';

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
app.use(compression());

// Rate limiting
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 100,
	standardHeaders: true,
  message: (req, res) => {
    const id = httpContext.get('reqId');
    res.json({
      id,
      success: false,
      status: 429,
      error: 'Too many requests, please try again later.',
    });
  }
});
app.use(limiter);
if (proxies) {
  app.set('trust proxy', proxies);
}

// We serve the express app in the main process file,
// but we want to keep the logic here.
app.__handleSocket = (io) => {
  // Attach reference to app
  app.set('io', io);

  // If the client asks for lights, send back.
  io.on('connection', (socket) => {
    socket.on('lights:get', () => {
      emitLights(socket);
    });
  });
};

// Routes
app.use('/lights', routeLights);
app.use('/colors', routeColors);

// Index route
// TODO: Get to work; currently becomes default route, but simply
// want this as / and the 404 handler below for the rest
// app.use('/', function(req, res) {
//   const id = httpContext.get('reqId');

//   res.json({
//     id,
//     success: true,
//     results: { status: "ok" }
//   });
// });

// Test/health route
app.get('/health', (req, res) => {
  const id = httpContext.get('reqId');
  res.json({
    id,
    success: true,
    results: {
      requestIp: req.ip,
    }
  });
});

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

  // Cache control
  res.set('Cache-control', `no-store`);

  // Render the error page
  res.status(res.locals.status).json({
    id,
    success: false,
    status: res.locals.status,
    error: res.locals.status < 500 ? err.message : 'Internal server error',
    suggestions: sampleSize(colors, 3)
  });
});

// Export
export default app;
