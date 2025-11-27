/**
 * ZPrivacy402 Backend Mock Server
 * 
 * Main Express server entry point.
 * Provides REST API for payment intent evaluation.
 */

const express = require('express');
const apiRouter = require('./api');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api', apiRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Not found'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`ZPrivacy402 Mock Server started on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`API endpoint: http://localhost:${PORT}/api/evaluate`);
});

module.exports = app;
