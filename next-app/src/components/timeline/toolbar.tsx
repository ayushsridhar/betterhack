"use client"

import { useCallback } from "react"
import { useEditorStore } from "../../lib/store"
import { convertMsToHmsMs } from "../../lib/utils/time"
import {
  Undo2,
  Redo2,
  Scissors,
  Trash2,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
} from "lucide-react"

export function Toolbar() {
  const timecode = useEditorStore((s) => s.timecode)
  const zoom = useEditorStore((s) => s.zoom)
  const isPlaying = useEditorStore((s) => s.is_playing)
  const selectedEffect = useEditorStore((s) => s.selected_effect)
  const setZoom = useEditorStore((s) => s.setZoom)
  const zoomIn = useEditorStore((s) => s.zoomIn)
  const zoomOut = useEditorStore((s) => s.zoomOut)
  const splitEffect = useEditorStore((s) => s.splitEffect)
  const removeEffect = useEditorStore((s) => s.removeEffect)
  const toggleIsPlaying = useEditorStore((s) => s.toggleIsPlaying)

  const handleUndo = useCallback(() => {
    useEditorStore.temporal.getState().undo()
  }, [])

  const handleRedo = useCallback(() => {
    useEditorStore.temporal.getState().redo()
  }, [])

  const handleSplit = useCallback(() => {
    if (selectedEffect) {
      splitEffect(selectedEffect.id, timecode)
    }
  }, [selectedEffect, splitEffect, timecode])

  const handleDelete = useCallback(() => {
    if (selectedEffect) {
      removeEffect(selectedEffect.id)
    }
  }, [selectedEffect, removeEffect])

  const handleZoomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setZoom(parseFloat(e.target.value))
    },
    [setZoom]
  )

  return (
    <div
      className="flex items-center gap-2 px-3 bg-bg-raised border-b border-border-subtle select-none shrink-0"
      style={{ height: "40px" }}
    >
      {/* Play/Pause */}
      <button
        onClick={toggleIsPlaying}
        className="p-1.5 rounded hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors"
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
      </button>

      <div className="w-px h-5 bg-border-subtle" />

      {/* Undo / Redo */}
      <button
        onClick={handleUndo}
        className="p-1.5 rounded hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors"
        title="Undo"
      >
        <Undo2 size={14} />
      </button>
      <button
        onClick={handleRedo}
        className="p-1.5 rounded hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors"
        title="Redo"
      >
        <Redo2 size={14} />
      </button>

      <div className="w-px h-5 bg-border-subtle" />

      {/* Split / Delete */}
      <button
        onClick={handleSplit}
        disabled={!selectedEffect}
        className="p-1.5 rounded hover:bg-bg-elevated text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
        title="Split at playhead"
      >
        <Scissors size={14} />
      </button>
      <button
        onClick={handleDelete}
        disabled={!selectedEffect}
        className="p-1.5 rounded hover:bg-bg-elevated text-text-secondary hover:text-danger disabled:opacity-30 disabled:pointer-events-none transition-colors"
        title="Delete selected"
      >
        <Trash2 size={14} />
      </button>

      <div className="flex-1" />

      {/* Zoom controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={zoomOut}
          className="p-1 rounded hover:bg-bg-elevated text-text-tertiary hover:text-text-secondary transition-colors"
          title="Zoom out"
        >
          <ZoomOut size={13} />
        </button>
        <input
          type="range"
          min={-13}
          max={2}
          step={0.1}
          value={zoom}
          onChange={handleZoomChange}
          className="w-20 h-1 accent-accent cursor-pointer"
        />
        <button
          onClick={zoomIn}
          className="p-1 rounded hover:bg-bg-elevated text-text-tertiary hover:text-text-secondary transition-colors"
          title="Zoom in"
        >
          <ZoomIn size={13} />
        </button>
      </div>

      <div className="w-px h-5 bg-border-subtle" />

      {/* Timecode display */}
      <div className="font-mono text-[11px] text-text-secondary tabular-nums min-w-[90px] text-right">
        {convertMsToHmsMs(timecode)}
      </div>
    </div>
  )
}
