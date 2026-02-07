# MCP Integration Guide for Member 2

## Architecture

Since the MCP server uses WebSocket with only ONE client allowed at a time, the simplest integration for the hackathon is:

```text
AI Brain → Generates MCP Calls → Member 2 (UI) → Executes Directly via Omniclip Context
```

## How It Works

1. **AI Brain** returns MCP calls in the response
2. **Member 2** receives the `changes` array
3. **Member 2** executes each MCP call directly using Omniclip's context

## Mapping MCP Calls to Omniclip Actions

Here's how to map the MCP calls from AI Brain to Omniclip actions:

### Add Transition

**MCP Call:**
```json
{
  "tool": "add_transition",
  "params": {
    "effectAId": "clip-1",
    "effectBId": "clip-2",
    "transitionType": "slide",
    "duration": 500,
    "direction": "right"
  }
}
```

**Execute:**
```typescript
// Note: Omniclip's MCP server uses different parameter names!
// AI Brain uses: effectAId, effectBId, transitionType
// Omniclip MCP uses: outgoing_effect_id, incoming_effect_id, transition_name

const mcpParams = {
  outgoing_effect_id: mcpCall.params.effectAId,
  incoming_effect_id: mcpCall.params.effectBId,
  transition_name: mcpCall.params.transitionType, // or map to actual transition name
  duration: mcpCall.params.duration || 1000,
}

// Execute via MCP bridge controller
await omnislate.context.controllers.mcp_bridge.handleAction("add_transition", mcpParams)
```

### Modify Effect

**MCP Call:**
```json
{
  "tool": "modify_effect",
  "params": {
    "effectId": "clip-1",
    "properties": {
      "start_at_position": 5000,
      "duration": 3000
    }
  }
}
```

**Execute:**
```typescript
const effectId = mcpCall.params.effectId
const props = mcpCall.params.properties

if (props.start_at_position !== undefined || props.track !== undefined) {
  await omnislate.context.controllers.mcp_bridge.handleAction("set_effect_timing", {
    effect_id: effectId,
    start_at_position: props.start_at_position,
    duration: props.duration,
    track: props.track,
  })
}

if (props.rect?.position_on_canvas) {
  await omnislate.context.controllers.mcp_bridge.handleAction("set_effect_position_on_canvas", {
    effect_id: effectId,
    x: props.rect.position_on_canvas.x,
    y: props.rect.position_on_canvas.y,
  })
}

if (props.rect?.rotation !== undefined) {
  await omnislate.context.controllers.mcp_bridge.handleAction("rotate_effect", {
    effect_id: effectId,
    angle: props.rect.rotation,
  })
}

if (props.rect?.scaleX !== undefined || props.rect?.scaleY !== undefined) {
  await omnislate.context.controllers.mcp_bridge.handleAction("scale_effect", {
    effect_id: effectId,
    scale_x: props.rect.scaleX,
    scale_y: props.rect.scaleY,
  })
}
```

### Add Filter

**MCP Call:**
```json
{
  "tool": "add_filter",
  "params": {
    "effectId": "clip-1",
    "filterType": "blur",
    "intensity": 50
  }
}
```

**Execute:**
```typescript
await omnislate.context.controllers.mcp_bridge.handleAction("add_filter", {
  effect_id: mcpCall.params.effectId,
  filter_type: mcpCall.params.filterType,
  params: { intensity: mcpCall.params.intensity }
})
```

### Add Animation

**MCP Call:**
```json
{
  "tool": "add_animation",
  "params": {
    "effectId": "clip-1",
    "animationType": "fadeIn",
    "duration": 1000
  }
}
```

**Execute:**
```typescript
await omnislate.context.controllers.mcp_bridge.handleAction("add_animation", {
  effect_id: mcpCall.params.effectId,
  animation_type: mcpCall.params.animationType,
  duration: mcpCall.params.duration,
  params: mcpCall.params.params || {}
})
```

### Remove Effect

**MCP Call:**
```json
{
  "tool": "remove_effect",
  "params": {
    "effectId": "clip-1"
  }
}
```

**Execute:**
```typescript
await omnislate.context.controllers.mcp_bridge.handleAction("remove_effect", {
  effect_id: mcpCall.params.effectId
})
```

