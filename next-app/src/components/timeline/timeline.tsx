"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { Plus } from "lucide-react"
import { useDroppable } from "@dnd-kit/core"
import { useEditorStore } from "../../lib/store"
import { Toolbar } from "./toolbar"
import { TimeRuler } from "./time-ruler"
import { Track } from "./track"
import { TrackSidebar } from "./track-sidebar"
import { Playhead } from "./playhead"

function AddTrackDropZone() {
  const addTrack = useEditorStore((s) => s.addTrack)
  const tracks = useEditorStore((s) => s.tracks)

  const { setNodeRef, isOver } = useDroppable({
    id: `track-new`,
    data: { trackId: "new", trackIndex: tracks.length },
  })

  return (
    <div
      ref={setNodeRef}
      onClick={addTrack}
      className={`
        flex items-center justify-center cursor-pointer
        border-b border-border-subtle border-dashed
        transition-colors duration-100
        ${isOver ? "bg-accent-muted border-accent" : "bg-bg-base/50 hover:bg-bg-surface/50"}
      `}
      style={{ height: "36px", minWidth: "100%" }}
    >
      <div className="flex items-center gap-1.5 text-text-tertiary hover:text-text-secondary transition-colors">
        <Plus size={12} />
        <span className="text-[10px]">Add Track</span>
      </div>
    </div>
  )
}

export function Timeline() {
  const tracks = useEditorStore((s) => s.tracks)
  const setSelectedEffect = useEditorStore((s) => s.setSelectedEffect)
  const addTrack = useEditorStore((s) => s.addTrack)

  const timelineRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [visibleWidth, setVisibleWidth] = useState(0)

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      setScrollLeft(scrollContainerRef.current.scrollLeft)
    }
  }, [])

  useEffect(() => {
    const updateWidth = () => {
      if (scrollContainerRef.current) {
        setVisibleWidth(scrollContainerRef.current.clientWidth)
      }
    }
    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  const handleBackgroundClick = useCallback(() => {
    setSelectedEffect(null)
  }, [setSelectedEffect])

  return (
    <div
      ref={timelineRef}
      className="flex flex-col bg-bg-base border-t border-border-default h-full select-none"
    >
      <Toolbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar column */}
        <div className="flex flex-col shrink-0" style={{ width: "140px" }}>
          <div
            className="bg-bg-raised border-b border-r border-border-subtle shrink-0"
            style={{ height: "24px" }}
          />
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {tracks.map((track, index) => (
              <TrackSidebar key={track.id} track={track} index={index} />
            ))}
            {/* Add Track button in sidebar */}
            <button
              onClick={addTrack}
              className="flex items-center justify-center gap-1.5 w-full border-b border-r border-border-subtle border-dashed bg-bg-base/50 hover:bg-bg-surface/50 transition-colors cursor-pointer"
              style={{ height: "36px" }}
            >
              <Plus size={12} className="text-text-tertiary" />
              <span className="text-[10px] text-text-tertiary">Add Track</span>
            </button>
          </div>
        </div>

        {/* Scrollable content area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto relative"
          onScroll={handleScroll}
        >
          <div className="sticky top-0 z-30">
            <TimeRuler
              scrollLeft={scrollLeft}
              visibleWidth={visibleWidth}
              timelineRef={timelineRef}
            />
          </div>

          <div
            className="relative min-w-full"
            onClick={handleBackgroundClick}
          >
            <Playhead scrollContainerRef={scrollContainerRef} />

            {tracks.map((track, index) => (
              <Track key={track.id} track={track} index={index} />
            ))}

            {/* Drop zone for creating a new track */}
            <AddTrackDropZone />
          </div>
        </div>
      </div>
    </div>
  )
}
