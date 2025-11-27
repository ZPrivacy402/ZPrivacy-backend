/**
 * Logger Utility
 * 
 * Simple timestamped console logging with log levels.
 */

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

/**
 * Get current timestamp string
 * @returns {string}
 */
function getTimestamp() {
  return new Date().toISOString().split('T')[1].split('.')[0];
}

/**
 * Format log message
 * @param {string} level - Log level
 * @param {string} message - Message to log
 * @param {string} color - Color code
 */
function formatLog(level, message, color) {
  const timestamp = colors.gray + getTimestamp() + colors.reset;
  const levelStr = color + `[${level}]` + colors.reset;
  console.log(`${timestamp} ${levelStr} ${message}`);
}

/**
 * Info level log
 * @param {string} message
 */
function info(message) {
  formatLog('INFO', message, colors.blue);
}

/**
 * Success level log
 * @param {string} message
 */
function success(message) {
  formatLog('PASS', message, colors.green);
}

/**
 * Warning level log
 * @param {string} message
 */
function warn(message) {
  formatLog('WARN', message, colors.yellow);
}

/**
 * Error level log
 * @param {string} message
 */
function error(message) {
  formatLog('FAIL', message, colors.red);
}

/**
 * Generic log with custom level
 * @param {string} level - 'info', 'success', 'warn', 'error'
 * @param {string} message
 */
function log(level, message) {
  switch (level) {
    case 'success':
      success(message);
      break;
    case 'warn':
      warn(message);
      break;
    case 'error':
      error(message);
      break;
    default:
      info(message);
  }
}

module.exports = {
  info,
  success,
  warn,
  error,
  log
};
