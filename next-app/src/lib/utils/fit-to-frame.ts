import type { EffectRect } from "../types"

/**
 * Calculate an EffectRect that fits the given media dimensions
 * within the project canvas, centered, maintaining aspect ratio.
 */
export function fitToFrame(
  mediaWidth: number,
  mediaHeight: number,
  projectWidth: number,
  projectHeight: number
): EffectRect {
  const scaleX = projectWidth / mediaWidth
  const scaleY = projectHeight / mediaHeight
  const scale = Math.min(scaleX, scaleY)

  const fittedWidth = mediaWidth * scale
  const fittedHeight = mediaHeight * scale

  return {
    width: fittedWidth,
    height: fittedHeight,
    scaleX: 1,
    scaleY: 1,
    position_on_canvas: {
      x: (projectWidth - fittedWidth) / 2,
      y: (projectHeight - fittedHeight) / 2,
    },
    rotation: 0,
    pivot: { x: 0, y: 0 },
  }
}
