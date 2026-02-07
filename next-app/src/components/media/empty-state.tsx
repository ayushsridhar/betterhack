"use client"

import { Upload } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-12 text-text-tertiary">
      <Upload size={40} strokeWidth={1.5} />
      <p className="text-sm">Import media to get started</p>
    </div>
  )
}
