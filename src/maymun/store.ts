import { createPersistedStore, useStore } from '../lib/store.ts'

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
