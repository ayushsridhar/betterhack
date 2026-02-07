/**
 * MCP Tool Definitions for Claude
 */

import Anthropic from '@anthropic-ai/sdk'

/**
 * Define available MCP tools for Claude to use
 */
export const mcpTools: Anthropic.Tool[] = [
	{
		name: 'add_transition',
		description:
			'Add a transition effect between two video/image clips on the timeline. Use this when the user wants smooth movement or fade between clips.',
		input_schema: {
			type: 'object',
			properties: {
				effectAId: {
					type: 'string',
					description: 'ID of the first clip (source)',
				},
				effectBId: {
					type: 'string',
					description: 'ID of the second clip (destination)',
				},
				transitionType: {
					type: 'string',
					description:
						'Type of transition (slide, fade, wipe, dissolve, zoom)',
					enum: ['slide', 'fade', 'wipe', 'dissolve', 'zoom'],
				},
				duration: {
					type: 'number',
					description: 'Duration of transition in milliseconds',
				},
				direction: {
					type: 'string',
					description:
						'Direction for directional transitions (left, right, up, down)',
					enum: ['left', 'right', 'up', 'down'],
				},
			},
			required: ['effectAId', 'effectBId', 'transitionType', 'duration'],
		},
	},
	{
		name: 'modify_effect',
		description:
			'Modify properties of an existing effect/clip on the timeline (position, scale, rotation, timing, etc.)',
		input_schema: {
			type: 'object',
			properties: {
				effectId: {
					type: 'string',
					description: 'ID of the effect to modify',
				},
				properties: {
					type: 'object',
					description: 'Properties to modify',
					properties: {
						start_at_position: {
							type: 'number',
							description: 'New start position in milliseconds',
						},
						duration: {
							type: 'number',
							description: 'New duration in milliseconds',
						},
						track: {
							type: 'number',
							description: 'New track number',
						},
						rect: {
							type: 'object',
							description: 'Rectangle properties (position, scale, rotation)',
							properties: {
								position_on_canvas: {
									type: 'object',
									properties: {
										x: { type: 'number' },
										y: { type: 'number' },
									},
								},
								scaleX: { type: 'number' },
								scaleY: { type: 'number' },
								rotation: { type: 'number' },
							},
						},
					},
				},
			},
			required: ['effectId', 'properties'],
		},
	},
	{
		name: 'add_filter',
		description:
			'Add a visual filter/effect to a video or image clip (blur, brightness, contrast, saturation, etc.)',
		input_schema: {
			type: 'object',
			properties: {
				effectId: {
					type: 'string',
					description: 'ID of the clip to apply filter to',
				},
				filterType: {
					type: 'string',
					description: 'Type of filter to apply',
					enum: [
						'blur',
						'brightness',
						'contrast',
						'saturation',
						'grayscale',
						'sepia',
						'invert',
					],
				},
				intensity: {
					type: 'number',
					description: 'Intensity/strength of the filter (0-100)',
				},
			},
			required: ['effectId', 'filterType', 'intensity'],
		},
	},
	{
		name: 'add_animation',
		description:
			'Add an animation to a clip (fade in/out, slide in/out, zoom, rotate, etc.)',
		input_schema: {
			type: 'object',
			properties: {
				effectId: {
					type: 'string',
					description: 'ID of the clip to animate',
				},
				animationType: {
					type: 'string',
					description: 'Type of animation',
					enum: [
						'fadeIn',
						'fadeOut',
						'slideIn',
						'slideOut',
						'zoomIn',
						'zoomOut',
						'rotate',
					],
				},
				duration: {
					type: 'number',
					description: 'Duration of animation in milliseconds',
				},
				params: {
					type: 'object',
					description: 'Additional animation parameters',
				},
			},
			required: ['effectId', 'animationType', 'duration'],
		},
	},
	{
		name: 'split_clip',
		description: 'Split a clip into two separate clips at a specific timestamp',
		input_schema: {
			type: 'object',
			properties: {
				effectId: {
					type: 'string',
					description: 'ID of the clip to split',
				},
				timestamp: {
					type: 'number',
					description:
						'Timestamp in milliseconds (relative to clip start) where to split',
				},
			},
			required: ['effectId', 'timestamp'],
		},
	},
	{
		name: 'move_effect',
		description: 'Move a clip to a different track or position on the timeline',
		input_schema: {
			type: 'object',
			properties: {
				effectId: {
					type: 'string',
					description: 'ID of the clip to move',
				},
				track: {
					type: 'number',
					description: 'New track number',
				},
				start_at_position: {
					type: 'number',
					description: 'New start position in milliseconds',
				},
			},
			required: ['effectId'],
		},
	},
	{
		name: 'remove_effect',
		description: 'Remove a clip from the timeline',
		input_schema: {
			type: 'object',
			properties: {
				effectId: {
					type: 'string',
					description: 'ID of the clip to remove',
				},
			},
			required: ['effectId'],
		},
	},
	{
		name: 'adjust_duration',
		description: 'Adjust the duration of a clip (trim/extend)',
		input_schema: {
			type: 'object',
			properties: {
				effectId: {
					type: 'string',
					description: 'ID of the clip to adjust',
				},
				newDuration: {
					type: 'number',
					description: 'New duration in milliseconds',
				},
				trimFrom: {
					type: 'string',
					description: 'Which end to trim from',
					enum: ['start', 'end'],
				},
			},
			required: ['effectId', 'newDuration'],
		},
	},
]

/**
 * Default actions for annotations without prompts
 */
export const defaultAnnotationActions = {
	arrow: {
		action: 'add_transition',
		defaults: {
			transitionType: 'fade',
			duration: 500,
		},
	},
	rectangle: {
		action: 'select_for_modification',
		description: 'Rectangle selects a clip for modification',
	},
	circle: {
		action: 'highlight_focus',
		description: 'Circle highlights/focuses on a clip',
	},
	freehand: {
		action: 'interpret_from_shape',
		description: 'Freehand drawings are interpreted by AI',
	},
}
