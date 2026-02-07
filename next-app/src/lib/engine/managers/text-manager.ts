import type { TextEffect, EffectRect } from "../../types"

interface TextEntry {
  text: import("pixi.js").Text
}

export class TextManager {
  private _entries = new Map<string, TextEntry>()
  private _stage: import("pixi.js").Container | null = null

  setStage(stage: import("pixi.js").Container) {
    this._stage = stage
  }

  async addText(effect: TextEffect): Promise<void> {
    if (this._entries.has(effect.id)) return

    const PIXI = await import("pixi.js")

    const style = this._buildStyle(effect)
    const text = new PIXI.Text({
      text: effect.text,
      style,
    })

    this._applyRect(text, effect.rect)

    if (this._stage) {
      this._stage.addChild(text)
    }

    text.visible = false

    this._entries.set(effect.id, { text })
  }

  updateText(effectId: string, effect: TextEffect): void {
    const entry = this._entries.get(effectId)
    if (!entry) return

    entry.text.text = effect.text

    const style = this._buildStyle(effect)
    Object.assign(entry.text.style, style)

    this._applyRect(entry.text, effect.rect)
  }

  showText(effectId: string): void {
    const entry = this._entries.get(effectId)
    if (entry) entry.text.visible = true
  }

  hideText(effectId: string): void {
    const entry = this._entries.get(effectId)
    if (entry) entry.text.visible = false
  }

  removeText(effectId: string): void {
    const entry = this._entries.get(effectId)
    if (!entry) return

    if (entry.text.parent) {
      entry.text.parent.removeChild(entry.text)
    }
    entry.text.destroy()

    this._entries.delete(effectId)
  }

  getDisplayObject(effectId: string): import("pixi.js").Text | null {
    return this._entries.get(effectId)?.text ?? null
  }

  /**
   * Build a PIXI v8 TextStyle options object from a TextEffect.
   *
   * PIXI v8 changed the TextStyle API:
   * - `stroke` is now an object `{ color, width }` instead of separate stroke/strokeThickness
   * - `dropShadow` is now an object `{ alpha, angle, blur, color, distance }` or boolean
   * - `fill` accepts a single FillInput (color string/number), not an array
   */
  private _buildStyle(effect: TextEffect): import("pixi.js").TextStyleOptions {
    // PIXI v8 fill only takes a single value, not an array.
    // Use the first fill color, or fallback to white.
    const fillValue = effect.fill.length > 0 ? effect.fill[0] : "#FFFFFF"
    // Ensure fill is a string (PIXI v8 FillInput)
    const fill = typeof fillValue === "number"
      ? `#${fillValue.toString(16).padStart(6, "0")}`
      : String(fillValue)

    const style: import("pixi.js").TextStyleOptions = {
      fontFamily: effect.fontFamily || "Arial",
      fontSize: effect.fontSize,
      fontStyle: effect.fontStyle,
      fontVariant: effect.fontVariant,
      fontWeight: effect.fontWeight,
      fill,
      align: effect.align,
      letterSpacing: effect.letterSpacing,
      lineHeight: effect.lineHeight,
      leading: effect.leading,
      wordWrap: effect.wordWrap,
      wordWrapWidth: effect.wordWrapWidth,
      breakWords: effect.breakWords,
      whiteSpace: effect.whiteSpace,
      textBaseline: effect.textBaseline,
    }

    // Stroke: PIXI v8 uses { color, width } object
    if (effect.stroke && effect.strokeThickness > 0) {
      style.stroke = {
        color: effect.stroke,
        width: effect.strokeThickness,
        join: effect.lineJoin as import("pixi.js").TextStyleLineJoin,
        miterLimit: effect.miterLimit,
      }
    }

    // Drop shadow: PIXI v8 uses an object or boolean
    if (effect.dropShadow) {
      style.dropShadow = {
        alpha: effect.dropShadowAlpha,
        angle: effect.dropShadowAngle,
        blur: effect.dropShadowBlur,
        color: effect.dropShadowColor as string,
        distance: effect.dropShadowDistance,
      }
    }

    return style
  }

  private _applyRect(
    displayObject: import("pixi.js").Text,
    rect: EffectRect
  ): void {
    displayObject.position.set(
      rect.position_on_canvas.x,
      rect.position_on_canvas.y
    )
    displayObject.scale.set(rect.scaleX, rect.scaleY)
    displayObject.rotation = rect.rotation
    displayObject.pivot.set(rect.pivot.x, rect.pivot.y)
  }

  destroy(): void {
    for (const effectId of Array.from(this._entries.keys())) {
      this.removeText(effectId)
    }
    this._stage = null
  }
}
