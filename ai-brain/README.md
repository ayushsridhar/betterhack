# Omniclip AI Brain

AI integration for visual annotation-based video editing in Omniclip.

## Quick Start

### 1. Install Dependencies

```bash
cd ai-brain
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 3. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3001`

## API

### POST `/api/ai-edit`

Process an AI edit request.

**Request Body:**
```json
{
  "annotations": [
    {
      "type": "arrow",
      "coordinates": {
        "start": { "x": 100, "y": 200 },
        "end": { "x": 300, "y": 200 }
      },
      "affectedEffects": ["effect-id-1", "effect-id-2"],
      "color": "#ff0000",
      "drawnAtTimecode": 1000
    }
  ],
  "prompt": "smooth slide transition, 0.5s",
  "timelineState": {
    "effects": [...],
    "tracks": [...],
    "transitions": [...],
    "filters": [...],
    "animations": [...],
    "settings": {...}
  },
  "sessionId": "optional-session-id"
}
```

**Response:**
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
          "effectAId": "effect-id-1",
          "effectBId": "effect-id-2",
          "transitionType": "slide",
          "duration": 500,
          "direction": "right"
        }
      }
    }
  ],
  "sessionId": "generated-or-provided-session-id"
}
```

### GET `/api/history/:sessionId`

Get conversation and edit history for a session.

### DELETE `/api/session/:sessionId`

Clear a session's history.

### GET `/health`

Health check endpoint.

## Architecture

```
Member 2 (UI)
    ↓ POST /api/ai-edit
Member 4 (AI Brain - this module)
    ├── Serializer: Annotations → Natural Language
    ├── Claude: NL + Timeline → MCP Tool Calls
    ├── MCP Client: Execute Tool Calls
    └── History: Track Conversation & Edits
    ↓ MCP Calls
Member 3 (MCP Server)
```

## Default Annotation Behaviors

When no prompt is provided:

- **Arrow**: Simple fade transition (500ms)
- **Rectangle**: Select clip for modification
- **Circle**: Highlight/focus clip
- **Freehand**: AI interprets from shape

## Development

### File Structure

```
ai-brain/
├── src/
│   ├── server.ts         # Express server
│   ├── orchestrator.ts   # Main coordinator
│   ├── claude.ts         # Claude API integration
│   ├── serializer.ts     # Annotation serialization
│   ├── mcp-client.ts     # MCP execution (mocked)
│   ├── history.ts        # Session history
│   ├── tools.ts          # MCP tool definitions
│   └── types.ts          # TypeScript types
├── package.json
└── tsconfig.json
```

### Testing

```bash
# Example cURL request
curl -X POST http://localhost:3001/api/ai-edit \
  -H "Content-Type: application/json" \
  -d '{
    "annotations": [{
      "type": "arrow",
      "coordinates": {"start": {"x": 0, "y": 0}, "end": {"x": 100, "y": 0}},
      "affectedEffects": ["clip1", "clip2"]
    }],
    "prompt": "fade transition",
    "timelineState": {
      "effects": [
        {"id": "clip1", "kind": "video", "name": "intro.mp4", "track": 0, "start_at_position": 0, "duration": 5000, "start": 0, "end": 5000},
        {"id": "clip2", "kind": "video", "name": "main.mp4", "track": 0, "start_at_position": 5000, "duration": 10000, "start": 0, "end": 10000}
      ],
      "tracks": [{"id": "track1", "locked": false, "visible": true, "muted": false}],
      "transitions": [],
      "filters": [],
      "animations": [],
      "settings": {"width": 1920, "height": 1080, "bitrate": 5000, "aspectRatio": "16/9", "standard": "1080p"}
    }
  }'
```

## MCP Integration

Currently, the MCP client is **mocked**. Once Member 3 provides the real MCP server, update `src/mcp-client.ts` to communicate with it.

The interface is designed to be swappable - just replace the `execute()` method implementation.

## Notes for Integration

### For Member 2 (UI):

1. Query timeline state: `omnislate.context.state`
2. Get annotations from Member 1: `getAnnotations()`
3. POST to `/api/ai-edit` with both
4. Handle response: show changes in accept/reject dialog
5. Use `sessionId` for follow-up prompts

### For Member 3 (MCP Server):

The AI brain will call these MCP tools:
- `add_transition(effectAId, effectBId, transitionType, duration, direction?)`
- `modify_effect(effectId, properties)`
- `add_filter(effectId, filterType, intensity)`
- `add_animation(effectId, animationType, duration, params?)`
- `split_clip(effectId, timestamp)`
- `move_effect(effectId, track?, start_at_position?)`
- `remove_effect(effectId)`
- `adjust_duration(effectId, newDuration, trimFrom?)`

Map these to Omniclip's `context/actions.ts` functions.

## Hackathon Status

✅ **Complete:**
- Annotation serialization
- Claude integration with tool use
- MCP call generation
- Session/history management
- Retry logic
- Express server

🚧 **Pending:**
- Real MCP server integration (waiting on Member 3)
- Testing with real timeline data
- Follow-up prompt handling (infrastructure ready, needs testing)

🎯 **Next Steps:**
1. Start the server: `npm run dev`
2. Test with Member 2's UI
3. Swap mock MCP client when Member 3 is ready
