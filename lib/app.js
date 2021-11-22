/**
 * Main API app.
 */

// Dependencies
import express from 'express';
import dotenv from 'dotenv';
import debugSetup from 'debug';
import morgan from 'morgan';

// Environment configuration
dotenv.config();
const isProduction = process.env.NODE_ENV === 'production';

// Setup debug
const debug = debugSetup('lumiere:api');

// Create app
const app = express();

// Configure
app.use(morgan(isProduction ? 'combined' : 'dev'));

// Export
export default app;
