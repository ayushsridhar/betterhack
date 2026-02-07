import { NonHistoricalState } from "../../types"

export const initialNonHistoricalState: NonHistoricalState = {
  selected_effect: null,
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
}
