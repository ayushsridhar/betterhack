export interface MediaFileBase {
  file: File
  hash: string
}

export interface VideoFile extends MediaFileBase {
  kind: "video"
  frames: number
  duration: number
  fps: number
  proxy: boolean
  thumbnail: string
}

export interface AudioFile extends MediaFileBase {
  kind: "audio"
}

export interface ImageFile extends MediaFileBase {
  kind: "image"
}

export type AnyMedia = VideoFile | AudioFile | ImageFile
