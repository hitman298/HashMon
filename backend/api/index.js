/**
 * Vercel Serverless Function Entry Point
 * This file wraps the Express app for Vercel's serverless environment
 */

const path = require('path');

// Set the correct path for .env file (relative to this file's location)
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Load the Express app
const app = require('../server');

// Export as a serverless function handler
// Vercel will call this function for each request
module.exports = app;

