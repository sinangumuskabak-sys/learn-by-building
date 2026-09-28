import { X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { useI18n } from '../i18n/i18n.ts'
import { useStore } from '../lib/store.ts'
import { UI_ATTRIBUTE } from './capture.ts'
import { MaymunChat } from './Chat.tsx'
import { readContext } from './context.ts'
import { boxStore, maymunStore, useMaymunSettings } from './store.ts'
import { currentPanel, pointer, startTracking } from './tracker.ts'

const SIZE = 88 // rendered width and height of the head, in pixels
const HIDDEN = 20 // how much of the head stays behind the window's right edge
const MARGIN = 12 // the popup keeps this far from the window edges
const HEADER = 64 // and stays below the app header
const MIN_BOX = { width: 288, height: 320 } // the chat box cannot be dragged smaller than this
const EYES = [
  { x: 34, y: 53 },
  { x: 66, y: 53 },
]

/**
 * Maymun, an orange cat peeking in from the middle of the window's right edge. It stays put on every page; only
 * its eyes follow the pointer (and blink now and then). A click opens a chat about the panel the learner last
 * worked in; the box can be resized from its lower left corner.
 */
export function Maymun() {
  const { t } = useI18n()
  const { visible } = useMaymunSettings()
  const layer = useRef<HTMLDivElement>(null)
  const head = useRef<HTMLButtonElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const pupils = useRef<(SVGGElement | null)[]>([])
  const [open, setOpen] = useState(false)
  const [snipping, setSnipping] = useState(false)
  const [context, setContext] = useState<ReturnType<typeof readContext> | null>(null)
  const [panelEl, setPanelEl] = useState<HTMLElement | null>(null)
  const box = useStore(boxStore)
  const [anchor, setAnchor] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!visible) return
    startTracking()
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    let nextBlink = performance.now() + 2500
    let frame = 0

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      const box = layer.current
      const button = head.current
      if (!box || !button) return
      box.style.display = currentPanel() ? 'block' : 'none'

      // Eyes: each pupil moves a little towards the pointer.
      const rect = button.getBoundingClientRect()
      const scale = SIZE / 100
      EYES.forEach((eye, i) => {
        const g = pupils.current[i]
        if (!g) return
        let dx = 0
        let dy = 0
        if (pointer.seen) {
          const ex = pointer.x - (rect.left + eye.x * scale)
          const ey = pointer.y - (rect.top + eye.y * scale)
          const d = Math.hypot(ex, ey) || 1
          const reach = Math.min(3.6, d / 25)
          dx = (ex / d) * reach
          dy = (ey / d) * reach
        }
        g.setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`)
      })

      if (!reduced && now > nextBlink) {
        svg.current?.setAttribute('data-blink', 'true')
        window.setTimeout(() => svg.current?.removeAttribute('data-blink'), 130)
        nextBlink = now + 2500 + Math.random() * 4000
      }
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [visible])

  // Keep the popup fully on screen, next to the cat: measured after it renders, again when it or the window resizes.
  const popup = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = popup.current
    if (!open || !el) return
    const place = () => {
      const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max))
      const top = Math.min(HEADER, Math.max(MARGIN, window.innerHeight - MARGIN - el.offsetHeight))
      el.style.left = `${clamp(anchor.x - MARGIN - el.offsetWidth, MARGIN, window.innerWidth - MARGIN - el.offsetWidth)}px`
      el.style.top = `${clamp(anchor.y - el.offsetHeight / 2, top, window.innerHeight - MARGIN - el.offsetHeight)}px`
    }
    place()
    const observer = new ResizeObserver(place)
    observer.observe(el)
    window.addEventListener('resize', place)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', place)
    }
  }, [open, anchor, context, box])

  // The chat is about a panel of this page: leaving the page closes it.
  const { pathname } = useLocation()
  const [openOn, setOpenOn] = useState(pathname)
  if (open && openOn !== pathname) setOpen(false)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!visible) return null

  const toggle = () => {
    if (open) return setOpen(false)
    const panel = currentPanel()
    if (!panel) return
    setContext(readContext(panel))
    setPanelEl(panel)
    setOpenOn(pathname)
    const rect = head.current?.getBoundingClientRect()
    setAnchor({ x: rect ? rect.left : window.innerWidth, y: rect ? rect.top + rect.height / 2 : 120 })
    setOpen(true)
  }

  return (
    <>
      <div ref={layer} {...{ [UI_ATTRIBUTE]: '' }} className="pointer-events-none fixed inset-0 z-20 hidden overflow-hidden print:hidden">
        <button
          ref={head}
          type="button"
          onClick={toggle}
          aria-label={t('maymun.ask')}
          aria-expanded={open}
          title={t('maymun.ask')}
          className="maymun-head pointer-events-auto absolute cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent"
          style={{ width: SIZE, height: SIZE, right: -HIDDEN, top: `calc(50% - ${SIZE / 2}px)` }}
        >
          <MaymunFace svgRef={svg} pupilRefs={pupils} />
        </button>
      </div>
      {open && context && (
        <div
          ref={popup}
          role="dialog"
          aria-label={t('maymun.name')}
          {...{ [UI_ATTRIBUTE]: '' }}
          className={`fixed top-0 left-0 z-40 flex flex-col rounded-xl border border-border bg-surface shadow-xl ${snipping ? 'invisible' : ''}`}
          style={{
            width: `min(${box.width}px, calc(100vw - ${MARGIN * 2}px))`,
            height: `min(${box.height}px, calc(100dvh - ${MARGIN * 2}px))`,
          }}
        >
          <ResizeGrip label={t('maymun.resize')} />
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
            <span className="text-lg" aria-hidden>
              🐱
            </span>
            <span className="flex-1 font-semibold">{t('maymun.name')}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('maymun.close')}
              className="rounded-md p-1 text-muted hover:text-fg"
            >
              <X size={16} />
            </button>
          </div>
          <MaymunChat panel={panelEl} context={context} onSnip={setSnipping} />
          <div className="flex items-center gap-2 border-t border-border px-4 py-2 text-xs text-muted">
            <span className="flex-1">{t('maymun.hideHint')}</span>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                maymunStore.set({ visible: false })
              }}
              className="rounded-md border border-border px-2 py-1 font-medium text-fg hover:bg-surface-2"
            >
              {t('maymun.hide')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/** Dragging the lower left corner resizes the chat box (it grows to the left, away from the cat); arrow keys too. */
function ResizeGrip({ label }: { label: string }) {
  const resize = (width: number, height: number) =>
    boxStore.set({
      width: Math.round(Math.min(Math.max(width, MIN_BOX.width), window.innerWidth - MARGIN * 2)),
      height: Math.round(Math.min(Math.max(height, MIN_BOX.height), window.innerHeight - MARGIN * 2)),
    })
  return (
    <div
      role="separator"
      aria-label={label}
      title={label}
      tabIndex={0}
      className="absolute bottom-0 left-0 z-10 size-4 cursor-nesw-resize touch-none rounded-bl-xl outline-none focus-visible:ring-2 focus-visible:ring-accent"
      style={{ background: 'linear-gradient(45deg, var(--muted) 0 2px, transparent 2px 5px, var(--muted) 5px 7px, transparent 7px)' }}
      onPointerDown={(event) => {
        event.preventDefault()
        const start = { x: event.clientX, y: event.clientY, ...boxStore.get() }
        const el = event.currentTarget
        el.setPointerCapture(event.pointerId)
        const move = (e: PointerEvent) => resize(start.width + start.x - e.clientX, start.height + e.clientY - start.y)
        const up = () => {
          el.removeEventListener('pointermove', move)
          el.removeEventListener('pointerup', up)
          el.removeEventListener('pointercancel', up)
        }
        el.addEventListener('pointermove', move)
        el.addEventListener('pointerup', up)
        el.addEventListener('pointercancel', up)
      }}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 64 : 16
        const { width, height } = boxStore.get()
        const change = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowDown: [0, step], ArrowUp: [0, -step] }[event.key]
        if (!change) return
        event.preventDefault()
        resize(width + change[0], height + change[1])
      }}
    />
  )
}

function MaymunFace({
  svgRef,
  pupilRefs,
}: {
  svgRef: React.RefObject<SVGSVGElement | null>
  pupilRefs: React.RefObject<(SVGGElement | null)[]>
}) {
  const line = { stroke: '#7c2d12', strokeWidth: 2, strokeLinecap: 'round' as const, fill: 'none' }
  return (
    <svg ref={svgRef} viewBox="0 0 100 100" className="maymun size-full" data-mood="calm" aria-hidden>
      <g className="m-part m-ear-l">
        <path d="M14 44 L20 5 L44 26 Z" fill="#fb923c" stroke="#9a3412" strokeWidth="2" strokeLinejoin="round" />
        <path d="M21 34 L23 15 L36 26 Z" fill="#fda4af" />
      </g>
      <g className="m-part m-ear-r">
        <path d="M56 26 L80 5 L86 44 Z" fill="#fb923c" stroke="#9a3412" strokeWidth="2" strokeLinejoin="round" />
        <path d="M64 26 L77 15 L79 34 Z" fill="#fda4af" />
      </g>
      <ellipse cx="50" cy="57" rx="41" ry="34" fill="#fb923c" stroke="#9a3412" strokeWidth="2" />
      <g stroke="#c2410c" strokeWidth="3" strokeLinecap="round">
        <path d="M44 25 L45 36" />
        <path d="M50 24 L50 37" />
        <path d="M56 25 L55 36" />
        <path d="M10 58 L20 60" />
        <path d="M11 67 L20 66" />
        <path d="M90 58 L80 60" />
        <path d="M89 67 L80 66" />
      </g>
      <ellipse cx="50" cy="72" rx="17" ry="12" fill="#fff7ed" />
      {[0, 1].map((i) => (
        <g key={i} className="m-part m-lid">
          <g className="m-part m-eye">
            <ellipse cx={EYES[i].x} cy={EYES[i].y} rx="9" ry="10" fill="#ffffff" stroke="#7c2d12" strokeWidth="1.5" />
            <g
              ref={(el) => {
                pupilRefs.current[i] = el
              }}
            >
              <g className="m-part m-pupil">
                <circle cx={EYES[i].x} cy={EYES[i].y + 1} r="4.8" fill="#1c1917" />
                <circle cx={EYES[i].x + 1.6} cy={EYES[i].y - 1} r="1.6" fill="#ffffff" />
              </g>
            </g>
          </g>
        </g>
      ))}
      <path className="m-part m-brow" d="M24 37 L42 43" {...line} strokeWidth="3" />
      <path className="m-part m-brow" d="M76 37 L58 43" {...line} strokeWidth="3" />
      <ellipse className="m-part m-blush" cx="23" cy="67" rx="6" ry="3.5" fill="#f472b6" />
      <ellipse className="m-part m-blush" cx="77" cy="67" rx="6" ry="3.5" fill="#f472b6" />
      <path d="M46 65 L54 65 L50 69 Z" fill="#f472b6" />
      <path className="m-part m-mouth" d="M50 69 Q46 75 42 73 M50 69 Q54 75 58 73" {...line} strokeWidth="1.8" />
      <path className="m-part m-mouth-open" d="M43 71 Q50 83 57 71 Q50 75 43 71 Z" fill="#9f1239" />
      <g {...line} strokeWidth="1.2" stroke="#7c2d12" opacity="0.7">
        <path d="M34 72 L14 70" />
        <path d="M34 75 L15 78" />
        <path d="M66 72 L86 70" />
        <path d="M66 75 L85 78" />
      </g>
      <g className="m-part m-paw">
        <ellipse cx="18" cy="93" rx="12" ry="7" fill="#fb923c" stroke="#9a3412" strokeWidth="2" />
        <path d="M14 89 L14 96 M19 88 L19 97 M24 89 L24 96" stroke="#9a3412" strokeWidth="1.2" />
      </g>
    </svg>
  )
}
