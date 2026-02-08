"use client"

import { useState, useEffect } from 'react'
import { useEditorStore } from '@/lib/store'
import { executeAIEdit } from '@/lib/services/ai-brain'
import { DrawingOverlay } from './drawing-overlay'
import type { DrawingToolType } from '@/lib/types'

const TOOLS: Array<{ type: DrawingToolType; icon: string; label: string }> = [
  { type: 'freehand', icon: '✏️', label: 'Freehand' },
  { type: 'arrow', icon: '➡️', label: 'Arrow' },
  { type: 'rectangle', icon: '⬜', label: 'Rectangle' },
  { type: 'circle', icon: '⭕', label: 'Circle' },
]

const COLORS = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
]

export function AnnotationModal() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const store = useEditorStore()
  const isOpen = useEditorStore((s) => s.annotation_modal_open)
  const selectedEffectIds = useEditorStore((s) => s.selected_effects_for_annotation)
  const effects = useEditorStore((s) => s.effects)
  const annotations = useEditorStore((s) => s.annotations)
  const drawingMode = useEditorStore((s) => s.drawing_mode)

  const closeAnnotationModal = useEditorStore((s) => s.closeAnnotationModal)
  const setDrawingTool = useEditorStore((s) => s.setDrawingTool)
  const setDrawingColor = useEditorStore((s) => s.setDrawingColor)
  const setDrawingStrokeWidth = useEditorStore((s) => s.setDrawingStrokeWidth)
  const clearAnnotations = useEditorStore((s) => s.clearAnnotations)
  const setDrawingMode = useEditorStore((s) => s.setDrawingMode)

  const selectedEffects = effects.filter(e => selectedEffectIds.includes(e.id))

  // Auto-enable drawing mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setDrawingMode(true)
    }
  }, [isOpen, setDrawingMode])

  const handleClose = () => {
    clearAnnotations()
    setPrompt('')
    setError(null)
    setDrawingMode(false)
    closeAnnotationModal()
  }

  const handleSubmitToAI = async () => {
    if (annotations.length === 0) {
      setError('Please draw at least one annotation')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Detect which clips each annotation spatially overlaps
      const annotationsWithEffects = annotations.map(a => {
        // For now, use a simple heuristic: if arrow, use first 2 clips in order
        // If rectangle/circle, include all clips they visually overlap
        // This is a hackathon simplification - proper spatial detection would be better

        if (a.type === 'arrow' && selectedEffects.length >= 2) {
          // Sort effects by timeline order
          const sorted = [...selectedEffects].sort((a, b) => {
            if (a.track !== b.track) return a.track - b.track
            return a.start_at_position - b.start_at_position
          })

          // For arrows, intelligently pick 2 adjacent clips based on timeline position
          // This is still a hack - ideally we'd detect spatial overlap with clip cards
          const clipIndices = sorted.map((_, i) => i)

          // Default to first 2 for now, but could enhance with spatial analysis
          return {
            ...a,
            affectedEffects: [sorted[0].id, sorted[1].id],
          }
        }

        return {
          ...a,
          affectedEffects: selectedEffectIds,
        }
      })

      const result = await executeAIEdit(annotationsWithEffects, prompt, store)

      if (!result.success) {
        // Show detailed error including MCP failures
        const errorDetails = result.results
          ?.filter(r => !r.success)
          .map(r => r.error)
          .join('; ') || result.error || 'Failed to execute AI edit'

        setError(`MCP Error: ${errorDetails}`)
        console.error('[Annotation Modal] MCP execution failed:', result)
        return
      }

      if (result.changes.length === 0) {
        setError('AI could not generate edits. Try being more specific in your prompt or draw different annotations.')
        return
      }

      // Success! Close modal
      handleClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-[90vw] h-[90vh] bg-bg-raised rounded-xl shadow-2xl border border-border-subtle flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <div>
            <h2 className="text-xl font-bold">Annotate Selected Clips</h2>
            <p className="text-sm text-text-tertiary mt-1">
              {selectedEffects.length} clip{selectedEffects.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            ✕ Close
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-border-subtle flex items-center gap-3 flex-wrap">
          {/* Drawing Tools */}
          <div className="flex gap-1">
            {TOOLS.map((tool) => (
              <button
                key={tool.type}
                onClick={() => setDrawingTool(tool.type)}
                className={`px-3 py-2 text-sm rounded ${
                  drawingMode.tool === tool.type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
                title={tool.label}
              >
                {tool.icon}
              </button>
            ))}
          </div>

          {/* Color Selector */}
          <div className="flex gap-1">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setDrawingColor(color)}
                className={`w-8 h-8 rounded border-2 ${
                  drawingMode.color === color
                    ? 'border-blue-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          {/* Stroke Width */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium">Width:</label>
            <input
              type="range"
              min="1"
              max="10"
              value={drawingMode.strokeWidth}
              onChange={(e) => setDrawingStrokeWidth(parseInt(e.target.value))}
              className="w-24"
            />
            <span className="text-xs w-4">{drawingMode.strokeWidth}</span>
          </div>

          {/* Clear Button */}
          <button
            onClick={clearAnnotations}
            disabled={annotations.length === 0}
            className="px-3 py-2 text-sm font-medium rounded bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
          >
            Clear ({annotations.length})
          </button>
        </div>

        {/* Drawing Area */}
        <div className="flex-1 p-8 overflow-hidden">
          <div className="w-full h-full bg-bg-surface rounded-lg border-2 border-border-subtle relative overflow-hidden">
            {/* Clip visualization as background */}
            <div className="absolute inset-0 p-8 overflow-auto pointer-events-none">
              <div className="flex gap-4 flex-wrap">
                {selectedEffects
                  .sort((a, b) => {
                    if (a.track !== b.track) return a.track - b.track
                    return a.start_at_position - b.start_at_position
                  })
                  .map((effect, index) => (
                  <div
                    key={effect.id}
                    className="p-4 bg-bg-base rounded border-2 border-purple-500/50 shadow-lg relative"
                  >
                    {/* Clip number badge */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white">
                      {index + 1}
                    </div>

                    <div className="text-xs font-mono text-text-tertiary mb-1">
                      {effect.kind.toUpperCase()}
                    </div>
                    <div className="text-sm font-medium">
                      {effect.kind === 'text' ? (effect as any).text :
                       effect.kind === 'video' || effect.kind === 'image' ?
                       (effect as any).src?.split('/').pop() || 'Untitled' : 'Effect'}
                    </div>
                    <div className="text-xs text-text-tertiary mt-1">
                      Track {effect.track} • {Math.round(effect.duration / 1000)}s
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
                      @ {Math.round(effect.start_at_position / 1000)}s
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drawing Overlay - must cover entire area */}
            <div className="absolute inset-0">
              <DrawingOverlay />
            </div>

            {/* Instruction */}
            {annotations.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-center text-text-tertiary pointer-events-none">
                <div>
                  <div className="text-6xl mb-4">✏️</div>
                  <div className="text-lg font-medium">Draw annotations to guide the AI</div>
                  <div className="text-sm mt-2 max-w-md">
                    Draw arrows, shapes, or freehand annotations, then use clip numbers in your prompt.
                    <br />
                    <span className="text-purple-400 font-medium">Example: "add fade from clip 2 to clip 3"</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Prompt and Submit */}
        <div className="p-4 border-t border-border-subtle">
          {error && (
            <div className="mb-3 p-3 text-sm font-medium text-red-700 bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What do you want to do? (e.g., 'add a fade transition', 'make it zoom in')"
              className="flex-1 px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleSubmitToAI()
                }
              }}
            />
            <button
              onClick={handleSubmitToAI}
              disabled={loading || annotations.length === 0}
              className="px-6 py-3 text-sm font-bold rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl transition-all duration-200 border-2 border-green-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              {loading ? '⏳ Executing...' : `🤖 Submit to AI (${annotations.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
