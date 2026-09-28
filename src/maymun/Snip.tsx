import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../i18n/i18n.ts'
import { UI_ATTRIBUTE, type Region } from './capture.ts'

/** Smaller drags count as a click, which takes the whole screen. */
const MIN_DRAG = 8

/**
 * A layer over the whole screen for choosing what to take a picture of: drag for an area, click (or Enter) for the
 * whole screen, Escape to cancel.
 */
export function Snip({ onPick, onCancel }: { onPick: (region: Region) => void; onCancel: () => void }) {
  const { t } = useI18n()
  const [start, setStart] = useState<{ x: number; y: number } | null>(null)
  const [end, setEnd] = useState<{ x: number; y: number } | null>(null)
  const layer = useRef<HTMLDivElement>(null)
  const whole = () => onPick({ x: 0, y: 0, width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    layer.current?.focus()
    // Captured before the chat's own Escape handler, so Escape cancels the picture, not the chat.
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopImmediatePropagation()
      onCancel()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onCancel])

  const box =
    start && end
      ? {
          x: Math.min(start.x, end.x),
          y: Math.min(start.y, end.y),
          width: Math.abs(end.x - start.x),
          height: Math.abs(end.y - start.y),
        }
      : null

  return createPortal(
    <div
      ref={layer}
      {...{ [UI_ATTRIBUTE]: '' }}
      role="dialog"
      aria-label={t('maymun.snip.title')}
      tabIndex={-1}
      className="fixed inset-0 z-50 cursor-crosshair touch-none bg-black/25 outline-none select-none"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        setStart({ x: event.clientX, y: event.clientY })
        setEnd({ x: event.clientX, y: event.clientY })
      }}
      onPointerMove={(event) => {
        if (start) setEnd({ x: event.clientX, y: event.clientY })
      }}
      onPointerUp={() => {
        if (!box || (box.width < MIN_DRAG && box.height < MIN_DRAG)) whole()
        else onPick(box)
        setStart(null)
        setEnd(null)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') whole()
      }}
    >
      <p className="pointer-events-none fixed top-3 left-1/2 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg bg-surface px-3 py-2 text-center text-sm shadow-lg">
        {t('maymun.snip.hint')}
      </p>
      {box && (
        <div
          className="pointer-events-none fixed border-2 border-accent bg-white/10"
          style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
        />
      )}
    </div>,
    document.body,
  )
}
