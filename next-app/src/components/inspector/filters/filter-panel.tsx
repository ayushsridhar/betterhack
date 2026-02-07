"use client"

import { useEditorStore } from "../../../lib/store"
import { FilterConfig } from "./filter-config"
import type { VideoEffect, ImageEffect, FilterType } from "../../../lib/types"
import { Plus } from "lucide-react"

/** Only the filter types that have working implementations */
const implementedFilterTypes: FilterType[] = [
  "BlurFilter",
  "AlphaFilter",
  "NoiseFilter",
  "GrayscaleFilter",
  "AdjustmentFilter",
]

function formatFilterName(type: FilterType): string {
  return type.replace("Filter", "").replace(/([A-Z])/g, " $1").trim()
}

interface FilterPanelProps {
  effect: VideoEffect | ImageEffect
}

export function FilterPanel({ effect }: FilterPanelProps) {
  const filters = useEditorStore((s) => s.filters)
  const addFilter = useEditorStore((s) => s.addFilter)
  const removeFilter = useEditorStore((s) => s.removeFilter)

  const appliedFilters = filters.filter((f) => f.targetEffectId === effect.id)
  const appliedTypes = new Set(appliedFilters.map((f) => f.type))
  const availableFilters = implementedFilterTypes.filter((t) => !appliedTypes.has(t))

  const handleAddFilter = (type: FilterType) => {
    addFilter({ targetEffectId: effect.id, type })
  }

  return (
    <div className="p-3 space-y-4">
      {/* Applied Filters */}
      {appliedFilters.length > 0 && (
        <div>
          <label className="text-text-tertiary text-xs block mb-2">
            Active Filters ({appliedFilters.length})
          </label>
          <div className="space-y-1.5">
            {appliedFilters.map((filter) => (
              <FilterConfig
                key={filter.type}
                filter={filter}
                onRemove={() => removeFilter(effect.id, filter.type)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Filters */}
      <div>
        <label className="text-text-tertiary text-xs block mb-2">
          Available Filters ({availableFilters.length})
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {availableFilters.map((type) => (
            <button
              key={type}
              onClick={() => handleAddFilter(type)}
              className="bg-bg-surface border border-border-subtle rounded p-2 cursor-pointer hover:border-border-default transition-colors text-left group"
            >
              <div className="flex items-center gap-1.5">
                <Plus
                  size={10}
                  className="text-text-tertiary group-hover:text-accent shrink-0 transition-colors"
                />
                <span className="text-text-secondary text-xs truncate group-hover:text-text-primary transition-colors">
                  {formatFilterName(type)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
