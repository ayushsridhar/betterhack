"use client"

import { Upload } from "lucide-react"

interface DropZoneProps {
  isActive: boolean
}

export function DropZone({ isActive }: DropZoneProps) {
  if (!isActive) return null

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-bg-overlay/80 backdrop-blur-sm border-2 border-dashed border-accent rounded-lg pointer-events-none">
      <Upload size={48} className="text-accent" strokeWidth={1.5} />
      <p className="text-sm font-medium text-text-primary">Drop files here</p>
    </div>
  )
}
