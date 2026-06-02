#!/bin/bash
set -e
cd /Users/ryanmonsurate/Projects/Chatroulette

# Run vitest and capture output
npx vitest run --reporter=verbose 2>&1 | tee /tmp/vitest-output.txt || true

# Parse results for structured output
echo ""
echo "===FABRIC_TEST_RESULTS==="

# Extract test names and pass/fail from vitest output
# Vitest verbose output format: " ✓ renders an 8×8 board (42ms)" or " ✗ renders an 8×8 board"
while IFS= read -r line; do
  if echo "$line" | grep -qE '^\s*✓\s+'; then
    test_name=$(echo "$line" | sed -E 's/^\s*✓\s+//' | sed -E 's/\s*\([0-9]+ms\)$//')
    echo "PASS: $test_name"
  elif echo "$line" | grep -qE '^\s*✗\s+'; then
    test_name=$(echo "$line" | sed -E 's/^\s*✗\s+//')
    echo "FAIL: $test_name | test failed"
  fi
done < /tmp/vitest-output.txt

echo "===END_TEST_RESULTS==="

# Count results
pass_count=$(grep -c "^PASS:" <<< "$(cat /tmp/vitest-output.txt | grep -E '^\s*✓')" || echo 0)
fail_count=$(grep -c "^FAIL:" <<< "$(cat /tmp/vitest-output.txt | grep -E '^\s*✗')" || echo 0)
total=$((pass_count + fail_count))

echo "tests passed $pass_count out of $total"
