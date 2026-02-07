"use client"

import { use } from "react"
import { EditorLayout } from "@/components/editor/editor-layout"
import { useEditorInit } from "@/lib/hooks/use-editor-init"

function EditorPage({ projectId }: { projectId: string }) {
  const { isLoaded } = useEditorInit(projectId)

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-base">
        <div className="text-text-tertiary text-sm">Loading project...</div>
      </div>
    )
  }

  return <EditorLayout />
}

export default function Page({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = use(params)
  return <EditorPage projectId={projectId} />
}
