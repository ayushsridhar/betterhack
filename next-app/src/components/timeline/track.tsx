"use client"

import { useMemo } from "react"
import { useDroppable } from "@dnd-kit/core"
import { useEditorStore } from "../../lib/store"
import type { XTrack, AnyEffect } from "../../lib/types"
import { VideoClip } from "./effects/video-clip"
import { AudioClip } from "./effects/audio-clip"
import { ImageClip } from "./effects/image-clip"
import { TextClip } from "./effects/text-clip"

interface TrackProps {
  track: XTrack
  index: number
}

function renderEffect(effect: AnyEffect, locked: boolean) {
  switch (effect.kind) {
    case "video":
      return <VideoClip key={effect.id} effect={effect} locked={locked} />
    case "audio":
      return <AudioClip key={effect.id} effect={effect} locked={locked} />
    case "image":
      return <ImageClip key={effect.id} effect={effect} locked={locked} />
    case "text":
      return <TextClip key={effect.id} effect={effect} locked={locked} />
  }
}

export function Track({ track, index }: TrackProps) {
  const effects = useEditorStore((s) => s.effects)

  const trackEffects = useMemo(
    () => effects.filter((e) => e.track === index),
    [effects, index]
  )

  // Determine if this is a text-only track (26px) or standard (52px)
  const isTextOnly =
    trackEffects.length > 0 && trackEffects.every((e) => e.kind === "text")
  const trackHeight = isTextOnly ? 26 : 52

  const { setNodeRef, isOver } = useDroppable({
    id: `track-${track.id}`,
    data: { trackId: track.id, trackIndex: index },
  })

  return (
    <div
      ref={setNodeRef}
      className={`
        relative border-b border-border-subtle
        ${index % 2 === 0 ? "bg-bg-surface" : "bg-bg-raised"}
        ${isOver ? "bg-accent-muted" : ""}
        transition-colors duration-100
      `}
      style={{ height: `${trackHeight}px`, minWidth: "100%" }}
    >
      {trackEffects.map((effect) => renderEffect(effect, track.locked))}
    </div>
  )
}