## Complete Integration Example

```typescript
// Member 2's UI code

async function executeAIChanges(changes: Change[]) {
  const mcpBridge = omnislate.context.controllers.mcp_bridge

  for (const change of changes) {
    try {
      switch (change.mcpCall.tool) {
        case 'add_transition':
          await mcpBridge.handleAction('add_transition', {
            outgoing_effect_id: change.mcpCall.params.effectAId,
            incoming_effect_id: change.mcpCall.params.effectBId,
            transition_name: change.mcpCall.params.transitionType,
            duration: change.mcpCall.params.duration || 1000,
          })
          break

        case 'modify_effect':
          // Handle modify_effect (see above)
          break

        case 'add_filter':
          await mcpBridge.handleAction('add_filter', {
            effect_id: change.mcpCall.params.effectId,
            filter_type: change.mcpCall.params.filterType,
            params: { intensity: change.mcpCall.params.intensity }
          })
          break

        case 'add_animation':
          await mcpBridge.handleAction('add_animation', {
            effect_id: change.mcpCall.params.effectId,
            animation_type: change.mcpCall.params.animationType,
            duration: change.mcpCall.params.duration,
            params: change.mcpCall.params.params || {}
          })
          break

        case 'remove_effect':
          await mcpBridge.handleAction('remove_effect', {
            effect_id: change.mcpCall.params.effectId
          })
          break

        case 'split_clip':
        case 'move_effect':
        case 'adjust_duration':
          // Map other tools as needed
          console.warn(`Tool ${change.mcpCall.tool} not yet mapped`)
          break
      }

      console.log(`✅ Executed: ${change.description}`)
    } catch (error) {
      console.error(`❌ Failed to execute ${change.mcpCall.tool}:`, error)
      throw error
    }
  }
}

// Usage in Member 2's UI:
const response = await fetch('http://localhost:3001/api/ai-edit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    annotations: getAnnotations(),
    prompt: userPrompt,
    timelineState: {
      effects: omnislate.context.state.effects,
      tracks: omnislate.context.state.tracks,
      transitions: omnislate.context.state.transitions,
      filters: omnislate.context.state.filters,
      animations: omnislate.context.state.animations,
      settings: omnislate.context.state.settings,
    },
  }),
})

const result = await response.json()

if (result.success) {
  // Show accept/reject dialog
  const userAccepted = await showAcceptRejectDialog(result.changes)

  if (userAccepted) {
    await executeAIChanges(result.changes)
  }
}
```

## Alternative: Use MCP Server Directly

If you want to use the actual MCP server instead of direct execution:

1. **Start MCP Server:**
```bash
cd mcp-server
npm install
npm run build
npm start &
```

2. **Start Omniclip** and ensure MCP bridge connects to `ws://localhost:9876`

3. **Our AI Brain would need to:**
   - Spawn MCP server as child process
   - Communicate via stdio using MCP protocol
   - This is more complex and probably not worth it for the hackathon

## Recommendation

For the hackathon, use the **direct execution approach** (first option). It's simpler, faster, and avoids WebSocket conflicts.

The MCP server can be used for other integrations (like external tools calling Omniclip), but for AI Brain → UI integration, direct execution is cleanest.

## Parameter Mapping Reference

| AI Brain Tool | AI Brain Params | MCP Action | MCP Params |
|---------------|-----------------|------------|------------|
| add_transition | effectAId, effectBId, transitionType, duration, direction | add_transition | outgoing_effect_id, incoming_effect_id, transition_name, duration |
| modify_effect | effectId, properties | set_effect_timing | effect_id, start_at_position, duration, track |
| add_filter | effectId, filterType, intensity | add_filter | effect_id, filter_type, params |
| add_animation | effectId, animationType, duration, params | add_animation | effect_id, animation_type, duration, params |
| split_clip | effectId, timestamp | (needs implementation) | - |
| move_effect | effectId, track, start_at_position | set_effect_timing | effect_id, track, start_at_position |
| remove_effect | effectId | remove_effect | effect_id |
| adjust_duration | effectId, newDuration, trimFrom | set_effect_timing | effect_id, duration |

