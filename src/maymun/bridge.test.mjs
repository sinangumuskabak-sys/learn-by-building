// @vitest-environment node
import { mkdtempSync, rmSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createBridge, loadKey, parseArgs, toClaudeTurn } from '../../public/maymun-bridge.mjs'

const fake = fileURLToPath(new URL('./fake-claude.mjs', import.meta.url))
const home = mkdtempSync(join(tmpdir(), 'maymun-test-'))
let bridge, upstream, url, key
const upstreamSeen = []

const listen = (server) => new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)))

beforeAll(async () => {
  upstream = createServer((req, res) => {
    let body = ''
    req.on('data', (d) => (body += d))
    req.on('end', () => {
      upstreamSeen.push({ auth: req.headers.authorization, body: JSON.parse(body) })
      res.writeHead(200, { 'Content-Type': 'text/event-stream' })
      res.end('data: {"choices":[{"delta":{"content":"from upstream"}}]}\n\ndata: [DONE]\n\n')
    })
  })
  const upstreamPort = await listen(upstream)
  const options = parseArgs(['--origin', 'https://learn.example/', '--upstream', `http://127.0.0.1:${upstreamPort}/v1/`, '--claude', fake])
  key = loadKey(home)
  bridge = createBridge(options, key)
  url = `http://127.0.0.1:${await listen(bridge)}/v1`
})

afterAll(() => {
  bridge.close()
  upstream.close()
  rmSync(home, { recursive: true, force: true })
})

const chat = (body, headers = {}) =>
  fetch(`${url}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, ...headers },
    body: JSON.stringify({ stream: true, ...body }),
  })

/** The streamed answer text and any error events. */
async function read(response) {
  const text = await response.text()
  const events = text.split('\n').filter((l) => l.startsWith('data: ') && l !== 'data: [DONE]').map((l) => JSON.parse(l.slice(6)))
  return {
    answer: events.map((e) => e.choices?.[0]?.delta?.content ?? '').join(''),
    errors: events.filter((e) => e.error).map((e) => e.error.message),
    done: text.includes('data: [DONE]'),
  }
}

describe('Maymun bridge', () => {
  it('keeps the same key across starts', () => {
    expect(loadKey(home)).toBe(key)
    expect(key).toMatch(/^maymun-/)
  })

  it('turns a conversation into one Claude Code turn with its pictures', () => {
    const turn = toClaudeTurn([
      { role: 'system', content: 'Be a cat.' },
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Meow' },
      { role: 'user', content: [{ type: 'text', text: 'Look' }, { type: 'image_url', image_url: { url: 'data:image/png;base64,AAAA' } }] },
    ])
    expect(turn.system).toBe('Be a cat.')
    const [image, text] = turn.message.message.content
    expect(image).toEqual({ type: 'image', source: { type: 'base64', media_type: 'image/png', data: 'AAAA' } })
    expect(text.text).toContain('Learner: Hi\n\nYou: Meow')
    expect(text.text.endsWith('Look')).toBe(true)
  })

  it('turns away requests without the key and sites that are not allowed', async () => {
    expect((await chat({ model: 'claude-code/sonnet' }, { Authorization: 'Bearer nope' })).status).toBe(401)
    expect((await chat({ model: 'claude-code/sonnet' }, { Origin: 'https://evil.example' })).status).toBe(403)
    const preflight = await fetch(`${url}/chat/completions`, { method: 'OPTIONS', headers: { Origin: 'https://learn.example' } })
    expect(preflight.status).toBe(204)
    expect(preflight.headers.get('access-control-allow-origin')).toBe('https://learn.example')
    expect(preflight.headers.get('access-control-allow-private-network')).toBe('true')
    const local = await fetch(`${url}/models`, { headers: { Origin: 'http://localhost:5173', Authorization: `Bearer ${key}` } })
    expect(local.headers.get('access-control-allow-origin')).toBe('http://localhost:5173')
    expect((await local.json()).data.map((m) => m.id)).toContain('claude-code/sonnet')
  })

  it('answers claude-code models through the CLI, with tools off and no project settings', async () => {
    const { answer, done } = await read(
      await chat({
        model: 'claude-code/opus',
        messages: [
          { role: 'system', content: 'You are Maymun.' },
          { role: 'user', content: [{ type: 'text', text: 'What is this?' }, { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,BBBB' } }] },
        ],
      }),
    )
    expect(done).toBe(true)
    expect(JSON.parse(answer)).toEqual({
      system: 'You are Maymun.',
      model: 'opus',
      tools: '',
      safe: true,
      content: ['[image/jpeg]', 'What is this?'],
    })
  })

  it('answers with one JSON reply when the client does not ask for a stream', async () => {
    const response = await chat({ stream: false, model: 'claude-code/haiku', messages: [{ role: 'user', content: 'hi' }] })
    expect(response.headers.get('content-type')).toBe('application/json')
    const reply = await response.json()
    expect(reply.object).toBe('chat.completion')
    expect(JSON.parse(reply.choices[0].message.content)).toMatchObject({ model: 'haiku', content: ['hi'] })
    const failed = await chat({ stream: false, model: 'claude-code/sonnet', messages: [{ role: 'user', content: 'please fail' }] })
    expect(failed.status).toBe(502)
  })

  it('passes a CLI failure on as an error event', async () => {
    const { errors } = await read(await chat({ model: 'claude-code/sonnet', messages: [{ role: 'user', content: 'please fail' }] }))
    expect(errors).toEqual(['Not logged in'])
  })

  it('refuses a model name that could be read as a flag', async () => {
    expect((await chat({ model: 'claude-code/--dangerous', messages: [] })).status).toBe(400)
  })

  it('sends other models to the upstream gateway', async () => {
    const { answer } = await read(await chat({ model: 'llama3.2', messages: [{ role: 'user', content: 'hi' }] }))
    expect(answer).toBe('from upstream')
    expect(upstreamSeen[0].body.model).toBe('llama3.2')
    // The bridge key stays with the bridge.
    expect(upstreamSeen[0].auth).toBeUndefined()
  })
})
