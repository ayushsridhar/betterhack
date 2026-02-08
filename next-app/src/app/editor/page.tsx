"use client"

import { ProjectManager } from "@/components/projects/project-manager"
import { ImportProject } from "@/components/projects/import-project"
import Link from "next/link"

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <header className="border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-text-primary"
          >
            Picasso
          </Link>
          <ImportProject />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            Your Projects
          </h1>
        </div>
        <ProjectManager />
      </main>
    </div>
  )
}
