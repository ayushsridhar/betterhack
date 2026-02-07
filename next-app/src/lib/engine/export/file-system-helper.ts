/**
 * File System helper for saving exported video files.
 *
 * Uses the File System Access API (showSaveFilePicker) when available
 * for a native save dialog experience. Falls back to programmatic
 * download via an anchor element.
 */

/** Augment Window with the File System Access API types. */
interface FileSystemSaveOptions {
  types?: Array<{
    description: string
    accept: Record<string, string[]>
  }>
  suggestedName?: string
}

declare global {
  interface Window {
    showSaveFilePicker?: (options?: FileSystemSaveOptions) => Promise<FileSystemFileHandle>
  }
}

/**
 * Save a video Blob to disk.
 *
 * @param blob The video data to save.
 * @param filename Default filename (used as suggestion or fallback).
 */
export async function saveVideoFile(
  blob: Blob,
  filename = "export.mp4",
): Promise<void> {
  // Try File System Access API first (Chromium browsers)
  if (typeof window !== "undefined" && typeof window.showSaveFilePicker === "function") {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: "MP4 Video",
            accept: { "video/mp4": [".mp4"] },
          },
        ],
      })

      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return
    } catch (err) {
      // User cancelled the save dialog — this is not an error
      if (err instanceof DOMException && err.name === "AbortError") {
        return
      }
      // Fall through to download fallback for other errors
      console.warn("[saveVideoFile] File System Access API failed, falling back to download:", err)
    }
  }

  // Fallback: create a temporary anchor link and trigger download
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.style.display = "none"

  document.body.appendChild(anchor)
  anchor.click()

  // Clean up after a short delay to allow the download to start
  setTimeout(() => {
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }, 100)
}
