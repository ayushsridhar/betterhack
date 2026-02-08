import { AnyEffect } from "./effects"
import { XTrack } from "./timeline"
import { Filter } from "./filters"
import { Animation } from "./animations"
import { Transition } from "./transitions"
import { Annotation, DrawingMode } from "./annotations"

export type ExportStatus = "complete" | "composing" | "demuxing" | "flushing" | "error"
export type AspectRatio = "16/9" | "1/1" | "4/3" | "9/16" | "3/2" | "21/9"
export type Standard = "4k" | "2k" | "1080p" | "720p" | "480p"

export interface Settings {
  width: number
  height: number
  bitrate: number
  aspectRatio: AspectRatio
  standard: Standard
}

export interface HistoricalState {
  projectName: string
  projectId: string
  effects: AnyEffect[]
  tracks: XTrack[]
  filters: Filter[]
  animations: Animation[]
  transitions: Transition[]
}

export interface NonHistoricalState {
  selected_effect: AnyEffect | null
  selected_annotation_id: string | null
  selected_effects_for_annotation: string[] // Effect IDs selected for annotation
  annotation_modal_open: boolean
  is_playing: boolean
  is_exporting: boolean
  export_progress: number
  export_status: ExportStatus
  fps: number
  timecode: number
  length: number
  zoom: number
  timebase: number
  log: string
  settings: Settings
  drawing_mode: DrawingMode
  annotations: Annotation[]
}

export type State = HistoricalState & NonHistoricalState
