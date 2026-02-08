/**
 * MCP Executor - Executes MCP calls using Zustand store actions
 *
 * This executes MCP tool calls directly via the editor store,
 * bypassing the WebSocket bridge used by the MCP server.
 */

import type { EditorStore } from '../store'
import { generateId } from '../utils/id'

export interface MCPCall {
  tool: string
  params: Record<string, any>
}

export interface MCPResult {
  success: boolean
  data?: any
  error?: string
}

/**
 * Execute a single MCP call using the Zustand store
 */
export function executeMCPCall(call: MCPCall, store: EditorStore): MCPResult {
  try {
    const { tool, params } = call
    console.log('[MCP Executor] Executing:', tool, params)

    switch (tool) {
      // ── Transitions ──
      case 'add_transition': {
        // Support both parameter naming conventions (AI Brain vs MCP Server)
        const outgoing_effect_id = params.outgoing_effect_id || params.effectAId
        const incoming_effect_id = params.incoming_effect_id || params.effectBId
        let transition_name = params.transition_name || params.transitionType || 'fade'
        const direction = params.direction
        const duration = params.duration || 1000

        // Normalize transition names: handle "slide" + direction, convert spaces to hyphens
        if (transition_name === 'slide' && direction) {
          transition_name = `slide-${direction}` // slide-left, slide-right, slide-up, slide-down
        } else if (transition_name === 'wipe' && direction) {
          transition_name = `wipe-${direction}`
        }
        // Convert spaces to hyphens (e.g., "slide up" → "slide-up")
        transition_name = transition_name.replace(/\s+/g, '-').toLowerCase()

        // Validate effects exist and are adjacent
        const effectA = store.effects.find(e => e.id === outgoing_effect_id)
        const effectB = store.effects.find(e => e.id === incoming_effect_id)

        console.log('[MCP Executor] Found effects:', {
          effectA: effectA ? `${effectA.kind} at ${effectA.start_at_position}ms (${effectA.duration}ms)` : 'NOT FOUND',
          effectB: effectB ? `${effectB.kind} at ${effectB.start_at_position}ms (${effectB.duration}ms)` : 'NOT FOUND',
        })

        if (!effectA || !effectB) {
          const error = `Effects not found: ${outgoing_effect_id}, ${incoming_effect_id}`
          console.error('[MCP Executor]', error)
          return { success: false, error }
        }

        if (effectA.kind !== 'video' && effectA.kind !== 'image') {
          const error = 'Outgoing effect must be video or image'
          console.error('[MCP Executor]', error)
          return { success: false, error }
        }

        if (effectB.kind !== 'video' && effectB.kind !== 'image') {
          const error = 'Incoming effect must be video or image'
          console.error('[MCP Executor]', error)
          return { success: false, error }
        }

        if (effectA.track !== effectB.track) {
          const error = `Effects must be on the same track for transitions (A:${effectA.track}, B:${effectB.track})`
          console.error('[MCP Executor]', error)
          return { success: false, error }
        }

        // Check if effects are adjacent
        const effectAEnd = effectA.start_at_position + effectA.duration
        const effectBStart = effectB.start_at_position
        if (effectAEnd !== effectBStart) {
          const error = `Effects must be adjacent (touching) for transitions. A ends at ${effectAEnd}ms, B starts at ${effectBStart}ms (gap: ${effectBStart - effectAEnd}ms)`
          console.error('[MCP Executor]', error)
          return { success: false, error }
        }

        const transition = {
          id: generateId(),
          outgoing: effectA as any,
          incoming: effectB as any,
          transition: {
            name: transition_name,
            glsl: '', // Will be loaded by the transition manager
          },
          duration,
        }

        store.addTransition(transition)

        return { success: true, data: { transition_id: transition.id } }
      }

      case 'remove_transition': {
        const { transition_id } = params
        store.removeTransition(transition_id)
        return { success: true }
      }

      case 'set_transition_duration': {
        const { transition_id, duration } = params
        store.setTransitionDuration(transition_id, duration)
        return { success: true }
      }

      // ── Animations ──
      case 'add_animation': {
        const { effect_id, animation_name, duration = 500 } = params

        const effect = store.effects.find(e => e.id === effect_id)
        if (!effect) {
          return { success: false, error: 'Effect not found' }
        }

        if (effect.kind !== 'video' && effect.kind !== 'image') {
          return { success: false, error: 'Animations can only be applied to video and image effects' }
        }

        // Determine if it's an "in" or "out" animation
        const isIn = animation_name.endsWith('-in')

        const animation = {
          targetEffect: effect as any,
          name: animation_name as any,
          type: isIn ? 'in' as const : 'out' as const,
          duration,
          for: 'Animation' as const,
        }

        store.addAnimation(animation)

        return { success: true }
      }

      case 'remove_animation': {
        const { effect_id, type } = params
        store.removeAnimation(effect_id, type, 'Animation')
        return { success: true }
      }

      case 'set_animation_duration': {
        const { effect_id, duration } = params
        store.setAnimationDuration(effect_id, duration)
        return { success: true }
      }

      // ── Filters ──
      case 'add_filter': {
        const { effect_id, filter_type } = params

        const effect = store.effects.find(e => e.id === effect_id)
        if (!effect) {
          return { success: false, error: 'Effect not found' }
        }

        if (effect.kind !== 'video' && effect.kind !== 'image') {
          return { success: false, error: 'Filters can only be applied to video and image effects' }
        }

        const filter = {
          targetEffectId: effect_id,
          type: filter_type as any,
        }

        store.addFilter(filter)

        return { success: true }
      }

      case 'remove_filter': {
        const { effect_id, filter_type } = params
        store.removeFilter(effect_id, filter_type)
        return { success: true }
      }

      // ── Effect CRUD ──
      case 'remove_effect': {
        const { effect_id } = params
        store.removeEffect(effect_id)
        return { success: true }
      }

      case 'remove_all_effects': {
        store.removeAllEffects()
        return { success: true }
      }

      // ── Effect Positioning ──
      case 'set_effect_timing': {
        const { effect_id, start_at_position, duration, start, end, track } = params

        if (start_at_position !== undefined) {
          store.setEffectStartPosition(effect_id, start_at_position)
        }
        if (duration !== undefined) {
          store.setEffectDuration(effect_id, duration)
        }
        if (start !== undefined) {
          store.setEffectStart(effect_id, start)
        }
        if (end !== undefined) {
          store.setEffectEnd(effect_id, end)
        }
        if (track !== undefined) {
          store.setEffectTrack(effect_id, track)
        }

        return { success: true }
      }

      case 'set_effect_position_on_canvas': {
        const { effect_id, x, y } = params
        store.setPositionOnCanvas(effect_id, x, y)
        return { success: true }
      }

      case 'rotate_effect': {
        const { effect_id, rotation } = params
        store.setRotation(effect_id, rotation)
        return { success: true }
      }

      case 'scale_effect': {
        const { effect_id, scaleX, scaleY } = params
        store.setEffectScale(effect_id, { x: scaleX, y: scaleY })
        return { success: true }
      }

      case 'resize_effect': {
        const { effect_id, width, height } = params
        if (width !== undefined) {
          store.setEffectWidth(effect_id, width)
        }
        if (height !== undefined) {
          store.setEffectHeight(effect_id, height)
        }
        return { success: true }
      }

      // ── Text Effects ──
      case 'add_text_effect': {
        const {
          text,
          start_at_position,
          duration = 5000,
          track,
          fontSize = 38,
          fontFamily = 'Arial',
          fontWeight = 'normal',
          fontStyle = 'normal',
          align = 'center',
          fill = ['#FFFFFF'],
          position,
          rotation = 0,
          scale = { x: 1, y: 1 }
        } = params

        const textEffect = {
          id: generateId(),
          kind: 'text' as const,
          text,
          fontSize,
          fontFamily,
          fontWeight: fontWeight as any,
          fontStyle: fontStyle as any,
          fontVariant: 'normal' as any,
          align: align as any,
          fill: fill as any,
          fillGradientType: 0,
          fillGradientStops: [0],
          stroke: 'transparent',
          strokeThickness: 0,
          lineJoin: 'miter' as any,
          miterLimit: 10,
          letterSpacing: 0,
          textBaseline: 'alphabetic' as any,
          dropShadow: false,
          dropShadowAlpha: 1,
          dropShadowAngle: Math.PI / 6,
          dropShadowBlur: 0,
          dropShadowDistance: 0,
          dropShadowColor: '#000000',
          wordWrap: false,
          wordWrapWidth: 0,
          lineHeight: 0,
          leading: 0,
          breakWords: false,
          whiteSpace: 'pre' as any,
          start_at_position: start_at_position ?? 0,
          duration,
          track: track ?? 0,
          start: 0,
          end: duration,
          rect: {
            width: 400,
            height: 100,
            scaleX: scale.x,
            scaleY: scale.y,
            position_on_canvas: position ?? { x: store.settings.width / 2, y: store.settings.height / 2 },
            rotation,
            pivot: { x: 0, y: 0 }
          }
        }

        store.addTextEffect(textEffect)

        return { success: true, data: { effect_id: textEffect.id } }
      }

      case 'set_text_properties': {
        const { effect_id, text, fontSize, fontFamily, fontWeight, fontStyle, align, fill } = params

        if (text !== undefined) store.setTextContent(effect_id, text)
        if (fontSize !== undefined) store.setFontSize(effect_id, fontSize)
        if (fontFamily !== undefined) store.setTextFont(effect_id, fontFamily)
        if (fontWeight !== undefined) store.setFontWeight(effect_id, fontWeight)
        if (fontStyle !== undefined) store.setFontStyle(effect_id, fontStyle)
        if (align !== undefined) store.setFontAlign(effect_id, align)
        if (fill !== undefined && Array.isArray(fill) && fill.length > 0) {
          store.setTextFill(effect_id, fill[0], 0)
        }

        return { success: true }
      }

      // ── Track Management ──
      case 'add_track': {
        store.addTrack()
        return { success: true }
      }

      case 'remove_track': {
        const { track_id } = params
        store.removeTrack(track_id)
        return { success: true }
      }

      case 'toggle_track_muted': {
        const { track_id } = params
        store.toggleTrackMuted(track_id)
        return { success: true }
      }

      case 'toggle_track_visibility': {
        const { track_id } = params
        store.toggleTrackVisibility(track_id)
        return { success: true }
      }

      case 'toggle_track_locked': {
        const { track_id } = params
        store.toggleTrackLocked(track_id)
        return { success: true }
      }

      // ── Playback ──
      case 'set_playhead': {
        const { timecode } = params
        store.setTimecode(timecode)
        return { success: true }
      }

      case 'play': {
        if (!store.is_playing) {
          store.toggleIsPlaying()
        }
        return { success: true }
      }

      case 'pause': {
        if (store.is_playing) {
          store.toggleIsPlaying()
        }
        return { success: true }
      }

      // ── Project Settings ──
      case 'set_project_name': {
        const { name } = params
        store.setProjectName(name)
        return { success: true }
      }

      case 'set_project_resolution': {
        const { width, height } = params
        store.setProjectResolution(width, height)
        return { success: true }
      }

      case 'set_project_standard': {
        const { standard } = params
        store.setStandard(standard)
        return { success: true }
      }

      case 'set_project_aspect_ratio': {
        const { aspect_ratio } = params
        store.setAspectRatio(aspect_ratio)
        return { success: true }
      }

      default:
        return {
          success: false,
          error: `Unsupported MCP tool: ${tool}`
        }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error executing MCP call'
    }
  }
}

/**
 * Execute multiple MCP calls in sequence
 * Stops at first failure unless continueOnError is true
 */
export function executeMCPCalls(
  calls: MCPCall[],
  store: EditorStore,
  continueOnError = false
): MCPResult[] {
  const results: MCPResult[] = []

  for (const call of calls) {
    const result = executeMCPCall(call, store)
    results.push(result)

    if (!result.success && !continueOnError) {
      break
    }
  }

  return results
}
