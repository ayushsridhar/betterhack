"use client"

import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { executeAIEdit } from '@/lib/services/ai-brain'
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

export function DrawingToolbar() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPromptInput, setShowPromptInput] = useState(false)

  const store = useEditorStore()
  const drawingMode = useEditorStore((s) => s.drawing_mode)
  const annotations = useEditorStore((s) => s.annotations)
  const setDrawingMode = useEditorStore((s) => s.setDrawingMode)
  const setDrawingTool = useEditorStore((s) => s.setDrawingTool)
  const setDrawingColor = useEditorStore((s) => s.setDrawingColor)
  const setDrawingStrokeWidth = useEditorStore((s) => s.setDrawingStrokeWidth)
  const clearAnnotations = useEditorStore((s) => s.clearAnnotations)

  const toggleDrawMode = () => {
    setDrawingMode(!drawingMode.enabled)
  }

  const handleSubmitToAI = async () => {
    if (annotations.length === 0) {
      setError('Please draw at least one annotation')
      return
    }

    // Check if timeline has effects
    if (store.effects.length === 0) {
      setError('Timeline is empty! Add clips/effects before using AI annotations.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await executeAIEdit(annotations, prompt, store)

      if (!result.success) {
        setError(result.error || 'Failed to execute AI edit')
        return
      }

      // If no changes were generated, show helpful message
      if (result.changes.length === 0) {
        setError('AI could not generate edits. Try: (1) Add more clips to timeline, (2) Be more specific in prompt, (3) Draw on/near clips')
        return
      }

      // Clear annotations and prompt after successful execution
      clearAnnotations()
      setPrompt('')
      setShowPromptInput(false)
      setDrawingMode(false)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      {/* Toggle Draw Mode */}
      <button
        onClick={toggleDrawMode}
        className={`px-3 py-1.5 text-sm font-medium rounded ${
          drawingMode.enabled
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        }`}
      >
        {drawingMode.enabled ? 'Exit Draw Mode' : 'Draw Mode'}
      </button>

      {drawingMode.enabled && (
        <>
          {/* Tool Selector */}
          <div className="flex gap-1">
            {TOOLS.map((tool) => (
              <button
                key={tool.type}
                onClick={() => setDrawingTool(tool.type)}
                className={`px-2 py-1.5 text-sm rounded ${
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
                className={`w-6 h-6 rounded border-2 ${
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
              className="w-20"
            />
            <span className="text-xs w-4">{drawingMode.strokeWidth}</span>
          </div>

          {/* Clear Annotations */}
          <button
            onClick={clearAnnotations}
            disabled={annotations.length === 0}
            className="px-3 py-1.5 text-sm font-medium rounded bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear ({annotations.length})
          </button>

          {/* Divider */}
          {annotations.length > 0 && (
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />
          )}

          {/* Submit to AI Button */}
          {annotations.length > 0 && !showPromptInput && (
            <button
              onClick={() => setShowPromptInput(true)}
              className="px-4 py-2 text-sm font-bold rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl transition-all duration-200 border-2 border-green-400"
            >
              🤖 Submit to AI ({annotations.length})
            </button>
          )}

          {/* Prompt Input and Submit */}
          {showPromptInput && (
            <>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What do you want to do? (optional)"
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 min-w-[250px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleSubmitToAI()
                  }
                }}
              />
              <button
                onClick={handleSubmitToAI}
                disabled={loading}
                className="px-4 py-2 text-sm font-bold rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl transition-all duration-200 border-2 border-green-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              >
                {loading ? '⏳ Executing...' : '✓ Submit'}
              </button>
              <button
                onClick={() => {
                  setShowPromptInput(false)
                  setPrompt('')
                  setError(null)
                }}
                disabled={loading}
                className="px-2 py-1.5 text-sm font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                ✕
              </button>
            </>
          )}
        </>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 text-sm font-medium text-red-700 bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-lg shadow-lg z-50">
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}
