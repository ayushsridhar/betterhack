"use client"

import { useRef, useState, useEffect } from 'react'
import { useEditorStore } from '@/lib/store'
import { generateId } from '@/lib/utils/id'
import type { Point, Annotation } from '@/lib/types'

export function DrawingOverlay() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<Point[]>([])
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null)

  const drawingMode = useEditorStore((s) => s.drawing_mode)
  const annotations = useEditorStore((s) => s.annotations)
  const addAnnotation = useEditorStore((s) => s.addAnnotation)
  const setSelectedAnnotation = useEditorStore((s) => s.setSelectedAnnotation)
  const timecode = useEditorStore((s) => s.timecode)

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drawingMode.enabled) return

    const svg = svgRef.current
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const point: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    setIsDrawing(true)
    setStartPoint(point)
    setCurrentPoint(point)

    if (drawingMode.tool === 'freehand') {
      setCurrentPath([point])
    }
  }

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing || !drawingMode.enabled) return

    const svg = svgRef.current
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const point: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    setCurrentPoint(point)

    if (drawingMode.tool === 'freehand') {
      setCurrentPath(prev => [...prev, point])
    }
  }

  const handlePointerUp = () => {
    if (!isDrawing || !drawingMode.enabled || !startPoint) return

    const annotation: Annotation = {
      id: generateId(),
      type: drawingMode.tool,
      coordinates: {},
      affectedEffects: [], // TODO: Detect overlapping effects
      color: drawingMode.color,
      strokeWidth: drawingMode.strokeWidth,
      drawnAtTimecode: timecode,
      context: {
        transitionSpeed: 'medium',
        transitionSize: 'medium',
        notes: '',
      },
    }

    // Set coordinates based on tool type
    switch (drawingMode.tool) {
      case 'freehand':
        annotation.coordinates.path = currentPath
        break
      case 'arrow':
        annotation.coordinates.start = startPoint
        annotation.coordinates.end = currentPoint || startPoint
        break
      case 'rectangle':
        annotation.coordinates.start = startPoint
        annotation.coordinates.end = currentPoint || startPoint
        break
      case 'circle':
        if (currentPoint) {
          const dx = currentPoint.x - startPoint.x
          const dy = currentPoint.y - startPoint.y
          const radius = Math.sqrt(dx * dx + dy * dy)
          annotation.coordinates.center = startPoint
          annotation.coordinates.radius = radius
        }
        break
    }

    addAnnotation(annotation)
    setSelectedAnnotation(annotation.id)

    // Reset drawing state
    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPoint(null)
    setCurrentPath([])
  }

  // Render a single annotation
  const renderAnnotation = (annotation: Annotation) => {
    const { type, coordinates, color, strokeWidth } = annotation
    const stroke = color || '#FF0000'
    const width = strokeWidth || 3

    switch (type) {
      case 'freehand':
        if (!coordinates.path || coordinates.path.length === 0) return null
        const pathData = coordinates.path
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
          .join(' ')
        return (
          <path
            key={annotation.id}
            d={pathData}
            fill="none"
            stroke={stroke}
            strokeWidth={width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )

      case 'arrow':
        if (!coordinates.start || !coordinates.end) return null
        const { start, end } = coordinates
        const angle = Math.atan2(end.y - start.y, end.x - start.x)
        const arrowLength = 15
        const arrowWidth = 8
        const arrow1X = end.x - arrowLength * Math.cos(angle - Math.PI / 6)
        const arrow1Y = end.y - arrowLength * Math.sin(angle - Math.PI / 6)
        const arrow2X = end.x - arrowLength * Math.cos(angle + Math.PI / 6)
        const arrow2Y = end.y - arrowLength * Math.sin(angle + Math.PI / 6)

        return (
          <g key={annotation.id}>
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={stroke}
              strokeWidth={width}
            />
            <path
              d={`M ${end.x} ${end.y} L ${arrow1X} ${arrow1Y} L ${arrow2X} ${arrow2Y} Z`}
              fill={stroke}
            />
          </g>
        )

      case 'rectangle':
        if (!coordinates.start || !coordinates.end) return null
        const x = Math.min(coordinates.start.x, coordinates.end.x)
        const y = Math.min(coordinates.start.y, coordinates.end.y)
        const w = Math.abs(coordinates.end.x - coordinates.start.x)
        const h = Math.abs(coordinates.end.y - coordinates.start.y)
        return (
          <rect
            key={annotation.id}
            x={x}
            y={y}
            width={w}
            height={h}
            fill="none"
            stroke={stroke}
            strokeWidth={width}
          />
        )

      case 'circle':
        if (!coordinates.center || !coordinates.radius) return null
        return (
          <circle
            key={annotation.id}
            cx={coordinates.center.x}
            cy={coordinates.center.y}
            r={coordinates.radius}
            fill="none"
            stroke={stroke}
            strokeWidth={width}
          />
        )

      default:
        return null
    }
  }

  // Render current drawing in progress
  const renderCurrentDrawing = () => {
    if (!isDrawing || !startPoint) return null

    const stroke = drawingMode.color
    const width = drawingMode.strokeWidth

    switch (drawingMode.tool) {
      case 'freehand':
        if (currentPath.length === 0) return null
        const pathData = currentPath
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
          .join(' ')
        return (
          <path
            d={pathData}
            fill="none"
            stroke={stroke}
            strokeWidth={width}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.7}
          />
        )

      case 'arrow':
        if (!currentPoint) return null
        const angle = Math.atan2(currentPoint.y - startPoint.y, currentPoint.x - startPoint.x)
        const arrowLength = 15
        const arrow1X = currentPoint.x - arrowLength * Math.cos(angle - Math.PI / 6)
        const arrow1Y = currentPoint.y - arrowLength * Math.sin(angle - Math.PI / 6)
        const arrow2X = currentPoint.x - arrowLength * Math.cos(angle + Math.PI / 6)
        const arrow2Y = currentPoint.y - arrowLength * Math.sin(angle + Math.PI / 6)

        return (
          <g opacity={0.7}>
            <line
              x1={startPoint.x}
              y1={startPoint.y}
              x2={currentPoint.x}
              y2={currentPoint.y}
              stroke={stroke}
              strokeWidth={width}
            />
            <path
              d={`M ${currentPoint.x} ${currentPoint.y} L ${arrow1X} ${arrow1Y} L ${arrow2X} ${arrow2Y} Z`}
              fill={stroke}
            />
          </g>
        )

      case 'rectangle':
        if (!currentPoint) return null
        const x = Math.min(startPoint.x, currentPoint.x)
        const y = Math.min(startPoint.y, currentPoint.y)
        const w = Math.abs(currentPoint.x - startPoint.x)
        const h = Math.abs(currentPoint.y - startPoint.y)
        return (
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            fill="none"
            stroke={stroke}
            strokeWidth={width}
            opacity={0.7}
          />
        )

      case 'circle':
        if (!currentPoint) return null
        const dx = currentPoint.x - startPoint.x
        const dy = currentPoint.y - startPoint.y
        const radius = Math.sqrt(dx * dx + dy * dy)
        return (
          <circle
            cx={startPoint.x}
            cy={startPoint.y}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={width}
            opacity={0.7}
          />
        )

      default:
        return null
    }
  }

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full"
      style={{
        cursor: drawingMode.enabled ? 'crosshair' : 'default',
        pointerEvents: drawingMode.enabled ? 'auto' : 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Render existing annotations */}
      {annotations.map(renderAnnotation)}

      {/* Render current drawing */}
      {renderCurrentDrawing()}
    </svg>
  )
}
