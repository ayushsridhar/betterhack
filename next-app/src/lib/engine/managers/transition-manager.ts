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

/**
 * TransitionManager handles GL-based transitions between two effects.
 *
 * This is currently a stub that defines the interface and shader templates.
 * Full implementation will create custom PIXI.Filter instances using the
 * transition's GLSL code and render the transition between two render textures.
 */
export class TransitionManager {
  private _entries = new Map<string, TransitionEntry>()

  /**
   * Apply a transition between two effects at the given progress.
   *
   * @param transition - The transition definition containing GLSL code and parameters
   * @param progress - A value from 0 to 1 representing the transition progress
   */
  applyTransition(transition: Transition, progress: number): void {
    console.log(
      `[TransitionManager] applyTransition "${transition.transition.name}" at progress ${progress.toFixed(3)} (stub)`
    )

    if (!this._entries.has(transition.id)) {
      this._entries.set(transition.id, { transition })
    }

    // TODO: Create a custom PIXI.Filter using the transition GLSL,
    // render the outgoing effect to a render texture,
    // render the incoming effect to a render texture,
    // then apply the transition filter with the progress uniform.
  }

  /**
   * Remove a transition and clean up its resources.
   */
  removeTransition(transitionId: string): void {
    const entry = this._entries.get(transitionId)
    if (!entry) return

    // TODO: Destroy the custom PIXI.Filter and render textures

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
  }
}
