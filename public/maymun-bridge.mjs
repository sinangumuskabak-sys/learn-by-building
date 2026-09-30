#!/usr/bin/env node
/**
 * Maymun bridge: keeps a live copy of Learn by Building's memory vault in an Obsidian vault on this computer.
 *
 *   node maymun-bridge.mjs --vault "path/to/your Obsidian vault" [--port 8787] [--origin https://your-site]
 *
 * Every note the app writes is copied into the vault's own "Learn by Building" subfolder, so Obsidian can open it; what
 * you write under "My notes" there goes back to the app.
 *
 * Only this computer can connect (127.0.0.1), only the sites you allow may call it (localhost and the published site always, plus each
 * --origin), and every request needs the bridge key printed at start.
 *
 * Needs Node.js 20 or newer. No dependencies.
 */
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { homedir } from 'node:os'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const MAX_BODY = 25 * 1024 * 1024
/** The published site, allowed without --origin (every request still needs the bridge key). */
export const SITE_ORIGINS = ['https://learnbybuilding.dev', 'https://sinangumuskabak-sys.github.io']

export function parseArgs(argv) {
  const options = {
    port: Number(process.env.MAYMUN_PORT) || 8787,
    origins: [...SITE_ORIGINS, ...(process.env.MAYMUN_ORIGINS ?? '').split(',').filter(Boolean)],
    home: process.env.MAYMUN_HOME ?? join(homedir(), '.maymun-bridge'),
    vault: process.env.MAYMUN_VAULT ?? '',
  }
  for (let i = 0; i < argv.length; i++) {
    const value = argv[i + 1]
    if (argv[i] === '--port') options.port = Number(value)
    else if (argv[i] === '--origin') options.origins.push(value)
    else if (argv[i] === '--vault') options.vault = value
    else continue
    i++
  }
  options.origins = options.origins.map((o) => o.replace(/\/+$/, ''))
  options.vault = options.vault ? resolve(options.vault) : ''
  return options
}

/** The app's notes live in this subfolder of the vault; the bridge never touches anything outside it. */
export const VAULT_FOLDER = 'Learn by Building'

/** The absolute file for a note path from the app, or null when the path could leave the vault folder. */
export function vaultFile(root, path) {
  if (typeof path !== 'string' || !path.endsWith('.md') || path.includes('\\') || path.startsWith('/')) return null
  if (path.split('/').some((part) => part === '' || part === '.' || part === '..')) return null
  const base = join(root, VAULT_FOLDER)
  const file = resolve(base, ...path.split('/'))
  return file.startsWith(base + sep) ? file : null
}

function listNotes(dir, base = dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return entry.name.startsWith('.') ? [] : listNotes(full, base)
    if (!entry.name.endsWith('.md')) return []
    return [{ path: relative(base, full).split(sep).join('/'), content: readFileSync(full, 'utf8'), mtime: statSync(full).mtimeMs }]
  })
}

/** Where the learner's own section ("My notes") starts in a note and what it holds; null when the note has none. */
export function myNotesOf(content) {
  for (const heading of ['Notlarım', 'My notes']) {
    const at = content.lastIndexOf(`\n## ${heading}\n`)
    if (at >= 0) return { start: at + heading.length + 5, notes: content.slice(at + heading.length + 5).trim() }
  }
  return null
}

