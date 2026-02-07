"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { useEditorStore } from "../../lib/store"
import { Toolbar } from "./toolbar"
import { TimeRuler } from "./time-ruler"
import { Track } from "./track"
import { TrackSidebar } from "./track-sidebar"
import { Playhead } from "./playhead"

export function Timeline() {
  const tracks = useEditorStore((s) => s.tracks)
  const setSelectedEffect = useEditorStore((s) => s.setSelectedEffect)

  const timelineRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [visibleWidth, setVisibleWidth] = useState(0)

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      setScrollLeft(scrollContainerRef.current.scrollLeft)
    }
  }, [])

  // Track visible width on mount and resize
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

  // Deselect when clicking empty area
  const handleBackgroundClick = useCallback(() => {
    setSelectedEffect(null)
  }, [setSelectedEffect])

  return (
    <div
      ref={timelineRef}
      className="flex flex-col bg-bg-base border-t border-border-default h-full select-none"
    >
      {/* Toolbar - fixed 40px */}
      <Toolbar />

      {/* Ruler + Tracks area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar column */}
        <div className="flex flex-col shrink-0" style={{ width: "140px" }}>
          {/* Ruler spacer (matches ruler height) */}
          <div
            className="bg-bg-raised border-b border-r border-border-subtle shrink-0"
            style={{ height: "24px" }}
          />
          {/* Track sidebars */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {tracks.map((track, index) => (
              <TrackSidebar key={track.id} track={track} index={index} />
            ))}
          </div>
        </div>

        {/* Scrollable content area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto relative"
          onScroll={handleScroll}
        >
          {/* Time ruler */}
          <div className="sticky top-0 z-30">
            <TimeRuler
              scrollLeft={scrollLeft}
              visibleWidth={visibleWidth}
              timelineRef={timelineRef}
            />
          </div>

          {/* Tracks with playhead overlay */}
          <div
            className="relative min-w-full"
            onClick={handleBackgroundClick}
          >
            {/* Playhead spans across all tracks */}
            <Playhead timelineRef={timelineRef} />

            {/* Track rows */}
            {tracks.map((track, index) => (
              <Track key={track.id} track={track} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
