/**
 * Merchant Oracle Service
 * 
 * Mock merchant scoring and verification service.
 * 
 * In production, this would connect to:
 * - Merchant reputation APIs
 * - On-chain merchant registries
 * - KYB verification services
 */

// Mock merchant database
// TODO: Replace with real merchant data source
const MOCK_MERCHANTS = {
  'coffee_shop_42': {
    score: 85,
    trusted: true,
    category: 'food',
    name: 'Coffee Shop 42',
    verifiedSince: '2023-01-15'
  },
  'electronics_store': {
    score: 78,
    trusted: true,
    category: 'retail',
    name: 'Electronics Store',
    verifiedSince: '2022-06-20'
  },
  'casino_xyz': {
    score: 25,
    trusted: false,
    category: 'gambling',
    name: 'Casino XYZ',
    verifiedSince: null
  },
  'travel_agency_pro': {
    score: 92,
    trusted: true,
    category: 'travel',
    name: 'Travel Agency Pro',
    verifiedSince: '2021-03-10'
  },
  'unknown_merchant': {
    score: 50,
    trusted: false,
    category: 'unknown',
    name: 'Unknown Merchant',
    verifiedSince: null
  }
};

// Default response for unknown merchants
const DEFAULT_MERCHANT = {
  score: 40,
  trusted: false,
  category: 'unknown',
  name: 'Unknown',
  verifiedSince: null
};

/**
 * Get merchant score and trust status
 * @param {string} merchantId - Merchant identifier
 * @returns {Object} Merchant score data
 */
async function getMerchantScore(merchantId) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50));

  if (!merchantId) {
    return {
      ...DEFAULT_MERCHANT,
      merchantId: null,
      error: 'No merchant ID provided'
    };
  }

  const normalizedId = merchantId.toLowerCase().trim();
  const merchant = MOCK_MERCHANTS[normalizedId];

  if (merchant) {
    return {
      ...merchant,
      merchantId: normalizedId
    };
  }

  // Generate deterministic score for unknown merchants
  // This ensures consistent results for the same merchant ID
  const hashCode = normalizedId.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  const deterministicScore = Math.abs(hashCode % 100);
  const trusted = deterministicScore >= 60;

  return {
    merchantId: normalizedId,
    score: deterministicScore,
    trusted,
    category: 'unknown',
    name: normalizedId,
    verifiedSince: null,
    note: 'Merchant not in database, using deterministic scoring'
  };
}

/**
 * Check if merchant is verified
 * @param {string} merchantId - Merchant identifier
 * @returns {boolean}
 */
async function isVerified(merchantId) {
  const result = await getMerchantScore(merchantId);
  return result.trusted && result.verifiedSince !== null;
}

/**
 * Get all known merchants (for testing)
 * @returns {string[]}
 */
function getKnownMerchants() {
  return Object.keys(MOCK_MERCHANTS);
}

module.exports = {
  getMerchantScore,
  isVerified,
  getKnownMerchants
};
