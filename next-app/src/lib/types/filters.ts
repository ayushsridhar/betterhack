export interface Filter {
  targetEffectId: string
  type: FilterType
}

export type FilterType =
  | "BlurFilter"
  | "AlphaFilter"
  | "NoiseFilter"
  | "AsciiFilter"
  | "CRTFilter"
  | "PixelateFilter"
  | "TwistFilter"
  | "OldFilmFilter"
  | "OutlineFilter"
  | "RadialBlurFilter"
  | "ReflectionFilter"
  | "RGBSplitFilter"
  | "ShockwaveFilter"
  | "SimpleLightmapFilter"
  | "SimplexNoiseFilter"
  | "TiltShiftFilter"
  | "ZoomBlurFilter"
  | "AdjustmentFilter"
  | "AdvancedBloomFilter"
  | "BackdropBlurFilter"
  | "BevelFilter"
  | "BloomFilter"
  | "BulgePinchFilter"
  | "ColorGradientFilter"
  | "ColorMapFilter"
  | "ColorOverlayFilter"
  | "ColorReplaceFilter"
  | "ConvolutionFilter"
  | "CrossHatchFilter"
  | "DotFilter"
  | "DropShadowFilter"
  | "EmbossFilter"
  | "GlitchFilter"
  | "GlowFilter"
  | "GodrayFilter"
  | "GrayscaleFilter"
  | "HslAdjustmentFilter"
  | "KawaseBlurFilter"
  | "MotionBlurFilter"

export type FilterPropertyType = "numeric" | "color" | "boolean" | "choice" | "object" | "array"

export interface FilterPropertyNumeric {
  type: "numeric"
  min: number
  max: number
  default: number
  step?: number
}

export interface FilterPropertyColor {
  type: "color"
  default: string
}

export interface FilterPropertyBoolean {
  type: "boolean"
  default: boolean
}

export interface FilterPropertyChoice {
  type: "choice"
  options: string[]
  default: string
}

export interface FilterPropertyObject {
  type: "object"
  properties: Record<string, FilterPropertyConfig>
}

export interface FilterPropertyArray {
  type: "array"
  itemType: FilterPropertyConfig
  default: unknown[]
}

export type FilterPropertyConfig =
  | FilterPropertyNumeric
  | FilterPropertyColor
  | FilterPropertyBoolean
  | FilterPropertyChoice
  | FilterPropertyObject
  | FilterPropertyArray

export type FilterSchema = Record<string, FilterPropertyConfig>
