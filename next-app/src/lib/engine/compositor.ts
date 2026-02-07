import type {
  AnyEffect,
  VideoEffect,
  AudioEffect,
  ImageEffect,
  TextEffect,
  Filter,
  Animation,
  Transition,
} from "../types"
import type { EditorStore } from "../store"

import { VideoManager } from "./managers/video-manager"
import { ImageManager } from "./managers/image-manager"
import { TextManager } from "./managers/text-manager"
import { AudioManager } from "./managers/audio-manager"
import { FilterManager } from "./managers/filter-manager"
import { AnimationManager } from "./managers/animation-manager"
import { TransitionManager } from "./managers/transition-manager"
import { TransformHandles } from "./transform-handles"
import { getFile } from "../services/media-db"
import { fitToFrame } from "../utils/fit-to-frame"

type GetState = () => EditorStore
type SetState = (fn: (state: EditorStore) => void) => void

/**
 * Compositor is the main PIXI.js rendering engine for the video editor.
 * It is a plain TypeScript class (NOT a React component) that receives
 * Zustand getState/setState references and manages all visual rendering
 * via PIXI.Application and delegated managers.
 */
export class Compositor {
  private _canvas: HTMLCanvasElement
  private _getState: GetState
  private _setState: SetState

  private _app: import("pixi.js").Application | null = null
  private _rafId: number | null = null
  private _isPlaying = false
  private _lastFrameTime = 0
  private _isInitialized = false

  // Managers
  readonly videoManager = new VideoManager()
  readonly imageManager = new ImageManager()
  readonly textManager = new TextManager()
  readonly audioManager = new AudioManager()
  readonly filterManager = new FilterManager()
  readonly animationManager = new AnimationManager()
  readonly transitionManager = new TransitionManager()
  readonly transformHandles = new TransformHandles()

  // Track which effects are currently visible so we can show/hide efficiently
  private _visibleEffects = new Set<string>()

  // Track which effects have been loaded into managers (to avoid duplicate loads)
  private _loadedEffects = new Set<string>()
  private _loadingEffects = new Set<string>()

  constructor(
    canvas: HTMLCanvasElement,
    getState: GetState,
    setState: SetState
  ) {
    this._canvas = canvas
    this._getState = getState
    this._setState = setState
  }

  /**
   * Initialize the PIXI.Application and attach it to the provided canvas.
   */
  async init(width: number, height: number): Promise<void> {
    if (this._isInitialized) return

    // SSR guard
    if (typeof window === "undefined") return

    const PIXI = await import("pixi.js")

    this._app = new PIXI.Application()

    try {
      await this._app.init({
        canvas: this._canvas,
        width,
        height,
        backgroundColor: 0x000000,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        autoStart: false,
        preference: "webgl",
      })
    } catch (err) {
      console.warn("[Compositor] WebGL init failed, trying webgpu:", err)
      try {
        await this._app.init({
          canvas: this._canvas,
          width,
          height,
          backgroundColor: 0x000000,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
          autoStart: false,
        })
      } catch (err2) {
        console.error("[Compositor] All renderers failed:", err2)
        throw err2
      }
    }

    // Enable stage interactivity
    this._app.stage.eventMode = "static"
    this._app.stage.hitArea = this._app.screen

    // Deselect on background click
    this._app.stage.on("pointerdown", (e) => {
      if (e.target === this._app!.stage) {
        this._setState((s) => { s.selected_effect = null })
        this.transformHandles.hide()
        this._app!.render()
      }
    })

    // Give managers access to the stage
    this.videoManager.setStage(this._app.stage)
    this.imageManager.setStage(this._app.stage)
    this.textManager.setStage(this._app.stage)

    // Initialize transform handles
    await this.transformHandles.init(this._app.stage)
    this.transformHandles.setOnUpdate((id, rect) => {
      this._setState((s) => {
        const effect = s.effects.find((e) => e.id === id)
        if (effect && "rect" in effect) {
          const visual = effect as { rect: { position_on_canvas: { x: number; y: number }; width: number; height: number } }
          visual.rect.position_on_canvas.x = rect.x
          visual.rect.position_on_canvas.y = rect.y
          visual.rect.width = rect.width
          visual.rect.height = rect.height
        }
      })
      // Re-compose to update sprite position
      this.compose(this._getState().timecode)
    })

    this._isInitialized = true

    // Render one initial frame
    this._app.render()
  }

