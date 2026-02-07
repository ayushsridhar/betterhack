"use client"

import { useMemo } from "react"
import { useDroppable } from "@dnd-kit/core"
import { useEditorStore } from "../../lib/store"
import type { XTrack, AnyEffect, VideoEffect, ImageEffect } from "../../lib/types"
import { VideoClip } from "./effects/video-clip"
import { AudioClip } from "./effects/audio-clip"
import { ImageClip } from "./effects/image-clip"
import { TextClip } from "./effects/text-clip"
import { TransitionButton } from "./transition-button"

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
  const zoom = useEditorStore((s) => s.zoom)

  const trackEffects = useMemo(
    () => effects.filter((e) => e.track === index),
    [effects, index]
  )

  // Get sorted visual effects (video/image) for transition buttons
  const sortedVisualEffects = useMemo(
    () =>
      trackEffects
        .filter((e): e is VideoEffect | ImageEffect =>
          e.kind === "video" || e.kind === "image"
        )
        .sort((a, b) => a.start_at_position - b.start_at_position),
    [trackEffects]
  )

  // Find adjacent pairs for transition buttons
  const adjacentPairs = useMemo(() => {
    const pairs: { left: VideoEffect | ImageEffect; right: VideoEffect | ImageEffect }[] = []
    for (let i = 0; i < sortedVisualEffects.length - 1; i++) {
      const left = sortedVisualEffects[i]
      const right = sortedVisualEffects[i + 1]
      // Only show transition button if clips are close enough (gap < 500ms)
      const leftEnd = left.start_at_position + (left.end - left.start)
      const gap = right.start_at_position - leftEnd
      if (gap < 500) {
        pairs.push({ left, right })
      }
    }
    return pairs
  }, [sortedVisualEffects])

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
        relative border-b border-border-subtle group/track
        ${index % 2 === 0 ? "bg-bg-surface" : "bg-bg-raised"}
        ${isOver ? "bg-accent-muted" : ""}
        transition-colors duration-100
      `}
      style={{ height: `${trackHeight}px`, minWidth: "100%" }}
    >
      {trackEffects.map((effect) => renderEffect(effect, track.locked))}

      {/* Transition buttons between adjacent clips */}
      {adjacentPairs.map(({ left, right }) => (
        <TransitionButton
          key={`transition-${left.id}-${right.id}`}
          leftEffect={left}
          rightEffect={right}
          zoom={zoom}
        />
      ))}
    </div>
  )
}
