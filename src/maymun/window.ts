import { forModel, messageTokens, type ChatPage, type StoredMessage, type Timeline } from './memory.ts'

/**
 * What of the never-ending conversation goes to the model with a question (MemGPT's "virtual context"):
 *
 * - the window: the latest messages word for word, as many as fit in a token budget (long inputs make every model
 *   worse, so it stays small);
 * - the running summary of the pages that left the window, and a one-line index of those pages;
 * - a page found by searching for the question's words (so a model that never asks still remembers);
 * - pages Maymun asks for itself by answering only `<recall pages="1,7"/>` or `<recall q="…"/>`: the app adds them
 *   and asks once more, like the app map (works with any model, no tool calling needed).
 */

/** Tokens of the latest messages sent word for word. */
export const WINDOW_TOKENS = 6_000
/** The last two questions and answers always go, however long. */
const MIN_KEPT = 4
/** The index of earlier pages stays under this many characters; older pages fold into one line per day. */
const INDEX_CHARS = 3_500
/** A page sent along (found or asked for) is clipped to this many characters. */
const PAGE_CHARS = 4_000
/** At most this many pages are sent when Maymun asks. */
const MAX_RECALLED = 3

/** Where the window starts: the index of its first message in `timeline.messages`. */
export function windowStart(timeline: Timeline, extra: StoredMessage[] = []): number {
  const all = [...timeline.messages, ...extra]
  let from = all.length
  let used = 0
  while (from > timeline.windowFrom) {
    const cost = messageTokens(all[from - 1])
    if (all.length - from >= MIN_KEPT && used + cost > WINDOW_TOKENS) break
    used += cost
    from--
  }
  // Start at a question, not in the middle of an answer.
  while (from < all.length && all[from].role !== 'user') from++
  return from
}

/** The pages that are (at least partly) before the window. */
export const pagesBefore = (timeline: Timeline, from: number) => {
  const out: ChatPage[] = []
  let at = 0
  for (const page of timeline.pages) {
    if (at < from) out.push(page)
    at += page.messages.length
  }
  return out
}

