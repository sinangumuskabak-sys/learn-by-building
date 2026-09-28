import { useSyncExternalStore } from 'react'

export interface Store<T> {
  get(): T
  set(next: T | ((current: T) => T)): void
  subscribe(listener: () => void): () => void
}

/**
 * A tiny observable value persisted to localStorage. Storage failures (private mode, quota) are ignored so
 * the app keeps working for the current visit.
 */
export function createPersistedStore<T>(
  key: string,
  fallback: T,
  parse: (raw: unknown) => T | null,
  /** What is written to storage, when it should differ from the value itself. */
  save: (value: T) => unknown = (value) => value,
): Store<T> {
  let value = fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw !== null) value = parse(JSON.parse(raw)) ?? fallback
  } catch {
    value = fallback
  }
  const listeners = new Set<() => void>()
  return {
    get: () => value,
    set(next) {
      value = typeof next === 'function' ? (next as (current: T) => T)(value) : next
      try {
        localStorage.setItem(key, JSON.stringify(save(value)))
      } catch {
        // Keep the in-memory value even when it cannot be saved.
      }
      listeners.forEach((listener) => listener())
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}
