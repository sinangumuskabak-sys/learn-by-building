#!/usr/bin/env node
/**
 * Maymun bridge: lets Maymun, the cat on Learn Platform, answer through AI you already have on this computer.
 *
 *   node maymun-bridge.mjs [--port 8787] [--origin https://your-site] [--upstream http://localhost:20128/v1]
 *
 * - Models named `claude-code/<model>` (for example `claude-code/sonnet`) run through the Claude Code CLI, so they use
 *   the subscription you are logged in with (`claude` must be installed and logged in).
 * - Any other model goes to `--upstream`: an OpenAI-compatible gateway such as OmniRoute (your other subscriptions),
 *   Ollama or LM Studio (local models). Its key, if it needs one, comes from the MAYMUN_UPSTREAM_KEY variable.
 *
 * Only this computer can connect (127.0.0.1), only the sites you allow may call it (localhost always, plus each
 * --origin), and every request needs the bridge key printed at start. Using a subscription this way is subject to its
 * provider's terms; that is your call.
 *
 * Needs Node.js 20 or newer. No dependencies.
 */
import { spawn } from 'node:child_process'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const MAX_BODY = 25 * 1024 * 1024

export function parseArgs(argv) {
  const options = {
    port: Number(process.env.MAYMUN_PORT) || 8787,
    origins: (process.env.MAYMUN_ORIGINS ?? '').split(',').filter(Boolean),
    upstream: process.env.MAYMUN_UPSTREAM ?? '',
    claude: process.env.MAYMUN_CLAUDE ?? 'claude',
    effort: process.env.MAYMUN_EFFORT ?? 'EFFORT_DEFAULT',
    home: process.env.MAYMUN_HOME ?? join(homedir(), '.maymun-bridge'),
  }
  for (let i = 0; i < argv.length; i++) {
    const value = argv[i + 1]
    if (argv[i] === '--port') options.port = Number(value)
    else if (argv[i] === '--origin') options.origins.push(value)
    else if (argv[i] === '--upstream') options.upstream = value
    else if (argv[i] === '--claude') options.claude = value
    else if (argv[i] === '--effort') options.effort = value
    else continue
    i++
  }
  options.origins = options.origins.map((o) => o.replace(/\/+$/, ''))
  options.upstream = options.upstream.replace(/\/+$/, '')
  return options
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

function runClaude(options, body, req, res) {
  const model = String(body.model).split('/')[1] || 'sonnet'
  // A letter or digit first, so a model name can never be read as a flag.
  if (!/^[a-zA-Z0-9][\w.[\]-]*$/.test(model)) return fail(res, 400, `Unknown model: ${body.model}`)
  const { system, message } = toClaudeTurn(Array.isArray(body.messages) ? body.messages : [])
  const dir = join(tmpdir(), `maymun-${randomBytes(6).toString('hex')}`)
  mkdirSync(dir)
  const promptFile = join(dir, 'system.md')
  writeFileSync(promptFile, system || 'You are a helpful tutor.')
  const args = ['-p', '--input-format', 'stream-json', '--output-format', 'stream-json', '--verbose', '--include-partial-messages']
  args.push('--system-prompt-file', promptFile, '--tools', '', '--safe-mode', '--no-session-persistence', '--model', model)
  if (['low', 'medium', 'high', 'xhigh', 'max'].includes(options.effort)) args.push('--effort', options.effort)
  // Run from an empty folder, so no project files or instructions are picked up.
  // A script path (a stand-in for the CLI) runs with this Node.
  const [command, commandArgs] = /\.[cm]?js$/.test(options.claude) ? [process.execPath, [options.claude, ...args]] : [options.claude, args]
  const child = spawn(command, commandArgs, { cwd: dir, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true })
  // OpenAI clients ask for a stream unless they say "stream": false; then the answer comes back as one JSON reply.
  const streaming = body.stream !== false
  let text = ''
  let failure = ''
  let done = false
  let errors = ''
  let buffer = ''
  const finish = () => {
    if (done) return
    done = true
    rmSync(dir, { recursive: true, force: true })
  }
  res.on('close', () => {
    if (!res.writableEnded) child.kill()
  })
  child.on('error', (error) => {
    finish()
    fail(res, 502, error.code === 'ENOENT' ? `Claude Code was not found (${options.claude}). Install it and log in.` : String(error))
  })
  child.stderr.on('data', (data) => (errors += data))
  child.stdout.on('data', (data) => {
    if (streaming && !res.headersSent) res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' })
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
      if (delta?.type === 'text_delta' && delta.text) {
        if (streaming) sse(res, chunk(delta.text))
        else text += delta.text
      }
      if (event.type === 'result' && event.is_error) {
        failure = String(event.result || event.subtype || 'Claude Code failed')
        if (streaming) sse(res, { error: { message: failure } })
      }
    }
  })
  child.on('close', (code) => {
    finish()
    if (res.writableEnded) return
    if (!streaming) {
      if (failure || (code !== 0 && !text)) return fail(res, 502, failure || errors.trim() || `Claude Code stopped (exit ${code}).`)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      const message = { role: 'assistant', content: text }
      return res.end(JSON.stringify({ object: 'chat.completion', model: body.model, choices: [{ index: 0, message, finish_reason: 'stop' }] }))
    }
    if (!res.headersSent) return fail(res, 502, errors.trim() || `Claude Code stopped (exit ${code}).`)
    sse(res, '[DONE]')
    res.end()
  })
  child.stdin.on('error', () => {})
  child.stdin.end(JSON.stringify(message) + '\n')
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
      const data = ['sonnet', 'opus', 'haiku'].map((m) => ({ id: `claude-code/${m}`, object: 'model', owned_by: 'claude-code' }))
      return res.end(JSON.stringify({ object: 'list', data }))
    }
    if (req.method !== 'POST' || path !== '/v1/chat/completions') return fail(res, 404, 'Not found.')
    let body
    try {
      body = JSON.parse(await readBody(req))
    } catch {
      return fail(res, 400, 'The request is not JSON or is too large.')
    }
    if (String(body.model ?? '').startsWith('claude-code')) return runClaude(options, body, req, res)
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
    console.log(`Models: claude-code/sonnet, claude-code/opus, claude-code/haiku${options.upstream ? `, and anything else through ${options.upstream}` : ''}`)
  })
}
