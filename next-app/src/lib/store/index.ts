"use client"

import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { temporal } from "zundo"

import type {
  AnyEffect,
  AudioEffect,
  ImageEffect,
  TextEffect,
  VideoEffect,
  VisualEffect,
  EffectRect,
  ExportStatus,
  AspectRatio,
  Standard,
  Filter,
  FilterType,
  Animation,
  AnimationFor,
  Transition,
  Font,
  FillInput,
  ColorSource,
  TextStyleFontStyle,
  TextStyleAlign,
  TextStyleFontVariant,
  TextStyleFontWeight,
  TextStyleTextBaseline,
  TextStyleWhiteSpace,
  LineJoin,
  Annotation,
  DrawingToolType,
} from "../types"
import type { LeftPanelTab, RightPanelTab, UIState } from "./slices/ui"
import { initialHistoricalState } from "./slices/historical"
import { initialNonHistoricalState } from "./slices/non-historical"
import { initialUIState } from "./slices/ui"
import { generateId } from "../utils/id"
import type { HistoricalState, NonHistoricalState } from "../types"

// Define the full store type explicitly to avoid circular references
export interface EditorStore
  extends HistoricalState,
    NonHistoricalState,
    UIState {
  // Effect actions
  addVideoEffect: (effect: VideoEffect) => void
  addAudioEffect: (effect: AudioEffect) => void
  addImageEffect: (effect: ImageEffect) => void
  addTextEffect: (effect: TextEffect) => void
  removeEffect: (id: string) => void
  removeAllEffects: () => void
  setEffects: (effects: AnyEffect[]) => void
  setEffectTrack: (effectId: string, track: number) => void
  setEffectDuration: (effectId: string, duration: number) => void
  setEffectStartPosition: (effectId: string, x: number) => void
  setEffectStart: (effectId: string, start: number) => void
  setEffectEnd: (effectId: string, end: number) => void
  setEffectRect: (effectId: string, rect: EffectRect) => void
  setEffectScale: (effectId: string, scale: { x: number; y: number }) => void
  setPositionOnCanvas: (effectId: string, x: number, y: number) => void
  setRotation: (effectId: string, rotation: number) => void
  setPivot: (effectId: string, x: number, y: number) => void
  setEffectWidth: (effectId: string, width: number) => void
  setEffectHeight: (effectId: string, height: number) => void
  splitEffect: (effectId: string, splitAtTimecode: number) => void

  // Track actions
  addTrack: () => void
  removeTrack: (id: string) => void
  removeTracks: () => void
  toggleTrackMuted: (trackId: string) => void
  toggleTrackVisibility: (trackId: string) => void
  toggleTrackLocked: (trackId: string) => void

  // Playback actions
  setTimecode: (timecode: number) => void
  increaseTimecode: (byMs: number) => void
  setIsPlaying: (isPlaying: boolean) => void
  toggleIsPlaying: () => void
  zoomIn: () => void
  zoomOut: () => void
  setZoom: (zoom: number) => void
  setFps: (fps: number) => void
  setTimebase: (timebase: number) => void
  setSelectedEffect: (effect: AnyEffect | null) => void
  setIsExporting: (isExporting: boolean) => void
  setExportProgress: (progress: number) => void
  setExportStatus: (status: ExportStatus) => void
  setLog: (log: string) => void
  setProjectResolution: (width: number, height: number) => void
  setStandard: (standard: Standard) => void
  setAspectRatio: (aspectRatio: AspectRatio) => void
  setBitrate: (value: number) => void

  // Text actions
  setTextContent: (id: string, content: string) => void
  setTextFont: (id: string, font: Font) => void
  setFontSize: (id: string, size: number) => void
  setFontStyle: (id: string, style: TextStyleFontStyle) => void
  setFontAlign: (id: string, align: TextStyleAlign) => void
  setFontVariant: (id: string, variant: TextStyleFontVariant) => void
  setFontWeight: (id: string, weight: TextStyleFontWeight) => void
  setTextFill: (id: string, color: FillInput, index: number) => void
  addTextFill: (id: string) => void
  removeTextFill: (id: string, index: number) => void
  moveTextFillUp: (id: string, index: number) => void
  moveTextFillDown: (id: string, index: number) => void
  setFillGradientType: (id: string, type: number) => void
  addFillGradientStop: (id: string) => void
  removeFillGradientStop: (id: string, index: number) => void
  setFillGradientStop: (id: string, index: number, value: number) => void
  setTextRect: (id: string, rect: EffectRect) => void
  setStrokeColor: (id: string, value: string) => void
  setStrokeThickness: (id: string, value: number) => void
  setStrokeLineJoin: (id: string, value: LineJoin) => void
  setStrokeMiterLimit: (id: string, value: number) => void
  setLetterSpacing: (id: string, value: number) => void
  setTextBaseline: (id: string, value: TextStyleTextBaseline) => void
  toggleDropShadow: (id: string, value: boolean) => void
  setDropShadowAlpha: (id: string, value: number) => void
  setDropShadowAngle: (id: string, value: number) => void
  setDropShadowBlur: (id: string, value: number) => void
  setDropShadowDistance: (id: string, value: number) => void
  setDropShadowColor: (id: string, value: ColorSource) => void
  setWordWrap: (id: string, value: boolean) => void
  setBreakWords: (id: string, value: boolean) => void
  setWrapWidth: (id: string, value: number) => void
  setLeading: (id: string, value: number) => void
  setLineHeight: (id: string, value: number) => void
  setWhiteSpace: (id: string, value: TextStyleWhiteSpace) => void

  // Filter actions
  addFilter: (filter: Filter) => void
  removeFilter: (effectId: string, type: FilterType) => void

  // Animation actions
  addAnimation: (animation: Animation) => void
  removeAnimation: (effectId: string, type: "in" | "out", animationFor: AnimationFor) => void
  setAnimations: (animations: Animation[]) => void
  setAnimationDuration: (effectId: string, duration: number) => void
  clearAnimations: () => void

  // Transition actions
  addTransition: (transition: Transition) => void
  removeTransition: (id: string) => void
  setTransitionDuration: (transitionId: string, duration: number) => void
  clearTransitions: () => void

  // Project actions
  setProjectName: (name: string) => void
  setProjectId: (id: string) => void

  // UI actions
  setLeftPanelTab: (tab: LeftPanelTab) => void
  setRightPanelTab: (tab: RightPanelTab) => void
  setInspectorSubTab: (tab: UIState["inspectorSubTab"]) => void
  setIsExportModalOpen: (open: boolean) => void
  resetProject: () => void

  // Annotation actions
  setDrawingMode: (enabled: boolean, tool?: DrawingToolType, color?: string, strokeWidth?: number) => void
  setDrawingTool: (tool: DrawingToolType) => void
  setDrawingColor: (color: string) => void
  setDrawingStrokeWidth: (width: number) => void
  addAnnotation: (annotation: Annotation) => void
  updateAnnotation: (id: string, patch: Partial<Annotation>) => void
  removeAnnotation: (id: string) => void
  clearAnnotations: () => void
  setSelectedAnnotation: (id: string | null) => void
  setAnnotations: (annotations: Annotation[]) => void
  setSelectedEffectsForAnnotation: (ids: string[]) => void
  toggleEffectSelectionForAnnotation: (id: string) => void
  openAnnotationModal: () => void
  closeAnnotationModal: () => void
}

