"use client"

import { useCallback, useRef } from "react"
import { useEditorStore } from "../store"

export function useEffectTrim(effectId: string, side: "left" | "right") {
  const zoom = useEditorStore((s) => s.zoom)
  const setEffectStart = useEditorStore((s) => s.setEffectStart)
  const setEffectEnd = useEditorStore((s) => s.setEffectEnd)
  const setEffectStartPosition = useEditorStore((s) => s.setEffectStartPosition)
  const setEffectDuration = useEditorStore((s) => s.setEffectDuration)
  const effects = useEditorStore((s) => s.effects)
  const isDragging = useRef(false)
  const startX = useRef(0)

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      isDragging.current = true
      startX.current = e.clientX
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)

      const effect = effects.find((eff) => eff.id === effectId)
      if (!effect) return

      const initialStart = effect.start
      const initialEnd = effect.end
      const initialStartPosition = effect.start_at_position
      const scale = Math.pow(2, zoom)

      const onPointerMove = (ev: PointerEvent) => {
        if (!isDragging.current) return
        const deltaPixels = ev.clientX - startX.current
        const deltaTime = deltaPixels / scale

        if (side === "left") {
          const newStart = Math.max(0, initialStart + deltaTime)
          const maxStart = initialEnd - 1 // Minimum 1ms duration
          const clampedStart = Math.min(newStart, maxStart)
          const startDelta = clampedStart - initialStart
          setEffectStart(effectId, clampedStart)
          setEffectStartPosition(effectId, initialStartPosition + startDelta)
        } else {
          const newEnd = initialEnd + deltaTime
          const minEnd = initialStart + 1 // Minimum 1ms duration
          const clampedEnd = Math.max(newEnd, minEnd)
          setEffectEnd(effectId, clampedEnd)
          setEffectDuration(effectId, clampedEnd - initialStart)
        }
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
    [
      effectId,
      effects,
      zoom,
      side,
      setEffectStart,
      setEffectEnd,
      setEffectStartPosition,
      setEffectDuration,
    ]
  )

  return { onPointerDown }
}
