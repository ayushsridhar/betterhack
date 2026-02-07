"use client"

import { useEditorStore } from "../../../lib/store"
import type { TextEffect } from "../../../lib/types"

interface ShadowEditorProps {
  effect: TextEffect
}

export function ShadowEditor({ effect }: ShadowEditorProps) {
  const toggleDropShadow = useEditorStore((s) => s.toggleDropShadow)
  const setDropShadowColor = useEditorStore((s) => s.setDropShadowColor)
  const setDropShadowAlpha = useEditorStore((s) => s.setDropShadowAlpha)
  const setDropShadowAngle = useEditorStore((s) => s.setDropShadowAngle)
  const setDropShadowBlur = useEditorStore((s) => s.setDropShadowBlur)
  const setDropShadowDistance = useEditorStore((s) => s.setDropShadowDistance)

  const shadowColor =
    typeof effect.dropShadowColor === "string"
      ? effect.dropShadowColor
      : `#${(effect.dropShadowColor as number).toString(16).padStart(6, "0")}`

  return (
    <div className="space-y-2.5">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-text-tertiary text-xs">Enable Shadow</label>
        <button
          onClick={() => toggleDropShadow(effect.id, !effect.dropShadow)}
          className={`w-9 h-5 rounded-full transition-colors relative ${
            effect.dropShadow ? "bg-accent" : "bg-bg-elevated border border-border-default"
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-text-primary transition-transform ${
              effect.dropShadow ? "left-[18px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {effect.dropShadow && (
        <>
          {/* Color */}
          <div>
            <label className="text-text-tertiary text-xs block mb-1">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={shadowColor}
                onChange={(e) => setDropShadowColor(effect.id, e.target.value)}
                className="w-7 h-7 rounded border border-border-default bg-bg-surface cursor-pointer shrink-0 p-0.5"
              />
              <input
                type="text"
                value={shadowColor}
                onChange={(e) => setDropShadowColor(effect.id, e.target.value)}
                className="flex-1 bg-bg-surface border border-border-default rounded px-2 py-1 text-text-primary text-xs font-mono focus:outline-none focus:border-accent/60"
              />
            </div>
          </div>

          {/* Alpha */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-text-tertiary text-xs">Alpha</label>
              <span className="text-text-secondary text-xs font-mono">
                {effect.dropShadowAlpha.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={effect.dropShadowAlpha}
              onChange={(e) => setDropShadowAlpha(effect.id, Number(e.target.value))}
              className="w-full h-1 rounded-full appearance-none bg-bg-elevated accent-accent cursor-pointer"
            />
          </div>

          {/* Angle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-text-tertiary text-xs">Angle</label>
              <span className="text-text-secondary text-xs font-mono">
                {Math.round(effect.dropShadowAngle)}deg
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={effect.dropShadowAngle}
              onChange={(e) => setDropShadowAngle(effect.id, Number(e.target.value))}
              className="w-full h-1 rounded-full appearance-none bg-bg-elevated accent-accent cursor-pointer"
            />
          </div>

          {/* Blur */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-text-tertiary text-xs">Blur</label>
              <span className="text-text-secondary text-xs font-mono">
                {effect.dropShadowBlur}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={effect.dropShadowBlur}
              onChange={(e) => setDropShadowBlur(effect.id, Number(e.target.value))}
              className="w-full h-1 rounded-full appearance-none bg-bg-elevated accent-accent cursor-pointer"
            />
          </div>

          {/* Distance */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-text-tertiary text-xs">Distance</label>
              <span className="text-text-secondary text-xs font-mono">
                {effect.dropShadowDistance}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={effect.dropShadowDistance}
              onChange={(e) => setDropShadowDistance(effect.id, Number(e.target.value))}
              className="w-full h-1 rounded-full appearance-none bg-bg-elevated accent-accent cursor-pointer"
            />
          </div>
        </>
      )}
    </div>
  )
}