export const useEditorStore = create<EditorStore>()(
  temporal(
    immer((set, get) => ({
      // ─── State ───
      ...initialHistoricalState,
      ...initialNonHistoricalState,
      ...initialUIState,

      // ─── Effect Actions ───
      addVideoEffect: (effect) => set((s) => { s.effects.push(effect) }),
      addAudioEffect: (effect) => set((s) => { s.effects.push(effect) }),
      addImageEffect: (effect) => set((s) => { s.effects.push(effect) }),
      addTextEffect: (effect) => set((s) => { s.effects.push(effect) }),

      removeEffect: (id) =>
        set((s) => {
          s.effects = s.effects.filter((e) => e.id !== id)
          s.filters = s.filters.filter((f) => f.targetEffectId !== id)
          s.animations = s.animations.filter((a) => a.targetEffect.id !== id)
          s.transitions = s.transitions.filter(
            (t) => t.incoming.id !== id && t.outgoing.id !== id
          )
        }),

      removeAllEffects: () =>
        set((s) => {
          s.effects = []
          s.filters = []
          s.animations = []
          s.transitions = []
        }),

      setEffects: (effects) => set((s) => { s.effects = effects }),

      setEffectTrack: (effectId, track) =>
        set((s) => {
          const e = s.effects.find((e) => e.id === effectId)
          if (e) e.track = track
        }),

      setEffectDuration: (effectId, duration) =>
        set((s) => {
          const e = s.effects.find((e) => e.id === effectId)
          if (e) {
            e.duration = duration
            e.end = e.start + duration
          }
        }),

      setEffectStartPosition: (effectId, x) =>
        set((s) => {
          const e = s.effects.find((e) => e.id === effectId)
          if (e) e.start_at_position = x
        }),

      setEffectStart: (effectId, start) =>
        set((s) => {
          const e = s.effects.find((e) => e.id === effectId)
          if (e) e.start = start
        }),

      setEffectEnd: (effectId, end) =>
        set((s) => {
          const e = s.effects.find((e) => e.id === effectId)
          if (e) e.end = end
        }),

      setEffectRect: (effectId, rect) =>
        set((s) => {
          const e = s.effects.find((e) => e.id === effectId) as VisualEffect | undefined
          if (e) e.rect = rect
        }),

      setEffectScale: (effectId, scale) =>
        set((s) => {
          const e = s.effects.find((e) => e.id === effectId) as VisualEffect | undefined
          if (e) {
            e.rect.scaleX = scale.x
            e.rect.scaleY = scale.y
          }
        }),

      setPositionOnCanvas: (effectId, x, y) =>
        set((s) => {
          const e = s.effects.find((e) => e.id === effectId) as VisualEffect | undefined
          if (e) e.rect.position_on_canvas = { x, y }
        }),

      setRotation: (effectId, rotation) =>
        set((s) => {
          const e = s.effects.find((e) => e.id === effectId) as VisualEffect | undefined
          if (e) e.rect.rotation = rotation
        }),

      setPivot: (effectId, x, y) =>
        set((s) => {
          const e = s.effects.find((e) => e.id === effectId) as VisualEffect | undefined
          if (e) e.rect.pivot = { x, y }
        }),

      setEffectWidth: (effectId, width) =>
        set((s) => {
          const e = s.effects.find((e) => e.id === effectId) as VisualEffect | undefined
          if (e) e.rect.width = width
        }),

      setEffectHeight: (effectId, height) =>
        set((s) => {
          const e = s.effects.find((e) => e.id === effectId) as VisualEffect | undefined
          if (e) e.rect.height = height
        }),

      splitEffect: (effectId, splitAtTimecode) => {
        const state = get()
        const effect = state.effects.find((e) => e.id === effectId)
        if (!effect) return

        const splitPoint = splitAtTimecode - effect.start_at_position
        if (splitPoint <= 0 || splitPoint >= effect.end - effect.start) return

        set((s) => {
          const eff = s.effects.find((e) => e.id === effectId)!
          const originalEnd = eff.end

          eff.end = eff.start + splitPoint
          eff.duration = splitPoint

          const newEffect = JSON.parse(JSON.stringify(eff)) as AnyEffect
          newEffect.id = generateId()
          newEffect.start_at_position = eff.start_at_position + splitPoint
          newEffect.start = eff.start + splitPoint
          newEffect.end = originalEnd
          newEffect.duration = originalEnd - (eff.start + splitPoint)
          s.effects.push(newEffect)
        })
      },

      // ─── Track Actions ───
      addTrack: () =>
        set((s) => {
          s.tracks.push({ id: generateId(), muted: false, locked: false, visible: true })
        }),

      removeTrack: (id) =>
        set((s) => { s.tracks = s.tracks.filter((t) => t.id !== id) }),

      removeTracks: () =>
        set((s) => {
          s.tracks = [{ id: generateId(), muted: false, locked: false, visible: true }]
        }),

      toggleTrackMuted: (trackId) =>
        set((s) => {
          const t = s.tracks.find((t) => t.id === trackId)
          if (t) t.muted = !t.muted
        }),

      toggleTrackVisibility: (trackId) =>
        set((s) => {
          const t = s.tracks.find((t) => t.id === trackId)
          if (t) t.visible = !t.visible
        }),

      toggleTrackLocked: (trackId) =>
        set((s) => {
          const t = s.tracks.find((t) => t.id === trackId)
          if (t) t.locked = !t.locked
        }),

      // ─── Playback Actions ───
      setTimecode: (timecode) => set((s) => { s.timecode = timecode }, false),
      increaseTimecode: (byMs) => set((s) => { s.timecode += byMs }, false),
      setIsPlaying: (isPlaying) => set((s) => { s.is_playing = isPlaying }, false),
      toggleIsPlaying: () => set((s) => { s.is_playing = !s.is_playing }, false),
      zoomIn: () => set((s) => { s.zoom += 0.1 }, false),
      zoomOut: () => set((s) => { s.zoom -= 0.1 }, false),
      setZoom: (zoom) => set((s) => { s.zoom = zoom }, false),
      setFps: (fps) => set((s) => { s.fps = fps }, false),
      setTimebase: (timebase) => set((s) => { s.timebase = timebase }, false),
      setSelectedEffect: (effect) => set((s) => { s.selected_effect = effect }, false),
      setIsExporting: (isExporting) => set((s) => { s.is_exporting = isExporting }, false),
      setExportProgress: (progress) => set((s) => { s.export_progress = progress }, false),
      setExportStatus: (status) => set((s) => { s.export_status = status }, false),
      setLog: (log) => set((s) => { s.log = log }, false),
      setProjectResolution: (width, height) =>
        set((s) => { s.settings.width = width; s.settings.height = height }, false),
      setStandard: (standard) => set((s) => { s.settings.standard = standard }, false),
      setAspectRatio: (aspectRatio) => set((s) => { s.settings.aspectRatio = aspectRatio }, false),
      setBitrate: (value) => set((s) => { s.settings.bitrate = value }, false),

      // ─── Text Actions ───
      setTextContent: (id, content) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.text = content }),
      setTextFont: (id, font) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.fontFamily = font }),
      setFontSize: (id, size) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.fontSize = size }),
      setFontStyle: (id, style) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.fontStyle = style }),
      setFontAlign: (id, align) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.align = align }),
      setFontVariant: (id, variant) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.fontVariant = variant }),
      setFontWeight: (id, weight) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.fontWeight = weight }),
      setTextFill: (id, color, index) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.fill[index] = color }),
      addTextFill: (id) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.fill.push("#FFFFFF") }),
      removeTextFill: (id, index) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.fill = e.fill.filter((_, i) => i !== index) }),
      moveTextFillUp: (id, index) =>
        set((s) => {
          const e = s.effects.find((e) => e.id === id) as TextEffect | undefined
          if (e && index > 0) [e.fill[index - 1], e.fill[index]] = [e.fill[index], e.fill[index - 1]]
        }),
      moveTextFillDown: (id, index) =>
        set((s) => {
          const e = s.effects.find((e) => e.id === id) as TextEffect | undefined
          if (e && index < e.fill.length - 1) [e.fill[index], e.fill[index + 1]] = [e.fill[index + 1], e.fill[index]]
        }),
      setFillGradientType: (id, type) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.fillGradientType = type }),
      addFillGradientStop: (id) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.fillGradientStops.push(0) }),
      removeFillGradientStop: (id, index) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.fillGradientStops = e.fillGradientStops.filter((_, i) => i !== index) }),
      setFillGradientStop: (id, index, value) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.fillGradientStops[index] = value }),
      setTextRect: (id, rect) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.rect = rect }),
      setStrokeColor: (id, value) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.stroke = value }),
      setStrokeThickness: (id, value) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.strokeThickness = value }),
      setStrokeLineJoin: (id, value) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.lineJoin = value }),
      setStrokeMiterLimit: (id, value) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.miterLimit = value }),
      setLetterSpacing: (id, value) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.letterSpacing = value }),
      setTextBaseline: (id, value) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.textBaseline = value }),
      toggleDropShadow: (id, value) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.dropShadow = value }),
      setDropShadowAlpha: (id, value) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.dropShadowAlpha = value }),
      setDropShadowAngle: (id, value) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.dropShadowAngle = value }),
      setDropShadowBlur: (id, value) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.dropShadowBlur = value }),
      setDropShadowDistance: (id, value) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.dropShadowDistance = value }),
      setDropShadowColor: (id, value) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.dropShadowColor = value }),
      setWordWrap: (id, value) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.wordWrap = value }),
      setBreakWords: (id, value) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.breakWords = value }),
      setWrapWidth: (id, value) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.wordWrapWidth = value }),
      setLeading: (id, value) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.leading = value }),
      setLineHeight: (id, value) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.lineHeight = value }),
      setWhiteSpace: (id, value) =>
        set((s) => { const e = s.effects.find((e) => e.id === id) as TextEffect | undefined; if (e) e.whiteSpace = value }),

      // ─── Filter Actions ───
      addFilter: (filter) => set((s) => { s.filters.push(filter) }),
      removeFilter: (effectId, type) =>
        set((s) => {
          s.filters = s.filters.filter((f) => !(f.targetEffectId === effectId && f.type === type))
        }),

      // ─── Animation Actions ───
      addAnimation: (animation) => set((s) => { s.animations.push(animation) }),
      removeAnimation: (effectId, type, animationFor) =>
        set((s) => {
          s.animations = s.animations.filter(
            (a) => !(a.targetEffect.id === effectId && a.type === type && a.for === animationFor)
          )
        }),
      setAnimations: (animations) => set((s) => { s.animations = animations }),
      setAnimationDuration: (effectId, duration) =>
        set((s) => {
          const a = s.animations.find((a) => a.targetEffect.id === effectId)
          if (a) a.duration = duration
        }),
      clearAnimations: () => set((s) => { s.animations = [] }),

      // ─── Transition Actions ───
      addTransition: (transition) => set((s) => { s.transitions.push(transition) }),
      removeTransition: (id) =>
        set((s) => { s.transitions = s.transitions.filter((t) => t.id !== id) }),
      setTransitionDuration: (transitionId, duration) =>
        set((s) => {
          const t = s.transitions.find((t) => t.id === transitionId)
          if (t) t.duration = duration
        }),
      clearTransitions: () => set((s) => { s.transitions = [] }),

      // ─── Project Actions ───
      setProjectName: (name) => set((s) => { s.projectName = name }),
      setProjectId: (id) => set((s) => { s.projectId = id }),

      // ─── UI Actions ───
      setLeftPanelTab: (tab) => set((s) => { s.leftPanelTab = tab }, false),
      setRightPanelTab: (tab) => set((s) => { s.rightPanelTab = tab }, false),
      setInspectorSubTab: (tab) => set((s) => { s.inspectorSubTab = tab }, false),
      setIsExportModalOpen: (open) => set((s) => { s.isExportModalOpen = open }, false),
      resetProject: () =>
        set((s) => {
          Object.assign(s, initialHistoricalState)
          Object.assign(s, initialNonHistoricalState)
        }),

      // ─── Annotation Actions ───
      setDrawingMode: (enabled, tool, color, strokeWidth) =>
        set((s) => {
          s.drawing_mode.enabled = enabled
          if (tool !== undefined) s.drawing_mode.tool = tool
          if (color !== undefined) s.drawing_mode.color = color
          if (strokeWidth !== undefined) s.drawing_mode.strokeWidth = strokeWidth
        }, false),

      setDrawingTool: (tool) =>
        set((s) => { s.drawing_mode.tool = tool }, false),

      setDrawingColor: (color) =>
        set((s) => { s.drawing_mode.color = color }, false),

      setDrawingStrokeWidth: (width) =>
        set((s) => { s.drawing_mode.strokeWidth = width }, false),

      addAnnotation: (annotation) =>
        set((s) => { s.annotations.push(annotation) }, false),

      updateAnnotation: (id, patch) =>
        set((s) => {
          const annotation = s.annotations.find(a => a.id === id)
          if (annotation) {
            Object.assign(annotation, patch)
          }
        }, false),

      removeAnnotation: (id) =>
        set((s) => {
          s.annotations = s.annotations.filter(a => a.id !== id)
        }, false),

      clearAnnotations: () =>
        set((s) => { s.annotations = [] }, false),

      setSelectedAnnotation: (id) =>
        set((s) => { s.selected_annotation_id = id }, false),

      setAnnotations: (annotations) =>
        set((s) => { s.annotations = annotations }, false),

      setSelectedEffectsForAnnotation: (ids) =>
        set((s) => { s.selected_effects_for_annotation = ids }, false),

      toggleEffectSelectionForAnnotation: (id) =>
        set((s) => {
          const index = s.selected_effects_for_annotation.indexOf(id)
          if (index >= 0) {
            s.selected_effects_for_annotation.splice(index, 1)
          } else {
            s.selected_effects_for_annotation.push(id)
          }
        }, false),

      openAnnotationModal: () =>
        set((s) => { s.annotation_modal_open = true }, false),

      closeAnnotationModal: () =>
        set((s) => {
          s.annotation_modal_open = false
          s.selected_effects_for_annotation = []
        }, false),
    })),
    {
      limit: 64,
      equality: (pastState, currentState) =>
        pastState.effects === currentState.effects &&
        pastState.tracks === currentState.tracks &&
        pastState.filters === currentState.filters &&
        pastState.animations === currentState.animations &&
        pastState.transitions === currentState.transitions &&
        pastState.projectName === currentState.projectName,
    }
  )
)
