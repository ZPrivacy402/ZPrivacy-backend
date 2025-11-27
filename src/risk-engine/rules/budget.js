/**
 * Budget Rule
 * 
 * Checks if the payment amount is within the agent's budget limit.
 */

/**
 * Check budget constraint
 * @param {Object} intent - Normalized intent
 * @param {Object} policy - Agent policy
 * @returns {Object} Check result { ok, reason, meta }
 */
async function check(intent, policy) {
  const amount = intent.amount || 0;
  const maxBudget = policy.maxBudget || 0;
  const currency = intent.currency || policy.currency || 'USD';

  const ok = amount <= maxBudget;

  return {
    ok,
    reason: ok
      ? `Amount $${amount.toFixed(2)} is within limit of $${maxBudget.toFixed(2)}`
      : `Amount $${amount.toFixed(2)} exceeds limit of $${maxBudget.toFixed(2)}`,
    meta: {
      amount,
      maxBudget,
      currency,
      remaining: Math.max(0, maxBudget - amount)
    }
  };
}

module.exports = { check };
