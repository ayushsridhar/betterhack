"use client"

import { useCallback } from "react"
import { Download, XCircle, CheckCircle, Loader2 } from "lucide-react"
import { useEditorStore } from "../../lib/store"
import { saveVideoFile } from "../../lib/engine/export/file-system-helper"
import type { ExportStatus } from "../../lib/types"

const STATUS_LABELS: Record<ExportStatus, string> = {
  demuxing: "Demuxing media...",
  composing: "Composing frames...",
  flushing: "Flushing encoder...",
  complete: "Export complete",
  error: "Export failed",
}

interface ExportProgressProps {
  blob: Blob | null
  onCancel: () => void
  onClose: () => void
}

export function ExportProgress({ blob, onCancel, onClose }: ExportProgressProps) {
  const progress = useEditorStore((s) => s.export_progress)
  const status = useEditorStore((s) => s.export_status)
  const isExporting = useEditorStore((s) => s.is_exporting)

  const isComplete = status === "complete" && !isExporting
  const isError = status === "error" && !isExporting

  const handleSave = useCallback(async () => {
    if (!blob) return
    await saveVideoFile(blob)
  }, [blob])

  return (
    <div className="space-y-4">
      {/* Status indicator */}
      <div className="flex items-center gap-3">
        {isExporting && (
          <Loader2 size={18} className="text-accent animate-spin" />
        )}
        {isComplete && (
          <CheckCircle size={18} className="text-success" />
        )}
        {isError && (
          <XCircle size={18} className="text-danger" />
        )}
        <span className="text-sm text-text-primary">
          {STATUS_LABELS[status]}
        </span>
        {isExporting && (
          <span className="ml-auto text-sm text-text-tertiary font-mono">
            {progress}%
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="bg-bg-surface rounded-full h-2 overflow-hidden">
        <div
          className="bg-accent rounded-full h-2 transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        {isExporting && (
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 bg-bg-surface hover:bg-bg-elevated text-text-secondary hover:text-text-primary border border-border-default rounded px-4 py-2 text-sm transition-colors"
          >
            Cancel
          </button>
        )}

        {isComplete && blob && (
          <>
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white rounded px-4 py-2 text-sm font-medium transition-colors"
            >
              <Download size={16} />
              Save File
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 bg-bg-surface hover:bg-bg-elevated text-text-secondary hover:text-text-primary border border-border-default rounded px-4 py-2 text-sm transition-colors"
            >
              Close
            </button>
          </>
        )}

        {isError && (
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 bg-bg-surface hover:bg-bg-elevated text-text-secondary hover:text-text-primary border border-border-default rounded px-4 py-2 text-sm transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  )
}
