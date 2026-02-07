import type { Animation } from "../../types"

type PixiContainer = import("pixi.js").Container

/** Simple easing functions */
function easeOutPower2(t: number): number {
  return 1 - (1 - t) * (1 - t)
}
function easeInPower2(t: number): number {
  return t * t
}
function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
function easeInBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return c3 * t * t * t - c1 * t * t
}
function easeOutElastic(t: number): number {
  if (t === 0 || t === 1) return t
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1
}
function easeInElastic(t: number): number {
  if (t === 0 || t === 1) return t
  return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * Math.PI / 3))
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v))
}

/**
 * AnimationManager applies frame-based entrance/exit animations to PIXI display objects.
 * Animations are computed synchronously each frame based on localTime, so they
 * work correctly with the compositor's manual render loop (no GSAP ticker conflict).
 */
export class AnimationManager {
  /**
   * Apply an animation to a PIXI display object for the current frame.
   * This modifies the target's properties directly and should be called
   * AFTER updateRect so it overrides the base position/scale/alpha.
   *
   * @param target - The PIXI container/sprite to animate
   * @param animation - The animation definition from the store
   * @param effectDuration - The total duration of the parent effect in ms
   * @param localTime - Current time within the effect in ms (0 = effect start)
   * @param stageWidth - Width of the compositor stage
   * @param stageHeight - Height of the compositor stage
   */
  applyAnimation(
    target: PixiContainer,
    animation: Animation,
    effectDuration: number,
    localTime: number,
    stageWidth: number = 1920,
    _stageHeight: number = 1080
  ): void {
    const animDuration = animation.duration // ms

    switch (animation.name) {
      case "slide-in": {
        // Slide from left over first animDuration ms
        const progress = clamp01(localTime / animDuration)
        const eased = easeOutPower2(progress)
        // Offset from -stageWidth to 0, added to current position
        const offsetX = -stageWidth * (1 - eased)
        target.x += offsetX
        break
      }

      case "slide-out": {
        // Slide to right over last animDuration ms
        const startTime = effectDuration - animDuration
        if (localTime >= startTime) {
          const progress = clamp01((localTime - startTime) / animDuration)
          const eased = easeInPower2(progress)
          const offsetX = stageWidth * eased
          target.x += offsetX
        }
        break
      }

      case "fade-in": {
        const progress = clamp01(localTime / animDuration)
        const eased = easeOutPower2(progress)
        target.alpha = eased
        break
      }

      case "fade-out": {
        const startTime = effectDuration - animDuration
        if (localTime >= startTime) {
          const progress = clamp01((localTime - startTime) / animDuration)
          const eased = easeInPower2(progress)
          target.alpha = 1 - eased
        }
        break
      }

      case "zoom-in": {
        const progress = clamp01(localTime / animDuration)
        const eased = easeOutBack(progress)
        target.scale.x *= eased
        target.scale.y *= eased
        break
      }

      case "zoom-out": {
        const startTime = effectDuration - animDuration
        if (localTime >= startTime) {
          const progress = clamp01((localTime - startTime) / animDuration)
          const eased = easeInBack(progress)
          const scaleFactor = 1 - eased
          target.scale.x *= scaleFactor
          target.scale.y *= scaleFactor
        }
        break
      }

      case "spin-in": {
        const progress = clamp01(localTime / animDuration)
        const eased = easeOutPower2(progress)
        target.rotation += Math.PI * 2 * (1 - eased)
        target.alpha = eased
        break
      }

      case "spin-out": {
        const startTime = effectDuration - animDuration
        if (localTime >= startTime) {
          const progress = clamp01((localTime - startTime) / animDuration)
          const eased = easeInPower2(progress)
          target.rotation += Math.PI * 2 * eased
          target.alpha = 1 - eased
        }
        break
      }

      case "bounce-in": {
        const progress = clamp01(localTime / animDuration)
        const eased = easeOutElastic(progress)
        target.scale.x *= eased
        target.scale.y *= eased
        break
      }

      case "bounce-out": {
        const startTime = effectDuration - animDuration
        if (localTime >= startTime) {
          const progress = clamp01((localTime - startTime) / animDuration)
          const eased = easeInElastic(progress)
          const scaleFactor = 1 - eased
          target.scale.x *= Math.max(0, scaleFactor)
          target.scale.y *= Math.max(0, scaleFactor)
        }
        break
      }

      case "wipe-in": {
        const progress = clamp01(localTime / animDuration)
        const eased = easeOutPower2(progress)
        target.alpha = eased
        break
      }

      case "wipe-out": {
        const startTime = effectDuration - animDuration
        if (localTime >= startTime) {
          const progress = clamp01((localTime - startTime) / animDuration)
          const eased = easeInPower2(progress)
          target.alpha = 1 - eased
        }
        break
      }

      case "blur-in": {
        // Blur requires PIXI filter — skip for now, use fade as fallback
        const progress = clamp01(localTime / animDuration)
        target.alpha = easeOutPower2(progress)
        break
      }

      case "blur-out": {
        const startTime = effectDuration - animDuration
        if (localTime >= startTime) {
          const progress = clamp01((localTime - startTime) / animDuration)
          target.alpha = 1 - easeInPower2(progress)
        }
        break
      }
    }
  }

  removeAnimation(_target: PixiContainer): void {
    // No cleanup needed — animations are computed per-frame, no persistent state
  }

  destroy(): void {
    // No persistent state to clean up
  }
}
