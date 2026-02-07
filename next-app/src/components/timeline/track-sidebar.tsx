"use client"

import { useMemo } from "react"
import { useEditorStore } from "../../lib/store"
import type { XTrack } from "../../lib/types"
import {
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react"

interface TrackSidebarProps {
  track: XTrack
  index: number
}

export function TrackSidebar({ track, index }: TrackSidebarProps) {
  const toggleTrackMuted = useEditorStore((s) => s.toggleTrackMuted)
  const toggleTrackVisibility = useEditorStore((s) => s.toggleTrackVisibility)
  const toggleTrackLocked = useEditorStore((s) => s.toggleTrackLocked)
  const removeTrack = useEditorStore((s) => s.removeTrack)
  const removeEffect = useEditorStore((s) => s.removeEffect)
  const effects = useEditorStore((s) => s.effects)
  const tracks = useEditorStore((s) => s.tracks)

  const trackEffects = useMemo(
    () => effects.filter((e) => e.track === index),
    [effects, index]
  )

  const isTextOnly =
    trackEffects.length > 0 && trackEffects.every((e) => e.kind === "text")
  const trackHeight = isTextOnly ? 26 : 52
  const canDelete = tracks.length > 1

  const handleDelete = () => {
    // Remove all effects on this track
    for (const eff of trackEffects) {
      removeEffect(eff.id)
    }
    // Reassign effects on higher tracks to shift down
    const state = useEditorStore.getState()
    for (const eff of state.effects) {
      if (eff.track > index) {
        useEditorStore.getState().setEffectTrack(eff.id, eff.track - 1)
      }
    }
    removeTrack(track.id)
  }

  return (
    <div
      className="flex items-center gap-1 px-2 border-b border-r border-border-subtle bg-bg-raised shrink-0 group/sidebar"
      style={{ width: "140px", height: `${trackHeight}px` }}
    >
      <span className="text-[11px] text-text-secondary truncate flex-1">
        Track {index + 1}
      </span>
      <div className="flex items-center gap-0.5">
        {canDelete && (
          <button
            onClick={handleDelete}
            className="p-1 rounded hover:bg-danger/20 text-text-tertiary hover:text-danger transition-colors opacity-0 group-hover/sidebar:opacity-100"
            title="Delete track"
            aria-label="Delete track"
          >
            <Trash2 size={10} />
          </button>
        )}
        <button
          onClick={() => toggleTrackLocked(track.id)}
          className="p-1 rounded hover:bg-bg-elevated text-text-tertiary hover:text-text-secondary transition-colors"
          title={track.locked ? "Unlock track" : "Lock track"}
          aria-label={track.locked ? "Unlock track" : "Lock track"}
          aria-pressed={track.locked}
        >
          {track.locked ? <Lock size={12} /> : <Unlock size={12} />}
        </button>
        <button
          onClick={() => toggleTrackMuted(track.id)}
          className="p-1 rounded hover:bg-bg-elevated text-text-tertiary hover:text-text-secondary transition-colors"
          title={track.muted ? "Unmute track" : "Mute track"}
          aria-label={track.muted ? "Unmute track" : "Mute track"}
          aria-pressed={track.muted}
        >
          {track.muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
        </button>
        <button
          onClick={() => toggleTrackVisibility(track.id)}
          className="p-1 rounded hover:bg-bg-elevated text-text-tertiary hover:text-text-secondary transition-colors"
          title={track.visible ? "Hide track" : "Show track"}
          aria-label={track.visible ? "Hide track" : "Show track"}
          aria-pressed={track.visible}
        >
          {track.visible ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
      </div>
    </div>
  )
}
