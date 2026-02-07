#!/bin/bash

echo "========================================"
echo "AI BRAIN STRESS TEST"
echo "========================================"
echo ""

if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
  echo "❌ Server not running"
  exit 1
fi

echo "✅ Server running"
echo ""

# Test 1: Multiple rapid requests
echo "Test 1: Multiple Rapid Requests (5 concurrent)"
echo "--------------------------------------"

START_TIME=$(date +%s)

for i in {1..5}; do
  (
    curl -s -X POST http://localhost:3001/api/ai-edit \
      -H "Content-Type: application/json" \
      -d '{
        "annotations": [{"type": "arrow", "coordinates": {"start": {"x": 100, "y": 200}, "end": {"x": 400, "y": 200}}, "affectedEffects": ["clip-1", "clip-2"]}],
        "prompt": "fade transition",
        "timelineState": {
          "effects": [
            {"id": "clip-1", "kind": "video", "name": "test.mp4", "track": 0, "start_at_position": 0, "duration": 5000, "start": 0, "end": 5000, "thumbnail": "", "raw_duration": 5000, "frames": 120, "file_hash": "h1", "rect": {"width": 1920, "height": 1080, "scaleX": 1, "scaleY": 1, "position_on_canvas": {"x": 0, "y": 0}, "rotation": 0, "pivot": {"x": 0, "y": 0}}},
            {"id": "clip-2", "kind": "video", "name": "test2.mp4", "track": 0, "start_at_position": 5000, "duration": 5000, "start": 0, "end": 5000, "thumbnail": "", "raw_duration": 5000, "frames": 120, "file_hash": "h2", "rect": {"width": 1920, "height": 1080, "scaleX": 1, "scaleY": 1, "position_on_canvas": {"x": 0, "y": 0}, "rotation": 0, "pivot": {"x": 0, "y": 0}}}
          ],
          "tracks": [{"id": "track-1", "locked": false, "visible": true, "muted": false}],
          "transitions": [],
          "filters": [],
          "animations": [],
          "settings": {"width": 1920, "height": 1080, "bitrate": 5000, "aspectRatio": "16/9", "standard": "1080p"}
        }
      }' > /tmp/stress-test-$i.json &
  ) &
done

wait

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "Completed 5 concurrent requests in ${DURATION}s"
echo ""

# Check all responses
SUCCESS_COUNT=0
for i in {1..5}; do
  if [ -f /tmp/stress-test-$i.json ]; then
    SUCCESS=$(cat /tmp/stress-test-$i.json | jq -r '.success')
    if [ "$SUCCESS" = "true" ]; then
      SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    fi
    rm /tmp/stress-test-$i.json
  fi
done

echo "✅ $SUCCESS_COUNT/5 requests succeeded"
echo ""

# Test 2: Session continuity (sequential requests with same session)
echo "Test 2: Session Continuity"
echo "--------------------------------------"

# First request - create session
RESPONSE1=$(curl -s -X POST http://localhost:3001/api/ai-edit \
  -H "Content-Type: application/json" \
  -d '{
    "annotations": [{"type": "arrow", "coordinates": {"start": {"x": 100, "y": 200}, "end": {"x": 400, "y": 200}}, "affectedEffects": ["clip-1", "clip-2"]}],
    "prompt": "add fade transition",
    "timelineState": {
      "effects": [
        {"id": "clip-1", "kind": "video", "name": "test.mp4", "track": 0, "start_at_position": 0, "duration": 5000, "start": 0, "end": 5000, "thumbnail": "", "raw_duration": 5000, "frames": 120, "file_hash": "h1", "rect": {"width": 1920, "height": 1080, "scaleX": 1, "scaleY": 1, "position_on_canvas": {"x": 0, "y": 0}, "rotation": 0, "pivot": {"x": 0, "y": 0}}},
        {"id": "clip-2", "kind": "video", "name": "test2.mp4", "track": 0, "start_at_position": 5000, "duration": 5000, "start": 0, "end": 5000, "thumbnail": "", "raw_duration": 5000, "frames": 120, "file_hash": "h2", "rect": {"width": 1920, "height": 1080, "scaleX": 1, "scaleY": 1, "position_on_canvas": {"x": 0, "y": 0}, "rotation": 0, "pivot": {"x": 0, "y": 0}}}
      ],
      "tracks": [{"id": "track-1", "locked": false, "visible": true, "muted": false}],
      "transitions": [],
      "filters": [],
      "animations": [],
      "settings": {"width": 1920, "height": 1080, "bitrate": 5000, "aspectRatio": "16/9", "standard": "1080p"}
    }
  }')

SESSION_ID=$(echo "$RESPONSE1" | jq -r '.sessionId')
echo "Session ID: $SESSION_ID"

SUCCESS1=$(echo "$RESPONSE1" | jq -r '.success')
if [ "$SUCCESS1" = "true" ]; then
  echo "✅ First request succeeded"
else
  echo "❌ First request failed"
fi

# Second request - use same session
RESPONSE2=$(curl -s -X POST http://localhost:3001/api/ai-edit \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"annotations\": [{\"type\": \"circle\", \"coordinates\": {\"start\": {\"x\": 100, \"y\": 200}, \"end\": {\"x\": 400, \"y\": 200}}, \"affectedEffects\": [\"clip-1\"]}],
    \"prompt\": \"also add a blur filter to the first clip\",
    \"timelineState\": {
      \"effects\": [
        {\"id\": \"clip-1\", \"kind\": \"video\", \"name\": \"test.mp4\", \"track\": 0, \"start_at_position\": 0, \"duration\": 5000, \"start\": 0, \"end\": 5000, \"thumbnail\": \"\", \"raw_duration\": 5000, \"frames\": 120, \"file_hash\": \"h1\", \"rect\": {\"width\": 1920, \"height\": 1080, \"scaleX\": 1, \"scaleY\": 1, \"position_on_canvas\": {\"x\": 0, \"y\": 0}, \"rotation\": 0, \"pivot\": {\"x\": 0, \"y\": 0}}},
        {\"id\": \"clip-2\", \"kind\": \"video\", \"name\": \"test2.mp4\", \"track\": 0, \"start_at_position\": 5000, \"duration\": 5000, \"start\": 0, \"end\": 5000, \"thumbnail\": \"\", \"raw_duration\": 5000, \"frames\": 120, \"file_hash\": \"h2\", \"rect\": {\"width\": 1920, \"height\": 1080, \"scaleX\": 1, \"scaleY\": 1, \"position_on_canvas\": {\"x\": 0, \"y\": 0}, \"rotation\": 0, \"pivot\": {\"x\": 0, \"y\": 0}}}
      ],
      \"tracks\": [{\"id\": \"track-1\", \"locked\": false, \"visible\": true, \"muted\": false}],
      \"transitions\": [],
      \"filters\": [],
      \"animations\": [],
      \"settings\": {\"width\": 1920, \"height\": 1080, \"bitrate\": 5000, \"aspectRatio\": \"16/9\", \"standard\": \"1080p\"}
    }
  }")

SUCCESS2=$(echo "$RESPONSE2" | jq -r '.success')
if [ "$SUCCESS2" = "true" ]; then
  echo "✅ Second request (same session) succeeded"
  echo "Changes: $(echo "$RESPONSE2" | jq -r '.changes[] | .description')"
else
  echo "❌ Second request failed"
fi

echo ""
echo "========================================"
echo "STRESS TEST COMPLETE"
echo "========================================"
