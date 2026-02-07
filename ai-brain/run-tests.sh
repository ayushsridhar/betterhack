#!/bin/bash

# Run comprehensive test scenarios

echo "========================================"
echo "AI BRAIN COMPREHENSIVE TEST SUITE"
echo "========================================"
echo ""

# Check if server is running
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
  echo "❌ Server is not running on port 3001"
  echo "Start it with: npm run dev"
  exit 1
fi

echo "✅ Server is running"
echo ""

# Read scenarios
SCENARIOS=$(cat test-scenarios.json | jq -r '.scenarios[] | @json')

TOTAL=0
PASSED=0
FAILED=0

while IFS= read -r scenario; do
  TOTAL=$((TOTAL + 1))

  NAME=$(echo "$scenario" | jq -r '.name')
  DESC=$(echo "$scenario" | jq -r '.description')
  REQUEST=$(echo "$scenario" | jq '.request')

  echo "----------------------------------------"
  echo "Test $TOTAL: $NAME"
  echo "Description: $DESC"
  echo ""

  # Make request
  RESPONSE=$(curl -s -X POST http://localhost:3001/api/ai-edit \
    -H "Content-Type: application/json" \
    -d "$REQUEST")

  # Check if successful
  SUCCESS=$(echo "$RESPONSE" | jq -r '.success')

  if [ "$SUCCESS" = "true" ]; then
    PASSED=$((PASSED + 1))
    echo "✅ PASSED"

    # Show changes
    CHANGES=$(echo "$RESPONSE" | jq -r '.changes[] | "  - \(.type): \(.description)"')
    echo ""
    echo "Changes made:"
    echo "$CHANGES"

    # Show MCP calls
    echo ""
    echo "MCP Calls:"
    echo "$RESPONSE" | jq -r '.changes[] | "  Tool: \(.mcpCall.tool)"'
    echo "$RESPONSE" | jq -r '.changes[] | "  Params: \(.mcpCall.params | @json)"' | head -20

  else
    FAILED=$((FAILED + 1))
    echo "❌ FAILED"
    ERROR=$(echo "$RESPONSE" | jq -r '.error')
    echo "Error: $ERROR"
  fi

  echo ""

done <<< "$SCENARIOS"

echo "========================================"
echo "SUMMARY"
echo "========================================"
echo "Total Tests: $TOTAL"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "🎉 All tests passed!"
else
  echo "⚠️  Some tests failed"
fi
