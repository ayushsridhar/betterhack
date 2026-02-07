export type LeftPanelTab = "media" | "text"
export type RightPanelTab = "inspector" | "settings"

export interface UIState {
  leftPanelTab: LeftPanelTab
  rightPanelTab: RightPanelTab
  inspectorSubTab: "trim" | "filters" | "animations" | "text"
  isExportModalOpen: boolean
}

export const initialUIState: UIState = {
  leftPanelTab: "media",
  rightPanelTab: "inspector",
  inspectorSubTab: "filters",
  isExportModalOpen: false,
}
