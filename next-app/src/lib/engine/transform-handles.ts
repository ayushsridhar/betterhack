/**
 * TransformHandles renders interactive resize/move handles around a selected
 * PIXI display object on the compositor stage.
 */

type Container = import("pixi.js").Container
type Graphics = import("pixi.js").Graphics
type FederatedPointerEvent = import("pixi.js").FederatedPointerEvent

const HANDLE_SIZE = 8
const HANDLE_COLOR = 0x7c6cf0 // accent
const BORDER_COLOR = 0x7c6cf0
const BORDER_WIDTH = 1.5

type HandlePosition = "tl" | "tr" | "bl" | "br" | "t" | "b" | "l" | "r"

interface HandleDef {
  pos: HandlePosition
  cursor: string
  getXY: (w: number, h: number) => [number, number]
}

const HANDLE_DEFS: HandleDef[] = [
  { pos: "tl", cursor: "nwse-resize", getXY: (w, h) => [0, 0] },
  { pos: "tr", cursor: "nesw-resize", getXY: (w, h) => [w, 0] },
  { pos: "bl", cursor: "nesw-resize", getXY: (w, h) => [0, h] },
  { pos: "br", cursor: "nwse-resize", getXY: (w, h) => [w, h] },
  { pos: "t", cursor: "ns-resize", getXY: (w, h) => [w / 2, 0] },
  { pos: "b", cursor: "ns-resize", getXY: (w, h) => [w / 2, h] },
  { pos: "l", cursor: "ew-resize", getXY: (w, h) => [0, h / 2] },
  { pos: "r", cursor: "ew-resize", getXY: (w, h) => [w, h / 2] },
]

export class TransformHandles {
  private _container: Container | null = null
  private _border: Graphics | null = null
  private _handles: Map<HandlePosition, Graphics> = new Map()
  private _stage: Container | null = null
  private _targetId: string | null = null
  private _isDraggingHandle = false
  private _isDraggingBody = false
  private _dragStart = { x: 0, y: 0 }
  private _dragHandlePos: HandlePosition | null = null

  private _onUpdate: ((id: string, rect: {
    x: number; y: number; width: number; height: number
  }) => void) | null = null

  async init(stage: Container) {
    this._stage = stage
    const PIXI = await import("pixi.js")

    this._container = new PIXI.Container()
    this._container.zIndex = 9999
    this._container.eventMode = "static"
    stage.addChild(this._container)
    stage.sortableChildren = true

    // Border rectangle
    this._border = new PIXI.Graphics()
    this._container.addChild(this._border)

    // Create handles
    for (const def of HANDLE_DEFS) {
      const handle = new PIXI.Graphics()
      handle.eventMode = "static"
      handle.cursor = def.cursor

      handle.on("pointerdown", (e: FederatedPointerEvent) => {
        e.stopPropagation()
        this._isDraggingHandle = true
        this._dragHandlePos = def.pos
        this._dragStart = { x: e.globalX, y: e.globalY }
        stage.on("pointermove", this._onHandleMove)
        stage.on("pointerup", this._onHandleUp)
        stage.on("pointerupoutside", this._onHandleUp)
      })

      this._handles.set(def.pos, handle)
      this._container.addChild(handle)
    }

    this._container.visible = false
  }

  setOnUpdate(cb: (id: string, rect: {
    x: number; y: number; width: number; height: number
  }) => void) {
    this._onUpdate = cb
  }

