#!/usr/bin/env node
/**
 * NVIDIA bridge: lets Maymun talk to NVIDIA's models (build.nvidia.com) with your own key.
 *
 *   node nvidia-bridge.mjs [--port 8788] [--origin https://your-site]
 *
 * NVIDIA's API does not let web pages call it directly. Maymun's NVIDIA NIM choice goes through the site's proxy; this
 * does the same on your own computer instead (choose OpenAI-compatible in Maymun, address http://localhost:8788/v1).
 * Your key goes from this browser to this computer and from here straight to NVIDIA: no other server, no account,
 * nothing stored or logged. Only this computer can connect (127.0.0.1) and only the sites you allow may call it
 * (localhost and the published site always, plus each --origin).
 *
 * Needs Node.js 20 or newer. No dependencies.
 */
import { createServer } from 'node:http'
import { Readable } from 'node:stream'
import { pathToFileURL } from 'node:url'

const UPSTREAM = 'https://integrate.api.nvidia.com/v1'
const PATHS = { '/v1/models': 'GET', '/v1/chat/completions': 'POST' }
const MAX_BODY = 25 * 1024 * 1024
/** The published site, allowed without --origin. */
export const SITE_ORIGINS = ['https://learnbybuilding.dev', 'https://sinangumuskabak-sys.github.io']

export function parseArgs(argv) {
  const options = { port: Number(process.env.NVIDIA_BRIDGE_PORT) || 8788, origins: [...SITE_ORIGINS] }
  for (let i = 0; i < argv.length; i++) {
    const value = argv[i + 1]
    if (argv[i] === '--port') options.port = Number(value)
    else if (argv[i] === '--origin') options.origins.push(value)
    else continue
    i++
  }
  options.origins = options.origins.map((o) => o.replace(/\/+$/, ''))
  return options
}

const isLocal = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin)

function fail(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: { message } }))
}

async function readBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY) throw new Error('Request too large')
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export function createNvidiaBridge(options, upstream = UPSTREAM) {
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
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Private-Network': 'true',
      })
      return res.end()
    }
    const path = new URL(req.url ?? '/', 'http://localhost').pathname.replace(/\/+$/, '')
    if (PATHS[path] !== req.method) return fail(res, 404, 'Not found')
    const controller = new AbortController()
    res.on('close', () => controller.abort())
    try {
      const headers = { 'Content-Type': req.headers['content-type'] ?? 'application/json' }
      if (req.headers.authorization) headers.Authorization = req.headers.authorization
      const response = await fetch(upstream + path.slice(3), {
        method: req.method,
        headers,
        body: req.method === 'POST' ? await readBody(req) : undefined,
        signal: controller.signal,
      })
      const out = {}
      for (const name of ['content-type', 'cache-control']) {
        const value = response.headers.get(name)
        if (value) out[name] = value
      }
      res.writeHead(response.status, out)
      // Streamed through as it comes, so answers still appear word by word.
      if (response.body) Readable.fromWeb(response.body).on('error', () => res.destroy()).pipe(res)
      else res.end()
    } catch (error) {
      if (controller.signal.aborted) return
      if (!res.headersSent) fail(res, 502, `Could not reach NVIDIA: ${error instanceof Error ? error.message : error}`)
      else res.destroy()
    }
  })
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const options = parseArgs(process.argv.slice(2))
  createNvidiaBridge(options).listen(options.port, '127.0.0.1', () => {
    console.log(`NVIDIA bridge running at http://localhost:${options.port}/v1`)
    console.log(`In Maymun, choose OpenAI-compatible, set the address to http://localhost:${options.port}/v1 and paste your NVIDIA key (nvapi-…). Keep this window open while you use it.`)
  })
}
