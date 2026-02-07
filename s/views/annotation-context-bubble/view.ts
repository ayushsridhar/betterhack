import {html} from "@benev/slate"
import {shadow_view} from "../../context/context.js"
import type {Annotation, AnnotationContext, Point, Settings} from "../../context/types.js"
import type {Actions} from "../../context/actions.js"
import {styles} from "./styles.js"

const SPEEDS: Array<AnnotationContext['transitionSpeed']> = ['slow', 'medium', 'fast']
const SIZES: Array<AnnotationContext['transitionSize']> = ['small', 'medium', 'large']

function getAnnotationAnchor(annotation: Annotation): { x: number; y: number } | null {
	const c = annotation.coordinates
	switch (annotation.type) {
		case 'arrow':
			return c.end ?? null
		case 'rectangle':
			if (c.start && c.end)
				return { x: (c.start.x + c.end.x) / 2, y: (c.start.y + c.end.y) / 2 }
			return null
		case 'circle':
			return c.center ?? null
		case 'freehand':
			if (c.path?.length) {
				const xs = c.path.map(p => p.x)
				const ys = c.path.map(p => p.y)
				return {
					x: (Math.min(...xs) + Math.max(...xs)) / 2,
					y: (Math.min(...ys) + Math.max(...ys)) / 2
				}
			}
			return null
		default:
			return null
	}
}

function updateBubblePosition(
	bubbleEl: HTMLElement,
	container: HTMLElement,
	annotation: Annotation,
	settings: Settings,
	offsetPx: number
) {
	const rect = container.getBoundingClientRect()
	const anchor = getAnnotationAnchor(annotation)
	if (!anchor) return
	const scaleX = rect.width / settings.width
	const scaleY = rect.height / settings.height
	const x = rect.left + anchor.x * scaleX + offsetPx
	const y = rect.top + anchor.y * scaleY
	bubbleEl.style.left = `${x}px`
	bubbleEl.style.top = `${y}px`
}

export const AnnotationContextBubble = shadow_view(use => (
	container: HTMLElement | null,
	annotation: Annotation | null,
	settings: Settings,
	actions: Actions
) => {
	use.styles(styles)

	if (!annotation || !container) {
		return html`<div style="display: none"></div>`
	}

	const ctx = annotation.context ?? {}
	const id = annotation.id

	use.defer(() => {
		const bubbleEl = use.shadow.querySelector('.annotation-context-bubble') as HTMLElement | null
		if (bubbleEl && container && annotation)
			updateBubblePosition(bubbleEl, container, annotation, settings, 16)
	})

	use.mount(() => {
		const bubbleEl = use.shadow.querySelector('.annotation-context-bubble') as HTMLElement | null
		if (!bubbleEl || !container) return () => {}
		const ro = new ResizeObserver(() => {
			if (container && annotation)
				updateBubblePosition(bubbleEl, container, annotation, settings, 16)
		})
		ro.observe(container)
		return () => ro.disconnect()
	})

	const setContext = (patch: Partial<AnnotationContext>) => {
		actions.update_annotation(id, {
			context: { ...ctx, ...patch }
		})
	}

	return html`
		<div class="annotation-context-bubble" @click=${(e: Event) => e.stopPropagation()}>
			<div class="header">
				<h3>Annotation context</h3>
				<button class="close" type="button" @click=${() => actions.set_selected_annotation(null)} aria-label="Close">×</button>
			</div>
			<div class="field">
				<label>Transition speed</label>
				<div class="buttons">
					${SPEEDS.map(s => html`
						<button
							type="button"
							?data-selected=${ctx.transitionSpeed === s}
							@click=${() => setContext({ transitionSpeed: s })}
						>${s}</button>
					`)}
				</div>
			</div>
			<div class="field">
				<label>Transition size</label>
				<div class="buttons">
					${SIZES.map(s => html`
						<button
							type="button"
							?data-selected=${ctx.transitionSize === s}
							@click=${() => setContext({ transitionSize: s })}
						>${s}</button>
					`)}
				</div>
			</div>
			<div class="field">
				<label>Notes</label>
				<input
					type="text"
					placeholder="Optional details..."
					.value=${ctx.notes ?? ''}
					@input=${(e: Event) => setContext({ notes: (e.target as HTMLInputElement).value })}
				/>
			</div>
		</div>
	`
})
