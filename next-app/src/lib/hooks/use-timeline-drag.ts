"use client"

import { useCallback } from "react"
import { useEditorStore } from "../store"
import { generateId } from "../utils/id"
import { findPlaceForNewEffect } from "../utils/effect-placement"
import { fitToFrame } from "../utils/fit-to-frame"
import { getFile } from "../services/media-db"
import { getVideoMetadata, getImageDimensions } from "../services/media-info"
import type { DragEndEvent } from "@dnd-kit/core"

export function useTimelineDrag() {
  const zoom = useEditorStore((s) => s.zoom)
  const setEffectStartPosition = useEditorStore(
    (s) => s.setEffectStartPosition
  )
  const setEffectTrack = useEditorStore((s) => s.setEffectTrack)
  const addVideoEffect = useEditorStore((s) => s.addVideoEffect)
  const addAudioEffect = useEditorStore((s) => s.addAudioEffect)
  const addImageEffect = useEditorStore((s) => s.addImageEffect)

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, delta, over } = event
      if (!active) return

      const activeId = active.id as string
      const data = active.data.current as Record<string, unknown> | undefined

      // Determine the target track index from the droppable
      let targetTrackIndex = 0
      if (over?.data.current) {
        const overData = over.data.current as Record<string, unknown>
        if (typeof overData.trackIndex === "number") {
          targetTrackIndex = overData.trackIndex
        }
      }

      // --- CASE 1: Media card dropped onto timeline ---
      if (activeId.startsWith("media-") && data?.hash) {
        const hash = data.hash as string
        const kind = data.kind as string

        // Only handle if dropped onto a track (including "track-new")
        if (!over || !(over.id as string).startsWith("track-")) return

        // If dropped on the "Add Track" zone, create a new track first
        if (over.id === "track-new") {
          useEditorStore.getState().addTrack()
          // The new track is now at the end
          targetTrackIndex = useEditorStore.getState().tracks.length - 1
        }

        const state = useEditorStore.getState()
        const id = generateId()
        const startAt = findPlaceForNewEffect(
          state.effects,
          targetTrackIndex,
          0
        )

        const { width: projW, height: projH } = state.settings

        if (kind === "video") {
          let durationMs = 5000
          let frames = 150
          let thumbnail = ""
          let name = "Video"
          let mediaW = 1920
          let mediaH = 1080
          try {
            const media = await getFile(hash)
            if (media && media.kind === "video") {
              durationMs = media.duration * 1000
              frames = media.frames
              thumbnail = media.thumbnail
              name = media.file.name
              mediaW = media.width || 1920
              mediaH = media.height || 1080
            }
          } catch {
            // Use defaults
          }
          const rect = fitToFrame(mediaW, mediaH, projW, projH)
          addVideoEffect({
            id,
            kind: "video",
            start_at_position: startAt,
            start: 0,
            end: durationMs,
            duration: durationMs,
            track: targetTrackIndex,
            thumbnail,
            raw_duration: durationMs,
            frames,
            rect,
            file_hash: hash,
            name,
          })
        } else if (kind === "audio") {
          let durationMs = 10000
          let name = "Audio"
          try {
            const media = await getFile(hash)
            if (media) {
              name = media.file.name
              if (media.kind === "audio" && media.duration > 0) {
                durationMs = media.duration * 1000
              }
            }
          } catch {
            // Use defaults
          }
          addAudioEffect({
            id,
            kind: "audio",
            start_at_position: startAt,
            start: 0,
            end: durationMs,
            duration: durationMs,
            track: targetTrackIndex,
            raw_duration: durationMs,
            file_hash: hash,
            name,
          })
        } else if (kind === "image") {
          const durationMs = 5000
          let name = "Image"
          let mediaW = 1920
          let mediaH = 1080
          try {
            const media = await getFile(hash)
            if (media && media.kind === "image") {
              name = media.file.name
              mediaW = media.width || 1920
              mediaH = media.height || 1080
            }
          } catch {
            // Use defaults
          }
          const rect = fitToFrame(mediaW, mediaH, projW, projH)
          addImageEffect({
            id,
            kind: "image",
            start_at_position: startAt,
            start: 0,
            end: durationMs,
            duration: durationMs,
            track: targetTrackIndex,
            rect,
            file_hash: hash,
            name,
          })
        }
        return
      }

      // --- CASE 2: Existing clip repositioned within timeline ---
      const effectId = activeId
      const scale = Math.pow(2, zoom)
      const state = useEditorStore.getState()
      const effect = state.effects.find((e) => e.id === effectId)
      if (!effect) return

      // Update horizontal position
      const deltaTime = delta.x / scale
      const newPosition = Math.max(0, effect.start_at_position + deltaTime)
      setEffectStartPosition(effectId, newPosition)

      // Update track if dropped on a different track
      if (over && (over.id as string).startsWith("track-")) {
        if (targetTrackIndex !== effect.track) {
          setEffectTrack(effectId, targetTrackIndex)
        }
      }
    },
    [
      zoom,
      setEffectStartPosition,
      setEffectTrack,
      addVideoEffect,
      addAudioEffect,
      addImageEffect,
    ]
  )

  return { onDragEnd }
}
