import { splitDataUrl } from './capture.ts'

/** The AI services Maymun can talk to with the learner's own key (BYOK). The key never leaves this browser. */
export type ProviderId = 'omniroute' | 'openrouter' | 'anthropic' | 'openai' | 'deepseek' | 'custom'

export interface Provider {
  id: ProviderId
  name: string
  /** Default model id; the learner can type another one. */
  model: string
  /** Where to get a key. */
  keys: string
  /** OpenAI-compatible chat completions base URL (the Anthropic provider uses its SDK instead). */
  base?: string
  /** Whether its default models can look at pictures. */
  images: boolean
  /** Runs on the learner's own computer: the address can be changed. */
  local?: boolean
  /** Works without a key (a local model server). */
  keyOptional?: boolean
  /** A gateway with many models: the learner picks which are active, the best active one answers, the next takes over. */
  gateway?: boolean
}

export const providers: Provider[] = [
  // OmniRoute on the learner's computer: whatever they connected there (Claude, Gemini, Codex…), under one key.
  { id: 'omniroute', name: 'OmniRoute', model: '', keys: 'http://localhost:20128/dashboard', base: 'http://localhost:20128/v1', images: true, local: true, gateway: true },
  { id: 'openrouter', name: 'OpenRouter', model: 'openrouter/auto', keys: 'https://openrouter.ai/keys', base: 'https://openrouter.ai/api/v1', images: true },
  { id: 'anthropic', name: 'Anthropic (Claude)', model: 'claude-opus-5', keys: 'https://console.anthropic.com/settings/keys', images: true },
  { id: 'openai', name: 'OpenAI', model: 'gpt-5-mini', keys: 'https://platform.openai.com/api-keys', base: 'https://api.openai.com/v1', images: true },
  { id: 'deepseek', name: 'DeepSeek', model: 'deepseek-chat', keys: 'https://platform.deepseek.com/api_keys', base: 'https://api.deepseek.com', images: false },
  // Any OpenAI-compatible server the browser may call directly: Ollama, LM Studio…
  { id: 'custom', name: 'OpenAI-compatible (Ollama, LM Studio…)', model: '', keys: '', base: 'http://localhost:11434/v1', images: true, local: true, keyOptional: true },
]

export const provider = (id: ProviderId) => providers.find((p) => p.id === id) ?? providers[0]

export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
  /** A picture that went with the message, as a data URL; kept for this visit only. */
  image?: string
  /** The message had a picture (still known after a reload, when the picture itself is gone). */
  shot?: boolean
}

/** Only the latest pictures go along again with later questions; older ones would cost a lot and rarely help. */
const MAX_IMAGES = 3

/** The messages with the pictures that should be sent to this provider. */
export function withImages(id: ProviderId, messages: ChatMessage[]): ChatMessage[] {
  let left = provider(id).images ? MAX_IMAGES : 0
  return messages
    .slice()
    .reverse()
    .map((m) => (m.image && left-- > 0 ? m : { ...m, image: undefined }))
    .reverse()
}

export interface ChatRequest {
  provider: ProviderId
  /** Empty for a local server that needs none. */
  key: string
  /** Overrides the provider's address (local servers). */
  base?: string
  model: string
  system: string
  messages: ChatMessage[]
  signal?: AbortSignal
  /** Called with each piece of the answer as it arrives. */
  onText: (text: string) => void
  /** Called when the server starts its answer, which can be well before the first word (a model that thinks first). */
  onStart?: () => void
}

/** Why a request failed, in terms the chat can explain. */
export type ChatErrorKind = 'key' | 'rate' | 'network' | 'model' | 'other'

export class ChatError extends Error {
  readonly kind: ChatErrorKind
  constructor(kind: ChatErrorKind, message: string) {
    super(message)
    this.kind = kind
  }
}

const kindOf = (status: number): ChatErrorKind =>
  status === 401 || status === 403 ? 'key' : status === 429 ? 'rate' : status === 404 || status === 400 ? 'model' : 'other'

/** Streams one answer; resolves when it is complete. Aborting the signal stops it quietly. */
/**
 * Asks the models in turn (best first) and keeps the first that starts answering: when one fails before its first
 * word (its connection is gone, out of quota, unknown model), the next takes over. `onModel` says which one answered.
 */
export async function streamChatWithFallback(request: ChatRequest, models: string[], onModel?: (model: string) => void): Promise<void> {
  let last: unknown = new ChatError('model', 'No model is active.')
  const list = models.length ? models : [request.model]
  // A connection that refuses the key (e.g. a free tier only open to its own app) refuses all its models: skip the rest.
  const refused = new Set<string>()
  const connection = (model: string) => (model.includes('/') ? model.split('/')[0] : '')
  for (const [index, model] of list.entries()) {
    if (refused.has(connection(model))) continue
    let started = false
    let answering = false
    let slow = false
    const attempt = new AbortController()
    const stop = () => attempt.abort()
    request.signal?.addEventListener('abort', stop)
    // A gateway can hang on a model it cannot reach instead of saying so; while another model is left to ask, one that
    // has not even started its answer in time is given up on. The last one gets all the time it needs.
    const timer =
      index < list.length - 1
        ? setTimeout(() => {
            if (answering) return
            slow = true
            attempt.abort()
          }, START_TIMEOUT)
        : undefined
    try {
      await streamChat({
        ...request,
        model,
        signal: attempt.signal,
        onStart: () => {
          answering = true
        },
        onText: (piece) => {
          if (!started) onModel?.(model)
          started = answering = true
          request.onText(piece)
        },
      })
      if (slow) throw new ChatError('network', `${model} did not start answering in time.`)
      if (!started) onModel?.(model)
      return
    } catch (error) {
      // Stopped by the learner, or failed halfway through an answer: no second answer on top of it.
      if (started || request.signal?.aborted) throw error
      last = error
      if (error instanceof ChatError && error.kind === 'key' && connection(model)) refused.add(connection(model))
    } finally {
      clearTimeout(timer)
      request.signal?.removeEventListener('abort', stop)
    }
  }
  throw last
}

