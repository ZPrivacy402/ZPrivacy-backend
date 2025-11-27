/**
 * Merchant Rule
 * 
 * Verifies merchant trustworthiness using the merchant oracle.
 */

const merchantOracle = require('../../services/merchant/merchantOracle');

/**
 * Check merchant trustworthiness
 * @param {Object} intent - Normalized intent
 * @param {Object} policy - Agent policy
 * @returns {Object} Check result { ok, reason, meta }
 */
async function check(intent, policy) {
  const merchantId = intent.merchant;

  if (!merchantId) {
    return {
      ok: false,
      reason: 'No merchant specified in intent',
      meta: {}
    };
  }

  // Check if merchant is in blocked list
  if (policy.blockedMerchants && policy.blockedMerchants.includes(merchantId)) {
    return {
      ok: false,
      reason: `Merchant "${merchantId}" is in blocked list`,
      meta: {
        merchantId,
        blocked: true
      }
    };
  }

  // Consult merchant oracle
  const oracleResult = await merchantOracle.getMerchantScore(merchantId);

  // If whitelist is required, check oracle trust score
  if (policy.requireMerchantWhitelist) {
    const ok = oracleResult.trusted;
    
    return {
      ok,
      reason: ok
        ? `Merchant "${merchantId}" is trusted (score: ${oracleResult.score})`
        : `Merchant "${merchantId}" is not in trusted whitelist (score: ${oracleResult.score})`,
      meta: {
        merchantId,
        score: oracleResult.score,
        trusted: oracleResult.trusted,
        category: oracleResult.category
      }
    };
  }

  // No whitelist required, just return oracle info
  return {
    ok: true,
    reason: `Merchant "${merchantId}" accepted (whitelist not required)`,
    meta: {
      merchantId,
      score: oracleResult.score,
      trusted: oracleResult.trusted,
      category: oracleResult.category
    }
  };
}

module.exports = { check };
