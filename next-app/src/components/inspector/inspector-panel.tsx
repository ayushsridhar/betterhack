"use client"

import { useEditorStore } from "../../lib/store"
import { ProjectSettings } from "./project-settings"
import { FilterPanel } from "./filters/filter-panel"
import { AnimationPanel } from "./animations/animation-panel"
import { TransitionPanel } from "./transitions/transition-panel"
import { TextPanel } from "./text/text-panel"
import { Settings, Sliders, Sparkles, ArrowRightLeft, Music } from "lucide-react"

const visualSubTabs = [
  { id: "filters" as const, label: "Filters", icon: Sliders },
  { id: "animations" as const, label: "Animations", icon: Sparkles },
  { id: "transitions" as const, label: "Transitions", icon: ArrowRightLeft },
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

  // Audio — minimal display
  if (selectedEffect.kind === "audio") {
    return (
      <div className="h-full overflow-y-auto bg-bg-raised">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border-subtle">
          <Music size={14} className="text-clip-audio" />
          <span className="text-xs font-medium text-text-secondary">Audio</span>
        </div>
        <div className="p-3 space-y-3">
          <div>
            <label className="text-text-tertiary text-xs">Name</label>
            <p className="text-text-primary text-sm mt-1">{selectedEffect.name}</p>
          </div>
          <div>
            <label className="text-text-tertiary text-xs">Duration</label>
            <p className="text-text-primary text-sm mt-1">
              {(selectedEffect.duration / 1000).toFixed(2)}s
            </p>
          </div>
          <div>
            <label className="text-text-tertiary text-xs">Start</label>
            <p className="text-text-primary text-sm mt-1">
              {(selectedEffect.start / 1000).toFixed(2)}s
            </p>
          </div>
          <div>
            <label className="text-text-tertiary text-xs">End</label>
            <p className="text-text-primary text-sm mt-1">
              {(selectedEffect.end / 1000).toFixed(2)}s
            </p>
          </div>
        </div>
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

  // Video / Image — tabbed: Filters | Animations | Transitions
  const kindColor = selectedEffect.kind === "video" ? "bg-clip-video" : "bg-clip-image"
  const kindLabel = selectedEffect.kind === "video" ? "Video" : "Image"

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
        {visualSubTabs.map((tab) => {
          const active = inspectorSubTab === tab.id
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
        {inspectorSubTab === "filters" && <FilterPanel effect={selectedEffect} />}
        {inspectorSubTab === "animations" && <AnimationPanel effect={selectedEffect} />}
        {inspectorSubTab === "transitions" && <TransitionPanel effect={selectedEffect} />}
      </div>
    </div>
  )
}
