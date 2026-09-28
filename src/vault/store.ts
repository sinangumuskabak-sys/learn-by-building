import { useEffect, useSyncExternalStore } from 'react'
import { catalog } from '../content/catalog.ts'
import { games } from '../games/catalog.ts'
import { langStore } from '../i18n/i18n.ts'
import { progressStore, type Progress } from '../progress/progress.ts'
import { applyOps, memoryPrompt, type MemoryOp, type NoteText } from './maymun-memory.ts'
import { writeSection } from './sections.ts'
import { sessionNote, withSessionList, type Summary } from './sessions.ts'
import { applyAuto, instructionsText, journalNotes, vaultNotes, type NoteSpec, type VaultSource } from './skeleton.ts'

/**
 * The memory vault: Markdown notes kept in IndexedDB on this device (no server, no Obsidian needed). On first use the
 * skeleton is built from the catalog; new content adds its notes; the app-owned parts follow progress; reset turns it
 * back into the skeleton. Without IndexedDB (tests, locked-down browsers) the vault lives for the visit only.
 */

export interface VaultFile {
  path: string
  content: string
  updatedAt: string
}

const DB_NAME = 'lp-vault'
const STORE = 'files'

let db: Promise<IDBDatabase | null> | null = null
function openDb(): Promise<IDBDatabase | null> {
  if (db) return db
  db = new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') return resolve(null)
    try {
      const request = indexedDB.open(DB_NAME, 1)
      request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'path' })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => resolve(null)
      request.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  return db
}

async function readAll(): Promise<VaultFile[]> {
  const database = await openDb()
  if (!database) return []
  return new Promise((resolve) => {
    try {
      const request = database.transaction(STORE).objectStore(STORE).getAll()
      request.onsuccess = () => resolve(request.result as VaultFile[])
      request.onerror = () => resolve([])
    } catch {
      resolve([])
    }
  })
}

async function writeMany(files: VaultFile[], clear = false) {
  const database = await openDb()
  if (!database || (!files.length && !clear)) return
  await new Promise<void>((resolve) => {
    try {
      const tx = database.transaction(STORE, 'readwrite')
      const store = tx.objectStore(STORE)
      if (clear) store.clear()
      for (const file of files) store.put(file)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
      tx.onabort = () => resolve()
    } catch {
      resolve()
    }
  })
}

const files = new Map<string, VaultFile>()
let snapshot: VaultFile[] = []
let ready: Promise<void> | null = null
const listeners = new Set<() => void>()
const emit = () => {
  snapshot = [...files.values()].sort((a, b) => a.path.localeCompare(b.path))
  listeners.forEach((listener) => listener())
}

function source(): VaultSource {
  return {
    categories: catalog.curriculum.categories,
    challenges: new Map([...catalog.challenges.values()].map(({ challenge }) => [challenge.id, challenge])),
    games,
    skills: catalog.skills,
    lang: langStore.get(),
  }
}

let specs: NoteSpec[] | null = null
function allSpecs(progress: Progress): NoteSpec[] {
  specs ??= vaultNotes(source())
  return [...specs, ...journalNotes(source(), progress, specs)]
}

/** Adds missing notes and brings app-owned parts up to date; writes only what changed. */
async function sync(progress: Progress) {
  const now = new Date().toISOString()
  const changed: VaultFile[] = []
  for (const spec of allSpecs(progress)) {
    const current = files.get(spec.path)
    const content = applyAuto(current?.content ?? spec.template, spec, progress)
    if (content !== current?.content) {
      const file = { path: spec.path, content, updatedAt: now }
      files.set(spec.path, file)
      changed.push(file)
    }
  }
  if (changed.length) {
    emit()
    await writeMany(changed)
  }
}

/** Loads the vault (building the skeleton the first time) and keeps it following progress. Safe to call often. */
export function startVault(): Promise<void> {
  if (ready) return ready
  ready = (async () => {
    for (const file of await readAll()) files.set(file.path, file)
    await sync(progressStore.get())
    emit()
    let timer = 0
    progressStore.subscribe(() => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => void sync(progressStore.get()), 500)
    })
  })()
  return ready
}

/** Back to the empty skeleton (in the current interface language), as part of resetting all data. */
export async function resetVault() {
  await startVault()
  files.clear()
  specs = null
  await writeMany([], true)
  await sync(progressStore.get())
  emit()
}

