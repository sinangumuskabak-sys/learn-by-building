import { langStore } from '../i18n/i18n.ts'
import type { Lang } from '../i18n/messages.ts'

/**
 * Where the app lives and in which language: English pages at the site's root, Turkish ones under `/tr/`, so each has
 * its own address that search engines can index (the build writes a real HTML file for each, see
 * scripts/prerender.ts). The site's own folder comes from the build (`/` on its own domain, `/<repo>/` on GitHub
 * Pages).
 */

/** The site's folder, with a trailing slash. */
export const BASE = import.meta.env.BASE_URL

/** The language an address is in: `/tr/…` is Turkish, everything else English. */
export function langOfPath(pathname: string): Lang {
  const rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, '')
  return rest === 'tr' || rest.startsWith('tr/') ? 'tr' : 'en'
}

/** The router's base for a language: the site's folder, and `tr` in it for Turkish. */
export const basenameFor = (lang: Lang) => (lang === 'tr' ? `${BASE}tr` : BASE.replace(/\/$/, '') || '/')

/** The address of an app path (`/games/snake`) in a language. */
export const urlFor = (lang: Lang, path: string) => `${basenameFor(lang).replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`

/** The app path of an address (`/tr/games/snake` → `/games/snake`). */
export function pathOf(pathname: string): string {
  const base = basenameFor(langOfPath(pathname))
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : pathname
  return rest.startsWith('/') ? rest : `/${rest}`
}

/**
 * Settles the address before the router starts: an old `#/games/snake` link becomes `/games/snake`; the language
 * follows the address (a Turkish address makes the app Turkish), and a learner who chose Turkish lands on the Turkish
 * address. Returns the language the app starts in.
 */
export function settleAddress(): Lang {
  const { pathname, search, hash } = window.location
  let path = pathOf(pathname)
  let query = search
  let fragment = hash
  if (hash.startsWith('#/')) {
    const inner = new URL(hash.slice(1), 'http://x')
    path = inner.pathname
    query = inner.search
    fragment = ''
  }
  const fromAddress = langOfPath(pathname)
  // An English address is the default one: it follows the learner's choice; a Turkish one is always Turkish.
  const lang = fromAddress === 'tr' ? 'tr' : langStore.get()
  if (fromAddress === 'tr') langStore.set('tr')
  const target = `${urlFor(lang, path)}${query}${fragment}`
  if (target !== `${pathname}${search}${hash}`) window.history.replaceState(null, '', target)
  return lang
}

/** Opens the same page in the other language (the router's base changes with it, so the page loads again). */
export function switchLang(next: Lang) {
  langStore.set(next)
  const { pathname, search } = window.location
  window.location.assign(`${urlFor(next, pathOf(pathname))}${search}`)
}

let navigate: ((path: string) => void) | null = null

/** Lets links inside rendered Markdown move within the app (main.tsx hands over the router's navigate). */
export function setNavigator(next: (path: string) => void) {
  navigate = next
}

/**
 * Opens a link inside the app when it points into it (`/games/snake`, an old `#/games/snake`, or a full address of
 * this site), so the page does not load again; returns whether it did.
 */
export function openInApp(href: string): boolean {
  if (!navigate) return false
  if (href.startsWith('#/')) {
    navigate(href.slice(1))
    return true
  }
  let url: URL
  try {
    url = new URL(href, window.location.href)
  } catch {
    return false
  }
  if (url.origin !== window.location.origin || !href.match(/^(\/(?!\/)|https?:)/)) return false
  if (!url.pathname.startsWith(BASE) && `${url.pathname}/` !== BASE) {
    // A path written from the site's root ("/games/snake") when the site lives in a folder.
    navigate(`${url.pathname}${url.search}`)
    return true
  }
  navigate(`${pathOf(url.pathname)}${url.search}`)
  return true
}
