"use client"

import { useState, useCallback, useMemo, useRef, type DragEvent } from "react"
import { Search } from "lucide-react"
import { useMediaLibrary } from "../../lib/hooks/use-media-library"
import { useEditorStore } from "../../lib/store"
import { generateId } from "../../lib/utils/id"
import { fitToFrame } from "../../lib/utils/fit-to-frame"
import type { AnyMedia, VideoEffect, AudioEffect, ImageEffect } from "../../lib/types"
import { ImportButton } from "./import-button"
import { MediaGrid } from "./media-grid"
import { DropZone } from "./drop-zone"
import { EmptyState } from "./empty-state"

type FilterKind = "all" | "video" | "audio" | "image"

export function MediaPanel() {
  const { files, importFile, deleteFile } = useMediaLibrary()
  const [search, setSearch] = useState("")
  const [filterKind, setFilterKind] = useState<FilterKind>("all")
  const [isDragOver, setIsDragOver] = useState(false)
  const dragCounter = useRef(0)

  const addVideoEffect = useEditorStore((s) => s.addVideoEffect)
  const addAudioEffect = useEditorStore((s) => s.addAudioEffect)
  const addImageEffect = useEditorStore((s) => s.addImageEffect)

  const filteredFiles = useMemo(() => {
    let result = files
    if (filterKind !== "all") {
      result = result.filter((f) => f.kind === filterKind)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((f) => f.file.name.toLowerCase().includes(q))
    }
    return result
  }, [files, filterKind, search])

  const handleFilesSelected = useCallback(
    async (fileList: FileList) => {
      const fileArray = Array.from(fileList)
      for (const file of fileArray) {
        await importFile(file)
      }
    },
    [importFile]
  )

  const handleAddToTimeline = useCallback(
    (media: AnyMedia) => {
      const id = generateId()
      const baseEffect = {
        id,
        start_at_position: 0,
        start: 0,
        track: 0,
      }

      const { width: projW, height: projH } = useEditorStore.getState().settings

      if (media.kind === "video") {
        const durationMs = media.duration * 1000
        const thumbnail = media.thumbnail ?? ""
        const rect = fitToFrame(media.width || projW, media.height || projH, projW, projH)
        addVideoEffect({
          ...baseEffect,
          kind: "video",
          thumbnail,
          raw_duration: durationMs,
          duration: durationMs,
          end: durationMs,
          frames: media.frames,
          rect,
          file_hash: media.hash,
          name: media.file.name,
        } satisfies VideoEffect)
      } else if (media.kind === "audio") {
        const durationMs = media.duration > 0 ? media.duration * 1000 : 10000
        addAudioEffect({
          ...baseEffect,
          kind: "audio",
          raw_duration: durationMs,
          duration: durationMs,
          end: durationMs,
          file_hash: media.hash,
          name: media.file.name,
        } satisfies AudioEffect)
      } else if (media.kind === "image") {
        const durationMs = 5000
        const rect = fitToFrame(media.width || projW, media.height || projH, projW, projH)
        addImageEffect({
          ...baseEffect,
          kind: "image",
          duration: durationMs,
          end: durationMs,
          rect,
          file_hash: media.hash,
          name: media.file.name,
        } satisfies ImageEffect)
      }
    },
    [addVideoEffect, addAudioEffect, addImageEffect]
  )

  // Native drag-and-drop from OS (not @dnd-kit)
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragOver(false)
    }
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounter.current = 0
      setIsDragOver(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await handleFilesSelected(e.dataTransfer.files)
      }
    },
    [handleFilesSelected]
  )

  const filterOptions: { value: FilterKind; label: string }[] = [
    { value: "all", label: "All" },
    { value: "video", label: "Video" },
    { value: "audio", label: "Audio" },
    { value: "image", label: "Image" },
  ]

  return (
    <div
      className="relative flex flex-col h-full bg-bg-raised"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-border-subtle">
        <ImportButton onFilesSelected={handleFilesSelected} />

        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md bg-bg-surface border border-border-subtle focus:border-border-default text-text-primary placeholder:text-text-tertiary outline-none transition-colors"
          />
        </div>

        {/* Kind filter */}
        <div className="flex gap-0.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterKind(opt.value)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                filterKind === opt.value
                  ? "bg-accent-muted text-accent"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {filteredFiles.length > 0 ? (
          <MediaGrid
            files={filteredFiles}
            onDelete={deleteFile}
            onAddToTimeline={handleAddToTimeline}
          />
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Drop zone overlay (OS file drag) */}
      <DropZone isActive={isDragOver} />
    </div>
  )
}
