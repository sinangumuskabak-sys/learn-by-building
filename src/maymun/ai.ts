/** The AI services Maymun can talk to with the learner's own key (BYOK). The key never leaves this browser. */
export type ProviderId = 'openrouter' | 'anthropic' | 'openai' | 'deepseek'

export interface Provider {
  id: ProviderId
  name: string
  /** Default model id; the learner can type another one. */
  model: string
  /** Where to get a key. */
  keys: string
  /** OpenAI-compatible chat completions base URL (the Anthropic provider uses its SDK instead). */
  base?: string
}

export const providers: Provider[] = [
  { id: 'openrouter', name: 'OpenRouter', model: 'openrouter/auto', keys: 'https://openrouter.ai/keys', base: 'https://openrouter.ai/api/v1' },
  { id: 'anthropic', name: 'Anthropic (Claude)', model: 'claude-opus-5', keys: 'https://console.anthropic.com/settings/keys' },
  { id: 'openai', name: 'OpenAI', model: 'gpt-5-mini', keys: 'https://platform.openai.com/api-keys', base: 'https://api.openai.com/v1' },
  { id: 'deepseek', name: 'DeepSeek', model: 'deepseek-chat', keys: 'https://platform.deepseek.com/api_keys', base: 'https://api.deepseek.com' },
]

export const provider = (id: ProviderId) => providers.find((p) => p.id === id) ?? providers[0]

export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

export interface ChatRequest {
  provider: ProviderId
  key: string
  model: string
  system: string
  messages: ChatMessage[]
  signal?: AbortSignal
  /** Called with each piece of the answer as it arrives. */
  onText: (text: string) => void
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
export async function streamChat(request: ChatRequest): Promise<void> {
  if (request.provider === 'anthropic') return streamAnthropic(request)
  return streamOpenAiCompatible(request)
}

async function streamOpenAiCompatible({ provider: id, key, model, system, messages, signal, onText }: ChatRequest) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }
  if (id === 'openrouter') {
    headers['HTTP-Referer'] = location.origin
    headers['X-Title'] = 'Learn Platform'
  }
  let response: Response
  try {
    response = await fetch(`${provider(id).base}/chat/completions`, {
      method: 'POST',
      headers,
      signal,
      body: JSON.stringify({
        model,
        stream: true,
        messages: [{ role: 'system', content: system }, ...messages.map((m) => ({ role: m.role, content: m.text }))],
      }),
    })
  } catch (error) {
    if (signal?.aborted) return
    throw new ChatError('network', String(error))
  }
  if (!response.ok || !response.body) {
    const body = await response.text().catch(() => '')
    throw new ChatError(kindOf(response.status), `${response.status} ${errorText(body)}`.trim())
  }
  await readSse(response.body, signal, (data) => {
    if (data === '[DONE]') return
    const json = JSON.parse(data) as { choices?: { delta?: { content?: string | null } }[]; error?: { message?: string } }
    if (json.error) throw new ChatError('other', json.error.message ?? 'error')
    const text = json.choices?.[0]?.delta?.content
    if (text) onText(text)
  })
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
        messages: messages.map((m) => ({ role: m.role, content: m.text })),
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
