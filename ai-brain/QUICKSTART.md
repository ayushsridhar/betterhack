# AI Brain - Quick Start Guide

## Setup (Do This First!)

### 1. Add Your Anthropic API Key

Edit `.env` and add your API key:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
PORT=3001
```

### 2. Start the Server

```bash
npm run dev
```

You should see:
```
🧠 AI Brain server running on http://localhost:3001
📡 Ready to receive edit requests at POST /api/ai-edit
💚 Health check available at GET /health
```

### 3. Test It

In a new terminal:

```bash
./test.sh
```

This will send a test request with:
- An arrow annotation between two clips
- A prompt: "smooth slide transition to the right, 500ms"
- Mock timeline data

Expected response:
```json
{
  "success": true,
  "changes": [
    {
      "type": "add_transition",
      "description": "Added slide transition (500ms, right)",
      "mcpCall": {
        "tool": "add_transition",
        "params": {
          "effectAId": "clip-1",
          "effectBId": "clip-2",
          "transitionType": "slide",
          "duration": 500,
          "direction": "right"
        }
      }
    }
  ],
  "sessionId": "..."
}
```

## Integration Instructions

### For Member 2 (UI)

When user submits a prompt with annotations:

```javascript
// 1. Get annotations from Member 1
const annotations = getAnnotations() // Member 1's API

// 2. Get timeline state
const timelineState = {
  effects: omnislate.context.state.effects,
  tracks: omnislate.context.state.tracks,
  transitions: omnislate.context.state.transitions,
  filters: omnislate.context.state.filters,
  animations: omnislate.context.state.animations,
  settings: omnislate.context.state.settings,
}

// 3. Call AI Brain
const response = await fetch('http://localhost:3001/api/ai-edit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    annotations,
    prompt: userPromptText,
    timelineState,
    sessionId: currentSessionId, // optional, for conversation history
  }),
})

const result = await response.json()

// 4. Handle response
if (result.success) {
  // Show accept/reject dialog with result.changes
  // Each change has: type, description, mcpCall

  // If user accepts, pass result.changes to Member 3
  for (const change of result.changes) {
    await executeMCPCall(change.mcpCall) // Member 3's API
  }

  // Save sessionId for follow-up prompts
  currentSessionId = result.sessionId
} else {
  // Show error: result.error
}
```

### For Member 3 (MCP Server)

The AI Brain will request these MCP tools. Map them to Omniclip actions:

#### `add_transition(effectAId, effectBId, transitionType, duration, direction?)`
```javascript
// Map to:
omnislate.context.actions.add_transition({
  effectAId: params.effectAId,
  effectBId: params.effectBId,
  type: params.transitionType,
  duration: params.duration,
  direction: params.direction,
})
```

#### `modify_effect(effectId, properties)`
```javascript
// Map to:
omnislate.context.actions.modify_effect(
  params.effectId,
  params.properties
)
```

#### `add_filter(effectId, filterType, intensity)`
```javascript
// Map to:
omnislate.context.actions.add_filter({
  effectId: params.effectId,
  type: params.filterType,
  params: { intensity: params.intensity },
})
```

#### `add_animation(effectId, animationType, duration, params?)`
```javascript
// Map to:
omnislate.context.actions.add_animation({
  effectId: params.effectId,
  type: params.animationType,
  duration: params.duration,
  params: params.params || {},
})
```

#### Other tools:
- `split_clip(effectId, timestamp)` → `actions.split_effect()`
- `move_effect(effectId, track?, start_at_position?)` → `actions.move_effect()`
- `remove_effect(effectId)` → `actions.remove_effect()`
- `adjust_duration(effectId, newDuration, trimFrom?)` → `actions.adjust_effect_duration()`

### Update MCP Client

Once Member 3 has the MCP server ready, update `src/mcp-client.ts`:

```typescript
async execute(call: MCPCall): Promise<MCPResult> {
  // Replace mock implementation with:
  const response = await fetch('http://localhost:YOUR_MCP_PORT/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(call),
  })

  return await response.json()
}
```

Or if same process:

```typescript
async execute(call: MCPCall): Promise<MCPResult> {
  // Direct function call
  return await mcpServer.execute(call)
}
```

## API Reference

### POST `/api/ai-edit`

Main endpoint for processing AI edits.

**Request:**
```typescript
{
  annotations: Annotation[],
  prompt: string,
  timelineState: TimelineState,
  sessionId?: string  // for conversation history
}
```

**Response:**
```typescript
{
  success: boolean,
  changes: Change[],
  sessionId: string,
  error?: string
}
```

### GET `/api/history/:sessionId`

Get conversation and edit history for a session.

### DELETE `/api/session/:sessionId`

Clear a session's history.

### GET `/health`

Health check.

## Architecture Flow

```
User draws arrow between clips
    ↓
User right-clicks → prompt: "fade transition"
    ↓
Member 2 (UI)
    ├─ Get annotations from Member 1
    ├─ Get timeline state from Omniclip context
    └─ POST to /api/ai-edit
    ↓
Member 4 (AI Brain - THIS)
    ├─ Serialize annotations → "Arrow from clip A to clip B..."
    ├─ Build prompt for Claude with timeline context
    ├─ Claude analyzes and returns MCP tool calls
    └─ Return changes to Member 2
    ↓
Member 2 shows accept/reject dialog
    ↓ (if accepted)
Member 3 (MCP Server)
    └─ Execute tool calls → Update Omniclip timeline
```

## Default Behaviors (No Prompt)

- **Arrow**: Fade transition, 500ms
- **Rectangle**: Select clip
- **Circle**: Highlight clip
- **Freehand**: AI interprets

## Debugging

### Check server logs

The server logs all requests and Claude responses:

```
[Orchestrator] Processing edit request...
[Orchestrator] Session ID: abc-123
[Orchestrator] Annotations: 1
[Orchestrator] Prompt: fade transition
[Claude] Sending request...
[Claude] User prompt: fade transition
[Claude] Annotation context: Arrow pointing right from...
[Claude] Response received: {...}
[Claude] Extracted MCP calls: [...]
[MCP Client] Executing add_transition: {...}
[Orchestrator] Edit completed successfully
```

### Test with cURL

```bash
curl -X POST http://localhost:3001/api/ai-edit \
  -H "Content-Type: application/json" \
  -d @test-request.json | jq .
```

## Troubleshooting

**"ANTHROPIC_API_KEY not found"**
- Add your API key to `.env`

**"Cannot connect to server"**
- Make sure server is running: `npm run dev`
- Check it's on port 3001: `curl http://localhost:3001/health`

**"No editing operations were identified"**
- Claude couldn't determine what to do
- Check annotation context is clear
- Add more specific prompt text

**MCP execution fails**
- MCP client is currently mocked
- Wait for Member 3 to provide real implementation
- Update `src/mcp-client.ts` when ready

## Next Steps

1. ✅ Start server: `npm run dev`
2. ✅ Test with `./test.sh`
3. 🔄 Integrate with Member 2's UI
4. 🔄 Wait for Member 3's MCP server
5. 🔄 Replace mock MCP client
6. 🎉 Test end-to-end!

Good luck with the hackathon! 🚀
