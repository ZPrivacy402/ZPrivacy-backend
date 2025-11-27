/**
 * Main Evaluator
 * 
 * Orchestrates the full intent evaluation pipeline:
 * 1. Normalize intent
 * 2. Load policy
 * 3. Run risk rules
 * 4. Aggregate risk score
 * 5. Generate envelope
 */

const { normalizeIntent } = require('./intent/intent-normalizer');
const { loadPolicy } = require('./policy/policy-engine');
const { createEnvelope, getEnvelopeSize } = require('./envelope/envelope');
const budgetRule = require('../risk-engine/rules/budget');
const merchantRule = require('../risk-engine/rules/merchant');
const subscriptionRule = require('../risk-engine/rules/subscription');
const promptSafetyRule = require('../risk-engine/rules/promptSafety');
const { aggregateRisk } = require('../risk-engine/analyzers/aggregator');
const { commitmentHash } = require('../utils/hash');
const logger = require('../utils/logger');

/**
 * Evaluate a payment intent
 * @param {Object} intent - Raw intent object
 * @param {string} agentId - Agent identifier
 * @returns {Object} Evaluation result
 */
async function evaluateIntent(intent, agentId) {
  const startTime = Date.now();
  
  logger.info(`Starting evaluation for agent: ${agentId}`);

  // Step 1: Normalize intent
  logger.info('Normalizing intent...');
  const normalizedIntent = normalizeIntent(intent);

  // Step 2: Load policy
  logger.info(`Loading policy for ${agentId}...`);
  const policy = loadPolicy(agentId);
  logger.info(`Policy loaded: maxBudget=$${policy.maxBudget}, riskThreshold=${policy.riskThreshold}`);

  // Step 3: Run risk rules
  logger.info('Running risk evaluation...');
  
  const budgetCheck = await budgetRule.check(normalizedIntent, policy);
  logger.log(budgetCheck.ok ? 'success' : 'error', 
    `Budget check: ${budgetCheck.ok ? 'PASS' : 'FAIL'} - ${budgetCheck.reason}`);

  const merchantCheck = await merchantRule.check(normalizedIntent, policy);
  logger.log(merchantCheck.ok ? 'success' : 'error',
    `Merchant check: ${merchantCheck.ok ? 'PASS' : 'FAIL'} - ${merchantCheck.reason}`);

  const subscriptionCheck = await subscriptionRule.check(normalizedIntent, policy);
  logger.log(subscriptionCheck.ok ? 'success' : 'warn',
    `Subscription check: ${subscriptionCheck.ok ? 'PASS' : 'WARN'} - ${subscriptionCheck.reason}`);

  const promptSafetyCheck = await promptSafetyRule.check(normalizedIntent, policy);
  logger.log(promptSafetyCheck.ok ? 'success' : 'error',
    `Prompt safety: ${promptSafetyCheck.ok ? 'PASS' : 'FAIL'} - ${promptSafetyCheck.reason}`);

  // Step 4: Aggregate risk
  const checks = {
    budget: budgetCheck,
    merchant: merchantCheck,
    subscription: subscriptionCheck,
    promptSafety: promptSafetyCheck
  };

  const { riskScore, riskLevel } = aggregateRisk(checks, policy);
  logger.info(`Risk score: ${riskScore.toFixed(2)} (${riskLevel})`);

  // Step 5: Generate commitment hash
  const hash = commitmentHash(normalizedIntent, {
    agentId,
    timestamp: new Date().toISOString(),
    riskScore
  });
  logger.info(`Commitment hash: ${hash.slice(0, 16)}...`);

  // Step 6: Create envelope
  const envelopeData = {
    intent: normalizedIntent,
    agentId,
    evaluation: {
      riskScore,
      riskLevel,
      checks,
      commitmentHash: hash
    },
    timestamp: new Date().toISOString()
  };

  const envelope = createEnvelope(envelopeData);
  const payloadSize = getEnvelopeSize(envelope);
  logger.success(`Envelope generated: ${payloadSize} bytes`);

  const evaluationTime = Date.now() - startTime;

  return {
    status: 'success',
    data: {
      riskScore,
      riskLevel,
      checks,
      commitmentHash: hash,
      payloadSize,
      evaluationTime,
      envelope: envelope.ciphertext
    }
  };
}

module.exports = {
  evaluateIntent
};
