"use client"

import type { AnyMedia } from "../../lib/types"
import { MediaCard } from "./media-card"

interface MediaGridProps {
  files: AnyMedia[]
  onDelete: (hash: string) => void
  onAddToTimeline: (media: AnyMedia) => void
}

export function MediaGrid({ files, onDelete, onAddToTimeline }: MediaGridProps) {
  return (
    <div
      className="grid gap-2 p-2"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
    >
      {files.map((file) => (
        <MediaCard
          key={file.hash}
          media={file}
          onDelete={onDelete}
          onAddToTimeline={onAddToTimeline}
        />
      ))}
    </div>
  )
}
