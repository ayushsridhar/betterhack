import { AnyEffect } from "../types"

export function calculateProjectDuration(effects: AnyEffect[]): number {
  if (effects.length === 0) return 0

  return Math.max(
    ...effects.map((e) => e.start_at_position + (e.end - e.start))
  )
}