  show(targetId: string, x: number, y: number, w: number, h: number) {
    if (!this._container || !this._border) return
    this._targetId = targetId

    this._container.position.set(x, y)
    this._container.visible = true

    // Draw border
    this._border.clear()
    this._border.rect(0, 0, w, h)
    this._border.stroke({ width: BORDER_WIDTH, color: BORDER_COLOR })

    // Make border area draggable for move
    this._border.hitArea = { contains: (px: number, py: number) => px >= 0 && px <= w && py >= 0 && py <= h }
    this._border.eventMode = "static"
    this._border.cursor = "move"
    this._border.removeAllListeners()
    this._border.on("pointerdown", (e: FederatedPointerEvent) => {
      e.stopPropagation()
      this._isDraggingBody = true
      this._dragStart = { x: e.globalX, y: e.globalY }
      this._stage?.on("pointermove", this._onBodyMove)
      this._stage?.on("pointerup", this._onBodyUp)
      this._stage?.on("pointerupoutside", this._onBodyUp)
    })

    // Position handles
    for (const def of HANDLE_DEFS) {
      const handle = this._handles.get(def.pos)
      if (!handle) continue
      handle.clear()

      const [hx, hy] = def.getXY(w, h)
      const hs = HANDLE_SIZE / 2
      handle.roundRect(hx - hs, hy - hs, HANDLE_SIZE, HANDLE_SIZE, 2)
      handle.fill({ color: 0xffffff })
      handle.stroke({ width: 1, color: HANDLE_COLOR })
    }
  }

  hide() {
    if (this._container) {
      this._container.visible = false
    }
    this._targetId = null
    this._cleanup()
  }

  get targetId() {
    return this._targetId
  }

  private _getRect(): { x: number; y: number; w: number; h: number } {
    if (!this._container || !this._border) return { x: 0, y: 0, w: 0, h: 0 }
    const bounds = this._border.getBounds()
    return {
      x: this._container.x,
      y: this._container.y,
      w: bounds.width,
      h: bounds.height,
    }
  }

  private _onBodyMove = (e: FederatedPointerEvent) => {
    if (!this._isDraggingBody || !this._container) return
    const dx = e.globalX - this._dragStart.x
    const dy = e.globalY - this._dragStart.y
    this._dragStart = { x: e.globalX, y: e.globalY }

    this._container.x += dx
    this._container.y += dy

    this._emitUpdate()
  }

  private _onBodyUp = () => {
    this._isDraggingBody = false
    this._stage?.off("pointermove", this._onBodyMove)
    this._stage?.off("pointerup", this._onBodyUp)
    this._stage?.off("pointerupoutside", this._onBodyUp)
    this._emitUpdate()
  }

  private _onHandleMove = (e: FederatedPointerEvent) => {
    if (!this._isDraggingHandle || !this._container || !this._border) return
    const dx = e.globalX - this._dragStart.x
    const dy = e.globalY - this._dragStart.y
    this._dragStart = { x: e.globalX, y: e.globalY }

    const rect = this._getRect()
    let { x, y, w, h } = rect

    const pos = this._dragHandlePos!
    // Corners and edges adjust position and size
    if (pos.includes("l")) { x += dx; w -= dx }
    if (pos.includes("r")) { w += dx }
    if (pos.includes("t")) { y += dy; h -= dy }
    if (pos.includes("b")) { h += dy }

    // Minimum size
    if (w < 20) w = 20
    if (h < 20) h = 20

    this._container.position.set(x, y)
    this.show(this._targetId!, x, y, w, h)
    // Re-set position since show() resets it
    this._container.position.set(x, y)
  }

  private _onHandleUp = () => {
    this._isDraggingHandle = false
    this._dragHandlePos = null
    this._stage?.off("pointermove", this._onHandleMove)
    this._stage?.off("pointerup", this._onHandleUp)
    this._stage?.off("pointerupoutside", this._onHandleUp)
    this._emitUpdate()
  }

  private _emitUpdate() {
    if (!this._targetId || !this._onUpdate) return
    const rect = this._getRect()
    this._onUpdate(this._targetId, {
      x: rect.x,
      y: rect.y,
      width: rect.w,
      height: rect.h,
    })
  }

  private _cleanup() {
    this._stage?.off("pointermove", this._onBodyMove)
    this._stage?.off("pointerup", this._onBodyUp)
    this._stage?.off("pointerupoutside", this._onBodyUp)
    this._stage?.off("pointermove", this._onHandleMove)
    this._stage?.off("pointerup", this._onHandleUp)
    this._stage?.off("pointerupoutside", this._onHandleUp)
    this._isDraggingBody = false
    this._isDraggingHandle = false
  }

  destroy() {
    this._cleanup()
    if (this._container?.parent) {
      this._container.parent.removeChild(this._container)
    }
    this._container?.destroy({ children: true })
    this._container = null
    this._border = null
    this._handles.clear()
  }
}
