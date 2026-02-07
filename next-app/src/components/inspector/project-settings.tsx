"use client"

import { useEditorStore } from "../../lib/store"
import type { Standard, AspectRatio } from "../../lib/types"

const resolutionPresets: { label: string; standard: Standard; width: number; height: number }[] = [
  { label: "4K", standard: "4k", width: 3840, height: 2160 },
  { label: "2K", standard: "2k", width: 2560, height: 1440 },
  { label: "1080p", standard: "1080p", width: 1920, height: 1080 },
  { label: "720p", standard: "720p", width: 1280, height: 720 },
  { label: "480p", standard: "480p", width: 854, height: 480 },
]

const aspectRatios: AspectRatio[] = ["16/9", "1/1", "4/3", "9/16", "3/2", "21/9"]

export function ProjectSettings() {
  const settings = useEditorStore((s) => s.settings)
  const setStandard = useEditorStore((s) => s.setStandard)
  const setAspectRatio = useEditorStore((s) => s.setAspectRatio)
  const setBitrate = useEditorStore((s) => s.setBitrate)
  const setProjectResolution = useEditorStore((s) => s.setProjectResolution)

  const handlePresetClick = (preset: (typeof resolutionPresets)[number]) => {
    setStandard(preset.standard)
    setProjectResolution(preset.width, preset.height)
  }

  return (
    <div className="p-3 space-y-4">
      {/* Resolution Presets */}
      <div>
        <label className="text-text-tertiary text-xs block mb-2">Resolution</label>
        <div className="grid grid-cols-3 gap-1.5">
          {resolutionPresets.map((preset) => (
            <button
              key={preset.standard}
              onClick={() => handlePresetClick(preset)}
              className={`px-2 py-1.5 rounded text-xs transition-colors ${
                settings.standard === preset.standard
                  ? "bg-accent/20 text-accent border border-accent/40"
                  : "bg-bg-surface border border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <p className="text-text-tertiary text-[10px] mt-1.5">
          {settings.width} x {settings.height}
        </p>
      </div>

      {/* Aspect Ratio */}
      <div className="border-t border-border-subtle pt-4">
        <label className="text-text-tertiary text-xs block mb-2">Aspect Ratio</label>
        <div className="grid grid-cols-3 gap-1.5">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              className={`px-2 py-1.5 rounded text-xs transition-colors ${
                settings.aspectRatio === ratio
                  ? "bg-accent/20 text-accent border border-accent/40"
                  : "bg-bg-surface border border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary"
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* Bitrate */}
      <div className="border-t border-border-subtle pt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-text-tertiary text-xs">Bitrate</label>
          <span className="text-text-secondary text-xs font-mono">
            {settings.bitrate.toLocaleString()} kbps
          </span>
        </div>
        <input
          type="range"
          min={1000}
          max={50000}
          step={500}
          value={settings.bitrate}
          onChange={(e) => setBitrate(Number(e.target.value))}
          className="w-full h-1 rounded-full appearance-none bg-bg-elevated accent-accent cursor-pointer"
        />
        <div className="flex justify-between mt-1">
          <span className="text-text-tertiary text-[10px]">1,000</span>
          <span className="text-text-tertiary text-[10px]">50,000</span>
        </div>
      </div>
    </div>
  )
}
