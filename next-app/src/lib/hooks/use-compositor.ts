"use client"

import { useEffect, useRef, useState, type RefObject } from "react"
import { useEditorStore } from "../store"
import { Compositor } from "../engine/compositor"

/**
 * React hook that creates and manages a Compositor instance.
 *
 * Creates the compositor on mount, attaches it to the provided canvas,
 * subscribes to Zustand store changes and calls compositor methods,
 * and destroys on unmount.
 *
 * @param canvasRef - React ref to the HTMLCanvasElement for rendering
 * @returns { compositor, isReady }
 */
export function useCompositor(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const compositorRef = useRef<Compositor | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Initialize compositor
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const store = useEditorStore
    const getState = store.getState
    const setState = (fn: (state: ReturnType<typeof getState>) => void) => {
      store.setState(fn as Parameters<typeof store.setState>[0])
    }

    const compositor = new Compositor(canvas, getState, setState)
    compositorRef.current = compositor

    const { width, height } = getState().settings

    compositor
      .init(width, height)
      .then(() => {
        setIsReady(true)

        // Render the initial frame at current timecode
        const initialTimecode = getState().timecode
        compositor.seekTo(initialTimecode)
      })
      .catch((err) => {
        console.error("[useCompositor] Failed to initialize compositor:", err)
      })

    return () => {
      compositor.destroy()
      compositorRef.current = null
      setIsReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef])

  // Subscribe to store changes
  useEffect(() => {
    if (!compositorRef.current || !isReady) return

    let prevIsPlaying = useEditorStore.getState().is_playing
    let prevTimecode = useEditorStore.getState().timecode
    let prevWidth = useEditorStore.getState().settings.width
    let prevHeight = useEditorStore.getState().settings.height
    let prevEffectIds = new Set(
      useEditorStore.getState().effects.map((e) => e.id)
    )

    const unsubscribe = useEditorStore.subscribe((state, prevState) => {
      const compositor = compositorRef.current
      if (!compositor) return

      // Handle playback state changes
      if (state.is_playing !== prevIsPlaying) {
        prevIsPlaying = state.is_playing
        if (state.is_playing) {
          compositor.startPlayback()
        } else {
          compositor.stopPlayback()
        }
      }

      // Handle timecode changes (for seeking when not playing)
      if (state.timecode !== prevTimecode && !state.is_playing) {
        prevTimecode = state.timecode
        compositor.seekTo(state.timecode)
      } else {
        prevTimecode = state.timecode
      }

      // Handle settings (resize) changes
      if (
        state.settings.width !== prevWidth ||
        state.settings.height !== prevHeight
      ) {
        prevWidth = state.settings.width
        prevHeight = state.settings.height
        compositor.resize(state.settings.width, state.settings.height)
      }

      // Handle effects array changes (detect removed effects)
      const currentIds = new Set(state.effects.map((e) => e.id))
      for (const prevId of prevEffectIds) {
        if (!currentIds.has(prevId)) {
          compositor.videoManager.removeVideo(prevId)
          compositor.imageManager.removeImage(prevId)
          compositor.textManager.removeText(prevId)
          compositor.audioManager.removeAudio(prevId)
          compositor.untrackEffect(prevId)
        }
      }

      if (state.effects !== prevState.effects) {
        prevEffectIds = currentIds
        // Re-compose at current timecode to reflect changes
        compositor.seekTo(state.timecode)
      }

      // Sync transform handles with selection
      if (state.selected_effect !== prevState.selected_effect) {
        if (!state.selected_effect) {
          compositor.transformHandles.hide()
        } else if ("rect" in state.selected_effect) {
          const r = (state.selected_effect as { id: string; rect: { position_on_canvas: { x: number; y: number }; width: number; height: number } })
          compositor.transformHandles.show(r.id, r.rect.position_on_canvas.x, r.rect.position_on_canvas.y, r.rect.width, r.rect.height)
        }
        compositor.app?.render()
      }
    })

    return unsubscribe
  }, [isReady])

  return {
    compositor: compositorRef.current,
    isReady,
  }
}
