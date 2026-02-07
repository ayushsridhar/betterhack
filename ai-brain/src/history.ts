/**
 * History Manager
 * Tracks conversation history and edit history for follow-up prompts
 */

import { SessionHistory, ConversationMessage, EditHistoryEntry } from './types.js'

export class HistoryManager {
	private sessions: Map<string, SessionHistory> = new Map()

	/**
	 * Get or create a session
	 */
	getSession(sessionId: string): SessionHistory {
		if (!this.sessions.has(sessionId)) {
			this.sessions.set(sessionId, {
				sessionId,
				conversation: [],
				edits: [],
				createdAt: Date.now(),
				lastUpdated: Date.now(),
			})
		}

		return this.sessions.get(sessionId)!
	}

	/**
	 * Add a conversation message
	 */
	addMessage(sessionId: string, message: ConversationMessage): void {
		const session = this.getSession(sessionId)
		session.conversation.push(message)
		session.lastUpdated = Date.now()
	}

	/**
	 * Add an edit to history
	 */
	addEdit(sessionId: string, edit: EditHistoryEntry): void {
		const session = this.getSession(sessionId)
		session.edits.push(edit)
		session.lastUpdated = Date.now()
	}

	/**
	 * Get conversation history for a session
	 */
	getConversation(sessionId: string): ConversationMessage[] {
		return this.getSession(sessionId).conversation
	}

	/**
	 * Get edit history for a session
	 */
	getEdits(sessionId: string): EditHistoryEntry[] {
		return this.getSession(sessionId).edits
	}

	/**
	 * Clear a session
	 */
	clearSession(sessionId: string): void {
		this.sessions.delete(sessionId)
	}

	/**
	 * Get all sessions
	 */
	getAllSessions(): SessionHistory[] {
		return Array.from(this.sessions.values())
	}

	/**
	 * Clean up old sessions (older than 24 hours)
	 */
	cleanupOldSessions(): void {
		const now = Date.now()
		const maxAge = 24 * 60 * 60 * 1000 // 24 hours

		for (const [sessionId, session] of this.sessions.entries()) {
			if (now - session.lastUpdated > maxAge) {
				this.sessions.delete(sessionId)
			}
		}
	}
}
