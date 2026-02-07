"use client"

import type { ImageEffect } from "../../../lib/types"
import { ClipBase } from "./clip-base"

interface ImageClipProps {
  effect: ImageEffect
  locked: boolean
}

export function ImageClip({ effect, locked }: ImageClipProps) {
  return (
    <ClipBase effect={effect} locked={locked}>
      <div className="flex items-center gap-1 w-full h-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-clip-image/5 to-clip-image/10 pointer-events-none rounded-sm" />
        <span className="text-[10px] text-text-primary/80 truncate relative z-10">
          {effect.name}
        </span>
      </div>
    </ClipBase>
  )
}
