"use client"

import { useState } from "react"
import { useEditorStore } from "../../../lib/store"
import { TransitionConfig } from "./transition-config"
import type { VideoEffect, ImageEffect } from "../../../lib/types"
import { generateId } from "../../../lib/utils/id"
import { X } from "lucide-react"

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
  "directional-warp",
  "dreamy",
  "burn",
  "circle",
  "colour-distance",
  "cube",
  "doorway",
  "heart",
  "hexagonalize",
  "kaleidoscope",
  "morph",
  "perlin",
  "pinwheel",
  "pixelize",
  "polar",
  "radial",
  "ripple",
  "rotate-scale-fade",
  "swap",
  "wind",
]

function formatName(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

interface TransitionPanelProps {
  effect: VideoEffect | ImageEffect
}

export function TransitionPanel({ effect }: TransitionPanelProps) {
  const transitions = useEditorStore((s) => s.transitions)
  const addTransition = useEditorStore((s) => s.addTransition)
  const removeTransition = useEditorStore((s) => s.removeTransition)
  const setTransitionDuration = useEditorStore((s) => s.setTransitionDuration)
  const [duration, setDuration] = useState(500)

  const effectTransitions = transitions.filter(
    (t) => t.incoming.id === effect.id || t.outgoing.id === effect.id
  )

  const effects = useEditorStore((s) => s.effects)

  const handleAdd = (name: string) => {
    // Find effects on the same track, sorted by start position
    const sameTrackEffects = effects
      .filter(
        (e) =>
          e.track === effect.track &&
          e.id !== effect.id &&
          (e.kind === "video" || e.kind === "image")
      )
      .sort((a, b) => a.start_at_position - b.start_at_position) as (VideoEffect | ImageEffect)[]

    // Find the adjacent effect (immediately before or after by start_at_position)
    const before = sameTrackEffects
      .filter((e) => e.start_at_position < effect.start_at_position)
      .at(-1)
    const after = sameTrackEffects
      .find((e) => e.start_at_position > effect.start_at_position)

    const adjacent = before ?? after
    if (!adjacent) return // No adjacent effect found — don't create the transition

    // outgoing = earlier effect, incoming = later effect
    const outgoing = adjacent.start_at_position < effect.start_at_position ? adjacent : effect
    const incoming = adjacent.start_at_position < effect.start_at_position ? effect : adjacent

    addTransition({
      id: generateId(),
      duration,
      incoming,
      outgoing,
      transition: {
        name,
        glsl: "",
      },
    })
  }

  const handleRemove = (id: string) => {
    removeTransition(id)
  }

  const handleDurationChange = (transitionId: string, newDuration: number) => {
    setTransitionDuration(transitionId, newDuration)
  }

  return (
    <div className="p-3 space-y-4">
      {/* Default duration for new transitions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-text-tertiary text-xs">Default Duration</label>
          <span className="text-text-secondary text-xs font-mono">{duration}ms</span>
        </div>
        <input
          type="range"
          min={100}
          max={3000}
          step={50}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full h-1 rounded-full appearance-none bg-bg-elevated accent-accent cursor-pointer"
        />
        <div className="flex justify-between mt-1">
          <span className="text-text-tertiary text-[10px]">100ms</span>
          <span className="text-text-tertiary text-[10px]">3000ms</span>
        </div>
      </div>

      {/* Applied Transitions */}
      {effectTransitions.length > 0 && (
        <div>
          <label className="text-text-tertiary text-xs block mb-2">
            Active Transitions ({effectTransitions.length})
          </label>
          <div className="space-y-1.5">
            {effectTransitions.map((t) => (
              <div
                key={t.id}
                className="bg-bg-surface border border-border-subtle rounded p-2 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    <span className="text-text-primary text-xs truncate">
                      {formatName(t.transition.name)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemove(t.id)}
                    className="p-0.5 rounded hover:bg-danger/20 text-text-tertiary hover:text-danger transition-colors shrink-0"
                    title="Remove transition"
                  >
                    <X size={12} />
                  </button>
                </div>
                <TransitionConfig
                  duration={t.duration}
                  onDurationChange={(d) => handleDurationChange(t.id, d)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Transitions */}
      <div>
        <label className="text-text-tertiary text-xs block mb-2">
          Available Transitions
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {transitionNames.map((name) => (
            <button
              key={name}
              onClick={() => handleAdd(name)}
              className="bg-bg-surface border border-border-subtle rounded p-2 cursor-pointer hover:border-border-default transition-colors text-left"
            >
              <span className="text-text-secondary text-xs hover:text-text-primary transition-colors">
                {formatName(name)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
