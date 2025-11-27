/**
 * Policy Engine
 * 
 * Loads and manages agent-specific spending policies.
 * In production, this would fetch from a policy database or smart contract.
 */

// Mock policy database
// TODO: Replace with real policy storage (database, smart contract, etc.)
const MOCK_POLICIES = {
  'agent_demo_001': {
    maxBudget: 100.00,
    currency: 'USD',
    requireMerchantWhitelist: true,
    riskThreshold: 0.5,
    allowedMerchantCategories: ['food', 'retail', 'services'],
    blockedMerchants: ['casino_xyz', 'gambling_site'],
    subscriptionLimit: 3,
    dailyTransactionLimit: 500.00
  },
  'agent_test_002': {
    maxBudget: 50.00,
    currency: 'USD',
    requireMerchantWhitelist: false,
    riskThreshold: 0.3,
    allowedMerchantCategories: ['food'],
    blockedMerchants: [],
    subscriptionLimit: 1,
    dailyTransactionLimit: 100.00
  },
  'agent_prod_003': {
    maxBudget: 500.00,
    currency: 'USD',
    requireMerchantWhitelist: true,
    riskThreshold: 0.7,
    allowedMerchantCategories: ['food', 'retail', 'services', 'travel'],
    blockedMerchants: [],
    subscriptionLimit: 10,
    dailyTransactionLimit: 2000.00
  }
};

// Default policy for unknown agents
const DEFAULT_POLICY = {
  maxBudget: 25.00,
  currency: 'USD',
  requireMerchantWhitelist: true,
  riskThreshold: 0.3,
  allowedMerchantCategories: ['food'],
  blockedMerchants: [],
  subscriptionLimit: 0,
  dailyTransactionLimit: 50.00
};

/**
 * Load policy for a specific agent
 * @param {string} agentId - Agent identifier
 * @returns {Object} Policy configuration
 */
function loadPolicy(agentId) {
  if (!agentId || typeof agentId !== 'string') {
    return { ...DEFAULT_POLICY };
  }

  const policy = MOCK_POLICIES[agentId];
  
  if (policy) {
    return { ...policy };
  }

  // Return default policy for unknown agents
  return { ...DEFAULT_POLICY };
}

/**
 * Check if agent exists in policy database
 * @param {string} agentId - Agent identifier
 * @returns {boolean}
 */
function agentExists(agentId) {
  return agentId in MOCK_POLICIES;
}

/**
 * Get all registered agent IDs
 * @returns {string[]}
 */
function getAllAgentIds() {
  return Object.keys(MOCK_POLICIES);
}

module.exports = {
  loadPolicy,
  agentExists,
  getAllAgentIds,
  DEFAULT_POLICY
};
