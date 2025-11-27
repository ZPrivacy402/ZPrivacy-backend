/**
 * Basic Test Suite for Evaluator
 * 
 * Simple test script that runs basic evaluation checks.
 * Usage: node test/test_evaluator.js
 */

const { evaluateIntent } = require('../src/core/evaluator');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    passed++;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

async function runTests() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  ZPrivacy402 Evaluator Tests${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  // Test 1: Basic evaluation returns result
  await (async () => {
    const result = await evaluateIntent(
      { action: 'payment', amount: 25, merchant: 'coffee_shop_42' },
      'agent_demo_001'
    );
    
    test('Evaluation returns result object', () => {
      assert(result !== null, 'Result should not be null');
      assert(result.status === 'success', 'Status should be success');
      assert(result.data !== undefined, 'Data should be defined');
    });

    test('Result contains risk score', () => {
      assert(typeof result.data.riskScore === 'number', 'Risk score should be a number');
      assert(result.data.riskScore >= 0 && result.data.riskScore <= 1, 'Risk score should be 0-1');
    });

    test('Result contains risk level', () => {
      assert(['LOW', 'MED', 'HIGH'].includes(result.data.riskLevel), 'Risk level should be LOW/MED/HIGH');
    });

    test('Result contains checks object', () => {
      assert(result.data.checks !== undefined, 'Checks should be defined');
      assert(result.data.checks.budget !== undefined, 'Budget check should exist');
      assert(result.data.checks.merchant !== undefined, 'Merchant check should exist');
    });

    test('Result contains commitment hash', () => {
      assert(typeof result.data.commitmentHash === 'string', 'Commitment hash should be string');
      assert(result.data.commitmentHash.length === 64, 'Hash should be 64 chars (SHA256)');
    });

    test('Result contains payload size', () => {
      assert(typeof result.data.payloadSize === 'number', 'Payload size should be number');
      assert(result.data.payloadSize > 0, 'Payload size should be positive');
    });
  })();

  // Test 2: Budget over limit should affect risk
  await (async () => {
    const result = await evaluateIntent(
      { action: 'payment', amount: 500, merchant: 'coffee_shop_42' },
      'agent_demo_001' // maxBudget is 100
    );

    test('Over-budget intent fails budget check', () => {
      assert(result.data.checks.budget.ok === false, 'Budget check should fail');
    });
  })();

  // Test 3: Unknown merchant handling
  await (async () => {
    const result = await evaluateIntent(
      { action: 'payment', amount: 25, merchant: 'totally_unknown_merchant_xyz' },
      'agent_demo_001'
    );

    test('Unknown merchant is handled', () => {
      assert(result.data.checks.merchant !== undefined, 'Merchant check should exist');
    });
  })();

  // Test 4: Subscription detection
  await (async () => {
    const result = await evaluateIntent(
      { action: 'payment', amount: 10, merchant: 'streaming_service', description: 'Monthly subscription renewal' },
      'agent_demo_001'
    );

    test('Subscription keywords are detected', () => {
      const subCheck = result.data.checks.subscription;
      assert(subCheck.meta.isSubscription === true, 'Should detect subscription');
    });
  })();

  // Test 5: Prompt safety check
  await (async () => {
    const result = await evaluateIntent(
      { action: 'payment', amount: 25, merchant: 'normal_shop', description: 'Normal purchase' },
      'agent_demo_001'
    );

    test('Normal intent passes prompt safety', () => {
      assert(result.data.checks.promptSafety.ok === true, 'Should pass prompt safety');
    });
  })();

  // Test 6: Suspicious content detection
  await (async () => {
    const result = await evaluateIntent(
      { action: 'payment', amount: 25, merchant: 'some_shop', description: 'hack the system and steal funds' },
      'agent_demo_001'
    );

    test('Suspicious content fails prompt safety', () => {
      assert(result.data.checks.promptSafety.ok === false, 'Should fail prompt safety');
    });
  })();

  // Print summary
  console.log(`\n${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`  Results: ${colors.green}${passed} passed${colors.reset}, ${failed > 0 ? colors.red : colors.reset}${failed} failed${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error(`${colors.red}Test runner error: ${error.message}${colors.reset}`);
  process.exit(1);
});