export function vaultFiles(): VaultFile[] {
  return snapshot
}

export function readVaultFile(path: string): VaultFile | undefined {
  return files.get(path)
}

/** Replaces a note (used for the learner's notes and, later, Maymun's updates). */
export async function writeVaultFile(path: string, content: string) {
  const file = { path, content, updatedAt: new Date().toISOString() }
  files.set(path, file)
  emit()
  await writeMany([file])
}

const front = (content: string, key: string) => {
  const end = content.indexOf('\n---', 3)
  return new RegExp(`^${key}: (.+)$`, 'm').exec(end > 0 ? content.slice(0, end) : '')?.[1]?.trim()
}

/**
 * The notes that matter for a question, most important first: the step's (or challenge's) note, the project's
 * status, the learner profile, the overview, then the skills the step practises.
 */
export async function notesFor(project: string, step?: string): Promise<NoteText[]> {
  await startVault()
  const byId = new Map<string, VaultFile>()
  const byType = new Map<string, VaultFile>()
  for (const file of files.values()) {
    const id = front(file.content, 'id')
    const type = front(file.content, 'type')
    if (id) byId.set(id, file)
    if (type && !byType.has(type)) byType.set(type, file)
  }
  const picked: (VaultFile | undefined)[] = []
  if (project.startsWith('game:')) {
    if (step) picked.push(byId.get(`${project}/${step}`))
    picked.push(byId.get(project))
  } else if (project.startsWith('challenge:')) {
    picked.push(byId.get(project.slice('challenge:'.length)))
  }
  picked.push(byType.get('profile'), byType.get('overview'))
  // Skills linked from the step's or challenge's note.
  const first = picked[0]
  if (first && !['profile', 'overview'].includes(front(first.content, 'type') ?? '')) {
    for (const match of first.content.matchAll(/\[\[([^\]|]+)\|/g)) {
      const skill = files.get(`${match[1]}.md`)
      if (skill && front(skill.content, 'type') === 'skill' && picked.length < 8) picked.push(skill)
    }
  }
  return [...new Set(picked.filter((f): f is VaultFile => !!f))].map((f) => ({ path: f.path, content: f.content }))
}

/** The memory part of Maymun's system prompt for a question, and the notes it may write to. */
export async function memoryFor(project: string, step?: string) {
  return memoryPrompt(await notesFor(project, step), instructionsText(langStore.get()))
}

const EMPTY = /^_\((henüz boş|henüz yok|empty so far|none yet)\)_$/

/** Writes what Maymun put in its memory block; returns the notes that changed. */
export async function applyMemory(ops: MemoryOp[], allowed: ReadonlySet<string>): Promise<string[]> {
  await startVault()
  const notes = new Map([...files.values()].map((f) => [f.path, f.content]))
  const changed = applyOps(ops, notes, allowed, EMPTY)
  const now = new Date().toISOString()
  const written = changed.map(({ path, content }) => ({ path, content, updatedAt: now }))
  for (const file of written) files.set(file.path, file)
  if (written.length) {
    emit()
    await writeMany(written)
  }
  return written.map((f) => f.path)
}

/** Keeps a session summary as a note next to the project's note, lists it there, and updates "next". */
export async function saveSession(project: string, projectTitle: string, summary: Summary, ended: Date): Promise<string | null> {
  const [main] = await notesFor(project)
  const type = main ? front(main.content, 'type') : undefined
  if (!main || (type !== 'game' && type !== 'challenge')) return null
  const note = sessionNote(main.path, projectTitle, summary, ended, langStore.get())
  const now = new Date().toISOString()
  const dir = note.path.split('/').slice(0, -1).join('/')
  const sessions = [...files.keys(), note.path].filter((p) => p.startsWith(`${dir}/`))
  let status = withSessionList(main.content, [...new Set(sessions)])
  if (summary.next) status = writeSection(status, 'maymun', 'next', summary.next)
  const written = [
    { path: note.path, content: note.content, updatedAt: now },
    { path: main.path, content: status, updatedAt: now },
  ]
  for (const file of written) files.set(file.path, file)
  emit()
  await writeMany(written)
  return note.path
}

export function useVault(): VaultFile[] {
  useEffect(() => {
    void startVault()
  }, [])
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    vaultFiles,
    vaultFiles,
  )
}