/** GET: the notes in the vault folder (for "My notes" written in Obsidian). POST: write notes, or start over. */
async function vaultRequest(options, req, res) {
  if (!options.vault) return fail(res, 404, 'Start the bridge with --vault "<your Obsidian vault folder>" to mirror the memory vault.')
  const base = join(options.vault, VAULT_FOLDER)
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ folder: base, files: listNotes(base) }))
  }
  let body
  try {
    body = JSON.parse(await readBody(req))
  } catch {
    return fail(res, 400, 'The request is not JSON or is too large.')
  }
  if (body.reset) rmSync(base, { recursive: true, force: true })
  // A new vault gets Obsidian settings that suit it; an existing vault keeps its own.
  const settings = join(options.vault, '.obsidian')
  if (!existsSync(settings) && body.obsidian && typeof body.obsidian === 'object') {
    mkdirSync(settings, { recursive: true })
    for (const [name, content] of Object.entries(body.obsidian)) {
      if (/^[a-z-]+\.json$/.test(name) && typeof content === 'string') writeFileSync(join(settings, name), content)
    }
  }
  let written = 0
  const kept = []
  for (const file of Array.isArray(body.files) ? body.files : []) {
    const target = vaultFile(options.vault, file?.path)
    if (!target || typeof file.content !== 'string') continue
    let content = file.content
    // "notesBase" is what the app last saw under My notes in this file. If the file on disk says something else, the
    // learner wrote it in Obsidian since then: keep it rather than write over it (the app takes it in on its next read).
    if (typeof file.notesBase === 'string' && existsSync(target)) {
      const disk = myNotesOf(readFileSync(target, 'utf8'))
      const ours = myNotesOf(content)
      if (disk && ours && disk.notes !== file.notesBase.trim() && disk.notes !== ours.notes) {
        content = `${content.slice(0, ours.start)}${disk.notes ? `${disk.notes}\n` : ''}`
        kept.push(file.path)
      }
    }
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, content)
    written++
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ folder: base, written, kept }))
}

/** The bridge key, made once and kept in the bridge's folder. */
export function loadKey(home) {
  const file = join(home, 'key')
  try {
    const key = readFileSync(file, 'utf8').trim()
    if (key) return key
  } catch {
    // First start.
  }
  mkdirSync(home, { recursive: true })
  const key = `maymun-${randomBytes(18).toString('base64url')}`
  writeFileSync(file, key + '\n', { mode: 0o600 })
  return key
}

const isLocal = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin)

function sameKey(given, key) {
  const a = Buffer.from(given)
  const b = Buffer.from(key)
  return a.length === b.length && timingSafeEqual(a, b)
}

function fail(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: { message } }))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const parts = []
    req.on('data', (part) => {
      size += part.length
      if (size > MAX_BODY) {
        reject(new Error('too large'))
        req.destroy()
      } else parts.push(part)
    })
    req.on('end', () => resolve(Buffer.concat(parts).toString('utf8')))
    req.on('error', reject)
  })
}

export function createBridge(options, key) {
  return createServer(async (req, res) => {
    const origin = req.headers.origin
    if (origin) {
      if (!isLocal(origin) && !options.origins.includes(origin)) return fail(res, 403, `Origin not allowed: ${origin}`)
      res.setHeader('Access-Control-Allow-Origin', origin)
      res.setHeader('Vary', 'Origin')
    }
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, content-type',
        // Chrome asks before a public site talks to this computer.
        'Access-Control-Allow-Private-Network': 'true',
        'Access-Control-Max-Age': '600',
      })
      return res.end()
    }
    const given = /^Bearer (.+)$/.exec(req.headers.authorization ?? '')?.[1] ?? ''
    if (!sameKey(given, key)) return fail(res, 401, 'Wrong or missing bridge key.')
    const path = new URL(req.url ?? '/', 'http://bridge').pathname.replace(/\/+$/, '')
    if (path === '/v1/vault' && (req.method === 'GET' || req.method === 'POST')) return vaultRequest(options, req, res)
    return fail(res, 404, 'Not found.')
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const options = parseArgs(process.argv.slice(2))
  const key = loadKey(options.home)
  createBridge(options, key).listen(options.port, '127.0.0.1', () => {
    console.log(`Maymun bridge is running at http://127.0.0.1:${options.port}/v1`)
    console.log(`Bridge key (paste it on the Memory page): ${key}`)
    console.log(`Allowed sites: localhost${options.origins.length ? ', ' + options.origins.join(', ') : ''}`)
    console.log(options.vault ? `Memory vault mirrored into: ${join(options.vault, VAULT_FOLDER)}` : 'No --vault given: start it with --vault "<your Obsidian vault folder>".')
  })
}
