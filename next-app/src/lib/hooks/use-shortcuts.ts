"use client"

import { useEffect, useRef } from "react"
import { useEditorStore } from "@/lib/store"
import { ShortcutManager } from "@/lib/services/shortcuts"

export function useShortcuts() {
  const managerRef = useRef<ShortcutManager | null>(null)

  const toggleIsPlaying = useEditorStore((s) => s.toggleIsPlaying)
  const removeEffect = useEditorStore((s) => s.removeEffect)
  const splitEffect = useEditorStore((s) => s.splitEffect)
  const setTimecode = useEditorStore((s) => s.setTimecode)

  useEffect(() => {
    const manager = new ShortcutManager()
    managerRef.current = manager

    // Space -> toggle play/pause
    manager.register("space", () => {
      toggleIsPlaying()
    })

    // Delete / Backspace -> remove selected effect
    manager.register("delete", () => {
      const selected = useEditorStore.getState().selected_effect
      if (selected) removeEffect(selected.id)
    })

    manager.register("backspace", () => {
      const selected = useEditorStore.getState().selected_effect
      if (selected) removeEffect(selected.id)
    })

    // Ctrl+Z -> undo
    manager.register("ctrl+z", () => {
      useEditorStore.temporal.getState().undo()
    })

    // Ctrl+Shift+Z -> redo
    manager.register("ctrl+shift+z", () => {
      useEditorStore.temporal.getState().redo()
    })

    // Ctrl+Y -> redo (alternative)
    manager.register("ctrl+y", () => {
      useEditorStore.temporal.getState().redo()
    })

    // Ctrl+B -> split effect at current timecode
    manager.register("ctrl+b", () => {
      const state = useEditorStore.getState()
      const selected = state.selected_effect
      if (selected) {
        splitEffect(selected.id, state.timecode)
      }
    })

    // Left arrow -> move timecode back 1 frame
    manager.register("arrowleft", () => {
      const state = useEditorStore.getState()
      const frameDuration = 1000 / state.timebase
      const newTimecode = Math.max(0, state.timecode - frameDuration)
      setTimecode(newTimecode)
    })

    // Right arrow -> move timecode forward 1 frame
    manager.register("arrowright", () => {
      const state = useEditorStore.getState()
      const frameDuration = 1000 / state.timebase
      setTimecode(state.timecode + frameDuration)
    })

    window.addEventListener("keydown", manager.handleKeyDown)

    return () => {
      window.removeEventListener("keydown", manager.handleKeyDown)
      manager.destroy()
    }
  }, [toggleIsPlaying, removeEffect, splitEffect, setTimecode])
}
