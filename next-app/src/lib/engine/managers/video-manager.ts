import type { VideoEffect, EffectRect } from "../../types"

interface VideoEntry {
  sprite: import("pixi.js").Sprite
  video: HTMLVideoElement
  objectUrl: string
}

export class VideoManager {
  private _entries = new Map<string, VideoEntry>()
  private _stage: import("pixi.js").Container | null = null

  setStage(stage: import("pixi.js").Container) {
    this._stage = stage
  }

  async addVideo(effect: VideoEffect, file: File): Promise<void> {
    if (this._entries.has(effect.id)) return

    const PIXI = await import("pixi.js")

    const video = document.createElement("video")
    video.preload = "auto"
    video.muted = true
    video.playsInline = true
    video.crossOrigin = "anonymous"

    const objectUrl = URL.createObjectURL(file)
    video.src = objectUrl

    // Wait for video to be loadable
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve()
      video.onerror = () => reject(new Error(`Failed to load video for effect ${effect.id}`))
    })

    const source = new PIXI.VideoSource({ resource: video, autoPlay: false, autoLoad: false })
    const texture = new PIXI.Texture({ source })
    const sprite = new PIXI.Sprite({ texture })

    this._applyRect(sprite, effect.rect)

    if (this._stage) {
      this._stage.addChild(sprite)
    }

    sprite.visible = false

    this._entries.set(effect.id, { sprite, video, objectUrl })
  }

  updateVideo(effectId: string, timecode: number, effect: VideoEffect): void {
    const entry = this._entries.get(effectId)
    if (!entry) return

    // Calculate the position within the source media
    // timecode is global; effect.start is the in-point in the source media
    const localTime = timecode - effect.start_at_position
    const sourceTime = effect.start + localTime
    const sourceTimeSec = sourceTime / 1000

    // Only seek if the difference is significant to avoid constant seeking
    if (Math.abs(entry.video.currentTime - sourceTimeSec) > 0.05) {
      entry.video.currentTime = sourceTimeSec
    }

    // Notify PIXI that the video texture source needs updating.
    // VideoSource automatically handles frame updates when connected to the ticker,
    // but when scrubbing we need to signal that the source has changed.
    const source = entry.sprite.texture.source
    if (source) {
      source.emit("update", source)
    }
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
      entry.video.play().catch(() => {
        // Autoplay may be blocked; silently handle
      })
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

  private _applyRect(sprite: import("pixi.js").Sprite, rect: EffectRect): void {
    sprite.position.set(rect.position_on_canvas.x, rect.position_on_canvas.y)
    sprite.scale.set(rect.scaleX, rect.scaleY)
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
