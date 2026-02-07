"use client"

interface AnimationCardProps {
  name: string
  active: boolean
  onClick: () => void
}

function formatName(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export function AnimationCard({ name, active, onClick }: AnimationCardProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded p-2 cursor-pointer text-left text-xs transition-colors ${
        active
          ? "bg-accent/20 text-accent border border-accent/40"
          : "bg-bg-surface border border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary"
      }`}
    >
      {formatName(name)}
    </button>
  )
}
