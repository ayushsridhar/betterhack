"use client"

interface TransitionConfigProps {
  duration: number
  onDurationChange: (duration: number) => void
}

export function TransitionConfig({ duration, onDurationChange }: TransitionConfigProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-text-tertiary text-[10px]">Duration</label>
        <span className="text-text-secondary text-[10px] font-mono">{duration}ms</span>
      </div>
      <input
        type="range"
        min={100}
        max={3000}
        step={50}
        value={duration}
        onChange={(e) => onDurationChange(Number(e.target.value))}
        className="w-full h-1 rounded-full appearance-none bg-bg-elevated accent-accent cursor-pointer"
      />
    </div>
  )
}
