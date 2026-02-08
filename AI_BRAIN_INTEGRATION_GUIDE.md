# AI Brain Integration Guide - Next.js App

## ✅ What's Been Completed

All core AI Brain integration is complete and ready for testing:

### 1. Backend Integration
- **Annotation Types** (`next-app/src/lib/types/annotations.ts`)
- **Zustand Store** (`next-app/src/lib/store/index.ts`) - 10 annotation actions
- **MCP Executor** (`next-app/src/lib/services/mcp-executor.ts`) - Maps 30+ MCP tools to store actions
- **AI Brain Service** (`next-app/src/lib/services/ai-brain.ts`) - Calls AI Brain API

### 2. UI Components
- **AnnotationContextBubble** (`next-app/src/components/annotations/annotation-context-bubble.tsx`)
  - Prompt input
  - Context metadata (speed, size, notes)
  - Submit button
- **DrawingToolbar** (`next-app/src/components/annotations/drawing-toolbar.tsx`)
  - Tool selector (freehand, arrow, rectangle, circle)
  - Color picker
  - Stroke width control
  - Clear annotations button

## 🚀 Testing the Integration

### Step 1: Start the AI Brain Server

```bash
cd ai-brain
npm start
```

The AI Brain API will run on `http://localhost:3001`

### Step 2: Start the Next.js App

```bash
cd next-app
npm run dev
```

The app will run on `http://localhost:3000`

### Step 3: Add Components to Your Editor

In your editor page (e.g., `src/app/editor/[projectId]/page.tsx`), import and use the components:

```tsx
import { DrawingToolbar, AnnotationContextBubble } from '@/components/annotations'
import { useEditorStore } from '@/lib/store'

export default function EditorPage() {
  const selectedAnnotationId = useEditorStore((s) => s.selected_annotation_id)
  const annotations = useEditorStore((s) => s.annotations)
  const setSelectedAnnotation = useEditorStore((s) => s.setSelectedAnnotation)

  const selectedAnnotation = annotations.find(a => a.id === selectedAnnotationId)

  return (
    <div>
      {/* Add Drawing Toolbar */}
      <DrawingToolbar />

      {/* Your canvas/preview component */}
      <YourCanvasComponent />

      {/* Show context bubble when an annotation is selected */}
      {selectedAnnotation && (
        <AnnotationContextBubble
          annotation={selectedAnnotation}
          onClose={() => setSelectedAnnotation(null)}
        />
      )}
    </div>
  )
}
```

### Step 4: Test the Workflow

1. **Enable Draw Mode** - Click the "Draw Mode" button in the toolbar
2. **Select a Tool** - Choose freehand, arrow, rectangle, or circle
3. **Draw on Canvas** - Click and drag to create annotations
4. **Add Context** - Set transition speed, size, and notes
5. **Enter Prompt** - Type what you want to do (e.g., "add a smooth fade transition")
6. **Submit** - Click "Submit to AI" button
7. **Watch Magic** - The AI Brain will:
   - Interpret your annotations and prompt
   - Generate MCP tool calls
   - Execute them via the store
   - Update your timeline

## 🔍 Testing Without Canvas (API Test)

You can test the AI Brain API directly:

```bash
cd ai-brain
npm test
```

Or make a direct API call:

```bash
curl -X POST http://localhost:3001/api/ai-edit \
  -H "Content-Type: application/json" \
  -d @test-request.json | jq
```

## 📝 What's Still Needed

The one missing piece is **canvas drawing logic**. The components are ready, but you need to:

1. **Add Canvas Event Handlers** - Listen for pointer events when `drawing_mode.enabled` is true
2. **Render Annotations** - Draw the annotations on your canvas
3. **Hit Detection** - Detect which effects overlap with annotations
4. **Integration** - Call `store.addAnnotation()` when user finishes drawing

Example pseudo-code for canvas integration:

```tsx
const drawingMode = useEditorStore((s) => s.drawing_mode)
const addAnnotation = useEditorStore((s) => s.addAnnotation)

// When user starts drawing
const onPointerDown = (e) => {
  if (!drawingMode.enabled) return
  // Start drawing...
}

// When user finishes drawing
const onPointerUp = (e) => {
  if (!drawingMode.enabled) return

  const annotation = {
    id: generateId(),
    type: drawingMode.tool,
    coordinates: { /* your coords */ },
    affectedEffects: detectOverlappingEffects(),
    color: drawingMode.color,
    strokeWidth: drawingMode.strokeWidth,
    drawnAtTimecode: store.timecode,
  }

  addAnnotation(annotation)
}
```

## 🐛 Troubleshooting

### AI Brain Not Responding
- Check if AI Brain server is running: `curl http://localhost:3001/health`
- Check console for errors
- Verify ANTHROPIC_API_KEY is set in `ai-brain/.env`

### MCP Calls Failing
- Check browser console for errors
- Verify timeline state has valid effects
- Check that effect IDs exist

### TypeScript Errors
- Run `npm install` in next-app folder
- Check that all types are properly imported

## 📦 Files Created

### Types
- `next-app/src/lib/types/annotations.ts`

### Services
- `next-app/src/lib/services/mcp-executor.ts`
- `next-app/src/lib/services/ai-brain.ts`

### Components
- `next-app/src/components/annotations/annotation-context-bubble.tsx`
- `next-app/src/components/annotations/drawing-toolbar.tsx`
- `next-app/src/components/annotations/index.ts`

### Store Updates
- `next-app/src/lib/store/index.ts` (added annotation actions)
- `next-app/src/lib/store/slices/non-historical.ts` (added annotation state)
- `next-app/src/lib/types/state.ts` (added annotation types)
- `next-app/src/lib/types/index.ts` (exported annotation types)

## ✨ Ready to Test!

The AI Brain integration is complete. Add the components to your editor, implement canvas drawing, and you're ready to test the full annotation-to-AI-to-MCP workflow!
