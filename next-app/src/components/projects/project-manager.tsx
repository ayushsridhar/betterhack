"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { listProjects, type ProjectSummary } from "@/lib/store/persistence"
import { generateId } from "@/lib/utils/id"
import { ProjectCard } from "./project-card"

export function ProjectManager() {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setProjects(listProjects())
    setLoaded(true)
  }, [])

  function handleNewProject() {
    const newId = generateId()
    router.push(`/editor/${newId}`)
  }

  function handleProjectDeleted() {
    setProjects(listProjects())
  }

  if (!loaded) {
    return (
      <div className="text-text-tertiary text-sm">Loading projects...</div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* New project card */}
      <button
        onClick={handleNewProject}
        className="bg-bg-raised border border-border-subtle rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:border-accent transition-colors cursor-pointer min-h-[160px]"
      >
        <div className="w-12 h-12 rounded-full bg-accent-muted flex items-center justify-center">
          <Plus className="w-6 h-6 text-accent" />
        </div>
        <span className="text-sm font-medium text-text-primary">
          New Project
        </span>
      </button>

      {/* Existing project cards */}
      {projects.map((project) => (
        <ProjectCard
          key={project.projectId}
          project={project}
          onDeleted={handleProjectDeleted}
        />
      ))}
    </div>
  )
}
