#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

# Run vitest with JSON reporter to parse results
npx vitest run --reporter=json --config vite.config.ts --run tests/tasks/T8/Lobby.test.tsx > /tmp/vitest-output.json 2>/tmp/vitest-stderr.txt || true

# Check if output exists
if [ ! -f /tmp/vitest-output.json ]; then
    echo "===FABRIC_TEST_RESULTS==="
    echo "FAIL: vitest-json-parse | No output file generated"
    echo "===END_TEST_RESULTS==="
    echo "tests passed 0 out of N"
    exit 1
fi

# Parse JSON and emit structured results
echo "===FABRIC_TEST_RESULTS==="

# Use node to parse the JSON results
node -e "
const fs = require('fs');
let data;
try {
  data = JSON.parse(fs.readFileSync('/tmp/vitest-output.json', 'utf8'));
} catch (e) {
  console.log('FAIL: vitest-json-parse | ' + e.message);
  console.log('===END_TEST_RESULTS===');
  console.log('tests passed 0 out of N');
  process.exit(1);
}

const testResults = data.testResults || [];
let totalTests = 0;
let passedTests = 0;

for (const suite of testResults) {
  for (const test of suite.assertionResults || []) {
    totalTests++;
    const name = test.title;
    if (test.status === 'passed') {
      passedTests++;
      console.log('PASS: ' + name);
    } else {
      const msg = test.failureMessages && test.failureMessages[0] ? test.failureMessages[0].split('\\n')[0] : 'failed';
      console.log('FAIL: ' + name + ' | ' + msg);
    }
  }
}

console.log('===END_TEST_RESULTS===');
console.log('tests passed ' + passedTests + ' out of ' + totalTests);
"
