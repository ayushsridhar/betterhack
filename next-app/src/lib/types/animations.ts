import { ImageEffect, VideoEffect } from "./effects"

export type AnimationInName =
  | "slide-in"
  | "fade-in"
  | "spin-in"
  | "bounce-in"
  | "wipe-in"
  | "blur-in"
  | "zoom-in"

export type AnimationOutName =
  | "slide-out"
  | "fade-out"
  | "spin-out"
  | "bounce-out"
  | "wipe-out"
  | "blur-out"
  | "zoom-out"

export type AnimationFor = "Animation" | "Transition"

interface AnimationBase {
  targetEffect: VideoEffect | ImageEffect
  duration: number
  for: AnimationFor
}

export interface AnimationIn extends AnimationBase {
  name: AnimationInName
  type: "in"
}

export interface AnimationOut extends AnimationBase {
  name: AnimationOutName
  type: "out"
}

export type Animation = AnimationIn | AnimationOut
