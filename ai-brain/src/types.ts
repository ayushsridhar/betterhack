/**
 * Types for AI Brain integration
 */

// ============================================================================
// Annotation Types (from Member 1)
// ============================================================================

export type AnnotationType = 'arrow' | 'rectangle' | 'circle' | 'freehand'

export interface Annotation {
	type: AnnotationType
	coordinates: {
		start: { x: number; y: number }
		end: { x: number; y: number }
	}
	affectedEffects: string[] // IDs of clips this annotation overlaps
	color?: string
	drawnAtTimecode?: number
}

// ============================================================================
// Timeline State Types (from Picasso)
// ============================================================================

export interface EffectRect {
	width: number
	height: number
	scaleX: number
	scaleY: number
	position_on_canvas: { x: number; y: number }
	rotation: number
	pivot: { x: number; y: number }
}

export interface Effect {
	id: string
	start_at_position: number
	duration: number
	start: number
	end: number
	track: number
}

export interface VideoEffect extends Effect {
	kind: 'video'
	thumbnail: string
	raw_duration: number
	frames: number
	rect: EffectRect
	file_hash: string
	name: string
}

export interface AudioEffect extends Effect {
	kind: 'audio'
	raw_duration: number
	file_hash: string
	name: string
}

export interface ImageEffect extends Effect {
	kind: 'image'
	rect: EffectRect
	file_hash: string
	name: string
}

export interface TextEffect extends Effect {
	kind: 'text'
	text: string
	fontSize: number
	rect: EffectRect
	[key: string]: any // other text properties
}

export type AnyEffect = VideoEffect | AudioEffect | TextEffect | ImageEffect

export interface Track {
	id: string
	locked: boolean
	visible: boolean
	muted: boolean
}

export interface Transition {
	id: string
	effectAId: string
	effectBId: string
	type: string
	duration: number
	direction?: string
}

export interface Filter {
	id: string
	effectId: string
	type: string
	params: Record<string, any>
}

export interface Animation {
	id: string
	effectId: string
	type: string
	params: Record<string, any>
}

export interface Settings {
	width: number
	height: number
	bitrate: number
	aspectRatio: string
	standard: string
}

export interface TimelineState {
	effects: AnyEffect[]
	tracks: Track[]
	transitions: Transition[]
	filters: Filter[]
	animations: Animation[]
	settings: Settings
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface AIEditRequest {
	annotations: Annotation[]
	prompt: string
	timelineState: TimelineState
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

// ============================================================================
// MCP Tool Types
// ============================================================================

export type MCPToolName =
	| 'add_transition'
	| 'modify_effect'
	| 'add_filter'
	| 'add_animation'
	| 'split_clip'
	| 'move_effect'
	| 'remove_effect'
	| 'adjust_duration'

export interface MCPCall {
	tool: MCPToolName
	params: Record<string, any>
}

export interface MCPResult {
	success: boolean
	data?: any
	error?: string
}

// ============================================================================
// History Types
// ============================================================================

export interface ConversationMessage {
	role: 'user' | 'assistant'
	content: string
	timestamp: number
}

export interface EditHistoryEntry {
	timestamp: number
	annotations: Annotation[]
	prompt: string
	changes: Change[]
}

export interface SessionHistory {
	sessionId: string
	conversation: ConversationMessage[]
	edits: EditHistoryEntry[]
	createdAt: number
	lastUpdated: number
}
