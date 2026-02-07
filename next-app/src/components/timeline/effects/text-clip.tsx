"use client"

import type { TextEffect } from "../../../lib/types"
import { ClipBase } from "./clip-base"

interface TextClipProps {
  effect: TextEffect
  locked: boolean
}

export function TextClip({ effect, locked }: TextClipProps) {
  return (
    <ClipBase effect={effect} locked={locked}>
      <span className="text-[10px] text-text-primary/80 truncate">
        {effect.text || "Text"}
      </span>
    </ClipBase>
  )
}
