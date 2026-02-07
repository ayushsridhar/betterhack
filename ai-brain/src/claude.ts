/**
 * Claude API Integration
 * Handles communication with Claude and tool use
 */

import Anthropic from '@anthropic-ai/sdk'
import { mcpTools } from './tools.js'
import { MCPCall } from './types.js'

export class ClaudeClient {
	private client: Anthropic

	constructor(apiKey: string) {
		this.client = new Anthropic({
			apiKey,
		})
	}

	/**
	 * Process an AI edit request
	 */
	async processEdit(
		annotationContext: string,
		userPrompt: string,
		timelineSummary: string,
		conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
	): Promise<MCPCall[]> {
		const systemPrompt = this.buildSystemPrompt()
		const userMessage = this.buildUserMessage(
			annotationContext,
			userPrompt,
			timelineSummary
		)

		console.log('[Claude] Sending request...')

		// Only log sensitive data if DEBUG_CLAUDE is enabled
		if (process.env.DEBUG_CLAUDE === 'true') {
			console.log('[Claude] User prompt:', userPrompt)
			console.log('[Claude] Annotation context:', annotationContext)
		}

		try {
			const response = await this.client.messages.create({
				model: 'claude-sonnet-4-20250514',
				max_tokens: 4096,
				system: systemPrompt,
				messages: [
					...conversationHistory.map((msg) => ({
						role: msg.role as 'user' | 'assistant',
						content: msg.content,
					})),
					{
						role: 'user',
						content: userMessage,
					},
				],
				tools: mcpTools,
			})

			if (process.env.DEBUG_CLAUDE === 'true') {
				console.log('[Claude] Response received:', JSON.stringify(response, null, 2))
			}

			// Extract tool calls from response
			const mcpCalls = this.extractToolCalls(response)

			console.log('[Claude] Extracted MCP calls:', JSON.stringify(mcpCalls, null, 2))

			return mcpCalls
		} catch (error) {
			console.error('[Claude] Error:', error)
			throw error
		}
	}

	/**
	 * Retry a failed request with error context
	 */
	async retryWithError(
		originalPrompt: string,
		error: string,
		previousCalls: MCPCall[]
	): Promise<MCPCall[]> {
		const retryMessage = `The previous attempt failed with error: "${error}".

Previous tool calls that were attempted:
${JSON.stringify(previousCalls, null, 2)}

Please try a different approach or corrected parameters.`

		const response = await this.client.messages.create({
			model: 'claude-sonnet-4-20250514',
			max_tokens: 4096,
			system: this.buildSystemPrompt(),
			messages: [
				{
					role: 'user',
					content: originalPrompt,
				},
				{
					role: 'assistant',
					content: 'I attempted to process that request but encountered an error.',
				},
				{
					role: 'user',
					content: retryMessage,
				},
			],
			tools: mcpTools,
		})

		return this.extractToolCalls(response)
	}

	/**
	 * Build system prompt
	 */
	private buildSystemPrompt(): string {
		return `You are an AI assistant for a video editing application called Omniclip. Users can draw annotations directly on their video timeline preview and describe what edits they want in natural language.

Your job is to interpret their visual annotations (arrows, rectangles, circles, freehand drawings) combined with their text prompts, and determine which video editing operations to perform.

You have access to MCP (Model Context Protocol) tools that can manipulate the video timeline. You should call the appropriate tools based on the user's intent.

Key guidelines:
- Arrows typically indicate transitions or directional movement between clips
- Rectangles/circles typically indicate selection or focus on specific clips
- When no specific prompt is given for an arrow, default to a simple fade transition (500ms)
- **CRITICAL**: Use the exact effect IDs (like "clip-1", "abc123") for effectAId and effectBId parameters, NOT the clip names
- The annotation context will show: 'clip with ID "abc123" (name: "intro.mp4")' - always use the ID part
- For transitions, ensure both clips exist and are adjacent or near each other
- Consider the direction of arrows when choosing transition types
- Multiple tool calls may be needed for complex edits

Always explain what you're doing in a friendly, concise way.`
	}

	/**
	 * Build user message
	 */
	private buildUserMessage(
		annotationContext: string,
		userPrompt: string,
		timelineSummary: string
	): string {
		const promptSection = userPrompt
			? `USER REQUEST:\n${userPrompt}`
			: `USER REQUEST:\n(No specific prompt provided - use the default action for each annotation type: arrows = fade transition 500ms, rectangles/circles = select for modification)`

		return `${timelineSummary}

VISUAL ANNOTATIONS:
${annotationContext}

${promptSection}

Based on the annotations and request, what editing operations should be performed?`
	}

	/**
	 * Extract tool calls from Claude response
	 */
	private extractToolCalls(response: Anthropic.Message): MCPCall[] {
		const mcpCalls: MCPCall[] = []
		const allowedTools = new Set(mcpTools.map(t => t.name))

		for (const block of response.content) {
			if (block.type === 'tool_use') {
				// Validate tool name against allowed list to prevent hallucinated tools
				if (!allowedTools.has(block.name)) {
					console.warn(`[Claude] Ignoring unsupported tool: ${block.name}`)
					continue
				}

				mcpCalls.push({
					tool: block.name as any,
					params: block.input as Record<string, any>,
				})
			}
		}

		return mcpCalls
	}
}
