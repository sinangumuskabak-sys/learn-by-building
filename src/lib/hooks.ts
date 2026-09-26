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
    document.title = title ? `${title} · Learn Platform` : 'Learn Platform'
  }, [title])
}

/** Calls `fn` with the latest value once it has stopped changing for `ms` milliseconds. */
export function useDebouncedEffect<T>(value: T, ms: number, fn: (value: T) => void) {
  const fnRef = useRef(fn)
  useEffect(() => {
    fnRef.current = fn
  })
  useEffect(() => {
    const timer = setTimeout(() => fnRef.current(value), ms)
    return () => clearTimeout(timer)
  }, [value, ms])
}
