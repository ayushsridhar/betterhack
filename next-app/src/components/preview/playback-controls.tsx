"use client"

import { useState, useCallback, RefObject } from "react"
import { Play, Pause, SkipBack, SkipForward, Maximize2, Minimize2 } from "lucide-react"
import { useEditorStore } from "../../lib/store"

interface PlaybackControlsProps {
  containerRef: RefObject<HTMLDivElement | null>
}

export function PlaybackControls({ containerRef }: PlaybackControlsProps) {
  const isPlaying = useEditorStore((s) => s.is_playing)
  const toggleIsPlaying = useEditorStore((s) => s.toggleIsPlaying)
  const setTimecode = useEditorStore((s) => s.setTimecode)
  const effects = useEditorStore((s) => s.effects)

  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleSkipToStart = useCallback(() => {
    setTimecode(0)
  }, [setTimecode])

  const handleSkipToEnd = useCallback(() => {
    if (effects.length === 0) return
    const duration = Math.max(
      ...effects.map((e) => e.start_at_position + (e.end - e.start))
    )
    setTimecode(duration)
  }, [effects, setTimecode])

  const handleFullscreen = useCallback(async () => {
    const container = containerRef.current
    if (!container) return

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.warn("Fullscreen request failed:", err)
    }
  }, [containerRef])

  return (
    <div className="flex items-center justify-center gap-1 px-3 py-2 bg-bg-raised border-t border-border-subtle">
      <button
        onClick={handleSkipToStart}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors"
        title="Skip to start"
      >
        <SkipBack size={16} />
      </button>

      <button
        onClick={toggleIsPlaying}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-bg-elevated text-text-primary transition-colors"
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>

      <button
        onClick={handleSkipToEnd}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors"
        title="Skip to end"
      >
        <SkipForward size={16} />
      </button>

      <div className="w-px h-4 bg-border-subtle mx-1" />

      <button
        onClick={handleFullscreen}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors"
        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>
    </div>
  )
}
