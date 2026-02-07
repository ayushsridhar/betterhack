import type { Filter as AppFilter } from "../../types"

type PixiContainer = import("pixi.js").Container
type PixiFilter = import("pixi.js").Filter

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
   * Replaces any existing filters on the target.
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
      const pixiFilter = await this._createFilter(filter)
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

  private async _createFilter(filter: AppFilter): Promise<PixiFilter | null> {
    const PIXI = await import("pixi.js")

    switch (filter.type) {
      case "BlurFilter":
        return new PIXI.BlurFilter({ strength: 8, quality: 4 })

      case "AlphaFilter":
        return new PIXI.AlphaFilter({ alpha: 0.5 })

      case "NoiseFilter":
        return new PIXI.NoiseFilter({ noise: 0.5 })

      case "GrayscaleFilter": {
        const cmf = new PIXI.ColorMatrixFilter()
        cmf.desaturate()
        return cmf
      }

      case "AdjustmentFilter": {
        // Use ColorMatrixFilter to approximate an adjustment filter
        const cmf = new PIXI.ColorMatrixFilter()
        cmf.brightness(1, false)
        cmf.contrast(0.5, true)
        cmf.saturate(0, true)
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
