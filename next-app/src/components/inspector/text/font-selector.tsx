"use client"

import { useEditorStore } from "../../../lib/store"
import type { Font } from "../../../lib/types"

const webFonts: Font[] = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Courier New",
  "Trebuchet MS",
  "Impact",
  "Comic Sans MS",
  "Palatino Linotype",
  "Lucida Sans Unicode",
  "Tahoma",
  "Geneva",
  "Garamond",
  "Bookman Old Style",
  "Arial Black",
  "Lucida Console",
  "Monaco",
  "Segoe UI",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Inter",
]

interface FontSelectorProps {
  effectId: string
  currentFont: Font
}

export function FontSelector({ effectId, currentFont }: FontSelectorProps) {
  const setTextFont = useEditorStore((s) => s.setTextFont)

  return (
    <select
      value={currentFont}
      onChange={(e) => setTextFont(effectId, e.target.value)}
      className="w-full bg-bg-surface border border-border-default rounded px-2 py-1 text-text-primary text-sm focus:outline-none focus:border-accent/60"
    >
      {webFonts.map((font) => (
        <option key={font} value={font} style={{ fontFamily: font }}>
          {font}
        </option>
      ))}
    </select>
  )
}
