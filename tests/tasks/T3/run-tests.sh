#!/bin/bash
set -e

cd /Users/ryanmonsurate/Projects/Chatroulette

# Build the engine TypeScript to dist/ so tests can import it
npx tsc -p tsconfig.engine.json 2>&1 || true

# Run the test file with Node
node tests/tasks/T3/chessEngine.test.js
