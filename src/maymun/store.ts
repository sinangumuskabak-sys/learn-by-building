import { createPersistedStore, useStore } from '../lib/store.ts'
import { provider, providers, type ProviderId } from './ai.ts'
import { rankModels } from './models.ts'

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
  /** For a gateway (OmniRoute): the models the learner turned on. */
  active: Partial<Record<ProviderId, string[]>>
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
  { provider: 'omniroute', keys: {}, models: {}, bases: {}, active: {} },
  (raw) => {
    const value = raw as Partial<MaymunAi> | null
    if (!value || typeof value !== 'object') return null
    return {
      provider: isProvider(value.provider) ? value.provider : 'omniroute',
      keys: strings(value.keys),
      models: strings(value.models),
      bases: strings(value.bases),
      active: Object.fromEntries(
        Object.entries(value.active && typeof value.active === 'object' ? value.active : {})
          .filter(([id, list]) => isProvider(id) && Array.isArray(list))
          .map(([id, list]) => [id, (list as unknown[]).filter((m): m is string => typeof m === 'string' && !!m)]),
      ) as Partial<Record<ProviderId, string[]>>,
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

/**
 * The models to ask, in order: for a gateway the active ones, best first (the next takes over when one fails);
 * otherwise the one model.
 */
export function modelsFor(ai: MaymunAi, id: ProviderId): string[] {
  if (provider(id).gateway) {
    const active = rankModels(ai.active[id] ?? [])
    return active.length ? active : ai.models[id] ? [ai.models[id]!] : []
  }
  const model = modelFor(ai, id)
  return model ? [model] : []
}

/** Whether Maymun can answer: a key is set (or not needed) and there is a model to ask. */
export const isReady = (ai: MaymunAi) =>
  Boolean((ai.keys[ai.provider] || provider(ai.provider).keyOptional) && modelsFor(ai, ai.provider).length)

// The conversation itself is in memory.ts (one per project, in IndexedDB).

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
