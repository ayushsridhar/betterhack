/**
 * FrameDecoder wraps the WebCodecs VideoDecoder API.
 *
 * Provides a simplified interface for decoding encoded video chunks
 * back into VideoFrames. Useful for decoding source media files
 * during the compositing phase of export.
 *
 * Includes runtime guards for WebCodecs availability.
 */

/** Check whether the WebCodecs VideoDecoder API is available. */
export function isDecoderSupported(): boolean {
  return typeof globalThis !== "undefined" && typeof globalThis.VideoDecoder !== "undefined"
}

export class FrameDecoder {
  private decoder: VideoDecoder | null = null
  private frames: VideoFrame[] = []

  /**
   * Initialize the VideoDecoder for the given codec string.
   * Common codecs: "avc1.640034" (H.264 High), "vp8", "vp09.00.10.08".
   * Throws if WebCodecs is not available.
   */
  async init(codec: string): Promise<void> {
    if (!isDecoderSupported()) {
      throw new Error(
        "WebCodecs VideoDecoder is not available in this browser. " +
        "Please use a Chromium-based browser (Chrome, Edge) for hardware-accelerated decoding."
      )
    }

    this.frames = []

    const config: VideoDecoderConfig = {
      codec,
      hardwareAcceleration: "prefer-hardware",
    }

    const support = await VideoDecoder.isConfigSupported(config)
    if (!support.supported) {
      throw new Error(`Decoder codec not supported: ${codec}`)
    }

    this.decoder = new VideoDecoder({
      output: (frame: VideoFrame) => {
        this.frames.push(frame)
      },
      error: (error: DOMException) => {
        console.error("[FrameDecoder] Decoding error:", error)
      },
    })

    this.decoder.configure(config)
  }

  /**
   * Decode a single EncodedVideoChunk.
   * Decoded frames are accumulated internally.
   */
  decode(chunk: EncodedVideoChunk): void {
    if (!this.decoder) {
      throw new Error("FrameDecoder not initialized. Call init() first.")
    }

    if (this.decoder.state !== "configured") {
      throw new Error(`Decoder is in unexpected state: ${this.decoder.state}`)
    }

    this.decoder.decode(chunk)
  }

  /**
   * Flush the decoder and return all accumulated frames.
   * The caller is responsible for closing the returned VideoFrames
   * when they are no longer needed.
   * The decoder is closed after flushing.
   */
  async flush(): Promise<VideoFrame[]> {
    if (!this.decoder) {
      return []
    }

    if (this.decoder.state === "configured") {
      await this.decoder.flush()
    }

    const result = [...this.frames]
    this.decoder.close()
    this.decoder = null
    this.frames = []

    return result
  }

  /** Return count of decoded frames waiting to be consumed. */
  get frameCount(): number {
    return this.frames.length
  }
}
