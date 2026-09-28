#!/usr/bin/env node
/**
 * Maymun bridge: lets Maymun, the cat on Learn Platform, answer through AI you already have on this computer.
 *
 *   node maymun-bridge.mjs [--port 8787] [--origin https://your-site] [--upstream http://localhost:20128/v1]
 *                          [--vault "path/to/your Obsidian vault"]
 *
 * - Models named `claude-code/<model>` (for example `claude-code/sonnet`) run through the Claude Code CLI, so they use
 *   the subscription you are logged in with (`claude` must be installed and logged in).
 * - Any other model goes to `--upstream`: an OpenAI-compatible gateway such as OmniRoute (your other subscriptions),
 *   Ollama or LM Studio (local models). Its key, if it needs one, comes from the MAYMUN_UPSTREAM_KEY variable.
 *
 * - With --vault, Learn Platform's memory vault is mirrored into that folder (in its own "Learn Platform" subfolder), so
 *   Obsidian can open it; what you write under "My notes" there goes back to the app.
 *
 * Only this computer can connect (127.0.0.1), only the sites you allow may call it (localhost always, plus each
 * --origin), and every request needs the bridge key printed at start. Using a subscription this way is subject to its
 * provider's terms; that is your call.
 *
 * Needs Node.js 20 or newer. No dependencies.
 */
import { spawn } from 'node:child_process'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { homedir, tmpdir } from 'node:os'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const MAX_BODY = 25 * 1024 * 1024

export function parseArgs(argv) {
  const options = {
    port: Number(process.env.MAYMUN_PORT) || 8787,
    origins: (process.env.MAYMUN_ORIGINS ?? '').split(',').filter(Boolean),
    upstream: process.env.MAYMUN_UPSTREAM ?? '',
    claude: process.env.MAYMUN_CLAUDE ?? 'claude',
    gemini: process.env.MAYMUN_GEMINI ?? 'gemini',
    codex: process.env.MAYMUN_CODEX ?? 'codex',
    effort: process.env.MAYMUN_EFFORT ?? 'EFFORT_DEFAULT',
    home: process.env.MAYMUN_HOME ?? join(homedir(), '.maymun-bridge'),
    vault: process.env.MAYMUN_VAULT ?? '',
  }
  for (let i = 0; i < argv.length; i++) {
    const value = argv[i + 1]
    if (argv[i] === '--port') options.port = Number(value)
    else if (argv[i] === '--origin') options.origins.push(value)
    else if (argv[i] === '--upstream') options.upstream = value
    else if (argv[i] === '--claude') options.claude = value
    else if (argv[i] === '--gemini') options.gemini = value
    else if (argv[i] === '--codex') options.codex = value
    else if (argv[i] === '--effort') options.effort = value
    else if (argv[i] === '--vault') options.vault = value
    else continue
    i++
  }
  options.origins = options.origins.map((o) => o.replace(/\/+$/, ''))
  options.upstream = options.upstream.replace(/\/+$/, '')
  options.vault = options.vault ? resolve(options.vault) : ''
  return options
}

/** The app's notes live in this subfolder of the vault; the bridge never touches anything outside it. */
export const VAULT_FOLDER = 'Learn Platform'

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
  for (const file of Array.isArray(body.files) ? body.files : []) {
    const target = vaultFile(options.vault, file?.path)
    if (!target || typeof file.content !== 'string') continue
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, file.content)
    written++
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ folder: base, written }))
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

const text = (content) =>
  typeof content === 'string'
    ? content
    : Array.isArray(content)
      ? content.filter((part) => part?.type === 'text').map((part) => part.text).join('\n')
      : ''

const images = (content) =>
  Array.isArray(content)
    ? content
        .filter((part) => part?.type === 'image_url')
        .map((part) => /^data:([^;,]+);base64,(.*)$/s.exec(part.image_url?.url ?? ''))
        .filter(Boolean)
        .map(([, type, data]) => ({ type: 'image', source: { type: 'base64', media_type: type, data } }))
    : []

/**
 * An OpenAI-style conversation as one Claude Code turn: the system messages become the system prompt, the earlier
 * turns a transcript, and the pictures go along as image blocks.
 */
export function toClaudeTurn(messages) {
  const system = messages.filter((m) => m.role === 'system').map((m) => text(m.content)).join('\n\n')
  const turns = messages.filter((m) => m.role === 'user' || m.role === 'assistant')
  const last = turns.at(-1)
  const earlier = turns.slice(0, -1)
  const transcript = earlier.length
    ? 'Earlier in this conversation:\n\n' +
      earlier.map((m) => `${m.role === 'user' ? 'Learner' : 'You'}: ${text(m.content)}`).join('\n\n') +
      '\n\nThe learner now says:\n\n'
    : ''
  const content = [...turns.flatMap((m) => (m.role === 'user' ? images(m.content) : [])), { type: 'text', text: transcript + text(last?.content ?? '') }]
  return { system, message: { type: 'user', message: { role: 'user', content } } }
}

