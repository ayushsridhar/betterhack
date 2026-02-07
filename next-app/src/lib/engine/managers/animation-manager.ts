import type { Animation } from "../../types"

type PixiContainer = import("pixi.js").Container

/**
 * AnimationManager uses GSAP to apply entrance/exit animations to PIXI display objects.
 *
 * Supported animations (7 in, 7 out):
 *   - slide-in / slide-out
 *   - fade-in / fade-out
 *   - spin-in / spin-out
 *   - bounce-in / bounce-out
 *   - wipe-in / wipe-out
 *   - blur-in / blur-out
 *   - zoom-in / zoom-out
 */
export class AnimationManager {
  private _tweens = new Map<string, GSAPTween>()

  /**
   * Apply an animation to a PIXI display object.
   *
   * @param target - The PIXI container/sprite to animate
   * @param animation - The animation definition from the store
   * @param effectDuration - The total duration of the parent effect in ms
   * @param stageWidth - Width of the compositor stage (for slide offsets)
   * @param stageHeight - Height of the compositor stage
   */
  async applyAnimation(
    target: PixiContainer,
    animation: Animation,
    effectDuration: number,
    stageWidth: number = 1920,
    _stageHeight: number = 1080
  ): Promise<void> {
    // Remove any existing tween for this target
    this.removeAnimation(target)

    let gsapInstance: GSAP
    try {
      const gsapModule = await import("gsap")
      gsapInstance = gsapModule.gsap || gsapModule.default
    } catch {
      console.warn("[AnimationManager] GSAP not available. Skipping animation.")
      return
    }

    const key = this._getKey(target)
    const duration = animation.duration / 1000 // convert ms -> seconds

    let tween: GSAPTween | null = null

    switch (animation.name) {
      // ─── IN animations ───
      case "fade-in":
        tween = gsapInstance.from(target, {
          alpha: 0,
          duration,
          ease: "power2.out",
        })
        break

      case "fade-out":
        tween = gsapInstance.to(target, {
          alpha: 0,
          duration,
          delay: (effectDuration / 1000) - duration,
          ease: "power2.in",
        })
        break

      case "slide-in":
        tween = gsapInstance.from(target, {
          x: -stageWidth,
          duration,
          ease: "power2.out",
        })
        break

      case "slide-out":
        tween = gsapInstance.to(target, {
          x: stageWidth,
          duration,
          delay: (effectDuration / 1000) - duration,
          ease: "power2.in",
        })
        break

      case "spin-in":
        tween = gsapInstance.from(target, {
          rotation: Math.PI * 2,
          alpha: 0,
          duration,
          ease: "power2.out",
        })
        break

      case "spin-out":
        tween = gsapInstance.to(target, {
          rotation: Math.PI * 2,
          alpha: 0,
          duration,
          delay: (effectDuration / 1000) - duration,
          ease: "power2.in",
        })
        break

      case "bounce-in":
        tween = gsapInstance.from(target.scale, {
          x: 0,
          y: 0,
          duration,
          ease: "elastic.out(1, 0.5)",
        })
        break

      case "bounce-out":
        tween = gsapInstance.to(target.scale, {
          x: 0,
          y: 0,
          duration,
          delay: (effectDuration / 1000) - duration,
          ease: "elastic.in(1, 0.5)",
        })
        break

      case "wipe-in": {
        // Wipe uses a mask approach. For now, we approximate with alpha + scaleX.
        tween = gsapInstance.from(target, {
          alpha: 0,
          duration,
          ease: "power1.out",
        })
        break
      }

      case "wipe-out": {
        tween = gsapInstance.to(target, {
          alpha: 0,
          duration,
          delay: (effectDuration / 1000) - duration,
          ease: "power1.in",
        })
        break
      }

      case "blur-in": {
        // Animate a blur filter from strong to none
        const blurFilter = await this._getOrCreateBlurFilter(target)
        if (blurFilter) {
          blurFilter.strength = 20
          tween = gsapInstance.to(blurFilter, {
            strength: 0,
            duration,
            ease: "power2.out",
            onComplete: () => {
              // Remove blur filter after animation
              this._removeBlurFilter(target, blurFilter)
            },
          })
        }
        break
      }

      case "blur-out": {
        const blurFilter = await this._getOrCreateBlurFilter(target)
        if (blurFilter) {
          blurFilter.strength = 0
          tween = gsapInstance.to(blurFilter, {
            strength: 20,
            duration,
            delay: (effectDuration / 1000) - duration,
            ease: "power2.in",
          })
        }
        break
      }

      case "zoom-in":
        tween = gsapInstance.from(target.scale, {
          x: 0,
          y: 0,
          duration,
          ease: "power2.out",
        })
        break

      case "zoom-out":
        tween = gsapInstance.to(target.scale, {
          x: 0,
          y: 0,
          duration,
          delay: (effectDuration / 1000) - duration,
          ease: "power2.in",
        })
        break

      default: {
        const _name: never = animation
        console.warn(`[AnimationManager] Unknown animation: ${(_name as Animation).name}`)
        return
      }
    }

    if (tween) {
      this._tweens.set(key, tween)
    }
  }

  /**
   * Remove and kill any active animation tween on a target.
   */
  removeAnimation(target: PixiContainer): void {
    const key = this._getKey(target)
    const tween = this._tweens.get(key)
    if (tween) {
      tween.kill()
      this._tweens.delete(key)
    }
  }

  private _getKey(target: PixiContainer): string {
    // Use the PIXI uid property if available, otherwise object identity via a WeakMap-like approach
    return String((target as unknown as { uid?: number }).uid ?? target.label ?? Math.random())
  }

  private async _getOrCreateBlurFilter(
    target: PixiContainer
  ): Promise<import("pixi.js").BlurFilter | null> {
    try {
      const PIXI = await import("pixi.js")
      const blurFilter = new PIXI.BlurFilter({ strength: 0 })
      const existingFilters = (target.filters as import("pixi.js").Filter[]) || []
      target.filters = [...existingFilters, blurFilter]
      return blurFilter
    } catch {
      return null
    }
  }

  private _removeBlurFilter(
    target: PixiContainer,
    blurFilter: import("pixi.js").BlurFilter
  ): void {
    const filters = (target.filters as import("pixi.js").Filter[]) || []
    target.filters = filters.filter((f) => f !== blurFilter)
  }

  destroy(): void {
    for (const tween of this._tweens.values()) {
      tween.kill()
    }
    this._tweens.clear()
  }
}
