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

  async addImage(effect: ImageEffect, file: File): Promise<void> {
    if (this._entries.has(effect.id)) return

    const PIXI = await import("pixi.js")

    const objectUrl = URL.createObjectURL(file)

    // Load the texture using PIXI.Assets
    const texture = await PIXI.Assets.load<import("pixi.js").Texture>(objectUrl)
    const sprite = new PIXI.Sprite({ texture })

    this._applyRect(sprite, effect.rect)

    if (this._stage) {
      this._stage.addChild(sprite)
    }

    sprite.visible = false

    this._entries.set(effect.id, { sprite, objectUrl })
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
    sprite.scale.set(rect.scaleX, rect.scaleY)
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
