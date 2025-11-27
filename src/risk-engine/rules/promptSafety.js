/**
 * Prompt Safety Rule
 * 
 * Basic check for suspicious or potentially harmful content in intent.
 * 
 * ⚠️ DEMO ONLY
 * This is a very basic keyword-based check.
 * Production implementations should use:
 * - ML-based content moderation
 * - External content safety APIs
 * - More sophisticated pattern matching
 */

// Suspicious tokens to flag (demo purposes only)
const SUSPICIOUS_TOKENS = [
  'kill',
  'steal',
  'hack',
  'exploit',
  'fraud',
  'launder',
  'illegal',
  'bypass',
  'override',
  'admin',
  'root',
  'sudo',
  'password',
  'credential',
  'private_key',
  'seed_phrase',
  'wallet_secret'
];

// High-risk patterns (regex)
const HIGH_RISK_PATTERNS = [
  /\b(send|transfer)\s+all\s+(funds|money|balance)\b/i,
  /\bmax(imum)?\s+(withdrawal|transfer)\b/i,
  /\bempty\s+(wallet|account)\b/i,
  /\bdrain\s+(funds|wallet)\b/i
];

/**
 * Check prompt safety
 * @param {Object} intent - Normalized intent
 * @param {Object} policy - Agent policy
 * @returns {Object} Check result { ok, reason, meta }
 */
async function check(intent, policy) {
  const description = (intent.description || '').toLowerCase();
  const action = (intent.action || '').toLowerCase();
  const merchant = (intent.merchant || '').toLowerCase();
  
  // Combine all text to search
  const searchText = `${description} ${action} ${merchant}`;
  
  // Check for suspicious tokens
  const foundTokens = SUSPICIOUS_TOKENS.filter(token => 
    searchText.includes(token.toLowerCase())
  );

  // Check for high-risk patterns
  const matchedPatterns = HIGH_RISK_PATTERNS.filter(pattern =>
    pattern.test(searchText)
  );

  const hasIssues = foundTokens.length > 0 || matchedPatterns.length > 0;

  if (hasIssues) {
    return {
      ok: false,
      reason: `Suspicious content detected: ${foundTokens.length} tokens, ${matchedPatterns.length} patterns`,
      meta: {
        suspiciousTokens: foundTokens,
        patternMatches: matchedPatterns.length,
        riskIndicators: foundTokens.slice(0, 3) // Only show first 3
      }
    };
  }

  return {
    ok: true,
    reason: 'No suspicious tokens or patterns found',
    meta: {
      suspiciousTokens: [],
      patternMatches: 0,
      riskIndicators: []
    }
  };
}

module.exports = { check };
