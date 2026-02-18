"use client"

import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { executeAIEdit } from '@/lib/services/ai-brain'
import type { Annotation } from '@/lib/types'

interface AnnotationContextBubbleProps {
  annotation: Annotation
  onClose: () => void
}

export function AnnotationContextBubble({ annotation, onClose }: AnnotationContextBubbleProps) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const store = useEditorStore()
  const annotations = store.annotations
  const updateAnnotation = store.updateAnnotation

  const handleSubmit = async () => {
    if (!prompt.trim() && annotations.length === 0) {
      setError('Please enter a prompt or draw annotations')
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

      // Clear annotations after successful execution
      store.clearAnnotations()
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSpeedChange = (speed: 'slow' | 'medium' | 'fast') => {
    updateAnnotation(annotation.id, {
      context: { ...annotation.context, transitionSpeed: speed }
    })
  }

  const handleSizeChange = (size: 'small' | 'medium' | 'large') => {
    updateAnnotation(annotation.id, {
      context: { ...annotation.context, transitionSize: size }
    })
  }

  const handleNotesChange = (notes: string) => {
    updateAnnotation(annotation.id, {
      context: { ...annotation.context, notes }
    })
  }

  return (
    <div className="absolute z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-80 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Annotation Context</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        {/* Transition Speed */}
        <div>
          <label className="block text-xs font-medium mb-2">Transition Speed</label>
          <div className="flex gap-2">
            {(['slow', 'medium', 'fast'] as const).map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`flex-1 px-3 py-1 text-xs rounded ${
                  annotation.context?.transitionSpeed === speed
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {speed}
              </button>
            ))}
          </div>
        </div>

        {/* Transition Size */}
        <div>
          <label className="block text-xs font-medium mb-2">Transition Size</label>
          <div className="flex gap-2">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => handleSizeChange(size)}
                className={`flex-1 px-3 py-1 text-xs rounded ${
                  annotation.context?.transitionSize === size
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium mb-2">Notes</label>
          <input
            type="text"
            value={annotation.context?.notes || ''}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Optional details..."
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
          />
        </div>

        {/* AI Prompt */}
        <div>
          <label className="block text-xs font-medium mb-2">AI Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to do..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Executing...' : 'Submit to AI'}
        </button>
      </div>
    </div>
  )
}
