/**
 * FpsCounter tracks frame timing and computes a rolling-average
 * frames-per-second value. Used to monitor export performance.
 */
export class FpsCounter {
  private timestamps: number[] = []
  private windowSize: number

  /**
   * @param windowSize Number of recent ticks to average over (default 60).
   */
  constructor(windowSize = 60) {
    this.windowSize = windowSize
  }

  /** Record a frame tick at the current time. */
  tick(): void {
    const now = performance.now()
    this.timestamps.push(now)

    // Keep only the most recent `windowSize` entries
    if (this.timestamps.length > this.windowSize) {
      this.timestamps = this.timestamps.slice(-this.windowSize)
    }
  }

  /**
   * Compute the current FPS as a rolling average over the last
   * `windowSize` ticks. Returns 0 if fewer than 2 ticks recorded.
   */
  getFps(): number {
    if (this.timestamps.length < 2) {
      return 0
    }

    const oldest = this.timestamps[0]
    const newest = this.timestamps[this.timestamps.length - 1]
    const elapsed = newest - oldest

    if (elapsed <= 0) {
      return 0
    }

    // (number of intervals) / (time span in seconds)
    return ((this.timestamps.length - 1) / elapsed) * 1000
  }

  /** Clear all recorded timestamps. */
  reset(): void {
    this.timestamps = []
  }

  /** Return number of ticks in the current window. */
  get sampleCount(): number {
    return this.timestamps.length
  }
}
