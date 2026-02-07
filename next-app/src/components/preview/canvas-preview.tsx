"use client"

import { forwardRef, useRef, useState, useEffect, useCallback } from "react"
import { useEditorStore } from "../../lib/store"
import { useCompositor } from "../../lib/hooks/use-compositor"

export const CanvasPreview = forwardRef<HTMLDivElement>(
  function CanvasPreview(_props, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const parentRef = useRef<HTMLDivElement>(null)

    const width = useEditorStore((s) => s.settings.width)
    const height = useEditorStore((s) => s.settings.height)

    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

    const { compositor, isReady: compositorReady } = useCompositor(canvasRef)

    const calculateSize = useCallback(() => {
      const parent = parentRef.current
      if (!parent) return

      const parentRect = parent.getBoundingClientRect()
      const parentW = parentRect.width
      const parentH = parentRect.height

      if (parentW === 0 || parentH === 0) return

      const aspectRatio = width / height
      let newWidth: number
      let newHeight: number

      if (parentW / parentH > aspectRatio) {
        newHeight = parentH
        newWidth = parentH * aspectRatio
      } else {
        newWidth = parentW
        newHeight = parentW / aspectRatio
      }

      setContainerSize({ width: Math.floor(newWidth), height: Math.floor(newHeight) })
    }, [width, height])

    useEffect(() => {
      const parent = parentRef.current
      if (!parent) return

      calculateSize()

      const observer = new ResizeObserver(() => {
        calculateSize()
      })
      observer.observe(parent)

      return () => {
        observer.disconnect()
      }
    }, [calculateSize])

    // When the container size changes, resize the PIXI renderer to match
    // so the PIXI world maps 1:1 to the displayed canvas
    useEffect(() => {
      if (!compositor || !compositorReady) return
      if (containerSize.width === 0 || containerSize.height === 0) return

      const canvas = canvasRef.current
      if (!canvas) return

      // Set canvas buffer size to project resolution
      // but CSS display size to the container size
      canvas.style.width = `${containerSize.width}px`
      canvas.style.height = `${containerSize.height}px`
    }, [containerSize, compositor, compositorReady])

    return (
      <div
        ref={parentRef}
        className="relative flex items-center justify-center w-full h-full overflow-hidden"
      >
        <div
          ref={ref}
          className="relative bg-black border border-border-subtle rounded overflow-hidden flex items-center justify-center"
          style={{
            width: containerSize.width || "100%",
            height: containerSize.height || "100%",
          }}
        >
          {/* PIXI canvas — PIXI controls the buffer size, we control the CSS display size */}
          <canvas
            ref={canvasRef}
          />

          {/* HTML placeholder overlay — shown until compositor is ready */}
          {!compositorReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <span className="text-text-tertiary text-sm">Preview</span>
            </div>
          )}
        </div>
      </div>
    )
  }
)
