import type { AnyEffect, ExportStatus, Settings } from "../../types"

/**
 * VideoExport orchestrates the video export pipeline.
 *
 * Current implementation is a stub that simulates progress via setTimeout.
 * The real implementation will use WebCodecs + FFmpeg.wasm to:
 *   1. For each frame at target fps, render effects to an offscreen canvas
 *   2. Encode canvas frames via FrameEncoder (WebCodecs VideoEncoder)
 *   3. Collect encoded chunks via BinaryAccumulator
 *   4. Mux into an MP4 container
 */
export class VideoExport {
  private width = 1920
  private height = 1080
  private bitrate = 9000
  private fps = 30
  private aborted = false

  configure(settings: Settings) {
    this.width = settings.width
    this.height = settings.height
    this.bitrate = settings.bitrate
  }

  setFps(fps: number) {
    this.fps = fps
  }

  abort() {
    this.aborted = true
  }

  async startExport(
    effects: AnyEffect[],
    settings: Settings,
    onProgress: (progress: number) => void,
    onStatus: (status: ExportStatus) => void,
  ): Promise<Blob> {
    this.aborted = false
    this.configure(settings)

    const totalFrames = this.estimateTotalFrames(effects)
    const stages: { status: ExportStatus; startPct: number; endPct: number }[] = [
      { status: "demuxing", startPct: 0, endPct: 15 },
      { status: "composing", startPct: 15, endPct: 85 },
      { status: "flushing", startPct: 85, endPct: 100 },
    ]

    for (const stage of stages) {
      if (this.aborted) {
        onStatus("error")
        throw new Error("Export aborted")
      }

      onStatus(stage.status)
      await this.simulateStage(stage.startPct, stage.endPct, onProgress)
    }

    onStatus("complete")
    onProgress(100)

    // Placeholder: return empty blob. Real implementation will return encoded MP4 data.
    return new Blob([], { type: "video/mp4" })
  }

  private estimateTotalFrames(effects: AnyEffect[]): number {
    if (effects.length === 0) return this.fps * 10 // default 10 seconds

    const maxEnd = effects.reduce((max, e) => {
      const effectEnd = e.start_at_position + e.duration
      return effectEnd > max ? effectEnd : max
    }, 0)

    // maxEnd is in milliseconds, convert to frames
    return Math.ceil((maxEnd / 1000) * this.fps)
  }

  private simulateStage(
    startPct: number,
    endPct: number,
    onProgress: (progress: number) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const range = endPct - startPct
      const steps = 20
      const stepSize = range / steps
      const intervalMs = 50
      let current = 0

      const tick = () => {
        if (this.aborted) {
          reject(new Error("Export aborted"))
          return
        }

        current++
        const progress = Math.min(startPct + current * stepSize, endPct)
        onProgress(Math.round(progress))

        if (current >= steps) {
          resolve()
        } else {
          setTimeout(tick, intervalMs)
        }
      }

      setTimeout(tick, intervalMs)
    })
  }
}