const sse = (res, data) => res.write(`data: ${typeof data === 'string' ? data : JSON.stringify(data)}\n\n`)
const chunk = (content) => ({ choices: [{ index: 0, delta: { content } }] })

function fail(res, status, message) {
  if (res.headersSent) {
    sse(res, { error: { message } })
    return res.end()
  }
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: { message } }))
}

/**
 * The subscriptions the bridge can answer through: each is the provider's own command-line tool, logged in with its
 * own login (`claude`: your Claude account, `gemini`: your Google account, `codex login`: your ChatGPT account). The
 * bridge only runs the tool, from an empty folder, with its tools off or read-only; it never sees your login.
 */
export const CLIS = {
  'claude-code': {
    name: 'Claude (Claude Code)',
    option: 'claude',
    login: 'claude',
    models: ['sonnet', 'opus', 'haiku'],
    defaultModel: 'sonnet',
  },
  'gemini-cli': {
    name: 'Gemini (Gemini CLI)',
    option: 'gemini',
    login: 'gemini',
    models: ['default', 'gemini-2.5-pro', 'gemini-2.5-flash'],
    defaultModel: 'default',
  },
  codex: {
    name: 'ChatGPT (Codex CLI)',
    option: 'codex',
    login: 'codex login',
    models: ['default'],
    defaultModel: 'default',
  },
}

/** The order "maymun/auto" tries them in. */
export const AUTO_ORDER = ['claude-code', 'gemini-cli', 'codex']

/** Where a command is on this computer (PATH, with Windows' extensions), or null. A path given as is counts if it exists. */
export function findCommand(command) {
  if (/[\\/]/.test(command)) return existsSync(command) ? command : null
  const extensions = process.platform === 'win32' ? ['.exe', '.cmd', '.bat', ''] : ['']
  for (const dir of (process.env.PATH ?? '').split(process.platform === 'win32' ? ';' : ':')) {
    if (!dir) continue
    for (const extension of extensions) {
      const full = join(dir, command + extension)
      if (existsSync(full)) return full
    }
  }
  return null
}

/** The subscriptions whose tool is installed here. */
export function availableClis(options) {
  return Object.entries(CLIS)
    .filter(([, cli]) => findCommand(options[cli.option]))
    .map(([id]) => id)
}

/** A conversation as one text prompt, for tools that take plain text: the transcript, then the latest message. */
function transcriptText(messages) {
  const turns = messages.filter((m) => m.role === 'user' || m.role === 'assistant')
  const last = turns.at(-1)
  const earlier = turns.slice(0, -1)
  const lost = turns.some((m) => images(m.content).length) ? '\n\n(The learner attached a picture; this service cannot see pictures, so say so if it matters.)' : ''
  return (
    (earlier.length
      ? 'Earlier in this conversation:\n\n' +
        earlier.map((m) => `${m.role === 'user' ? 'Learner' : 'You'}: ${text(m.content)}`).join('\n\n') +
        '\n\nThe learner now says:\n\n'
      : '') +
    text(last?.content ?? '') +
    lost
  )
}

/** How to run one tool for one question: its arguments, its input, and how to read its output. */
function plan(id, model, messages, dir, options) {
  const system = messages.filter((m) => m.role === 'system').map((m) => text(m.content)).join('\n\n') || 'You are a helpful tutor.'
  if (id === 'claude-code') {
    const { message } = toClaudeTurn(messages)
    const promptFile = join(dir, 'system.md')
    writeFileSync(promptFile, system)
    const args = ['-p', '--input-format', 'stream-json', '--output-format', 'stream-json', '--verbose', '--include-partial-messages']
    args.push('--system-prompt-file', promptFile, '--tools', '', '--safe-mode', '--no-session-persistence', '--model', model)
    if (['low', 'medium', 'high', 'xhigh', 'max'].includes(options.effort)) args.push('--effort', options.effort)
    return { args, input: JSON.stringify(message) + '\n', output: 'claude-stream' }
  }
  if (id === 'gemini-cli') {
    // GEMINI_SYSTEM_MD replaces Gemini CLI's own agent prompt with Maymun's; plan mode is read-only; no extensions.
    const promptFile = join(dir, 'system.md')
    writeFileSync(promptFile, system)
    const args = ['-p', 'Reply to the learner\'s latest message above.', '-o', 'text', '--approval-mode', 'plan', '--skip-trust', '-e', 'none']
    if (model !== 'default') args.push('-m', model)
    return { args, input: transcriptText(messages), output: 'text', env: { GEMINI_SYSTEM_MD: promptFile } }
  }
  // Codex has no system prompt flag: the instructions lead the prompt. Read-only sandbox, nothing kept.
  const last = join(dir, 'answer.txt')
  const args = ['exec', '--skip-git-repo-check', '--sandbox', 'read-only', '--ephemeral', '--color', 'never', '-o', last]
  if (model !== 'default') args.push('-m', model)
  args.push('-')
  return { args, input: `# Your instructions\n\n${system}\n\n# The conversation\n\n${transcriptText(messages)}`, output: 'file', file: last }
}

