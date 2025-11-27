/**
 * Intent Normalizer
 * 
 * Cleans and standardizes incoming payment intents.
 * Performs basic sanitization and redaction of sensitive data.
 */

/**
 * Normalize a raw intent object
 * @param {Object} raw - Raw intent from client
 * @returns {Object} Normalized intent
 */
function normalizeIntent(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid intent: must be an object');
  }

  const normalized = {};

  // Normalize action (lowercase, trim)
  if (raw.action) {
    normalized.action = String(raw.action).toLowerCase().trim();
  }

  // Normalize amount (ensure number)
  if (raw.amount !== undefined) {
    normalized.amount = parseFloat(raw.amount) || 0;
  }

  // Normalize currency (uppercase)
  if (raw.currency) {
    normalized.currency = String(raw.currency).toUpperCase().trim();
  }

  // Normalize merchant (lowercase, trim)
  if (raw.merchant) {
    normalized.merchant = String(raw.merchant).toLowerCase().trim();
  }

  // Redact sensitive description fields
  // TODO: Replace with production-grade PII redaction
  if (raw.description) {
    normalized.description = redactSensitiveInfo(String(raw.description).trim());
  }

  // Copy any additional fields
  const knownFields = ['action', 'amount', 'currency', 'merchant', 'description'];
  for (const key of Object.keys(raw)) {
    if (!knownFields.includes(key)) {
      normalized[key] = raw[key];
    }
  }

  return normalized;
}

/**
 * Basic redaction of potentially sensitive information
 * @param {string} text - Input text
 * @returns {string} Redacted text
 */
function redactSensitiveInfo(text) {
  // Redact email addresses
  text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
  
  // Redact phone numbers (simple pattern)
  text = text.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE_REDACTED]');
  
  // Redact credit card numbers (simple pattern)
  text = text.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD_REDACTED]');

  return text;
}

module.exports = {
  normalizeIntent,
  redactSensitiveInfo
};
