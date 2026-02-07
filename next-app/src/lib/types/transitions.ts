import { ImageEffect, VideoEffect } from "./effects"

export type TransitionAbleEffect = ImageEffect | VideoEffect

export interface GLTransition {
  name: string
  glsl: string
  defaultParams?: Record<string, unknown>
}

export interface Transition {
  id: string
  duration: number
  incoming: TransitionAbleEffect
  outgoing: TransitionAbleEffect
  transition: GLTransition
}
