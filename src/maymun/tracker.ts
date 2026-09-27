/**
 * Where the pointer is and which panel it is over, for Maymun the cat. Panels mark themselves with
 * `data-maymun="task" | "code" | "game" | "results" | "page"`; the cat moves to the panel the pointer was last over.
 * Iframes (the game) swallow pointer events, so each one reports its own through `trackFrame`.
 */
export interface PointerState {
  x: number
  y: number
  /** False until the first pointer event: the cat then just looks ahead. */
  seen: boolean
}

export const pointer: PointerState = { x: 0, y: 0, seen: false }

let activePanel: HTMLElement | null = null
const PANEL = '[data-maymun]'

function note(x: number, y: number, target: EventTarget | null) {
  pointer.x = x
  pointer.y = y
  pointer.seen = true
  const panel = target instanceof Element ? target.closest<HTMLElement>(PANEL) : null
  // Between the inner panels (headers, handles) the pointer is only over the page: keep the cat where it was.
  if (panel && !(panel.dataset.maymun === 'page' && panel.querySelector(PANEL))) activePanel = panel
}

const visible = (el: Element) => {
  const rect = el.getBoundingClientRect()
  return el.isConnected && rect.width > 0 && rect.height > 0
}

/** The panel the cat belongs in: the last one under the pointer, or the first visible one. */
export function currentPanel(): HTMLElement | null {
  // The page itself only counts while it has no inner panels (it stays the same element when the route changes).
  if (activePanel && visible(activePanel) && !(activePanel.dataset.maymun === 'page' && activePanel.querySelector(PANEL)))
    return activePanel
  const panels = [...document.querySelectorAll<HTMLElement>(PANEL)].filter(visible)
  // Prefer an inner panel (task, code, game) over the whole page.
  return panels.find((p) => p.dataset.maymun !== 'page') ?? panels[0] ?? null
}

let started = false

export function startTracking() {
  if (started) return
  started = true
  const onPointer = (event: PointerEvent) => note(event.clientX, event.clientY, event.target)
  document.addEventListener('pointermove', onPointer, { capture: true, passive: true })
  document.addEventListener('pointerdown', onPointer, { capture: true, passive: true })
}

/** Follow the pointer inside a same-origin iframe too, converting its coordinates to the page's. */
export function trackFrame(frame: HTMLIFrameElement) {
  let doc: Document | null = null
  try {
    doc = frame.contentDocument
  } catch {
    return
  }
  if (!doc) return
  const onPointer = (event: PointerEvent) => {
    const rect = frame.getBoundingClientRect()
    note(rect.left + event.clientX, rect.top + event.clientY, frame)
  }
  doc.addEventListener('pointermove', onPointer, { capture: true, passive: true })
  doc.addEventListener('pointerdown', onPointer, { capture: true, passive: true })
}
