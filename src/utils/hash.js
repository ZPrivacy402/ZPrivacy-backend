/**
 * Hash Utilities
 * 
 * Cryptographic hashing functions for commitment generation.
 */

const crypto = require('crypto');

/**
 * Create commitment hash from intent and metadata
 * @param {Object} intent - Intent object
 * @param {Object} meta - Additional metadata
 * @returns {string} Hex-encoded SHA256 hash
 */
function commitmentHash(intent, meta = {}) {
  const data = {
    intent,
    meta,
    salt: crypto.randomBytes(16).toString('hex')
  };

  const serialized = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

/**
 * Create deterministic hash (no random salt)
 * @param {Object} data - Data to hash
 * @returns {string} Hex-encoded SHA256 hash
 */
function deterministicHash(data) {
  const serialized = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

/**
 * Verify a commitment matches expected data
 * Note: This is a mock implementation. Real verification would need
 * the original salt to be stored/transmitted.
 * @param {string} hash - Hash to verify
 * @param {Object} intent - Original intent
 * @returns {boolean} Always returns true in mock (placeholder)
 */
function verifyCommitment(hash, intent) {
  // TODO: Implement real verification with stored salts
  // This is a placeholder that always returns true
  return typeof hash === 'string' && hash.length === 64;
}

module.exports = {
  commitmentHash,
  deterministicHash,
  verifyCommitment
};
