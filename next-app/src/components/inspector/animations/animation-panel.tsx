"use client"

import { useState } from "react"
import { useEditorStore } from "../../../lib/store"
import { AnimationCard } from "./animation-card"
import type {
  VideoEffect,
  ImageEffect,
  AnimationInName,
  AnimationOutName,
} from "../../../lib/types"

const animationsIn: AnimationInName[] = [
  "slide-in",
  "fade-in",
  "spin-in",
  "bounce-in",
  "wipe-in",
  "blur-in",
  "zoom-in",
]

const animationsOut: AnimationOutName[] = [
  "slide-out",
  "fade-out",
  "spin-out",
  "bounce-out",
  "wipe-out",
  "blur-out",
  "zoom-out",
]

interface AnimationPanelProps {
  effect: VideoEffect | ImageEffect
}

export function AnimationPanel({ effect }: AnimationPanelProps) {
  const animations = useEditorStore((s) => s.animations)
  const addAnimation = useEditorStore((s) => s.addAnimation)
  const removeAnimation = useEditorStore((s) => s.removeAnimation)
  const setAnimationDuration = useEditorStore((s) => s.setAnimationDuration)

  const effectAnimations = animations.filter((a) => a.targetEffect.id === effect.id)
  const activeInNames = new Set(
    effectAnimations.filter((a) => a.type === "in").map((a) => a.name)
  )
  const activeOutNames = new Set(
    effectAnimations.filter((a) => a.type === "out").map((a) => a.name)
  )

  // Track duration in local state, initialized from first found animation or default 500
  const initialDuration = effectAnimations.length > 0 ? effectAnimations[0].duration : 500
  const [duration, setDuration] = useState(initialDuration)

  const handleToggleIn = (name: AnimationInName) => {
    if (activeInNames.has(name)) {
      // Clicking the same active animation — just remove it
      removeAnimation(effect.id, "in", "Animation")
    } else {
      // Remove any existing "in" animation first, then add the new one
      if (activeInNames.size > 0) {
        removeAnimation(effect.id, "in", "Animation")
      }
      addAnimation({
        name,
        type: "in",
        targetEffect: effect,
        duration,
        for: "Animation",
      })
    }
  }

  const handleToggleOut = (name: AnimationOutName) => {
    if (activeOutNames.has(name)) {
      // Clicking the same active animation — just remove it
      removeAnimation(effect.id, "out", "Animation")
    } else {
      // Remove any existing "out" animation first, then add the new one
      if (activeOutNames.size > 0) {
        removeAnimation(effect.id, "out", "Animation")
      }
      addAnimation({
        name,
        type: "out",
        targetEffect: effect,
        duration,
        for: "Animation",
      })
    }
  }

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration)
    // Also update the store if an animation exists
    if (effectAnimations.length > 0) {
      setAnimationDuration(effect.id, newDuration)
    }
  }

  return (
    <div className="p-3 space-y-4">
      {/* Duration */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-text-tertiary text-xs">Duration</label>
          <span className="text-text-secondary text-xs font-mono">{duration}ms</span>
        </div>
        <input
          type="range"
          min={100}
          max={2000}
          step={50}
          value={duration}
          onChange={(e) => handleDurationChange(Number(e.target.value))}
          className="w-full h-1 rounded-full appearance-none bg-bg-elevated accent-accent cursor-pointer"
        />
        <div className="flex justify-between mt-1">
          <span className="text-text-tertiary text-[10px]">100ms</span>
          <span className="text-text-tertiary text-[10px]">2000ms</span>
        </div>
      </div>

      {/* In Animations */}
      <div>
        <label className="text-text-tertiary text-xs block mb-2">In Animations</label>
        <div className="grid grid-cols-2 gap-1.5">
          {animationsIn.map((name) => (
            <AnimationCard
              key={name}
              name={name}
              active={activeInNames.has(name)}
              onClick={() => handleToggleIn(name)}
            />
          ))}
        </div>
      </div>

      {/* Out Animations */}
      <div>
        <label className="text-text-tertiary text-xs block mb-2">Out Animations</label>
        <div className="grid grid-cols-2 gap-1.5">
          {animationsOut.map((name) => (
            <AnimationCard
              key={name}
              name={name}
              active={activeOutNames.has(name)}
              onClick={() => handleToggleOut(name)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
