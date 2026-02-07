"use client"

import { useRef } from "react"
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { useTimelineDrag } from "../../lib/hooks/use-timeline-drag"
import { MediaPanel } from "../media/media-panel"
import { CanvasPreview } from "../preview/canvas-preview"
import { PlaybackControls } from "../preview/playback-controls"
import { TimecodeDisplay } from "../preview/timecode-display"
import { InspectorPanel } from "../inspector/inspector-panel"
import { Timeline } from "../timeline/timeline"
import { ExportModal } from "../export/export-modal"
import { EditorHeader } from "./editor-header"

export function EditorLayout() {
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const { onDragEnd } = useTimelineDrag()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex flex-col h-screen bg-bg-base overflow-hidden">
        {/* Header */}
        <EditorHeader />

        {/* Main editor grid */}
        <div
          className="flex-1 grid overflow-hidden"
          style={{
            gridTemplateColumns: "18% 1fr 22%",
            gridTemplateRows: "1fr 38%",
            gap: "1px",
            background: "var(--color-border-subtle)",
          }}
        >
          {/* Left panel - Media */}
          <div className="bg-bg-raised overflow-hidden">
            <MediaPanel />
          </div>

          {/* Center panel - Preview */}
          <div className="bg-bg-base overflow-hidden flex flex-col">
            <div className="flex-1 overflow-hidden p-2">
              <CanvasPreview ref={previewContainerRef} />
            </div>
            <div className="flex items-center justify-between px-3">
              <TimecodeDisplay />
              <PlaybackControls containerRef={previewContainerRef} />
            </div>
          </div>

          {/* Right panel - Inspector */}
          <div className="bg-bg-raised overflow-hidden">
            <InspectorPanel />
          </div>

          {/* Bottom panel - Timeline */}
          <div className="col-span-3 bg-bg-surface overflow-hidden" style={{ gridColumn: "1 / -1" }}>
            <Timeline />
          </div>
        </div>

        {/* Export modal */}
        <ExportModal />
      </div>
    </DndContext>
  )
}
