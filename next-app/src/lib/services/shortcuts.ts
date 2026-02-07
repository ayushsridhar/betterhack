type ShortcutHandler = () => void

interface RegisteredShortcut {
  combo: string
  handler: ShortcutHandler
}

function normalizeCombo(combo: string): string {
  return combo
    .toLowerCase()
    .split("+")
    .map((part) => part.trim())
    .sort()
    .join("+")
}

function eventToCombo(e: KeyboardEvent): string {
  const parts: string[] = []
  if (e.ctrlKey || e.metaKey) parts.push("ctrl")
  if (e.shiftKey) parts.push("shift")
  if (e.altKey) parts.push("alt")

  const key = e.key.toLowerCase()
  // Avoid adding modifier keys themselves as the key part
  if (!["control", "shift", "alt", "meta"].includes(key)) {
    parts.push(key === " " ? "space" : key)
  }

  return parts.sort().join("+")
}

export class ShortcutManager {
  private shortcuts: Map<string, RegisteredShortcut> = new Map()

  register(combo: string, handler: ShortcutHandler): void {
    const normalized = normalizeCombo(combo)
    this.shortcuts.set(normalized, { combo: normalized, handler })
  }

  unregister(combo: string): void {
    const normalized = normalizeCombo(combo)
    this.shortcuts.delete(normalized)
  }

  handleKeyDown = (e: KeyboardEvent): void => {
    // Don't intercept shortcuts when user is typing in an input
    if (e.target && e.target instanceof HTMLElement) {
      const target = e.target
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }
    }

    const combo = eventToCombo(e)
    const shortcut = this.shortcuts.get(combo)

    if (shortcut) {
      e.preventDefault()
      shortcut.handler()
    }
  }

  destroy(): void {
    this.shortcuts.clear()
  }
}
