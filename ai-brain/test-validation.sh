#!/bin/bash

echo "========================================"
echo "AI BRAIN VALIDATION TEST"
echo "========================================"
echo ""

TEST_ENDPOINT="http://localhost:3001/api/ai-edit"

# Test 1: Missing annotations
echo "Test 1: Missing annotations"
RESPONSE=$(curl -s -X POST $TEST_ENDPOINT -H "Content-Type: application/json" -d '{"prompt": "test", "timelineState": {}}')
ERROR=$(echo "$RESPONSE" | jq -r '.error')
if [[ "$ERROR" == *"annotations"* ]]; then
  echo "✅ Correctly rejected missing annotations"
else
  echo "❌ Should have rejected missing annotations"
fi
echo ""

# Test 2: Missing timeline state
echo "Test 2: Missing timelineState"
RESPONSE=$(curl -s -X POST $TEST_ENDPOINT -H "Content-Type: application/json" -d '{"annotations": [], "prompt": "test"}')
ERROR=$(echo "$RESPONSE" | jq -r '.error')
if [[ "$ERROR" == *"timelineState"* ]]; then
  echo "✅ Correctly rejected missing timelineState"
else
  echo "❌ Should have rejected missing timelineState"
fi
echo ""

# Test 3: Invalid JSON
echo "Test 3: Invalid JSON"
RESPONSE=$(curl -s -X POST $TEST_ENDPOINT -H "Content-Type: application/json" -d 'not-json')
if [[ "$RESPONSE" == *"error"* ]] || [[ "$RESPONSE" == "" ]]; then
  echo "✅ Handled invalid JSON"
else
  echo "❌ Should have handled invalid JSON"
fi
echo ""

# Test 4: Large request (should work)
echo "Test 4: Large timeline (10 clips)"
EFFECTS="["
for i in {1..10}; do
  EFFECTS="$EFFECTS{\"id\":\"clip-$i\",\"kind\":\"video\",\"name\":\"clip$i.mp4\",\"track\":0,\"start_at_position\":$((i*5000)),\"duration\":5000,\"start\":0,\"end\":5000,\"thumbnail\":\"\",\"raw_duration\":5000,\"frames\":120,\"file_hash\":\"hash$i\",\"rect\":{\"width\":1920,\"height\":1080,\"scaleX\":1,\"scaleY\":1,\"position_on_canvas\":{\"x\":0,\"y\":0},\"rotation\":0,\"pivot\":{\"x\":0,\"y\":0}}}"
  if [ $i -lt 10 ]; then EFFECTS="$EFFECTS,"; fi
done
EFFECTS="$EFFECTS]"

RESPONSE=$(curl -s -X POST $TEST_ENDPOINT -H "Content-Type: application/json" -d "{
  \"annotations\": [{\"type\":\"arrow\",\"coordinates\":{\"start\":{\"x\":100,\"y\":200},\"end\":{\"x\":400,\"y\":200}},\"affectedEffects\":[\"clip-1\",\"clip-2\"]}],
  \"prompt\": \"fade transition\",
  \"timelineState\": {
    \"effects\": $EFFECTS,
    \"tracks\": [{\"id\":\"track-1\",\"locked\":false,\"visible\":true,\"muted\":false}],
    \"transitions\": [],
    \"filters\": [],
    \"animations\": [],
    \"settings\": {\"width\":1920,\"height\":1080,\"bitrate\":5000,\"aspectRatio\":\"16/9\",\"standard\":\"1080p\"}
  }
}")

SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
  echo "✅ Handled large timeline (10 clips)"
else
  echo "⚠️  Large timeline test: $(echo "$RESPONSE" | jq -r '.error')"
fi
echo ""

echo "========================================"
echo "VALIDATION COMPLETE"
echo "========================================"
