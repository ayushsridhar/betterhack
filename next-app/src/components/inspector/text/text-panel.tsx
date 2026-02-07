"use client"

import { useState } from "react"
import { useEditorStore } from "../../../lib/store"
import { FontSelector } from "./font-selector"
import { FillEditor } from "./fill-editor"
import { StrokeEditor } from "./stroke-editor"
import { ShadowEditor } from "./shadow-editor"
import type { TextEffect, TextStyleFontStyle, TextStyleAlign, TextStyleFontWeight } from "../../../lib/types"
import { ChevronDown, ChevronRight } from "lucide-react"

interface TextPanelProps {
  effect: TextEffect
}

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border-subtle">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 w-full px-3 py-2 text-xs text-text-secondary hover:text-text-primary transition-colors"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {title}
      </button>
      {open && <div className="px-3 pb-3 space-y-2.5">{children}</div>}
    </div>
  )
}

const fontStyles: TextStyleFontStyle[] = ["normal", "italic", "oblique"]
const alignOptions: TextStyleAlign[] = ["left", "center", "right", "justify"]
const weightOptions: TextStyleFontWeight[] = ["normal", "bold", "bolder", "lighter", "100", "200", "300", "400", "500", "600", "700", "800", "900"]

export function TextPanel({ effect }: TextPanelProps) {
  const setTextContent = useEditorStore((s) => s.setTextContent)
  const setFontSize = useEditorStore((s) => s.setFontSize)
  const setFontStyle = useEditorStore((s) => s.setFontStyle)
  const setFontAlign = useEditorStore((s) => s.setFontAlign)
  const setFontWeight = useEditorStore((s) => s.setFontWeight)
  const setLetterSpacing = useEditorStore((s) => s.setLetterSpacing)
  const setLineHeight = useEditorStore((s) => s.setLineHeight)
  const setWordWrap = useEditorStore((s) => s.setWordWrap)
  const setLeading = useEditorStore((s) => s.setLeading)

  return (
    <div>
      {/* Content */}
      <Section title="Content" defaultOpen>
        <textarea
          value={effect.text}
          onChange={(e) => setTextContent(effect.id, e.target.value)}
          rows={3}
          className="w-full bg-bg-surface border border-border-default rounded px-2 py-1.5 text-text-primary text-sm resize-y focus:outline-none focus:border-accent/60"
          placeholder="Enter text..."
        />
      </Section>

      {/* Font */}
      <Section title="Font" defaultOpen>
        <div>
          <label className="text-text-tertiary text-xs block mb-1">Family</label>
          <FontSelector effectId={effect.id} currentFont={effect.fontFamily} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-text-tertiary text-xs block mb-1">Size</label>
            <input
              type="number"
              value={effect.fontSize}
              onChange={(e) => setFontSize(effect.id, Number(e.target.value))}
              min={1}
              max={500}
              className="w-full bg-bg-surface border border-border-default rounded px-2 py-1 text-text-primary text-sm focus:outline-none focus:border-accent/60"
            />
          </div>
          <div>
            <label className="text-text-tertiary text-xs block mb-1">Weight</label>
            <select
              value={effect.fontWeight}
              onChange={(e) => setFontWeight(effect.id, e.target.value as TextStyleFontWeight)}
              className="w-full bg-bg-surface border border-border-default rounded px-2 py-1 text-text-primary text-sm focus:outline-none focus:border-accent/60"
            >
              {weightOptions.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-text-tertiary text-xs block mb-1">Style</label>
            <select
              value={effect.fontStyle}
              onChange={(e) => setFontStyle(effect.id, e.target.value as TextStyleFontStyle)}
              className="w-full bg-bg-surface border border-border-default rounded px-2 py-1 text-text-primary text-sm focus:outline-none focus:border-accent/60"
            >
              {fontStyles.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-text-tertiary text-xs block mb-1">Align</label>
            <div className="flex gap-1">
              {alignOptions.map((a) => (
                <button
                  key={a}
                  onClick={() => setFontAlign(effect.id, a)}
                  className={`flex-1 px-1 py-1 rounded text-[10px] transition-colors ${
                    effect.align === a
                      ? "bg-accent/20 text-accent"
                      : "bg-bg-elevated text-text-tertiary hover:text-text-secondary"
                  }`}
                >
                  {a.charAt(0).toUpperCase() + a.slice(1, 2)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Fill */}
      <Section title="Fill" defaultOpen>
        <FillEditor effect={effect} />
      </Section>

      {/* Stroke */}
      <Section title="Stroke" defaultOpen={false}>
        <StrokeEditor effect={effect} />
      </Section>

      {/* Layout */}
      <Section title="Layout" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-text-tertiary text-xs block mb-1">Letter Spacing</label>
            <input
              type="number"
              value={effect.letterSpacing}
              onChange={(e) => setLetterSpacing(effect.id, Number(e.target.value))}
              className="w-full bg-bg-surface border border-border-default rounded px-2 py-1 text-text-primary text-sm focus:outline-none focus:border-accent/60"
            />
          </div>
          <div>
            <label className="text-text-tertiary text-xs block mb-1">Line Height</label>
            <input
              type="number"
              value={effect.lineHeight}
              onChange={(e) => setLineHeight(effect.id, Number(e.target.value))}
              step={0.1}
              min={0}
              className="w-full bg-bg-surface border border-border-default rounded px-2 py-1 text-text-primary text-sm focus:outline-none focus:border-accent/60"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-text-tertiary text-xs block mb-1">Leading</label>
            <input
              type="number"
              value={effect.leading}
              onChange={(e) => setLeading(effect.id, Number(e.target.value))}
              className="w-full bg-bg-surface border border-border-default rounded px-2 py-1 text-text-primary text-sm focus:outline-none focus:border-accent/60"
            />
          </div>
          <div>
            <label className="text-text-tertiary text-xs block mb-1">Word Wrap</label>
            <button
              onClick={() => setWordWrap(effect.id, !effect.wordWrap)}
              className={`w-full px-2 py-1 rounded text-xs transition-colors ${
                effect.wordWrap
                  ? "bg-accent/20 text-accent border border-accent/40"
                  : "bg-bg-surface border border-border-default text-text-secondary"
              }`}
            >
              {effect.wordWrap ? "On" : "Off"}
            </button>
          </div>
        </div>
      </Section>

      {/* Shadow */}
      <Section title="Shadow" defaultOpen={false}>
        <ShadowEditor effect={effect} />
      </Section>
    </div>
  )
}
