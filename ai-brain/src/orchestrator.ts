/**
 * Orchestrator
 * Main coordinator for AI edit requests
 */

import { v4 as uuidv4 } from 'uuid'
import { AnnotationSerializer } from './serializer.js'
import { ClaudeClient } from './claude.js'
import { MCPClient } from './mcp-client.js'
import { HistoryManager } from './history.js'
import {
	AIEditRequest,
	AIEditResponse,
	Change,
	MCPCall,
	MCPResult,
} from './types.js'

export class Orchestrator {
	private serializer: AnnotationSerializer
	private claude: ClaudeClient
	private mcpClient: MCPClient
	private history: HistoryManager

	constructor(anthropicApiKey: string) {
		this.serializer = new AnnotationSerializer()
		this.claude = new ClaudeClient(anthropicApiKey)
		this.mcpClient = new MCPClient()
		this.history = new HistoryManager()
	}

	/**
	 * Process an AI edit request
	 */
	async processEdit(request: AIEditRequest): Promise<AIEditResponse> {
		const sessionId = request.sessionId || uuidv4()

		console.log('[Orchestrator] Processing edit request...')
		console.log('[Orchestrator] Session ID:', sessionId)
		console.log('[Orchestrator] Annotations:', request.annotations.length)
		console.log('[Orchestrator] Prompt:', request.prompt)

		try {
			// 1. Serialize annotations
			const annotationContext = this.serializer.serialize(
				request.annotations,
				request.timelineState
			)

			// 2. Summarize timeline
			const timelineSummary = this.serializer.summarizeTimeline(
				request.timelineState
			)

			// 3. Get conversation history
			const conversationHistory = this.history.getConversation(sessionId)

			// 4. Add user message to history
			this.history.addMessage(sessionId, {
				role: 'user',
				content: request.prompt,
				timestamp: Date.now(),
			})

			// 5. Call Claude
			let mcpCalls: MCPCall[]
			try {
				mcpCalls = await this.claude.processEdit(
					annotationContext,
					request.prompt,
					timelineSummary,
					conversationHistory
				)
			} catch (error) {
				console.error('[Orchestrator] Claude error:', error)
				return {
					success: false,
					changes: [],
					sessionId,
					error: `AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
				}
			}

			if (mcpCalls.length === 0) {
				console.log('[Orchestrator] No tool calls generated')
				return {
					success: false,
					changes: [],
					sessionId,
					error: 'No editing operations were identified from your request.',
				}
			}

			// 6. Validate MCP calls
			for (const call of mcpCalls) {
				const validation = this.mcpClient.validateCall(call)
				if (!validation.valid) {
					console.error('[Orchestrator] Invalid MCP call:', validation.error)
					return {
						success: false,
						changes: [],
						sessionId,
						error: `Invalid operation: ${validation.error}`,
					}
				}
			}

			// 7. Execute MCP calls
			let results: MCPResult[]
			try {
				results = await this.mcpClient.executeMany(mcpCalls)
			} catch (error) {
				console.error('[Orchestrator] MCP execution error:', error)

				// Retry once
				console.log('[Orchestrator] Retrying with error context...')
				try {
					const retriedCalls = await this.claude.retryWithError(
						request.prompt,
						error instanceof Error ? error.message : 'Unknown error',
						mcpCalls
					)
					results = await this.mcpClient.executeMany(retriedCalls)
					mcpCalls = retriedCalls
				} catch (retryError) {
					console.error('[Orchestrator] Retry failed:', retryError)
					return {
						success: false,
						changes: [],
						sessionId,
						error: `Execution failed: ${retryError instanceof Error ? retryError.message : 'Unknown error'}`,
					}
				}
			}

			// 8. Build changes response
			const changes: Change[] = mcpCalls.map((call, index) => ({
				type: call.tool,
				description: this.describeChange(call, results[index]),
				mcpCall: call,
			}))

			// 9. Add to edit history
			this.history.addEdit(sessionId, {
				timestamp: Date.now(),
				annotations: request.annotations,
				prompt: request.prompt,
				changes,
			})

			// 10. Add assistant response to conversation
			this.history.addMessage(sessionId, {
				role: 'assistant',
				content: changes.map((c) => c.description).join('\n'),
				timestamp: Date.now(),
			})

			console.log('[Orchestrator] Edit completed successfully')
			console.log('[Orchestrator] Changes:', changes.length)

			return {
				success: true,
				changes,
				sessionId,
			}
		} catch (error) {
			console.error('[Orchestrator] Unexpected error:', error)
			return {
				success: false,
				changes: [],
				sessionId,
				error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
			}
		}
	}

	/**
	 * Describe a change in human-readable format
	 */
	private describeChange(call: MCPCall, result: MCPResult): string {
		if (!result.success) {
			return `Failed to ${call.tool}: ${result.error}`
		}

		switch (call.tool) {
			case 'add_transition':
				return `Added ${call.params.transitionType} transition (${call.params.duration}ms${call.params.direction ? `, ${call.params.direction}` : ''})`

			case 'modify_effect':
				return `Modified clip properties`

			case 'add_filter':
				return `Applied ${call.params.filterType} filter (${call.params.intensity}% intensity)`

			case 'add_animation':
				return `Added ${call.params.animationType} animation (${call.params.duration}ms)`

			case 'split_clip':
				return `Split clip at ${call.params.timestamp}ms`

			case 'move_effect':
				return `Moved clip to track ${call.params.track}${call.params.start_at_position ? ` at ${call.params.start_at_position}ms` : ''}`

			case 'remove_effect':
				return `Removed clip`

			case 'adjust_duration':
				return `Adjusted duration to ${call.params.newDuration}ms`

			default:
				return `Executed ${call.tool}`
		}
	}

	/**
	 * Get session history
	 */
	getHistory(sessionId: string) {
		return this.history.getSession(sessionId)
	}

	/**
	 * Clear session
	 */
	clearSession(sessionId: string) {
		this.history.clearSession(sessionId)
	}
}
