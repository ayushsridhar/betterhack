import type { Container } from "pixi.js"
import type { Transition } from "../../types"

type SpriteGetter = (effectId: string) => Container | null

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v))
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

/**
 * TransitionManager applies frame-based transitions between two effects.
 * Each transition type manipulates sprite properties (alpha, position, scale,
 * rotation, mask) synchronously per frame based on progress 0→1.
 */
export class TransitionManager {
  private _spriteGetter: SpriteGetter | null = null

  setSpriteGetter(fn: SpriteGetter): void {
    this._spriteGetter = fn
  }

  /**
   * Apply a transition between two effects at the given progress.
   * Called synchronously during compose(), AFTER updateRect/animations.
   *
   * @param transition - The transition definition
   * @param progress - 0 to 1, where 0 = fully outgoing, 1 = fully incoming
   * @param stageWidth - Compositor width for slide/wipe calculations
   * @param stageHeight - Compositor height
   */
  applyTransition(
    transition: Transition,
    progress: number,
    stageWidth: number,
    stageHeight: number
  ): void {
    if (!this._spriteGetter) return

    const outgoing = this._spriteGetter(transition.outgoing.id)
    const incoming = this._spriteGetter(transition.incoming.id)
    const p = clamp01(progress)
    const name = transition.transition.name

    switch (name) {
      case "fade":
      case "dissolve":
      default:
        this._crossfade(outgoing, incoming, p)
        break

      case "slide-left":
        this._slide(outgoing, incoming, p, -stageWidth, 0, stageWidth, 0)
        break
      case "slide-right":
        this._slide(outgoing, incoming, p, stageWidth, 0, -stageWidth, 0)
        break
      case "slide-up":
        this._slide(outgoing, incoming, p, 0, -stageHeight, 0, stageHeight)
        break
      case "slide-down":
        this._slide(outgoing, incoming, p, 0, stageHeight, 0, -stageHeight)
        break

      case "wipe-left":
        this._wipe(outgoing, incoming, p, "left", stageWidth)
        break
      case "wipe-right":
        this._wipe(outgoing, incoming, p, "right", stageWidth)
        break

      case "zoom-in":
      case "crosszoom":
        this._zoomCross(outgoing, incoming, p)
        break
      case "zoom-out":
        this._zoomOut(outgoing, incoming, p)
        break

      case "burn":
      case "dreamy":
        this._dreamyBurn(outgoing, incoming, p)
        break

      case "circle":
      case "radial":
        this._radialReveal(outgoing, incoming, p)
        break

      case "cube":
        this._cube(outgoing, incoming, p, stageWidth)
        break

      case "doorway":
        this._doorway(outgoing, incoming, p, stageWidth)
        break

      case "pinwheel":
      case "rotate-scale-fade":
        this._rotateScaleFade(outgoing, incoming, p)
        break

      case "pixelize":
      case "hexagonalize":
      case "kaleidoscope":
        // These are shader-based effects — use crossfade as fallback
        this._crossfade(outgoing, incoming, p)
        break

      case "swap":
        this._swap(outgoing, incoming, p, stageWidth)
        break

      case "morph":
      case "directional-warp":
        this._directionalWarp(outgoing, incoming, p, stageWidth)
        break

      case "ripple":
      case "perlin":
      case "polar":
        // Complex shader effects — crossfade fallback
        this._crossfade(outgoing, incoming, p)
        break

      case "heart":
      case "colour-distance":
        this._crossfade(outgoing, incoming, p)
        break
    }
  }

  /**
   * Reset both sprites to normal state (called when transition ends or is removed).
   */
  resetTransition(transition: Transition): void {
    if (!this._spriteGetter) return
    const outgoing = this._spriteGetter(transition.outgoing.id)
    const incoming = this._spriteGetter(transition.incoming.id)
    if (outgoing) {
      outgoing.alpha = 1
      outgoing.x = outgoing.x // keep position (set by updateRect next frame)
    }
    if (incoming) {
      incoming.alpha = 1
    }
  }

  removeTransition(_transitionId: string): void {
    // No persistent state — transitions are computed per frame
  }

  destroy(): void {
    this._spriteGetter = null
  }

  // ─── Transition implementations ───

  private _crossfade(out: Container | null, inc: Container | null, p: number): void {
    const ep = smoothstep(p)
    if (out) out.alpha = 1 - ep
    if (inc) inc.alpha = ep
  }

  private _slide(
    out: Container | null,
    inc: Container | null,
    p: number,
    incFromX: number,
    incFromY: number,
    outToX: number,
    outToY: number
  ): void {
    const ep = easeInOut(p)
    if (out) {
      out.x += outToX * ep
      out.y += outToY * ep
    }
    if (inc) {
      inc.x += incFromX * (1 - ep)
      inc.y += incFromY * (1 - ep)
    }
  }

