"use client"

import { useEffect, useRef, useState } from "react"
import { useEditorStore } from "../store"
import { loadProject, saveProject } from "../store/persistence"
import { generateId } from "../utils/id"
import { usePlayback } from "./use-playback"
import { useShortcuts } from "./use-shortcuts"

export function useEditorInit(projectId: string) {
  const [isLoaded, setIsLoaded] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const setProjectId = useEditorStore((s) => s.setProjectId)
  const setProjectName = useEditorStore((s) => s.setProjectName)
  const setEffects = useEditorStore((s) => s.setEffects)
  const resetProject = useEditorStore((s) => s.resetProject)

  // Initialize playback RAF loop
  usePlayback()

  // Register keyboard shortcuts
  useShortcuts()

  // Load project from localStorage
  useEffect(() => {
    const savedState = loadProject(projectId)

    if (savedState) {
      // Restore saved project state
      const store = useEditorStore.getState()
      useEditorStore.setState({
        ...store,
        projectId: savedState.projectId,
        projectName: savedState.projectName,
        effects: savedState.effects,
        tracks: savedState.tracks,
        filters: savedState.filters,
        animations: savedState.animations,
        transitions: savedState.transitions,
      })
    } else {
      // New project
      resetProject()
      setProjectId(projectId)
      setProjectName(`project-${projectId.slice(0, 6)}`)
    }

    setIsLoaded(true)
  }, [projectId, setProjectId, setProjectName, setEffects, resetProject])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!isLoaded) return

    saveTimerRef.current = setInterval(() => {
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
    }, 30000)

    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current)
      }
    }
  }, [isLoaded])

  // Save on unmount
  useEffect(() => {
    return () => {
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
    }
  }, [])

  return { isLoaded }
}
