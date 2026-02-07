"use client"

import { useEditorStore } from "../../lib/store"
import { ProjectSettings } from "./project-settings"
import { FilterPanel } from "./filters/filter-panel"
import { AnimationPanel } from "./animations/animation-panel"
import { TrimPanel } from "./trim/trim-panel"
import { TextPanel } from "./text/text-panel"
import { Settings, Sliders, Sparkles, Scissors, Music } from "lucide-react"
import type { VideoEffect, AudioEffect } from "../../lib/types"

const videoSubTabs = [
  { id: "trim" as const, label: "Trim", icon: Scissors },
  { id: "filters" as const, label: "Filters", icon: Sliders },
  { id: "animations" as const, label: "Animations", icon: Sparkles },
]

const imageSubTabs = [
  { id: "filters" as const, label: "Filters", icon: Sliders },
  { id: "animations" as const, label: "Animations", icon: Sparkles },
]

export function InspectorPanel() {
  const selectedEffect = useEditorStore((s) => s.selected_effect)
  const inspectorSubTab = useEditorStore((s) => s.inspectorSubTab)
  const setInspectorSubTab = useEditorStore((s) => s.setInspectorSubTab)

  // No selection — show project settings
  if (!selectedEffect) {
    return (
      <div className="h-full overflow-y-auto bg-bg-raised">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border-subtle">
          <Settings size={14} className="text-text-tertiary" />
          <span className="text-xs font-medium text-text-secondary">Project Settings</span>
        </div>
        <ProjectSettings />
      </div>
    )
  }

  // Audio — trim + info
  if (selectedEffect.kind === "audio") {
    return (
      <div className="h-full overflow-y-auto bg-bg-raised">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border-subtle">
          <Music size={14} className="text-clip-audio" />
          <span className="text-xs font-medium text-text-secondary">Audio: {selectedEffect.name}</span>
        </div>
        <TrimPanel effect={selectedEffect as AudioEffect} />
      </div>
    )
  }

  // Text — show text editor
  if (selectedEffect.kind === "text") {
    return (
      <div className="h-full overflow-y-auto bg-bg-raised">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border-subtle">
          <span className="w-2 h-2 rounded-full bg-clip-text" />
          <span className="text-xs font-medium text-text-secondary">Text Properties</span>
        </div>
        <TextPanel effect={selectedEffect} />
      </div>
    )
  }

  // Video / Image — tabbed
  const isVideo = selectedEffect.kind === "video"
  const kindColor = isVideo ? "bg-clip-video" : "bg-clip-image"
  const kindLabel = isVideo ? "Video" : "Image"
  const tabs = isVideo ? videoSubTabs : imageSubTabs

  // Default to first available tab if current tab isn't available
  const activeTab = tabs.some((t) => t.id === inspectorSubTab)
    ? inspectorSubTab
    : tabs[0].id

  return (
    <div className="h-full flex flex-col overflow-hidden bg-bg-raised">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border-subtle shrink-0">
        <span className={`w-2 h-2 rounded-full ${kindColor}`} />
        <span className="text-xs font-medium text-text-secondary truncate">
          {kindLabel}: {selectedEffect.name}
        </span>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-border-subtle shrink-0">
        {tabs.map((tab) => {
          const active = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setInspectorSubTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs transition-colors ${
                active
                  ? "bg-bg-surface text-text-primary border-b-2 border-accent"
                  : "text-text-tertiary hover:text-text-secondary hover:bg-bg-surface/50"
              }`}
            >
              <Icon size={12} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "trim" && isVideo && (
          <TrimPanel effect={selectedEffect as VideoEffect} />
        )}
        {activeTab === "filters" && <FilterPanel effect={selectedEffect} />}
        {activeTab === "animations" && <AnimationPanel effect={selectedEffect} />}
      </div>
    </div>
  )
}
