/**
 * Module exports aggregator
 * 
 * Provides convenient access to core modules for external use.
 */

const evaluator = require('./core/evaluator');
const { normalizeIntent } = require('./core/intent/intent-normalizer');
const { loadPolicy } = require('./core/policy/policy-engine');
const { createEnvelope } = require('./core/envelope/envelope');
const { buildPayload } = require('./services/pipeline/pipeline');

module.exports = {
  evaluator,
  normalizeIntent,
  loadPolicy,
  createEnvelope,
  buildPayload
};
