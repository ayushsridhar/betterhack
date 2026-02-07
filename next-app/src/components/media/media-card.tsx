"use client"

import { useRef, useState, useCallback, useMemo, useEffect } from "react"
import { X, Plus, Film, Music, ImageIcon } from "lucide-react"
import { useDraggable } from "@dnd-kit/core"
import type { AnyMedia } from "../../lib/types"

interface MediaCardProps {
  media: AnyMedia
  onDelete: (hash: string) => void
  onAddToTimeline: (media: AnyMedia) => void
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function MediaCard({ media, onDelete, onAddToTimeline }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)

  // Memoize blob URL for image thumbnails
  const imageBlobUrl = useMemo(
    () => (media.kind === "image" ? URL.createObjectURL(media.file) : null),
    [media.file]
  )

  // Revoke blob URL on unmount
  useEffect(() => {
    return () => {
      if (imageBlobUrl) URL.revokeObjectURL(imageBlobUrl)
    }
  }, [imageBlobUrl])

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `media-${media.hash}`,
    data: { kind: media.kind, hash: media.hash },
  })

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    if (media.kind === "video") {
      // Create a temporary video element for hover preview
      const video = document.createElement("video")
      video.src = URL.createObjectURL(media.file)
      video.muted = true
      video.loop = true
      video.playsInline = true
      video.className = "absolute inset-0 w-full h-full object-cover rounded-t-md pointer-events-none"
      videoPreviewRef.current = video

      const container = document.getElementById(`media-thumb-${media.hash}`)
      if (container) {
        container.appendChild(video)
        video.play().catch(() => {})
      }
    }
  }, [media])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    if (videoPreviewRef.current) {
      videoPreviewRef.current.pause()
      const src = videoPreviewRef.current.src
      videoPreviewRef.current.remove()
      videoPreviewRef.current = null
      if (src.startsWith("blob:")) URL.revokeObjectURL(src)
    }
  }, [])

  const thumbnail = media.kind === "video" ? media.thumbnail : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group relative flex flex-col rounded-md bg-bg-surface border border-border-subtle hover:border-border-default transition-all cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50 z-50" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail area */}
      <div
        id={`media-thumb-${media.hash}`}
        className="relative aspect-video w-full overflow-hidden rounded-t-md bg-bg-elevated flex items-center justify-center"
      >
        {media.kind === "video" && thumbnail ? (
          <img
            src={thumbnail}
            alt={media.file.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : media.kind === "image" && imageBlobUrl ? (
          <img
            src={imageBlobUrl}
            alt={media.file.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : media.kind === "video" ? (
          <Film size={24} className="text-text-tertiary" />
        ) : media.kind === "audio" ? (
          <Music size={24} className="text-text-tertiary" />
        ) : (
          <ImageIcon size={24} className="text-text-tertiary" />
        )}

        {/* Duration badge for video/audio */}
        {media.kind === "video" && "duration" in media && (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/70 text-text-primary">
            {formatDuration(media.duration)}
          </span>
        )}

        {/* Delete button on hover */}
        <button
          className={`absolute top-1 right-1 z-10 p-0.5 rounded bg-bg-overlay/80 hover:bg-danger text-text-secondary hover:text-text-primary transition-all ${isHovered ? "opacity-100" : "opacity-0"}`}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onDelete(media.hash)
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <X size={14} />
        </button>

        {/* Add to timeline button on hover */}
        <button
          className={`absolute bottom-1 left-1 z-10 p-0.5 rounded bg-accent/80 hover:bg-accent text-text-primary transition-all ${isHovered ? "opacity-100" : "opacity-0"}`}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onAddToTimeline(media)
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* File name */}
      <div className="px-2 py-1.5 truncate text-xs text-text-secondary">
        {media.file.name}
      </div>
    </div>
  )
}
