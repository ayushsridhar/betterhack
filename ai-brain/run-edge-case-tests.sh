#!/bin/bash

echo "========================================"
echo "AI BRAIN EDGE CASE TEST SUITE"
echo "========================================"
echo ""

# Check if server is running
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
  echo "❌ Server is not running on port 3001"
  exit 1
fi

echo "✅ Server is running"
echo ""

SCENARIOS=$(cat test-edge-cases.json | jq -r '.scenarios[] | @json')

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

  RESPONSE=$(curl -s -X POST http://localhost:3001/api/ai-edit \
    -H "Content-Type: application/json" \
    -d "$REQUEST")

  SUCCESS=$(echo "$RESPONSE" | jq -r '.success')

  if [ "$SUCCESS" = "true" ]; then
    PASSED=$((PASSED + 1))
    echo "✅ PASSED"
    echo ""
    echo "Changes:"
    echo "$RESPONSE" | jq -r '.changes[] | "  - \(.type): \(.description)"'
  elif [ "$SUCCESS" = "false" ]; then
    # Check if error is expected/handled gracefully
    ERROR=$(echo "$RESPONSE" | jq -r '.error')
    if [[ "$ERROR" == *"No editing operations"* ]] || \
       [[ "$ERROR" == *"Could not"* ]] || \
       [[ "$ERROR" == *"Invalid"* ]]; then
      PASSED=$((PASSED + 1))
      echo "✅ PASSED (Gracefully handled error)"
      echo "Error: $ERROR"
    else
      FAILED=$((FAILED + 1))
      echo "❌ FAILED"
      echo "Error: $ERROR"
    fi
  else
    FAILED=$((FAILED + 1))
    echo "❌ FAILED (Invalid response)"
    echo "$RESPONSE" | head -5
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
  echo "🎉 All edge cases handled!"
else
  echo "⚠️  Some edge cases failed"
  exit 1
fi
