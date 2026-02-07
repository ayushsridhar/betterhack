"use client"

import { useCallback, type MouseEvent } from "react"
import { useEditorStore } from "../store"

export function useCanvasInteraction() {
  const setSelectedEffect = useEditorStore((s) => s.setSelectedEffect)

  const onClick = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      // If the click is directly on the canvas container (not on an effect overlay),
      // deselect the current effect
      const target = e.target as HTMLElement
      if (target.tagName === "CANVAS" || target.dataset.canvasContainer !== undefined) {
        setSelectedEffect(null)
      }
    },
    [setSelectedEffect]
  )

  return { onClick }
}
