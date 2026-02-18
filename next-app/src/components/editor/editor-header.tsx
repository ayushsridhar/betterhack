"use client"

import { useState, useCallback } from "react"
import { Download, Check, Pencil } from "lucide-react"
import Link from "next/link"
import { useEditorStore } from "../../lib/store"
import { saveProject } from "../../lib/store/persistence"

export function EditorHeader() {
  const projectName = useEditorStore((s) => s.projectName)
  const setProjectName = useEditorStore((s) => s.setProjectName)
  const setIsExportModalOpen = useEditorStore((s) => s.setIsExportModalOpen)
  const effects = useEditorStore((s) => s.effects)
  const setSelectedEffectsForAnnotation = useEditorStore((s) => s.setSelectedEffectsForAnnotation)
  const openAnnotationModal = useEditorStore((s) => s.openAnnotationModal)

  const handleOpenAnnotationModal = () => {
    const effectIds = effects.map(e => e.id)
    setSelectedEffectsForAnnotation(effectIds)
    openAnnotationModal()
  }

  const [isEditing, setIsEditing] = useState(false)
  const [nameValue, setNameValue] = useState(projectName)

  const handleSave = useCallback(() => {
    const state = useEditorStore.getState()
    saveProject(state.projectId, {
      projectId: state.projectId,
      projectName: state.projectName,
      effects: state.effects,
      tracks: state.tracks,
      filters: state.filters,
      animations: state.animations,
      transitions: state.transitions,
    })
  }, [])

  const handleNameSubmit = useCallback(() => {
    if (nameValue.trim()) {
      setProjectName(nameValue.trim())
    }
    setIsEditing(false)
  }, [nameValue, setProjectName])

  return (
    <header className="flex items-center justify-between px-3 h-9 bg-bg-raised border-b border-border-subtle shrink-0">
      {/* Logo */}
      <Link href="/editor" className="text-sm font-bold text-text-primary">
        Picasso
      </Link>

      {/* Project name */}
      <div className="flex items-center gap-1.5">
        {isEditing ? (
          <div className="flex items-center gap-1 border border-border-default rounded px-1.5 py-0.5">
            <input
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNameSubmit()
                if (e.key === "Escape") setIsEditing(false)
              }}
              onBlur={handleNameSubmit}
              autoFocus
              className="bg-transparent text-text-primary text-xs w-36 outline-none"
            />
            <button
              onClick={handleNameSubmit}
              className="text-success"
            >
              <Check size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setNameValue(projectName)
              setIsEditing(true)
            }}
            className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            {projectName}
            <Pencil size={10} className="text-text-tertiary" />
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          className="text-xs text-text-tertiary hover:text-text-secondary transition-colors px-2 py-1"
        >
          Save
        </button>

        {/* Annotate Button */}
        {effects.length > 0 && (
          <button
            onClick={handleOpenAnnotationModal}
            className="flex items-center gap-1.5 h-7 px-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-xs font-bold rounded transition-all shadow-sm"
            title={`Annotate all ${effects.length} clip${effects.length !== 1 ? 's' : ''}`}
          >
            🎨 Annotate ({effects.length})
          </button>
        )}

        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-1.5 h-7 px-3 bg-accent hover:bg-accent-hover text-white text-xs font-medium rounded transition-colors"
        >
          <Download size={12} />
          Export
        </button>
      </div>
    </header>
  )
}
