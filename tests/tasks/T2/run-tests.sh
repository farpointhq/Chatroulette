#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../../.."

# Run tests using Node.js built-in test runner
# We capture output and parse for structured results
node --test tests/tasks/T2/server.test.js 2>&1 | tee /tmp/t2-test-output.txt || true

# Parse output into structured results
echo ""
echo "===FABRIC_TEST_RESULTS==="

# Extract test names and results from node:test TAP-like output
# Node test runner outputs lines like:
# ✔ should create an HTTP server (12.345ms)
# ✖ should create a WebSocket server (0.123ms)
#   Error: Not implemented

PASS_COUNT=0
FAIL_COUNT=0
TOTAL_COUNT=0

while IFS= read -r line; do
  # Match passing tests: lines starting with ✔ (checkmark)
  if echo "$line" | grep -qE '^\s*✔\s+'; then
    TEST_NAME=$(echo "$line" | sed -E 's/^\s*✔\s+//' | sed -E 's/\s*\([0-9.]+m?s\)\s*$//')
    echo "PASS: $TEST_NAME"
    PASS_COUNT=$((PASS_COUNT + 1))
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
  fi

  # Match failing tests: lines starting with ✖ (x mark)
  if echo "$line" | grep -qE '^\s*✖\s+'; then
    TEST_NAME=$(echo "$line" | sed -E 's/^\s*✖\s+//' | sed -E 's/\s*\([0-9.]+m?s\)\s*$//')
    # Get the next line as error detail
    ERROR_MSG=$(grep -A1 "^\s*✖\s*${TEST_NAME}" /tmp/t2-test-output.txt 2>/dev/null | tail -1 | sed 's/^\s*//' | cut -c1-100 || echo "Error")
    echo "FAIL: $TEST_NAME | $ERROR_MSG"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
  fi
done < /tmp/t2-test-output.txt

echo "===END_TEST_RESULTS==="
echo "tests passed $PASS_COUNT out of $TOTAL_COUNT"
