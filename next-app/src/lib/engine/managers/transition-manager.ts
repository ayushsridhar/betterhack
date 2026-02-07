import type { Container } from "pixi.js"
import type { Transition } from "../../types"

/**
 * Default vertex shader for GL transitions.
 * A simple passthrough vertex shader that outputs position and texture coordinates.
 */
export const TRANSITION_VERTEX_SHADER = /* glsl */ `
  attribute vec2 aVertexPosition;
  attribute vec2 aTextureCoord;

  uniform mat3 projectionMatrix;

  varying vec2 vTextureCoord;

  void main(void) {
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
  }
`

/**
 * Fragment shader template for GL transitions.
 * The `%TRANSITION_GLSL%` placeholder will be replaced with the actual transition GLSL code.
 * The transition function signature follows the gl-transitions specification:
 *   vec4 transition(vec2 uv)
 */
export const TRANSITION_FRAGMENT_TEMPLATE = /* glsl */ `
  precision mediump float;

  varying vec2 vTextureCoord;

  uniform sampler2D uSamplerFrom;
  uniform sampler2D uSamplerTo;
  uniform float uProgress;

  vec4 getFromColor(vec2 uv) {
    return texture2D(uSamplerFrom, uv);
  }

  vec4 getToColor(vec2 uv) {
    return texture2D(uSamplerTo, uv);
  }

  // --- Begin transition GLSL ---
  %TRANSITION_GLSL%
  // --- End transition GLSL ---

  void main(void) {
    gl_FragColor = transition(vTextureCoord);
  }
`

interface TransitionEntry {
  transition: Transition
  // Future: will hold a custom PIXI.Filter with the GL transition shader
}

type SpriteGetter = (effectId: string) => Container | null

/**
 * TransitionManager handles transitions between two effects.
 *
 * Currently implements a basic alpha crossfade for all transition types.
 * The shader templates above are preserved for future GL-based transitions.
 */
export class TransitionManager {
  private _entries = new Map<string, TransitionEntry>()
  private _spriteGetter: SpriteGetter | null = null

  /**
   * Provide a function the manager can use to look up sprites by effect ID.
   * This should be called by the compositor after managers are initialized.
   */
  setSpriteGetter(fn: SpriteGetter): void {
    this._spriteGetter = fn
  }

  /**
   * Apply a transition between two effects at the given progress.
   * Uses a simple alpha crossfade: outgoing fades from 1->0, incoming fades from 0->1.
   *
   * @param transition - The transition definition containing GLSL code and parameters
   * @param progress - A value from 0 to 1 representing the transition progress
   */
  applyTransition(transition: Transition, progress: number): void {
    if (!this._entries.has(transition.id)) {
      this._entries.set(transition.id, { transition })
    }

    if (!this._spriteGetter) return

    const outgoingSprite = this._spriteGetter(transition.outgoing.id)
    const incomingSprite = this._spriteGetter(transition.incoming.id)

    // Apply crossfade (works as default for all transition types including "fade")
    if (outgoingSprite) {
      outgoingSprite.alpha = 1 - progress
    }
    if (incomingSprite) {
      incomingSprite.alpha = progress
    }
  }

  /**
   * Remove a transition and reset both sprites' alpha to 1.
   */
  removeTransition(transitionId: string): void {
    const entry = this._entries.get(transitionId)
    if (!entry) return

    if (this._spriteGetter) {
      const outgoingSprite = this._spriteGetter(entry.transition.outgoing.id)
      const incomingSprite = this._spriteGetter(entry.transition.incoming.id)
      if (outgoingSprite) outgoingSprite.alpha = 1
      if (incomingSprite) incomingSprite.alpha = 1
    }

    this._entries.delete(transitionId)
  }

  /**
   * Build a fragment shader from the template and a transition's GLSL code.
   */
  buildFragmentShader(transitionGlsl: string): string {
    return TRANSITION_FRAGMENT_TEMPLATE.replace(
      "%TRANSITION_GLSL%",
      transitionGlsl
    )
  }

  destroy(): void {
    for (const transitionId of Array.from(this._entries.keys())) {
      this.removeTransition(transitionId)
    }
    this._spriteGetter = null
  }
}
