"use client"

import type { VideoEffect } from "../../../lib/types"
import { ClipBase } from "./clip-base"

interface VideoClipProps {
  effect: VideoEffect
  locked: boolean
}

export function VideoClip({ effect, locked }: VideoClipProps) {
  return (
    <ClipBase effect={effect} locked={locked}>
      <div className="flex items-center gap-1 w-full h-full overflow-hidden">
        {/* Filmstrip placeholder gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-clip-video/5 to-clip-video/10 pointer-events-none rounded-sm" />
        <span className="text-[10px] text-text-primary/80 truncate relative z-10">
          {effect.name}
        </span>
      </div>
    </ClipBase>
  )
}
