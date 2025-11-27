/**
 * Evaluate Route
 * 
 * POST /api/evaluate - Evaluate a payment intent
 */

const express = require('express');
const evaluateController = require('../controllers/evaluateController');

const router = express.Router();

/**
 * POST /api/evaluate
 * Evaluate a payment intent against policy rules
 */
router.post('/evaluate', evaluateController.evaluate);

module.exports = router;
