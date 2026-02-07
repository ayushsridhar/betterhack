export interface VideoMetadata {
  fps: number
  duration: number
  frames: number
  width: number
  height: number
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
      const fps = 30
      const frames = Math.ceil(duration * fps)
      const width = video.videoWidth
      const height = video.videoHeight

      URL.revokeObjectURL(url)
      resolve({ fps, duration, frames, width, height })
    }

    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Failed to load video metadata for "${file.name}"`))
    }
  })
}

export function getAudioMetadata(file: File): Promise<{ duration: number }> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement("audio")
    audio.preload = "metadata"

    const url = URL.createObjectURL(file)
    audio.src = url

    audio.onloadedmetadata = () => {
      const duration = audio.duration
      URL.revokeObjectURL(url)
      resolve({ duration })
    }

    audio.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Failed to load audio metadata for "${file.name}"`))
    }
  })
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.src = url

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Failed to load image dimensions for "${file.name}"`))
    }
  })
}
