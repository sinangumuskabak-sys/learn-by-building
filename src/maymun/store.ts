import { createPersistedStore, useStore } from '../lib/store.ts'
import { provider, providers, type ChatMessage, type ProviderId } from './ai.ts'

export interface MaymunSettings {
  /** Show Maymun the cat. */
  visible: boolean
}

const fallback: MaymunSettings = { visible: true }

export const maymunStore = createPersistedStore<MaymunSettings>('lp.maymun', fallback, (raw) => {
  const value = raw as Partial<MaymunSettings> | null
  return value && typeof value === 'object' ? { visible: value.visible !== false } : null
})

export function useMaymunSettings(): MaymunSettings {
  return useStore(maymunStore)
}

export interface MaymunAi {
  provider: ProviderId
  /** API keys by provider; they stay in this browser. */
  keys: Partial<Record<ProviderId, string>>
  /** Model ids the learner typed, by provider. */
  models: Partial<Record<ProviderId, string>>
  /** Addresses the learner typed for servers on their computer, by provider. */
  bases: Partial<Record<ProviderId, string>>
}

const isProvider = (value: unknown): value is ProviderId => providers.some((p) => p.id === value)
const strings = (value: unknown) =>
  Object.fromEntries(
    Object.entries(value && typeof value === 'object' ? value : {}).filter(
      ([id, text]) => isProvider(id) && typeof text === 'string' && text.trim(),
    ),
  ) as Partial<Record<ProviderId, string>>

export const aiStore = createPersistedStore<MaymunAi>(
  'lp.maymun.ai',
  { provider: 'openrouter', keys: {}, models: {}, bases: {} },
  (raw) => {
    const value = raw as Partial<MaymunAi> | null
    if (!value || typeof value !== 'object') return null
    return {
      provider: isProvider(value.provider) ? value.provider : 'openrouter',
      keys: strings(value.keys),
      models: strings(value.models),
      bases: strings(value.bases),
    }
  },
)

export function useMaymunAi(): MaymunAi {
  return useStore(aiStore)
}

/** The model to use for a provider: the one the learner typed, or the provider's default. */
export const modelFor = (ai: MaymunAi, id: ProviderId) => ai.models[id] || provider(id).model

/** The address to use for a provider: the one the learner typed, or the provider's default. */
export const baseFor = (ai: MaymunAi, id: ProviderId) => ai.bases[id] || provider(id).base || ''

/** Whether Maymun can answer: a key is set (or not needed) and there is a model to ask. */
export const isReady = (ai: MaymunAi) =>
  Boolean((ai.keys[ai.provider] || provider(ai.provider).keyOptional) && modelFor(ai, ai.provider))

const MAX_MESSAGES = 60

/** The conversation, kept on this device (the latest messages only; pictures only for this visit, they are big). */
export const chatStore = createPersistedStore<ChatMessage[]>(
  'lp.maymun.chat',
  [],
  (raw) =>
    Array.isArray(raw)
      ? raw
          .filter((m): m is ChatMessage => (m?.role === 'user' || m?.role === 'assistant') && typeof m.text === 'string')
          .map((m) => (m.shot === true ? { role: m.role, text: m.text, shot: true } : { role: m.role, text: m.text }))
          .slice(-MAX_MESSAGES)
      : null,
  (messages) => messages.map(({ image, ...m }) => (image ? { ...m, shot: true } : m)),
)

export const addMessages = (...messages: ChatMessage[]) => chatStore.set((all) => [...all, ...messages].slice(-MAX_MESSAGES))

export interface BoxSize {
  width: number
  height: number
}

/** The chat box size the learner dragged it to. */
export const boxStore = createPersistedStore<BoxSize>('lp.maymun.box', { width: 384, height: 520 }, (raw) => {
  const value = raw as Partial<BoxSize> | null
  return value && Number.isFinite(value.width) && Number.isFinite(value.height)
    ? { width: Number(value.width), height: Number(value.height) }
    : null
})
