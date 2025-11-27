/**
 * Subscription Detection Rule
 * 
 * Detects patterns that might indicate recurring subscriptions.
 */

// Keywords that might indicate subscription/recurring payments
const SUBSCRIPTION_KEYWORDS = [
  'subscription',
  'subscribe',
  'monthly',
  'weekly',
  'yearly',
  'annual',
  'recurring',
  'membership',
  'premium',
  'pro plan',
  'auto-renew',
  'autorenew',
  'billing cycle'
];

/**
 * Check for subscription patterns
 * @param {Object} intent - Normalized intent
 * @param {Object} policy - Agent policy
 * @returns {Object} Check result { ok, reason, meta }
 */
async function check(intent, policy) {
  const description = (intent.description || '').toLowerCase();
  const action = (intent.action || '').toLowerCase();
  
  // Combine all text to search
  const searchText = `${description} ${action}`;
  
  // Find matching keywords
  const foundKeywords = SUBSCRIPTION_KEYWORDS.filter(keyword => 
    searchText.includes(keyword.toLowerCase())
  );

  const isSubscription = foundKeywords.length > 0;
  const subscriptionLimit = policy.subscriptionLimit || 0;

  if (isSubscription) {
    // If subscriptions are not allowed (limit = 0)
    if (subscriptionLimit === 0) {
      return {
        ok: false,
        reason: 'Subscription payments are not allowed for this agent',
        meta: {
          detectedKeywords: foundKeywords,
          subscriptionLimit,
          isSubscription: true
        }
      };
    }

    // Subscription detected but allowed
    return {
      ok: true,
      reason: `Subscription pattern detected (keywords: ${foundKeywords.join(', ')})`,
      meta: {
        detectedKeywords: foundKeywords,
        subscriptionLimit,
        isSubscription: true
      }
    };
  }

  // No subscription pattern found
  return {
    ok: true,
    reason: 'No recurring payment patterns detected',
    meta: {
      detectedKeywords: [],
      subscriptionLimit,
      isSubscription: false
    }
  };
}

module.exports = { check };
