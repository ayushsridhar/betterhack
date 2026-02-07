/**
 * FrameEncoder wraps the WebCodecs VideoEncoder API.
 *
 * Provides a simplified interface for encoding raw VideoFrames into
 * H.264 encoded chunks. Accumulates chunks internally and returns
 * them on flush.
 *
 * Includes runtime guards for WebCodecs availability since the API
 * is not supported in all browsers.
 */

/** Check whether the WebCodecs VideoEncoder API is available. */
export function isEncoderSupported(): boolean {
  return typeof globalThis !== "undefined" && typeof globalThis.VideoEncoder !== "undefined"
}

export interface FrameEncoderConfig {
  width: number
  height: number
  bitrate: number
  fps: number
}

export class FrameEncoder {
  private encoder: VideoEncoder | null = null
  private chunks: EncodedVideoChunk[] = []
  private frameCount = 0

  /**
   * Initialize the VideoEncoder with H.264 codec at the specified settings.
   * Throws if WebCodecs is not available.
   */
  async init(width: number, height: number, bitrate: number, fps: number): Promise<void> {
    if (!isEncoderSupported()) {
      throw new Error(
        "WebCodecs VideoEncoder is not available in this browser. " +
        "Please use a Chromium-based browser (Chrome, Edge) for hardware-accelerated export."
      )
    }

    // Close existing encoder if re-initializing
    if (this.encoder) {
      try {
        if (this.encoder.state !== "closed") {
          this.encoder.close()
        }
      } catch {
        // Ignore close errors on stale encoder
      }
      this.encoder = null
    }

    this.chunks = []
    this.frameCount = 0

    const config: VideoEncoderConfig = {
      codec: "avc1.640034",
      width,
      height,
      bitrate,
      bitrateMode: "constant" as const,
      framerate: fps,
      hardwareAcceleration: "prefer-hardware",
      avc: { format: "annexb" },
    }

    // Check codec support before creating encoder
    const support = await VideoEncoder.isConfigSupported(config)
    if (!support.supported) {
      throw new Error(`Codec configuration not supported: ${config.codec} at ${width}x${height}`)
    }

    this.encoder = new VideoEncoder({
      output: (chunk: EncodedVideoChunk) => {
        this.chunks.push(chunk)
      },
      error: (error: DOMException) => {
        console.error("[FrameEncoder] Encoding error:", error)
      },
    })

    this.encoder.configure(config)
  }

  /**
   * Encode a single VideoFrame. The frame is closed after encoding.
   */
  encodeFrame(frame: VideoFrame): void {
    if (!this.encoder) {
      throw new Error("FrameEncoder not initialized. Call init() first.")
    }

    if (this.encoder.state !== "configured") {
      throw new Error(`Encoder is in unexpected state: ${this.encoder.state}`)
    }

    const keyFrame = this.frameCount % 60 === 0
    this.encoder.encode(frame, { keyFrame })
    frame.close()
    this.frameCount++
  }

  /**
   * Flush the encoder and return all accumulated chunks.
   * The encoder is closed after flushing.
   */
  async flush(): Promise<EncodedVideoChunk[]> {
    if (!this.encoder) {
      return []
    }

    if (this.encoder.state === "configured") {
      await this.encoder.flush()
    }

    const result = [...this.chunks]
    this.encoder.close()
    this.encoder = null
    this.chunks = []
    this.frameCount = 0

    return result
  }

  /** Return accumulated chunk count without flushing. */
  get chunkCount(): number {
    return this.chunks.length
  }

  /** Return total encoded byte size. */
  get totalBytes(): number {
    return this.chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0)
  }
}
