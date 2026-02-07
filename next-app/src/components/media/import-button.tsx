"use client"

import { useRef } from "react"
import { Upload } from "lucide-react"

interface ImportButtonProps {
  onFilesSelected: (files: FileList) => void
}

export function ImportButton({ onFilesSelected }: ImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*,.mp3,.wav,.ogg"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(e.target.files)
            // Reset input so the same file can be re-selected
            e.target.value = ""
          }
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-text-primary text-sm font-medium transition-colors cursor-pointer"
      >
        <Upload size={16} />
        Import
      </button>
    </>
  )
}
