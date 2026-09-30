import { useEffect, useRef, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(query).matches)
  useEffect(() => {
    const media = matchMedia(query)
    const onChange = () => setMatches(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])
  return matches
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · Learn by Building` : 'Learn by Building'
  }, [title])
}

/**
 * Calls `fn` with the latest value once it has stopped changing for `ms` milliseconds. With `flushOnLeave`, a
 * pending call also runs when the component unmounts or the page is hidden (reload, tab close), so saves are not lost.
 */
export function useDebouncedEffect<T>(value: T, ms: number, fn: (value: T) => void, { flushOnLeave = false } = {}) {
  const fnRef = useRef(fn)
  const pending = useRef<{ value: T } | null>(null)
  useEffect(() => {
    fnRef.current = fn
  })
  useEffect(() => {
    pending.current = { value }
    const timer = setTimeout(() => {
      pending.current = null
      fnRef.current(value)
    }, ms)
    return () => clearTimeout(timer)
  }, [value, ms])
  useEffect(() => {
    if (!flushOnLeave) return
    const flush = () => {
      if (!pending.current) return
      const { value: latest } = pending.current
      pending.current = null
      fnRef.current(latest)
    }
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [flushOnLeave])
}
