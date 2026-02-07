import { AnyEffect } from "../types"

export function findPlaceForNewEffect(
  effects: AnyEffect[],
  track: number,
  duration: number
): number {
  const trackEffects = effects
    .filter((e) => e.track === track)
    .sort((a, b) => a.start_at_position - b.start_at_position)

  if (trackEffects.length === 0) return 0

  const lastEffect = trackEffects[trackEffects.length - 1]
  return lastEffect.start_at_position + (lastEffect.end - lastEffect.start)
}

export function calculateEffectWidth(effect: AnyEffect, zoom: number): number {
  return (effect.end - effect.start) * Math.pow(2, zoom)
}

export function calculateStartPosition(startPosition: number, zoom: number): number {
  return startPosition * Math.pow(2, zoom)
}

export function getEffectsBefore(
  effects: AnyEffect[],
  position: number
): AnyEffect[] {
  return effects
    .filter(
      (e) => e.start_at_position + (e.end - e.start) <= position
    )
    .sort(
      (a, b) =>
        b.start_at_position +
        (b.end - b.start) -
        (a.start_at_position + (a.end - a.start))
    )
}

export function getEffectsAfter(
  effects: AnyEffect[],
  position: number
): AnyEffect[] {
  return effects
    .filter((e) => e.start_at_position >= position)
    .sort((a, b) => a.start_at_position - b.start_at_position)
}
