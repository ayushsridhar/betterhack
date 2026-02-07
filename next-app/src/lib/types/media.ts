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
  width: number
  height: number
}

export interface AudioFile extends MediaFileBase {
  kind: "audio"
  duration: number
}

export interface ImageFile extends MediaFileBase {
  kind: "image"
  width: number
  height: number
}

export type AnyMedia = VideoFile | AudioFile | ImageFile
