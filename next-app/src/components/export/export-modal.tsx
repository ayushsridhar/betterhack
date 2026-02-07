"use client"

import { useCallback, useRef, useState } from "react"
import { X, Download } from "lucide-react"
import { useEditorStore } from "../../lib/store"
import { VideoExport } from "../../lib/engine/export/video-export"
import { ExportProgress } from "./export-progress"

const FPS_OPTIONS = [25, 30, 60] as const

export function ExportModal() {
  const isOpen = useEditorStore((s) => s.isExportModalOpen)
  const settings = useEditorStore((s) => s.settings)
  const effects = useEditorStore((s) => s.effects)
  const isExporting = useEditorStore((s) => s.is_exporting)
  const setIsExportModalOpen = useEditorStore((s) => s.setIsExportModalOpen)
  const setIsExporting = useEditorStore((s) => s.setIsExporting)
  const setExportProgress = useEditorStore((s) => s.setExportProgress)
  const setExportStatus = useEditorStore((s) => s.setExportStatus)

  const [fps, setFps] = useState<number>(30)
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null)
  const exporterRef = useRef<VideoExport | null>(null)

  const handleClose = useCallback(() => {
    if (isExporting) return
    setIsExportModalOpen(false)
    setExportedBlob(null)
    setExportProgress(0)
    setExportStatus("demuxing")
  }, [isExporting, setIsExportModalOpen, setExportProgress, setExportStatus])

  const handleStartExport = useCallback(async () => {
    const exporter = new VideoExport()
    exporterRef.current = exporter
    exporter.setFps(fps)

    setIsExporting(true)
    setExportProgress(0)
    setExportedBlob(null)

    try {
      const blob = await exporter.startExport(
        effects,
        settings,
        (progress) => setExportProgress(progress),
        (status) => setExportStatus(status),
      )
      setExportedBlob(blob)
    } catch (err) {
      console.error("[ExportModal] Export failed:", err)
      setExportStatus("error")
    } finally {
      setIsExporting(false)
      exporterRef.current = null
    }
  }, [effects, settings, fps, setIsExporting, setExportProgress, setExportStatus])

  const handleCancel = useCallback(() => {
    if (exporterRef.current) {
      exporterRef.current.abort()
    }
    setIsExporting(false)
    setExportProgress(0)
    setExportStatus("demuxing")
  }, [setIsExporting, setExportProgress, setExportStatus])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-bg-raised border border-border-default rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-text-primary">Export Video</h2>
          <button
            onClick={handleClose}
            disabled={isExporting}
            className="text-text-tertiary hover:text-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed p-1 rounded hover:bg-bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* Settings */}
        {!isExporting && !exportedBlob && (
          <div className="space-y-4">
            {/* Resolution */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Resolution</span>
              <span className="text-sm text-text-primary font-mono">
                {settings.width} x {settings.height}
              </span>
            </div>

            {/* Standard */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Standard</span>
              <span className="text-sm text-text-primary font-mono uppercase">
                {settings.standard}
              </span>
            </div>

            {/* Bitrate */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Bitrate</span>
              <span className="text-sm text-text-primary font-mono">
                {settings.bitrate} kbps
              </span>
            </div>

            {/* FPS */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Frame Rate</span>
              <select
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="bg-bg-surface border border-border-default rounded px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                {FPS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt} fps
                  </option>
                ))}
              </select>
            </div>

            {/* Separator */}
            <div className="border-t border-border-subtle" />

            {/* Export Button */}
            <button
              onClick={handleStartExport}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white rounded px-4 py-2.5 text-sm font-medium transition-colors"
            >
              <Download size={16} />
              Start Export
            </button>
          </div>
        )}

        {/* Progress / Complete state */}
        {(isExporting || exportedBlob) && (
          <ExportProgress
            blob={exportedBlob}
            onCancel={handleCancel}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  )
}
