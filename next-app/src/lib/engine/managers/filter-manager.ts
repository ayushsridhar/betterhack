import type { Filter as AppFilter } from "../../types"

type PixiContainer = import("pixi.js").Container
type PixiFilter = import("pixi.js").Filter

/** Extended filter with optional params for configurable filter values. */
type FilterWithParams = AppFilter & { params?: Record<string, unknown> }

/**
 * FilterManager applies PIXI filters to sprites/containers based on the
 * application's Filter type definitions.
 *
 * Currently supports the built-in PIXI v8 filters:
 *   - BlurFilter
 *   - AlphaFilter
 *   - NoiseFilter
 *   - GrayscaleFilter (via ColorMatrixFilter)
 *   - AdjustmentFilter (via ColorMatrixFilter with brightness/contrast/saturation)
 *
 * All other filter types are logged as unsupported stubs for future implementation.
 */
export class FilterManager {
  /**
   * Apply an array of application Filter definitions to a PIXI display object.
   * Replaces any existing filters on the target. Clears filters when the array is empty.
   */
  async applyFilters(
    target: PixiContainer,
    filters: AppFilter[]
  ): Promise<void> {
    if (filters.length === 0) {
      target.filters = []
      return
    }

    const pixiFilters: PixiFilter[] = []

    for (const filter of filters) {
      const pixiFilter = await this._createFilter(filter as FilterWithParams)
      if (pixiFilter) {
        pixiFilters.push(pixiFilter)
      }
    }

    target.filters = pixiFilters
  }

  /**
   * Remove all filters from a PIXI display object.
   */
  removeFilters(target: PixiContainer): void {
    target.filters = []
  }

  private async _createFilter(filter: FilterWithParams): Promise<PixiFilter | null> {
    const PIXI = await import("pixi.js")
    const params = filter.params ?? {}

    switch (filter.type) {
      case "BlurFilter": {
        const strength = (params.strength as number | undefined) ?? 8
        const quality = (params.quality as number | undefined) ?? 4
        return new PIXI.BlurFilter({ strength, quality })
      }

      case "AlphaFilter": {
        const alpha = (params.alpha as number | undefined) ?? 0.5
        return new PIXI.AlphaFilter({ alpha })
      }

      case "NoiseFilter": {
        const noise = (params.noise as number | undefined) ?? 0.5
        return new PIXI.NoiseFilter({ noise })
      }

      case "GrayscaleFilter": {
        const cmf = new PIXI.ColorMatrixFilter()
        cmf.desaturate()
        return cmf
      }

      case "AdjustmentFilter": {
        // Use ColorMatrixFilter to approximate an adjustment filter
        const cmf = new PIXI.ColorMatrixFilter()
        const brightness = (params.brightness as number | undefined) ?? 1
        const contrast = (params.contrast as number | undefined) ?? 0.5
        const saturate = (params.saturate as number | undefined) ?? 0
        cmf.brightness(brightness, false)
        cmf.contrast(contrast, true)
        cmf.saturate(saturate, true)
        return cmf
      }

      default:
        console.warn(
          `[FilterManager] Filter type "${filter.type}" is not yet implemented. Skipping.`
        )
        return null
    }
  }

  destroy(): void {
    // No persistent state to clean up
  }
}
