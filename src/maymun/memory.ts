import { useEffect, useSyncExternalStore } from 'react'
import type { ChatMessage } from './ai.ts'

/**
 * Maymun's memory, one conversation per project (a game, a challenge, or everything else). The task, code, game and
 * checks panels of a project share it, and it goes on across steps, page changes and reloads. Kept in IndexedDB on
 * this device; without IndexedDB (tests, locked-down browsers) it lives for the visit only.
 */

/** Which project a page belongs to, and the step it shows. */
export interface Project {
  /** `game:snake`, `challenge:loop-basics-quiz` or `general`. */
  key: string
  step?: string
}

export function projectOf(pathname: string): Project {
  const game = /^\/games\/([^/]+)(?:\/([^/]+))?/.exec(pathname)
  if (game) return { key: `game:${game[1]}`, ...(game[2] ? { step: game[2] } : {}) }
  const challenge = /^\/learn\/([^/]+)/.exec(pathname)
  if (challenge) return { key: `challenge:${challenge[1]}` }
  return { key: 'general' }
}

/** Where a question was asked. */
export interface MessageTag {
  panel: string
  step?: string
}

export interface StoredMessage extends ChatMessage {
  tag?: MessageTag
  /** When it was sent, in ms since 1970. */
  at?: number
}

export interface Thread {
  project: string
  messages: StoredMessage[]
  /** Earlier topics of this project ("New topic" puts the current one here); M2 will summarise them. */
  archived: { endedAt: number; messages: StoredMessage[] }[]
}

/** The latest messages kept per project, and how many of them go to the model with each question. */
const MAX_KEPT = 200
export const MAX_SENT = 40
const MAX_ARCHIVED = 20
/** The conversation from before projects existed (one for the whole app); it moves into the first project opened. */
const LEGACY_KEY = 'lp.maymun.chat'

const DB_NAME = 'lp-maymun'
const STORE = 'threads'

let db: Promise<IDBDatabase | null> | null = null
function openDb(): Promise<IDBDatabase | null> {
  if (db) return db
  db = new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') return resolve(null)
    try {
      const request = indexedDB.open(DB_NAME, 1)
      request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'project' })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => resolve(null)
      request.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  return db
}

async function read(project: string): Promise<Thread | null> {
  const database = await openDb()
  if (!database) return null
  return new Promise((resolve) => {
    try {
      const request = database.transaction(STORE).objectStore(STORE).get(project)
      request.onsuccess = () => resolve((request.result as Thread | undefined) ?? null)
      request.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

async function write(thread: Thread) {
  const database = await openDb()
  if (!database) return
  try {
    // Pictures are big: they stay for this visit only, the message remembers there was one.
    const strip = (messages: StoredMessage[]) => messages.map(({ image, ...m }) => (image ? { ...m, shot: true } : m))
    database
      .transaction(STORE, 'readwrite')
      .objectStore(STORE)
      .put({ ...thread, messages: strip(thread.messages), archived: thread.archived.map((a) => ({ ...a, messages: strip(a.messages) })) })
  } catch {
    // Keep the in-memory thread even when it cannot be saved.
  }
}

const empty = (project: string): Thread => ({ project, messages: [], archived: [] })
const cache = new Map<string, Thread>()
const loading = new Map<string, Promise<Thread>>()
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

function takeLegacy(): StoredMessage[] {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (raw === null) return []
    localStorage.removeItem(LEGACY_KEY)
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed
          .filter((m): m is StoredMessage => (m?.role === 'user' || m?.role === 'assistant') && typeof m.text === 'string')
          .map((m) => ({ role: m.role, text: m.text, ...(m.shot ? { shot: true } : {}) }))
      : []
  } catch {
    return []
  }
}

/** Loads a project's conversation (once), moving the old app-wide conversation into it if there is one. */
export function loadThread(project: string): Promise<Thread> {
  const cached = cache.get(project)
  if (cached) return Promise.resolve(cached)
  let pending = loading.get(project)
  if (!pending) {
    pending = read(project).then((stored) => {
      let thread = cache.get(project) ?? stored ?? empty(project)
      const legacy = takeLegacy()
      if (legacy.length) {
        thread = { ...thread, messages: [...legacy, ...thread.messages].slice(-MAX_KEPT) }
        void write(thread)
      }
      cache.set(project, thread)
      loading.delete(project)
      emit()
      return thread
    })
    loading.set(project, pending)
  }
  return pending
}

/** Empty threads handed out before loading ends; the same object each time, as React's store hook needs. */
const blanks = new Map<string, Thread>()

export function getThread(project: string): Thread {
  const thread = cache.get(project)
  if (thread) return thread
  if (!blanks.has(project)) blanks.set(project, empty(project))
  return blanks.get(project)!
}

function update(project: string, change: (thread: Thread) => Thread) {
  const apply = () => {
    const next = change(getThread(project))
    cache.set(project, next)
    void write(next)
    emit()
  }
  // Never write over a stored conversation that has not been read yet.
  if (cache.has(project)) apply()
  else void loadThread(project).then(apply)
}

export function addToThread(project: string, ...messages: StoredMessage[]) {
  update(project, (thread) => ({ ...thread, messages: [...thread.messages, ...messages].slice(-MAX_KEPT) }))
}

/** Starts a clean conversation in the project; the current one is kept as an earlier topic. */
export function newTopic(project: string) {
  update(project, (thread) =>
    thread.messages.length === 0
      ? thread
      : {
          ...thread,
          messages: [],
          archived: [...thread.archived, { endedAt: Date.now(), messages: thread.messages }].slice(-MAX_ARCHIVED),
        },
  )
}

/** A project's conversation, loaded on first use and kept up to date. */
export function useThread(project: string): Thread {
  useEffect(() => {
    void loadThread(project)
  }, [project])
  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }
  return useSyncExternalStore(subscribe, () => getThread(project), () => getThread(project))
}

/**
 * The conversation as the model gets it: the latest messages, each question starting with where it was asked, so
 * Maymun can connect "the question you asked in the code panel" to what is on screen now.
 */
export function forModel(messages: StoredMessage[]): ChatMessage[] {
  return messages.slice(-MAX_SENT).map(({ tag, at: _at, ...m }) =>
    m.role === 'user' && tag ? { ...m, text: `[${tag.panel} panel${tag.step ? `, step ${tag.step}` : ''}] ${m.text}` } : m,
  )
}

/** For tests: forget everything cached. */
export function resetMemoryForTests() {
  cache.clear()
  loading.clear()
  blanks.clear()
}
