"use client"

import { useEffect, useRef } from "react"
import { useEditorStore } from "../store"
import { calculateProjectDuration } from "../utils/calculate-project-duration"

export function usePlayback() {
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  const isPlaying = useEditorStore((s) => s.is_playing)
  const effects = useEditorStore((s) => s.effects)
  const setTimecode = useEditorStore((s) => s.setTimecode)
  const setIsPlaying = useEditorStore((s) => s.setIsPlaying)

  useEffect(() => {
    if (!isPlaying) {
      // Clean up any running RAF when paused
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      return
    }

    const duration = calculateProjectDuration(effects)

    // If there are no effects or duration is 0, stop immediately
    if (duration <= 0) {
      setIsPlaying(false)
      return
    }

    lastTimeRef.current = performance.now()

    const tick = (now: number) => {
      const delta = now - lastTimeRef.current
      lastTimeRef.current = now

      const currentTimecode = useEditorStore.getState().timecode
      const newTimecode = currentTimecode + delta

      if (newTimecode >= duration) {
        // Reached the end -- stop and reset to beginning
        setTimecode(0)
        setIsPlaying(false)
        rafRef.current = null
        return
      }

      setTimecode(newTimecode)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [isPlaying, effects, setTimecode, setIsPlaying])
}
