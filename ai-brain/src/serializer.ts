/**
 * Annotation Serializer
 * Converts visual annotations into natural language descriptions for Claude
 */

import { Annotation, AnyEffect, TimelineState } from './types.js'

export class AnnotationSerializer {
	/**
	 * Serialize annotations into natural language context
	 */
	serialize(annotations: Annotation[], timelineState: TimelineState): string {
		if (annotations.length === 0) {
			return 'No annotations were drawn.'
		}

		const descriptions = annotations.map((annotation, index) =>
			this.serializeAnnotation(annotation, index + 1, timelineState)
		)

		return descriptions.join('\n\n')
	}

	/**
	 * Serialize a single annotation
	 */
	private serializeAnnotation(
		annotation: Annotation,
		index: number,
		timelineState: TimelineState
	): string {
		const affectedClips = this.getAffectedClips(
			annotation.affectedEffects,
			timelineState
		)

		switch (annotation.type) {
			case 'arrow':
				return this.serializeArrow(annotation, index, affectedClips)
			case 'rectangle':
				return this.serializeRectangle(annotation, index, affectedClips)
			case 'circle':
				return this.serializeCircle(annotation, index, affectedClips)
			case 'freehand':
				return this.serializeFreehand(annotation, index, affectedClips)
			default:
				return `Annotation ${index}: Unknown type`
		}
	}

	/**
	 * Serialize arrow annotation
	 */
	private serializeArrow(
		annotation: Annotation,
		index: number,
		affectedClips: AnyEffect[]
	): string {
		const direction = this.getArrowDirection(annotation.coordinates)

		if (affectedClips.length === 0) {
			return `Annotation ${index}: Arrow pointing ${direction} (no clips affected)`
		}

		if (affectedClips.length === 1) {
			const clip = affectedClips[0]
			return `Annotation ${index}: Arrow pointing ${direction} on clip with ID "${clip.id}" (name: "${this.getClipName(clip)}", ${clip.kind}, track ${clip.track}, ${this.formatTime(clip.start_at_position)}-${this.formatTime(clip.start_at_position + clip.duration)})`
		}

		// Multiple clips - likely transition intent
		const clipA = affectedClips[0]
		const clipB = affectedClips[1]
		return `Annotation ${index}: Arrow pointing ${direction} from clip with ID "${clipA.id}" (name: "${this.getClipName(clipA)}", ${clipA.kind}, track ${clipA.track}) to clip with ID "${clipB.id}" (name: "${this.getClipName(clipB)}", ${clipB.kind}, track ${clipB.track})`
	}

	/**
	 * Serialize rectangle annotation
	 */
	private serializeRectangle(
		annotation: Annotation,
		index: number,
		affectedClips: AnyEffect[]
	): string {
		if (affectedClips.length === 0) {
			return `Annotation ${index}: Rectangle drawn (no clips affected)`
		}

		const clipDescriptions = affectedClips.map(
			(clip) =>
				`clip with ID "${clip.id}" (name: "${this.getClipName(clip)}", ${clip.kind}, track ${clip.track})`
		)

		return `Annotation ${index}: Rectangle selecting ${clipDescriptions.join(', ')}`
	}

	/**
	 * Serialize circle annotation
	 */
	private serializeCircle(
		annotation: Annotation,
		index: number,
		affectedClips: AnyEffect[]
	): string {
		if (affectedClips.length === 0) {
			return `Annotation ${index}: Circle drawn (no clips affected)`
		}

		const clipDescriptions = affectedClips.map(
			(clip) =>
				`clip with ID "${clip.id}" (name: "${this.getClipName(clip)}", ${clip.kind}, track ${clip.track})`
		)

		return `Annotation ${index}: Circle highlighting ${clipDescriptions.join(', ')}`
	}

	/**
	 * Serialize freehand annotation
	 */
	private serializeFreehand(
		annotation: Annotation,
		index: number,
		affectedClips: AnyEffect[]
	): string {
		const shape = this.interpretFreehandShape(annotation.coordinates)

		if (affectedClips.length === 0) {
			return `Annotation ${index}: Freehand drawing (${shape}, no clips affected)`
		}

		const clipDescriptions = affectedClips.map(
			(clip) =>
				`clip with ID "${clip.id}" (name: "${this.getClipName(clip)}", ${clip.kind}, track ${clip.track})`
		)

		return `Annotation ${index}: Freehand ${shape} over ${clipDescriptions.join(', ')}`
	}

	/**
	 * Get arrow direction from coordinates
	 */
	private getArrowDirection(coordinates: {
		start: { x: number; y: number }
		end: { x: number; y: number }
	}): string {
		const dx = coordinates.end.x - coordinates.start.x
		const dy = coordinates.end.y - coordinates.start.y

		const angle = Math.atan2(dy, dx) * (180 / Math.PI)

		if (angle >= -45 && angle < 45) return 'right'
		if (angle >= 45 && angle < 135) return 'down'
		if (angle >= 135 || angle < -135) return 'left'
		return 'up'
	}

	/**
	 * Interpret freehand shape (basic heuristic)
	 */
	private interpretFreehandShape(coordinates: {
		start: { x: number; y: number }
		end: { x: number; y: number }
	}): string {
		// For now, just describe as a line
		// Could be enhanced with path analysis if we get actual path points
		return 'line/stroke'
	}

	/**
	 * Get affected clips from IDs
	 */
	private getAffectedClips(
		effectIds: string[],
		timelineState: TimelineState
	): AnyEffect[] {
		return effectIds
			.map((id) => timelineState.effects.find((e) => e.id === id))
			.filter((e): e is AnyEffect => e !== undefined)
	}

	/**
	 * Get clip name with fallback to ID
	 */
	private getClipName(clip: AnyEffect): string {
		if ('name' in clip && clip.name) {
			return clip.name
		}
		if ('text' in clip && clip.text) {
			return clip.text.substring(0, 20)
		}
		return clip.id.substring(0, 8)
	}

	/**
	 * Format milliseconds to readable time
	 */
	private formatTime(ms: number): string {
		const totalSeconds = Math.floor(ms / 1000)
		const minutes = Math.floor(totalSeconds / 60)
		const seconds = totalSeconds % 60
		return `${minutes}:${seconds.toString().padStart(2, '0')}`
	}

	/**
	 * Summarize timeline state for context
	 */
	summarizeTimeline(state: TimelineState): string {
		const videoClips = state.effects.filter((e) => e.kind === 'video')
		const audioClips = state.effects.filter((e) => e.kind === 'audio')
		const textClips = state.effects.filter((e) => e.kind === 'text')
		const imageClips = state.effects.filter((e) => e.kind === 'image')

		return `Timeline has ${state.tracks.length} tracks with ${videoClips.length} video clips, ${audioClips.length} audio clips, ${textClips.length} text elements, ${imageClips.length} images. ${state.transitions.length} transitions, ${state.filters.length} filters, ${state.animations.length} animations applied.`
	}
}
