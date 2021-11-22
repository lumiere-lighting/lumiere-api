/**
 * Main API app.
 */

// Dependencies
import express from 'express';
import dotenv from 'dotenv';
import debugSetup from 'debug';
import morgan from 'morgan';
import createError from 'http-errors';

// Environment configuration
dotenv.config();
const isProduction = process.env.NODE_ENV === 'production';

// Setup debug
const debug = debugSetup('lumiere:api');

// Create app
const app = express();

// Configure
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = isProduction ? {} : err;
  res.locals.status = err.status || 500;

  // Render the error page
  res.status(res.locals.status).json({
    success: false,
    status: res.locals.status,
    error: res.locals.status < 500 ? err.message : 'Internal server error'
  });
});

// Export
export default app;
