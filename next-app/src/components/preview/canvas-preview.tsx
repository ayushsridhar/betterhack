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

    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

    // Connect the PIXI compositor to this canvas
    const { isReady: compositorReady } = useCompositor(canvasRef)

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

      setCanvasSize({ width: Math.floor(newWidth), height: Math.floor(newHeight) })
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

    return (
      <div
        ref={parentRef}
        className="relative flex items-center justify-center w-full h-full overflow-hidden"
      >
        <div
          ref={ref}
          className="relative bg-black border border-border-subtle rounded overflow-hidden"
          style={{
            width: canvasSize.width || "100%",
            height: canvasSize.height || "100%",
          }}
        >
          {/* PIXI canvas — never touch with getContext("2d") */}
          <canvas
            ref={canvasRef}
            className="block w-full h-full"
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
