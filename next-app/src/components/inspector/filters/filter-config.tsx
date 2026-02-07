"use client"

import type { Filter } from "../../../lib/types"
import { X } from "lucide-react"

function formatFilterName(type: string): string {
  return type.replace("Filter", "").replace(/([A-Z])/g, " $1").trim()
}

interface FilterConfigProps {
  filter: Filter
  onRemove: () => void
}

export function FilterConfig({ filter, onRemove }: FilterConfigProps) {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded p-2 flex items-center justify-between group">
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
        <span className="text-text-primary text-xs truncate">
          {formatFilterName(filter.type)}
        </span>
      </div>
      <button
        onClick={onRemove}
        className="p-0.5 rounded hover:bg-danger/20 text-text-tertiary hover:text-danger transition-colors shrink-0 opacity-0 group-hover:opacity-100"
        title="Remove filter"
      >
        <X size={12} />
      </button>
    </div>
  )
}
