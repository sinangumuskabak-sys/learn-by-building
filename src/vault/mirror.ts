import { createPersistedStore, type Store } from '../lib/store.ts'
import { aiStore, baseFor } from '../maymun/store.ts'
import { obsidianSettings, skillsFolderOf } from './obsidian.ts'
import { splitMyNotes, writeMyNotes } from './sections.ts'
import { onVaultWrite, readVaultFile, startVault, vaultFiles, writeVaultFile, type VaultFile } from './store.ts'

/**
 * The live Obsidian mirror: with the Maymun bridge started with `--vault <folder>`, every note the app writes is copied
 * into `<folder>/Learn Platform/`, and what the learner writes under "My notes" there (in Obsidian) comes back. Optional;
 * the vault works without it.
 */

export const mirrorStore = createPersistedStore<{ enabled: boolean }>('lp.vault.mirror', { enabled: false }, (raw) => {
  const value = raw as { enabled?: unknown } | null
  return value && typeof value === 'object' ? { enabled: value.enabled === true } : null
})

export type MirrorState = 'off' | 'no-key' | 'offline' | 'no-vault' | 'on' | 'error'

export interface MirrorStatus {
  state: MirrorState
  /** Where the notes go on disk, when on. */
  folder?: string
}

function createStore<T>(initial: T): Store<T> {
  let value = initial
  const listeners = new Set<() => void>()
  return {
    get: () => value,
    set(next) {
      value = typeof next === 'function' ? (next as (current: T) => T)(value) : next
      listeners.forEach((listener) => listener())
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export const mirrorStatus = createStore<MirrorStatus>({ state: 'off' })

function connection() {
  const ai = aiStore.get()
  const key = ai.keys.bridge
  return key ? { key, url: `${baseFor(ai, 'bridge').replace(/\/+$/, '')}/vault` } : null
}

async function call(method: 'GET' | 'POST', body?: unknown): Promise<{ folder?: string; files?: (VaultFile & { mtime: number })[] } | null> {
  const bridge = connection()
  if (!bridge) {
    mirrorStatus.set({ state: 'no-key' })
    return null
  }
  let response: Response
  try {
    response = await fetch(bridge.url, {
      method,
      headers: { Authorization: `Bearer ${bridge.key}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  } catch {
    mirrorStatus.set({ state: 'offline' })
    return null
  }
  if (response.status === 404) {
    mirrorStatus.set({ state: 'no-vault' })
    return null
  }
  if (!response.ok) {
    mirrorStatus.set({ state: 'error' })
    return null
  }
  const data = (await response.json()) as { folder?: string; files?: (VaultFile & { mtime: number })[] }
  mirrorStatus.set({ state: 'on', folder: data.folder })
  return data
}

const CHUNK = 100

async function push(files: VaultFile[], reset = false) {
  const obsidian = obsidianSettings(skillsFolderOf(vaultFiles().map((f) => f.path)), 'Learn Platform')
  for (let i = 0; i < Math.max(1, files.length); i += CHUNK) {
    const part = files.slice(i, i + CHUNK).map(({ path, content }) => ({ path, content }))
    const ok = await call('POST', { files: part, ...(i === 0 ? { obsidian, ...(reset ? { reset: true } : {}) } : {}) })
    if (!ok) return false
  }
  return true
}

/** Brings back what the learner wrote under "My notes" in Obsidian, when it is newer than the app's copy. */
export async function pullNotes(): Promise<number> {
  await startVault()
  const data = await call('GET')
  if (!data?.files) return 0
  let changed = 0
  for (const disk of data.files) {
    const app = readVaultFile(disk.path)
    if (!app) continue
    const mine = splitMyNotes(disk.content)
    const ours = splitMyNotes(app.content)
    if (!mine || !ours || mine.notes === ours.notes || disk.mtime <= Date.parse(app.updatedAt)) continue
    await writeVaultFile(app.path, writeMyNotes(app.content, mine.notes))
    changed++
  }
  return changed
}

let stopListening: (() => void) | null = null
let timer = 0

/** Turns the mirror on: first takes in notes written in Obsidian, then writes the whole vault, then follows changes. */
export async function startMirror(): Promise<boolean> {
  if (!mirrorStore.get().enabled) {
    mirrorStatus.set({ state: 'off' })
    return false
  }
  await startVault()
  await pullNotes()
  if (mirrorStatus.get().state !== 'on') return false
  if (!(await push(vaultFiles()))) return false
  stopListening?.()
  stopListening = onVaultWrite((files, reset) => void push(reset ? vaultFiles() : files, reset))
  window.clearInterval(timer)
  timer = window.setInterval(() => {
    if (document.visibilityState === 'visible') void pullNotes()
  }, 30_000)
  return true
}

export function stopMirror() {
  stopListening?.()
  stopListening = null
  window.clearInterval(timer)
  mirrorStatus.set({ state: 'off' })
}

export async function setMirror(enabled: boolean) {
  mirrorStore.set({ enabled })
  if (enabled) return startMirror()
  stopMirror()
  return false
}
