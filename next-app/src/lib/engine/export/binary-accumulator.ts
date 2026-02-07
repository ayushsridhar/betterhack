/**
 * BinaryAccumulator collects Uint8Array chunks and combines them
 * into a single Blob for download or further processing.
 *
 * Used during export to accumulate encoded video data before
 * muxing into the final MP4 container.
 */
export class BinaryAccumulator {
  private chunks: Uint8Array[] = []
  private byteCount = 0

  /** Add a chunk of binary data. */
  add(chunk: Uint8Array): void {
    this.chunks.push(chunk)
    this.byteCount += chunk.byteLength
  }

  /** Combine all accumulated chunks into a single Blob. */
  getBlob(mimeType = "video/mp4"): Blob {
    return new Blob(this.chunks as BlobPart[], { type: mimeType })
  }

  /** Return the total byte count of all accumulated chunks. */
  getSize(): number {
    return this.byteCount
  }

  /** Clear all accumulated data. */
  reset(): void {
    this.chunks = []
    this.byteCount = 0
  }

  /** Return the number of chunks accumulated. */
  get chunkCount(): number {
    return this.chunks.length
  }
}
