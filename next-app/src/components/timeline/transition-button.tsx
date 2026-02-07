"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, X, ArrowRightLeft } from "lucide-react"
import { useEditorStore } from "../../lib/store"
import { generateId } from "../../lib/utils/id"
import type { VideoEffect, ImageEffect, Transition } from "../../lib/types"

const transitionNames = [
  "fade",
  "dissolve",
  "slide-left",
  "slide-right",
  "slide-up",
  "slide-down",
  "wipe-left",
  "wipe-right",
  "zoom-in",
  "zoom-out",
  "crosszoom",
  "cube",
  "doorway",
  "dreamy",
  "burn",
  "rotate-scale-fade",
  "swap",
  "directional-warp",
]

function formatName(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

interface TransitionButtonProps {
  leftEffect: VideoEffect | ImageEffect
  rightEffect: VideoEffect | ImageEffect
  zoom: number
}

export function TransitionButton({
  leftEffect,
  rightEffect,
  zoom,
}: TransitionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const transitions = useEditorStore((s) => s.transitions)
  const addTransition = useEditorStore((s) => s.addTransition)
  const removeTransition = useEditorStore((s) => s.removeTransition)
  const setTransitionDuration = useEditorStore((s) => s.setTransitionDuration)

  // Check if a transition already exists between these two effects
  const existing = transitions.find(
    (t) =>
      (t.outgoing.id === leftEffect.id && t.incoming.id === rightEffect.id) ||
      (t.outgoing.id === rightEffect.id && t.incoming.id === leftEffect.id)
  )

  // Position: at the junction between the two clips
  const scale = Math.pow(2, zoom)
  const leftEnd =
    leftEffect.start_at_position * scale +
    (leftEffect.end - leftEffect.start) * scale
  const rightStart = rightEffect.start_at_position * scale
  const junctionX = (leftEnd + rightStart) / 2

  // Close popover on outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [isOpen])

  const handleAdd = (name: string) => {
    const duration = 500
    addTransition({
      id: generateId(),
      duration,
      outgoing: leftEffect,
      incoming: rightEffect,
      transition: { name, glsl: "" },
    })
    setIsOpen(false)
  }

  const handleRemove = () => {
    if (existing) {
      removeTransition(existing.id)
    }
  }

  return (
    <div
      className="absolute z-30"
      style={{
        left: `${junctionX}px`,
        top: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      {existing ? (
        // Show active transition indicator
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-accent/80 text-white text-[9px] hover:bg-accent transition-colors"
            title={`Transition: ${formatName(existing.transition.name)}`}
          >
            <ArrowRightLeft size={8} />
            <span className="max-w-[50px] truncate">
              {formatName(existing.transition.name)}
            </span>
          </button>
          <button
            onClick={handleRemove}
            className="p-0.5 rounded-full bg-bg-overlay/80 hover:bg-danger text-text-secondary hover:text-white transition-colors"
            title="Remove transition"
          >
            <X size={8} />
          </button>
        </div>
      ) : (
        // Show "+" button
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-5 h-5 rounded-full bg-bg-overlay/60 hover:bg-accent/80 text-text-tertiary hover:text-white flex items-center justify-center transition-all opacity-0 group-hover/track:opacity-100"
          title="Add transition"
        >
          <Plus size={10} />
        </button>
      )}

      {/* Transition picker popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-48 max-h-60 overflow-y-auto bg-bg-raised border border-border-default rounded-lg shadow-lg p-1.5 z-50"
        >
          <div className="text-[10px] text-text-tertiary px-1.5 py-1 mb-1">
            Choose Transition
          </div>
          {existing && (
            <div className="mb-1.5 px-1.5">
              <label className="text-[10px] text-text-tertiary">
                Duration: {existing.duration}ms
              </label>
              <input
                type="range"
                min={100}
                max={3000}
                step={50}
                value={existing.duration}
                onChange={(e) =>
                  setTransitionDuration(existing.id, Number(e.target.value))
                }
                className="w-full h-1 rounded-full appearance-none bg-bg-elevated accent-accent cursor-pointer"
              />
            </div>
          )}
          <div className="space-y-0.5">
            {transitionNames.map((name) => {
              const isActive = existing?.transition.name === name
              return (
                <button
                  key={name}
                  onClick={() => {
                    if (existing) {
                      removeTransition(existing.id)
                    }
                    handleAdd(name)
                  }}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                    isActive
                      ? "bg-accent/20 text-accent"
                      : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  }`}
                >
                  {formatName(name)}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
