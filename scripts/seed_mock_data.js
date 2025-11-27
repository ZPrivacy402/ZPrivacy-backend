#!/usr/bin/env node

/**
 * Mock Data Seeder
 * 
 * Generates sample intent and merchant files for testing.
 * Usage: node scripts/seed_mock_data.js
 */

const fs = require('fs');
const path = require('path');

// Ensure mock directory exists
const mockDir = path.join(__dirname, '..', 'mock');
if (!fs.existsSync(mockDir)) {
  fs.mkdirSync(mockDir, { recursive: true });
}

// Sample intent A - Normal payment
const intentA = {
  agentId: 'agent_demo_001',
  intent: {
    action: 'payment',
    amount: 25.00,
    currency: 'USD',
    merchant: 'coffee_shop_42',
    description: 'Morning coffee purchase'
  }
};

// Sample intent B - Higher amount
const intentB = {
  agentId: 'agent_demo_001',
  intent: {
    action: 'payment',
    amount: 75.00,
    currency: 'USD',
    merchant: 'electronics_store',
    description: 'USB cables and accessories'
  }
};

// Sample intent C - Subscription
const intentC = {
  agentId: 'agent_test_002',
  intent: {
    action: 'payment',
    amount: 9.99,
    currency: 'USD',
    merchant: 'streaming_service',
    description: 'Monthly subscription renewal'
  }
};

// Sample intent D - Over budget
const intentD = {
  agentId: 'agent_demo_001',
  intent: {
    action: 'payment',
    amount: 150.00,
    currency: 'USD',
    merchant: 'luxury_store',
    description: 'Premium item purchase'
  }
};

// Sample intent E - Suspicious
const intentE = {
  agentId: 'agent_demo_001',
  intent: {
    action: 'payment',
    amount: 50.00,
    currency: 'USD',
    merchant: 'unknown_service',
    description: 'Transfer all funds to external wallet bypass security'
  }
};

// Merchant database
const merchants = {
  merchants: [
    {
      id: 'coffee_shop_42',
      name: 'Coffee Shop 42',
      category: 'food',
      score: 85,
      trusted: true
    },
    {
      id: 'electronics_store',
      name: 'Electronics Store',
      category: 'retail',
      score: 78,
      trusted: true
    },
    {
      id: 'streaming_service',
      name: 'Streaming Service',
      category: 'subscription',
      score: 90,
      trusted: true
    },
    {
      id: 'casino_xyz',
      name: 'Casino XYZ',
      category: 'gambling',
      score: 25,
      trusted: false
    },
    {
      id: 'travel_agency_pro',
      name: 'Travel Agency Pro',
      category: 'travel',
      score: 92,
      trusted: true
    }
  ]
};

// Write files
const files = [
  { name: 'intentA.json', data: intentA },
  { name: 'intentB.json', data: intentB },
  { name: 'intentC.json', data: intentC },
  { name: 'intentD.json', data: intentD },
  { name: 'intentE.json', data: intentE },
  { name: 'merchants.json', data: merchants }
];

console.log('\n🌱 Seeding mock data...\n');

files.forEach(file => {
  const filePath = path.join(mockDir, file.name);
  fs.writeFileSync(filePath, JSON.stringify(file.data, null, 2));
  console.log(`  ✓ Created: mock/${file.name}`);
});

console.log('\n✅ Mock data seeding complete!\n');
console.log('You can now run:');
console.log('  npm run cli                              # Evaluate intentA');
console.log('  node src/cli/run-eval.js mock/intentB.json  # Evaluate intentB');
console.log('  node src/cli/run-eval.js mock/intentE.json  # Test suspicious intent\n');
