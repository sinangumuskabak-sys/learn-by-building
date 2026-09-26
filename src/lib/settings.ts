import { createPersistedStore, useStore } from './store.ts'

export type Theme = 'light' | 'dark'

export interface Settings {
  fontSize: number
}

export const fontSizes = [12, 13, 14, 15, 16, 18, 20]

export const settingsStore = createPersistedStore<Settings>('lp.settings', { fontSize: 14 }, (raw) => {
  const fontSize = (raw as Settings | null)?.fontSize
  return typeof fontSize === 'number' && fontSizes.includes(fontSize) ? { fontSize } : null
})

export function useSettings(): Settings {
  return useStore(settingsStore)
}

function initialTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

// index.html applies the saved theme before first paint; this store keeps React in sync with it.
export const themeStore = createPersistedStore<Theme>('lp.theme', initialTheme(), (raw) =>
  raw === 'dark' || raw === 'light' ? raw : null,
)
themeStore.subscribe(() => {
  document.documentElement.dataset.theme = themeStore.get()
})

export function useTheme(): Theme {
  return useStore(themeStore)
}
