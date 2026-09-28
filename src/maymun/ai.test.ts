import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatError, readSse, START_TIMEOUT, streamChat, streamChatWithFallback, withImages } from './ai.ts'

/** A response body that arrives in the given pieces. */
function body(...pieces: string[]) {
  const encoder = new TextEncoder()
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const piece of pieces) controller.enqueue(encoder.encode(piece))
      controller.close()
    },
  })
}

const chunk = (text: string) => `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Maymun AI', () => {
  it('reads server-sent events split anywhere, including inside a line', async () => {
    const seen: string[] = []
    await readSse(body('data: one\r\n', 'da', 'ta: t', 'wo\n\n: comment\ndata: [DONE]'), undefined, (d) => seen.push(d))
    expect(seen).toEqual(['one', 'two', '[DONE]'])
  })

  it('streams an OpenAI-compatible answer and sends the panel as the system message', async () => {
    const fetch = vi.fn(async () => new Response(body(chunk('Hel'), chunk('lo'), 'data: [DONE]\n\n')))
    vi.stubGlobal('fetch', fetch)
    let text = ''
    await streamChat({
      provider: 'openrouter',
      key: 'sk-test',
      model: 'openrouter/auto',
      system: 'panel text',
      messages: [{ role: 'user', text: 'hi' }],
      onText: (piece) => (text += piece),
    })
    expect(text).toBe('Hello')
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer sk-test')
    expect(JSON.parse(init.body as string)).toMatchObject({
      model: 'openrouter/auto',
      stream: true,
      messages: [
        { role: 'system', content: 'panel text' },
        { role: 'user', content: 'hi' },
      ],
    })
  })

  it('turns HTTP errors into kinds the chat can explain', async () => {
    const request = { provider: 'deepseek' as const, key: 'k', model: 'm', system: '', messages: [], onText: () => {} }
    for (const [status, kind] of [
      [401, 'key'],
      [429, 'rate'],
      [404, 'model'],
      [500, 'other'],
    ] as const) {
      vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ error: { message: 'nope' } }), { status }))
      const error = await streamChat(request).catch((e: unknown) => e)
      expect(error).toBeInstanceOf(ChatError)
      expect(error).toMatchObject({ kind, message: `${status} nope` })
    }
    vi.stubGlobal('fetch', async () => {
      throw new TypeError('Failed to fetch')
    })
    await expect(streamChat(request)).rejects.toMatchObject({ kind: 'network' })
  })

  it('moves on to the next model when one hangs without starting', async () => {
    vi.useFakeTimers()
    const asked: string[] = []
    vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
      const { model } = JSON.parse(String(init.body)) as { model: string }
      asked.push(model)
      if (model === 'hangs') {
        // Never answers, like a gateway stuck on a model it cannot reach; only the abort ends it.
        return new Promise<Response>((_, reject) => init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))))
      }
      return new Response(body(chunk('Hi'), 'data: [DONE]\n\n'))
    })
    let text = ''
    let answered = ''
    const done = streamChatWithFallback(
      { provider: 'omniroute', key: 'k', model: '', system: '', messages: [], onText: (t) => (text += t) },
      ['hangs', 'works'],
      (m) => (answered = m),
    )
    await vi.advanceTimersByTimeAsync(START_TIMEOUT)
    await done
    expect(asked).toEqual(['hangs', 'works'])
    expect(answered).toBe('works')
    expect(text).toBe('Hi')
    vi.useRealTimers()
  })

  it('does not wait for an error that is never finished, and skips a connection that refused the key', async () => {
    vi.useFakeTimers()
    const asked: string[] = []
    vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
      const { model } = JSON.parse(String(init.body)) as { model: string }
      asked.push(model)
      if (model.startsWith('free/')) {
        // A refusal whose body the gateway keeps open.
        return new Response(new ReadableStream({ start: () => {} }), { status: 403 })
      }
      return new Response(body(chunk('Hi'), 'data: [DONE]\n\n'))
    })
    let answered = ''
    const done = streamChatWithFallback(
      { provider: 'omniroute', key: 'k', model: '', system: '', messages: [], onText: () => {} },
      ['free/a', 'free/b', 'free/c', 'paid/x'],
      (m) => (answered = m),
    )
    await vi.advanceTimersByTimeAsync(10_000)
    await done
    expect(asked).toEqual(['free/a', 'paid/x'])
    expect(answered).toBe('paid/x')
    vi.useRealTimers()
  })

  it('stops quietly when aborted', async () => {
    const abort = new AbortController()
    vi.stubGlobal('fetch', async () => {
      abort.abort()
      throw new DOMException('aborted', 'AbortError')
    })
    await expect(
      streamChat({ provider: 'openai', key: 'k', model: 'm', system: '', messages: [], signal: abort.signal, onText: () => {} }),
    ).resolves.toBeUndefined()
  })

  it('sends a picture with its question, and only the latest few pictures again', async () => {
    const fetch = vi.fn(async (_url: string, _init: RequestInit) => new Response(body('data: [DONE]\n\n')))
    vi.stubGlobal('fetch', fetch)
    const pic = (n: number) => `data:image/png;base64,${n}`
    const messages = [1, 2, 3, 4].map((n) => ({ role: 'user' as const, text: `q${n}`, image: pic(n) }))
    await streamChat({ provider: 'openai', key: 'k', model: 'm', system: 's', messages, onText: () => {} })
    const sent = JSON.parse(String(fetch.mock.calls[0][1].body)) as { messages: { content: unknown }[] }
    expect(sent.messages[1].content).toBe('q1')
    expect(sent.messages[4].content).toEqual([
      { type: 'text', text: 'q4' },
      { type: 'image_url', image_url: { url: pic(4) } },
    ])
    expect(sent.messages.filter((m) => Array.isArray(m.content))).toHaveLength(3)
    // A service that cannot see pictures gets the text only.
    expect(withImages('deepseek', messages).some((m) => m.image)).toBe(false)
  })
})
