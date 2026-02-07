"use client"

import type { AudioEffect } from "../../../lib/types"
import { ClipBase } from "./clip-base"

interface AudioClipProps {
  effect: AudioEffect
  locked: boolean
}

export function AudioClip({ effect, locked }: AudioClipProps) {
  return (
    <ClipBase effect={effect} locked={locked}>
      <div className="flex items-center gap-1 w-full h-full overflow-hidden">
        {/* Waveform placeholder */}
        <div className="absolute inset-0 flex items-center justify-center gap-[2px] px-1 pointer-events-none">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="bg-clip-audio/20 rounded-full"
              style={{
                width: "2px",
                height: `${Math.max(4, Math.sin(i * 0.8) * 16 + 12)}px`,
              }}
            />
          ))}
        </div>
        <span className="text-[10px] text-text-primary/80 truncate relative z-10">
          {effect.name}
        </span>
      </div>
    </ClipBase>
  )
}
