import { localizeChallenge } from '../content/localize.ts'
import type { Challenge, LocalizedText } from '../content/schema.ts'
import { createPersistedStore, useStore } from '../lib/store.ts'
import { langs, messages, type Lang, type MessageKey } from './messages.ts'
import { switchLang } from '../app/site.ts'

function detectLang(): Lang {
  return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en'
}

export const langStore = createPersistedStore<Lang>('lp.lang', detectLang(), (raw) =>
  langs.includes(raw as Lang) ? (raw as Lang) : null,
)

export function translate(lang: Lang, key: MessageKey, params?: Record<string, string | number>): string {
  let text = messages[lang][key] ?? messages.en[key]
  if (params) for (const [name, value] of Object.entries(params)) text = text.replaceAll(`{${name}}`, String(value))
  return text
}

export function useI18n() {
  const lang = useStore(langStore)
  return {
    lang,
    /** Switches language by opening the same page at its address in that language (see app/site.ts). */
    setLang: (next: Lang) => (next === lang ? undefined : switchLang(next)),
    t: (key: MessageKey, params?: Record<string, string | number>) => translate(lang, key, params),
    /** Picks the current language from content text, falling back to English. */
    l: (text: LocalizedText) => (lang === 'tr' && text.tr) || text.en,
    /** A challenge's title in the current language. */
    ct: (challenge: Pick<Challenge, 'title' | 'title_tr'>) => (lang === 'tr' && challenge.title_tr) || challenge.title,
    /** A challenge with all its texts in the current language. */
    lc: (challenge: Challenge) => localizeChallenge(challenge, lang),
  }
}
