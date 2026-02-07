import type { ImageEffect, EffectRect } from "../../types"

interface ImageEntry {
  sprite: import("pixi.js").Sprite
  objectUrl: string
}

export class ImageManager {
  private _entries = new Map<string, ImageEntry>()
  private _stage: import("pixi.js").Container | null = null

  setStage(stage: import("pixi.js").Container) {
    this._stage = stage
  }

  async addImage(effect: ImageEffect, file: File): Promise<{ imgWidth: number; imgHeight: number } | null> {
    if (this._entries.has(effect.id)) return null

    const PIXI = await import("pixi.js")

    const objectUrl = URL.createObjectURL(file)

    // Load image into an HTMLImageElement first, then create texture from it
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = objectUrl

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to load image for effect ${effect.id}`))
    })

    const source = new PIXI.ImageSource({ resource: img })
    const texture = new PIXI.Texture({ source })
    const sprite = new PIXI.Sprite(texture)

    // Native size — compositor will apply fitToFrame after load
    sprite.width = img.naturalWidth
    sprite.height = img.naturalHeight

    if (this._stage) {
      this._stage.addChild(sprite)
    }

    sprite.visible = false

    this._entries.set(effect.id, { sprite, objectUrl })

    return { imgWidth: img.naturalWidth, imgHeight: img.naturalHeight }
  }

  showImage(effectId: string): void {
    const entry = this._entries.get(effectId)
    if (entry) entry.sprite.visible = true
  }

  hideImage(effectId: string): void {
    const entry = this._entries.get(effectId)
    if (entry) entry.sprite.visible = false
  }

  removeImage(effectId: string): void {
    const entry = this._entries.get(effectId)
    if (!entry) return

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
    sprite.rotation = rect.rotation
    sprite.pivot.set(rect.pivot.x, rect.pivot.y)
    sprite.width = rect.width * rect.scaleX
    sprite.height = rect.height * rect.scaleY
  }

  destroy(): void {
    for (const effectId of Array.from(this._entries.keys())) {
      this.removeImage(effectId)
    }
    this._stage = null
  }
}
