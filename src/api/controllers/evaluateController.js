/**
 * Evaluate Controller
 * 
 * Handles evaluation requests and returns standardized responses.
 */

const { evaluateIntent } = require('../../core/evaluator');
const logger = require('../../utils/logger');

/**
 * Evaluate a payment intent
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 */
async function evaluate(req, res) {
  try {
    const { agentId, intent } = req.body;

    // Validate request
    if (!agentId) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required field: agentId'
      });
    }

    if (!intent || typeof intent !== 'object') {
      return res.status(400).json({
        status: 'error',
        message: 'Missing or invalid field: intent (must be an object)'
      });
    }

    // Run evaluation
    const result = await evaluateIntent(intent, agentId);

    // Return result
    return res.json(result);

  } catch (error) {
    logger.error(`Evaluation error: ${error.message}`);
    
    return res.status(500).json({
      status: 'error',
      message: 'Evaluation failed',
      details: error.message
    });
  }
}

module.exports = {
  evaluate
};
