"use client"

import { useMemo, useCallback } from "react"
import { useDraggable } from "@dnd-kit/core"
import { useEditorStore } from "../../../lib/store"
import { useEffectTrim } from "../../../lib/hooks/use-effect-trim"
import type { AnyEffect } from "../../../lib/types"

interface ClipBaseProps {
  effect: AnyEffect
  locked: boolean
  children?: React.ReactNode
}

const clipColorMap = {
  video: {
    bg: "bg-clip-video-bg",
    border: "border-clip-video-border",
    accent: "bg-clip-video",
  },
  audio: {
    bg: "bg-clip-audio-bg",
    border: "border-clip-audio-border",
    accent: "bg-clip-audio",
  },
  image: {
    bg: "bg-clip-image-bg",
    border: "border-clip-image-border",
    accent: "bg-clip-image",
  },
  text: {
    bg: "bg-clip-text-bg",
    border: "border-clip-text-border",
    accent: "bg-clip-text",
  },
} as const

export function ClipBase({ effect, locked, children }: ClipBaseProps) {
  const zoom = useEditorStore((s) => s.zoom)
  const selectedEffect = useEditorStore((s) => s.selected_effect)
  const setSelectedEffect = useEditorStore((s) => s.setSelectedEffect)
  const isSelected = selectedEffect?.id === effect.id

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: effect.id,
      data: { effectId: effect.id, kind: effect.kind },
      disabled: locked,
    })

  const leftTrim = useEffectTrim(effect.id, "left")
  const rightTrim = useEffectTrim(effect.id, "right")

  const scale = Math.pow(2, zoom)
  const width = (effect.end - effect.start) * scale
  const left = effect.start_at_position * scale

  const style = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      width: `${width}px`,
      left: `${left}px`,
      minWidth: "4px",
    }
    if (transform) {
      baseStyle.transform = `translate3d(${transform.x}px, ${transform.y}px, 0)`
    }
    return baseStyle
  }, [width, left, transform])

  const colors = clipColorMap[effect.kind]

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!locked) {
        setSelectedEffect(effect)
      }
    },
    [effect, locked, setSelectedEffect]
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      className={`
        absolute top-0 h-full rounded-sm border select-none
        ${colors.bg} ${colors.border}
        ${isSelected ? "ring-1 ring-accent brightness-125" : ""}
        ${locked ? "opacity-50 pointer-events-none" : "cursor-grab"}
        ${isDragging ? "opacity-70 z-50" : "z-10"}
        transition-shadow duration-100
      `}
      {...attributes}
      {...listeners}
    >
      {/* Left trim handle */}
      {!locked && (
        <div
          className="absolute left-0 top-0 h-full w-1.5 cursor-col-resize z-20 hover:bg-white/20 rounded-l-sm"
          onPointerDown={leftTrim.onPointerDown}
        />
      )}

      {/* Content */}
      <div className="px-2 py-0.5 overflow-hidden whitespace-nowrap text-ellipsis h-full flex items-center">
        {children}
      </div>

      {/* Right trim handle */}
      {!locked && (
        <div
          className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize z-20 hover:bg-white/20 rounded-r-sm"
          onPointerDown={rightTrim.onPointerDown}
        />
      )}
    </div>
  )
}
