"use client"

import { useState, useEffect, useCallback } from "react"
import type { AnyMedia, VideoFile, AudioFile, ImageFile } from "../types"
import {
  addFile as dbAddFile,
  getAllFiles as dbGetAllFiles,
  deleteFile as dbDeleteFile,
  countByHash,
} from "../services/media-db"
import { getVideoMetadata } from "../services/media-info"

async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

function generateVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "auto"
    video.muted = true
    video.playsInline = true

    const url = URL.createObjectURL(file)
    video.src = url

    video.onloadeddata = () => {
      // Seek to 1 second or 10% of duration, whichever is smaller
      video.currentTime = Math.min(1, video.duration * 0.1)
    }

    video.onseeked = () => {
      const canvas = document.createElement("canvas")
      canvas.width = 150
      canvas.height = 84
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error("Could not get canvas context"))
        return
      }
      ctx.drawImage(video, 0, 0, 150, 84)
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7)
      URL.revokeObjectURL(url)
      resolve(dataUrl)
    }

    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Failed to generate thumbnail for "${file.name}"`))
    }
  })
}

function getMediaKind(file: File): "video" | "audio" | "image" | null {
  const type = file.type
  if (type.startsWith("video/")) return "video"
  if (type.startsWith("audio/") || /\.(mp3|wav|ogg)$/i.test(file.name)) return "audio"
  if (type.startsWith("image/")) return "image"
  return null
}

export function useMediaLibrary() {
  const [files, setFiles] = useState<AnyMedia[]>([])
  const [isReady, setIsReady] = useState(false)

  // Load all files from IndexedDB on mount
  useEffect(() => {
    let cancelled = false
    dbGetAllFiles()
      .then((allFiles) => {
        if (!cancelled) {
          setFiles(allFiles)
          setIsReady(true)
        }
      })
      .catch((err) => {
        console.error("Failed to load media library:", err)
        if (!cancelled) setIsReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const importFile = useCallback(async (file: File): Promise<AnyMedia | null> => {
    const kind = getMediaKind(file)
    if (!kind) {
      console.warn(`Unsupported file type: ${file.type} (${file.name})`)
      return null
    }

    const hash = await hashFile(file)

    // Deduplicate: skip if already in DB
    const existing = await countByHash(hash)
    if (existing > 0) {
      console.info(`File "${file.name}" already imported (hash: ${hash.slice(0, 8)}...)`)
      return null
    }

    let media: AnyMedia

    if (kind === "video") {
      const metadata = await getVideoMetadata(file)
      let thumbnail = ""
      try {
        thumbnail = await generateVideoThumbnail(file)
      } catch (err) {
        console.warn("Thumbnail generation failed:", err)
      }
      media = {
        kind: "video",
        file,
        hash,
        fps: metadata.fps,
        duration: metadata.duration,
        frames: metadata.frames,
        proxy: false,
        thumbnail,
      } satisfies VideoFile
    } else if (kind === "audio") {
      media = {
        kind: "audio",
        file,
        hash,
      } satisfies AudioFile
    } else {
      media = {
        kind: "image",
        file,
        hash,
      } satisfies ImageFile
    }

    await dbAddFile(media)
    setFiles((prev) => [...prev, media])
    return media
  }, [])

  const deleteFile = useCallback(async (hash: string) => {
    await dbDeleteFile(hash)
    setFiles((prev) => prev.filter((f) => f.hash !== hash))
  }, [])

  return { files, importFile, deleteFile, isReady }
}