/** How long a model may take to start its answer before the next one takes over (see streamChatWithFallback). */
export const START_TIMEOUT = 30_000

export async function streamChat(request: ChatRequest): Promise<void> {
  request = { ...request, messages: withImages(request.provider, request.messages) }
  if (request.provider === 'anthropic') return streamAnthropic(request)
  return streamOpenAiCompatible(request)
}

async function streamOpenAiCompatible({ provider: id, key, base, model, system, messages, signal, onText, onStart }: ChatRequest) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (key) headers.Authorization = `Bearer ${key}`
  if (id === 'openrouter') {
    headers['HTTP-Referer'] = location.origin
    headers['X-Title'] = 'Learn Platform'
  }
  let response: Response
  try {
    response = await fetch(`${(base || provider(id).base || '').replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers,
      signal,
      body: JSON.stringify({
        model,
        stream: true,
        messages: [{ role: 'system', content: system }, ...messages.map(openAiMessage)],
      }),
    })
  } catch (error) {
    if (signal?.aborted) return
    throw new ChatError('network', String(error))
  }
  if (!response.ok || !response.body) {
    // A gateway can keep an error response open long after its status: the status is what counts, the text only explains.
    const body = await Promise.race([response.text(), new Promise<string>((resolve) => setTimeout(() => resolve(''), 5_000))]).catch(() => '')
    throw new ChatError(kindOf(response.status), `${response.status} ${errorText(body)}`.trim())
  }
  onStart?.()
  await readSse(response.body, signal, (data) => {
    if (data === '[DONE]') return
    const json = JSON.parse(data) as { choices?: { delta?: { content?: string | null } }[]; error?: { message?: string } }
    if (json.error) throw new ChatError('other', json.error.message ?? 'error')
    const text = json.choices?.[0]?.delta?.content
    if (text) onText(text)
  })
}

const openAiMessage = (m: ChatMessage) => ({
  role: m.role,
  content: m.image ? [{ type: 'text', text: m.text }, { type: 'image_url', image_url: { url: m.image } }] : m.text,
})

const anthropicMessage = (m: ChatMessage) => {
  if (!m.image) return { role: m.role, content: m.text }
  const { type, data } = splitDataUrl(m.image)
  return {
    role: m.role,
    content: [
      { type: 'image' as const, source: { type: 'base64' as const, media_type: type as 'image/png' | 'image/jpeg', data } },
      { type: 'text' as const, text: m.text },
    ],
  }
}

/** The message inside a provider's JSON error body, or the body itself. */
function errorText(body: string): string {
  try {
    const json = JSON.parse(body) as { error?: { message?: string } | string; message?: string }
    return (typeof json.error === 'string' ? json.error : json.error?.message) ?? json.message ?? body
  } catch {
    return body.slice(0, 300)
  }
}

/** Calls `onData` with the payload of every `data:` line of a server-sent event stream. */
export async function readSse(body: ReadableStream<Uint8Array>, signal: AbortSignal | undefined, onData: (data: string) => void) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (line.startsWith('data:')) onData(line.slice(5).trim())
      }
    }
    if (buffer.startsWith('data:')) onData(buffer.slice(5).trim())
  } catch (error) {
    if (signal?.aborted) return
    throw error instanceof ChatError ? error : new ChatError('network', String(error))
  }
}

async function streamAnthropic({ key, model, system, messages, signal, onText }: ChatRequest) {
  // Loaded only when someone picks Claude, so the other providers do not pay for it.
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true })
  // Claude Opus 5 and Fable 5.1 may decline a request; the server then retries it on a model that can answer.
  const fallback = model === 'claude-opus-5' || model === 'claude-fable-5-1'
  try {
    const stream = client.beta.messages.stream(
      {
        model,
        max_tokens: 16000,
        system,
        messages: messages.map(anthropicMessage),
        ...(fallback ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
      },
      { signal },
    )
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') onText(event.delta.text)
    }
    const final = await stream.finalMessage()
    if (final.stop_reason === 'refusal') throw new ChatError('other', 'refusal')
  } catch (error) {
    if (signal?.aborted) return
    if (error instanceof ChatError) throw error
    if (error instanceof Anthropic.APIError && error.status)
      error.message = `${error.status} ${errorText(JSON.stringify(error.error ?? ''))}`
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError)
      throw new ChatError('key', error.message)
    if (error instanceof Anthropic.RateLimitError) throw new ChatError('rate', error.message)
    if (error instanceof Anthropic.NotFoundError || error instanceof Anthropic.BadRequestError)
      throw new ChatError('model', error.message)
    if (error instanceof Anthropic.APIConnectionError) throw new ChatError('network', error.message)
    throw new ChatError('other', error instanceof Error ? error.message : String(error))
  }
}
