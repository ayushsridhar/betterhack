import { HistoricalState } from "../../types"
import { generateId } from "../../utils/id"

export const initialHistoricalState: HistoricalState = {
  projectName: `project-${generateId().slice(0, 6)}`,
  projectId: generateId(),
  tracks: [
    {
      id: generateId(),
      visible: true,
      locked: false,
      muted: false,
    },
  ],
  effects: [],
  filters: [],
  animations: [],
  transitions: [],
}
