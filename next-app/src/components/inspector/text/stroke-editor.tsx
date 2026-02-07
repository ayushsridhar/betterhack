"use client"

import { useEditorStore } from "../../../lib/store"
import type { TextEffect, LineJoin } from "../../../lib/types"

interface StrokeEditorProps {
  effect: TextEffect
}

const lineJoinOptions: LineJoin[] = ["miter", "round", "bevel"]

export function StrokeEditor({ effect }: StrokeEditorProps) {
  const setStrokeColor = useEditorStore((s) => s.setStrokeColor)
  const setStrokeThickness = useEditorStore((s) => s.setStrokeThickness)
  const setStrokeLineJoin = useEditorStore((s) => s.setStrokeLineJoin)

  return (
    <div className="space-y-2.5">
      {/* Color */}
      <div>
        <label className="text-text-tertiary text-xs block mb-1">Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={effect.stroke || "#000000"}
            onChange={(e) => setStrokeColor(effect.id, e.target.value)}
            className="w-7 h-7 rounded border border-border-default bg-bg-surface cursor-pointer shrink-0 p-0.5"
          />
          <input
            type="text"
            value={effect.stroke || "#000000"}
            onChange={(e) => setStrokeColor(effect.id, e.target.value)}
            className="flex-1 bg-bg-surface border border-border-default rounded px-2 py-1 text-text-primary text-xs font-mono focus:outline-none focus:border-accent/60"
          />
        </div>
      </div>

      {/* Thickness */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-text-tertiary text-xs">Thickness</label>
          <span className="text-text-secondary text-xs font-mono">{effect.strokeThickness}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={20}
          step={0.5}
          value={effect.strokeThickness}
          onChange={(e) => setStrokeThickness(effect.id, Number(e.target.value))}
          className="w-full h-1 rounded-full appearance-none bg-bg-elevated accent-accent cursor-pointer"
        />
      </div>

      {/* Line Join */}
      <div>
        <label className="text-text-tertiary text-xs block mb-1">Line Join</label>
        <div className="flex gap-1">
          {lineJoinOptions.map((join) => (
            <button
              key={join}
              onClick={() => setStrokeLineJoin(effect.id, join)}
              className={`flex-1 px-2 py-1 rounded text-xs transition-colors capitalize ${
                effect.lineJoin === join
                  ? "bg-accent/20 text-accent border border-accent/40"
                  : "bg-bg-surface border border-border-default text-text-secondary hover:text-text-primary"
              }`}
            >
              {join}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
