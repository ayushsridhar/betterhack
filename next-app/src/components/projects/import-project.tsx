"use client"

import { useRef } from "react"
import { Upload } from "lucide-react"

export function ImportProject() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Placeholder: actual ZIP import logic will be implemented later
    console.log("Import file selected:", file.name)

    // Reset input so the same file can be selected again
    e.target.value = ""
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 text-sm px-4 py-2 text-text-secondary hover:text-text-primary border border-border-subtle hover:border-border-default rounded-lg transition-colors"
      >
        <Upload className="w-4 h-4" />
        Import Project
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  )
}
