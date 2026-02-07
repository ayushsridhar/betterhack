#!/bin/bash

# Test script for AI Brain server

echo "Testing AI Brain API..."
echo ""

# Test health check
echo "1. Health Check:"
curl -s http://localhost:3001/health | jq .
echo ""
echo ""

# Test AI edit endpoint
echo "2. AI Edit Request:"
curl -s -X POST http://localhost:3001/api/ai-edit \
  -H "Content-Type: application/json" \
  -d @test-request.json | jq .

echo ""
echo "Done!"
