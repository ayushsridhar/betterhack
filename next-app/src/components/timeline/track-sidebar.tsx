"use client"

import { useEditorStore } from "../../lib/store"
import type { XTrack } from "../../lib/types"
import {
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
} from "lucide-react"

interface TrackSidebarProps {
  track: XTrack
  index: number
}

export function TrackSidebar({ track, index }: TrackSidebarProps) {
  const toggleTrackMuted = useEditorStore((s) => s.toggleTrackMuted)
  const toggleTrackVisibility = useEditorStore((s) => s.toggleTrackVisibility)
  const toggleTrackLocked = useEditorStore((s) => s.toggleTrackLocked)

  return (
    <div
      className="flex items-center gap-1 px-2 border-b border-r border-border-subtle bg-bg-raised shrink-0"
      style={{ width: "140px", height: "52px" }}
    >
      <span className="text-[11px] text-text-secondary truncate flex-1">
        Track {index + 1}
      </span>
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => toggleTrackLocked(track.id)}
          className="p-1 rounded hover:bg-bg-elevated text-text-tertiary hover:text-text-secondary transition-colors"
          title={track.locked ? "Unlock track" : "Lock track"}
        >
          {track.locked ? <Lock size={12} /> : <Unlock size={12} />}
        </button>
        <button
          onClick={() => toggleTrackMuted(track.id)}
          className="p-1 rounded hover:bg-bg-elevated text-text-tertiary hover:text-text-secondary transition-colors"
          title={track.muted ? "Unmute track" : "Mute track"}
        >
          {track.muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
        </button>
        <button
          onClick={() => toggleTrackVisibility(track.id)}
          className="p-1 rounded hover:bg-bg-elevated text-text-tertiary hover:text-text-secondary transition-colors"
          title={track.visible ? "Hide track" : "Show track"}
        >
          {track.visible ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
      </div>
    </div>
  )
}
