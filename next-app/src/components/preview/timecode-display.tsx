"use client"

import { useEditorStore } from "../../lib/store"
import { convertMsToHmsMs } from "../../lib/utils/time"

export function TimecodeDisplay() {
  const timecode = useEditorStore((s) => s.timecode)

  return (
    <span className="font-mono text-base text-text-primary tabular-nums tracking-wide">
      {convertMsToHmsMs(timecode)}
    </span>
  )
}
