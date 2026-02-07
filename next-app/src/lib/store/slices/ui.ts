export type LeftPanelTab = "media" | "templates"
export type RightPanelTab = "inspector" | "settings"

export interface UIState {
  leftPanelTab: LeftPanelTab
  rightPanelTab: RightPanelTab
  inspectorSubTab: "filters" | "animations" | "transitions" | "text"
  isExportModalOpen: boolean
}

export const initialUIState: UIState = {
  leftPanelTab: "media",
  rightPanelTab: "inspector",
  inspectorSubTab: "filters",
  isExportModalOpen: false,
}
