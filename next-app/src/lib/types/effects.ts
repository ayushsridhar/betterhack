export type V2 = [number, number]

export interface EffectRect {
  width: number
  height: number
  scaleX: number
  scaleY: number
  position_on_canvas: {
    x: number
    y: number
  }
  rotation: number
  pivot: {
    x: number
    y: number
  }
}

export interface Effect {
  id: string
  start_at_position: number
  duration: number
  start: number
  end: number
  track: number
}

export interface VideoEffect extends Effect {
  kind: "video"
  thumbnail: string
  raw_duration: number
  frames: number
  rect: EffectRect
  file_hash: string
  name: string
}

export interface AudioEffect extends Effect {
  kind: "audio"
  raw_duration: number
  file_hash: string
  name: string
}

export interface ImageEffect extends Effect {
  kind: "image"
  rect: EffectRect
  file_hash: string
  name: string
}

export type TextStyleFontStyle = "normal" | "italic" | "oblique"
export type TextStyleAlign = "left" | "center" | "right" | "justify"
export type TextStyleFontVariant = "normal" | "small-caps"
export type TextStyleFontWeight =
  | "normal"
  | "bold"
  | "bolder"
  | "lighter"
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900"
export type TextStyleTextBaseline =
  | "alphabetic"
  | "top"
  | "hanging"
  | "middle"
  | "ideographic"
  | "bottom"
export type TextStyleWhiteSpace = "normal" | "pre" | "pre-line"
export type LineJoin = "miter" | "round" | "bevel"
export type FillInput = string | number
export type ColorSource = string | number
export type Font = string

export interface TextEffect extends Effect {
  kind: "text"
  fontFamily: Font
  text: string
  fontSize: number
  fontStyle: TextStyleFontStyle
  align: TextStyleAlign
  fontVariant: TextStyleFontVariant
  fontWeight: TextStyleFontWeight
  fill: FillInput[]
  fillGradientType: number
  fillGradientStops: number[]
  rect: EffectRect
  stroke: string
  strokeThickness: number
  lineJoin: LineJoin
  miterLimit: number
  letterSpacing: number
  dropShadow: boolean
  dropShadowAlpha: number
  dropShadowAngle: number
  dropShadowBlur: number
  dropShadowDistance: number
  dropShadowColor: ColorSource
  wordWrap: boolean
  wordWrapWidth: number
  lineHeight: number
  leading: number
  breakWords: boolean
  whiteSpace: TextStyleWhiteSpace
  textBaseline: TextStyleTextBaseline
}

export type TextEffectProps = Omit<TextEffect, keyof Effect | "kind">

export type AnyEffect = VideoEffect | AudioEffect | TextEffect | ImageEffect

export type VisualEffect = VideoEffect | ImageEffect | TextEffect
