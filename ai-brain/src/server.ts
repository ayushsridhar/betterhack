/**
 * AI Brain Server
 * Express server that receives annotation + prompt requests and returns editing instructions
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Orchestrator } from './orchestrator.js'
import { AIEditRequest, AIEditResponse } from './types.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

if (!ANTHROPIC_API_KEY) {
	console.error('Error: ANTHROPIC_API_KEY not found in environment variables')
	console.error('Please create a .env file with your API key')
	process.exit(1)
}

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Initialize orchestrator
const orchestrator = new Orchestrator(ANTHROPIC_API_KEY)

// Health check
app.get('/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Main AI edit endpoint
app.post('/api/ai-edit', async (req, res) => {
	console.log('\n=== New AI Edit Request ===')
	console.log('Timestamp:', new Date().toISOString())

	try {
		const request: AIEditRequest = req.body

		// Validate request
		if (!request.annotations || !Array.isArray(request.annotations)) {
			return res.status(400).json({
				success: false,
				error: 'Missing or invalid annotations array',
			})
		}

		if (typeof request.prompt !== 'string') {
			return res.status(400).json({
				success: false,
				error: 'Invalid prompt type (must be string)',
			})
		}

		// Allow empty prompts for default annotation behaviors
		if (!request.prompt && (!request.annotations || request.annotations.length === 0)) {
			return res.status(400).json({
				success: false,
				error: 'Must provide either prompt or annotations',
			})
		}

		if (!request.timelineState) {
			return res.status(400).json({
				success: false,
				error: 'Missing timelineState',
			})
		}

		// Process the edit
		const response: AIEditResponse = await orchestrator.processEdit(request)

		console.log('=== Request Complete ===\n')
		res.json(response)
	} catch (error) {
		console.error('Error processing request:', error)
		res.status(500).json({
			success: false,
			error: error instanceof Error ? error.message : 'Internal server error',
			changes: [],
			sessionId: req.body.sessionId || '',
		})
	}
})

// Get session history
app.get('/api/history/:sessionId', (req, res) => {
	try {
		const history = orchestrator.getHistory(req.params.sessionId)
		res.json(history)
	} catch (error) {
		res.status(500).json({
			error: error instanceof Error ? error.message : 'Failed to get history',
		})
	}
})

// Clear session
app.delete('/api/session/:sessionId', (req, res) => {
	try {
		orchestrator.clearSession(req.params.sessionId)
		res.json({ success: true })
	} catch (error) {
		res.status(500).json({
			error:
				error instanceof Error ? error.message : 'Failed to clear session',
		})
	}
})

// Start server
app.listen(PORT, () => {
	console.log(`🧠 AI Brain server running on http://localhost:${PORT}`)
	console.log(`📡 Ready to receive edit requests at POST /api/ai-edit`)
	console.log(`💚 Health check available at GET /health`)
})
