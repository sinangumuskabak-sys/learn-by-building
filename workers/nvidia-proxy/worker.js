/**
 * Passes Maymun's requests to NVIDIA's API, which does not let browsers call it directly (no CORS headers), so a key
 * pasted in the settings works on any device. The learner's key only goes through: nothing is stored or logged.
 * Only the chat and model list paths are passed, and only for the site's own pages, so it is not an open proxy.
 */

const UPSTREAM = 'https://integrate.api.nvidia.com/v1'
const PATHS = { '/v1/models': 'GET', '/v1/chat/completions': 'POST' }
/** Maymun's largest request (a conversation with a few screenshots) stays well under this. */
const MAX_BODY = 10 * 1024 * 1024
const ORIGINS = [/^https:\/\/(www\.)?learnbybuilding\.dev$/, /^https:\/\/sinangumuskabak-sys\.github\.io$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/]

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

async function readBody(request) {
  const body = await request.arrayBuffer()
  if (body.byteLength > MAX_BODY) throw new Error('Too large')
  return body
}

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin') ?? ''
    if (!ORIGINS.some((allowed) => allowed.test(origin))) return new Response('Forbidden', { status: 403 })
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) })
    const path = new URL(request.url).pathname.replace(/\/+$/, '')
    if (PATHS[path] !== request.method) return new Response('Not found', { status: 404, headers: cors(origin) })
    if (Number(request.headers.get('Content-Length') ?? 0) > MAX_BODY) return new Response('Too large', { status: 413, headers: cors(origin) })
    const headers = { 'Content-Type': request.headers.get('Content-Type') ?? 'application/json' }
    const key = request.headers.get('Authorization')
    if (key) headers.Authorization = key
    const upstream = await fetch(UPSTREAM + path.slice(3), {
      method: request.method,
      headers,
      body: request.method === 'POST' ? await readBody(request) : undefined,
    })
    // The body is streamed through as it comes, so answers still appear word by word.
    const out = new Headers(cors(origin))
    for (const name of ['Content-Type', 'Cache-Control']) {
      const value = upstream.headers.get(name)
      if (value) out.set(name, value)
    }
    return new Response(upstream.body, { status: upstream.status, headers: out })
  },
}
