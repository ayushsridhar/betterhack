"use client"

import { useEditorStore } from "../../../lib/store"
import type { TextEffect } from "../../../lib/types"
import { Plus, X, ChevronUp, ChevronDown } from "lucide-react"

interface FillEditorProps {
  effect: TextEffect
}

export function FillEditor({ effect }: FillEditorProps) {
  const setTextFill = useEditorStore((s) => s.setTextFill)
  const addTextFill = useEditorStore((s) => s.addTextFill)
  const removeTextFill = useEditorStore((s) => s.removeTextFill)
  const moveTextFillUp = useEditorStore((s) => s.moveTextFillUp)
  const moveTextFillDown = useEditorStore((s) => s.moveTextFillDown)
  const setFillGradientType = useEditorStore((s) => s.setFillGradientType)

  const gradientTypes = [
    { value: 0, label: "Linear Vertical" },
    { value: 1, label: "Linear Horizontal" },
  ]

  return (
    <div className="space-y-2.5">
      {/* Color stops */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-text-tertiary text-xs">Color Stops</label>
          <button
            onClick={() => addTextFill(effect.id)}
            className="p-0.5 rounded hover:bg-bg-elevated text-text-tertiary hover:text-accent transition-colors"
            title="Add color stop"
          >
            <Plus size={12} />
          </button>
        </div>

        <div className="space-y-1">
          {effect.fill.map((color, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <input
                type="color"
                value={typeof color === "string" ? color : `#${color.toString(16).padStart(6, "0")}`}
                onChange={(e) => setTextFill(effect.id, e.target.value, index)}
                className="w-7 h-7 rounded border border-border-default bg-bg-surface cursor-pointer shrink-0 p-0.5"
              />
              <input
                type="text"
                value={typeof color === "string" ? color : `#${color.toString(16).padStart(6, "0")}`}
                onChange={(e) => setTextFill(effect.id, e.target.value, index)}
                className="flex-1 bg-bg-surface border border-border-default rounded px-2 py-1 text-text-primary text-xs font-mono focus:outline-none focus:border-accent/60"
              />
              <div className="flex flex-col shrink-0">
                <button
                  onClick={() => moveTextFillUp(effect.id, index)}
                  disabled={index === 0}
                  className="p-0.5 text-text-tertiary hover:text-text-secondary disabled:opacity-30 transition-colors"
                >
                  <ChevronUp size={10} />
                </button>
                <button
                  onClick={() => moveTextFillDown(effect.id, index)}
                  disabled={index === effect.fill.length - 1}
                  className="p-0.5 text-text-tertiary hover:text-text-secondary disabled:opacity-30 transition-colors"
                >
                  <ChevronDown size={10} />
                </button>
              </div>
              {effect.fill.length > 1 && (
                <button
                  onClick={() => removeTextFill(effect.id, index)}
                  className="p-0.5 rounded hover:bg-danger/20 text-text-tertiary hover:text-danger transition-colors shrink-0"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Gradient type (only relevant with multiple fills) */}
      {effect.fill.length > 1 && (
        <div>
          <label className="text-text-tertiary text-xs block mb-1">Gradient Type</label>
          <select
            value={effect.fillGradientType}
            onChange={(e) => setFillGradientType(effect.id, Number(e.target.value))}
            className="w-full bg-bg-surface border border-border-default rounded px-2 py-1 text-text-primary text-sm focus:outline-none focus:border-accent/60"
          >
            {gradientTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
