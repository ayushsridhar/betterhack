"use client"

import { useCallback } from "react"
import { Type, ALargeSmall, CaseSensitive, Subtitles } from "lucide-react"
import { useEditorStore } from "../../lib/store"
import { generateId } from "../../lib/utils/id"
import type { TextEffect } from "../../lib/types"

interface TextPreset {
  label: string
  description: string
  icon: typeof Type
  defaultText: string
  fontSize: number
  fontWeight: TextEffect["fontWeight"]
  align: TextEffect["align"]
  /** Vertical position ratio (0 = top, 0.5 = center, 1 = bottom) */
  yRatio: number
}

const presets: TextPreset[] = [
  {
    label: "Title",
    description: "Large centered headline",
    icon: Type,
    defaultText: "Title Text",
    fontSize: 72,
    fontWeight: "bold",
    align: "center",
    yRatio: 0.4,
  },
  {
    label: "Subtitle",
    description: "Medium centered text",
    icon: ALargeSmall,
    defaultText: "Subtitle Text",
    fontSize: 36,
    fontWeight: "normal",
    align: "center",
    yRatio: 0.55,
  },
  {
    label: "Caption",
    description: "Small text at the bottom",
    icon: Subtitles,
    defaultText: "Caption Text",
    fontSize: 24,
    fontWeight: "normal",
    align: "center",
    yRatio: 0.85,
  },
  {
    label: "Lower Third",
    description: "Bold left-aligned overlay",
    icon: CaseSensitive,
    defaultText: "Lower Third",
    fontSize: 28,
    fontWeight: "bold",
    align: "left",
    yRatio: 0.75,
  },
  {
    label: "Custom Text",
    description: "Default editable text",
    icon: Type,
    defaultText: "Your Text Here",
    fontSize: 32,
    fontWeight: "normal",
    align: "center",
    yRatio: 0.5,
  },
]

function makeTextEffect(preset: TextPreset, projW: number, projH: number): TextEffect {
  const textWidth = projW * 0.8
  const textHeight = preset.fontSize * 2
  const x = (projW - textWidth) / 2
  const y = projH * preset.yRatio - textHeight / 2

  return {
    id: generateId(),
    kind: "text",
    start_at_position: 0,
    start: 0,
    end: 5000,
    duration: 5000,
    track: 0,
    text: preset.defaultText,
    fontFamily: "Arial",
    fontSize: preset.fontSize,
    fontStyle: "normal",
    fontWeight: preset.fontWeight,
    fontVariant: "normal",
    align: preset.align,
    fill: ["#FFFFFF"],
    fillGradientType: 0,
    fillGradientStops: [],
    rect: {
      width: textWidth,
      height: textHeight,
      scaleX: 1,
      scaleY: 1,
      position_on_canvas: { x, y },
      rotation: 0,
      pivot: { x: 0.5, y: 0.5 },
    },
    stroke: "#000000",
    strokeThickness: 0,
    lineJoin: "miter",
    miterLimit: 10,
    letterSpacing: 0,
    dropShadow: false,
    dropShadowAlpha: 1,
    dropShadowAngle: Math.PI / 6,
    dropShadowBlur: 0,
    dropShadowDistance: 5,
    dropShadowColor: "#000000",
    wordWrap: true,
    wordWrapWidth: textWidth,
    lineHeight: preset.fontSize * 1.2,
    leading: 0,
    breakWords: false,
    whiteSpace: "pre-line",
    textBaseline: "alphabetic",
  }
}

export function TextMediaPanel() {
  const addTextEffect = useEditorStore((s) => s.addTextEffect)

  const handleAdd = useCallback(
    (preset: TextPreset) => {
      const { width, height } = useEditorStore.getState().settings
      const effect = makeTextEffect(preset, width, height)
      addTextEffect(effect)
    },
    [addTextEffect]
  )

  return (
    <div className="flex flex-col h-full bg-bg-raised">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 border-b border-border-subtle">
        <span className="text-xs font-medium text-text-secondary">Text Presets</span>
      </div>

      {/* Preset list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {presets.map((preset) => {
          const Icon = preset.icon
          return (
            <button
              key={preset.label}
              onClick={() => handleAdd(preset)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-bg-surface border border-border-subtle hover:border-border-default hover:bg-bg-elevated transition-colors text-left group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-md bg-accent-muted flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary">{preset.label}</div>
                <div className="text-xs text-text-tertiary truncate">{preset.description}</div>
              </div>
              <div
                className="flex-shrink-0 text-text-tertiary opacity-60"
                style={{
                  fontSize: `${Math.max(10, Math.min(16, preset.fontSize / 5))}px`,
                  fontWeight: preset.fontWeight === "bold" ? 700 : 400,
                }}
              >
                Aa
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