  get isInitialized(): boolean {
    return this._isInitialized
  }

  get app(): import("pixi.js").Application | null {
    return this._app
  }

  /**
   * Mark an effect as unloaded (e.g., when it's removed from the timeline).
   */
  untrackEffect(effectId: string): void {
    this._loadedEffects.delete(effectId)
    this._loadingEffects.delete(effectId)
  }

  /**
   * Resize the compositor canvas and renderer.
   */
  resize(width: number, height: number): void {
    if (!this._app) return
    this._app.renderer.resize(width, height)
    this._app.render()
  }

  /**
   * Start the RAF-based playback loop.
   */
  startPlayback(): void {
    if (this._isPlaying) return
    this._isPlaying = true
    this._lastFrameTime = performance.now()
    this._renderLoop()
  }

  /**
   * Stop the RAF-based playback loop and pause all media.
   */
  stopPlayback(): void {
    this._isPlaying = false
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId)
      this._rafId = null
    }
    this.videoManager.pauseAll()
    this.audioManager.pauseAll()
  }

  /**
   * Main render method: iterate all effects and render the visible ones
   * at the given timecode.
   */
  compose(timecode: number): void {
    if (!this._app || !this._isInitialized) return

    const state = this._getState()
    const { effects, filters, animations, transitions } = state

    const newVisible = new Set<string>()

    // Sort effects by track (lower track = rendered first = behind)
    const sortedEffects = [...effects].sort((a, b) => a.track - b.track)

    for (const effect of sortedEffects) {
      const effectStart = effect.start_at_position
      const effectDuration = effect.end - effect.start
      const effectEnd = effectStart + effectDuration

      const isVisible = timecode >= effectStart && timecode < effectEnd

      if (isVisible) {
        newVisible.add(effect.id)
        this._showEffect(effect)
        this._updateEffect(effect, timecode, filters, animations, transitions)
      } else {
        this._hideEffect(effect)
      }
    }

    // Hide any effects that were visible before but are no longer
    for (const prevId of this._visibleEffects) {
      if (!newVisible.has(prevId)) {
        // Already hidden above, but also pause video/audio
        this.videoManager.pauseVideo(prevId)
        this.audioManager.pause(prevId)
      }
    }

    this._visibleEffects = newVisible

    // Update transform handles if a visual effect is selected
    const selectedId = state.selected_effect?.id
    if (selectedId && this.transformHandles.targetId === selectedId) {
      const sel = effects.find((e) => e.id === selectedId)
      if (sel && "rect" in sel) {
        const r = (sel as { rect: { position_on_canvas: { x: number; y: number }; width: number; height: number } }).rect
        this.transformHandles.show(selectedId, r.position_on_canvas.x, r.position_on_canvas.y, r.width, r.height)
      }
    }

    // Render the frame
    this._app.render()
  }

  /**
   * Render a single frame at the given timecode (for seeking/scrubbing).
   */
  seekTo(timecode: number): void {
    // Pause everything first
    this.videoManager.pauseAll()
    this.audioManager.pauseAll()
    // Then compose the frame
    this.compose(timecode)
  }

  /**
   * Destroy the compositor, all managers, and the PIXI app.
   */
  destroy(): void {
    this.stopPlayback()

    this.videoManager.destroy()
    this.imageManager.destroy()
    this.textManager.destroy()
    this.audioManager.destroy()
    this.filterManager.destroy()
    this.animationManager.destroy()
    this.transitionManager.destroy()
    this.transformHandles.destroy()

    if (this._app) {
      this._app.destroy(false, { children: true })
      this._app = null
    }

    this._isInitialized = false
    this._visibleEffects.clear()
    this._loadedEffects.clear()
    this._loadingEffects.clear()
  }

  // ─── Private Methods ───

  /**
   * Ensure an effect's media is loaded into the appropriate manager.
   * Returns true if already loaded, false if loading was triggered (async).
   */
  private async _ensureEffectLoaded(effect: AnyEffect): Promise<boolean> {
    if (this._loadedEffects.has(effect.id)) return true
    if (this._loadingEffects.has(effect.id)) return false

    this._loadingEffects.add(effect.id)

    try {
      const { width: projW, height: projH } = this._getState().settings

      switch (effect.kind) {
        case "video": {
          const media = await getFile(effect.file_hash)
          if (media) {
            const dims = await this.videoManager.addVideo(effect, media.file)
            // Auto-fit to frame using actual video dimensions
            if (dims) {
              const rect = fitToFrame(dims.videoWidth, dims.videoHeight, projW, projH)
              this.videoManager.updateRect(effect.id, rect)
              // Write corrected rect back to store
              this._setState((s) => {
                const eff = s.effects.find((e) => e.id === effect.id)
                if (eff && "rect" in eff) {
                  (eff as VideoEffect).rect = rect
                }
              })
            }
          }
          break
        }
        case "image": {
          const media = await getFile(effect.file_hash)
          if (media) {
            const dims = await this.imageManager.addImage(effect, media.file)
            if (dims) {
              const rect = fitToFrame(dims.imgWidth, dims.imgHeight, projW, projH)
              this.imageManager.updateRect(effect.id, rect)
              this._setState((s) => {
                const eff = s.effects.find((e) => e.id === effect.id)
                if (eff && "rect" in eff) {
                  (eff as ImageEffect).rect = rect
                }
              })
            }
          }
          break
        }
        case "text": {
          await this.textManager.addText(effect)
          break
        }
        case "audio": {
          const media = await getFile(effect.file_hash)
          if (media) {
            await this.audioManager.addAudio(effect, media.file)
          }
          break
        }
      }
      this._loadedEffects.add(effect.id)
      this._loadingEffects.delete(effect.id)

      // Make the sprite interactive for selection
      this._makeEffectInteractive(effect)

      // Re-compose to show the newly loaded effect
      if (this._isInitialized && this._app) {
        this.compose(this._getState().timecode)
      }
      return true
    } catch (err) {
      console.error(`[Compositor] Failed to load effect ${effect.id}:`, err)
      this._loadingEffects.delete(effect.id)
      return false
    }
  }

  /**
   * Make a loaded effect's sprite clickable for selection.
   */
  private _makeEffectInteractive(effect: AnyEffect): void {
    let displayObject: import("pixi.js").Container | null = null

    switch (effect.kind) {
      case "video":
        displayObject = this.videoManager.getSprite(effect.id)
        break
      case "image":
        displayObject = this.imageManager.getSprite(effect.id)
        break
      case "text":
        displayObject = this.textManager.getDisplayObject(effect.id)
        break
    }

    if (!displayObject) return

    displayObject.eventMode = "static"
    displayObject.cursor = "pointer"

    displayObject.on("pointerdown", (e: import("pixi.js").FederatedPointerEvent) => {
      e.stopPropagation()

      // Select this effect
      const fullEffect = this._getState().effects.find((e) => e.id === effect.id)
      if (fullEffect) {
        this._setState((s) => { s.selected_effect = fullEffect })
      }

      // Show transform handles
      if (fullEffect && "rect" in fullEffect) {
        const rect = (fullEffect as { rect: { position_on_canvas: { x: number; y: number }; width: number; height: number } }).rect
        this.transformHandles.show(
          effect.id,
          rect.position_on_canvas.x,
          rect.position_on_canvas.y,
          rect.width,
          rect.height
        )
        this._app?.render()
      }
    })
  }

  /**
   * RAF-based playback loop. Advances the timecode and composes each frame.
   */
  private _renderLoop = (): void => {
    if (!this._isPlaying) return

    const now = performance.now()
    const delta = now - this._lastFrameTime
    this._lastFrameTime = now

    const state = this._getState()
    const newTimecode = state.timecode + delta

    // Update the store timecode
    this._setState((s) => {
      s.timecode = newTimecode
    })

    this.compose(newTimecode)

    this._rafId = requestAnimationFrame(this._renderLoop)
  }

  /**
   * Show an effect's visual representation.
   * If the effect hasn't been loaded into the manager yet, trigger loading.
   */
  private _showEffect(effect: AnyEffect): void {
    if (!this._loadedEffects.has(effect.id)) {
      this._ensureEffectLoaded(effect)
      return
    }

    switch (effect.kind) {
      case "video":
        this.videoManager.showVideo(effect.id)
        break
      case "image":
        this.imageManager.showImage(effect.id)
        break
      case "text":
        this.textManager.showText(effect.id)
        break
      case "audio":
        // Audio has no visual; nothing to show
        break
    }
  }

  /**
   * Hide an effect's visual representation.
   */
  private _hideEffect(effect: AnyEffect): void {
    switch (effect.kind) {
      case "video":
        this.videoManager.hideVideo(effect.id)
        break
      case "image":
        this.imageManager.hideImage(effect.id)
        break
      case "text":
        this.textManager.hideText(effect.id)
        break
      case "audio":
        // Audio has no visual; nothing to hide
        break
    }
  }

  /**
   * Update an effect at the current timecode (seek video, play audio, etc.)
   */
  private _updateEffect(
    effect: AnyEffect,
    timecode: number,
    filters: Filter[],
    animations: Animation[],
    transitions: Transition[]
  ): void {
    const localTime = timecode - effect.start_at_position

    switch (effect.kind) {
      case "video": {
        const videoEffect = effect as VideoEffect
        this.videoManager.updateVideo(effect.id, timecode, videoEffect)
        this.videoManager.updateRect(effect.id, videoEffect.rect)

        // Apply filters
        const effectFilters = filters.filter(
          (f) => f.targetEffectId === effect.id
        )
        const sprite = this.videoManager.getSprite(effect.id)
        if (sprite && effectFilters.length > 0) {
          this.filterManager.applyFilters(sprite, effectFilters)
        }

        // Apply animations
        this._applyAnimationsForEffect(effect, sprite, animations, localTime)

        // If playing, ensure video is playing
        if (this._isPlaying) {
          this.videoManager.playVideo(effect.id)
        }
        break
      }

      case "image": {
        const imageEffect = effect as ImageEffect
        this.imageManager.updateRect(effect.id, imageEffect.rect)

        const sprite = this.imageManager.getSprite(effect.id)

        // Apply filters
        const effectFilters = filters.filter(
          (f) => f.targetEffectId === effect.id
        )
        if (sprite && effectFilters.length > 0) {
          this.filterManager.applyFilters(sprite, effectFilters)
        }

        // Apply animations
        this._applyAnimationsForEffect(effect, sprite, animations, localTime)
        break
      }

      case "text": {
        const textEffect = effect as TextEffect
        this.textManager.updateText(effect.id, textEffect)

        const displayObject = this.textManager.getDisplayObject(effect.id)

        // Apply filters
        const effectFilters = filters.filter(
          (f) => f.targetEffectId === effect.id
        )
        if (displayObject && effectFilters.length > 0) {
          this.filterManager.applyFilters(displayObject, effectFilters)
        }

        // Apply animations
        this._applyAnimationsForEffect(
          effect,
          displayObject,
          animations,
          localTime
        )
        break
      }

      case "audio": {
        const audioEffect = effect as AudioEffect
        if (this._isPlaying) {
          // Calculate source time position
          const sourceTime = audioEffect.start + localTime
          this.audioManager.play(effect.id, sourceTime)
        }
        break
      }
    }

    // Apply transitions
    const relatedTransitions = transitions.filter(
      (t) => t.incoming.id === effect.id || t.outgoing.id === effect.id
    )
    for (const transition of relatedTransitions) {
      const transitionStart =
        transition.outgoing.start_at_position +
        (transition.outgoing.end - transition.outgoing.start) -
        transition.duration
      const progress = Math.max(
        0,
        Math.min(1, (timecode - transitionStart) / transition.duration)
      )
      if (progress > 0 && progress < 1) {
        this.transitionManager.applyTransition(transition, progress)
      }
    }
  }

  /**
   * Apply animations for a specific effect to its PIXI display object.
   */
  private _applyAnimationsForEffect(
    effect: AnyEffect,
    target: import("pixi.js").Container | null,
    animations: Animation[],
    _localTime: number
  ): void {
    if (!target) return

    const effectAnimations = animations.filter(
      (a) => a.targetEffect.id === effect.id
    )

    if (effectAnimations.length === 0) return

    const effectDuration = effect.end - effect.start

    for (const animation of effectAnimations) {
      const settings = this._getState().settings
      this.animationManager.applyAnimation(
        target,
        animation,
        effectDuration,
        settings.width,
        settings.height
      )
    }
  }
}
