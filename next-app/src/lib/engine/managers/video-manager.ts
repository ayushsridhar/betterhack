import type { VideoEffect, EffectRect } from "../../types"

interface VideoEntry {
  sprite: import("pixi.js").Sprite
  video: HTMLVideoElement
  objectUrl: string
  offscreenCanvas: HTMLCanvasElement
  offscreenCtx: CanvasRenderingContext2D
  source: import("pixi.js").CanvasSource
}

export class VideoManager {
  private _entries = new Map<string, VideoEntry>()
  private _stage: import("pixi.js").Container | null = null

  setStage(stage: import("pixi.js").Container) {
    this._stage = stage
  }

  /**
   * Load a video, render its first frame onto an offscreen canvas,
   * and create a PIXI sprite from that canvas texture.
   * Returns the native video dimensions.
   */
  async addVideo(
    effect: VideoEffect,
    file: File
  ): Promise<{ videoWidth: number; videoHeight: number } | null> {
    if (this._entries.has(effect.id)) return null

    const PIXI = await import("pixi.js")

    const video = document.createElement("video")
    video.preload = "auto"
    video.muted = true
    video.playsInline = true

    const objectUrl = URL.createObjectURL(file)
    video.src = objectUrl

    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve()
      video.onerror = () =>
        reject(new Error(`Failed to load video for effect ${effect.id}`))
    })

    const videoWidth = video.videoWidth || 1920
    const videoHeight = video.videoHeight || 1080

    // Seek to first frame
    video.currentTime = 0.01
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve()
      setTimeout(resolve, 500)
    })

    // Create offscreen canvas at native video resolution
    const offscreenCanvas = document.createElement("canvas")
    offscreenCanvas.width = videoWidth
    offscreenCanvas.height = videoHeight
    const offscreenCtx = offscreenCanvas.getContext("2d")!

    // Draw initial frame
    offscreenCtx.drawImage(video, 0, 0, videoWidth, videoHeight)

    // Use CanvasSource — fully reliable, no VideoSource quirks
    const source = new PIXI.CanvasSource({ resource: offscreenCanvas })
    const texture = new PIXI.Texture({ source })
    const sprite = new PIXI.Sprite(texture)

    // Don't use effect.rect — it may be stale/wrong.
    // Just set native size; compositor will apply fitToFrame after.
    sprite.width = videoWidth
    sprite.height = videoHeight

    if (this._stage) {
      this._stage.addChild(sprite)
    }

    sprite.visible = false

    this._entries.set(effect.id, {
      sprite,
      video,
      objectUrl,
      offscreenCanvas,
      offscreenCtx,
      source,
    })

    return { videoWidth, videoHeight }
  }

  updateVideo(effectId: string, timecode: number, effect: VideoEffect): void {
    const entry = this._entries.get(effectId)
    if (!entry) return

    const localTime = timecode - effect.start_at_position
    const sourceTime = effect.start + localTime
    const sourceTimeSec = sourceTime / 1000

    if (Math.abs(entry.video.currentTime - sourceTimeSec) > 0.04) {
      entry.video.currentTime = sourceTimeSec
    }

    // Redraw current video frame onto the offscreen canvas and tell PIXI
    entry.offscreenCtx.drawImage(
      entry.video,
      0,
      0,
      entry.offscreenCanvas.width,
      entry.offscreenCanvas.height
    )
    entry.source.update()
  }

  showVideo(effectId: string): void {
    const entry = this._entries.get(effectId)
    if (entry) entry.sprite.visible = true
  }

  hideVideo(effectId: string): void {
    const entry = this._entries.get(effectId)
    if (entry) entry.sprite.visible = false
  }

  playVideo(effectId: string): void {
    const entry = this._entries.get(effectId)
    if (entry && entry.video.paused) {
      entry.video.play().catch(() => {})
    }
  }

  pauseVideo(effectId: string): void {
    const entry = this._entries.get(effectId)
    if (entry && !entry.video.paused) {
      entry.video.pause()
    }
  }

  pauseAll(): void {
    for (const entry of this._entries.values()) {
      if (!entry.video.paused) {
        entry.video.pause()
      }
    }
  }

  removeVideo(effectId: string): void {
    const entry = this._entries.get(effectId)
    if (!entry) return

    entry.video.pause()
    entry.video.src = ""
    URL.revokeObjectURL(entry.objectUrl)

    if (entry.sprite.parent) {
      entry.sprite.parent.removeChild(entry.sprite)
    }
    entry.sprite.destroy({ texture: true, textureSource: true })

    this._entries.delete(effectId)
  }

  getSprite(effectId: string): import("pixi.js").Sprite | null {
    return this._entries.get(effectId)?.sprite ?? null
  }

  updateRect(effectId: string, rect: EffectRect): void {
    const entry = this._entries.get(effectId)
    if (entry) this._applyRect(entry.sprite, rect)
  }

  private _applyRect(
    sprite: import("pixi.js").Sprite,
    rect: EffectRect
  ): void {
    sprite.position.set(rect.position_on_canvas.x, rect.position_on_canvas.y)
    sprite.rotation = rect.rotation
    sprite.pivot.set(rect.pivot.x, rect.pivot.y)
    sprite.width = rect.width * rect.scaleX
    sprite.height = rect.height * rect.scaleY
  }

  destroy(): void {
    for (const effectId of Array.from(this._entries.keys())) {
      this.removeVideo(effectId)
    }
    this._stage = null
  }
}
