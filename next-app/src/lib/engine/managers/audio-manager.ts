import type { AudioEffect } from "../../types"

interface AudioEntry {
  audio: HTMLAudioElement
  objectUrl: string
}

export class AudioManager {
  private _entries = new Map<string, AudioEntry>()

  addAudio(effect: AudioEffect, file: File): void {
    if (this._entries.has(effect.id)) return

    const audio = document.createElement("audio")
    audio.preload = "auto"
    audio.crossOrigin = "anonymous"

    const objectUrl = URL.createObjectURL(file)
    audio.src = objectUrl

    this._entries.set(effect.id, { audio, objectUrl })
  }

  /**
   * Seek to the given position (in ms from source start) and play.
   */
  play(effectId: string, fromMs: number): void {
    const entry = this._entries.get(effectId)
    if (!entry) return

    const targetSec = fromMs / 1000
    // Only seek if notably different to avoid glitches
    if (Math.abs(entry.audio.currentTime - targetSec) > 0.05) {
      entry.audio.currentTime = targetSec
    }

    if (entry.audio.paused) {
      entry.audio.play().catch(() => {
        // Autoplay may be blocked
      })
    }
  }

  pause(effectId: string): void {
    const entry = this._entries.get(effectId)
    if (entry && !entry.audio.paused) {
      entry.audio.pause()
    }
  }

  pauseAll(): void {
    for (const entry of this._entries.values()) {
      if (!entry.audio.paused) {
        entry.audio.pause()
      }
    }
  }

  seek(effectId: string, timeMs: number): void {
    const entry = this._entries.get(effectId)
    if (entry) {
      entry.audio.currentTime = timeMs / 1000
    }
  }

  removeAudio(effectId: string): void {
    const entry = this._entries.get(effectId)
    if (!entry) return

    entry.audio.pause()
    entry.audio.src = ""
    URL.revokeObjectURL(entry.objectUrl)

    this._entries.delete(effectId)
  }

  getAudio(effectId: string): HTMLAudioElement | null {
    return this._entries.get(effectId)?.audio ?? null
  }

  destroy(): void {
    for (const effectId of Array.from(this._entries.keys())) {
      this.removeAudio(effectId)
    }
  }
}
