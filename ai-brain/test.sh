#!/bin/bash

# Test script for AI Brain server
set -euo pipefail

echo "Testing AI Brain API..."
echo ""

# Test health check
echo "1. Health Check:"
if ! curl -sf http://localhost:3001/health | jq .; then
  echo "❌ Health check failed"
  exit 1
fi
echo ""
echo ""

# Test AI edit endpoint
echo "2. AI Edit Request:"
if ! curl -sf -X POST http://localhost:3001/api/ai-edit \
  -H "Content-Type: application/json" \
  -d @test-request.json | jq .; then
  echo "❌ AI edit request failed"
  exit 1
fi

echo ""
echo "✅ All tests passed!"
