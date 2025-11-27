/**
 * Risk Aggregator
 * 
 * Combines individual rule results into a final risk score and level.
 */

// Weight configuration for each rule
const RULE_WEIGHTS = {
  budget: 0.3,
  merchant: 0.3,
  subscription: 0.15,
  promptSafety: 0.25
};

// Risk level thresholds
const RISK_THRESHOLDS = {
  LOW: 0.25,
  MED: 0.5
  // HIGH is anything above MED
};

/**
 * Aggregate rule results into final risk assessment
 * @param {Object} checks - Object with rule check results
 * @param {Object} policy - Agent policy (for custom thresholds)
 * @returns {Object} { riskScore, riskLevel }
 */
function aggregateRisk(checks, policy = {}) {
  let totalWeight = 0;
  let weightedFailures = 0;

  // Calculate weighted failure score
  for (const [ruleName, result] of Object.entries(checks)) {
    const weight = RULE_WEIGHTS[ruleName] || 0.1;
    totalWeight += weight;

    if (!result.ok) {
      weightedFailures += weight;
    }
  }

  // Calculate risk score (0 to 1)
  const riskScore = totalWeight > 0 ? weightedFailures / totalWeight : 0;

  // Determine risk level
  const customThreshold = policy.riskThreshold;
  let riskLevel;

  if (customThreshold !== undefined) {
    // Use custom threshold from policy
    if (riskScore <= customThreshold * 0.5) {
      riskLevel = 'LOW';
    } else if (riskScore <= customThreshold) {
      riskLevel = 'MED';
    } else {
      riskLevel = 'HIGH';
    }
  } else {
    // Use default thresholds
    if (riskScore <= RISK_THRESHOLDS.LOW) {
      riskLevel = 'LOW';
    } else if (riskScore <= RISK_THRESHOLDS.MED) {
      riskLevel = 'MED';
    } else {
      riskLevel = 'HIGH';
    }
  }

  return {
    riskScore: Math.round(riskScore * 100) / 100, // Round to 2 decimals
    riskLevel,
    details: {
      totalChecks: Object.keys(checks).length,
      passedChecks: Object.values(checks).filter(c => c.ok).length,
      failedChecks: Object.values(checks).filter(c => !c.ok).length,
      weights: RULE_WEIGHTS
    }
  };
}

/**
 * Check if evaluation should be approved based on risk
 * @param {number} riskScore - Calculated risk score
 * @param {Object} policy - Agent policy
 * @returns {boolean}
 */
function shouldApprove(riskScore, policy = {}) {
  const threshold = policy.riskThreshold || RISK_THRESHOLDS.MED;
  return riskScore <= threshold;
}

module.exports = {
  aggregateRisk,
  shouldApprove,
  RULE_WEIGHTS,
  RISK_THRESHOLDS
};
