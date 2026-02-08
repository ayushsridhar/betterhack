import { NonHistoricalState } from "../../types"

export const initialNonHistoricalState: NonHistoricalState = {
  selected_effect: null,
  selected_annotation_id: null,
  selected_effects_for_annotation: [],
  annotation_modal_open: false,
  is_exporting: false,
  export_progress: 0,
  export_status: "demuxing",
  fps: 0,
  timebase: 25,
  is_playing: false,
  timecode: 0,
  length: 1000,
  zoom: -3,
  log: "",
  settings: {
    width: 1920,
    height: 1080,
    aspectRatio: "16/9",
    bitrate: 9000,
    standard: "1080p",
  },
  drawing_mode: {
    enabled: false,
    tool: 'freehand',
    color: '#FF0000',
    strokeWidth: 3,
  },
  annotations: [],
}
