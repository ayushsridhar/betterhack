"use client"

import { useEditorStore } from "../../lib/store"
import { usePlayheadDrag } from "../../lib/hooks/use-playhead-drag"

interface PlayheadProps {
  scrollContainerRef: React.RefObject<HTMLElement | null>
}

export function Playhead({ scrollContainerRef }: PlayheadProps) {
  const timecode = useEditorStore((s) => s.timecode)
  const zoom = useEditorStore((s) => s.zoom)
  const { onPointerDown } = usePlayheadDrag(scrollContainerRef, 0)

  const scale = Math.pow(2, zoom)
  const position = timecode * scale

  return (
    <div
      className="absolute top-0 z-40 pointer-events-none"
      style={{
        left: `${position}px`,
        height: "100%",
      }}
    >
      {/* Triangle handle at top - interactive */}
      <div
        className="pointer-events-auto cursor-col-resize relative"
        onPointerDown={onPointerDown}
        style={{ marginLeft: "-6px" }}
      >
        <svg width="12" height="10" viewBox="0 0 12 10" className="block">
          <polygon points="0,0 12,0 6,10" fill="#f04444" />
        </svg>
      </div>
      {/* Vertical line */}
      <div
        className="w-px bg-danger"
        style={{
          height: "calc(100% - 10px)",
          marginLeft: "-0.5px",
        }}
      />
    </div>
  )
}
