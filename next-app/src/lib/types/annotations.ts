/**
 * Annotation and Drawing types for AI-powered video editing
 */

export type DrawingToolType = 'freehand' | 'arrow' | 'rectangle' | 'circle'

export interface Point {
  x: number
  y: number
}

// Optional user-provided context for AI (e.g. transition intent)
export interface AnnotationContext {
  transitionSpeed?: 'slow' | 'medium' | 'fast'
  transitionSize?: 'small' | 'medium' | 'large'
  notes?: string
}

// Standardized annotation format for team collaboration
export interface Annotation {
  id: string
  type: DrawingToolType
  coordinates: {
    start?: Point              // arrow, rectangle: start point
    end?: Point                // arrow, rectangle: end point
    center?: Point             // circle: center point
    radius?: number            // circle: radius
    path?: Point[]             // freehand: array of points
  }
  affectedEffects: string[]      // IDs of clips this annotation overlaps
  color?: string
  strokeWidth?: number
  drawnAtTimecode?: number       // timecode when annotation was created
  context?: AnnotationContext
}

export interface DrawingMode {
  enabled: boolean
  tool: DrawingToolType
  color: string
  strokeWidth: number
}
