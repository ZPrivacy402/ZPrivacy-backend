#!/usr/bin/env node

/**
 * CLI Evaluation Tool
 * 
 * Run intent evaluation from command line.
 * Usage: node src/cli/run-eval.js <intent-file.json>
 */

const fs = require('fs');
const path = require('path');
const { evaluateIntent } = require('../core/evaluator');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader() {
  console.log('\n' + colorize('═'.repeat(60), 'cyan'));
  console.log(colorize('  ZPrivacy402 Intent Evaluator (Mock)', 'bright'));
  console.log(colorize('═'.repeat(60), 'cyan') + '\n');
}

function printSection(title) {
  console.log(colorize(`\n▶ ${title}`, 'bright'));
  console.log(colorize('─'.repeat(40), 'dim'));
}

function printResult(label, value, status = 'info') {
  const statusColors = {
    success: 'green',
    error: 'red',
    warn: 'yellow',
    info: 'blue'
  };
  const color = statusColors[status] || 'reset';
  console.log(`  ${colorize(label + ':', 'dim')} ${colorize(value, color)}`);
}

function printCheck(name, ok, reason) {
  const icon = ok ? colorize('✓', 'green') : colorize('✗', 'red');
  const status = ok ? colorize('PASS', 'green') : colorize('FAIL', 'red');
  console.log(`  ${icon} ${name}: ${status}`);
  if (reason) {
    console.log(`    ${colorize(reason, 'dim')}`);
  }
}

async function main() {
  printHeader();

  // Get file path from command line
  const filePath = process.argv[2];

  if (!filePath) {
    console.log(colorize('Usage: node src/cli/run-eval.js <intent-file.json>', 'yellow'));
    console.log(colorize('\nExample:', 'dim'));
    console.log(colorize('  node src/cli/run-eval.js mock/intentA.json', 'dim'));
    process.exit(1);
  }

  // Resolve file path
  const resolvedPath = path.resolve(process.cwd(), filePath);

  // Check if file exists
  if (!fs.existsSync(resolvedPath)) {
    console.log(colorize(`Error: File not found: ${resolvedPath}`, 'red'));
    console.log(colorize('\nTip: Run "npm run seed" to generate mock data files', 'yellow'));
    process.exit(1);
  }

  // Read and parse file
  let intentData;
  try {
    const fileContent = fs.readFileSync(resolvedPath, 'utf8');
    intentData = JSON.parse(fileContent);
  } catch (error) {
    console.log(colorize(`Error parsing JSON: ${error.message}`, 'red'));
    process.exit(1);
  }

  printSection('Input');
  console.log(`  ${colorize('File:', 'dim')} ${filePath}`);
  console.log(`  ${colorize('Agent ID:', 'dim')} ${colorize(intentData.agentId, 'cyan')}`);
  console.log(`  ${colorize('Intent:', 'dim')}`);
  console.log(colorize(JSON.stringify(intentData.intent, null, 4).split('\n').map(l => '    ' + l).join('\n'), 'dim'));

  printSection('Evaluation');

  try {
    const startTime = Date.now();
    const result = await evaluateIntent(intentData.intent, intentData.agentId);
    const elapsed = Date.now() - startTime;

    printSection('Rule Checks');
    
    for (const [ruleName, check] of Object.entries(result.data.checks)) {
      printCheck(
        ruleName.charAt(0).toUpperCase() + ruleName.slice(1),
        check.ok,
        check.reason
      );
    }

    printSection('Results');
    
    const riskColor = result.data.riskLevel === 'LOW' ? 'green' :
                      result.data.riskLevel === 'MED' ? 'yellow' : 'red';
    
    printResult('Risk Score', result.data.riskScore.toFixed(2), riskColor === 'green' ? 'success' : riskColor === 'yellow' ? 'warn' : 'error');
    printResult('Risk Level', result.data.riskLevel, riskColor === 'green' ? 'success' : riskColor === 'yellow' ? 'warn' : 'error');
    printResult('Commitment Hash', result.data.commitmentHash.slice(0, 32) + '...', 'info');
    printResult('Payload Size', `${result.data.payloadSize} bytes`, 'info');
    printResult('Evaluation Time', `${elapsed}ms`, 'info');

    printSection('Envelope (Preview)');
    const envelopePreview = result.data.envelope.slice(0, 60) + '...';
    console.log(`  ${colorize(envelopePreview, 'dim')}`);

    console.log('\n' + colorize('═'.repeat(60), 'cyan'));
    console.log(colorize('  Evaluation Complete', 'green'));
    console.log(colorize('═'.repeat(60), 'cyan') + '\n');

  } catch (error) {
    console.log(colorize(`\nEvaluation Error: ${error.message}`, 'red'));
    process.exit(1);
  }
}

main().catch(error => {
  console.error(colorize(`Fatal Error: ${error.message}`, 'red'));
  process.exit(1);
});
