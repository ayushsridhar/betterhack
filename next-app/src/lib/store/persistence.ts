import type { HistoricalState } from "../types"

const STORAGE_PREFIX = "omniclip_"

export function saveProject(projectId: string, state: HistoricalState): void {
  try {
    const key = `${STORAGE_PREFIX}${projectId}`
    const data = JSON.stringify({
      ...state,
      savedAt: Date.now(),
    })
    localStorage.setItem(key, data)
  } catch (e) {
    console.error("Failed to save project:", e)
  }
}

export function loadProject(projectId: string): HistoricalState | null {
  try {
    const key = `${STORAGE_PREFIX}${projectId}`
    const data = localStorage.getItem(key)
    if (!data) return null

    const parsed = JSON.parse(data)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { savedAt, ...state } = parsed
    return state as HistoricalState
  } catch (e) {
    console.error("Failed to load project:", e)
    return null
  }
}

export function deleteProject(projectId: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${projectId}`)
  } catch (e) {
    console.error("Failed to delete project:", e)
  }
}

export interface ProjectSummary {
  projectId: string
  projectName: string
  savedAt: number
}

export function listProjects(): ProjectSummary[] {
  const projects: ProjectSummary[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(STORAGE_PREFIX)) continue

    try {
      const data = JSON.parse(localStorage.getItem(key)!)
      projects.push({
        projectId: data.projectId,
        projectName: data.projectName,
        savedAt: data.savedAt || 0,
      })
    } catch {
      continue
    }
  }

  return projects.sort((a, b) => b.savedAt - a.savedAt)
}
