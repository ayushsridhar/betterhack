"use client"

import { useCallback, useRef } from "react"
import { useEditorStore } from "../store"

export function usePlayheadDrag(
  timelineRef: React.RefObject<HTMLElement | null>,
  sidebarWidth: number = 140
) {
  const setTimecode = useEditorStore((s) => s.setTimecode)
  const zoom = useEditorStore((s) => s.zoom)
  const isDragging = useRef(false)

  const pixelToTime = useCallback(
    (clientX: number) => {
      if (!timelineRef.current) return 0
      const rect = timelineRef.current.getBoundingClientRect()
      const scrollLeft = timelineRef.current.scrollLeft
      const pixelX = clientX - rect.left - sidebarWidth + scrollLeft
      const time = Math.max(0, pixelX / Math.pow(2, zoom))
      return time
    },
    [zoom, timelineRef, sidebarWidth]
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      isDragging.current = true
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)

      const time = pixelToTime(e.clientX)
      setTimecode(time)

      const onPointerMove = (ev: PointerEvent) => {
        if (!isDragging.current) return
        const t = pixelToTime(ev.clientX)
        setTimecode(t)
      }

      const onPointerUp = (ev: PointerEvent) => {
        isDragging.current = false
        ;(e.target as HTMLElement).releasePointerCapture(ev.pointerId)
        document.removeEventListener("pointermove", onPointerMove)
        document.removeEventListener("pointerup", onPointerUp)
      }

      document.addEventListener("pointermove", onPointerMove)
      document.addEventListener("pointerup", onPointerUp)
    },
    [pixelToTime, setTimecode]
  )

  return { onPointerDown }
}