const day = (at?: number) => {
  if (!at) return ''
  const d = new Date(at)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** One line on a page: its own title, or the start of its first question when it has not been summed up yet. */
export function pageTitle(page: ChatPage): string {
  if (page.title) return page.title
  const first = page.messages.find((m) => m.role === 'user')?.text.replace(/\s+/g, ' ').trim() ?? ''
  return first.length > 80 ? `"${first.slice(0, 77)}…"` : `"${first}"`
}

const where = (page: ChatPage) => {
  const tag = page.messages.find((m) => m.role === 'user' && m.tag)?.tag
  return tag ? [tag.page, tag.step].filter(Boolean).join('/') : ''
}

/** The index of earlier pages, newest last; when long, the oldest fold into one line per day. */
export function pageIndex(pages: ChatPage[]): string {
  const line = (p: ChatPage) => `- p.${p.n} · ${[day(p.messages[0]?.at), where(p), pageTitle(p)].filter(Boolean).join(' · ')}`
  let folded: string[] = []
  let rest = pages
  // Fold whole days from the oldest until it fits; the newest page always keeps its own line.
  while (rest.length > 1 && [...folded, ...rest.map(line)].join('\n').length > INDEX_CHARS) {
    const first = day(rest[0].messages[0]?.at)
    let k = 1
    while (k < rest.length - 1 && day(rest[k].messages[0]?.at) === first) k++
    const group = rest.slice(0, k)
    const places = [...new Set(group.map((p) => where(p).split('/')[0]).filter(Boolean))].slice(0, 4).join(', ')
    const range = group.length > 1 ? `p.${group[0].n}–${group.at(-1)!.n}` : `p.${group[0].n}`
    folded = [...folded, `- ${range} · ${[first, places].filter(Boolean).join(' · ')}`]
    rest = rest.slice(k)
  }
  return [...folded, ...rest.map(line)].join('\n')
}

const MARKS: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' }
const STOP = new Set(
  'the and for you are was what how why this that with not but can does did have has from then there here about into when which neden nasil nedir bir bu su ve ile icin ama gibi daha cok ben sen biz siz onu bunu sunu olan oldu olur var yok mi mu musun misin degil kadar sonra once simdi hangi'.split(' '),
)

/** The words of a text for searching: lower case, Turkish letters plain, a short stem so suffixes match. */
export function stems(text: string): string[] {
  const words = text
    .toLocaleLowerCase('tr')
    .replace(/[çğıöşüâîû]/g, (c) => MARKS[c])
    .split(/[^a-z0-9_]+/)
    .filter((w) => w.length >= 3 && !STOP.has(w))
  return [...new Set(words.map((w) => w.slice(0, 5)))]
}

const pageText = (page: ChatPage) => page.messages.map((m) => m.text).join('\n')

/** Pages best matching the words, best first; words found on few pages count more, the current project a bit more. */
export function searchPages(pages: ChatPage[], query: string, project?: string): { page: ChatPage; score: number; hits: number }[] {
  const wanted = stems(query)
  if (!wanted.length) return []
  const bags = pages.map((p) => new Set(stems(pageText(p))))
  return pages
    .map((page, i) => {
      let score = 0
      let hits = 0
      for (const stem of wanted) {
        if (!bags[i].has(stem)) continue
        hits++
        const df = bags.filter((b) => b.has(stem)).length
        score += Math.log(1 + pages.length / df)
      }
      const mine = project && page.messages.some((m) => m.tag?.project === project)
      return { page, score: mine ? score * 1.3 : score, hits }
    })
    .filter((r) => r.hits > 0)
    .sort((a, b) => b.score - a.score || b.page.n - a.page.n)
}

/** A page found for the question, when the match is strong enough to be worth the tokens. */
export function relatedPage(pages: ChatPage[], question: string, project?: string): ChatPage | null {
  const wanted = stems(question).length
  const best = searchPages(pages, question, project)[0]
  if (!best) return null
  return best.hits >= Math.min(2, wanted) && best.hits / wanted >= 0.4 && best.score >= 1.5 ? best.page : null
}

/** A page as the model reads it: where each question was asked, clipped. */
export function pageForModel(page: ChatPage): string {
  const text = forModel(page.messages)
    .map((m) => `${m.role === 'user' ? 'Learner' : 'Maymun'}: ${m.text}`)
    .join('\n\n')
  const at = day(page.messages[0]?.at)
  return `<page n="${page.n}"${at ? ` date="${at}"` : ''}>\n${text.length > PAGE_CHARS ? `${text.slice(0, PAGE_CHARS)}\n…` : text}\n</page>`
}

/** The conversation part of the system prompt: summary, index, a related page. Empty when nothing is left out. */
export function conversationPrompt(timeline: Timeline, from: number, related: ChatPage | null): string {
  const earlier = pagesBefore(timeline, from)
  if (!earlier.length && !timeline.summary) return ''
  return [
    '# The conversation so far',
    '',
    'Your conversation with this learner never resets; the messages below are only its latest part. Earlier parts',
    'are kept in numbered pages.',
    ...(timeline.summary ? ['', '## Summary of the earlier pages', '', timeline.summary.trim()] : []),
    ...(earlier.length ? ['', '## Earlier pages', '', pageIndex(earlier)] : []),
    ...(related
      ? ['', `## Maybe related to this question (found by its words): page ${related.n}`, '', pageForModel(related)]
      : []),
    '',
    'To read earlier pages word for word, answer with only <recall pages="3,7"/> (or <recall q="words to look for"/>)',
    'and nothing else; you get them and answer then. Do it when the learner refers to something earlier that the',
    'summary and the messages below do not cover ("what did we talk about first?", "how did we fix that bug?").',
    'Never guess what was said.',
  ].join('\n')
}

const RECALL = /^\s*<recall\s+(pages|q)\s*=\s*"([^"]*)"\s*\/?>/

/** Whether an answer so far is (or may still become) a request for pages, so it is not shown yet. */
export function mayAskForPages(text: string): boolean {
  const start = text.trimStart()
  return start.length < 7 ? '<recall'.startsWith(start) : start.startsWith('<recall')
}

/** The pages a finished answer asks for; null when it is not a request. */
export function asksForPages(text: string): { pages?: number[]; q?: string } | null {
  const match = RECALL.exec(text)
  if (!match) return null
  if (match[1] === 'q') return match[2].trim() ? { q: match[2].trim() } : null
  const pages = match[2]
    .split(/[,\s]+/)
    .flatMap((part) => {
      const range = /^(\d+)\s*[-–]\s*(\d+)$/.exec(part)
      if (range) return Array.from({ length: Math.min(10, Math.max(0, +range[2] - +range[1] + 1)) }, (_, i) => +range[1] + i)
      return /^\d+$/.test(part) ? [+part] : []
    })
  return pages.length ? { pages: [...new Set(pages)] } : null
}

/** The pages to send for a request (at most three), and the part of the system prompt that carries them. */
export function recalled(timeline: Timeline, request: { pages?: number[]; q?: string }, project?: string): { pages: ChatPage[]; text: string } {
  const pages = request.pages
    ? request.pages.map((n) => timeline.pages.find((p) => p.n === n)).filter((p): p is ChatPage => !!p)
    : searchPages(timeline.pages, request.q ?? '', project).map((r) => r.page)
  const picked = pages.slice(0, MAX_RECALLED).sort((a, b) => a.n - b.n)
  const text = [
    '# The pages you asked for',
    '',
    ...(picked.length ? picked.map(pageForModel) : ['(No page matched. Say so honestly; do not guess.)']),
    '',
    'Answer the question with them now; do not ask for pages again.',
  ].join('\n')
  return { pages: picked, text }
}

