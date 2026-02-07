"use client"

import { useCallback, useMemo } from "react"
import { useEditorStore } from "../../lib/store"

interface TimeRulerProps {
  scrollLeft: number
  visibleWidth: number
  timelineRef: React.RefObject<HTMLElement | null>
}

function formatRulerTime(ms: number): string {
  const totalSeconds = ms / 1000
  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(1)}s`
  }
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function TimeRuler({
  scrollLeft,
  visibleWidth,
  timelineRef,
}: TimeRulerProps) {
  const zoom = useEditorStore((s) => s.zoom)
  const setTimecode = useEditorStore((s) => s.setTimecode)

  const scale = Math.pow(2, zoom)

  // Calculate marker intervals based on zoom
  const markerInterval = useMemo(() => {
    // We want markers roughly every 80-150px apart
    const targetPixelSpacing = 100
    const timePerPixel = 1 / scale // ms per pixel
    const rawInterval = targetPixelSpacing * timePerPixel

    // Snap to nice intervals (in ms)
    const niceIntervals = [
      100, 200, 500, 1000, 2000, 5000, 10000, 15000, 30000, 60000, 120000,
      300000, 600000,
    ]
    const interval =
      niceIntervals.find((n) => n >= rawInterval) ||
      niceIntervals[niceIntervals.length - 1]
    return interval
  }, [scale])

  // Generate markers for visible range
  const markers = useMemo(() => {
    const startTime = Math.max(0, (scrollLeft / scale) - markerInterval)
    const endTime = (scrollLeft + visibleWidth) / scale + markerInterval
    const result: { time: number; x: number }[] = []

    const firstMarker =
      Math.floor(startTime / markerInterval) * markerInterval
    for (let time = firstMarker; time <= endTime; time += markerInterval) {
      if (time < 0) continue
      const x = time * scale
      result.push({ time, x })
    }
    return result
  }, [scrollLeft, visibleWidth, scale, markerInterval])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!timelineRef.current) return
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const x = e.clientX - rect.left + scrollLeft
      const time = Math.max(0, x / scale)
      setTimecode(time)
    },
    [scale, scrollLeft, setTimecode, timelineRef]
  )

  return (
    <div
      className="relative bg-bg-raised border-b border-border-subtle cursor-pointer select-none overflow-hidden"
      style={{ height: "24px" }}
      onClick={handleClick}
    >
      <div className="relative h-full" style={{ width: "100%" }}>
        {markers.map((marker) => (
          <div
            key={marker.time}
            className="absolute top-0 h-full flex flex-col items-start"
            style={{ left: `${marker.x - scrollLeft}px` }}
          >
            <div className="w-px h-2 bg-border-strong" />
            <span className="text-[9px] text-text-tertiary ml-1 leading-none mt-0.5">
              {formatRulerTime(marker.time)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