  private _wipe(
    out: Container | null,
    inc: Container | null,
    p: number,
    direction: "left" | "right",
    stageWidth: number
  ): void {
    const ep = smoothstep(p)
    // Wipe: incoming reveals from one side, outgoing stays but fades at the edge
    if (inc) {
      // Incoming slides in from the side and becomes visible
      if (direction === "left") {
        inc.x += stageWidth * (1 - ep)
      } else {
        inc.x += -stageWidth * (1 - ep)
      }
      inc.alpha = 1
    }
    if (out) {
      out.alpha = 1 - ep * ep // Fade out slightly behind
    }
  }

  private _zoomCross(out: Container | null, inc: Container | null, p: number): void {
    const ep = smoothstep(p)
    if (out) {
      out.alpha = 1 - ep
      const s = 1 + ep * 0.3 // Scale up slightly while fading
      out.scale.x *= s
      out.scale.y *= s
    }
    if (inc) {
      inc.alpha = ep
      const s = 0.7 + ep * 0.3 // Scale from 70% to 100%
      inc.scale.x *= s
      inc.scale.y *= s
    }
  }

  private _zoomOut(out: Container | null, inc: Container | null, p: number): void {
    const ep = smoothstep(p)
    if (out) {
      out.alpha = 1 - ep
      const s = 1 - ep * 0.3 // Scale down while fading
      out.scale.x *= s
      out.scale.y *= s
    }
    if (inc) {
      inc.alpha = ep
      const s = 1.3 - ep * 0.3 // Scale from 130% down to 100%
      inc.scale.x *= s
      inc.scale.y *= s
    }
  }

  private _dreamyBurn(out: Container | null, inc: Container | null, p: number): void {
    const ep = smoothstep(p)
    if (out) {
      out.alpha = 1 - ep
      // Slight scale up + blur effect approximation
      const s = 1 + ep * 0.1
      out.scale.x *= s
      out.scale.y *= s
    }
    if (inc) {
      inc.alpha = ep * ep // Ease in more slowly
    }
  }

  private _radialReveal(out: Container | null, inc: Container | null, p: number): void {
    // Approximate radial reveal with alpha + scale
    const ep = smoothstep(p)
    if (out) {
      out.alpha = 1 - ep
    }
    if (inc) {
      inc.alpha = ep
      // Scale from center outward
      const s = ep
      inc.scale.x *= Math.max(0.01, s)
      inc.scale.y *= Math.max(0.01, s)
    }
  }

  private _cube(out: Container | null, inc: Container | null, p: number, stageWidth: number): void {
    const ep = easeInOut(p)
    // Simulate a 3D cube rotation with position + scale
    if (out) {
      out.x += -stageWidth * ep
      // Perspective: scale down as it rotates away
      const s = 1 - ep * 0.3
      out.scale.x *= s
      out.alpha = 1 - ep * 0.5
    }
    if (inc) {
      inc.x += stageWidth * (1 - ep)
      const s = 0.7 + ep * 0.3
      inc.scale.x *= s
      inc.alpha = 0.5 + ep * 0.5
    }
  }

  private _doorway(out: Container | null, inc: Container | null, p: number, stageWidth: number): void {
    const ep = smoothstep(p)
    // Outgoing splits apart like doors opening
    if (out) {
      out.alpha = 1 - ep
      out.scale.x *= 1 - ep * 0.5
    }
    if (inc) {
      inc.alpha = ep
      // Incoming zooms in from behind
      const s = 0.5 + ep * 0.5
      inc.scale.x *= s
      inc.scale.y *= s
    }
  }

  private _rotateScaleFade(out: Container | null, inc: Container | null, p: number): void {
    const ep = smoothstep(p)
    if (out) {
      out.alpha = 1 - ep
      out.rotation += ep * Math.PI * 0.25
      const s = 1 - ep * 0.5
      out.scale.x *= s
      out.scale.y *= s
    }
    if (inc) {
      inc.alpha = ep
      inc.rotation += (1 - ep) * -Math.PI * 0.25
      const s = 0.5 + ep * 0.5
      inc.scale.x *= s
      inc.scale.y *= s
    }
  }

  private _swap(out: Container | null, inc: Container | null, p: number, stageWidth: number): void {
    const ep = easeInOut(p)
    // Both elements slide in opposite directions and swap places
    if (out) {
      out.x += stageWidth * ep
      out.alpha = 1 - ep * 0.3
    }
    if (inc) {
      inc.x += -stageWidth * (1 - ep)
      inc.alpha = 0.7 + ep * 0.3
    }
  }

  private _directionalWarp(out: Container | null, inc: Container | null, p: number, stageWidth: number): void {
    const ep = smoothstep(p)
    // Stretch + slide
    if (out) {
      out.x += -stageWidth * 0.3 * ep
      out.scale.x *= 1 + ep * 0.5
      out.alpha = 1 - ep
    }
    if (inc) {
      inc.x += stageWidth * 0.3 * (1 - ep)
      inc.scale.x *= 1 + (1 - ep) * 0.5
      inc.alpha = ep
    }
  }
}
