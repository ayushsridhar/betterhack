"use client"

import { useState, useCallback, useRef } from "react"
import { useEditorStore } from "../../../lib/store"
import { convertMsToHmsMs } from "../../../lib/utils/time"
import type { VideoEffect, AudioEffect } from "../../../lib/types"

interface TrimPanelProps {
  effect: VideoEffect | AudioEffect
}

export function TrimPanel({ effect }: TrimPanelProps) {
  const setEffectStart = useEditorStore((s) => s.setEffectStart)
  const setEffectEnd = useEditorStore((s) => s.setEffectEnd)
  const setEffectDuration = useEditorStore((s) => s.setEffectDuration)
  const setEffectStartPosition = useEditorStore((s) => s.setEffectStartPosition)

  const rawDuration = effect.raw_duration
  const inPoint = effect.start
  const outPoint = effect.end
  const clipDuration = outPoint - inPoint

  // Dragging state for the range handles
  const barRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<"in" | "out" | "range" | null>(null)
  const dragStart = useRef({ x: 0, inPoint: 0, outPoint: 0 })

  const pxToMs = useCallback(
    (px: number) => {
      if (!barRef.current) return 0
      const barWidth = barRef.current.getBoundingClientRect().width
      return (px / barWidth) * rawDuration
    },
    [rawDuration]
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, type: "in" | "out" | "range") => {
      e.preventDefault()
      e.stopPropagation()
      setDragging(type)
      dragStart.current = { x: e.clientX, inPoint, outPoint }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)

      const onMove = (ev: PointerEvent) => {
        const deltaMs = pxToMs(ev.clientX - dragStart.current.x)
        const MIN_DURATION = 100

        if (type === "in") {
          const newIn = Math.max(0, Math.min(dragStart.current.inPoint + deltaMs, dragStart.current.outPoint - MIN_DURATION))
          setEffectStart(effect.id, newIn)
          // Adjust timeline position so the visible clip stays aligned
          const startDelta = newIn - effect.start
          setEffectStartPosition(effect.id, effect.start_at_position + startDelta)
          setEffectDuration(effect.id, effect.end - newIn)
        } else if (type === "out") {
          const newOut = Math.max(dragStart.current.inPoint + MIN_DURATION, Math.min(dragStart.current.outPoint + deltaMs, rawDuration))
          setEffectEnd(effect.id, newOut)
          setEffectDuration(effect.id, newOut - effect.start)
        } else {
          // Drag the whole range
          const maxShift = rawDuration - (dragStart.current.outPoint - dragStart.current.inPoint)
          const shift = Math.max(-dragStart.current.inPoint, Math.min(deltaMs, maxShift - dragStart.current.inPoint))
          const newIn = dragStart.current.inPoint + shift
          const newOut = dragStart.current.outPoint + shift
          if (newIn >= 0 && newOut <= rawDuration) {
            setEffectStart(effect.id, newIn)
            setEffectEnd(effect.id, newOut)
          }
        }
      }

      const onUp = () => {
        setDragging(null)
        document.removeEventListener("pointermove", onMove)
        document.removeEventListener("pointerup", onUp)
      }

      document.addEventListener("pointermove", onMove)
      document.addEventListener("pointerup", onUp)
    },
    [effect, inPoint, outPoint, rawDuration, pxToMs, setEffectStart, setEffectEnd, setEffectDuration, setEffectStartPosition]
  )

  const inPercent = (inPoint / rawDuration) * 100
  const outPercent = (outPoint / rawDuration) * 100

  return (
    <div className="p-3 space-y-3">
      {/* Source range bar */}
      <div>
        <label className="text-text-tertiary text-xs block mb-2">
          Source Range
        </label>
        <div
          ref={barRef}
          className="relative h-8 bg-bg-elevated rounded overflow-hidden select-none"
        >
          {/* Inactive region left */}
          <div
            className="absolute inset-y-0 left-0 bg-black/40"
            style={{ width: `${inPercent}%` }}
          />
          {/* Inactive region right */}
          <div
            className="absolute inset-y-0 right-0 bg-black/40"
            style={{ width: `${100 - outPercent}%` }}
          />

          {/* Active region (draggable) */}
          <div
            className={`absolute inset-y-0 border-y-2 border-accent/60 cursor-grab ${dragging === "range" ? "cursor-grabbing" : ""}`}
            style={{
              left: `${inPercent}%`,
              width: `${outPercent - inPercent}%`,
            }}
            onPointerDown={(e) => handlePointerDown(e, "range")}
          >
            <div className="w-full h-full bg-accent/10" />
          </div>

          {/* In-point handle */}
          <div
            className={`absolute inset-y-0 w-2 cursor-col-resize z-10 ${dragging === "in" ? "bg-accent" : "bg-accent/80 hover:bg-accent"} rounded-l transition-colors`}
            style={{ left: `${inPercent}%`, transform: "translateX(-100%)" }}
            onPointerDown={(e) => handlePointerDown(e, "in")}
          />

          {/* Out-point handle */}
          <div
            className={`absolute inset-y-0 w-2 cursor-col-resize z-10 ${dragging === "out" ? "bg-accent" : "bg-accent/80 hover:bg-accent"} rounded-r transition-colors`}
            style={{ left: `${outPercent}%` }}
            onPointerDown={(e) => handlePointerDown(e, "out")}
          />
        </div>
      </div>

      {/* Timecodes */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <label className="text-text-tertiary block mb-0.5">In Point</label>
          <span className="text-text-primary font-mono text-[11px]">
            {convertMsToHmsMs(inPoint)}
          </span>
        </div>
        <div className="text-center">
          <label className="text-text-tertiary block mb-0.5">Duration</label>
          <span className="text-text-primary font-mono text-[11px]">
            {convertMsToHmsMs(clipDuration)}
          </span>
        </div>
        <div className="text-right">
          <label className="text-text-tertiary block mb-0.5">Out Point</label>
          <span className="text-text-primary font-mono text-[11px]">
            {convertMsToHmsMs(outPoint)}
          </span>
        </div>
      </div>

      {/* Source info */}
      <div className="pt-2 border-t border-border-subtle">
        <div className="flex justify-between text-xs">
          <span className="text-text-tertiary">Source Length</span>
          <span className="text-text-secondary font-mono">
            {convertMsToHmsMs(rawDuration)}
          </span>
        </div>
        {effect.kind === "video" && (
          <div className="flex justify-between text-xs mt-1">
            <span className="text-text-tertiary">Frames</span>
            <span className="text-text-secondary font-mono">
              {effect.frames}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
