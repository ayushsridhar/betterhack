import { AnyEffect, V2 } from "./effects"

export interface XTrack {
  id: string
  locked: boolean
  visible: boolean
  muted: boolean
}

export interface Grabbed {
  effect: AnyEffect
  offset: {
    x: number
    y: number
  }
}

export interface ProposedTimecode {
  proposed_place: {
    start_at_position: number
    track: number
  }
  duration: number | null
  effects_to_push: AnyEffect[] | null
}

export interface At {
  coordinates: V2
  indicator: Indicator
}

export type Indicator = AddTrackIndicator | null

export interface AddTrackIndicator {
  index: number
  type: "addTrack"
}

export interface EffectTimecode {
  timeline_start: number
  timeline_end: number
  track: number
}