const quote = (arg) => (/[\s"&|<>^]/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg)

/**
 * Runs one tool for one question. `onText` gets the answer as it comes; the promise ends with whether it worked and,
 * when not, why (the tool's own message: not logged in, over quota…).
 */
function runCli(id, model, messages, options, onText, signal) {
  return new Promise((resolve) => {
    const cli = CLIS[id]
    const found = findCommand(options[cli.option])
    if (!found) return resolve({ ok: false, error: `${cli.name} is not installed on this computer.` })
    const dir = join(tmpdir(), `maymun-${randomBytes(6).toString('hex')}`)
    mkdirSync(dir)
    const run = plan(id, model, messages, dir, options)
    // A script path (a stand-in for the tool in tests) runs with this Node; npm's .cmd shims need a shell on Windows.
    const script = /\.[cm]?js$/.test(found)
    const shell = !script && /\.(cmd|bat)$/i.test(found)
    const [command, args] = script ? [process.execPath, [found, ...run.args]] : [shell ? quote(found) : found, shell ? run.args.map(quote) : run.args]
    const child = spawn(command, args, { cwd: dir, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true, shell, env: { ...process.env, ...run.env } })
    let sent = false
    let failure = ''
    let errors = ''
    let buffer = ''
    const emit = (piece) => {
      if (!piece) return
      sent = true
      onText(piece)
    }
    const end = (result) => {
      rmSync(dir, { recursive: true, force: true })
      resolve(result)
    }
    signal?.addEventListener('abort', () => child.kill())
    child.on('error', (error) => end({ ok: false, sent, error: error.code === 'ENOENT' ? `${cli.name} was not found.` : String(error) }))
    child.stderr.on('data', (data) => (errors += data))
    child.stdout.on('data', (data) => {
      if (run.output === 'text') return emit(String(data))
      if (run.output !== 'claude-stream') return
      buffer += data
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        let event
        try {
          event = JSON.parse(line)
        } catch {
          continue
        }
        const delta = event.type === 'stream_event' && event.event?.type === 'content_block_delta' ? event.event.delta : null
        if (delta?.type === 'text_delta') emit(delta.text)
        if (event.type === 'result' && event.is_error) failure = String(event.result || event.subtype || `${cli.name} failed`)
      }
    })
    child.on('close', (code) => {
      if (run.output === 'file') {
        try {
          emit(readFileSync(run.file, 'utf8').trim())
        } catch {
          // No answer written.
        }
      }
      const why = failure || (code !== 0 || !sent ? errors.trim().split('\n').slice(-3).join(' ') || `${cli.name} stopped (exit ${code}).` : '')
      end(why ? { ok: false, sent, error: why } : { ok: true, sent })
    })
    child.stdin.on('error', () => {})
    child.stdin.end(run.input)
  })
}

/**
 * Answers through a subscription. A named model (`gemini-cli/gemini-2.5-pro`) uses that tool; `maymun/auto` tries the
 * installed ones in order and moves on when one fails before saying anything (not logged in, out of quota), the way
 * a gateway falls back.
 */
async function answerWithCli(options, body, res) {
  const [prefix, rawModel] = String(body.model).split('/')
  const tries =
    prefix === 'maymun'
      ? availableClis(options)
          .sort((a, b) => AUTO_ORDER.indexOf(a) - AUTO_ORDER.indexOf(b))
          .map((id) => [id, CLIS[id].defaultModel])
      : [[prefix, rawModel || CLIS[prefix].defaultModel]]
  if (!tries.length) return fail(res, 502, 'No subscription tool is installed: install Claude Code, Gemini CLI or Codex CLI and log in.')
  for (const [, model] of tries) {
    // A letter or digit first, so a model name can never be read as a flag.
    if (!/^[a-zA-Z0-9][\w.[\]-]*$/.test(model)) return fail(res, 400, `Unknown model: ${body.model}`)
  }
  const messages = Array.isArray(body.messages) ? body.messages : []
  // OpenAI clients ask for a stream unless they say "stream": false; then the answer comes back as one JSON reply.
  const streaming = body.stream !== false
  const abort = new AbortController()
  res.on('close', () => {
    if (!res.writableEnded) abort.abort()
  })
  let text = ''
  const problems = []
  for (const [id, model] of tries) {
    const result = await runCli(id, model, messages, options, (piece) => {
      if (streaming) {
        if (!res.headersSent) res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' })
        sse(res, chunk(piece))
      } else text += piece
    }, abort.signal)
    if (result.ok || result.sent || abort.signal.aborted) {
      if (res.writableEnded) return
      if (!result.ok && streaming) sse(res, { error: { message: result.error } })
      if (!streaming) {
        if (!result.ok) return fail(res, 502, result.error)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        const message = { role: 'assistant', content: text }
        return res.end(JSON.stringify({ object: 'chat.completion', model: `${id}/${model}`, choices: [{ index: 0, message, finish_reason: 'stop' }] }))
      }
      sse(res, '[DONE]')
      return res.end()
    }
    problems.push(`${CLIS[id].name}: ${result.error}`)
  }
  return fail(res, 502, problems.join(' | '))
}

async function proxy(options, body, res) {
  if (!options.upstream) return fail(res, 400, `No upstream for model "${body.model}". Start the bridge with --upstream, or use claude-code/<model>.`)
  const headers = { 'Content-Type': 'application/json' }
  if (process.env.MAYMUN_UPSTREAM_KEY) headers.Authorization = `Bearer ${process.env.MAYMUN_UPSTREAM_KEY}`
  let upstream
  try {
    upstream = await fetch(`${options.upstream}/chat/completions`, { method: 'POST', headers, body: JSON.stringify(body) })
  } catch (error) {
    return fail(res, 502, `Could not reach ${options.upstream}: ${error.cause?.code ?? error.message}`)
  }
  res.writeHead(upstream.status, { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' })
  if (!upstream.body) return res.end()
  for await (const part of upstream.body) res.write(part)
  res.end()
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
        'Access-Control-Allow-Headers': 'authorization, content-type, http-referer, x-title',
        // Chrome asks before a public site talks to this computer.
        'Access-Control-Allow-Private-Network': 'true',
        'Access-Control-Max-Age': '600',
      })
      return res.end()
    }
    const given = /^Bearer (.+)$/.exec(req.headers.authorization ?? '')?.[1] ?? ''
    if (!sameKey(given, key)) return fail(res, 401, 'Wrong or missing bridge key.')
    const path = new URL(req.url ?? '/', 'http://bridge').pathname.replace(/\/+$/, '')
    if (req.method === 'GET' && path === '/v1/models') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      const installed = availableClis(options)
      const data = [
        ...(installed.length ? [{ id: 'maymun/auto', object: 'model', owned_by: 'maymun' }] : []),
        ...installed.flatMap((id) => CLIS[id].models.map((m) => ({ id: `${id}/${m}`, object: 'model', owned_by: id }))),
      ]
      return res.end(JSON.stringify({ object: 'list', data }))
    }
    if (req.method === 'GET' && path === '/v1/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      const installed = availableClis(options)
      const clis = Object.entries(CLIS).map(([id, cli]) => ({ id, name: cli.name, installed: installed.includes(id), login: cli.login }))
      return res.end(JSON.stringify({ clis, vault: !!options.vault, upstream: !!options.upstream }))
    }
    if (path === '/v1/vault' && (req.method === 'GET' || req.method === 'POST')) return vaultRequest(options, req, res)
    if (req.method !== 'POST' || path !== '/v1/chat/completions') return fail(res, 404, 'Not found.')
    let body
    try {
      body = JSON.parse(await readBody(req))
    } catch {
      return fail(res, 400, 'The request is not JSON or is too large.')
    }
    const prefix = String(body.model ?? '').split('/')[0]
    if (prefix === 'maymun' || prefix in CLIS) return answerWithCli(options, body, res)
    return proxy(options, body, res)
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const options = parseArgs(process.argv.slice(2))
  const key = loadKey(options.home)
  createBridge(options, key).listen(options.port, '127.0.0.1', () => {
    console.log(`Maymun bridge is running at http://127.0.0.1:${options.port}/v1`)
    console.log(`Bridge key (paste it into Maymun's setup): ${key}`)
    console.log(`Allowed sites: localhost${options.origins.length ? ', ' + options.origins.join(', ') : ''}`)
    const installed = availableClis(options)
    console.log(`Subscriptions found: ${installed.length ? installed.map((id) => CLIS[id].name).join(', ') : 'none (install Claude Code, Gemini CLI or Codex CLI and log in)'}`)
    console.log(`Models: maymun/auto (tries them in turn)${installed.map((id) => `, ${id}/…`).join('')}${options.upstream ? `, and anything else through ${options.upstream}` : ''}`)
    if (options.vault) console.log(`Memory vault mirrored into: ${join(options.vault, VAULT_FOLDER)}`)
  })
}
