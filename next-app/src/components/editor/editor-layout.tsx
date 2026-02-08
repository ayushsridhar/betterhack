"use client"

import { useRef } from "react"
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { useTimelineDrag } from "../../lib/hooks/use-timeline-drag"
import { useEditorStore } from "../../lib/store"
import type { LeftPanelTab } from "../../lib/store/slices/ui"
import { MediaPanel } from "../media/media-panel"
import { TextMediaPanel } from "../media/text-media-panel"
import { CanvasPreview } from "../preview/canvas-preview"
import { PlaybackControls } from "../preview/playback-controls"
import { TimecodeDisplay } from "../preview/timecode-display"
import { InspectorPanel } from "../inspector/inspector-panel"
import { Timeline } from "../timeline/timeline"
import { ExportModal } from "../export/export-modal"
import { EditorHeader } from "./editor-header"
import { DrawingToolbar, AnnotationContextBubble, DrawingOverlay, AnnotationModal } from "../annotations"

const leftTabs: { value: LeftPanelTab; label: string }[] = [
  { value: "media", label: "Media" },
  { value: "text", label: "Text" },
]

export function EditorLayout() {
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const { onDragEnd } = useTimelineDrag()
  const leftPanelTab = useEditorStore((s) => s.leftPanelTab)
  const setLeftPanelTab = useEditorStore((s) => s.setLeftPanelTab)

  const selectedAnnotationId = useEditorStore((s) => s.selected_annotation_id)
  const annotations = useEditorStore((s) => s.annotations)
  const setSelectedAnnotation = useEditorStore((s) => s.setSelectedAnnotation)

  const selectedAnnotation = annotations.find(a => a.id === selectedAnnotationId)

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
          {/* Left panel - Media / Text */}
          <div className="bg-bg-raised overflow-hidden flex flex-col">
            {/* Tab bar */}
            <div className="flex items-center gap-1 px-2 pt-1.5 pb-0 bg-bg-base border-b border-border-subtle">
              {leftTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setLeftPanelTab(tab.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                    leftPanelTab === tab.value
                      ? "bg-bg-raised text-text-primary"
                      : "text-text-tertiary hover:text-text-secondary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-hidden">
              {leftPanelTab === "media" && <MediaPanel />}
              {leftPanelTab === "text" && <TextMediaPanel />}
            </div>
          </div>

          {/* Center panel - Preview */}
          <div className="bg-bg-base overflow-hidden flex flex-col">
            {/* Drawing Toolbar */}
            <div className="p-2">
              <DrawingToolbar />
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-hidden p-2 relative">
              <div className="relative w-full h-full">
                <CanvasPreview ref={previewContainerRef} />

                {/* Drawing Overlay - captures pointer events for annotations */}
                <DrawingOverlay />
              </div>

              {/* Annotation Context Bubble */}
              {selectedAnnotation && (
                <div className="absolute top-4 right-4 z-50">
                  <AnnotationContextBubble
                    annotation={selectedAnnotation}
                    onClose={() => setSelectedAnnotation(null)}
                  />
                </div>
              )}
            </div>

            {/* Playback Controls */}
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

        {/* Modals */}
        <ExportModal />
        <AnnotationModal />
      </div>
    </DndContext>
  )
}
