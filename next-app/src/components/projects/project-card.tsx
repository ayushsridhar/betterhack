"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, FolderOpen } from "lucide-react"
import { deleteProject, type ProjectSummary } from "@/lib/store/persistence"

interface ProjectCardProps {
  project: ProjectSummary
  onDeleted: () => void
}

export function ProjectCard({ project, onDeleted }: ProjectCardProps) {
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleOpen() {
    router.push(`/editor/${project.projectId}`)
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (confirmDelete) {
      deleteProject(project.projectId)
      onDeleted()
    } else {
      setConfirmDelete(true)
      // Reset confirm state after 3 seconds
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  const savedDate = project.savedAt
    ? new Date(project.savedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unknown"

  return (
    <div
      onClick={handleOpen}
      className="bg-bg-raised border border-border-subtle rounded-lg p-6 hover:border-border-default transition-colors cursor-pointer min-h-[160px] flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-accent-muted flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-accent" />
          </div>
          <button
            onClick={handleDelete}
            className={`p-2 rounded-lg transition-colors ${
              confirmDelete
                ? "bg-danger/15 text-danger"
                : "text-text-tertiary hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100"
            }`}
            title={confirmDelete ? "Click again to confirm" : "Delete project"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <h3 className="text-base font-semibold text-text-primary mb-1 truncate">
          {project.projectName || "Untitled Project"}
        </h3>
      </div>
      <p className="text-xs text-text-tertiary mt-2">
        Last saved: {savedDate}
      </p>
    </div>
  )
}
