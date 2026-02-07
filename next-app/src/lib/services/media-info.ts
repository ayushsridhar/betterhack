export interface VideoMetadata {
  fps: number
  duration: number
  frames: number
}

export function getVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "metadata"
    video.muted = true

    const url = URL.createObjectURL(file)
    video.src = url

    video.onloadedmetadata = () => {
      const duration = video.duration
      const fps = 30 // Estimate fps as 30 if not available from the element
      const frames = Math.ceil(duration * fps)

      URL.revokeObjectURL(url)
      resolve({ fps, duration, frames })
    }

    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Failed to load video metadata for "${file.name}"`))
    }
  })
}
