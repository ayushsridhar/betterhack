/**
 * AI Brain Service - Integrates with the AI Brain API
 *
 * Sends annotations + prompt to the AI Brain, receives MCP calls,
 * and executes them via the MCP executor.
 */

import type { Annotation } from '../types'
import type { EditorStore } from '../store'
import { executeMCPCalls, type MCPCall, type MCPResult } from './mcp-executor'

const AI_BRAIN_URL = 'http://localhost:3001/api/ai-edit'

export interface AIEditRequest {
  annotations: Annotation[]
  prompt: string
  timelineState: {
    effects: any[]
    tracks: any[]
    transitions: any[]
    filters: any[]
    animations: any[]
    settings: {
      width: number
      height: number
      bitrate: number
      aspectRatio: string
      standard: string
    }
  }
  sessionId?: string
}

export interface Change {
  type: string
  description: string
  mcpCall: MCPCall
}

export interface AIEditResponse {
  success: boolean
  changes: Change[]
  sessionId: string
  error?: string
}

export interface AIEditResult {
  success: boolean
  changes: Change[]
  results: MCPResult[]
  sessionId: string
  error?: string
}

/**
 * Send annotations and prompt to AI Brain, execute returned MCP calls
 */
export async function executeAIEdit(
  annotations: Annotation[],
  prompt: string,
  store: EditorStore,
  sessionId?: string
): Promise<AIEditResult> {
  try {
    // Build the timeline state from the store
    // Sort effects by timeline order (start position) so AI can understand "first", "second", "third" clip
    const sortedEffects = [...store.effects].sort((a, b) => {
      if (a.track !== b.track) return a.track - b.track
      return a.start_at_position - b.start_at_position
    })

    const timelineState = {
      effects: sortedEffects,
      tracks: store.tracks,
      transitions: store.transitions,
      filters: store.filters,
      animations: store.animations,
      settings: {
        width: store.settings.width,
        height: store.settings.height,
        bitrate: store.settings.bitrate,
        aspectRatio: store.settings.aspectRatio,
        standard: store.settings.standard,
      },
    }

    // Send request to AI Brain
    const request: AIEditRequest = {
      annotations,
      prompt,
      timelineState,
      sessionId,
    }

    const response = await fetch(AI_BRAIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data: AIEditResponse = await response.json()

    if (!data.success) {
      return {
        success: false,
        changes: [],
        results: [],
        sessionId: data.sessionId || sessionId || '',
        error: data.error || 'AI Brain returned unsuccessful response',
      }
    }

    // Extract MCP calls from the changes
    const mcpCalls = data.changes.map(change => change.mcpCall)

    // Execute the MCP calls via the store
    const results = executeMCPCalls(mcpCalls, store, false)

    // Check if all calls succeeded
    const allSucceeded = results.every(r => r.success)

    return {
      success: allSucceeded,
      changes: data.changes,
      results,
      sessionId: data.sessionId,
      error: allSucceeded ? undefined : 'Some MCP calls failed to execute',
    }
  } catch (error: any) {
    console.error('[AI Brain] Error:', error)
    return {
      success: false,
      changes: [],
      results: [],
      sessionId: sessionId || '',
      error: error.message || 'Failed to connect to AI Brain',
    }
  }
}

/**
 * Check if the AI Brain server is running
 */
export async function checkAIBrainHealth(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3001/health', {
      method: 'GET',
    })
    return response.ok
  } catch (error) {
    return false
  }
}
