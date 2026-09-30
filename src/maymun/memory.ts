import { useEffect, useSyncExternalStore } from 'react'
import type { ChatMessage } from './ai.ts'

/**
 * Maymun's conversation: one for the whole app that never resets. It goes on across panels, steps, projects, page
 * changes and reloads; each question remembers where it was asked. It is kept in pages (a few questions and answers
 * each) so it can grow without limit: only the latest part goes to the model word for word, older pages are summed
 * up, listed and looked up when needed (see window.ts). Kept in IndexedDB on this device; without IndexedDB (tests,
 * locked-down browsers) it lives for the visit only.
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
  /** The title of the page it was asked on. */
  page?: string
  /** The project of that page (see `projectOf`). */
  project?: string
}

export interface StoredMessage extends ChatMessage {
  tag?: MessageTag
  /** Notes of the memory vault this answer wrote to. */
  remembered?: string[]
  /** The model that answered (shown when a gateway picked it). */
  model?: string
  /** Earlier pages of the conversation Maymun looked at for this answer. */
  recalled?: number[]
  /** When it was sent, in ms since 1970. */
  at?: number
}

/** A page of the conversation: a few questions and their answers, stored as one record. */
export interface ChatPage {
  /** 1, 2, 3…: Maymun refers to pages by this number. */
  n: number
  messages: StoredMessage[]
  /** One line on what the page is about, written when it is summed up. */
  title?: string
}

interface Meta {
  /** Messages before this index are behind a "new chat": the model gets them only through the summary and recall. */
  windowFrom: number
  /** Messages before this index are summed up in session notes of the memory vault. */
  sessionFrom: number
  /** The running summary of the pages that left the window. */
  summary: string
  /** The pages up to this number are in the summary. */
  foldedThrough: number
}

export interface Timeline extends Meta {
  pages: ChatPage[]
  /** All messages in order (the pages joined). */
  messages: StoredMessage[]
}

/** A page closes when it holds about this many tokens; a question and its answer always share a page. */
export const PAGE_TOKENS = 1_500
/** A rough token count: Turkish and English text, code included, run near 3.5 characters a token. */
export const tokens = (text: string) => Math.ceil(text.length / 3.5)
export const messageTokens = (m: ChatMessage) => tokens(m.text) + 8

/** Adds messages to the pages; returns the pages that changed. A question starts a new page when the last is full. */
export function paginate(pages: ChatPage[], messages: StoredMessage[]): { pages: ChatPage[]; changed: ChatPage[] } {
  const next = [...pages]
  const changed = new Map<number, ChatPage>()
  for (const message of messages) {
    let last = next.at(-1)
    const full = !!last && last.messages.reduce((sum, m) => sum + messageTokens(m), 0) >= PAGE_TOKENS
    if (!last || (message.role === 'user' && full)) {
      last = { n: (last?.n ?? 0) + 1, messages: [] }
      next.push(last)
    } else {
      last = { ...last, messages: [...last.messages] }
      next[next.length - 1] = last
    }
    last.messages.push(message)
    changed.set(last.n, last)
  }
  return { pages: next, changed: [...changed.values()] }
}

/** The conversations kept per project before there was one for the whole app. */
export interface OldThread {
  project: string
  messages: StoredMessage[]
  archived?: { endedAt: number; messages: StoredMessage[] }[]
}

/**
 * The old conversations (one per project, with their earlier topics, and the app-wide one from before projects) as one
 * conversation in time order. Messages without a time take the time of the one before them in their own conversation.
 */
export function mergeThreads(threads: OldThread[], legacy: StoredMessage[] = []): StoredMessage[] {
  const all: { message: StoredMessage; at: number; order: number }[] = []
  let order = 0
  const take = (messages: StoredMessage[], project?: string) => {
    let at = 0
    for (const m of messages) {
      at = m.at ?? at
      const message = project && m.role === 'user' && !m.tag?.project ? { ...m, tag: { panel: 'page', ...m.tag, project } } : m
      all.push({ message, at, order: order++ })
    }
  }
  take(legacy)
  for (const thread of threads) {
    for (const topic of thread.archived ?? []) take(topic.messages, thread.project)
    take(thread.messages, thread.project)
  }
  return all.sort((a, b) => a.at - b.at || a.order - b.order).map((x) => x.message)
}

