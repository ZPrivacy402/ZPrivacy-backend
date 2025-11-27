/**
 * API Router
 * 
 * Main router that mounts all API routes.
 */

const express = require('express');
const evaluateRouter = require('./routes/evaluate');

const router = express.Router();

// Mount routes
router.use('/', evaluateRouter);

module.exports = router;