/** The conversation from before projects existed (one for the whole app, in localStorage). */
const LEGACY_KEY = 'lp.maymun.chat'
const DB_NAME = 'lp-maymun'
const PAGES = 'pages'
const META = 'meta'
/** Version 1 kept one conversation per project here; they move into the pages once. */
const OLD = 'threads'

let db: Promise<IDBDatabase | null> | null = null
function openDb(): Promise<IDBDatabase | null> {
  if (db) return db
  db = new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') return resolve(null)
    try {
      const request = indexedDB.open(DB_NAME, 2)
      request.onupgradeneeded = () => {
        const database = request.result
        if (!database.objectStoreNames.contains(OLD)) database.createObjectStore(OLD, { keyPath: 'project' })
        if (!database.objectStoreNames.contains(PAGES)) database.createObjectStore(PAGES, { keyPath: 'n' })
        if (!database.objectStoreNames.contains(META)) database.createObjectStore(META, { keyPath: 'key' })
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => resolve(null)
      request.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  return db
}

function getAll<T>(database: IDBDatabase, store: string): Promise<T[]> {
  return new Promise((resolve) => {
    try {
      const request = database.transaction(store).objectStore(store).getAll()
      request.onsuccess = () => resolve((request.result as T[]) ?? [])
      request.onerror = () => resolve([])
    } catch {
      resolve([])
    }
  })
}

// Pictures are big: they stay for this visit only, the message remembers there was one.
const strip = (page: ChatPage): ChatPage => ({ ...page, messages: page.messages.map(({ image, ...m }) => (image ? { ...m, shot: true } : m)) })

async function save(pages: ChatPage[], meta?: Meta, clearOld = false) {
  const database = await openDb()
  if (!database) return
  try {
    const tx = database.transaction([PAGES, META, OLD], 'readwrite')
    for (const page of pages) tx.objectStore(PAGES).put(strip(page))
    if (meta) tx.objectStore(META).put({ key: 'meta', ...meta })
    if (clearOld) tx.objectStore(OLD).clear()
  } catch {
    // Keep the conversation in memory even when it cannot be saved.
  }
}

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

const emptyMeta = (): Meta => ({ windowFrom: 0, sessionFrom: 0, summary: '', foldedThrough: 0 })
const build = (pages: ChatPage[], meta: Meta): Timeline => ({ pages, messages: pages.flatMap((p) => p.messages), ...meta })
const metaOf = ({ windowFrom, sessionFrom, summary, foldedThrough }: Meta): Meta => ({ windowFrom, sessionFrom, summary, foldedThrough })

const BLANK = build([], emptyMeta())
let state: Timeline = BLANK
let loaded = false
let loading: Promise<Timeline> | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

/** Loads the conversation (once), moving the conversations of older versions into it. */
export function loadTimeline(): Promise<Timeline> {
  if (loaded) return Promise.resolve(state)
  loading ??= (async () => {
    const database = await openDb()
    let pages = database ? (await getAll<ChatPage>(database, PAGES)).sort((a, b) => a.n - b.n) : []
    const stored = database ? (await getAll<Meta>(database, META))[0] : undefined
    let meta = stored ? { ...emptyMeta(), ...metaOf(stored) } : emptyMeta()
    const old = database ? await getAll<OldThread>(database, OLD) : []
    const legacy = takeLegacy()
    if (old.length || legacy.length) {
      // Older versions: their conversations go first, in time order; their sessions were summed up already.
      const moved = paginate([], mergeThreads(old, legacy)).pages
      const count = moved.reduce((sum, p) => sum + p.messages.length, 0)
      pages = [...moved, ...pages.map((p) => ({ ...p, n: p.n + moved.length }))]
      meta = {
        ...meta,
        windowFrom: stored ? meta.windowFrom + count : 0,
        sessionFrom: meta.sessionFrom + count,
        foldedThrough: meta.foldedThrough && meta.foldedThrough + moved.length,
      }
      void save(pages, meta, true)
    }
    // Messages added while loading come after the stored ones.
    const merged = state.messages.length ? paginate(pages, state.messages) : { pages, changed: [] }
    state = build(merged.pages, meta)
    if (merged.changed.length) void save(merged.changed, meta)
    loaded = true
    loading = null
    emit()
    return state
  })()
  return loading
}

export function getTimeline(): Timeline {
  return state
}

function change(next: (current: Timeline) => { pages?: ChatPage[]; changed?: ChatPage[]; meta?: Partial<Meta> }) {
  const { pages = state.pages, changed = [], meta } = next(state)
  state = build(pages, { ...metaOf(state), ...meta })
  // Before loading ends nothing is written: the stored conversation is read first, then these join it.
  if (loaded) void save(changed, metaOf(state))
  else void loadTimeline()
  emit()
}

export function addMessages(...messages: StoredMessage[]) {
  change((current) => paginate(current.pages, messages))
}

/** A clean start: the model no longer gets the messages so far word for word, but still their summary and pages. */
export function newChat() {
  change((current) => ({ meta: { windowFrom: current.messages.length } }))
}

/** Notes that the messages before `count` are summed up in session notes. */
export function markSessions(count: number) {
  change(() => ({ meta: { sessionFrom: count } }))
}

/** Keeps the new running summary and the titles of the pages it now covers. */
export function saveSummary(summary: string, foldedThrough: number, titles: Record<number, string>) {
  change((current) => {
    const changed: ChatPage[] = []
    const pages = current.pages.map((page) => {
      const title = titles[page.n]
      if (!title) return page
      const next = { ...page, title }
      changed.push(next)
      return next
    })
    return { pages, changed, meta: { summary, foldedThrough } }
  })
}

/**
 * Deletes a page for good. Numbers of the other pages stay. When the page was already in the running summary, the
 * summary starts over from the pages left, so nothing of the deleted page stays behind in it.
 */
export function deletePage(n: number) {
  const index = state.pages.findIndex((p) => p.n === n)
  if (index < 0) return
  const start = state.pages.slice(0, index).reduce((sum, p) => sum + p.messages.length, 0)
  const count = state.pages[index].messages.length
  const shift = (i: number) => (i <= start ? i : Math.max(start, i - count))
  const folded = n <= state.foldedThrough
  state = build(state.pages.filter((p) => p.n !== n), {
    windowFrom: shift(state.windowFrom),
    sessionFrom: shift(state.sessionFrom),
    summary: folded ? '' : state.summary,
    foldedThrough: folded ? 0 : state.foldedThrough,
  })
  void (async () => {
    const database = await openDb()
    if (!database) return
    try {
      const tx = database.transaction([PAGES, META], 'readwrite')
      tx.objectStore(PAGES).delete(n)
      tx.objectStore(META).put({ key: 'meta', ...metaOf(state) })
    } catch {
      // Gone for this visit at least.
    }
  })()
  emit()
}

/** The conversation, loaded on first use and kept up to date. */
export function useTimeline(): Timeline {
  useEffect(() => {
    void loadTimeline()
  }, [])
  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }
  return useSyncExternalStore(subscribe, getTimeline, getTimeline)
}

/** The project each message belongs to: a question's own, an answer that of its question. */
export function projectsOf(messages: StoredMessage[]): (string | undefined)[] {
  let project: string | undefined
  return messages.map((m) => {
    if (m.role === 'user') project = m.tag?.project
    return project
  })
}

/**
 * Messages as the model gets them, each question starting with where it was asked, so Maymun can connect "the
 * question you asked in the code panel" to what is on screen now.
 */
export function forModel(messages: StoredMessage[]): ChatMessage[] {
  return messages.map(({ tag, at: _at, remembered: _r, model: _m, recalled: _c, ...m }) =>
    m.role === 'user' && tag
      ? { ...m, text: `[${tag.panel} panel${tag.step ? `, step ${tag.step}` : ''}${tag.page ? `, page "${tag.page}"` : ''}] ${m.text}` }
      : m,
  )
}

/** Deletes the whole conversation (part of resetting all data). */
export async function resetAllThreads() {
  state = BLANK
  loaded = true
  loading = null
  try {
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    // Nothing to remove.
  }
  const database = await openDb()
  if (database) {
    await new Promise<void>((resolve) => {
      try {
        const tx = database.transaction([PAGES, META, OLD], 'readwrite')
        for (const store of [PAGES, META, OLD]) tx.objectStore(store).clear()
        tx.oncomplete = () => resolve()
        tx.onerror = () => resolve()
      } catch {
        resolve()
      }
    })
  }
  emit()
}

/** For tests: forget everything held in memory. */
export function resetMemoryForTests() {
  state = BLANK
  loaded = false
  loading = null
}
